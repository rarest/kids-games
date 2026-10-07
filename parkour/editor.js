const KEY='glow-parkour-level-v1';
const themes=new Set(['sakura','flowers','city','cabin']);
const ranges={x:[-100000,100000],z:[-100000,100000],y:[-2,30],w:[1,20],d:[1,20],h:[.2,10]};

export function createEditorLevel() {
  return {
    id:'custom',name:'我的微光路线',theme:'sakura',difficulty:1,custom:true,tutorial:false,
    platforms:[{id:'p0',x:0,z:0,y:0,w:4,d:4,h:.6},{id:'p1',x:5,z:0,y:.3,w:3,d:3,h:.6}],
    spawn:{x:0,y:0,z:0},goal:{x:5,y:.3,z:0},coins:[],checkpoints:[],powerups:[],
  };
}

export function validateLevel(raw) {
  const errors=[],ids=new Set();
  if (!raw || typeof raw!=='object' || Array.isArray(raw)) return {ok:false,errors:['关卡数据必须是对象'],level:null};
  const text=(value,fallback)=>typeof value==='string' && value.trim()?value.slice(0,80):fallback;
  const readPoint=(value,label,fields,withId=false)=>{
    const result={};
    if (!value || typeof value!=='object' || Array.isArray(value)) {errors.push(`${label}数据不完整`);return result;}
    if (withId) {
      if (typeof value.id!=='string' || !value.id.trim() || value.id.length>80 || ids.has(value.id)) errors.push(`${label}需要唯一ID`);
      else {result.id=value.id;ids.add(value.id);}
    }
    for (const field of fields) {
      const [min,max]=ranges[field],number=value[field];
      if (!Number.isFinite(number) || number<min || number>max) errors.push(`${label}.${field}超出范围`);
      else result[field]=number;
    }
    return result;
  };
  const readList=(list,label,fields)=>{
    if (!Array.isArray(list)) {errors.push(`${label}格式错误`);return [];}
    return list.map((value,i)=>readPoint(value,`${label}${i+1}`,fields,true));
  };
  const platforms=readList(raw.platforms,'平台',['x','z','y','w','d','h']);
  if (!platforms.length) errors.push('至少需要一个平台');
  const spawn=readPoint(raw.spawn,'起点',['x','y','z']);
  const goal=readPoint(raw.goal,'终点',['x','y','z']);
  const coins=readList(raw.coins??[],'金币',['x','y','z']);
  const checkpoints=readList(raw.checkpoints??[],'存档点',['x','y','z']);
  const powerups=readList(raw.powerups??[],'道具',['x','y','z']);
  powerups.forEach((point,i)=>{
    const type=raw.powerups[i]?.type;
    if (type!=='speed' && type!=='jump') errors.push('请选择有效道具类型');
    else point.type=type;
  });
  if (!themes.has(raw.theme)) errors.push('请选择有效主题');
  if (raw.difficulty!==undefined && (!Number.isInteger(raw.difficulty) || raw.difficulty<1 || raw.difficulty>12)) errors.push('难度需要是1到12之间的整数');
  const support=(point,allowRaised=false)=>platforms.some(p=>
    Math.abs(point.x-p.x)<=p.w/2 && Math.abs(point.z-p.z)<=p.d/2 &&
    (allowRaised?point.y>=p.y && point.y<=p.y+2.25:Math.abs(point.y-p.y)<1e-7));
  if (!errors.length) {
    if (!support(spawn)) errors.push('起点需要同高度的平台支撑');
    if (!support(goal)) errors.push('终点需要同高度的平台支撑');
    for (const point of checkpoints) if (!support(point)) errors.push('存档点需要同高度的平台支撑');
    for (const point of coins) if (!support(point,true)) errors.push('金币需要位于平台上方');
    for (const point of powerups) if (!support(point,true)) errors.push('道具需要位于平台上方');
  }
  if (errors.length) return {ok:false,errors,level:null};
  return {ok:true,errors:[],level:{
    id:text(raw.id,'custom'),name:text(raw.name,'我的微光路线'),theme:raw.theme,
    difficulty:Number.isInteger(raw.difficulty) && raw.difficulty>=1 && raw.difficulty<=12?raw.difficulty:1,
    platforms,spawn,goal,coins,checkpoints,powerups,custom:true,tutorial:false,
  }};
}

export function readEditorLevel(storage) {
  try {return validateLevel(JSON.parse(storage.getItem(KEY))).level;} catch {return null;}
}

export function writeEditorLevel(storage,level) {
  try {
    const result=validateLevel(level);
    if (!result.ok) return false;
    storage.setItem(KEY,JSON.stringify(result.level));return true;
  } catch {return false;}
}
