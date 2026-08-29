export function diagnosticsAllowed({hostname='',search=''}){
  return ['localhost','127.0.0.1','[::1]','::1'].includes(hostname.toLowerCase())||new URLSearchParams(search).get('diagnostics')==='1';
}
