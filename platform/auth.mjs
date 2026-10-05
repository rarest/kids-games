import {betterAuth} from 'better-auth';
import {getMigrations} from 'better-auth/db/migration';
import {getOAuthState,getSessionFromCtx} from 'better-auth/api';
import {tryGetCurrentAuthEndpointContext} from '@better-auth/core/context';
import {username,bearer,genericOAuth} from 'better-auth/plugins';
import {createWechat,webWechatOptions} from './wechat.mjs';
import {normalizeUsername,validUsername,isUsernameAccount,withUsernameRegistration} from './username-auth.mjs';

export function createAuth({pool, secret, publicOrigin, sendMail, wechat=createWechat()}) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('A persistent AUTH_SECRET of at least 32 characters is required');
  const origin = new URL(publicOrigin).origin;
  const deliver = async (user, url, subject, instruction) => {
    if(isUsernameAccount(user)){if(subject.includes('验证'))return;throw new Error('Username accounts have no recovery email');}
    if (!sendMail) throw new Error('Mail unavailable');
    await sendMail({to:user.email, subject, text:`${instruction}\n${url}\n\n如果不是你发起的请求，请忽略此邮件。`});
  };
  const web=webWechatOptions(wechat);
  const stripWechatTokens=(account,context)=>({data:account&&[account.providerId,context?.params?.id,context?.body?.providerId,context?.body?.provider].some(id=>typeof id==='string'&&id.startsWith('wechat'))?{...account,accessToken:null,refreshToken:null,idToken:null,accessTokenExpiresAt:null,refreshTokenExpiresAt:null}:account});
  const transport={id:'wechat-transport',init:async ctx=>{
    for(const provider of ctx.socialProviders)if(['wechat','wechat-mp'].includes(provider.id)) {
      if(provider.id==='wechat')provider.validateAuthorizationCode=wechat.webTokens;
      const getUserInfo=provider.getUserInfo;
      provider.getUserInfo=async tokens=>{
        // Framework parses and validates OAuth state before calling this provider.
        const state=await getOAuthState();
        if(state?.link) {
          const endpoint=tryGetCurrentAuthEndpointContext();
          const session=endpoint?await getSessionFromCtx(endpoint,{disableCookieCache:true}):null;
          if(!session||session.user.id!==state.link.userId||Date.now()-new Date(session.session.createdAt).getTime()>300000)return null;
        }
        return getUserInfo(tokens);
      };
    }
  }};
  const auth = betterAuth({
    database:pool, secret, baseURL:origin, basePath:'/api/auth', trustedOrigins:[origin],
    logger:{disabled:true}, socialProviders:web.socialProviders,
    plugins:[bearer(),...(web.genericConfig.length?[genericOAuth({config:web.genericConfig})]:[]),transport,username({minUsernameLength:6,maxUsernameLength:128,usernameNormalization:normalizeUsername,usernameValidator:validUsername,validationOrder:{username:'post-normalization'},immutableUsername:true})],
    databaseHooks:{user:{create:{before:async (user,context)=>({data:{...user,...(isUsernameAccount(user)?{emailVerified:true}:{}),...(wechat.webReady&&context?.params?.id===wechat.webProvider&&context?.path?.startsWith('/callback/')&&/^wechat-[a-f0-9]{64}@accounts\.invalid$/.test(user.email)?{wechatAccount:true}:{})}})}},account:{create:{before:stripWechatTokens},update:{before:stripWechatTokens}}},
    user:{modelName:'family_user',additionalFields:{wechatAccount:{type:'boolean',defaultValue:false,input:false}},deleteUser:{enabled:true}},
    session:{modelName:'family_session', expiresIn:60*60*24*7, updateAge:60*60*24, freshAge:300, cookieCache:{enabled:false}},
    account:{modelName:'family_account',accountLinking:{enabled:true,disableImplicitLinking:true,allowDifferentEmails:true,trustedProviders:[],allowUnlinkingAll:false}}, verification:{modelName:'family_verification'},
    emailAndPassword:{enabled:true, requireEmailVerification:true, minPasswordLength:10, maxPasswordLength:128, autoSignIn:false, revokeSessionsOnPasswordReset:true,
      sendResetPassword:async ({user,url})=>deliver(user,url,'游戏大厅：重置家长密码','点击链接重置密码：')},
    emailVerification:{sendOnSignUp:true, sendOnSignIn:true, autoSignInAfterVerification:false,
      sendVerificationEmail:async ({user,url})=>deliver(user,url,'游戏大厅：验证家长邮箱','点击链接验证邮箱：')},
    advanced:{useSecureCookies:origin.startsWith('https:'), ipAddress:{ipAddressHeaders:['x-real-ip']}},
    rateLimit:{enabled:true, storage:'database', modelName:'family_rate_limit', window:60, max:30, customRules:{'/sign-in/email':{window:60,max:10},'/sign-in/username':{window:60,max:10},'/sign-up/email':{window:60,max:5},'/request-password-reset':{window:60,max:5},'/send-verification-email':{window:60,max:5}}}
  });
  Object.defineProperty(auth,'wechat',{value:wechat});
  Object.defineProperty(auth,'mailReady',{value:typeof sendMail==='function'});
  return withUsernameRegistration(auth);
}

export async function migrateAuth(auth) {
  const migrations = await getMigrations(auth.options);
  await migrations.runMigrations();
  // Cover mini logins and web callbacks with the same database invariant.
  // Existing duplicate identities fail startup rather than selecting an owner.
  await auth.options.database.query(`CREATE UNIQUE INDEX IF NOT EXISTS family_wechat_identity_unique ON family_account ("providerId","accountId") WHERE "providerId" LIKE 'wechat%'`);

}
