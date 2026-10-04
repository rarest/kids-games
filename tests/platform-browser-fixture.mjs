import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {randomUUID, randomBytes} from 'node:crypto';
import {Pool} from '../platform/node_modules/pg/esm/index.mjs';
import {ActivityStore} from '../platform/store.mjs';
import {createApi} from '../platform/server.mjs';

export async function startFixture() {
  if (!process.env.PLATFORM_TEST_DATABASE_URL) throw new Error('A test database URL is required for local browser verification');
  const schema = `browser_${randomUUID().replaceAll('-', '')}`;
  const admin = new Pool({connectionString:process.env.PLATFORM_TEST_DATABASE_URL});
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new Pool({connectionString:process.env.PLATFORM_TEST_DATABASE_URL, options:`-c search_path=${schema}`});
  const store = new ActivityStore({pool}); await store.migrate();
  const root = resolve(new URL('..',import.meta.url).pathname);
  const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ogg':'audio/ogg','.mp3':'audio/mpeg','.wav':'audio/wav','.json':'application/json','.glb':'model/gltf-binary'};
  let api;
  const server = http.createServer(async (req,res) => {
    const path = new URL(req.url,'http://fixture.test').pathname;
    if(path.startsWith('/api/')) return api.emit('request',req,res);
    const filename = resolve(root, '.' + (path === '/' ? '/index.html' : decodeURIComponent(path)));
    if(!filename.startsWith(root + '/') || /\/(platform|deploy)\//.test(path)){res.writeHead(404);return res.end();}
    try {const body=await readFile(filename);res.writeHead(200,{'Content-Type':types[extname(filename)]??'application/octet-stream'});res.end(body);}
    catch {res.writeHead(404);res.end();}
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  api = createApi({store,secret:randomBytes(32).toString('hex'),publicOrigin:origin});
  return {origin, async close(){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}};
}
