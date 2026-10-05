const normalize=value=>String(value).trim().replace(/[.,!?]/g,'').replace(/\s+/g,' ').toLowerCase();
const answerMatches=(q,a)=>[q.answer,...(q.acceptedAnswers||[])].some(v=>normalize(v)===normalize(a));
function random(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
module.exports={answerMatches,random};
