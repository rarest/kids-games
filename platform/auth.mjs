import {betterAuth} from 'better-auth';
import {getMigrations} from 'better-auth/db/migration';
import {username} from 'better-auth/plugins';
import {normalizeUsername,validUsername,isUsernameAccount,withUsernameRegistration} from './username-auth.mjs';

export function createAuth({pool, secret, publicOrigin, sendMail}) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('A persistent AUTH_SECRET of at least 32 characters is required');
  const origin = new URL(publicOrigin).origin;
  const deliver = async (user, url, subject, instruction) => {
    if(isUsernameAccount(user)){if(subject.includes('验证'))return;throw new Error('Username accounts have no recovery email');}
    if (!sendMail) throw new Error('Mail unavailable');
    await sendMail({to:user.email, subject, text:`${instruction}\n${url}\n\n如果不是你发起的请求，请忽略此邮件。`});
  };
  const auth = betterAuth({
    database:pool, secret, baseURL:origin, basePath:'/api/auth', trustedOrigins:[origin],
    logger:{disabled:true},
    plugins:[username({minUsernameLength:6,maxUsernameLength:128,usernameNormalization:normalizeUsername,usernameValidator:validUsername,validationOrder:{username:'post-normalization'},immutableUsername:true})],
    databaseHooks:{user:{create:{before:async user=>({data:{...user,...(isUsernameAccount(user)?{emailVerified:true}:{})}})}}},
    user:{modelName:'family_user', deleteUser:{enabled:true}},
    session:{modelName:'family_session', expiresIn:60*60*24*7, updateAge:60*60*24, freshAge:300, cookieCache:{enabled:false}},
    account:{modelName:'family_account'}, verification:{modelName:'family_verification'},
    emailAndPassword:{enabled:true, requireEmailVerification:true, minPasswordLength:10, maxPasswordLength:128, autoSignIn:false, revokeSessionsOnPasswordReset:true,
      sendResetPassword:async ({user,url})=>deliver(user,url,'游戏大厅：重置家长密码','点击链接重置密码：')},
    emailVerification:{sendOnSignUp:true, sendOnSignIn:true, autoSignInAfterVerification:false,
      sendVerificationEmail:async ({user,url})=>deliver(user,url,'游戏大厅：验证家长邮箱','点击链接验证邮箱：')},
    advanced:{useSecureCookies:origin.startsWith('https:'), ipAddress:{ipAddressHeaders:['x-real-ip']}},
    rateLimit:{enabled:true, storage:'database', modelName:'family_rate_limit', window:60, max:30, customRules:{'/sign-in/email':{window:60,max:10},'/sign-in/username':{window:60,max:10},'/sign-up/email':{window:60,max:5},'/request-password-reset':{window:60,max:5},'/send-verification-email':{window:60,max:5}}}
  });
  Object.defineProperty(auth,'mailReady',{value:typeof sendMail==='function'});
  return withUsernameRegistration(auth);
}

export async function migrateAuth(auth) {
  const migrations = await getMigrations(auth.options);
  await migrations.runMigrations();
}
