import nodemailer from 'nodemailer';

// Missing configuration disables mail routes. Partial configuration fails startup.
export function createMailer(env = process.env) {
  const keys=['SMTP_HOST','SMTP_PORT','SMTP_FROM','SMTP_USER','SMTP_PASSWORD','SMTP_SECURE'];
  if (!keys.some(key=>env[key])) return undefined;
  const port=Number(env.SMTP_PORT || 465);
  if (!env.SMTP_HOST || !env.SMTP_FROM || !Number.isInteger(port) || port<1 || port>65535 || (!!env.SMTP_USER !== !!env.SMTP_PASSWORD)) throw new Error('Incomplete SMTP configuration');
  if (port !== 465 && port !== 587) throw new Error('SMTP requires TLS on port 465 or 587');
  const secure=env.SMTP_SECURE === undefined ? port===465 : env.SMTP_SECURE==='true';
  if ((port===465 && !secure) || (port===587 && secure) || (env.SMTP_SECURE && !['true','false'].includes(env.SMTP_SECURE))) throw new Error('Invalid SMTP TLS configuration');
  const transport=nodemailer.createTransport({host:env.SMTP_HOST,port,secure,requireTLS:true,
    ...(env.SMTP_USER?{auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD}}:{}),
    tls:{minVersion:'TLSv1.2',rejectUnauthorized:true}, connectionTimeout:10000, greetingTimeout:10000, socketTimeout:15000, logger:false, debug:false});
  return async ({to,subject,text})=>{
    try {
      const result=await transport.sendMail({from:env.SMTP_FROM,to,subject,text});
      if (!result.accepted?.length || result.rejected?.length) throw new Error('Mail unavailable');
    } catch { throw new Error('Mail unavailable'); }
  };
}
