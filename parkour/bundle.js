var Xu=["sakura","flowers","city","cabin"],qu=[["\u521D\u89C1\u6A31\u5149","\u6A31\u95F4\u8F6C\u5F2F","\u82B1\u74E3\u9AD8\u53F0"],["\u82B1\u5F84\u6F2B\u6B65","\u7E41\u82B1\u56DE\u5ECA","\u82B1\u6D77\u8DC3\u8FC1"],["\u5929\u6865\u98CE\u666F","\u5C4B\u9876\u8F6C\u89D2","\u57CE\u5E02\u4E4B\u5DC5"],["\u6797\u95F4\u6728\u9636","\u6811\u68A2\u5C0F\u5C4B","\u5FAE\u5149\u8FDC\u884C"]];function Yu(i){let e=Xu[Math.floor(i/3)],t=6+Math.floor(i/2)*2,n=4.8-Math.floor((i+1)/2)*.35,s=.8+i*.11,r=[],a=0,o=0;for(let l=0;l<t;l++){l&&(l%4<2?a+=n+s:o+=n+s);let u=(l%4===1?1:l%4===2?2:l%4===3?1:0)*(.22+i*.012);r.push({id:`p${l}`,x:a,z:o,y:u,w:n,d:n,h:.65})}let c=l=>({x:l.x,y:l.y,z:l.z});return{id:`${e}-${i%3+1}`,name:qu[Math.floor(i/3)][i%3],theme:e,difficulty:i+1,platforms:r,spawn:c(r[0]),goal:c(r.at(-1)),coins:r.slice(1,-1).map((l,u)=>({id:`coin${u}`,x:l.x,y:l.y+.35,z:l.z})),checkpoints:[{id:"checkpoint",...c(r[Math.floor(t/2)])}],tutorial:i===0}}var Ln=Array.from({length:12},(i,e)=>Yu(e));var gc=new WeakMap;function _c(i,e){let t=Math.max(0,Math.abs(i.x-e.x)-e.w/2),n=Math.max(0,Math.abs(i.z-e.z)-e.d/2);return t*t+n*n<.25*.25-1e-7}function xc(i,e){return e.some(t=>Math.abs(i.y-t.y)<1e-7&&_c(i,t))}function Ao(i){let e={...i.spawn,vx:0,vy:0,vz:0,yaw:0,grounded:!1};e.grounded=xc(e,i.platforms);let t={level:i,player:e,checkpoint:{...i.spawn},collected:new Set,receipts:new Set,events:[],elapsed:0,complete:!1,falls:0,tutorial:{moved:!1,jumped:!1,camera:!1,collected:!1,checkpoint:!1,finished:!1}};return gc.set(t,{held:!1,buffer:0,coyote:e.grounded?.12:0}),t}function mc(i,e,t,n){if(!n)return;let s=t==="x"?"z":"x",r=t==="x"?"w":"d",a=t==="x"?"d":"w",o=i[t],c=o+n;for(let l of e){if(i.y>=l.y-1e-7||i.y+1.65<=l.y-l.h+1e-7)continue;let u=Math.max(0,Math.abs(i[s]-l[s])-l[a]/2);if(u>=.25)continue;let m=Math.sqrt(.25*.25-u*u),h=l[t]-l[r]/2-m,p=l[t]+l[r]/2+m;n>0&&o<=h+1e-7&&c>h&&(c=Math.min(c,h)),n<0&&o>=p-1e-7&&c<p&&(c=Math.max(c,p))}i[t]=c,Math.abs(c-o-n)>1e-7&&(i[t==="x"?"vx":"vz"]=0)}function $u(i,e){let t=i.player,n=t.y;t.vy-=20*e;let s=n+t.vy*e,r=!1;for(let a of i.level.platforms)if(_c(t,a)){if(t.vy<=0&&n>=a.y-1e-7&&s<=a.y)s=Math.max(s,a.y),r=!0;else if(t.vy>0){let o=a.y-a.h-1.65;n<=o+1e-7&&s>=o&&(s=Math.min(s,o))}}r?(t.grounded||i.events.push({type:"land"}),t.vy=0):t.vy>0&&s<n+t.vy*e-1e-7&&(t.vy=0),t.y=s,t.grounded=r}function Zu(i){let e=i.player;for(let n of i.level.coins??[])!i.collected.has(n.id)&&Math.hypot(e.x-n.x,e.y-n.y,e.z-n.z)<=.6&&(i.collected.add(n.id),i.events.push({type:"coin",id:n.id}),i.tutorial.collected=!0);if(!e.grounded)return;let t=n=>Math.abs(e.y-n.y)<.08&&Math.hypot(e.x-n.x,e.z-n.z)<=.6;for(let n of i.level.checkpoints??[])i.checkpoint.id!==n.id&&t(n)&&(i.checkpoint={...n},i.events.push({type:"checkpoint",id:n.id}),i.tutorial.checkpoint=!0);t(i.level.goal)&&(i.complete=!0,i.events.push({type:"finish"}),i.tutorial.finished=!0)}function yc(i,e={},t=0){if(i.events=[],i.complete||!Number.isFinite(t)||t<=0)return i;let n=gc.get(i),s=!!e.jump;s&&!n.held&&(n.buffer=.12),n.held=s;let r=Number.isFinite(e.x)?e.x:0,a=Number.isFinite(e.z)?e.z:0,o=Math.hypot(r,a);o>1&&(r/=o,a/=o);let c=Math.min(t,.25),l=Math.ceil(c/(1/120)),u=c/l;for(let m=0;m<l&&!i.complete;m++){let h=i.player;h.grounded=h.vy<=0&&xc(h,i.level.platforms),n.coyote=h.grounded?.12:Math.max(0,n.coyote-u),n.buffer>0&&n.coyote>0&&(h.vy=8.4,h.grounded=!1,n.buffer=0,n.coyote=0,i.events.push({type:"jump"}),i.tutorial.jumped=!0),n.buffer=Math.max(0,n.buffer-u);let p=h.x,x=h.z;h.vx=r*6,h.vz=a*6,(r||a)&&(h.yaw=Math.atan2(r,a)),mc(h,i.level.platforms,"x",h.vx*u),mc(h,i.level.platforms,"z",h.vz*u),Math.hypot(h.x-p,h.z-x)>1e-7&&(i.tutorial.moved=!0),$u(i,u),i.elapsed+=u;let S=Math.min(-8,...i.level.platforms.map(f=>f.y-8));h.y<S&&(Object.assign(h,i.checkpoint,{vx:0,vy:0,vz:0,grounded:!0}),delete h.id,i.falls++,i.events.push({type:"fall"}),n.buffer=0,n.coyote=.12),Zu(i)}return i}var vc="glow-parkour-v1",ls=[["red","\u7EA2\u8272","#ef4444"],["orange","\u6A59\u8272","#f97316"],["yellow","\u9EC4\u8272","#facc15"],["green","\u7EFF\u8272","#22c55e"],["cyan","\u9752\u8272","#06b6d4"],["blue","\u84DD\u8272","#3b82f6"],["purple","\u7D2B\u8272","#a855f7"],["black","\u9ED1\u8272","#20232a"],["pink","\u7C89\u8272","#f472b6"],["brown","\u68D5\u8272","#a16207"],["navy","\u6DF1\u84DD","#1e3a8a"],["forest","\u6DF1\u7EFF","#166534"],["rainbow","\u5F69\u8679","rainbow"]].map(([i,e,t])=>({id:i,name:e,color:t,price:i==="red"?0:2})),Mc=new Set(ls.map(i=>i.id)),Ro=new Set(Ln.map(i=>i.id));function Co(i){i=i&&typeof i=="object"&&!Array.isArray(i)?i:{};let e=Number.isSafeInteger(i.coins)&&i.coins>=0?i.coins:0,t=[...new Set(["red",...(Array.isArray(i.owned)?i.owned:[]).filter(r=>Mc.has(r))])],n=t.includes(i.equipped)?i.equipped:"red",s={};if(i.progress&&typeof i.progress=="object")for(let[r,a]of Object.entries(i.progress))Ro.has(r)&&a?.completed===!0&&Number.isFinite(a.bestTime)&&a.bestTime>=0&&(s[r]={completed:!0,bestTime:a.bestTime});return{coins:e,owned:t,equipped:n,progress:s}}function Sc(i,e){let t=ls.find(n=>n.id===e);return!t||i.owned.includes(e)||i.coins<t.price?!1:(i.coins-=t.price,i.owned.push(e),!0)}function bc(i,e){return!Mc.has(e)||!i.owned.includes(e)?!1:(i.equipped=e,!0)}function Ec(i,e,t){return e.level.custom||!Ro.has(e.level.id)||!e.level.coins.some(n=>n.id===t)||!e.collected.has(t)||e.receipts.has(t)?!1:(e.receipts.add(t),i.coins+=1,!0)}function Tc(i,e){if(!e.complete||e.level.custom||!Ro.has(e.level.id)||!Number.isFinite(e.elapsed)||e.elapsed<0)return!1;let t=i.progress[e.level.id]?.bestTime??1/0;return i.progress[e.level.id]={completed:!0,bestTime:Math.min(t,e.elapsed)},!0}function wc(i){try{return Co(JSON.parse(i.getItem(vc)))}catch{return Co()}}function Ac(i,e){try{return i.setItem(vc,JSON.stringify(Co(e))),!0}catch{return!1}}var Cc="glow-parkour-wardrobe-v1",cs=[["academy","\u9752\u85E4\u5B66\u56ED","#e9eddf","#324653","#424f56","#8daf88","checks"],["sailor","\u6674\u6D77\u6C34\u624B","#f4efe4","#304765","#be714c","#507a9b","striped"],["gardener","\u82B1\u623F\u56ED\u4E01","#eed3a4","#657d58","#805f48","#ed9c94","pocket"],["sprinter","\u73CA\u745A\u8FD0\u52A8","#df7774","#48566d","#efe9d7","#f5c96c","trim"],["explorer","\u68EE\u6797\u63A2\u9669","#bbaa7d","#526b60","#745941","#e3ce99","pocket"],["cloud","\u4E91\u6735\u4F11\u95F2","#e7e9ed","#86a4b5","#e9d9c1","#a1bccb","solid"],["lavender","\u85B0\u8863\u8349\u5348\u540E","#b7a5cf","#e4dacf","#787087","#ece3f3","checks"],["sunflower","\u5411\u9633\u82B1\u7530","#e8c25b","#73866c","#b17d57","#f2e4b6","pocket"],["moon","\u6708\u5149\u6F2B\u6B65","#4d607d","#343c58","#9daabf","#e3d29d","trim"],["peach","\u871C\u6843\u91CE\u9910","#e7a5a0","#b89b83","#f1dfc5","#8baa95","checks"],["mariner","\u6DF1\u6D77\u9886\u822A","#376976","#e4dbca","#525962","#d6b783","striped"],["cocoa","\u53EF\u53EF\u6696\u51AC","#a57e65","#594f49","#c5a085","#e6cba4","trim"],["mint","\u8584\u8377\u9A91\u884C","#8cbbad","#547789","#efe5d6","#ead189","trim"],["paper","\u7EB8\u98DE\u673A","#ebe7dc","#b39978","#715f53","#b95150","solid"],["retro","\u590D\u53E4\u7403\u573A","#ad6a4d","#e6d8ad","#688178","#eac071","striped"],["orchard","\u679C\u56ED\u5DE5\u4F5C\u670D","#adb274","#716e52","#785b43","#e9c481","pocket"],["rose","\u73AB\u7470\u65C5\u4EBA","#b4768c","#665976","#d9c4b7","#ead7a5","trim"],["river","\u6EAA\u8C37\u9732\u8425","#739baa","#9ba78d","#5e695e","#d7c78e","pocket"],["festival","\u82B1\u706B\u590F\u65E5","#d09f77","#52577c","#e8dac5","#eee8d5","checks"],["starlight","\u661F\u5149\u821E\u6B65","#716993","#b6abbf","#e4d5bb","#efc972","striped"]].map(([i,e,t,n,s,r,a])=>({id:i,name:e,price:2,top:t,pants:n,shoes:s,accent:r,pattern:a})),Ju=new Set(cs.map(i=>i.id)),Ku=new Set(["night","dawn","morning"]);function Io(i){i=i&&typeof i=="object"?i:{};let e=[...new Set((Array.isArray(i.owned)?i.owned:[]).filter(t=>Ju.has(t)))];return{owned:e,equipped:e.includes(i.equipped)?i.equipped:null,timeOfDay:Ku.has(i.timeOfDay)?i.timeOfDay:"morning"}}function Rc(i,e,t){return!cs.find(s=>s.id===t)||e.owned.includes(t)||i.coins<2?!1:(i.coins-=2,e.owned.push(t),!0)}function Po(i,e){return e!==null&&!i.owned.includes(e)?!1:(i.equipped=e,!0)}function Ic(i){try{return Io(JSON.parse(i.getItem(Cc)))}catch{return Io()}}function Pc(i,e){try{return i.setItem(Cc,JSON.stringify(Io(e))),!0}catch{return!1}}var oh=0,hl=1,lh=2;var qs=1,_a=2,Qi=3,An=0,Vt=1,Gt=2,Cn=0,es=1,ul=2,dl=3,fl=4,ch=5;var yi=100,hh=101,uh=102,dh=103,fh=104,ph=200,mh=201,gh=202,_h=203,pl=204,ml=205,xh=206,yh=207,vh=208,Mh=209,Sh=210,bh=211,Eh=212,Th=213,wh=214,Nr=0,Ur=1,Fr=2,Gi=3,Or=4,Br=5,zr=6,kr=7,xa=0,Ah=1,Ch=2,gn=0,gl=1,_l=2,xl=3,Ys=4,yl=5,vl=6,Ml=7;var Sl=300,ri=301,vi=302,ya=303,va=304,$s=306,Vr=1e3,Sn=1001,Gr=1002,wt=1003,Rh=1004;var Zs=1005;var Ct=1006,Ma=1007;var ai=1008;var $t=1009,bl=1010,El=1011,ts=1012,Sa=1013,_n=1014,ln=1015,xn=1016,ba=1017,Ea=1018,ns=1020,Tl=35902,wl=35899,Al=1021,Cl=1022,cn=1023,bn=1026,oi=1027,Ta=1028,wa=1029,li=1030,Aa=1031;var Ca=1033,Js=33776,Ks=33777,js=33778,Qs=33779,Ra=35840,Ia=35841,Pa=35842,La=35843,Da=36196,Na=37492,Ua=37496,Fa=37488,Oa=37489,er=37490,Ba=37491,za=37808,ka=37809,Va=37810,Ga=37811,Ha=37812,Wa=37813,Xa=37814,qa=37815,Ya=37816,$a=37817,Za=37818,Ja=37819,Ka=37820,ja=37821,Qa=36492,eo=36494,to=36495,no=36283,io=36284,tr=36285,so=36286;var vs=2300,Hr=2301,Lr=2302,nl=2303,il=2400,sl=2401,rl=2402;var Ih=3200;var nr=0,Ph=1,Vn="",zt="srgb",Ms="srgb-linear",Ss="linear",et="srgb";var Dr=7680;var Lh=519,Dh=512,Nh=513,Uh=514,ro=515,Fh=516,Oh=517,ao=518,Bh=519,zh=35044,oo=35048;var Rl="300 es",mn=2e3,Hi=2001;function ju(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Qu(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function bs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function kh(){let i=bs("canvas");return i.style.display="block",i}var Lc={},Wi=null;function Il(...i){let e="THREE."+i.shift();Wi?Wi("log",e,...i):console.log(e,...i)}function Vh(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Le(...i){i=Vh(i);let e="THREE."+i.shift();if(Wi)Wi("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Ue(...i){i=Vh(i);let e="THREE."+i.shift();if(Wi)Wi("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function gi(...i){let e=i.join(" ");e in Lc||(Lc[e]=!0,Le(...i))}function Gh(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Hh={[Nr]:Ur,[Fr]:zr,[Or]:kr,[Gi]:Br,[Ur]:Nr,[zr]:Fr,[kr]:Or,[Br]:Gi},En=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Lt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Dc=1234567,gs=Math.PI/180,Xi=180/Math.PI;function is(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Lt[i&255]+Lt[i>>8&255]+Lt[i>>16&255]+Lt[i>>24&255]+"-"+Lt[e&255]+Lt[e>>8&255]+"-"+Lt[e>>16&15|64]+Lt[e>>24&255]+"-"+Lt[t&63|128]+Lt[t>>8&255]+"-"+Lt[t>>16&255]+Lt[t>>24&255]+Lt[n&255]+Lt[n>>8&255]+Lt[n>>16&255]+Lt[n>>24&255]).toLowerCase()}function Xe(i,e,t){return Math.max(e,Math.min(t,i))}function Pl(i,e){return(i%e+e)%e}function ed(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function td(i,e,t){return i!==e?(t-i)/(e-i):0}function _s(i,e,t){return(1-t)*i+t*e}function nd(i,e,t,n){return _s(i,e,1-Math.exp(-t*n))}function id(i,e=1){return e-Math.abs(Pl(i,e*2)-e)}function sd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function rd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function ad(i,e){return i+Math.floor(Math.random()*(e-i+1))}function od(i,e){return i+Math.random()*(e-i)}function ld(i){return i*(.5-Math.random())}function cd(i){i!==void 0&&(Dc=i);let e=Dc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function hd(i){return i*gs}function ud(i){return i*Xi}function dd(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function fd(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function pd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function md(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+n)/2),u=a((e+n)/2),m=r((e-n)/2),h=a((e-n)/2),p=r((n-e)/2),x=a((n-e)/2);switch(s){case"XYX":i.set(o*u,c*m,c*h,o*l);break;case"YZY":i.set(c*h,o*u,c*m,o*l);break;case"ZXZ":i.set(c*m,c*h,o*u,o*l);break;case"XZX":i.set(o*u,c*x,c*p,o*l);break;case"YXY":i.set(c*p,o*u,c*x,o*l);break;case"ZYZ":i.set(c*x,c*p,o*u,o*l);break;default:Le("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ki(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Bt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Ll={DEG2RAD:gs,RAD2DEG:Xi,generateUUID:is,clamp:Xe,euclideanModulo:Pl,mapLinear:ed,inverseLerp:td,lerp:_s,damp:nd,pingpong:id,smoothstep:sd,smootherstep:rd,randInt:ad,randFloat:od,randFloatSpread:ld,seededRandom:cd,degToRad:hd,radToDeg:ud,isPowerOfTwo:dd,ceilPowerOfTwo:fd,floorPowerOfTwo:pd,setQuaternionFromProperEuler:md,normalize:Bt,denormalize:ki},Re=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},nn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let c=n[s+0],l=n[s+1],u=n[s+2],m=n[s+3],h=r[a+0],p=r[a+1],x=r[a+2],S=r[a+3];if(m!==S||c!==h||l!==p||u!==x){let f=c*h+l*p+u*x+m*S;f<0&&(h=-h,p=-p,x=-x,S=-S,f=-f);let d=1-o;if(f<.9995){let w=Math.acos(f),I=Math.sin(w);d=Math.sin(d*w)/I,o=Math.sin(o*w)/I,c=c*d+h*o,l=l*d+p*o,u=u*d+x*o,m=m*d+S*o}else{c=c*d+h*o,l=l*d+p*o,u=u*d+x*o,m=m*d+S*o;let w=1/Math.sqrt(c*c+l*l+u*u+m*m);c*=w,l*=w,u*=w,m*=w}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=m}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],c=n[s+1],l=n[s+2],u=n[s+3],m=r[a],h=r[a+1],p=r[a+2],x=r[a+3];return e[t]=o*x+u*m+c*p-l*h,e[t+1]=c*x+u*h+l*m-o*p,e[t+2]=l*x+u*p+o*h-c*m,e[t+3]=u*x-o*m-c*h-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),u=o(s/2),m=o(r/2),h=c(n/2),p=c(s/2),x=c(r/2);switch(a){case"XYZ":this._x=h*u*m+l*p*x,this._y=l*p*m-h*u*x,this._z=l*u*x+h*p*m,this._w=l*u*m-h*p*x;break;case"YXZ":this._x=h*u*m+l*p*x,this._y=l*p*m-h*u*x,this._z=l*u*x-h*p*m,this._w=l*u*m+h*p*x;break;case"ZXY":this._x=h*u*m-l*p*x,this._y=l*p*m+h*u*x,this._z=l*u*x+h*p*m,this._w=l*u*m-h*p*x;break;case"ZYX":this._x=h*u*m-l*p*x,this._y=l*p*m+h*u*x,this._z=l*u*x-h*p*m,this._w=l*u*m+h*p*x;break;case"YZX":this._x=h*u*m+l*p*x,this._y=l*p*m+h*u*x,this._z=l*u*x-h*p*m,this._w=l*u*m-h*p*x;break;case"XZY":this._x=h*u*m-l*p*x,this._y=l*p*m-h*u*x,this._z=l*u*x+h*p*m,this._w=l*u*m+h*p*x;break;default:Le("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],u=t[6],m=t[10],h=n+o+m;if(h>0){let p=.5/Math.sqrt(h+1);this._w=.25/p,this._x=(u-c)*p,this._y=(r-l)*p,this._z=(a-s)*p}else if(n>o&&n>m){let p=2*Math.sqrt(1+n-o-m);this._w=(u-c)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+l)/p}else if(o>m){let p=2*Math.sqrt(1+o-n-m);this._w=(r-l)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(c+u)/p}else{let p=2*Math.sqrt(1+m-n-o);this._w=(a-s)/p,this._x=(r+l)/p,this._y=(c+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+a*o+s*l-r*c,this._y=s*u+a*c+r*o-n*l,this._z=r*u+a*l+n*c-s*o,this._w=a*u-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){let l=Math.acos(o),u=Math.sin(l);c=Math.sin(c*l)/u,t=Math.sin(t*l)/u,this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Nc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Nc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*n),u=2*(o*t-r*s),m=2*(r*n-a*t);return this.x=t+c*l+a*m-o*u,this.y=n+c*u+o*l-r*m,this.z=s+c*m+r*u-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Lo.copy(this).projectOnVector(e),this.sub(Lo)}reflect(e){return this.sub(Lo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Lo=new D,Nc=new nn,Be=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l)}set(e,t,n,s,r,a,o,c,l){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=c,u[6]=n,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],u=n[4],m=n[7],h=n[2],p=n[5],x=n[8],S=s[0],f=s[3],d=s[6],w=s[1],I=s[4],E=s[7],v=s[2],M=s[5],A=s[8];return r[0]=a*S+o*w+c*v,r[3]=a*f+o*I+c*M,r[6]=a*d+o*E+c*A,r[1]=l*S+u*w+m*v,r[4]=l*f+u*I+m*M,r[7]=l*d+u*E+m*A,r[2]=h*S+p*w+x*v,r[5]=h*f+p*I+x*M,r[8]=h*d+p*E+x*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8];return t*a*u-t*o*l-n*r*u+n*o*c+s*r*l-s*a*c}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],m=u*a-o*l,h=o*c-u*r,p=l*r-a*c,x=t*m+n*h+s*p;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=m*S,e[1]=(s*l-u*n)*S,e[2]=(o*n-s*a)*S,e[3]=h*S,e[4]=(u*t-s*c)*S,e[5]=(s*r-o*t)*S,e[6]=p*S,e[7]=(n*c-l*t)*S,e[8]=(a*t-n*r)*S,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return gi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Do.makeScale(e,t)),this}rotate(e){return gi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Do.makeRotation(-e)),this}translate(e,t){return gi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Do.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Do=new Be,Uc=new Be().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Fc=new Be().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function gd(){let i={enabled:!0,workingColorSpace:Ms,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===et&&(s.r=Bn(s.r),s.g=Bn(s.g),s.b=Bn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===et&&(s.r=Vi(s.r),s.g=Vi(s.g),s.b=Vi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Vn?Ss:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return gi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return gi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Ms]:{primaries:e,whitePoint:n,transfer:Ss,toXYZ:Uc,fromXYZ:Fc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:zt},outputColorSpaceConfig:{drawingBufferColorSpace:zt}},[zt]:{primaries:e,whitePoint:n,transfer:et,toXYZ:Uc,fromXYZ:Fc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:zt}}}),i}var $e=gd();function Bn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Vi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var wi,Wr=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{wi===void 0&&(wi=bs("canvas")),wi.width=e.width,wi.height=e.height;let s=wi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=wi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=bs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Bn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Bn(t[n]/255)*255):t[n]=Bn(t[n]);return{data:t,width:e.width,height:e.height}}else return Le("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},_d=0,qi=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:_d++}),this.uuid=is(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(No(s[a].image)):r.push(No(s[a]))}else r=No(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function No(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Wr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Le("Texture: Unable to serialize Texture."),{})}var xd=0,Uo=new D,qt=class i extends En{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Sn,s=Sn,r=Ct,a=ai,o=cn,c=$t,l=i.DEFAULT_ANISOTROPY,u=Vn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:xd++}),this.uuid=is(),this.name="",this.source=new qi(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Re(0,0),this.repeat=new Re(1,1),this.center=new Re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Uo).x}get height(){return this.source.getSize(Uo).y}get depth(){return this.source.getSize(Uo).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Le(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Le(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Sl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Vr:e.x=e.x-Math.floor(e.x);break;case Sn:e.x=e.x<0?0:1;break;case Gr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Vr:e.y=e.y-Math.floor(e.y);break;case Sn:e.y=e.y<0?0:1;break;case Gr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};qt.DEFAULT_IMAGE=null;qt.DEFAULT_MAPPING=Sl;qt.DEFAULT_ANISOTROPY=1;var dt=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,c=e.elements,l=c[0],u=c[4],m=c[8],h=c[1],p=c[5],x=c[9],S=c[2],f=c[6],d=c[10];if(Math.abs(u-h)<.01&&Math.abs(m-S)<.01&&Math.abs(x-f)<.01){if(Math.abs(u+h)<.1&&Math.abs(m+S)<.1&&Math.abs(x+f)<.1&&Math.abs(l+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let I=(l+1)/2,E=(p+1)/2,v=(d+1)/2,M=(u+h)/4,A=(m+S)/4,g=(x+f)/4;return I>E&&I>v?I<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(I),s=M/n,r=A/n):E>v?E<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(E),n=M/s,r=g/s):v<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(v),n=A/r,s=g/r),this.set(n,s,r,t),this}let w=Math.sqrt((f-x)*(f-x)+(m-S)*(m-S)+(h-u)*(h-u));return Math.abs(w)<.001&&(w=1),this.x=(f-x)/w,this.y=(m-S)/w,this.z=(h-u)/w,this.w=Math.acos((l+p+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this.w=Xe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this.w=Xe(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Xr=class extends En{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ct,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new dt(0,0,e,t),this.scissorTest=!1,this.viewport=new dt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new qt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Ct,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new qi(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Yt=class extends Xr{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Es=class extends qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=wt,this.minFilter=wt,this.wrapR=Sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var qr=class extends qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=wt,this.minFilter=wt,this.wrapR=Sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var rt=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,a,o,c,l,u,m,h,p,x,S,f){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l,u,m,h,p,x,S,f)}set(e,t,n,s,r,a,o,c,l,u,m,h,p,x,S,f){let d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=c,d[2]=l,d[6]=u,d[10]=m,d[14]=h,d[3]=p,d[7]=x,d[11]=S,d[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Ai.setFromMatrixColumn(e,0).length(),r=1/Ai.setFromMatrixColumn(e,1).length(),a=1/Ai.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),m=Math.sin(r);if(e.order==="XYZ"){let h=a*u,p=a*m,x=o*u,S=o*m;t[0]=c*u,t[4]=-c*m,t[8]=l,t[1]=p+x*l,t[5]=h-S*l,t[9]=-o*c,t[2]=S-h*l,t[6]=x+p*l,t[10]=a*c}else if(e.order==="YXZ"){let h=c*u,p=c*m,x=l*u,S=l*m;t[0]=h+S*o,t[4]=x*o-p,t[8]=a*l,t[1]=a*m,t[5]=a*u,t[9]=-o,t[2]=p*o-x,t[6]=S+h*o,t[10]=a*c}else if(e.order==="ZXY"){let h=c*u,p=c*m,x=l*u,S=l*m;t[0]=h-S*o,t[4]=-a*m,t[8]=x+p*o,t[1]=p+x*o,t[5]=a*u,t[9]=S-h*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let h=a*u,p=a*m,x=o*u,S=o*m;t[0]=c*u,t[4]=x*l-p,t[8]=h*l+S,t[1]=c*m,t[5]=S*l+h,t[9]=p*l-x,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let h=a*c,p=a*l,x=o*c,S=o*l;t[0]=c*u,t[4]=S-h*m,t[8]=x*m+p,t[1]=m,t[5]=a*u,t[9]=-o*u,t[2]=-l*u,t[6]=p*m+x,t[10]=h-S*m}else if(e.order==="XZY"){let h=a*c,p=a*l,x=o*c,S=o*l;t[0]=c*u,t[4]=-m,t[8]=l*u,t[1]=h*m+S,t[5]=a*u,t[9]=p*m-x,t[2]=x*m-p,t[6]=o*u,t[10]=S*m+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(yd,e,vd)}lookAt(e,t,n){let s=this.elements;return Zt.subVectors(e,t),Zt.lengthSq()===0&&(Zt.z=1),Zt.normalize(),Yn.crossVectors(n,Zt),Yn.lengthSq()===0&&(Math.abs(n.z)===1?Zt.x+=1e-4:Zt.z+=1e-4,Zt.normalize(),Yn.crossVectors(n,Zt)),Yn.normalize(),dr.crossVectors(Zt,Yn),s[0]=Yn.x,s[4]=dr.x,s[8]=Zt.x,s[1]=Yn.y,s[5]=dr.y,s[9]=Zt.y,s[2]=Yn.z,s[6]=dr.z,s[10]=Zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],u=n[1],m=n[5],h=n[9],p=n[13],x=n[2],S=n[6],f=n[10],d=n[14],w=n[3],I=n[7],E=n[11],v=n[15],M=s[0],A=s[4],g=s[8],_=s[12],T=s[1],R=s[5],P=s[9],U=s[13],L=s[2],B=s[6],H=s[10],X=s[14],Z=s[3],k=s[7],$=s[11],ee=s[15];return r[0]=a*M+o*T+c*L+l*Z,r[4]=a*A+o*R+c*B+l*k,r[8]=a*g+o*P+c*H+l*$,r[12]=a*_+o*U+c*X+l*ee,r[1]=u*M+m*T+h*L+p*Z,r[5]=u*A+m*R+h*B+p*k,r[9]=u*g+m*P+h*H+p*$,r[13]=u*_+m*U+h*X+p*ee,r[2]=x*M+S*T+f*L+d*Z,r[6]=x*A+S*R+f*B+d*k,r[10]=x*g+S*P+f*H+d*$,r[14]=x*_+S*U+f*X+d*ee,r[3]=w*M+I*T+E*L+v*Z,r[7]=w*A+I*R+E*B+v*k,r[11]=w*g+I*P+E*H+v*$,r[15]=w*_+I*U+E*X+v*ee,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],u=e[2],m=e[6],h=e[10],p=e[14],x=e[3],S=e[7],f=e[11],d=e[15],w=c*p-l*h,I=o*p-l*m,E=o*h-c*m,v=a*p-l*u,M=a*h-c*u,A=a*m-o*u;return t*(S*w-f*I+d*E)-n*(x*w-f*v+d*M)+s*(x*I-S*v+d*A)-r*(x*E-S*M+f*A)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],c=e[2],l=e[6],u=e[10];return t*(a*u-o*l)-n*(r*u-o*c)+s*(r*l-a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],m=e[9],h=e[10],p=e[11],x=e[12],S=e[13],f=e[14],d=e[15],w=t*o-n*a,I=t*c-s*a,E=t*l-r*a,v=n*c-s*o,M=n*l-r*o,A=s*l-r*c,g=u*S-m*x,_=u*f-h*x,T=u*d-p*x,R=m*f-h*S,P=m*d-p*S,U=h*d-p*f,L=w*U-I*P+E*R+v*T-M*_+A*g;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let B=1/L;return e[0]=(o*U-c*P+l*R)*B,e[1]=(s*P-n*U-r*R)*B,e[2]=(S*A-f*M+d*v)*B,e[3]=(h*M-m*A-p*v)*B,e[4]=(c*T-a*U-l*_)*B,e[5]=(t*U-s*T+r*_)*B,e[6]=(f*E-x*A-d*I)*B,e[7]=(u*A-h*E+p*I)*B,e[8]=(a*P-o*T+l*g)*B,e[9]=(n*T-t*P-r*g)*B,e[10]=(x*M-S*E+d*w)*B,e[11]=(m*E-u*M-p*w)*B,e[12]=(o*_-a*R-c*g)*B,e[13]=(t*R-n*_+s*g)*B,e[14]=(S*I-x*v-f*w)*B,e[15]=(u*v-m*I+h*w)*B,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,u=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,u*o+n,u*c-s*a,0,l*c-s*o,u*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,u=a+a,m=o+o,h=r*l,p=r*u,x=r*m,S=a*u,f=a*m,d=o*m,w=c*l,I=c*u,E=c*m,v=n.x,M=n.y,A=n.z;return s[0]=(1-(S+d))*v,s[1]=(p+E)*v,s[2]=(x-I)*v,s[3]=0,s[4]=(p-E)*M,s[5]=(1-(h+d))*M,s[6]=(f+w)*M,s[7]=0,s[8]=(x+I)*A,s[9]=(f-w)*A,s[10]=(1-(h+S))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Ai.set(s[0],s[1],s[2]).length(),o=Ai.set(s[4],s[5],s[6]).length(),c=Ai.set(s[8],s[9],s[10]).length();r<0&&(a=-a),un.copy(this);let l=1/a,u=1/o,m=1/c;return un.elements[0]*=l,un.elements[1]*=l,un.elements[2]*=l,un.elements[4]*=u,un.elements[5]*=u,un.elements[6]*=u,un.elements[8]*=m,un.elements[9]*=m,un.elements[10]*=m,t.setFromRotationMatrix(un),n.x=a,n.y=o,n.z=c,this}makePerspective(e,t,n,s,r,a,o=mn,c=!1){let l=this.elements,u=2*r/(t-e),m=2*r/(n-s),h=(t+e)/(t-e),p=(n+s)/(n-s),x,S;if(c)x=r/(a-r),S=a*r/(a-r);else if(o===mn)x=-(a+r)/(a-r),S=-2*a*r/(a-r);else if(o===Hi)x=-a/(a-r),S=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=m,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=x,l[14]=S,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=mn,c=!1){let l=this.elements,u=2/(t-e),m=2/(n-s),h=-(t+e)/(t-e),p=-(n+s)/(n-s),x,S;if(c)x=1/(a-r),S=a/(a-r);else if(o===mn)x=-2/(a-r),S=-(a+r)/(a-r);else if(o===Hi)x=-1/(a-r),S=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=0,l[12]=h,l[1]=0,l[5]=m,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=x,l[14]=S,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Ai=new D,un=new rt,yd=new D(0,0,0),vd=new D(1,1,1),Yn=new D,dr=new D,Zt=new D,Oc=new rt,Bc=new nn,sn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],u=s[9],m=s[2],h=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(Xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Xe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-m,r),this._z=0);break;case"ZXY":this._x=Math.asin(Xe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-m,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Xe(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Xe(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-m,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Xe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,p),this._y=0);break;default:Le("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Oc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Oc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Bc.setFromEuler(this),this.setFromQuaternion(Bc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};sn.DEFAULT_ORDER="XYZ";var Yi=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Md=0,zc=new D,Ci=new nn,Dn=new rt,fr=new D,hs=new D,Sd=new D,bd=new nn,kc=new D(1,0,0),Vc=new D(0,1,0),Gc=new D(0,0,1),Hc={type:"added"},Ed={type:"removed"},Ri={type:"childadded",child:null},Fo={type:"childremoved",child:null},yt=class i extends En{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Md++}),this.uuid=is(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new D,t=new sn,n=new nn,s=new D(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new rt},normalMatrix:{value:new Be}}),this.matrix=new rt,this.matrixWorld=new rt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Yi,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ci.setFromAxisAngle(e,t),this.quaternion.multiply(Ci),this}rotateOnWorldAxis(e,t){return Ci.setFromAxisAngle(e,t),this.quaternion.premultiply(Ci),this}rotateX(e){return this.rotateOnAxis(kc,e)}rotateY(e){return this.rotateOnAxis(Vc,e)}rotateZ(e){return this.rotateOnAxis(Gc,e)}translateOnAxis(e,t){return zc.copy(e).applyQuaternion(this.quaternion),this.position.add(zc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(kc,e)}translateY(e){return this.translateOnAxis(Vc,e)}translateZ(e){return this.translateOnAxis(Gc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Dn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?fr.copy(e):fr.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),hs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Dn.lookAt(hs,fr,this.up):Dn.lookAt(fr,hs,this.up),this.quaternion.setFromRotationMatrix(Dn),s&&(Dn.extractRotation(s.matrixWorld),Ci.setFromRotationMatrix(Dn),this.quaternion.premultiply(Ci.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ue("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Hc),Ri.child=e,this.dispatchEvent(Ri),Ri.child=null):Ue("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Ed),Fo.child=e,this.dispatchEvent(Fo),Fo.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Dn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Dn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Dn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Hc),Ri.child=e,this.dispatchEvent(Ri),Ri.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hs,e,Sd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hs,bd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let m=c[l];r(e.shapes,m)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),u=a(e.images),m=a(e.shapes),h=a(e.skeletons),p=a(e.animations),x=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),m.length>0&&(n.shapes=m),h.length>0&&(n.skeletons=h),p.length>0&&(n.animations=p),x.length>0&&(n.nodes=x)}return n.object=s,n;function a(o){let c=[];for(let l in o){let u=o[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};yt.DEFAULT_UP=new D(0,1,0);yt.DEFAULT_MATRIX_AUTO_UPDATE=!0;yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var kt=class extends yt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Td={type:"move"},$i=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new kt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new kt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new kt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let S of e.hand.values()){let f=t.getJointPose(S,n),d=this._getHandJoint(l,S);f!==null&&(d.matrix.fromArray(f.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=f.radius),d.visible=f!==null}let u=l.joints["index-finger-tip"],m=l.joints["thumb-tip"],h=u.position.distanceTo(m.position),p=.02,x=.005;l.inputState.pinching&&h>p+x?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&h<=p-x&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Td)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new kt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Wh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},$n={h:0,s:0,l:0},pr={h:0,s:0,l:0};function Oo(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Fe=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=zt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=$e.workingColorSpace){return this.r=e,this.g=t,this.b=n,$e.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=$e.workingColorSpace){if(e=Pl(e,1),t=Xe(t,0,1),n=Xe(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Oo(a,r,e+1/3),this.g=Oo(a,r,e),this.b=Oo(a,r,e-1/3)}return $e.colorSpaceToWorking(this,s),this}setStyle(e,t=zt){function n(r){r!==void 0&&parseFloat(r)<1&&Le("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Le("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Le("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=zt){let n=Wh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Le("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Bn(e.r),this.g=Bn(e.g),this.b=Bn(e.b),this}copyLinearToSRGB(e){return this.r=Vi(e.r),this.g=Vi(e.g),this.b=Vi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=zt){return $e.workingToColorSpace(Dt.copy(this),e),Math.round(Xe(Dt.r*255,0,255))*65536+Math.round(Xe(Dt.g*255,0,255))*256+Math.round(Xe(Dt.b*255,0,255))}getHexString(e=zt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.workingToColorSpace(Dt.copy(this),t);let n=Dt.r,s=Dt.g,r=Dt.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,l,u=(o+a)/2;if(o===a)c=0,l=0;else{let m=a-o;switch(l=u<=.5?m/(a+o):m/(2-a-o),a){case n:c=(s-r)/m+(s<r?6:0);break;case s:c=(r-n)/m+2;break;case r:c=(n-s)/m+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=$e.workingColorSpace){return $e.workingToColorSpace(Dt.copy(this),t),e.r=Dt.r,e.g=Dt.g,e.b=Dt.b,e}getStyle(e=zt){$e.workingToColorSpace(Dt.copy(this),e);let t=Dt.r,n=Dt.g,s=Dt.b;return e!==zt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL($n),this.setHSL($n.h+e,$n.s+t,$n.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL($n),e.getHSL(pr);let n=_s($n.h,pr.h,t),s=_s($n.s,pr.s,t),r=_s($n.l,pr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Dt=new Fe;Fe.NAMES=Wh;var Ts=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Fe(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},ws=class extends yt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new sn,this.environmentIntensity=1,this.environmentRotation=new sn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},dn=new D,Nn=new D,Bo=new D,Un=new D,Ii=new D,Pi=new D,Wc=new D,zo=new D,ko=new D,Vo=new D,Go=new dt,Ho=new dt,Wo=new dt,jn=class i{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),dn.subVectors(e,t),s.cross(dn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){dn.subVectors(s,t),Nn.subVectors(n,t),Bo.subVectors(e,t);let a=dn.dot(dn),o=dn.dot(Nn),c=dn.dot(Bo),l=Nn.dot(Nn),u=Nn.dot(Bo),m=a*l-o*o;if(m===0)return r.set(0,0,0),null;let h=1/m,p=(l*c-o*u)*h,x=(a*u-o*c)*h;return r.set(1-p-x,x,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Un)===null?!1:Un.x>=0&&Un.y>=0&&Un.x+Un.y<=1}static getInterpolation(e,t,n,s,r,a,o,c){return this.getBarycoord(e,t,n,s,Un)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Un.x),c.addScaledVector(a,Un.y),c.addScaledVector(o,Un.z),c)}static getInterpolatedAttribute(e,t,n,s,r,a){return Go.setScalar(0),Ho.setScalar(0),Wo.setScalar(0),Go.fromBufferAttribute(e,t),Ho.fromBufferAttribute(e,n),Wo.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Go,r.x),a.addScaledVector(Ho,r.y),a.addScaledVector(Wo,r.z),a}static isFrontFacing(e,t,n,s){return dn.subVectors(n,t),Nn.subVectors(e,t),dn.cross(Nn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return dn.subVectors(this.c,this.b),Nn.subVectors(this.a,this.b),dn.cross(Nn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;Ii.subVectors(s,n),Pi.subVectors(r,n),zo.subVectors(e,n);let c=Ii.dot(zo),l=Pi.dot(zo);if(c<=0&&l<=0)return t.copy(n);ko.subVectors(e,s);let u=Ii.dot(ko),m=Pi.dot(ko);if(u>=0&&m<=u)return t.copy(s);let h=c*m-u*l;if(h<=0&&c>=0&&u<=0)return a=c/(c-u),t.copy(n).addScaledVector(Ii,a);Vo.subVectors(e,r);let p=Ii.dot(Vo),x=Pi.dot(Vo);if(x>=0&&p<=x)return t.copy(r);let S=p*l-c*x;if(S<=0&&l>=0&&x<=0)return o=l/(l-x),t.copy(n).addScaledVector(Pi,o);let f=u*x-p*m;if(f<=0&&m-u>=0&&p-x>=0)return Wc.subVectors(r,s),o=(m-u)/(m-u+(p-x)),t.copy(s).addScaledVector(Wc,o);let d=1/(f+S+h);return a=S*d,o=h*d,t.copy(n).addScaledVector(Ii,a).addScaledVector(Pi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Tn=class{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(fn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(fn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=fn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,fn):fn.fromBufferAttribute(r,a),fn.applyMatrix4(e.matrixWorld),this.expandByPoint(fn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),mr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),mr.copy(n.boundingBox)),mr.applyMatrix4(e.matrixWorld),this.union(mr)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,fn),fn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(us),gr.subVectors(this.max,us),Li.subVectors(e.a,us),Di.subVectors(e.b,us),Ni.subVectors(e.c,us),Zn.subVectors(Di,Li),Jn.subVectors(Ni,Di),di.subVectors(Li,Ni);let t=[0,-Zn.z,Zn.y,0,-Jn.z,Jn.y,0,-di.z,di.y,Zn.z,0,-Zn.x,Jn.z,0,-Jn.x,di.z,0,-di.x,-Zn.y,Zn.x,0,-Jn.y,Jn.x,0,-di.y,di.x,0];return!Xo(t,Li,Di,Ni,gr)||(t=[1,0,0,0,1,0,0,0,1],!Xo(t,Li,Di,Ni,gr))?!1:(_r.crossVectors(Zn,Jn),t=[_r.x,_r.y,_r.z],Xo(t,Li,Di,Ni,gr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,fn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(fn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Fn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Fn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Fn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Fn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Fn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Fn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Fn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Fn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Fn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Fn=[new D,new D,new D,new D,new D,new D,new D,new D],fn=new D,mr=new Tn,Li=new D,Di=new D,Ni=new D,Zn=new D,Jn=new D,di=new D,us=new D,gr=new D,_r=new D,fi=new D;function Xo(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){fi.fromArray(i,r);let o=s.x*Math.abs(fi.x)+s.y*Math.abs(fi.y)+s.z*Math.abs(fi.z),c=e.dot(fi),l=t.dot(fi),u=n.dot(fi);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}var xt=new D,xr=new Re,wd=0,Kt=class extends En{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:wd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=zh,this.updateRanges=[],this.gpuType=ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)xr.fromBufferAttribute(this,t),xr.applyMatrix3(e),this.setXY(t,xr.x,xr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix3(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix4(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyNormalMatrix(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.transformDirection(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ki(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Bt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ki(t,this.array)),t}setX(e,t){return this.normalized&&(t=Bt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ki(t,this.array)),t}setY(e,t){return this.normalized&&(t=Bt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ki(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Bt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ki(t,this.array)),t}setW(e,t){return this.normalized&&(t=Bt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Bt(t,this.array),n=Bt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Bt(t,this.array),n=Bt(n,this.array),s=Bt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Bt(t,this.array),n=Bt(n,this.array),s=Bt(s,this.array),r=Bt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var As=class extends Kt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Cs=class extends Kt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Je=class extends Kt{constructor(e,t,n){super(new Float32Array(e),t,n)}},Ad=new Tn,ds=new D,qo=new D,Qn=class{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Ad.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ds.subVectors(e,this.center);let t=ds.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(ds,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(qo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ds.copy(e.center).add(qo)),this.expandByPoint(ds.copy(e.center).sub(qo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Cd=0,tn=new rt,Yo=new yt,Ui=new D,Jt=new Tn,fs=new Tn,Tt=new D,Mt=class i extends En{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Cd++}),this.uuid=is(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ju(e)?Cs:As)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Be().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return tn.makeRotationFromQuaternion(e),this.applyMatrix4(tn),this}rotateX(e){return tn.makeRotationX(e),this.applyMatrix4(tn),this}rotateY(e){return tn.makeRotationY(e),this.applyMatrix4(tn),this}rotateZ(e){return tn.makeRotationZ(e),this.applyMatrix4(tn),this}translate(e,t,n){return tn.makeTranslation(e,t,n),this.applyMatrix4(tn),this}scale(e,t,n){return tn.makeScale(e,t,n),this.applyMatrix4(tn),this}lookAt(e){return Yo.lookAt(e),Yo.updateMatrix(),this.applyMatrix4(Yo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ui).negate(),this.translate(Ui.x,Ui.y,Ui.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Je(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Le("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Tn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ue("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Jt.setFromBufferAttribute(r),this.morphTargetsRelative?(Tt.addVectors(this.boundingBox.min,Jt.min),this.boundingBox.expandByPoint(Tt),Tt.addVectors(this.boundingBox.max,Jt.max),this.boundingBox.expandByPoint(Tt)):(this.boundingBox.expandByPoint(Jt.min),this.boundingBox.expandByPoint(Jt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ue('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Qn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ue("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){let n=this.boundingSphere.center;if(Jt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];fs.setFromBufferAttribute(o),this.morphTargetsRelative?(Tt.addVectors(Jt.min,fs.min),Jt.expandByPoint(Tt),Tt.addVectors(Jt.max,fs.max),Jt.expandByPoint(Tt)):(Jt.expandByPoint(fs.min),Jt.expandByPoint(fs.max))}Jt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Tt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Tt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)Tt.fromBufferAttribute(o,l),c&&(Ui.fromBufferAttribute(e,l),Tt.add(Ui)),s=Math.max(s,n.distanceToSquared(Tt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ue('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ue("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Kt(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let g=0;g<n.count;g++)o[g]=new D,c[g]=new D;let l=new D,u=new D,m=new D,h=new Re,p=new Re,x=new Re,S=new D,f=new D;function d(g,_,T){l.fromBufferAttribute(n,g),u.fromBufferAttribute(n,_),m.fromBufferAttribute(n,T),h.fromBufferAttribute(r,g),p.fromBufferAttribute(r,_),x.fromBufferAttribute(r,T),u.sub(l),m.sub(l),p.sub(h),x.sub(h);let R=1/(p.x*x.y-x.x*p.y);isFinite(R)&&(S.copy(u).multiplyScalar(x.y).addScaledVector(m,-p.y).multiplyScalar(R),f.copy(m).multiplyScalar(p.x).addScaledVector(u,-x.x).multiplyScalar(R),o[g].add(S),o[_].add(S),o[T].add(S),c[g].add(f),c[_].add(f),c[T].add(f))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let g=0,_=w.length;g<_;++g){let T=w[g],R=T.start,P=T.count;for(let U=R,L=R+P;U<L;U+=3)d(e.getX(U+0),e.getX(U+1),e.getX(U+2))}let I=new D,E=new D,v=new D,M=new D;function A(g){v.fromBufferAttribute(s,g),M.copy(v);let _=o[g];I.copy(_),I.sub(v.multiplyScalar(v.dot(_))).normalize(),E.crossVectors(M,_);let R=E.dot(c[g])<0?-1:1;a.setXYZW(g,I.x,I.y,I.z,R)}for(let g=0,_=w.length;g<_;++g){let T=w[g],R=T.start,P=T.count;for(let U=R,L=R+P;U<L;U+=3)A(e.getX(U+0)),A(e.getX(U+1)),A(e.getX(U+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Kt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,p=n.count;h<p;h++)n.setXYZ(h,0,0,0);let s=new D,r=new D,a=new D,o=new D,c=new D,l=new D,u=new D,m=new D;if(e)for(let h=0,p=e.count;h<p;h+=3){let x=e.getX(h+0),S=e.getX(h+1),f=e.getX(h+2);s.fromBufferAttribute(t,x),r.fromBufferAttribute(t,S),a.fromBufferAttribute(t,f),u.subVectors(a,r),m.subVectors(s,r),u.cross(m),o.fromBufferAttribute(n,x),c.fromBufferAttribute(n,S),l.fromBufferAttribute(n,f),o.add(u),c.add(u),l.add(u),n.setXYZ(x,o.x,o.y,o.z),n.setXYZ(S,c.x,c.y,c.z),n.setXYZ(f,l.x,l.y,l.z)}else for(let h=0,p=t.count;h<p;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),m.subVectors(s,r),u.cross(m),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Tt.fromBufferAttribute(e,t),Tt.normalize(),e.setXYZ(t,Tt.x,Tt.y,Tt.z)}toNonIndexed(){function e(o,c){let l=o.array,u=o.itemSize,m=o.normalized,h=new l.constructor(c.length*u),p=0,x=0;for(let S=0,f=c.length;S<f;S++){o.isInterleavedBufferAttribute?p=c[S]*o.data.stride+o.offset:p=c[S]*u;for(let d=0;d<u;d++)h[x++]=l[p++]}return new Kt(h,u,m)}if(this.index===null)return Le("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=e(c,n);t.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let u=0,m=l.length;u<m;u++){let h=l[u],p=e(h,n);c.push(p)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let m=0,h=l.length;m<h;m++){let p=l[m];u.push(p.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],m=r[l];for(let h=0,p=m.length;h<p;h++)u.push(m[h].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,u=a.length;l<u;l++){let m=a[l];this.addGroup(m.start,m.count,m.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var $o=new D,Rd=new D,Id=new Be,pn=class{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=$o.subVectors(n,t).cross(Rd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta($o),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Id.getNormalMatrix(e),s=this.coplanarPoint($o).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Pd=0,zn=class extends En{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Pd++}),this.uuid=is(),this.name="",this.type="Material",this.blending=es,this.side=An,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=pl,this.blendDst=ml,this.blendEquation=yi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Fe(0,0,0),this.blendAlpha=0,this.depthFunc=Gi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Lh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Dr,this.stencilZFail=Dr,this.stencilZPass=Dr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Le(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Le(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Fe().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new pn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Re().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Re().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var On=new D,Zo=new D,yr=new D,vr=new D,Rs=class{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,On)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=On.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(On.copy(this.origin).addScaledVector(this.direction,t),On.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Zo.copy(e).add(t).multiplyScalar(.5),yr.copy(t).sub(e).normalize(),vr.copy(this.origin).sub(Zo);let r=e.distanceTo(t)*.5,a=-this.direction.dot(yr),o=vr.dot(this.direction),c=-vr.dot(yr),l=vr.lengthSq(),u=Math.abs(1-a*a),m,h,p,x;if(u>0)if(m=a*c-o,h=a*o-c,x=r*u,m>=0)if(h>=-x)if(h<=x){let S=1/u;m*=S,h*=S,p=m*(m+a*h+2*o)+h*(a*m+h+2*c)+l}else h=r,m=Math.max(0,-(a*h+o)),p=-m*m+h*(h+2*c)+l;else h=-r,m=Math.max(0,-(a*h+o)),p=-m*m+h*(h+2*c)+l;else h<=-x?(m=Math.max(0,-(-a*r+o)),h=m>0?-r:Math.min(Math.max(-r,-c),r),p=-m*m+h*(h+2*c)+l):h<=x?(m=0,h=Math.min(Math.max(-r,-c),r),p=h*(h+2*c)+l):(m=Math.max(0,-(a*r+o)),h=m>0?r:Math.min(Math.max(-r,-c),r),p=-m*m+h*(h+2*c)+l);else h=a>0?-r:r,m=Math.max(0,-(a*h+o)),p=-m*m+h*(h+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,m),s&&s.copy(Zo).addScaledVector(yr,h),p}intersectSphere(e,t){if(e.radius<0)return null;On.subVectors(e.center,this.origin);let n=On.dot(this.direction),s=On.dot(On)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,c,l=1/this.direction.x,u=1/this.direction.y,m=1/this.direction.z,h=this.origin;return l>=0?(n=(e.min.x-h.x)*l,s=(e.max.x-h.x)*l):(n=(e.max.x-h.x)*l,s=(e.min.x-h.x)*l),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),m>=0?(o=(e.min.z-h.z)*m,c=(e.max.z-h.z)*m):(o=(e.max.z-h.z)*m,c=(e.min.z-h.z)*m),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,On)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,c=o.x,l=o.y,u=o.z,m=e.x-a.x,h=e.y-a.y,p=e.z-a.z,x=t.x-a.x,S=t.y-a.y,f=t.z-a.z,d=n.x-a.x,w=n.y-a.y,I=n.z-a.z,E=Math.abs(c),v=Math.abs(l),M=Math.abs(u),A,g,_,T,R,P,U,L,B,H,X,Z;if(E>=v&&E>=M?(_=c,P=m,B=x,Z=d,c>=0?(A=l,g=u,T=h,R=p,U=S,L=f,H=w,X=I):(A=u,g=l,T=p,R=h,U=f,L=S,H=I,X=w)):v>=M?(_=l,P=h,B=S,Z=w,l>=0?(A=u,g=c,T=p,R=m,U=f,L=x,H=I,X=d):(A=c,g=u,T=m,R=p,U=x,L=f,H=d,X=I)):(_=u,P=p,B=f,Z=I,u>=0?(A=c,g=l,T=m,R=h,U=x,L=S,H=d,X=w):(A=l,g=c,T=h,R=m,U=S,L=x,H=w,X=d)),_===0)return null;let k=A/_,$=g/_,ee=1/_,se=T-k*P,re=R-$*P,Ve=U-k*B,Oe=L-$*B,Ge=H-k*Z,Y=X-$*Z,j=Ge*Oe-Y*Ve,ie=se*Y-re*Ge,be=Ve*re-Oe*se;if(s){if(j<0||ie<0||be<0)return null}else if((j<0||ie<0||be<0)&&(j>0||ie>0||be>0))return null;let me=j+ie+be;if(me===0)return null;let De=ee*(j*P+ie*B+be*Z);return(me>0?De<0:De>0)?null:this.at(De/me,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},_i=class extends zn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Fe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.combine=xa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Xc=new rt,pi=new Rs,Mr=new Qn,qc=new D,Sr=new D,br=new D,Er=new D,Jo=new D,Tr=new D,Yc=new D,wr=new D,pt=class extends yt{constructor(e=new Mt,t=new _i){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Tr.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=o[c],m=r[c];u!==0&&(Jo.fromBufferAttribute(m,e),a?Tr.addScaledVector(Jo,u):Tr.addScaledVector(Jo.sub(t),u))}t.add(Tr)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Mr.copy(n.boundingSphere),Mr.applyMatrix4(r),pi.copy(e.ray).recast(e.near),!(Mr.containsPoint(pi.origin)===!1&&(pi.intersectSphere(Mr,qc)===null||pi.origin.distanceToSquared(qc)>(e.far-e.near)**2))&&(Xc.copy(r).invert(),pi.copy(e.ray).applyMatrix4(Xc),!(n.boundingBox!==null&&pi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,pi)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,m=r.attributes.normal,h=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let x=0,S=h.length;x<S;x++){let f=h[x],d=a[f.materialIndex],w=Math.max(f.start,p.start),I=Math.min(o.count,Math.min(f.start+f.count,p.start+p.count));for(let E=w,v=I;E<v;E+=3){let M=o.getX(E),A=o.getX(E+1),g=o.getX(E+2);s=Ar(this,d,e,n,l,u,m,M,A,g),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=f.materialIndex,t.push(s))}}else{let x=Math.max(0,p.start),S=Math.min(o.count,p.start+p.count);for(let f=x,d=S;f<d;f+=3){let w=o.getX(f),I=o.getX(f+1),E=o.getX(f+2);s=Ar(this,a,e,n,l,u,m,w,I,E),s&&(s.faceIndex=Math.floor(f/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let x=0,S=h.length;x<S;x++){let f=h[x],d=a[f.materialIndex],w=Math.max(f.start,p.start),I=Math.min(c.count,Math.min(f.start+f.count,p.start+p.count));for(let E=w,v=I;E<v;E+=3){let M=E,A=E+1,g=E+2;s=Ar(this,d,e,n,l,u,m,M,A,g),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=f.materialIndex,t.push(s))}}else{let x=Math.max(0,p.start),S=Math.min(c.count,p.start+p.count);for(let f=x,d=S;f<d;f+=3){let w=f,I=f+1,E=f+2;s=Ar(this,a,e,n,l,u,m,w,I,E),s&&(s.faceIndex=Math.floor(f/3),t.push(s))}}}};function Ld(i,e,t,n,s,r,a,o){let c;if(e.side===Vt?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,e.side===An,o),c===null)return null;wr.copy(o),wr.applyMatrix4(i.matrixWorld);let l=t.ray.origin.distanceTo(wr);return l<t.near||l>t.far?null:{distance:l,point:wr.clone(),object:i}}function Ar(i,e,t,n,s,r,a,o,c,l){i.getVertexPosition(o,Sr),i.getVertexPosition(c,br),i.getVertexPosition(l,Er);let u=Ld(i,e,t,n,Sr,br,Er,Yc);if(u){let m=new D;jn.getBarycoord(Yc,Sr,br,Er,m),s&&(u.uv=jn.getInterpolatedAttribute(s,o,c,l,m,new Re)),r&&(u.uv1=jn.getInterpolatedAttribute(r,o,c,l,m,new Re)),a&&(u.normal=jn.getInterpolatedAttribute(a,o,c,l,m,new D),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:c,c:l,normal:new D,materialIndex:0};jn.getNormal(Sr,br,Er,h.normal),u.face=h,u.barycoord=m}return u}var Is=class extends qt{constructor(e=null,t=1,n=1,s,r,a,o,c,l=wt,u=wt,m,h){super(null,a,o,c,l,u,s,r,m,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ps=class extends Kt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Fi=new rt,$c=new rt,Cr=[],Zc=new Tn,Dd=new rt,ps=new pt,ms=new Qn,kn=class extends pt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ps(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Dd)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Tn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Fi),Zc.copy(e.boundingBox).applyMatrix4(Fi),this.boundingBox.union(Zc)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Qn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Fi),ms.copy(e.boundingSphere).applyMatrix4(Fi),this.boundingSphere.union(ms)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(ps.geometry=this.geometry,ps.material=this.material,ps.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ms.copy(this.boundingSphere),ms.applyMatrix4(n),e.ray.intersectsSphere(ms)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Fi),$c.multiplyMatrices(n,Fi),ps.matrixWorld=$c,ps.raycast(e,Cr);for(let a=0,o=Cr.length;a<o;a++){let c=Cr[a];c.instanceId=r,c.object=this,t.push(c)}Cr.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Ps(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Is(new Float32Array(s*this.count),s,this.count,Ta,ln));let r=this.morphTexture.source.data.data,a=0;for(let l=0;l<n.length;l++)a+=n[l];let o=this.geometry.morphTargetsRelative?1:1-a,c=s*e;return r[c]=o,r.set(n,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},mi=new Qn,Nd=new Re(.5,.5),Rr=new D,Zi=class{constructor(e=new pn,t=new pn,n=new pn,s=new pn,r=new pn,a=new pn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=mn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],u=r[4],m=r[5],h=r[6],p=r[7],x=r[8],S=r[9],f=r[10],d=r[11],w=r[12],I=r[13],E=r[14],v=r[15];if(s[0].setComponents(l-a,p-u,d-x,v-w).normalize(),s[1].setComponents(l+a,p+u,d+x,v+w).normalize(),s[2].setComponents(l+o,p+m,d+S,v+I).normalize(),s[3].setComponents(l-o,p-m,d-S,v-I).normalize(),n)s[4].setComponents(c,h,f,E).normalize(),s[5].setComponents(l-c,p-h,d-f,v-E).normalize();else if(s[4].setComponents(l-c,p-h,d-f,v-E).normalize(),t===mn)s[5].setComponents(l+c,p+h,d+f,v+E).normalize();else if(t===Hi)s[5].setComponents(c,h,f,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),mi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),mi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(mi)}intersectsSprite(e){mi.center.set(0,0,0);let t=Nd.distanceTo(e.center);return mi.radius=.7071067811865476+t,mi.applyMatrix4(e.matrixWorld),this.intersectsSphere(mi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Rr.x=s.normal.x>0?e.max.x:e.min.x,Rr.y=s.normal.y>0?e.max.y:e.min.y,Rr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Rr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Ls=class extends qt{constructor(e=[],t=ri,n,s,r,a,o,c,l,u){super(e,t,n,s,r,a,o,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var ei=class extends qt{constructor(e,t,n=_n,s,r,a,o=wt,c=wt,l,u=bn,m=1){if(u!==bn&&u!==oi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:m};super(h,s,r,a,o,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new qi(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Yr=class extends ei{constructor(e,t=_n,n=ri,s,r,a=wt,o=wt,c,l=bn){let u={width:e,height:e,depth:1},m=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,c,l),this.image=m,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ds=class extends qt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},rn=class i extends Mt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],u=[],m=[],h=0,p=0;x("z","y","x",-1,-1,n,t,e,a,r,0),x("z","y","x",1,-1,n,t,-e,a,r,1),x("x","z","y",1,1,e,n,t,s,a,2),x("x","z","y",1,-1,e,n,-t,s,a,3),x("x","y","z",1,-1,e,t,n,s,r,4),x("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new Je(l,3)),this.setAttribute("normal",new Je(u,3)),this.setAttribute("uv",new Je(m,2));function x(S,f,d,w,I,E,v,M,A,g,_){let T=E/A,R=v/g,P=E/2,U=v/2,L=M/2,B=A+1,H=g+1,X=0,Z=0,k=new D;for(let $=0;$<H;$++){let ee=$*R-U;for(let se=0;se<B;se++){let re=se*T-P;k[S]=re*w,k[f]=ee*I,k[d]=L,l.push(k.x,k.y,k.z),k[S]=0,k[f]=0,k[d]=M>0?1:-1,u.push(k.x,k.y,k.z),m.push(se/A),m.push(1-$/g),X+=1}}for(let $=0;$<g;$++)for(let ee=0;ee<A;ee++){let se=h+ee+B*$,re=h+ee+B*($+1),Ve=h+(ee+1)+B*($+1),Oe=h+(ee+1)+B*$;c.push(se,re,Oe),c.push(re,Ve,Oe),Z+=6}o.addGroup(p,Z,_),p+=Z,h+=X}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Ns=class i extends Mt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],a=[],o=[],c=[],l=new D,u=new Re;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let m=0,h=3;m<=t;m++,h+=3){let p=n+m/t*s;l.x=e*Math.cos(p),l.y=e*Math.sin(p),a.push(l.x,l.y,l.z),o.push(0,0,1),u.x=(a[h]/e+1)/2,u.y=(a[h+1]/e+1)/2,c.push(u.x,u.y)}for(let m=1;m<=t;m++)r.push(m,m+1,0);this.setIndex(r),this.setAttribute("position",new Je(a,3)),this.setAttribute("normal",new Je(o,3)),this.setAttribute("uv",new Je(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},wn=class i extends Mt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let u=[],m=[],h=[],p=[],x=0,S=[],f=n/2,d=0;w(),a===!1&&(e>0&&I(!0),t>0&&I(!1)),this.setIndex(u),this.setAttribute("position",new Je(m,3)),this.setAttribute("normal",new Je(h,3)),this.setAttribute("uv",new Je(p,2));function w(){let E=new D,v=new D,M=0,A=(t-e)/n;for(let g=0;g<=r;g++){let _=[],T=g/r,R=T*(t-e)+e;for(let P=0;P<=s;P++){let U=P/s,L=U*c+o,B=Math.sin(L),H=Math.cos(L);v.x=R*B,v.y=-T*n+f,v.z=R*H,m.push(v.x,v.y,v.z),E.set(B,A,H).normalize(),h.push(E.x,E.y,E.z),p.push(U,1-T),_.push(x++)}S.push(_)}for(let g=0;g<s;g++)for(let _=0;_<r;_++){let T=S[_][g],R=S[_+1][g],P=S[_+1][g+1],U=S[_][g+1];(e>0||_!==0)&&(u.push(T,R,U),M+=3),(t>0||_!==r-1)&&(u.push(R,P,U),M+=3)}l.addGroup(d,M,0),d+=M}function I(E){let v=x,M=new Re,A=new D,g=0,_=E===!0?e:t,T=E===!0?1:-1;for(let P=1;P<=s;P++)m.push(0,f*T,0),h.push(0,T,0),p.push(.5,.5),x++;let R=x;for(let P=0;P<=s;P++){let L=P/s*c+o,B=Math.cos(L),H=Math.sin(L);A.x=_*H,A.y=f*T,A.z=_*B,m.push(A.x,A.y,A.z),h.push(0,T,0),M.x=B*.5+.5,M.y=H*.5*T+.5,p.push(M.x,M.y),x++}for(let P=0;P<s;P++){let U=v+P,L=R+P;E===!0?u.push(L,L+1,U):u.push(L+1,L,U),g+=3}l.addGroup(d,g,E===!0?1:2),d+=g}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Us=class i extends wn{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var an=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Le("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,c=r-1,l;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),l=n[s]-a,l<0)o=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===a)return s/(r-1);let u=n[s],h=n[s+1]-u,p=(a-u)/h;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),c=t||(a.isVector2?new Re:new D);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new D,s=[],r=[],a=[],o=new D,c=new rt;for(let p=0;p<=e;p++){let x=p/e;s[p]=this.getTangentAt(x,new D)}r[0]=new D,a[0]=new D;let l=Number.MAX_VALUE,u=Math.abs(s[0].x),m=Math.abs(s[0].y),h=Math.abs(s[0].z);u<=l&&(l=u,n.set(1,0,0)),m<=l&&(l=m,n.set(0,1,0)),h<=l&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(s[p-1],s[p]),o.length()>Number.EPSILON){o.normalize();let x=Math.acos(Xe(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(c.makeRotationAxis(o,x))}a[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(Xe(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(p=-p);for(let x=1;x<=e;x++)r[x].applyMatrix4(c.makeRotationAxis(s[x],p*x)),a[x].crossVectors(s[x],r[x])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Fs=class extends an{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new Re){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),m=Math.sin(this.aRotation),h=c-this.aX,p=l-this.aY;c=h*u-p*m+this.aX,l=h*m+p*u+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},$r=class extends Fs{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Dl(){let i=0,e=0,t=0,n=0;function s(r,a,o,c){i=r,e=o,t=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){s(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,u,m){let h=(a-r)/l-(o-r)/(l+u)+(o-a)/u,p=(o-a)/u-(c-a)/(u+m)+(c-o)/m;h*=u,p*=u,s(a,o,h,p)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var Jc=new D,Kc=new D,Ko=new Dl,jo=new Dl,Qo=new Dl,Ji=class extends an{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new D){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,u;this.closed||o>0?l=s[(o-1)%r]:(Kc.subVectors(s[0],s[1]).add(s[0]),l=Kc);let m=s[o%r],h=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(Jc.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Jc),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,x=Math.pow(l.distanceToSquared(m),p),S=Math.pow(m.distanceToSquared(h),p),f=Math.pow(h.distanceToSquared(u),p);S<1e-4&&(S=1),x<1e-4&&(x=S),f<1e-4&&(f=S),Ko.initNonuniformCatmullRom(l.x,m.x,h.x,u.x,x,S,f),jo.initNonuniformCatmullRom(l.y,m.y,h.y,u.y,x,S,f),Qo.initNonuniformCatmullRom(l.z,m.z,h.z,u.z,x,S,f)}else this.curveType==="catmullrom"&&(Ko.initCatmullRom(l.x,m.x,h.x,u.x,this.tension),jo.initCatmullRom(l.y,m.y,h.y,u.y,this.tension),Qo.initCatmullRom(l.z,m.z,h.z,u.z,this.tension));return n.set(Ko.calc(c),jo.calc(c),Qo.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new D().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function jc(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,c=i*o;return(2*t-2*n+r+a)*c+(-3*t+3*n-2*r-a)*o+r*i+t}function Ud(i,e){let t=1-i;return t*t*e}function Fd(i,e){return 2*(1-i)*i*e}function Od(i,e){return i*i*e}function xs(i,e,t,n){return Ud(i,e)+Fd(i,t)+Od(i,n)}function Bd(i,e){let t=1-i;return t*t*t*e}function zd(i,e){let t=1-i;return 3*t*t*i*e}function kd(i,e){return 3*(1-i)*i*i*e}function Vd(i,e){return i*i*i*e}function ys(i,e,t,n,s){return Bd(i,e)+zd(i,t)+kd(i,n)+Vd(i,s)}var Zr=class extends an{constructor(e=new Re,t=new Re,n=new Re,s=new Re){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new Re){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ys(e,s.x,r.x,a.x,o.x),ys(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Jr=class extends an{constructor(e=new D,t=new D,n=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new D){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ys(e,s.x,r.x,a.x,o.x),ys(e,s.y,r.y,a.y,o.y),ys(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Kr=class extends an{constructor(e=new Re,t=new Re){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Re){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Re){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},jr=class extends an{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Qr=class extends an{constructor(e=new Re,t=new Re,n=new Re){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Re){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(xs(e,s.x,r.x,a.x),xs(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Os=class extends an{constructor(e=new D,t=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new D){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(xs(e,s.x,r.x,a.x),xs(e,s.y,r.y,a.y),xs(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ea=class extends an{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Re){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],l=s[a],u=s[a>s.length-2?s.length-1:a+1],m=s[a>s.length-3?s.length-1:a+2];return n.set(jc(o,c.x,l.x,u.x,m.x),jc(o,c.y,l.y,u.y,m.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new Re().fromArray(s))}return this}},Gd=Object.freeze({__proto__:null,ArcCurve:$r,CatmullRomCurve3:Ji,CubicBezierCurve:Zr,CubicBezierCurve3:Jr,EllipseCurve:Fs,LineCurve:Kr,LineCurve3:jr,QuadraticBezierCurve:Qr,QuadraticBezierCurve3:Os,SplineCurve:ea});var Bs=class i extends Mt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(s),l=o+1,u=c+1,m=e/o,h=t/c,p=[],x=[],S=[],f=[];for(let d=0;d<u;d++){let w=d*h-a;for(let I=0;I<l;I++){let E=I*m-r;x.push(E,-w,0),S.push(0,0,1),f.push(I/o),f.push(1-d/c)}}for(let d=0;d<c;d++)for(let w=0;w<o;w++){let I=w+l*d,E=w+l*(d+1),v=w+1+l*(d+1),M=w+1+l*d;p.push(I,E,M),p.push(E,v,M)}this.setIndex(p),this.setAttribute("position",new Je(x,3)),this.setAttribute("normal",new Je(S,3)),this.setAttribute("uv",new Je(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var xi=class i extends Mt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),l=0,u=[],m=new D,h=new D,p=[],x=[],S=[],f=[];for(let d=0;d<=n;d++){let w=[],I=d/n,E=a+I*o,v=e*Math.cos(E),M=Math.sqrt(e*e-v*v),A=0;d===0&&a===0?A=.5/t:d===n&&c===Math.PI&&(A=-.5/t);for(let g=0;g<=t;g++){let _=g/t,T=s+_*r;m.x=-M*Math.cos(T),m.y=v,m.z=M*Math.sin(T),x.push(m.x,m.y,m.z),h.copy(m).normalize(),S.push(h.x,h.y,h.z),f.push(_+A,1-I),w.push(l++)}u.push(w)}for(let d=0;d<n;d++)for(let w=0;w<t;w++){let I=u[d][w+1],E=u[d][w],v=u[d+1][w],M=u[d+1][w+1];(d!==0||a>0)&&p.push(I,E,M),(d!==n-1||c<Math.PI)&&p.push(E,v,M)}this.setIndex(p),this.setAttribute("position",new Je(x,3)),this.setAttribute("normal",new Je(S,3)),this.setAttribute("uv",new Je(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Ki=class i extends Mt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let c=[],l=[],u=[],m=[],h=new D,p=new D,x=new D;for(let S=0;S<=n;S++){let f=a+S/n*o;for(let d=0;d<=s;d++){let w=d/s*r;p.x=(e+t*Math.cos(f))*Math.cos(w),p.y=(e+t*Math.cos(f))*Math.sin(w),p.z=t*Math.sin(f),l.push(p.x,p.y,p.z),h.x=e*Math.cos(w),h.y=e*Math.sin(w),x.subVectors(p,h).normalize(),u.push(x.x,x.y,x.z),m.push(d/s),m.push(S/n)}}for(let S=1;S<=n;S++)for(let f=1;f<=s;f++){let d=(s+1)*S+f-1,w=(s+1)*(S-1)+f-1,I=(s+1)*(S-1)+f,E=(s+1)*S+f;c.push(d,w,E),c.push(w,I,E)}this.setIndex(c),this.setAttribute("position",new Je(l,3)),this.setAttribute("normal",new Je(u,3)),this.setAttribute("uv",new Je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var zs=class i extends Mt{constructor(e=new Os(new D(-1,-1,0),new D(-1,1,0),new D(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new D,c=new D,l=new Re,u=new D,m=[],h=[],p=[],x=[];S(),this.setIndex(x),this.setAttribute("position",new Je(m,3)),this.setAttribute("normal",new Je(h,3)),this.setAttribute("uv",new Je(p,2));function S(){for(let I=0;I<t;I++)f(I);f(r===!1?t:0),w(),d()}function f(I){u=e.getPointAt(I/t,u);let E=a.normals[I],v=a.binormals[I];for(let M=0;M<=s;M++){let A=M/s*Math.PI*2,g=Math.sin(A),_=-Math.cos(A);c.x=_*E.x+g*v.x,c.y=_*E.y+g*v.y,c.z=_*E.z+g*v.z,c.normalize(),h.push(c.x,c.y,c.z),o.x=u.x+n*c.x,o.y=u.y+n*c.y,o.z=u.z+n*c.z,m.push(o.x,o.y,o.z)}}function d(){for(let I=1;I<=t;I++)for(let E=1;E<=s;E++){let v=(s+1)*(I-1)+(E-1),M=(s+1)*I+(E-1),A=(s+1)*I+E,g=(s+1)*(I-1)+E;x.push(v,M,g),x.push(M,A,g)}}function w(){for(let I=0;I<=t;I++)for(let E=0;E<=s;E++)l.x=I/t,l.y=E/s,p.push(l.x,l.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Gd[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};function Mi(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(Qc(s))s.isRenderTargetTexture?(Le("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Qc(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Ut(i){let e={};for(let t=0;t<i.length;t++){let n=Mi(i[t]);for(let s in n)e[s]=n[s]}return e}function Qc(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Hd(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Nl(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:$e.workingColorSpace}var Xh={clone:Mi,merge:Ut},Wd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Xd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,jt=class extends zn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Wd,this.fragmentShader=Xd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Mi(e.uniforms),this.uniformsGroups=Hd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Fe().setHex(s.value);break;case"v2":this.uniforms[n].value=new Re().fromArray(s.value);break;case"v3":this.uniforms[n].value=new D().fromArray(s.value);break;case"v4":this.uniforms[n].value=new dt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Be().fromArray(s.value);break;case"m4":this.uniforms[n].value=new rt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ta=class extends jt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},on=class extends zn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Fe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=nr,this.normalScale=new Re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var ti=class extends zn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Fe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=nr,this.normalScale=new Re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.combine=xa,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},na=class extends zn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ih,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ia=class extends zn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Oi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function el(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var ni=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},sa=class extends ni{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:il,endingEnd:il}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case sl:r=e,o=2*t-n;break;case rl:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case sl:a=e,c=2*n-t;break;case rl:a=1,c=n+s[1]-s[0];break;default:a=e-1,c=t}let l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this._offsetPrev,m=this._offsetNext,h=this._weightPrev,p=this._weightNext,x=(n-t)/(s-t),S=x*x,f=S*x,d=-h*f+2*h*S-h*x,w=(1+h)*f+(-1.5-2*h)*S+(-.5+h)*x+1,I=(-1-p)*f+(1.5+p)*S+.5*x,E=p*f-p*S;for(let v=0;v!==o;++v)r[v]=d*a[u+v]+w*a[l+v]+I*a[c+v]+E*a[m+v];return r}},ra=class extends ni{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=(n-t)/(s-t),m=1-u;for(let h=0;h!==o;++h)r[h]=a[l+h]*m+a[c+h]*u;return r}},aa=class extends ni{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},oa=class extends ni{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this.inTangents,m=this.outTangents;if(!u||!m){let x=(n-t)/(s-t),S=1-x;for(let f=0;f!==o;++f)r[f]=a[l+f]*S+a[c+f]*x;return r}let h=o*2,p=e-1;for(let x=0;x!==o;++x){let S=a[l+x],f=a[c+x],d=p*h+x*2,w=m[d],I=m[d+1],E=e*h+x*2,v=u[E],M=u[E+1],A=Yd(n,t,w,v,s);r[x]=qh(A,S,I,M,f)}return r}};function qh(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function qd(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function Yd(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=qh(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let c=qd(r,e,t,n,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-o/c))}return r}var Qt=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Oi(t,this.TimeBufferType),this.values=Oi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Oi(e.times,Array),values:Oi(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),el(e.settings)&&(n.settings={inTangents:Oi(e.settings.inTangents,Array),outTangents:Oi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new aa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ra(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new sa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new oa(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case vs:t=this.InterpolantFactoryMethodDiscrete;break;case Hr:t=this.InterpolantFactoryMethodLinear;break;case Lr:t=this.InterpolantFactoryMethodSmooth;break;case nl:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Le("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return vs;case this.InterpolantFactoryMethodLinear:return Hr;case this.InterpolantFactoryMethodSmooth:return Lr;case this.InterpolantFactoryMethodBezier:return nl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;el(this.settings)&&(eh(this.settings.inTangents,e),eh(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ue("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Ue("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){Ue("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){Ue("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&Qu(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){Ue("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Lr,r=e.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=e[o],u=e[o+1];if(l!==u&&(o!==1||l!==e[0]))if(s)c=!0;else{let m=o*n,h=m-n,p=m+n;for(let x=0;x!==n;++x){let S=t[m+x];if(S!==t[h+x]||S!==t[p+x]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let m=o*n,h=a*n;for(let p=0;p!==n;++p)t[h+p]=t[m+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,el(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function eh(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}Qt.prototype.ValueTypeName="";Qt.prototype.TimeBufferType=Float32Array;Qt.prototype.ValueBufferType=Float32Array;Qt.prototype.DefaultInterpolation=Hr;var ii=class extends Qt{constructor(e,t,n){super(e,t,n)}};ii.prototype.ValueTypeName="bool";ii.prototype.ValueBufferType=Array;ii.prototype.DefaultInterpolation=vs;ii.prototype.InterpolantFactoryMethodLinear=void 0;ii.prototype.InterpolantFactoryMethodSmooth=void 0;var la=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}};la.prototype.ValueTypeName="color";var ca=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}};ca.prototype.ValueTypeName="number";var ha=class extends ni{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(s-t),l=e*o;for(let u=l+o;l!==u;l+=4)nn.slerpFlat(r,0,a,l-o,a,l,c);return r}},ks=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new ha(this.times,this.values,this.getValueSize(),e)}};ks.prototype.ValueTypeName="quaternion";ks.prototype.InterpolantFactoryMethodSmooth=void 0;var si=class extends Qt{constructor(e,t,n){super(e,t,n)}};si.prototype.ValueTypeName="string";si.prototype.ValueBufferType=Array;si.prototype.DefaultInterpolation=vs;si.prototype.InterpolantFactoryMethodLinear=void 0;si.prototype.InterpolantFactoryMethodSmooth=void 0;var ua=class extends Qt{constructor(e,t,n,s){super(e,t,n,s)}};ua.prototype.ValueTypeName="vector";var da=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,m){return l.push(u,m),this},this.removeHandler=function(u){let m=l.indexOf(u);return m!==-1&&l.splice(m,2),this},this.getHandler=function(u){for(let m=0,h=l.length;m<h;m+=2){let p=l[m],x=l[m+1];if(p.global&&(p.lastIndex=0),p.test(u))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Yh=new da,fa=class{constructor(e){this.manager=e!==void 0?e:Yh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};fa.DEFAULT_MATERIAL_NAME="__DEFAULT";var Vs=class extends yt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Fe(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Gs=class extends Vs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(yt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Fe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},tl=new rt,th=new D,nh=new D,pa=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Re(512,512),this.mapType=$t,this.map=null,this.mapPass=null,this.matrix=new rt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Zi,this._frameExtents=new Re(1,1),this._viewportCount=1,this._viewports=[new dt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;th.setFromMatrixPosition(e.matrixWorld),t.position.copy(th),nh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(nh),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){tl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(tl,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,c=s?s.x/r.x:0,l=s?s.y/r.y:0;e.coordinateSystem===Hi||e.reversedDepth?t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,.5,.5,0,0,0,1),t.multiply(tl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ir=new D,Pr=new nn,Mn=new D,Hs=class extends yt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new rt,this.projectionMatrix=new rt,this.projectionMatrixInverse=new rt,this.coordinateSystem=mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ir,Pr,Mn),Mn.x===1&&Mn.y===1&&Mn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ir,Pr,Mn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ir,Pr,Mn),Mn.x===1&&Mn.y===1&&Mn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ir,Pr,Mn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Kn=new D,ih=new Re,sh=new Re,Nt=class extends Hs{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Xi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(gs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Xi*2*Math.atan(Math.tan(gs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Kn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Kn.x,Kn.y).multiplyScalar(-e/Kn.z),Kn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Kn.x,Kn.y).multiplyScalar(-e/Kn.z)}getViewSize(e,t){return this.getViewBounds(e,ih,sh),t.subVectors(sh,ih)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(gs*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var ji=class extends Hs{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},al=class extends pa{constructor(){super(new ji(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ws=class extends Vs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(yt.DEFAULT_UP),this.updateMatrix(),this.target=new yt,this.shadow=new al}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Bi=-90,zi=1,ma=class extends yt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Nt(Bi,zi,e,t);s.layers=this.layers,this.add(s);let r=new Nt(Bi,zi,e,t);r.layers=this.layers,this.add(r);let a=new Nt(Bi,zi,e,t);a.layers=this.layers,this.add(a);let o=new Nt(Bi,zi,e,t);o.layers=this.layers,this.add(o);let c=new Nt(Bi,zi,e,t);c.layers=this.layers,this.add(c);let l=new Nt(Bi,zi,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,c]=t;for(let l of t)this.remove(l);if(e===mn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Hi)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,u]=this.children,m=e.getRenderTarget(),h=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;let S=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let f=!1;e.isWebGLRenderer===!0?f=e.state.buffers.depth.getReversed():f=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),n.texture.generateMipmaps=S,e.setRenderTarget(n,5,s),f&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(m,h,p),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},ga=class extends Nt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Ul="\\[\\]\\.:\\/",$d=new RegExp("["+Ul+"]","g"),Fl="[^"+Ul+"]",Zd="[^"+Ul.replace("\\.","")+"]",Jd=/((?:WC+[\/:])*)/.source.replace("WC",Fl),Kd=/(WCOD+)?/.source.replace("WCOD",Zd),jd=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Fl),Qd=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Fl),ef=new RegExp("^"+Jd+Kd+jd+Qd+"$"),tf=["material","materials","bones","map"],ol=class{constructor(e,t,n){let s=n||ht.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ht=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace($d,"")}static parseTrackName(e){let t=ef.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);tf.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let c=n(o.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Le("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){Ue("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ue("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ue("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ue("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ue("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ue("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){Ue("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let a=e[s];if(a===void 0){let l=t.nodeName;Ue("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ue("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ue("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ht.Composite=ol;ht.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ht.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ht.prototype.GetterByBindingType=[ht.prototype._getValue_direct,ht.prototype._getValue_array,ht.prototype._getValue_arrayElement,ht.prototype._getValue_toArray];ht.prototype.SetterByBindingTypeAndVersioning=[[ht.prototype._setValue_direct,ht.prototype._setValue_direct_setNeedsUpdate,ht.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_array,ht.prototype._setValue_array_setNeedsUpdate,ht.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_arrayElement,ht.prototype._setValue_arrayElement_setNeedsUpdate,ht.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_fromArray,ht.prototype._setValue_fromArray_setNeedsUpdate,ht.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var c_=new Float32Array(1);var rh=new rt,Xs=class{constructor(e,t,n=0,s=1/0){this.ray=new Rs(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Yi,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Ue("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return rh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(rh),this}intersectObject(e,t=!0,n=[]){return ll(e,this,n,t),n.sort(ah),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)ll(e[s],this,n,t);return n.sort(ah),n}};function ah(i,e){return i.distance-e.distance}function ll(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)ll(r[a],e,t,!0)}}var cl=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};function Ol(i,e,t,n){let s=nf(n);switch(t){case Al:return i*e;case Ta:return i*e/s.components*s.byteLength;case wa:return i*e/s.components*s.byteLength;case li:return i*e*2/s.components*s.byteLength;case Aa:return i*e*2/s.components*s.byteLength;case Cl:return i*e*3/s.components*s.byteLength;case cn:return i*e*4/s.components*s.byteLength;case Ca:return i*e*4/s.components*s.byteLength;case Js:case Ks:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case js:case Qs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ia:case La:return Math.max(i,16)*Math.max(e,8)/4;case Ra:case Pa:return Math.max(i,8)*Math.max(e,8)/2;case Da:case Na:case Fa:case Oa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ua:case er:case Ba:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case za:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ka:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Va:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Ga:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ha:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Wa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Xa:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case qa:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ya:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case $a:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Za:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ja:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Ka:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case ja:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Qa:case eo:case to:return Math.ceil(i/4)*Math.ceil(e/4)*16;case no:case io:return Math.ceil(i/4)*Math.ceil(e/4)*8;case tr:case so:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function nf(i){switch(i){case $t:case bl:return{byteLength:1,components:1};case ts:case El:case xn:return{byteLength:2,components:1};case ba:case Ea:return{byteLength:2,components:4};case _n:case Sa:case ln:return{byteLength:4,components:1};case Tl:case wl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Le("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function mu(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function rf(i){let e=new WeakMap;function t(o,c){let l=o.array,u=o.usage,m=l.byteLength,h=i.createBuffer();i.bindBuffer(c,h),i.bufferData(c,l,u),o.onUploadCallback();let p;if(l instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)p=i.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=i.SHORT;else if(l instanceof Uint32Array)p=i.UNSIGNED_INT;else if(l instanceof Int32Array)p=i.INT;else if(l instanceof Int8Array)p=i.BYTE;else if(l instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:h,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:m}}function n(o,c,l){let u=c.array,m=c.updateRanges;if(i.bindBuffer(l,o),m.length===0)i.bufferSubData(l,0,u);else{m.sort((p,x)=>p.start-x.start);let h=0;for(let p=1;p<m.length;p++){let x=m[h],S=m[p];S.start<=x.start+x.count+1?x.count=Math.max(x.count,S.start+S.count-x.start):(++h,m[h]=S)}m.length=h+1;for(let p=0,x=m.length;p<x;p++){let S=m[p];i.bufferSubData(l,S.start*u.BYTES_PER_ELEMENT,u,S.start,S.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(i.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var af=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,of=`#ifdef USE_ALPHAHASH
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
#endif`,lf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,uf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,df=`#ifdef USE_AOMAP
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
#endif`,ff=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,pf=`#ifdef USE_BATCHING
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
#endif`,mf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,gf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,_f=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,xf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,yf=`#ifdef USE_IRIDESCENCE
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
#endif`,vf=`#ifdef USE_BUMPMAP
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
#endif`,Mf=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Sf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,bf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ef=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Tf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,wf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Af=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Cf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Rf=`#define PI 3.141592653589793
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
} // validated`,If=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Pf=`vec3 transformedNormal = objectNormal;
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
#endif`,Lf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Df=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Nf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Uf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ff="gl_FragColor = linearToOutputTexel( gl_FragColor );",Of=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Bf=`#ifdef USE_ENVMAP
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
#endif`,zf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,kf=`#ifdef USE_ENVMAP
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
#endif`,Vf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Gf=`#ifdef USE_ENVMAP
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
#endif`,Hf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Wf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Xf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,qf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Yf=`#ifdef USE_GRADIENTMAP
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
}`,$f=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Zf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Jf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Kf=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,jf=`#ifdef USE_ENVMAP
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
#endif`,Qf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ep=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,tp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,np=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ip=`PhysicalMaterial material;
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
#endif`,sp=`uniform sampler2D dfgLUT;
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
}`,rp=`
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
#endif`,ap=`#if defined( RE_IndirectDiffuse )
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
#endif`,op=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lp=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,cp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,hp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,up=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,fp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,pp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,mp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,gp=`#if defined( USE_POINTS_UV )
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
#endif`,_p=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,xp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,yp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,vp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Mp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sp=`#ifdef USE_MORPHTARGETS
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
#endif`,bp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ep=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Tp=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,wp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ap=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Cp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Rp=`#ifdef USE_NORMALMAP
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
#endif`,Ip=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Pp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Lp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Dp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Np=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Up=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Fp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Op=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Bp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,zp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,kp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Vp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Gp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Hp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Wp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Xp=`float getShadowMask() {
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
}`,qp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Yp=`#ifdef USE_SKINNING
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
#endif`,$p=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Zp=`#ifdef USE_SKINNING
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
#endif`,Jp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Kp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,jp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Qp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,em=`#ifdef USE_TRANSMISSION
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
#endif`,tm=`#ifdef USE_TRANSMISSION
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
#endif`,nm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,im=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,sm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,rm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,am=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,om=`uniform sampler2D t2D;
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
}`,lm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cm=`#ifdef ENVMAP_TYPE_CUBE
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
}`,hm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,um=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dm=`#include <common>
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
}`,fm=`#if DEPTH_PACKING == 3200
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
}`,pm=`#define DISTANCE
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
}`,mm=`#define DISTANCE
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
}`,gm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,_m=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,xm=`uniform float scale;
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
}`,ym=`uniform vec3 diffuse;
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
}`,vm=`#include <common>
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
}`,Mm=`uniform vec3 diffuse;
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
}`,Sm=`#define LAMBERT
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
}`,bm=`#define LAMBERT
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
}`,Em=`#define MATCAP
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
}`,Tm=`#define MATCAP
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
}`,wm=`#define NORMAL
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
}`,Am=`#define NORMAL
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
}`,Cm=`#define PHONG
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
}`,Rm=`#define PHONG
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
}`,Im=`#define STANDARD
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
}`,Pm=`#define STANDARD
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
}`,Lm=`#define TOON
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
}`,Dm=`#define TOON
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
}`,Nm=`uniform float size;
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
}`,Um=`uniform vec3 diffuse;
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
}`,Fm=`#include <common>
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
}`,Om=`uniform vec3 color;
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
}`,Bm=`uniform float rotation;
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
}`,zm=`uniform vec3 diffuse;
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
}`,We={alphahash_fragment:af,alphahash_pars_fragment:of,alphamap_fragment:lf,alphamap_pars_fragment:cf,alphatest_fragment:hf,alphatest_pars_fragment:uf,aomap_fragment:df,aomap_pars_fragment:ff,batching_pars_vertex:pf,batching_vertex:mf,begin_vertex:gf,beginnormal_vertex:_f,bsdfs:xf,iridescence_fragment:yf,bumpmap_pars_fragment:vf,clipping_planes_fragment:Mf,clipping_planes_pars_fragment:Sf,clipping_planes_pars_vertex:bf,clipping_planes_vertex:Ef,color_fragment:Tf,color_pars_fragment:wf,color_pars_vertex:Af,color_vertex:Cf,common:Rf,cube_uv_reflection_fragment:If,defaultnormal_vertex:Pf,displacementmap_pars_vertex:Lf,displacementmap_vertex:Df,emissivemap_fragment:Nf,emissivemap_pars_fragment:Uf,colorspace_fragment:Ff,colorspace_pars_fragment:Of,envmap_fragment:Bf,envmap_common_pars_fragment:zf,envmap_pars_fragment:kf,envmap_pars_vertex:Vf,envmap_physical_pars_fragment:jf,envmap_vertex:Gf,fog_vertex:Hf,fog_pars_vertex:Wf,fog_fragment:Xf,fog_pars_fragment:qf,gradientmap_pars_fragment:Yf,lightmap_pars_fragment:$f,lights_lambert_fragment:Zf,lights_lambert_pars_fragment:Jf,lights_pars_begin:Kf,lights_toon_fragment:Qf,lights_toon_pars_fragment:ep,lights_phong_fragment:tp,lights_phong_pars_fragment:np,lights_physical_fragment:ip,lights_physical_pars_fragment:sp,lights_fragment_begin:rp,lights_fragment_maps:ap,lights_fragment_end:op,lightprobes_pars_fragment:lp,logdepthbuf_fragment:cp,logdepthbuf_pars_fragment:hp,logdepthbuf_pars_vertex:up,logdepthbuf_vertex:dp,map_fragment:fp,map_pars_fragment:pp,map_particle_fragment:mp,map_particle_pars_fragment:gp,metalnessmap_fragment:_p,metalnessmap_pars_fragment:xp,morphinstance_vertex:yp,morphcolor_vertex:vp,morphnormal_vertex:Mp,morphtarget_pars_vertex:Sp,morphtarget_vertex:bp,normal_fragment_begin:Ep,normal_fragment_maps:Tp,normal_pars_fragment:wp,normal_pars_vertex:Ap,normal_vertex:Cp,normalmap_pars_fragment:Rp,clearcoat_normal_fragment_begin:Ip,clearcoat_normal_fragment_maps:Pp,clearcoat_pars_fragment:Lp,iridescence_pars_fragment:Dp,opaque_fragment:Np,packing:Up,premultiplied_alpha_fragment:Fp,project_vertex:Op,dithering_fragment:Bp,dithering_pars_fragment:zp,roughnessmap_fragment:kp,roughnessmap_pars_fragment:Vp,shadowmap_pars_fragment:Gp,shadowmap_pars_vertex:Hp,shadowmap_vertex:Wp,shadowmask_pars_fragment:Xp,skinbase_vertex:qp,skinning_pars_vertex:Yp,skinning_vertex:$p,skinnormal_vertex:Zp,specularmap_fragment:Jp,specularmap_pars_fragment:Kp,tonemapping_fragment:jp,tonemapping_pars_fragment:Qp,transmission_fragment:em,transmission_pars_fragment:tm,uv_pars_fragment:nm,uv_pars_vertex:im,uv_vertex:sm,worldpos_vertex:rm,background_vert:am,background_frag:om,backgroundCube_vert:lm,backgroundCube_frag:cm,cube_vert:hm,cube_frag:um,depth_vert:dm,depth_frag:fm,distance_vert:pm,distance_frag:mm,equirect_vert:gm,equirect_frag:_m,linedashed_vert:xm,linedashed_frag:ym,meshbasic_vert:vm,meshbasic_frag:Mm,meshlambert_vert:Sm,meshlambert_frag:bm,meshmatcap_vert:Em,meshmatcap_frag:Tm,meshnormal_vert:wm,meshnormal_frag:Am,meshphong_vert:Cm,meshphong_frag:Rm,meshphysical_vert:Im,meshphysical_frag:Pm,meshtoon_vert:Lm,meshtoon_frag:Dm,points_vert:Nm,points_frag:Um,shadow_vert:Fm,shadow_frag:Om,sprite_vert:Bm,sprite_frag:zm},fe={common:{diffuse:{value:new Fe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new Re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Fe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Fe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new Fe(16777215)},opacity:{value:1},center:{value:new Re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},In={basic:{uniforms:Ut([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.fog]),vertexShader:We.meshbasic_vert,fragmentShader:We.meshbasic_frag},lambert:{uniforms:Ut([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,fe.lights,{emissive:{value:new Fe(0)},envMapIntensity:{value:1}}]),vertexShader:We.meshlambert_vert,fragmentShader:We.meshlambert_frag},phong:{uniforms:Ut([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,fe.lights,{emissive:{value:new Fe(0)},specular:{value:new Fe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:We.meshphong_vert,fragmentShader:We.meshphong_frag},standard:{uniforms:Ut([fe.common,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.roughnessmap,fe.metalnessmap,fe.fog,fe.lights,{emissive:{value:new Fe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag},toon:{uniforms:Ut([fe.common,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.gradientmap,fe.fog,fe.lights,{emissive:{value:new Fe(0)}}]),vertexShader:We.meshtoon_vert,fragmentShader:We.meshtoon_frag},matcap:{uniforms:Ut([fe.common,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,{matcap:{value:null}}]),vertexShader:We.meshmatcap_vert,fragmentShader:We.meshmatcap_frag},points:{uniforms:Ut([fe.points,fe.fog]),vertexShader:We.points_vert,fragmentShader:We.points_frag},dashed:{uniforms:Ut([fe.common,fe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:We.linedashed_vert,fragmentShader:We.linedashed_frag},depth:{uniforms:Ut([fe.common,fe.displacementmap]),vertexShader:We.depth_vert,fragmentShader:We.depth_frag},normal:{uniforms:Ut([fe.common,fe.bumpmap,fe.normalmap,fe.displacementmap,{opacity:{value:1}}]),vertexShader:We.meshnormal_vert,fragmentShader:We.meshnormal_frag},sprite:{uniforms:Ut([fe.sprite,fe.fog]),vertexShader:We.sprite_vert,fragmentShader:We.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:We.background_vert,fragmentShader:We.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:We.backgroundCube_vert,fragmentShader:We.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:We.cube_vert,fragmentShader:We.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:We.equirect_vert,fragmentShader:We.equirect_frag},distance:{uniforms:Ut([fe.common,fe.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:We.distance_vert,fragmentShader:We.distance_frag},shadow:{uniforms:Ut([fe.lights,fe.fog,{color:{value:new Fe(0)},opacity:{value:1}}]),vertexShader:We.shadow_vert,fragmentShader:We.shadow_frag}};In.physical={uniforms:Ut([In.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new Re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new Fe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new Re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new Fe(0)},specularColor:{value:new Fe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new Re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag};var lo={r:0,b:0,g:0},km=new rt,gu=new Be;gu.set(-1,0,0,0,1,0,0,0,1);function Vm(i,e,t,n,s,r){let a=new Fe(0),o=s===!0?0:1,c,l,u=null,m=0,h=null;function p(w){let I=w.isScene===!0?w.background:null;if(I&&I.isTexture){let E=w.backgroundBlurriness>0;I=e.get(I,E)}return I}function x(w){let I=!1,E=p(w);E===null?f(a,o):E&&E.isColor&&(f(E,1),I=!0);let v=i.xr.getEnvironmentBlendMode();v==="additive"?t.buffers.color.setClear(0,0,0,1,r):v==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||I)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function S(w,I){let E=p(I);E&&(E.isCubeTexture||E.mapping===$s)?(l===void 0&&(l=new pt(new rn(1,1,1),new jt({name:"BackgroundCubeMaterial",uniforms:Mi(In.backgroundCube.uniforms),vertexShader:In.backgroundCube.vertexShader,fragmentShader:In.backgroundCube.fragmentShader,side:Vt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(v,M,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=E,l.material.uniforms.backgroundBlurriness.value=I.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=I.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(km.makeRotationFromEuler(I.backgroundRotation)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(gu),l.material.toneMapped=$e.getTransfer(E.colorSpace)!==et,(u!==E||m!==E.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=E,m=E.version,h=i.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new pt(new Bs(2,2),new jt({name:"BackgroundMaterial",uniforms:Mi(In.background.uniforms),vertexShader:In.background.vertexShader,fragmentShader:In.background.fragmentShader,side:An,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=I.backgroundIntensity,c.material.toneMapped=$e.getTransfer(E.colorSpace)!==et,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(u!==E||m!==E.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=E,m=E.version,h=i.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null))}function f(w,I){w.getRGB(lo,Nl(i)),t.buffers.color.setClear(lo.r,lo.g,lo.b,I,r)}function d(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(w,I=1){a.set(w),o=I,f(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(w){o=w,f(a,o)},render:x,addToRenderList:S,dispose:d}}function Gm(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(R,P,U,L,B){let H=!1,X=m(R,L,U,P);r!==X&&(r=X,l(r.object)),H=p(R,L,U,B),H&&x(R,L,U,B),B!==null&&e.update(B,i.ELEMENT_ARRAY_BUFFER),(H||a)&&(a=!1,E(R,P,U,L),B!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function c(){return i.createVertexArray()}function l(R){return i.bindVertexArray(R)}function u(R){return i.deleteVertexArray(R)}function m(R,P,U,L){let B=L.wireframe===!0,H=n[P.id];H===void 0&&(H={},n[P.id]=H);let X=R.isInstancedMesh===!0?R.id:0,Z=H[X];Z===void 0&&(Z={},H[X]=Z);let k=Z[U.id];k===void 0&&(k={},Z[U.id]=k);let $=k[B];return $===void 0&&($=h(c()),k[B]=$),$}function h(R){let P=[],U=[],L=[];for(let B=0;B<t;B++)P[B]=0,U[B]=0,L[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:U,attributeDivisors:L,object:R,attributes:{},index:null}}function p(R,P,U,L){let B=r.attributes,H=P.attributes,X=0,Z=U.getAttributes();for(let k in Z)if(Z[k].location>=0){let ee=B[k],se=H[k];if(se===void 0&&(k==="instanceMatrix"&&R.instanceMatrix&&(se=R.instanceMatrix),k==="instanceColor"&&R.instanceColor&&(se=R.instanceColor)),ee===void 0||ee.attribute!==se||se&&ee.data!==se.data)return!0;X++}return r.attributesNum!==X||r.index!==L}function x(R,P,U,L){let B={},H=P.attributes,X=0,Z=U.getAttributes();for(let k in Z)if(Z[k].location>=0){let ee=H[k];ee===void 0&&(k==="instanceMatrix"&&R.instanceMatrix&&(ee=R.instanceMatrix),k==="instanceColor"&&R.instanceColor&&(ee=R.instanceColor));let se={};se.attribute=ee,ee&&ee.data&&(se.data=ee.data),B[k]=se,X++}r.attributes=B,r.attributesNum=X,r.index=L}function S(){let R=r.newAttributes;for(let P=0,U=R.length;P<U;P++)R[P]=0}function f(R){d(R,0)}function d(R,P){let U=r.newAttributes,L=r.enabledAttributes,B=r.attributeDivisors;U[R]=1,L[R]===0&&(i.enableVertexAttribArray(R),L[R]=1),B[R]!==P&&(i.vertexAttribDivisor(R,P),B[R]=P)}function w(){let R=r.newAttributes,P=r.enabledAttributes;for(let U=0,L=P.length;U<L;U++)P[U]!==R[U]&&(i.disableVertexAttribArray(U),P[U]=0)}function I(R,P,U,L,B,H,X){X===!0?i.vertexAttribIPointer(R,P,U,B,H):i.vertexAttribPointer(R,P,U,L,B,H)}function E(R,P,U,L){S();let B=L.attributes,H=U.getAttributes(),X=P.defaultAttributeValues;for(let Z in H){let k=H[Z];if(k.location>=0){let $=B[Z];if($===void 0&&(Z==="instanceMatrix"&&R.instanceMatrix&&($=R.instanceMatrix),Z==="instanceColor"&&R.instanceColor&&($=R.instanceColor)),$!==void 0){let ee=$.normalized,se=$.itemSize,re=e.get($);if(re===void 0)continue;let Ve=re.buffer,Oe=re.type,Ge=re.bytesPerElement,Y=Oe===i.INT||Oe===i.UNSIGNED_INT||$.gpuType===Sa;if($.isInterleavedBufferAttribute){let j=$.data,ie=j.stride,be=$.offset;if(j.isInstancedInterleavedBuffer){for(let me=0;me<k.locationSize;me++)d(k.location+me,j.meshPerAttribute);R.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let me=0;me<k.locationSize;me++)f(k.location+me);i.bindBuffer(i.ARRAY_BUFFER,Ve);for(let me=0;me<k.locationSize;me++)I(k.location+me,se/k.locationSize,Oe,ee,ie*Ge,(be+se/k.locationSize*me)*Ge,Y)}else{if($.isInstancedBufferAttribute){for(let j=0;j<k.locationSize;j++)d(k.location+j,$.meshPerAttribute);R.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let j=0;j<k.locationSize;j++)f(k.location+j);i.bindBuffer(i.ARRAY_BUFFER,Ve);for(let j=0;j<k.locationSize;j++)I(k.location+j,se/k.locationSize,Oe,ee,se*Ge,se/k.locationSize*j*Ge,Y)}}else if(X!==void 0){let ee=X[Z];if(ee!==void 0)switch(ee.length){case 2:i.vertexAttrib2fv(k.location,ee);break;case 3:i.vertexAttrib3fv(k.location,ee);break;case 4:i.vertexAttrib4fv(k.location,ee);break;default:i.vertexAttrib1fv(k.location,ee)}}}}w()}function v(){_();for(let R in n){let P=n[R];for(let U in P){let L=P[U];for(let B in L){let H=L[B];for(let X in H)u(H[X].object),delete H[X];delete L[B]}}delete n[R]}}function M(R){if(n[R.id]===void 0)return;let P=n[R.id];for(let U in P){let L=P[U];for(let B in L){let H=L[B];for(let X in H)u(H[X].object),delete H[X];delete L[B]}}delete n[R.id]}function A(R){for(let P in n){let U=n[P];for(let L in U){let B=U[L];if(B[R.id]===void 0)continue;let H=B[R.id];for(let X in H)u(H[X].object),delete H[X];delete B[R.id]}}}function g(R){for(let P in n){let U=n[P],L=R.isInstancedMesh===!0?R.id:0,B=U[L];if(B!==void 0){for(let H in B){let X=B[H];for(let Z in X)u(X[Z].object),delete X[Z];delete B[H]}delete U[L],Object.keys(U).length===0&&delete n[P]}}}function _(){T(),a=!0,r!==s&&(r=s,l(r.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:_,resetDefaultState:T,dispose:v,releaseStatesOfGeometry:M,releaseStatesOfObject:g,releaseStatesOfProgram:A,initAttributes:S,enableAttribute:f,disableUnusedAttributes:w}}function Hm(i,e,t){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),t.update(l,n,1)}function a(c,l,u){u!==0&&(i.drawArraysInstanced(n,c,l,u),t.update(l,n,u))}function o(c,l,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,u);let h=0;for(let p=0;p<u;p++)h+=l[p];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Wm(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(A){return!(A!==cn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){let g=A===xn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==$t&&A!==ln&&!g&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(Le("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let m=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&Le("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=i.getParameter(i.MAX_TEXTURE_SIZE),f=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),w=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),I=i.getParameter(i.MAX_VARYING_VECTORS),E=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),v=i.getParameter(i.MAX_SAMPLES),M=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:m,reversedDepthBuffer:h,maxTextures:p,maxVertexTextures:x,maxTextureSize:S,maxCubemapSize:f,maxAttributes:d,maxVertexUniforms:w,maxVaryings:I,maxFragmentUniforms:E,maxSamples:v,samples:M}}function Xm(i){let e=this,t=null,n=0,s=!1,r=!1,a=new pn,o=new Be,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(m,h){let p=m.length!==0||h||n!==0||s;return s=h,n=m.length,p},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(m,h){t=u(m,h,0)},this.setState=function(m,h,p){let x=m.clippingPlanes,S=m.clipIntersection,f=m.clipShadows,d=i.get(m);if(!s||x===null||x.length===0||r&&!f)r?u(null):l();else{let w=r?0:n,I=w*4,E=d.clippingState||null;c.value=E,E=u(x,h,I,p);for(let v=0;v!==I;++v)E[v]=t[v];d.clippingState=E,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=w}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(m,h,p,x){let S=m!==null?m.length:0,f=null;if(S!==0){if(f=c.value,x!==!0||f===null){let d=p+S*4,w=h.matrixWorldInverse;o.getNormalMatrix(w),(f===null||f.length<d)&&(f=new Float32Array(d));for(let I=0,E=p;I!==S;++I,E+=4)a.copy(m[I]).applyMatrix4(w,o),a.normal.toArray(f,E),f[E+3]=a.constant}c.value=f,c.needsUpdate=!0}return e.numPlanes=S,e.numIntersection=0,f}}var rs=4,qm=6,Ym=20,$m=256,ir=new ji,$h=new Fe,Bl=null,zl=0,kl=0,Vl=!1,Zm=new D,Si=new D,ho=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=Zm}=r;Bl=this._renderer.getRenderTarget(),zl=this._renderer.getActiveCubeFace(),kl=this._renderer.getActiveMipmapLevel(),Vl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Kh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Jh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Bl,zl,kl),this._renderer.xr.enabled=Vl,e.scissorTest=!1,ss(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ri||e.mapping===vi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Bl=this._renderer.getRenderTarget(),zl=this._renderer.getActiveCubeFace(),kl=this._renderer.getActiveMipmapLevel(),Vl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ct,minFilter:Ct,generateMipmaps:!1,type:xn,format:cn,colorSpace:Ms,depthBuffer:!1},s=Zh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Zh(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Jm(r)),this._blurMaterial=jm(r,e,t),this._ggxMaterial=Km(r,e,t)}return s}_compileMaterial(e){let t=new pt(new Mt,e);this._renderer.compile(t,ir)}_sceneToCubeUV(e,t,n,s,r){let c=new Nt(90,1,t,n),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],m=this._renderer,h=m.autoClear,p=m.toneMapping;m.getClearColor($h),m.toneMapping=gn,m.autoClear=!1,m.state.buffers.depth.getReversed()&&(m.setRenderTarget(s),m.clearDepth(),m.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new pt(new rn,new _i({name:"PMREM.Background",side:Vt,depthWrite:!1,depthTest:!1})));let S=this._backgroundBox,f=S.material,d=!1,w=e.background;w?w.isColor&&(f.color.copy(w),e.background=null,d=!0):(f.color.copy($h),d=!0);for(let I=0;I<6;I++){let E=I%3;E===0?(c.up.set(0,l[I],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[I],r.y,r.z)):E===1?(c.up.set(0,0,l[I]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[I],r.z)):(c.up.set(0,l[I],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[I]));let v=this._cubeSize;ss(s,E*v,I>2?v:0,v,v),m.setRenderTarget(s),d&&m.render(S,c),m.render(e,c)}m.toneMapping=p,m.autoClear=h,e.background=w}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===ri||e.mapping===vi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Kh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Jh());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let c=this._cubeSize;ss(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,ir)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let c=a.uniforms,l=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),m=Math.sqrt(l*l-u*u),h=l*1.25,p=m*h,{_lodMax:x}=this,S=this._sizeLods[n],f=3*S*(n>x-rs?n-x+rs:0),d=4*(this._cubeSize-S);c.envMap.value=e.texture,c.roughness.value=p,c.mipInt.value=x-t,ss(r,f,d,3*S,2*S),s.setRenderTarget(r),s.render(o,ir),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=x-n,ss(e,f,d,3*S,2*S),s.setRenderTarget(e),s.render(o,ir)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,c=this._lodMeshes[s];c.material=o;let l=o.uniforms;l.envMap.value=e.texture,l.sigma.value=r,l.mipInt.value=this._lodMax-n;let u=this._sizeLods[s],m=3*u*(s>this._lodMax-rs?s-this._lodMax+rs:0),h=4*(this._cubeSize-u);ss(t,m,h,3*u,2*u),a.setRenderTarget(t),a.render(c,ir)}};function Jm(i){let e=[],t=[],n=i,s=i-rs+1+qm;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),c=-o,l=1+o,u=[c,c,l,c,l,l,c,c,l,l,c,l],m=6,h=6,p=3,x=new Float32Array(p*h*m),S=new Float32Array(p*h*m);for(let d=0;d<m;d++){let w=d%3*2/3-1,I=d>2?0:-1,E=[w,I,0,w+2/3,I,0,w+2/3,I+1,0,w,I,0,w+2/3,I+1,0,w,I+1,0];x.set(E,p*h*d);for(let v=0;v<h;v++){let M=u[v*2]*2-1,A=u[v*2+1]*2-1;d===0?Si.set(1,A,M):d===1?Si.set(-M,1,-A):d===2?Si.set(-M,A,1):d===3?Si.set(-1,A,-M):d===4?Si.set(-M,-1,A):Si.set(M,A,-1),Si.toArray(S,(d*h+v)*p)}}let f=new Mt;f.setAttribute("position",new Kt(x,p)),f.setAttribute("outputDirection",new Kt(S,p)),t.push(new pt(f,null)),n>rs&&n--}return{lodMeshes:t,sizeLods:e}}function Zh(i,e,t){let n=new Yt(i,e,t);return n.texture.mapping=$s,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ss(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Km(i,e,t){return new jt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:$m,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:po(),fragmentShader:`

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
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function jm(i,e,t){return new jt({name:"SphericalGaussianBlur",defines:{SAMPLES:Ym,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:po(),fragmentShader:`

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
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function Jh(){return new jt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:po(),fragmentShader:`

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
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function Kh(){return new jt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:po(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Cn,depthTest:!1,depthWrite:!1})}function po(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var uo=class extends Yt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Ls(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new rn(5,5,5),r=new jt({name:"CubemapFromEquirect",uniforms:Mi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Vt,blending:Cn});r.uniforms.tEquirect.value=t;let a=new pt(s,r),o=t.minFilter;return t.minFilter===ai&&(t.minFilter=Ct),new ma(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function Qm(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,p=!1){return h==null?null:p?a(h):r(h)}function r(h){if(h&&h.isTexture){let p=h.mapping;if(p===ya||p===va)if(e.has(h)){let x=e.get(h).texture;return o(x,h.mapping)}else{let x=h.image;if(x&&x.height>0){let S=new uo(x.height);return S.fromEquirectangularTexture(i,h),e.set(h,S),h.addEventListener("dispose",l),o(S.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let p=h.mapping,x=p===ya||p===va,S=p===ri||p===vi;if(x||S){let f=t.get(h),d=f!==void 0?f.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==d)return n===null&&(n=new ho(i)),f=x?n.fromEquirectangular(h,f):n.fromCubemap(h,f),f.texture.pmremVersion=h.pmremVersion,t.set(h,f),f.texture;if(f!==void 0)return f.texture;{let w=h.image;return x&&w&&w.height>0||S&&w&&c(w)?(n===null&&(n=new ho(i)),f=x?n.fromEquirectangular(h):n.fromCubemap(h),f.texture.pmremVersion=h.pmremVersion,t.set(h,f),h.addEventListener("dispose",u),f.texture):null}}}return h}function o(h,p){return p===ya?h.mapping=ri:p===va&&(h.mapping=vi),h}function c(h){let p=0,x=6;for(let S=0;S<x;S++)h[S]!==void 0&&p++;return p===x}function l(h){let p=h.target;p.removeEventListener("dispose",l);let x=e.get(p);x!==void 0&&(e.delete(p),x.dispose())}function u(h){let p=h.target;p.removeEventListener("dispose",u);let x=t.get(p);x!==void 0&&(t.delete(p),x.dispose())}function m(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:m}}function eg(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&gi("WebGLRenderer: "+n+" extension not supported."),s}}}function tg(i,e,t,n){let s={},r=new WeakMap;function a(m){let h=m.target;h.index!==null&&e.remove(h.index);for(let x in h.attributes)e.remove(h.attributes[x]);h.removeEventListener("dispose",a),delete s[h.id];let p=r.get(h);p&&(e.remove(p),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(m,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,t.memory.geometries++),h}function c(m){let h=m.attributes;for(let p in h)e.update(h[p],i.ARRAY_BUFFER)}function l(m){let h=[],p=m.index,x=m.attributes.position,S=0;if(x===void 0)return;if(p!==null){let w=p.array;S=p.version;for(let I=0,E=w.length;I<E;I+=3){let v=w[I+0],M=w[I+1],A=w[I+2];h.push(v,M,M,A,A,v)}}else{let w=x.array;S=x.version;for(let I=0,E=w.length/3-1;I<E;I+=3){let v=I+0,M=I+1,A=I+2;h.push(v,M,M,A,A,v)}}let f=new(x.count>=65535?Cs:As)(h,1);f.version=S;let d=r.get(m);d&&e.remove(d),r.set(m,f)}function u(m){let h=r.get(m);if(h){let p=m.index;p!==null&&h.version<p.version&&l(m)}else l(m);return r.get(m)}return{get:o,update:c,getWireframeAttribute:u}}function ng(i,e,t){let n;function s(m){n=m}let r,a;function o(m){r=m.type,a=m.bytesPerElement}function c(m,h){i.drawElements(n,h,r,m*a),t.update(h,n,1)}function l(m,h,p){p!==0&&(i.drawElementsInstanced(n,h,r,m*a,p),t.update(h,n,p))}function u(m,h,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,m,0,p);let S=0;for(let f=0;f<p;f++)S+=h[f];t.update(S,n,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function ig(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Ue("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function sg(i,e,t){let n=new WeakMap,s=new dt;function r(a,o,c){let l=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,m=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==m){let _=function(){A.dispose(),n.delete(o),o.removeEventListener("dispose",_)};h!==void 0&&h.texture.dispose();let p=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,S=o.morphAttributes.color!==void 0,f=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],w=o.morphAttributes.color||[],I=0;p===!0&&(I=1),x===!0&&(I=2),S===!0&&(I=3);let E=o.attributes.position.count*I,v=1;E>e.maxTextureSize&&(v=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);let M=new Float32Array(E*v*4*m),A=new Es(M,E,v,m);A.type=ln,A.needsUpdate=!0;let g=I*4;for(let T=0;T<m;T++){let R=f[T],P=d[T],U=w[T],L=E*v*4*T;for(let B=0;B<R.count;B++){let H=B*g;p===!0&&(s.fromBufferAttribute(R,B),M[L+H+0]=s.x,M[L+H+1]=s.y,M[L+H+2]=s.z,M[L+H+3]=0),x===!0&&(s.fromBufferAttribute(P,B),M[L+H+4]=s.x,M[L+H+5]=s.y,M[L+H+6]=s.z,M[L+H+7]=0),S===!0&&(s.fromBufferAttribute(U,B),M[L+H+8]=s.x,M[L+H+9]=s.y,M[L+H+10]=s.z,M[L+H+11]=U.itemSize===4?s.w:1)}}h={count:m,texture:A,size:new Re(E,v)},n.set(o,h),o.addEventListener("dispose",_)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let S=0;S<l.length;S++)p+=l[S];let x=o.morphTargetsRelative?1:1-p;c.getUniforms().setValue(i,"morphTargetBaseInfluence",x),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function rg(i,e,t,n,s){let r=new WeakMap;function a(l){let u=s.render.frame,m=l.geometry,h=e.get(l,m);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){let p=l.skeleton;r.get(p)!==u&&(p.update(),r.set(p,u))}return h}function o(){r=new WeakMap}function c(l){let u=l.target;u.removeEventListener("dispose",c),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}var ag={[gl]:"LINEAR_TONE_MAPPING",[_l]:"REINHARD_TONE_MAPPING",[xl]:"CINEON_TONE_MAPPING",[Ys]:"ACES_FILMIC_TONE_MAPPING",[vl]:"AGX_TONE_MAPPING",[Ml]:"NEUTRAL_TONE_MAPPING",[yl]:"CUSTOM_TONE_MAPPING"};function og(i,e,t,n,s,r){let a=new Yt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,c=null,l=new Mt;l.setAttribute("position",new Je([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new Je([0,2,0,0,2,0],2));let u=new ta({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),m=new pt(l,u),h=new ji(-1,1,1,-1,0,1),p=null,x=null,S=!1,f,d=null,w=[],I=!1;this.setSize=function(E,v){a.setSize(E,v),o!==null&&o.setSize(E,v),c!==null&&c.setSize(E,v);for(let M=0;M<w.length;M++){let A=w[M];A.setSize&&A.setSize(E,v)}},this.setEffects=function(E){w=E,I=w.length>0&&w[0].isRenderPass===!0;let v=a.width,M=a.height;w.length>0&&o===null&&(o=new Yt(v,M,{type:xn,depthBuffer:!1,stencilBuffer:!1}),c=new Yt(v,M,{type:xn,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<w.length;A++){let g=w[A];g.setSize&&g.setSize(v,M)}},this.begin=function(E,v){if(S||E.toneMapping===gn&&w.length===0)return!1;if(d=v,v!==null){let M=v.width,A=v.height;(a.width!==M||a.height!==A)&&this.setSize(M,A)}return I===!1&&E.setRenderTarget(a),f=E.toneMapping,E.toneMapping=gn,!0},this.hasRenderPass=function(){return I},this.end=function(E,v){E.toneMapping=f,S=!0;let M=a,A=o;for(let g=0;g<w.length;g++){let _=w[g];_.enabled!==!1&&(_.render(E,A,M,v),_.needsSwap!==!1&&(M=A,A=A===o?c:o))}if(p!==E.outputColorSpace||x!==E.toneMapping){p=E.outputColorSpace,x=E.toneMapping,u.defines={},$e.getTransfer(p)===et&&(u.defines.SRGB_TRANSFER="");let g=ag[x];g&&(u.defines[g]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=M.texture,E.setRenderTarget(d),E.render(m,h),d=null,S=!1},this.isCompositing=function(){return S},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var _u=new qt,Wl=new ei(1,1),xu=new Es,yu=new qr,vu=new Ls,jh=[],Qh=[],eu=new Float32Array(16),tu=new Float32Array(9),nu=new Float32Array(4);function os(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=jh[s];if(r===void 0&&(r=new Float32Array(s),jh[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function St(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function bt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function mo(i,e){let t=Qh[e];t===void 0&&(t=new Int32Array(e),Qh[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function lg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function cg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2fv(this.addr,e),bt(t,e)}}function hg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(St(t,e))return;i.uniform3fv(this.addr,e),bt(t,e)}}function ug(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4fv(this.addr,e),bt(t,e)}}function dg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),bt(t,e)}else{if(St(t,n))return;nu.set(n),i.uniformMatrix2fv(this.addr,!1,nu),bt(t,n)}}function fg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),bt(t,e)}else{if(St(t,n))return;tu.set(n),i.uniformMatrix3fv(this.addr,!1,tu),bt(t,n)}}function pg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),bt(t,e)}else{if(St(t,n))return;eu.set(n),i.uniformMatrix4fv(this.addr,!1,eu),bt(t,n)}}function mg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function gg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2iv(this.addr,e),bt(t,e)}}function _g(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(St(t,e))return;i.uniform3iv(this.addr,e),bt(t,e)}}function xg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4iv(this.addr,e),bt(t,e)}}function yg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function vg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2uiv(this.addr,e),bt(t,e)}}function Mg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(St(t,e))return;i.uniform3uiv(this.addr,e),bt(t,e)}}function Sg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4uiv(this.addr,e),bt(t,e)}}function bg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Wl.compareFunction=t.isReversedDepthBuffer()?ao:ro,r=Wl):r=_u,t.setTexture2D(e||r,s)}function Eg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||yu,s)}function Tg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||vu,s)}function wg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||xu,s)}function Ag(i){switch(i){case 5126:return lg;case 35664:return cg;case 35665:return hg;case 35666:return ug;case 35674:return dg;case 35675:return fg;case 35676:return pg;case 5124:case 35670:return mg;case 35667:case 35671:return gg;case 35668:case 35672:return _g;case 35669:case 35673:return xg;case 5125:return yg;case 36294:return vg;case 36295:return Mg;case 36296:return Sg;case 35678:case 36198:case 36298:case 36306:case 35682:return bg;case 35679:case 36299:case 36307:return Eg;case 35680:case 36300:case 36308:case 36293:return Tg;case 36289:case 36303:case 36311:case 36292:return wg}}function Cg(i,e){i.uniform1fv(this.addr,e)}function Rg(i,e){let t=os(e,this.size,2);i.uniform2fv(this.addr,t)}function Ig(i,e){let t=os(e,this.size,3);i.uniform3fv(this.addr,t)}function Pg(i,e){let t=os(e,this.size,4);i.uniform4fv(this.addr,t)}function Lg(i,e){let t=os(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Dg(i,e){let t=os(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Ng(i,e){let t=os(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Ug(i,e){i.uniform1iv(this.addr,e)}function Fg(i,e){i.uniform2iv(this.addr,e)}function Og(i,e){i.uniform3iv(this.addr,e)}function Bg(i,e){i.uniform4iv(this.addr,e)}function zg(i,e){i.uniform1uiv(this.addr,e)}function kg(i,e){i.uniform2uiv(this.addr,e)}function Vg(i,e){i.uniform3uiv(this.addr,e)}function Gg(i,e){i.uniform4uiv(this.addr,e)}function Hg(i,e,t){let n=this.cache,s=e.length,r=mo(t,s);St(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Wl:a=_u;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Wg(i,e,t){let n=this.cache,s=e.length,r=mo(t,s);St(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||yu,r[a])}function Xg(i,e,t){let n=this.cache,s=e.length,r=mo(t,s);St(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||vu,r[a])}function qg(i,e,t){let n=this.cache,s=e.length,r=mo(t,s);St(n,r)||(i.uniform1iv(this.addr,r),bt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||xu,r[a])}function Yg(i){switch(i){case 5126:return Cg;case 35664:return Rg;case 35665:return Ig;case 35666:return Pg;case 35674:return Lg;case 35675:return Dg;case 35676:return Ng;case 5124:case 35670:return Ug;case 35667:case 35671:return Fg;case 35668:case 35672:return Og;case 35669:case 35673:return Bg;case 5125:return zg;case 36294:return kg;case 36295:return Vg;case 36296:return Gg;case 35678:case 36198:case 36298:case 36306:case 35682:return Hg;case 35679:case 36299:case 36307:return Wg;case 35680:case 36300:case 36308:case 36293:return Xg;case 36289:case 36303:case 36311:case 36292:return qg}}var Xl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Ag(t.type)}},ql=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Yg(t.type)}},Yl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Gl=/(\w+)(\])?(\[|\.)?/g;function iu(i,e){i.seq.push(e),i.map[e.id]=e}function $g(i,e,t){let n=i.name,s=n.length;for(Gl.lastIndex=0;;){let r=Gl.exec(n),a=Gl.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){iu(t,l===void 0?new Xl(o,i,e):new ql(o,i,e));break}else{let m=t.map[o];m===void 0&&(m=new Yl(o),iu(t,m)),t=m}}}var as=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);$g(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function su(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Zg=37297,Jg=0;function Kg(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var ru=new Be;function jg(i){$e._getMatrix(ru,$e.workingColorSpace,i);let e=`mat3( ${ru.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(i)){case Ss:return[e,"LinearTransferOETF"];case et:return[e,"sRGBTransferOETF"];default:return Le("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function au(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Kg(i.getShaderSource(e),o)}else return r}function Qg(i,e){let t=jg(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var e0={[gl]:"Linear",[_l]:"Reinhard",[xl]:"Cineon",[Ys]:"ACESFilmic",[vl]:"AgX",[Ml]:"Neutral",[yl]:"Custom"};function t0(i,e){let t=e0[e];return t===void 0?(Le("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var co=new D;function n0(){$e.getLuminanceCoefficients(co);let i=co.x.toFixed(4),e=co.y.toFixed(4),t=co.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function i0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(rr).join(`
`)}function s0(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function r0(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function rr(i){return i!==""}function ou(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function lu(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var a0=/^[ \t]*#include +<([\w\d./]+)>/gm;function $l(i){return i.replace(a0,l0)}var o0=new Map;function l0(i,e){let t=We[e];if(t===void 0){let n=o0.get(e);if(n!==void 0)t=We[n],Le('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return $l(t)}var c0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function cu(i){return i.replace(c0,h0)}function h0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function hu(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var u0={[qs]:"SHADOWMAP_TYPE_PCF",[Qi]:"SHADOWMAP_TYPE_VSM"};function d0(i){return u0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var f0={[ri]:"ENVMAP_TYPE_CUBE",[vi]:"ENVMAP_TYPE_CUBE",[$s]:"ENVMAP_TYPE_CUBE_UV"};function p0(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":f0[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var m0={[vi]:"ENVMAP_MODE_REFRACTION"};function g0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":m0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var _0={[xa]:"ENVMAP_BLENDING_MULTIPLY",[Ah]:"ENVMAP_BLENDING_MIX",[Ch]:"ENVMAP_BLENDING_ADD"};function x0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":_0[i.combine]||"ENVMAP_BLENDING_NONE"}function y0(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function v0(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,c=d0(t),l=p0(t),u=g0(t),m=x0(t),h=y0(t),p=i0(t),x=s0(r),S=s.createProgram(),f,d,w=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(rr).join(`
`),f.length>0&&(f+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(rr).join(`
`),d.length>0&&(d+=`
`)):(f=[hu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(rr).join(`
`),d=[hu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+m:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==gn?"#define TONE_MAPPING":"",t.toneMapping!==gn?We.tonemapping_pars_fragment:"",t.toneMapping!==gn?t0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",We.colorspace_pars_fragment,Qg("linearToOutputTexel",t.outputColorSpace),n0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(rr).join(`
`)),a=$l(a),a=ou(a,t),a=lu(a,t),o=$l(o),o=ou(o,t),o=lu(o,t),a=cu(a),o=cu(o),t.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,f=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,d=["#define varying in",t.glslVersion===Rl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Rl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let I=w+f+a,E=w+d+o,v=su(s,s.VERTEX_SHADER,I),M=su(s,s.FRAGMENT_SHADER,E);s.attachShader(S,v),s.attachShader(S,M),t.index0AttributeName!==void 0?s.bindAttribLocation(S,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(S,0,"position"),s.linkProgram(S);function A(R){if(i.debug.checkShaderErrors){let P=s.getProgramInfoLog(S)||"",U=s.getShaderInfoLog(v)||"",L=s.getShaderInfoLog(M)||"",B=P.trim(),H=U.trim(),X=L.trim(),Z=!0,k=!0;if(s.getProgramParameter(S,s.LINK_STATUS)===!1)if(Z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,S,v,M);else{let $=au(s,v,"vertex"),ee=au(s,M,"fragment");Ue("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(S,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+B+`
`+$+`
`+ee)}else B!==""?Le("WebGLProgram: Program Info Log:",B):(H===""||X==="")&&(k=!1);k&&(R.diagnostics={runnable:Z,programLog:B,vertexShader:{log:H,prefix:f},fragmentShader:{log:X,prefix:d}})}s.deleteShader(v),s.deleteShader(M),g=new as(s,S),_=r0(s,S)}let g;this.getUniforms=function(){return g===void 0&&A(this),g};let _;this.getAttributes=function(){return _===void 0&&A(this),_};let T=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=s.getProgramParameter(S,Zg)),T},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(S),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Jg++,this.cacheKey=e,this.usedTimes=1,this.program=S,this.vertexShader=v,this.fragmentShader=M,this}var M0=0,Zl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Jl(e),t.set(e,n)),n}},Jl=class{constructor(e){this.id=M0++,this.code=e,this.usedTimes=0}};function S0(i){return i===li||i===er||i===tr}function b0(i,e,t,n,s,r){let a=new Yi,o=new Zl,c=new Set,l=[],u=new Map,m=n.logarithmicDepthBuffer,h=n.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(g){return c.add(g),g===0?"uv":`uv${g}`}function S(g,_,T,R,P,U){let L=R.fog,B=P.geometry,H=g.isMeshStandardMaterial||g.isMeshLambertMaterial||g.isMeshPhongMaterial?R.environment:null,X=g.isMeshStandardMaterial||g.isMeshLambertMaterial&&!g.envMap||g.isMeshPhongMaterial&&!g.envMap,Z=e.get(g.envMap||H,X),k=Z&&Z.mapping===$s?Z.image.height:null,$=p[g.type];g.precision!==null&&(h=n.getMaxPrecision(g.precision),h!==g.precision&&Le("WebGLProgram.getParameters:",g.precision,"not supported, using",h,"instead."));let ee=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,se=ee!==void 0?ee.length:0,re=0;B.morphAttributes.position!==void 0&&(re=1),B.morphAttributes.normal!==void 0&&(re=2),B.morphAttributes.color!==void 0&&(re=3);let Ve,Oe,Ge,Y;if($){let ot=In[$];Ve=ot.vertexShader,Oe=ot.fragmentShader}else{Ve=g.vertexShader,Oe=g.fragmentShader;let ot=o.getVertexShaderStage(g),je=o.getFragmentShaderStage(g);o.update(g,ot,je),Ge=ot.id,Y=je.id}let j=i.getRenderTarget(),ie=i.state.buffers.depth.getReversed(),be=P.isInstancedMesh===!0,me=P.isBatchedMesh===!0,De=!!g.map,Ne=!!g.matcap,Ie=!!Z,Ye=!!g.aoMap,it=!!g.lightMap,ze=!!g.bumpMap&&g.wireframe===!1,ut=!!g.normalMap,Et=!!g.displacementMap,Xt=!!g.emissiveMap,ft=!!g.metalnessMap,gt=!!g.roughnessMap,O=g.anisotropy>0,It=g.clearcoat>0,tt=g.dispersion>0,C=g.retroreflectivity>0,y=g.iridescence>0,z=g.sheen>0,W=g.transmission>0,J=O&&!!g.anisotropyMap,ae=It&&!!g.clearcoatMap,oe=It&&!!g.clearcoatNormalMap,K=It&&!!g.clearcoatRoughnessMap,te=y&&!!g.iridescenceMap,le=y&&!!g.iridescenceThicknessMap,we=z&&!!g.sheenColorMap,de=z&&!!g.sheenRoughnessMap,ce=!!g.specularMap,Ae=!!g.specularColorMap,Pe=!!g.specularIntensityMap,ke=W&&!!g.transmissionMap,F=W&&!!g.thicknessMap,he=!!g.gradientMap,Q=!!g.alphaMap,ue=g.alphaTest>0,xe=!!g.alphaHash,ne=!!g.extensions,Ce=gn;g.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Ce=i.toneMapping);let Ee={shaderID:$,shaderType:g.type,shaderName:g.name,vertexShader:Ve,fragmentShader:Oe,defines:g.defines,customVertexShaderID:Ge,customFragmentShaderID:Y,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:h,batching:me,batchingColor:me&&P._colorsTexture!==null,instancing:be,instancingColor:be&&P.instanceColor!==null,instancingMorph:be&&P.morphTexture!==null,outputColorSpace:j===null?i.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:$e.workingColorSpace,alphaToCoverage:!!g.alphaToCoverage,map:De,matcap:Ne,envMap:Ie,envMapMode:Ie&&Z.mapping,envMapCubeUVHeight:k,aoMap:Ye,lightMap:it,bumpMap:ze,normalMap:ut,displacementMap:Et,emissiveMap:Xt,normalMapObjectSpace:ut&&g.normalMapType===Ph,normalMapTangentSpace:ut&&g.normalMapType===nr,packedNormalMap:ut&&g.normalMapType===nr&&S0(g.normalMap.format),metalnessMap:ft,roughnessMap:gt,anisotropy:O,anisotropyMap:J,clearcoat:It,clearcoatMap:ae,clearcoatNormalMap:oe,clearcoatRoughnessMap:K,dispersion:tt,retroreflection:C,iridescence:y,iridescenceMap:te,iridescenceThicknessMap:le,sheen:z,sheenColorMap:we,sheenRoughnessMap:de,specularMap:ce,specularColorMap:Ae,specularIntensityMap:Pe,transmission:W,transmissionMap:ke,thicknessMap:F,gradientMap:he,opaque:g.transparent===!1&&g.blending===es&&g.alphaToCoverage===!1,alphaMap:Q,alphaTest:ue,alphaHash:xe,combine:g.combine,mapUv:De&&x(g.map.channel),aoMapUv:Ye&&x(g.aoMap.channel),lightMapUv:it&&x(g.lightMap.channel),bumpMapUv:ze&&x(g.bumpMap.channel),normalMapUv:ut&&x(g.normalMap.channel),displacementMapUv:Et&&x(g.displacementMap.channel),emissiveMapUv:Xt&&x(g.emissiveMap.channel),metalnessMapUv:ft&&x(g.metalnessMap.channel),roughnessMapUv:gt&&x(g.roughnessMap.channel),anisotropyMapUv:J&&x(g.anisotropyMap.channel),clearcoatMapUv:ae&&x(g.clearcoatMap.channel),clearcoatNormalMapUv:oe&&x(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:K&&x(g.clearcoatRoughnessMap.channel),iridescenceMapUv:te&&x(g.iridescenceMap.channel),iridescenceThicknessMapUv:le&&x(g.iridescenceThicknessMap.channel),sheenColorMapUv:we&&x(g.sheenColorMap.channel),sheenRoughnessMapUv:de&&x(g.sheenRoughnessMap.channel),specularMapUv:ce&&x(g.specularMap.channel),specularColorMapUv:Ae&&x(g.specularColorMap.channel),specularIntensityMapUv:Pe&&x(g.specularIntensityMap.channel),transmissionMapUv:ke&&x(g.transmissionMap.channel),thicknessMapUv:F&&x(g.thicknessMap.channel),alphaMapUv:Q&&x(g.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(ut||O),vertexNormals:!!B.attributes.normal,vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!B.attributes.uv&&(De||Q),fog:!!L,useFog:g.fog===!0,fogExp2:!!L&&L.isFogExp2,flatShading:g.wireframe===!1&&(g.flatShading===!0||B.attributes.normal===void 0&&ut===!1&&(g.isMeshLambertMaterial||g.isMeshPhongMaterial||g.isMeshStandardMaterial||g.isMeshPhysicalMaterial)),sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:m,reversedDepthBuffer:ie,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:se,morphTextureStride:re,numSunLights:_.sun.length,numDirLights:_.directional.length,numPointLights:_.point.length,numSpotLights:_.spot.length,numSpotLightMaps:_.spotLightMap.length,numRectAreaLights:_.rectArea.length,numHemiLights:_.hemi.length,numSunLightShadows:_.sunShadowMap.length,numDirLightShadows:_.directionalShadowMap.length,numPointLightShadows:_.pointShadowMap.length,numSpotLightShadows:_.spotShadowMap.length,numSpotLightShadowsWithMaps:_.numSpotLightShadowsWithMaps,numLightProbes:_.numLightProbes,numLightProbeGrids:U.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:g.dithering,shadowMapEnabled:i.shadowMap.enabled&&T.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ce,decodeVideoTexture:De&&g.map.isVideoTexture===!0&&$e.getTransfer(g.map.colorSpace)===et,decodeVideoTextureEmissive:Xt&&g.emissiveMap.isVideoTexture===!0&&$e.getTransfer(g.emissiveMap.colorSpace)===et,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===Gt,flipSided:g.side===Vt,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:ne&&g.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ne&&g.extensions.multiDraw===!0||me)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return Ee.vertexUv1s=c.has(1),Ee.vertexUv2s=c.has(2),Ee.vertexUv3s=c.has(3),c.clear(),Ee}function f(g){let _=[];if(g.shaderID?_.push(g.shaderID):(_.push(g.customVertexShaderID),_.push(g.customFragmentShaderID)),g.defines!==void 0)for(let T in g.defines)_.push(T),_.push(g.defines[T]);return g.isRawShaderMaterial===!1&&(d(_,g),w(_,g),_.push(i.outputColorSpace)),_.push(g.customProgramCacheKey),_.join()}function d(g,_){g.push(_.precision),g.push(_.outputColorSpace),g.push(_.envMapMode),g.push(_.envMapCubeUVHeight),g.push(_.mapUv),g.push(_.alphaMapUv),g.push(_.lightMapUv),g.push(_.aoMapUv),g.push(_.bumpMapUv),g.push(_.normalMapUv),g.push(_.displacementMapUv),g.push(_.emissiveMapUv),g.push(_.metalnessMapUv),g.push(_.roughnessMapUv),g.push(_.anisotropyMapUv),g.push(_.clearcoatMapUv),g.push(_.clearcoatNormalMapUv),g.push(_.clearcoatRoughnessMapUv),g.push(_.iridescenceMapUv),g.push(_.iridescenceThicknessMapUv),g.push(_.sheenColorMapUv),g.push(_.sheenRoughnessMapUv),g.push(_.specularMapUv),g.push(_.specularColorMapUv),g.push(_.specularIntensityMapUv),g.push(_.transmissionMapUv),g.push(_.thicknessMapUv),g.push(_.combine),g.push(_.fogExp2),g.push(_.sizeAttenuation),g.push(_.morphTargetsCount),g.push(_.morphAttributeCount),g.push(_.numSunLights),g.push(_.numDirLights),g.push(_.numPointLights),g.push(_.numSpotLights),g.push(_.numSpotLightMaps),g.push(_.numHemiLights),g.push(_.numRectAreaLights),g.push(_.numSunLightShadows),g.push(_.numDirLightShadows),g.push(_.numPointLightShadows),g.push(_.numSpotLightShadows),g.push(_.numSpotLightShadowsWithMaps),g.push(_.numLightProbes),g.push(_.shadowMapType),g.push(_.toneMapping),g.push(_.numClippingPlanes),g.push(_.numClipIntersection),g.push(_.depthPacking)}function w(g,_){a.disableAll(),_.instancing&&a.enable(0),_.instancingColor&&a.enable(1),_.instancingMorph&&a.enable(2),_.matcap&&a.enable(3),_.envMap&&a.enable(4),_.normalMapObjectSpace&&a.enable(5),_.normalMapTangentSpace&&a.enable(6),_.clearcoat&&a.enable(7),_.iridescence&&a.enable(8),_.alphaTest&&a.enable(9),_.vertexColors&&a.enable(10),_.vertexAlphas&&a.enable(11),_.vertexUv1s&&a.enable(12),_.vertexUv2s&&a.enable(13),_.vertexUv3s&&a.enable(14),_.vertexTangents&&a.enable(15),_.anisotropy&&a.enable(16),_.alphaHash&&a.enable(17),_.batching&&a.enable(18),_.dispersion&&a.enable(19),_.retroreflection&&a.enable(24),_.batchingColor&&a.enable(20),_.gradientMap&&a.enable(21),_.packedNormalMap&&a.enable(22),_.vertexNormals&&a.enable(23),g.push(a.mask),a.disableAll(),_.fog&&a.enable(0),_.useFog&&a.enable(1),_.flatShading&&a.enable(2),_.logarithmicDepthBuffer&&a.enable(3),_.reversedDepthBuffer&&a.enable(4),_.skinning&&a.enable(5),_.morphTargets&&a.enable(6),_.morphNormals&&a.enable(7),_.morphColors&&a.enable(8),_.premultipliedAlpha&&a.enable(9),_.shadowMapEnabled&&a.enable(10),_.doubleSided&&a.enable(11),_.flipSided&&a.enable(12),_.useDepthPacking&&a.enable(13),_.dithering&&a.enable(14),_.transmission&&a.enable(15),_.sheen&&a.enable(16),_.opaque&&a.enable(17),_.pointsUvs&&a.enable(18),_.decodeVideoTexture&&a.enable(19),_.decodeVideoTextureEmissive&&a.enable(20),_.alphaToCoverage&&a.enable(21),_.numLightProbeGrids>0&&a.enable(22),_.hasPositionAttribute&&a.enable(23),g.push(a.mask)}function I(g){let _=p[g.type],T;if(_){let R=In[_];T=Xh.clone(R.uniforms)}else T=g.uniforms;return T}function E(g,_){let T=u.get(_);return T!==void 0?++T.usedTimes:(T=new v0(i,_,g,s),l.push(T),u.set(_,T)),T}function v(g){if(--g.usedTimes===0){let _=l.indexOf(g);l[_]=l[l.length-1],l.pop(),u.delete(g.cacheKey),g.destroy()}}function M(g){o.remove(g)}function A(){o.dispose()}return{getParameters:S,getProgramCacheKey:f,getUniforms:I,acquireProgram:E,releaseProgram:v,releaseShaderCache:M,programs:l,dispose:A}}function E0(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function T0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function uu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function du(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h){let p=0;return h.isInstancedMesh&&(p+=2),h.isSkinnedMesh&&(p+=1),p}function o(h,p,x,S,f,d){let w=i[e];return w===void 0?(w={id:h.id,object:h,geometry:p,material:x,materialVariant:a(h),groupOrder:S,renderOrder:h.renderOrder,z:f,group:d},i[e]=w):(w.id=h.id,w.object=h,w.geometry=p,w.material=x,w.materialVariant=a(h),w.groupOrder=S,w.renderOrder=h.renderOrder,w.z=f,w.group=d),e++,w}function c(h,p,x,S,f,d,w){w.reversedDepth===!0&&(f=-f);let I=o(h,p,x,S,f,d);x.transmission>0?n.push(I):x.transparent===!0?s.push(I):t.push(I)}function l(h,p,x,S,f,d){let w=o(h,p,x,S,f,d);x.transmission>0?n.unshift(w):x.transparent===!0?s.unshift(w):t.unshift(w)}function u(h,p){t.length>1&&t.sort(h||T0),n.length>1&&n.sort(p||uu),s.length>1&&s.sort(p||uu)}function m(){for(let h=e,p=i.length;h<p;h++){let x=i[h];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:m,sort:u}}function w0(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new du,i.set(n,[a])):s>=r.length?(a=new du,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function A0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new D,color:new Fe};break;case"SpotLight":t={position:new D,direction:new D,color:new Fe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Fe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Fe,groundColor:new Fe};break;case"RectAreaLight":t={color:new Fe,position:new D,halfWidth:new D,halfHeight:new D};break}return i[e.id]=t,t}}}function C0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var R0=0;function I0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function P0(i){let e=new A0,t=C0(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new D);let s=new D,r=new rt,a=new rt;function o(l){let u=0,m=0,h=0;for(let P=0;P<9;P++)n.probe[P].set(0,0,0);let p=0,x=0,S=0,f=0,d=0,w=0,I=0,E=0,v=0,M=0,A=0,g=0,_=0,T=0;l.sort(I0);for(let P=0,U=l.length;P<U;P++){let L=l[P],B=L.color,H=L.intensity,X=L.distance,Z=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===li?Z=L.shadow.map.texture:Z=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)u+=B.r*H,m+=B.g*H,h+=B.b*H;else if(L.isLightProbe){for(let k=0;k<9;k++)n.probe[k].addScaledVector(L.sh.coefficients[k],H);T++}else if(L.isSunLight){let k=e.get(L);if(k.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let $=L.shadow,ee=t.get(L);ee.shadowIntensity=$.intensity,ee.shadowBias=$.bias,ee.shadowNormalBias=$.normalBias,ee.shadowRadius=$.radius,ee.shadowMapSize.copy($.mapSize).multiply($.getFrameExtents()),n.sunShadow[x]=ee,n.sunShadowMap[x]=Z;let se=$.getViewportCount();for(let re=0;re<se;re++)n.sunShadowMatrix[S+re]=$.getMatrix(re),n.sunShadowCascade[S+re]=$._cascadeData[re];S+=se,x++}n.sun[p]=k,p++}else if(L.isDirectionalLight){let k=e.get(L);if(k.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let $=L.shadow,ee=t.get(L);ee.shadowIntensity=$.intensity,ee.shadowBias=$.bias,ee.shadowNormalBias=$.normalBias,ee.shadowRadius=$.radius,ee.shadowMapSize=$.mapSize,n.directionalShadow[f]=ee,n.directionalShadowMap[f]=Z,n.directionalShadowMatrix[f]=L.shadow.matrix,v++}n.directional[f]=k,f++}else if(L.isSpotLight){let k=e.get(L);k.position.setFromMatrixPosition(L.matrixWorld),k.color.copy(B).multiplyScalar(H),k.distance=X,k.coneCos=Math.cos(L.angle),k.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),k.decay=L.decay,n.spot[w]=k;let $=L.shadow;if(L.map&&(n.spotLightMap[g]=L.map,g++,$.updateMatrices(L),L.castShadow&&_++),n.spotLightMatrix[w]=$.matrix,L.castShadow){let ee=t.get(L);ee.shadowIntensity=$.intensity,ee.shadowBias=$.bias,ee.shadowNormalBias=$.normalBias,ee.shadowRadius=$.radius,ee.shadowMapSize=$.mapSize,n.spotShadow[w]=ee,n.spotShadowMap[w]=Z,A++}w++}else if(L.isRectAreaLight){let k=e.get(L);k.color.copy(B).multiplyScalar(H),k.halfWidth.set(L.width*.5,0,0),k.halfHeight.set(0,L.height*.5,0),n.rectArea[I]=k,I++}else if(L.isPointLight){let k=e.get(L);if(k.color.copy(L.color).multiplyScalar(L.intensity),k.distance=L.distance,k.decay=L.decay,L.castShadow){let $=L.shadow,ee=t.get(L);ee.shadowIntensity=$.intensity,ee.shadowBias=$.bias,ee.shadowNormalBias=$.normalBias,ee.shadowRadius=$.radius,ee.shadowMapSize=$.mapSize,ee.shadowCameraNear=$.camera.near,ee.shadowCameraFar=$.camera.far,n.pointShadow[d]=ee,n.pointShadowMap[d]=Z,n.pointShadowMatrix[d]=L.shadow.matrix,M++}n.point[d]=k,d++}else if(L.isHemisphereLight){let k=e.get(L);k.skyColor.copy(L.color).multiplyScalar(H),k.groundColor.copy(L.groundColor).multiplyScalar(H),n.hemi[E]=k,E++}}I>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=fe.LTC_FLOAT_1,n.rectAreaLTC2=fe.LTC_FLOAT_2):(n.rectAreaLTC1=fe.LTC_HALF_1,n.rectAreaLTC2=fe.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=m,n.ambient[2]=h;let R=n.hash;(R.sunLength!==p||R.directionalLength!==f||R.pointLength!==d||R.spotLength!==w||R.rectAreaLength!==I||R.hemiLength!==E||R.numSunShadows!==x||R.numDirectionalShadows!==v||R.numPointShadows!==M||R.numSpotShadows!==A||R.numSpotMaps!==g||R.numLightProbes!==T)&&(n.sun.length=p,n.directional.length=f,n.spot.length=w,n.rectArea.length=I,n.point.length=d,n.hemi.length=E,n.sunShadow.length=x,n.sunShadowMap.length=x,n.sunShadowMatrix.length=S,n.sunShadowCascade.length=S,n.directionalShadow.length=v,n.directionalShadowMap.length=v,n.directionalShadowMatrix.length=v,n.pointShadow.length=M,n.pointShadowMap.length=M,n.pointShadowMatrix.length=M,n.spotShadow.length=A,n.spotShadowMap.length=A,n.spotLightMatrix.length=A+g-_,n.spotLightMap.length=g,n.numSpotLightShadowsWithMaps=_,n.numLightProbes=T,R.sunLength=p,R.directionalLength=f,R.pointLength=d,R.spotLength=w,R.rectAreaLength=I,R.hemiLength=E,R.numSunShadows=x,R.numDirectionalShadows=v,R.numPointShadows=M,R.numSpotShadows=A,R.numSpotMaps=g,R.numLightProbes=T,n.version=R0++)}function c(l,u){let m=0,h=0,p=0,x=0,S=0,f=0,d=u.matrixWorldInverse;for(let w=0,I=l.length;w<I;w++){let E=l[w];if(E.isSunLight){let v=n.sun[m];v.direction.setFromMatrixPosition(E.matrixWorld),v.direction.transformDirection(d),m++}else if(E.isDirectionalLight){let v=n.directional[h];v.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(d),h++}else if(E.isSpotLight){let v=n.spot[x];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(d),v.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(d),x++}else if(E.isRectAreaLight){let v=n.rectArea[S];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(d),a.identity(),r.copy(E.matrixWorld),r.premultiply(d),a.extractRotation(r),v.halfWidth.set(E.width*.5,0,0),v.halfHeight.set(0,E.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),S++}else if(E.isPointLight){let v=n.point[p];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(d),p++}else if(E.isHemisphereLight){let v=n.hemi[f];v.direction.setFromMatrixPosition(E.matrixWorld),v.direction.transformDirection(d),f++}}}return{setup:o,setupView:c,state:n}}function fu(i){let e=new P0(i),t=[],n=[],s=[];function r(h){m.camera=h,t.length=0,n.length=0,s.length=0}function a(h){t.push(h)}function o(h){n.push(h)}function c(h){s.push(h)}function l(){e.setup(t)}function u(h){e.setupView(t,h)}let m={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:m,setupLights:l,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function L0(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new fu(i),e.set(s,[o])):r>=a.length?(o=new fu(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var D0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,N0=`uniform sampler2D shadow_pass;
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
}`,U0=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],F0=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],pu=new rt,sr=new D,Hl=new D;function O0(i,e,t){let n=new Zi,s=new Re,r=new Re,a=new dt,o=new na,c=new ia,l={},u=t.maxTextureSize,m={[An]:Vt,[Vt]:An,[Gt]:Gt},h=new jt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Re},radius:{value:4}},vertexShader:D0,fragmentShader:N0}),p=h.clone();p.defines.HORIZONTAL_PASS=1;let x=new Mt;x.setAttribute("position",new Kt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let S=new pt(x,h),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=qs;let d=this.type;this.render=function(M,A,g){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||M.length===0)return;this.type===_a&&(Le("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=qs);let _=i.getRenderTarget(),T=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),P=i.state;P.setBlending(Cn),P.buffers.depth.getReversed()===!0?P.buffers.color.setClear(0,0,0,0):P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let U=d!==this.type;U&&A.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(B=>B.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,B=M.length;L<B;L++){let H=M[L],X=H.shadow;if(X===void 0){Le("WebGLShadowMap:",H,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);let Z=X.getFrameExtents();s.multiply(Z),r.copy(X.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/Z.x),s.x=r.x*Z.x,X.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/Z.y),s.y=r.y*Z.y,X.mapSize.y=r.y));let k=i.state.buffers.depth.getReversed();if(X.camera._reversedDepth=k,X.map===null||U===!0){if(X.map!==null&&(X.map.depthTexture!==null&&(X.map.depthTexture.dispose(),X.map.depthTexture=null),X.map.dispose()),this.type===Qi){if(H.isPointLight){Le("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}X.map=new Yt(s.x,s.y,{format:li,type:xn,minFilter:Ct,magFilter:Ct,generateMipmaps:!1}),X.map.texture.name=H.name+".shadowMap",X.map.depthTexture=new ei(s.x,s.y,ln),X.map.depthTexture.name=H.name+".shadowMapDepth",X.map.depthTexture.format=bn,X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=wt,X.map.depthTexture.magFilter=wt}else H.isPointLight?(X.map=new uo(s.x),X.map.depthTexture=new Yr(s.x,_n)):(X.map=new Yt(s.x,s.y),X.map.depthTexture=new ei(s.x,s.y,_n)),X.map.depthTexture.name=H.name+".shadowMap",X.map.depthTexture.format=bn,this.type===qs?(X.map.depthTexture.compareFunction=k?ao:ro,X.map.depthTexture.minFilter=Ct,X.map.depthTexture.magFilter=Ct):(X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=wt,X.map.depthTexture.magFilter=wt);X.camera.updateProjectionMatrix()}X.map.isWebGLCubeRenderTarget!==!0&&(X.map.width!==s.x||X.map.height!==s.y)&&X.map.setSize(s.x,s.y);let $=X.map.isWebGLCubeRenderTarget?6:X.getViewportCount();H.isPointLight!==!0&&X.updateMatrices(H,g);for(let ee=0;ee<$;ee++){let se=X.getCamera(ee);if(H.isPointLight){let re=X.camera,Ve=X.matrix,Oe=H.distance||re.far;Oe!==re.far&&(re.far=Oe,re.updateProjectionMatrix()),sr.setFromMatrixPosition(H.matrixWorld),re.position.copy(sr),Hl.copy(re.position),Hl.add(U0[ee]),re.up.copy(F0[ee]),re.lookAt(Hl),re.updateMatrixWorld(),Ve.makeTranslation(-sr.x,-sr.y,-sr.z),pu.multiplyMatrices(re.projectionMatrix,re.matrixWorldInverse),X._frustum.setFromProjectionMatrix(pu,re.coordinateSystem,re.reversedDepth)}if(X.map.isWebGLCubeRenderTarget)i.setRenderTarget(X.map,ee),i.clear();else{ee===0&&(i.setRenderTarget(X.map),i.clear());let re=X.getViewport(ee);a.set(r.x*re.x,r.y*re.y,r.x*re.z,r.y*re.w),P.viewport(a)}n=X.getFrustum(ee),E(A,g,se,H,this.type)}X.isPointLightShadow!==!0&&this.type===Qi&&w(X,g),X.needsUpdate=!1}d=this.type,f.needsUpdate=!1,i.setRenderTarget(_,T,R)};function w(M,A){let g=e.update(S);h.defines.VSM_SAMPLES!==M.blurSamples&&(h.defines.VSM_SAMPLES=M.blurSamples,p.defines.VSM_SAMPLES=M.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),M.mapPass===null?M.mapPass=new Yt(s.x,s.y,{format:li,type:xn}):(M.mapPass.width!==M.map.width||M.mapPass.height!==M.map.height)&&M.mapPass.setSize(M.map.width,M.map.height),h.uniforms.shadow_pass.value=M.map.depthTexture,h.uniforms.resolution.value.set(M.map.width,M.map.height),h.uniforms.radius.value=M.radius,i.setRenderTarget(M.mapPass),i.clear(),i.renderBufferDirect(A,null,g,h,S,null),p.uniforms.shadow_pass.value=M.mapPass.texture,p.uniforms.resolution.value.set(M.map.width,M.map.height),p.uniforms.radius.value=M.radius,i.setRenderTarget(M.map),i.clear(),i.renderBufferDirect(A,null,g,p,S,null)}function I(M,A,g,_){let T=null,R=g.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(R!==void 0)T=R;else if(T=g.isPointLight===!0?c:o,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let P=T.uuid,U=A.uuid,L=l[P];L===void 0&&(L={},l[P]=L);let B=L[U];B===void 0&&(B=T.clone(),L[U]=B,A.addEventListener("dispose",v)),T=B}if(T.visible=A.visible,T.wireframe=A.wireframe,_===Qi?T.side=A.shadowSide!==null?A.shadowSide:A.side:T.side=A.shadowSide!==null?A.shadowSide:m[A.side],T.alphaMap=A.alphaMap,T.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,T.map=A.map,T.clipShadows=A.clipShadows,T.clippingPlanes=A.clippingPlanes,T.clipIntersection=A.clipIntersection,T.displacementMap=A.displacementMap,T.displacementScale=A.displacementScale,T.displacementBias=A.displacementBias,T.wireframeLinewidth=A.wireframeLinewidth,T.linewidth=A.linewidth,g.isPointLight===!0&&T.isMeshDistanceMaterial===!0){let P=i.properties.get(T);P.light=g}return T}function E(M,A,g,_,T){if(M.visible===!1)return;if(M.layers.test(A.layers)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&T===Qi)&&(!M.frustumCulled||M.intersectsFrustum(n))){M.modelViewMatrix.multiplyMatrices(g.matrixWorldInverse,M.matrixWorld);let U=e.update(M),L=M.material;if(Array.isArray(L)){let B=U.groups;for(let H=0,X=B.length;H<X;H++){let Z=B[H],k=L[Z.materialIndex];if(k&&k.visible){let $=I(M,k,_,T);M.onBeforeShadow(i,M,A,g,U,$,Z),i.renderBufferDirect(g,null,U,$,M,Z),M.onAfterShadow(i,M,A,g,U,$,Z)}}}else if(L.visible){let B=I(M,L,_,T);M.onBeforeShadow(i,M,A,g,U,B,null),i.renderBufferDirect(g,null,U,B,M,null),M.onAfterShadow(i,M,A,g,U,B,null)}}let P=M.children;for(let U=0,L=P.length;U<L;U++)E(P[U],A,g,_,T)}function v(M){M.target.removeEventListener("dispose",v);for(let g in l){let _=l[g],T=M.target.uuid;T in _&&(_[T].dispose(),delete _[T])}}}function B0(i,e){function t(){let F=!1,he=new dt,Q=null,ue=new dt(0,0,0,0);return{setMask:function(xe){Q!==xe&&!F&&(i.colorMask(xe,xe,xe,xe),Q=xe)},setLocked:function(xe){F=xe},setClear:function(xe,ne,Ce,Ee,ot){ot===!0&&(xe*=Ee,ne*=Ee,Ce*=Ee),he.set(xe,ne,Ce,Ee),ue.equals(he)===!1&&(i.clearColor(xe,ne,Ce,Ee),ue.copy(he))},reset:function(){F=!1,Q=null,ue.set(-1,0,0,0)}}}function n(){let F=!1,he=!1,Q=null,ue=null,xe=null;return{setReversed:function(ne){if(he!==ne){let Ce=e.get("EXT_clip_control");ne?Ce.clipControlEXT(Ce.LOWER_LEFT_EXT,Ce.ZERO_TO_ONE_EXT):Ce.clipControlEXT(Ce.LOWER_LEFT_EXT,Ce.NEGATIVE_ONE_TO_ONE_EXT),he=ne;let Ee=xe;xe=null,this.setClear(Ee)}},getReversed:function(){return he},setTest:function(ne){ne?j(i.DEPTH_TEST):ie(i.DEPTH_TEST)},setMask:function(ne){Q!==ne&&!F&&(i.depthMask(ne),Q=ne)},setFunc:function(ne){if(he&&(ne=Hh[ne]),ue!==ne){switch(ne){case Nr:i.depthFunc(i.NEVER);break;case Ur:i.depthFunc(i.ALWAYS);break;case Fr:i.depthFunc(i.LESS);break;case Gi:i.depthFunc(i.LEQUAL);break;case Or:i.depthFunc(i.EQUAL);break;case Br:i.depthFunc(i.GEQUAL);break;case zr:i.depthFunc(i.GREATER);break;case kr:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ue=ne}},setLocked:function(ne){F=ne},setClear:function(ne){xe!==ne&&(xe=ne,he&&(ne=1-ne),i.clearDepth(ne))},reset:function(){F=!1,Q=null,ue=null,xe=null,he=!1}}}function s(){let F=!1,he=null,Q=null,ue=null,xe=null,ne=null,Ce=null,Ee=null,ot=null;return{setTest:function(je){F||(je?j(i.STENCIL_TEST):ie(i.STENCIL_TEST))},setMask:function(je){he!==je&&!F&&(i.stencilMask(je),he=je)},setFunc:function(je,hn,yn){(Q!==je||ue!==hn||xe!==yn)&&(i.stencilFunc(je,hn,yn),Q=je,ue=hn,xe=yn)},setOp:function(je,hn,yn){(ne!==je||Ce!==hn||Ee!==yn)&&(i.stencilOp(je,hn,yn),ne=je,Ce=hn,Ee=yn)},setLocked:function(je){F=je},setClear:function(je){ot!==je&&(i.clearStencil(je),ot=je)},reset:function(){F=!1,he=null,Q=null,ue=null,xe=null,ne=null,Ce=null,Ee=null,ot=null}}}let r=new t,a=new n,o=new s,c=new WeakMap,l=new WeakMap,u={},m={},h={},p=new WeakMap,x=[],S=null,f=!1,d=null,w=null,I=null,E=null,v=null,M=null,A=null,g=new Fe(0,0,0),_=0,T=!1,R=null,P=null,U=null,L=null,B=null,H=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,Z=0,k=i.getParameter(i.VERSION);k.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec(k)[1]),X=Z>=1):k.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),X=Z>=2);let $=null,ee={},se=i.getParameter(i.SCISSOR_BOX),re=i.getParameter(i.VIEWPORT),Ve=new dt().fromArray(se),Oe=new dt().fromArray(re);function Ge(F,he,Q,ue){let xe=new Uint8Array(4),ne=i.createTexture();i.bindTexture(F,ne),i.texParameteri(F,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(F,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ce=0;Ce<Q;Ce++)F===i.TEXTURE_3D||F===i.TEXTURE_2D_ARRAY?i.texImage3D(he,0,i.RGBA,1,1,ue,0,i.RGBA,i.UNSIGNED_BYTE,xe):i.texImage2D(he+Ce,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,xe);return ne}let Y={};Y[i.TEXTURE_2D]=Ge(i.TEXTURE_2D,i.TEXTURE_2D,1),Y[i.TEXTURE_CUBE_MAP]=Ge(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[i.TEXTURE_2D_ARRAY]=Ge(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Y[i.TEXTURE_3D]=Ge(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),j(i.DEPTH_TEST),a.setFunc(Gi),ze(!1),ut(hl),j(i.CULL_FACE),Ye(Cn);function j(F){u[F]!==!0&&(i.enable(F),u[F]=!0)}function ie(F){u[F]!==!1&&(i.disable(F),u[F]=!1)}function be(F,he){return h[F]!==he?(i.bindFramebuffer(F,he),h[F]=he,F===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=he),F===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=he),!0):!1}function me(F,he){let Q=x,ue=!1;if(F){Q=p.get(he),Q===void 0&&(Q=[],p.set(he,Q));let xe=F.textures;if(Q.length!==xe.length||Q[0]!==i.COLOR_ATTACHMENT0){for(let ne=0,Ce=xe.length;ne<Ce;ne++)Q[ne]=i.COLOR_ATTACHMENT0+ne;Q.length=xe.length,ue=!0}}else Q[0]!==i.BACK&&(Q[0]=i.BACK,ue=!0);ue&&i.drawBuffers(Q)}function De(F){return S!==F?(i.useProgram(F),S=F,!0):!1}let Ne={[yi]:i.FUNC_ADD,[hh]:i.FUNC_SUBTRACT,[uh]:i.FUNC_REVERSE_SUBTRACT};Ne[dh]=i.MIN,Ne[fh]=i.MAX;let Ie={[ph]:i.ZERO,[mh]:i.ONE,[gh]:i.SRC_COLOR,[pl]:i.SRC_ALPHA,[Sh]:i.SRC_ALPHA_SATURATE,[vh]:i.DST_COLOR,[xh]:i.DST_ALPHA,[_h]:i.ONE_MINUS_SRC_COLOR,[ml]:i.ONE_MINUS_SRC_ALPHA,[Mh]:i.ONE_MINUS_DST_COLOR,[yh]:i.ONE_MINUS_DST_ALPHA,[bh]:i.CONSTANT_COLOR,[Eh]:i.ONE_MINUS_CONSTANT_COLOR,[Th]:i.CONSTANT_ALPHA,[wh]:i.ONE_MINUS_CONSTANT_ALPHA};function Ye(F,he,Q,ue,xe,ne,Ce,Ee,ot,je){if(F===Cn){f===!0&&(ie(i.BLEND),f=!1);return}if(f===!1&&(j(i.BLEND),f=!0),F!==ch){if(F!==d||je!==T){if((w!==yi||v!==yi)&&(i.blendEquation(i.FUNC_ADD),w=yi,v=yi),je)switch(F){case es:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ul:i.blendFunc(i.ONE,i.ONE);break;case dl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case fl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ue("WebGLState: Invalid blending: ",F);break}else switch(F){case es:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ul:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case dl:Ue("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case fl:Ue("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ue("WebGLState: Invalid blending: ",F);break}I=null,E=null,M=null,A=null,g.set(0,0,0),_=0,d=F,T=je}return}xe=xe||he,ne=ne||Q,Ce=Ce||ue,(he!==w||xe!==v)&&(i.blendEquationSeparate(Ne[he],Ne[xe]),w=he,v=xe),(Q!==I||ue!==E||ne!==M||Ce!==A)&&(i.blendFuncSeparate(Ie[Q],Ie[ue],Ie[ne],Ie[Ce]),I=Q,E=ue,M=ne,A=Ce),(Ee.equals(g)===!1||ot!==_)&&(i.blendColor(Ee.r,Ee.g,Ee.b,ot),g.copy(Ee),_=ot),d=F,T=!1}function it(F,he){F.side===Gt?ie(i.CULL_FACE):j(i.CULL_FACE);let Q=F.side===Vt;he&&(Q=!Q),ze(Q),F.blending===es&&F.transparent===!1?Ye(Cn):Ye(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),a.setFunc(F.depthFunc),a.setTest(F.depthTest),a.setMask(F.depthWrite),r.setMask(F.colorWrite);let ue=F.stencilWrite;o.setTest(ue),ue&&(o.setMask(F.stencilWriteMask),o.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),o.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Xt(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?j(i.SAMPLE_ALPHA_TO_COVERAGE):ie(i.SAMPLE_ALPHA_TO_COVERAGE)}function ze(F){R!==F&&(F?i.frontFace(i.CW):i.frontFace(i.CCW),R=F)}function ut(F){F!==oh?(j(i.CULL_FACE),F!==P&&(F===hl?i.cullFace(i.BACK):F===lh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ie(i.CULL_FACE),P=F}function Et(F){F!==U&&(X&&i.lineWidth(F),U=F)}function Xt(F,he,Q){F?(j(i.POLYGON_OFFSET_FILL),(L!==he||B!==Q)&&(L=he,B=Q,a.getReversed()&&(he=-he),i.polygonOffset(he,Q))):ie(i.POLYGON_OFFSET_FILL)}function ft(F){F?j(i.SCISSOR_TEST):ie(i.SCISSOR_TEST)}function gt(F){F===void 0&&(F=i.TEXTURE0+H-1),$!==F&&(i.activeTexture(F),$=F)}function O(F,he,Q){Q===void 0&&($===null?Q=i.TEXTURE0+H-1:Q=$);let ue=ee[Q];ue===void 0&&(ue={type:void 0,texture:void 0},ee[Q]=ue),(ue.type!==F||ue.texture!==he)&&($!==Q&&(i.activeTexture(Q),$=Q),i.bindTexture(F,he||Y[F]),ue.type=F,ue.texture=he)}function It(){let F=ee[$];F!==void 0&&F.type!==void 0&&(i.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function tt(){try{i.compressedTexImage2D(...arguments)}catch(F){Ue("WebGLState:",F)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(F){Ue("WebGLState:",F)}}function y(){try{i.texSubImage2D(...arguments)}catch(F){Ue("WebGLState:",F)}}function z(){try{i.texSubImage3D(...arguments)}catch(F){Ue("WebGLState:",F)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(F){Ue("WebGLState:",F)}}function J(){try{i.compressedTexSubImage3D(...arguments)}catch(F){Ue("WebGLState:",F)}}function ae(){try{i.texStorage2D(...arguments)}catch(F){Ue("WebGLState:",F)}}function oe(){try{i.texStorage3D(...arguments)}catch(F){Ue("WebGLState:",F)}}function K(){try{i.texImage2D(...arguments)}catch(F){Ue("WebGLState:",F)}}function te(){try{i.texImage3D(...arguments)}catch(F){Ue("WebGLState:",F)}}function le(F){return m[F]!==void 0?m[F]:i.getParameter(F)}function we(F,he){m[F]!==he&&(i.pixelStorei(F,he),m[F]=he)}function de(F){Ve.equals(F)===!1&&(i.scissor(F.x,F.y,F.z,F.w),Ve.copy(F))}function ce(F){Oe.equals(F)===!1&&(i.viewport(F.x,F.y,F.z,F.w),Oe.copy(F))}function Ae(F,he){let Q=l.get(he);Q===void 0&&(Q=new WeakMap,l.set(he,Q));let ue=Q.get(F);ue===void 0&&(ue=i.getUniformBlockIndex(he,F.name),Q.set(F,ue))}function Pe(F,he){let ue=l.get(he).get(F);c.get(he)!==ue&&(i.uniformBlockBinding(he,ue,F.__bindingPointIndex),c.set(he,ue))}function ke(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},m={},$=null,ee={},h={},p=new WeakMap,x=[],S=null,f=!1,d=null,w=null,I=null,E=null,v=null,M=null,A=null,g=new Fe(0,0,0),_=0,T=!1,R=null,P=null,U=null,L=null,B=null,Ve.set(0,0,i.canvas.width,i.canvas.height),Oe.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:j,disable:ie,bindFramebuffer:be,drawBuffers:me,useProgram:De,setBlending:Ye,setMaterial:it,setFlipSided:ze,setCullFace:ut,setLineWidth:Et,setPolygonOffset:Xt,setScissorTest:ft,activeTexture:gt,bindTexture:O,unbindTexture:It,compressedTexImage2D:tt,compressedTexImage3D:C,texImage2D:K,texImage3D:te,pixelStorei:we,getParameter:le,updateUBOMapping:Ae,uniformBlockBinding:Pe,texStorage2D:ae,texStorage3D:oe,texSubImage2D:y,texSubImage3D:z,compressedTexSubImage2D:W,compressedTexSubImage3D:J,scissor:de,viewport:ce,reset:ke}}function z0(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Re,u=new WeakMap,m=new Set,h,p=new WeakMap,x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function S(C,y){return x?new OffscreenCanvas(C,y):bs("canvas")}function f(C,y,z){let W=1,J=tt(C);if((J.width>z||J.height>z)&&(W=z/Math.max(J.width,J.height)),W<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let ae=Math.floor(W*J.width),oe=Math.floor(W*J.height);h===void 0&&(h=S(ae,oe));let K=y?S(ae,oe):h;return K.width=ae,K.height=oe,K.getContext("2d").drawImage(C,0,0,ae,oe),Le("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+ae+"x"+oe+")."),K}else return"data"in C&&Le("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),C;return C}function d(C){return C.generateMipmaps}function w(C){i.generateMipmap(C)}function I(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(C,y,z,W,J,ae=!1){if(C!==null){if(i[C]!==void 0)return i[C];Le("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let oe;W&&(oe=e.get("EXT_texture_norm16"),oe||Le("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=y;if(y===i.RED&&(z===i.FLOAT&&(K=i.R32F),z===i.HALF_FLOAT&&(K=i.R16F),z===i.UNSIGNED_BYTE&&(K=i.R8),z===i.UNSIGNED_SHORT&&oe&&(K=oe.R16_EXT),z===i.SHORT&&oe&&(K=oe.R16_SNORM_EXT)),y===i.RED_INTEGER&&(z===i.UNSIGNED_BYTE&&(K=i.R8UI),z===i.UNSIGNED_SHORT&&(K=i.R16UI),z===i.UNSIGNED_INT&&(K=i.R32UI),z===i.BYTE&&(K=i.R8I),z===i.SHORT&&(K=i.R16I),z===i.INT&&(K=i.R32I)),y===i.RG&&(z===i.FLOAT&&(K=i.RG32F),z===i.HALF_FLOAT&&(K=i.RG16F),z===i.UNSIGNED_BYTE&&(K=i.RG8),z===i.UNSIGNED_SHORT&&oe&&(K=oe.RG16_EXT),z===i.SHORT&&oe&&(K=oe.RG16_SNORM_EXT)),y===i.RG_INTEGER&&(z===i.UNSIGNED_BYTE&&(K=i.RG8UI),z===i.UNSIGNED_SHORT&&(K=i.RG16UI),z===i.UNSIGNED_INT&&(K=i.RG32UI),z===i.BYTE&&(K=i.RG8I),z===i.SHORT&&(K=i.RG16I),z===i.INT&&(K=i.RG32I)),y===i.RGB_INTEGER&&(z===i.UNSIGNED_BYTE&&(K=i.RGB8UI),z===i.UNSIGNED_SHORT&&(K=i.RGB16UI),z===i.UNSIGNED_INT&&(K=i.RGB32UI),z===i.BYTE&&(K=i.RGB8I),z===i.SHORT&&(K=i.RGB16I),z===i.INT&&(K=i.RGB32I)),y===i.RGBA_INTEGER&&(z===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),z===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),z===i.UNSIGNED_INT&&(K=i.RGBA32UI),z===i.BYTE&&(K=i.RGBA8I),z===i.SHORT&&(K=i.RGBA16I),z===i.INT&&(K=i.RGBA32I)),y===i.RGB&&(z===i.UNSIGNED_SHORT&&oe&&(K=oe.RGB16_EXT),z===i.SHORT&&oe&&(K=oe.RGB16_SNORM_EXT),z===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),z===i.UNSIGNED_INT_10F_11F_11F_REV&&(K=i.R11F_G11F_B10F)),y===i.RGBA){let te=ae?Ss:$e.getTransfer(J);z===i.FLOAT&&(K=i.RGBA32F),z===i.HALF_FLOAT&&(K=i.RGBA16F),z===i.UNSIGNED_BYTE&&(K=te===et?i.SRGB8_ALPHA8:i.RGBA8),z===i.UNSIGNED_SHORT&&oe&&(K=oe.RGBA16_EXT),z===i.SHORT&&oe&&(K=oe.RGBA16_SNORM_EXT),z===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),z===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function v(C,y){let z;return C?y===null||y===_n||y===ns?z=i.DEPTH24_STENCIL8:y===ln?z=i.DEPTH32F_STENCIL8:y===ts&&(z=i.DEPTH24_STENCIL8,Le("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===_n||y===ns?z=i.DEPTH_COMPONENT24:y===ln?z=i.DEPTH_COMPONENT32F:y===ts&&(z=i.DEPTH_COMPONENT16),z}function M(C,y){return d(C)===!0||C.isFramebufferTexture&&C.minFilter!==wt&&C.minFilter!==Ct?Math.log2(Math.max(y.width,y.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?y.mipmaps.length:1}function A(C){let y=C.target;y.removeEventListener("dispose",A),_(y),y.isVideoTexture&&u.delete(y),y.isHTMLTexture&&m.delete(y)}function g(C){let y=C.target;y.removeEventListener("dispose",g),R(y)}function _(C){let y=n.get(C);if(y.__webglInit===void 0)return;let z=C.source,W=p.get(z);if(W){let J=W[y.__cacheKey];J.usedTimes--,J.usedTimes===0&&T(C),Object.keys(W).length===0&&p.delete(z)}n.remove(C)}function T(C){let y=n.get(C);i.deleteTexture(y.__webglTexture);let z=C.source,W=p.get(z);delete W[y.__cacheKey],a.memory.textures--}function R(C){let y=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(y.__webglFramebuffer[W]))for(let J=0;J<y.__webglFramebuffer[W].length;J++)i.deleteFramebuffer(y.__webglFramebuffer[W][J]);else i.deleteFramebuffer(y.__webglFramebuffer[W]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[W])}else{if(Array.isArray(y.__webglFramebuffer))for(let W=0;W<y.__webglFramebuffer.length;W++)i.deleteFramebuffer(y.__webglFramebuffer[W]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let W=0;W<y.__webglColorRenderbuffer.length;W++)y.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[W]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let z=C.textures;for(let W=0,J=z.length;W<J;W++){let ae=n.get(z[W]);ae.__webglTexture&&(i.deleteTexture(ae.__webglTexture),a.memory.textures--),n.remove(z[W])}n.remove(C)}let P=0;function U(){P=0}function L(){return P}function B(C){P=C}function H(){let C=P;return C>=s.maxTextures&&Le("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),P+=1,C}function X(C){let y=[];return y.push(C.wrapS),y.push(C.wrapT),y.push(C.wrapR||0),y.push(C.magFilter),y.push(C.minFilter),y.push(C.anisotropy),y.push(C.internalFormat),y.push(C.format),y.push(C.type),y.push(C.generateMipmaps),y.push(C.premultiplyAlpha),y.push(C.flipY),y.push(C.unpackAlignment),y.push(C.colorSpace),y.join()}function Z(C,y){let z=n.get(C);if(C.isVideoTexture&&O(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&z.__version!==C.version){let W=C.image;if(W===null)Le("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Le("WebGLRenderer: Texture marked for update but image is incomplete");else{ie(z,C,y);return}}else C.isExternalTexture&&(z.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,z.__webglTexture,i.TEXTURE0+y)}function k(C,y){let z=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&z.__version!==C.version){ie(z,C,y);return}else C.isExternalTexture&&(z.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,z.__webglTexture,i.TEXTURE0+y)}function $(C,y){let z=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&z.__version!==C.version){ie(z,C,y);return}t.bindTexture(i.TEXTURE_3D,z.__webglTexture,i.TEXTURE0+y)}function ee(C,y){let z=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&z.__version!==C.version){be(z,C,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+y)}let se={[Vr]:i.REPEAT,[Sn]:i.CLAMP_TO_EDGE,[Gr]:i.MIRRORED_REPEAT},re={[wt]:i.NEAREST,[Rh]:i.NEAREST_MIPMAP_NEAREST,[Zs]:i.NEAREST_MIPMAP_LINEAR,[Ct]:i.LINEAR,[Ma]:i.LINEAR_MIPMAP_NEAREST,[ai]:i.LINEAR_MIPMAP_LINEAR},Ve={[Dh]:i.NEVER,[Bh]:i.ALWAYS,[Nh]:i.LESS,[ro]:i.LEQUAL,[Uh]:i.EQUAL,[ao]:i.GEQUAL,[Fh]:i.GREATER,[Oh]:i.NOTEQUAL};function Oe(C,y){if(y.type===ln&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Ct||y.magFilter===Ma||y.magFilter===Zs||y.magFilter===ai||y.minFilter===Ct||y.minFilter===Ma||y.minFilter===Zs||y.minFilter===ai)&&Le("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,se[y.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,se[y.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,se[y.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,re[y.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,re[y.minFilter]),y.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,Ve[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===wt||y.minFilter!==Zs&&y.minFilter!==ai||y.type===ln&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let z=e.get("EXT_texture_filter_anisotropic");i.texParameterf(C,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function Ge(C,y){let z=!1;C.__webglInit===void 0&&(C.__webglInit=!0,y.addEventListener("dispose",A));let W=y.source,J=p.get(W);J===void 0&&(J={},p.set(W,J));let ae=X(y);if(ae!==C.__cacheKey){J[ae]===void 0&&(J[ae]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,z=!0),J[ae].usedTimes++;let oe=J[C.__cacheKey];oe!==void 0&&(J[C.__cacheKey].usedTimes--,oe.usedTimes===0&&T(y)),C.__cacheKey=ae,C.__webglTexture=J[ae].texture}return z}function Y(C,y,z){return Math.floor(Math.floor(C/z)/y)}function j(C,y,z,W){let ae=C.updateRanges;if(ae.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,z,W,y.data);else{ae.sort((we,de)=>we.start-de.start);let oe=0;for(let we=1;we<ae.length;we++){let de=ae[oe],ce=ae[we],Ae=de.start+de.count,Pe=Y(ce.start,y.width,4),ke=Y(de.start,y.width,4);ce.start<=Ae+1&&Pe===ke&&Y(ce.start+ce.count-1,y.width,4)===Pe?de.count=Math.max(de.count,ce.start+ce.count-de.start):(++oe,ae[oe]=ce)}ae.length=oe+1;let K=t.getParameter(i.UNPACK_ROW_LENGTH),te=t.getParameter(i.UNPACK_SKIP_PIXELS),le=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let we=0,de=ae.length;we<de;we++){let ce=ae[we],Ae=Math.floor(ce.start/4),Pe=Math.ceil(ce.count/4),ke=Ae%y.width,F=Math.floor(Ae/y.width),he=Pe,Q=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,ke),t.pixelStorei(i.UNPACK_SKIP_ROWS,F),t.texSubImage2D(i.TEXTURE_2D,0,ke,F,he,Q,z,W,y.data)}C.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,K),t.pixelStorei(i.UNPACK_SKIP_PIXELS,te),t.pixelStorei(i.UNPACK_SKIP_ROWS,le)}}function ie(C,y,z){let W=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(W=i.TEXTURE_3D);let J=Ge(C,y),ae=y.source;t.bindTexture(W,C.__webglTexture,i.TEXTURE0+z);let oe=n.get(ae);if(ae.version!==oe.__version||J===!0){if(t.activeTexture(i.TEXTURE0+z),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let Q=$e.getPrimaries($e.workingColorSpace),ue=y.colorSpace===Vn?null:$e.getPrimaries(y.colorSpace),xe=y.colorSpace===Vn||Q===ue?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe)}t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment);let te=f(y.image,!1,s.maxTextureSize);te=It(y,te);let le=r.convert(y.format,y.colorSpace),we=r.convert(y.type),de=E(y.internalFormat,le,we,y.normalized,y.colorSpace,y.isVideoTexture);Oe(W,y);let ce,Ae=y.mipmaps,Pe=y.isVideoTexture!==!0,ke=oe.__version===void 0||J===!0,F=ae.dataReady,he=M(y,te);if(y.isDepthTexture)de=v(y.format===oi,y.type),ke&&(Pe?t.texStorage2D(i.TEXTURE_2D,1,de,te.width,te.height):t.texImage2D(i.TEXTURE_2D,0,de,te.width,te.height,0,le,we,null));else if(y.isDataTexture)if(Ae.length>0){Pe&&ke&&t.texStorage2D(i.TEXTURE_2D,he,de,Ae[0].width,Ae[0].height);for(let Q=0,ue=Ae.length;Q<ue;Q++)ce=Ae[Q],Pe?F&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,ce.width,ce.height,le,we,ce.data):t.texImage2D(i.TEXTURE_2D,Q,de,ce.width,ce.height,0,le,we,ce.data);y.generateMipmaps=!1}else Pe?(ke&&t.texStorage2D(i.TEXTURE_2D,he,de,te.width,te.height),F&&j(y,te,le,we)):t.texImage2D(i.TEXTURE_2D,0,de,te.width,te.height,0,le,we,te.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Pe&&ke&&t.texStorage3D(i.TEXTURE_2D_ARRAY,he,de,Ae[0].width,Ae[0].height,te.depth);for(let Q=0,ue=Ae.length;Q<ue;Q++)if(ce=Ae[Q],y.format!==cn)if(le!==null)if(Pe){if(F)if(y.layerUpdates.size>0){let xe=Ol(ce.width,ce.height,y.format,y.type);for(let ne of y.layerUpdates){let Ce=ce.data.subarray(ne*xe/ce.data.BYTES_PER_ELEMENT,(ne+1)*xe/ce.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,ne,ce.width,ce.height,1,le,Ce)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,ce.width,ce.height,te.depth,le,ce.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,de,ce.width,ce.height,te.depth,0,ce.data,0,0);else Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Pe?F&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,ce.width,ce.height,te.depth,le,we,ce.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Q,de,ce.width,ce.height,te.depth,0,le,we,ce.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{Pe&&ke&&t.texStorage2D(i.TEXTURE_2D,he,de,Ae[0].width,Ae[0].height);for(let Q=0,ue=Ae.length;Q<ue;Q++)ce=Ae[Q],y.format!==cn?le!==null?Pe?F&&t.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,ce.width,ce.height,le,ce.data):t.compressedTexImage2D(i.TEXTURE_2D,Q,de,ce.width,ce.height,0,ce.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Pe?F&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,ce.width,ce.height,le,we,ce.data):t.texImage2D(i.TEXTURE_2D,Q,de,ce.width,ce.height,0,le,we,ce.data)}else if(y.isDataArrayTexture)if(Pe){if(ke&&t.texStorage3D(i.TEXTURE_2D_ARRAY,he,de,te.width,te.height,te.depth),F)if(y.layerUpdates.size>0){let Q=Ol(te.width,te.height,y.format,y.type);for(let ue of y.layerUpdates){let xe=te.data.subarray(ue*Q/te.data.BYTES_PER_ELEMENT,(ue+1)*Q/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ue,te.width,te.height,1,le,we,xe)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,le,we,te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,de,te.width,te.height,te.depth,0,le,we,te.data);else if(y.isData3DTexture)Pe?(ke&&t.texStorage3D(i.TEXTURE_3D,he,de,te.width,te.height,te.depth),F&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,le,we,te.data)):t.texImage3D(i.TEXTURE_3D,0,de,te.width,te.height,te.depth,0,le,we,te.data);else if(y.isFramebufferTexture){if(ke)if(Pe)t.texStorage2D(i.TEXTURE_2D,he,de,te.width,te.height);else{let Q=te.width,ue=te.height;for(let xe=0;xe<he;xe++)t.texImage2D(i.TEXTURE_2D,xe,de,Q,ue,0,le,we,null),Q>>=1,ue>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in i){let Q=i.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),te.parentNode!==Q){Q.appendChild(te),m.add(y),Q.onpaint=ue=>{let xe=ue.changedElements;for(let ne of m)xe.includes(ne.image)&&(ne.needsUpdate=!0)},Q.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,te);else{let xe=i.RGBA,ne=i.RGBA,Ce=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,xe,ne,Ce,te)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ae.length>0){if(Pe&&ke){let Q=tt(Ae[0]);t.texStorage2D(i.TEXTURE_2D,he,de,Q.width,Q.height)}for(let Q=0,ue=Ae.length;Q<ue;Q++)ce=Ae[Q],Pe?F&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,le,we,ce):t.texImage2D(i.TEXTURE_2D,Q,de,le,we,ce);y.generateMipmaps=!1}else if(Pe){if(ke){let Q=tt(te);t.texStorage2D(i.TEXTURE_2D,he,de,Q.width,Q.height)}F&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,le,we,te)}else t.texImage2D(i.TEXTURE_2D,0,de,le,we,te);d(y)&&w(W),oe.__version=ae.version,y.onUpdate&&y.onUpdate(y)}C.__version=y.version}function be(C,y,z){if(y.image.length!==6)return;let W=Ge(C,y),J=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+z);let ae=n.get(J);if(J.version!==ae.__version||W===!0){t.activeTexture(i.TEXTURE0+z);let oe=$e.getPrimaries($e.workingColorSpace),K=y.colorSpace===Vn?null:$e.getPrimaries(y.colorSpace),te=y.colorSpace===Vn||oe===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,te);let le=y.isCompressedTexture||y.image[0].isCompressedTexture,we=y.image[0]&&y.image[0].isDataTexture,de=[];for(let ne=0;ne<6;ne++)!le&&!we?de[ne]=f(y.image[ne],!0,s.maxCubemapSize):de[ne]=we?y.image[ne].image:y.image[ne],de[ne]=It(y,de[ne]);let ce=de[0],Ae=r.convert(y.format,y.colorSpace),Pe=r.convert(y.type),ke=E(y.internalFormat,Ae,Pe,y.normalized,y.colorSpace),F=y.isVideoTexture!==!0,he=ae.__version===void 0||W===!0,Q=J.dataReady,ue=M(y,ce);Oe(i.TEXTURE_CUBE_MAP,y);let xe;if(le){F&&he&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ue,ke,ce.width,ce.height);for(let ne=0;ne<6;ne++){xe=de[ne].mipmaps;for(let Ce=0;Ce<xe.length;Ce++){let Ee=xe[Ce];y.format!==cn?Ae!==null?F?Q&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ce,0,0,Ee.width,Ee.height,Ae,Ee.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ce,ke,Ee.width,Ee.height,0,Ee.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ce,0,0,Ee.width,Ee.height,Ae,Pe,Ee.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ce,ke,Ee.width,Ee.height,0,Ae,Pe,Ee.data)}}}else{if(xe=y.mipmaps,F&&he){xe.length>0&&ue++;let ne=tt(de[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ue,ke,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(we){F?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,de[ne].width,de[ne].height,Ae,Pe,de[ne].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,ke,de[ne].width,de[ne].height,0,Ae,Pe,de[ne].data);for(let Ce=0;Ce<xe.length;Ce++){let ot=xe[Ce].image[ne].image;F?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ce+1,0,0,ot.width,ot.height,Ae,Pe,ot.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ce+1,ke,ot.width,ot.height,0,Ae,Pe,ot.data)}}else{F?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Ae,Pe,de[ne]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,ke,Ae,Pe,de[ne]);for(let Ce=0;Ce<xe.length;Ce++){let Ee=xe[Ce];F?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ce+1,0,0,Ae,Pe,Ee.image[ne]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ce+1,ke,Ae,Pe,Ee.image[ne])}}}d(y)&&w(i.TEXTURE_CUBE_MAP),ae.__version=J.version,y.onUpdate&&y.onUpdate(y)}C.__version=y.version}function me(C,y,z,W,J,ae){let oe=r.convert(z.format,z.colorSpace),K=r.convert(z.type),te=E(z.internalFormat,oe,K,z.normalized,z.colorSpace),le=n.get(y),we=n.get(z);if(we.__renderTarget=y,!le.__hasExternalTextures){let de=Math.max(1,y.width>>ae),ce=Math.max(1,y.height>>ae);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?t.texImage3D(J,ae,te,de,ce,y.depth,0,oe,K,null):t.texImage2D(J,ae,te,de,ce,0,oe,K,null)}t.bindFramebuffer(i.FRAMEBUFFER,C),gt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,J,we.__webglTexture,0,ft(y)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,J,we.__webglTexture,ae),t.bindFramebuffer(i.FRAMEBUFFER,null)}function De(C,y,z){if(i.bindRenderbuffer(i.RENDERBUFFER,C),y.depthBuffer){let W=y.depthTexture,J=W&&W.isDepthTexture?W.type:null,ae=v(y.stencilBuffer,J),oe=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;gt(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft(y),ae,y.width,y.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft(y),ae,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ae,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,oe,i.RENDERBUFFER,C)}else{let W=y.textures;for(let J=0;J<W.length;J++){let ae=W[J],oe=r.convert(ae.format,ae.colorSpace),K=r.convert(ae.type),te=E(ae.internalFormat,oe,K,ae.normalized,ae.colorSpace);gt(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft(y),te,y.width,y.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft(y),te,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,te,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ne(C,y,z){let W=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,C),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let J=n.get(y.depthTexture);if(J.__renderTarget=y,(!J.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),W){if(J.__webglInit===void 0&&(J.__webglInit=!0,y.depthTexture.addEventListener("dispose",A)),J.__webglTexture===void 0){J.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),Oe(i.TEXTURE_CUBE_MAP,y.depthTexture);let le=r.convert(y.depthTexture.format),we=r.convert(y.depthTexture.type),de;y.depthTexture.format===bn?de=i.DEPTH_COMPONENT24:y.depthTexture.format===oi&&(de=i.DEPTH24_STENCIL8);for(let ce=0;ce<6;ce++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,de,y.width,y.height,0,le,we,null)}}else Z(y.depthTexture,0);let ae=J.__webglTexture,oe=ft(y),K=W?i.TEXTURE_CUBE_MAP_POSITIVE_X+z:i.TEXTURE_2D,te=y.depthTexture.format===oi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(y.depthTexture.format===bn)gt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,K,ae,0,oe):i.framebufferTexture2D(i.FRAMEBUFFER,te,K,ae,0);else if(y.depthTexture.format===oi)gt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,K,ae,0,oe):i.framebufferTexture2D(i.FRAMEBUFFER,te,K,ae,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ie(C){let y=n.get(C),z=C.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==C.depthTexture){let W=C.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),W){let J=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,W.removeEventListener("dispose",J)};W.addEventListener("dispose",J),y.__depthDisposeCallback=J}y.__boundDepthTexture=W}if(C.depthTexture&&!y.__autoAllocateDepthBuffer)if(z)for(let W=0;W<6;W++)Ne(y.__webglFramebuffer[W],C,W);else{let W=C.texture.mipmaps;W&&W.length>0?Ne(y.__webglFramebuffer[0],C,0):Ne(y.__webglFramebuffer,C,0)}else if(z){y.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[W]),y.__webglDepthbuffer[W]===void 0)y.__webglDepthbuffer[W]=i.createRenderbuffer(),De(y.__webglDepthbuffer[W],C,!1);else{let J=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=y.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,ae)}}else{let W=C.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),De(y.__webglDepthbuffer,C,!1);else{let J=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,ae)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ye(C,y,z){let W=n.get(C);y!==void 0&&me(W.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),z!==void 0&&Ie(C)}function it(C){let y=C.texture,z=n.get(C),W=n.get(y);C.addEventListener("dispose",g);let J=C.textures,ae=C.isWebGLCubeRenderTarget===!0,oe=J.length>1;if(oe||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=y.version,a.memory.textures++),ae){z.__webglFramebuffer=[];for(let K=0;K<6;K++)if(y.mipmaps&&y.mipmaps.length>0){z.__webglFramebuffer[K]=[];for(let te=0;te<y.mipmaps.length;te++)z.__webglFramebuffer[K][te]=i.createFramebuffer()}else z.__webglFramebuffer[K]=i.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){z.__webglFramebuffer=[];for(let K=0;K<y.mipmaps.length;K++)z.__webglFramebuffer[K]=i.createFramebuffer()}else z.__webglFramebuffer=i.createFramebuffer();if(oe)for(let K=0,te=J.length;K<te;K++){let le=n.get(J[K]);le.__webglTexture===void 0&&(le.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&gt(C)===!1){z.__webglMultisampledFramebuffer=i.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let K=0;K<J.length;K++){let te=J[K];z.__webglColorRenderbuffer[K]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,z.__webglColorRenderbuffer[K]);let le=r.convert(te.format,te.colorSpace),we=r.convert(te.type),de=E(te.internalFormat,le,we,te.normalized,te.colorSpace,C.isXRRenderTarget===!0),ce=ft(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,ce,de,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,z.__webglColorRenderbuffer[K])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(z.__webglDepthRenderbuffer=i.createRenderbuffer(),De(z.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ae){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),Oe(i.TEXTURE_CUBE_MAP,y);for(let K=0;K<6;K++)if(y.mipmaps&&y.mipmaps.length>0)for(let te=0;te<y.mipmaps.length;te++)me(z.__webglFramebuffer[K][te],C,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,te);else me(z.__webglFramebuffer[K],C,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);d(y)&&w(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(oe){for(let K=0,te=J.length;K<te;K++){let le=J[K],we=n.get(le),de=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(de=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(de,we.__webglTexture),Oe(de,le),me(z.__webglFramebuffer,C,le,i.COLOR_ATTACHMENT0+K,de,0),d(le)&&w(de)}t.unbindTexture()}else{let K=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(K=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(K,W.__webglTexture),Oe(K,y),y.mipmaps&&y.mipmaps.length>0)for(let te=0;te<y.mipmaps.length;te++)me(z.__webglFramebuffer[te],C,y,i.COLOR_ATTACHMENT0,K,te);else me(z.__webglFramebuffer,C,y,i.COLOR_ATTACHMENT0,K,0);d(y)&&w(K),t.unbindTexture()}C.depthBuffer&&Ie(C)}function ze(C){let y=C.textures;for(let z=0,W=y.length;z<W;z++){let J=y[z];if(d(J)){let ae=I(C),oe=n.get(J).__webglTexture;t.bindTexture(ae,oe),w(ae),t.unbindTexture()}}}let ut=[],Et=[];function Xt(C){if(C.samples>0){if(gt(C)===!1){let y=C.textures,z=C.width,W=C.height,J=i.COLOR_BUFFER_BIT,ae=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=n.get(C),K=y.length>1;if(K)for(let le=0;le<y.length;le++)t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,oe.__webglMultisampledFramebuffer);let te=C.texture.mipmaps;te&&te.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,oe.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,oe.__webglFramebuffer);for(let le=0;le<y.length;le++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),K){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,oe.__webglColorRenderbuffer[le]);let we=n.get(y[le]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,we,0)}i.blitFramebuffer(0,0,z,W,0,0,z,W,J,i.NEAREST),c===!0&&(ut.length=0,Et.length=0,ut.push(i.COLOR_ATTACHMENT0+le),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(ut.push(ae),Et.push(ae),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Et)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ut))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),K)for(let le=0;le<y.length;le++){t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.RENDERBUFFER,oe.__webglColorRenderbuffer[le]);let we=n.get(y[le]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.TEXTURE_2D,we,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,oe.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&c){let y=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function ft(C){return Math.min(s.maxSamples,C.samples)}function gt(C){let y=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function O(C){let y=a.render.frame;u.get(C)!==y&&(u.set(C,y),C.update())}function It(C,y){let z=C.colorSpace,W=C.format,J=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||z!==Ms&&z!==Vn&&($e.getTransfer(z)===et?(W!==cn||J!==$t)&&Le("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ue("WebGLTextures: Unsupported texture color space:",z)),y}function tt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(l.width=C.naturalWidth||C.width,l.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(l.width=C.displayWidth,l.height=C.displayHeight):(l.width=C.width,l.height=C.height),l}this.allocateTextureUnit=H,this.resetTextureUnits=U,this.getTextureUnits=L,this.setTextureUnits=B,this.setTexture2D=Z,this.setTexture2DArray=k,this.setTexture3D=$,this.setTextureCube=ee,this.rebindTextures=Ye,this.setupRenderTarget=it,this.updateRenderTargetMipmap=ze,this.updateMultisampleRenderTarget=Xt,this.setupDepthRenderbuffer=Ie,this.setupFrameBufferTexture=me,this.useMultisampledRTT=gt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function k0(i,e){function t(n,s=Vn){let r,a=$e.getTransfer(s);if(n===$t)return i.UNSIGNED_BYTE;if(n===ba)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ea)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Tl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===wl)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===bl)return i.BYTE;if(n===El)return i.SHORT;if(n===ts)return i.UNSIGNED_SHORT;if(n===Sa)return i.INT;if(n===_n)return i.UNSIGNED_INT;if(n===ln)return i.FLOAT;if(n===xn)return i.HALF_FLOAT;if(n===Al)return i.ALPHA;if(n===Cl)return i.RGB;if(n===cn)return i.RGBA;if(n===bn)return i.DEPTH_COMPONENT;if(n===oi)return i.DEPTH_STENCIL;if(n===Ta)return i.RED;if(n===wa)return i.RED_INTEGER;if(n===li)return i.RG;if(n===Aa)return i.RG_INTEGER;if(n===Ca)return i.RGBA_INTEGER;if(n===Js||n===Ks||n===js||n===Qs)if(a===et)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Js)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ks)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Qs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Js)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ks)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===js)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Qs)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ra||n===Ia||n===Pa||n===La)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ra)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ia)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Pa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===La)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Da||n===Na||n===Ua||n===Fa||n===Oa||n===er||n===Ba)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Da||n===Na)return a===et?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ua)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Fa)return r.COMPRESSED_R11_EAC;if(n===Oa)return r.COMPRESSED_SIGNED_R11_EAC;if(n===er)return r.COMPRESSED_RG11_EAC;if(n===Ba)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===za||n===ka||n===Va||n===Ga||n===Ha||n===Wa||n===Xa||n===qa||n===Ya||n===$a||n===Za||n===Ja||n===Ka||n===ja)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===za)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ka)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Va)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ga)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ha)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Wa)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Xa)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===qa)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ya)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===$a)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Za)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ja)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ka)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ja)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Qa||n===eo||n===to)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Qa)return a===et?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===eo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===to)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===no||n===io||n===tr||n===so)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===no)return r.COMPRESSED_RED_RGTC1_EXT;if(n===io)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===tr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===so)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ns?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var V0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,G0=`
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

}`,Kl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ds(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new jt({vertexShader:V0,fragmentShader:G0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new pt(new Bs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},jl=class extends En{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,u=null,m=null,h=null,p=null,x=null,S=typeof XRWebGLBinding<"u",f=new Kl,d={},w=t.getContextAttributes(),I=null,E=null,v=[],M=[],A=new Re,g=null,_=null,T=new Nt;T.viewport=new dt;let R=new Nt;R.viewport=new dt;let P=[T,R],U=new ga,L=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let j=v[Y];return j===void 0&&(j=new $i,v[Y]=j),j.getTargetRaySpace()},this.getControllerGrip=function(Y){let j=v[Y];return j===void 0&&(j=new $i,v[Y]=j),j.getGripSpace()},this.getHand=function(Y){let j=v[Y];return j===void 0&&(j=new $i,v[Y]=j),j.getHandSpace()};function H(Y){let j=M.indexOf(Y.inputSource);if(j===-1)return;let ie=v[j];ie!==void 0&&(ie.update(Y.inputSource,Y.frame,l||a),ie.dispatchEvent({type:Y.type,data:Y.inputSource}))}function X(){s.removeEventListener("select",H),s.removeEventListener("selectstart",H),s.removeEventListener("selectend",H),s.removeEventListener("squeeze",H),s.removeEventListener("squeezestart",H),s.removeEventListener("squeezeend",H),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",Z);for(let Y=0;Y<v.length;Y++){let j=M[Y];j!==null&&(M[Y]=null,v[Y].disconnect(j))}L=null,B=null,f.reset();for(let Y in d)delete d[Y];if(e.setRenderTarget(I),p=null,h=null,m=null,s=null,E=null,Ge.stop(),n.isPresenting=!1,e.setPixelRatio(g),e.setSize(A.width,A.height,!1),_!==null){let Y=_.camera;Y.fov=_.fov,Y.zoom=_.zoom,Y.updateProjectionMatrix(),_=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&Le("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&Le("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(Y){l=Y},this.getBaseLayer=function(){return h!==null?h:p},this.getBinding=function(){return m===null&&S&&(m=new XRWebGLBinding(s,t)),m},this.getFrame=function(){return x},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(I=e.getRenderTarget(),s.addEventListener("select",H),s.addEventListener("selectstart",H),s.addEventListener("selectend",H),s.addEventListener("squeeze",H),s.addEventListener("squeezestart",H),s.addEventListener("squeezeend",H),s.addEventListener("end",X),s.addEventListener("inputsourceschange",Z),w.xrCompatible!==!0&&await t.makeXRCompatible(),g=e.getPixelRatio(),e.getSize(A),S&&"createProjectionLayer"in XRWebGLBinding.prototype){let ie=null,be=null,me=null;w.depth&&(me=w.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ie=w.stencil?oi:bn,be=w.stencil?ns:_n);let De={colorFormat:t.RGBA8,depthFormat:me,scaleFactor:r};m=this.getBinding(),h=m.createProjectionLayer(De),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),E=new Yt(h.textureWidth,h.textureHeight,{format:cn,type:$t,depthTexture:new ei(h.textureWidth,h.textureHeight,be,void 0,void 0,void 0,void 0,void 0,void 0,ie),stencilBuffer:w.stencil,colorSpace:e.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let ie={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,ie),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),E=new Yt(p.framebufferWidth,p.framebufferHeight,{format:cn,type:$t,colorSpace:e.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),Ge.setContext(s),Ge.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return f.getDepthTexture()};function Z(Y){for(let j=0;j<Y.removed.length;j++){let ie=Y.removed[j],be=M.indexOf(ie);be>=0&&(M[be]=null,v[be].disconnect(ie))}for(let j=0;j<Y.added.length;j++){let ie=Y.added[j],be=M.indexOf(ie);if(be===-1){for(let De=0;De<v.length;De++)if(De>=M.length){M.push(ie),be=De;break}else if(M[De]===null){M[De]=ie,be=De;break}if(be===-1)break}let me=v[be];me&&me.connect(ie)}}let k=new D,$=new D;function ee(Y,j,ie){k.setFromMatrixPosition(j.matrixWorld),$.setFromMatrixPosition(ie.matrixWorld);let be=k.distanceTo($),me=j.projectionMatrix.elements,De=ie.projectionMatrix.elements,Ne=me[14]/(me[10]-1),Ie=me[14]/(me[10]+1),Ye=(me[9]+1)/me[5],it=(me[9]-1)/me[5],ze=(me[8]-1)/me[0],ut=(De[8]+1)/De[0],Et=Ne*ze,Xt=Ne*ut,ft=be/(-ze+ut),gt=ft*-ze;if(j.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(gt),Y.translateZ(ft),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),me[10]===-1)Y.projectionMatrix.copy(j.projectionMatrix),Y.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let O=Ne+ft,It=Ie+ft,tt=Et-gt,C=Xt+(be-gt),y=Ye*Ie/It*O,z=it*Ie/It*O;Y.projectionMatrix.makePerspective(tt,C,y,z,O,It),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function se(Y,j){j===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(j.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let j=Y.near,ie=Y.far;f.texture!==null&&(f.depthNear>0&&(j=f.depthNear),f.depthFar>0&&(ie=f.depthFar)),U.near=R.near=T.near=j,U.far=R.far=T.far=ie,(L!==U.near||B!==U.far)&&(s.updateRenderState({depthNear:U.near,depthFar:U.far}),L=U.near,B=U.far),U.layers.mask=Y.layers.mask|6,T.layers.mask=U.layers.mask&-5,R.layers.mask=U.layers.mask&-3;let be=Y.parent,me=U.cameras;se(U,be);for(let De=0;De<me.length;De++)se(me[De],be);me.length===2?ee(U,T,R):U.projectionMatrix.copy(T.projectionMatrix),_===null&&Y.isPerspectiveCamera&&(_={camera:Y,fov:Y.fov,zoom:Y.zoom}),re(Y,U,be)};function re(Y,j,ie){ie===null?Y.matrix.copy(j.matrixWorld):(Y.matrix.copy(ie.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(j.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(j.projectionMatrix),Y.projectionMatrixInverse.copy(j.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Xi*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return U},this.getFoveation=function(){if(!(h===null&&p===null))return c},this.setFoveation=function(Y){c=Y,h!==null&&(h.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return f.texture!==null},this.getDepthSensingMesh=function(){return f.getMesh(U)},this.getCameraTexture=function(Y){return d[Y]};let Ve=null;function Oe(Y,j){if(u=j.getViewerPose(l||a),x=j,u!==null){let ie=u.views;p!==null&&(e.setRenderTargetFramebuffer(E,p.framebuffer),e.setRenderTarget(E));let be=!1;ie.length!==U.cameras.length&&(U.cameras.length=0,be=!0);for(let Ie=0;Ie<ie.length;Ie++){let Ye=ie[Ie],it=null;if(p!==null)it=p.getViewport(Ye);else{let ut=m.getViewSubImage(h,Ye);it=ut.viewport,Ie===0&&(e.setRenderTargetTextures(E,ut.colorTexture,ut.depthStencilTexture),e.setRenderTarget(E))}let ze=P[Ie];ze===void 0&&(ze=new Nt,ze.layers.enable(Ie),ze.viewport=new dt,P[Ie]=ze),ze.matrix.fromArray(Ye.transform.matrix),ze.matrix.decompose(ze.position,ze.quaternion,ze.scale),ze.projectionMatrix.fromArray(Ye.projectionMatrix),ze.projectionMatrixInverse.copy(ze.projectionMatrix).invert(),ze.viewport.set(it.x,it.y,it.width,it.height),Ie===0&&(U.matrix.copy(ze.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale)),be===!0&&U.cameras.push(ze)}let me=s.enabledFeatures;if(me&&me.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&S){m=n.getBinding();let Ie=m.getDepthInformation(ie[0]);Ie&&Ie.isValid&&Ie.texture&&f.init(Ie,s.renderState)}if(me&&me.includes("camera-access")&&S){e.state.unbindTexture(),m=n.getBinding();for(let Ie=0;Ie<ie.length;Ie++){let Ye=ie[Ie].camera;if(Ye){let it=d[Ye];it||(it=new Ds,d[Ye]=it);let ze=m.getCameraImage(Ye);it.sourceTexture=ze}}}}for(let ie=0;ie<v.length;ie++){let be=M[ie],me=v[ie];be!==null&&me!==void 0&&me.update(be,j,l||a)}Ve&&Ve(Y,j),j.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:j}),x=null}let Ge=new mu;Ge.setAnimationLoop(Oe),this.setAnimationLoop=function(Y){Ve=Y},this.dispose=function(){}}},H0=new rt,Mu=new Be;Mu.set(-1,0,0,0,1,0,0,0,1);function W0(i,e){function t(f,d){f.matrixAutoUpdate===!0&&f.updateMatrix(),d.value.copy(f.matrix)}function n(f,d){d.color.getRGB(f.fogColor.value,Nl(i)),d.isFog?(f.fogNear.value=d.near,f.fogFar.value=d.far):d.isFogExp2&&(f.fogDensity.value=d.density)}function s(f,d,w,I,E){d.isNodeMaterial?d.uniformsNeedUpdate=!1:d.isMeshBasicMaterial?r(f,d):d.isMeshLambertMaterial?(r(f,d),d.envMap&&(f.envMapIntensity.value=d.envMapIntensity)):d.isMeshToonMaterial?(r(f,d),m(f,d)):d.isMeshPhongMaterial?(r(f,d),u(f,d),d.envMap&&(f.envMapIntensity.value=d.envMapIntensity)):d.isMeshStandardMaterial?(r(f,d),h(f,d),d.isMeshPhysicalMaterial&&p(f,d,E)):d.isMeshMatcapMaterial?(r(f,d),x(f,d)):d.isMeshDepthMaterial?r(f,d):d.isMeshDistanceMaterial?(r(f,d),S(f,d)):d.isMeshNormalMaterial?r(f,d):d.isLineBasicMaterial?(a(f,d),d.isLineDashedMaterial&&o(f,d)):d.isPointsMaterial?c(f,d,w,I):d.isSpriteMaterial?l(f,d):d.isShadowMaterial?(f.color.value.copy(d.color),f.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(f,d){f.opacity.value=d.opacity,d.color&&f.diffuse.value.copy(d.color),d.emissive&&f.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(f.map.value=d.map,t(d.map,f.mapTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.bumpMap&&(f.bumpMap.value=d.bumpMap,t(d.bumpMap,f.bumpMapTransform),f.bumpScale.value=d.bumpScale,d.side===Vt&&(f.bumpScale.value*=-1)),d.normalMap&&(f.normalMap.value=d.normalMap,t(d.normalMap,f.normalMapTransform),f.normalScale.value.copy(d.normalScale),d.side===Vt&&f.normalScale.value.negate()),d.displacementMap&&(f.displacementMap.value=d.displacementMap,t(d.displacementMap,f.displacementMapTransform),f.displacementScale.value=d.displacementScale,f.displacementBias.value=d.displacementBias),d.emissiveMap&&(f.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,f.emissiveMapTransform)),d.specularMap&&(f.specularMap.value=d.specularMap,t(d.specularMap,f.specularMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest);let w=e.get(d),I=w.envMap,E=w.envMapRotation;I&&(f.envMap.value=I,f.envMapRotation.value.setFromMatrix4(H0.makeRotationFromEuler(E)).transpose(),I.isCubeTexture&&I.isRenderTargetTexture===!1&&f.envMapRotation.value.premultiply(Mu),f.reflectivity.value=d.reflectivity,f.ior.value=d.ior,f.refractionRatio.value=d.refractionRatio),d.lightMap&&(f.lightMap.value=d.lightMap,f.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,f.lightMapTransform)),d.aoMap&&(f.aoMap.value=d.aoMap,f.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,f.aoMapTransform))}function a(f,d){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,d.map&&(f.map.value=d.map,t(d.map,f.mapTransform))}function o(f,d){f.dashSize.value=d.dashSize,f.totalSize.value=d.dashSize+d.gapSize,f.scale.value=d.scale}function c(f,d,w,I){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,f.size.value=d.size*w,f.scale.value=I*.5,d.map&&(f.map.value=d.map,t(d.map,f.uvTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest)}function l(f,d){f.diffuse.value.copy(d.color),f.opacity.value=d.opacity,f.rotation.value=d.rotation,d.map&&(f.map.value=d.map,t(d.map,f.mapTransform)),d.alphaMap&&(f.alphaMap.value=d.alphaMap,t(d.alphaMap,f.alphaMapTransform)),d.alphaTest>0&&(f.alphaTest.value=d.alphaTest)}function u(f,d){f.specular.value.copy(d.specular),f.shininess.value=Math.max(d.shininess,1e-4)}function m(f,d){d.gradientMap&&(f.gradientMap.value=d.gradientMap)}function h(f,d){f.metalness.value=d.metalness,d.metalnessMap&&(f.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,f.metalnessMapTransform)),f.roughness.value=d.roughness,d.roughnessMap&&(f.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,f.roughnessMapTransform)),d.envMap&&(f.envMapIntensity.value=d.envMapIntensity)}function p(f,d,w){f.ior.value=d.ior,d.sheen>0&&(f.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),f.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(f.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,f.sheenColorMapTransform)),d.sheenRoughnessMap&&(f.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,f.sheenRoughnessMapTransform))),d.clearcoat>0&&(f.clearcoat.value=d.clearcoat,f.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(f.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,f.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(f.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Vt&&f.clearcoatNormalScale.value.negate())),d.dispersion>0&&(f.dispersion.value=d.dispersion),d.retroreflectivity>0&&(f.retroreflectivity.value=d.retroreflectivity),d.iridescence>0&&(f.iridescence.value=d.iridescence,f.iridescenceIOR.value=d.iridescenceIOR,f.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(f.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,f.iridescenceMapTransform)),d.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),d.transmission>0&&(f.transmission.value=d.transmission,f.transmissionSamplerMap.value=w.texture,f.transmissionSamplerSize.value.set(w.width,w.height),d.transmissionMap&&(f.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,f.transmissionMapTransform)),f.thickness.value=d.thickness,d.thicknessMap&&(f.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=d.attenuationDistance,f.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(f.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(f.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=d.specularIntensity,f.specularColor.value.copy(d.specularColor),d.specularColorMap&&(f.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,f.specularColorMapTransform)),d.specularIntensityMap&&(f.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,f.specularIntensityMapTransform))}function x(f,d){d.matcap&&(f.matcap.value=d.matcap)}function S(f,d){let w=e.get(d).light;f.referencePosition.value.setFromMatrixPosition(w.matrixWorld),f.nearDistance.value=w.shadow.camera.near,f.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function X0(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,v){let M=v.program;n.uniformBlockBinding(E,M)}function l(E,v){let M=s[E.id];M===void 0&&(f(E),M=u(E),s[E.id]=M,E.addEventListener("dispose",w));let A=v.program;n.updateUBOMapping(E,A);let g=e.render.frame;r[E.id]!==g&&(h(E),r[E.id]=g)}function u(E){let v=m();E.__bindingPointIndex=v;let M=i.createBuffer(),A=E.__size,g=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,A,g),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,v,M),M}function m(){for(let E=0;E<o;E++)if(a.indexOf(E)===-1)return a.push(E),E;return Ue("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(E){let v=s[E.id],M=E.uniforms,A=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,v);for(let g=0,_=M.length;g<_;g++){let T=M[g];if(Array.isArray(T))for(let R=0,P=T.length;R<P;R++)p(T[R],g,R,A);else p(T,g,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(E,v,M,A){if(S(E,v,M,A)===!0){let g=E.__offset,_=E.value;if(Array.isArray(_)){let T=0;for(let R=0;R<_.length;R++){let P=_[R],U=d(P);x(P,E.__data,T),typeof P!="number"&&typeof P!="boolean"&&!P.isMatrix3&&!ArrayBuffer.isView(P)&&(T+=U.storage/Float32Array.BYTES_PER_ELEMENT)}}else x(_,E.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,g,E.__data)}}function x(E,v,M){typeof E=="number"||typeof E=="boolean"?v[0]=E:E.isMatrix3?(v[0]=E.elements[0],v[1]=E.elements[1],v[2]=E.elements[2],v[3]=0,v[4]=E.elements[3],v[5]=E.elements[4],v[6]=E.elements[5],v[7]=0,v[8]=E.elements[6],v[9]=E.elements[7],v[10]=E.elements[8],v[11]=0):ArrayBuffer.isView(E)?v.set(new E.constructor(E.buffer,E.byteOffset,v.length)):E.toArray(v,M)}function S(E,v,M,A){let g=E.value,_=v+"_"+M;if(A[_]===void 0)return typeof g=="number"||typeof g=="boolean"?A[_]=g:ArrayBuffer.isView(g)?A[_]=g.slice():A[_]=g.clone(),!0;{let T=A[_];if(typeof g=="number"||typeof g=="boolean"){if(T!==g)return A[_]=g,!0}else{if(ArrayBuffer.isView(g))return!0;if(T.equals(g)===!1)return T.copy(g),!0}}return!1}function f(E){let v=E.uniforms,M=0,A=16;for(let _=0,T=v.length;_<T;_++){let R=Array.isArray(v[_])?v[_]:[v[_]];for(let P=0,U=R.length;P<U;P++){let L=R[P],B=Array.isArray(L.value)?L.value:[L.value];for(let H=0,X=B.length;H<X;H++){let Z=B[H],k=d(Z),$=M%A,ee=$%k.boundary,se=$+ee;M+=ee,se!==0&&A-se<k.storage&&(M+=A-se),L.__data=new Float32Array(k.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=M,M+=k.storage}}}let g=M%A;return g>0&&(M+=A-g),E.__size=M,E.__cache={},this}function d(E){let v={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(v.boundary=4,v.storage=4):E.isVector2?(v.boundary=8,v.storage=8):E.isVector3||E.isColor?(v.boundary=16,v.storage=12):E.isVector4?(v.boundary=16,v.storage=16):E.isMatrix3?(v.boundary=48,v.storage=48):E.isMatrix4?(v.boundary=64,v.storage=64):E.isTexture?Le("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(E)?(v.boundary=16,v.storage=E.byteLength):Le("WebGLRenderer: Unsupported uniform value type.",E),v}function w(E){let v=E.target;v.removeEventListener("dispose",w);let M=a.indexOf(v.__bindingPointIndex);a.splice(M,1),i.deleteBuffer(s[v.id]),delete s[v.id],delete r[v.id]}function I(){for(let E in s)i.deleteBuffer(s[E]);a=[],s={},r={}}return{bind:c,update:l,dispose:I}}var q0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Rn=null;function Y0(){return Rn===null&&(Rn=new Is(q0,16,16,li,xn),Rn.name="DFG_LUT",Rn.minFilter=Ct,Rn.magFilter=Ct,Rn.wrapS=Sn,Rn.wrapT=Sn,Rn.generateMipmaps=!1,Rn.needsUpdate=!0),Rn}var fo=class{constructor(e={}){let{canvas:t=kh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:m=!1,reversedDepthBuffer:h=!1,outputBufferType:p=$t}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=n.getContextAttributes().alpha}else x=a;let S=p,f=new Set([Ca,Aa,wa]),d=new Set([$t,_n,ts,ns,ba,Ea]),w=new Uint32Array(4),I=new Int32Array(4),E=new D,v=null,M=null,A=[],g=[],_=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=gn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,R=!1,P=null,U=null,L=null,B=null;this._outputColorSpace=zt;let H=0,X=0,Z=null,k=-1,$=null,ee=new dt,se=new dt,re=null,Ve=new Fe(0),Oe=0,Ge=t.width,Y=t.height,j=1,ie=null,be=null,me=new dt(0,0,Ge,Y),De=new dt(0,0,Ge,Y),Ne=!1,Ie=new Zi,Ye=!1,it=!1,ze=new rt,ut=new D,Et=new dt,Xt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ft=!1;function gt(){return Z===null?j:1}let O=n;function It(b,N){return t.getContext(b,N)}let tt,C,y,z,W,J,ae,oe,K,te,le,we,de,ce,Ae,Pe,ke,F,he,Q,ue,xe,ne;try{let b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:m};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",ot,!1),t.addEventListener("webglcontextrestored",je,!1),t.addEventListener("webglcontextcreationerror",hn,!1),O===null){let N="webgl2";if(O=It(N,b),O===null)throw It(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ce()}catch(b){throw t.removeEventListener("webglcontextlost",ot,!1),t.removeEventListener("webglcontextrestored",je,!1),t.removeEventListener("webglcontextcreationerror",hn,!1),Ue("WebGLRenderer: "+b.message),b}function Ce(){tt=new eg(O),tt.init(),ue=new k0(O,tt),C=new Wm(O,tt,e,ue),y=new B0(O,tt),C.reversedDepthBuffer&&h&&y.buffers.depth.setReversed(!0),U=O.createFramebuffer(),L=O.createFramebuffer(),B=O.createFramebuffer(),z=new ig(O),W=new E0,J=new z0(O,tt,y,W,C,ue,z),ae=new Qm(T),oe=new rf(O),xe=new Gm(O,oe),K=new tg(O,oe,z,xe),te=new rg(O,K,oe,xe,z),F=new sg(O,C,J),Ae=new Xm(W),le=new b0(T,ae,tt,C,xe,Ae),we=new W0(T,W),de=new w0,ce=new L0(tt),ke=new Vm(T,ae,y,te,x,c),Pe=new O0(T,te,C),ne=new X0(O,z,C,y),he=new Hm(O,tt,z),Q=new ng(O,tt,z),z.programs=le.programs,T.capabilities=C,T.extensions=tt,T.properties=W,T.renderLists=de,T.shadowMap=Pe,T.state=y,T.info=z}S!==$t&&(_=new og(S,t.width,t.height,o,s,r));let Ee=new jl(T,O);this.xr=Ee,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let b=tt.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=tt.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(b){b!==void 0&&(j=b,this.setSize(Ge,Y,!1))},this.getSize=function(b){return b.set(Ge,Y)},this.setSize=function(b,N,q=!0){if(Ee.isPresenting){Le("WebGLRenderer: Can't change size while VR device is presenting.");return}Ge=b,Y=N,t.width=Math.floor(b*j),t.height=Math.floor(N*j),q===!0&&(t.style.width=b+"px",t.style.height=N+"px"),_!==null&&_.setSize(t.width,t.height),this.setViewport(0,0,b,N)},this.getDrawingBufferSize=function(b){return b.set(Ge*j,Y*j).floor()},this.setDrawingBufferSize=function(b,N,q){Ge=b,Y=N,j=q,t.width=Math.floor(b*q),t.height=Math.floor(N*q),this.setViewport(0,0,b,N)},this.setEffects=function(b){if(S===$t){Ue("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let N=0;N<b.length;N++)if(b[N].isOutputPass===!0){Le("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}_.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(ee)},this.getViewport=function(b){return b.copy(me)},this.setViewport=function(b,N,q,V){b.isVector4?me.set(b.x,b.y,b.z,b.w):me.set(b,N,q,V),y.viewport(ee.copy(me).multiplyScalar(j).round())},this.getScissor=function(b){return b.copy(De)},this.setScissor=function(b,N,q,V){b.isVector4?De.set(b.x,b.y,b.z,b.w):De.set(b,N,q,V),y.scissor(se.copy(De).multiplyScalar(j).round())},this.getScissorTest=function(){return Ne},this.setScissorTest=function(b){y.setScissorTest(Ne=b)},this.setOpaqueSort=function(b){ie=b},this.setTransparentSort=function(b){be=b},this.getClearColor=function(b){return b.copy(ke.getClearColor())},this.setClearColor=function(){ke.setClearColor(...arguments)},this.getClearAlpha=function(){return ke.getClearAlpha()},this.setClearAlpha=function(){ke.setClearAlpha(...arguments)},this.clear=function(b=!0,N=!0,q=!0){let V=0;if(b){let G=!1;if(Z!==null){let _e=Z.texture.format;G=f.has(_e)}if(G){let _e=Z.texture.type,ve=d.has(_e),ge=ke.getClearColor(),Me=ke.getClearAlpha(),Te=ge.r,He=ge.g,qe=ge.b;ve?(w[0]=Te,w[1]=He,w[2]=qe,w[3]=Me,O.clearBufferuiv(O.COLOR,0,w)):(I[0]=Te,I[1]=He,I[2]=qe,I[3]=Me,O.clearBufferiv(O.COLOR,0,I))}else V|=O.COLOR_BUFFER_BIT}N&&(V|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(V|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&O.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),P=b},this.dispose=function(){t.removeEventListener("webglcontextlost",ot,!1),t.removeEventListener("webglcontextrestored",je,!1),t.removeEventListener("webglcontextcreationerror",hn,!1),ke.dispose(),de.dispose(),ce.dispose(),W.dispose(),ae.dispose(),te.dispose(),xe.dispose(),ne.dispose(),le.dispose(),Ee.dispose(),Ee.removeEventListener("sessionstart",ac),Ee.removeEventListener("sessionend",oc),ui.stop()};function ot(b){b.preventDefault(),Il("WebGLRenderer: Context Lost."),R=!0}function je(){Il("WebGLRenderer: Context Restored."),R=!1;let b=z.autoReset,N=Pe.enabled,q=Pe.autoUpdate,V=Pe.needsUpdate,G=Pe.type;Ce(),z.autoReset=b,Pe.enabled=N,Pe.autoUpdate=q,Pe.needsUpdate=V,Pe.type=G}function hn(b){Ue("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function yn(b){let N=b.target;N.removeEventListener("dispose",yn),Bu(N)}function Bu(b){zu(b),W.remove(b)}function zu(b){let N=W.get(b).programs;N!==void 0&&(N.forEach(function(q){le.releaseProgram(q)}),b.isShaderMaterial&&le.releaseShaderCache(b))}this.renderBufferDirect=function(b,N,q,V,G,_e){N===null&&(N=Xt);let ve=G.isMesh&&G.matrixWorld.determinantAffine()<0,ge=Gu(b,N,q,V,G);y.setMaterial(V,ve);let Me=q.index,Te=1;if(V.wireframe===!0){if(Me=K.getWireframeAttribute(q),Me===void 0)return;Te=2}let He=q.drawRange,qe=q.attributes.position,Se=He.start*Te,Qe=(He.start+He.count)*Te;_e!==null&&(Se=Math.max(Se,_e.start*Te),Qe=Math.min(Qe,(_e.start+_e.count)*Te)),Me!==null?(Se=Math.max(Se,0),Qe=Math.min(Qe,Me.count)):qe!=null&&(Se=Math.max(Se,0),Qe=Math.min(Qe,qe.count));let _t=Qe-Se;if(_t<0||_t===1/0)return;xe.setup(G,V,ge,q,Me);let ct,at=he;if(Me!==null&&(ct=oe.get(Me),at=Q,at.setIndex(ct)),G.isMesh)V.wireframe===!0?(y.setLineWidth(V.wireframeLinewidth*gt()),at.setMode(O.LINES)):at.setMode(O.TRIANGLES);else if(G.isLine){let Pt=V.linewidth;Pt===void 0&&(Pt=1),y.setLineWidth(Pt*gt()),G.isLineSegments?at.setMode(O.LINES):G.isLineLoop?at.setMode(O.LINE_LOOP):at.setMode(O.LINE_STRIP)}else G.isPoints?at.setMode(O.POINTS):G.isSprite&&at.setMode(O.TRIANGLES);if(G.isBatchedMesh)if(tt.get("WEBGL_multi_draw"))at.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{let Pt=G._multiDrawStarts,ye=G._multiDrawCounts,Ot=G._multiDrawCount,Ze=Me?oe.get(Me).bytesPerElement:1,en=W.get(V).currentProgram.getUniforms();for(let vn=0;vn<Ot;vn++)en.setValue(O,"_gl_DrawID",vn),at.render(Pt[vn]/Ze,ye[vn])}else if(G.isInstancedMesh)at.renderInstances(Se,_t,G.count);else if(q.isInstancedBufferGeometry){let Pt=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,ye=Math.min(q.instanceCount,Pt);at.renderInstances(Se,_t,ye)}else at.render(Se,_t)};function rc(b,N,q,V){P!==null&&b.isNodeMaterial&&P.setObject(V,b),Ye===!0&&Ae.setState(b,q,!1),b.transparent===!0&&b.side===Gt&&b.forceSinglePass===!1?(b.side=Vt,b.needsUpdate=!0,ur(b,N,V),b.side=An,b.needsUpdate=!0,ur(b,N,V),b.side=Gt):ur(b,N,V)}this.compile=function(b,N,q=null){q===null&&(q=b),P!==null&&P.renderStart(b,N,q),M=ce.get(q),M.init(N),g.push(M),q.traverseVisible(function(G){G.isLight&&G.layers.test(N.layers)&&(M.pushLight(G),G.castShadow&&M.pushShadow(G))}),b!==q&&b.traverseVisible(function(G){G.isLight&&G.layers.test(N.layers)&&(M.pushLight(G),G.castShadow&&M.pushShadow(G))}),M.setupLights(),P!==null&&P.updateLights(M.state.lightsArray),it=this.localClippingEnabled,Ye=Ae.init(this.clippingPlanes,it),Ye===!0&&Ae.setGlobalState(this.clippingPlanes,N),P!==null&&Pe.render(M.state.shadowsArray,q,N);let V=new Set;return b.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;let _e=G.material;if(_e)if(Array.isArray(_e))for(let ve=0;ve<_e.length;ve++){let ge=_e[ve];rc(ge,q,N,G),V.add(ge)}else rc(_e,q,N,G),V.add(_e)}),M=g.pop(),P!==null&&P.renderEnd(),V},this.compileAsync=function(b,N,q=null){let V=this.compile(b,N,q);return new Promise(G=>{function _e(){if(V.forEach(function(ve){let Me=W.get(ve).currentProgram;(Me===void 0||Me.isReady())&&V.delete(ve)}),V.size===0){G(b);return}setTimeout(_e,10)}tt.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let To=null;function ku(b){To&&To(b)}function ac(){ui.stop()}function oc(){ui.start()}let ui=new mu;ui.setAnimationLoop(ku),typeof self<"u"&&ui.setContext(self),this.setAnimationLoop=function(b){To=b,Ee.setAnimationLoop(b),b===null?ui.stop():ui.start()},Ee.addEventListener("sessionstart",ac),Ee.addEventListener("sessionend",oc),this.render=function(b,N){if(N!==void 0&&N.isCamera!==!0){Ue("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;P!==null&&P.renderStart(b,N);let q=Ee.enabled===!0&&Ee.isPresenting===!0,V=_!==null&&(Z===null||q)&&_.begin(T,Z);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Ee.enabled===!0&&Ee.isPresenting===!0&&(_===null||_.isCompositing()===!1)&&(Ee.cameraAutoUpdate===!0&&Ee.updateCamera(N),N=Ee.getCamera()),b.isScene===!0&&b.onBeforeRender(T,b,N,Z),M=ce.get(b,g.length),M.init(N),M.state.textureUnits=J.getTextureUnits(),g.push(M),ze.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Ie.setFromProjectionMatrix(ze,mn,N.reversedDepth),it=this.localClippingEnabled,Ye=Ae.init(this.clippingPlanes,it),v=de.get(b,A.length),v.init(),A.push(v),Ee.enabled===!0&&Ee.isPresenting===!0){let ve=T.xr.getDepthSensingMesh();ve!==null&&wo(ve,N,-1/0,T.sortObjects)}wo(b,N,0,T.sortObjects),v.finish(),P!==null&&P.updateLights(M.state.lightsArray),T.sortObjects===!0&&v.sort(ie,be),ft=Ee.enabled===!1||Ee.isPresenting===!1||Ee.hasDepthSensing()===!1,ft&&ke.addToRenderList(v,b),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ye===!0&&Ae.beginShadows();let G=M.state.shadowsArray;if(Pe.render(G,b,N),Ye===!0&&Ae.endShadows(),(V&&_.hasRenderPass())===!1){let ve=v.opaque,ge=v.transmissive;if(M.setupLights(),N.isArrayCamera){let Me=N.cameras;if(ge.length>0)for(let Te=0,He=Me.length;Te<He;Te++){let qe=Me[Te];cc(ve,ge,b,qe)}ft&&ke.render(b);for(let Te=0,He=Me.length;Te<He;Te++){let qe=Me[Te];lc(v,b,qe,qe.viewport)}}else ge.length>0&&cc(ve,ge,b,N),ft&&ke.render(b),lc(v,b,N)}Z!==null&&X===0&&(J.updateMultisampleRenderTarget(Z),J.updateRenderTargetMipmap(Z)),V&&_.end(T),b.isScene===!0&&b.onAfterRender(T,b,N),xe.resetDefaultState(),k=-1,$=null,g.pop(),g.length>0?(M=g[g.length-1],J.setTextureUnits(M.state.textureUnits),Ye===!0&&Ae.setGlobalState(T.clippingPlanes,M.state.camera)):M=null,A.pop(),A.length>0?v=A[A.length-1]:v=null,P!==null&&P.renderEnd()};function wo(b,N,q,V){if(b.visible===!1)return;if(b.layers.test(N.layers)){if(b.isGroup)q=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(N);else if(b.isLightProbeGrid)M.pushLightProbeGrid(b);else if(b.isLight)M.pushLight(b),b.castShadow&&M.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||b.intersectsFrustum(Ie)){V&&Et.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ze);let ve=te.update(b),ge=b.material;ge.visible&&v.push(b,ve,ge,q,Et.z,null,N)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||b.intersectsFrustum(Ie))){let ve=te.update(b),ge=b.material;if(V&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Et.copy(b.boundingSphere.center)):(ve.boundingSphere===null&&ve.computeBoundingSphere(),Et.copy(ve.boundingSphere.center)),Et.applyMatrix4(b.matrixWorld).applyMatrix4(ze)),Array.isArray(ge)){let Me=ve.groups;for(let Te=0,He=Me.length;Te<He;Te++){let qe=Me[Te],Se=ge[qe.materialIndex];Se&&Se.visible&&v.push(b,ve,Se,q,Et.z,qe,N)}}else ge.visible&&v.push(b,ve,ge,q,Et.z,null,N)}}let _e=b.children;for(let ve=0,ge=_e.length;ve<ge;ve++)wo(_e[ve],N,q,V)}function lc(b,N,q,V){let{opaque:G,transmissive:_e,transparent:ve}=b;M.setupLightsView(q),Ye===!0&&Ae.setGlobalState(T.clippingPlanes,q),V&&y.viewport(ee.copy(V)),G.length>0&&hr(G,N,q),_e.length>0&&hr(_e,N,q),ve.length>0&&hr(ve,N,q),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function cc(b,N,q,V){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[V.id]===void 0){let Se=tt.has("EXT_color_buffer_half_float")||tt.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[V.id]=new Yt(1,1,{generateMipmaps:!0,type:Se?xn:$t,minFilter:ai,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:$e.workingColorSpace})}let _e=M.state.transmissionRenderTarget[V.id],ve=V.viewport||ee;_e.setSize(ve.z*T.transmissionResolutionScale,ve.w*T.transmissionResolutionScale);let ge=T.getRenderTarget(),Me=T.getActiveCubeFace(),Te=T.getActiveMipmapLevel();T.setRenderTarget(_e),T.getClearColor(Ve),Oe=T.getClearAlpha(),Oe<1&&T.setClearColor(16777215,.5),T.clear(),ft&&ke.render(q);let He=T.toneMapping;T.toneMapping=gn;let qe=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),M.setupLightsView(V),Ye===!0&&Ae.setGlobalState(T.clippingPlanes,V),hr(b,q,V),J.updateMultisampleRenderTarget(_e),J.updateRenderTargetMipmap(_e),tt.has("WEBGL_multisampled_render_to_texture")===!1){let Se=!1;for(let Qe=0,_t=N.length;Qe<_t;Qe++){let ct=N[Qe],{object:at,geometry:Pt,material:ye,group:Ot}=ct;if(ye.side===Gt&&at.layers.test(V.layers)){let Ze=ye.side;ye.side=Vt,ye.needsUpdate=!0,hc(at,q,V,Pt,ye,Ot),ye.side=Ze,ye.needsUpdate=!0,Se=!0}}Se===!0&&(J.updateMultisampleRenderTarget(_e),J.updateRenderTargetMipmap(_e))}T.setRenderTarget(ge,Me,Te),T.setClearColor(Ve,Oe),qe!==void 0&&(V.viewport=qe),T.toneMapping=He}function hr(b,N,q){let V=N.isScene===!0?N.overrideMaterial:null;for(let G=0,_e=b.length;G<_e;G++){let ve=b[G],{object:ge,geometry:Me,group:Te}=ve,He=ve.material;He.allowOverride===!0&&V!==null&&(He=V),ge.layers.test(q.layers)&&hc(ge,N,q,Me,He,Te)}}function hc(b,N,q,V,G,_e){P!==null&&G.isNodeMaterial&&P.setObject(b,G),b.onBeforeRender(T,N,q,V,G,_e),b.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),G.onBeforeRender(T,N,q,V,b,_e),G.transparent===!0&&G.side===Gt&&G.forceSinglePass===!1?(G.side=Vt,G.needsUpdate=!0,T.renderBufferDirect(q,N,V,G,b,_e),G.side=An,G.needsUpdate=!0,T.renderBufferDirect(q,N,V,G,b,_e),G.side=Gt):T.renderBufferDirect(q,N,V,G,b,_e),b.onAfterRender(T,N,q,V,G,_e)}function ur(b,N,q){N.isScene!==!0&&(N=Xt);let V=W.get(b),G=M.state.lights,_e=M.state.shadowsArray,ve=G.state.version,ge=le.getParameters(b,G.state,_e,N,q,M.state.lightProbeGridArray),Me=le.getProgramCacheKey(ge),Te=V.programs;V.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?N.environment:null,V.fog=N.fog;let He=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;V.envMap=ae.get(b.envMap||V.environment,He),V.envMapRotation=V.environment!==null&&b.envMap===null?N.environmentRotation:b.envMapRotation,Te===void 0&&(b.addEventListener("dispose",yn),Te=new Map,V.programs=Te);let qe=Te.get(Me);if(qe!==void 0){if(V.currentProgram===qe&&V.lightsStateVersion===ve)return dc(b,ge),qe}else ge.uniforms=le.getUniforms(b),P!==null&&b.isNodeMaterial&&P.build(b,q,ge),b.onBeforeCompile(ge,T),qe=le.acquireProgram(ge,Me),Te.set(Me,qe),V.uniforms=ge.uniforms;let Se=V.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Se.clippingPlanes=Ae.uniform),dc(b,ge),V.needsLights=Wu(b),V.lightsStateVersion=ve,V.needsLights&&(Se.ambientLightColor.value=G.state.ambient,Se.lightProbe.value=G.state.probe,Se.sunLights.value=G.state.sun,Se.sunLightShadows.value=G.state.sunShadow,Se.directionalLights.value=G.state.directional,Se.directionalLightShadows.value=G.state.directionalShadow,Se.spotLights.value=G.state.spot,Se.spotLightShadows.value=G.state.spotShadow,Se.rectAreaLights.value=G.state.rectArea,Se.ltc_1.value=G.state.rectAreaLTC1,Se.ltc_2.value=G.state.rectAreaLTC2,Se.pointLights.value=G.state.point,Se.pointLightShadows.value=G.state.pointShadow,Se.hemisphereLights.value=G.state.hemi,Se.sunShadowMatrix.value=G.state.sunShadowMatrix,Se.sunShadowCascade.value=G.state.sunShadowCascade,Se.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Se.spotLightMatrix.value=G.state.spotLightMatrix,Se.spotLightMap.value=G.state.spotLightMap,Se.pointShadowMatrix.value=G.state.pointShadowMatrix),V.lightProbeGrid=M.state.lightProbeGridArray.length>0,V.currentProgram=qe,V.uniformsList=null,qe}function uc(b){if(b.uniformsList===null){let N=b.currentProgram.getUniforms();b.uniformsList=as.seqWithValue(N.seq,b.uniforms)}return b.uniformsList}function dc(b,N){let q=W.get(b);q.outputColorSpace=N.outputColorSpace,q.batching=N.batching,q.batchingColor=N.batchingColor,q.instancing=N.instancing,q.instancingColor=N.instancingColor,q.instancingMorph=N.instancingMorph,q.skinning=N.skinning,q.morphTargets=N.morphTargets,q.morphNormals=N.morphNormals,q.morphColors=N.morphColors,q.morphTargetsCount=N.morphTargetsCount,q.numClippingPlanes=N.numClippingPlanes,q.numIntersection=N.numClipIntersection,q.vertexAlphas=N.vertexAlphas,q.vertexTangents=N.vertexTangents,q.toneMapping=N.toneMapping}function Vu(b,N){if(b.length===0)return null;if(b.length===1)return b[0].texture!==null?b[0]:null;E.setFromMatrixPosition(N.matrixWorld);for(let q=0,V=b.length;q<V;q++){let G=b[q];if(G.texture!==null&&G.boundingBox.containsPoint(E))return G}return null}function Gu(b,N,q,V,G){N.isScene!==!0&&(N=Xt),J.resetTextureUnits();let _e=N.fog,ve=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?N.environment:null,ge=Z===null?T.outputColorSpace:Z.isXRRenderTarget===!0?Z.texture.colorSpace:$e.workingColorSpace,Me=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,Te=ae.get(V.envMap||ve,Me),He=V.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,qe=!!q.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Se=!!q.morphAttributes.position,Qe=!!q.morphAttributes.normal,_t=!!q.morphAttributes.color,ct=gn;V.toneMapped&&(Z===null||Z.isXRRenderTarget===!0)&&(ct=T.toneMapping);let at=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Pt=at!==void 0?at.length:0,ye=W.get(V),Ot=M.state.lights;if(Ye===!0&&(it===!0||b!==$)){let lt=b===$&&V.id===k;Ae.setState(V,b,lt)}let Ze=!1;V.version===ye.__version?(ye.needsLights&&ye.lightsStateVersion!==Ot.state.version||ye.outputColorSpace!==ge||G.isBatchedMesh&&ye.batching===!1||!G.isBatchedMesh&&ye.batching===!0||G.isBatchedMesh&&ye.batchingColor===!0&&G._colorsTexture===null||G.isBatchedMesh&&ye.batchingColor===!1&&G._colorsTexture!==null||G.isInstancedMesh&&ye.instancing===!1||!G.isInstancedMesh&&ye.instancing===!0||G.isSkinnedMesh&&ye.skinning===!1||!G.isSkinnedMesh&&ye.skinning===!0||G.isInstancedMesh&&ye.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&ye.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&ye.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&ye.instancingMorph===!1&&G.morphTexture!==null||ye.envMap!==Te||V.fog===!0&&ye.fog!==_e||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==Ae.numPlanes||ye.numIntersection!==Ae.numIntersection)||ye.vertexAlphas!==He||ye.vertexTangents!==qe||ye.morphTargets!==Se||ye.morphNormals!==Qe||ye.morphColors!==_t||ye.toneMapping!==ct||ye.morphTargetsCount!==Pt||!!ye.lightProbeGrid!=M.state.lightProbeGridArray.length>0)&&(Ze=!0):(Ze=!0,ye.__version=V.version);let en=ye.currentProgram;Ze===!0&&(en=ur(V,N,G),P&&V.isNodeMaterial&&P.onUpdateProgram(V,en,ye));let vn=!1,Wn=!1,Ei=!1,st=en.getUniforms(),mt=ye.uniforms;if(y.useProgram(en.program)&&(vn=!0,Wn=!0,Ei=!0),V.id!==k&&(k=V.id,Wn=!0),ye.needsLights){let lt=Vu(M.state.lightProbeGridArray,G);ye.lightProbeGrid!==lt&&(ye.lightProbeGrid=lt,Wn=!0)}if(vn||$!==b){y.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),st.setValue(O,"projectionMatrix",b.projectionMatrix),st.setValue(O,"viewMatrix",b.matrixWorldInverse);let qn=st.map.cameraPosition;qn!==void 0&&qn.setValue(O,ut.setFromMatrixPosition(b.matrixWorld)),C.logarithmicDepthBuffer&&st.setValue(O,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&st.setValue(O,"isOrthographic",b.isOrthographicCamera===!0),$!==b&&($=b,Wn=!0,Ei=!0)}if(ye.needsLights&&(Ot.state.sunShadowMap.length>0&&st.setValue(O,"sunShadowMap",Ot.state.sunShadowMap,J),Ot.state.directionalShadowMap.length>0&&st.setValue(O,"directionalShadowMap",Ot.state.directionalShadowMap,J),Ot.state.spotShadowMap.length>0&&st.setValue(O,"spotShadowMap",Ot.state.spotShadowMap,J),Ot.state.pointShadowMap.length>0&&st.setValue(O,"pointShadowMap",Ot.state.pointShadowMap,J)),G.isSkinnedMesh){st.setOptional(O,G,"bindMatrix"),st.setOptional(O,G,"bindMatrixInverse");let lt=G.skeleton;lt&&(lt.boneTexture===null&&lt.computeBoneTexture(),st.setValue(O,"boneTexture",lt.boneTexture,J))}G.isBatchedMesh&&(st.setOptional(O,G,"batchingTexture"),st.setValue(O,"batchingTexture",G._matricesTexture,J),st.setOptional(O,G,"batchingIdTexture"),st.setValue(O,"batchingIdTexture",G._indirectTexture,J),st.setOptional(O,G,"batchingColorTexture"),G._colorsTexture!==null&&st.setValue(O,"batchingColorTexture",G._colorsTexture,J));let Xn=q.morphAttributes;if((Xn.position!==void 0||Xn.normal!==void 0||Xn.color!==void 0)&&F.update(G,q,en),(Wn||ye.receiveShadow!==G.receiveShadow)&&(ye.receiveShadow=G.receiveShadow,st.setValue(O,"receiveShadow",G.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&N.environment!==null&&(mt.envMapIntensity.value=N.environmentIntensity),mt.dfgLUT!==void 0&&(mt.dfgLUT.value=Y0()),Wn){if(st.setValue(O,"toneMappingExposure",T.toneMappingExposure),ye.needsLights&&Hu(mt,Ei),_e&&V.fog===!0&&we.refreshFogUniforms(mt,_e),we.refreshMaterialUniforms(mt,V,j,Y,M.state.transmissionRenderTarget[b.id]),ye.needsLights&&ye.lightProbeGrid){let lt=ye.lightProbeGrid;mt.probesSH.value=lt.texture,mt.probesMin.value.copy(lt.boundingBox.min),mt.probesMax.value.copy(lt.boundingBox.max),mt.probesResolution.value.copy(lt.resolution)}as.upload(O,uc(ye),mt,J)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(as.upload(O,uc(ye),mt,J),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&st.setValue(O,"center",G.center),st.setValue(O,"modelViewMatrix",G.modelViewMatrix),st.setValue(O,"normalMatrix",G.normalMatrix),st.setValue(O,"modelMatrix",G.matrixWorld),V.uniformsGroups!==void 0){let lt=V.uniformsGroups;for(let qn=0,Ti=lt.length;qn<Ti;qn++){let pc=lt[qn];ne.update(pc,en),ne.bind(pc,en)}}return en}function Hu(b,N){b.ambientLightColor.needsUpdate=N,b.lightProbe.needsUpdate=N,b.sunLights.needsUpdate=N,b.sunLightShadows.needsUpdate=N,b.directionalLights.needsUpdate=N,b.directionalLightShadows.needsUpdate=N,b.pointLights.needsUpdate=N,b.pointLightShadows.needsUpdate=N,b.spotLights.needsUpdate=N,b.spotLightShadows.needsUpdate=N,b.rectAreaLights.needsUpdate=N,b.hemisphereLights.needsUpdate=N}function Wu(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return X},this.getRenderTarget=function(){return Z},this.setRenderTargetTextures=function(b,N,q){let V=W.get(b);V.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),W.get(b.texture).__webglTexture=N,W.get(b.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:q,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,N){let q=W.get(b);q.__webglFramebuffer=N,q.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(b,N=0,q=0){Z=b,H=N,X=q;let V=null,G=!1,_e=!1;if(b){let ge=W.get(b);if(ge.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(O.FRAMEBUFFER,ge.__webglFramebuffer),ee.copy(b.viewport),se.copy(b.scissor),re=b.scissorTest,y.viewport(ee),y.scissor(se),y.setScissorTest(re),k=-1;return}else if(ge.__webglFramebuffer===void 0)J.setupRenderTarget(b);else if(ge.__hasExternalTextures)J.rebindTextures(b,W.get(b.texture).__webglTexture,W.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let He=b.depthTexture;if(ge.__boundDepthTexture!==He){if(He!==null&&W.has(He)&&(b.width!==He.image.width||b.height!==He.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");J.setupDepthRenderbuffer(b)}}let Me=b.texture;(Me.isData3DTexture||Me.isDataArrayTexture||Me.isCompressedArrayTexture)&&(_e=!0);let Te=W.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Te[N])?V=Te[N][q]:V=Te[N],G=!0):b.samples>0&&J.useMultisampledRTT(b)===!1?V=W.get(b).__webglMultisampledFramebuffer:Array.isArray(Te)?V=Te[q]:V=Te,ee.copy(b.viewport),se.copy(b.scissor),re=b.scissorTest}else ee.copy(me).multiplyScalar(j).floor(),se.copy(De).multiplyScalar(j).floor(),re=Ne;if(q!==0&&(V=U),y.bindFramebuffer(O.FRAMEBUFFER,V)&&y.drawBuffers(b,V),y.viewport(ee),y.scissor(se),y.setScissorTest(re),G){let ge=W.get(b.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+N,ge.__webglTexture,q)}else if(_e){let ge=N;for(let Me=0;Me<b.textures.length;Me++){let Te=W.get(b.textures[Me]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+Me,Te.__webglTexture,q,ge)}}else if(b!==null&&q!==0){let ge=W.get(b.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,ge.__webglTexture,q)}k=-1};function fc(b){let N=W.get(b);return(N.__readFormat!==b.format||N.__readType!==b.type)&&(N.__readFormat=b.format,N.__readType=b.type,N.__formatReadable=C.textureFormatReadable(b.format),N.__typeReadable=C.textureTypeReadable(b.type)),N}this.readRenderTargetPixels=function(b,N,q,V,G,_e,ve,ge=0){if(!(b&&b.isWebGLRenderTarget)){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=W.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ve!==void 0&&(Me=Me[ve]),Me){y.bindFramebuffer(O.FRAMEBUFFER,Me);try{let Te=b.textures[ge],He=Te.format,qe=Te.type;b.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+ge);let Se=fc(Te);if(Se.__formatReadable===!1){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Se.__typeReadable===!1){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=b.width-V&&q>=0&&q<=b.height-G&&O.readPixels(N,q,V,G,ue.convert(He),ue.convert(qe),_e)}finally{let Te=Z!==null?W.get(Z).__webglFramebuffer:null;y.bindFramebuffer(O.FRAMEBUFFER,Te)}}},this.readRenderTargetPixelsAsync=async function(b,N,q,V,G,_e,ve,ge=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Me=W.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ve!==void 0&&(Me=Me[ve]),Me)if(N>=0&&N<=b.width-V&&q>=0&&q<=b.height-G){y.bindFramebuffer(O.FRAMEBUFFER,Me);let Te=b.textures[ge],He=Te.format,qe=Te.type;b.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+ge);let Se=fc(Te);if(Se.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Se.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Qe=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,Qe),O.bufferData(O.PIXEL_PACK_BUFFER,_e.byteLength,O.STREAM_READ),O.readPixels(N,q,V,G,ue.convert(He),ue.convert(qe),0),O.bindBuffer(O.PIXEL_PACK_BUFFER,null);let _t=Z!==null?W.get(Z).__webglFramebuffer:null;y.bindFramebuffer(O.FRAMEBUFFER,_t);let ct=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await Gh(O,ct,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,Qe),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,_e),O.bindBuffer(O.PIXEL_PACK_BUFFER,null),O.deleteBuffer(Qe),O.deleteSync(ct),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,N=null,q=0){let V=Math.pow(2,-q),G=Math.floor(b.image.width*V),_e=Math.floor(b.image.height*V),ve=N!==null?N.x:0,ge=N!==null?N.y:0;J.setTexture2D(b,0),O.copyTexSubImage2D(O.TEXTURE_2D,q,0,0,ve,ge,G,_e),y.unbindTexture()},this.copyTextureToTexture=function(b,N,q=null,V=null,G=0,_e=0){let ve,ge,Me,Te,He,qe,Se,Qe,_t,ct=b.isCompressedTexture?b.mipmaps[_e]:b.image;if(q!==null)ve=q.max.x-q.min.x,ge=q.max.y-q.min.y,Me=q.isBox3?q.max.z-q.min.z:1,Te=q.min.x,He=q.min.y,qe=q.isBox3?q.min.z:0;else{let mt=Math.pow(2,-G);ve=Math.floor(ct.width*mt),ge=Math.floor(ct.height*mt),b.isDataArrayTexture?Me=ct.depth:b.isData3DTexture?Me=Math.floor(ct.depth*mt):Me=1,Te=0,He=0,qe=0}V!==null?(Se=V.x,Qe=V.y,_t=V.z):(Se=0,Qe=0,_t=0);let at=ue.convert(N.format),Pt=ue.convert(N.type),ye;N.isData3DTexture?(J.setTexture3D(N,0),ye=O.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(J.setTexture2DArray(N,0),ye=O.TEXTURE_2D_ARRAY):(J.setTexture2D(N,0),ye=O.TEXTURE_2D),y.activeTexture(O.TEXTURE0),y.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,N.flipY),y.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),y.pixelStorei(O.UNPACK_ALIGNMENT,N.unpackAlignment);let Ot=y.getParameter(O.UNPACK_ROW_LENGTH),Ze=y.getParameter(O.UNPACK_IMAGE_HEIGHT),en=y.getParameter(O.UNPACK_SKIP_PIXELS),vn=y.getParameter(O.UNPACK_SKIP_ROWS),Wn=y.getParameter(O.UNPACK_SKIP_IMAGES);y.pixelStorei(O.UNPACK_ROW_LENGTH,ct.width),y.pixelStorei(O.UNPACK_IMAGE_HEIGHT,ct.height),y.pixelStorei(O.UNPACK_SKIP_PIXELS,Te),y.pixelStorei(O.UNPACK_SKIP_ROWS,He),y.pixelStorei(O.UNPACK_SKIP_IMAGES,qe);let Ei=b.isDataArrayTexture||b.isData3DTexture,st=N.isDataArrayTexture||N.isData3DTexture;if(b.isDepthTexture){let mt=W.get(b),Xn=W.get(N),lt=W.get(mt.__renderTarget),qn=W.get(Xn.__renderTarget);y.bindFramebuffer(O.READ_FRAMEBUFFER,lt.__webglFramebuffer),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,qn.__webglFramebuffer);for(let Ti=0;Ti<Me;Ti++)Ei&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,W.get(b).__webglTexture,G,qe+Ti),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,W.get(N).__webglTexture,_e,_t+Ti)),O.blitFramebuffer(Te,He,ve,ge,Se,Qe,ve,ge,O.DEPTH_BUFFER_BIT,O.NEAREST);y.bindFramebuffer(O.READ_FRAMEBUFFER,null),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(G!==0||b.isRenderTargetTexture||W.has(b)){let mt=W.get(b),Xn=W.get(N);y.bindFramebuffer(O.READ_FRAMEBUFFER,L),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,B);for(let lt=0;lt<Me;lt++)Ei?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,mt.__webglTexture,G,qe+lt):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,mt.__webglTexture,G),st?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Xn.__webglTexture,_e,_t+lt):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Xn.__webglTexture,_e),G!==0?O.blitFramebuffer(Te,He,ve,ge,Se,Qe,ve,ge,O.COLOR_BUFFER_BIT,O.NEAREST):st?O.copyTexSubImage3D(ye,_e,Se,Qe,_t+lt,Te,He,ve,ge):O.copyTexSubImage2D(ye,_e,Se,Qe,Te,He,ve,ge);y.bindFramebuffer(O.READ_FRAMEBUFFER,null),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else st?b.isDataTexture||b.isData3DTexture?O.texSubImage3D(ye,_e,Se,Qe,_t,ve,ge,Me,at,Pt,ct.data):N.isCompressedArrayTexture?O.compressedTexSubImage3D(ye,_e,Se,Qe,_t,ve,ge,Me,at,ct.data):O.texSubImage3D(ye,_e,Se,Qe,_t,ve,ge,Me,at,Pt,ct):b.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,_e,Se,Qe,ve,ge,at,Pt,ct.data):b.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,_e,Se,Qe,ct.width,ct.height,at,ct.data):O.texSubImage2D(O.TEXTURE_2D,_e,Se,Qe,ve,ge,at,Pt,ct);y.pixelStorei(O.UNPACK_ROW_LENGTH,Ot),y.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Ze),y.pixelStorei(O.UNPACK_SKIP_PIXELS,en),y.pixelStorei(O.UNPACK_SKIP_ROWS,vn),y.pixelStorei(O.UNPACK_SKIP_IMAGES,Wn),_e===0&&N.generateMipmaps&&O.generateMipmap(ye),y.unbindTexture()},this.initRenderTarget=function(b){W.get(b).__webglFramebuffer===void 0&&J.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?J.setTextureCube(b,0):b.isData3DTexture?J.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?J.setTexture2DArray(b,0):J.setTexture2D(b,0),y.unbindTexture()},this.resetState=function(){H=0,X=0,Z=null,y.reset(),xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}};function Su(){let i=new kt,e=new on({color:"#ef4444",roughness:.65}),t=new on({color:3484469}),n=new wn(.055,.055,1,8),s=new xi(1,14,10),r=new rn(1,1,1),a=[],o=[],c={id:"red",color:"#ef4444"},l=null,u=(S,f,d,w,I,E,v=1,M=1,A=1)=>{let g=new pt(S,f);return g.position.set(w,I,E),g.scale.set(v,M,A),g.castShadow=!0,d.add(g),g};u(n,e,i,0,.96,0,1,.52,1);let m=u(s,e,i,0,1.65-.25,0,.25,.25,.25);for(let S of[-.08,.08])u(s,t,i,S,1.65-.2,.228,.024,.031,.016);let h=Array.from({length:13},(S,f)=>{let d=Math.PI+f*Math.PI/12;return new D(Math.cos(d)*.105,1.65-.27+Math.sin(d)*.075,.236)}),p=new zs(new Ji(h),16,.015,5,!1);u(p,t,i,0,0,0);for(let[S,f,d]of[[-.19,1.15,.43],[.19,1.15,.43],[-.12,.73,.65],[.12,.73,.65]]){let w=new kt;w.position.set(S,f,0),i.add(w),u(n,e,w,0,-d/2,0,1,d,1),u(s,e,w,0,-d,0,.07,.07,.07),a.push(w)}function x(S){if(S?.id===l?.id)return;for(let d of o)d.parent.remove(d),d.material.dispose();if(o.length=0,l=S,!S)return;let f=(d,w,I,E,v,M,A,g)=>{let _=u(r,new on({color:w,roughness:.9}),d,I,E,v,M,A,g);return o.push(_),_};f(i,S.top,0,.97,0,.36,.46,.22),f(i,S.accent,0,1.18,.025,.3,.04,.23);for(let d=0;d<2;d++)f(a[d],S.top,0,-.12,0,.16,.25,.18);for(let d=2;d<4;d++)f(a[d],S.pants,0,-.26,0,.17,.5,.19),f(a[d],S.shoes,0,-.6,.055,.21,.14,.32),f(a[d],S.accent,0,-.66,.055,.215,.025,.33);if(S.pattern==="striped")for(let d=0;d<3;d++)f(i,S.accent,0,.83+d*.11,.115,.36,.028,.012);if(S.pattern==="checks")for(let d=0;d<3;d++)f(i,S.accent,-.12+d*.12,.97,.115,.025,.43,.012),f(i,S.accent,0,.84+d*.12,.12,.36,.025,.012);if(S.pattern==="trim"){f(i,S.accent,0,.98,.12,.025,.4,.012);for(let d=0;d<2;d++)f(a[d],S.accent,0,-.23,0,.17,.035,.19)}S.pattern==="pocket"&&(f(i,S.accent,-.09,.99,.125,.1,.11,.025),f(i,S.pants,0,.78,.13,.25,.11,.025))}return{group:i,setOutfit:x,setSkin(S){c=S,e.color.set(S.id==="rainbow"?"#ed738c":S.color)},update(S,f,d){i.position.set(S.x,S.y,S.z),i.rotation.y=d?Math.PI+.15:S.yaw;let w=Math.hypot(S.vx,S.vz),I=Math.sin(f*(w>.1?12:2.5))*(w>.1?.65:.12);a.forEach((E,v)=>{E.rotation.x=(v%2?-1:1)*I,E.rotation.z=v<2?v?-.12:.12:0}),m.rotation.z=Math.sin(f*2)*.04,c.id==="rainbow"&&e.color.setHSL(f*.13%1,.75,.53)},outfit(){return l?.id??""},dispose(){x(null);for(let S of[n,s,r,p])S.dispose();e.dispose(),t.dispose()}}}function bu(i=2){let e=[],t=[];for(let s=0;s<=i;s++)for(let r=0;r<=2;r++){let a=s/i,o=(r/2-.5)*2,c=Math.sin(a*Math.PI)*.55+.04;e.push(o*c,a,Math.sin(a*Math.PI)*.2+o*o*.08)}for(let s=0;s<i;s++)for(let r=0;r<2;r++){let a=s*3+r;t.push(a,a+1,a+3,a+1,a+4,a+3)}let n=new Mt;return n.setAttribute("position",new Je(e,3)),n.setIndex(t),n.computeVertexNormals(),n}function $0(){let i=new Mt;return i.setAttribute("position",new Je([-.5,-.5,0,.5,-.5,0,-.32,-.12,.03,.32,-.12,.03,-.12,.24,.11,.12,.24,.11,.04,.5,.21],3)),i.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]),i.computeVertexNormals(),i}function Eu(i,e,t){let n=new yt,s=new Map,r=[],a=[],o=e.platforms,c=null,l=null,u=0,m={box:new rn(1,1,1),ball:new xi(1,6,4),branch:new wn(.12,1,1,7),petal:bu(),blossom:bu(4),cone:new Us(1,1,7),blade:$0()},h=Math.min(...o.map(v=>v.x))-35,p=Math.max(...o.map(v=>v.x))+35,x=Math.min(...o.map(v=>v.z))-35,S=Math.max(...o.map(v=>v.z))+35,f=(v,M,A)=>o.every(g=>Math.abs(v-g.x)>g.w/2+A||Math.abs(M-g.z)>g.d/2+A),d=(v,M,A,g,_,T,R,P,U=0,L=0,B=0)=>{let H=`${v}-${M}`;s.has(H)||s.set(H,{kind:v,color:M,items:[]}),s.get(H).items.push({x:A,y:g,z:_,sx:T,sy:R,sz:P,rx:U,ry:L,rz:B})},w=(v,M,A)=>{n.position.set(v.x,v.y,v.z),n.rotation.set(v.rx||0,v.ry||0,v.rz||0),n.scale.set(v.sx,v.sy,v.sz),n.updateMatrix(),A.setMatrixAt(M,n.matrix)},I=(v,M,A,g,_,T,R)=>d("branch",7820100,v,M,A,_,g,_,Math.sin(R)*T,0,Math.cos(R)*T);function E(v,M,A,g){let _=3.8+A%3*.55,T=-2.67;I(v,T+_/2,M,_,.2,0,0);for(let P=0;P<4;P++)d("branch",9661521,v+Math.sin(P*1.257)*.16,T+_*.47,M+Math.cos(P*1.257)*.16,.035,_*.68,.035);let R=(P,U,L)=>{let B=new D().subVectors(U,P),H=new sn().setFromQuaternion(new nn().setFromUnitVectors(new D(0,1,0),B.clone().normalize())),X=P.clone().add(U).multiplyScalar(.5);d("branch",7820100,X.x,X.y,X.z,L,B.length(),L,H.x,H.y,H.z)};for(let P=0;P<5;P++){let U=P*2.399+A*.5,L=T+_*(.56+P*.052),B=Math.cos(U),H=Math.sin(U),X=new D(v+B*.95,L+.6,M+H*.95);R(new D(v,L,M),X,.1);for(let Z=0;Z<2;Z++){let k=U+(Z?.38:-.38),$=X.x+Math.cos(k)*.8,ee=X.z+Math.sin(k)*.8,se=X.y+.6+Z*.15;if(R(X,new D($,se,ee),.055),g)for(let re=0;re<(A<3?8:3);re++){let Ve=re*2.399+P,Oe=$+Math.cos(Ve)*(.18+re%3*.17),Ge=se+Math.sin(re*1.7)*.35,Y=ee+Math.sin(Ve)*(.18+re%3*.17);for(let j=0;j<5;j++)d(A<3?"blossom":"petal",[16103628,15771071,16369624][(re+P)%3],Oe,Ge,Y,.23,.29,.24,1.1,j*1.257,0);d("box",14192296,Oe,Ge+.015,Y,.04,.03,.04)}else for(let re=0;re<7;re++)d("petal",[5274968,7050334,8758375][(re+A)%3],$+Math.sin(re*2.399)*.6,se+Math.cos(re)*.3,ee+Math.cos(re*2.399)*.6,.6,.85,.65,1.15,re*2.399,0)}}}if(d("box",t.ground,(h+p)/2,-3.2,(x+S)/2,p-h,1,S-x),e.theme!=="city"){let v=(M,A,g)=>{let _=[],T=[];for(let U=0;U<=30;U++){let L=h+(p-h)*U/30,B=6+Math.sin(L*.12)*2.3,H=M*(1+Math.sin(L*.18)*.08);if(_.push(L,A,B-H,L,A,B+H),U<30){let X=U*2;T.push(X,X+2,X+1,X+1,X+2,X+3)}}let R=new Mt;R.setAttribute("position",new Je(_,3)),R.setIndex(T),R.computeVertexNormals();let P=new pt(R,new ti({color:g,side:Gt}));P.receiveShadow=!0,i.add(P)};v(2.4,-2.66,12240544),v(1.8,-2.64,8567746);for(let M=0;M<30;M++){let A=h+M*(p-h)/30;d("ball",[11581088,10792089][M%2],A,-2.63,3.6+Math.sin(A*.12)*2.3,.65,.16,.4)}for(let M=0;M<8;M++)d("ball",[9284989,9876869,10993809][M%3],h+M*(p-h)/7,-3,S-10+M%2*5,12,4+M%3,10),d("ball",[10139530,11584154][M%2],p-9,-3,x+M*(S-x)/7,11,3+M%4,13);if(e.theme==="cabin")for(let M=0;M<16;M++){let A=h+5+M*(p-h)/16,g=S-12+M%3*3;d("branch",7625285,A,-.6,g,.12,4.2,.12);for(let _=0;_<3;_++)d("cone",[5536608,6589032][M%2],A,.2+_*.7,g,1.4-_*.25,2.2,1.4-_*.25)}}for(let v=0;v<12;v++){let M=o[v<3?0:v%o.length],A=v<3||v%2?-1:1,g=M.z+(v<3?3+v*3:v*7%9+2),_=M.x+A*(v<3?5.5+v*2:6.5+v%3*2);e.theme==="city"&&v<3&&(_=e.spawn.x+10+v*6,g=e.spawn.z-4.8);for(let T=0;T<16&&!f(_,g,e.theme==="city"?2:2.8);T++)_+=A*2;if(f(_,g,e.theme==="city"?2:2.8))if(e.theme==="city"){let T=v<3?5.5+v:3+v%5*1.35;d("box",[9546163,11978700,8229533][v%3],_,-2.7+T/2,g,3,T,3.1),d("box",5401719,_,-2.65+T,g,3.3,.2,3.4);for(let R=0;R<Math.floor(T/.7);R++)for(let P=0;P<3;P++){let U=(R+P)%3?13036014:16112544;d("box",U,_-1+P,-2+R*.7,g+1.56,.43,.35,.025),d("box",U,_-1.51,-2+R*.7,g-1+P,.025,.35,.43)}d("box",6454408,_+.6,-2.5+T,g+.5,.7,.4,.8)}else E(_,g,v,e.theme==="sakura")}if(e.theme==="flowers")for(let v=0;v<160;v++){let M=o[v%o.length],A=v*2.399,g=v<48?e.spawn.x+5+v%8*.4:M.x+Math.cos(A)*(4+v%5),_=v<48?e.spawn.z-3.4-Math.floor(v/8)*.35:M.z+Math.sin(A)*(4+v%5),T=-2.06+v%3*.09;d("branch",4816971,g,-2.35,_,.025,.7,.025);for(let R=0;R<6;R++)d("petal",[16235210,16175452,11773151,16052703][v%4],g,T,_,.24,.27,.24,1.25,R*1.047,0);d("ball",14657331,g,T+.015,_,.075,.065,.075);for(let R of[-1,1])d("petal",5081439,g,-2.33,_,.22,.35,.25,.8,R,R*.8)}if(e.theme==="cabin")for(let v=0;v<4;v++){let M=o[v*3%o.length],A=v<2?e.spawn.z-4.8:M.z+5,g=v<2?e.spawn.x+5.5+v*8:M.x-7;for(let _=0;_<16&&!f(g,A,3);_++)g-=3;d("box",12094561,g,-1.3,A,3.8,2.8,3);for(let _=0;_<8;_++)d("branch",9201738,g,-2.5+_*.32,A+1.53,.13,3.9,.13,0,0,Math.PI/2);for(let _ of[-1,1])d("box",7556933,g+_*.98,.65,A,2.8,.16,3.8,0,0,-_*.55);d("box",5799042,g-1,-1.25,A+1.55,.7,.7,.05),d("box",5799042,g-1.92,-1.25,A,.05,.7,.7),d("box",7228988,g+.8,-1.65,A+1.55,.8,1.7,.06),d("box",8023652,g+.9,1.1,A+.6,.4,1.4,.4),d("box",13675127,g,-2.5,A+2.2,4.4,.22,1.1)}if(e.theme==="city"){d("box",5464681,(h+p)/2,-2.63,-8.5,p-h,.12,4);for(let v=h;v<p;v+=4)d("box",16115901,v,-2.55,-8.5,2,.025,.1);for(let v=0;v<5;v++){let M=new kt;i.add(M);for(let[A,g,_,T,R,P,U]of[[14986641,0,.35,0,1.6,.5,.8],[4808811,0,.7,0,.75,.3,.65],[3161155,-.5,.15,-.43,.3,.3,.12],[3161155,.5,.15,-.43,.3,.3,.12],[3161155,-.5,.15,.43,.3,.3,.12],[3161155,.5,.15,.43,.3,.3,.12]]){let L=new pt(m.box,new on({color:A}));L.position.set(g,_,T),L.scale.set(R,P,U),L.castShadow=!0,M.add(L)}M.position.set(e.spawn.x+3+v*7,-2.5,-8.5+(v%2-.5)*1.6),a.push({car:M,speed:1+v*.2})}for(let v of o)for(let M of[-1,1]){d("box",7505038,v.x,v.y+.5,v.z+M*v.d/2,v.w,.05,.05);for(let A of[-.4,.4])d("box",7505038,v.x+v.w*A,v.y+.25,v.z+M*v.d/2,.04,.5,.04)}}for(let{kind:v,color:M,items:A}of s.values()){let g=new ti({color:M,side:v==="petal"||v==="blossom"?Gt:An}),_=new kn(m[v],g,A.length);_.castShadow=v!=="petal"&&v!=="blossom"&&M!==14192296,_.receiveShadow=v!=="petal"&&v!=="blossom",A.forEach((T,R)=>w(T,R,_)),i.add(_)}if(e.theme!=="city"){for(let v of o)for(let M=0;M<28;M++){let A=M%2?-1:1,g=(M/28-.5)*.82;r.push({x:v.x+(M%4<2?A*v.w*.43:g*v.w),y:v.y+.13,z:v.z+(M%4<2?g*v.d:A*v.d*.43),sx:.07,sy:.18+M%5*.035,sz:1,ry:M*2.399,bend:0})}for(let v=0;v<320;v++){let M=o[v%o.length],A=v*2.399,g=4+v%9;r.push({x:M.x+Math.cos(A)*g,y:-2.43,z:M.z+Math.sin(A)*g,sx:.12,sy:.3+v%7*.035,sz:1,ry:A,bend:0})}c=new kn(m.blade,new ti({color:8167012,side:Gt}),r.length),c.receiveShadow=!0,c.instanceMatrix.setUsage(oo),i.add(c),l=new kn(m.petal,new ti({color:e.theme==="sakura"?16762072:10991471,side:Gt}),72),l.instanceMatrix.setUsage(oo),i.add(l)}return{update(v,M,A){if(u=0,c){let g=v.grounded&&Math.hypot(v.vx,v.vz)>.2;for(let[_,T]of r.entries()){let R=Math.max(0,1-Math.hypot(T.x-v.x,T.z-v.z)/1.35);T.bend*=Math.exp(-M*5),g&&Math.abs(T.y-v.y)<.8&&(T.bend=Math.min(.7,T.bend+R*M*8)),u=Math.max(u,T.bend),T.rz=Math.sin(A*1.8+_)*.07+T.bend,w(T,_,c)}c.instanceMatrix.needsUpdate=!0}if(l){for(let g=0;g<l.count;g++){let _=o[g%o.length],T=A+g*.43;n.position.set(_.x+Math.sin(T*.38+g)*5,5-T*.55%7.5,_.z+Math.cos(T*.25+g)*5),n.rotation.set(T,g,T*.7),n.scale.set(.12,.18,.13),n.updateMatrix(),l.setMatrixAt(g,n.matrix)}l.instanceMatrix.needsUpdate=!0}for(let{car:g,speed:_}of a)g.position.x+=M*_,g.position.x>p&&(g.position.x=h)},grassResponse(){return u}}}var _o={morning:{hemi:15530239,sky:13231343,sun:16772558,ground:6585960,ambient:2.4,intensity:3.4,direction:[-8,17,-10]},dawn:{hemi:16765369,sky:15975603,sun:16758652,ground:8547704,ambient:1.8,intensity:2.3,direction:[-22,6,-15]},night:{hemi:9613008,sky:2307920,sun:10799606,ground:3491671,ambient:1.15,intensity:.65,direction:[10,15,-12]}};function Tu(i,e,t){let n="morning",s=2,r=_o.morning,a=_o.morning,o={sky:new Fe,sun:new Fe,ground:new Fe,hemi:new Fe,ambient:2.4,intensity:3.4,direction:new D},c=new Fe,l=new Fe;function u(m,h){s=Math.min(2,s+m);let p=s/2;p=p*p*(3-2*p);for(let x of["sky","sun","ground","hemi"])o[x].copy(l.set(r[x])).lerp(c.set(a[x]),p);o.ambient=r.ambient+(a.ambient-r.ambient)*p,o.intensity=r.intensity+(a.intensity-r.intensity)*p;for(let[x,S]of["x","y","z"].entries())o.direction[S]=r.direction[x]+(a.direction[x]-r.direction[x])*p;i.background.copy(o.sky),i.fog.color.copy(o.sky),e.color.copy(o.sun),e.intensity=o.intensity,t.color.copy(o.hemi),t.groundColor.copy(o.ground),t.intensity=o.ambient,e.position.copy(h).add(o.direction),e.target.position.copy(h)}return{set(m){_o[m]&&(r={sky:o.sky.getHex(),sun:o.sun.getHex(),ground:o.ground.getHex(),hemi:o.hemi.getHex(),ambient:o.ambient,intensity:o.intensity,direction:o.direction.toArray()},a=_o[m],n=m,s=0)},update:u,info(){return{timeOfDay:n,sunIntensity:o.intensity}}}}var J0={sakura:{ground:8367480,top:16574942,edge:12094610,accent:15830708},flowers:{ground:7776377,top:16378047,edge:11903104,accent:15246418},city:{ground:9415333,top:14083560,edge:6520456,accent:5686734},cabin:{ground:7181426,top:14990988,edge:8414540,accent:15118950}};function wu(i){let e=new fo({canvas:i,antialias:!0,powerPreference:"high-performance"});e.setPixelRatio(Math.min(devicePixelRatio||1,1.5)),e.shadowMap.enabled=!0,e.shadowMap.type=_a,e.outputColorSpace=zt,e.toneMapping=Ys,e.toneMappingExposure=1.1;let t=0,n=16,s=0,r=0,a=new ws,o=new Nt(45,1,.1,220);a.background=new Fe(13231343),a.fog=new Ts(13231343,35,115);let c=new Gs(15530239,5465690,2.4);a.add(c);let l=new Ws(16771536,3.4);l.castShadow=!0,l.shadow.mapSize.set(1024,1024),Object.assign(l.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:.1,far:65}),l.shadow.normalBias=.04,l.shadow.bias=-1e-4,a.add(l,l.target);let u=Su();a.add(u.group);let m=Tu(a,l,c);m.update(2,new D);let h=new pt(new Ns(.25*1.8,24),new _i({color:2505524,transparent:!0,opacity:.22,depthWrite:!1}));h.rotation.x=-Math.PI/2,a.add(h);let p=null,x=null,S=0,f=!0,d=new kt,w=null,I=0,E=.56,v=0;a.add(d);let M=[],A=[],g=[],_=new D,T=new D,R=new D,P=new Xs,U=()=>{let Z=new Set,k=new Set;d.traverse($=>{if($.geometry&&Z.add($.geometry),$.material)for(let ee of Array.isArray($.material)?$.material:[$.material])k.add(ee)});for(let $ of Z)$.dispose();for(let $ of k)$.dispose();a.remove(d)};function L(Z){U(),d=new kt,a.add(d),p=Z,x=null,S=0,f=!0,M.length=0,A.length=0,g.length=0;let k=J0[p.theme],$=new rn(1,1,1),ee=new Map,se=(ie,be,me,De,Ne,Ie=1,Ye=1,it=1)=>{ee.has(be)||ee.set(be,new on({color:be,roughness:.8}));let ze=new pt(ie,ee.get(be));return ze.position.set(me,De,Ne),ze.scale.set(Ie,Ye,it),ze.castShadow=!0,ze.receiveShadow=!0,d.add(ze),ze},re=new yt,Ve=(ie,be,me)=>{let De=new kn($,new on({color:ie,roughness:.8}),be.length);return De.castShadow=me,De.receiveShadow=!0,be.forEach((Ne,Ie)=>{re.position.set(Ne.x,Ne.y,Ne.z),re.scale.set(Ne.w,Ne.h,Ne.d),re.updateMatrix(),De.setMatrixAt(Ie,re.matrix)}),d.add(De),De};M.push(Ve(k.edge,p.platforms.map(ie=>({...ie,y:ie.y-ie.h/2})),!0)),Ve(k.top,p.platforms.map(ie=>({...ie,y:ie.y+.014,h:.028})),!1),Ve(k.accent,p.platforms.flatMap(ie=>[-1,1].map(be=>({x:ie.x,y:ie.y+.035,z:ie.z+be*(ie.d/2-.1),w:ie.w-.16,h:.02,d:.07}))),!1),w=Eu(d,p,k);let Oe=new Ki(.18,.065,6,12);for(let ie of p.coins)A.push({m:se(Oe,16106831,ie.x,ie.y,ie.z),coin:ie});let Ge=new wn(.6,.6,.04,20);for(let ie of p.checkpoints){let be=se(Ge,6603442,ie.x,ie.y+.035,ie.z);be.material=be.material.clone(),g.push({m:be,point:ie}),se($,15724254,ie.x-.5,ie.y+.75,ie.z,.05,1.5,.05),se($,7527626,ie.x-.22,ie.y+1.35,ie.z,.55,.34,.04)}let Y=p.goal;for(let ie of[-.7,.7])se($,k.accent,Y.x+ie,Y.y+1.125,Y.z,.16,2.25,.2);se($,k.accent,Y.x,Y.y+2.25,Y.z,1.56,.2,.2);let j=se(new Ki(.52,.055,8,24),16771238,Y.x,Y.y+1.3,Y.z);j.material.emissive.set(14984776),j.material.emissiveIntensity=.5,B()}function B(){f=!0;let Z=0;if(x){let ee=p.platforms.map(se=>Math.hypot(se.x-x.x,se.z-x.z)+Math.abs(se.y-x.y));Z=ee.indexOf(Math.min(...ee))}let k=p?.platforms[Z],$=p?.platforms[Z+1];I=$?Math.atan2($.x-k.x,$.z-k.z):I,E=.56}function H(){let Z=i.getBoundingClientRect();e.setSize(Math.max(1,Z.width),Math.max(1,Z.height),!1),o.aspect=Z.width/Math.max(1,Z.height),o.updateProjectionMatrix()}function X(Z,k,$,ee=!1){if(!p)return;v+=Math.min(k,.05);let se=Z.player,re=["home","shop","levels","editor"].includes($);if(x=se,se.grounded){let Ne=p.platforms.findIndex(Ie=>Math.abs(se.y-Ie.y)<.08&&Math.abs(se.x-Ie.x)<=Ie.w/2&&Math.abs(se.z-Ie.z)<=Ie.d/2);Ne>=0&&(S=Ne)}let Ve=p.platforms[S+1];if(!re&&f&&!ee&&Ve&&se.grounded&&Math.hypot(se.vx,se.vz)<.2){let Ne=p.platforms[S],Ie=Math.atan2(Ve.x-Ne.x,Ve.z-Ne.z),Ye=Math.atan2(Math.sin(Ie-I),Math.cos(Ie-I));I+=Ye*(1-Math.exp(-k*5))}($==="home"||$==="playing")&&k>0&&(n=n*.85+k*1e3*.15),u.update(se,v,re),w.update(se,k,v);let Oe=-2.65;for(let Ne of p.platforms)Math.abs(se.x-Ne.x)<=Ne.w/2&&Math.abs(se.z-Ne.z)<=Ne.d/2&&Ne.y<=se.y+.02&&(Oe=Math.max(Oe,Ne.y));h.position.set(se.x,Oe+.055,se.z),h.material.opacity=.25/Math.max(1,se.y-Oe+1),h.scale.setScalar(Math.min(1.8,1+(se.y-Oe)*.1));for(let{m:Ne,coin:Ie}of A)Ne.visible=!Z.collected.has(Ie.id),Ne.rotation.y=v*2,Ne.position.y=Ie.y+Math.sin(v*3)*.035;for(let{m:Ne,point:Ie}of g)Ne.material.color.set(Z.checkpoint.id===Ie.id?16767113:6603442);let Ge=p.platforms[1],Y=Ge?Math.atan2(Ge.x-p.spawn.x,Ge.z-p.spawn.z):0,j=re?I-Y:I;u.group.rotation.y=re?Math.PI+j:se.yaw;let ie=Math.min(2.4,o.aspect*1.6),be=!re&&f&&Ve?.15:0;_.set(se.x+(re?ie:(Ve?.x-se.x||0)*be),se.y+.9,se.z+(Ve?.z-se.z||0)*be);let me=re?9:o.aspect<.75?17:10.5;T.set(_.x-Math.sin(j)*me*Math.cos(E),_.y+Math.sin(E)*me,_.z-Math.cos(j)*me*Math.cos(E)),R.copy(T).sub(_).normalize(),P.set(_,R),P.far=_.distanceTo(T);let De=P.intersectObjects(M,!1)[0];if(De&&De.distance>1){let Ne=p.platforms[De.instanceId];T.y=Math.max(T.y,(Ne?.y??_.y)+3)}o.position.copy(T),o.lookAt(_),m.update(k,u.group.position)}return H(),{setLevel:L,setSkin:u.setSkin,setOutfit:u.setOutfit,setTimeOfDay:m.set,update:X,render(){let Z=performance.now();e.render(a,o);let k=performance.now()-Z;t=s++?t*.9+k*.1:k,s>8&&Math.max(t,n)>35?r++:r=0,r>=12&&e.getPixelRatio()>.65&&(e.setPixelRatio(Math.max(.65,e.getPixelRatio()*.8)),H(),r=0),r>=12&&l.shadow.mapSize.x>512&&(l.shadow.map?.dispose(),l.shadow.map=null,l.shadow.mapSize.set(512,512),e.shadowMap.needsUpdate=!0,r=0)},resize:H,orbit(Z,k){f=!1,I-=Z*.007,E=Ll.clamp(E+k*.004,.2,1.15)},resetCamera:B,info(){return{yaw:I,theme:p?.theme,...m.info(),grassResponse:w?.grassResponse()??0,outfit:u.outfit(),triangles:e.info.render.triangles,drawCalls:e.info.render.calls,resources:{geometries:e.info.memory.geometries,textures:e.info.memory.textures},dpr:e.getPixelRatio(),renderMs:t,frameMs:n,shadowSize:l.shadow.mapSize.x,cameraDistance:o.position.distanceTo(_)}},dispose(){U(),u.dispose(),h.geometry.dispose(),h.material.dispose(),l.shadow.dispose(),e.dispose()}}}function Au(i,e,t,{onJump:n,onOrbit:s,onInteract:r}){let a=new AbortController,o=new Set,c={x:0,z:0},l=(f,d,w)=>f.addEventListener(d,w,{signal:a.signal}),u=null,m=null,h=e.querySelector("span"),p=()=>{c.x=0,c.z=0,m=null,h.style.transform="translate(0px,0px)"},x=()=>{o.clear(),u=null,p()};l(window,"keydown",f=>{f.target.closest?.("input,select,textarea,button,a")||!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","KeyW","KeyA","KeyS","KeyD","Space"].includes(f.code)||(f.preventDefault(),r(),o.add(f.code))}),l(window,"keyup",f=>o.delete(f.code)),l(window,"blur",x),l(document,"visibilitychange",()=>{document.hidden&&x()}),l(i,"pointerdown",f=>{u||f.button>0||(r(),u={id:f.pointerId,x:f.clientX,y:f.clientY,startX:f.clientX,startY:f.clientY,moved:!1},i.setPointerCapture(f.pointerId))}),l(i,"pointermove",f=>{if(!u||u.id!==f.pointerId)return;let d=f.clientX-u.x,w=f.clientY-u.y;Math.hypot(f.clientX-u.startX,f.clientY-u.startY)>6&&(u.moved=!0),u.moved&&s(d,w),u.x=f.clientX,u.y=f.clientY}),l(i,"pointerup",f=>{if(!u||u.id!==f.pointerId)return;let d=u.moved||Math.hypot(f.clientX-u.startX,f.clientY-u.startY)>6;u=null,d||n()}),l(i,"pointercancel",()=>{u=null});let S=f=>{let d=e.getBoundingClientRect(),w=d.width*.32,I=(f.clientX-d.x-d.width/2)/w,E=-(f.clientY-d.y-d.height/2)/w,v=Math.max(1,Math.hypot(I,E));I/=v,E/=v,c.x=I,c.z=E,h.style.transform=`translate(${I*w}px,${-E*w}px)`};l(e,"pointerdown",f=>{m===null&&(f.preventDefault(),r(),m=f.pointerId,e.setPointerCapture(f.pointerId),S(f))}),l(e,"pointermove",f=>{m===f.pointerId&&S(f)});for(let f of["pointerup","pointercancel","lostpointercapture"])l(e,f,d=>{m===d.pointerId&&p()});return l(t,"pointerdown",f=>{f.preventDefault(),r(),n()}),l(t,"keydown",f=>{(f.code==="Space"||f.code==="Enter")&&(f.preventDefault(),r(),n())}),l(i,"contextmenu",f=>f.preventDefault()),{sample(f){let d=c.x+Number(o.has("KeyD")||o.has("ArrowRight"))-Number(o.has("KeyA")||o.has("ArrowLeft")),w=c.z+Number(o.has("KeyW")||o.has("ArrowUp"))-Number(o.has("KeyS")||o.has("ArrowDown")),I=Math.cos(f),E=Math.sin(f);return{x:-d*I+w*E,z:w*I+d*E,jump:o.has("Space")}},clear:x,dispose(){x(),a.abort()}}}var Cu="glow-parkour-level-v1",K0=new Set(["sakura","flowers","city","cabin"]),j0={x:[-100,100],z:[-100,100],y:[-2,30],w:[1,20],d:[1,20],h:[.2,10]};function Ru(){return{id:"custom",name:"\u6211\u7684\u5FAE\u5149\u8DEF\u7EBF",theme:"sakura",difficulty:1,custom:!0,tutorial:!1,platforms:[{id:"p0",x:0,z:0,y:0,w:4,d:4,h:.6},{id:"p1",x:5,z:0,y:.3,w:3,d:3,h:.6}],spawn:{x:0,y:0,z:0},goal:{x:5,y:.3,z:0},coins:[],checkpoints:[]}}function ar(i){let e=[],t=new Set;if(!i||typeof i!="object"||Array.isArray(i))return{ok:!1,errors:["\u5173\u5361\u6570\u636E\u5FC5\u987B\u662F\u5BF9\u8C61"],level:null};let n=(h,p)=>typeof h=="string"&&h.trim()?h.slice(0,80):p,s=(h,p,x,S=!1)=>{let f={};if(!h||typeof h!="object"||Array.isArray(h))return e.push(`${p}\u6570\u636E\u4E0D\u5B8C\u6574`),f;S&&(typeof h.id!="string"||!h.id.trim()||h.id.length>80||t.has(h.id)?e.push(`${p}\u9700\u8981\u552F\u4E00ID`):(f.id=h.id,t.add(h.id)));for(let d of x){let[w,I]=j0[d],E=h[d];!Number.isFinite(E)||E<w||E>I?e.push(`${p}.${d}\u8D85\u51FA\u8303\u56F4`):f[d]=E}return f},r=(h,p,x,S)=>!Array.isArray(h)||h.length>S?(e.push(`${p}\u6570\u91CF\u8D85\u51FA\u9650\u5236\u6216\u683C\u5F0F\u9519\u8BEF`),[]):h.map((f,d)=>s(f,`${p}${d+1}`,x,!0)),a=r(i.platforms,"\u5E73\u53F0",["x","z","y","w","d","h"],80);a.length||e.push("\u81F3\u5C11\u9700\u8981\u4E00\u4E2A\u5E73\u53F0");let o=s(i.spawn,"\u8D77\u70B9",["x","y","z"]),c=s(i.goal,"\u7EC8\u70B9",["x","y","z"]),l=r(i.coins??[],"\u91D1\u5E01",["x","y","z"],160),u=r(i.checkpoints??[],"\u5B58\u6863\u70B9",["x","y","z"],80);K0.has(i.theme)||e.push("\u8BF7\u9009\u62E9\u6709\u6548\u4E3B\u9898"),i.difficulty!==void 0&&(!Number.isInteger(i.difficulty)||i.difficulty<1||i.difficulty>12)&&e.push("\u96BE\u5EA6\u9700\u8981\u662F1\u523012\u4E4B\u95F4\u7684\u6574\u6570");let m=(h,p=!1)=>a.some(x=>Math.abs(h.x-x.x)<=x.w/2&&Math.abs(h.z-x.z)<=x.d/2&&(p?h.y>=x.y&&h.y<=x.y+2.25:Math.abs(h.y-x.y)<1e-7));if(!e.length){m(o)||e.push("\u8D77\u70B9\u9700\u8981\u540C\u9AD8\u5EA6\u7684\u5E73\u53F0\u652F\u6491"),m(c)||e.push("\u7EC8\u70B9\u9700\u8981\u540C\u9AD8\u5EA6\u7684\u5E73\u53F0\u652F\u6491");for(let h of u)m(h)||e.push("\u5B58\u6863\u70B9\u9700\u8981\u540C\u9AD8\u5EA6\u7684\u5E73\u53F0\u652F\u6491");for(let h of l)m(h,!0)||e.push("\u91D1\u5E01\u9700\u8981\u4F4D\u4E8E\u5E73\u53F0\u4E0A\u65B9")}return e.length?{ok:!1,errors:e,level:null}:{ok:!0,errors:[],level:{id:n(i.id,"custom"),name:n(i.name,"\u6211\u7684\u5FAE\u5149\u8DEF\u7EBF"),theme:i.theme,difficulty:Number.isInteger(i.difficulty)&&i.difficulty>=1&&i.difficulty<=12?i.difficulty:1,platforms:a,spawn:o,goal:c,coins:l,checkpoints:u,custom:!0,tutorial:!1}}}function ec(i){try{return ar(JSON.parse(i.getItem(Cu))).level}catch{return null}}function Iu(i,e){try{let t=ar(e);return t.ok?(i.setItem(Cu,JSON.stringify(t.level)),!0):!1}catch{return!1}}var Q0=[["sakura","\u6A31\u82B1\u6797"],["flowers","\u767E\u82B1\u6797"],["city","\u57CE\u5E02"],["cabin","\u6797\u95F4\u6728\u5C4B"]];function Pu(i,{onPlay:e,onClose:t,onStatus:n}){i.innerHTML=`<section class="editor-header"><div><span class="eyebrow">YOUR LITTLE WORLD</span><h2>\u642D\u4E00\u6761\u81EA\u5DF1\u7684\u8DEF\u7EBF</h2></div><button id="editor-close" aria-label="\u5173\u95ED\u7F16\u8F91\u5668">\u2715</button></section>
    <p class="editor-note">\u81EA\u521B\u91D1\u5E01\u53EA\u4F5C\u7EC3\u4E60\uFF0C\u4E0D\u589E\u52A0\u5546\u5E97\u4F59\u989D\u3002\u4FDD\u5B58\u524D\u68C0\u67E5\u8D77\u7EC8\u70B9\u652F\u6491\uFF0C\u8DEF\u7EBF\u662F\u5426\u53EF\u8FBE\u7531\u4F60\u8BD5\u73A9\u8C03\u6574\u3002</p>
    <div class="editor-layout"><div class="map-column"><div class="tools" aria-label="\u7F16\u8F91\u5DE5\u5177">
    ${[["platform","\u5E73\u53F0"],["spawn","\u8D77\u70B9"],["goal","\u7EC8\u70B9"],["checkpoint","\u5B58\u6863\u70B9"],["coin","\u91D1\u5E01"]].map(([_,T])=>`<button data-tool="${_}" aria-pressed="${_==="platform"}">${T}</button>`).join("")}
    </div><canvas id="editor-map" aria-label="\u4FEF\u89C6\u5173\u5361\u9884\u89C8\uFF0C\u70B9\u51FB\u7A7A\u5904\u653E\u5E73\u53F0\uFF0C\u70B9\u51FB\u5E73\u53F0\u9009\u62E9" tabindex="0"></canvas>
    <div class="map-footer"><span id="platform-count"></span><span>\u62D6\u52A8\u5E73\u79FB \xB7 \u6EDA\u8F6E\u7F29\u653E</span><button id="zoom-out" aria-label="\u7F29\u5C0F">\u2212</button><button id="zoom-in" aria-label="\u653E\u5927">\uFF0B</button></div></div>
    <form class="editor-fields" onsubmit="return false"><label>\u8DEF\u7EBF\u540D\u79F0<input id="editor-name" maxlength="80"></label><label>\u573A\u666F<select id="level-theme">${Q0.map(([_,T])=>`<option value="${_}">${T}</option>`).join("")}</select></label>
    <h3 id="selected-platform">\u5E73\u53F0</h3><div class="coordinate-fields">${[["x","\u6A2A\u5411 x",-100,100],["z","\u7EB5\u5411 z",-100,100],["y","\u9876\u9762\u9AD8\u5EA6",-2,30],["w","\u5BBD\u5EA6",1,20],["d","\u6DF1\u5EA6",1,20],["h","\u539A\u5EA6",.2,10]].map(([_,T,R,P])=>`<label>${T}<input id="platform-${_}" type="number" step="0.1" min="${R}" max="${P}"></label>`).join("")}</div>
    <button id="platform-delete" class="subtle">\u5220\u9664\u9009\u4E2D\u5E73\u53F0</button><p id="editor-feedback" role="status"></p>
    <div class="editor-actions"><button id="editor-save">\u4FDD\u5B58\u5230\u672C\u673A</button><button id="editor-load">\u91CD\u65B0\u52A0\u8F7D</button><button id="editor-play" class="primary">3D \u8BD5\u73A9 \u2192</button></div></form></div>`;let s=_=>i.querySelector(`#${_}`),r=s("editor-map"),a=r.getContext("2d"),o=Ru(),c=o.platforms[0].id,l="platform",u=23,m={x:2.5,z:0},h=null,p=0,x,S="none";try{if(x=localStorage,x.getItem("glow-parkour-level-v1")!==null){let T=ec(x);T?(o=T,c=o.platforms.at(-1).id,S="loaded"):S="invalid"}}catch{S="blocked"}let f=_=>{s("editor-feedback").textContent=_,n(_)},d=()=>o.platforms.find(_=>_.id===c),w=(_,T)=>o.platforms.filter(R=>Math.abs(_-R.x)<=R.w/2&&Math.abs(T-R.z)<=R.d/2).sort((R,P)=>P.y-R.y)[0],I=_=>`${_}-${Date.now().toString(36)}-${p++}`;function E(){let _=d();s("editor-name").value=o.name,s("level-theme").value=o.theme,s("selected-platform").textContent=_?`\u5E73\u53F0 ${o.platforms.indexOf(_)+1}`:"\u8BF7\u9009\u62E9\u5E73\u53F0";for(let T of["x","z","y","w","d","h"])s(`platform-${T}`).disabled=!_,s(`platform-${T}`).value=_?.[T]??"";s("platform-count").textContent=`${o.platforms.length} / 80`}let v=(_,T)=>({x:r.clientWidth/2+(_-m.x)*u,y:r.clientHeight/2+(T-m.z)*u});function M(){let _=r.clientWidth,T=r.clientHeight;if(!_||!T)return;let R=Math.min(devicePixelRatio||1,1.5);r.width=Math.round(_*R),r.height=Math.round(T*R),a.setTransform(R,0,0,R,0,0),a.fillStyle="#ecf4ed",a.fillRect(0,0,_,T),a.strokeStyle="#d6e4d9",a.lineWidth=1;let P=v(0,0),U=u*2;for(let B=(P.x%U+U)%U;B<_;B+=U)a.beginPath(),a.moveTo(B,0),a.lineTo(B,T),a.stroke();for(let B=(P.y%U+U)%U;B<T;B+=U)a.beginPath(),a.moveTo(0,B),a.lineTo(_,B),a.stroke();for(let[B,H]of o.platforms.entries()){let X=v(H.x,H.z),Z=X.x-H.w*u/2,k=X.y-H.d*u/2;a.fillStyle=H.id===c?"#edd5b8":"#c0d4c7",a.fillRect(Z,k,H.w*u,H.d*u),a.strokeStyle=H.id===c?"#b78753":"#739783",a.lineWidth=H.id===c?3:1.5,a.strokeRect(Z,k,H.w*u,H.d*u),a.fillStyle="#38544a",a.font="12px system-ui",a.textAlign="left",a.fillText(`${B+1} \xB7 ${H.y.toFixed(1)}m`,Z+5,k+17)}let L=(B,H,X)=>{let Z=v(B.x,B.z);a.fillStyle=H,a.beginPath(),a.arc(Z.x,Z.y,9,0,Math.PI*2),a.fill(),a.fillStyle="#fff",a.font="bold 10px system-ui",a.textAlign="center",a.fillText(X,Z.x,Z.y+3.5)};for(let B of o.coins)L(B,"#b7872f","\u5E01");for(let B of o.checkpoints)L(B,"#3a9786","\u5B58");L(o.spawn,"#4774a0","\u8D77"),L(o.goal,"#d0767e","\u7EC8")}function A(_,T){_=Math.round(_*2)/2,T=Math.round(T*2)/2;let R=w(_,T);if(l==="platform")if(R)c=R.id,f("\u5DF2\u9009\u4E2D\u5E73\u53F0\uFF0C\u53EF\u4FEE\u6539\u4F4D\u7F6E\u3001\u5927\u5C0F\u548C\u9AD8\u5EA6\u3002");else if(o.platforms.length>=80)f("\u6700\u591A\u653E\u7F6E80\u4E2A\u5E73\u53F0\uFF0C\u8BF7\u5148\u5220\u9664\u4E00\u4E2A\u3002");else if(Math.abs(_)>100||Math.abs(T)>100)f("\u5E73\u53F0\u4F4D\u7F6E\u9700\u5728 -100 \u5230 100 \u4E4B\u95F4\u3002");else{let P={id:I("p"),x:_,z:T,y:0,w:3,d:3,h:.6};o.platforms.push(P),c=P.id,f("\u5DF2\u65B0\u589E\u5E73\u53F0\u3002\u9009\u62E9\u8D77\u70B9\u3001\u7EC8\u70B9\u7B49\u5DE5\u5177\uFF0C\u518D\u70B9\u51FB\u5E73\u53F0\u653E\u7F6E\u3002")}else if(!R)f("\u8BF7\u70B9\u51FB\u652F\u6491\u5E73\u53F0\uFF1B\u6807\u8BB0\u4F1A\u81EA\u52A8\u53D6\u8BE5\u5E73\u53F0\u9876\u9762\u9AD8\u5EA6\u3002");else if(l==="spawn"||l==="goal")o[l]={x:_,y:R.y,z:T},f(`\u5DF2\u8BBE\u7F6E${l==="spawn"?"\u8D77\u70B9":"\u7EC8\u70B9"}\u3002`);else{let P=l==="coin"?o.coins:o.checkpoints,U=P.findIndex(L=>Math.hypot(L.x-_,L.z-T)<.6);U>=0?(P.splice(U,1),f("\u5DF2\u79FB\u9664\u6B64\u6807\u8BB0\u3002")):P.length>=(l==="coin"?160:80)?f("\u6807\u8BB0\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650\u3002"):(P.push({id:I(l),x:_,y:R.y+(l==="coin"?.35:0),z:T}),f(`\u5DF2\u653E\u7F6E${l==="coin"?"\u91D1\u5E01":"\u5B58\u6863\u70B9"}\uFF1B\u518D\u6B21\u70B9\u51FB\u53EF\u79FB\u9664\u3002`))}E(),M()}r.addEventListener("pointerdown",_=>{r.setPointerCapture(_.pointerId),h={id:_.pointerId,x:_.clientX,y:_.clientY,startX:_.clientX,startY:_.clientY,moved:!1}}),r.addEventListener("pointermove",_=>{h?.id===_.pointerId&&(Math.hypot(_.clientX-h.startX,_.clientY-h.startY)>6&&(h.moved=!0),h.moved&&(m.x-=(_.clientX-h.x)/u,m.z-=(_.clientY-h.y)/u,M()),h.x=_.clientX,h.y=_.clientY)}),r.addEventListener("pointerup",_=>{if(h?.id!==_.pointerId)return;let T=h.moved;if(h=null,!T){let R=r.getBoundingClientRect();A(m.x+(_.clientX-R.x-R.width/2)/u,m.z+(_.clientY-R.y-R.height/2)/u)}}),r.addEventListener("pointercancel",()=>{h=null}),r.addEventListener("wheel",_=>{_.preventDefault(),u=Math.max(4,Math.min(60,u*(_.deltaY>0?.88:1.12))),M()},{passive:!1}),s("zoom-in").onclick=()=>{u=Math.min(60,u*1.2),M()},s("zoom-out").onclick=()=>{u=Math.max(4,u/1.2),M()};for(let _ of i.querySelectorAll("[data-tool]"))_.onclick=()=>{l=_.dataset.tool;for(let T of i.querySelectorAll("[data-tool]"))T.setAttribute("aria-pressed",String(T===_));f(l==="platform"?"\u70B9\u51FB\u7A7A\u5904\u653E\u5E73\u53F0\uFF0C\u70B9\u51FB\u5DF2\u6709\u5E73\u53F0\u9009\u4E2D\u3002":"\u70B9\u51FB\u5E73\u53F0\u653E\u7F6E\u6807\u8BB0\u3002")};for(let _ of["x","z","y","w","d","h"])s(`platform-${_}`).onchange=()=>{let T=d();if(!T)return;let R=s(`platform-${_}`),P=Number(R.value);if(R.value===""||!Number.isFinite(P)||P<Number(R.min)||P>Number(R.max)){f(`\u6570\u503C\u9700\u5728 ${R.min} \u5230 ${R.max} \u4E4B\u95F4\u3002`),E();return}let U={...T};T[_]=P;for(let L of[o.spawn,o.goal,...o.coins,...o.checkpoints])Math.abs(L.x-U.x)<=U.w/2&&Math.abs(L.z-U.z)<=U.d/2&&L.y>=U.y&&L.y<=U.y+2.25&&((_==="x"||_==="z")&&(L[_]+=P-U[_]),_==="y"&&(L.y+=P-U.y));f("\u5E73\u53F0\u5DF2\u66F4\u65B0\uFF1B\u7F29\u5C0F\u5E73\u53F0\u540E\uFF0C\u8BF7\u786E\u8BA4\u6240\u6709\u6807\u8BB0\u4ECD\u6709\u652F\u6491\u3002"),E(),M()};s("editor-name").onchange=()=>{o.name=s("editor-name").value.trim()||"\u6211\u7684\u5FAE\u5149\u8DEF\u7EBF"},s("level-theme").onchange=()=>{o.theme=s("level-theme").value},s("platform-delete").onclick=()=>{let _=d();if(!_)return;if(o.platforms.length===1){f("\u81F3\u5C11\u4FDD\u7559\u4E00\u4E2A\u5E73\u53F0\u3002");return}let T=P=>Math.abs(P.x-_.x)<=_.w/2&&Math.abs(P.z-_.z)<=_.d/2&&Math.abs(P.y-_.y)<2.26;o.platforms=o.platforms.filter(P=>P!==_),o.coins=o.coins.filter(P=>!T(P)),o.checkpoints=o.checkpoints.filter(P=>!T(P));let R=o.platforms[0];for(let P of["spawn","goal"])T(o[P])&&(o[P]={x:R.x,y:R.y,z:R.z});c=R.id,f("\u5E73\u53F0\u53CA\u5176\u6807\u8BB0\u5DF2\u5220\u9664\uFF0C\u53D7\u5F71\u54CD\u7684\u8D77\u7EC8\u70B9\u5DF2\u79FB\u81F3\u7B2C\u4E00\u4E2A\u5E73\u53F0\u3002"),E(),M()};let g=()=>{let _=ar(o);return _.ok?_.level:(f(_.errors.join("\uFF1B")),null)};return s("editor-save").onclick=()=>{let _=g();_&&(x&&Iu(x,_)?(S="loaded",f("\u5DF2\u4FDD\u5B58\u5230\u672C\u673A\uFF0C\u53EF\u5173\u95ED\u540E\u91CD\u65B0\u52A0\u8F7D\u3002")):f("\u4FDD\u5B58\u5931\u8D25\uFF1A\u6D4F\u89C8\u5668\u4E0D\u5141\u8BB8\u672C\u5730\u5B58\u50A8\u3002\u5F53\u524D\u8DEF\u7EBF\u4ECD\u53EF\u8BD5\u73A9\u3002"))},s("editor-load").onclick=()=>{let _=x?ec(x):null;if(!_){f("\u6CA1\u6709\u53EF\u7528\u7684\u672C\u5730\u8DEF\u7EBF\uFF0C\u6216\u4FDD\u5B58\u6570\u636E\u635F\u574F\u3002\u5F53\u524D\u7F16\u8F91\u5185\u5BB9\u5DF2\u4FDD\u7559\u3002");return}o=_,c=o.platforms.at(-1).id,f("\u5DF2\u4ECE\u672C\u673A\u91CD\u65B0\u52A0\u8F7D\u3002"),E(),M()},s("editor-play").onclick=()=>{let _=g();_&&e(_)},s("editor-close").onclick=t,new ResizeObserver(()=>{i.hidden||M()}).observe(r),{open(){i.hidden=!1,E(),M(),f(S==="invalid"?"\u672C\u673A\u8DEF\u7EBF\u6570\u636E\u65E0\u6548\uFF0C\u5DF2\u4FDD\u7559\u5F53\u524D\u7F16\u8F91\u5185\u5BB9\uFF1B\u70B9\u51FB\u4FDD\u5B58\u5C06\u7528\u5F53\u524D\u8DEF\u7EBF\u66FF\u6362\u3002":S==="blocked"?"\u672C\u5730\u5B58\u50A8\u4E0D\u53EF\u7528\uFF0C\u5F53\u524D\u8DEF\u7EBF\u4ECD\u53EF\u7F16\u8F91\u8BD5\u73A9\u3002":S==="loaded"?"\u5DF2\u8BFB\u53D6\u672C\u673A\u8DEF\u7EBF\u3002\u70B9\u51FB\u7A7A\u5904\u6DFB\u52A0\u5E73\u53F0\uFF0C\u4FDD\u5B58\u540E\u53EF\u7EE7\u7EED\u8BD5\u73A9\u3002":"\u70B9\u51FB\u7A7A\u5904\u6DFB\u52A0\u5E73\u53F0\uFF1B\u62D6\u52A8\u9884\u89C8\u5E73\u79FB\u3002\u81EA\u521B\u91D1\u5E01\u4E0D\u589E\u52A0\u4F59\u989D\u3002")},currentLevel(){return ar(o).level}}}function Lu(){let i=null,e=!1,t=!1,n=!1,s=new Set;async function r(){if(!(!n||e||t))try{i??=new(window.AudioContext||window.webkitAudioContext),i.state==="suspended"&&await i.resume(),(e||t)&&await i.suspend()}catch{}}function a(){return n=!0,r()}let o=()=>{for(let c of s){try{c.osc.stop()}catch{}c.osc.disconnect(),c.gain.disconnect()}s.clear()};return{unlock:a,play(c){if(!i||i.state!=="running"||e||t||s.size>=6)return;let l={jump:470,coin:1040,land:160,checkpoint:740,finish:880}[c];if(!l)return;let u=i.createOscillator(),m=i.createGain(),h={osc:u,gain:m};s.add(h);let p=i.currentTime;u.type=c==="land"?"triangle":"sine",u.frequency.setValueAtTime(l,p),u.frequency.exponentialRampToValueAtTime(c==="jump"?760:l*.8,p+.1),m.gain.setValueAtTime(.035,p),m.gain.exponentialRampToValueAtTime(1e-4,p+.16),u.connect(m),m.connect(i.destination),u.onended=()=>{s.delete(h),u.disconnect(),m.disconnect()},u.start(),u.stop(p+.17)},setMuted(c){e=c,c?(o(),i?.suspend().catch(()=>{})):r()},setPaused(c){t=c,c?(o(),i?.suspend().catch(()=>{})):r()},dispose(){o(),i?.close().catch(()=>{})}}}var pe=i=>document.getElementById(i),Rt=pe("view"),Ht=Lu(),Gn=null,xo="";try{Gn=localStorage,Gn.getItem("glow-parkour-v1")}catch{xo="\u6D4F\u89C8\u5668\u7981\u6B62\u672C\u5730\u5B58\u50A8\uFF1A\u5F53\u524D\u4ECD\u53EF\u6E38\u73A9\uFF0C\u4F59\u989D\u548C\u8DEF\u7EBF\u65E0\u6CD5\u4FDD\u5B58\u3002"}var At=wc(Gn),Ft=Ic(Gn),vt,Pn,nt,Ke="home",hi=!1,ic=!1,lr=0,Du=0,tc="home",Nu=0,yo="skins",vo=!0,bi=!0,Uu=0,Mo=0;function Hn(i){pe("status").textContent=i,clearTimeout(Nu),Nu=setTimeout(()=>{pe("status").textContent=""},6e3)}function cr(){let i=!1;try{let e=Gn.getItem("glow-parkour-v1");Ac(Gn,At)&&(i=Pc(Gn,Ft),i||(e===null?Gn.removeItem("glow-parkour-v1"):Gn.setItem("glow-parkour-v1",e)))}catch{}return i||Hn("\u672C\u5730\u4FDD\u5B58\u5931\u8D25\uFF1A\u5F53\u524D\u5916\u89C2\u4E0E\u4F59\u989D\u4ECD\u53EF\u4F7F\u7528\uFF0C\u5173\u95ED\u9875\u9762\u540E\u53EF\u80FD\u4E22\u5931\u3002"),pe("coins").textContent=String(At.coins),i}function Fu(i,e){cr()||(Object.assign(At,i),Object.assign(Ft,e),Hn("\u672C\u5730\u4FDD\u5B58\u5931\u8D25\uFF1A\u672C\u6B21\u8D2D\u4E70\u6216\u88C5\u5907\u5DF2\u53D6\u6D88\uFF0C\u91D1\u5E01\u672A\u6263\u9664\u3002\u8BF7\u91CA\u653E\u5B58\u50A8\u7A7A\u95F4\u540E\u91CD\u8BD5\u3002")),Eo(),bo()}var e_=["home-panel","home-tip","hud","tutorial","touch-controls","level-overlay","shop-overlay","editor-overlay","editor-panel","pause-overlay","help-overlay"];function Wt(i){Ke=i,window.GameActivity?.setPlaying(i==="playing"),document.body.dataset.mode=i,Pn?.clear(),hi=!1,lr=performance.now(),Ht.setPaused(i!=="home"&&i!=="playing"),bi=!0;for(let e of e_)pe(e).hidden=!0;i==="home"&&(pe("home-panel").hidden=!1,pe("home-tip").hidden=!1),i==="playing"&&(pe("hud").hidden=!1,pe("touch-controls").hidden=!1),i==="levels"&&(pe("level-overlay").hidden=!1),i==="shop"&&(pe("shop-overlay").hidden=!1),i==="editor"&&(pe("editor-overlay").hidden=!1,pe("editor-panel").hidden=!1),(i==="paused"||i==="complete")&&(pe("pause-overlay").hidden=!1),i==="help"&&(pe("help-overlay").hidden=!1),i==="playing"?Rt.focus({preventScroll:!0}):i!=="home"&&document.querySelector(".overlay:not([hidden]) button")?.focus({preventScroll:!0}),vt&&nt&&sc()}function Eo(){bi=!0,vt.setSkin(ls.find(i=>i.id===At.equipped)),vt.setOutfit(cs.find(i=>i.id===Ft.equipped)??null),pe("coins").textContent=String(At.coins)}function or(){nt=Ao(Ln[0]),vt.setLevel(nt.level),Eo(),Wt("home")}var t_={sakura:"\u6A31\u82B1\u6797",flowers:"\u767E\u82B1\u6797",city:"\u57CE\u5E02\u5929\u6865",cabin:"\u6797\u95F4\u6728\u5C4B"};function Ou(){pe("levels").innerHTML=Ln.map((i,e)=>`<button class="level-card" data-level="${i.id}" data-theme="${i.theme}"><span class="level-theme">${t_[i.theme]}</span><span class="level-number">${String(e+1).padStart(2,"0")}</span><strong>${i.name}</strong><small>${At.progress[i.id]?`\u2713 \u6700\u5FEB ${At.progress[i.id].bestTime.toFixed(1)} \u79D2`:`${i.platforms.length} \u4E2A\u843D\u70B9 \xB7 \u96BE\u5EA6 ${e+1}`}</small></button>`).join("");for(let i of pe("levels").querySelectorAll("[data-level]"))i.onclick=()=>So(Ln.find(e=>e.id===i.dataset.level))}function So(i){nt=Ao(i),vt.setLevel(i),Eo(),ic=!1,pe("level-name").textContent=i.name,pe("practice-note").textContent=i.custom?"\u81EA\u521B\u8BD5\u73A9\uFF1A\u91D1\u5E01\u4EC5\u4F5C\u7EC3\u4E60\uFF0C\u4E0D\u589E\u52A0\u5546\u5E97\u4F59\u989D\u3002":"",Wt("playing")}function bo(){pe("skins").innerHTML=ls.map(i=>`<button class="skin-card" data-skin="${i.id}" aria-pressed="${At.equipped===i.id}"><span class="skin-swatch" style="background:${i.id==="rainbow"?"linear-gradient(135deg,#e77c9a,#e6c568,#88b891,#71acc3,#b49ecb)":i.color}"></span><strong>${i.name}</strong><small>${At.equipped===i.id?"\u5DF2\u88C5\u5907":At.owned.includes(i.id)?"\u6362\u4E0A\u5B83":"\u25C8 2 \u91D1\u5E01"}</small></button>`).join(""),pe("outfits").innerHTML=cs.map(i=>`<button class="outfit-card" data-outfit="${i.id}" aria-pressed="${Ft.equipped===i.id}"><span class="outfit-icon" style="display:block;--top:${i.top};--pants:${i.pants};--shoes:${i.shoes};--accent:${i.accent}"><i></i></span><strong>${i.name}</strong><small>${Ft.equipped===i.id?"\u5DF2\u7A7F\u4E0A":Ft.owned.includes(i.id)?"\u7A7F\u4E0A\u6574\u5957":"\u25C8 2 \u91D1\u5E01"}</small></button>`).join("");for(let i of pe("skins").querySelectorAll("[data-skin]"))i.onclick=()=>{let e=i.dataset.skin,t=structuredClone(At),n=structuredClone(Ft);if(!At.owned.includes(e)&&!Sc(At,e)){Hn("\u91D1\u5E01\u4E0D\u8DB3\uFF0C\u9700\u8981 2 \u91D1\u5E01\u3002\u5148\u53BB\u65C5\u9014\u4E2D\u6536\u96C6\u5427\u3002");return}bc(At,e),Fu(t,n)};for(let i of pe("outfits").querySelectorAll("[data-outfit]"))i.onclick=()=>{let e=i.dataset.outfit,t=structuredClone(At),n=structuredClone(Ft);if(!Ft.owned.includes(e)&&!Rc(At,Ft,e)){Hn("\u91D1\u5E01\u4E0D\u8DB3\uFF0C\u9700\u8981 2 \u91D1\u5E01\u8D2D\u4E70\u6574\u5957\u8863\u670D\u3002");return}Po(Ft,e),Fu(t,n)};pe("skins").hidden=yo!=="skins",pe("outfits").hidden=yo!=="outfits",pe("outfit-remove").hidden=yo!=="outfits"}function ci(){Ke==="playing"&&(pe("pause-heading").textContent="\u98CE\u666F\u5728\u8FD9\u91CC\u7B49\u4F60",pe("pause-caption").textContent="TAKE A BREATH",pe("pause-details").textContent="\u4F11\u606F\u4E00\u4E0B\uFF0C\u968F\u65F6\u7EE7\u7EED\u3002",pe("resume").hidden=!1,pe("next-level").hidden=!0,pe("quit").textContent=nt.level.custom?"\u8FD4\u56DE\u7F16\u8F91\u5668":"\u8FD4\u56DE\u5173\u5361\u9009\u62E9",Wt("paused"))}function n_(){Tc(At,nt),cr(),pe("pause-caption").textContent="YOU FOUND YOUR GLOW",pe("pause-heading").textContent="\u8FD9\u4E00\u7A0B\uFF0C\u6F02\u4EAE\uFF01",pe("pause-details").textContent=`\u7528\u65F6 ${nt.elapsed.toFixed(1)} \u79D2 \xB7 \u6536\u96C6 ${nt.collected.size} \u679A\u91D1\u5E01 \xB7 \u6389\u843D ${nt.falls} \u6B21`,pe("resume").hidden=!0,pe("next-level").hidden=nt.level.custom||nt.level===Ln.at(-1),pe("quit").textContent=nt.level.custom?"\u8FD4\u56DE\u7F16\u8F91\u5668":"\u8FD4\u56DE\u5173\u5361\u9009\u62E9",Wt("complete")}function i_(){if(!nt.level.tutorial||ic||Ke!=="playing"){pe("tutorial").hidden=!0;return}let i=nt.tutorial,t=[["moved","\u7528 WASD / \u65B9\u5411\u952E\u6216\u6447\u6746\u79FB\u52A8\u3002\u65B9\u5411\u8DDF\u968F\u955C\u5934\uFF0C\u5411\u524D\u5C31\u662F\u9996\u4E2A\u843D\u70B9\u3002"],["jumped","\u7A7A\u683C\u3001\u5355\u51FB\u573A\u666F\u6216\u53F3\u4E0B\u6309\u94AE\u8DF3\u8DC3\uFF1B\u8DF3\u8FC7\u5E73\u53F0\u95F4\u7684\u5C0F\u7F3A\u53E3\u3002"],["camera","\u62D6\u52A8\u573A\u666F\u770B\u770B\u56DB\u5468\u3002\u4E5F\u53EF\u76F4\u63A5\u7EE7\u7EED\u65C5\u7A0B\uFF0C\u21BA \u955C\u5934\u968F\u65F6\u590D\u4F4D\u3002"],["collected","\u8D70\u8FD1\u91D1\u8272\u5706\u73AF\u6536\u96C6\u91D1\u5E01\uFF0C\u4E00\u679A\u5C31\u662F 1 \u91D1\u5E01\u3002"],["checkpoint","\u8584\u8377\u8272\u65D7\u5E1C\u662F\u5B58\u6863\u70B9\uFF0C\u8E29\u4E0A\u540E\u6389\u843D\u4ECE\u8FD9\u91CC\u7EE7\u7EED\u3002"],["finished","\u8D70\u8FDB\u524D\u65B9\u53D1\u5149\u95E8\uFF0C\u5B8C\u6210\u8FD9\u4E00\u7A0B\u3002"]].find(([n])=>!i[n]&&!(n==="camera"&&i.collected));pe("tutorial").hidden=!t,t&&(pe("tutorial-text").textContent=t[1])}function sc(){let i=vt.info();for(let e of["x","y","z"])Rt.dataset[e]=nt.player[e].toFixed(3);for(let e of["theme","triangles","drawCalls","timeOfDay","sunIntensity","grassResponse","outfit"])Rt.dataset[e]=String(i[e]);Rt.dataset.mode=Ke,Rt.dataset.resources=JSON.stringify(i.resources),Rt.dataset.dpr=String(i.dpr),Rt.dataset.renderMs=i.renderMs.toFixed(2),Rt.dataset.frameMs=i.frameMs.toFixed(2),Rt.dataset.shadowSize=String(i.shadowSize),Rt.dataset.cameraDistance=i.cameraDistance.toFixed(2),Rt.dataset.cameraYaw=i.yaw.toFixed(3),pe("run-info").textContent=`${nt.elapsed.toFixed(1)} \u79D2 \xB7 ${nt.collected.size} / ${nt.level.coins.length} \u91D1\u5E01`}function nc(i){if(!vo)return;Mo=requestAnimationFrame(nc);let e=Math.min(.25,(i-lr)/1e3||.016);if(lr=i,document.hidden||["paused","complete","help"].includes(Ke)&&!bi||!["home","playing"].includes(Ke)&&i-Uu<100&&!bi)return;let t=!1;if(Ke==="playing"||Ke==="home"){let n=Ke==="playing"?Pn.sample(vt.info().yaw):{x:0,z:0,jump:!1};if(n.jump||=hi,t=Math.hypot(n.x,n.z)>0,hi=!1,yc(nt,n,e),Ke==="playing")for(let s of nt.events)Ht.play(s.type),s.type==="coin"&&(Ec(At,nt,s.id)?cr():nt.level.custom&&Hn("\u7EC3\u4E60\u91D1\u5E01 +1 \xB7 \u81EA\u521B\u5173\u5361\u4E0D\u589E\u52A0\u5546\u5E97\u4F59\u989D")),s.type==="checkpoint"&&Hn("\u5B58\u6863\u70B9\u5DF2\u70B9\u4EAE\uFF0C\u6389\u843D\u4F1A\u4ECE\u8FD9\u91CC\u7EE7\u7EED\u3002"),s.type==="fall"&&Hn("\u518D\u8BD5\u4E00\u6B21\uFF0C\u5FAE\u5149\u8FD8\u5728\u524D\u9762\u3002"),s.type==="finish"&&n_();else for(let s of nt.events)Ht.play(s.type)}vt.update(nt,Ke==="paused"||Ke==="complete"||Ke==="help"?0:e,Ke,t),vt.render(),bi=!1,Uu=i,i-Du>80&&(sc(),i_(),Du=i)}try{vt=wu(Rt),Pn=Au(Rt,pe("joystick"),pe("jump"),{onJump(){(Ke==="home"||Ke==="playing")&&(hi=!0)},onOrbit(e,t){(Ke==="home"||Ke==="playing")&&(vt.orbit(e,t),nt.tutorial.camera=!0)},onInteract:Ht.unlock});let i=Pu(pe("editor-panel"),{onPlay:So,onClose:or,onStatus:Hn});pe("start").onclick=()=>{Ou(),Wt("levels")},pe("home-return").onclick=or,pe("shop").onclick=()=>{bo(),Wt("shop")},pe("shop-close").onclick=()=>Wt("home"),pe("editor").onclick=()=>{Wt("editor"),i.open()},pe("pause").onclick=ci,pe("resume").onclick=()=>Wt("playing"),pe("quit").onclick=()=>{nt.level.custom?(Wt("editor"),i.open()):(Ou(),Wt("levels"))},pe("restart").onclick=()=>So(nt.level),pe("pause-home").onclick=or,pe("next-level").onclick=()=>So(Ln[Ln.indexOf(nt.level)+1]),pe("reset-camera").onclick=()=>{vt.resetCamera(),Pn.clear(),Rt.focus({preventScroll:!0})},pe("skip-tutorial").onclick=()=>{ic=!0,pe("tutorial").hidden=!0,Rt.focus({preventScroll:!0})},pe("help").onclick=()=>{tc=Ke,Ke==="playing"&&ci(),Wt("help")},pe("help-close").onclick=()=>{tc==="playing"?(Wt("playing"),ci()):Wt(tc)},pe("mute").onclick=()=>{let e=pe("mute").getAttribute("aria-pressed")!=="true";pe("mute").setAttribute("aria-pressed",String(e)),pe("mute").textContent=e?"\u266A\u0338":"\u266B",pe("mute").setAttribute("aria-label",e?"\u6253\u5F00\u58F0\u97F3":"\u9759\u97F3"),Ht.setMuted(e),Ke==="playing"&&Rt.focus({preventScroll:!0})};for(let e of document.querySelectorAll("[data-shop-tab]"))e.onclick=()=>{yo=e.dataset.shopTab;for(let t of document.querySelectorAll("[data-shop-tab]"))t.setAttribute("aria-pressed",String(t===e));bo()};pe("outfit-remove").onclick=()=>{Po(Ft,null),Eo(),cr(),bo()};for(let e of document.querySelectorAll("[data-time]"))e.onclick=()=>{Ft.timeOfDay=e.dataset.time,vt.setTimeOfDay(Ft.timeOfDay);for(let t of document.querySelectorAll("[data-time]"))t.setAttribute("aria-pressed",String(t===e));cr()};document.querySelector(`[data-time="${Ft.timeOfDay}"]`).setAttribute("aria-pressed","true"),document.addEventListener("pointerdown",Ht.unlock),document.addEventListener("keydown",e=>{if(Ht.unlock(),e.code==="Escape"&&(Ke==="playing"?ci():Ke==="paused"?Wt("playing"):Ke==="help"?pe("help-close").click():Ke==="editor"?pe("editor-close").click():(Ke==="shop"||Ke==="levels")&&or()),e.code==="Tab"&&!["home","playing"].includes(Ke)){let t=document.querySelector('.overlay:not([hidden]) [role="dialog"]'),n=[...t?.querySelectorAll("button,input,select,a")??[]].filter(s=>!s.disabled&&s.getClientRects().length);if(n.length){let s=n[0],r=n.at(-1);e.shiftKey&&(document.activeElement===s||!t.contains(document.activeElement))?(e.preventDefault(),r.focus()):!e.shiftKey&&(document.activeElement===r||!t.contains(document.activeElement))&&(e.preventDefault(),s.focus())}}}),window.addEventListener("blur",()=>{Pn.clear(),hi=!1,ci(),Ht.setPaused(!0)}),window.addEventListener("focus",()=>{Ke==="home"&&Ht.setPaused(!1)}),document.addEventListener("visibilitychange",()=>{document.hidden?(Pn.clear(),hi=!1,ci(),Ht.setPaused(!0)):(lr=performance.now(),Ke==="home"&&Ht.setPaused(!1))}),window.addEventListener("resize",()=>{vt.resize(),bi=!0}),Rt.addEventListener("webglcontextlost",e=>{e.preventDefault(),ci(),pe("loading").hidden=!1,pe("loading").innerHTML='3D\u753B\u9762\u6682\u65F6\u4E2D\u65AD\uFF0C\u8BF7\u91CD\u65B0\u52A0\u8F7D\u3002<a href="../index.html">\u8FD4\u56DE\u6E38\u620F\u5385</a>',vo=!1}),window.addEventListener("pagehide",e=>{vo=!1,cancelAnimationFrame(Mo),Pn.clear(),hi=!1,Ht.setPaused(!0),e.persisted?ci():(Pn.dispose(),Ht.dispose(),vt.dispose())}),window.addEventListener("pageshow",e=>{e.persisted&&(Pn.clear(),hi=!1,lr=performance.now(),bi=!0,vo=!0,vt.resize(),Ke==="home"&&Ht.setPaused(!1),Mo=requestAnimationFrame(nc))}),or(),vt.setTimeOfDay(Ft.timeOfDay),vt.update(nt,.016,"home"),vt.render(),sc(),pe("loading").hidden=!0,document.body.dataset.ready="true",xo&&(pe("storage-note").textContent=xo,Hn(xo)),Mo=requestAnimationFrame(nc)}catch(i){pe("loading").innerHTML=`<p>\u65E0\u6CD5\u542F\u52A83D\u753B\u9762\u3002${i.message.includes("WebGL")?"\u5F53\u524D\u6D4F\u89C8\u5668\u65E0\u6CD5\u4F7F\u7528 WebGL\u3002":"\u8BF7\u91CD\u65B0\u52A0\u8F7D\u540E\u518D\u8BD5\u3002"}</p><a href="../index.html">\u8FD4\u56DE\u6E38\u620F\u5385</a>`,Pn?.dispose(),Ht.dispose(),vt?.dispose()}
