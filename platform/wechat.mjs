import {createHash} from 'node:crypto';
import {problem} from './store.mjs';

export const wechatAddress=(providerId,accountId)=>`wechat-${createHash('sha256').update(`${providerId}\0${accountId}`).digest('hex')}@accounts.invalid`;
export const isWechatAccount=user=>user?.wechatAccount===true;
export const publicWechatUser=user=>({id:user.id,name:user.name,username:user.username??null,displayUsername:user.displayUsername??null,email:isWechatAccount(user)?null:user.email,emailVerified:user.emailVerified,wechatAccount:isWechatAccount(user),image:user.image??null});
const validIdentity=value=>typeof value==='string'&&value.length>0&&value.length<=256&&!/[\s\p{C}]/u.test(value);
export function createWechat({env=process.env,fetchImpl=fetch,timeoutMs=8000}={}){
 const miniId=env.WECHAT_MINI_APP_ID,miniSecret=env.WECHAT_MINI_APP_SECRET,webId=env.WECHAT_WEB_APP_ID,webSecret=env.WECHAT_WEB_APP_SECRET,mode=env.WECHAT_WEB_MODE;
 const miniReady=!!(miniId&&miniSecret),webReady=!!(webId&&webSecret&&['website','official-account'].includes(mode));
 const webProvider=webReady?(mode==='website'?'wechat':'wechat-mp'):null;
 async function tencent(path,params){
  let response,body;
  try{response=await fetchImpl(new URL(`${path}?${new URLSearchParams(params)}`,'https://api.weixin.qq.com'),{signal:AbortSignal.timeout(timeoutMs)});body=await response.json();}catch{throw problem(503,'WeChat authorization temporarily unavailable');}
  if(!response.ok||!body||typeof body!=='object')throw problem(503,'WeChat authorization temporarily unavailable');
  if(body.errcode)throw problem(401,'WeChat authorization code rejected');
  return body;
 }
 function codeValue(code){if(typeof code!=='string'||!code.trim()||code.length>512||/[\s\p{C}]/u.test(code))throw problem(400,'WeChat temporary code required');return code;}
 async function exchangeMini(code){
  if(!miniReady)throw problem(503,'WeChat mini program is not configured');
  const body=await tencent('/sns/jscode2session',{appid:miniId,secret:miniSecret,js_code:codeValue(code),grant_type:'authorization_code'});
  if(!validIdentity(body.openid))throw problem(401,'WeChat identity unavailable');
  // No unionid fallback: app-specific openid remains stable across unionid rollout.
  return {providerId:`wechat-mini:${miniId}`,accountId:body.openid};
 }
 async function webTokens({code}){
  const body=await tencent('/sns/oauth2/access_token',{appid:webId,secret:webSecret,code:codeValue(code),grant_type:'authorization_code'});
  if(!validIdentity(body.openid)||typeof body.access_token!=='string')throw problem(401,'WeChat identity unavailable');
  return {accessToken:body.access_token,tokenType:'Bearer',openid:body.openid,scopes:typeof body.scope==='string'?body.scope.split(','):[],accessTokenExpiresAt:new Date(Date.now()+Number(body.expires_in||7200)*1000)};
 }
 async function webProfile(tokens){
  if(!validIdentity(tokens.openid))return null;
  const profile=await tencent('/sns/userinfo',{access_token:tokens.accessToken,openid:tokens.openid,lang:'zh_CN'});
  if(profile.openid!==tokens.openid)return null;
  const id=`${webId}:${tokens.openid}`;
  return {id,openid:id,name:typeof profile.nickname==='string'?profile.nickname.slice(0,100):'微信家长',email:wechatAddress(webProvider,id),emailVerified:true,wechatAccount:true};
 }
 return {miniReady,webReady,webProvider,exchangeMini,webTokens,webProfile,webAppId:webId,webAppSecret:webSecret,webMode:mode};
}

export function webWechatOptions(wechat){
 if(!wechat.webReady)return {socialProviders:{},genericConfig:[]};
 if(wechat.webMode==='website')return {socialProviders:{wechat:{clientId:wechat.webAppId,clientSecret:wechat.webAppSecret,accountSubject:({profile})=>profile.openid,getUserInfo:async tokens=>{const profile=await wechat.webProfile(tokens);return profile?{user:profile,data:profile}:null;}}},genericConfig:[]};
 return {socialProviders:{},genericConfig:[{providerId:'wechat-mp',name:'微信公众号',clientId:wechat.webAppId,clientSecret:wechat.webAppSecret,authorizationUrl:'https://open.weixin.qq.com/connect/oauth2/authorize#wechat_redirect',authorizationUrlParams:{appid:wechat.webAppId},scopes:['snsapi_userinfo'],pkce:false,getToken:wechat.webTokens,getUserInfo:wechat.webProfile,mapProfileToUser:profile=>({wechatAccount:true,email:profile.email,emailVerified:true}),accountSubject:({profile})=>profile.id}]};
}
