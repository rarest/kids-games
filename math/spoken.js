// Spoken notation only. Displayed textbook expressions keep their original form.
export function spokenText(text){return String(text)
 .replace(/(\d+)\s*\/\s*(\d+)/g,(_,n,d)=>`${d}分之${n}`)
 .replace(/(\d+)[—–](\d+)/g,'$1到$2')
 .replace(/[+＋]/g,'加').replace(/[−﹣－-]/g,'减')
 .replace(/[×✕]/g,'乘以').replace(/÷/g,'除以')
 .replace(/[=＝]/g,'等于').replace(/[<＜]/g,'小于').replace(/[>＞]/g,'大于')
 .replace(/°/g,'度').replace(/[(（]/g,'左括号').replace(/[)）]/g,'右括号');}
