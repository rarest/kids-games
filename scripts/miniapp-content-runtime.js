import {gunzipSync,strFromU8} from 'fflate';
// Only source教材 is bundled. Identity, progress and recordings never enter this module.
const cache={};
function decode64(value){
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
 const output=new Uint8Array(Math.floor(value.length*3/4)-(value.endsWith('==')?2:value.endsWith('=')?1:0));
 let bits=0,count=0,index=0;
 for(let i=0;i<value.length&&value[i]!=='=';i++){
  bits=(bits<<6)|alphabet.indexOf(value[i]);count+=6;
  if(count>=8){count-=8;output[index++]=(bits>>>count)&255}
 }
 return output;
}
export const assets=PACKAGED_ASSETS;
export function content(path){
 if(!Object.prototype.hasOwnProperty.call(PACKAGED_CONTENT,path))return undefined;
 if(!cache[path])cache[path]=JSON.parse(strFromU8(gunzipSync(decode64(PACKAGED_CONTENT[path]))));
 return JSON.parse(JSON.stringify(cache[path]));
}
