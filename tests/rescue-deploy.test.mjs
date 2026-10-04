import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,mkdir,copyFile,chmod,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const source=new URL('../',import.meta.url);
function run(command,args,cwd,env={}){const p=spawnSync(command,args,{cwd,env:{...process.env,...env},encoding:'utf8'});assert.equal(p.status,0,`${command} ${args.join(' ')}\n${p.stdout}\n${p.stderr}`);return p.stdout;}

test('deployment excludes private server/review files and uses valid shell and loopback units',async()=>{
 const script=await readFile(new URL('deploy/deploy-local.sh',source),'utf8');
 run('bash',['-n',new URL('deploy/deploy-local.sh',source).pathname],source);
 for(const path of ['shooter/server.mjs','rescue/server.mjs','.superpowers'])assert.ok(script.includes(`--exclude '${path}'`),`docroot excludes ${path}`);
 for(const [name,port] of [['rescue',8788],['shooter',8787]]){
  const unit=await readFile(new URL(`deploy/${name}-coop.service`,source),'utf8'),proxy=await readFile(new URL(`deploy/${name}-coop.conf`,source),'utf8');
  assert.ok(unit.includes(`/games-site/${name}/server.mjs`));assert.ok(unit.includes(`PORT=${port}`));assert.ok(proxy.includes(`location = /${name}-ws`));assert.ok(proxy.includes(`http://127.0.0.1:${port}`));
 }
});

