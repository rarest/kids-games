#!/usr/bin/env node
// Run on a different host. Keys and encrypted dumps stay outside Git/docroot.
import {createCipheriv,randomBytes,createHash} from 'node:crypto';
import {createWriteStream} from 'node:fs';
import {readFile,mkdir,chmod,rename,rm,readdir,copyFile,stat,writeFile} from 'node:fs/promises';
import {pipeline} from 'node:stream/promises';
import {Transform} from 'node:stream';
import {spawn} from 'node:child_process';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

export async function saveEncryptedDump({source,target,key,completed=Promise.resolve()}){
 if(!Buffer.isBuffer(key)||key.length!==32)throw new Error('A 32-byte backup key is required');
 const temporary=target+'.'+randomBytes(8).toString('hex')+'.tmp';
 const nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,nonce);
 const output=createWriteStream(temporary,{flags:'wx',mode:0o600});
 let bytes=0,prefix=Buffer.alloc(0);
 const check=new Transform({transform(chunk,encoding,callback){bytes+=chunk.length;if(prefix.length<5)prefix=Buffer.concat([prefix,chunk]).subarray(0,5);callback(null,chunk)}});
 try{
  output.write(Buffer.concat([Buffer.from('GAMESBACKUP1'),nonce]));
  await pipeline(source,check,cipher,output,{end:false});
  await completed;
  if(bytes<5||prefix.toString()!=='PGDMP')throw new Error('Invalid PostgreSQL dump');
  output.end(cipher.getAuthTag());
  await new Promise((resolve,reject)=>{output.once('close',resolve);output.once('error',reject)});
  await rename(temporary,target);
  return {bytes};
 }catch(error){output.destroy();await rm(temporary,{force:true});throw error}
}

async function main(){
 const {PLATFORM_BACKUP_SSH_HOST:host,PLATFORM_BACKUP_KEY_FILE:keyFile,PLATFORM_OFFSITE_BACKUP_DIR:folder}=process.env;
 if(!host||host.startsWith('-')||!/^[-a-zA-Z0-9_.@]+$/.test(host)||!keyFile||!folder)throw new Error('Backup configuration is required');
 const info=await stat(keyFile);if((info.mode&0o077)!==0)throw new Error('Backup key permissions must be private');
 const hex=(await readFile(keyFile,'utf8')).trim();if(!/^[a-f0-9]{64}$/.test(hex))throw new Error('Invalid backup key');
 await mkdir(folder,{recursive:true,mode:0o700});await chmod(folder,0o700);
 const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
 const file=join(folder,'daily-'+stamp+'.aes');
 const child=spawn('ssh',['-o','BatchMode=yes','-o','ConnectTimeout=10',host,'sudo -n docker exec games-platform-db pg_dump -U postgres -d games_platform --format=custom'],{stdio:['ignore','pipe','ignore']});
 const timer=setTimeout(()=>child.kill('SIGTERM'),120000);timer.unref();
 const completed=new Promise((resolve,reject)=>{child.once('error',()=>reject(new Error('Backup SSH connection failed')));child.once('close',code=>{clearTimeout(timer);code===0?resolve():reject(new Error('Remote dump failed'))})});
 // Attach a rejection handler while the stream is running.
 completed.catch(()=>{});
 const result=await saveEncryptedDump({source:child.stdout,target:file,key:Buffer.from(hex,'hex'),completed});
 if(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Shanghai',weekday:'short'}).format(new Date())==='Mon')await copyFile(file,join(folder,'weekly-'+stamp+'.aes'));
 for(const [prefix,keep]of [['daily-',7],['weekly-',4]]){
  const files=(await readdir(folder)).filter(name=>name.startsWith(prefix)&&name.endsWith('.aes')).sort().reverse();
  for(const name of files.slice(keep))await rm(join(folder,name));
 }
 const receipt={at:new Date().toISOString(),bytes:result.bytes,encryptedBytes:(await stat(file)).size,sha256:createHash('sha256').update(await readFile(file)).digest('hex')};
 await writeFile(join(folder,'last-success.json'),JSON.stringify(receipt)+'\n',{mode:0o600});
 console.log('[platform] encrypted offsite database backup complete');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(()=>{console.error('[platform] offsite backup failed');process.exitCode=1});
