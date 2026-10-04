export const avatars={fox:'🦊',panda:'🐼',rabbit:'🐰',cat:'🐱',dog:'🐶',bird:'🐦'};
export const selectedProfileKey=owner=>`family-selected-v1:${encodeURIComponent(owner)}`;
export const verifiedOwnerKey='family-verified-owner-v1';
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function familyRequest(path,{method='GET',body}={}){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);let response;
 try{response=await fetch(path,{method,signal:controller.signal,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined})}finally{clearTimeout(timeout)}
 let data;try{data=await response.json()}catch{data={}}
 if(!response.ok){const error=new Error(data.message||data.error||'暂时无法连接，请稍后再试。');error.status=response.status;error.data=data;throw error}return data;
}
export const familyAPI={status:()=>familyRequest('/api/family/status'),session:()=>familyRequest('/api/auth/get-session'),profiles:()=>familyRequest('/api/family/profiles'),auth:(action,body)=>familyRequest(`/api/auth/${action}`,{method:'POST',body})};
export function selectProfile(owner,id,storage=localStorage){storage.setItem(selectedProfileKey(owner),id);globalThis.dispatchEvent?.(new Event('family-profile-change'))}
export function clearFamilyIdentity(storage=localStorage){storage.removeItem(verifiedOwnerKey);globalThis.dispatchEvent?.(new Event('family-logout'))}
export function accountError(error){if(error.status===401)return '登录已失效，请重新登录。';if(error.status===403)return '请先到邮箱完成验证，再回来登录。';if(error.status===409)return '这个孩子已有学习进度，请选择或新建一个空档案。';if(error.status===503)return '邮件服务尚未配置，注册和密码找回暂不可用。';if(error.message==='Invalid email or password')return '邮箱或密码不正确。';return error.status&&error.status<500?'操作未完成，请检查填写内容后重试。':'连接暂时中断，请稍后再试。'}