test('three-game deployment preserves unchanged rooms and retries failed phases',{timeout:60000},async()=>{
 await mkdir(new URL('../.superpowers/',import.meta.url),{recursive:true});
 const dir=await mkdtemp(new URL('../.superpowers/rescue-deploy-',import.meta.url).pathname),repo=join(dir,'repo'),bin=join(dir,'bin'),units=join(dir,'units'),docroot=join(dir,'site/index'),log=join(dir,'calls');
 try {
  for(const p of [repo,bin,units,docroot,join(repo,'deploy'),join(repo,'rescue'),join(repo,'shooter'),join(repo,'node_modules/ws')])await mkdir(p,{recursive:true});
  run('git',['init','-q','-b','main'],repo);run('git',['config','user.name','Deployment test'],repo);run('git',['config','user.email','test@example.invalid'],repo);
  for(const file of ['deploy-local.sh','rescue-coop.service','rescue-coop.conf','shooter-coop.service','shooter-coop.conf'])await copyFile(new URL(`deploy/${file}`,source),join(repo,'deploy',file));
  for(const name of ['rescue','shooter'])for(const file of ['server.mjs','core.js','net-codec.js','bosses.js','campaign.js','levels.js','snapshot.js'])await writeFile(join(repo,name,file),'// initial\n');
  await writeFile(join(repo,'package.json'),JSON.stringify({dependencies:{ws:'1'},scripts:{test:'old'}}));
  await writeFile(join(repo,'package-lock.json'),JSON.stringify({packages:{'':{dependencies:{ws:'1'}},'node_modules/ws':{version:'1'},'node_modules/dev-only':{version:'1',dev:true}}}));
  await writeFile(join(repo,'.gitignore'),'node_modules\n');
  run('git',['add','.'],repo);run('git',['commit','-qm','initial'],repo);run('git',['clone','-q','--bare',repo,join(dir,'origin')],dir);run('git',['remote','add','origin',join(dir,'origin')],repo);
  // Test executables never call real sudo/systemctl/docker/npm/rsync.
  const tools={sudo:'exec "$@"',rsync:'echo "rsync $*" >> "$DEPLOY_TEST_LOG"; [ "${DEPLOY_TEST_FAIL_RSYNC:-0}" != 1 ]',chmod:'exit 0',npm:'echo "npm $*" >> "$DEPLOY_TEST_LOG"; [ "${DEPLOY_TEST_FAIL_NPM:-0}" != 1 ]',docker:'echo "docker $*" >> "$DEPLOY_TEST_LOG"; if [ "$1" = ps ]; then echo openresty-test; fi; case "$*" in *reload*) [ "${DEPLOY_TEST_FAIL_RELOAD:-0}" != 1 ];; *) exit 0;; esac',systemctl:'echo "systemctl $*" >> "$DEPLOY_TEST_LOG"; case "$*" in *is-enabled*racing*|*is-active*racing*) [ "${DEPLOY_TEST_RACING_INACTIVE:-0}" != 1 ];; *is-enabled*rescue*|*is-active*rescue*) [ "${DEPLOY_TEST_RESCUE_INACTIVE:-0}" != 1 ];; *) exit 0;; esac'};
  for(const [name,body] of Object.entries(tools)){await writeFile(join(bin,name),`#!/bin/sh\n${body}\n`);await chmod(join(bin,name),0o755);}
  const env={PATH:`${bin}:${process.env.PATH}`,RESCUE_DEPLOY_DOCROOT:docroot,RESCUE_DEPLOY_UNIT_DIR:units,DEPLOY_TEST_LOG:log,DEPLOY_TEST_RESCUE_INACTIVE:'0',DEPLOY_TEST_RACING_INACTIVE:'1'};
  const isolated=run('bash',['-c','command -v sudo systemctl docker npm rsync chmod'],repo,env).trim().split('\n');
  assert.deepEqual(isolated,['sudo','systemctl','docker','npm','rsync','chmod'].map(name=>join(bin,name)),'all side-effect tools must resolve inside the isolated test directory');
  const execute=()=>run('bash',['deploy/deploy-local.sh'],repo,env);
  async function change(file,contents){await writeFile(join(repo,file),contents);run('git',['add','.'],repo);run('git',['commit','-qm',`change ${file}`],repo);run('git',['push','-q','origin','main'],repo);run('git',['reset','--hard','-q','HEAD~1'],repo);}
  async function calls(){return readFile(log,'utf8');}
  async function clear(){await writeFile(log,'');}
  // The deployed revision predates racing. Pulling its first runtime must bootstrap
  // without requiring those files at the old revision or restarting existing rooms.
  await mkdir(join(repo,'racing'),{recursive:true});
  for(const file of ['racing-coop.service','racing-coop.conf'])await copyFile(new URL(`deploy/${file}`,source),join(repo,'deploy',file));
  for(const file of ['server.mjs','core.js','routes.js','contact.js','hazards.js'])await writeFile(join(repo,'racing',file),'// initial racing runtime\n');
  run('git',['add','.'],repo);run('git',['commit','-qm','add racing runtime'],repo);run('git',['push','-q','origin','main'],repo);run('git',['reset','--hard','-q','HEAD~1'],repo);
  await mkdir(join(dir,'site/proxy'),{recursive:true});
  for(const game of ['shooter','rescue']){
   await copyFile(join(repo,`deploy/${game}-coop.service`),join(units,`${game}-coop.service`));
   await copyFile(join(repo,`deploy/${game}-coop.conf`),join(dir,`site/proxy/${game}-coop.conf`));
  }
  execute();let out=await calls();assert.doesNotMatch(out,/(restart|start) (shooter|rescue)-coop/,'racing bootstrap preserves both live rooms');assert.match(out,/start racing-coop/);env.DEPLOY_TEST_RACING_INACTIVE='0';env.DEPLOY_TEST_RESCUE_INACTIVE='0';assert.match(out,/openresty -t/);assert.match(out,/openresty -s reload/);assert.doesNotMatch(out,/npm ci/);
  await clear();await change('package.json',JSON.stringify({dependencies:{ws:'1'},scripts:{test:'new'}}));execute();out=await calls();assert.doesNotMatch(out,/restart|--user start|daemon-reload|npm ci|openresty/,'test-script-only deployment preserves all three rooms');
  await clear();await change('rescue/core.js','// new rescue runtime\n');execute();out=await calls();assert.match(out,/restart rescue-coop/);assert.doesNotMatch(out,/restart shooter-coop|restart racing-coop|npm ci|openresty/);
  await clear();await change('shooter/snapshot.js','// changed shooter runtime\n');execute();out=await calls();assert.match(out,/restart shooter-coop/);assert.doesNotMatch(out,/restart rescue-coop|restart racing-coop|npm ci|openresty/);
  await clear();await change('rescue/game.js','// browser only\n');execute();out=await calls();assert.doesNotMatch(out,/restart|npm ci|openresty/);
  await clear();await change('deploy/rescue-coop.conf',(await readFile(join(repo,'deploy/rescue-coop.conf'),'utf8'))+'# changed\n');execute();out=await calls();assert.match(out,/openresty -t/);assert.match(out,/openresty -s reload/);assert.doesNotMatch(out,/restart|npm ci/);
  await clear();await change('deploy/rescue-coop.service',(await readFile(join(repo,'deploy/rescue-coop.service'),'utf8'))+'# changed\n');execute();out=await calls();assert.match(out,/daemon-reload/);assert.match(out,/restart rescue-coop/);assert.doesNotMatch(out,/restart shooter-coop|restart racing-coop|npm ci|openresty/);
  await clear();await change('package-lock.json',JSON.stringify({packages:{'':{dependencies:{ws:'1'}},'node_modules/ws':{version:'1'},'node_modules/dev-only':{version:'2',dev:true}}}));execute();out=await calls();assert.doesNotMatch(out,/restart|npm ci|openresty/,'dev-only lock changes preserve rooms');
  await clear();await change('package-lock.json',JSON.stringify({packages:{'':{dependencies:{ws:'1'}},'node_modules/ws':{version:'2'},'node_modules/dev-only':{version:'2',dev:true}}}));execute();out=await calls();assert.match(out,/npm ci/);assert.match(out,/restart rescue-coop/);assert.match(out,/restart shooter-coop/);assert.match(out,/restart racing-coop/);assert.doesNotMatch(out,/openresty/);
  for(const file of ['server.mjs','core.js','routes.js','contact.js','hazards.js']){
   await clear();await change(`racing/${file}`,`// changed ${file}\n`);execute();out=await calls();
   assert.match(out,/restart racing-coop/);assert.doesNotMatch(out,/restart shooter-coop|restart rescue-coop|npm ci|openresty/);
  }
  await clear();await change('racing/game.js','// racing browser only\n');execute();assert.doesNotMatch(await calls(),/restart|npm ci|openresty/);
  await clear();await change('deploy/racing-coop.service',(await readFile(join(repo,'deploy/racing-coop.service'),'utf8'))+'# changed\n');execute();out=await calls();
  assert.match(out,/daemon-reload/);assert.match(out,/restart racing-coop/);assert.doesNotMatch(out,/restart shooter-coop|restart rescue-coop|npm ci|openresty/);
  await clear();await change('deploy/racing-coop.conf',(await readFile(join(repo,'deploy/racing-coop.conf'),'utf8'))+'# changed\n');execute();out=await calls();
  assert.match(out,/openresty -t/);assert.match(out,/openresty -s reload/);assert.doesNotMatch(out,/restart|npm ci/);
  // Failure after pulling must preserve the old successful runtime baseline.
  await clear();await change('rescue/core.js','// next runtime\n');env.DEPLOY_TEST_FAIL_RSYNC='1';
  assert.notEqual(spawnSync('bash',['deploy/deploy-local.sh'],{cwd:repo,env:{...process.env,...env},encoding:'utf8'}).status,0);assert.doesNotMatch(await calls(),/restart/);
  env.DEPLOY_TEST_FAIL_RSYNC='0';await clear();execute();out=await calls();assert.match(out,/restart rescue-coop/);assert.doesNotMatch(out,/restart shooter-coop/);
  // Runtime succeeds, then proxy reload fails: retry reload only, preserving fresh rooms.
  await writeFile(join(repo,'rescue/core.js'),'// runtime with proxy\n');
  await clear();await change('deploy/rescue-coop.conf',(await readFile(join(repo,'deploy/rescue-coop.conf'),'utf8'))+'# next\n');env.DEPLOY_TEST_FAIL_RELOAD='1';
  assert.notEqual(spawnSync('bash',['deploy/deploy-local.sh'],{cwd:repo,env:{...process.env,...env},encoding:'utf8'}).status,0);out=await calls();assert.equal((out.match(/restart rescue-coop/g)||[]).length,1);assert.match(out,/openresty -s reload/);
  env.DEPLOY_TEST_FAIL_RELOAD='0';await clear();execute();out=await calls();assert.match(out,/openresty -t/);assert.match(out,/openresty -s reload/);assert.doesNotMatch(out,/restart|npm ci/,'already successful runtime phase is not repeated');
  // Missing/failed dependency install cannot become success merely because HEAD moved.
  await clear();await rm(join(repo,'node_modules/ws'),{recursive:true});env.DEPLOY_TEST_FAIL_NPM='1';
  assert.notEqual(spawnSync('bash',['deploy/deploy-local.sh'],{cwd:repo,env:{...process.env,...env},encoding:'utf8'}).status,0);
  await mkdir(join(repo,'node_modules/ws'),{recursive:true});env.DEPLOY_TEST_FAIL_NPM='0';await clear();execute();out=await calls();assert.match(out,/npm ci/);
  await clear();execute();assert.doesNotMatch(await calls(),/restart|npm ci|openresty/,'completed retry is idempotent');
 } finally {await rm(dir,{recursive:true,force:true});}
});
