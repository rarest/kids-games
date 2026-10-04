import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
test('racing deploy binds its own loopback port and excludes the private server from docroot',async()=>{
 const script=await read('deploy/deploy-local.sh');
 assert.ok(script.includes("--exclude 'racing/server.mjs'"),'private racing server must not be published');
 const unit=await read('deploy/racing-coop.service'),proxy=await read('deploy/racing-coop.conf');
 assert.match(unit,/ExecStart=\/usr\/bin\/node %h\/games-site\/racing\/server\.mjs/);
 assert.match(unit,/Environment=PORT=8789/);
 assert.match(unit,/Environment=HOST=127\.0\.0\.1/);
 assert.match(unit,/Restart=on-failure/);
 assert.match(proxy,/location = \/racing-ws\s*\{/);
 assert.match(proxy,/proxy_pass http:\/\/127\.0\.0\.1:8789;/);
 assert.match(proxy,/proxy_set_header Upgrade \$http_upgrade;/);
 assert.match(proxy,/proxy_buffering off;/);
});
