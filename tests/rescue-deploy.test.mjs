import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,mkdir,copyFile,chmod,rm,access} from 'node:fs/promises';
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

test('game and platform deployment preserve unchanged rooms and retry failed phases',{timeout:60000},async(t)=>{
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
  const tools={sudo:'exec "$@"',rsync:'echo "rsync $*" >> "$DEPLOY_TEST_LOG"; [ "${DEPLOY_TEST_FAIL_RSYNC:-0}" != 1 ]',chmod:'exit 0',npm:'echo "npm $*" >> "$DEPLOY_TEST_LOG"; [ "${DEPLOY_TEST_FAIL_NPM:-0}" != 1 ] || exit 1; case "$*" in *"--prefix platform"*) mkdir -p platform/node_modules/pg;; esac',docker:'echo "docker $*" >> "$DEPLOY_TEST_LOG"; if [ "$1" = ps ]; then echo openresty-test; fi; case "$*" in *reload*) [ "${DEPLOY_TEST_FAIL_RELOAD:-0}" != 1 ];; *) exit 0;; esac',systemctl:'echo "systemctl $*" >> "$DEPLOY_TEST_LOG"; case "$*" in *is-enabled*racing*|*is-active*racing*) [ "${DEPLOY_TEST_RACING_INACTIVE:-0}" != 1 ];; *is-enabled*rescue*|*is-active*rescue*) [ "${DEPLOY_TEST_RESCUE_INACTIVE:-0}" != 1 ];; *) exit 0;; esac'};
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
  const state=join(repo,'.git/games-deploy'),config=join(dir,'private/app.env');
  const noGameRestart=output=>assert.doesNotMatch(output,/(?:restart|start) (?:shooter|rescue|racing)-coop/,'platform changes preserve all existing game rooms');
  const noRootNpm=output=>assert.doesNotMatch(output,/^npm (?![^\n]*--prefix platform)/m,'platform dependencies never install through root npm');
  const failed=()=>spawnSync('bash',['deploy/deploy-local.sh'],{cwd:repo,env:{...process.env,...env},encoding:'utf8'});
  await t.test('adding the independent platform preserves existing rooms and keeps configuration outside docroot',async()=>{
   await mkdir(join(repo,'platform/migrations'),{recursive:true});
   await mkdir(join(dir,'private'),{recursive:true});
   await writeFile(config,'PLATFORM_CONFIG_SENTINEL=outside-docroot\n');
   env.PLATFORM_DEPLOY_CONFIG=config;
   for(const file of ['games-platform.service','games-platform-backup.service','games-platform-backup.timer','games-platform.conf'])await copyFile(new URL(`deploy/${file}`,source),join(repo,'deploy',file));
   for(const file of ['server.mjs','store.mjs','periods.mjs','migrations/001-activity.sql'])await writeFile(join(repo,'platform',file),'// initial platform\n');
   await writeFile(join(repo,'platform/package.json'),JSON.stringify({dependencies:{pg:'1'}}));
   await change('platform/package-lock.json',JSON.stringify({packages:{'':{dependencies:{pg:'1'}},'node_modules/pg':{version:'1'}}}));
   for(const folder of ['platform','shooter','.well-known'])await mkdir(join(docroot,folder),{recursive:true});
   await writeFile(join(docroot,'platform/server.mjs'),'old static backend copy');
   await writeFile(join(docroot,'shooter/server.mjs'),'old static backend copy');
   await writeFile(join(docroot,'.well-known/challenge'),'keep certificate challenge');
   await clear();execute();out=await calls();
   noGameRestart(out);noRootNpm(out);assert.match(out,/npm ci --prefix platform/);
   assert.match(out,/restart games-platform.service/);assert.match(out,/enable games-platform.service games-platform-backup.timer/);assert.match(out,/start games-platform-backup.timer/);
   assert.match(out,/openresty -t/);assert.match(out,/openresty -s reload/);
   assert.match(out,/rsync [^\n]*--exclude platform[^\n]*--exclude \.env/);
   assert.doesNotMatch(out,/PLATFORM_CONFIG_SENTINEL/);
   assert.equal(await readFile(config,'utf8'),'PLATFORM_CONFIG_SENTINEL=outside-docroot\n');
   await assert.rejects(access(join(docroot,'app.env')),{code:'ENOENT'});
   await assert.rejects(access(join(docroot,'platform')),{code:'ENOENT'});
   await assert.rejects(access(join(docroot,'shooter/server.mjs')),{code:'ENOENT'});
   assert.equal(await readFile(join(docroot,'.well-known/challenge'),'utf8'),'keep certificate challenge');
   await clear();execute();out=await calls();
   assert.doesNotMatch(out,/restart|npm ci|openresty/,'successful platform bootstrap is idempotent');
  });
  await t.test('platform runtime and dependency updates restart only the platform',async()=>{
   await clear();await change('platform/store.mjs','// new platform runtime\n');execute();out=await calls();
   assert.match(out,/restart games-platform.service/);noGameRestart(out);noRootNpm(out);assert.doesNotMatch(out,/npm ci|openresty/);
   await clear();await change('platform/package-lock.json',JSON.stringify({packages:{'':{dependencies:{pg:'1'}},'node_modules/pg':{version:'2'}}}));execute();out=await calls();
   assert.match(out,/npm ci --prefix platform/);assert.match(out,/restart games-platform.service/);noGameRestart(out);noRootNpm(out);assert.doesNotMatch(out,/openresty/);
  });
  await t.test('failed platform npm does not advance successful markers and the next deployment retries',async()=>{
   const dependencies=await readFile(join(state,'platform-dependencies'),'utf8'),runtime=await readFile(join(state,'platform-runtime'),'utf8');
   await clear();await change('platform/package-lock.json',JSON.stringify({packages:{'':{dependencies:{pg:'1'}},'node_modules/pg':{version:'3'}}}));env.DEPLOY_TEST_FAIL_NPM='1';
   const result=failed();assert.notEqual(result.status,0);out=await calls();assert.match(out,/npm ci --prefix platform/);noGameRestart(out);noRootNpm(out);assert.doesNotMatch(out,/restart games-platform.service/);
   assert.equal(await readFile(join(state,'platform-dependencies'),'utf8'),dependencies);assert.equal(await readFile(join(state,'platform-runtime'),'utf8'),runtime);
   env.DEPLOY_TEST_FAIL_NPM='0';await clear();execute();out=await calls();assert.match(out,/npm ci --prefix platform/);assert.match(out,/restart games-platform.service/);noGameRestart(out);noRootNpm(out);
   assert.notEqual(await readFile(join(state,'platform-dependencies'),'utf8'),dependencies);assert.notEqual(await readFile(join(state,'platform-runtime'),'utf8'),runtime);
   await clear();execute();assert.doesNotMatch(await calls(),/restart|npm ci|openresty/,'successful dependency retry is idempotent');
  });
  await t.test('failed proxy reload retries without repeating an already successful platform restart',async()=>{
   await writeFile(join(repo,'platform/server.mjs'),'// runtime with platform proxy\n');
   await clear();await change('deploy/games-platform.conf',(await readFile(join(repo,'deploy/games-platform.conf'),'utf8'))+'# next platform proxy\n');env.DEPLOY_TEST_FAIL_RELOAD='1';
   assert.notEqual(failed().status,0);out=await calls();assert.equal((out.match(/restart games-platform.service/g)||[]).length,1);assert.match(out,/openresty -s reload/);noGameRestart(out);noRootNpm(out);
   const runtime=await readFile(join(state,'platform-runtime'),'utf8');await access(join(state,'proxy-pending'));
   env.DEPLOY_TEST_FAIL_RELOAD='0';await clear();execute();out=await calls();assert.match(out,/openresty -t/);assert.match(out,/openresty -s reload/);assert.doesNotMatch(out,/restart|npm ci/,'successful platform runtime is not repeated');
   assert.equal(await readFile(join(state,'platform-runtime'),'utf8'),runtime);await assert.rejects(access(join(state,'proxy-pending')),{code:'ENOENT'});
  });
  await t.test('missing external platform configuration blocks platform success until restored',async()=>{
   const runtime=await readFile(join(state,'platform-runtime'),'utf8');
   await clear();await change('platform/periods.mjs','// pending platform update\n');await rm(config);
   const result=failed();assert.notEqual(result.status,0);assert.match(result.stderr,/Platform configuration missing outside docroot/);out=await calls();assert.doesNotMatch(out,/npm ci|restart games-platform.service/);noGameRestart(out);
   assert.equal(await readFile(join(state,'platform-runtime'),'utf8'),runtime);
   await writeFile(config,'PLATFORM_CONFIG_SENTINEL=outside-docroot\n');await clear();execute();out=await calls();assert.match(out,/restart games-platform.service/);assert.doesNotMatch(out,/npm ci/);noGameRestart(out);noRootNpm(out);
  });
 } finally {await rm(dir,{recursive:true,force:true});}
});
