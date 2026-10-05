import {readFileSync,readdirSync,chmodSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve(new URL('..',import.meta.url).pathname),mini=join(root,'miniprogram');
const app=JSON.parse(readFileSync(join(mini,'app.json')));
const prefix=JSON.parse(process.env.MINIPROGRAM_COMPILER_PREFIX||'[]');
if(!Array.isArray(prefix)||prefix.some(p=>typeof p!=='string'))throw new Error('Compiler prefix must be a JSON argument array');
if(process.platform==='linux'&&process.arch!=='x64'&&!prefix.length)throw new Error('WCC Linux requires x64. Set MINIPROGRAM_COMPILER_PREFIX to an unprivileged QEMU command argument array on ARM.');
function files(dir,ext){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name),ext):e.name.endsWith(ext)?[join(dir,e.name)]:[])}
for(const path of files(mini,'.js')){const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr)}
const platform=process.platform==='darwin'?'mac':process.platform==='win32'?'windows':'linux';
function compile(name,args){const binary=join(root,'node_modules/miniprogram-compiler/bin',platform,name+(platform==='windows'?'.exe':''));chmodSync(binary,0o755);const result=spawnSync(prefix[0]||binary,[...prefix.slice(1),...(prefix.length?[binary]:[]),...args],{cwd:mini,encoding:'utf8',maxBuffer:8*1024*1024});if(result.error||result.status!==0||!result.stdout.trim())throw new Error(`${name}: ${result.error?.message||result.stderr||'compiler produced no output'} (exit ${result.status})`);return result.stdout}
const wxml=files(mini,'.wxml').map(path=>path.slice(mini.length+1));
const compiled=compile('wcc',['-d','-cc','0',...wxml,'-gn','$gwx']);
const wxss=compile('wcsc',['-db','-pc','0',...files(mini,'.wxss').map(path=>path.slice(mini.length+1))]);
const context={window:{},console};vm.createContext(context);vm.runInContext(compiled,context,{timeout:5000});
const source=path=>JSON.parse(readFileSync(join(root,'english/miniprogram-data',path)));
const count=tree=>1+(tree.children||[]).reduce((n,c)=>n+(typeof c==='object'?count(c):0),0);
const catalog=source('catalog.json'),page=source('pages/2.json'),lesson=source('lessons/'+catalog.units[0].lessons[0].id+'.json');
const cases=[
 ['pages/home/home',{catalog,completed:{},loading:false,profileName:'访客',sync:'此设备'}],
 ['pages/page/page',{page,tab:'read',loading:false,media:{}}],
 ['pages/page/page',{page,tab:'practice',loading:false,media:{},questions:page.questions,question:page.questions[0],questionIndex:1}],
 ['pages/page/page',{page,tab:'speak',loading:false,media:{recording:true},speakingTarget:page.targets[0]}],
 ['pages/lesson/lesson',{lesson,step:lesson.steps[0],loading:false,media:{},index:1,total:lesson.steps.length,canNext:true}],
 ['pages/account/account',{user:null,wechatReady:false,busy:false,username:'',password:''}],
 ['pages/account/account',{user:{name:'微信家长',wechatAccount:true},profiles:[{id:'a',nickname:'小豆'}],selected:{id:'a'},avatars:['小狐狸'],avatarIndex:0,wechatReady:true}],
];
const rendered=cases.map(([path,data])=>{assert.ok(app.pages.includes(path));const render=context.$gwx(path+'.wxml');assert.equal(typeof render,'function');const tree=render(data);assert.ok(tree?.children?.length,`Empty ${path}`);return {page:path,nodes:count(tree),tree}});
const evidence=process.env.MINIPROGRAM_COMPILE_EVIDENCE;if(evidence){mkdirSync(evidence,{recursive:true});writeFileSync(join(evidence,'wxml-render.json'),JSON.stringify(rendered,null,2));writeFileSync(join(evidence,'compile.json'),JSON.stringify({pages:app.pages,wxmlFiles:wxml.length,renderCases:rendered.map(({tree,...meta})=>meta),wxmlBytes:Buffer.byteLength(compiled),wxssBytes:Buffer.byteLength(wxss)},null,2))}
console.log(JSON.stringify({pages:app.pages.length,wxmlFiles:wxml.length,renderCases:rendered.length,sourceBytes:files(mini,'').reduce((n,p)=>n+readFileSync(p).length,0),wxmlBytes:Buffer.byteLength(compiled),wxssBytes:Buffer.byteLength(wxss)}));
