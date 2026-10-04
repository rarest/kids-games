import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
const root=new URL('../',import.meta.url);

export async function instrumentedSite(){
 const output=await build({entryPoints:[new URL('rescue/game.js',root).pathname],bundle:true,format:'esm',write:false,plugins:[{name:'read-only-render-observer',setup(b){
  b.onLoad({filter:/\/rescue\/scene\.js$/},async({path})=>{
   const text=await readFile(path,'utf8'),needle='renderer.render(scene, camera);';assert.equal(text.split(needle).length,2);
   // Observe the actual completed draw. The production simulation and renderer are unchanged.
   const source=text.replace(needle,`${needle}\nglobalThis.__rescueDraw?.(state, world.group, renderer.getDrawingBufferSize(new THREE.Vector2()), {...frame});`);
   return{contents:source,loader:'js'};
  });
  if(process.env.RESCUE_PREDICTION_REFERENCE==='main')b.onLoad({filter:/\/rescue\/net-prediction\.js$/},({path})=>({contents:execFileSync('git',['show','origin/main:rescue/net-prediction.js'],{cwd:root,encoding:'utf8'}),loader:'js'}));
 }}]});
 const server=createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://local').pathname;
  if(pathname==='/rescue/bundle.js'){res.setHeader('content-type','text/javascript');res.end(output.outputFiles[0].contents);return;}
  const path=pathname==='/'?'index.html':pathname.slice(1);assert.ok(!path.split('/').includes('..'));
  res.setHeader('content-type',path.endsWith('.html')?'text/html':path.endsWith('.css')?'text/css':'text/javascript');res.end(await readFile(new URL(path,root)));
 }catch{res.statusCode=404;res.end('not found');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));return{origin:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(r=>server.close(r))};
}
