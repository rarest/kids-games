import {readFile,readdir,mkdir,writeFile,copyFile,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {gzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {build} from 'esbuild';
const root=resolve(new URL('../',import.meta.url).pathname),mini=join(root,'miniprogram');
const walk=async dir=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(join(dir,e.name)):join(dir,e.name)))).flat();
const source=join(root,'english/miniprogram-data'),data={};
for(const file of (await walk(source)).sort())if(file.endsWith('.json'))data[file.slice(source.length+1)]=gzipSync(await readFile(file),{level:9}).toString('base64');
const assetRoot=join(mini,'assets');await rm(assetRoot,{recursive:true,force:true});await mkdir(assetRoot,{recursive:true});
// Pillow compresses existing, reviewed illustrations; no new artwork is invented.
const result=spawnSync('python3',[join(root,'scripts/pack-miniprogram-images.py'),root],{encoding:'utf8'});
if(result.status!==0)throw new Error(result.stderr||result.error?.message||'Image packaging failed');
const assets=JSON.parse(result.stdout);
await mkdir(join(assetRoot,'audio'),{recursive:true});
const first=JSON.parse(await readFile(join(source,'lessons/g3-upper-u1-l1.json')));
for(const audio of new Set(first.targets.map(t=>t.audio).filter(Boolean))){
 const local='/assets/audio/'+audio.split('/').at(-1);await copyFile(join(root,audio),join(mini,local));assets[audio]=local;
}
await mkdir(join(assetRoot,'encouragement'),{recursive:true});
for(const name of ['three','five','recovered','done'])await copyFile(join(root,'english/encouragement/'+name+'.mp3'),join(assetRoot,'encouragement/'+name+'.mp3'));
await build({entryPoints:[join(root,'english/encouragement.js')],bundle:true,platform:'neutral',format:'cjs',target:'es2017',minify:true,legalComments:'none',outfile:join(mini,'lib/encouragement.js')});
await build({entryPoints:[join(root,'scripts/miniapp-content-runtime.js')],bundle:true,platform:'neutral',format:'cjs',target:'es2017',minify:true,legalComments:'none',define:{PACKAGED_CONTENT:JSON.stringify(data),PACKAGED_ASSETS:JSON.stringify(assets)},outfile:join(mini,'lib/bundled-content.js')});
const bytes=(await Promise.all((await walk(mini)).map(p=>readFile(p)))).reduce((n,b)=>n+b.length,0);
if(bytes>=1800000)throw new Error('Main package exceeds the 1.8 MB project budget: '+bytes);
await writeFile(join(mini,'bundle-manifest.json'),JSON.stringify({schema:1,contentVersion:'pep3-2024-v1',pages:90,lessons:36,files:Object.keys(data).length,unitImages:6,wordImages:Object.keys(assets).filter(p=>p.includes('miniprogram-art')).length,audioClips:Object.keys(assets).filter(p=>p.includes('/audio/')).length},null,2)+'\n');
console.log(JSON.stringify({contentFiles:Object.keys(data).length,packagedAssets:Object.keys(assets).length,sourceBytes:bytes}));
