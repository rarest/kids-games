export const avatars={fox:'🦊',panda:'🐼',rabbit:'🐰',cat:'🐱',dog:'🐶',bird:'🐦'};
export const selectedProfileKey=owner=>`family-selected-v1:${encodeURIComponent(owner)}`;
export const verifiedOwnerKey='family-verified-owner-v1';
export function browserStorage(){try{return globalThis.localStorage}catch{}const cache=new Map();return {getItem:key=>cache.get(key)??null,setItem:(key,value)=>cache.set(key,String(value)),removeItem:key=>cache.delete(key),get length(){return cache.size},key:index=>[...cache.keys()][index]??null}}
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function familyRequest(path,{method='GET',body}={}){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);let response;
 try{response=await fetch(path,{method,signal:controller.signal,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined})}finally{clearTimeout(timeout)}
 let data;try{data=await response.json()}catch{data={}}
 if(!response.ok){const error=new Error(data.message||data.error||'暂时无法连接，请稍后再试。');error.status=response.status;error.data=data;throw error}return data;
}
export const familyAPI={status:()=>familyRequest('/api/family/status'),session:()=>familyRequest('/api/auth/get-session'),profiles:()=>familyRequest('/api/family/profiles'),auth:(action,body)=>familyRequest(`/api/auth/${action}`,{method:'POST',body})};
export function selectProfile(owner,id,storage=browserStorage()){storage.setItem(selectedProfileKey(owner),id);globalThis.dispatchEvent?.(new Event('family-profile-change'))}
export function clearFamilyIdentity(storage=browserStorage()){storage.removeItem(verifiedOwnerKey);globalThis.dispatchEvent?.(new Event('family-logout'))}
export function accountError(error){
 const code=error.data?.code;
 if(code==='USERNAME_RECOVERY_UNAVAILABLE')return '用户名账号暂不支持邮件找回密码，请使用已有密码登录。';
 if(code==='INVALID_USERNAME_OR_PASSWORD'||error.message==='Invalid username or password')return '用户名或密码不正确。';
 if(code==='INVALID_EMAIL_OR_PASSWORD'||error.message==='Invalid email or password')return '邮箱或密码不正确。';
 if(['INVALID_USERNAME','USERNAME_TOO_SHORT','USERNAME_TOO_LONG'].includes(code))return '用户名需为6—64个字符，只能包含文字、数字、点、下划线或短横线。';
 if(code==='USERNAME_IS_ALREADY_TAKEN')return '这个用户名已被使用，请换一个。';
 if(code==='PASSWORD_TOO_SHORT')return '密码至少需要10个字符。';
 if(error.status===401)return '登录已失效，请重新登录。';
 if(error.status===403)return '请先到邮箱完成验证，再回来登录。';
 if(error.status===409)return '这个孩子已有学习进度，请选择或新建一个空档案。';
 if(error.status===503&&(error.data?.error==='Email service unavailable'||error.message==='Email service unavailable'))return '旧邮箱的邮件找回服务暂不可用。';
 return error.status&&error.status<500?'操作未完成，请检查填写内容后重试。':'连接暂时中断，请稍后再试。';
}
