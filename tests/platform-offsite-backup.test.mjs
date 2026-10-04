import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,createDecipheriv} from 'node:crypto';
import {mkdtemp,writeFile,readFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Readable} from 'node:stream';

test('offsite backup encrypts a binary dump and leaves no plaintext; failed dump creates no successful artifact',async()=>{
 const {saveEncryptedDump}=await import('../deploy/platform-offsite-backup.mjs');
 const dir=await mkdtemp(join(tmpdir(),'games-offsite-'));
 try{
  const key=randomBytes(32),source=Buffer.from('PGDMP\0private family and auth data');
  const file=join(dir,'backup.aes');
  const result=await saveEncryptedDump({source:Readable.from([source]),target:file,key});
  const encrypted=await readFile(file);
  assert.equal(encrypted.subarray(0,12).toString(),'GAMESBACKUP1');
  assert.equal(encrypted.includes(source),false);
  const decipher=createDecipheriv('aes-256-gcm',key,encrypted.subarray(12,24));
  decipher.setAuthTag(encrypted.subarray(-16));
  assert.deepEqual(Buffer.concat([decipher.update(encrypted.subarray(24,-16)),decipher.final()]),source);
  assert.equal(result.bytes,source.length);
  const broken=Readable.from((async function*(){yield source;throw new Error('dump failed')})());
  await assert.rejects(saveEncryptedDump({source:broken,target:join(dir,'failed.aes'),key}));
  await assert.rejects(readFile(join(dir,'failed.aes')),{code:'ENOENT'});
  const bad=Buffer.from(encrypted);bad[30]^=1;
  const integrity=createDecipheriv('aes-256-gcm',key,bad.subarray(12,24));integrity.setAuthTag(bad.subarray(-16));
  assert.throws(()=>Buffer.concat([integrity.update(bad.subarray(24,-16)),integrity.final()]));
 }finally{await rm(dir,{recursive:true,force:true})}
});
