// Pure mathematics models. No evaluation of JavaScript or DOM-dependent geometry.
const integer = (n, name, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new RangeError(`${name}超出可用整数范围`);
};
export function evaluateExpression(input) {
  if (typeof input !== 'string') throw new TypeError('算式必须是文字');
  const source = input.replace(/\s/g, '').replace(/[×xX]/g, '*').replace(/÷/g, '/').replace(/[－−]/g, '-').replace(/[（]/g, '(').replace(/[）]/g, ')');
  if (!source || source.length > 300 || /[^0-9+*/()\-]/.test(source)) throw new TypeError('请使用整数、四则运算和小括号');
  const tokens = source.match(/\d+|[+*/()\-]/g);let at = 0;
  const primary = () => {
    const token = tokens[at++];
    if (token === '(') {const result = sum();if (tokens[at++] !== ')') throw new TypeError('小括号不完整');return result;}
    if (!token || !/^\d+$/.test(token)) throw new TypeError('算式缺少数字');
    const n = Number(token);integer(n, '数字');return n;
  };
  const product = () => {
    let result = primary();
    while (tokens[at] === '*' || tokens[at] === '/') {const op = tokens[at++], right = primary();if (op === '/' && right === 0) throw new RangeError('不能除以0');result = op === '*' ? result * right : result / right;}
    return result;
  };
  const sum = () => {let result = product();while (tokens[at] === '+' || tokens[at] === '-') {const op = tokens[at++], right = product();result = op === '+' ? result + right : result - right;}return result;};
  const result = sum();if (at !== tokens.length) throw new TypeError('数字之间缺少运算符');
  if (!Number.isFinite(result) || Math.abs(result) > Number.MAX_SAFE_INTEGER) throw new RangeError('计算结果超出范围');
  return result;
}
export function multiplicationTrace(a, b) {
  integer(a, '被乘数', 0, 9999);integer(b, '一位数乘数', 0, 9);
  const digits = String(a).split('').reverse().map(Number), steps = [];let carry = 0;
  for (let i = 0; i < digits.length; i++) {const digit = digits[i], carryIn = carry, product = digit * b + carryIn;carry = Math.floor(product / 10);steps.push({digit, carryIn, product, write:product % 10, carryOut:carry, place:10 ** i});}
  return {result:a*b, steps, finalCarry:carry};
}
const LENGTH_MM = {mm:1, cm:10, dm:100, m:1000, km:1000000};
export function convertLength(value, from, to) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('长度应是非负数');
  if (!Object.hasOwn(LENGTH_MM, from) || !Object.hasOwn(LENGTH_MM, to)) throw new TypeError('未知长度单位');
  return value * LENGTH_MM[from] / LENGTH_MM[to];
}
export function classifyAngle(degrees) {
  if (!Number.isFinite(degrees) || degrees < 0 || degrees > 360) throw new RangeError('角度应在0到360之间');
  if (degrees === 0) return '零角';if (degrees < 90) return '锐角';if (degrees === 90) return '直角';if (degrees < 180) return '钝角';if (degrees === 180) return '平角';if (degrees < 360) return '优角';return '周角';
}
export function fractionParts(numerator, denominator) {
  integer(denominator, '分母', 1, 100);integer(numerator, '分子', 0, denominator);
  return {numerator, denominator, value:numerator/denominator, parts:Array.from({length:denominator}, (_, i) => i < numerator)};
}
export function groupShare(total, numerator, denominator) {
  integer(total, '总数');fractionParts(numerator, denominator);
  if (total % denominator !== 0) throw new RangeError('这些物体不能按要求平均分组');
  return {groups:denominator, perGroup:total/denominator, selectedGroups:numerator, selected:total/denominator*numerator, total};
}
export function projectBlocks(blocks, direction) {
  const directions = {front:[0,2], right:[1,2], top:[0,1]};if (!Object.hasOwn(directions,direction)) throw new TypeError('未知观察方向');const axes=directions[direction];
  if (!Array.isArray(blocks)) throw new TypeError('方块应是坐标数组');
  const unique = new Map();
  for (const b of blocks) {if (!Array.isArray(b) || b.length !== 3) throw new TypeError('方块需要三个坐标');b.forEach(n => integer(n, '坐标', 0, 100));const pair = [b[axes[0]], b[axes[1]]];unique.set(pair.join(','), pair);}
  return [...unique.values()].sort((a,b) => a[1]-b[1] || a[0]-b[0]);
}
export function expressionTrace(input) {
  evaluateExpression(input); // Validate the whole expression before producing teaching steps.
  let tokens = input.replace(/\s/g,'').replace(/[×xX]/g,'*').replace(/÷/g,'/').replace(/[－−]/g,'-').replace(/（/g,'(').replace(/）/g,')').match(/\d+|[+*/()\-]/g).map(t=>/^\d+$/.test(t)?Number(t):t);
  const display = t => t.join('').replace(/\*/g,'×').replace(/\//g,'÷').replace(/-/g,'−');
  const removeSingleBrackets = () => {
    let changed = true;while(changed){changed=false;for(let i=0;i<tokens.length-2;i++)if(tokens[i]==='('&&typeof tokens[i+1]==='number'&&tokens[i+2]===')'){tokens.splice(i,3,tokens[i+1]);changed=true;break;}}
  };
  const steps=[];
  while(tokens.length>1){
    const before = display(tokens);let lo=0,hi=tokens.length;
    const close=tokens.indexOf(')');if(close>=0){hi=close;lo=tokens.slice(0,close).lastIndexOf('(')+1;}
    let opIndex=-1;
    for(let i=lo;i<hi;i++)if(tokens[i]==='*'||tokens[i]==='/'){opIndex=i;break;}
    if(opIndex<0)for(let i=lo;i<hi;i++)if(tokens[i]==='+'||tokens[i]==='-'){opIndex=i;break;}
    if(opIndex<0){removeSingleBrackets();continue;}
    const left=tokens[opIndex-1],op=tokens[opIndex],right=tokens[opIndex+1];
    const result=op==='*'?left*right:op==='/'?left/right:op==='+'?left+right:left-right;
    const operation=display([left,op,right]);tokens.splice(opIndex-1,3,result);removeSingleBrackets();steps.push({before,operation,result,after:display(tokens)});
  }
  return steps;
}
