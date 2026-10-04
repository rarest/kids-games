#!/usr/bin/env python3
"""Provision the isolated local database. Never print generated credentials."""
from pathlib import Path
import os
import secrets
import subprocess
import time
from urllib.parse import urlsplit

config = Path.home() / '.config/games-platform'
data = Path.home() / '.local/share/games-platform'
for folder in (config, data, data / 'backups'):
    folder.mkdir(parents=True, exist_ok=True)
    folder.chmod(0o700)
db_env = config / 'database.env'
app_env = config / 'app.env'
if not db_env.exists():
    db_env.write_text('POSTGRES_PASSWORD=' + secrets.token_hex(32) + '\nPOSTGRES_DB=games_platform\n')
db_env.chmod(0o600)
if not app_env.exists():
    password = secrets.token_hex(32)
    app_env.write_text('DATABASE_URL=postgresql://games_app:' + password + '@127.0.0.1:5433/games_platform\nVISITOR_SECRET=' + secrets.token_hex(32) + '\nPUBLIC_ORIGIN=https://games.nblord.com\n')
app_env.chmod(0o600)
environment = dict(line.split('=', 1) for line in app_env.read_text().splitlines() if '=' in line)
password = urlsplit(environment['DATABASE_URL']).password
if not password or any(c not in '0123456789abcdef' for c in password):
    raise SystemExit('Unexpected app credential format; refusing to rotate credentials')

container = 'games-platform-db'
image = 'postgres:17-alpine@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24'
exists = subprocess.run(['sudo', '-n', 'docker', 'container', 'inspect', container], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
if not exists:
    subprocess.run(['sudo', '-n', 'docker', 'run', '-d', '--name', container, '--restart', 'unless-stopped', '--memory', '512m', '--shm-size', '128m', '--env-file', str(db_env), '-p', '127.0.0.1:5433:5432', '-v', str(data / 'postgres') + ':/var/lib/postgresql/data', image], check=True)
else:
    subprocess.run(['sudo', '-n', 'docker', 'start', container], check=True, stdout=subprocess.DEVNULL)
for attempt in range(50):
    ready = subprocess.run(['sudo', '-n', 'docker', 'exec', container, 'pg_isready', '-U', 'postgres', '-d', 'games_platform'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
    if ready:
        break
    time.sleep(1)
else:
    raise SystemExit('Database did not become ready')

sql = "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='games_app') THEN CREATE ROLE games_app LOGIN; END IF; END $$;\n"
sql += "ALTER ROLE games_app WITH PASSWORD '" + password + "' NOSUPERUSER NOCREATEDB NOCREATEROLE;\n"
sql += 'ALTER DATABASE games_platform OWNER TO games_app;\nGRANT ALL ON SCHEMA public TO games_app;\n'
result = subprocess.run(['sudo', '-n', 'docker', 'exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'games_platform', '-v', 'ON_ERROR_STOP=1'], input=sql, text=True, capture_output=True)
if result.returncode:
    raise SystemExit('Database role initialization failed; credentials were not printed')
print('[platform] isolated PostgreSQL ready; credentials outside repository and docroot')
