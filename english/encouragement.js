// Praise attempts without changing recorded correctness or awarding extra points.
export function createEncouragement(){
 let streak=0;const attempts=new Map(),completed=new Set();
 const result=(text='',audio='')=>({streak,text,audio});
 return {
  answer(key,correct,firstTry=true){
   const previous=attempts.get(key);
   if(previous?.correct)return result();
   if(!correct){streak=0;attempts.set(key,{correct:false});return result('再听一遍，你可以再试试。')}
   attempts.set(key,{correct:true});
   if(previous||!firstTry){streak=0;return result('你做到了，真棒！','recovered')}
   streak++;
   if(streak===3)return result('连对三题，真棒！','three');
   if(streak===5)return result('连对五题，继续加油！','five');
   return result('答对了，继续试试！');
  },
  complete(key){if(completed.has(key))return result();completed.add(key);return result('这一轮完成啦！休息一下吧。','done')},
  reset(){streak=0;attempts.clear();completed.clear()}
 }
}
