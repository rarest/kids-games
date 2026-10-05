import {createHash} from 'node:crypto';

export const normalizeUsername=value=>typeof value==='string'?value.normalize('NFKC').trim().toLowerCase():'';
export function validUsername(value){const normalized=normalizeUsername(value),length=[...normalized].length;return length>=6&&length<=64&&/^[\p{L}\p{N}_.-]+$/u.test(normalized);}
// This address only satisfies the existing auth schema; it is never displayed
// as a mailbox or used to deliver verification or password-recovery messages.
export const usernameAddress=value=>`username-${createHash('sha256').update(normalizeUsername(value)).digest('hex')}@accounts.invalid`;
export const isUsernameAccount=user=>!!user?.username&&user.email===usernameAddress(user.username);

export function withUsernameRegistration(auth){
 const handler=auth.handler;
 auth.handler=async request=>{
  const url=new URL(request.url),signup=url.pathname==='/api/auth/sign-up/username',signin=url.pathname==='/api/auth/sign-in/username';
  if(url.pathname==='/api/auth/request-password-reset'&&request.method==='POST'){
   let body;try{body=await request.clone().json();}catch{}
   if(body?.username||typeof body?.email==='string'&&body.email.trim().toLowerCase().endsWith('@accounts.invalid'))return Response.json({code:'USERNAME_RECOVERY_UNAVAILABLE',message:'Username accounts have no recovery email'},{status:400});
  }
  if(!signup&&!signin)return handler(request);
  if(request.method!=='POST')return Response.json({code:'METHOD_NOT_ALLOWED',message:'POST required'},{status:405});
  let body;try{body=await request.json();}catch{return Response.json({code:'INVALID_BODY',message:'Invalid JSON body'},{status:400});}
  const username=normalizeUsername(body?.username);
  if(!validUsername(username))return Response.json({code:'INVALID_USERNAME',message:'Username must contain 6 to 64 letters, numbers, dots, underscores or hyphens'},{status:400});
  const headers=new Headers(request.headers);headers.delete('content-length');
  const invoke=(path,data)=>handler(new Request(new URL(path,url.origin),{method:'POST',headers,body:JSON.stringify(data)}));
  if(signup){
   const registered=await invoke('/api/auth/sign-up/email',{username,displayUsername:body.username.normalize('NFKC').trim(),email:usernameAddress(username),name:body.username.normalize('NFKC').trim(),password:body.password});
   if(!registered.ok)return registered;
  }
  return invoke('/api/auth/sign-in/username',{username,password:body.password,rememberMe:body.rememberMe});
 };
 return auth;
}
