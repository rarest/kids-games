var cd=["sakura","flowers","city","cabin"],hd=[["\u521D\u89C1\u6A31\u5149","\u6A31\u95F4\u8F6C\u5F2F","\u82B1\u74E3\u9AD8\u53F0"],["\u82B1\u5F84\u6F2B\u6B65","\u7E41\u82B1\u56DE\u5ECA","\u82B1\u6D77\u8DC3\u8FC1"],["\u5929\u6865\u98CE\u666F","\u5C4B\u9876\u8F6C\u89D2","\u57CE\u5E02\u4E4B\u5DC5"],["\u6797\u95F4\u6728\u9636","\u6811\u68A2\u5C0F\u5C4B","\u5FAE\u5149\u8FDC\u884C"]];function ud(i){let e=cd[Math.floor(i/3)],t=6+Math.floor(i/2)*2,n=4.8-Math.floor((i+1)/2)*.35,s=.8+i*.11,r=[],a=0,o=0;for(let c=0;c<t;c++){c&&(c%4<2?a+=n+s:o+=n+s);let u=(c%4===1?1:c%4===2?2:c%4===3?1:0)*(.22+i*.012);r.push({id:`p${c}`,x:a,z:o,y:u,w:n,d:n,h:.65})}let l=c=>({x:c.x,y:c.y,z:c.z});return{id:`${e}-${i%3+1}`,name:hd[Math.floor(i/3)][i%3],theme:e,difficulty:i+1,platforms:r,spawn:l(r[0]),goal:l(r.at(-1)),coins:r.slice(1,-1).map((c,u)=>({id:`coin${u}`,x:c.x,y:c.y+.35,z:c.z})),checkpoints:[{id:"checkpoint",...l(r[Math.floor(t/2)])}],tutorial:i===0}}var Nn=Array.from({length:12},(i,e)=>ud(e));var Ic=new WeakMap,Cc={speed:1.6,jump:1.5};function Pc(i,e){let t=Math.max(0,Math.abs(i.x-e.x)-e.w/2),n=Math.max(0,Math.abs(i.z-e.z)-e.d/2);return t*t+n*n<.25*.25-1e-7}function Lc(i,e){return e.some(t=>Math.abs(i.y-t.y)<1e-7&&Pc(i,t))}function No(i){let e={...i.spawn,vx:0,vy:0,vz:0,yaw:0,grounded:!1};e.grounded=Lc(e,i.platforms);let t={level:i,player:e,checkpoint:{...i.spawn},collected:new Set,receipts:new Set,events:[],elapsed:0,complete:!1,falls:0,effects:{speed:null,jump:null},powerupsCollected:new Set,tutorial:{moved:!1,jumped:!1,camera:!1,collected:!1,checkpoint:!1,finished:!1}},n=-8;for(let s of i.platforms)n=Math.min(n,s.y-8);return Ic.set(t,{held:!1,buffer:0,coyote:e.grounded?.12:0,fallHeight:n}),t}function Rc(i,e,t,n){if(!n)return;let s=t==="x"?"z":"x",r=t==="x"?"w":"d",a=t==="x"?"d":"w",o=i[t],l=o+n;for(let c of e){if(i.y>=c.y-1e-7||i.y+1.65<=c.y-c.h+1e-7)continue;let u=Math.max(0,Math.abs(i[s]-c[s])-c[a]/2);if(u>=.25)continue;let m=Math.sqrt(.25*.25-u*u),h=c[t]-c[r]/2-m,f=c[t]+c[r]/2+m;n>0&&o<=h+1e-7&&l>h&&(l=Math.min(l,h)),n<0&&o>=f-1e-7&&l<f&&(l=Math.max(l,f))}i[t]=l,Math.abs(l-o-n)>1e-7&&(i[t==="x"?"vx":"vz"]=0)}function dd(i,e){let t=i.player,n=t.y;t.vy-=20*e;let s=n+t.vy*e,r=!1;for(let a of i.level.platforms)if(Pc(t,a)){if(t.vy<=0&&n>=a.y-1e-7&&s<=a.y)s=Math.max(s,a.y),r=!0;else if(t.vy>0){let o=a.y-a.h-1.65;n<=o+1e-7&&s>=o&&(s=Math.min(s,o))}}r?(t.grounded||i.events.push({type:"land"}),t.vy=0):t.vy>0&&s<n+t.vy*e-1e-7&&(t.vy=0),t.y=s,t.grounded=r}function fd(i){let e=i.player;for(let n of i.level.coins??[])!i.collected.has(n.id)&&Math.hypot(e.x-n.x,e.y-n.y,e.z-n.z)<=.6&&(i.collected.add(n.id),i.events.push({type:"coin",id:n.id}),i.tutorial.collected=!0);for(let n of i.level.powerups??[])Cc[n.type]&&!i.powerupsCollected.has(n.id)&&Math.hypot(e.x-n.x,e.y-n.y,e.z-n.z)<=.6&&(i.powerupsCollected.add(n.id),i.effects[n.type]={multiplier:Cc[n.type],expiresAt:i.elapsed+8},i.events.push({type:"powerup",id:n.id,powerupType:n.type}));if(!e.grounded)return;let t=n=>Math.abs(e.y-n.y)<.08&&Math.hypot(e.x-n.x,e.z-n.z)<=.6;for(let n of i.level.checkpoints??[])i.checkpoint.id!==n.id&&t(n)&&(i.checkpoint={...n},i.events.push({type:"checkpoint",id:n.id}),i.tutorial.checkpoint=!0);t(i.level.goal)&&(i.complete=!0,i.events.push({type:"finish"}),i.tutorial.finished=!0)}function Dc(i,e={},t=0){if(i.events=[],i.complete||!Number.isFinite(t)||t<=0)return i;let n=Ic.get(i),s=!!e.jump;s&&!n.held&&(n.buffer=.12),n.held=s;let r=Number.isFinite(e.x)?e.x:0,a=Number.isFinite(e.z)?e.z:0,o=Math.hypot(r,a);o>1&&(r/=o,a/=o);let l=Math.min(t,.25),c=Math.ceil(l/(1/120)),u=l/c;for(let m=0;m<c&&!i.complete;m++){let h=i.player;h.grounded=h.vy<=0&&Lc(h,i.level.platforms),n.coyote=h.grounded?.12:Math.max(0,n.coyote-u),n.buffer>0&&n.coyote>0&&(h.vy=8.4*(i.effects.jump?.multiplier??1),h.grounded=!1,n.buffer=0,n.coyote=0,i.events.push({type:"jump"}),i.tutorial.jumped=!0),n.buffer=Math.max(0,n.buffer-u);let f=h.x,x=h.z,v=6*(i.effects.speed?.multiplier??1);h.vx=r*v,h.vz=a*v,(r||a)&&(h.yaw=Math.atan2(r,a)),Rc(h,i.level.platforms,"x",h.vx*u),Rc(h,i.level.platforms,"z",h.vz*u),Math.hypot(h.x-f,h.z-x)>1e-7&&(i.tutorial.moved=!0),dd(i,u),i.elapsed+=u;for(let p of["speed","jump"])i.effects[p]&&i.elapsed>=i.effects[p].expiresAt-1e-7&&(i.effects[p]=null);h.y<n.fallHeight&&(Object.assign(h,i.checkpoint,{vx:0,vy:0,vz:0,grounded:!0}),delete h.id,i.falls++,i.events.push({type:"fall"}),n.buffer=0,n.coyote=.12,i.effects.speed=null,i.effects.jump=null),fd(i)}return i}var pd=new Set(["sakura","flowers","city","cabin"]),md={x:[-1e5,1e5],z:[-1e5,1e5],y:[-2,30],w:[1,20],d:[1,20],h:[.2,10]};function Uo(){return{id:"custom",name:"\u6211\u7684\u5FAE\u5149\u8DEF\u7EBF",theme:"sakura",difficulty:1,custom:!0,tutorial:!1,platforms:[{id:"p0",x:0,z:0,y:0,w:4,d:4,h:.6},{id:"p1",x:5,z:0,y:.3,w:3,d:3,h:.6}],spawn:{x:0,y:0,z:0},goal:{x:5,y:.3,z:0},coins:[],checkpoints:[],powerups:[]}}function Yn(i){let e=[],t=new Set;if(!i||typeof i!="object"||Array.isArray(i))return{ok:!1,errors:["\u5173\u5361\u6570\u636E\u5FC5\u987B\u662F\u5BF9\u8C61"],level:null};let n=(f,x)=>typeof f=="string"&&f.trim()?f.slice(0,80):x,s=(f,x,v,p=!1)=>{let d={};if(!f||typeof f!="object"||Array.isArray(f))return e.push(`${x}\u6570\u636E\u4E0D\u5B8C\u6574`),d;p&&(typeof f.id!="string"||!f.id.trim()||f.id.length>80||t.has(f.id)?e.push(`${x}\u9700\u8981\u552F\u4E00ID`):(d.id=f.id,t.add(f.id)));for(let T of v){let[A,M]=md[T],_=f[T];!Number.isFinite(_)||_<A||_>M?e.push(`${x}.${T}\u8D85\u51FA\u8303\u56F4`):d[T]=_}return d},r=(f,x,v)=>Array.isArray(f)?f.map((p,d)=>s(p,`${x}${d+1}`,v,!0)):(e.push(`${x}\u683C\u5F0F\u9519\u8BEF`),[]),a=r(i.platforms,"\u5E73\u53F0",["x","z","y","w","d","h"]);a.length||e.push("\u81F3\u5C11\u9700\u8981\u4E00\u4E2A\u5E73\u53F0");let o=s(i.spawn,"\u8D77\u70B9",["x","y","z"]),l=s(i.goal,"\u7EC8\u70B9",["x","y","z"]),c=r(i.coins??[],"\u91D1\u5E01",["x","y","z"]),u=r(i.checkpoints??[],"\u5B58\u6863\u70B9",["x","y","z"]),m=r(i.powerups??[],"\u9053\u5177",["x","y","z"]);m.forEach((f,x)=>{let v=i.powerups[x]?.type;v!=="speed"&&v!=="jump"?e.push("\u8BF7\u9009\u62E9\u6709\u6548\u9053\u5177\u7C7B\u578B"):f.type=v}),pd.has(i.theme)||e.push("\u8BF7\u9009\u62E9\u6709\u6548\u4E3B\u9898"),i.difficulty!==void 0&&(!Number.isInteger(i.difficulty)||i.difficulty<1||i.difficulty>12)&&e.push("\u96BE\u5EA6\u9700\u8981\u662F1\u523012\u4E4B\u95F4\u7684\u6574\u6570");let h=(f,x=!1)=>a.some(v=>Math.abs(f.x-v.x)<=v.w/2&&Math.abs(f.z-v.z)<=v.d/2&&(x?f.y>=v.y&&f.y<=v.y+2.25:Math.abs(f.y-v.y)<1e-7));if(!e.length){h(o)||e.push("\u8D77\u70B9\u9700\u8981\u540C\u9AD8\u5EA6\u7684\u5E73\u53F0\u652F\u6491"),h(l)||e.push("\u7EC8\u70B9\u9700\u8981\u540C\u9AD8\u5EA6\u7684\u5E73\u53F0\u652F\u6491");for(let f of u)h(f)||e.push("\u5B58\u6863\u70B9\u9700\u8981\u540C\u9AD8\u5EA6\u7684\u5E73\u53F0\u652F\u6491");for(let f of c)h(f,!0)||e.push("\u91D1\u5E01\u9700\u8981\u4F4D\u4E8E\u5E73\u53F0\u4E0A\u65B9");for(let f of m)h(f,!0)||e.push("\u9053\u5177\u9700\u8981\u4F4D\u4E8E\u5E73\u53F0\u4E0A\u65B9")}return e.length?{ok:!1,errors:e,level:null}:{ok:!0,errors:[],level:{id:n(i.id,"custom"),name:n(i.name,"\u6211\u7684\u5FAE\u5149\u8DEF\u7EBF"),theme:i.theme,difficulty:Number.isInteger(i.difficulty)&&i.difficulty>=1&&i.difficulty<=12?i.difficulty:1,platforms:a,spawn:o,goal:l,coins:c,checkpoints:u,powerups:m,custom:!0,tutorial:!1}}}var Uc="glow-parkour-v1",fs=[["red","\u7EA2\u8272","#ef4444"],["orange","\u6A59\u8272","#f97316"],["yellow","\u9EC4\u8272","#facc15"],["green","\u7EFF\u8272","#22c55e"],["cyan","\u9752\u8272","#06b6d4"],["blue","\u84DD\u8272","#3b82f6"],["purple","\u7D2B\u8272","#a855f7"],["black","\u9ED1\u8272","#20232a"],["pink","\u7C89\u8272","#f472b6"],["brown","\u68D5\u8272","#a16207"],["navy","\u6DF1\u84DD","#1e3a8a"],["forest","\u6DF1\u7EFF","#166534"],["rainbow","\u5F69\u8679","rainbow"]].map(([i,e,t])=>({id:i,name:e,color:t,price:i==="red"?0:2})),Fc=new Set(fs.map(i=>i.id)),Oo=new Set(Nn.map(i=>i.id)),Oc=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,Nc=Symbol("custom finish"),Bc=(i,e)=>e===!0&&i.level.custom===!0&&Oc.test(i.level.id)&&Yn(i.level).ok;function Fo(i){i=i&&typeof i=="object"&&!Array.isArray(i)?i:{};let e=Number.isSafeInteger(i.coins)&&i.coins>=0?i.coins:0,t=[...new Set(["red",...(Array.isArray(i.owned)?i.owned:[]).filter(r=>Fc.has(r))])],n=t.includes(i.equipped)?i.equipped:"red",s={};if(i.progress&&typeof i.progress=="object")for(let[r,a]of Object.entries(i.progress))(Oo.has(r)||Oc.test(r))&&a?.completed===!0&&Number.isFinite(a.bestTime)&&a.bestTime>=0&&(s[r]={completed:!0,bestTime:a.bestTime});return{coins:e,owned:t,equipped:n,progress:s}}function zc(i,e){let t=fs.find(n=>n.id===e);return!t||i.owned.includes(e)||i.coins<t.price?!1:(i.coins-=t.price,i.owned.push(e),!0)}function kc(i,e){return!Fc.has(e)||!i.owned.includes(e)?!1:(i.equipped=e,!0)}function Vc(i,e,t){return e.level.custom||!Oo.has(e.level.id)||!e.level.coins.some(n=>n.id===t)||!e.collected.has(t)||e.receipts.has(t)?!1:(e.receipts.add(t),i.coins+=1,!0)}function Gc(i,e,{saved:t=!1}={}){if(!e.complete||!Bc(e,t)||e.receipts.has(Nc))return 0;let n=e.level.coins.filter(s=>e.collected.has(s.id)).length;return!Number.isSafeInteger(i.coins)||i.coins<0||!Number.isSafeInteger(i.coins+n)?0:(e.receipts.add(Nc),i.coins+=n,n)}function Hc(i,e,{saved:t=!1}={}){let n=e.level.custom?Bc(e,t):Oo.has(e.level.id);if(!e.complete||!n||!Number.isFinite(e.elapsed)||e.elapsed<0)return!1;let s=i.progress[e.level.id]?.bestTime??1/0;return i.progress[e.level.id]={completed:!0,bestTime:Math.min(s,e.elapsed)},!0}function Wc(i){try{return Fo(JSON.parse(i.getItem(Uc)))}catch{return Fo()}}function Xc(i,e){try{return i.setItem(Uc,JSON.stringify(Fo(e))),!0}catch{return!1}}var qc="glow-parkour-wardrobe-v1",ps=[["academy","\u9752\u85E4\u5B66\u56ED","#e9eddf","#324653","#424f56","#8daf88","checks"],["sailor","\u6674\u6D77\u6C34\u624B","#f4efe4","#304765","#be714c","#507a9b","striped"],["gardener","\u82B1\u623F\u56ED\u4E01","#eed3a4","#657d58","#805f48","#ed9c94","pocket"],["sprinter","\u73CA\u745A\u8FD0\u52A8","#df7774","#48566d","#efe9d7","#f5c96c","trim"],["explorer","\u68EE\u6797\u63A2\u9669","#bbaa7d","#526b60","#745941","#e3ce99","pocket"],["cloud","\u4E91\u6735\u4F11\u95F2","#e7e9ed","#86a4b5","#e9d9c1","#a1bccb","solid"],["lavender","\u85B0\u8863\u8349\u5348\u540E","#b7a5cf","#e4dacf","#787087","#ece3f3","checks"],["sunflower","\u5411\u9633\u82B1\u7530","#e8c25b","#73866c","#b17d57","#f2e4b6","pocket"],["moon","\u6708\u5149\u6F2B\u6B65","#4d607d","#343c58","#9daabf","#e3d29d","trim"],["peach","\u871C\u6843\u91CE\u9910","#e7a5a0","#b89b83","#f1dfc5","#8baa95","checks"],["mariner","\u6DF1\u6D77\u9886\u822A","#376976","#e4dbca","#525962","#d6b783","striped"],["cocoa","\u53EF\u53EF\u6696\u51AC","#a57e65","#594f49","#c5a085","#e6cba4","trim"],["mint","\u8584\u8377\u9A91\u884C","#8cbbad","#547789","#efe5d6","#ead189","trim"],["paper","\u7EB8\u98DE\u673A","#ebe7dc","#b39978","#715f53","#b95150","solid"],["retro","\u590D\u53E4\u7403\u573A","#ad6a4d","#e6d8ad","#688178","#eac071","striped"],["orchard","\u679C\u56ED\u5DE5\u4F5C\u670D","#adb274","#716e52","#785b43","#e9c481","pocket"],["rose","\u73AB\u7470\u65C5\u4EBA","#b4768c","#665976","#d9c4b7","#ead7a5","trim"],["river","\u6EAA\u8C37\u9732\u8425","#739baa","#9ba78d","#5e695e","#d7c78e","pocket"],["festival","\u82B1\u706B\u590F\u65E5","#d09f77","#52577c","#e8dac5","#eee8d5","checks"],["starlight","\u661F\u5149\u821E\u6B65","#716993","#b6abbf","#e4d5bb","#efc972","striped"]].map(([i,e,t,n,s,r,a])=>({id:i,name:e,price:2,top:t,pants:n,shoes:s,accent:r,pattern:a})),gd=new Set(ps.map(i=>i.id)),_d=new Set(["night","dawn","morning"]);function Bo(i){i=i&&typeof i=="object"?i:{};let e=[...new Set((Array.isArray(i.owned)?i.owned:[]).filter(t=>gd.has(t)))];return{owned:e,equipped:e.includes(i.equipped)?i.equipped:null,timeOfDay:_d.has(i.timeOfDay)?i.timeOfDay:"morning"}}function Yc(i,e,t){return!ps.find(s=>s.id===t)||e.owned.includes(t)||i.coins<2?!1:(i.coins-=2,e.owned.push(t),!0)}function zo(i,e){return e!==null&&!i.owned.includes(e)?!1:(i.equipped=e,!0)}function $c(i){try{return Bo(JSON.parse(i.getItem(qc)))}catch{return Bo()}}function Zc(i,e){try{return i.setItem(qc,JSON.stringify(Bo(e))),!0}catch{return!1}}var Th=0,xl=1,wh=2;var Ks=1,ba=2,is=3,Rn=0,Wt=1,Xt=2,In=0,ss=1,yl=2,vl=3,Ml=4,Ah=5;var Si=100,Ch=101,Rh=102,Ih=103,Ph=104,Lh=200,Dh=201,Nh=202,Uh=203,Sl=204,bl=205,Fh=206,Oh=207,Bh=208,zh=209,kh=210,Vh=211,Gh=212,Hh=213,Wh=214,zr=0,kr=1,Vr=2,qi=3,Gr=4,Hr=5,Wr=6,Xr=7,Ea=0,Xh=1,qh=2,gn=0,El=1,Tl=2,wl=3,js=4,Al=5,Cl=6,Rl=7;var Il=300,ai=301,bi=302,Ta=303,wa=304,Qs=306,qr=1e3,En=1001,Yr=1002,Ct=1003,Yh=1004;var er=1005;var It=1006,Aa=1007;var oi=1008;var $t=1009,Pl=1010,Ll=1011,rs=1012,Ca=1013,_n=1014,ln=1015,xn=1016,Ra=1017,Ia=1018,as=1020,Dl=35902,Nl=35899,Ul=1021,Fl=1022,cn=1023,Tn=1026,li=1027,Pa=1028,La=1029,ci=1030,Da=1031;var Na=1033,tr=33776,nr=33777,ir=33778,sr=33779,Ua=35840,Fa=35841,Oa=35842,Ba=35843,za=36196,ka=37492,Va=37496,Ga=37488,Ha=37489,rr=37490,Wa=37491,Xa=37808,qa=37809,Ya=37810,$a=37811,Za=37812,Ja=37813,Ka=37814,ja=37815,Qa=37816,eo=37817,to=37818,no=37819,io=37820,so=37821,ro=36492,ao=36494,oo=36495,lo=36283,co=36284,ar=36285,ho=36286;var Ts=2300,$r=2301,Or=2302,hl=2303,ul=2400,dl=2401,fl=2402;var $h=3200;var or=0,Zh=1,Hn="",Gt="srgb",ws="srgb-linear",As="linear",nt="srgb";var Br=7680;var Jh=519,Kh=512,jh=513,Qh=514,uo=515,eu=516,tu=517,fo=518,nu=519,iu=35044,po=35048;var Ol="300 es",mn=2e3,Yi=2001;function xd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function yd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Cs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function su(){let i=Cs("canvas");return i.style.display="block",i}var Jc={},$i=null;function Bl(...i){let e="THREE."+i.shift();$i?$i("log",e,...i):console.log(e,...i)}function ru(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Fe(...i){i=ru(i);let e="THREE."+i.shift();if($i)$i("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Oe(...i){i=ru(i);let e="THREE."+i.shift();if($i)$i("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function xi(...i){let e=i.join(" ");e in Jc||(Jc[e]=!0,Fe(...i))}function au(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var ou={[zr]:kr,[Vr]:Wr,[Gr]:Xr,[qi]:Hr,[kr]:zr,[Wr]:Vr,[Xr]:Gr,[Hr]:qi},wn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Nt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Kc=1234567,Ms=Math.PI/180,Zi=180/Math.PI;function os(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Nt[i&255]+Nt[i>>8&255]+Nt[i>>16&255]+Nt[i>>24&255]+"-"+Nt[e&255]+Nt[e>>8&255]+"-"+Nt[e>>16&15|64]+Nt[e>>24&255]+"-"+Nt[t&63|128]+Nt[t>>8&255]+"-"+Nt[t>>16&255]+Nt[t>>24&255]+Nt[n&255]+Nt[n>>8&255]+Nt[n>>16&255]+Nt[n>>24&255]).toLowerCase()}function Xe(i,e,t){return Math.max(e,Math.min(t,i))}function zl(i,e){return(i%e+e)%e}function vd(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Md(i,e,t){return i!==e?(t-i)/(e-i):0}function Ss(i,e,t){return(1-t)*i+t*e}function Sd(i,e,t,n){return Ss(i,e,1-Math.exp(-t*n))}function bd(i,e=1){return e-Math.abs(zl(i,e*2)-e)}function Ed(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Td(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function wd(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Ad(i,e){return i+Math.random()*(e-i)}function Cd(i){return i*(.5-Math.random())}function Rd(i){i!==void 0&&(Kc=i);let e=Kc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Id(i){return i*Ms}function Pd(i){return i*Zi}function Ld(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Dd(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Nd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Ud(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),m=r((e-n)/2),h=a((e-n)/2),f=r((n-e)/2),x=a((n-e)/2);switch(s){case"XYX":i.set(o*u,l*m,l*h,o*c);break;case"YZY":i.set(l*h,o*u,l*m,o*c);break;case"ZXZ":i.set(l*m,l*h,o*u,o*c);break;case"XZX":i.set(o*u,l*x,l*f,o*c);break;case"YXY":i.set(l*f,o*u,l*x,o*c);break;case"ZYZ":i.set(l*x,l*f,o*u,o*c);break;default:Fe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Wi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Vt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var kl={DEG2RAD:Ms,RAD2DEG:Zi,generateUUID:os,clamp:Xe,euclideanModulo:zl,mapLinear:vd,inverseLerp:Md,lerp:Ss,damp:Sd,pingpong:bd,smoothstep:Ed,smootherstep:Td,randInt:wd,randFloat:Ad,randFloatSpread:Cd,seededRandom:Rd,degToRad:Id,radToDeg:Pd,isPowerOfTwo:Ld,ceilPowerOfTwo:Dd,floorPowerOfTwo:Nd,setQuaternionFromProperEuler:Ud,normalize:Vt,denormalize:Wi},Re=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},nn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],m=n[s+3],h=r[a+0],f=r[a+1],x=r[a+2],v=r[a+3];if(m!==v||l!==h||c!==f||u!==x){let p=l*h+c*f+u*x+m*v;p<0&&(h=-h,f=-f,x=-x,v=-v,p=-p);let d=1-o;if(p<.9995){let T=Math.acos(p),A=Math.sin(T);d=Math.sin(d*T)/A,o=Math.sin(o*T)/A,l=l*d+h*o,c=c*d+f*o,u=u*d+x*o,m=m*d+v*o}else{l=l*d+h*o,c=c*d+f*o,u=u*d+x*o,m=m*d+v*o;let T=1/Math.sqrt(l*l+c*c+u*u+m*m);l*=T,c*=T,u*=T,m*=T}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=m}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],m=r[a],h=r[a+1],f=r[a+2],x=r[a+3];return e[t]=o*x+u*m+l*f-c*h,e[t+1]=l*x+u*h+c*m-o*f,e[t+2]=c*x+u*f+o*h-l*m,e[t+3]=u*x-o*m-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),m=o(r/2),h=l(n/2),f=l(s/2),x=l(r/2);switch(a){case"XYZ":this._x=h*u*m+c*f*x,this._y=c*f*m-h*u*x,this._z=c*u*x+h*f*m,this._w=c*u*m-h*f*x;break;case"YXZ":this._x=h*u*m+c*f*x,this._y=c*f*m-h*u*x,this._z=c*u*x-h*f*m,this._w=c*u*m+h*f*x;break;case"ZXY":this._x=h*u*m-c*f*x,this._y=c*f*m+h*u*x,this._z=c*u*x+h*f*m,this._w=c*u*m-h*f*x;break;case"ZYX":this._x=h*u*m-c*f*x,this._y=c*f*m+h*u*x,this._z=c*u*x-h*f*m,this._w=c*u*m+h*f*x;break;case"YZX":this._x=h*u*m+c*f*x,this._y=c*f*m+h*u*x,this._z=c*u*x-h*f*m,this._w=c*u*m-h*f*x;break;case"XZY":this._x=h*u*m-c*f*x,this._y=c*f*m-h*u*x,this._z=c*u*x+h*f*m,this._w=c*u*m+h*f*x;break;default:Fe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],m=t[10],h=n+o+m;if(h>0){let f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>m){let f=2*Math.sqrt(1+n-o-m);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>m){let f=2*Math.sqrt(1+o-n-m);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+m-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(jc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(jc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),m=2*(r*n-a*t);return this.x=t+l*c+a*m-o*u,this.y=n+l*u+o*c-r*m,this.z=s+l*m+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ko.copy(this).projectOnVector(e),this.sub(ko)}reflect(e){return this.sub(ko.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ko=new U,jc=new nn,ke=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],m=n[7],h=n[2],f=n[5],x=n[8],v=s[0],p=s[3],d=s[6],T=s[1],A=s[4],M=s[7],_=s[2],S=s[5],w=s[8];return r[0]=a*v+o*T+l*_,r[3]=a*p+o*A+l*S,r[6]=a*d+o*M+l*w,r[1]=c*v+u*T+m*_,r[4]=c*p+u*A+m*S,r[7]=c*d+u*M+m*w,r[2]=h*v+f*T+x*_,r[5]=h*p+f*A+x*S,r[8]=h*d+f*M+x*w,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],m=u*a-o*c,h=o*l-u*r,f=c*r-a*l,x=t*m+n*h+s*f;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/x;return e[0]=m*v,e[1]=(s*c-u*n)*v,e[2]=(o*n-s*a)*v,e[3]=h*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=f*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return xi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Vo.makeScale(e,t)),this}rotate(e){return xi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Vo.makeRotation(-e)),this}translate(e,t){return xi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Vo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Vo=new ke,Qc=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),eh=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Fd(){let i={enabled:!0,workingColorSpace:ws,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===nt&&(s.r=kn(s.r),s.g=kn(s.g),s.b=kn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===nt&&(s.r=Xi(s.r),s.g=Xi(s.g),s.b=Xi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Hn?As:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return xi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return xi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ws]:{primaries:e,whitePoint:n,transfer:As,toXYZ:Qc,fromXYZ:eh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Gt},outputColorSpaceConfig:{drawingBufferColorSpace:Gt}},[Gt]:{primaries:e,whitePoint:n,transfer:nt,toXYZ:Qc,fromXYZ:eh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Gt}}}),i}var Je=Fd();function kn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Xi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ii,Zr=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ii===void 0&&(Ii=Cs("canvas")),Ii.width=e.width,Ii.height=e.height;let s=Ii.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Ii}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Cs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=kn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(kn(t[n]/255)*255):t[n]=kn(t[n]);return{data:t,width:e.width,height:e.height}}else return Fe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Od=0,Ji=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Od++}),this.uuid=os(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Go(s[a].image)):r.push(Go(s[a]))}else r=Go(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Go(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Zr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Fe("Texture: Unable to serialize Texture."),{})}var Bd=0,Ho=new U,qt=class i extends wn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=En,s=En,r=It,a=oi,o=cn,l=$t,c=i.DEFAULT_ANISOTROPY,u=Hn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Bd++}),this.uuid=os(),this.name="",this.source=new Ji(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Re(0,0),this.repeat=new Re(1,1),this.center=new Re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ho).x}get height(){return this.source.getSize(Ho).y}get depth(){return this.source.getSize(Ho).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Fe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Fe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Il)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case qr:e.x=e.x-Math.floor(e.x);break;case En:e.x=e.x<0?0:1;break;case Yr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case qr:e.y=e.y-Math.floor(e.y);break;case En:e.y=e.y<0?0:1;break;case Yr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};qt.DEFAULT_IMAGE=null;qt.DEFAULT_MAPPING=Il;qt.DEFAULT_ANISOTROPY=1;var dt=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],m=l[8],h=l[1],f=l[5],x=l[9],v=l[2],p=l[6],d=l[10];if(Math.abs(u-h)<.01&&Math.abs(m-v)<.01&&Math.abs(x-p)<.01){if(Math.abs(u+h)<.1&&Math.abs(m+v)<.1&&Math.abs(x+p)<.1&&Math.abs(c+f+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let A=(c+1)/2,M=(f+1)/2,_=(d+1)/2,S=(u+h)/4,w=(m+v)/4,g=(x+p)/4;return A>M&&A>_?A<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(A),s=S/n,r=w/n):M>_?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=S/s,r=g/s):_<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(_),n=w/r,s=g/r),this.set(n,s,r,t),this}let T=Math.sqrt((p-x)*(p-x)+(m-v)*(m-v)+(h-u)*(h-u));return Math.abs(T)<.001&&(T=1),this.x=(p-x)/T,this.y=(m-v)/T,this.z=(h-u)/T,this.w=Math.acos((c+f+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this.w=Xe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this.w=Xe(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Jr=class extends wn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:It,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new dt(0,0,e,t),this.scissorTest=!1,this.viewport=new dt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new qt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:It,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ji(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Yt=class extends Jr{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Rs=class extends qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=En,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Kr=class extends qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=En,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var rt=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,a,o,l,c,u,m,h,f,x,v,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,m,h,f,x,v,p)}set(e,t,n,s,r,a,o,l,c,u,m,h,f,x,v,p){let d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=u,d[10]=m,d[14]=h,d[3]=f,d[7]=x,d[11]=v,d[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Pi.setFromMatrixColumn(e,0).length(),r=1/Pi.setFromMatrixColumn(e,1).length(),a=1/Pi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),m=Math.sin(r);if(e.order==="XYZ"){let h=a*u,f=a*m,x=o*u,v=o*m;t[0]=l*u,t[4]=-l*m,t[8]=c,t[1]=f+x*c,t[5]=h-v*c,t[9]=-o*l,t[2]=v-h*c,t[6]=x+f*c,t[10]=a*l}else if(e.order==="YXZ"){let h=l*u,f=l*m,x=c*u,v=c*m;t[0]=h+v*o,t[4]=x*o-f,t[8]=a*c,t[1]=a*m,t[5]=a*u,t[9]=-o,t[2]=f*o-x,t[6]=v+h*o,t[10]=a*l}else if(e.order==="ZXY"){let h=l*u,f=l*m,x=c*u,v=c*m;t[0]=h-v*o,t[4]=-a*m,t[8]=x+f*o,t[1]=f+x*o,t[5]=a*u,t[9]=v-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let h=a*u,f=a*m,x=o*u,v=o*m;t[0]=l*u,t[4]=x*c-f,t[8]=h*c+v,t[1]=l*m,t[5]=v*c+h,t[9]=f*c-x,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let h=a*l,f=a*c,x=o*l,v=o*c;t[0]=l*u,t[4]=v-h*m,t[8]=x*m+f,t[1]=m,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=f*m+x,t[10]=h-v*m}else if(e.order==="XZY"){let h=a*l,f=a*c,x=o*l,v=o*c;t[0]=l*u,t[4]=-m,t[8]=c*u,t[1]=h*m+v,t[5]=a*u,t[9]=f*m-x,t[2]=x*m-f,t[6]=o*u,t[10]=v*m+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(zd,e,kd)}lookAt(e,t,n){let s=this.elements;return Zt.subVectors(e,t),Zt.lengthSq()===0&&(Zt.z=1),Zt.normalize(),$n.crossVectors(n,Zt),$n.lengthSq()===0&&(Math.abs(n.z)===1?Zt.x+=1e-4:Zt.z+=1e-4,Zt.normalize(),$n.crossVectors(n,Zt)),$n.normalize(),_r.crossVectors(Zt,$n),s[0]=$n.x,s[4]=_r.x,s[8]=Zt.x,s[1]=$n.y,s[5]=_r.y,s[9]=Zt.y,s[2]=$n.z,s[6]=_r.z,s[10]=Zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],m=n[5],h=n[9],f=n[13],x=n[2],v=n[6],p=n[10],d=n[14],T=n[3],A=n[7],M=n[11],_=n[15],S=s[0],w=s[4],g=s[8],E=s[12],C=s[1],L=s[5],D=s[9],k=s[13],P=s[2],H=s[6],$=s[10],Y=s[14],I=s[3],N=s[7],z=s[11],V=s[15];return r[0]=a*S+o*C+l*P+c*I,r[4]=a*w+o*L+l*H+c*N,r[8]=a*g+o*D+l*$+c*z,r[12]=a*E+o*k+l*Y+c*V,r[1]=u*S+m*C+h*P+f*I,r[5]=u*w+m*L+h*H+f*N,r[9]=u*g+m*D+h*$+f*z,r[13]=u*E+m*k+h*Y+f*V,r[2]=x*S+v*C+p*P+d*I,r[6]=x*w+v*L+p*H+d*N,r[10]=x*g+v*D+p*$+d*z,r[14]=x*E+v*k+p*Y+d*V,r[3]=T*S+A*C+M*P+_*I,r[7]=T*w+A*L+M*H+_*N,r[11]=T*g+A*D+M*$+_*z,r[15]=T*E+A*k+M*Y+_*V,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],m=e[6],h=e[10],f=e[14],x=e[3],v=e[7],p=e[11],d=e[15],T=l*f-c*h,A=o*f-c*m,M=o*h-l*m,_=a*f-c*u,S=a*h-l*u,w=a*m-o*u;return t*(v*T-p*A+d*M)-n*(x*T-p*_+d*S)+s*(x*A-v*_+d*w)-r*(x*M-v*S+p*w)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],m=e[9],h=e[10],f=e[11],x=e[12],v=e[13],p=e[14],d=e[15],T=t*o-n*a,A=t*l-s*a,M=t*c-r*a,_=n*l-s*o,S=n*c-r*o,w=s*c-r*l,g=u*v-m*x,E=u*p-h*x,C=u*d-f*x,L=m*p-h*v,D=m*d-f*v,k=h*d-f*p,P=T*k-A*D+M*L+_*C-S*E+w*g;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let H=1/P;return e[0]=(o*k-l*D+c*L)*H,e[1]=(s*D-n*k-r*L)*H,e[2]=(v*w-p*S+d*_)*H,e[3]=(h*S-m*w-f*_)*H,e[4]=(l*C-a*k-c*E)*H,e[5]=(t*k-s*C+r*E)*H,e[6]=(p*M-x*w-d*A)*H,e[7]=(u*w-h*M+f*A)*H,e[8]=(a*D-o*C+c*g)*H,e[9]=(n*C-t*D-r*g)*H,e[10]=(x*S-v*M+d*T)*H,e[11]=(m*M-u*S-f*T)*H,e[12]=(o*E-a*L-l*g)*H,e[13]=(t*L-n*E+s*g)*H,e[14]=(v*A-x*_-p*T)*H,e[15]=(u*_-m*A+h*T)*H,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,m=o+o,h=r*c,f=r*u,x=r*m,v=a*u,p=a*m,d=o*m,T=l*c,A=l*u,M=l*m,_=n.x,S=n.y,w=n.z;return s[0]=(1-(v+d))*_,s[1]=(f+M)*_,s[2]=(x-A)*_,s[3]=0,s[4]=(f-M)*S,s[5]=(1-(h+d))*S,s[6]=(p+T)*S,s[7]=0,s[8]=(x+A)*w,s[9]=(p-T)*w,s[10]=(1-(h+v))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Pi.set(s[0],s[1],s[2]).length(),o=Pi.set(s[4],s[5],s[6]).length(),l=Pi.set(s[8],s[9],s[10]).length();r<0&&(a=-a),un.copy(this);let c=1/a,u=1/o,m=1/l;return un.elements[0]*=c,un.elements[1]*=c,un.elements[2]*=c,un.elements[4]*=u,un.elements[5]*=u,un.elements[6]*=u,un.elements[8]*=m,un.elements[9]*=m,un.elements[10]*=m,t.setFromRotationMatrix(un),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=mn,l=!1){let c=this.elements,u=2*r/(t-e),m=2*r/(n-s),h=(t+e)/(t-e),f=(n+s)/(n-s),x,v;if(l)x=r/(a-r),v=a*r/(a-r);else if(o===mn)x=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Yi)x=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=m,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=x,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=mn,l=!1){let c=this.elements,u=2/(t-e),m=2/(n-s),h=-(t+e)/(t-e),f=-(n+s)/(n-s),x,v;if(l)x=1/(a-r),v=a/(a-r);else if(o===mn)x=-2/(a-r),v=-(a+r)/(a-r);else if(o===Yi)x=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=m,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=x,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Pi=new U,un=new rt,zd=new U(0,0,0),kd=new U(1,1,1),$n=new U,_r=new U,Zt=new U,th=new rt,nh=new nn,sn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],m=s[2],h=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Xe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-m,r),this._z=0);break;case"ZXY":this._x=Math.asin(Xe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-m,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Xe(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Xe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-m,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Xe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:Fe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return th.makeRotationFromQuaternion(e),this.setFromRotationMatrix(th,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return nh.setFromEuler(this),this.setFromQuaternion(nh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};sn.DEFAULT_ORDER="XYZ";var Ki=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Vd=0,ih=new U,Li=new nn,Un=new rt,xr=new U,ms=new U,Gd=new U,Hd=new nn,sh=new U(1,0,0),rh=new U(0,1,0),ah=new U(0,0,1),oh={type:"added"},Wd={type:"removed"},Di={type:"childadded",child:null},Wo={type:"childremoved",child:null},St=class i extends wn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Vd++}),this.uuid=os(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new U,t=new sn,n=new nn,s=new U(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new rt},normalMatrix:{value:new ke}}),this.matrix=new rt,this.matrixWorld=new rt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ki,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Li.setFromAxisAngle(e,t),this.quaternion.multiply(Li),this}rotateOnWorldAxis(e,t){return Li.setFromAxisAngle(e,t),this.quaternion.premultiply(Li),this}rotateX(e){return this.rotateOnAxis(sh,e)}rotateY(e){return this.rotateOnAxis(rh,e)}rotateZ(e){return this.rotateOnAxis(ah,e)}translateOnAxis(e,t){return ih.copy(e).applyQuaternion(this.quaternion),this.position.add(ih.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(sh,e)}translateY(e){return this.translateOnAxis(rh,e)}translateZ(e){return this.translateOnAxis(ah,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Un.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?xr.copy(e):xr.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ms.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Un.lookAt(ms,xr,this.up):Un.lookAt(xr,ms,this.up),this.quaternion.setFromRotationMatrix(Un),s&&(Un.extractRotation(s.matrixWorld),Li.setFromRotationMatrix(Un),this.quaternion.premultiply(Li.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Oe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(oh),Di.child=e,this.dispatchEvent(Di),Di.child=null):Oe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Wd),Wo.child=e,this.dispatchEvent(Wo),Wo.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Un.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Un.multiply(e.parent.matrixWorld)),e.applyMatrix4(Un),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(oh),Di.child=e,this.dispatchEvent(Di),Di.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ms,e,Gd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ms,Hd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let m=l[c];r(e.shapes,m)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),m=a(e.shapes),h=a(e.skeletons),f=a(e.animations),x=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),m.length>0&&(n.shapes=m),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),x.length>0&&(n.nodes=x)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};St.DEFAULT_UP=new U(0,1,0);St.DEFAULT_MATRIX_AUTO_UPDATE=!0;St.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ht=class extends St{constructor(){super(),this.isGroup=!0,this.type="Group"}},Xd={type:"move"},ji=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ht,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ht,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ht,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let v of e.hand.values()){let p=t.getJointPose(v,n),d=this._getHandJoint(c,v);p!==null&&(d.matrix.fromArray(p.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=p.radius),d.visible=p!==null}let u=c.joints["index-finger-tip"],m=c.joints["thumb-tip"],h=u.position.distanceTo(m.position),f=.02,x=.005;c.inputState.pinching&&h>f+x?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-x&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Xd)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ht;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},lu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Zn={h:0,s:0,l:0},yr={h:0,s:0,l:0};function Xo(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Be=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Gt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Je.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Je.workingColorSpace){return this.r=e,this.g=t,this.b=n,Je.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Je.workingColorSpace){if(e=zl(e,1),t=Xe(t,0,1),n=Xe(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Xo(a,r,e+1/3),this.g=Xo(a,r,e),this.b=Xo(a,r,e-1/3)}return Je.colorSpaceToWorking(this,s),this}setStyle(e,t=Gt){function n(r){r!==void 0&&parseFloat(r)<1&&Fe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Fe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Fe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Gt){let n=lu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Fe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=kn(e.r),this.g=kn(e.g),this.b=kn(e.b),this}copyLinearToSRGB(e){return this.r=Xi(e.r),this.g=Xi(e.g),this.b=Xi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Gt){return Je.workingToColorSpace(Ut.copy(this),e),Math.round(Xe(Ut.r*255,0,255))*65536+Math.round(Xe(Ut.g*255,0,255))*256+Math.round(Xe(Ut.b*255,0,255))}getHexString(e=Gt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Je.workingColorSpace){Je.workingToColorSpace(Ut.copy(this),t);let n=Ut.r,s=Ut.g,r=Ut.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let m=a-o;switch(c=u<=.5?m/(a+o):m/(2-a-o),a){case n:l=(s-r)/m+(s<r?6:0);break;case s:l=(r-n)/m+2;break;case r:l=(n-s)/m+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Je.workingColorSpace){return Je.workingToColorSpace(Ut.copy(this),t),e.r=Ut.r,e.g=Ut.g,e.b=Ut.b,e}getStyle(e=Gt){Je.workingToColorSpace(Ut.copy(this),e);let t=Ut.r,n=Ut.g,s=Ut.b;return e!==Gt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Zn),this.setHSL(Zn.h+e,Zn.s+t,Zn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Zn),e.getHSL(yr);let n=Ss(Zn.h,yr.h,t),s=Ss(Zn.s,yr.s,t),r=Ss(Zn.l,yr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ut=new Be;Be.NAMES=lu;var Is=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Be(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ps=class extends St{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new sn,this.environmentIntensity=1,this.environmentRotation=new sn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},dn=new U,Fn=new U,qo=new U,On=new U,Ni=new U,Ui=new U,lh=new U,Yo=new U,$o=new U,Zo=new U,Jo=new dt,Ko=new dt,jo=new dt,Qn=class i{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),dn.subVectors(e,t),s.cross(dn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){dn.subVectors(s,t),Fn.subVectors(n,t),qo.subVectors(e,t);let a=dn.dot(dn),o=dn.dot(Fn),l=dn.dot(qo),c=Fn.dot(Fn),u=Fn.dot(qo),m=a*c-o*o;if(m===0)return r.set(0,0,0),null;let h=1/m,f=(c*l-o*u)*h,x=(a*u-o*l)*h;return r.set(1-f-x,x,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,On)===null?!1:On.x>=0&&On.y>=0&&On.x+On.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,On)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,On.x),l.addScaledVector(a,On.y),l.addScaledVector(o,On.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Jo.setScalar(0),Ko.setScalar(0),jo.setScalar(0),Jo.fromBufferAttribute(e,t),Ko.fromBufferAttribute(e,n),jo.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Jo,r.x),a.addScaledVector(Ko,r.y),a.addScaledVector(jo,r.z),a}static isFrontFacing(e,t,n,s){return dn.subVectors(n,t),Fn.subVectors(e,t),dn.cross(Fn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return dn.subVectors(this.c,this.b),Fn.subVectors(this.a,this.b),dn.cross(Fn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;Ni.subVectors(s,n),Ui.subVectors(r,n),Yo.subVectors(e,n);let l=Ni.dot(Yo),c=Ui.dot(Yo);if(l<=0&&c<=0)return t.copy(n);$o.subVectors(e,s);let u=Ni.dot($o),m=Ui.dot($o);if(u>=0&&m<=u)return t.copy(s);let h=l*m-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(Ni,a);Zo.subVectors(e,r);let f=Ni.dot(Zo),x=Ui.dot(Zo);if(x>=0&&f<=x)return t.copy(r);let v=f*c-l*x;if(v<=0&&c>=0&&x<=0)return o=c/(c-x),t.copy(n).addScaledVector(Ui,o);let p=u*x-f*m;if(p<=0&&m-u>=0&&f-x>=0)return lh.subVectors(r,s),o=(m-u)/(m-u+(f-x)),t.copy(s).addScaledVector(lh,o);let d=1/(p+v+h);return a=v*d,o=h*d,t.copy(n).addScaledVector(Ni,a).addScaledVector(Ui,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},An=class{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(fn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(fn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=fn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,fn):fn.fromBufferAttribute(r,a),fn.applyMatrix4(e.matrixWorld),this.expandByPoint(fn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),vr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),vr.copy(n.boundingBox)),vr.applyMatrix4(e.matrixWorld),this.union(vr)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,fn),fn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(gs),Mr.subVectors(this.max,gs),Fi.subVectors(e.a,gs),Oi.subVectors(e.b,gs),Bi.subVectors(e.c,gs),Jn.subVectors(Oi,Fi),Kn.subVectors(Bi,Oi),pi.subVectors(Fi,Bi);let t=[0,-Jn.z,Jn.y,0,-Kn.z,Kn.y,0,-pi.z,pi.y,Jn.z,0,-Jn.x,Kn.z,0,-Kn.x,pi.z,0,-pi.x,-Jn.y,Jn.x,0,-Kn.y,Kn.x,0,-pi.y,pi.x,0];return!Qo(t,Fi,Oi,Bi,Mr)||(t=[1,0,0,0,1,0,0,0,1],!Qo(t,Fi,Oi,Bi,Mr))?!1:(Sr.crossVectors(Jn,Kn),t=[Sr.x,Sr.y,Sr.z],Qo(t,Fi,Oi,Bi,Mr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,fn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(fn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Bn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Bn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Bn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Bn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Bn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Bn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Bn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Bn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Bn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Bn=[new U,new U,new U,new U,new U,new U,new U,new U],fn=new U,vr=new An,Fi=new U,Oi=new U,Bi=new U,Jn=new U,Kn=new U,pi=new U,gs=new U,Mr=new U,Sr=new U,mi=new U;function Qo(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){mi.fromArray(i,r);let o=s.x*Math.abs(mi.x)+s.y*Math.abs(mi.y)+s.z*Math.abs(mi.z),l=e.dot(mi),c=t.dot(mi),u=n.dot(mi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var Mt=new U,br=new Re,qd=0,Kt=class extends wn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:qd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=iu,this.updateRanges=[],this.gpuType=ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)br.fromBufferAttribute(this,t),br.applyMatrix3(e),this.setXY(t,br.x,br.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix3(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix4(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyNormalMatrix(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.transformDirection(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Wi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Vt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Wi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Wi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Wi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Wi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array),s=Vt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),n=Vt(n,this.array),s=Vt(s,this.array),r=Vt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Ls=class extends Kt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ds=class extends Kt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Ke=class extends Kt{constructor(e,t,n){super(new Float32Array(e),t,n)}},Yd=new An,_s=new U,el=new U,ei=class{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Yd.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;_s.subVectors(e,this.center);let t=_s.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(_s,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(el.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(_s.copy(e.center).add(el)),this.expandByPoint(_s.copy(e.center).sub(el))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},$d=0,tn=new rt,tl=new St,zi=new U,Jt=new An,xs=new An,At=new U,bt=class i extends wn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:$d++}),this.uuid=os(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(xd(e)?Ds:Ls)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ke().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return tn.makeRotationFromQuaternion(e),this.applyMatrix4(tn),this}rotateX(e){return tn.makeRotationX(e),this.applyMatrix4(tn),this}rotateY(e){return tn.makeRotationY(e),this.applyMatrix4(tn),this}rotateZ(e){return tn.makeRotationZ(e),this.applyMatrix4(tn),this}translate(e,t,n){return tn.makeTranslation(e,t,n),this.applyMatrix4(tn),this}scale(e,t,n){return tn.makeScale(e,t,n),this.applyMatrix4(tn),this}lookAt(e){return tl.lookAt(e),tl.updateMatrix(),this.applyMatrix4(tl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(zi).negate(),this.translate(zi.x,zi.y,zi.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ke(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Fe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new An);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Oe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Jt.setFromBufferAttribute(r),this.morphTargetsRelative?(At.addVectors(this.boundingBox.min,Jt.min),this.boundingBox.expandByPoint(At),At.addVectors(this.boundingBox.max,Jt.max),this.boundingBox.expandByPoint(At)):(this.boundingBox.expandByPoint(Jt.min),this.boundingBox.expandByPoint(Jt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Oe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ei);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Oe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){let n=this.boundingSphere.center;if(Jt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];xs.setFromBufferAttribute(o),this.morphTargetsRelative?(At.addVectors(Jt.min,xs.min),Jt.expandByPoint(At),At.addVectors(Jt.max,xs.max),Jt.expandByPoint(At)):(Jt.expandByPoint(xs.min),Jt.expandByPoint(xs.max))}Jt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)At.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(At));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)At.fromBufferAttribute(o,c),l&&(zi.fromBufferAttribute(e,c),At.add(zi)),s=Math.max(s,n.distanceToSquared(At))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Oe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Oe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Kt(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let g=0;g<n.count;g++)o[g]=new U,l[g]=new U;let c=new U,u=new U,m=new U,h=new Re,f=new Re,x=new Re,v=new U,p=new U;function d(g,E,C){c.fromBufferAttribute(n,g),u.fromBufferAttribute(n,E),m.fromBufferAttribute(n,C),h.fromBufferAttribute(r,g),f.fromBufferAttribute(r,E),x.fromBufferAttribute(r,C),u.sub(c),m.sub(c),f.sub(h),x.sub(h);let L=1/(f.x*x.y-x.x*f.y);isFinite(L)&&(v.copy(u).multiplyScalar(x.y).addScaledVector(m,-f.y).multiplyScalar(L),p.copy(m).multiplyScalar(f.x).addScaledVector(u,-x.x).multiplyScalar(L),o[g].add(v),o[E].add(v),o[C].add(v),l[g].add(p),l[E].add(p),l[C].add(p))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let g=0,E=T.length;g<E;++g){let C=T[g],L=C.start,D=C.count;for(let k=L,P=L+D;k<P;k+=3)d(e.getX(k+0),e.getX(k+1),e.getX(k+2))}let A=new U,M=new U,_=new U,S=new U;function w(g){_.fromBufferAttribute(s,g),S.copy(_);let E=o[g];A.copy(E),A.sub(_.multiplyScalar(_.dot(E))).normalize(),M.crossVectors(S,E);let L=M.dot(l[g])<0?-1:1;a.setXYZW(g,A.x,A.y,A.z,L)}for(let g=0,E=T.length;g<E;++g){let C=T[g],L=C.start,D=C.count;for(let k=L,P=L+D;k<P;k+=3)w(e.getX(k+0)),w(e.getX(k+1)),w(e.getX(k+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Kt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);let s=new U,r=new U,a=new U,o=new U,l=new U,c=new U,u=new U,m=new U;if(e)for(let h=0,f=e.count;h<f;h+=3){let x=e.getX(h+0),v=e.getX(h+1),p=e.getX(h+2);s.fromBufferAttribute(t,x),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,p),u.subVectors(a,r),m.subVectors(s,r),u.cross(m),o.fromBufferAttribute(n,x),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),o.add(u),l.add(u),c.add(u),n.setXYZ(x,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),m.subVectors(s,r),u.cross(m),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)At.fromBufferAttribute(e,t),At.normalize(),e.setXYZ(t,At.x,At.y,At.z)}toNonIndexed(){function e(o,l){let c=o.array,u=o.itemSize,m=o.normalized,h=new c.constructor(l.length*u),f=0,x=0;for(let v=0,p=l.length;v<p;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*u;for(let d=0;d<u;d++)h[x++]=c[f++]}return new Kt(h,u,m)}if(this.index===null)return Fe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,m=c.length;u<m;u++){let h=c[u],f=e(h,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let m=0,h=c.length;m<h;m++){let f=c[m];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],m=r[c];for(let h=0,f=m.length;h<f;h++)u.push(m[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,u=a.length;c<u;c++){let m=a[c];this.addGroup(m.start,m.count,m.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var nl=new U,Zd=new U,Jd=new ke,pn=class{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=nl.subVectors(n,t).cross(Zd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(nl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Jd.getNormalMatrix(e),s=this.coplanarPoint(nl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Kd=0,Vn=class extends wn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Kd++}),this.uuid=os(),this.name="",this.type="Material",this.blending=ss,this.side=Rn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Sl,this.blendDst=bl,this.blendEquation=Si,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Be(0,0,0),this.blendAlpha=0,this.depthFunc=qi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Jh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Br,this.stencilZFail=Br,this.stencilZPass=Br,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Fe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Fe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Be().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new pn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Re().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Re().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var zn=new U,il=new U,Er=new U,Tr=new U,Ns=class{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,zn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=zn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(zn.copy(this.origin).addScaledVector(this.direction,t),zn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){il.copy(e).add(t).multiplyScalar(.5),Er.copy(t).sub(e).normalize(),Tr.copy(this.origin).sub(il);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Er),o=Tr.dot(this.direction),l=-Tr.dot(Er),c=Tr.lengthSq(),u=Math.abs(1-a*a),m,h,f,x;if(u>0)if(m=a*l-o,h=a*o-l,x=r*u,m>=0)if(h>=-x)if(h<=x){let v=1/u;m*=v,h*=v,f=m*(m+a*h+2*o)+h*(a*m+h+2*l)+c}else h=r,m=Math.max(0,-(a*h+o)),f=-m*m+h*(h+2*l)+c;else h=-r,m=Math.max(0,-(a*h+o)),f=-m*m+h*(h+2*l)+c;else h<=-x?(m=Math.max(0,-(-a*r+o)),h=m>0?-r:Math.min(Math.max(-r,-l),r),f=-m*m+h*(h+2*l)+c):h<=x?(m=0,h=Math.min(Math.max(-r,-l),r),f=h*(h+2*l)+c):(m=Math.max(0,-(a*r+o)),h=m>0?r:Math.min(Math.max(-r,-l),r),f=-m*m+h*(h+2*l)+c);else h=a>0?-r:r,m=Math.max(0,-(a*h+o)),f=-m*m+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,m),s&&s.copy(il).addScaledVector(Er,h),f}intersectSphere(e,t){if(e.radius<0)return null;zn.subVectors(e.center,this.origin);let n=zn.dot(this.direction),s=zn.dot(zn)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,m=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),m>=0?(o=(e.min.z-h.z)*m,l=(e.max.z-h.z)*m):(o=(e.max.z-h.z)*m,l=(e.min.z-h.z)*m),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,zn)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,m=e.x-a.x,h=e.y-a.y,f=e.z-a.z,x=t.x-a.x,v=t.y-a.y,p=t.z-a.z,d=n.x-a.x,T=n.y-a.y,A=n.z-a.z,M=Math.abs(l),_=Math.abs(c),S=Math.abs(u),w,g,E,C,L,D,k,P,H,$,Y,I;if(M>=_&&M>=S?(E=l,D=m,H=x,I=d,l>=0?(w=c,g=u,C=h,L=f,k=v,P=p,$=T,Y=A):(w=u,g=c,C=f,L=h,k=p,P=v,$=A,Y=T)):_>=S?(E=c,D=h,H=v,I=T,c>=0?(w=u,g=l,C=f,L=m,k=p,P=x,$=A,Y=d):(w=l,g=u,C=m,L=f,k=x,P=p,$=d,Y=A)):(E=u,D=f,H=p,I=A,u>=0?(w=l,g=c,C=m,L=h,k=x,P=v,$=d,Y=T):(w=c,g=l,C=h,L=m,k=v,P=x,$=T,Y=d)),E===0)return null;let N=w/E,z=g/E,V=1/E,se=C-N*D,K=L-z*D,me=k-N*H,Me=P-z*H,ze=$-N*I,Z=Y-z*I,ee=ze*Me-Z*me,ve=se*Z-K*ze,De=me*K-Me*se;if(s){if(ee<0||ve<0||De<0)return null}else if((ee<0||ve<0||De<0)&&(ee>0||ve>0||De>0))return null;let xe=ee+ve+De;if(xe===0)return null;let re=V*(ee*D+ve*H+De*I);return(xe>0?re<0:re>0)?null:this.at(re/xe,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},yi=class extends Vn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.combine=Ea,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ch=new rt,gi=new Ns,wr=new ei,hh=new U,Ar=new U,Cr=new U,Rr=new U,sl=new U,Ir=new U,uh=new U,Pr=new U,pt=class extends St{constructor(e=new bt,t=new yi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Ir.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],m=r[l];u!==0&&(sl.fromBufferAttribute(m,e),a?Ir.addScaledVector(sl,u):Ir.addScaledVector(sl.sub(t),u))}t.add(Ir)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),wr.copy(n.boundingSphere),wr.applyMatrix4(r),gi.copy(e.ray).recast(e.near),!(wr.containsPoint(gi.origin)===!1&&(gi.intersectSphere(wr,hh)===null||gi.origin.distanceToSquared(hh)>(e.far-e.near)**2))&&(ch.copy(r).invert(),gi.copy(e.ray).applyMatrix4(ch),!(n.boundingBox!==null&&gi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,gi)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,m=r.attributes.normal,h=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let x=0,v=h.length;x<v;x++){let p=h[x],d=a[p.materialIndex],T=Math.max(p.start,f.start),A=Math.min(o.count,Math.min(p.start+p.count,f.start+f.count));for(let M=T,_=A;M<_;M+=3){let S=o.getX(M),w=o.getX(M+1),g=o.getX(M+2);s=Lr(this,d,e,n,c,u,m,S,w,g),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{let x=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let p=x,d=v;p<d;p+=3){let T=o.getX(p),A=o.getX(p+1),M=o.getX(p+2);s=Lr(this,a,e,n,c,u,m,T,A,M),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let x=0,v=h.length;x<v;x++){let p=h[x],d=a[p.materialIndex],T=Math.max(p.start,f.start),A=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let M=T,_=A;M<_;M+=3){let S=M,w=M+1,g=M+2;s=Lr(this,d,e,n,c,u,m,S,w,g),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{let x=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let p=x,d=v;p<d;p+=3){let T=p,A=p+1,M=p+2;s=Lr(this,a,e,n,c,u,m,T,A,M),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}}};function jd(i,e,t,n,s,r,a,o){let l;if(e.side===Wt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===Rn,o),l===null)return null;Pr.copy(o),Pr.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Pr);return c<t.near||c>t.far?null:{distance:c,point:Pr.clone(),object:i}}function Lr(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Ar),i.getVertexPosition(l,Cr),i.getVertexPosition(c,Rr);let u=jd(i,e,t,n,Ar,Cr,Rr,uh);if(u){let m=new U;Qn.getBarycoord(uh,Ar,Cr,Rr,m),s&&(u.uv=Qn.getInterpolatedAttribute(s,o,l,c,m,new Re)),r&&(u.uv1=Qn.getInterpolatedAttribute(r,o,l,c,m,new Re)),a&&(u.normal=Qn.getInterpolatedAttribute(a,o,l,c,m,new U),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:l,c,normal:new U,materialIndex:0};Qn.getNormal(Ar,Cr,Rr,h.normal),u.face=h,u.barycoord=m}return u}var Us=class extends qt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Ct,u=Ct,m,h){super(null,a,o,l,c,u,s,r,m,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Fs=class extends Kt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ki=new rt,dh=new rt,Dr=[],fh=new An,Qd=new rt,ys=new pt,vs=new ei,Gn=class extends pt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Fs(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Qd)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new An),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ki),fh.copy(e.boundingBox).applyMatrix4(ki),this.boundingBox.union(fh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ei),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ki),vs.copy(e.boundingSphere).applyMatrix4(ki),this.boundingSphere.union(vs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(ys.geometry=this.geometry,ys.material=this.material,ys.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),vs.copy(this.boundingSphere),vs.applyMatrix4(n),e.ray.intersectsSphere(vs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ki),dh.multiplyMatrices(n,ki),ys.matrixWorld=dh,ys.raycast(e,Dr);for(let a=0,o=Dr.length;a<o;a++){let l=Dr[a];l.instanceId=r,l.object=this,t.push(l)}Dr.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Fs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Us(new Float32Array(s*this.count),s,this.count,Pa,ln));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},_i=new ei,ef=new Re(.5,.5),Nr=new U,Qi=class{constructor(e=new pn,t=new pn,n=new pn,s=new pn,r=new pn,a=new pn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=mn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],m=r[5],h=r[6],f=r[7],x=r[8],v=r[9],p=r[10],d=r[11],T=r[12],A=r[13],M=r[14],_=r[15];if(s[0].setComponents(c-a,f-u,d-x,_-T).normalize(),s[1].setComponents(c+a,f+u,d+x,_+T).normalize(),s[2].setComponents(c+o,f+m,d+v,_+A).normalize(),s[3].setComponents(c-o,f-m,d-v,_-A).normalize(),n)s[4].setComponents(l,h,p,M).normalize(),s[5].setComponents(c-l,f-h,d-p,_-M).normalize();else if(s[4].setComponents(c-l,f-h,d-p,_-M).normalize(),t===mn)s[5].setComponents(c+l,f+h,d+p,_+M).normalize();else if(t===Yi)s[5].setComponents(l,h,p,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),_i.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),_i.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(_i)}intersectsSprite(e){_i.center.set(0,0,0);let t=ef.distanceTo(e.center);return _i.radius=.7071067811865476+t,_i.applyMatrix4(e.matrixWorld),this.intersectsSphere(_i)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Nr.x=s.normal.x>0?e.max.x:e.min.x,Nr.y=s.normal.y>0?e.max.y:e.min.y,Nr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Nr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Os=class extends qt{constructor(e=[],t=ai,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var ti=class extends qt{constructor(e,t,n=_n,s,r,a,o=Ct,l=Ct,c,u=Tn,m=1){if(u!==Tn&&u!==li)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:m};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ji(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},jr=class extends ti{constructor(e,t=_n,n=ai,s,r,a=Ct,o=Ct,l,c=Tn){let u={width:e,height:e,depth:1},m=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,l,c),this.image=m,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Bs=class extends qt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},rn=class i extends bt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],m=[],h=0,f=0;x("z","y","x",-1,-1,n,t,e,a,r,0),x("z","y","x",1,-1,n,t,-e,a,r,1),x("x","z","y",1,1,e,n,t,s,a,2),x("x","z","y",1,-1,e,n,-t,s,a,3),x("x","y","z",1,-1,e,t,n,s,r,4),x("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Ke(c,3)),this.setAttribute("normal",new Ke(u,3)),this.setAttribute("uv",new Ke(m,2));function x(v,p,d,T,A,M,_,S,w,g,E){let C=M/w,L=_/g,D=M/2,k=_/2,P=S/2,H=w+1,$=g+1,Y=0,I=0,N=new U;for(let z=0;z<$;z++){let V=z*L-k;for(let se=0;se<H;se++){let K=se*C-D;N[v]=K*T,N[p]=V*A,N[d]=P,c.push(N.x,N.y,N.z),N[v]=0,N[p]=0,N[d]=S>0?1:-1,u.push(N.x,N.y,N.z),m.push(se/w),m.push(1-z/g),Y+=1}}for(let z=0;z<g;z++)for(let V=0;V<w;V++){let se=h+V+H*z,K=h+V+H*(z+1),me=h+(V+1)+H*(z+1),Me=h+(V+1)+H*z;l.push(se,K,Me),l.push(K,me,Me),I+=6}o.addGroup(f,I,E),f+=I,h+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var zs=class i extends bt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],a=[],o=[],l=[],c=new U,u=new Re;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let m=0,h=3;m<=t;m++,h+=3){let f=n+m/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[h]/e+1)/2,u.y=(a[h+1]/e+1)/2,l.push(u.x,u.y)}for(let m=1;m<=t;m++)r.push(m,m+1,0);this.setIndex(r),this.setAttribute("position",new Ke(a,3)),this.setAttribute("normal",new Ke(o,3)),this.setAttribute("uv",new Ke(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Cn=class i extends bt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],m=[],h=[],f=[],x=0,v=[],p=n/2,d=0;T(),a===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(u),this.setAttribute("position",new Ke(m,3)),this.setAttribute("normal",new Ke(h,3)),this.setAttribute("uv",new Ke(f,2));function T(){let M=new U,_=new U,S=0,w=(t-e)/n;for(let g=0;g<=r;g++){let E=[],C=g/r,L=C*(t-e)+e;for(let D=0;D<=s;D++){let k=D/s,P=k*l+o,H=Math.sin(P),$=Math.cos(P);_.x=L*H,_.y=-C*n+p,_.z=L*$,m.push(_.x,_.y,_.z),M.set(H,w,$).normalize(),h.push(M.x,M.y,M.z),f.push(k,1-C),E.push(x++)}v.push(E)}for(let g=0;g<s;g++)for(let E=0;E<r;E++){let C=v[E][g],L=v[E+1][g],D=v[E+1][g+1],k=v[E][g+1];(e>0||E!==0)&&(u.push(C,L,k),S+=3),(t>0||E!==r-1)&&(u.push(L,D,k),S+=3)}c.addGroup(d,S,0),d+=S}function A(M){let _=x,S=new Re,w=new U,g=0,E=M===!0?e:t,C=M===!0?1:-1;for(let D=1;D<=s;D++)m.push(0,p*C,0),h.push(0,C,0),f.push(.5,.5),x++;let L=x;for(let D=0;D<=s;D++){let P=D/s*l+o,H=Math.cos(P),$=Math.sin(P);w.x=E*$,w.y=p*C,w.z=E*H,m.push(w.x,w.y,w.z),h.push(0,C,0),S.x=H*.5+.5,S.y=$*.5*C+.5,f.push(S.x,S.y),x++}for(let D=0;D<s;D++){let k=_+D,P=L+D;M===!0?u.push(P,P+1,k):u.push(P+1,P,k),g+=3}c.addGroup(d,g,M===!0?1:2),d+=g}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},vi=class i extends Cn{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Qr=class i extends bt{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};let r=[],a=[];o(s),c(n),u(),this.setAttribute("position",new Ke(r,3)),this.setAttribute("normal",new Ke(r.slice(),3)),this.setAttribute("uv",new Ke(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(T){let A=new U,M=new U,_=new U;for(let S=0;S<t.length;S+=3)f(t[S+0],A),f(t[S+1],M),f(t[S+2],_),l(A,M,_,T)}function l(T,A,M,_){let S=_+1,w=[];for(let g=0;g<=S;g++){w[g]=[];let E=T.clone().lerp(M,g/S),C=A.clone().lerp(M,g/S),L=S-g;for(let D=0;D<=L;D++)D===0&&g===S?w[g][D]=E:w[g][D]=E.clone().lerp(C,D/L)}for(let g=0;g<S;g++)for(let E=0;E<2*(S-g)-1;E++){let C=Math.floor(E/2);E%2===0?(h(w[g][C+1]),h(w[g+1][C]),h(w[g][C])):(h(w[g][C+1]),h(w[g+1][C+1]),h(w[g+1][C]))}}function c(T){let A=new U;for(let M=0;M<r.length;M+=3)A.x=r[M+0],A.y=r[M+1],A.z=r[M+2],A.normalize().multiplyScalar(T),r[M+0]=A.x,r[M+1]=A.y,r[M+2]=A.z}function u(){let T=new U;for(let A=0;A<r.length;A+=3){T.x=r[A+0],T.y=r[A+1],T.z=r[A+2];let M=p(T)/2/Math.PI+.5,_=d(T)/Math.PI+.5;a.push(M,1-_)}x(),m()}function m(){for(let T=0;T<a.length;T+=6){let A=a[T+0],M=a[T+2],_=a[T+4],S=Math.max(A,M,_),w=Math.min(A,M,_);S>.9&&w<.1&&(A<.2&&(a[T+0]+=1),M<.2&&(a[T+2]+=1),_<.2&&(a[T+4]+=1))}}function h(T){r.push(T.x,T.y,T.z)}function f(T,A){let M=T*3;A.x=e[M+0],A.y=e[M+1],A.z=e[M+2]}function x(){let T=new U,A=new U,M=new U,_=new U,S=new Re,w=new Re,g=new Re;for(let E=0,C=0;E<r.length;E+=9,C+=6){T.set(r[E+0],r[E+1],r[E+2]),A.set(r[E+3],r[E+4],r[E+5]),M.set(r[E+6],r[E+7],r[E+8]),S.set(a[C+0],a[C+1]),w.set(a[C+2],a[C+3]),g.set(a[C+4],a[C+5]),_.copy(T).add(A).add(M).divideScalar(3);let L=p(_);v(S,C+0,T,L),v(w,C+2,A,L),v(g,C+4,M,L)}}function v(T,A,M,_){_<0&&T.x===1&&(a[A]=T.x-1),M.x===0&&M.z===0&&(a[A]=_/2/Math.PI+.5)}function p(T){return Math.atan2(T.z,-T.x)}function d(T){return Math.atan2(-T.y,Math.sqrt(T.x*T.x+T.z*T.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.detail)}};var an=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Fe("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let u=n[s],h=n[s+1]-u,f=(a-u)/h;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new Re:new U);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new U,s=[],r=[],a=[],o=new U,l=new rt;for(let f=0;f<=e;f++){let x=f/e;s[f]=this.getTangentAt(x,new U)}r[0]=new U,a[0]=new U;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),m=Math.abs(s[0].y),h=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),m<=c&&(c=m,n.set(0,1,0)),h<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let x=Math.acos(Xe(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,x))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Xe(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let x=1;x<=e;x++)r[x].applyMatrix4(l.makeRotationAxis(s[x],f*x)),a[x].crossVectors(s[x],r[x])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ks=class extends an{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new Re){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),m=Math.sin(this.aRotation),h=l-this.aX,f=c-this.aY;l=h*u-f*m+this.aX,c=h*m+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ea=class extends ks{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Vl(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,m){let h=(a-r)/c-(o-r)/(c+u)+(o-a)/u,f=(o-a)/u-(l-a)/(u+m)+(l-o)/m;h*=u,f*=u,s(a,o,h,f)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var ph=new U,mh=new U,rl=new Vl,al=new Vl,ol=new Vl,es=class extends an{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new U){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(mh.subVectors(s[0],s[1]).add(s[0]),c=mh);let m=s[o%r],h=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(ph.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=ph),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,x=Math.pow(c.distanceToSquared(m),f),v=Math.pow(m.distanceToSquared(h),f),p=Math.pow(h.distanceToSquared(u),f);v<1e-4&&(v=1),x<1e-4&&(x=v),p<1e-4&&(p=v),rl.initNonuniformCatmullRom(c.x,m.x,h.x,u.x,x,v,p),al.initNonuniformCatmullRom(c.y,m.y,h.y,u.y,x,v,p),ol.initNonuniformCatmullRom(c.z,m.z,h.z,u.z,x,v,p)}else this.curveType==="catmullrom"&&(rl.initCatmullRom(c.x,m.x,h.x,u.x,this.tension),al.initCatmullRom(c.y,m.y,h.y,u.y,this.tension),ol.initCatmullRom(c.z,m.z,h.z,u.z,this.tension));return n.set(rl.calc(l),al.calc(l),ol.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new U().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function gh(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function tf(i,e){let t=1-i;return t*t*e}function nf(i,e){return 2*(1-i)*i*e}function sf(i,e){return i*i*e}function bs(i,e,t,n){return tf(i,e)+nf(i,t)+sf(i,n)}function rf(i,e){let t=1-i;return t*t*t*e}function af(i,e){let t=1-i;return 3*t*t*i*e}function of(i,e){return 3*(1-i)*i*i*e}function lf(i,e){return i*i*i*e}function Es(i,e,t,n,s){return rf(i,e)+af(i,t)+of(i,n)+lf(i,s)}var ta=class extends an{constructor(e=new Re,t=new Re,n=new Re,s=new Re){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new Re){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Es(e,s.x,r.x,a.x,o.x),Es(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},na=class extends an{constructor(e=new U,t=new U,n=new U,s=new U){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new U){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Es(e,s.x,r.x,a.x,o.x),Es(e,s.y,r.y,a.y,o.y),Es(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ia=class extends an{constructor(e=new Re,t=new Re){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Re){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Re){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},sa=class extends an{constructor(e=new U,t=new U){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new U){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new U){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ra=class extends an{constructor(e=new Re,t=new Re,n=new Re){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Re){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(bs(e,s.x,r.x,a.x),bs(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Vs=class extends an{constructor(e=new U,t=new U,n=new U){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new U){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(bs(e,s.x,r.x,a.x),bs(e,s.y,r.y,a.y),bs(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},aa=class extends an{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Re){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],m=s[a>s.length-3?s.length-1:a+2];return n.set(gh(o,l.x,c.x,u.x,m.x),gh(o,l.y,c.y,u.y,m.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new Re().fromArray(s))}return this}},cf=Object.freeze({__proto__:null,ArcCurve:ea,CatmullRomCurve3:es,CubicBezierCurve:ta,CubicBezierCurve3:na,EllipseCurve:ks,LineCurve:ia,LineCurve3:sa,QuadraticBezierCurve:ra,QuadraticBezierCurve3:Vs,SplineCurve:aa});var Gs=class i extends Qr{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},Hs=class i extends bt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,m=e/o,h=t/l,f=[],x=[],v=[],p=[];for(let d=0;d<u;d++){let T=d*h-a;for(let A=0;A<c;A++){let M=A*m-r;x.push(M,-T,0),v.push(0,0,1),p.push(A/o),p.push(1-d/l)}}for(let d=0;d<l;d++)for(let T=0;T<o;T++){let A=T+c*d,M=T+c*(d+1),_=T+1+c*(d+1),S=T+1+c*d;f.push(A,M,S),f.push(M,_,S)}this.setIndex(f),this.setAttribute("position",new Ke(x,3)),this.setAttribute("normal",new Ke(v,3)),this.setAttribute("uv",new Ke(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Mi=class i extends bt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],m=new U,h=new U,f=[],x=[],v=[],p=[];for(let d=0;d<=n;d++){let T=[],A=d/n,M=a+A*o,_=e*Math.cos(M),S=Math.sqrt(e*e-_*_),w=0;d===0&&a===0?w=.5/t:d===n&&l===Math.PI&&(w=-.5/t);for(let g=0;g<=t;g++){let E=g/t,C=s+E*r;m.x=-S*Math.cos(C),m.y=_,m.z=S*Math.sin(C),x.push(m.x,m.y,m.z),h.copy(m).normalize(),v.push(h.x,h.y,h.z),p.push(E+w,1-A),T.push(c++)}u.push(T)}for(let d=0;d<n;d++)for(let T=0;T<t;T++){let A=u[d][T+1],M=u[d][T],_=u[d+1][T],S=u[d+1][T+1];(d!==0||a>0)&&f.push(A,M,S),(d!==n-1||l<Math.PI)&&f.push(M,_,S)}this.setIndex(f),this.setAttribute("position",new Ke(x,3)),this.setAttribute("normal",new Ke(v,3)),this.setAttribute("uv",new Ke(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var ts=class i extends bt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],u=[],m=[],h=new U,f=new U,x=new U;for(let v=0;v<=n;v++){let p=a+v/n*o;for(let d=0;d<=s;d++){let T=d/s*r;f.x=(e+t*Math.cos(p))*Math.cos(T),f.y=(e+t*Math.cos(p))*Math.sin(T),f.z=t*Math.sin(p),c.push(f.x,f.y,f.z),h.x=e*Math.cos(T),h.y=e*Math.sin(T),x.subVectors(f,h).normalize(),u.push(x.x,x.y,x.z),m.push(d/s),m.push(v/n)}}for(let v=1;v<=n;v++)for(let p=1;p<=s;p++){let d=(s+1)*v+p-1,T=(s+1)*(v-1)+p-1,A=(s+1)*(v-1)+p,M=(s+1)*v+p;l.push(d,T,M),l.push(T,A,M)}this.setIndex(l),this.setAttribute("position",new Ke(c,3)),this.setAttribute("normal",new Ke(u,3)),this.setAttribute("uv",new Ke(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var Ws=class i extends bt{constructor(e=new Vs(new U(-1,-1,0),new U(-1,1,0),new U(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new U,l=new U,c=new Re,u=new U,m=[],h=[],f=[],x=[];v(),this.setIndex(x),this.setAttribute("position",new Ke(m,3)),this.setAttribute("normal",new Ke(h,3)),this.setAttribute("uv",new Ke(f,2));function v(){for(let A=0;A<t;A++)p(A);p(r===!1?t:0),T(),d()}function p(A){u=e.getPointAt(A/t,u);let M=a.normals[A],_=a.binormals[A];for(let S=0;S<=s;S++){let w=S/s*Math.PI*2,g=Math.sin(w),E=-Math.cos(w);l.x=E*M.x+g*_.x,l.y=E*M.y+g*_.y,l.z=E*M.z+g*_.z,l.normalize(),h.push(l.x,l.y,l.z),o.x=u.x+n*l.x,o.y=u.y+n*l.y,o.z=u.z+n*l.z,m.push(o.x,o.y,o.z)}}function d(){for(let A=1;A<=t;A++)for(let M=1;M<=s;M++){let _=(s+1)*(A-1)+(M-1),S=(s+1)*A+(M-1),w=(s+1)*A+M,g=(s+1)*(A-1)+M;x.push(_,S,g),x.push(S,w,g)}}function T(){for(let A=0;A<=t;A++)for(let M=0;M<=s;M++)c.x=A/t,c.y=M/s,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new cf[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};function Ei(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(_h(s))s.isRenderTargetTexture?(Fe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(_h(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Ot(i){let e={};for(let t=0;t<i.length;t++){let n=Ei(i[t]);for(let s in n)e[s]=n[s]}return e}function _h(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function hf(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Gl(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Je.workingColorSpace}var cu={clone:Ei,merge:Ot},uf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,df=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,jt=class extends Vn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=uf,this.fragmentShader=df,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ei(e.uniforms),this.uniformsGroups=hf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Be().setHex(s.value);break;case"v2":this.uniforms[n].value=new Re().fromArray(s.value);break;case"v3":this.uniforms[n].value=new U().fromArray(s.value);break;case"v4":this.uniforms[n].value=new dt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ke().fromArray(s.value);break;case"m4":this.uniforms[n].value=new rt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},oa=class extends jt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},on=class extends Vn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Be(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=or,this.normalScale=new Re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var ni=class extends Vn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=or,this.normalScale=new Re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.combine=Ea,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},la=class extends Vn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=$h,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ca=class extends Vn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Vi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function ll(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var ii=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ha=class extends ii{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ul,endingEnd:ul}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case dl:r=e,o=2*t-n;break;case fl:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case dl:a=e,l=2*n-t;break;case fl:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,m=this._offsetNext,h=this._weightPrev,f=this._weightNext,x=(n-t)/(s-t),v=x*x,p=v*x,d=-h*p+2*h*v-h*x,T=(1+h)*p+(-1.5-2*h)*v+(-.5+h)*x+1,A=(-1-f)*p+(1.5+f)*v+.5*x,M=f*p-f*v;for(let _=0;_!==o;++_)r[_]=d*a[u+_]+T*a[c+_]+A*a[l+_]+M*a[m+_];return r}},ua=class extends ii{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(s-t),m=1-u;for(let h=0;h!==o;++h)r[h]=a[c+h]*m+a[l+h]*u;return r}},da=class extends ii{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},fa=class extends ii{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this.inTangents,m=this.outTangents;if(!u||!m){let x=(n-t)/(s-t),v=1-x;for(let p=0;p!==o;++p)r[p]=a[c+p]*v+a[l+p]*x;return r}let h=o*2,f=e-1;for(let x=0;x!==o;++x){let v=a[c+x],p=a[l+x],d=f*h+x*2,T=m[d],A=m[d+1],M=e*h+x*2,_=u[M],S=u[M+1],w=pf(n,t,T,_,s);r[x]=hu(w,v,A,S,p)}return r}};function hu(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function ff(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function pf(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=hu(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=ff(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var Qt=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Vi(t,this.TimeBufferType),this.values=Vi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Vi(e.times,Array),values:Vi(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),ll(e.settings)&&(n.settings={inTangents:Vi(e.settings.inTangents,Array),outTangents:Vi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new da(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ua(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ha(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new fa(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ts:t=this.InterpolantFactoryMethodDiscrete;break;case $r:t=this.InterpolantFactoryMethodLinear;break;case Or:t=this.InterpolantFactoryMethodSmooth;break;case hl:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Fe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ts;case this.InterpolantFactoryMethodLinear:return $r;case this.InterpolantFactoryMethodSmooth:return Or;case this.InterpolantFactoryMethodBezier:return hl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;ll(this.settings)&&(xh(this.settings.inTangents,e),xh(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Oe("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Oe("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Oe("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){Oe("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&yd(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Oe("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Or,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(s)l=!0;else{let m=o*n,h=m-n,f=m+n;for(let x=0;x!==n;++x){let v=t[m+x];if(v!==t[h+x]||v!==t[f+x]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let m=o*n,h=a*n;for(let f=0;f!==n;++f)t[h+f]=t[m+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,ll(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function xh(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}Qt.prototype.ValueTypeName="";Qt.prototype.TimeBufferType=Float32Array;Qt.prototype.ValueBufferType=Float32Array;Qt.prototype.DefaultInterpolation=$r;var si=class extends Qt{constructor(e,t,n){super(e,t,n)}};si.prototype.ValueTypeName="bool";si.prototype.ValueBufferType=Array;si.prototype.DefaultInterpolation=Ts;si.prototype.InterpolantFactoryMethodLinear=void 0;si.prototype.InterpolantFactoryMethodSmooth=void 0;var pa=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}};pa.prototype.ValueTypeName="color";var ma=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}};ma.prototype.ValueTypeName="number";var ga=class extends ii{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let u=c+o;c!==u;c+=4)nn.slerpFlat(r,0,a,c-o,a,c,l);return r}},Xs=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new ga(this.times,this.values,this.getValueSize(),e)}};Xs.prototype.ValueTypeName="quaternion";Xs.prototype.InterpolantFactoryMethodSmooth=void 0;var ri=class extends Qt{constructor(e,t,n){super(e,t,n)}};ri.prototype.ValueTypeName="string";ri.prototype.ValueBufferType=Array;ri.prototype.DefaultInterpolation=Ts;ri.prototype.InterpolantFactoryMethodLinear=void 0;ri.prototype.InterpolantFactoryMethodSmooth=void 0;var _a=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}};_a.prototype.ValueTypeName="vector";var xa=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,m){return c.push(u,m),this},this.removeHandler=function(u){let m=c.indexOf(u);return m!==-1&&c.splice(m,2),this},this.getHandler=function(u){for(let m=0,h=c.length;m<h;m+=2){let f=c[m],x=c[m+1];if(f.global&&(f.lastIndex=0),f.test(u))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},uu=new xa,ya=class{constructor(e){this.manager=e!==void 0?e:uu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};ya.DEFAULT_MATERIAL_NAME="__DEFAULT";var qs=class extends St{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Be(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Ys=class extends qs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(St.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Be(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},cl=new rt,yh=new U,vh=new U,va=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Re(512,512),this.mapType=$t,this.map=null,this.mapPass=null,this.matrix=new rt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Qi,this._frameExtents=new Re(1,1),this._viewportCount=1,this._viewports=[new dt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;yh.setFromMatrixPosition(e.matrixWorld),t.position.copy(yh),vh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(vh),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){cl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(cl,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Yi||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(cl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ur=new U,Fr=new nn,bn=new U,$s=class extends St{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new rt,this.projectionMatrix=new rt,this.projectionMatrixInverse=new rt,this.coordinateSystem=mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ur,Fr,bn),bn.x===1&&bn.y===1&&bn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ur,Fr,bn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ur,Fr,bn),bn.x===1&&bn.y===1&&bn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ur,Fr,bn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},jn=new U,Mh=new Re,Sh=new Re,Ft=class extends $s{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Zi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ms*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Zi*2*Math.atan(Math.tan(Ms*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){jn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(jn.x,jn.y).multiplyScalar(-e/jn.z),jn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(jn.x,jn.y).multiplyScalar(-e/jn.z)}getViewSize(e,t){return this.getViewBounds(e,Mh,Sh),t.subVectors(Sh,Mh)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ms*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var ns=class extends $s{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},pl=class extends va{constructor(){super(new ns(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Zs=class extends qs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(St.DEFAULT_UP),this.updateMatrix(),this.target=new St,this.shadow=new pl}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Gi=-90,Hi=1,Ma=class extends St{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ft(Gi,Hi,e,t);s.layers=this.layers,this.add(s);let r=new Ft(Gi,Hi,e,t);r.layers=this.layers,this.add(r);let a=new Ft(Gi,Hi,e,t);a.layers=this.layers,this.add(a);let o=new Ft(Gi,Hi,e,t);o.layers=this.layers,this.add(o);let l=new Ft(Gi,Hi,e,t);l.layers=this.layers,this.add(l);let c=new Ft(Gi,Hi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===mn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Yi)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,m=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(m,h,f),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},Sa=class extends Ft{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Hl="\\[\\]\\.:\\/",mf=new RegExp("["+Hl+"]","g"),Wl="[^"+Hl+"]",gf="[^"+Hl.replace("\\.","")+"]",_f=/((?:WC+[\/:])*)/.source.replace("WC",Wl),xf=/(WCOD+)?/.source.replace("WCOD",gf),yf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Wl),vf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Wl),Mf=new RegExp("^"+_f+xf+yf+vf+"$"),Sf=["material","materials","bones","map"],ml=class{constructor(e,t,n){let s=n||ut.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ut=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(mf,"")}static parseTrackName(e){let t=Mf.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Sf.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Fe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Oe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Oe("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Oe("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Oe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Oe("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Oe("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Oe("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;Oe("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Oe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Oe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ut.Composite=ml;ut.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ut.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ut.prototype.GetterByBindingType=[ut.prototype._getValue_direct,ut.prototype._getValue_array,ut.prototype._getValue_arrayElement,ut.prototype._getValue_toArray];ut.prototype.SetterByBindingTypeAndVersioning=[[ut.prototype._setValue_direct,ut.prototype._setValue_direct_setNeedsUpdate,ut.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_array,ut.prototype._setValue_array_setNeedsUpdate,ut.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_arrayElement,ut.prototype._setValue_arrayElement_setNeedsUpdate,ut.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_fromArray,ut.prototype._setValue_fromArray_setNeedsUpdate,ut.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var D_=new Float32Array(1);var bh=new rt,Js=class{constructor(e,t,n=0,s=1/0){this.ray=new Ns(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Ki,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Oe("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return bh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(bh),this}intersectObject(e,t=!0,n=[]){return gl(e,this,n,t),n.sort(Eh),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)gl(e[s],this,n,t);return n.sort(Eh),n}};function Eh(i,e){return i.distance-e.distance}function gl(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)gl(r[a],e,t,!0)}}var _l=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};function Xl(i,e,t,n){let s=bf(n);switch(t){case Ul:return i*e;case Pa:return i*e/s.components*s.byteLength;case La:return i*e/s.components*s.byteLength;case ci:return i*e*2/s.components*s.byteLength;case Da:return i*e*2/s.components*s.byteLength;case Fl:return i*e*3/s.components*s.byteLength;case cn:return i*e*4/s.components*s.byteLength;case Na:return i*e*4/s.components*s.byteLength;case tr:case nr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ir:case sr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Fa:case Ba:return Math.max(i,16)*Math.max(e,8)/4;case Ua:case Oa:return Math.max(i,8)*Math.max(e,8)/2;case za:case ka:case Ga:case Ha:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Va:case rr:case Wa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Xa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case qa:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ya:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case $a:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Za:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Ja:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ka:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case ja:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Qa:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case eo:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case to:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case no:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case io:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case so:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case ro:case ao:case oo:return Math.ceil(i/4)*Math.ceil(e/4)*16;case lo:case co:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ar:case ho:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function bf(i){switch(i){case $t:case Pl:return{byteLength:1,components:1};case rs:case Ll:case xn:return{byteLength:2,components:1};case Ra:case Ia:return{byteLength:2,components:4};case _n:case Ca:case ln:return{byteLength:4,components:1};case Dl:case Nl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Fe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Du(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Tf(i){let e=new WeakMap;function t(o,l){let c=o.array,u=o.usage,m=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:m}}function n(o,l,c){let u=l.array,m=l.updateRanges;if(i.bindBuffer(c,o),m.length===0)i.bufferSubData(c,0,u);else{m.sort((f,x)=>f.start-x.start);let h=0;for(let f=1;f<m.length;f++){let x=m[h],v=m[f];v.start<=x.start+x.count+1?x.count=Math.max(x.count,v.start+v.count-x.start):(++h,m[h]=v)}m.length=h+1;for(let f=0,x=m.length;f<x;f++){let v=m[f];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var wf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Af=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Cf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Rf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,If=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Pf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Lf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Df=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Nf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Uf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ff=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Of=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Bf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,zf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,kf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Vf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Gf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Hf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Wf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Xf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,qf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Yf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,$f=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Zf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Jf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Kf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,jf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Qf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ep=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,tp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,np="gl_FragColor = linearToOutputTexel( gl_FragColor );",ip=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,sp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,rp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,ap=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,op=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,lp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,cp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,hp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,up=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,dp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,fp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,pp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,mp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,gp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,_p=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,xp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,yp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,vp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Mp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Sp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,bp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Ep=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Tp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,wp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ap=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Cp=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Rp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ip=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Pp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Lp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Dp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Np=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Up=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Fp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Op=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Bp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,zp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,kp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Vp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Gp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Hp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Wp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Xp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,qp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,$p=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Zp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Jp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Kp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,jp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Qp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,em=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,tm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,nm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,im=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,sm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,rm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,am=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,om=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,lm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,cm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,hm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,um=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,dm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,fm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,pm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,mm=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,gm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,_m=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,xm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ym=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,vm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Mm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Sm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,bm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Em=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Tm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,wm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Am=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Rm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Im=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Pm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Dm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Nm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Um=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Fm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Om=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,zm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,km=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Vm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Gm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Hm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Xm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Ym=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,$m=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Km=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,eg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,tg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ng=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ig=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,rg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,We={alphahash_fragment:wf,alphahash_pars_fragment:Af,alphamap_fragment:Cf,alphamap_pars_fragment:Rf,alphatest_fragment:If,alphatest_pars_fragment:Pf,aomap_fragment:Lf,aomap_pars_fragment:Df,batching_pars_vertex:Nf,batching_vertex:Uf,begin_vertex:Ff,beginnormal_vertex:Of,bsdfs:Bf,iridescence_fragment:zf,bumpmap_pars_fragment:kf,clipping_planes_fragment:Vf,clipping_planes_pars_fragment:Gf,clipping_planes_pars_vertex:Hf,clipping_planes_vertex:Wf,color_fragment:Xf,color_pars_fragment:qf,color_pars_vertex:Yf,color_vertex:$f,common:Zf,cube_uv_reflection_fragment:Jf,defaultnormal_vertex:Kf,displacementmap_pars_vertex:jf,displacementmap_vertex:Qf,emissivemap_fragment:ep,emissivemap_pars_fragment:tp,colorspace_fragment:np,colorspace_pars_fragment:ip,envmap_fragment:sp,envmap_common_pars_fragment:rp,envmap_pars_fragment:ap,envmap_pars_vertex:op,envmap_physical_pars_fragment:xp,envmap_vertex:lp,fog_vertex:cp,fog_pars_vertex:hp,fog_fragment:up,fog_pars_fragment:dp,gradientmap_pars_fragment:fp,lightmap_pars_fragment:pp,lights_lambert_fragment:mp,lights_lambert_pars_fragment:gp,lights_pars_begin:_p,lights_toon_fragment:yp,lights_toon_pars_fragment:vp,lights_phong_fragment:Mp,lights_phong_pars_fragment:Sp,lights_physical_fragment:bp,lights_physical_pars_fragment:Ep,lights_fragment_begin:Tp,lights_fragment_maps:wp,lights_fragment_end:Ap,lightprobes_pars_fragment:Cp,logdepthbuf_fragment:Rp,logdepthbuf_pars_fragment:Ip,logdepthbuf_pars_vertex:Pp,logdepthbuf_vertex:Lp,map_fragment:Dp,map_pars_fragment:Np,map_particle_fragment:Up,map_particle_pars_fragment:Fp,metalnessmap_fragment:Op,metalnessmap_pars_fragment:Bp,morphinstance_vertex:zp,morphcolor_vertex:kp,morphnormal_vertex:Vp,morphtarget_pars_vertex:Gp,morphtarget_vertex:Hp,normal_fragment_begin:Wp,normal_fragment_maps:Xp,normal_pars_fragment:qp,normal_pars_vertex:Yp,normal_vertex:$p,normalmap_pars_fragment:Zp,clearcoat_normal_fragment_begin:Jp,clearcoat_normal_fragment_maps:Kp,clearcoat_pars_fragment:jp,iridescence_pars_fragment:Qp,opaque_fragment:em,packing:tm,premultiplied_alpha_fragment:nm,project_vertex:im,dithering_fragment:sm,dithering_pars_fragment:rm,roughnessmap_fragment:am,roughnessmap_pars_fragment:om,shadowmap_pars_fragment:lm,shadowmap_pars_vertex:cm,shadowmap_vertex:hm,shadowmask_pars_fragment:um,skinbase_vertex:dm,skinning_pars_vertex:fm,skinning_vertex:pm,skinnormal_vertex:mm,specularmap_fragment:gm,specularmap_pars_fragment:_m,tonemapping_fragment:xm,tonemapping_pars_fragment:ym,transmission_fragment:vm,transmission_pars_fragment:Mm,uv_pars_fragment:Sm,uv_pars_vertex:bm,uv_vertex:Em,worldpos_vertex:Tm,background_vert:wm,background_frag:Am,backgroundCube_vert:Cm,backgroundCube_frag:Rm,cube_vert:Im,cube_frag:Pm,depth_vert:Lm,depth_frag:Dm,distance_vert:Nm,distance_frag:Um,equirect_vert:Fm,equirect_frag:Om,linedashed_vert:Bm,linedashed_frag:zm,meshbasic_vert:km,meshbasic_frag:Vm,meshlambert_vert:Gm,meshlambert_frag:Hm,meshmatcap_vert:Wm,meshmatcap_frag:Xm,meshnormal_vert:qm,meshnormal_frag:Ym,meshphong_vert:$m,meshphong_frag:Zm,meshphysical_vert:Jm,meshphysical_frag:Km,meshtoon_vert:jm,meshtoon_frag:Qm,points_vert:eg,points_frag:tg,shadow_vert:ng,shadow_frag:ig,sprite_vert:sg,sprite_frag:rg},pe={common:{diffuse:{value:new Be(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new Re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Be(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new U},probesMax:{value:new U},probesResolution:{value:new U}},points:{diffuse:{value:new Be(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Be(16777215)},opacity:{value:1},center:{value:new Re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},Ln={basic:{uniforms:Ot([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:We.meshbasic_vert,fragmentShader:We.meshbasic_frag},lambert:{uniforms:Ot([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},envMapIntensity:{value:1}}]),vertexShader:We.meshlambert_vert,fragmentShader:We.meshlambert_frag},phong:{uniforms:Ot([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},specular:{value:new Be(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:We.meshphong_vert,fragmentShader:We.meshphong_frag},standard:{uniforms:Ot([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag},toon:{uniforms:Ot([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Be(0)}}]),vertexShader:We.meshtoon_vert,fragmentShader:We.meshtoon_frag},matcap:{uniforms:Ot([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:We.meshmatcap_vert,fragmentShader:We.meshmatcap_frag},points:{uniforms:Ot([pe.points,pe.fog]),vertexShader:We.points_vert,fragmentShader:We.points_frag},dashed:{uniforms:Ot([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:We.linedashed_vert,fragmentShader:We.linedashed_frag},depth:{uniforms:Ot([pe.common,pe.displacementmap]),vertexShader:We.depth_vert,fragmentShader:We.depth_frag},normal:{uniforms:Ot([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:We.meshnormal_vert,fragmentShader:We.meshnormal_frag},sprite:{uniforms:Ot([pe.sprite,pe.fog]),vertexShader:We.sprite_vert,fragmentShader:We.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:We.background_vert,fragmentShader:We.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:We.backgroundCube_vert,fragmentShader:We.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:We.cube_vert,fragmentShader:We.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:We.equirect_vert,fragmentShader:We.equirect_frag},distance:{uniforms:Ot([pe.common,pe.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:We.distance_vert,fragmentShader:We.distance_frag},shadow:{uniforms:Ot([pe.lights,pe.fog,{color:{value:new Be(0)},opacity:{value:1}}]),vertexShader:We.shadow_vert,fragmentShader:We.shadow_frag}};Ln.physical={uniforms:Ot([Ln.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new Re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Be(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new Re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Be(0)},specularColor:{value:new Be(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new Re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag};var mo={r:0,b:0,g:0},ag=new rt,Nu=new ke;Nu.set(-1,0,0,0,1,0,0,0,1);function og(i,e,t,n,s,r){let a=new Be(0),o=s===!0?0:1,l,c,u=null,m=0,h=null;function f(T){let A=T.isScene===!0?T.background:null;if(A&&A.isTexture){let M=T.backgroundBlurriness>0;A=e.get(A,M)}return A}function x(T){let A=!1,M=f(T);M===null?p(a,o):M&&M.isColor&&(p(M,1),A=!0);let _=i.xr.getEnvironmentBlendMode();_==="additive"?t.buffers.color.setClear(0,0,0,1,r):_==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(T,A){let M=f(A);M&&(M.isCubeTexture||M.mapping===Qs)?(c===void 0&&(c=new pt(new rn(1,1,1),new jt({name:"BackgroundCubeMaterial",uniforms:Ei(Ln.backgroundCube.uniforms),vertexShader:Ln.backgroundCube.vertexShader,fragmentShader:Ln.backgroundCube.fragmentShader,side:Wt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(_,S,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=M,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(ag.makeRotationFromEuler(A.backgroundRotation)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Nu),c.material.toneMapped=Je.getTransfer(M.colorSpace)!==nt,(u!==M||m!==M.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=M,m=M.version,h=i.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new pt(new Hs(2,2),new jt({name:"BackgroundMaterial",uniforms:Ei(Ln.background.uniforms),vertexShader:Ln.background.vertexShader,fragmentShader:Ln.background.fragmentShader,side:Rn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=Je.getTransfer(M.colorSpace)!==nt,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||m!==M.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=M,m=M.version,h=i.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null))}function p(T,A){T.getRGB(mo,Gl(i)),t.buffers.color.setClear(mo.r,mo.g,mo.b,A,r)}function d(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(T,A=1){a.set(T),o=A,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(T){o=T,p(a,o)},render:x,addToRenderList:v,dispose:d}}function lg(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(L,D,k,P,H){let $=!1,Y=m(L,P,k,D);r!==Y&&(r=Y,c(r.object)),$=f(L,P,k,H),$&&x(L,P,k,H),H!==null&&e.update(H,i.ELEMENT_ARRAY_BUFFER),($||a)&&(a=!1,M(L,D,k,P),H!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function l(){return i.createVertexArray()}function c(L){return i.bindVertexArray(L)}function u(L){return i.deleteVertexArray(L)}function m(L,D,k,P){let H=P.wireframe===!0,$=n[D.id];$===void 0&&($={},n[D.id]=$);let Y=L.isInstancedMesh===!0?L.id:0,I=$[Y];I===void 0&&(I={},$[Y]=I);let N=I[k.id];N===void 0&&(N={},I[k.id]=N);let z=N[H];return z===void 0&&(z=h(l()),N[H]=z),z}function h(L){let D=[],k=[],P=[];for(let H=0;H<t;H++)D[H]=0,k[H]=0,P[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:k,attributeDivisors:P,object:L,attributes:{},index:null}}function f(L,D,k,P){let H=r.attributes,$=D.attributes,Y=0,I=k.getAttributes();for(let N in I)if(I[N].location>=0){let V=H[N],se=$[N];if(se===void 0&&(N==="instanceMatrix"&&L.instanceMatrix&&(se=L.instanceMatrix),N==="instanceColor"&&L.instanceColor&&(se=L.instanceColor)),V===void 0||V.attribute!==se||se&&V.data!==se.data)return!0;Y++}return r.attributesNum!==Y||r.index!==P}function x(L,D,k,P){let H={},$=D.attributes,Y=0,I=k.getAttributes();for(let N in I)if(I[N].location>=0){let V=$[N];V===void 0&&(N==="instanceMatrix"&&L.instanceMatrix&&(V=L.instanceMatrix),N==="instanceColor"&&L.instanceColor&&(V=L.instanceColor));let se={};se.attribute=V,V&&V.data&&(se.data=V.data),H[N]=se,Y++}r.attributes=H,r.attributesNum=Y,r.index=P}function v(){let L=r.newAttributes;for(let D=0,k=L.length;D<k;D++)L[D]=0}function p(L){d(L,0)}function d(L,D){let k=r.newAttributes,P=r.enabledAttributes,H=r.attributeDivisors;k[L]=1,P[L]===0&&(i.enableVertexAttribArray(L),P[L]=1),H[L]!==D&&(i.vertexAttribDivisor(L,D),H[L]=D)}function T(){let L=r.newAttributes,D=r.enabledAttributes;for(let k=0,P=D.length;k<P;k++)D[k]!==L[k]&&(i.disableVertexAttribArray(k),D[k]=0)}function A(L,D,k,P,H,$,Y){Y===!0?i.vertexAttribIPointer(L,D,k,H,$):i.vertexAttribPointer(L,D,k,P,H,$)}function M(L,D,k,P){v();let H=P.attributes,$=k.getAttributes(),Y=D.defaultAttributeValues;for(let I in $){let N=$[I];if(N.location>=0){let z=H[I];if(z===void 0&&(I==="instanceMatrix"&&L.instanceMatrix&&(z=L.instanceMatrix),I==="instanceColor"&&L.instanceColor&&(z=L.instanceColor)),z!==void 0){let V=z.normalized,se=z.itemSize,K=e.get(z);if(K===void 0)continue;let me=K.buffer,Me=K.type,ze=K.bytesPerElement,Z=Me===i.INT||Me===i.UNSIGNED_INT||z.gpuType===Ca;if(z.isInterleavedBufferAttribute){let ee=z.data,ve=ee.stride,De=z.offset;if(ee.isInstancedInterleavedBuffer){for(let xe=0;xe<N.locationSize;xe++)d(N.location+xe,ee.meshPerAttribute);L.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let xe=0;xe<N.locationSize;xe++)p(N.location+xe);i.bindBuffer(i.ARRAY_BUFFER,me);for(let xe=0;xe<N.locationSize;xe++)A(N.location+xe,se/N.locationSize,Me,V,ve*ze,(De+se/N.locationSize*xe)*ze,Z)}else{if(z.isInstancedBufferAttribute){for(let ee=0;ee<N.locationSize;ee++)d(N.location+ee,z.meshPerAttribute);L.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=z.meshPerAttribute*z.count)}else for(let ee=0;ee<N.locationSize;ee++)p(N.location+ee);i.bindBuffer(i.ARRAY_BUFFER,me);for(let ee=0;ee<N.locationSize;ee++)A(N.location+ee,se/N.locationSize,Me,V,se*ze,se/N.locationSize*ee*ze,Z)}}else if(Y!==void 0){let V=Y[I];if(V!==void 0)switch(V.length){case 2:i.vertexAttrib2fv(N.location,V);break;case 3:i.vertexAttrib3fv(N.location,V);break;case 4:i.vertexAttrib4fv(N.location,V);break;default:i.vertexAttrib1fv(N.location,V)}}}}T()}function _(){E();for(let L in n){let D=n[L];for(let k in D){let P=D[k];for(let H in P){let $=P[H];for(let Y in $)u($[Y].object),delete $[Y];delete P[H]}}delete n[L]}}function S(L){if(n[L.id]===void 0)return;let D=n[L.id];for(let k in D){let P=D[k];for(let H in P){let $=P[H];for(let Y in $)u($[Y].object),delete $[Y];delete P[H]}}delete n[L.id]}function w(L){for(let D in n){let k=n[D];for(let P in k){let H=k[P];if(H[L.id]===void 0)continue;let $=H[L.id];for(let Y in $)u($[Y].object),delete $[Y];delete H[L.id]}}}function g(L){for(let D in n){let k=n[D],P=L.isInstancedMesh===!0?L.id:0,H=k[P];if(H!==void 0){for(let $ in H){let Y=H[$];for(let I in Y)u(Y[I].object),delete Y[I];delete H[$]}delete k[P],Object.keys(k).length===0&&delete n[D]}}}function E(){C(),a=!0,r!==s&&(r=s,c(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:E,resetDefaultState:C,dispose:_,releaseStatesOfGeometry:S,releaseStatesOfObject:g,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:p,disableUnusedAttributes:T}}function cg(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let f=0;f<u;f++)h+=c[f];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function hg(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let w=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==cn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){let g=w===xn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==$t&&w!==ln&&!g&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(Fe("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let m=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&Fe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),T=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),_=i.getParameter(i.MAX_SAMPLES),S=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:m,reversedDepthBuffer:h,maxTextures:f,maxVertexTextures:x,maxTextureSize:v,maxCubemapSize:p,maxAttributes:d,maxVertexUniforms:T,maxVaryings:A,maxFragmentUniforms:M,maxSamples:_,samples:S}}function ug(i){let e=this,t=null,n=0,s=!1,r=!1,a=new pn,o=new ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(m,h){let f=m.length!==0||h||n!==0||s;return s=h,n=m.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(m,h){t=u(m,h,0)},this.setState=function(m,h,f){let x=m.clippingPlanes,v=m.clipIntersection,p=m.clipShadows,d=i.get(m);if(!s||x===null||x.length===0||r&&!p)r?u(null):c();else{let T=r?0:n,A=T*4,M=d.clippingState||null;l.value=M,M=u(x,h,A,f);for(let _=0;_!==A;++_)M[_]=t[_];d.clippingState=M,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(m,h,f,x){let v=m!==null?m.length:0,p=null;if(v!==0){if(p=l.value,x!==!0||p===null){let d=f+v*4,T=h.matrixWorldInverse;o.getNormalMatrix(T),(p===null||p.length<d)&&(p=new Float32Array(d));for(let A=0,M=f;A!==v;++A,M+=4)a.copy(m[A]).applyMatrix4(T,o),a.normal.toArray(p,M),p[M+3]=a.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,p}}var cs=4,dg=6,fg=20,pg=256,lr=new ns,du=new Be,ql=null,Yl=0,$l=0,Zl=!1,mg=new U,Ti=new U,_o=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=mg}=r;ql=this._renderer.getRenderTarget(),Yl=this._renderer.getActiveCubeFace(),$l=this._renderer.getActiveMipmapLevel(),Zl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=mu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=pu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ql,Yl,$l),this._renderer.xr.enabled=Zl,e.scissorTest=!1,ls(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ai||e.mapping===bi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ql=this._renderer.getRenderTarget(),Yl=this._renderer.getActiveCubeFace(),$l=this._renderer.getActiveMipmapLevel(),Zl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:It,minFilter:It,generateMipmaps:!1,type:xn,format:cn,colorSpace:ws,depthBuffer:!1},s=fu(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=fu(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=gg(r)),this._blurMaterial=xg(r,e,t),this._ggxMaterial=_g(r,e,t)}return s}_compileMaterial(e){let t=new pt(new bt,e);this._renderer.compile(t,lr)}_sceneToCubeUV(e,t,n,s,r){let l=new Ft(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],m=this._renderer,h=m.autoClear,f=m.toneMapping;m.getClearColor(du),m.toneMapping=gn,m.autoClear=!1,m.state.buffers.depth.getReversed()&&(m.setRenderTarget(s),m.clearDepth(),m.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new pt(new rn,new yi({name:"PMREM.Background",side:Wt,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,p=v.material,d=!1,T=e.background;T?T.isColor&&(p.color.copy(T),e.background=null,d=!0):(p.color.copy(du),d=!0);for(let A=0;A<6;A++){let M=A%3;M===0?(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[A],r.y,r.z)):M===1?(l.up.set(0,0,c[A]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[A],r.z)):(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[A]));let _=this._cubeSize;ls(s,M*_,A>2?_:0,_,_),m.setRenderTarget(s),d&&m.render(v,l),m.render(e,l)}m.toneMapping=f,m.autoClear=h,e.background=T}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===ai||e.mapping===bi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=mu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=pu());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;ls(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,lr)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),m=Math.sqrt(c*c-u*u),h=c*1.25,f=m*h,{_lodMax:x}=this,v=this._sizeLods[n],p=3*v*(n>x-cs?n-x+cs:0),d=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=x-t,ls(r,p,d,3*v,2*v),s.setRenderTarget(r),s.render(o,lr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=x-n,ls(e,p,d,3*v,2*v),s.setRenderTarget(e),s.render(o,lr)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let u=this._sizeLods[s],m=3*u*(s>this._lodMax-cs?s-this._lodMax+cs:0),h=4*(this._cubeSize-u);ls(t,m,h,3*u,2*u),a.setRenderTarget(t),a.render(l,lr)}};function gg(i){let e=[],t=[],n=i,s=i-cs+1+dg;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),l=-o,c=1+o,u=[l,l,c,l,c,c,l,l,c,c,l,c],m=6,h=6,f=3,x=new Float32Array(f*h*m),v=new Float32Array(f*h*m);for(let d=0;d<m;d++){let T=d%3*2/3-1,A=d>2?0:-1,M=[T,A,0,T+2/3,A,0,T+2/3,A+1,0,T,A,0,T+2/3,A+1,0,T,A+1,0];x.set(M,f*h*d);for(let _=0;_<h;_++){let S=u[_*2]*2-1,w=u[_*2+1]*2-1;d===0?Ti.set(1,w,S):d===1?Ti.set(-S,1,-w):d===2?Ti.set(-S,w,1):d===3?Ti.set(-1,w,-S):d===4?Ti.set(-S,-1,w):Ti.set(S,w,-1),Ti.toArray(v,(d*h+_)*f)}}let p=new bt;p.setAttribute("position",new Kt(x,f)),p.setAttribute("outputDirection",new Kt(v,f)),t.push(new pt(p,null)),n>cs&&n--}return{lodMeshes:t,sizeLods:e}}function fu(i,e,t){let n=new Yt(i,e,t);return n.texture.mapping=Qs,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ls(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function _g(i,e,t){return new jt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:pg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:vo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function xg(i,e,t){return new jt({name:"SphericalGaussianBlur",defines:{SAMPLES:fg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:vo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function pu(){return new jt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:vo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function mu(){return new jt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:vo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function vo(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var xo=class extends Yt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Os(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new rn(5,5,5),r=new jt({name:"CubemapFromEquirect",uniforms:Ei(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Wt,blending:In});r.uniforms.tEquirect.value=t;let a=new pt(s,r),o=t.minFilter;return t.minFilter===oi&&(t.minFilter=It),new Ma(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function yg(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,f=!1){return h==null?null:f?a(h):r(h)}function r(h){if(h&&h.isTexture){let f=h.mapping;if(f===Ta||f===wa)if(e.has(h)){let x=e.get(h).texture;return o(x,h.mapping)}else{let x=h.image;if(x&&x.height>0){let v=new xo(x.height);return v.fromEquirectangularTexture(i,h),e.set(h,v),h.addEventListener("dispose",c),o(v.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let f=h.mapping,x=f===Ta||f===wa,v=f===ai||f===bi;if(x||v){let p=t.get(h),d=p!==void 0?p.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==d)return n===null&&(n=new _o(i)),p=x?n.fromEquirectangular(h,p):n.fromCubemap(h,p),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),p.texture;if(p!==void 0)return p.texture;{let T=h.image;return x&&T&&T.height>0||v&&T&&l(T)?(n===null&&(n=new _o(i)),p=x?n.fromEquirectangular(h):n.fromCubemap(h),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),h.addEventListener("dispose",u),p.texture):null}}}return h}function o(h,f){return f===Ta?h.mapping=ai:f===wa&&(h.mapping=bi),h}function l(h){let f=0,x=6;for(let v=0;v<x;v++)h[v]!==void 0&&f++;return f===x}function c(h){let f=h.target;f.removeEventListener("dispose",c);let x=e.get(f);x!==void 0&&(e.delete(f),x.dispose())}function u(h){let f=h.target;f.removeEventListener("dispose",u);let x=t.get(f);x!==void 0&&(t.delete(f),x.dispose())}function m(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:m}}function vg(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&xi("WebGLRenderer: "+n+" extension not supported."),s}}}function Mg(i,e,t,n){let s={},r=new WeakMap;function a(m){let h=m.target;h.index!==null&&e.remove(h.index);for(let x in h.attributes)e.remove(h.attributes[x]);h.removeEventListener("dispose",a),delete s[h.id];let f=r.get(h);f&&(e.remove(f),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(m,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,t.memory.geometries++),h}function l(m){let h=m.attributes;for(let f in h)e.update(h[f],i.ARRAY_BUFFER)}function c(m){let h=[],f=m.index,x=m.attributes.position,v=0;if(x===void 0)return;if(f!==null){let T=f.array;v=f.version;for(let A=0,M=T.length;A<M;A+=3){let _=T[A+0],S=T[A+1],w=T[A+2];h.push(_,S,S,w,w,_)}}else{let T=x.array;v=x.version;for(let A=0,M=T.length/3-1;A<M;A+=3){let _=A+0,S=A+1,w=A+2;h.push(_,S,S,w,w,_)}}let p=new(x.count>=65535?Ds:Ls)(h,1);p.version=v;let d=r.get(m);d&&e.remove(d),r.set(m,p)}function u(m){let h=r.get(m);if(h){let f=m.index;f!==null&&h.version<f.version&&c(m)}else c(m);return r.get(m)}return{get:o,update:l,getWireframeAttribute:u}}function Sg(i,e,t){let n;function s(m){n=m}let r,a;function o(m){r=m.type,a=m.bytesPerElement}function l(m,h){i.drawElements(n,h,r,m*a),t.update(h,n,1)}function c(m,h,f){f!==0&&(i.drawElementsInstanced(n,h,r,m*a,f),t.update(h,n,f))}function u(m,h,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,m,0,f);let v=0;for(let p=0;p<f;p++)v+=h[p];t.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function bg(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Oe("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Eg(i,e,t){let n=new WeakMap,s=new dt;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,m=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==m){let E=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",E)};h!==void 0&&h.texture.dispose();let f=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],T=o.morphAttributes.color||[],A=0;f===!0&&(A=1),x===!0&&(A=2),v===!0&&(A=3);let M=o.attributes.position.count*A,_=1;M>e.maxTextureSize&&(_=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let S=new Float32Array(M*_*4*m),w=new Rs(S,M,_,m);w.type=ln,w.needsUpdate=!0;let g=A*4;for(let C=0;C<m;C++){let L=p[C],D=d[C],k=T[C],P=M*_*4*C;for(let H=0;H<L.count;H++){let $=H*g;f===!0&&(s.fromBufferAttribute(L,H),S[P+$+0]=s.x,S[P+$+1]=s.y,S[P+$+2]=s.z,S[P+$+3]=0),x===!0&&(s.fromBufferAttribute(D,H),S[P+$+4]=s.x,S[P+$+5]=s.y,S[P+$+6]=s.z,S[P+$+7]=0),v===!0&&(s.fromBufferAttribute(k,H),S[P+$+8]=s.x,S[P+$+9]=s.y,S[P+$+10]=s.z,S[P+$+11]=k.itemSize===4?s.w:1)}}h={count:m,texture:w,size:new Re(M,_)},n.set(o,h),o.addEventListener("dispose",E)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let x=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function Tg(i,e,t,n,s){let r=new WeakMap;function a(c){let u=s.render.frame,m=c.geometry,h=e.get(c,m);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return h}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}var wg={[El]:"LINEAR_TONE_MAPPING",[Tl]:"REINHARD_TONE_MAPPING",[wl]:"CINEON_TONE_MAPPING",[js]:"ACES_FILMIC_TONE_MAPPING",[Cl]:"AGX_TONE_MAPPING",[Rl]:"NEUTRAL_TONE_MAPPING",[Al]:"CUSTOM_TONE_MAPPING"};function Ag(i,e,t,n,s,r){let a=new Yt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new bt;c.setAttribute("position",new Ke([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Ke([0,2,0,0,2,0],2));let u=new oa({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),m=new pt(c,u),h=new ns(-1,1,1,-1,0,1),f=null,x=null,v=!1,p,d=null,T=[],A=!1;this.setSize=function(M,_){a.setSize(M,_),o!==null&&o.setSize(M,_),l!==null&&l.setSize(M,_);for(let S=0;S<T.length;S++){let w=T[S];w.setSize&&w.setSize(M,_)}},this.setEffects=function(M){T=M,A=T.length>0&&T[0].isRenderPass===!0;let _=a.width,S=a.height;T.length>0&&o===null&&(o=new Yt(_,S,{type:xn,depthBuffer:!1,stencilBuffer:!1}),l=new Yt(_,S,{type:xn,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<T.length;w++){let g=T[w];g.setSize&&g.setSize(_,S)}},this.begin=function(M,_){if(v||M.toneMapping===gn&&T.length===0)return!1;if(d=_,_!==null){let S=_.width,w=_.height;(a.width!==S||a.height!==w)&&this.setSize(S,w)}return A===!1&&M.setRenderTarget(a),p=M.toneMapping,M.toneMapping=gn,!0},this.hasRenderPass=function(){return A},this.end=function(M,_){M.toneMapping=p,v=!0;let S=a,w=o;for(let g=0;g<T.length;g++){let E=T[g];E.enabled!==!1&&(E.render(M,w,S,_),E.needsSwap!==!1&&(S=w,w=w===o?l:o))}if(f!==M.outputColorSpace||x!==M.toneMapping){f=M.outputColorSpace,x=M.toneMapping,u.defines={},Je.getTransfer(f)===nt&&(u.defines.SRGB_TRANSFER="");let g=wg[x];g&&(u.defines[g]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=S.texture,M.setRenderTarget(d),M.render(m,h),d=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}var Uu=new qt,jl=new ti(1,1),Fu=new Rs,Ou=new Kr,Bu=new Os,gu=[],_u=[],xu=new Float32Array(16),yu=new Float32Array(9),vu=new Float32Array(4);function us(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=gu[s];if(r===void 0&&(r=new Float32Array(s),gu[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Tt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function wt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Mo(i,e){let t=_u[e];t===void 0&&(t=new Int32Array(e),_u[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Cg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Rg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2fv(this.addr,e),wt(t,e)}}function Ig(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Tt(t,e))return;i.uniform3fv(this.addr,e),wt(t,e)}}function Pg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4fv(this.addr,e),wt(t,e)}}function Lg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;vu.set(n),i.uniformMatrix2fv(this.addr,!1,vu),wt(t,n)}}function Dg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;yu.set(n),i.uniformMatrix3fv(this.addr,!1,yu),wt(t,n)}}function Ng(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Tt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,n))return;xu.set(n),i.uniformMatrix4fv(this.addr,!1,xu),wt(t,n)}}function Ug(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Fg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2iv(this.addr,e),wt(t,e)}}function Og(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;i.uniform3iv(this.addr,e),wt(t,e)}}function Bg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4iv(this.addr,e),wt(t,e)}}function zg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function kg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;i.uniform2uiv(this.addr,e),wt(t,e)}}function Vg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;i.uniform3uiv(this.addr,e),wt(t,e)}}function Gg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;i.uniform4uiv(this.addr,e),wt(t,e)}}function Hg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(jl.compareFunction=t.isReversedDepthBuffer()?fo:uo,r=jl):r=Uu,t.setTexture2D(e||r,s)}function Wg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Ou,s)}function Xg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Bu,s)}function qg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Fu,s)}function Yg(i){switch(i){case 5126:return Cg;case 35664:return Rg;case 35665:return Ig;case 35666:return Pg;case 35674:return Lg;case 35675:return Dg;case 35676:return Ng;case 5124:case 35670:return Ug;case 35667:case 35671:return Fg;case 35668:case 35672:return Og;case 35669:case 35673:return Bg;case 5125:return zg;case 36294:return kg;case 36295:return Vg;case 36296:return Gg;case 35678:case 36198:case 36298:case 36306:case 35682:return Hg;case 35679:case 36299:case 36307:return Wg;case 35680:case 36300:case 36308:case 36293:return Xg;case 36289:case 36303:case 36311:case 36292:return qg}}function $g(i,e){i.uniform1fv(this.addr,e)}function Zg(i,e){let t=us(e,this.size,2);i.uniform2fv(this.addr,t)}function Jg(i,e){let t=us(e,this.size,3);i.uniform3fv(this.addr,t)}function Kg(i,e){let t=us(e,this.size,4);i.uniform4fv(this.addr,t)}function jg(i,e){let t=us(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Qg(i,e){let t=us(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function e0(i,e){let t=us(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function t0(i,e){i.uniform1iv(this.addr,e)}function n0(i,e){i.uniform2iv(this.addr,e)}function i0(i,e){i.uniform3iv(this.addr,e)}function s0(i,e){i.uniform4iv(this.addr,e)}function r0(i,e){i.uniform1uiv(this.addr,e)}function a0(i,e){i.uniform2uiv(this.addr,e)}function o0(i,e){i.uniform3uiv(this.addr,e)}function l0(i,e){i.uniform4uiv(this.addr,e)}function c0(i,e,t){let n=this.cache,s=e.length,r=Mo(t,s);Tt(n,r)||(i.uniform1iv(this.addr,r),wt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=jl:a=Uu;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function h0(i,e,t){let n=this.cache,s=e.length,r=Mo(t,s);Tt(n,r)||(i.uniform1iv(this.addr,r),wt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Ou,r[a])}function u0(i,e,t){let n=this.cache,s=e.length,r=Mo(t,s);Tt(n,r)||(i.uniform1iv(this.addr,r),wt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Bu,r[a])}function d0(i,e,t){let n=this.cache,s=e.length,r=Mo(t,s);Tt(n,r)||(i.uniform1iv(this.addr,r),wt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Fu,r[a])}function f0(i){switch(i){case 5126:return $g;case 35664:return Zg;case 35665:return Jg;case 35666:return Kg;case 35674:return jg;case 35675:return Qg;case 35676:return e0;case 5124:case 35670:return t0;case 35667:case 35671:return n0;case 35668:case 35672:return i0;case 35669:case 35673:return s0;case 5125:return r0;case 36294:return a0;case 36295:return o0;case 36296:return l0;case 35678:case 36198:case 36298:case 36306:case 35682:return c0;case 35679:case 36299:case 36307:return h0;case 35680:case 36300:case 36308:case 36293:return u0;case 36289:case 36303:case 36311:case 36292:return d0}}var Ql=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Yg(t.type)}},ec=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=f0(t.type)}},tc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Jl=/(\w+)(\])?(\[|\.)?/g;function Mu(i,e){i.seq.push(e),i.map[e.id]=e}function p0(i,e,t){let n=i.name,s=n.length;for(Jl.lastIndex=0;;){let r=Jl.exec(n),a=Jl.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Mu(t,c===void 0?new Ql(o,i,e):new ec(o,i,e));break}else{let m=t.map[o];m===void 0&&(m=new tc(o),Mu(t,m)),t=m}}}var hs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);p0(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Su(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var m0=37297,g0=0;function _0(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var bu=new ke;function x0(i){Je._getMatrix(bu,Je.workingColorSpace,i);let e=`mat3( ${bu.elements.map(t=>t.toFixed(4))} )`;switch(Je.getTransfer(i)){case As:return[e,"LinearTransferOETF"];case nt:return[e,"sRGBTransferOETF"];default:return Fe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Eu(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+_0(i.getShaderSource(e),o)}else return r}function y0(i,e){let t=x0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var v0={[El]:"Linear",[Tl]:"Reinhard",[wl]:"Cineon",[js]:"ACESFilmic",[Cl]:"AgX",[Rl]:"Neutral",[Al]:"Custom"};function M0(i,e){let t=v0[e];return t===void 0?(Fe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var go=new U;function S0(){Je.getLuminanceCoefficients(go);let i=go.x.toFixed(4),e=go.y.toFixed(4),t=go.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function b0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(hr).join(`
`)}function E0(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function T0(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function hr(i){return i!==""}function Tu(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function wu(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var w0=/^[ \t]*#include +<([\w\d./]+)>/gm;function nc(i){return i.replace(w0,C0)}var A0=new Map;function C0(i,e){let t=We[e];if(t===void 0){let n=A0.get(e);if(n!==void 0)t=We[n],Fe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return nc(t)}var R0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Au(i){return i.replace(R0,I0)}function I0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Cu(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var P0={[Ks]:"SHADOWMAP_TYPE_PCF",[is]:"SHADOWMAP_TYPE_VSM"};function L0(i){return P0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var D0={[ai]:"ENVMAP_TYPE_CUBE",[bi]:"ENVMAP_TYPE_CUBE",[Qs]:"ENVMAP_TYPE_CUBE_UV"};function N0(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":D0[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var U0={[bi]:"ENVMAP_MODE_REFRACTION"};function F0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":U0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var O0={[Ea]:"ENVMAP_BLENDING_MULTIPLY",[Xh]:"ENVMAP_BLENDING_MIX",[qh]:"ENVMAP_BLENDING_ADD"};function B0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":O0[i.combine]||"ENVMAP_BLENDING_NONE"}function z0(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function k0(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=L0(t),c=N0(t),u=F0(t),m=B0(t),h=z0(t),f=b0(t),x=E0(r),v=s.createProgram(),p,d,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(hr).join(`
`),p.length>0&&(p+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(hr).join(`
`),d.length>0&&(d+=`
`)):(p=[Cu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(hr).join(`
`),d=[Cu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+m:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==gn?"#define TONE_MAPPING":"",t.toneMapping!==gn?We.tonemapping_pars_fragment:"",t.toneMapping!==gn?M0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",We.colorspace_pars_fragment,y0("linearToOutputTexel",t.outputColorSpace),S0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(hr).join(`
`)),a=nc(a),a=Tu(a,t),a=wu(a,t),o=nc(o),o=Tu(o,t),o=wu(o,t),a=Au(a),o=Au(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,d=["#define varying in",t.glslVersion===Ol?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ol?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let A=T+p+a,M=T+d+o,_=Su(s,s.VERTEX_SHADER,A),S=Su(s,s.FRAGMENT_SHADER,M);s.attachShader(v,_),s.attachShader(v,S),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function w(L){if(i.debug.checkShaderErrors){let D=s.getProgramInfoLog(v)||"",k=s.getShaderInfoLog(_)||"",P=s.getShaderInfoLog(S)||"",H=D.trim(),$=k.trim(),Y=P.trim(),I=!0,N=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(I=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,_,S);else{let z=Eu(s,_,"vertex"),V=Eu(s,S,"fragment");Oe("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+H+`
`+z+`
`+V)}else H!==""?Fe("WebGLProgram: Program Info Log:",H):($===""||Y==="")&&(N=!1);N&&(L.diagnostics={runnable:I,programLog:H,vertexShader:{log:$,prefix:p},fragmentShader:{log:Y,prefix:d}})}s.deleteShader(_),s.deleteShader(S),g=new hs(s,v),E=T0(s,v)}let g;this.getUniforms=function(){return g===void 0&&w(this),g};let E;this.getAttributes=function(){return E===void 0&&w(this),E};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(v,m0)),C},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=g0++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=_,this.fragmentShader=S,this}var V0=0,ic=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new sc(e),t.set(e,n)),n}},sc=class{constructor(e){this.id=V0++,this.code=e,this.usedTimes=0}};function G0(i){return i===ci||i===rr||i===ar}function H0(i,e,t,n,s,r){let a=new Ki,o=new ic,l=new Set,c=[],u=new Map,m=n.logarithmicDepthBuffer,h=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(g){return l.add(g),g===0?"uv":`uv${g}`}function v(g,E,C,L,D,k){let P=L.fog,H=D.geometry,$=g.isMeshStandardMaterial||g.isMeshLambertMaterial||g.isMeshPhongMaterial?L.environment:null,Y=g.isMeshStandardMaterial||g.isMeshLambertMaterial&&!g.envMap||g.isMeshPhongMaterial&&!g.envMap,I=e.get(g.envMap||$,Y),N=I&&I.mapping===Qs?I.image.height:null,z=f[g.type];g.precision!==null&&(h=n.getMaxPrecision(g.precision),h!==g.precision&&Fe("WebGLProgram.getParameters:",g.precision,"not supported, using",h,"instead."));let V=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,se=V!==void 0?V.length:0,K=0;H.morphAttributes.position!==void 0&&(K=1),H.morphAttributes.normal!==void 0&&(K=2),H.morphAttributes.color!==void 0&&(K=3);let me,Me,ze,Z;if(z){let lt=Ln[z];me=lt.vertexShader,Me=lt.fragmentShader}else{me=g.vertexShader,Me=g.fragmentShader;let lt=o.getVertexShaderStage(g),et=o.getFragmentShaderStage(g);o.update(g,lt,et),ze=lt.id,Z=et.id}let ee=i.getRenderTarget(),ve=i.state.buffers.depth.getReversed(),De=D.isInstancedMesh===!0,xe=D.isBatchedMesh===!0,re=!!g.map,qe=!!g.matcap,be=!!I,Ie=!!g.aoMap,Ye=!!g.lightMap,Ge=!!g.bumpMap&&g.wireframe===!1,ot=!!g.normalMap,xt=!!g.displacementMap,gt=!!g.emissiveMap,ft=!!g.metalnessMap,yt=!!g.roughnessMap,B=g.anisotropy>0,Lt=g.clearcoat>0,it=g.dispersion>0,R=g.retroreflectivity>0,y=g.iridescence>0,G=g.sheen>0,q=g.transmission>0,j=B&&!!g.anisotropyMap,oe=Lt&&!!g.clearcoatMap,le=Lt&&!!g.clearcoatNormalMap,Q=Lt&&!!g.clearcoatRoughnessMap,ne=y&&!!g.iridescenceMap,ce=y&&!!g.iridescenceThicknessMap,Pe=G&&!!g.sheenColorMap,fe=G&&!!g.sheenRoughnessMap,he=!!g.specularMap,Le=!!g.specularColorMap,Ue=!!g.specularIntensityMap,Ve=q&&!!g.transmissionMap,O=q&&!!g.thicknessMap,ue=!!g.gradientMap,te=!!g.alphaMap,de=g.alphaTest>0,ye=!!g.alphaHash,ie=!!g.extensions,Ne=gn;g.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Ne=i.toneMapping);let Ae={shaderID:z,shaderType:g.type,shaderName:g.name,vertexShader:me,fragmentShader:Me,defines:g.defines,customVertexShaderID:ze,customFragmentShaderID:Z,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:h,batching:xe,batchingColor:xe&&D._colorsTexture!==null,instancing:De,instancingColor:De&&D.instanceColor!==null,instancingMorph:De&&D.morphTexture!==null,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:Je.workingColorSpace,alphaToCoverage:!!g.alphaToCoverage,map:re,matcap:qe,envMap:be,envMapMode:be&&I.mapping,envMapCubeUVHeight:N,aoMap:Ie,lightMap:Ye,bumpMap:Ge,normalMap:ot,displacementMap:xt,emissiveMap:gt,normalMapObjectSpace:ot&&g.normalMapType===Zh,normalMapTangentSpace:ot&&g.normalMapType===or,packedNormalMap:ot&&g.normalMapType===or&&G0(g.normalMap.format),metalnessMap:ft,roughnessMap:yt,anisotropy:B,anisotropyMap:j,clearcoat:Lt,clearcoatMap:oe,clearcoatNormalMap:le,clearcoatRoughnessMap:Q,dispersion:it,retroreflection:R,iridescence:y,iridescenceMap:ne,iridescenceThicknessMap:ce,sheen:G,sheenColorMap:Pe,sheenRoughnessMap:fe,specularMap:he,specularColorMap:Le,specularIntensityMap:Ue,transmission:q,transmissionMap:Ve,thicknessMap:O,gradientMap:ue,opaque:g.transparent===!1&&g.blending===ss&&g.alphaToCoverage===!1,alphaMap:te,alphaTest:de,alphaHash:ye,combine:g.combine,mapUv:re&&x(g.map.channel),aoMapUv:Ie&&x(g.aoMap.channel),lightMapUv:Ye&&x(g.lightMap.channel),bumpMapUv:Ge&&x(g.bumpMap.channel),normalMapUv:ot&&x(g.normalMap.channel),displacementMapUv:xt&&x(g.displacementMap.channel),emissiveMapUv:gt&&x(g.emissiveMap.channel),metalnessMapUv:ft&&x(g.metalnessMap.channel),roughnessMapUv:yt&&x(g.roughnessMap.channel),anisotropyMapUv:j&&x(g.anisotropyMap.channel),clearcoatMapUv:oe&&x(g.clearcoatMap.channel),clearcoatNormalMapUv:le&&x(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&x(g.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&x(g.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&x(g.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&x(g.sheenColorMap.channel),sheenRoughnessMapUv:fe&&x(g.sheenRoughnessMap.channel),specularMapUv:he&&x(g.specularMap.channel),specularColorMapUv:Le&&x(g.specularColorMap.channel),specularIntensityMapUv:Ue&&x(g.specularIntensityMap.channel),transmissionMapUv:Ve&&x(g.transmissionMap.channel),thicknessMapUv:O&&x(g.thicknessMap.channel),alphaMapUv:te&&x(g.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(ot||B),vertexNormals:!!H.attributes.normal,vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!H.attributes.uv&&(re||te),fog:!!P,useFog:g.fog===!0,fogExp2:!!P&&P.isFogExp2,flatShading:g.wireframe===!1&&(g.flatShading===!0||H.attributes.normal===void 0&&ot===!1&&(g.isMeshLambertMaterial||g.isMeshPhongMaterial||g.isMeshStandardMaterial||g.isMeshPhysicalMaterial)),sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:m,reversedDepthBuffer:ve,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:H.attributes.position!==void 0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:se,morphTextureStride:K,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:k.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:g.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ne,decodeVideoTexture:re&&g.map.isVideoTexture===!0&&Je.getTransfer(g.map.colorSpace)===nt,decodeVideoTextureEmissive:gt&&g.emissiveMap.isVideoTexture===!0&&Je.getTransfer(g.emissiveMap.colorSpace)===nt,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===Xt,flipSided:g.side===Wt,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:ie&&g.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ie&&g.extensions.multiDraw===!0||xe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return Ae.vertexUv1s=l.has(1),Ae.vertexUv2s=l.has(2),Ae.vertexUv3s=l.has(3),l.clear(),Ae}function p(g){let E=[];if(g.shaderID?E.push(g.shaderID):(E.push(g.customVertexShaderID),E.push(g.customFragmentShaderID)),g.defines!==void 0)for(let C in g.defines)E.push(C),E.push(g.defines[C]);return g.isRawShaderMaterial===!1&&(d(E,g),T(E,g),E.push(i.outputColorSpace)),E.push(g.customProgramCacheKey),E.join()}function d(g,E){g.push(E.precision),g.push(E.outputColorSpace),g.push(E.envMapMode),g.push(E.envMapCubeUVHeight),g.push(E.mapUv),g.push(E.alphaMapUv),g.push(E.lightMapUv),g.push(E.aoMapUv),g.push(E.bumpMapUv),g.push(E.normalMapUv),g.push(E.displacementMapUv),g.push(E.emissiveMapUv),g.push(E.metalnessMapUv),g.push(E.roughnessMapUv),g.push(E.anisotropyMapUv),g.push(E.clearcoatMapUv),g.push(E.clearcoatNormalMapUv),g.push(E.clearcoatRoughnessMapUv),g.push(E.iridescenceMapUv),g.push(E.iridescenceThicknessMapUv),g.push(E.sheenColorMapUv),g.push(E.sheenRoughnessMapUv),g.push(E.specularMapUv),g.push(E.specularColorMapUv),g.push(E.specularIntensityMapUv),g.push(E.transmissionMapUv),g.push(E.thicknessMapUv),g.push(E.combine),g.push(E.fogExp2),g.push(E.sizeAttenuation),g.push(E.morphTargetsCount),g.push(E.morphAttributeCount),g.push(E.numSunLights),g.push(E.numDirLights),g.push(E.numPointLights),g.push(E.numSpotLights),g.push(E.numSpotLightMaps),g.push(E.numHemiLights),g.push(E.numRectAreaLights),g.push(E.numSunLightShadows),g.push(E.numDirLightShadows),g.push(E.numPointLightShadows),g.push(E.numSpotLightShadows),g.push(E.numSpotLightShadowsWithMaps),g.push(E.numLightProbes),g.push(E.shadowMapType),g.push(E.toneMapping),g.push(E.numClippingPlanes),g.push(E.numClipIntersection),g.push(E.depthPacking)}function T(g,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.retroreflection&&a.enable(24),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),E.packedNormalMap&&a.enable(22),E.vertexNormals&&a.enable(23),g.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),E.numLightProbeGrids>0&&a.enable(22),E.hasPositionAttribute&&a.enable(23),g.push(a.mask)}function A(g){let E=f[g.type],C;if(E){let L=Ln[E];C=cu.clone(L.uniforms)}else C=g.uniforms;return C}function M(g,E){let C=u.get(E);return C!==void 0?++C.usedTimes:(C=new k0(i,E,g,s),c.push(C),u.set(E,C)),C}function _(g){if(--g.usedTimes===0){let E=c.indexOf(g);c[E]=c[c.length-1],c.pop(),u.delete(g.cacheKey),g.destroy()}}function S(g){o.remove(g)}function w(){o.dispose()}return{getParameters:v,getProgramCacheKey:p,getUniforms:A,acquireProgram:M,releaseProgram:_,releaseShaderCache:S,programs:c,dispose:w}}function W0(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function X0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Ru(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Iu(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h){let f=0;return h.isInstancedMesh&&(f+=2),h.isSkinnedMesh&&(f+=1),f}function o(h,f,x,v,p,d){let T=i[e];return T===void 0?(T={id:h.id,object:h,geometry:f,material:x,materialVariant:a(h),groupOrder:v,renderOrder:h.renderOrder,z:p,group:d},i[e]=T):(T.id=h.id,T.object=h,T.geometry=f,T.material=x,T.materialVariant=a(h),T.groupOrder=v,T.renderOrder=h.renderOrder,T.z=p,T.group=d),e++,T}function l(h,f,x,v,p,d,T){T.reversedDepth===!0&&(p=-p);let A=o(h,f,x,v,p,d);x.transmission>0?n.push(A):x.transparent===!0?s.push(A):t.push(A)}function c(h,f,x,v,p,d){let T=o(h,f,x,v,p,d);x.transmission>0?n.unshift(T):x.transparent===!0?s.unshift(T):t.unshift(T)}function u(h,f){t.length>1&&t.sort(h||X0),n.length>1&&n.sort(f||Ru),s.length>1&&s.sort(f||Ru)}function m(){for(let h=e,f=i.length;h<f;h++){let x=i[h];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:m,sort:u}}function q0(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new Iu,i.set(n,[a])):s>=r.length?(a=new Iu,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Y0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new U,color:new Be};break;case"SpotLight":t={position:new U,direction:new U,color:new Be,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new Be,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new Be,groundColor:new Be};break;case"RectAreaLight":t={color:new Be,position:new U,halfWidth:new U,halfHeight:new U};break}return i[e.id]=t,t}}}function $0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Z0=0;function J0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function K0(i){let e=new Y0,t=$0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);let s=new U,r=new rt,a=new rt;function o(c){let u=0,m=0,h=0;for(let D=0;D<9;D++)n.probe[D].set(0,0,0);let f=0,x=0,v=0,p=0,d=0,T=0,A=0,M=0,_=0,S=0,w=0,g=0,E=0,C=0;c.sort(J0);for(let D=0,k=c.length;D<k;D++){let P=c[D],H=P.color,$=P.intensity,Y=P.distance,I=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===ci?I=P.shadow.map.texture:I=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)u+=H.r*$,m+=H.g*$,h+=H.b*$;else if(P.isLightProbe){for(let N=0;N<9;N++)n.probe[N].addScaledVector(P.sh.coefficients[N],$);C++}else if(P.isSunLight){let N=e.get(P);if(N.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let z=P.shadow,V=t.get(P);V.shadowIntensity=z.intensity,V.shadowBias=z.bias,V.shadowNormalBias=z.normalBias,V.shadowRadius=z.radius,V.shadowMapSize.copy(z.mapSize).multiply(z.getFrameExtents()),n.sunShadow[x]=V,n.sunShadowMap[x]=I;let se=z.getViewportCount();for(let K=0;K<se;K++)n.sunShadowMatrix[v+K]=z.getMatrix(K),n.sunShadowCascade[v+K]=z._cascadeData[K];v+=se,x++}n.sun[f]=N,f++}else if(P.isDirectionalLight){let N=e.get(P);if(N.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let z=P.shadow,V=t.get(P);V.shadowIntensity=z.intensity,V.shadowBias=z.bias,V.shadowNormalBias=z.normalBias,V.shadowRadius=z.radius,V.shadowMapSize=z.mapSize,n.directionalShadow[p]=V,n.directionalShadowMap[p]=I,n.directionalShadowMatrix[p]=P.shadow.matrix,_++}n.directional[p]=N,p++}else if(P.isSpotLight){let N=e.get(P);N.position.setFromMatrixPosition(P.matrixWorld),N.color.copy(H).multiplyScalar($),N.distance=Y,N.coneCos=Math.cos(P.angle),N.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),N.decay=P.decay,n.spot[T]=N;let z=P.shadow;if(P.map&&(n.spotLightMap[g]=P.map,g++,z.updateMatrices(P),P.castShadow&&E++),n.spotLightMatrix[T]=z.matrix,P.castShadow){let V=t.get(P);V.shadowIntensity=z.intensity,V.shadowBias=z.bias,V.shadowNormalBias=z.normalBias,V.shadowRadius=z.radius,V.shadowMapSize=z.mapSize,n.spotShadow[T]=V,n.spotShadowMap[T]=I,w++}T++}else if(P.isRectAreaLight){let N=e.get(P);N.color.copy(H).multiplyScalar($),N.halfWidth.set(P.width*.5,0,0),N.halfHeight.set(0,P.height*.5,0),n.rectArea[A]=N,A++}else if(P.isPointLight){let N=e.get(P);if(N.color.copy(P.color).multiplyScalar(P.intensity),N.distance=P.distance,N.decay=P.decay,P.castShadow){let z=P.shadow,V=t.get(P);V.shadowIntensity=z.intensity,V.shadowBias=z.bias,V.shadowNormalBias=z.normalBias,V.shadowRadius=z.radius,V.shadowMapSize=z.mapSize,V.shadowCameraNear=z.camera.near,V.shadowCameraFar=z.camera.far,n.pointShadow[d]=V,n.pointShadowMap[d]=I,n.pointShadowMatrix[d]=P.shadow.matrix,S++}n.point[d]=N,d++}else if(P.isHemisphereLight){let N=e.get(P);N.skyColor.copy(P.color).multiplyScalar($),N.groundColor.copy(P.groundColor).multiplyScalar($),n.hemi[M]=N,M++}}A>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=pe.LTC_FLOAT_1,n.rectAreaLTC2=pe.LTC_FLOAT_2):(n.rectAreaLTC1=pe.LTC_HALF_1,n.rectAreaLTC2=pe.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=m,n.ambient[2]=h;let L=n.hash;(L.sunLength!==f||L.directionalLength!==p||L.pointLength!==d||L.spotLength!==T||L.rectAreaLength!==A||L.hemiLength!==M||L.numSunShadows!==x||L.numDirectionalShadows!==_||L.numPointShadows!==S||L.numSpotShadows!==w||L.numSpotMaps!==g||L.numLightProbes!==C)&&(n.sun.length=f,n.directional.length=p,n.spot.length=T,n.rectArea.length=A,n.point.length=d,n.hemi.length=M,n.sunShadow.length=x,n.sunShadowMap.length=x,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.directionalShadowMatrix.length=_,n.pointShadow.length=S,n.pointShadowMap.length=S,n.pointShadowMatrix.length=S,n.spotShadow.length=w,n.spotShadowMap.length=w,n.spotLightMatrix.length=w+g-E,n.spotLightMap.length=g,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=C,L.sunLength=f,L.directionalLength=p,L.pointLength=d,L.spotLength=T,L.rectAreaLength=A,L.hemiLength=M,L.numSunShadows=x,L.numDirectionalShadows=_,L.numPointShadows=S,L.numSpotShadows=w,L.numSpotMaps=g,L.numLightProbes=C,n.version=Z0++)}function l(c,u){let m=0,h=0,f=0,x=0,v=0,p=0,d=u.matrixWorldInverse;for(let T=0,A=c.length;T<A;T++){let M=c[T];if(M.isSunLight){let _=n.sun[m];_.direction.setFromMatrixPosition(M.matrixWorld),_.direction.transformDirection(d),m++}else if(M.isDirectionalLight){let _=n.directional[h];_.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(d),h++}else if(M.isSpotLight){let _=n.spot[x];_.position.setFromMatrixPosition(M.matrixWorld),_.position.applyMatrix4(d),_.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(d),x++}else if(M.isRectAreaLight){let _=n.rectArea[v];_.position.setFromMatrixPosition(M.matrixWorld),_.position.applyMatrix4(d),a.identity(),r.copy(M.matrixWorld),r.premultiply(d),a.extractRotation(r),_.halfWidth.set(M.width*.5,0,0),_.halfHeight.set(0,M.height*.5,0),_.halfWidth.applyMatrix4(a),_.halfHeight.applyMatrix4(a),v++}else if(M.isPointLight){let _=n.point[f];_.position.setFromMatrixPosition(M.matrixWorld),_.position.applyMatrix4(d),f++}else if(M.isHemisphereLight){let _=n.hemi[p];_.direction.setFromMatrixPosition(M.matrixWorld),_.direction.transformDirection(d),p++}}}return{setup:o,setupView:l,state:n}}function Pu(i){let e=new K0(i),t=[],n=[],s=[];function r(h){m.camera=h,t.length=0,n.length=0,s.length=0}function a(h){t.push(h)}function o(h){n.push(h)}function l(h){s.push(h)}function c(){e.setup(t)}function u(h){e.setupView(t,h)}let m={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:m,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function j0(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Pu(i),e.set(s,[o])):r>=a.length?(o=new Pu(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Q0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,e_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,t_=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],n_=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],Lu=new rt,cr=new U,Kl=new U;function i_(i,e,t){let n=new Qi,s=new Re,r=new Re,a=new dt,o=new la,l=new ca,c={},u=t.maxTextureSize,m={[Rn]:Wt,[Wt]:Rn,[Xt]:Xt},h=new jt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Re},radius:{value:4}},vertexShader:Q0,fragmentShader:e_}),f=h.clone();f.defines.HORIZONTAL_PASS=1;let x=new bt;x.setAttribute("position",new Kt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new pt(x,h),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ks;let d=this.type;this.render=function(S,w,g){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;this.type===ba&&(Fe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ks);let E=i.getRenderTarget(),C=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),D=i.state;D.setBlending(In),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);let k=d!==this.type;k&&w.traverse(function(P){P.material&&(Array.isArray(P.material)?P.material.forEach(H=>H.needsUpdate=!0):P.material.needsUpdate=!0)});for(let P=0,H=S.length;P<H;P++){let $=S[P],Y=$.shadow;if(Y===void 0){Fe("WebGLShadowMap:",$,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);let I=Y.getFrameExtents();s.multiply(I),r.copy(Y.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/I.x),s.x=r.x*I.x,Y.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/I.y),s.y=r.y*I.y,Y.mapSize.y=r.y));let N=i.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=N,Y.map===null||k===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===is){if($.isPointLight){Fe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new Yt(s.x,s.y,{format:ci,type:xn,minFilter:It,magFilter:It,generateMipmaps:!1}),Y.map.texture.name=$.name+".shadowMap",Y.map.depthTexture=new ti(s.x,s.y,ln),Y.map.depthTexture.name=$.name+".shadowMapDepth",Y.map.depthTexture.format=Tn,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=Ct,Y.map.depthTexture.magFilter=Ct}else $.isPointLight?(Y.map=new xo(s.x),Y.map.depthTexture=new jr(s.x,_n)):(Y.map=new Yt(s.x,s.y),Y.map.depthTexture=new ti(s.x,s.y,_n)),Y.map.depthTexture.name=$.name+".shadowMap",Y.map.depthTexture.format=Tn,this.type===Ks?(Y.map.depthTexture.compareFunction=N?fo:uo,Y.map.depthTexture.minFilter=It,Y.map.depthTexture.magFilter=It):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=Ct,Y.map.depthTexture.magFilter=Ct);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==s.x||Y.map.height!==s.y)&&Y.map.setSize(s.x,s.y);let z=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();$.isPointLight!==!0&&Y.updateMatrices($,g);for(let V=0;V<z;V++){let se=Y.getCamera(V);if($.isPointLight){let K=Y.camera,me=Y.matrix,Me=$.distance||K.far;Me!==K.far&&(K.far=Me,K.updateProjectionMatrix()),cr.setFromMatrixPosition($.matrixWorld),K.position.copy(cr),Kl.copy(K.position),Kl.add(t_[V]),K.up.copy(n_[V]),K.lookAt(Kl),K.updateMatrixWorld(),me.makeTranslation(-cr.x,-cr.y,-cr.z),Lu.multiplyMatrices(K.projectionMatrix,K.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(Lu,K.coordinateSystem,K.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)i.setRenderTarget(Y.map,V),i.clear();else{V===0&&(i.setRenderTarget(Y.map),i.clear());let K=Y.getViewport(V);a.set(r.x*K.x,r.y*K.y,r.x*K.z,r.y*K.w),D.viewport(a)}n=Y.getFrustum(V),M(w,g,se,$,this.type)}Y.isPointLightShadow!==!0&&this.type===is&&T(Y,g),Y.needsUpdate=!1}d=this.type,p.needsUpdate=!1,i.setRenderTarget(E,C,L)};function T(S,w){let g=e.update(v);h.defines.VSM_SAMPLES!==S.blurSamples&&(h.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null?S.mapPass=new Yt(s.x,s.y,{format:ci,type:xn}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),h.uniforms.shadow_pass.value=S.map.depthTexture,h.uniforms.resolution.value.set(S.map.width,S.map.height),h.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(w,null,g,h,v,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value.set(S.map.width,S.map.height),f.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(w,null,g,f,v,null)}function A(S,w,g,E){let C=null,L=g.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(L!==void 0)C=L;else if(C=g.isPointLight===!0?l:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let D=C.uuid,k=w.uuid,P=c[D];P===void 0&&(P={},c[D]=P);let H=P[k];H===void 0&&(H=C.clone(),P[k]=H,w.addEventListener("dispose",_)),C=H}if(C.visible=w.visible,C.wireframe=w.wireframe,E===is?C.side=w.shadowSide!==null?w.shadowSide:w.side:C.side=w.shadowSide!==null?w.shadowSide:m[w.side],C.alphaMap=w.alphaMap,C.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,C.map=w.map,C.clipShadows=w.clipShadows,C.clippingPlanes=w.clippingPlanes,C.clipIntersection=w.clipIntersection,C.displacementMap=w.displacementMap,C.displacementScale=w.displacementScale,C.displacementBias=w.displacementBias,C.wireframeLinewidth=w.wireframeLinewidth,C.linewidth=w.linewidth,g.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let D=i.properties.get(C);D.light=g}return C}function M(S,w,g,E,C){if(S.visible===!1)return;if(S.layers.test(w.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&C===is)&&(!S.frustumCulled||S.intersectsFrustum(n))){S.modelViewMatrix.multiplyMatrices(g.matrixWorldInverse,S.matrixWorld);let k=e.update(S),P=S.material;if(Array.isArray(P)){let H=k.groups;for(let $=0,Y=H.length;$<Y;$++){let I=H[$],N=P[I.materialIndex];if(N&&N.visible){let z=A(S,N,E,C);S.onBeforeShadow(i,S,w,g,k,z,I),i.renderBufferDirect(g,null,k,z,S,I),S.onAfterShadow(i,S,w,g,k,z,I)}}}else if(P.visible){let H=A(S,P,E,C);S.onBeforeShadow(i,S,w,g,k,H,null),i.renderBufferDirect(g,null,k,H,S,null),S.onAfterShadow(i,S,w,g,k,H,null)}}let D=S.children;for(let k=0,P=D.length;k<P;k++)M(D[k],w,g,E,C)}function _(S){S.target.removeEventListener("dispose",_);for(let g in c){let E=c[g],C=S.target.uuid;C in E&&(E[C].dispose(),delete E[C])}}}function s_(i,e){function t(){let O=!1,ue=new dt,te=null,de=new dt(0,0,0,0);return{setMask:function(ye){te!==ye&&!O&&(i.colorMask(ye,ye,ye,ye),te=ye)},setLocked:function(ye){O=ye},setClear:function(ye,ie,Ne,Ae,lt){lt===!0&&(ye*=Ae,ie*=Ae,Ne*=Ae),ue.set(ye,ie,Ne,Ae),de.equals(ue)===!1&&(i.clearColor(ye,ie,Ne,Ae),de.copy(ue))},reset:function(){O=!1,te=null,de.set(-1,0,0,0)}}}function n(){let O=!1,ue=!1,te=null,de=null,ye=null;return{setReversed:function(ie){if(ue!==ie){let Ne=e.get("EXT_clip_control");ie?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT),ue=ie;let Ae=ye;ye=null,this.setClear(Ae)}},getReversed:function(){return ue},setTest:function(ie){ie?ee(i.DEPTH_TEST):ve(i.DEPTH_TEST)},setMask:function(ie){te!==ie&&!O&&(i.depthMask(ie),te=ie)},setFunc:function(ie){if(ue&&(ie=ou[ie]),de!==ie){switch(ie){case zr:i.depthFunc(i.NEVER);break;case kr:i.depthFunc(i.ALWAYS);break;case Vr:i.depthFunc(i.LESS);break;case qi:i.depthFunc(i.LEQUAL);break;case Gr:i.depthFunc(i.EQUAL);break;case Hr:i.depthFunc(i.GEQUAL);break;case Wr:i.depthFunc(i.GREATER);break;case Xr:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}de=ie}},setLocked:function(ie){O=ie},setClear:function(ie){ye!==ie&&(ye=ie,ue&&(ie=1-ie),i.clearDepth(ie))},reset:function(){O=!1,te=null,de=null,ye=null,ue=!1}}}function s(){let O=!1,ue=null,te=null,de=null,ye=null,ie=null,Ne=null,Ae=null,lt=null;return{setTest:function(et){O||(et?ee(i.STENCIL_TEST):ve(i.STENCIL_TEST))},setMask:function(et){ue!==et&&!O&&(i.stencilMask(et),ue=et)},setFunc:function(et,hn,Mn){(te!==et||de!==hn||ye!==Mn)&&(i.stencilFunc(et,hn,Mn),te=et,de=hn,ye=Mn)},setOp:function(et,hn,Mn){(ie!==et||Ne!==hn||Ae!==Mn)&&(i.stencilOp(et,hn,Mn),ie=et,Ne=hn,Ae=Mn)},setLocked:function(et){O=et},setClear:function(et){lt!==et&&(i.clearStencil(et),lt=et)},reset:function(){O=!1,ue=null,te=null,de=null,ye=null,ie=null,Ne=null,Ae=null,lt=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,u={},m={},h={},f=new WeakMap,x=[],v=null,p=!1,d=null,T=null,A=null,M=null,_=null,S=null,w=null,g=new Be(0,0,0),E=0,C=!1,L=null,D=null,k=null,P=null,H=null,$=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,I=0,N=i.getParameter(i.VERSION);N.indexOf("WebGL")!==-1?(I=parseFloat(/^WebGL (\d)/.exec(N)[1]),Y=I>=1):N.indexOf("OpenGL ES")!==-1&&(I=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),Y=I>=2);let z=null,V={},se=i.getParameter(i.SCISSOR_BOX),K=i.getParameter(i.VIEWPORT),me=new dt().fromArray(se),Me=new dt().fromArray(K);function ze(O,ue,te,de){let ye=new Uint8Array(4),ie=i.createTexture();i.bindTexture(O,ie),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ne=0;Ne<te;Ne++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(ue,0,i.RGBA,1,1,de,0,i.RGBA,i.UNSIGNED_BYTE,ye):i.texImage2D(ue+Ne,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ye);return ie}let Z={};Z[i.TEXTURE_2D]=ze(i.TEXTURE_2D,i.TEXTURE_2D,1),Z[i.TEXTURE_CUBE_MAP]=ze(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[i.TEXTURE_2D_ARRAY]=ze(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Z[i.TEXTURE_3D]=ze(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ee(i.DEPTH_TEST),a.setFunc(qi),Ge(!1),ot(xl),ee(i.CULL_FACE),Ie(In);function ee(O){u[O]!==!0&&(i.enable(O),u[O]=!0)}function ve(O){u[O]!==!1&&(i.disable(O),u[O]=!1)}function De(O,ue){return h[O]!==ue?(i.bindFramebuffer(O,ue),h[O]=ue,O===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=ue),O===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=ue),!0):!1}function xe(O,ue){let te=x,de=!1;if(O){te=f.get(ue),te===void 0&&(te=[],f.set(ue,te));let ye=O.textures;if(te.length!==ye.length||te[0]!==i.COLOR_ATTACHMENT0){for(let ie=0,Ne=ye.length;ie<Ne;ie++)te[ie]=i.COLOR_ATTACHMENT0+ie;te.length=ye.length,de=!0}}else te[0]!==i.BACK&&(te[0]=i.BACK,de=!0);de&&i.drawBuffers(te)}function re(O){return v!==O?(i.useProgram(O),v=O,!0):!1}let qe={[Si]:i.FUNC_ADD,[Ch]:i.FUNC_SUBTRACT,[Rh]:i.FUNC_REVERSE_SUBTRACT};qe[Ih]=i.MIN,qe[Ph]=i.MAX;let be={[Lh]:i.ZERO,[Dh]:i.ONE,[Nh]:i.SRC_COLOR,[Sl]:i.SRC_ALPHA,[kh]:i.SRC_ALPHA_SATURATE,[Bh]:i.DST_COLOR,[Fh]:i.DST_ALPHA,[Uh]:i.ONE_MINUS_SRC_COLOR,[bl]:i.ONE_MINUS_SRC_ALPHA,[zh]:i.ONE_MINUS_DST_COLOR,[Oh]:i.ONE_MINUS_DST_ALPHA,[Vh]:i.CONSTANT_COLOR,[Gh]:i.ONE_MINUS_CONSTANT_COLOR,[Hh]:i.CONSTANT_ALPHA,[Wh]:i.ONE_MINUS_CONSTANT_ALPHA};function Ie(O,ue,te,de,ye,ie,Ne,Ae,lt,et){if(O===In){p===!0&&(ve(i.BLEND),p=!1);return}if(p===!1&&(ee(i.BLEND),p=!0),O!==Ah){if(O!==d||et!==C){if((T!==Si||_!==Si)&&(i.blendEquation(i.FUNC_ADD),T=Si,_=Si),et)switch(O){case ss:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case yl:i.blendFunc(i.ONE,i.ONE);break;case vl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ml:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Oe("WebGLState: Invalid blending: ",O);break}else switch(O){case ss:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case yl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case vl:Oe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ml:Oe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Oe("WebGLState: Invalid blending: ",O);break}A=null,M=null,S=null,w=null,g.set(0,0,0),E=0,d=O,C=et}return}ye=ye||ue,ie=ie||te,Ne=Ne||de,(ue!==T||ye!==_)&&(i.blendEquationSeparate(qe[ue],qe[ye]),T=ue,_=ye),(te!==A||de!==M||ie!==S||Ne!==w)&&(i.blendFuncSeparate(be[te],be[de],be[ie],be[Ne]),A=te,M=de,S=ie,w=Ne),(Ae.equals(g)===!1||lt!==E)&&(i.blendColor(Ae.r,Ae.g,Ae.b,lt),g.copy(Ae),E=lt),d=O,C=!1}function Ye(O,ue){O.side===Xt?ve(i.CULL_FACE):ee(i.CULL_FACE);let te=O.side===Wt;ue&&(te=!te),Ge(te),O.blending===ss&&O.transparent===!1?Ie(In):Ie(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),a.setFunc(O.depthFunc),a.setTest(O.depthTest),a.setMask(O.depthWrite),r.setMask(O.colorWrite);let de=O.stencilWrite;o.setTest(de),de&&(o.setMask(O.stencilWriteMask),o.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),o.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),gt(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):ve(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ge(O){L!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),L=O)}function ot(O){O!==Th?(ee(i.CULL_FACE),O!==D&&(O===xl?i.cullFace(i.BACK):O===wh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ve(i.CULL_FACE),D=O}function xt(O){O!==k&&(Y&&i.lineWidth(O),k=O)}function gt(O,ue,te){O?(ee(i.POLYGON_OFFSET_FILL),(P!==ue||H!==te)&&(P=ue,H=te,a.getReversed()&&(ue=-ue),i.polygonOffset(ue,te))):ve(i.POLYGON_OFFSET_FILL)}function ft(O){O?ee(i.SCISSOR_TEST):ve(i.SCISSOR_TEST)}function yt(O){O===void 0&&(O=i.TEXTURE0+$-1),z!==O&&(i.activeTexture(O),z=O)}function B(O,ue,te){te===void 0&&(z===null?te=i.TEXTURE0+$-1:te=z);let de=V[te];de===void 0&&(de={type:void 0,texture:void 0},V[te]=de),(de.type!==O||de.texture!==ue)&&(z!==te&&(i.activeTexture(te),z=te),i.bindTexture(O,ue||Z[O]),de.type=O,de.texture=ue)}function Lt(){let O=V[z];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function it(){try{i.compressedTexImage2D(...arguments)}catch(O){Oe("WebGLState:",O)}}function R(){try{i.compressedTexImage3D(...arguments)}catch(O){Oe("WebGLState:",O)}}function y(){try{i.texSubImage2D(...arguments)}catch(O){Oe("WebGLState:",O)}}function G(){try{i.texSubImage3D(...arguments)}catch(O){Oe("WebGLState:",O)}}function q(){try{i.compressedTexSubImage2D(...arguments)}catch(O){Oe("WebGLState:",O)}}function j(){try{i.compressedTexSubImage3D(...arguments)}catch(O){Oe("WebGLState:",O)}}function oe(){try{i.texStorage2D(...arguments)}catch(O){Oe("WebGLState:",O)}}function le(){try{i.texStorage3D(...arguments)}catch(O){Oe("WebGLState:",O)}}function Q(){try{i.texImage2D(...arguments)}catch(O){Oe("WebGLState:",O)}}function ne(){try{i.texImage3D(...arguments)}catch(O){Oe("WebGLState:",O)}}function ce(O){return m[O]!==void 0?m[O]:i.getParameter(O)}function Pe(O,ue){m[O]!==ue&&(i.pixelStorei(O,ue),m[O]=ue)}function fe(O){me.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),me.copy(O))}function he(O){Me.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),Me.copy(O))}function Le(O,ue){let te=c.get(ue);te===void 0&&(te=new WeakMap,c.set(ue,te));let de=te.get(O);de===void 0&&(de=i.getUniformBlockIndex(ue,O.name),te.set(O,de))}function Ue(O,ue){let de=c.get(ue).get(O);l.get(ue)!==de&&(i.uniformBlockBinding(ue,de,O.__bindingPointIndex),l.set(ue,de))}function Ve(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},m={},z=null,V={},h={},f=new WeakMap,x=[],v=null,p=!1,d=null,T=null,A=null,M=null,_=null,S=null,w=null,g=new Be(0,0,0),E=0,C=!1,L=null,D=null,k=null,P=null,H=null,me.set(0,0,i.canvas.width,i.canvas.height),Me.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ee,disable:ve,bindFramebuffer:De,drawBuffers:xe,useProgram:re,setBlending:Ie,setMaterial:Ye,setFlipSided:Ge,setCullFace:ot,setLineWidth:xt,setPolygonOffset:gt,setScissorTest:ft,activeTexture:yt,bindTexture:B,unbindTexture:Lt,compressedTexImage2D:it,compressedTexImage3D:R,texImage2D:Q,texImage3D:ne,pixelStorei:Pe,getParameter:ce,updateUBOMapping:Le,uniformBlockBinding:Ue,texStorage2D:oe,texStorage3D:le,texSubImage2D:y,texSubImage3D:G,compressedTexSubImage2D:q,compressedTexSubImage3D:j,scissor:fe,viewport:he,reset:Ve}}function r_(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Re,u=new WeakMap,m=new Set,h,f=new WeakMap,x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(R,y){return x?new OffscreenCanvas(R,y):Cs("canvas")}function p(R,y,G){let q=1,j=it(R);if((j.width>G||j.height>G)&&(q=G/Math.max(j.width,j.height)),q<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let oe=Math.floor(q*j.width),le=Math.floor(q*j.height);h===void 0&&(h=v(oe,le));let Q=y?v(oe,le):h;return Q.width=oe,Q.height=le,Q.getContext("2d").drawImage(R,0,0,oe,le),Fe("WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+oe+"x"+le+")."),Q}else return"data"in R&&Fe("WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),R;return R}function d(R){return R.generateMipmaps}function T(R){i.generateMipmap(R)}function A(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function M(R,y,G,q,j,oe=!1){if(R!==null){if(i[R]!==void 0)return i[R];Fe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let le;q&&(le=e.get("EXT_texture_norm16"),le||Fe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=y;if(y===i.RED&&(G===i.FLOAT&&(Q=i.R32F),G===i.HALF_FLOAT&&(Q=i.R16F),G===i.UNSIGNED_BYTE&&(Q=i.R8),G===i.UNSIGNED_SHORT&&le&&(Q=le.R16_EXT),G===i.SHORT&&le&&(Q=le.R16_SNORM_EXT)),y===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.R8UI),G===i.UNSIGNED_SHORT&&(Q=i.R16UI),G===i.UNSIGNED_INT&&(Q=i.R32UI),G===i.BYTE&&(Q=i.R8I),G===i.SHORT&&(Q=i.R16I),G===i.INT&&(Q=i.R32I)),y===i.RG&&(G===i.FLOAT&&(Q=i.RG32F),G===i.HALF_FLOAT&&(Q=i.RG16F),G===i.UNSIGNED_BYTE&&(Q=i.RG8),G===i.UNSIGNED_SHORT&&le&&(Q=le.RG16_EXT),G===i.SHORT&&le&&(Q=le.RG16_SNORM_EXT)),y===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RG8UI),G===i.UNSIGNED_SHORT&&(Q=i.RG16UI),G===i.UNSIGNED_INT&&(Q=i.RG32UI),G===i.BYTE&&(Q=i.RG8I),G===i.SHORT&&(Q=i.RG16I),G===i.INT&&(Q=i.RG32I)),y===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),G===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),G===i.UNSIGNED_INT&&(Q=i.RGB32UI),G===i.BYTE&&(Q=i.RGB8I),G===i.SHORT&&(Q=i.RGB16I),G===i.INT&&(Q=i.RGB32I)),y===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),G===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),G===i.UNSIGNED_INT&&(Q=i.RGBA32UI),G===i.BYTE&&(Q=i.RGBA8I),G===i.SHORT&&(Q=i.RGBA16I),G===i.INT&&(Q=i.RGBA32I)),y===i.RGB&&(G===i.UNSIGNED_SHORT&&le&&(Q=le.RGB16_EXT),G===i.SHORT&&le&&(Q=le.RGB16_SNORM_EXT),G===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),G===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),y===i.RGBA){let ne=oe?As:Je.getTransfer(j);G===i.FLOAT&&(Q=i.RGBA32F),G===i.HALF_FLOAT&&(Q=i.RGBA16F),G===i.UNSIGNED_BYTE&&(Q=ne===nt?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT&&le&&(Q=le.RGBA16_EXT),G===i.SHORT&&le&&(Q=le.RGBA16_SNORM_EXT),G===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function _(R,y){let G;return R?y===null||y===_n||y===as?G=i.DEPTH24_STENCIL8:y===ln?G=i.DEPTH32F_STENCIL8:y===rs&&(G=i.DEPTH24_STENCIL8,Fe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===_n||y===as?G=i.DEPTH_COMPONENT24:y===ln?G=i.DEPTH_COMPONENT32F:y===rs&&(G=i.DEPTH_COMPONENT16),G}function S(R,y){return d(R)===!0||R.isFramebufferTexture&&R.minFilter!==Ct&&R.minFilter!==It?Math.log2(Math.max(y.width,y.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?y.mipmaps.length:1}function w(R){let y=R.target;y.removeEventListener("dispose",w),E(y),y.isVideoTexture&&u.delete(y),y.isHTMLTexture&&m.delete(y)}function g(R){let y=R.target;y.removeEventListener("dispose",g),L(y)}function E(R){let y=n.get(R);if(y.__webglInit===void 0)return;let G=R.source,q=f.get(G);if(q){let j=q[y.__cacheKey];j.usedTimes--,j.usedTimes===0&&C(R),Object.keys(q).length===0&&f.delete(G)}n.remove(R)}function C(R){let y=n.get(R);i.deleteTexture(y.__webglTexture);let G=R.source,q=f.get(G);delete q[y.__cacheKey],a.memory.textures--}function L(R){let y=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(y.__webglFramebuffer[q]))for(let j=0;j<y.__webglFramebuffer[q].length;j++)i.deleteFramebuffer(y.__webglFramebuffer[q][j]);else i.deleteFramebuffer(y.__webglFramebuffer[q]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[q])}else{if(Array.isArray(y.__webglFramebuffer))for(let q=0;q<y.__webglFramebuffer.length;q++)i.deleteFramebuffer(y.__webglFramebuffer[q]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let q=0;q<y.__webglColorRenderbuffer.length;q++)y.__webglColorRenderbuffer[q]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[q]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let G=R.textures;for(let q=0,j=G.length;q<j;q++){let oe=n.get(G[q]);oe.__webglTexture&&(i.deleteTexture(oe.__webglTexture),a.memory.textures--),n.remove(G[q])}n.remove(R)}let D=0;function k(){D=0}function P(){return D}function H(R){D=R}function $(){let R=D;return R>=s.maxTextures&&Fe("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),D+=1,R}function Y(R){let y=[];return y.push(R.wrapS),y.push(R.wrapT),y.push(R.wrapR||0),y.push(R.magFilter),y.push(R.minFilter),y.push(R.anisotropy),y.push(R.internalFormat),y.push(R.format),y.push(R.type),y.push(R.generateMipmaps),y.push(R.premultiplyAlpha),y.push(R.flipY),y.push(R.unpackAlignment),y.push(R.colorSpace),y.join()}function I(R,y){let G=n.get(R);if(R.isVideoTexture&&B(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&G.__version!==R.version){let q=R.image;if(q===null)Fe("WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)Fe("WebGLRenderer: Texture marked for update but image is incomplete");else{ve(G,R,y);return}}else R.isExternalTexture&&(G.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+y)}function N(R,y){let G=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){ve(G,R,y);return}else R.isExternalTexture&&(G.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+y)}function z(R,y){let G=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){ve(G,R,y);return}t.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+y)}function V(R,y){let G=n.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&G.__version!==R.version){De(G,R,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+y)}let se={[qr]:i.REPEAT,[En]:i.CLAMP_TO_EDGE,[Yr]:i.MIRRORED_REPEAT},K={[Ct]:i.NEAREST,[Yh]:i.NEAREST_MIPMAP_NEAREST,[er]:i.NEAREST_MIPMAP_LINEAR,[It]:i.LINEAR,[Aa]:i.LINEAR_MIPMAP_NEAREST,[oi]:i.LINEAR_MIPMAP_LINEAR},me={[Kh]:i.NEVER,[nu]:i.ALWAYS,[jh]:i.LESS,[uo]:i.LEQUAL,[Qh]:i.EQUAL,[fo]:i.GEQUAL,[eu]:i.GREATER,[tu]:i.NOTEQUAL};function Me(R,y){if(y.type===ln&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===It||y.magFilter===Aa||y.magFilter===er||y.magFilter===oi||y.minFilter===It||y.minFilter===Aa||y.minFilter===er||y.minFilter===oi)&&Fe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,se[y.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,se[y.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,se[y.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,K[y.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,K[y.minFilter]),y.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,me[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Ct||y.minFilter!==er&&y.minFilter!==oi||y.type===ln&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let G=e.get("EXT_texture_filter_anisotropic");i.texParameterf(R,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function ze(R,y){let G=!1;R.__webglInit===void 0&&(R.__webglInit=!0,y.addEventListener("dispose",w));let q=y.source,j=f.get(q);j===void 0&&(j={},f.set(q,j));let oe=Y(y);if(oe!==R.__cacheKey){j[oe]===void 0&&(j[oe]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,G=!0),j[oe].usedTimes++;let le=j[R.__cacheKey];le!==void 0&&(j[R.__cacheKey].usedTimes--,le.usedTimes===0&&C(y)),R.__cacheKey=oe,R.__webglTexture=j[oe].texture}return G}function Z(R,y,G){return Math.floor(Math.floor(R/G)/y)}function ee(R,y,G,q){let oe=R.updateRanges;if(oe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,G,q,y.data);else{oe.sort((Pe,fe)=>Pe.start-fe.start);let le=0;for(let Pe=1;Pe<oe.length;Pe++){let fe=oe[le],he=oe[Pe],Le=fe.start+fe.count,Ue=Z(he.start,y.width,4),Ve=Z(fe.start,y.width,4);he.start<=Le+1&&Ue===Ve&&Z(he.start+he.count-1,y.width,4)===Ue?fe.count=Math.max(fe.count,he.start+he.count-fe.start):(++le,oe[le]=he)}oe.length=le+1;let Q=t.getParameter(i.UNPACK_ROW_LENGTH),ne=t.getParameter(i.UNPACK_SKIP_PIXELS),ce=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let Pe=0,fe=oe.length;Pe<fe;Pe++){let he=oe[Pe],Le=Math.floor(he.start/4),Ue=Math.ceil(he.count/4),Ve=Le%y.width,O=Math.floor(Le/y.width),ue=Ue,te=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,Ve),t.pixelStorei(i.UNPACK_SKIP_ROWS,O),t.texSubImage2D(i.TEXTURE_2D,0,Ve,O,ue,te,G,q,y.data)}R.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Q),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ne),t.pixelStorei(i.UNPACK_SKIP_ROWS,ce)}}function ve(R,y,G){let q=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(q=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(q=i.TEXTURE_3D);let j=ze(R,y),oe=y.source;t.bindTexture(q,R.__webglTexture,i.TEXTURE0+G);let le=n.get(oe);if(oe.version!==le.__version||j===!0){if(t.activeTexture(i.TEXTURE0+G),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let te=Je.getPrimaries(Je.workingColorSpace),de=y.colorSpace===Hn?null:Je.getPrimaries(y.colorSpace),ye=y.colorSpace===Hn||te===de?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye)}t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment);let ne=p(y.image,!1,s.maxTextureSize);ne=Lt(y,ne);let ce=r.convert(y.format,y.colorSpace),Pe=r.convert(y.type),fe=M(y.internalFormat,ce,Pe,y.normalized,y.colorSpace,y.isVideoTexture);Me(q,y);let he,Le=y.mipmaps,Ue=y.isVideoTexture!==!0,Ve=le.__version===void 0||j===!0,O=oe.dataReady,ue=S(y,ne);if(y.isDepthTexture)fe=_(y.format===li,y.type),Ve&&(Ue?t.texStorage2D(i.TEXTURE_2D,1,fe,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,fe,ne.width,ne.height,0,ce,Pe,null));else if(y.isDataTexture)if(Le.length>0){Ue&&Ve&&t.texStorage2D(i.TEXTURE_2D,ue,fe,Le[0].width,Le[0].height);for(let te=0,de=Le.length;te<de;te++)he=Le[te],Ue?O&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,he.width,he.height,ce,Pe,he.data):t.texImage2D(i.TEXTURE_2D,te,fe,he.width,he.height,0,ce,Pe,he.data);y.generateMipmaps=!1}else Ue?(Ve&&t.texStorage2D(i.TEXTURE_2D,ue,fe,ne.width,ne.height),O&&ee(y,ne,ce,Pe)):t.texImage2D(i.TEXTURE_2D,0,fe,ne.width,ne.height,0,ce,Pe,ne.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Ue&&Ve&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ue,fe,Le[0].width,Le[0].height,ne.depth);for(let te=0,de=Le.length;te<de;te++)if(he=Le[te],y.format!==cn)if(ce!==null)if(Ue){if(O)if(y.layerUpdates.size>0){let ye=Xl(he.width,he.height,y.format,y.type);for(let ie of y.layerUpdates){let Ne=he.data.subarray(ie*ye/he.data.BYTES_PER_ELEMENT,(ie+1)*ye/he.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,ie,he.width,he.height,1,ce,Ne)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,0,he.width,he.height,ne.depth,ce,he.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,te,fe,he.width,he.height,ne.depth,0,he.data,0,0);else Fe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ue?O&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,0,he.width,he.height,ne.depth,ce,Pe,he.data):t.texImage3D(i.TEXTURE_2D_ARRAY,te,fe,he.width,he.height,ne.depth,0,ce,Pe,he.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{Ue&&Ve&&t.texStorage2D(i.TEXTURE_2D,ue,fe,Le[0].width,Le[0].height);for(let te=0,de=Le.length;te<de;te++)he=Le[te],y.format!==cn?ce!==null?Ue?O&&t.compressedTexSubImage2D(i.TEXTURE_2D,te,0,0,he.width,he.height,ce,he.data):t.compressedTexImage2D(i.TEXTURE_2D,te,fe,he.width,he.height,0,he.data):Fe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ue?O&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,he.width,he.height,ce,Pe,he.data):t.texImage2D(i.TEXTURE_2D,te,fe,he.width,he.height,0,ce,Pe,he.data)}else if(y.isDataArrayTexture)if(Ue){if(Ve&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ue,fe,ne.width,ne.height,ne.depth),O)if(y.layerUpdates.size>0){let te=Xl(ne.width,ne.height,y.format,y.type);for(let de of y.layerUpdates){let ye=ne.data.subarray(de*te/ne.data.BYTES_PER_ELEMENT,(de+1)*te/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,de,ne.width,ne.height,1,ce,Pe,ye)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,ce,Pe,ne.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,fe,ne.width,ne.height,ne.depth,0,ce,Pe,ne.data);else if(y.isData3DTexture)Ue?(Ve&&t.texStorage3D(i.TEXTURE_3D,ue,fe,ne.width,ne.height,ne.depth),O&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,ce,Pe,ne.data)):t.texImage3D(i.TEXTURE_3D,0,fe,ne.width,ne.height,ne.depth,0,ce,Pe,ne.data);else if(y.isFramebufferTexture){if(Ve)if(Ue)t.texStorage2D(i.TEXTURE_2D,ue,fe,ne.width,ne.height);else{let te=ne.width,de=ne.height;for(let ye=0;ye<ue;ye++)t.texImage2D(i.TEXTURE_2D,ye,fe,te,de,0,ce,Pe,null),te>>=1,de>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in i){let te=i.canvas;if(te.hasAttribute("layoutsubtree")||te.setAttribute("layoutsubtree","true"),ne.parentNode!==te){te.appendChild(ne),m.add(y),te.onpaint=de=>{let ye=de.changedElements;for(let ie of m)ye.includes(ie.image)&&(ie.needsUpdate=!0)},te.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ne);else{let ye=i.RGBA,ie=i.RGBA,Ne=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ye,ie,Ne,ne)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Le.length>0){if(Ue&&Ve){let te=it(Le[0]);t.texStorage2D(i.TEXTURE_2D,ue,fe,te.width,te.height)}for(let te=0,de=Le.length;te<de;te++)he=Le[te],Ue?O&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,ce,Pe,he):t.texImage2D(i.TEXTURE_2D,te,fe,ce,Pe,he);y.generateMipmaps=!1}else if(Ue){if(Ve){let te=it(ne);t.texStorage2D(i.TEXTURE_2D,ue,fe,te.width,te.height)}O&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ce,Pe,ne)}else t.texImage2D(i.TEXTURE_2D,0,fe,ce,Pe,ne);d(y)&&T(q),le.__version=oe.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function De(R,y,G){if(y.image.length!==6)return;let q=ze(R,y),j=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+G);let oe=n.get(j);if(j.version!==oe.__version||q===!0){t.activeTexture(i.TEXTURE0+G);let le=Je.getPrimaries(Je.workingColorSpace),Q=y.colorSpace===Hn?null:Je.getPrimaries(y.colorSpace),ne=y.colorSpace===Hn||le===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ne);let ce=y.isCompressedTexture||y.image[0].isCompressedTexture,Pe=y.image[0]&&y.image[0].isDataTexture,fe=[];for(let ie=0;ie<6;ie++)!ce&&!Pe?fe[ie]=p(y.image[ie],!0,s.maxCubemapSize):fe[ie]=Pe?y.image[ie].image:y.image[ie],fe[ie]=Lt(y,fe[ie]);let he=fe[0],Le=r.convert(y.format,y.colorSpace),Ue=r.convert(y.type),Ve=M(y.internalFormat,Le,Ue,y.normalized,y.colorSpace),O=y.isVideoTexture!==!0,ue=oe.__version===void 0||q===!0,te=j.dataReady,de=S(y,he);Me(i.TEXTURE_CUBE_MAP,y);let ye;if(ce){O&&ue&&t.texStorage2D(i.TEXTURE_CUBE_MAP,de,Ve,he.width,he.height);for(let ie=0;ie<6;ie++){ye=fe[ie].mipmaps;for(let Ne=0;Ne<ye.length;Ne++){let Ae=ye[Ne];y.format!==cn?Le!==null?O?te&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne,0,0,Ae.width,Ae.height,Le,Ae.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne,Ve,Ae.width,Ae.height,0,Ae.data):Fe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?te&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne,0,0,Ae.width,Ae.height,Le,Ue,Ae.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne,Ve,Ae.width,Ae.height,0,Le,Ue,Ae.data)}}}else{if(ye=y.mipmaps,O&&ue){ye.length>0&&de++;let ie=it(fe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,de,Ve,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(Pe){O?te&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,fe[ie].width,fe[ie].height,Le,Ue,fe[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,Ve,fe[ie].width,fe[ie].height,0,Le,Ue,fe[ie].data);for(let Ne=0;Ne<ye.length;Ne++){let lt=ye[Ne].image[ie].image;O?te&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne+1,0,0,lt.width,lt.height,Le,Ue,lt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne+1,Ve,lt.width,lt.height,0,Le,Ue,lt.data)}}else{O?te&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Le,Ue,fe[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,Ve,Le,Ue,fe[ie]);for(let Ne=0;Ne<ye.length;Ne++){let Ae=ye[Ne];O?te&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne+1,0,0,Le,Ue,Ae.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne+1,Ve,Le,Ue,Ae.image[ie])}}}d(y)&&T(i.TEXTURE_CUBE_MAP),oe.__version=j.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function xe(R,y,G,q,j,oe){let le=r.convert(G.format,G.colorSpace),Q=r.convert(G.type),ne=M(G.internalFormat,le,Q,G.normalized,G.colorSpace),ce=n.get(y),Pe=n.get(G);if(Pe.__renderTarget=y,!ce.__hasExternalTextures){let fe=Math.max(1,y.width>>oe),he=Math.max(1,y.height>>oe);j===i.TEXTURE_3D||j===i.TEXTURE_2D_ARRAY?t.texImage3D(j,oe,ne,fe,he,y.depth,0,le,Q,null):t.texImage2D(j,oe,ne,fe,he,0,le,Q,null)}t.bindFramebuffer(i.FRAMEBUFFER,R),yt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,q,j,Pe.__webglTexture,0,ft(y)):(j===i.TEXTURE_2D||j>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,q,j,Pe.__webglTexture,oe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function re(R,y,G){if(i.bindRenderbuffer(i.RENDERBUFFER,R),y.depthBuffer){let q=y.depthTexture,j=q&&q.isDepthTexture?q.type:null,oe=_(y.stencilBuffer,j),le=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;yt(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft(y),oe,y.width,y.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft(y),oe,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,oe,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,le,i.RENDERBUFFER,R)}else{let q=y.textures;for(let j=0;j<q.length;j++){let oe=q[j],le=r.convert(oe.format,oe.colorSpace),Q=r.convert(oe.type),ne=M(oe.internalFormat,le,Q,oe.normalized,oe.colorSpace);yt(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft(y),ne,y.width,y.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft(y),ne,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ne,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function qe(R,y,G){let q=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,R),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let j=n.get(y.depthTexture);if(j.__renderTarget=y,(!j.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),q){if(j.__webglInit===void 0&&(j.__webglInit=!0,y.depthTexture.addEventListener("dispose",w)),j.__webglTexture===void 0){j.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),Me(i.TEXTURE_CUBE_MAP,y.depthTexture);let ce=r.convert(y.depthTexture.format),Pe=r.convert(y.depthTexture.type),fe;y.depthTexture.format===Tn?fe=i.DEPTH_COMPONENT24:y.depthTexture.format===li&&(fe=i.DEPTH24_STENCIL8);for(let he=0;he<6;he++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,fe,y.width,y.height,0,ce,Pe,null)}}else I(y.depthTexture,0);let oe=j.__webglTexture,le=ft(y),Q=q?i.TEXTURE_CUBE_MAP_POSITIVE_X+G:i.TEXTURE_2D,ne=y.depthTexture.format===li?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(y.depthTexture.format===Tn)yt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,Q,oe,0,le):i.framebufferTexture2D(i.FRAMEBUFFER,ne,Q,oe,0);else if(y.depthTexture.format===li)yt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,Q,oe,0,le):i.framebufferTexture2D(i.FRAMEBUFFER,ne,Q,oe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function be(R){let y=n.get(R),G=R.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==R.depthTexture){let q=R.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),q){let j=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,q.removeEventListener("dispose",j)};q.addEventListener("dispose",j),y.__depthDisposeCallback=j}y.__boundDepthTexture=q}if(R.depthTexture&&!y.__autoAllocateDepthBuffer)if(G)for(let q=0;q<6;q++)qe(y.__webglFramebuffer[q],R,q);else{let q=R.texture.mipmaps;q&&q.length>0?qe(y.__webglFramebuffer[0],R,0):qe(y.__webglFramebuffer,R,0)}else if(G){y.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[q]),y.__webglDepthbuffer[q]===void 0)y.__webglDepthbuffer[q]=i.createRenderbuffer(),re(y.__webglDepthbuffer[q],R,!1);else{let j=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=y.__webglDepthbuffer[q];i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,oe)}}else{let q=R.texture.mipmaps;if(q&&q.length>0?t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),re(y.__webglDepthbuffer,R,!1);else{let j=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,oe)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ie(R,y,G){let q=n.get(R);y!==void 0&&xe(q.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&be(R)}function Ye(R){let y=R.texture,G=n.get(R),q=n.get(y);R.addEventListener("dispose",g);let j=R.textures,oe=R.isWebGLCubeRenderTarget===!0,le=j.length>1;if(le||(q.__webglTexture===void 0&&(q.__webglTexture=i.createTexture()),q.__version=y.version,a.memory.textures++),oe){G.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(y.mipmaps&&y.mipmaps.length>0){G.__webglFramebuffer[Q]=[];for(let ne=0;ne<y.mipmaps.length;ne++)G.__webglFramebuffer[Q][ne]=i.createFramebuffer()}else G.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){G.__webglFramebuffer=[];for(let Q=0;Q<y.mipmaps.length;Q++)G.__webglFramebuffer[Q]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(le)for(let Q=0,ne=j.length;Q<ne;Q++){let ce=n.get(j[Q]);ce.__webglTexture===void 0&&(ce.__webglTexture=i.createTexture(),a.memory.textures++)}if(R.samples>0&&yt(R)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let Q=0;Q<j.length;Q++){let ne=j[Q];G.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[Q]);let ce=r.convert(ne.format,ne.colorSpace),Pe=r.convert(ne.type),fe=M(ne.internalFormat,ce,Pe,ne.normalized,ne.colorSpace,R.isXRRenderTarget===!0),he=ft(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,he,fe,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,G.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),re(G.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(oe){t.bindTexture(i.TEXTURE_CUBE_MAP,q.__webglTexture),Me(i.TEXTURE_CUBE_MAP,y);for(let Q=0;Q<6;Q++)if(y.mipmaps&&y.mipmaps.length>0)for(let ne=0;ne<y.mipmaps.length;ne++)xe(G.__webglFramebuffer[Q][ne],R,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ne);else xe(G.__webglFramebuffer[Q],R,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);d(y)&&T(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(le){for(let Q=0,ne=j.length;Q<ne;Q++){let ce=j[Q],Pe=n.get(ce),fe=i.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(fe=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(fe,Pe.__webglTexture),Me(fe,ce),xe(G.__webglFramebuffer,R,ce,i.COLOR_ATTACHMENT0+Q,fe,0),d(ce)&&T(fe)}t.unbindTexture()}else{let Q=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Q=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Q,q.__webglTexture),Me(Q,y),y.mipmaps&&y.mipmaps.length>0)for(let ne=0;ne<y.mipmaps.length;ne++)xe(G.__webglFramebuffer[ne],R,y,i.COLOR_ATTACHMENT0,Q,ne);else xe(G.__webglFramebuffer,R,y,i.COLOR_ATTACHMENT0,Q,0);d(y)&&T(Q),t.unbindTexture()}R.depthBuffer&&be(R)}function Ge(R){let y=R.textures;for(let G=0,q=y.length;G<q;G++){let j=y[G];if(d(j)){let oe=A(R),le=n.get(j).__webglTexture;t.bindTexture(oe,le),T(oe),t.unbindTexture()}}}let ot=[],xt=[];function gt(R){if(R.samples>0){if(yt(R)===!1){let y=R.textures,G=R.width,q=R.height,j=i.COLOR_BUFFER_BIT,oe=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=n.get(R),Q=y.length>1;if(Q)for(let ce=0;ce<y.length;ce++)t.bindFramebuffer(i.FRAMEBUFFER,le.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,le.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,le.__webglMultisampledFramebuffer);let ne=R.texture.mipmaps;ne&&ne.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglFramebuffer);for(let ce=0;ce<y.length;ce++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(j|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(j|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,le.__webglColorRenderbuffer[ce]);let Pe=n.get(y[ce]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Pe,0)}i.blitFramebuffer(0,0,G,q,0,0,G,q,j,i.NEAREST),l===!0&&(ot.length=0,xt.length=0,ot.push(i.COLOR_ATTACHMENT0+ce),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(ot.push(oe),xt.push(oe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,xt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ot))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let ce=0;ce<y.length;ce++){t.bindFramebuffer(i.FRAMEBUFFER,le.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,le.__webglColorRenderbuffer[ce]);let Pe=n.get(y[ce]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,le.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,Pe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&l){let y=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function ft(R){return Math.min(s.maxSamples,R.samples)}function yt(R){let y=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function B(R){let y=a.render.frame;u.get(R)!==y&&(u.set(R,y),R.update())}function Lt(R,y){let G=R.colorSpace,q=R.format,j=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||G!==ws&&G!==Hn&&(Je.getTransfer(G)===nt?(q!==cn||j!==$t)&&Fe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Oe("WebGLTextures: Unsupported texture color space:",G)),y}function it(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=$,this.resetTextureUnits=k,this.getTextureUnits=P,this.setTextureUnits=H,this.setTexture2D=I,this.setTexture2DArray=N,this.setTexture3D=z,this.setTextureCube=V,this.rebindTextures=Ie,this.setupRenderTarget=Ye,this.updateRenderTargetMipmap=Ge,this.updateMultisampleRenderTarget=gt,this.setupDepthRenderbuffer=be,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=yt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function a_(i,e){function t(n,s=Hn){let r,a=Je.getTransfer(s);if(n===$t)return i.UNSIGNED_BYTE;if(n===Ra)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ia)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Dl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Nl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Pl)return i.BYTE;if(n===Ll)return i.SHORT;if(n===rs)return i.UNSIGNED_SHORT;if(n===Ca)return i.INT;if(n===_n)return i.UNSIGNED_INT;if(n===ln)return i.FLOAT;if(n===xn)return i.HALF_FLOAT;if(n===Ul)return i.ALPHA;if(n===Fl)return i.RGB;if(n===cn)return i.RGBA;if(n===Tn)return i.DEPTH_COMPONENT;if(n===li)return i.DEPTH_STENCIL;if(n===Pa)return i.RED;if(n===La)return i.RED_INTEGER;if(n===ci)return i.RG;if(n===Da)return i.RG_INTEGER;if(n===Na)return i.RGBA_INTEGER;if(n===tr||n===nr||n===ir||n===sr)if(a===nt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===tr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===tr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===nr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===sr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ua||n===Fa||n===Oa||n===Ba)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ua)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Fa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Oa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ba)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===za||n===ka||n===Va||n===Ga||n===Ha||n===rr||n===Wa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===za||n===ka)return a===nt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Va)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Ga)return r.COMPRESSED_R11_EAC;if(n===Ha)return r.COMPRESSED_SIGNED_R11_EAC;if(n===rr)return r.COMPRESSED_RG11_EAC;if(n===Wa)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Xa||n===qa||n===Ya||n===$a||n===Za||n===Ja||n===Ka||n===ja||n===Qa||n===eo||n===to||n===no||n===io||n===so)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Xa)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===qa)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ya)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===$a)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Za)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ja)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ka)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ja)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Qa)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===eo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===to)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===no)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===io)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===so)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ro||n===ao||n===oo)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===ro)return a===nt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ao)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===oo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===lo||n===co||n===ar||n===ho)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===lo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===co)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ar)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ho)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===as?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var o_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,l_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,rc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Bs(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new jt({vertexShader:o_,fragmentShader:l_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new pt(new Hs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ac=class extends wn{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,m=null,h=null,f=null,x=null,v=typeof XRWebGLBinding<"u",p=new rc,d={},T=t.getContextAttributes(),A=null,M=null,_=[],S=[],w=new Re,g=null,E=null,C=new Ft;C.viewport=new dt;let L=new Ft;L.viewport=new dt;let D=[C,L],k=new Sa,P=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let ee=_[Z];return ee===void 0&&(ee=new ji,_[Z]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(Z){let ee=_[Z];return ee===void 0&&(ee=new ji,_[Z]=ee),ee.getGripSpace()},this.getHand=function(Z){let ee=_[Z];return ee===void 0&&(ee=new ji,_[Z]=ee),ee.getHandSpace()};function $(Z){let ee=S.indexOf(Z.inputSource);if(ee===-1)return;let ve=_[ee];ve!==void 0&&(ve.update(Z.inputSource,Z.frame,c||a),ve.dispatchEvent({type:Z.type,data:Z.inputSource}))}function Y(){s.removeEventListener("select",$),s.removeEventListener("selectstart",$),s.removeEventListener("selectend",$),s.removeEventListener("squeeze",$),s.removeEventListener("squeezestart",$),s.removeEventListener("squeezeend",$),s.removeEventListener("end",Y),s.removeEventListener("inputsourceschange",I);for(let Z=0;Z<_.length;Z++){let ee=S[Z];ee!==null&&(S[Z]=null,_[Z].disconnect(ee))}P=null,H=null,p.reset();for(let Z in d)delete d[Z];if(e.setRenderTarget(A),f=null,h=null,m=null,s=null,M=null,ze.stop(),n.isPresenting=!1,e.setPixelRatio(g),e.setSize(w.width,w.height,!1),E!==null){let Z=E.camera;Z.fov=E.fov,Z.zoom=E.zoom,Z.updateProjectionMatrix(),E=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,n.isPresenting===!0&&Fe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,n.isPresenting===!0&&Fe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return m===null&&v&&(m=new XRWebGLBinding(s,t)),m},this.getFrame=function(){return x},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(A=e.getRenderTarget(),s.addEventListener("select",$),s.addEventListener("selectstart",$),s.addEventListener("selectend",$),s.addEventListener("squeeze",$),s.addEventListener("squeezestart",$),s.addEventListener("squeezeend",$),s.addEventListener("end",Y),s.addEventListener("inputsourceschange",I),T.xrCompatible!==!0&&await t.makeXRCompatible(),g=e.getPixelRatio(),e.getSize(w),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let ve=null,De=null,xe=null;T.depth&&(xe=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ve=T.stencil?li:Tn,De=T.stencil?as:_n);let re={colorFormat:t.RGBA8,depthFormat:xe,scaleFactor:r};m=this.getBinding(),h=m.createProjectionLayer(re),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),M=new Yt(h.textureWidth,h.textureHeight,{format:cn,type:$t,depthTexture:new ti(h.textureWidth,h.textureHeight,De,void 0,void 0,void 0,void 0,void 0,void 0,ve),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let ve={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ve),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),M=new Yt(f.framebufferWidth,f.framebufferHeight,{format:cn,type:$t,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ze.setContext(s),ze.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function I(Z){for(let ee=0;ee<Z.removed.length;ee++){let ve=Z.removed[ee],De=S.indexOf(ve);De>=0&&(S[De]=null,_[De].disconnect(ve))}for(let ee=0;ee<Z.added.length;ee++){let ve=Z.added[ee],De=S.indexOf(ve);if(De===-1){for(let re=0;re<_.length;re++)if(re>=S.length){S.push(ve),De=re;break}else if(S[re]===null){S[re]=ve,De=re;break}if(De===-1)break}let xe=_[De];xe&&xe.connect(ve)}}let N=new U,z=new U;function V(Z,ee,ve){N.setFromMatrixPosition(ee.matrixWorld),z.setFromMatrixPosition(ve.matrixWorld);let De=N.distanceTo(z),xe=ee.projectionMatrix.elements,re=ve.projectionMatrix.elements,qe=xe[14]/(xe[10]-1),be=xe[14]/(xe[10]+1),Ie=(xe[9]+1)/xe[5],Ye=(xe[9]-1)/xe[5],Ge=(xe[8]-1)/xe[0],ot=(re[8]+1)/re[0],xt=qe*Ge,gt=qe*ot,ft=De/(-Ge+ot),yt=ft*-Ge;if(ee.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(yt),Z.translateZ(ft),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),xe[10]===-1)Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{let B=qe+ft,Lt=be+ft,it=xt-yt,R=gt+(De-yt),y=Ie*be/Lt*B,G=Ye*be/Lt*B;Z.projectionMatrix.makePerspective(it,R,y,G,B,Lt),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function se(Z,ee){ee===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(ee.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let ee=Z.near,ve=Z.far;p.texture!==null&&(p.depthNear>0&&(ee=p.depthNear),p.depthFar>0&&(ve=p.depthFar)),k.near=L.near=C.near=ee,k.far=L.far=C.far=ve,(P!==k.near||H!==k.far)&&(s.updateRenderState({depthNear:k.near,depthFar:k.far}),P=k.near,H=k.far),k.layers.mask=Z.layers.mask|6,C.layers.mask=k.layers.mask&-5,L.layers.mask=k.layers.mask&-3;let De=Z.parent,xe=k.cameras;se(k,De);for(let re=0;re<xe.length;re++)se(xe[re],De);xe.length===2?V(k,C,L):k.projectionMatrix.copy(C.projectionMatrix),E===null&&Z.isPerspectiveCamera&&(E={camera:Z,fov:Z.fov,zoom:Z.zoom}),K(Z,k,De)};function K(Z,ee,ve){ve===null?Z.matrix.copy(ee.matrixWorld):(Z.matrix.copy(ve.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(ee.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=Zi*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(Z){l=Z,h!==null&&(h.fixedFoveation=Z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Z)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(k)},this.getCameraTexture=function(Z){return d[Z]};let me=null;function Me(Z,ee){if(u=ee.getViewerPose(c||a),x=ee,u!==null){let ve=u.views;f!==null&&(e.setRenderTargetFramebuffer(M,f.framebuffer),e.setRenderTarget(M));let De=!1;ve.length!==k.cameras.length&&(k.cameras.length=0,De=!0);for(let be=0;be<ve.length;be++){let Ie=ve[be],Ye=null;if(f!==null)Ye=f.getViewport(Ie);else{let ot=m.getViewSubImage(h,Ie);Ye=ot.viewport,be===0&&(e.setRenderTargetTextures(M,ot.colorTexture,ot.depthStencilTexture),e.setRenderTarget(M))}let Ge=D[be];Ge===void 0&&(Ge=new Ft,Ge.layers.enable(be),Ge.viewport=new dt,D[be]=Ge),Ge.matrix.fromArray(Ie.transform.matrix),Ge.matrix.decompose(Ge.position,Ge.quaternion,Ge.scale),Ge.projectionMatrix.fromArray(Ie.projectionMatrix),Ge.projectionMatrixInverse.copy(Ge.projectionMatrix).invert(),Ge.viewport.set(Ye.x,Ye.y,Ye.width,Ye.height),be===0&&(k.matrix.copy(Ge.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),De===!0&&k.cameras.push(Ge)}let xe=s.enabledFeatures;if(xe&&xe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){m=n.getBinding();let be=m.getDepthInformation(ve[0]);be&&be.isValid&&be.texture&&p.init(be,s.renderState)}if(xe&&xe.includes("camera-access")&&v){e.state.unbindTexture(),m=n.getBinding();for(let be=0;be<ve.length;be++){let Ie=ve[be].camera;if(Ie){let Ye=d[Ie];Ye||(Ye=new Bs,d[Ie]=Ye);let Ge=m.getCameraImage(Ie);Ye.sourceTexture=Ge}}}}for(let ve=0;ve<_.length;ve++){let De=S[ve],xe=_[ve];De!==null&&xe!==void 0&&xe.update(De,ee,c||a)}me&&me(Z,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),x=null}let ze=new Du;ze.setAnimationLoop(Me),this.setAnimationLoop=function(Z){me=Z},this.dispose=function(){}}},c_=new rt,zu=new ke;zu.set(-1,0,0,0,1,0,0,0,1);function h_(i,e){function t(p,d){p.matrixAutoUpdate===!0&&p.updateMatrix(),d.value.copy(p.matrix)}function n(p,d){d.color.getRGB(p.fogColor.value,Gl(i)),d.isFog?(p.fogNear.value=d.near,p.fogFar.value=d.far):d.isFogExp2&&(p.fogDensity.value=d.density)}function s(p,d,T,A,M){d.isNodeMaterial?d.uniformsNeedUpdate=!1:d.isMeshBasicMaterial?r(p,d):d.isMeshLambertMaterial?(r(p,d),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)):d.isMeshToonMaterial?(r(p,d),m(p,d)):d.isMeshPhongMaterial?(r(p,d),u(p,d),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)):d.isMeshStandardMaterial?(r(p,d),h(p,d),d.isMeshPhysicalMaterial&&f(p,d,M)):d.isMeshMatcapMaterial?(r(p,d),x(p,d)):d.isMeshDepthMaterial?r(p,d):d.isMeshDistanceMaterial?(r(p,d),v(p,d)):d.isMeshNormalMaterial?r(p,d):d.isLineBasicMaterial?(a(p,d),d.isLineDashedMaterial&&o(p,d)):d.isPointsMaterial?l(p,d,T,A):d.isSpriteMaterial?c(p,d):d.isShadowMaterial?(p.color.value.copy(d.color),p.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(p,d){p.opacity.value=d.opacity,d.color&&p.diffuse.value.copy(d.color),d.emissive&&p.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(p.map.value=d.map,t(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.bumpMap&&(p.bumpMap.value=d.bumpMap,t(d.bumpMap,p.bumpMapTransform),p.bumpScale.value=d.bumpScale,d.side===Wt&&(p.bumpScale.value*=-1)),d.normalMap&&(p.normalMap.value=d.normalMap,t(d.normalMap,p.normalMapTransform),p.normalScale.value.copy(d.normalScale),d.side===Wt&&p.normalScale.value.negate()),d.displacementMap&&(p.displacementMap.value=d.displacementMap,t(d.displacementMap,p.displacementMapTransform),p.displacementScale.value=d.displacementScale,p.displacementBias.value=d.displacementBias),d.emissiveMap&&(p.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,p.emissiveMapTransform)),d.specularMap&&(p.specularMap.value=d.specularMap,t(d.specularMap,p.specularMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest);let T=e.get(d),A=T.envMap,M=T.envMapRotation;A&&(p.envMap.value=A,p.envMapRotation.value.setFromMatrix4(c_.makeRotationFromEuler(M)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(zu),p.reflectivity.value=d.reflectivity,p.ior.value=d.ior,p.refractionRatio.value=d.refractionRatio),d.lightMap&&(p.lightMap.value=d.lightMap,p.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,p.lightMapTransform)),d.aoMap&&(p.aoMap.value=d.aoMap,p.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,p.aoMapTransform))}function a(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,d.map&&(p.map.value=d.map,t(d.map,p.mapTransform))}function o(p,d){p.dashSize.value=d.dashSize,p.totalSize.value=d.dashSize+d.gapSize,p.scale.value=d.scale}function l(p,d,T,A){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.size.value=d.size*T,p.scale.value=A*.5,d.map&&(p.map.value=d.map,t(d.map,p.uvTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function c(p,d){p.diffuse.value.copy(d.color),p.opacity.value=d.opacity,p.rotation.value=d.rotation,d.map&&(p.map.value=d.map,t(d.map,p.mapTransform)),d.alphaMap&&(p.alphaMap.value=d.alphaMap,t(d.alphaMap,p.alphaMapTransform)),d.alphaTest>0&&(p.alphaTest.value=d.alphaTest)}function u(p,d){p.specular.value.copy(d.specular),p.shininess.value=Math.max(d.shininess,1e-4)}function m(p,d){d.gradientMap&&(p.gradientMap.value=d.gradientMap)}function h(p,d){p.metalness.value=d.metalness,d.metalnessMap&&(p.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,p.metalnessMapTransform)),p.roughness.value=d.roughness,d.roughnessMap&&(p.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,p.roughnessMapTransform)),d.envMap&&(p.envMapIntensity.value=d.envMapIntensity)}function f(p,d,T){p.ior.value=d.ior,d.sheen>0&&(p.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),p.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(p.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,p.sheenColorMapTransform)),d.sheenRoughnessMap&&(p.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,p.sheenRoughnessMapTransform))),d.clearcoat>0&&(p.clearcoat.value=d.clearcoat,p.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(p.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,p.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(p.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Wt&&p.clearcoatNormalScale.value.negate())),d.dispersion>0&&(p.dispersion.value=d.dispersion),d.retroreflectivity>0&&(p.retroreflectivity.value=d.retroreflectivity),d.iridescence>0&&(p.iridescence.value=d.iridescence,p.iridescenceIOR.value=d.iridescenceIOR,p.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(p.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,p.iridescenceMapTransform)),d.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),d.transmission>0&&(p.transmission.value=d.transmission,p.transmissionSamplerMap.value=T.texture,p.transmissionSamplerSize.value.set(T.width,T.height),d.transmissionMap&&(p.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,p.transmissionMapTransform)),p.thickness.value=d.thickness,d.thicknessMap&&(p.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=d.attenuationDistance,p.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(p.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(p.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=d.specularIntensity,p.specularColor.value.copy(d.specularColor),d.specularColorMap&&(p.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,p.specularColorMapTransform)),d.specularIntensityMap&&(p.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,p.specularIntensityMapTransform))}function x(p,d){d.matcap&&(p.matcap.value=d.matcap)}function v(p,d){let T=e.get(d).light;p.referencePosition.value.setFromMatrixPosition(T.matrixWorld),p.nearDistance.value=T.shadow.camera.near,p.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function u_(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,_){let S=_.program;n.uniformBlockBinding(M,S)}function c(M,_){let S=s[M.id];S===void 0&&(p(M),S=u(M),s[M.id]=S,M.addEventListener("dispose",T));let w=_.program;n.updateUBOMapping(M,w);let g=e.render.frame;r[M.id]!==g&&(h(M),r[M.id]=g)}function u(M){let _=m();M.__bindingPointIndex=_;let S=i.createBuffer(),w=M.__size,g=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,w,g),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,_,S),S}function m(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return Oe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(M){let _=s[M.id],S=M.uniforms,w=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,_);for(let g=0,E=S.length;g<E;g++){let C=S[g];if(Array.isArray(C))for(let L=0,D=C.length;L<D;L++)f(C[L],g,L,w);else f(C,g,0,w)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(M,_,S,w){if(v(M,_,S,w)===!0){let g=M.__offset,E=M.value;if(Array.isArray(E)){let C=0;for(let L=0;L<E.length;L++){let D=E[L],k=d(D);x(D,M.__data,C),typeof D!="number"&&typeof D!="boolean"&&!D.isMatrix3&&!ArrayBuffer.isView(D)&&(C+=k.storage/Float32Array.BYTES_PER_ELEMENT)}}else x(E,M.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,g,M.__data)}}function x(M,_,S){typeof M=="number"||typeof M=="boolean"?_[0]=M:M.isMatrix3?(_[0]=M.elements[0],_[1]=M.elements[1],_[2]=M.elements[2],_[3]=0,_[4]=M.elements[3],_[5]=M.elements[4],_[6]=M.elements[5],_[7]=0,_[8]=M.elements[6],_[9]=M.elements[7],_[10]=M.elements[8],_[11]=0):ArrayBuffer.isView(M)?_.set(new M.constructor(M.buffer,M.byteOffset,_.length)):M.toArray(_,S)}function v(M,_,S,w){let g=M.value,E=_+"_"+S;if(w[E]===void 0)return typeof g=="number"||typeof g=="boolean"?w[E]=g:ArrayBuffer.isView(g)?w[E]=g.slice():w[E]=g.clone(),!0;{let C=w[E];if(typeof g=="number"||typeof g=="boolean"){if(C!==g)return w[E]=g,!0}else{if(ArrayBuffer.isView(g))return!0;if(C.equals(g)===!1)return C.copy(g),!0}}return!1}function p(M){let _=M.uniforms,S=0,w=16;for(let E=0,C=_.length;E<C;E++){let L=Array.isArray(_[E])?_[E]:[_[E]];for(let D=0,k=L.length;D<k;D++){let P=L[D],H=Array.isArray(P.value)?P.value:[P.value];for(let $=0,Y=H.length;$<Y;$++){let I=H[$],N=d(I),z=S%w,V=z%N.boundary,se=z+V;S+=V,se!==0&&w-se<N.storage&&(S+=w-se),P.__data=new Float32Array(N.storage/Float32Array.BYTES_PER_ELEMENT),P.__offset=S,S+=N.storage}}}let g=S%w;return g>0&&(S+=w-g),M.__size=S,M.__cache={},this}function d(M){let _={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(_.boundary=4,_.storage=4):M.isVector2?(_.boundary=8,_.storage=8):M.isVector3||M.isColor?(_.boundary=16,_.storage=12):M.isVector4?(_.boundary=16,_.storage=16):M.isMatrix3?(_.boundary=48,_.storage=48):M.isMatrix4?(_.boundary=64,_.storage=64):M.isTexture?Fe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(_.boundary=16,_.storage=M.byteLength):Fe("WebGLRenderer: Unsupported uniform value type.",M),_}function T(M){let _=M.target;_.removeEventListener("dispose",T);let S=a.indexOf(_.__bindingPointIndex);a.splice(S,1),i.deleteBuffer(s[_.id]),delete s[_.id],delete r[_.id]}function A(){for(let M in s)i.deleteBuffer(s[M]);a=[],s={},r={}}return{bind:l,update:c,dispose:A}}var d_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Pn=null;function f_(){return Pn===null&&(Pn=new Us(d_,16,16,ci,xn),Pn.name="DFG_LUT",Pn.minFilter=It,Pn.magFilter=It,Pn.wrapS=En,Pn.wrapT=En,Pn.generateMipmaps=!1,Pn.needsUpdate=!0),Pn}var yo=class{constructor(e={}){let{canvas:t=su(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:m=!1,reversedDepthBuffer:h=!1,outputBufferType:f=$t}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=n.getContextAttributes().alpha}else x=a;let v=f,p=new Set([Na,Da,La]),d=new Set([$t,_n,rs,as,Ra,Ia]),T=new Uint32Array(4),A=new Int32Array(4),M=new U,_=null,S=null,w=[],g=[],E=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=gn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,L=!1,D=null,k=null,P=null,H=null;this._outputColorSpace=Gt;let $=0,Y=0,I=null,N=-1,z=null,V=new dt,se=new dt,K=null,me=new Be(0),Me=0,ze=t.width,Z=t.height,ee=1,ve=null,De=null,xe=new dt(0,0,ze,Z),re=new dt(0,0,ze,Z),qe=!1,be=new Qi,Ie=!1,Ye=!1,Ge=new rt,ot=new U,xt=new dt,gt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ft=!1;function yt(){return I===null?ee:1}let B=n;function Lt(b,F){return t.getContext(b,F)}let it,R,y,G,q,j,oe,le,Q,ne,ce,Pe,fe,he,Le,Ue,Ve,O,ue,te,de,ye,ie;try{let b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:m};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",lt,!1),t.addEventListener("webglcontextrestored",et,!1),t.addEventListener("webglcontextcreationerror",hn,!1),B===null){let F="webgl2";if(B=Lt(F,b),B===null)throw Lt(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ne()}catch(b){throw t.removeEventListener("webglcontextlost",lt,!1),t.removeEventListener("webglcontextrestored",et,!1),t.removeEventListener("webglcontextcreationerror",hn,!1),Oe("WebGLRenderer: "+b.message),b}function Ne(){it=new vg(B),it.init(),de=new a_(B,it),R=new hg(B,it,e,de),y=new s_(B,it),R.reversedDepthBuffer&&h&&y.buffers.depth.setReversed(!0),k=B.createFramebuffer(),P=B.createFramebuffer(),H=B.createFramebuffer(),G=new bg(B),q=new W0,j=new r_(B,it,y,q,R,de,G),oe=new yg(C),le=new Tf(B),ye=new lg(B,le),Q=new Mg(B,le,G,ye),ne=new Tg(B,Q,le,ye,G),O=new Eg(B,R,j),Le=new ug(q),ce=new H0(C,oe,it,R,ye,Le),Pe=new h_(C,q),fe=new q0,he=new j0(it),Ve=new og(C,oe,y,ne,x,l),Ue=new i_(C,ne,R),ie=new u_(B,G,R,y),ue=new cg(B,it,G),te=new Sg(B,it,G),G.programs=ce.programs,C.capabilities=R,C.extensions=it,C.properties=q,C.renderLists=fe,C.shadowMap=Ue,C.state=y,C.info=G}v!==$t&&(E=new Ag(v,t.width,t.height,o,s,r));let Ae=new ac(C,B);this.xr=Ae,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let b=it.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=it.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(b){b!==void 0&&(ee=b,this.setSize(ze,Z,!1))},this.getSize=function(b){return b.set(ze,Z)},this.setSize=function(b,F,J=!0){if(Ae.isPresenting){Fe("WebGLRenderer: Can't change size while VR device is presenting.");return}ze=b,Z=F,t.width=Math.floor(b*ee),t.height=Math.floor(F*ee),J===!0&&(t.style.width=b+"px",t.style.height=F+"px"),E!==null&&E.setSize(t.width,t.height),this.setViewport(0,0,b,F)},this.getDrawingBufferSize=function(b){return b.set(ze*ee,Z*ee).floor()},this.setDrawingBufferSize=function(b,F,J){ze=b,Z=F,ee=J,t.width=Math.floor(b*J),t.height=Math.floor(F*J),this.setViewport(0,0,b,F)},this.setEffects=function(b){if(v===$t){Oe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let F=0;F<b.length;F++)if(b[F].isOutputPass===!0){Fe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(V)},this.getViewport=function(b){return b.copy(xe)},this.setViewport=function(b,F,J,W){b.isVector4?xe.set(b.x,b.y,b.z,b.w):xe.set(b,F,J,W),y.viewport(V.copy(xe).multiplyScalar(ee).round())},this.getScissor=function(b){return b.copy(re)},this.setScissor=function(b,F,J,W){b.isVector4?re.set(b.x,b.y,b.z,b.w):re.set(b,F,J,W),y.scissor(se.copy(re).multiplyScalar(ee).round())},this.getScissorTest=function(){return qe},this.setScissorTest=function(b){y.setScissorTest(qe=b)},this.setOpaqueSort=function(b){ve=b},this.setTransparentSort=function(b){De=b},this.getClearColor=function(b){return b.copy(Ve.getClearColor())},this.setClearColor=function(){Ve.setClearColor(...arguments)},this.getClearAlpha=function(){return Ve.getClearAlpha()},this.setClearAlpha=function(){Ve.setClearAlpha(...arguments)},this.clear=function(b=!0,F=!0,J=!0){let W=0;if(b){let X=!1;if(I!==null){let _e=I.texture.format;X=p.has(_e)}if(X){let _e=I.texture.type,Ee=d.has(_e),ge=Ve.getClearColor(),Te=Ve.getClearAlpha(),Ce=ge.r,He=ge.g,$e=ge.b;Ee?(T[0]=Ce,T[1]=He,T[2]=$e,T[3]=Te,B.clearBufferuiv(B.COLOR,0,T)):(A[0]=Ce,A[1]=He,A[2]=$e,A[3]=Te,B.clearBufferiv(B.COLOR,0,A))}else W|=B.COLOR_BUFFER_BIT}F&&(W|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),J&&(W|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&B.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),D=b},this.dispose=function(){t.removeEventListener("webglcontextlost",lt,!1),t.removeEventListener("webglcontextrestored",et,!1),t.removeEventListener("webglcontextcreationerror",hn,!1),Ve.dispose(),fe.dispose(),he.dispose(),q.dispose(),oe.dispose(),ne.dispose(),ye.dispose(),ie.dispose(),ce.dispose(),Ae.dispose(),Ae.removeEventListener("sessionstart",yc),Ae.removeEventListener("sessionend",vc),fi.stop()};function lt(b){b.preventDefault(),Bl("WebGLRenderer: Context Lost."),L=!0}function et(){Bl("WebGLRenderer: Context Restored."),L=!1;let b=G.autoReset,F=Ue.enabled,J=Ue.autoUpdate,W=Ue.needsUpdate,X=Ue.type;Ne(),G.autoReset=b,Ue.enabled=F,Ue.autoUpdate=J,Ue.needsUpdate=W,Ue.type=X}function hn(b){Oe("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Mn(b){let F=b.target;F.removeEventListener("dispose",Mn),nd(F)}function nd(b){id(b),q.remove(b)}function id(b){let F=q.get(b).programs;F!==void 0&&(F.forEach(function(J){ce.releaseProgram(J)}),b.isShaderMaterial&&ce.releaseShaderCache(b))}this.renderBufferDirect=function(b,F,J,W,X,_e){F===null&&(F=gt);let Ee=X.isMesh&&X.matrixWorld.determinantAffine()<0,ge=ad(b,F,J,W,X);y.setMaterial(W,Ee);let Te=J.index,Ce=1;if(W.wireframe===!0){if(Te=Q.getWireframeAttribute(J),Te===void 0)return;Ce=2}let He=J.drawRange,$e=J.attributes.position,we=He.start*Ce,tt=(He.start+He.count)*Ce;_e!==null&&(we=Math.max(we,_e.start*Ce),tt=Math.min(tt,(_e.start+_e.count)*Ce)),Te!==null?(we=Math.max(we,0),tt=Math.min(tt,Te.count)):$e!=null&&(we=Math.max(we,0),tt=Math.min(tt,$e.count));let vt=tt-we;if(vt<0||vt===1/0)return;ye.setup(X,W,ge,J,Te);let ht,at=ue;if(Te!==null&&(ht=le.get(Te),at=te,at.setIndex(ht)),X.isMesh)W.wireframe===!0?(y.setLineWidth(W.wireframeLinewidth*yt()),at.setMode(B.LINES)):at.setMode(B.TRIANGLES);else if(X.isLine){let Dt=W.linewidth;Dt===void 0&&(Dt=1),y.setLineWidth(Dt*yt()),X.isLineSegments?at.setMode(B.LINES):X.isLineLoop?at.setMode(B.LINE_LOOP):at.setMode(B.LINE_STRIP)}else X.isPoints?at.setMode(B.POINTS):X.isSprite&&at.setMode(B.TRIANGLES);if(X.isBatchedMesh)if(it.get("WEBGL_multi_draw"))at.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let Dt=X._multiDrawStarts,Se=X._multiDrawCounts,kt=X._multiDrawCount,je=Te?le.get(Te).bytesPerElement:1,en=q.get(W).currentProgram.getUniforms();for(let Sn=0;Sn<kt;Sn++)en.setValue(B,"_gl_DrawID",Sn),at.render(Dt[Sn]/je,Se[Sn])}else if(X.isInstancedMesh)at.renderInstances(we,vt,X.count);else if(J.isInstancedBufferGeometry){let Dt=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,Se=Math.min(J.instanceCount,Dt);at.renderInstances(we,vt,Se)}else at.render(we,vt)};function xc(b,F,J,W){D!==null&&b.isNodeMaterial&&D.setObject(W,b),Ie===!0&&Le.setState(b,J,!1),b.transparent===!0&&b.side===Xt&&b.forceSinglePass===!1?(b.side=Wt,b.needsUpdate=!0,gr(b,F,W),b.side=Rn,b.needsUpdate=!0,gr(b,F,W),b.side=Xt):gr(b,F,W)}this.compile=function(b,F,J=null){J===null&&(J=b),D!==null&&D.renderStart(b,F,J),S=he.get(J),S.init(F),g.push(S),J.traverseVisible(function(X){X.isLight&&X.layers.test(F.layers)&&(S.pushLight(X),X.castShadow&&S.pushShadow(X))}),b!==J&&b.traverseVisible(function(X){X.isLight&&X.layers.test(F.layers)&&(S.pushLight(X),X.castShadow&&S.pushShadow(X))}),S.setupLights(),D!==null&&D.updateLights(S.state.lightsArray),Ye=this.localClippingEnabled,Ie=Le.init(this.clippingPlanes,Ye),Ie===!0&&Le.setGlobalState(this.clippingPlanes,F),D!==null&&Ue.render(S.state.shadowsArray,J,F);let W=new Set;return b.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let _e=X.material;if(_e)if(Array.isArray(_e))for(let Ee=0;Ee<_e.length;Ee++){let ge=_e[Ee];xc(ge,J,F,X),W.add(ge)}else xc(_e,J,F,X),W.add(_e)}),S=g.pop(),D!==null&&D.renderEnd(),W},this.compileAsync=function(b,F,J=null){let W=this.compile(b,F,J);return new Promise(X=>{function _e(){if(W.forEach(function(Ee){let Te=q.get(Ee).currentProgram;(Te===void 0||Te.isReady())&&W.delete(Ee)}),W.size===0){X(b);return}setTimeout(_e,10)}it.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let Lo=null;function sd(b){Lo&&Lo(b)}function yc(){fi.stop()}function vc(){fi.start()}let fi=new Du;fi.setAnimationLoop(sd),typeof self<"u"&&fi.setContext(self),this.setAnimationLoop=function(b){Lo=b,Ae.setAnimationLoop(b),b===null?fi.stop():fi.start()},Ae.addEventListener("sessionstart",yc),Ae.addEventListener("sessionend",vc),this.render=function(b,F){if(F!==void 0&&F.isCamera!==!0){Oe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;D!==null&&D.renderStart(b,F);let J=Ae.enabled===!0&&Ae.isPresenting===!0,W=E!==null&&(I===null||J)&&E.begin(C,I);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Ae.enabled===!0&&Ae.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(Ae.cameraAutoUpdate===!0&&Ae.updateCamera(F),F=Ae.getCamera()),b.isScene===!0&&b.onBeforeRender(C,b,F,I),S=he.get(b,g.length),S.init(F),S.state.textureUnits=j.getTextureUnits(),g.push(S),Ge.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),be.setFromProjectionMatrix(Ge,mn,F.reversedDepth),Ye=this.localClippingEnabled,Ie=Le.init(this.clippingPlanes,Ye),_=fe.get(b,w.length),_.init(),w.push(_),Ae.enabled===!0&&Ae.isPresenting===!0){let Ee=C.xr.getDepthSensingMesh();Ee!==null&&Do(Ee,F,-1/0,C.sortObjects)}Do(b,F,0,C.sortObjects),_.finish(),D!==null&&D.updateLights(S.state.lightsArray),C.sortObjects===!0&&_.sort(ve,De),ft=Ae.enabled===!1||Ae.isPresenting===!1||Ae.hasDepthSensing()===!1,ft&&Ve.addToRenderList(_,b),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ie===!0&&Le.beginShadows();let X=S.state.shadowsArray;if(Ue.render(X,b,F),Ie===!0&&Le.endShadows(),(W&&E.hasRenderPass())===!1){let Ee=_.opaque,ge=_.transmissive;if(S.setupLights(),F.isArrayCamera){let Te=F.cameras;if(ge.length>0)for(let Ce=0,He=Te.length;Ce<He;Ce++){let $e=Te[Ce];Sc(Ee,ge,b,$e)}ft&&Ve.render(b);for(let Ce=0,He=Te.length;Ce<He;Ce++){let $e=Te[Ce];Mc(_,b,$e,$e.viewport)}}else ge.length>0&&Sc(Ee,ge,b,F),ft&&Ve.render(b),Mc(_,b,F)}I!==null&&Y===0&&(j.updateMultisampleRenderTarget(I),j.updateRenderTargetMipmap(I)),W&&E.end(C),b.isScene===!0&&b.onAfterRender(C,b,F),ye.resetDefaultState(),N=-1,z=null,g.pop(),g.length>0?(S=g[g.length-1],j.setTextureUnits(S.state.textureUnits),Ie===!0&&Le.setGlobalState(C.clippingPlanes,S.state.camera)):S=null,w.pop(),w.length>0?_=w[w.length-1]:_=null,D!==null&&D.renderEnd()};function Do(b,F,J,W){if(b.visible===!1)return;if(b.layers.test(F.layers)){if(b.isGroup)J=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(F);else if(b.isLightProbeGrid)S.pushLightProbeGrid(b);else if(b.isLight)S.pushLight(b),b.castShadow&&S.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||b.intersectsFrustum(be)){W&&xt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Ge);let Ee=ne.update(b),ge=b.material;ge.visible&&_.push(b,Ee,ge,J,xt.z,null,F)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||b.intersectsFrustum(be))){let Ee=ne.update(b),ge=b.material;if(W&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),xt.copy(b.boundingSphere.center)):(Ee.boundingSphere===null&&Ee.computeBoundingSphere(),xt.copy(Ee.boundingSphere.center)),xt.applyMatrix4(b.matrixWorld).applyMatrix4(Ge)),Array.isArray(ge)){let Te=Ee.groups;for(let Ce=0,He=Te.length;Ce<He;Ce++){let $e=Te[Ce],we=ge[$e.materialIndex];we&&we.visible&&_.push(b,Ee,we,J,xt.z,$e,F)}}else ge.visible&&_.push(b,Ee,ge,J,xt.z,null,F)}}let _e=b.children;for(let Ee=0,ge=_e.length;Ee<ge;Ee++)Do(_e[Ee],F,J,W)}function Mc(b,F,J,W){let{opaque:X,transmissive:_e,transparent:Ee}=b;S.setupLightsView(J),Ie===!0&&Le.setGlobalState(C.clippingPlanes,J),W&&y.viewport(V.copy(W)),X.length>0&&mr(X,F,J),_e.length>0&&mr(_e,F,J),Ee.length>0&&mr(Ee,F,J),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function Sc(b,F,J,W){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[W.id]===void 0){let we=it.has("EXT_color_buffer_half_float")||it.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[W.id]=new Yt(1,1,{generateMipmaps:!0,type:we?xn:$t,minFilter:oi,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Je.workingColorSpace})}let _e=S.state.transmissionRenderTarget[W.id],Ee=W.viewport||V;_e.setSize(Ee.z*C.transmissionResolutionScale,Ee.w*C.transmissionResolutionScale);let ge=C.getRenderTarget(),Te=C.getActiveCubeFace(),Ce=C.getActiveMipmapLevel();C.setRenderTarget(_e),C.getClearColor(me),Me=C.getClearAlpha(),Me<1&&C.setClearColor(16777215,.5),C.clear(),ft&&Ve.render(J);let He=C.toneMapping;C.toneMapping=gn;let $e=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),S.setupLightsView(W),Ie===!0&&Le.setGlobalState(C.clippingPlanes,W),mr(b,J,W),j.updateMultisampleRenderTarget(_e),j.updateRenderTargetMipmap(_e),it.has("WEBGL_multisampled_render_to_texture")===!1){let we=!1;for(let tt=0,vt=F.length;tt<vt;tt++){let ht=F[tt],{object:at,geometry:Dt,material:Se,group:kt}=ht;if(Se.side===Xt&&at.layers.test(W.layers)){let je=Se.side;Se.side=Wt,Se.needsUpdate=!0,bc(at,J,W,Dt,Se,kt),Se.side=je,Se.needsUpdate=!0,we=!0}}we===!0&&(j.updateMultisampleRenderTarget(_e),j.updateRenderTargetMipmap(_e))}C.setRenderTarget(ge,Te,Ce),C.setClearColor(me,Me),$e!==void 0&&(W.viewport=$e),C.toneMapping=He}function mr(b,F,J){let W=F.isScene===!0?F.overrideMaterial:null;for(let X=0,_e=b.length;X<_e;X++){let Ee=b[X],{object:ge,geometry:Te,group:Ce}=Ee,He=Ee.material;He.allowOverride===!0&&W!==null&&(He=W),ge.layers.test(J.layers)&&bc(ge,F,J,Te,He,Ce)}}function bc(b,F,J,W,X,_e){D!==null&&X.isNodeMaterial&&D.setObject(b,X),b.onBeforeRender(C,F,J,W,X,_e),b.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),X.onBeforeRender(C,F,J,W,b,_e),X.transparent===!0&&X.side===Xt&&X.forceSinglePass===!1?(X.side=Wt,X.needsUpdate=!0,C.renderBufferDirect(J,F,W,X,b,_e),X.side=Rn,X.needsUpdate=!0,C.renderBufferDirect(J,F,W,X,b,_e),X.side=Xt):C.renderBufferDirect(J,F,W,X,b,_e),b.onAfterRender(C,F,J,W,X,_e)}function gr(b,F,J){F.isScene!==!0&&(F=gt);let W=q.get(b),X=S.state.lights,_e=S.state.shadowsArray,Ee=X.state.version,ge=ce.getParameters(b,X.state,_e,F,J,S.state.lightProbeGridArray),Te=ce.getProgramCacheKey(ge),Ce=W.programs;W.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?F.environment:null,W.fog=F.fog;let He=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;W.envMap=oe.get(b.envMap||W.environment,He),W.envMapRotation=W.environment!==null&&b.envMap===null?F.environmentRotation:b.envMapRotation,Ce===void 0&&(b.addEventListener("dispose",Mn),Ce=new Map,W.programs=Ce);let $e=Ce.get(Te);if($e!==void 0){if(W.currentProgram===$e&&W.lightsStateVersion===Ee)return Tc(b,ge),$e}else ge.uniforms=ce.getUniforms(b),D!==null&&b.isNodeMaterial&&D.build(b,J,ge),b.onBeforeCompile(ge,C),$e=ce.acquireProgram(ge,Te),Ce.set(Te,$e),W.uniforms=ge.uniforms;let we=W.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(we.clippingPlanes=Le.uniform),Tc(b,ge),W.needsLights=ld(b),W.lightsStateVersion=Ee,W.needsLights&&(we.ambientLightColor.value=X.state.ambient,we.lightProbe.value=X.state.probe,we.sunLights.value=X.state.sun,we.sunLightShadows.value=X.state.sunShadow,we.directionalLights.value=X.state.directional,we.directionalLightShadows.value=X.state.directionalShadow,we.spotLights.value=X.state.spot,we.spotLightShadows.value=X.state.spotShadow,we.rectAreaLights.value=X.state.rectArea,we.ltc_1.value=X.state.rectAreaLTC1,we.ltc_2.value=X.state.rectAreaLTC2,we.pointLights.value=X.state.point,we.pointLightShadows.value=X.state.pointShadow,we.hemisphereLights.value=X.state.hemi,we.sunShadowMatrix.value=X.state.sunShadowMatrix,we.sunShadowCascade.value=X.state.sunShadowCascade,we.directionalShadowMatrix.value=X.state.directionalShadowMatrix,we.spotLightMatrix.value=X.state.spotLightMatrix,we.spotLightMap.value=X.state.spotLightMap,we.pointShadowMatrix.value=X.state.pointShadowMatrix),W.lightProbeGrid=S.state.lightProbeGridArray.length>0,W.currentProgram=$e,W.uniformsList=null,$e}function Ec(b){if(b.uniformsList===null){let F=b.currentProgram.getUniforms();b.uniformsList=hs.seqWithValue(F.seq,b.uniforms)}return b.uniformsList}function Tc(b,F){let J=q.get(b);J.outputColorSpace=F.outputColorSpace,J.batching=F.batching,J.batchingColor=F.batchingColor,J.instancing=F.instancing,J.instancingColor=F.instancingColor,J.instancingMorph=F.instancingMorph,J.skinning=F.skinning,J.morphTargets=F.morphTargets,J.morphNormals=F.morphNormals,J.morphColors=F.morphColors,J.morphTargetsCount=F.morphTargetsCount,J.numClippingPlanes=F.numClippingPlanes,J.numIntersection=F.numClipIntersection,J.vertexAlphas=F.vertexAlphas,J.vertexTangents=F.vertexTangents,J.toneMapping=F.toneMapping}function rd(b,F){if(b.length===0)return null;if(b.length===1)return b[0].texture!==null?b[0]:null;M.setFromMatrixPosition(F.matrixWorld);for(let J=0,W=b.length;J<W;J++){let X=b[J];if(X.texture!==null&&X.boundingBox.containsPoint(M))return X}return null}function ad(b,F,J,W,X){F.isScene!==!0&&(F=gt),j.resetTextureUnits();let _e=F.fog,Ee=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?F.environment:null,ge=I===null?C.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:Je.workingColorSpace,Te=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,Ce=oe.get(W.envMap||Ee,Te),He=W.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,$e=!!J.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),we=!!J.morphAttributes.position,tt=!!J.morphAttributes.normal,vt=!!J.morphAttributes.color,ht=gn;W.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(ht=C.toneMapping);let at=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,Dt=at!==void 0?at.length:0,Se=q.get(W),kt=S.state.lights;if(Ie===!0&&(Ye===!0||b!==z)){let ct=b===z&&W.id===N;Le.setState(W,b,ct)}let je=!1;W.version===Se.__version?(Se.needsLights&&Se.lightsStateVersion!==kt.state.version||Se.outputColorSpace!==ge||X.isBatchedMesh&&Se.batching===!1||!X.isBatchedMesh&&Se.batching===!0||X.isBatchedMesh&&Se.batchingColor===!0&&X._colorsTexture===null||X.isBatchedMesh&&Se.batchingColor===!1&&X._colorsTexture!==null||X.isInstancedMesh&&Se.instancing===!1||!X.isInstancedMesh&&Se.instancing===!0||X.isSkinnedMesh&&Se.skinning===!1||!X.isSkinnedMesh&&Se.skinning===!0||X.isInstancedMesh&&Se.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Se.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Se.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Se.instancingMorph===!1&&X.morphTexture!==null||Se.envMap!==Ce||W.fog===!0&&Se.fog!==_e||Se.numClippingPlanes!==void 0&&(Se.numClippingPlanes!==Le.numPlanes||Se.numIntersection!==Le.numIntersection)||Se.vertexAlphas!==He||Se.vertexTangents!==$e||Se.morphTargets!==we||Se.morphNormals!==tt||Se.morphColors!==vt||Se.toneMapping!==ht||Se.morphTargetsCount!==Dt||!!Se.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(je=!0):(je=!0,Se.__version=W.version);let en=Se.currentProgram;je===!0&&(en=gr(W,F,X),D&&W.isNodeMaterial&&D.onUpdateProgram(W,en,Se));let Sn=!1,Wn=!1,Ci=!1,st=en.getUniforms(),_t=Se.uniforms;if(y.useProgram(en.program)&&(Sn=!0,Wn=!0,Ci=!0),W.id!==N&&(N=W.id,Wn=!0),Se.needsLights){let ct=rd(S.state.lightProbeGridArray,X);Se.lightProbeGrid!==ct&&(Se.lightProbeGrid=ct,Wn=!0)}if(Sn||z!==b){y.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),st.setValue(B,"projectionMatrix",b.projectionMatrix),st.setValue(B,"viewMatrix",b.matrixWorldInverse);let qn=st.map.cameraPosition;qn!==void 0&&qn.setValue(B,ot.setFromMatrixPosition(b.matrixWorld)),R.logarithmicDepthBuffer&&st.setValue(B,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&st.setValue(B,"isOrthographic",b.isOrthographicCamera===!0),z!==b&&(z=b,Wn=!0,Ci=!0)}if(Se.needsLights&&(kt.state.sunShadowMap.length>0&&st.setValue(B,"sunShadowMap",kt.state.sunShadowMap,j),kt.state.directionalShadowMap.length>0&&st.setValue(B,"directionalShadowMap",kt.state.directionalShadowMap,j),kt.state.spotShadowMap.length>0&&st.setValue(B,"spotShadowMap",kt.state.spotShadowMap,j),kt.state.pointShadowMap.length>0&&st.setValue(B,"pointShadowMap",kt.state.pointShadowMap,j)),X.isSkinnedMesh){st.setOptional(B,X,"bindMatrix"),st.setOptional(B,X,"bindMatrixInverse");let ct=X.skeleton;ct&&(ct.boneTexture===null&&ct.computeBoneTexture(),st.setValue(B,"boneTexture",ct.boneTexture,j))}X.isBatchedMesh&&(st.setOptional(B,X,"batchingTexture"),st.setValue(B,"batchingTexture",X._matricesTexture,j),st.setOptional(B,X,"batchingIdTexture"),st.setValue(B,"batchingIdTexture",X._indirectTexture,j),st.setOptional(B,X,"batchingColorTexture"),X._colorsTexture!==null&&st.setValue(B,"batchingColorTexture",X._colorsTexture,j));let Xn=J.morphAttributes;if((Xn.position!==void 0||Xn.normal!==void 0||Xn.color!==void 0)&&O.update(X,J,en),(Wn||Se.receiveShadow!==X.receiveShadow)&&(Se.receiveShadow=X.receiveShadow,st.setValue(B,"receiveShadow",X.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&F.environment!==null&&(_t.envMapIntensity.value=F.environmentIntensity),_t.dfgLUT!==void 0&&(_t.dfgLUT.value=f_()),Wn){if(st.setValue(B,"toneMappingExposure",C.toneMappingExposure),Se.needsLights&&od(_t,Ci),_e&&W.fog===!0&&Pe.refreshFogUniforms(_t,_e),Pe.refreshMaterialUniforms(_t,W,ee,Z,S.state.transmissionRenderTarget[b.id]),Se.needsLights&&Se.lightProbeGrid){let ct=Se.lightProbeGrid;_t.probesSH.value=ct.texture,_t.probesMin.value.copy(ct.boundingBox.min),_t.probesMax.value.copy(ct.boundingBox.max),_t.probesResolution.value.copy(ct.resolution)}hs.upload(B,Ec(Se),_t,j)}if(W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(hs.upload(B,Ec(Se),_t,j),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&st.setValue(B,"center",X.center),st.setValue(B,"modelViewMatrix",X.modelViewMatrix),st.setValue(B,"normalMatrix",X.normalMatrix),st.setValue(B,"modelMatrix",X.matrixWorld),W.uniformsGroups!==void 0){let ct=W.uniformsGroups;for(let qn=0,Ri=ct.length;qn<Ri;qn++){let Ac=ct[qn];ie.update(Ac,en),ie.bind(Ac,en)}}return en}function od(b,F){b.ambientLightColor.needsUpdate=F,b.lightProbe.needsUpdate=F,b.sunLights.needsUpdate=F,b.sunLightShadows.needsUpdate=F,b.directionalLights.needsUpdate=F,b.directionalLightShadows.needsUpdate=F,b.pointLights.needsUpdate=F,b.pointLightShadows.needsUpdate=F,b.spotLights.needsUpdate=F,b.spotLightShadows.needsUpdate=F,b.rectAreaLights.needsUpdate=F,b.hemisphereLights.needsUpdate=F}function ld(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return $},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(b,F,J){let W=q.get(b);W.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),q.get(b.texture).__webglTexture=F,q.get(b.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:J,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,F){let J=q.get(b);J.__webglFramebuffer=F,J.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(b,F=0,J=0){I=b,$=F,Y=J;let W=null,X=!1,_e=!1;if(b){let ge=q.get(b);if(ge.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(B.FRAMEBUFFER,ge.__webglFramebuffer),V.copy(b.viewport),se.copy(b.scissor),K=b.scissorTest,y.viewport(V),y.scissor(se),y.setScissorTest(K),N=-1;return}else if(ge.__webglFramebuffer===void 0)j.setupRenderTarget(b);else if(ge.__hasExternalTextures)j.rebindTextures(b,q.get(b.texture).__webglTexture,q.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let He=b.depthTexture;if(ge.__boundDepthTexture!==He){if(He!==null&&q.has(He)&&(b.width!==He.image.width||b.height!==He.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");j.setupDepthRenderbuffer(b)}}let Te=b.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(_e=!0);let Ce=q.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ce[F])?W=Ce[F][J]:W=Ce[F],X=!0):b.samples>0&&j.useMultisampledRTT(b)===!1?W=q.get(b).__webglMultisampledFramebuffer:Array.isArray(Ce)?W=Ce[J]:W=Ce,V.copy(b.viewport),se.copy(b.scissor),K=b.scissorTest}else V.copy(xe).multiplyScalar(ee).floor(),se.copy(re).multiplyScalar(ee).floor(),K=qe;if(J!==0&&(W=k),y.bindFramebuffer(B.FRAMEBUFFER,W)&&y.drawBuffers(b,W),y.viewport(V),y.scissor(se),y.setScissorTest(K),X){let ge=q.get(b.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+F,ge.__webglTexture,J)}else if(_e){let ge=F;for(let Te=0;Te<b.textures.length;Te++){let Ce=q.get(b.textures[Te]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+Te,Ce.__webglTexture,J,ge)}}else if(b!==null&&J!==0){let ge=q.get(b.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,ge.__webglTexture,J)}N=-1};function wc(b){let F=q.get(b);return(F.__readFormat!==b.format||F.__readType!==b.type)&&(F.__readFormat=b.format,F.__readType=b.type,F.__formatReadable=R.textureFormatReadable(b.format),F.__typeReadable=R.textureTypeReadable(b.type)),F}this.readRenderTargetPixels=function(b,F,J,W,X,_e,Ee,ge=0){if(!(b&&b.isWebGLRenderTarget)){Oe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=q.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ee!==void 0&&(Te=Te[Ee]),Te){y.bindFramebuffer(B.FRAMEBUFFER,Te);try{let Ce=b.textures[ge],He=Ce.format,$e=Ce.type;b.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+ge);let we=wc(Ce);if(we.__formatReadable===!1){Oe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(we.__typeReadable===!1){Oe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=b.width-W&&J>=0&&J<=b.height-X&&B.readPixels(F,J,W,X,de.convert(He),de.convert($e),_e)}finally{let Ce=I!==null?q.get(I).__webglFramebuffer:null;y.bindFramebuffer(B.FRAMEBUFFER,Ce)}}},this.readRenderTargetPixelsAsync=async function(b,F,J,W,X,_e,Ee,ge=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=q.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ee!==void 0&&(Te=Te[Ee]),Te)if(F>=0&&F<=b.width-W&&J>=0&&J<=b.height-X){y.bindFramebuffer(B.FRAMEBUFFER,Te);let Ce=b.textures[ge],He=Ce.format,$e=Ce.type;b.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+ge);let we=wc(Ce);if(we.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(we.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let tt=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,tt),B.bufferData(B.PIXEL_PACK_BUFFER,_e.byteLength,B.STREAM_READ),B.readPixels(F,J,W,X,de.convert(He),de.convert($e),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let vt=I!==null?q.get(I).__webglFramebuffer:null;y.bindFramebuffer(B.FRAMEBUFFER,vt);let ht=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await au(B,ht,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,tt),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,_e),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(tt),B.deleteSync(ht),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,F=null,J=0){let W=Math.pow(2,-J),X=Math.floor(b.image.width*W),_e=Math.floor(b.image.height*W),Ee=F!==null?F.x:0,ge=F!==null?F.y:0;j.setTexture2D(b,0),B.copyTexSubImage2D(B.TEXTURE_2D,J,0,0,Ee,ge,X,_e),y.unbindTexture()},this.copyTextureToTexture=function(b,F,J=null,W=null,X=0,_e=0){let Ee,ge,Te,Ce,He,$e,we,tt,vt,ht=b.isCompressedTexture?b.mipmaps[_e]:b.image;if(J!==null)Ee=J.max.x-J.min.x,ge=J.max.y-J.min.y,Te=J.isBox3?J.max.z-J.min.z:1,Ce=J.min.x,He=J.min.y,$e=J.isBox3?J.min.z:0;else{let _t=Math.pow(2,-X);Ee=Math.floor(ht.width*_t),ge=Math.floor(ht.height*_t),b.isDataArrayTexture?Te=ht.depth:b.isData3DTexture?Te=Math.floor(ht.depth*_t):Te=1,Ce=0,He=0,$e=0}W!==null?(we=W.x,tt=W.y,vt=W.z):(we=0,tt=0,vt=0);let at=de.convert(F.format),Dt=de.convert(F.type),Se;F.isData3DTexture?(j.setTexture3D(F,0),Se=B.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(j.setTexture2DArray(F,0),Se=B.TEXTURE_2D_ARRAY):(j.setTexture2D(F,0),Se=B.TEXTURE_2D),y.activeTexture(B.TEXTURE0),y.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,F.flipY),y.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),y.pixelStorei(B.UNPACK_ALIGNMENT,F.unpackAlignment);let kt=y.getParameter(B.UNPACK_ROW_LENGTH),je=y.getParameter(B.UNPACK_IMAGE_HEIGHT),en=y.getParameter(B.UNPACK_SKIP_PIXELS),Sn=y.getParameter(B.UNPACK_SKIP_ROWS),Wn=y.getParameter(B.UNPACK_SKIP_IMAGES);y.pixelStorei(B.UNPACK_ROW_LENGTH,ht.width),y.pixelStorei(B.UNPACK_IMAGE_HEIGHT,ht.height),y.pixelStorei(B.UNPACK_SKIP_PIXELS,Ce),y.pixelStorei(B.UNPACK_SKIP_ROWS,He),y.pixelStorei(B.UNPACK_SKIP_IMAGES,$e);let Ci=b.isDataArrayTexture||b.isData3DTexture,st=F.isDataArrayTexture||F.isData3DTexture;if(b.isDepthTexture){let _t=q.get(b),Xn=q.get(F),ct=q.get(_t.__renderTarget),qn=q.get(Xn.__renderTarget);y.bindFramebuffer(B.READ_FRAMEBUFFER,ct.__webglFramebuffer),y.bindFramebuffer(B.DRAW_FRAMEBUFFER,qn.__webglFramebuffer);for(let Ri=0;Ri<Te;Ri++)Ci&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,q.get(b).__webglTexture,X,$e+Ri),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,q.get(F).__webglTexture,_e,vt+Ri)),B.blitFramebuffer(Ce,He,Ee,ge,we,tt,Ee,ge,B.DEPTH_BUFFER_BIT,B.NEAREST);y.bindFramebuffer(B.READ_FRAMEBUFFER,null),y.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(X!==0||b.isRenderTargetTexture||q.has(b)){let _t=q.get(b),Xn=q.get(F);y.bindFramebuffer(B.READ_FRAMEBUFFER,P),y.bindFramebuffer(B.DRAW_FRAMEBUFFER,H);for(let ct=0;ct<Te;ct++)Ci?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,_t.__webglTexture,X,$e+ct):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,_t.__webglTexture,X),st?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Xn.__webglTexture,_e,vt+ct):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Xn.__webglTexture,_e),X!==0?B.blitFramebuffer(Ce,He,Ee,ge,we,tt,Ee,ge,B.COLOR_BUFFER_BIT,B.NEAREST):st?B.copyTexSubImage3D(Se,_e,we,tt,vt+ct,Ce,He,Ee,ge):B.copyTexSubImage2D(Se,_e,we,tt,Ce,He,Ee,ge);y.bindFramebuffer(B.READ_FRAMEBUFFER,null),y.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else st?b.isDataTexture||b.isData3DTexture?B.texSubImage3D(Se,_e,we,tt,vt,Ee,ge,Te,at,Dt,ht.data):F.isCompressedArrayTexture?B.compressedTexSubImage3D(Se,_e,we,tt,vt,Ee,ge,Te,at,ht.data):B.texSubImage3D(Se,_e,we,tt,vt,Ee,ge,Te,at,Dt,ht):b.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,_e,we,tt,Ee,ge,at,Dt,ht.data):b.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,_e,we,tt,ht.width,ht.height,at,ht.data):B.texSubImage2D(B.TEXTURE_2D,_e,we,tt,Ee,ge,at,Dt,ht);y.pixelStorei(B.UNPACK_ROW_LENGTH,kt),y.pixelStorei(B.UNPACK_IMAGE_HEIGHT,je),y.pixelStorei(B.UNPACK_SKIP_PIXELS,en),y.pixelStorei(B.UNPACK_SKIP_ROWS,Sn),y.pixelStorei(B.UNPACK_SKIP_IMAGES,Wn),_e===0&&F.generateMipmaps&&B.generateMipmap(Se),y.unbindTexture()},this.initRenderTarget=function(b){q.get(b).__webglFramebuffer===void 0&&j.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?j.setTextureCube(b,0):b.isData3DTexture?j.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?j.setTexture2DArray(b,0):j.setTexture2D(b,0),y.unbindTexture()},this.resetState=function(){$=0,Y=0,I=null,y.reset(),ye.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Je._getDrawingBufferColorSpace(e),t.unpackColorSpace=Je._getUnpackColorSpace()}};function ku(){let i=new Ht,e=new on({color:"#ef4444",roughness:.65}),t=new on({color:3484469}),n=new Cn(.055,.055,1,8),s=new Mi(1,14,10),r=new rn(1,1,1),a=[],o=[],l={id:"red",color:"#ef4444"},c=null,u=(v,p,d,T,A,M,_=1,S=1,w=1)=>{let g=new pt(v,p);return g.position.set(T,A,M),g.scale.set(_,S,w),g.castShadow=!0,d.add(g),g};u(n,e,i,0,.96,0,1,.52,1);let m=u(s,e,i,0,1.65-.25,0,.25,.25,.25);for(let v of[-.08,.08])u(s,t,i,v,1.65-.2,.228,.024,.031,.016);let h=Array.from({length:13},(v,p)=>{let d=Math.PI+p*Math.PI/12;return new U(Math.cos(d)*.105,1.65-.27+Math.sin(d)*.075,.236)}),f=new Ws(new es(h),16,.015,5,!1);u(f,t,i,0,0,0);for(let[v,p,d]of[[-.19,1.15,.43],[.19,1.15,.43],[-.12,.73,.65],[.12,.73,.65]]){let T=new Ht;T.position.set(v,p,0),i.add(T),u(n,e,T,0,-d/2,0,1,d,1),u(s,e,T,0,-d,0,.07,.07,.07),a.push(T)}function x(v){if(v?.id===c?.id)return;for(let d of o)d.parent.remove(d),d.material.dispose();if(o.length=0,c=v,!v)return;let p=(d,T,A,M,_,S,w,g)=>{let E=u(r,new on({color:T,roughness:.9}),d,A,M,_,S,w,g);return o.push(E),E};p(i,v.top,0,.97,0,.36,.46,.22),p(i,v.accent,0,1.18,.025,.3,.04,.23);for(let d=0;d<2;d++)p(a[d],v.top,0,-.12,0,.16,.25,.18);for(let d=2;d<4;d++)p(a[d],v.pants,0,-.26,0,.17,.5,.19),p(a[d],v.shoes,0,-.6,.055,.21,.14,.32),p(a[d],v.accent,0,-.66,.055,.215,.025,.33);if(v.pattern==="striped")for(let d=0;d<3;d++)p(i,v.accent,0,.83+d*.11,.115,.36,.028,.012);if(v.pattern==="checks")for(let d=0;d<3;d++)p(i,v.accent,-.12+d*.12,.97,.115,.025,.43,.012),p(i,v.accent,0,.84+d*.12,.12,.36,.025,.012);if(v.pattern==="trim"){p(i,v.accent,0,.98,.12,.025,.4,.012);for(let d=0;d<2;d++)p(a[d],v.accent,0,-.23,0,.17,.035,.19)}v.pattern==="pocket"&&(p(i,v.accent,-.09,.99,.125,.1,.11,.025),p(i,v.pants,0,.78,.13,.25,.11,.025))}return{group:i,setOutfit:x,setSkin(v){l=v,e.color.set(v.id==="rainbow"?"#ed738c":v.color)},update(v,p,d){i.position.set(v.x,v.y,v.z),i.rotation.y=d?Math.PI+.15:v.yaw;let T=Math.hypot(v.vx,v.vz),A=Math.sin(p*(T>.1?12:2.5))*(T>.1?.65:.12);a.forEach((M,_)=>{M.rotation.x=(_%2?-1:1)*A,M.rotation.z=_<2?_?-.12:.12:0}),m.rotation.z=Math.sin(p*2)*.04,l.id==="rainbow"&&e.color.setHSL(p*.13%1,.75,.53)},outfit(){return c?.id??""},dispose(){x(null);for(let v of[n,s,r,f])v.dispose();e.dispose(),t.dispose()}}}function Vu(i=2){let e=[],t=[];for(let s=0;s<=i;s++)for(let r=0;r<=2;r++){let a=s/i,o=(r/2-.5)*2,l=Math.sin(a*Math.PI)*.55+.04;e.push(o*l,a,Math.sin(a*Math.PI)*.2+o*o*.08)}for(let s=0;s<i;s++)for(let r=0;r<2;r++){let a=s*3+r;t.push(a,a+1,a+3,a+1,a+4,a+3)}let n=new bt;return n.setAttribute("position",new Ke(e,3)),n.setIndex(t),n.computeVertexNormals(),n}function p_(){let i=new bt;return i.setAttribute("position",new Ke([-.5,-.5,0,.5,-.5,0,-.32,-.12,.03,.32,-.12,.03,-.12,.24,.11,.12,.24,.11,.04,.5,.21],3)),i.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]),i.computeVertexNormals(),i}function Gu(i,e,t){let n=new St,s=new Map,r=[],a=[],o=e.platforms,l=null,c=null,u=0,m={box:new rn(1,1,1),ball:new Mi(1,6,4),branch:new Cn(.12,1,1,7),petal:Vu(),blossom:Vu(4),cone:new vi(1,1,7),blade:p_()},h=1/0,f=-1/0,x=1/0,v=-1/0;for(let _ of o)h=Math.min(h,_.x-35),f=Math.max(f,_.x+35),x=Math.min(x,_.z-35),v=Math.max(v,_.z+35);let p=(_,S,w)=>o.every(g=>Math.abs(_-g.x)>g.w/2+w||Math.abs(S-g.z)>g.d/2+w),d=(_,S,w,g,E,C,L,D,k=0,P=0,H=0)=>{let $=`${_}-${S}`;s.has($)||s.set($,{kind:_,color:S,items:[]}),s.get($).items.push({x:w,y:g,z:E,sx:C,sy:L,sz:D,rx:k,ry:P,rz:H})},T=(_,S,w)=>{n.position.set(_.x,_.y,_.z),n.rotation.set(_.rx||0,_.ry||0,_.rz||0),n.scale.set(_.sx,_.sy,_.sz),n.updateMatrix(),w.setMatrixAt(S,n.matrix)},A=(_,S,w,g,E,C,L)=>d("branch",7820100,_,S,w,E,g,E,Math.sin(L)*C,0,Math.cos(L)*C);function M(_,S,w,g){let E=3.8+w%3*.55,C=-2.67;A(_,C+E/2,S,E,.2,0,0);for(let D=0;D<4;D++)d("branch",9661521,_+Math.sin(D*1.257)*.16,C+E*.47,S+Math.cos(D*1.257)*.16,.035,E*.68,.035);let L=(D,k,P)=>{let H=new U().subVectors(k,D),$=new sn().setFromQuaternion(new nn().setFromUnitVectors(new U(0,1,0),H.clone().normalize())),Y=D.clone().add(k).multiplyScalar(.5);d("branch",7820100,Y.x,Y.y,Y.z,P,H.length(),P,$.x,$.y,$.z)};for(let D=0;D<5;D++){let k=D*2.399+w*.5,P=C+E*(.56+D*.052),H=Math.cos(k),$=Math.sin(k),Y=new U(_+H*.95,P+.6,S+$*.95);L(new U(_,P,S),Y,.1);for(let I=0;I<2;I++){let N=k+(I?.38:-.38),z=Y.x+Math.cos(N)*.8,V=Y.z+Math.sin(N)*.8,se=Y.y+.6+I*.15;if(L(Y,new U(z,se,V),.055),g)for(let K=0;K<(w<3?8:3);K++){let me=K*2.399+D,Me=z+Math.cos(me)*(.18+K%3*.17),ze=se+Math.sin(K*1.7)*.35,Z=V+Math.sin(me)*(.18+K%3*.17);for(let ee=0;ee<5;ee++)d(w<3?"blossom":"petal",[16103628,15771071,16369624][(K+D)%3],Me,ze,Z,.23,.29,.24,1.1,ee*1.257,0);d("box",14192296,Me,ze+.015,Z,.04,.03,.04)}else for(let K=0;K<7;K++)d("petal",[5274968,7050334,8758375][(K+w)%3],z+Math.sin(K*2.399)*.6,se+Math.cos(K)*.3,V+Math.cos(K*2.399)*.6,.6,.85,.65,1.15,K*2.399,0)}}}if(d("box",t.ground,(h+f)/2,-3.2,(x+v)/2,f-h,1,v-x),e.theme!=="city"){let _=(S,w,g)=>{let E=[],C=[];for(let k=0;k<=30;k++){let P=h+(f-h)*k/30,H=6+Math.sin(P*.12)*2.3,$=S*(1+Math.sin(P*.18)*.08);if(E.push(P,w,H-$,P,w,H+$),k<30){let Y=k*2;C.push(Y,Y+2,Y+1,Y+1,Y+2,Y+3)}}let L=new bt;L.setAttribute("position",new Ke(E,3)),L.setIndex(C),L.computeVertexNormals();let D=new pt(L,new ni({color:g,side:Xt}));D.receiveShadow=!0,i.add(D)};_(2.4,-2.66,12240544),_(1.8,-2.64,8567746);for(let S=0;S<30;S++){let w=h+S*(f-h)/30;d("ball",[11581088,10792089][S%2],w,-2.63,3.6+Math.sin(w*.12)*2.3,.65,.16,.4)}for(let S=0;S<8;S++)d("ball",[9284989,9876869,10993809][S%3],h+S*(f-h)/7,-3,v-10+S%2*5,12,4+S%3,10),d("ball",[10139530,11584154][S%2],f-9,-3,x+S*(v-x)/7,11,3+S%4,13);if(e.theme==="cabin")for(let S=0;S<16;S++){let w=h+5+S*(f-h)/16,g=v-12+S%3*3;d("branch",7625285,w,-.6,g,.12,4.2,.12);for(let E=0;E<3;E++)d("cone",[5536608,6589032][S%2],w,.2+E*.7,g,1.4-E*.25,2.2,1.4-E*.25)}}for(let _=0;_<12;_++){let S=o[_<3?0:_%o.length],w=_<3||_%2?-1:1,g=S.z+(_<3?3+_*3:_*7%9+2),E=S.x+w*(_<3?5.5+_*2:6.5+_%3*2);e.theme==="city"&&_<3&&(E=e.spawn.x+10+_*6,g=e.spawn.z-4.8);for(let C=0;C<16&&!p(E,g,e.theme==="city"?2:2.8);C++)E+=w*2;if(p(E,g,e.theme==="city"?2:2.8))if(e.theme==="city"){let C=_<3?5.5+_:3+_%5*1.35;d("box",[9546163,11978700,8229533][_%3],E,-2.7+C/2,g,3,C,3.1),d("box",5401719,E,-2.65+C,g,3.3,.2,3.4);for(let L=0;L<Math.floor(C/.7);L++)for(let D=0;D<3;D++){let k=(L+D)%3?13036014:16112544;d("box",k,E-1+D,-2+L*.7,g+1.56,.43,.35,.025),d("box",k,E-1.51,-2+L*.7,g-1+D,.025,.35,.43)}d("box",6454408,E+.6,-2.5+C,g+.5,.7,.4,.8)}else M(E,g,_,e.theme==="sakura")}if(e.theme==="flowers")for(let _=0;_<160;_++){let S=o[_%o.length],w=_*2.399,g=_<48?e.spawn.x+5+_%8*.4:S.x+Math.cos(w)*(4+_%5),E=_<48?e.spawn.z-3.4-Math.floor(_/8)*.35:S.z+Math.sin(w)*(4+_%5),C=-2.06+_%3*.09;d("branch",4816971,g,-2.35,E,.025,.7,.025);for(let L=0;L<6;L++)d("petal",[16235210,16175452,11773151,16052703][_%4],g,C,E,.24,.27,.24,1.25,L*1.047,0);d("ball",14657331,g,C+.015,E,.075,.065,.075);for(let L of[-1,1])d("petal",5081439,g,-2.33,E,.22,.35,.25,.8,L,L*.8)}if(e.theme==="cabin")for(let _=0;_<4;_++){let S=o[_*3%o.length],w=_<2?e.spawn.z-4.8:S.z+5,g=_<2?e.spawn.x+5.5+_*8:S.x-7;for(let E=0;E<16&&!p(g,w,3);E++)g-=3;d("box",12094561,g,-1.3,w,3.8,2.8,3);for(let E=0;E<8;E++)d("branch",9201738,g,-2.5+E*.32,w+1.53,.13,3.9,.13,0,0,Math.PI/2);for(let E of[-1,1])d("box",7556933,g+E*.98,.65,w,2.8,.16,3.8,0,0,-E*.55);d("box",5799042,g-1,-1.25,w+1.55,.7,.7,.05),d("box",5799042,g-1.92,-1.25,w,.05,.7,.7),d("box",7228988,g+.8,-1.65,w+1.55,.8,1.7,.06),d("box",8023652,g+.9,1.1,w+.6,.4,1.4,.4),d("box",13675127,g,-2.5,w+2.2,4.4,.22,1.1)}if(e.theme==="city"){d("box",5464681,(h+f)/2,-2.63,-8.5,f-h,.12,4);for(let _=h;_<f;_+=4)d("box",16115901,_,-2.55,-8.5,2,.025,.1);for(let _=0;_<5;_++){let S=new Ht;i.add(S);for(let[w,g,E,C,L,D,k]of[[14986641,0,.35,0,1.6,.5,.8],[4808811,0,.7,0,.75,.3,.65],[3161155,-.5,.15,-.43,.3,.3,.12],[3161155,.5,.15,-.43,.3,.3,.12],[3161155,-.5,.15,.43,.3,.3,.12],[3161155,.5,.15,.43,.3,.3,.12]]){let P=new pt(m.box,new on({color:w}));P.position.set(g,E,C),P.scale.set(L,D,k),P.castShadow=!0,S.add(P)}S.position.set(e.spawn.x+3+_*7,-2.5,-8.5+(_%2-.5)*1.6),a.push({car:S,speed:1+_*.2})}for(let _ of o)for(let S of[-1,1]){d("box",7505038,_.x,_.y+.5,_.z+S*_.d/2,_.w,.05,.05);for(let w of[-.4,.4])d("box",7505038,_.x+_.w*w,_.y+.25,_.z+S*_.d/2,.04,.5,.04)}}for(let{kind:_,color:S,items:w}of s.values()){let g=new ni({color:S,side:_==="petal"||_==="blossom"?Xt:Rn}),E=new Gn(m[_],g,w.length);E.castShadow=_!=="petal"&&_!=="blossom"&&S!==14192296,E.receiveShadow=_!=="petal"&&_!=="blossom",w.forEach((C,L)=>T(C,L,E)),i.add(E)}if(e.theme!=="city"){for(let _ of o)for(let S=0;S<28;S++){let w=S%2?-1:1,g=(S/28-.5)*.82;r.push({x:_.x+(S%4<2?w*_.w*.43:g*_.w),y:_.y+.13,z:_.z+(S%4<2?g*_.d:w*_.d*.43),sx:.07,sy:.18+S%5*.035,sz:1,ry:S*2.399,bend:0})}for(let _=0;_<320;_++){let S=o[_%o.length],w=_*2.399,g=4+_%9;r.push({x:S.x+Math.cos(w)*g,y:-2.43,z:S.z+Math.sin(w)*g,sx:.12,sy:.3+_%7*.035,sz:1,ry:w,bend:0})}l=new Gn(m.blade,new ni({color:8167012,side:Xt}),r.length),l.receiveShadow=!0,l.instanceMatrix.setUsage(po),i.add(l),c=new Gn(m.petal,new ni({color:e.theme==="sakura"?16762072:10991471,side:Xt}),72),c.instanceMatrix.setUsage(po),i.add(c)}return{update(_,S,w){if(u=0,l){let g=_.grounded&&Math.hypot(_.vx,_.vz)>.2;for(let[E,C]of r.entries()){let L=Math.max(0,1-Math.hypot(C.x-_.x,C.z-_.z)/1.35);C.bend*=Math.exp(-S*5),g&&Math.abs(C.y-_.y)<.8&&(C.bend=Math.min(.7,C.bend+L*S*8)),u=Math.max(u,C.bend),C.rz=Math.sin(w*1.8+E)*.07+C.bend,T(C,E,l)}l.instanceMatrix.needsUpdate=!0}if(c){for(let g=0;g<c.count;g++){let E=o[g%o.length],C=w+g*.43;n.position.set(E.x+Math.sin(C*.38+g)*5,5-C*.55%7.5,E.z+Math.cos(C*.25+g)*5),n.rotation.set(C,g,C*.7),n.scale.set(.12,.18,.13),n.updateMatrix(),c.setMatrixAt(g,n.matrix)}c.instanceMatrix.needsUpdate=!0}for(let{car:g,speed:E}of a)g.position.x+=S*E,g.position.x>f&&(g.position.x=h)},grassResponse(){return u}}}var bo={morning:{hemi:15530239,sky:13231343,sun:16772558,ground:6585960,ambient:2.4,intensity:3.4,direction:[-8,17,-10]},dawn:{hemi:16765369,sky:15975603,sun:16758652,ground:8547704,ambient:1.8,intensity:2.3,direction:[-22,6,-15]},night:{hemi:9613008,sky:2307920,sun:10799606,ground:3491671,ambient:1.15,intensity:.65,direction:[10,15,-12]}};function Hu(i,e,t){let n="morning",s=2,r=bo.morning,a=bo.morning,o={sky:new Be,sun:new Be,ground:new Be,hemi:new Be,ambient:2.4,intensity:3.4,direction:new U},l=new Be,c=new Be;function u(m,h){s=Math.min(2,s+m);let f=s/2;f=f*f*(3-2*f);for(let x of["sky","sun","ground","hemi"])o[x].copy(c.set(r[x])).lerp(l.set(a[x]),f);o.ambient=r.ambient+(a.ambient-r.ambient)*f,o.intensity=r.intensity+(a.intensity-r.intensity)*f;for(let[x,v]of["x","y","z"].entries())o.direction[v]=r.direction[x]+(a.direction[x]-r.direction[x])*f;i.background.copy(o.sky),i.fog.color.copy(o.sky),e.color.copy(o.sun),e.intensity=o.intensity,t.color.copy(o.hemi),t.groundColor.copy(o.ground),t.intensity=o.ambient,e.position.copy(h).add(o.direction),e.target.position.copy(h)}return{set(m){bo[m]&&(r={sky:o.sky.getHex(),sun:o.sun.getHex(),ground:o.ground.getHex(),hemi:o.hemi.getHex(),ambient:o.ambient,intensity:o.intensity,direction:o.direction.toArray()},a=bo[m],n=m,s=0)},update:u,info(){return{timeOfDay:n,sunIntensity:o.intensity}}}}var g_={sakura:{ground:8367480,top:16574942,edge:12094610,accent:15830708},flowers:{ground:7776377,top:16378047,edge:11903104,accent:15246418},city:{ground:9415333,top:14083560,edge:6520456,accent:5686734},cabin:{ground:7181426,top:14990988,edge:8414540,accent:15118950}};function Wu(i){let e=new yo({canvas:i,antialias:!0,powerPreference:"high-performance"});e.setPixelRatio(Math.min(devicePixelRatio||1,1.5)),e.shadowMap.enabled=!0,e.shadowMap.type=ba,e.outputColorSpace=Gt,e.toneMapping=js,e.toneMappingExposure=1.1;let t=0,n=16,s=0,r=0,a=new Ps,o=new Ft(45,1,.1,220);a.background=new Be(13231343),a.fog=new Is(13231343,35,115);let l=new Ys(15530239,5465690,2.4);a.add(l);let c=new Zs(16771536,3.4);c.castShadow=!0,c.shadow.mapSize.set(1024,1024),Object.assign(c.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:.1,far:65}),c.shadow.normalBias=.04,c.shadow.bias=-1e-4,a.add(c,c.target);let u=ku();a.add(u.group);let m=Hu(a,c,l);m.update(2,new U);let h=new pt(new zs(.25*1.8,24),new yi({color:2505524,transparent:!0,opacity:.22,depthWrite:!1}));h.rotation.x=-Math.PI/2,a.add(h);let f=null,x=null,v=0,p=!0,d=new Ht,T=null,A=0,M=.56,_=0;a.add(d);let S=[],w=[],g=[],E=[],C=new U,L=new U,D=new U,k=new Js,P=()=>{let N=new Set,z=new Set;d.traverse(V=>{if(V.geometry&&N.add(V.geometry),V.material)for(let se of Array.isArray(V.material)?V.material:[V.material])z.add(se)});for(let V of N)V.dispose();for(let V of z)V.dispose();a.remove(d)};function H(N){P(),d=new Ht,a.add(d),f=N,x=null,v=0,p=!0,S.length=0,w.length=0,g.length=0,E.length=0;let z=g_[f.theme],V=new rn(1,1,1),se=new Map,K=(re,qe,be,Ie,Ye,Ge=1,ot=1,xt=1)=>{se.has(qe)||se.set(qe,new on({color:qe,roughness:.8}));let gt=new pt(re,se.get(qe));return gt.position.set(be,Ie,Ye),gt.scale.set(Ge,ot,xt),gt.castShadow=!0,gt.receiveShadow=!0,d.add(gt),gt},me=new St,Me=(re,qe,be)=>{let Ie=new Gn(V,new on({color:re,roughness:.8}),qe.length);return Ie.castShadow=be,Ie.receiveShadow=!0,qe.forEach((Ye,Ge)=>{me.position.set(Ye.x,Ye.y,Ye.z),me.scale.set(Ye.w,Ye.h,Ye.d),me.updateMatrix(),Ie.setMatrixAt(Ge,me.matrix)}),d.add(Ie),Ie};S.push(Me(z.edge,f.platforms.map(re=>({...re,y:re.y-re.h/2})),!0)),Me(z.top,f.platforms.map(re=>({...re,y:re.y+.014,h:.028})),!1),Me(z.accent,f.platforms.flatMap(re=>[-1,1].map(qe=>({x:re.x,y:re.y+.035,z:re.z+qe*(re.d/2-.1),w:re.w-.16,h:.02,d:.07}))),!1),T=Gu(d,f,z);let ze=new ts(.18,.065,6,12);for(let re of f.coins)w.push({m:K(ze,16106831,re.x,re.y,re.z),coin:re});let Z=new Gs(.32),ee=new vi(.28,.65,5);for(let re of f.powerups??[])g.push({point:re,m:K(re.type==="speed"?Z:ee,re.type==="speed"?2407130:11695854,re.x,re.y,re.z)});g.some(re=>re.point.type==="speed")||Z.dispose(),g.some(re=>re.point.type==="jump")||ee.dispose();let ve=new Cn(.6,.6,.04,20);for(let re of f.checkpoints){let qe=K(ve,6603442,re.x,re.y+.035,re.z);qe.material=qe.material.clone(),E.push({m:qe,point:re}),K(V,15724254,re.x-.5,re.y+.75,re.z,.05,1.5,.05),K(V,7527626,re.x-.22,re.y+1.35,re.z,.55,.34,.04)}let De=f.goal;for(let re of[-.7,.7])K(V,z.accent,De.x+re,De.y+1.125,De.z,.16,2.25,.2);K(V,z.accent,De.x,De.y+2.25,De.z,1.56,.2,.2);let xe=K(new ts(.52,.055,8,24),16771238,De.x,De.y+1.3,De.z);xe.material.emissive.set(14984776),xe.material.emissiveIntensity=.5,$()}function $(){p=!0;let N=0;if(x){let se=1/0;f.platforms.forEach((K,me)=>{let Me=Math.hypot(K.x-x.x,K.z-x.z)+Math.abs(K.y-x.y);Me<se&&(se=Me,N=me)})}let z=f?.platforms[N],V=f?.platforms[N+1];A=V?Math.atan2(V.x-z.x,V.z-z.z):A,M=.56}function Y(){let N=i.getBoundingClientRect();e.setSize(Math.max(1,N.width),Math.max(1,N.height),!1),o.aspect=N.width/Math.max(1,N.height),o.updateProjectionMatrix()}function I(N,z,V,se=!1){if(!f)return;_+=Math.min(z,.05);let K=N.player,me=["home","shop","levels","editor"].includes(V);if(x=K,K.grounded){let be=f.platforms.findIndex(Ie=>Math.abs(K.y-Ie.y)<.08&&Math.abs(K.x-Ie.x)<=Ie.w/2&&Math.abs(K.z-Ie.z)<=Ie.d/2);be>=0&&(v=be)}let Me=f.platforms[v+1];if(!me&&p&&!se&&Me&&K.grounded&&Math.hypot(K.vx,K.vz)<.2){let be=f.platforms[v],Ie=Math.atan2(Me.x-be.x,Me.z-be.z),Ye=Math.atan2(Math.sin(Ie-A),Math.cos(Ie-A));A+=Ye*(1-Math.exp(-z*5))}(V==="home"||V==="playing")&&z>0&&(n=n*.85+z*1e3*.15),u.update(K,_,me),T.update(K,z,_);let ze=-2.65;for(let be of f.platforms)Math.abs(K.x-be.x)<=be.w/2&&Math.abs(K.z-be.z)<=be.d/2&&be.y<=K.y+.02&&(ze=Math.max(ze,be.y));h.position.set(K.x,ze+.055,K.z),h.material.opacity=.25/Math.max(1,K.y-ze+1),h.scale.setScalar(Math.min(1.8,1+(K.y-ze)*.1)),h.material.color.set(N.effects.speed?2407130:N.effects.jump?11695854:2505524);for(let{m:be,coin:Ie}of w)be.visible=!N.collected.has(Ie.id),be.rotation.y=_*2,be.position.y=Ie.y+Math.sin(_*3)*.035;for(let{m:be,point:Ie}of g)be.visible=!N.powerupsCollected.has(Ie.id),be.rotation.y=_*(Ie.type==="speed"?3:-2),be.position.y=Ie.y+.15+Math.sin(_*3)*.1;for(let{m:be,point:Ie}of E)be.material.color.set(N.checkpoint.id===Ie.id?16767113:6603442);let Z=f.platforms[1],ee=Z?Math.atan2(Z.x-f.spawn.x,Z.z-f.spawn.z):0,ve=me?A-ee:A;u.group.rotation.y=me?Math.PI+ve:K.yaw;let De=Math.min(2.4,o.aspect*1.6),xe=!me&&p&&Me?.15:0;C.set(K.x+(me?De:(Me?.x-K.x||0)*xe),K.y+.9,K.z+(Me?.z-K.z||0)*xe);let re=me?9:o.aspect<.75?17:10.5;L.set(C.x-Math.sin(ve)*re*Math.cos(M),C.y+Math.sin(M)*re,C.z-Math.cos(ve)*re*Math.cos(M)),D.copy(L).sub(C).normalize(),k.set(C,D),k.far=C.distanceTo(L);let qe=k.intersectObjects(S,!1)[0];if(qe&&qe.distance>1){let be=f.platforms[qe.instanceId];L.y=Math.max(L.y,(be?.y??C.y)+3)}o.position.copy(L),o.lookAt(C),m.update(z,u.group.position)}return Y(),{setLevel:H,setSkin:u.setSkin,setOutfit:u.setOutfit,setTimeOfDay:m.set,update:I,render(){let N=performance.now();e.render(a,o);let z=performance.now()-N;t=s++?t*.9+z*.1:z,s>8&&Math.max(t,n)>35?r++:r=0,r>=12&&e.getPixelRatio()>.65&&(e.setPixelRatio(Math.max(.65,e.getPixelRatio()*.8)),Y(),r=0),r>=12&&c.shadow.mapSize.x>512&&(c.shadow.map?.dispose(),c.shadow.map=null,c.shadow.mapSize.set(512,512),e.shadowMap.needsUpdate=!0,r=0)},resize:Y,orbit(N,z){p=!1,A-=N*.007,M=kl.clamp(M+z*.004,.2,1.15)},resetCamera:$,info(){return{yaw:A,theme:f?.theme,...m.info(),grassResponse:T?.grassResponse()??0,outfit:u.outfit(),triangles:e.info.render.triangles,drawCalls:e.info.render.calls,resources:{geometries:e.info.memory.geometries,textures:e.info.memory.textures},dpr:e.getPixelRatio(),renderMs:t,frameMs:n,shadowSize:c.shadow.mapSize.x,cameraDistance:o.position.distanceTo(C)}},dispose(){P(),u.dispose(),h.geometry.dispose(),h.material.dispose(),c.shadow.dispose(),e.dispose()}}}function Xu(i,e,t,{onJump:n,onOrbit:s,onInteract:r}){let a=new AbortController,o=new Set,l={x:0,z:0},c=(p,d,T)=>p.addEventListener(d,T,{signal:a.signal}),u=null,m=null,h=e.querySelector("span"),f=()=>{l.x=0,l.z=0,m=null,h.style.transform="translate(0px,0px)"},x=()=>{o.clear(),u=null,f()};c(window,"keydown",p=>{p.target.closest?.("input,select,textarea,button,a")||!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","KeyW","KeyA","KeyS","KeyD","Space"].includes(p.code)||(p.preventDefault(),r(),o.add(p.code))}),c(window,"keyup",p=>o.delete(p.code)),c(window,"blur",x),c(document,"visibilitychange",()=>{document.hidden&&x()}),c(i,"pointerdown",p=>{u||p.button>0||(r(),u={id:p.pointerId,x:p.clientX,y:p.clientY,startX:p.clientX,startY:p.clientY,moved:!1},i.setPointerCapture(p.pointerId))}),c(i,"pointermove",p=>{if(!u||u.id!==p.pointerId)return;let d=p.clientX-u.x,T=p.clientY-u.y;Math.hypot(p.clientX-u.startX,p.clientY-u.startY)>6&&(u.moved=!0),u.moved&&s(d,T),u.x=p.clientX,u.y=p.clientY}),c(i,"pointerup",p=>{if(!u||u.id!==p.pointerId)return;let d=u.moved||Math.hypot(p.clientX-u.startX,p.clientY-u.startY)>6;u=null,d||n()}),c(i,"pointercancel",()=>{u=null});let v=p=>{let d=e.getBoundingClientRect(),T=d.width*.32,A=(p.clientX-d.x-d.width/2)/T,M=-(p.clientY-d.y-d.height/2)/T,_=Math.max(1,Math.hypot(A,M));A/=_,M/=_,l.x=A,l.z=M,h.style.transform=`translate(${A*T}px,${-M*T}px)`};c(e,"pointerdown",p=>{m===null&&(p.preventDefault(),r(),m=p.pointerId,e.setPointerCapture(p.pointerId),v(p))}),c(e,"pointermove",p=>{m===p.pointerId&&v(p)});for(let p of["pointerup","pointercancel","lostpointercapture"])c(e,p,d=>{m===d.pointerId&&f()});return c(t,"pointerdown",p=>{p.preventDefault(),r(),n()}),c(t,"keydown",p=>{(p.code==="Space"||p.code==="Enter")&&(p.preventDefault(),r(),n())}),c(i,"contextmenu",p=>p.preventDefault()),{sample(p){let d=l.x+Number(o.has("KeyD")||o.has("ArrowRight"))-Number(o.has("KeyA")||o.has("ArrowLeft")),T=l.z+Number(o.has("KeyW")||o.has("ArrowUp"))-Number(o.has("KeyS")||o.has("ArrowDown")),A=Math.cos(p),M=Math.sin(p);return{x:-d*A+T*M,z:T*A+d*M,jump:o.has("Space")}},clear:x,dispose(){x(),a.abort()}}}var qu="glow-parkour-routes-v1",__="glow-parkour-level-v1",x_=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,lc=i=>i&&typeof i=="object"&&!Array.isArray(i),Yu=(i,e)=>typeof i=="string"&&i.trim()?i.trim().slice(0,80):e;function cc(i,e=!0){let t="\u96F6\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D";if(i<10)return t[i];for(let[n,s]of[[1e8,"\u4EBF"],[1e4,"\u4E07"],[1e3,"\u5343"],[100,"\u767E"],[10,"\u5341"]]){if(i<n)continue;let r=Math.floor(i/n),a=i%n;return(n===10&&r===1&&e?"":cc(r))+s+(a?(a<n/10?"\u96F6":"")+cc(a,!1):"")}}function y_(){if(globalThis.crypto.randomUUID)return globalThis.crypto.randomUUID();let i=globalThis.crypto.getRandomValues(new Uint8Array(16));i[6]=i[6]&15|64,i[8]=i[8]&63|128;let e=Array.from(i,t=>t.toString(16).padStart(2,"0")).join("");return`${e.slice(0,8)}-${e.slice(8,12)}-${e.slice(12,16)}-${e.slice(16,20)}-${e.slice(20)}`}function hi(i){i=lc(i)?i:{};let e=[],t=new Set;for(let r of Array.isArray(i.routes)?i.routes:[]){if(!lc(r)||!x_.test(r.id)||t.has(r.id))continue;let{level:a}=Yn(r.level);a&&(t.add(r.id),a.id=r.id,a.name=Yu(r.name,a.name),e.push({id:r.id,name:a.name,level:a,updatedAt:Number.isFinite(r.updatedAt)&&r.updatedAt>=0?r.updatedAt:0}))}let n=null;if(lc(i.draft))try{n=JSON.parse(JSON.stringify(i.draft))}catch{}return{version:1,nextNumber:Number.isSafeInteger(i.nextNumber)&&i.nextNumber>0?Math.max(i.nextNumber,e.length+1):e.length+1,routes:e,draft:n}}function hc(i,e,{id:t,now:n=Date.now()}={}){let{level:s}=Yn(e);if(!s||!Number.isFinite(n)||n<0)return null;let r=t===void 0?-1:i.routes.findIndex(c=>c.id===t);if(t!==void 0&&r<0||t===void 0&&(!Number.isSafeInteger(i.nextNumber)||i.nextNumber<1||i.nextNumber===Number.MAX_SAFE_INTEGER))return null;let a=r>=0?t:y_(),o=r>=0?Yu(e.name,i.routes[r].name):`\u81EA\u521B\u8DEF\u7EBF${cc(i.nextNumber)}`;s.id=a,s.name=o;let l={id:a,name:o,level:s,updatedAt:n};return r>=0?i.routes[r]=l:(i.routes.push(l),i.nextNumber++),l}function Eo(i,e,t=qu){try{let n=JSON.parse(JSON.stringify(e)),s=hi(n);return!Array.isArray(n.routes)||s.routes.length!==n.routes.length?!1:(i.setItem(t,JSON.stringify(s)),!0)}catch{return!1}}function ur(i,e=qu){try{let t=i.getItem(e);if(t!==null)return hi(JSON.parse(t));let n=hi(),s=i.getItem(__);return s!==null&&hc(n,JSON.parse(s))&&Eo(i,n,e),n}catch{return hi()}}var v_=[["sakura","\u6A31\u82B1\u6797"],["flowers","\u767E\u82B1\u6797"],["city","\u57CE\u5E02"],["cabin","\u6797\u95F4\u6728\u5C4B"]];function $u(i,{onPlay:e,onClose:t,onStatus:n,onSaved:s}){i.innerHTML=`<section class="editor-header"><div><span class="eyebrow">YOUR LITTLE WORLD</span><h2>\u642D\u4E00\u6761\u81EA\u5DF1\u7684\u8DEF\u7EBF</h2></div><button id="editor-close" aria-label="\u5173\u95ED\u7F16\u8F91\u5668">\u2715</button></section>
    <p class="editor-note">\u4FDD\u5B58\u4F5C\u54C1\u540E\u901A\u5173\uFF0C\u6536\u96C6\u7684\u91D1\u5E01\u5C31\u80FD\u8D2D\u4E70\u5916\u89C2\u3002\u53CC\u51FB\u6216\u8FDE\u7EED\u53CC\u70B9\u540C\u4E00\u5E73\u53F0\u53EF\u5220\u9664\u3002\u65E0\u9700\u767B\u5F55\u3002</p>
    <div class="editor-commands"><button id="editor-new">\u65B0\u5EFA\u8DEF\u7EBF</button><button id="editor-clear" title="\u53EA\u5220\u9664\u5F53\u524D\u8DEF\u7EBF\u5185\u5BB9\uFF1B\u5DF2\u4FDD\u5B58\u4F5C\u54C1\u548C\u91D1\u5E01\u4FDD\u7559">\u5168\u90E8\u5220\u9664</button><a id="editor-hall" class="hall-return" href="../index.html">\u56DE\u5230\u5C0F\u706B\u7BAD\u6E38\u620F\u5385</a></div>
    <div id="clear-confirm" hidden><p>\u5220\u9664\u5F53\u524D\u8DEF\u7EBF\u7684\u5168\u90E8\u5185\u5BB9\uFF1F\u4EC5\u6E05\u7A7A\u5F53\u524D\u8349\u7A3F\uFF0C\u5DF2\u4FDD\u5B58\u4F5C\u54C1\u548C\u91D1\u5E01\u4F1A\u4FDD\u7559\u3002</p><button id="clear-accept">\u786E\u8BA4\u6E05\u7A7A</button><button id="clear-cancel">\u53D6\u6D88</button></div>
    <div class="editor-layout"><div class="map-column"><div class="tools" aria-label="\u7F16\u8F91\u5DE5\u5177">
    ${[["platform","\u5E73\u53F0"],["spawn","\u8D77\u70B9"],["goal","\u7EC8\u70B9"],["checkpoint","\u5B58\u6863\u70B9"],["coin","\u91D1\u5E01"],["speed","\u52A0\u901F"],["jump","\u9AD8\u8DF3"]].map(([I,N])=>`<button data-tool="${I}" aria-pressed="${I==="platform"}">${N}</button>`).join("")}
    </div><canvas id="editor-map" aria-label="\u4FEF\u89C6\u5173\u5361\u9884\u89C8\uFF0C\u70B9\u51FB\u7A7A\u5904\u653E\u5E73\u53F0\uFF0C\u70B9\u51FB\u5E73\u53F0\u9009\u62E9" tabindex="0"></canvas>
    <div class="map-footer"><span id="platform-count"></span><span>\u62D6\u52A8\u5E73\u79FB \xB7 \u6EDA\u8F6E\u7F29\u653E</span><button id="zoom-out" aria-label="\u7F29\u5C0F">\u2212</button><button id="zoom-in" aria-label="\u653E\u5927">\uFF0B</button></div></div>
    <form class="editor-fields" onsubmit="return false"><label>\u8DEF\u7EBF\u540D\u79F0<input id="editor-name" maxlength="80"></label><label>\u573A\u666F<select id="level-theme">${v_.map(([I,N])=>`<option value="${I}">${N}</option>`).join("")}</select></label>
    <h3 id="selected-platform">\u5E73\u53F0</h3><div class="coordinate-fields">${[["x","\u6A2A\u5411 x",-1e5,1e5],["z","\u7EB5\u5411 z",-1e5,1e5],["y","\u9876\u9762\u9AD8\u5EA6",-2,30],["w","\u5BBD\u5EA6",1,20],["d","\u6DF1\u5EA6",1,20],["h","\u539A\u5EA6",.2,10]].map(([I,N,z,V])=>`<label>${N}<input id="platform-${I}" type="number" step="0.1" min="${z}" max="${V}"></label>`).join("")}</div>
    <button id="platform-delete" class="subtle">\u5220\u9664\u9009\u4E2D\u5E73\u53F0</button><p id="editor-feedback" role="status"></p>
    <div class="editor-actions"><button id="editor-save">\u4FDD\u5B58</button><button id="editor-load">\u91CD\u65B0\u52A0\u8F7D</button><button id="editor-play" class="primary">3D \u8BD5\u73A9 \u2192</button></div></form></div>`;let r=I=>i.querySelector(`#${I}`),a=r("editor-map"),o=a.getContext("2d"),l=Uo(),c=l.platforms[0].id,u="platform",m=23,h={x:2.5,z:0},f=null,x=0,v,p=null,d=null,T,A="none",M;try{T=localStorage,M=ur(T);let I=M.draft;I?.level&&Array.isArray(I.level.platforms)?(l=I.level,v=M.routes.some(N=>N.id===I.editingId)?I.editingId:void 0,c=l.platforms.at(-1)?.id,A="loaded"):M.routes.length?(l=structuredClone(M.routes.at(-1).level),v=l.id,c=l.platforms.at(-1)?.id,A="loaded"):T.getItem("glow-parkour-level-v1")!==null&&(A="invalid")}catch{A="blocked"}M??=ur(null),l.powerups??=[];let _=!!M.draft;function S(){try{let I=T.getItem("glow-parkour-routes-v1");if(I!==null)return hi(JSON.parse(I))}catch{}return structuredClone(M)}function w(){if(!_)return!0;let I=S();return I.draft={level:structuredClone(l),editingId:v},Eo(T,I)?(M=I,!0):!1}let g=I=>{r("editor-feedback").textContent=I,n(I)},E=()=>l.platforms.find(I=>I.id===c),C=(I,N)=>l.platforms.filter(z=>Math.abs(I-z.x)<=z.w/2&&Math.abs(N-z.z)<=z.d/2).sort((z,V)=>V.y-z.y)[0],L=I=>`${I}-${Date.now().toString(36)}-${x++}`;function D(){let I=E();r("editor-name").value=l.name,r("level-theme").value=l.theme,r("selected-platform").textContent=I?`\u5E73\u53F0 ${l.platforms.indexOf(I)+1}`:"\u8BF7\u9009\u62E9\u5E73\u53F0";for(let N of["x","z","y","w","d","h"])r(`platform-${N}`).disabled=!I,r(`platform-${N}`).value=I?.[N]??"";r("platform-count").textContent=`${l.platforms.length} \u4E2A\u5E73\u53F0`}let k=(I,N)=>({x:a.clientWidth/2+(I-h.x)*m,y:a.clientHeight/2+(N-h.z)*m});function P(){let I=a.clientWidth,N=a.clientHeight;if(!I||!N)return;let z=Math.min(devicePixelRatio||1,1.5);a.width=Math.round(I*z),a.height=Math.round(N*z),o.setTransform(z,0,0,z,0,0),o.fillStyle="#ecf4ed",o.fillRect(0,0,I,N),o.strokeStyle="#d6e4d9",o.lineWidth=1;let V=k(0,0),se=m*2;for(let me=(V.x%se+se)%se;me<I;me+=se)o.beginPath(),o.moveTo(me,0),o.lineTo(me,N),o.stroke();for(let me=(V.y%se+se)%se;me<N;me+=se)o.beginPath(),o.moveTo(0,me),o.lineTo(I,me),o.stroke();for(let[me,Me]of l.platforms.entries()){let ze=k(Me.x,Me.z),Z=ze.x-Me.w*m/2,ee=ze.y-Me.d*m/2;o.fillStyle=Me.id===c?"#edd5b8":"#c0d4c7",o.fillRect(Z,ee,Me.w*m,Me.d*m),o.strokeStyle=Me.id===c?"#b78753":"#739783",o.lineWidth=Me.id===c?3:1.5,o.strokeRect(Z,ee,Me.w*m,Me.d*m),o.fillStyle="#38544a",o.font="12px system-ui",o.textAlign="left",o.fillText(`${me+1} \xB7 ${Me.y.toFixed(1)}m`,Z+5,ee+17)}let K=(me,Me,ze)=>{if(!me)return;let Z=k(me.x,me.z);o.fillStyle=Me,o.beginPath(),o.arc(Z.x,Z.y,9,0,Math.PI*2),o.fill(),o.fillStyle="#fff",o.font="bold 10px system-ui",o.textAlign="center",o.fillText(ze,Z.x,Z.y+3.5)};for(let me of l.coins)K(me,"#b7872f","\u5E01");for(let me of l.checkpoints)K(me,"#3a9786","\u5B58");for(let me of l.powerups)K(me,me.type==="speed"?"#208bac":"#9955c6",me.type==="speed"?"\u901F":"\u8DF3");K(l.spawn,"#4774a0","\u8D77"),K(l.goal,"#d0767e","\u7EC8")}function H(I,N){I=Math.round(I*2)/2,N=Math.round(N*2)/2;let z=C(I,N);if(u==="platform")if(z)c=z.id,g("\u5DF2\u9009\u4E2D\u5E73\u53F0\uFF0C\u53EF\u4FEE\u6539\u4F4D\u7F6E\u3001\u5927\u5C0F\u548C\u9AD8\u5EA6\u3002");else if(Math.abs(I)>1e5||Math.abs(N)>1e5)g("\u5E73\u53F0\u4F4D\u7F6E\u9700\u5728 -100000 \u5230 100000 \u4E4B\u95F4\u3002");else{let V={id:L("p"),x:I,z:N,y:0,w:3,d:3,h:.6};l.platforms.push(V),c=V.id,g("\u5DF2\u65B0\u589E\u5E73\u53F0\u3002\u9009\u62E9\u8D77\u70B9\u3001\u7EC8\u70B9\u7B49\u5DE5\u5177\uFF0C\u518D\u70B9\u51FB\u5E73\u53F0\u653E\u7F6E\u3002")}else if(!z)g("\u8BF7\u70B9\u51FB\u652F\u6491\u5E73\u53F0\uFF1B\u6807\u8BB0\u4F1A\u81EA\u52A8\u53D6\u8BE5\u5E73\u53F0\u9876\u9762\u9AD8\u5EA6\u3002");else if(u==="spawn"||u==="goal")l[u]={x:I,y:z.y,z:N},g(`\u5DF2\u8BBE\u7F6E${u==="spawn"?"\u8D77\u70B9":"\u7EC8\u70B9"}\u3002`);else{let V=u==="speed"||u==="jump",se=V?l.powerups:u==="coin"?l.coins:l.checkpoints,K=se.findIndex(me=>Math.hypot(me.x-I,me.z-N)<.6);K>=0?(se.splice(K,1),g("\u5DF2\u79FB\u9664\u6B64\u6807\u8BB0\u3002")):(se.push({id:L(u),x:I,y:z.y+(u==="coin"||V?.35:0),z:N,...V?{type:u}:{}}),g(`\u5DF2\u653E\u7F6E${V?u==="speed"?"\u52A0\u901F":"\u9AD8\u8DF3":u==="coin"?"\u91D1\u5E01":"\u5B58\u6863\u70B9"}\uFF1B\u518D\u6B21\u70B9\u51FB\u53EF\u79FB\u9664\u3002`))}D(),P(),w()}a.addEventListener("pointerdown",I=>{a.setPointerCapture(I.pointerId),f={id:I.pointerId,x:I.clientX,y:I.clientY,startX:I.clientX,startY:I.clientY,moved:!1}}),a.addEventListener("pointermove",I=>{f?.id===I.pointerId&&(Math.hypot(I.clientX-f.startX,I.clientY-f.startY)>6&&(f.moved=!0),f.moved&&(h.x-=(I.clientX-f.x)/m,h.z-=(I.clientY-f.y)/m,P()),f.x=I.clientX,f.y=I.clientY)}),a.addEventListener("pointerup",I=>{if(f?.id!==I.pointerId)return;let N=f.moved;if(f=null,N)p=null,d=null;else{let z=a.getBoundingClientRect(),V=h.x+(I.clientX-z.x-z.width/2)/m,se=h.z+(I.clientY-z.y-z.height/2)/m,K=C(V,se),me=performance.now(),Me=I.pointerType==="mouse";d=Me&&K&&p?.type==="mouse"&&p.id===K.id?K.id:null,!Me&&K&&p?.type===I.pointerType&&p.id===K.id&&me-p.time<340&&Math.hypot(I.clientX-p.x,I.clientY-p.y)<18?(c=K.id,$(),p=null):(p=K?{id:K.id,type:I.pointerType,time:me,x:I.clientX,y:I.clientY}:null,H(V,se))}}),a.addEventListener("dblclick",()=>{!d||p?.type!=="mouse"||(c=d,d=null,p=null,$())}),a.addEventListener("pointercancel",()=>{f=null,p=null,d=null}),a.addEventListener("wheel",I=>{I.preventDefault(),m=Math.max(4,Math.min(60,m*(I.deltaY>0?.88:1.12))),P()},{passive:!1}),r("zoom-in").onclick=()=>{m=Math.min(60,m*1.2),P()},r("zoom-out").onclick=()=>{m=Math.max(4,m/1.2),P()};for(let I of i.querySelectorAll("[data-tool]"))I.onclick=()=>{u=I.dataset.tool,p=null;for(let N of i.querySelectorAll("[data-tool]"))N.setAttribute("aria-pressed",String(N===I));g(u==="platform"?"\u70B9\u51FB\u7A7A\u5904\u653E\u5E73\u53F0\uFF0C\u70B9\u51FB\u5DF2\u6709\u5E73\u53F0\u9009\u4E2D\u3002":"\u70B9\u51FB\u5E73\u53F0\u653E\u7F6E\u6807\u8BB0\u3002")};for(let I of["x","z","y","w","d","h"])r(`platform-${I}`).onchange=()=>{let N=E();if(!N)return;let z=r(`platform-${I}`),V=Number(z.value);if(z.value===""||!Number.isFinite(V)||V<Number(z.min)||V>Number(z.max)){g(`\u6570\u503C\u9700\u5728 ${z.min} \u5230 ${z.max} \u4E4B\u95F4\u3002`),D();return}let se={...N};N[I]=V;for(let K of[l.spawn,l.goal,...l.coins,...l.checkpoints,...l.powerups])K&&Math.abs(K.x-se.x)<=se.w/2&&Math.abs(K.z-se.z)<=se.d/2&&K.y>=se.y&&K.y<=se.y+2.25&&((I==="x"||I==="z")&&(K[I]+=V-se[I]),I==="y"&&(K.y+=V-se.y));g("\u5E73\u53F0\u5DF2\u66F4\u65B0\uFF1B\u7F29\u5C0F\u5E73\u53F0\u540E\uFF0C\u8BF7\u786E\u8BA4\u6240\u6709\u6807\u8BB0\u4ECD\u6709\u652F\u6491\u3002"),D(),P(),w()};r("editor-name").onchange=()=>{l.name=r("editor-name").value.trim()||"\u6211\u7684\u5FAE\u5149\u8DEF\u7EBF",w()},r("level-theme").onchange=()=>{l.theme=r("level-theme").value,w()};function $(){let I=E();if(!I)return;let N=V=>V&&Math.abs(V.x-I.x)<=I.w/2&&Math.abs(V.z-I.z)<=I.d/2&&Math.abs(V.y-I.y)<2.26;l.platforms=l.platforms.filter(V=>V!==I),l.coins=l.coins.filter(V=>!N(V)),l.checkpoints=l.checkpoints.filter(V=>!N(V)),l.powerups=l.powerups.filter(V=>!N(V));let z=l.platforms[0];for(let V of["spawn","goal"])N(l[V])&&(l[V]=null);c=z?.id,g("\u5E73\u53F0\u53CA\u9644\u7740\u6807\u8BB0\u5DF2\u5220\u9664\u3002\u53D7\u5F71\u54CD\u7684\u8D77\u7EC8\u70B9\u9700\u8981\u91CD\u65B0\u653E\u7F6E\u3002"),D(),P(),w()}r("platform-delete").onclick=$;let Y=()=>{let I=Yn(l);return I.ok?I.level:(g(I.errors.join("\uFF1B")),null)};return r("editor-save").onclick=()=>{let I=Y();if(!I)return;let N=S(),z=hc(N,I,{id:v});z&&(N.draft={level:structuredClone(z.level),editingId:z.id}),z&&Eo(T,N)?(M=N,v=z.id,l=structuredClone(z.level),A="loaded",D(),s?.(),g(`\u5DF2\u4FDD\u5B58\u300C${z.name}\u300D\uFF0C\u53EF\u4ECE\u5173\u5361\u5217\u8868\u6E38\u73A9\u3002`)):g("\u4FDD\u5B58\u5931\u8D25\uFF1A\u6D4F\u89C8\u5668\u4E0D\u5141\u8BB8\u672C\u5730\u5B58\u50A8\u3002\u5F53\u524D\u8DEF\u7EBF\u4ECD\u53EF\u8BD5\u73A9\u3002")},r("editor-load").onclick=()=>{let I=M.routes.find(N=>N.id===v)?.level;if(!I){g("\u6CA1\u6709\u53EF\u7528\u7684\u672C\u5730\u8DEF\u7EBF\uFF0C\u6216\u4FDD\u5B58\u6570\u636E\u635F\u574F\u3002\u5F53\u524D\u7F16\u8F91\u5185\u5BB9\u5DF2\u4FDD\u7559\u3002");return}l=structuredClone(I),c=l.platforms.at(-1).id,g("\u5DF2\u4ECE\u672C\u673A\u91CD\u65B0\u52A0\u8F7D\u3002"),D(),P(),w()},r("editor-play").onclick=()=>{let I=Y();if(I){w();let N=M.routes.find(V=>V.id===v),z=N&&JSON.stringify(N.level)===JSON.stringify(I);e(I,z?N.id:null)}},r("editor-close").onclick=()=>{w(),t()},r("editor-new").onclick=()=>{l=Uo(),v=void 0,c=l.platforms[0].id,p=null,h={x:2.5,z:0},m=23,D(),P(),w(),g("\u65B0\u8349\u7A3F\u5DF2\u51C6\u5907\u597D\u3002\u4FDD\u5B58\u540E\u6210\u4E3A\u65B0\u7684\u4F5C\u54C1\u3002")},r("editor-clear").onclick=()=>{r("clear-confirm").hidden=!1},r("clear-cancel").onclick=()=>{r("clear-confirm").hidden=!0},r("clear-accept").onclick=()=>{l.platforms=[],l.coins=[],l.checkpoints=[],l.powerups=[],l.spawn=null,l.goal=null,c=void 0,p=null,r("clear-confirm").hidden=!0,D(),P(),w(),g("\u8349\u7A3F\u5DF2\u6E05\u7A7A\uFF0C\u8BF7\u653E\u7F6E\u5E73\u53F0\u548C\u8D77\u7EC8\u70B9\u3002")},new ResizeObserver(()=>{i.hidden||P()}).observe(a),{persistDraft:w,confirmLeave(){return w()||window.confirm("\u8349\u7A3F\u4FDD\u5B58\u5931\u8D25\uFF0C\u5F53\u524D\u4FEE\u6539\u8FD8\u6CA1\u6709\u5B58\u5165\u672C\u673A\u3002\u786E\u8BA4\u79BB\u5F00\uFF1F\u53D6\u6D88\u53EF\u7EE7\u7EED\u7F16\u8F91\u5E76\u91CD\u8BD5\u4FDD\u5B58\u3002")},open(I){if(_=!0,M=S(),I){let N=M.routes.find(z=>z.id===I);N&&(l=structuredClone(N.level),v=I,c=l.platforms.at(-1)?.id,h={x:l.spawn.x+2.5,z:l.spawn.z},m=23)}p=null,i.hidden=!1,i.scrollTop=0,D(),P(),g(A==="invalid"?"\u672C\u673A\u8DEF\u7EBF\u6570\u636E\u65E0\u6548\uFF0C\u5DF2\u4FDD\u7559\u5F53\u524D\u7F16\u8F91\u5185\u5BB9\uFF1B\u70B9\u51FB\u4FDD\u5B58\u5C06\u7528\u5F53\u524D\u8DEF\u7EBF\u66FF\u6362\u3002":A==="blocked"?"\u672C\u5730\u5B58\u50A8\u4E0D\u53EF\u7528\uFF0C\u5F53\u524D\u8DEF\u7EBF\u4ECD\u53EF\u7F16\u8F91\u8BD5\u73A9\u3002":A==="loaded"?"\u5DF2\u8BFB\u53D6\u672C\u673A\u8DEF\u7EBF\u3002\u70B9\u51FB\u7A7A\u5904\u6DFB\u52A0\u5E73\u53F0\uFF0C\u4FDD\u5B58\u540E\u53EF\u7EE7\u7EED\u8BD5\u73A9\u3002":"\u70B9\u51FB\u7A7A\u5904\u6DFB\u52A0\u5E73\u53F0\uFF1B\u62D6\u52A8\u9884\u89C8\u5E73\u79FB\u3002\u4FDD\u5B58\u4F5C\u54C1\u540E\u901A\u5173\u53EF\u83B7\u5F97\u91D1\u5E01\u3002")},currentLevel(){return Yn(l).level}}}function Zu(){let i=null,e=!1,t=!1,n=!1,s=new Set;async function r(){if(!(!n||e||t))try{i??=new(window.AudioContext||window.webkitAudioContext),i.state==="suspended"&&await i.resume(),(e||t)&&await i.suspend()}catch{}}function a(){return n=!0,r()}let o=()=>{for(let l of s){try{l.osc.stop()}catch{}l.osc.disconnect(),l.gain.disconnect()}s.clear()};return{unlock:a,stop:o,play(l){if(!i||i.state!=="running"||e||t||s.size>=6)return;let c=l==="finish"?[523.25,659.25,783.99]:[{jump:470,coin:1040,land:160,checkpoint:740,powerup:940}[l]];for(let[u,m]of c.entries()){if(!m)return;let h=i.createOscillator(),f=i.createGain(),x={osc:h,gain:f};s.add(x);let v=i.currentTime+u*.2;h.type=l==="land"?"triangle":"sine",h.frequency.setValueAtTime(m,v),h.frequency.exponentialRampToValueAtTime(l==="jump"?760:m*.8,v+.1),f.gain.setValueAtTime(.035,v),f.gain.exponentialRampToValueAtTime(1e-4,v+.16),h.connect(f),f.connect(i.destination),h.onended=()=>{s.delete(x),h.disconnect(),f.disconnect()},h.start(v),h.stop(v+.17)}},setMuted(l){e=l,l?(o(),i?.suspend().catch(()=>{})):r()},setPaused(l){t=l,l?(o(),i?.suspend().catch(()=>{})):r()},dispose(){o(),i?.close().catch(()=>{})}}}function Ju(i){let e=0;function t(){clearTimeout(e),i.hidden=!0,i.replaceChildren()}return{stop:t,start(n){if(t(),i.hidden=!1,!matchMedia("(prefers-reduced-motion: reduce)").matches){let s=document.createDocumentFragment();for(let r=0;r<36;r++){let a=document.createElement("i"),o=r*Math.PI*2/12;a.style.cssText=`--dx:${Math.cos(o)*150}px;--dy:${Math.sin(o)*150}px;--delay:${Math.floor(r/12)*.45}s;left:${25+Math.floor(r/12)*25}%;top:${30+r%3*7}%;background:hsl(${r*29} 85% 65%)`,s.append(a)}i.append(s)}e=setTimeout(()=>{t(),n?.()},3e3)}}}var ae=i=>document.getElementById(i),Pt=ae("view"),Rt=Zu(),pc=Ju(ae("celebration")),yn=null,To="";try{yn=localStorage,yn.getItem("glow-parkour-v1")}catch{To="\u6D4F\u89C8\u5668\u7981\u6B62\u672C\u5730\u5B58\u50A8\uFF1A\u5F53\u524D\u4ECD\u53EF\u6E38\u73A9\uFF0C\u4F59\u989D\u548C\u8DEF\u7EBF\u65E0\u6CD5\u4FDD\u5B58\u3002"}var mt=Wc(yn),zt=$c(yn);ur(yn);function mc(){try{return hi(JSON.parse(yn.getItem("glow-parkour-routes-v1"))).routes}catch{return[]}}var M_=i=>String(i).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),Et,Dn,ds,Ze,Ai=null,Qe="home",di=!1,gc=!1,fr=0,Ku=0,uc="home",ju=0,wo="skins",Ao=!0,wi=!0,Qu=0,Co=0;function vn(i){ae("status").textContent=i,clearTimeout(ju),ju=setTimeout(()=>{ae("status").textContent=""},6e3)}function pr(){let i=!1;try{let e=yn.getItem("glow-parkour-v1");Xc(yn,mt)&&(i=Zc(yn,zt),i||(e===null?yn.removeItem("glow-parkour-v1"):yn.setItem("glow-parkour-v1",e)))}catch{}return i||vn("\u672C\u5730\u4FDD\u5B58\u5931\u8D25\uFF1A\u5F53\u524D\u5916\u89C2\u4E0E\u4F59\u989D\u4ECD\u53EF\u4F7F\u7528\uFF0C\u5173\u95ED\u9875\u9762\u540E\u53EF\u80FD\u4E22\u5931\u3002"),ae("coins").textContent=String(mt.coins),i}function ed(i,e){pr()||(Object.assign(mt,i),Object.assign(zt,e),vn("\u672C\u5730\u4FDD\u5B58\u5931\u8D25\uFF1A\u672C\u6B21\u8D2D\u4E70\u6216\u88C5\u5907\u5DF2\u53D6\u6D88\uFF0C\u91D1\u5E01\u672A\u6263\u9664\u3002\u8BF7\u91CA\u653E\u5B58\u50A8\u7A7A\u95F4\u540E\u91CD\u8BD5\u3002")),Po(),Io()}var S_=["home-panel","home-tip","hud","tutorial","touch-controls","level-overlay","shop-overlay","editor-overlay","editor-panel","pause-overlay","help-overlay"];function Bt(i){Qe==="complete"&&i!=="complete"&&(pc.stop(),Rt.stop()),Qe=i,window.GameActivity?.setPlaying(i==="playing"),document.body.dataset.mode=i,Dn?.clear(),di=!1,fr=performance.now(),Rt.setPaused(i!=="home"&&i!=="playing"&&i!=="complete"),wi=!0;for(let e of S_)ae(e).hidden=!0;i==="home"&&(ae("home-panel").hidden=!1,ae("home-tip").hidden=!1),i==="playing"&&(ae("hud").hidden=!1,ae("touch-controls").hidden=!1),i==="levels"&&(ae("level-overlay").hidden=!1),i==="shop"&&(ae("shop-overlay").hidden=!1),i==="editor"&&(ae("editor-overlay").hidden=!1,ae("editor-panel").hidden=!1),(i==="paused"||i==="complete")&&(ae("pause-overlay").hidden=!1),i==="help"&&(ae("help-overlay").hidden=!1),i==="playing"?Pt.focus({preventScroll:!0}):i!=="home"&&document.querySelector(".overlay:not([hidden]) button")?.focus({preventScroll:!0}),Et&&Ze&&_c()}function Po(){wi=!0,Et.setSkin(fs.find(i=>i.id===mt.equipped)),Et.setOutfit(ps.find(i=>i.id===zt.equipped)??null),ae("coins").textContent=String(mt.coins)}function dr(){Ze=No(Nn[0]),Et.setLevel(Ze.level),Po(),Bt("home")}var b_={sakura:"\u6A31\u82B1\u6797",flowers:"\u767E\u82B1\u6797",city:"\u57CE\u5E02\u5929\u6865",cabin:"\u6797\u95F4\u6728\u5C4B"};function dc(){ae("levels").innerHTML=Nn.map((e,t)=>`<button class="level-card" data-level="${e.id}" data-theme="${e.theme}"><span class="level-theme">${b_[e.theme]}</span><span class="level-number">${String(t+1).padStart(2,"0")}</span><strong>${e.name}</strong><small>${mt.progress[e.id]?`\u2713 \u6700\u5FEB ${mt.progress[e.id].bestTime.toFixed(1)} \u79D2`:`${e.platforms.length} \u4E2A\u843D\u70B9 \xB7 \u96BE\u5EA6 ${t+1}`}</small></button>`).join("");let i=mc();ae("levels").insertAdjacentHTML("beforeend",i.map(e=>`<div class="custom-level"><button class="level-card" data-level="${e.id}" data-theme="${e.level.theme}"><span class="level-theme">\u6211\u7684\u4F5C\u54C1</span><strong>${M_(e.name)}</strong><small>${e.level.platforms.length} \u4E2A\u843D\u70B9 \xB7 \u901A\u5173\u91D1\u5E01\u53EF\u8D2D\u4E70\u5916\u89C2</small></button><button data-edit="${e.id}">\u7F16\u8F91\u4F5C\u54C1</button></div>`).join(""));for(let e of ae("levels").querySelectorAll("[data-level]"))e.onclick=()=>{let t=i.find(n=>n.id===e.dataset.level);Ro(t?.level??Nn.find(n=>n.id===e.dataset.level),t?.id)};for(let e of ae("levels").querySelectorAll("[data-edit]"))e.onclick=()=>{Bt("editor"),ds.open(e.dataset.edit)}}function Ro(i,e=null){Ai=i.custom&&mc().some(t=>t.id===e&&JSON.stringify(t.level)===JSON.stringify(i))?e:null,Ze=No(i),Et.setLevel(i),Po(),gc=!1,ae("level-name").textContent=i.name,ae("practice-note").textContent=i.custom?Ai?"\u5DF2\u4FDD\u5B58\u4F5C\u54C1\uFF1A\u901A\u5173\u540E\u6536\u96C6\u7684\u91D1\u5E01\u8BA1\u5165\u5546\u5E97\u4F59\u989D\u3002":"\u672A\u4FDD\u5B58\u8BD5\u73A9\uFF1A\u91D1\u5E01\u4E0D\u8BA1\u5165\u4F59\u989D\u3002\u4FDD\u5B58\u4F5C\u54C1\u540E\u518D\u6311\u6218\u5427\u3002":"",Bt("playing")}function Io(){ae("skins").innerHTML=fs.map(i=>`<button class="skin-card" data-skin="${i.id}" aria-pressed="${mt.equipped===i.id}"><span class="skin-swatch" style="background:${i.id==="rainbow"?"linear-gradient(135deg,#e77c9a,#e6c568,#88b891,#71acc3,#b49ecb)":i.color}"></span><strong>${i.name}</strong><small>${mt.equipped===i.id?"\u5DF2\u88C5\u5907":mt.owned.includes(i.id)?"\u6362\u4E0A\u5B83":"\u25C8 2 \u91D1\u5E01"}</small></button>`).join(""),ae("outfits").innerHTML=ps.map(i=>`<button class="outfit-card" data-outfit="${i.id}" aria-pressed="${zt.equipped===i.id}"><span class="outfit-icon" style="display:block;--top:${i.top};--pants:${i.pants};--shoes:${i.shoes};--accent:${i.accent}"><i></i></span><strong>${i.name}</strong><small>${zt.equipped===i.id?"\u5DF2\u7A7F\u4E0A":zt.owned.includes(i.id)?"\u7A7F\u4E0A\u6574\u5957":"\u25C8 2 \u91D1\u5E01"}</small></button>`).join("");for(let i of ae("skins").querySelectorAll("[data-skin]"))i.onclick=()=>{let e=i.dataset.skin,t=structuredClone(mt),n=structuredClone(zt);if(!mt.owned.includes(e)&&!zc(mt,e)){vn("\u91D1\u5E01\u4E0D\u8DB3\uFF0C\u9700\u8981 2 \u91D1\u5E01\u3002\u5148\u53BB\u65C5\u9014\u4E2D\u6536\u96C6\u5427\u3002");return}kc(mt,e),ed(t,n)};for(let i of ae("outfits").querySelectorAll("[data-outfit]"))i.onclick=()=>{let e=i.dataset.outfit,t=structuredClone(mt),n=structuredClone(zt);if(!zt.owned.includes(e)&&!Yc(mt,zt,e)){vn("\u91D1\u5E01\u4E0D\u8DB3\uFF0C\u9700\u8981 2 \u91D1\u5E01\u8D2D\u4E70\u6574\u5957\u8863\u670D\u3002");return}zo(zt,e),ed(t,n)};ae("skins").hidden=wo!=="skins",ae("outfits").hidden=wo!=="outfits",ae("outfit-remove").hidden=wo!=="outfits"}function ui(){Qe==="playing"&&(ae("pause-heading").textContent="\u98CE\u666F\u5728\u8FD9\u91CC\u7B49\u4F60",ae("pause-caption").textContent="TAKE A BREATH",ae("pause-details").textContent="\u4F11\u606F\u4E00\u4E0B\uFF0C\u968F\u65F6\u7EE7\u7EED\u3002",ae("resume").hidden=!1,ae("next-level").hidden=!0,ae("quit").textContent="\u8FD4\u56DE\u5173\u5361\u9009\u62E9",ae("edit-current").hidden=!Ze.level.custom,ae("retry-reward").hidden=!0,Bt("paused"))}function td(){let i=structuredClone(mt),e=new Set(Ze.receipts),t=!!(Ai&&mc().some(s=>s.id===Ai)),n=Gc(mt,Ze,{saved:t});Hc(mt,Ze,{saved:t}),pr()?(ae("retry-reward").hidden=!0,n&&vn(`\u901A\u5173\u91D1\u5E01 +${n}\uFF0C\u5DF2\u5B58\u5165\u672C\u673A\u4F59\u989D\u3002`)):(Object.assign(mt,i),Ze.receipts=e,ae("coins").textContent=String(mt.coins),ae("retry-reward").hidden=!1,vn("\u901A\u5173\u4FDD\u5B58\u5931\u8D25\uFF0C\u91D1\u5E01\u5C1A\u672A\u5165\u8D26\u3002\u91CA\u653E\u672C\u673A\u7A7A\u95F4\u540E\u70B9\u51FB\u91CD\u8BD5\u9886\u53D6\u3002"))}function E_(){td(),ae("pause-caption").textContent="YOU FOUND YOUR GLOW",ae("pause-heading").textContent="\u8FD9\u4E00\u7A0B\uFF0C\u6F02\u4EAE\uFF01",ae("pause-details").textContent=`\u7528\u65F6 ${Ze.elapsed.toFixed(1)} \u79D2 \xB7 \u6536\u96C6 ${Ze.collected.size} \u679A\u91D1\u5E01 \xB7 \u6389\u843D ${Ze.falls} \u6B21`,ae("resume").hidden=!0,ae("next-level").hidden=Ze.level.custom||Ze.level===Nn.at(-1),ae("quit").textContent="\u8FD4\u56DE\u5173\u5361\u9009\u62E9",ae("edit-current").hidden=!Ze.level.custom,Bt("complete"),Rt.play("finish"),pc.start(()=>{Qe==="complete"&&Rt.setPaused(!0)})}function T_(){if(!Ze.level.tutorial||gc||Qe!=="playing"){ae("tutorial").hidden=!0;return}let i=Ze.tutorial,t=[["moved","\u7528 WASD / \u65B9\u5411\u952E\u6216\u6447\u6746\u79FB\u52A8\u3002\u65B9\u5411\u8DDF\u968F\u955C\u5934\uFF0C\u5411\u524D\u5C31\u662F\u9996\u4E2A\u843D\u70B9\u3002"],["jumped","\u7A7A\u683C\u3001\u5355\u51FB\u573A\u666F\u6216\u53F3\u4E0B\u6309\u94AE\u8DF3\u8DC3\uFF1B\u8DF3\u8FC7\u5E73\u53F0\u95F4\u7684\u5C0F\u7F3A\u53E3\u3002"],["camera","\u62D6\u52A8\u573A\u666F\u770B\u770B\u56DB\u5468\u3002\u4E5F\u53EF\u76F4\u63A5\u7EE7\u7EED\u65C5\u7A0B\uFF0C\u21BA \u955C\u5934\u968F\u65F6\u590D\u4F4D\u3002"],["collected","\u8D70\u8FD1\u91D1\u8272\u5706\u73AF\u6536\u96C6\u91D1\u5E01\uFF0C\u4E00\u679A\u5C31\u662F 1 \u91D1\u5E01\u3002"],["checkpoint","\u8584\u8377\u8272\u65D7\u5E1C\u662F\u5B58\u6863\u70B9\uFF0C\u8E29\u4E0A\u540E\u6389\u843D\u4ECE\u8FD9\u91CC\u7EE7\u7EED\u3002"],["finished","\u8D70\u8FDB\u524D\u65B9\u53D1\u5149\u95E8\uFF0C\u5B8C\u6210\u8FD9\u4E00\u7A0B\u3002"]].find(([n])=>!i[n]&&!(n==="camera"&&i.collected));ae("tutorial").hidden=!t,t&&(ae("tutorial-text").textContent=t[1])}function _c(){let i=Et.info();for(let e of["x","y","z"])Pt.dataset[e]=Ze.player[e].toFixed(3);for(let e of["theme","triangles","drawCalls","timeOfDay","sunIntensity","grassResponse","outfit"])Pt.dataset[e]=String(i[e]);Pt.dataset.mode=Qe,Pt.dataset.resources=JSON.stringify(i.resources),Pt.dataset.dpr=String(i.dpr),Pt.dataset.renderMs=i.renderMs.toFixed(2),Pt.dataset.frameMs=i.frameMs.toFixed(2),Pt.dataset.shadowSize=String(i.shadowSize),Pt.dataset.cameraDistance=i.cameraDistance.toFixed(2),Pt.dataset.cameraYaw=i.yaw.toFixed(3),ae("run-info").textContent=`${Ze.elapsed.toFixed(1)} \u79D2 \xB7 ${Ze.collected.size} / ${Ze.level.coins.length} \u91D1\u5E01`,ae("effect-status").textContent=[Ze.effects.speed&&`\u52A0\u901F \xD71.6 \xB7 ${Math.ceil(Ze.effects.speed.expiresAt-Ze.elapsed)}\u79D2`,Ze.effects.jump&&`\u9AD8\u8DF3 \xD71.5 \xB7 ${Math.ceil(Ze.effects.jump.expiresAt-Ze.elapsed)}\u79D2`].filter(Boolean).join("\u3000")}function fc(i){if(!Ao)return;Co=requestAnimationFrame(fc);let e=Math.min(.25,(i-fr)/1e3||.016);if(fr=i,document.hidden||["paused","complete","help"].includes(Qe)&&!wi||!["home","playing"].includes(Qe)&&i-Qu<100&&!wi)return;let t=!1;if(Qe==="playing"||Qe==="home"){let n=Qe==="playing"?Dn.sample(Et.info().yaw):{x:0,z:0,jump:!1};if(n.jump||=di,t=Math.hypot(n.x,n.z)>0,di=!1,Dc(Ze,n,e),Qe==="playing")for(let s of Ze.events)s.type!=="finish"&&Rt.play(s.type),s.type==="coin"&&(Vc(mt,Ze,s.id)?pr():Ze.level.custom&&vn(Ai?"\u91D1\u5E01 +1 \xB7 \u901A\u5173\u540E\u5B58\u5165\u5546\u5E97\u4F59\u989D":"\u8BD5\u73A9\u91D1\u5E01 +1 \xB7 \u4FDD\u5B58\u4F5C\u54C1\u540E\u901A\u5173\u53EF\u83B7\u5F97\u4F59\u989D")),s.type==="checkpoint"&&vn("\u5B58\u6863\u70B9\u5DF2\u70B9\u4EAE\uFF0C\u6389\u843D\u4F1A\u4ECE\u8FD9\u91CC\u7EE7\u7EED\u3002"),s.type==="fall"&&vn("\u518D\u8BD5\u4E00\u6B21\uFF0C\u5FAE\u5149\u8FD8\u5728\u524D\u9762\u3002"),s.type==="finish"&&E_();else for(let s of Ze.events)Rt.play(s.type)}Et.update(Ze,Qe==="paused"||Qe==="complete"||Qe==="help"?0:e,Qe,t),Et.render(),wi=!1,Qu=i,i-Ku>80&&(_c(),T_(),Ku=i)}try{Et=Wu(Pt),Dn=Xu(Pt,ae("joystick"),ae("jump"),{onJump(){(Qe==="home"||Qe==="playing")&&(di=!0)},onOrbit(i,e){(Qe==="home"||Qe==="playing")&&(Et.orbit(i,e),Ze.tutorial.camera=!0)},onInteract:Rt.unlock}),ds=$u(ae("editor-panel"),{onPlay:Ro,onClose:dr,onStatus:vn,onSaved:dc}),ae("start").onclick=()=>{dc(),Bt("levels")},ae("home-return").onclick=dr,ae("shop").onclick=()=>{Io(),Bt("shop")},ae("shop-close").onclick=()=>Bt("home"),ae("editor").onclick=()=>{Bt("editor"),ds.open()},ae("pause").onclick=ui,ae("resume").onclick=()=>Bt("playing"),ae("quit").onclick=()=>{dc(),Bt("levels")},ae("edit-current").onclick=()=>{Bt("editor"),ds.open(Ai)},ae("retry-reward").onclick=td,ae("restart").onclick=()=>Ro(Ze.level,Ai);for(let i of document.querySelectorAll('a[href="../index.html"]'))i.addEventListener("click",e=>{ds.confirmLeave()||e.preventDefault()});ae("pause-home").onclick=dr,ae("next-level").onclick=()=>Ro(Nn[Nn.indexOf(Ze.level)+1]),ae("reset-camera").onclick=()=>{Et.resetCamera(),Dn.clear(),Pt.focus({preventScroll:!0})},ae("skip-tutorial").onclick=()=>{gc=!0,ae("tutorial").hidden=!0,Pt.focus({preventScroll:!0})},ae("help").onclick=()=>{uc=Qe,Qe==="playing"&&ui(),Bt("help")},ae("help-close").onclick=()=>{uc==="playing"?(Bt("playing"),ui()):Bt(uc)},ae("mute").onclick=()=>{let i=ae("mute").getAttribute("aria-pressed")!=="true";ae("mute").setAttribute("aria-pressed",String(i)),ae("mute").textContent=i?"\u266A\u0338":"\u266B",ae("mute").setAttribute("aria-label",i?"\u6253\u5F00\u58F0\u97F3":"\u9759\u97F3"),Rt.setMuted(i),Qe==="playing"&&Pt.focus({preventScroll:!0})};for(let i of document.querySelectorAll("[data-shop-tab]"))i.onclick=()=>{wo=i.dataset.shopTab;for(let e of document.querySelectorAll("[data-shop-tab]"))e.setAttribute("aria-pressed",String(e===i));Io()};ae("outfit-remove").onclick=()=>{zo(zt,null),Po(),pr(),Io()};for(let i of document.querySelectorAll("[data-time]"))i.onclick=()=>{zt.timeOfDay=i.dataset.time,Et.setTimeOfDay(zt.timeOfDay);for(let e of document.querySelectorAll("[data-time]"))e.setAttribute("aria-pressed",String(e===i));pr()};document.querySelector(`[data-time="${zt.timeOfDay}"]`).setAttribute("aria-pressed","true"),document.addEventListener("pointerdown",Rt.unlock),document.addEventListener("keydown",i=>{if(Rt.unlock(),i.code==="Escape"&&(Qe==="playing"?ui():Qe==="paused"?Bt("playing"):Qe==="help"?ae("help-close").click():Qe==="editor"?ae("editor-close").click():(Qe==="shop"||Qe==="levels")&&dr()),i.code==="Tab"&&!["home","playing"].includes(Qe)){let e=document.querySelector('.overlay:not([hidden]) [role="dialog"]'),t=[...e?.querySelectorAll("button,input,select,a")??[]].filter(n=>!n.disabled&&n.getClientRects().length);if(t.length){let n=t[0],s=t.at(-1);i.shiftKey&&(document.activeElement===n||!e.contains(document.activeElement))?(i.preventDefault(),s.focus()):!i.shiftKey&&(document.activeElement===s||!e.contains(document.activeElement))&&(i.preventDefault(),n.focus())}}}),window.addEventListener("blur",()=>{Dn.clear(),di=!1,ui(),Rt.setPaused(!0)}),window.addEventListener("focus",()=>{Qe==="home"&&Rt.setPaused(!1)}),document.addEventListener("visibilitychange",()=>{document.hidden?(Dn.clear(),di=!1,ui(),Rt.setPaused(!0)):(fr=performance.now(),Qe==="home"&&Rt.setPaused(!1))}),window.addEventListener("resize",()=>{Et.resize(),wi=!0}),Pt.addEventListener("webglcontextlost",i=>{i.preventDefault(),ui(),ae("loading").hidden=!1,ae("loading").innerHTML='3D\u753B\u9762\u6682\u65F6\u4E2D\u65AD\uFF0C\u8BF7\u91CD\u65B0\u52A0\u8F7D\u3002<a href="../index.html">\u8FD4\u56DE\u6E38\u620F\u5385</a>',Ao=!1}),window.addEventListener("pagehide",i=>{ds.persistDraft(),pc.stop(),Ao=!1,cancelAnimationFrame(Co),Dn.clear(),di=!1,Rt.setPaused(!0),i.persisted?ui():(Dn.dispose(),Rt.dispose(),Et.dispose())}),window.addEventListener("pageshow",i=>{i.persisted&&(Dn.clear(),di=!1,fr=performance.now(),wi=!0,Ao=!0,Et.resize(),Qe==="home"&&Rt.setPaused(!1),Co=requestAnimationFrame(fc))}),dr(),Et.setTimeOfDay(zt.timeOfDay),Et.update(Ze,.016,"home"),Et.render(),_c(),ae("loading").hidden=!0,document.body.dataset.ready="true",To&&(ae("storage-note").textContent=To,vn(To)),Co=requestAnimationFrame(fc)}catch(i){ae("loading").innerHTML=`<p>\u65E0\u6CD5\u542F\u52A83D\u753B\u9762\u3002${i.message.includes("WebGL")?"\u5F53\u524D\u6D4F\u89C8\u5668\u65E0\u6CD5\u4F7F\u7528 WebGL\u3002":"\u8BF7\u91CD\u65B0\u52A0\u8F7D\u540E\u518D\u8BD5\u3002"}</p><a href="../index.html">\u8FD4\u56DE\u6E38\u620F\u5385</a>`,Dn?.dispose(),Rt.dispose(),Et?.dispose()}
