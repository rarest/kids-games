function si(i,e,t,n,s,r,a,o={}){i.projectiles.push({id:`boss-shot-${i.nextEntityId++}`,kind:t,owner:e.id,x:n,y:s,vx:r,vy:a,w:.45,h:.45,ttl:6,gravity:0,...o})}var Rf=(i,e)=>i.players.filter(t=>t.lives>0&&!t.heldBy).sort((t,n)=>Math.abs(t.x-e.x)-Math.abs(n.x-e.x))[0];function Ih(i,e){let t=i.boss;if(!t||t.defeated)return;let n=Rf(i,t);if(!n||(!t.active&&Math.abs(n.x-t.x)<18&&(t.active=!0,i.events.push({id:`event-${i.nextEventId++}`,type:"bossStart",kind:t.kind,time:i.time})),!t.active))return;t.timer+=e,t.attackTimer+=e,t.invulnerable=Math.max(0,t.invulnerable-e);let s=t.timer,r=Math.sign(n.x-t.x)||-1;switch(t.kind){case"robot":t.phase="armSweep",Wn(t,s),t.attackTimer>1.65&&(t.attackTimer=0,si(i,t,"lightning",t.x-t.w*.42,t.y+.4,-7,0),si(i,t,"lightning",t.x+t.w*.42,t.y+t.h*.65,5,-1.4));break;case"owl":{let a=s%4.5;t.phase=a>2.4&&a<3.4?"dive":"perch",Wn(t,s),t.attackTimer>1.8&&(t.attackTimer=0,si(i,t,"feather",t.x,t.y+.6,r*4,-4));break}case"ufo":t.phase=s%5>3.5?"ram":"alienDrop",Wn(t,s),t.attackTimer>1.4&&(t.attackTimer=0,si(i,t,"alien",t.x,t.y,r*1.4,-1,{gravity:9,w:.7,h:.7,bounce:!0}));break;case"toyRobot":if(t.phase=s%5>3.6?"charge":"march",Wn(t,s),t.attackTimer>1.9){t.attackTimer=0;for(let[a,o]of["red","blue","green"].entries())si(i,t,"colorBall",n.x+(a-1)*1.7,t.y+t.h+2,0,-1,{gravity:12,bounce:!0,color:o})}break;case"electricFish":if(t.phase=s%3.2>2?"discharge":"swim",Wn(t,s),t.attackTimer>2.1){t.attackTimer=0;for(let a of[-Math.PI*.8,-Math.PI*.5,-Math.PI*.2])si(i,t,"spark",t.x,t.y,Math.cos(a)*5,Math.sin(a)*5)}break;case"casinoCat":if(t.phase="slot",Wn(t,s),t.attackTimer>1.7){t.attackTimer=0;let a=n.x-t.x,o=n.y+.6-t.y,l=Math.hypot(a,o)||1;for(let c of[-.35,0,.35])si(i,t,"token",t.x,t.y+.6,a/l*5,o/l*5+c,{gravity:1})}break;case"caterpillar":t.breakTimer=Math.max(0,(t.breakTimer??0)-e),t.phase=t.breakTimer>0?"separated":"segmentWave",Wn(t,s),t.segments=t.breakTimer>0?[]:Array.from({length:5},(a,o)=>({x:t.x+Math.sin(s*2-o*.7)*.6,y:t.y+o*(t.h/5),w:.7,h:t.h/5}));break;case"fatCat":if(t.phase=s%4>2?"cigar":"taunt",Wn(t,s),t.attackTimer>1.75){t.attackTimer=0;for(let a of[-1,0,1])si(i,t,"ash",t.x-t.w*.16,t.y+t.h*.78,r*(4+a*.8),5+a*1.2,{gravity:10})}break}t.anchors={mouth:{x:t.x-t.w*.16,y:t.y+t.h*.78},hand:{x:t.x-t.w*.34,y:t.y+t.h*.52}},t.contactRegions=t.kind==="fatCat"||t.kind==="caterpillar"&&t.breakTimer>0?[]:t.kind==="robot"?[-1,1].map(a=>({x:t.x+a*t.w*.38,y:t.y+.2,w:t.w*.25,h:t.h*.85})):[{x:t.x,y:t.y,w:t.w,h:t.h}],t.kind==="robot"?t.weakpoint={kind:"orb",x:t.x,y:t.y+t.h-.45,w:.75,h:.6}:t.kind==="toyRobot"?t.weakpoint={kind:"chest",x:t.x,y:t.y+t.h*.48,w:1,h:.7}:t.weakpoint=null,t.attackTimer===0&&i.events.push({id:`event-${i.nextEventId++}`,type:"bossAttack",kind:t.kind,time:i.time})}function Wn(i,e){let t=i.kind==="owl"?e%4.5>2.4&&e%4.5<3.4?"dive":"perch":i.kind==="ufo"?e%5>3.5?"ram":"alienDrop":i.kind==="toyRobot"?e%5>3.6?"charge":"march":i.phase;switch(i.kind){case"robot":i.x=i.homeX;break;case"owl":i.x=i.homeX+Math.sin(e)*2,i.y=i.homeY-(t==="dive"?Math.sin((e%4.5-2.4)*Math.PI)*2.4:0);break;case"ufo":i.x=i.homeX+Math.sin(e*(t==="ram"?2.2:1.1))*3,i.y=t==="ram"?(i.arena?.y??i.homeY)+.5:i.homeY+Math.sin(e*1.8)*.65;break;case"toyRobot":i.x=i.homeX+Math.sin(e*(t==="charge"?2:.7))*2;break;case"electricFish":i.x=i.homeX+Math.sin(e)*1.8,i.y=i.homeY+Math.sin(e*2)*.6;break;case"casinoCat":i.x=i.homeX+Math.sin(e*.8)*1.2;break;case"caterpillar":i.x=i.homeX+Math.sin(e*.9)*2,i.y=i.homeY+Math.sin(e*1.4)*.8;break;case"fatCat":i.x=i.homeX+Math.sin(e*.45)*.4;break}}function Ph(i,e){if(!i?.active||i.defeated)return;let t=i.x,n=i.y;i.timer+=e,Wn(i,i.timer);let s=i.x-t,r=i.y-n,a=o=>{o&&(o.x+=s,o.y+=r)};a(i.weakpoint);for(let o of i.contactRegions??[])a(o);for(let o of Object.values(i.anchors??{}))a(o);for(let[o,l]of(i.segments??[]).entries())l.x=i.x+Math.sin(i.timer*2-o*.7)*.6,l.y=i.y+o*(i.h/5)}var zs=[{id:"0",name:"\u8857\u533A\u4E0E\u5B9E\u9A8C\u5BA4",theme:"street",width:242,height:74,spawn:{x:2.881,y:1},platforms:[{id:"street-west",x:0,y:1,w:38.893,h:.65,kind:"solid",oneWay:!1},{id:"trash-step",x:11.524,y:2.6,w:4.321,h:.65,kind:"solid",oneWay:!1},{id:"planter-step",x:23.048,y:3.2,w:5.762,h:.65,kind:"solid",oneWay:!1},{id:"street-east",x:40.333,y:1,w:28.81,h:.65,kind:"solid",oneWay:!1},{id:"pole-foot",x:66.262,y:2.4,w:7.202,h:.65,kind:"solid",oneWay:!1},{id:"pole-a",x:70.583,y:4.8,w:5.762,h:.65,kind:"wire",oneWay:!0},{id:"pole-b",x:66.262,y:7.2,w:5.762,h:.65,kind:"wire",oneWay:!0},{id:"pole-c",x:70.583,y:9.6,w:5.762,h:.65,kind:"wire",oneWay:!0},{id:"pole-d",x:66.262,y:12,w:5.762,h:.65,kind:"wire",oneWay:!0},{id:"pole-e",x:70.583,y:14.4,w:5.762,h:.65,kind:"wire",oneWay:!0},{id:"roof-east",x:53.298,y:28.8,w:16.5,h:.65,kind:"solid",oneWay:!1},{id:"roof-mid",x:31.69,y:28.8,w:20.167,h:.65,kind:"solid",oneWay:!1},{id:"roof-west",x:7.202,y:28.8,w:23.048,h:.65,kind:"solid",oneWay:!1},{id:"roof-chimney",x:37.452,y:30.8,w:5.762,h:.65,kind:"solid",oneWay:!1},{id:"left-pole-a",x:4.321,y:31.2,w:7.202,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-b",x:0,y:33.6,w:7.202,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-c",x:4.321,y:36,w:7.202,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-d",x:0,y:38.4,w:7.202,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-e",x:4.321,y:40.8,w:7.202,h:.65,kind:"wire",oneWay:!0},{id:"wire-one",x:7.202,y:55.2,w:34.571,h:.65,kind:"wire",oneWay:!0},{id:"wire-two",x:44.655,y:55.2,w:30.25,h:.65,kind:"wire",oneWay:!0},{id:"wire-three",x:77.786,y:55.2,w:28.81,h:.65,kind:"wire",oneWay:!0},{id:"wire-four",x:109.476,y:55.2,w:28.29,h:.65,kind:"wire",oneWay:!0},{id:"wire-high",x:122.44,y:57.6,w:21.607,h:.65,kind:"wire",oneWay:!0},{id:"wall-approach",x:141.167,y:57.6,w:12.964,h:.65,kind:"solid",oneWay:!1},{id:"lab-west",x:154.131,y:57.6,w:28.81,h:.65,kind:"solid",oneWay:!1},{id:"lab-books",x:164.214,y:59.8,w:5.762,h:.65,kind:"solid",oneWay:!1},{id:"lab-tubes",x:177.179,y:60,w:7.202,h:.65,kind:"shelf",oneWay:!0},{id:"lab-east",x:185.821,y:57.6,w:56.179,h:.65,kind:"solid",oneWay:!1},{id:"right-pole-f",x:70.5,y:16.8,w:5.8,h:.65,kind:"wire",oneWay:!0},{id:"right-pole-g",x:66.3,y:19.2,w:5.8,h:.65,kind:"wire",oneWay:!0},{id:"right-pole-h",x:70.5,y:21.6,w:5.8,h:.65,kind:"wire",oneWay:!0},{id:"right-pole-i",x:66.3,y:24,w:5.8,h:.65,kind:"wire",oneWay:!0},{id:"right-pole-j",x:70.5,y:26.4,w:5.8,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-f",x:0,y:43.2,w:7.2,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-g",x:4.3,y:45.6,w:7.2,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-h",x:0,y:48,w:7.2,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-i",x:4.3,y:50.4,w:7.2,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-j",x:0,y:52.8,w:7.2,h:.65,kind:"wire",oneWay:!0}],objects:[{id:"s1",kind:"crate",x:5.762,y:1},{id:"s2",kind:"crate",x:8.643,y:1,contents:"flower"},{id:"s3",kind:"apple",x:17.286,y:2.6},{id:"s4",kind:"metal",x:31.69,y:1},{id:"s5",kind:"bigcrate",x:44.655,y:1,contents:"zipper"},{id:"s6",kind:"crate",x:53.298,y:1},{id:"p1",kind:"crate",x:69.143,y:2.4},{id:"r1",kind:"crate",x:59.06,y:28.8},{id:"r2",kind:"crate",x:37.452,y:30.8,contents:"star"},{id:"w1",kind:"metal",x:50.417,y:55.2},{id:"w2",kind:"crate",x:92.19,y:55.2},{id:"l1",kind:"crate",x:158.452,y:57.6},{id:"l2",kind:"apple",x:171.417,y:57.6},{id:"l3",kind:"bigcrate",x:191.583,y:57.6,contents:"acorn"},{id:"ball-0",kind:"ball",x:217.512,y:57.6}],enemies:[{id:"dog1",kind:"dog",x:14.405,y:1,min:11.524,max:20.167},{id:"dog2",kind:"dog",x:40.333,y:1,min:33.131,max:48.976},{id:"dog3",kind:"dog",x:57.619,y:1,min:51.857,max:64.821},{id:"bird1",kind:"bird",x:38.893,y:32,min:24.488,max:54.738},{id:"dog4",kind:"dog",x:37.452,y:28.8,min:33.131,max:48.976},{id:"bird2",kind:"bird",x:89.31,y:58,min:77.786,max:102.274},{id:"dog5",kind:"dog",x:126.762,y:55.2,min:113.798,max:135.405},{id:"lab-mouse",kind:"mouse",x:171.417,y:57.6,min:158.452,max:180.06},{id:"street-mimic",kind:"mimic",x:53,y:1,min:50,max:60}],hazards:[{id:"hazard-0",kind:"electric",x:87.87,y:55.2,w:2.881,h:.6,period:3,activeFor:.8}],decor:[{id:"fence-8-1",kind:"fence",x:11.524,y:1,w:31.69,h:5},{id:"planter-16-1",kind:"planter",x:23.048,y:1,w:5.762,h:3},{id:"trash-24-1",kind:"trash",x:34.571,y:1,w:2.881,h:4},{id:"pole-49-1",kind:"pole",x:70.583,y:1,w:2.881,h:32},{id:"building-27-1",kind:"building",x:38.893,y:1,w:53.298,h:16},{id:"pole-4-1",kind:"pole",x:5.762,y:1,w:2.881,h:33},{id:"satellite-102-33.6",kind:"satellite",x:146.929,y:57.6,w:4.321,h:4},{id:"lab-138-33.6",kind:"lab",x:198.786,y:57.6,w:79.226,h:10},{id:"testTubes-115-33.6",kind:"testTubes",x:165.655,y:57.6,w:8.643,h:5},{id:"pencil-135-33.6",kind:"pencil",x:194.464,y:57.6,w:11.524,h:1}],exit:{x:237.679,y:57.6},boss:{id:"boss-robot",kind:"robot",x:230.476,y:57.6,w:5,h:5.5,hp:5,arena:{x:213.19,y:57.6,w:28.81}},checkpoints:[{x:60.5,y:28.8},{x:10.083,y:55.2},{x:155.571,y:57.6}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["street east","right utility pole climb","roof west","left pole climb","overhead wires east","laboratory","robot arena"],landmarks:["flower pots and trash cans","two pole climbs and return along roofs","giant laboratory test tubes and pencil"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"A",name:"\u5927\u6811\u6500\u767B",theme:"tree",width:65,height:96,spawn:{x:10.156,y:1},platforms:[{id:"branch-base",x:2.031,y:1,w:24.375,h:.65,kind:"branch",oneWay:!0,route:!0},{id:"branch-1",x:14.219,y:3.4,w:20.313,h:.65,kind:"branch",oneWay:!0,route:!0,flowers:!0},{id:"branch-2",x:4.063,y:5.8,w:20.313,h:.65,kind:"branch",oneWay:!0,route:!0},{id:"branch-3",x:16.25,y:8.2,w:18.281,h:.65,kind:"branch",oneWay:!0,route:!0},{id:"branch-4",x:6.094,y:10.6,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-5",x:14.219,y:13,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-6",x:4.063,y:15.4,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-7",x:16.25,y:17.8,w:18.281,h:.65,kind:"branch",oneWay:!0},{id:"branch-8",x:8.125,y:20.2,w:20.313,h:.65,kind:"branch",oneWay:!0,flowers:!0},{id:"branch-9",x:2.031,y:22.6,w:18.281,h:.65,kind:"branch",oneWay:!0},{id:"branch-10",x:14.219,y:25,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-11",x:6.094,y:27.4,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-12",x:16.25,y:29.8,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-13",x:4.063,y:32.2,w:18.281,h:.65,kind:"branch",oneWay:!0},{id:"branch-14",x:14.219,y:34.6,w:20.313,h:.65,kind:"branch",oneWay:!0,flowers:!0},{id:"branch-15",x:6.094,y:37,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-16",x:16.25,y:39.4,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-17",x:4.063,y:41.8,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-18",x:14.219,y:44.2,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-19",x:6.094,y:46.6,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-20",x:16.25,y:49,w:20.313,h:.65,kind:"branch",oneWay:!0,flowers:!0},{id:"branch-21",x:4.063,y:51.4,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-22",x:14.219,y:53.8,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-23",x:6.094,y:56.2,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-24",x:16.25,y:58.6,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-25",x:4.063,y:61,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-26",x:14.219,y:63.4,w:20.313,h:.65,kind:"branch",oneWay:!0,flowers:!0},{id:"branch-27",x:6.094,y:65.8,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-28",x:16.25,y:68.2,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-29",x:6.094,y:70.6,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-30",x:16.25,y:73,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-31",x:6,y:75.4,w:20,h:.65,kind:"branch",oneWay:!0},{id:"branch-32",x:17,y:77.8,w:20,h:.65,kind:"branch",oneWay:!0},{id:"branch-33",x:6,y:80.2,w:20,h:.65,kind:"branch",oneWay:!0},{id:"branch-34",x:17,y:82.6,w:20,h:.65,kind:"branch",oneWay:!0},{id:"branch-35",x:6,y:85,w:20,h:.65,kind:"branch",oneWay:!0},{id:"branch-36",x:17,y:87.4,w:20,h:.65,kind:"branch",oneWay:!0},{id:"owl-perch",x:17,y:89.8,w:48,h:.65,kind:"branch",oneWay:!0}],objects:[{id:"a0",kind:"crate",x:6.094,y:1},{id:"a1",kind:"crate",x:18.281,y:8.2,contents:"flower"},{id:"a2",kind:"metal",x:18.281,y:17.8},{id:"a3",kind:"crate",x:16.25,y:25},{id:"a4",kind:"bigcrate",x:16.25,y:34.6,contents:"zipper"},{id:"a5",kind:"apple",x:10.156,y:41.8},{id:"a6",kind:"crate",x:18.281,y:49},{id:"a7",kind:"crate",x:10.156,y:56.2,contents:"acorn"},{id:"a8",kind:"crate",x:20.313,y:68.2},{id:"ball-A",kind:"ball",x:40.625,y:89.8}],enemies:[{id:"c1",kind:"caterpillar",x:20.313,y:3.4,min:16.25,max:30.469},{id:"c2",kind:"caterpillar",x:12.188,y:15.4,min:6.094,max:20.313},{id:"bee1",kind:"bee",x:30.469,y:22,min:16.25,max:34.531},{id:"c3",kind:"caterpillar",x:16.25,y:27.4,min:8.125,max:22.344},{id:"bird1",kind:"bird",x:24.375,y:36,min:8.125,max:30.469},{id:"c4",kind:"caterpillar",x:14.219,y:46.6,min:8.125,max:22.344},{id:"bee2",kind:"bee",x:28.438,y:52,min:12.188,max:32.5},{id:"bird2",kind:"bird",x:16.25,y:67,min:6.094,max:32.5},{id:"c5",kind:"caterpillar",x:22.344,y:73,min:18.281,max:30.469}],hazards:[],decor:[{id:"trunk-19-1",kind:"trunk",x:38.594,y:1,w:10.156,h:90},{id:"leaves-7-7",kind:"leaves",x:14.219,y:7,w:28.438,h:8},{id:"leaves-9-23",kind:"leaves",x:18.281,y:23,w:26.406,h:8},{id:"treeHole-19-30",kind:"treeHole",x:38.594,y:30,w:4.063,h:3},{id:"leaves-8-43",kind:"leaves",x:16.25,y:43,w:28.438,h:7},{id:"leaves-8-60",kind:"leaves",x:16.25,y:60,w:24.375,h:7},{id:"treeHole-19-72",kind:"treeHole",x:38.594,y:72,w:6.094,h:3},{id:"leaves-23-79",kind:"leaves",x:46.719,y:79,w:40.625,h:5}],exit:{x:58.906,y:89.8},boss:{id:"boss-owl",kind:"owl",x:48.75,y:93.4,w:3.2,h:2.7,hp:5,arena:{x:32.5,y:89.8,w:32.5}},checkpoints:[{x:18.281,y:25},{x:18.281,y:49}],pickups:[{id:"branch-1-flower-1",kind:"flower",x:19.297,y:3.75},{id:"branch-1-flower-2",kind:"flower",x:24.375,y:3.75},{id:"branch-1-flower-3",kind:"flower",x:29.453,y:3.75},{id:"branch-8-flower-1",kind:"flower",x:13.203,y:20.55},{id:"branch-8-flower-2",kind:"flower",x:18.281,y:20.55},{id:"branch-8-flower-3",kind:"flower",x:23.359,y:20.55},{id:"branch-14-flower-1",kind:"flower",x:19.297,y:34.95},{id:"branch-14-flower-2",kind:"flower",x:24.375,y:34.95},{id:"branch-14-flower-3",kind:"flower",x:29.453,y:34.95},{id:"branch-20-flower-1",kind:"flower",x:21.328,y:49.35},{id:"branch-20-flower-2",kind:"flower",x:26.406,y:49.35},{id:"branch-20-flower-3",kind:"flower",x:31.484,y:49.35},{id:"branch-26-flower-1",kind:"flower",x:19.297,y:63.75},{id:"branch-26-flower-2",kind:"flower",x:24.375,y:63.75},{id:"branch-26-flower-3",kind:"flower",x:29.453,y:63.75}],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["lower trunk branches","alternating ascending boughs","upper canopy","owl arena"],landmarks:["giant central tree trunk","stacked zigzag branches","tree holes and caterpillars"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"B",name:"\u5DE8\u578B\u9910\u5385\u4E0E\u6C34\u69FD",theme:"kitchen",width:354,height:14,spawn:{x:5.168,y:1},platforms:[{id:"bar-floor",x:0,y:1,w:67.182,h:.65,kind:"solid",oneWay:!1},{id:"stool-one",x:20.672,y:3,w:14.688,h:.65,kind:"shelf",oneWay:!0},{id:"counter",x:38.759,y:4.8,w:36.175,h:.65,kind:"solid",oneWay:!1},{id:"bottles",x:74.934,y:4.8,w:25.839,h:.65,kind:"solid",oneWay:!1},{id:"sink-west",x:103.358,y:4.8,w:17.272,h:.65,kind:"solid",oneWay:!1},{id:"sink-basin",x:116.277,y:2.2,w:38.759,h:.65,kind:"solid",oneWay:!1},{id:"sink-east",x:155.036,y:4.8,w:15.504,h:.65,kind:"solid",oneWay:!1},{id:"tap-cross",x:124.029,y:5.3,w:12.92,h:.65,kind:"shelf",oneWay:!0},{id:"dry-counter",x:170.54,y:4.8,w:25.839,h:.65,kind:"solid",oneWay:!1},{id:"stove-one",x:198.964,y:3.4,w:27.607,h:.65,kind:"solid",oneWay:!1},{id:"stove-two",x:229.971,y:3.4,w:25.839,h:.65,kind:"solid",oneWay:!1},{id:"drain-west",x:258.394,y:4.8,w:19.855,h:.65,kind:"solid",oneWay:!1},{id:"drain-ridge",x:281.65,y:5.8,w:14.688,h:.65,kind:"solid",oneWay:!1},{id:"drain-step",x:299.737,y:3.4,w:12.92,h:.65,kind:"solid",oneWay:!1},{id:"drain-floor",x:312.657,y:1,w:41.343,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"b1",kind:"crate",x:10.336,y:1},{id:"b2",kind:"crate",x:51.679,y:4.8},{id:"b3",kind:"apple",x:90.438,y:4.8},{id:"b4",kind:"metal",x:111.109,y:4.8},{id:"b5",kind:"crate",x:134.365,y:5.3},{id:"b6",kind:"bigcrate",x:186.044,y:4.8,contents:"acorn"},{id:"b7",kind:"crate",x:240.307,y:3.4},{id:"ball-B",kind:"ball",x:322.993,y:1}],enemies:[{id:"kang1",kind:"kangaroo",x:49.095,y:4.8,min:43.927,max:67.182},{id:"crab1",kind:"crab",x:126.613,y:2.2,min:118.861,max:147.285},{id:"pelican1",kind:"pelican",x:178.292,y:7,min:170.54,max:193.796},{id:"lizard1",kind:"lizard",x:235.139,y:3.4,min:232.555,max:250.642},{id:"lizard2",kind:"lizard",x:289.401,y:5.8,min:284.234,max:294.569},{id:"lizard3",kind:"lizard",x:320.409,y:1,min:312.657,max:325.577}],hazards:[{id:"hazard-0",kind:"faucet",x:122.737,y:2.2,w:2.584,h:3,period:2.8,activeFor:1.2},{id:"hazard-1",kind:"faucet",x:143.409,y:2.2,w:2.584,h:3,period:3.4,activeFor:1.1},{id:"hazard-2",kind:"press",x:210.591,y:3.4,w:2.584,h:2,period:3,activeFor:.7}],decor:[{id:"counter-18-1",kind:"counter",x:46.511,y:1,w:56.847,h:4},{id:"stool-8-1",kind:"stool",x:20.672,y:1,w:7.752,h:3},{id:"bottle-34-4.8",kind:"bottle",x:87.854,y:4.8,w:5.168,h:5},{id:"sink-52-1",kind:"sink",x:134.365,y:1,w:51.679,h:4},{id:"faucet-47-5",kind:"faucet",x:121.445,y:5,w:5.168,h:5},{id:"faucet-55-5",kind:"faucet",x:142.117,y:5,w:5.168,h:5},{id:"stove-86-1",kind:"stove",x:222.219,y:1,w:62.015,h:4},{id:"drain-114-1",kind:"drain",x:294.569,y:1,w:36.175,h:4},{id:"tileWall-80-1",kind:"tileWall",x:206.715,y:1,w:310.073,h:12}],exit:{x:346.248,y:1},boss:{id:"boss-ufo",kind:"ufo",x:335.912,y:5,w:4,h:1.8,hp:5,arena:{x:307.489,y:1,w:46.511}},checkpoints:[{x:170.54,y:4.8}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["bar and stools","bottles and running sink","burners","draining board","UFO arena"],landmarks:["oversized bar stools","multiple faucets","ridged metal draining board"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"C",name:"\u4E66\u623F\u4E0E\u540A\u6247",theme:"study",width:253,height:29,spawn:{x:4.217,y:1},platforms:[{id:"bookcase-lower",x:0,y:1,w:59.033,h:.65,kind:"solid",oneWay:!1},{id:"bookcase-upper",x:0,y:5.2,w:52.708,h:.65,kind:"shelf",oneWay:!0},{id:"book-step",x:54.817,y:3.2,w:8.433,h:.65,kind:"solid",oneWay:!1},{id:"book-stack",x:61.142,y:5.4,w:8.433,h:.65,kind:"solid",oneWay:!1},{id:"desk-west",x:69.575,y:7.6,w:38.767,h:.65,kind:"solid",oneWay:!1},{id:"book-high",x:82.225,y:9.8,w:10.542,h:.65,kind:"solid",oneWay:!1},{id:"desk-east",x:111.742,y:7.6,w:29.517,h:.65,kind:"solid",oneWay:!1},{id:"fan-one",x:143.367,y:9.7,w:14.758,h:.65,kind:"moving",oneWay:!0,axis:"x",range:1.2,speed:1},{id:"fan-two",x:160.233,y:7.6,w:15.575,h:.65,kind:"moving",oneWay:!0,axis:"x",range:1,speed:.8},{id:"fan-three",x:179.208,y:9.5,w:14.758,h:.65,kind:"moving",oneWay:!0,axis:"x",range:1.2,speed:1},{id:"desk-bridge",x:191.858,y:7.6,w:16.867,h:.65,kind:"solid",oneWay:!1},{id:"fan-four",x:210.833,y:9.6,w:15.575,h:.65,kind:"moving",oneWay:!0,axis:"x",range:.8,speed:1},{id:"final-desk",x:229.808,y:9.6,w:23.192,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"c1",kind:"crate",x:10.542,y:1},{id:"c2",kind:"crate",x:25.3,y:1,contents:"flower"},{id:"c3",kind:"metal",x:56.925,y:3.2},{id:"c4",kind:"crate",x:73.792,y:7.6},{id:"c5",kind:"apple",x:92.767,y:9.8},{id:"c6",kind:"bigcrate",x:128.608,y:7.6,contents:"zipper"},{id:"c7",kind:"crate",x:166.558,y:7.6},{id:"c8",kind:"crate",x:236.133,y:9.6,contents:"star"}],enemies:[{id:"m1",kind:"mouse",x:31.625,y:1,min:16.867,max:50.6},{id:"m2",kind:"mouse",x:88.55,y:7.6,min:71.683,max:103.308},{id:"b1",kind:"bird",x:111.742,y:11,min:86.442,max:130.717},{id:"m3",kind:"mouse",x:130.717,y:7.6,min:113.85,max:139.15},{id:"b2",kind:"bird",x:179.208,y:12,min:156.017,max:193.967},{id:"m4",kind:"mouse",x:240.35,y:9.6,min:231.917,max:248.783}],hazards:[{id:"hazard-0",kind:"electric",x:203.454,y:7.6,w:2.108,h:2,period:3,activeFor:.7}],decor:[{id:"bookshelf-12-1",kind:"bookshelf",x:25.3,y:1,w:59.033,h:9},{id:"books-30-1",kind:"books",x:63.25,y:1,w:8.433,h:6},{id:"desk-43-1",kind:"desk",x:90.658,y:1,w:40.058,h:7},{id:"books-40-7.6",kind:"books",x:84.333,y:7.6,w:10.542,h:3},{id:"fan-72-9.7",kind:"fan",x:151.8,y:9.7,w:16.867,h:5},{id:"fan-80-7.6",kind:"fan",x:168.667,y:7.6,w:16.867,h:5},{id:"fan-89-9.5",kind:"fan",x:187.642,y:9.5,w:16.867,h:5},{id:"lamp-99-7.6",kind:"lamp",x:208.725,y:7.6,w:4.217,h:6},{id:"desk-114-1",kind:"desk",x:240.35,y:1,w:25.3,h:9}],exit:{x:246.675,y:9.6},boss:null,checkpoints:[{x:113.85,y:7.6}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["bookshelf passage","desk stacks","ceiling fan crossing","hanging lights"],landmarks:["two-level bookcase","giant desktop books","suspended fan blades used as platforms"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"D",name:"\u73A9\u5177\u5DE5\u5382",theme:"toys",width:402,height:29,spawn:{x:5.545,y:1},platforms:[{id:"toy-floor",x:0,y:1,w:85.945,h:.65,kind:"solid",oneWay:!1},{id:"toy-box-a",x:19.407,y:3.2,w:11.09,h:.65,kind:"solid",oneWay:!1},{id:"toy-box-b",x:41.586,y:5.4,w:13.862,h:.65,kind:"solid",oneWay:!1},{id:"assembly",x:69.31,y:3.2,w:35.414,h:.65,kind:"conveyor",oneWay:!0,speed:1.6},{id:"assembly-two",x:108.124,y:3.2,w:27.724,h:.65,kind:"conveyor",oneWay:!0,speed:-1.2},{id:"stair-a",x:138.621,y:1,w:22.179,h:.65,kind:"solid",oneWay:!1},{id:"stair-b",x:152.483,y:3,w:22.179,h:.65,kind:"solid",oneWay:!1},{id:"stair-c",x:166.345,y:5,w:22.179,h:.65,kind:"solid",oneWay:!1},{id:"stair-d",x:180.207,y:7,w:66.538,h:.65,kind:"solid",oneWay:!1},{id:"stairs-down",x:235.655,y:5,w:27.724,h:.65,kind:"solid",oneWay:!1},{id:"pipe-top",x:266.152,y:6.8,w:13.234,h:.65,kind:"shelf",oneWay:!0},{id:"pipe-two",x:282.786,y:4.5,w:13.234,h:.65,kind:"shelf",oneWay:!0},{id:"pipe-three",x:299.421,y:6.7,w:13.234,h:.65,kind:"shelf",oneWay:!0},{id:"pipe-four",x:316.055,y:4.4,w:16.007,h:.65,kind:"shelf",oneWay:!0},{id:"package-base",x:327.145,y:1,w:27.724,h:.65,kind:"solid",oneWay:!1},{id:"gift-step",x:335.462,y:3.2,w:11.09,h:.65,kind:"solid",oneWay:!1},{id:"gift-upper",x:346.552,y:5.4,w:16.634,h:.65,kind:"solid",oneWay:!1},{id:"robot-floor",x:363.186,y:5.4,w:38.814,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"d1",kind:"crate",x:8.317,y:1},{id:"d2",kind:"crate",x:49.903,y:5.4},{id:"d3",kind:"metal",x:80.4,y:3.2},{id:"d4",kind:"crate",x:127.531,y:3.2},{id:"d5",kind:"apple",x:169.117,y:5},{id:"d6",kind:"bigcrate",x:210.703,y:7,contents:"zipper"},{id:"d7",kind:"crate",x:291.103,y:4.5},{id:"d8",kind:"crate",x:338.234,y:3.2},{id:"ball-D",kind:"ball",x:368.731,y:5.4}],enemies:[{id:"t1",kind:"toy",x:33.269,y:1,min:24.952,max:49.903},{id:"t2",kind:"toy",x:80.4,y:3.2,min:72.083,max:97.034},{id:"t3",kind:"toy",x:121.986,y:3.2,min:110.897,max:130.303},{id:"rh1",kind:"rhino",x:188.524,y:7,min:182.979,max:232.883},{id:"t4",kind:"toy",x:249.517,y:5,min:238.428,max:260.607},{id:"bee",kind:"bee",x:302.193,y:9,min:280.014,max:321.6},{id:"t5",kind:"toy",x:352.097,y:5.4,min:346.552,max:360.414},{id:"toy-mimic",kind:"mimic",x:50,y:1,min:47,max:60}],hazards:[{id:"hazard-0",kind:"press",x:95.648,y:3.2,w:2.772,h:2,period:3.1,activeFor:.8},{id:"hazard-1",kind:"electric",x:300.807,y:6.7,w:2.772,h:.7,period:3,activeFor:.7}],decor:[{id:"toyBox-8-1",kind:"toyBox",x:22.179,y:1,w:16.634,h:5},{id:"toyBox-18-1",kind:"toyBox",x:49.903,y:1,w:13.862,h:7},{id:"toyRobot-27-1",kind:"toyRobot",x:74.855,y:1,w:8.317,h:4},{id:"conveyor-37-1",kind:"conveyor",x:102.579,y:1,w:72.083,h:3},{id:"stairs-66-1",kind:"stairs",x:182.979,y:1,w:83.172,h:7},{id:"pipe-99-1",kind:"pipe",x:274.469,y:1,w:5.545,h:6},{id:"pipe-111-1",kind:"pipe",x:307.738,y:1,w:5.545,h:7},{id:"gift-124-1",kind:"gift",x:343.779,y:1,w:16.634,h:8},{id:"gift-131-1",kind:"gift",x:363.186,y:1,w:11.09,h:5}],exit:{x:393.683,y:5.4},boss:{id:"boss-toyRobot",kind:"toyRobot",x:385.366,y:5.4,w:4.6,h:5,hp:5,arena:{x:352.097,y:5.4,w:49.903}},checkpoints:[{x:180.207,y:7},{x:335.462,y:3.2}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["toy packaging","assembly conveyors","purple stepped racks","hanging pipes","gift towers","robot arena"],landmarks:["printed toy boxes","long purple stair racks","tall colorful wrapped gifts"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"E",name:"\u6CB3\u5CB8\u4E0E\u6C34\u95F8",theme:"river",width:354,height:14,spawn:{x:5.446,y:1},platforms:[{id:"fence-bank",x:0,y:1,w:59.908,h:.65,kind:"solid",oneWay:!1},{id:"fence-top",x:8.169,y:3.2,w:51.062,h:.65,kind:"shelf",oneWay:!0},{id:"brick-step",x:62.631,y:2.4,w:13.615,h:.65,kind:"solid",oneWay:!1},{id:"bank-high",x:76.246,y:4.8,w:46.292,h:.65,kind:"solid",oneWay:!1},{id:"bridge-start",x:125.262,y:4.8,w:18.385,h:.65,kind:"solid",oneWay:!1},{id:"sluice-one",x:147.046,y:4.8,w:21.108,h:.65,kind:"moving",oneWay:!0,axis:"y",range:1,speed:1},{id:"sluice-two",x:171.554,y:4.8,w:21.108,h:.65,kind:"moving",oneWay:!0,axis:"y",range:1,speed:.8},{id:"high-bank",x:196.062,y:6.8,w:35.4,h:.65,kind:"solid",oneWay:!1},{id:"sluice-wall",x:228.738,y:9,w:19.062,h:.65,kind:"solid",oneWay:!1},{id:"gate-down",x:247.8,y:6.6,w:15.662,h:.65,kind:"solid",oneWay:!1},{id:"islet-one",x:266.862,y:4.2,w:15.662,h:.65,kind:"solid",oneWay:!1},{id:"islet-two",x:285.923,y:3,w:15.662,h:.65,kind:"solid",oneWay:!1},{id:"last-bank",x:304.985,y:1,w:24.508,h:.65,kind:"solid",oneWay:!1},{id:"fish-deck",x:329.492,y:1,w:24.508,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"e1",kind:"crate",x:10.892,y:1},{id:"e2",kind:"apple",x:46.292,y:3.2},{id:"e3",kind:"crate",x:81.692,y:4.8},{id:"e4",kind:"bigcrate",x:119.815,y:4.8,contents:"acorn"},{id:"e5",kind:"metal",x:177,y:4.8},{id:"e6",kind:"crate",x:220.569,y:6.8},{id:"e7",kind:"crate",x:285.923,y:3},{id:"ball-E",kind:"ball",x:331.671,y:1}],enemies:[{id:"bee1",kind:"bee",x:29.954,y:7,min:8.169,max:54.462},{id:"p1",kind:"pelican",x:117.092,y:7,min:92.585,max:133.431},{id:"cr1",kind:"crab",x:209.677,y:6.8,min:201.508,max:226.015},{id:"bird1",kind:"bird",x:253.246,y:10,min:236.908,max:288.646},{id:"p2",kind:"pelican",x:310.431,y:5,min:291.369,max:324.046}],hazards:[{id:"hazard-0",kind:"water",x:167.47,y:-1,w:57.185,h:2},{id:"hazard-1",kind:"water",x:283.2,y:-1,w:43.569,h:2}],decor:[{id:"fence-11-1",kind:"fence",x:29.954,y:1,w:62.631,h:5},{id:"tree-7-1",kind:"tree",x:19.062,y:1,w:13.615,h:10},{id:"brick-34-1",kind:"brick",x:92.585,y:1,w:49.015,h:5},{id:"sluice-59-1",kind:"sluice",x:160.662,y:1,w:16.338,h:6},{id:"sluice-68-1",kind:"sluice",x:185.169,y:1,w:16.338,h:6},{id:"water-63--1",kind:"water",x:171.554,y:-1,w:81.692,h:2},{id:"brick-80-1",kind:"brick",x:217.846,y:1,w:54.462,h:8},{id:"gate-89-1",kind:"gate",x:242.354,y:1,w:16.338,h:9},{id:"pump-125-1",kind:"pump",x:340.385,y:1,w:13.615,h:6}],exit:{x:345.831,y:1},boss:{id:"boss-electricFish",kind:"electricFish",x:340.385,y:4.2,w:3.1,h:1.8,hp:5,arena:{x:307.708,y:1,w:46.292}},checkpoints:[{x:198.785,y:6.8}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["fenced river bank","brick embankments","moving water-gate crossing","stepped islands","fish pool"],landmarks:["wooden riverside fences","broad water gap and sluice pistons","sloped brick banks"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"F",name:"\u8FD0\u8F93\u5DE5\u5382\u4E0E\u5347\u964D\u4E95",theme:"factory",width:145,height:59,spawn:{x:2.613,y:1},platforms:[{id:"loading-west",x:0,y:1,w:13.063,h:.65,kind:"solid",oneWay:!1},{id:"loading-two",x:15.676,y:1,w:11.757,h:.65,kind:"solid",oneWay:!1},{id:"loading-three",x:30.045,y:1,w:11.757,h:.65,kind:"solid",oneWay:!1},{id:"loading-four",x:44.414,y:1,w:13.063,h:.65,kind:"solid",oneWay:!1},{id:"loading-five",x:60.09,y:1,w:13.063,h:.65,kind:"solid",oneWay:!1},{id:"belt-low",x:75.766,y:1,w:19.595,h:.65,kind:"conveyor",oneWay:!0,speed:1.6},{id:"belt-top",x:78.378,y:4,w:14.369,h:.65,kind:"conveyor",oneWay:!0,speed:-1.3},{id:"crate-ramp",x:94.054,y:3.2,w:9.144,h:.65,kind:"solid",oneWay:!1},{id:"crate-ramp-top",x:100.586,y:5.4,w:10.45,h:.65,kind:"solid",oneWay:!1},{id:"shaft-foot",x:111.036,y:5.4,w:15.676,h:.65,kind:"shelf",oneWay:!0,route:!0},{id:"shaft-1",x:116.261,y:7.8,w:13.063,h:.65,kind:"shelf",oneWay:!0,route:!0},{id:"shaft-2",x:111.036,y:10.2,w:13.063,h:.65,kind:"shelf",oneWay:!0,route:!0},{id:"shaft-3",x:116.261,y:12.6,w:13.063,h:.65,kind:"shelf",oneWay:!0,route:!0},{id:"shaft-4",x:111.036,y:15,w:13.063,h:.65,kind:"moving",oneWay:!0,axis:"x",range:.7,speed:.9},{id:"shaft-5",x:116.261,y:17.4,w:13.063,h:.65,kind:"shelf",oneWay:!0},{id:"shaft-6",x:111.036,y:19.8,w:13.063,h:.65,kind:"shelf",oneWay:!0},{id:"shaft-7",x:116.261,y:22.2,w:13.063,h:.65,kind:"moving",oneWay:!0,axis:"x",range:.6,speed:.7},{id:"shaft-8",x:111.036,y:24.6,w:13.063,h:.65,kind:"shelf",oneWay:!0},{id:"shaft-9",x:116.261,y:27,w:13.063,h:.65,kind:"shelf",oneWay:!0},{id:"shaft-10",x:111.036,y:29.4,w:13.063,h:.65,kind:"conveyor",oneWay:!0,speed:1},{id:"shaft-11",x:116.261,y:31.8,w:13.063,h:.65,kind:"conveyor",oneWay:!0,speed:-1},{id:"shaft-12",x:111.036,y:34.2,w:13.063,h:.65,kind:"conveyor",oneWay:!0,speed:1},{id:"shaft-13",x:111,y:36.6,w:14,h:.65,kind:"shelf",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-14",x:116,y:39,w:14,h:.65,kind:"moving",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-15",x:111,y:41.4,w:14,h:.65,kind:"shelf",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-16",x:116,y:43.8,w:14,h:.65,kind:"conveyor",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-17",x:111,y:46.2,w:14,h:.65,kind:"conveyor",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-18",x:116,y:48.6,w:14,h:.65,kind:"shelf",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-exit",x:118,y:51,w:27,h:.65,kind:"solid",oneWay:!1,axis:"x",range:.6,speed:1}],objects:[{id:"f1",kind:"crate",x:6.532,y:1},{id:"f2",kind:"metal",x:20.901,y:1},{id:"f3",kind:"crate",x:35.27,y:1,contents:"flower"},{id:"f4",kind:"apple",x:52.252,y:1},{id:"f5",kind:"bigcrate",x:82.297,y:1,contents:"zipper"},{id:"f6",kind:"crate",x:97.973,y:3.2},{id:"f7",kind:"crate",x:113.649,y:10.2},{id:"f8",kind:"metal",x:118.874,y:19.8},{id:"f9",kind:"crate",x:117.568,y:29.4},{id:"f10",kind:"crate",x:129.324,y:51,contents:"star"}],enemies:[{id:"rh1",kind:"rhino",x:84.91,y:1,min:77.072,max:94.054},{id:"m1",kind:"mouse",x:104.505,y:5.4,min:101.892,max:109.73},{id:"m2",kind:"mouse",x:121.486,y:12.6,min:117.568,max:126.712},{id:"bird",kind:"bird",x:118.874,y:25,min:113.649,max:128.018}],hazards:[{id:"hazard-0",kind:"press",x:18.941,y:1,w:1.306,h:2,period:3,activeFor:.6},{id:"hazard-1",kind:"press",x:48.986,y:1,w:1.306,h:2,period:3.7,activeFor:.7},{id:"hazard-2",kind:"electric",x:120.833,y:27,w:1.306,h:.6,period:3,activeFor:.7}],decor:[{id:"piston-6-3",kind:"piston",x:7.838,y:3,w:5.225,h:8},{id:"piston-18-3",kind:"piston",x:23.514,y:3,w:5.225,h:8},{id:"piston-29-3",kind:"piston",x:37.883,y:3,w:5.225,h:8},{id:"piston-42-3",kind:"piston",x:54.865,y:3,w:5.225,h:8},{id:"conveyor-65-1",kind:"conveyor",x:84.91,y:1,w:23.514,h:5},{id:"shippingCrates-79-1",kind:"shippingCrates",x:103.198,y:1,w:15.676,h:7},{id:"pipe-85-5",kind:"pipe",x:111.036,y:5,w:2.613,h:34},{id:"pipe-102-5",kind:"pipe",x:133.243,y:5,w:2.613,h:34},{id:"warning-100-38",kind:"warning",x:130.631,y:38,w:15.676,h:2}],exit:{x:141.081,y:51},boss:null,checkpoints:[{x:78.378,y:1},{x:116.261,y:19.8}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["loading press bays","two-tier conveyors","wooden shipping crates","vertical elevator shaft"],landmarks:["round industrial presses","green riveted walls","alternating narrow lift ledges"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"G",name:"\u9910\u5385\u4E0E\u8D4C\u573A",theme:"casino",width:402,height:14,spawn:{x:6.432,y:1},platforms:[{id:"restaurant-floor",x:0,y:1,w:70.752,h:.65,kind:"solid",oneWay:!1},{id:"table-a",x:25.728,y:3.2,w:28.76,h:.65,kind:"shelf",oneWay:!0},{id:"table-b",x:57.888,y:5.4,w:25.728,h:.65,kind:"shelf",oneWay:!0},{id:"bar-west",x:83.616,y:5.4,w:54.672,h:.65,kind:"solid",oneWay:!1},{id:"bar-step",x:131.856,y:3.2,w:22.512,h:.65,kind:"solid",oneWay:!1},{id:"restaurant-east",x:151.152,y:1,w:57.888,h:.65,kind:"solid",oneWay:!1},{id:"casino-step",x:205.824,y:3.2,w:19.296,h:.65,kind:"solid",oneWay:!1},{id:"casino-one",x:225.12,y:5.4,w:31.976,h:.65,kind:"shelf",oneWay:!0},{id:"casino-two",x:260.496,y:5.4,w:25.728,h:.65,kind:"shelf",oneWay:!0},{id:"casino-low",x:283.008,y:3.2,w:25.728,h:.65,kind:"solid",oneWay:!1},{id:"casino-three",x:308.736,y:5.4,w:28.76,h:.65,kind:"shelf",oneWay:!0},{id:"casino-four",x:340.896,y:7.6,w:22.512,h:.65,kind:"shelf",oneWay:!0},{id:"slot-floor",x:360.192,y:1,w:41.808,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"g1",kind:"crate",x:16.08,y:1},{id:"g2",kind:"apple",x:67.536,y:5.4},{id:"g3",kind:"crate",x:106.128,y:5.4},{id:"g4",kind:"metal",x:176.88,y:1},{id:"g5",kind:"bigcrate",x:234.768,y:5.4,contents:"zipper"},{id:"g6",kind:"crate",x:273.36,y:5.4},{id:"g7",kind:"crate",x:318.384,y:5.4},{id:"ball-G",kind:"ball",x:373.056,y:1}],enemies:[{id:"rh1",kind:"rhino",x:48.24,y:1,min:19.296,max:67.536},{id:"m1",kind:"mouse",x:99.696,y:5.4,min:86.832,max:131.856},{id:"rh2",kind:"rhino",x:183.312,y:1,min:157.584,max:202.608},{id:"bee",kind:"bee",x:266.928,y:8,min:237.984,max:292.656},{id:"m2",kind:"mouse",x:315.168,y:5.4,min:311.952,max:331.248}],hazards:[{id:"hazard-0",kind:"electric",x:287.832,y:3.2,w:3.216,h:.7,period:3.5,activeFor:.9},{id:"casino-floor-spikes",kind:"spike",x:357.078,y:1,w:1.5,h:.5}],decor:[{id:"slotMachine-7-5",kind:"slotMachine",x:22.512,y:5,w:12.864,h:6},{id:"table-12-1",kind:"table",x:38.592,y:1,w:25.728,h:3},{id:"bar-33-1",kind:"bar",x:106.128,y:1,w:73.968,h:5},{id:"bottle-35-5.4",kind:"bottle",x:112.56,y:5.4,w:9.648,h:3},{id:"restaurantDoor-58-1",kind:"restaurantDoor",x:186.528,y:1,w:16.08,h:8},{id:"curtain-86-1",kind:"curtain",x:276.576,y:1,w:128.64,h:14},{id:"chandelier-80-8",kind:"chandelier",x:257.28,y:8,w:12.864,h:5},{id:"chandelier-100-8",kind:"chandelier",x:321.6,y:8,w:12.864,h:5},{id:"slotMachine-119-1",kind:"slotMachine",x:382.704,y:1,w:16.08,h:11}],exit:{x:392.352,y:1},boss:{id:"boss-casinoCat",kind:"casinoCat",x:382.704,y:5.5,w:3.3,h:3.5,hp:5,arena:{x:347.328,y:1,w:57.888}},checkpoints:[{x:205.824,y:3.2}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["red restaurant","bottles and counter","blue-curtain casino platforms","slot machine cat"],landmarks:["restaurant stools and bottle shelves","hanging brass lamps","slot machine occupied by casino cat"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"H",name:"\u4E0B\u6C34\u9053\u4E0E\u7BA1\u9053\u6500\u767B",theme:"sewer",width:241,height:59,spawn:{x:3.708,y:1},platforms:[{id:"sewer-west",x:0,y:1,w:25.954,h:.65,kind:"solid",oneWay:!1},{id:"pipe-low",x:25.954,y:2,w:14.831,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-mid",x:38.931,y:4.4,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"sewer-east",x:55.615,y:1,w:22.246,h:.65,kind:"solid",oneWay:!1},{id:"pipe-base",x:74.154,y:2.4,w:22.246,h:.65,kind:"pipe",oneWay:!0,route:!0},{id:"pipe-1",x:81.569,y:4.8,w:18.538,h:.65,kind:"pipe",oneWay:!0,route:!0},{id:"pipe-2",x:74.154,y:7.2,w:18.538,h:.65,kind:"pipe",oneWay:!0,route:!0},{id:"pipe-3",x:81.569,y:9.6,w:18.538,h:.65,kind:"pipe",oneWay:!0,route:!0},{id:"pipe-4",x:74.154,y:12,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-5",x:81.569,y:14.4,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-6",x:74.154,y:16.8,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-7",x:81.569,y:19.2,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-8",x:74.154,y:21.6,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-9",x:81.569,y:24,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-10",x:74.154,y:26.4,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"upper-pipe",x:88.985,y:48,w:31.515,h:.65,kind:"pipe",oneWay:!0},{id:"upper-bank",x:120.5,y:48,w:20.392,h:.65,kind:"solid",oneWay:!1},{id:"water-ledge",x:142.746,y:50.2,w:13.285,h:.65,kind:"solid",oneWay:!1},{id:"water-middle",x:159.431,y:48.2,w:13.285,h:.65,kind:"solid",oneWay:!1},{id:"brick-ridge",x:176.115,y:50.6,w:14.831,h:.65,kind:"solid",oneWay:!1},{id:"final-pipe",x:192.8,y:50.6,w:29.662,h:.65,kind:"pipe",oneWay:!0},{id:"exit-bank",x:224.315,y:50.6,w:16.685,h:.65,kind:"solid",oneWay:!1},{id:"pipe-11",x:82,y:28.8,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-12",x:74,y:31.2,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-13",x:82,y:33.6,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-14",x:74,y:36,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-15",x:82,y:38.4,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-16",x:74,y:40.8,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-17",x:82,y:43.2,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-18",x:74,y:45.6,w:18,h:.65,kind:"pipe",oneWay:!0}],objects:[{id:"h1",kind:"crate",x:5.562,y:1},{id:"h2",kind:"metal",x:42.638,y:4.4},{id:"h3",kind:"crate",x:64.885,y:1},{id:"h4",kind:"crate",x:79.715,y:7.2},{id:"h5",kind:"bigcrate",x:87.131,y:14.4,contents:"zipper"},{id:"h6",kind:"metal",x:81.569,y:21.6},{id:"h7",kind:"crate",x:114.938,y:48},{id:"h8",kind:"apple",x:148.308,y:50.2},{id:"h9",kind:"crate",x:202.069,y:50.6,contents:"star"}],enemies:[{id:"cr1",kind:"crab",x:18.538,y:1,min:5.562,max:24.1},{id:"cr2",kind:"crab",x:48.2,y:4.4,min:40.785,max:55.615},{id:"b1",kind:"bird",x:83.423,y:12,min:76.008,max:94.546},{id:"cr3",kind:"crab",x:87.131,y:19.2,min:83.423,max:98.254},{id:"l1",kind:"lizard",x:129.769,y:48,min:122.354,max:139.038},{id:"l2",kind:"lizard",x:166.846,y:48.2,min:161.285,max:170.554},{id:"b2",kind:"bird",x:202.069,y:54.2,min:190.946,max:218.754},{id:"l3",kind:"lizard",x:231.731,y:50.6,min:226.169,max:239.146}],hazards:[{id:"hazard-0",kind:"water",x:40.785,y:-1,w:29.662,h:2},{id:"hazard-1",kind:"water",x:159.431,y:45.2,w:37.077,h:2},{id:"hazard-2",kind:"faucet",x:204.85,y:50.6,w:1.854,h:3,period:3,activeFor:.8}],decor:[{id:"brickWall-64-1",kind:"brickWall",x:118.646,y:1,w:237.292,h:37},{id:"water-22--1",kind:"water",x:40.785,y:-1,w:31.515,h:2},{id:"pipe-17-2",kind:"pipe",x:31.515,y:2,w:3.708,h:7},{id:"pipe-28-1",kind:"pipe",x:51.908,y:1,w:3.708,h:7},{id:"pipe-40-2",kind:"pipe",x:74.154,y:2,w:3.708,h:29},{id:"pipe-55-2",kind:"pipe",x:101.962,y:2,w:3.708,h:31},{id:"drain-59-31",kind:"drain",x:109.377,y:50.2,w:5.562,h:3},{id:"water-85-26",kind:"water",x:157.577,y:45.2,w:37.077,h:2},{id:"pipe-112-30",kind:"pipe",x:207.631,y:49.2,w:37.077,h:2}],exit:{x:235.438,y:50.6},boss:null,checkpoints:[{x:81.569,y:16.8},{x:122.354,y:48}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["low sewer pipe maze","tall pipe climb","upper white banks","three-tier upper pipes"],landmarks:["orange pipe maze against blue brick","green wastewater","upper pipe racks and lizards"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"I",name:"\u529E\u516C\u5BA4\u4E0E\u7535\u8BDD",theme:"office",width:290,height:14,spawn:{x:4.531,y:1},platforms:[{id:"can-table",x:0,y:1,w:36.25,h:.65,kind:"solid",oneWay:!1},{id:"can-step",x:15.859,y:3.2,w:11.328,h:.65,kind:"solid",oneWay:!1},{id:"desk-a",x:38.516,y:3.4,w:33.984,h:.65,kind:"solid",oneWay:!1},{id:"phone-pole",x:70.234,y:5.6,w:12.459,h:.65,kind:"shelf",oneWay:!0},{id:"desk-b",x:86.094,y:3.4,w:27.188,h:.65,kind:"solid",oneWay:!1},{id:"drawer-step",x:113.281,y:1.4,w:11.328,h:.65,kind:"solid",oneWay:!1},{id:"file-cans",x:126.875,y:3.6,w:13.594,h:.65,kind:"solid",oneWay:!1},{id:"phone-pole-two",x:140.469,y:5.8,w:12.459,h:.65,kind:"shelf",oneWay:!0},{id:"desk-c",x:156.328,y:3.6,w:36.25,h:.65,kind:"solid",oneWay:!1},{id:"phone-table",x:194.844,y:3.6,w:27.188,h:.65,kind:"solid",oneWay:!1},{id:"drawer-a",x:208.438,y:5.8,w:12.459,h:.65,kind:"solid",oneWay:!1},{id:"drawer-b",x:224.297,y:8,w:12.459,h:.65,kind:"solid",oneWay:!1},{id:"ceiling-cross",x:240.156,y:8,w:13.594,h:.65,kind:"shelf",oneWay:!0},{id:"phone-final",x:251.484,y:5.8,w:13.594,h:.65,kind:"solid",oneWay:!1},{id:"caterpillar-floor",x:265.078,y:5.8,w:24.922,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"i1",kind:"crate",x:6.797,y:1},{id:"i2",kind:"apple",x:24.922,y:3.2},{id:"i3",kind:"crate",x:54.375,y:3.4},{id:"i4",kind:"metal",x:99.688,y:3.4},{id:"i5",kind:"bigcrate",x:163.125,y:3.6,contents:"acorn"},{id:"i6",kind:"crate",x:203.906,y:3.6},{id:"i7",kind:"crate",x:228.828,y:8},{id:"ball-I",kind:"ball",x:269.609,y:5.8}],enemies:[{id:"m1",kind:"mouse",x:45.313,y:3.4,min:40.781,max:67.969},{id:"b1",kind:"bird",x:77.031,y:8,min:63.438,max:101.953},{id:"m2",kind:"mouse",x:95.156,y:3.4,min:88.359,max:111.016},{id:"m3",kind:"mouse",x:178.984,y:3.6,min:158.594,max:190.313},{id:"b2",kind:"bird",x:219.766,y:10,min:197.109,max:242.422},{id:"m4",kind:"mouse",x:253.75,y:5.8,min:251.484,max:262.813}],hazards:[{id:"hazard-0",kind:"electric",x:143.867,y:5.8,w:2.266,h:.6,period:3.4,activeFor:1}],decor:[{id:"cans-7-1",kind:"cans",x:15.859,y:1,w:27.188,h:6},{id:"desk-24-1",kind:"desk",x:54.375,y:1,w:36.25,h:3},{id:"phone-32-3.4",kind:"phone",x:72.5,y:3.4,w:9.063,h:5},{id:"desk-43-1",kind:"desk",x:97.422,y:1,w:29.453,h:3},{id:"cans-57-1",kind:"cans",x:129.141,y:1,w:13.594,h:5},{id:"desk-77-1",kind:"desk",x:174.453,y:1,w:38.516,h:3},{id:"phone-78-3.6",kind:"phone",x:176.719,y:3.6,w:9.063,h:4},{id:"drawers-96-3.6",kind:"drawers",x:217.5,y:3.6,w:18.125,h:6},{id:"phone-113-5.8",kind:"phone",x:256.016,y:5.8,w:9.063,h:4}],exit:{x:283.203,y:5.8},boss:{id:"boss-caterpillar",kind:"caterpillar",x:278.672,y:7.4,w:1.5,h:4.8,hp:5,arena:{x:253.75,y:5.8,w:36.25}},checkpoints:[{x:156.328,y:3.6}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["can pyramids","desks and upright telephones","drawer stacks","hanging cabinet passages","caterpillar arena"],landmarks:["pyramids of office cans","giant blue telephones","orange filing drawers"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"J",name:"\u80A5\u732B\u7684\u5DE5\u5382",theme:"fatcat",width:128,height:58,spawn:{x:1.803,y:1},platforms:[{id:"lower-west",x:0,y:1,w:14.423,h:.65,kind:"solid",oneWay:!1},{id:"lower-belt-a",x:15.324,y:1,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:-1.8},{id:"lower-belt-b",x:38.761,y:1,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:1.5},{id:"lower-belt-c",x:62.197,y:1,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:-1.8},{id:"lower-east",x:84.732,y:1,w:10.817,h:.65,kind:"solid",oneWay:!1},{id:"right-shaft-a",x:91.944,y:3.4,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"right-shaft-b",x:95.549,y:5.8,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"right-shaft-c",x:91.944,y:8.2,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"right-shaft-d",x:95.549,y:10.6,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"right-shaft-e",x:102,y:13,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"middle-east",x:82.028,y:15.4,w:18.93,h:.65,kind:"solid",oneWay:!1},{id:"middle-machine",x:67.606,y:15.4,w:13.521,h:.65,kind:"solid",oneWay:!1},{id:"middle-duct",x:54.085,y:15.4,w:11.718,h:.65,kind:"solid",oneWay:!1},{id:"middle-belt",x:30.648,y:15.4,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:1.8},{id:"middle-boxes",x:14.423,y:15.4,w:14.423,h:.65,kind:"solid",oneWay:!1},{id:"middle-west",x:0,y:15.4,w:12.62,h:.65,kind:"solid",oneWay:!1},{id:"left-shaft-a",x:0,y:17.8,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"left-shaft-b",x:3.606,y:20.2,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"left-shaft-c",x:0,y:22.6,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"left-shaft-d",x:3.606,y:25,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"left-shaft-e",x:0,y:27.4,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"upper-west",x:3.606,y:29.8,w:12.62,h:.65,kind:"solid",oneWay:!1},{id:"upper-belt",x:18.028,y:29.8,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:-1.7},{id:"upper-press",x:41.465,y:29.8,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:1.6},{id:"upper-boxes",x:64.901,y:29.8,w:17.127,h:.65,kind:"solid",oneWay:!1},{id:"upper-gifts",x:83.831,y:32.2,w:11.718,h:.65,kind:"solid",oneWay:!1},{id:"cat-door",x:97.352,y:34.6,w:9.014,h:.65,kind:"solid",oneWay:!1},{id:"fat-cat-desk",x:107.268,y:34.6,w:20.732,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"j1",kind:"crate",x:3.606,y:1},{id:"j2",kind:"metal",x:17.127,y:1},{id:"j3",kind:"bigcrate",x:31.549,y:1,contents:"zipper"},{id:"j4",kind:"crate",x:55.887,y:1},{id:"j5",kind:"crate",x:87.437,y:1},{id:"j6",kind:"apple",x:74.817,y:15.4},{id:"j7",kind:"crate",x:44.169,y:15.4},{id:"j8",kind:"crate",x:4.507,y:15.4},{id:"j9",kind:"bigcrate",x:24.338,y:29.8,contents:"acorn"},{id:"j10",kind:"metal",x:49.577,y:29.8},{id:"j11",kind:"crate",x:87.437,y:32.2},{id:"ball-J",kind:"ball",x:110.873,y:34.6}],enemies:[{id:"rh1",kind:"rhino",x:19.831,y:1,min:16.225,max:36.056},{id:"rh2",kind:"rhino",x:65.803,y:1,min:63.099,max:82.93},{id:"k1",kind:"kangaroo",x:86.535,y:15.4,min:82.93,max:98.254},{id:"k2",kind:"kangaroo",x:43.268,y:15.4,min:32.451,max:49.577},{id:"l1",kind:"lizard",x:18.93,y:15.4,min:15.324,max:27.944},{id:"l2",kind:"lizard",x:69.408,y:29.8,min:65.803,max:81.127},{id:"k3",kind:"kangaroo",x:48.676,y:29.8,min:42.366,max:62.197}],hazards:[{id:"hazard-0",kind:"press",x:22.22,y:1,w:1.172,h:2.5,period:3.3,activeFor:.7},{id:"hazard-1",kind:"press",x:45.656,y:1,w:1.172,h:2.5,period:3.8,activeFor:.7},{id:"hazard-2",kind:"press",x:71.797,y:1,w:1.172,h:2.5,period:4.1,activeFor:.8},{id:"hazard-3",kind:"electric",x:35.606,y:15.4,w:.901,h:.8,period:3.4,activeFor:.8},{id:"hazard-4",kind:"press",x:46.513,y:29.8,w:1.082,h:2.5,period:3.9,activeFor:.8},{id:"hazard-5",kind:"press",x:58.231,y:29.8,w:1.082,h:2.5,period:3.4,activeFor:.7}],decor:[{id:"catBox-6-1",kind:"catBox",x:5.408,y:1,w:7.211,h:7},{id:"press-25-4",kind:"press",x:22.535,y:4,w:2.704,h:8},{id:"press-51-4",kind:"press",x:45.972,y:4,w:2.704,h:8},{id:"press-80-4",kind:"press",x:72.113,y:4,w:2.704,h:8},{id:"pipe-107-1",kind:"pipe",x:96.451,y:1,w:3.606,h:16},{id:"machine-82-15.4",kind:"machine",x:73.915,y:15.4,w:10.817,h:6},{id:"duct-64-15.4",kind:"duct",x:57.69,y:15.4,w:4.507,h:10},{id:"catBox-22-15.4",kind:"catBox",x:19.831,y:15.4,w:8.113,h:6},{id:"conveyor-44-29.8",kind:"conveyor",x:39.662,y:29.8,w:44.169,h:3},{id:"catBox-80-29.8",kind:"catBox",x:72.113,y:29.8,w:16.225,h:7},{id:"desk-129-31",kind:"desk",x:116.282,y:31,w:20.732,h:4},{id:"curtain-129-34.6",kind:"curtain",x:116.282,y:34.6,w:20.732,h:12}],exit:{x:125.296,y:34.6},boss:{id:"boss-fatCat",kind:"fatCat",x:119.887,y:35.8,w:6,h:6.5,hp:5,arena:{x:107.268,y:34.6,w:20.732}},checkpoints:[{x:85.634,y:1},{x:86.535,y:15.4},{x:5.408,y:29.8}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["lower conveyor floor east","right shaft up","middle machines and boxes west","left climb","upper presses and belts east","Fat Cat desk"],landmarks:["Fat Cat branded orange boxes","multi-tier reversal through machinery","giant purple-suited Fat Cat behind desk"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}}],If={0:["A","B"],A:["C"],B:["D"],C:["D"],D:["E","F"],E:["F"],F:["G"],G:["H"],H:["I"],I:["J"],J:[]};function aa(i){let e=zs.find(t=>t.id===String(i));if(!e)throw new RangeError(`Unknown area: ${i}`);return structuredClone(e)}function Tl(i){return[...If[String(i)]??[]]}function Lh(){return{current:"0",completed:[],unlocked:["0"],ending:!1}}function Pi(i){let e=new Set(["0",...i?.completed??[]]);for(let t of i?.completed??[])for(let n of Tl(t))e.add(n);return zs.map(t=>t.id).filter(t=>e.has(t))}function oa(i,e){return e=String(e),!i||!Pi(i).includes(e)?!1:(i.completed.includes(e)||i.completed.push(e),i.unlocked=Pi(i),i.current=Tl(e).find(t=>!i.completed.includes(t))??e,i.ending=i.completed.includes("J"),!0)}var Pf=28,Vs=1/120,gn=i=>structuredClone(i),Gs=(i,e,t)=>Math.max(e,Math.min(t,i)),Nh=i=>({left:i.x-i.w/2,right:i.x+i.w/2,bottom:i.y,top:i.y+i.h});function Xn(i,e){let t=Nh(i),n=Nh(e);return t.left<n.right&&t.right>n.left&&t.bottom<n.top&&t.top>n.bottom}function It(i,e,t={}){i.events.push({id:`event-${i.nextEventId++}`,type:e,time:i.time,...t}),i.events.length>100&&i.events.splice(0,i.events.length-100)}function Lf(i){return{w:i.kind==="bigcrate"?1.6:.8,h:i.kind==="bigcrate"?1.6:.8,vx:0,vy:0,active:!0,heldBy:null,thrown:!1,grounded:!1,hitIds:[],recover:{x:i.x,y:i.y},...gn(i)}}function kh(i,e,t,n=0){return{id:i,character:e,x:t.x+n,y:t.y,vx:0,vy:0,w:.8,h:1.3,facing:1,hearts:3,lives:3,grounded:!0,groundId:null,carrying:null,heldBy:null,hidden:!1,invulnerable:0,stun:0,zipper:0,dropTimer:0,throwTimer:0,animation:"idle"}}function Fh(i,e){i.level=gn(e),i.platforms=(e.platforms??[]).map(t=>({...gn(t),homeX:t.x,homeY:t.y,dx:0,dy:0})),i.objects=(e.objects??[]).map(Lf),i.enemies=(e.enemies??[]).map(t=>({w:1,h:1,vx:0,vy:0,alive:!0,facing:-1,speed:1.7,timer:0,homeY:t.y,min:t.x-3,max:t.x+3,...gn(t)})),i.hazards=gn(e.hazards??[]),i.pickups=(e.pickups??[]).map(t=>({w:.55,h:.6,collected:!1,...gn(t)})),i.boss=e.boss?{w:2,h:2.4,...gn(e.boss),homeX:e.boss.x,homeY:e.boss.y,active:!1,hp:5,defeated:!1,invulnerable:0,timer:0,attackTimer:0}:null,i.projectiles=[],i.effects=[]}function Ws(i,{players:e=1,character:t="chip",campaign:n=null}={}){let s={areaLevel:gn(i),level:null,players:[],objects:[],enemies:[],hazards:[],boss:null,projectiles:[],effects:[],events:[],time:0,paused:!1,status:"playing",score:0,flowers:0,stars:0,completed:[...n?.completed??[]],checkpoint:gn(i.spawn),campaign:n,bonus:null,ending:!1,nextEntityId:1,nextEventId:1,previousInputs:[],_accumulator:0,_pendingEdges:[]};return Fh(s,i),s.players=Array.from({length:Gs(e,1,2)},(r,a)=>kh(`p${a+1}`,a===0?t:t==="chip"?"dale":"chip",i.spawn,a*.9)),s}function Cl(i,e){i.paused=!!e,i.previousInputs=[],i._accumulator=0,i._pendingEdges=[]}function Rl(i,e,t=!1,n=!1){let s=e.carrying;if(!s)return;let r=(s.type==="player"?i.players:i.objects).find(a=>a.id===s.id);e.carrying=null,r&&(r.heldBy=null,r.x=e.x+(n?0:e.facing*(e.w/2+r.w/2+.15)),r.y=e.y+.9,r.vx=t?n?0:e.facing*(r.kind==="apple"?7:11):0,r.vy=t?n?16:3:0,r.grounded=!1,s.type==="object"?(r.thrown=t,r.hitIds=[],r.owner=e.id):(r.throwTimer=t?.55:0,r.stun=t?.18:0),t&&It(i,"throw",{player:e.id,kind:r.kind??"player",up:n}))}function Nf(i,e,t){if(e.heldBy||e.stun>0||e.hidden)return;if(e.carrying){Rl(i,e,!0,t.up);return}let n=o=>Math.abs(o.x-e.x)<1.5&&Math.abs(o.y-e.y)<1.6,r=i.objects.filter(o=>o.active&&!o.heldBy&&o.kind!=="bigcrate"&&n(o)).sort((o,l)=>Math.abs(o.x-e.x)-Math.abs(l.x-e.x))[0],a="object";r||(a="player",r=i.players.find(o=>o.id!==e.id&&o.lives>0&&!o.heldBy&&!o.carrying&&n(o))),r&&(r.heldBy=e.id,r.thrown=!1,r.vx=0,r.vy=0,e.carrying={type:a,id:r.id},It(i,"pickup",{player:e.id,kind:r.kind??"player"}))}function Df(i,e,t=!0){let n=i.platforms.map(s=>({...s,top:s.y,left:s.x,right:s.x+s.w}));if(t)for(let s of i.objects)s!==e&&s.active&&!s.heldBy&&!s.thrown&&s.grounded&&s.kind!=="ball"&&n.push({id:s.id,left:s.x-s.w/2,right:s.x+s.w/2,top:s.y+s.h,h:s.h,oneWay:!1,object:!0});return n}function ca(i,e,t,{ignoreOneWay:n=!1,objects:s=!0,sideWalls:r=!0}={}){let a=e.y,o=e.x,l=e.grounded,c=Df(i,e,s);e.vy-=Pf*t,e.x+=e.vx*t,e.y+=e.vy*t,e.grounded=!1,e.groundId=null;let h=null;for(let d of c){if(n&&d.oneWay)continue;let u=e.x-e.w/2,p=e.x+e.w/2;p>d.left+.025&&u<d.right-.025&&e.vy<=0&&a>=d.top-.06&&e.y<=d.top+.001&&(!h||d.top>h.top)&&(h=d),!d.oneWay&&p>d.left+.025&&u<d.right-.025&&e.vy>0&&a+e.h<=d.top-d.h+.03&&e.y+e.h>=d.top-d.h&&(e.y=d.top-d.h-e.h,e.vy=0),r&&!d.oneWay&&!d.object&&e.y<d.top-.12&&e.y+e.h>d.top-d.h+.1&&(o+e.w/2<=d.left+.025&&p>d.left?(e.x=d.left-e.w/2,e.vx=0):o-e.w/2>=d.right-.025&&u<d.right&&(e.x=d.right+e.w/2,e.vx=0))}return h&&(e.y=h.top,e.vy=0,e.grounded=!0,e.groundId=h.id,h.kind==="conveyor"&&(e.x+=(h.speed??1.5)*t)),!l&&e.grounded}function Hs(i,e,t,n=!1){e.lives<=0||e.heldBy||!n&&(e.invulnerable>0||e.zipper>0)||(n?e.hearts=0:e.hearts--,Rl(i,e),e.invulnerable=1.5,e.stun=.25,e.vx=(Math.sign(e.x-t.x)||-e.facing)*4,e.vy=6,e.hidden=!1,It(i,"damage",{player:e.id,hearts:e.hearts}),e.hearts<=0&&(e.lives--,It(i,"lifeLost",{player:e.id,lives:e.lives}),e.lives>0?Object.assign(e,{x:i.checkpoint.x,y:i.checkpoint.y,hearts:3,vx:0,vy:0,grounded:!0,stun:0,invulnerable:2,throwTimer:0}):(e.hearts=0,e.vx=0,e.vy=0),i.players.every(s=>s.lives<=0)&&(i.status="gameover")))}function Dh(i,e=!1){if(i.stars++,e&&It(i,"star",{converted:!0}),i.stars%10===0){for(let t of i.players){let n=t.lives<=0;t.lives++,n&&Object.assign(t,kh(t.id,t.character,i.checkpoint),{lives:t.lives,invulnerable:2})}It(i,"extraLife")}}function Uf(i,e,t){t.collected=!0;let n=t.kind;if(n==="flower")i.flowers++,i.score+=100,i.flowers%50===0&&Dh(i,!0);else if(n==="star")i.score+=500,Dh(i);else if(n==="acorn")e.hearts=Math.min(3,e.hearts+1);else if(n==="zipper")for(let s of i.players)s.zipper=10;i.bonus&&i.bonus.collected++,It(i,"collect",{kind:n,player:e.id})}function la(i,e){if(!e.contents||e.opened)return;e.opened=!0;let t=Array.isArray(e.contents)?e.contents:[e.contents];for(let[n,s]of t.entries())i.pickups.push({id:`${e.id}-contents-${n}`,kind:s,x:e.x+n%3*.65,y:e.y,w:.55,h:.6,collected:!1})}function Oh(i,e){if(!e.hidden)return!1;let t=i.objects.find(n=>n.id===e.carrying?.id);return t?.kind==="crate"&&(e.carrying=null,t.heldBy=null,t.active=!1,t.x=e.x,t.y=e.y,la(i,t),e.hidden=!1,e.invulnerable=Math.max(e.invulnerable,.3),It(i,"break",{kind:"crate"})),!0}function Al(i,e,t){if(!e.hitIds.includes(t.id)){if(t===i.boss){if(e.kind!=="ball"||t.invulnerable>0||t.breakTimer>0||!t.active||t.defeated)return;if(t.hp--,t.invulnerable=.65,i.score+=500,It(i,"bossHit",{kind:t.kind,hp:t.hp}),t.kind==="caterpillar"){t.breakTimer=.9,t.phase="separated",t.contactRegions=[],t.segments=[];for(let n=0;n<5;n++)i.projectiles.push({id:`segment-${i.nextEntityId++}`,kind:"segment",owner:t.id,x:t.x,y:t.y+n*t.h/5,w:.7,h:.7,vx:(n-2)*2.1,vy:4-n*.3,gravity:12,ttl:2})}e.vx=(Math.sign(e.x-t.x)||-1)*4,e.vy=5,e.thrown=!1,t.hp<=0&&(t.defeated=!0,i.projectiles=i.projectiles.filter(n=>n.owner!==t.id),i.score+=2500,It(i,"bossDefeated",{kind:t.kind}))}else t.kind==="bigcrate"?(t.active=!1,la(i,t),It(i,"break",{kind:"bigcrate"})):(t.alive=!1,i.score+=200,It(i,"hit",{kind:t.kind}));e.kind==="crate"?(e.active=!1,la(i,e)):e.kind!=="apple"?(e.vx*=.35,e.vy=4):(e.active=!1,la(i,e)),e.hitIds.push(t.id)}}function Uh(i,e){Object.assign(e,{x:e.recover.x,y:e.recover.y,vx:0,vy:0,thrown:!1,grounded:!1,groundId:null,hitIds:[]}),It(i,"recover",{kind:e.kind})}function Il(i,e,t=!1,n=null){for(let s of i.objects.filter(r=>!n||n.has(r.id)).sort((r,a)=>r.y-a.y)){if(!s.active||s.heldBy)continue;let r=s.vx,a=ca(i,s,e,{sideWalls:!s.thrown});if(!t&&s.kind==="ball"&&s.vy<-1)for(let o of i.players)!o.heldBy&&o.lives>0&&Xn(s,o)&&(o.stun=.5,s.vy=4,s.vx=(Math.sign(s.x-o.x)||1)*3,It(i,"stun",{player:o.id,kind:"ball"}));if(s.grounded&&(s.vx*=Math.max(0,1-e*7),Math.abs(s.vx)<.2&&(s.vx=0,s.thrown=!1)),a&&s.thrown&&s.kind==="ball"&&(s.vy=3,s.grounded=!1,s.vx=r*.5),!t){if(s.y<-4||s.x<-2||s.x>i.level.width+2){s.kind==="ball"||s.kind==="metal"?Uh(i,s):s.active=!1;continue}if(s.kind==="ball"&&i.boss?.active&&!i.boss.defeated&&i.boss.arena){let o=i.boss.arena;(s.x<o.x-.8||s.x>o.x+o.w+.8||s.y<o.y-2)&&Uh(i,s)}if(s.thrown){for(let o of i.enemies)s.active&&o.alive&&Xn(s,o)&&Al(i,s,o);for(let o of i.objects)s.active&&o!==s&&o.active&&o.kind==="bigcrate"&&Xn(s,o)&&Al(i,s,o);s.active&&i.boss&&!i.boss.defeated&&Xn(s,i.boss.weakpoint??i.boss)&&Al(i,s,i.boss)}}}}function Bh(i,e,t=!1){for(let n of i.enemies){if(!n.alive)continue;let s=i.players.find(r=>r.lives>0&&Math.abs(r.x-n.x)<24&&Math.abs(r.y-n.y)<12);if(s&&(n.timer+=e,["bird","bee","pelican"].includes(n.kind)?(n.x+=n.facing*(n.speed??2)*e,n.y=n.homeY+Math.sin(n.timer*(n.kind==="bee"?4:2))*1.1,n.kind==="pelican"&&n.timer>2.4&&(n.timer=0,t||i.projectiles.push({id:`enemy-shot-${i.nextEntityId++}`,kind:"drop",owner:n.id,x:n.x,y:n.y,vx:0,vy:-2,w:.4,h:.5,ttl:4,gravity:10}))):(n.kind==="mimic"?(n.animation=Math.abs(s.x-n.x)<4?"lunge":"disguise",n.vx=n.animation==="lunge"?Math.sign(s.x-n.x)*4:0):["rhino","dog"].includes(n.kind)&&Math.abs(s.x-n.x)<4?(n.vx=n.speed===0?0:Math.sign(s.x-n.x)*(n.kind==="rhino"?4.4:2.8),n.animation="charge"):n.vx=n.facing*(n.speed??1.7),n.kind==="kangaroo"&&n.grounded&&n.timer>.9&&(n.vy=9,n.timer=0),n.kind==="toy"&&n.timer>2.8&&(n.timer=0,t||i.projectiles.push({id:`enemy-shot-${i.nextEntityId++}`,kind:"gear",owner:n.id,x:n.x,y:n.y+.5,vx:n.facing*4,vy:3,w:.4,h:.4,ttl:4,gravity:10,bounce:!0})),ca(i,n,e,{objects:!1}),!t&&n.y<-4&&(n.alive=!1)),n.x<=n.min&&(n.x=n.min,n.facing=1),n.x>=n.max&&(n.x=n.max,n.facing=-1),!t))for(let r of i.players)r.lives>0&&!r.heldBy&&Xn(r,n)&&(r.hidden||r.zipper>0||r.throwTimer>0?(n.alive=!1,i.score+=200,It(i,"hit",{kind:n.kind}),Oh(i,r)):Hs(i,r,n))}}function kf(i,e){for(let t of i.projectiles){if(t.ttl-=e,t.vy-=(t.gravity??0)*e,t.x+=t.vx*e,t.y+=t.vy*e,t.bounce)for(let n of i.platforms)t.vy<0&&t.y<n.y&&t.y>n.y-.4&&t.x>n.x&&t.x<n.x+n.w&&(t.y=n.y,t.vy=5);for(let n of i.players)n.lives>0&&Xn(n,t)&&(Oh(i,n)||Hs(i,n,t),t.ttl=0)}i.projectiles=i.projectiles.filter(t=>t.ttl>0&&t.y>-5&&t.x>-5&&t.x<i.level.width+5)}function Ff(i){return{id:`bonus-${i}`,name:"\u901A\u5173\u5956\u52B1\u623F",theme:"bonus",width:24,height:12,spawn:{x:2,y:1},platforms:[{id:"bonus-floor",x:0,y:1,w:24,h:1},{id:"bonus-low",x:5,y:3.2,w:6,h:.5,kind:"shelf",oneWay:!0},{id:"bonus-high",x:13,y:5.4,w:7,h:.5,kind:"shelf",oneWay:!0}],objects:[{id:"bonus-box",kind:"bigcrate",x:10,y:1,contents:["star","acorn"]},{id:"bonus-crate",kind:"crate",x:3,y:1}],pickups:[...Array.from({length:10},(e,t)=>({id:`bonus-flower-${t}`,kind:"flower",x:4+t*1.6,y:1.2})),{id:"bonus-star",kind:"star",x:17,y:5.5}],enemies:[],hazards:[],boss:null,checkpoints:[],decor:[{id:"bonus-back",kind:"curtain",x:12,y:1,w:24,h:10}],exit:{x:23,y:1},reference:{sections:["timed collection room"],landmarks:["three reward shelves"]}}}function zh(i){let e=i.areaLevel.id;i.status="cleared",i.completed.includes(e)||i.completed.push(e),i.campaign&&(oa(i.campaign,e),i.completed=[...i.campaign.completed]),i.ending=e==="J",i.bonus=null,It(i,"clear",{area:e,ending:i.ending})}function Pl(i){i.status==="bonus"&&zh(i)}function Of(i){if(i.areaLevel.id==="J"){zh(i);return}for(let e of i.players)Rl(i,e);Fh(i,Ff(i.areaLevel.id)),i.checkpoint=gn(i.level.spawn),i.status="bonus",i.bonus={areaId:i.areaLevel.id,remaining:20,collected:0};for(let[e,t]of i.players.entries())Object.assign(t,{x:2+e,y:1,vx:0,vy:0,heldBy:null,carrying:null,hidden:!1,grounded:!0,groundId:null,invulnerable:1});It(i,"bonus",{area:i.areaLevel.id})}function Vh(i,e,t,n,s,r=!1){if(e.lives<=0)return;for(let c of["invulnerable","stun","zipper","dropTimer","throwTimer"])e[c]=Math.max(0,e[c]-n);if(e.heldBy)return;let a=e.carrying?.type==="object"?i.objects.find(c=>c.id===e.carrying.id):null;if(e.hidden=!!(t.down&&a&&["crate","metal"].includes(a.kind)&&e.grounded),s&&t.action){let c=e.carrying;if(Nf(i,e,t),r)for(let h of[c,e.carrying])h?.type==="object"&&i._localObjectIds.add(h.id)}s&&t.jump&&e.grounded&&e.stun<=0&&(t.down?i.platforms.find(h=>h.id===e.groundId)?.oneWay&&(e.dropTimer=.3,e.y-=.12,e.grounded=!1):(e.vy=a?.kind==="apple"?11:14,e.grounded=!1,It(i,"jump",{player:e.id})));let o=Gs(Number(t.move)||0,-1,1);e.stun<=0&&e.throwTimer<=0&&(e.vx=e.hidden?0:o*(a?.kind==="apple"?4.1:7.2)),o&&!e.hidden&&(e.facing=Math.sign(o));let l=ca(i,e,n,{ignoreOneWay:e.dropTimer>0});e.x=Gs(e.x,e.w/2,i.level.width-e.w/2),l&&It(i,"land",{player:e.id}),!r&&e.y<-4&&Hs(i,e,{x:e.x},!0),e.animation=e.hidden?"hide":e.heldBy?"held":e.stun>0?"hurt":e.grounded?e.carrying?"carry":Math.abs(e.vx)>.1?"run":"idle":"jump"}function Bf(i,e,t,n){i.time+=t;for(let s of i.platforms){let r=s.x,a=s.y;if(s.kind==="moving"){let o=Math.sin(i.time*(s.speed??1))*(s.range??2);s.axis==="y"?s.y=s.homeY+o:s.x=s.homeX+o}s.dx=s.x-r,s.dy=s.y-a;for(let o of i.players)o.grounded&&o.groundId===s.id&&(o.x+=s.dx,o.y+=s.dy)}for(let[s,r]of i.players.entries())Vh(i,r,e[s]??{},t,n);Ih(i,t),Il(i,t),Bh(i,t),kf(i,t);for(let s of i.players)if(!(s.lives<=0||s.heldBy)){i.boss?.active&&!i.boss.defeated&&(i.boss.contactRegions??[i.boss]).some(r=>Xn(s,r))&&Hs(i,s,i.boss);for(let r of i.hazards)r.active=r.period?(i.time+(r.offset??0))%r.period<(r.activeFor??r.period/2):!0,r.active&&Xn(s,{...r,w:r.w,h:r.h??1})&&Hs(i,s,r);for(let r of i.pickups)!r.collected&&Xn(s,r)&&Uf(i,s,r);for(let r of i.level.checkpoints??[])Math.abs(s.x-r.x)<2&&Math.abs(s.y-r.y)<1.5&&(i.checkpoint=gn(r))}for(let s of i.players)if(s.carrying){let r=(s.carrying.type==="player"?i.players:i.objects).find(a=>a.id===s.carrying.id);r&&(r.x=s.x,r.y=s.hidden?s.y:s.y+s.h+.15,r.vx=0,r.vy=0,r.grounded=!1,s.carrying.type==="player"&&(r.animation="held"))}i.status==="playing"&&(!i.boss||i.boss.defeated)&&i.players.some(s=>s.lives>0&&!s.heldBy&&Math.abs(s.x-i.level.exit.x)<1&&Math.abs(s.y-i.level.exit.y)<2)?Of(i):i.status==="bonus"&&(i.bonus.remaining-=t,(i.bonus.remaining<=0||i.players.some(s=>s.x>i.level.exit.x-.8))&&Pl(i)),i.events=i.events.slice(-100),i.effects=i.effects.filter(s=>i.time-s.time<1.5)}function Ll(i,e=[],t=1/60,n=null){if(i.paused||!["playing","bonus"].includes(i.status))return i;for(let[r,a]of e.entries())i._pendingEdges[r]={action:!!(i._pendingEdges[r]?.action||a.action&&!i.previousInputs[r]?.action),jump:!!(i._pendingEdges[r]?.jump||a.jump&&!i.previousInputs[r]?.jump)};i.previousInputs=e.map(r=>({...r})),i._accumulator+=Gs(Number(t)||0,0,1/30);let s=!0;for(;i._accumulator+1e-9>=Vs&&["playing","bonus"].includes(i.status);){let r=s?e.map((a,o)=>({...a,...i._pendingEdges[o]})):e;n===null?Bf(i,r,Vs,s):zf(i,n,r[n]??{},Vs,s),i._accumulator=Math.max(0,i._accumulator-Vs),s&&(i._pendingEdges=[]),s=!1}return i}function Gh(i,e=0){let t=Math.min(.25,Math.max(0,e));if(i.paused||!["playing","bonus"].includes(i.status))return i;for(;t>1e-9;){let n=Math.min(Vs,t);t-=n,i.time+=n;for(let s of i.platforms){let r=s.x,a=s.y;if(s.kind==="moving"){let o=Math.sin(i.time*(s.speed??1))*(s.range??2);s.axis==="y"?s.y=s.homeY+o:s.x=s.homeX+o}s.dx=s.x-r,s.dy=s.y-a;for(let o of i.players)o.grounded&&o.groundId===s.id&&(o.x+=s.dx,o.y+=s.dy)}for(let s of i.players)s.lives<=0||s.heldBy||(ca(i,s,n,{ignoreOneWay:s.dropTimer>0}),s.x=Gs(s.x,s.w/2,i.level.width-s.w/2));Ph(i.boss,n),Il(i,n,!0),Bh(i,n,!0);for(let s of i.projectiles)if(s.vy-=(s.gravity??0)*n,s.x+=s.vx*n,s.y+=s.vy*n,s.bounce)for(let r of i.platforms)s.vy<0&&s.y<r.y&&s.y>r.y-.4&&s.x>r.x&&s.x<r.x+r.w&&(s.y=r.y,s.vy=5)}return i}function zf(i,e,t,n,s){i.time+=n;let r=i.players[e];for(let a of i.platforms){let o=a.x,l=a.y;if(a.kind==="moving"){let c=Math.sin(i.time*(a.speed??1))*(a.range??2);a.axis==="y"?a.y=a.homeY+c:a.x=a.homeX+c}a.dx=a.x-o,a.dy=a.y-l,r.grounded&&r.groundId===a.id&&(r.x+=a.dx,r.y+=a.dy)}Vh(i,r,t,n,s,!0),Il(i,n,!0,i._localObjectIds);for(let a of i._localObjectIds){let o=i.objects.find(l=>l.id===a);o?.heldBy===r.id&&(o.x=r.x,o.y=r.hidden?r.y:r.y+r.h+.15,o.vx=0,o.vy=0,o.grounded=!1)}i.events=i.events.slice(-100)}function Hh(i,e,t={},n=1/60){if(e!==0&&e!==1)throw Error("Invalid local slot");i._localObjectIds??=new Set,i.players[e].carrying?.type==="object"&&i._localObjectIds.add(i.players[e].carrying.id);let s=i.players.map((r,a)=>({...i.previousInputs[a],jump:!1,action:!1}));return s[e]=t,Ll(i,s,n,e)}var _d=0,gc=1,vd=2;var Nr=1,yo=2,As=3,yi=0,Yt=1,kn=2,Fn=0,Cs=1,xc=2,yc=3,_c=4,bd=5;var Vi=100,Md=101,Sd=102,wd=103,Ed=104,Td=200,Ad=201,Cd=202,Rd=203,vc=204,bc=205,Id=206,Pd=207,Ld=208,Nd=209,Dd=210,Ud=211,kd=212,Fd=213,Od=214,Da=0,Ua=1,ka=2,ms=3,Fa=4,Oa=5,Ba=6,za=7,Mc=0,Bd=1,zd=2,Mn=0,Sc=1,wc=2,Ec=3,Dr=4,Tc=5,Ac=6,Cc=7;var Rc=300,_i=301,Gi=302,_o=303,vo=304,Ur=306,gs=1e3,In=1001,Va=1002,Ft=1003,Vd=1004;var kr=1005;var Pt=1006,bo=1007;var On=1008;var en=1009,Ic=1010,Pc=1011,Rs=1012,Mo=1013,Sn=1014,un=1015,wn=1016,So=1017,wo=1018,Is=1020,Lc=35902,Nc=35899,Dc=1021,Uc=1022,fn=1023,Pn=1026,vi=1027,Eo=1028,To=1029,bi=1030,Ao=1031;var Co=1033,Fr=33776,Or=33777,Br=33778,zr=33779,Ro=35840,Io=35841,Po=35842,Lo=35843,No=36196,Do=37492,Uo=37496,ko=37488,Fo=37489,Vr=37490,Oo=37491,Bo=37808,zo=37809,Vo=37810,Go=37811,Ho=37812,Wo=37813,Xo=37814,qo=37815,Yo=37816,$o=37817,Jo=37818,Zo=37819,jo=37820,Ko=37821,Qo=36492,el=36494,tl=36495,nl=36283,il=36284,Gr=36285,sl=36286;var tr=2300,Ga=2301,La=2302,rc=2303,ac=2400,oc=2401,lc=2402;var Gd=3200;var rl=0,Hd=1,Qn="",Bt="srgb",nr="srgb-linear",ir="linear",ht="srgb";var Na=7680;var Wd=519,Xd=512,qd=513,Yd=514,al=515,$d=516,Jd=517,ol=518,Zd=519,jd=35044;var kc="300 es",bn=2e3,xs=2001;function Vf(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Gf(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function sr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Kd(){let i=sr("canvas");return i.style.display="block",i}var Wh={},ys=null;function Fc(...i){let e="THREE."+i.shift();ys?ys("log",e,...i):console.log(e,...i)}function Qd(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Ge(...i){i=Qd(i);let e="THREE."+i.shift();if(ys)ys("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function We(...i){i=Qd(i);let e="THREE."+i.shift();if(ys)ys("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Fi(...i){let e=i.join(" ");e in Wh||(Wh[e]=!0,Ge(...i))}function eu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var tu={[Da]:Ua,[ka]:Ba,[Fa]:za,[ms]:Oa,[Ua]:Da,[Ba]:ka,[za]:Fa,[Oa]:ms},Ln=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Gt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Nl=Math.PI/180,Ha=180/Math.PI;function Ps(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Gt[i&255]+Gt[i>>8&255]+Gt[i>>16&255]+Gt[i>>24&255]+"-"+Gt[e&255]+Gt[e>>8&255]+"-"+Gt[e>>16&15|64]+Gt[e>>24&255]+"-"+Gt[t&63|128]+Gt[t>>8&255]+"-"+Gt[t>>16&255]+Gt[t>>24&255]+Gt[n&255]+Gt[n>>8&255]+Gt[n>>16&255]+Gt[n>>24&255]).toLowerCase()}function it(i,e,t){return Math.max(e,Math.min(t,i))}function Hf(i,e){return(i%e+e)%e}function Dl(i,e,t){return(1-t)*i+t*e}function Xs(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function $t(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ye=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(it(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Nn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],d=n[s+3],u=r[a+0],p=r[a+1],f=r[a+2],y=r[a+3];if(d!==y||l!==u||c!==p||h!==f){let m=l*u+c*p+h*f+d*y;m<0&&(u=-u,p=-p,f=-f,y=-y,m=-m);let g=1-o;if(m<.9995){let M=Math.acos(m),S=Math.sin(M);g=Math.sin(g*M)/S,o=Math.sin(o*M)/S,l=l*g+u*o,c=c*g+p*o,h=h*g+f*o,d=d*g+y*o}else{l=l*g+u*o,c=c*g+p*o,h=h*g+f*o,d=d*g+y*o;let M=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=M,c*=M,h*=M,d*=M}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],d=r[a],u=r[a+1],p=r[a+2],f=r[a+3];return e[t]=o*f+h*d+l*p-c*u,e[t+1]=l*f+h*u+c*d-o*p,e[t+2]=c*f+h*p+o*u-l*d,e[t+3]=h*f-o*d-l*u-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),d=o(r/2),u=l(n/2),p=l(s/2),f=l(r/2);switch(a){case"XYZ":this._x=u*h*d+c*p*f,this._y=c*p*d-u*h*f,this._z=c*h*f+u*p*d,this._w=c*h*d-u*p*f;break;case"YXZ":this._x=u*h*d+c*p*f,this._y=c*p*d-u*h*f,this._z=c*h*f-u*p*d,this._w=c*h*d+u*p*f;break;case"ZXY":this._x=u*h*d-c*p*f,this._y=c*p*d+u*h*f,this._z=c*h*f+u*p*d,this._w=c*h*d-u*p*f;break;case"ZYX":this._x=u*h*d-c*p*f,this._y=c*p*d+u*h*f,this._z=c*h*f-u*p*d,this._w=c*h*d+u*p*f;break;case"YZX":this._x=u*h*d+c*p*f,this._y=c*p*d+u*h*f,this._z=c*h*f-u*p*d,this._w=c*h*d-u*p*f;break;case"XZY":this._x=u*h*d-c*p*f,this._y=c*p*d-u*h*f,this._z=c*h*f+u*p*d,this._w=c*h*d+u*p*f;break;default:Ge("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],d=t[10],u=n+o+d;if(u>0){let p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>d){let p=2*Math.sqrt(1+n-o-d);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>d){let p=2*Math.sqrt(1+o-n-d);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+d-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(it(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},B=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Xh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Xh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),d=2*(r*n-a*t);return this.x=t+l*c+a*d-o*h,this.y=n+l*h+o*c-r*d,this.z=s+l*d+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this.z=it(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this.z=it(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ul.copy(this).projectOnVector(e),this.sub(Ul)}reflect(e){return this.sub(Ul.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(it(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ul=new B,Xh=new Nn,Ye=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],p=n[5],f=n[8],y=s[0],m=s[3],g=s[6],M=s[1],S=s[4],v=s[7],E=s[2],w=s[5],P=s[8];return r[0]=a*y+o*M+l*E,r[3]=a*m+o*S+l*w,r[6]=a*g+o*v+l*P,r[1]=c*y+h*M+d*E,r[4]=c*m+h*S+d*w,r[7]=c*g+h*v+d*P,r[2]=u*y+p*M+f*E,r[5]=u*m+p*S+f*w,r[8]=u*g+p*v+f*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=h*a-o*c,u=o*l-h*r,p=c*r-a*l,f=t*d+n*u+s*p;if(f===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/f;return e[0]=d*y,e[1]=(s*c-h*n)*y,e[2]=(o*n-s*a)*y,e[3]=u*y,e[4]=(h*t-s*l)*y,e[5]=(s*r-o*t)*y,e[6]=p*y,e[7]=(n*l-c*t)*y,e[8]=(a*t-n*r)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Fi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(kl.makeScale(e,t)),this}rotate(e){return Fi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(kl.makeRotation(-e)),this}translate(e,t){return Fi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(kl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},kl=new Ye,qh=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Yh=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Wf(){let i={enabled:!0,workingColorSpace:nr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ht&&(s.r=jn(s.r),s.g=jn(s.g),s.b=jn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ht&&(s.r=ps(s.r),s.g=ps(s.g),s.b=ps(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Qn?ir:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Fi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Fi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[nr]:{primaries:e,whitePoint:n,transfer:ir,toXYZ:qh,fromXYZ:Yh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Bt},outputColorSpaceConfig:{drawingBufferColorSpace:Bt}},[Bt]:{primaries:e,whitePoint:n,transfer:ht,toXYZ:qh,fromXYZ:Yh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Bt}}}),i}var st=Wf();function jn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ps(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var es,Wa=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{es===void 0&&(es=sr("canvas")),es.width=e.width,es.height=e.height;let s=es.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=es}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=sr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=jn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(jn(t[n]/255)*255):t[n]=jn(t[n]);return{data:t,width:e.width,height:e.height}}else return Ge("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Xf=0,_s=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Xf++}),this.uuid=Ps(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Fl(s[a].image)):r.push(Fl(s[a]))}else r=Fl(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Fl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Wa.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Ge("Texture: Unable to serialize Texture."),{})}var qf=0,Ol=new B,jt=class i extends Ln{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=In,s=In,r=Pt,a=On,o=fn,l=en,c=i.DEFAULT_ANISOTROPY,h=Qn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:qf++}),this.uuid=Ps(),this.name="",this.source=new _s(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ye(0,0),this.repeat=new ye(1,1),this.center=new ye(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ol).x}get height(){return this.source.getSize(Ol).y}get depth(){return this.source.getSize(Ol).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Ge(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Ge(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Rc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case gs:e.x=e.x-Math.floor(e.x);break;case In:e.x=e.x<0?0:1;break;case Va:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case gs:e.y=e.y-Math.floor(e.y);break;case In:e.y=e.y<0?0:1;break;case Va:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};jt.DEFAULT_IMAGE=null;jt.DEFAULT_MAPPING=Rc;jt.DEFAULT_ANISOTROPY=1;var bt=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],d=l[8],u=l[1],p=l[5],f=l[9],y=l[2],m=l[6],g=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-y)<.01&&Math.abs(f-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+y)<.1&&Math.abs(f+m)<.1&&Math.abs(c+p+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let S=(c+1)/2,v=(p+1)/2,E=(g+1)/2,w=(h+u)/4,P=(d+y)/4,_=(f+m)/4;return S>v&&S>E?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=w/n,r=P/n):v>E?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=w/s,r=_/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=P/r,s=_/r),this.set(n,s,r,t),this}let M=Math.sqrt((m-f)*(m-f)+(d-y)*(d-y)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(m-f)/M,this.y=(d-y)/M,this.z=(u-h)/M,this.w=Math.acos((c+p+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this.z=it(this.z,e.z,t.z),this.w=it(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this.z=it(this.z,e,t),this.w=it(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Xa=class extends Ln{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Pt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new bt(0,0,e,t),this.scissorTest=!1,this.viewport=new bt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new jt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Pt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new _s(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Kt=class extends Xa{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},rr=class extends jt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ft,this.minFilter=Ft,this.wrapR=In,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var qa=class extends jt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ft,this.minFilter=Ft,this.wrapR=In,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var ft=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,a,o,l,c,h,d,u,p,f,y,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,d,u,p,f,y,m)}set(e,t,n,s,r,a,o,l,c,h,d,u,p,f,y,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=h,g[10]=d,g[14]=u,g[3]=p,g[7]=f,g[11]=y,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/ts.setFromMatrixColumn(e,0).length(),r=1/ts.setFromMatrixColumn(e,1).length(),a=1/ts.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let u=a*h,p=a*d,f=o*h,y=o*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=p+f*c,t[5]=u-y*c,t[9]=-o*l,t[2]=y-u*c,t[6]=f+p*c,t[10]=a*l}else if(e.order==="YXZ"){let u=l*h,p=l*d,f=c*h,y=c*d;t[0]=u+y*o,t[4]=f*o-p,t[8]=a*c,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=p*o-f,t[6]=y+u*o,t[10]=a*l}else if(e.order==="ZXY"){let u=l*h,p=l*d,f=c*h,y=c*d;t[0]=u-y*o,t[4]=-a*d,t[8]=f+p*o,t[1]=p+f*o,t[5]=a*h,t[9]=y-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let u=a*h,p=a*d,f=o*h,y=o*d;t[0]=l*h,t[4]=f*c-p,t[8]=u*c+y,t[1]=l*d,t[5]=y*c+u,t[9]=p*c-f,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let u=a*l,p=a*c,f=o*l,y=o*c;t[0]=l*h,t[4]=y-u*d,t[8]=f*d+p,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*d+f,t[10]=u-y*d}else if(e.order==="XZY"){let u=a*l,p=a*c,f=o*l,y=o*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=u*d+y,t[5]=a*h,t[9]=p*d-f,t[2]=f*d-p,t[6]=o*h,t[10]=y*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Yf,e,$f)}lookAt(e,t,n){let s=this.elements;return tn.subVectors(e,t),tn.lengthSq()===0&&(tn.z=1),tn.normalize(),ri.crossVectors(n,tn),ri.lengthSq()===0&&(Math.abs(n.z)===1?tn.x+=1e-4:tn.z+=1e-4,tn.normalize(),ri.crossVectors(n,tn)),ri.normalize(),ha.crossVectors(tn,ri),s[0]=ri.x,s[4]=ha.x,s[8]=tn.x,s[1]=ri.y,s[5]=ha.y,s[9]=tn.y,s[2]=ri.z,s[6]=ha.z,s[10]=tn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],p=n[13],f=n[2],y=n[6],m=n[10],g=n[14],M=n[3],S=n[7],v=n[11],E=n[15],w=s[0],P=s[4],_=s[8],A=s[12],N=s[1],T=s[5],L=s[9],z=s[13],I=s[2],R=s[6],k=s[10],H=s[14],J=s[3],G=s[7],F=s[11],Y=s[15];return r[0]=a*w+o*N+l*I+c*J,r[4]=a*P+o*T+l*R+c*G,r[8]=a*_+o*L+l*k+c*F,r[12]=a*A+o*z+l*H+c*Y,r[1]=h*w+d*N+u*I+p*J,r[5]=h*P+d*T+u*R+p*G,r[9]=h*_+d*L+u*k+p*F,r[13]=h*A+d*z+u*H+p*Y,r[2]=f*w+y*N+m*I+g*J,r[6]=f*P+y*T+m*R+g*G,r[10]=f*_+y*L+m*k+g*F,r[14]=f*A+y*z+m*H+g*Y,r[3]=M*w+S*N+v*I+E*J,r[7]=M*P+S*T+v*R+E*G,r[11]=M*_+S*L+v*k+E*F,r[15]=M*A+S*z+v*H+E*Y,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],d=e[6],u=e[10],p=e[14],f=e[3],y=e[7],m=e[11],g=e[15],M=l*p-c*u,S=o*p-c*d,v=o*u-l*d,E=a*p-c*h,w=a*u-l*h,P=a*d-o*h;return t*(y*M-m*S+g*v)-n*(f*M-m*E+g*w)+s*(f*S-y*E+g*P)-r*(f*v-y*w+m*P)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=e[9],u=e[10],p=e[11],f=e[12],y=e[13],m=e[14],g=e[15],M=t*o-n*a,S=t*l-s*a,v=t*c-r*a,E=n*l-s*o,w=n*c-r*o,P=s*c-r*l,_=h*y-d*f,A=h*m-u*f,N=h*g-p*f,T=d*m-u*y,L=d*g-p*y,z=u*g-p*m,I=M*z-S*L+v*T+E*N-w*A+P*_;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let R=1/I;return e[0]=(o*z-l*L+c*T)*R,e[1]=(s*L-n*z-r*T)*R,e[2]=(y*P-m*w+g*E)*R,e[3]=(u*w-d*P-p*E)*R,e[4]=(l*N-a*z-c*A)*R,e[5]=(t*z-s*N+r*A)*R,e[6]=(m*v-f*P-g*S)*R,e[7]=(h*P-u*v+p*S)*R,e[8]=(a*L-o*N+c*_)*R,e[9]=(n*N-t*L-r*_)*R,e[10]=(f*w-y*v+g*M)*R,e[11]=(d*v-h*w-p*M)*R,e[12]=(o*A-a*T-l*_)*R,e[13]=(t*T-n*A+s*_)*R,e[14]=(y*S-f*E-m*M)*R,e[15]=(h*E-d*S+u*M)*R,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,d=o+o,u=r*c,p=r*h,f=r*d,y=a*h,m=a*d,g=o*d,M=l*c,S=l*h,v=l*d,E=n.x,w=n.y,P=n.z;return s[0]=(1-(y+g))*E,s[1]=(p+v)*E,s[2]=(f-S)*E,s[3]=0,s[4]=(p-v)*w,s[5]=(1-(u+g))*w,s[6]=(m+M)*w,s[7]=0,s[8]=(f+S)*P,s[9]=(m-M)*P,s[10]=(1-(u+y))*P,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=ts.set(s[0],s[1],s[2]).length(),o=ts.set(s[4],s[5],s[6]).length(),l=ts.set(s[8],s[9],s[10]).length();r<0&&(a=-a),xn.copy(this);let c=1/a,h=1/o,d=1/l;return xn.elements[0]*=c,xn.elements[1]*=c,xn.elements[2]*=c,xn.elements[4]*=h,xn.elements[5]*=h,xn.elements[6]*=h,xn.elements[8]*=d,xn.elements[9]*=d,xn.elements[10]*=d,t.setFromRotationMatrix(xn),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=bn,l=!1){let c=this.elements,h=2*r/(t-e),d=2*r/(n-s),u=(t+e)/(t-e),p=(n+s)/(n-s),f,y;if(l)f=r/(a-r),y=a*r/(a-r);else if(o===bn)f=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(o===xs)f=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=bn,l=!1){let c=this.elements,h=2/(t-e),d=2/(n-s),u=-(t+e)/(t-e),p=-(n+s)/(n-s),f,y;if(l)f=1/(a-r),y=a/(a-r);else if(o===bn)f=-2/(a-r),y=-(a+r)/(a-r);else if(o===xs)f=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=f,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ts=new B,xn=new ft,Yf=new B(0,0,0),$f=new B(1,1,1),ri=new B,ha=new B,tn=new B,$h=new ft,Jh=new Nn,Kn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(it(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-it(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(it(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-it(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(it(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-it(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:Ge("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return $h.makeRotationFromQuaternion(e),this.setFromRotationMatrix($h,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Jh.setFromEuler(this),this.setFromQuaternion(Jh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Kn.DEFAULT_ORDER="XYZ";var ar=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Jf=0,Zh=new B,ns=new Nn,qn=new ft,da=new B,qs=new B,Zf=new B,jf=new Nn,jh=new B(1,0,0),Kh=new B(0,1,0),Qh=new B(0,0,1),ed={type:"added"},Kf={type:"removed"},is={type:"childadded",child:null},Bl={type:"childremoved",child:null},Rt=class i extends Ln{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Jf++}),this.uuid=Ps(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new B,t=new Kn,n=new Nn,s=new B(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ft},normalMatrix:{value:new Ye}}),this.matrix=new ft,this.matrixWorld=new ft,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ar,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ns.setFromAxisAngle(e,t),this.quaternion.multiply(ns),this}rotateOnWorldAxis(e,t){return ns.setFromAxisAngle(e,t),this.quaternion.premultiply(ns),this}rotateX(e){return this.rotateOnAxis(jh,e)}rotateY(e){return this.rotateOnAxis(Kh,e)}rotateZ(e){return this.rotateOnAxis(Qh,e)}translateOnAxis(e,t){return Zh.copy(e).applyQuaternion(this.quaternion),this.position.add(Zh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(jh,e)}translateY(e){return this.translateOnAxis(Kh,e)}translateZ(e){return this.translateOnAxis(Qh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(qn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?da.copy(e):da.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),qs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?qn.lookAt(qs,da,this.up):qn.lookAt(da,qs,this.up),this.quaternion.setFromRotationMatrix(qn),s&&(qn.extractRotation(s.matrixWorld),ns.setFromRotationMatrix(qn),this.quaternion.premultiply(ns.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(We("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ed),is.child=e,this.dispatchEvent(is),is.child=null):We("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Kf),Bl.child=e,this.dispatchEvent(Bl),Bl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),qn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),qn.multiply(e.parent.matrixWorld)),e.applyMatrix4(qn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ed),is.child=e,this.dispatchEvent(is),is.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qs,e,Zf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qs,jf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),d=a(e.shapes),u=a(e.skeletons),p=a(e.animations),f=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),p.length>0&&(n.animations=p),f.length>0&&(n.nodes=f)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Rt.DEFAULT_UP=new B(0,1,0);Rt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Zt=class extends Rt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Qf={type:"move"},vs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Zt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Zt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Zt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,n),g=this._getHandJoint(c,y);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),p=.02,f=.005;c.inputState.pinching&&u>p+f?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=p-f&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Qf)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Zt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},nu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ai={h:0,s:0,l:0},ua={h:0,s:0,l:0};function zl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Qe=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Bt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,st.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=st.workingColorSpace){return this.r=e,this.g=t,this.b=n,st.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=st.workingColorSpace){if(e=Hf(e,1),t=it(t,0,1),n=it(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=zl(a,r,e+1/3),this.g=zl(a,r,e),this.b=zl(a,r,e-1/3)}return st.colorSpaceToWorking(this,s),this}setStyle(e,t=Bt){function n(r){r!==void 0&&parseFloat(r)<1&&Ge("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ge("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Ge("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Bt){let n=nu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Ge("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=jn(e.r),this.g=jn(e.g),this.b=jn(e.b),this}copyLinearToSRGB(e){return this.r=ps(e.r),this.g=ps(e.g),this.b=ps(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Bt){return st.workingToColorSpace(Ht.copy(this),e),Math.round(it(Ht.r*255,0,255))*65536+Math.round(it(Ht.g*255,0,255))*256+Math.round(it(Ht.b*255,0,255))}getHexString(e=Bt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=st.workingColorSpace){st.workingToColorSpace(Ht.copy(this),t);let n=Ht.r,s=Ht.g,r=Ht.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=st.workingColorSpace){return st.workingToColorSpace(Ht.copy(this),t),e.r=Ht.r,e.g=Ht.g,e.b=Ht.b,e}getStyle(e=Bt){st.workingToColorSpace(Ht.copy(this),e);let t=Ht.r,n=Ht.g,s=Ht.b;return e!==Bt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ai),this.setHSL(ai.h+e,ai.s+t,ai.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ai),e.getHSL(ua);let n=Dl(ai.h,ua.h,t),s=Dl(ai.s,ua.s,t),r=Dl(ai.l,ua.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ht=new Qe;Qe.NAMES=nu;var or=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Qe(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},lr=class extends Rt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Kn,this.environmentIntensity=1,this.environmentRotation=new Kn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},yn=new B,Yn=new B,Vl=new B,$n=new B,ss=new B,rs=new B,td=new B,Gl=new B,Hl=new B,Wl=new B,Xl=new bt,ql=new bt,Yl=new bt,hi=class i{constructor(e=new B,t=new B,n=new B){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),yn.subVectors(e,t),s.cross(yn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){yn.subVectors(s,t),Yn.subVectors(n,t),Vl.subVectors(e,t);let a=yn.dot(yn),o=yn.dot(Yn),l=yn.dot(Vl),c=Yn.dot(Yn),h=Yn.dot(Vl),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let u=1/d,p=(c*l-o*h)*u,f=(a*h-o*l)*u;return r.set(1-p-f,f,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,$n)===null?!1:$n.x>=0&&$n.y>=0&&$n.x+$n.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,$n)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,$n.x),l.addScaledVector(a,$n.y),l.addScaledVector(o,$n.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Xl.setScalar(0),ql.setScalar(0),Yl.setScalar(0),Xl.fromBufferAttribute(e,t),ql.fromBufferAttribute(e,n),Yl.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Xl,r.x),a.addScaledVector(ql,r.y),a.addScaledVector(Yl,r.z),a}static isFrontFacing(e,t,n,s){return yn.subVectors(n,t),Yn.subVectors(e,t),yn.cross(Yn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return yn.subVectors(this.c,this.b),Yn.subVectors(this.a,this.b),yn.cross(Yn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;ss.subVectors(s,n),rs.subVectors(r,n),Gl.subVectors(e,n);let l=ss.dot(Gl),c=rs.dot(Gl);if(l<=0&&c<=0)return t.copy(n);Hl.subVectors(e,s);let h=ss.dot(Hl),d=rs.dot(Hl);if(h>=0&&d<=h)return t.copy(s);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(ss,a);Wl.subVectors(e,r);let p=ss.dot(Wl),f=rs.dot(Wl);if(f>=0&&p<=f)return t.copy(r);let y=p*c-l*f;if(y<=0&&c>=0&&f<=0)return o=c/(c-f),t.copy(n).addScaledVector(rs,o);let m=h*f-p*d;if(m<=0&&d-h>=0&&p-f>=0)return td.subVectors(r,s),o=(d-h)/(d-h+(p-f)),t.copy(s).addScaledVector(td,o);let g=1/(m+y+u);return a=y*g,o=u*g,t.copy(n).addScaledVector(ss,a).addScaledVector(rs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Dn=class{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(_n.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(_n.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=_n.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,_n):_n.fromBufferAttribute(r,a),_n.applyMatrix4(e.matrixWorld),this.expandByPoint(_n);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),fa.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),fa.copy(n.boundingBox)),fa.applyMatrix4(e.matrixWorld),this.union(fa)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,_n),_n.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ys),pa.subVectors(this.max,Ys),as.subVectors(e.a,Ys),os.subVectors(e.b,Ys),ls.subVectors(e.c,Ys),oi.subVectors(os,as),li.subVectors(ls,os),Li.subVectors(as,ls);let t=[0,-oi.z,oi.y,0,-li.z,li.y,0,-Li.z,Li.y,oi.z,0,-oi.x,li.z,0,-li.x,Li.z,0,-Li.x,-oi.y,oi.x,0,-li.y,li.x,0,-Li.y,Li.x,0];return!$l(t,as,os,ls,pa)||(t=[1,0,0,0,1,0,0,0,1],!$l(t,as,os,ls,pa))?!1:(ma.crossVectors(oi,li),t=[ma.x,ma.y,ma.z],$l(t,as,os,ls,pa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,_n).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(_n).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Jn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Jn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Jn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Jn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Jn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Jn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Jn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Jn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Jn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Jn=[new B,new B,new B,new B,new B,new B,new B,new B],_n=new B,fa=new Dn,as=new B,os=new B,ls=new B,oi=new B,li=new B,Li=new B,Ys=new B,pa=new B,ma=new B,Ni=new B;function $l(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Ni.fromArray(i,r);let o=s.x*Math.abs(Ni.x)+s.y*Math.abs(Ni.y)+s.z*Math.abs(Ni.z),l=e.dot(Ni),c=t.dot(Ni),h=n.dot(Ni);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Ct=new B,ga=new ye,ep=0,sn=class extends Ln{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ep++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=jd,this.updateRanges=[],this.gpuType=un,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ga.fromBufferAttribute(this,t),ga.applyMatrix3(e),this.setXY(t,ga.x,ga.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix3(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix4(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyNormalMatrix(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.transformDirection(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Xs(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=$t(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Xs(t,this.array)),t}setX(e,t){return this.normalized&&(t=$t(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Xs(t,this.array)),t}setY(e,t){return this.normalized&&(t=$t(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Xs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=$t(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Xs(t,this.array)),t}setW(e,t){return this.normalized&&(t=$t(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=$t(t,this.array),n=$t(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=$t(t,this.array),n=$t(n,this.array),s=$t(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=$t(t,this.array),n=$t(n,this.array),s=$t(s,this.array),r=$t(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var cr=class extends sn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var hr=class extends sn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var wt=class extends sn{constructor(e,t,n){super(new Float32Array(e),t,n)}},tp=new Dn,$s=new B,Jl=new B,di=class{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):tp.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;$s.subVectors(e,this.center);let t=$s.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector($s,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Jl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint($s.copy(e.center).add(Jl)),this.expandByPoint($s.copy(e.center).sub(Jl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},np=0,dn=new ft,Zl=new Rt,cs=new B,nn=new Dn,Js=new Dn,kt=new B,Qt=class i extends Ln{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:np++}),this.uuid=Ps(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Vf(e)?hr:cr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ye().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return dn.makeRotationFromQuaternion(e),this.applyMatrix4(dn),this}rotateX(e){return dn.makeRotationX(e),this.applyMatrix4(dn),this}rotateY(e){return dn.makeRotationY(e),this.applyMatrix4(dn),this}rotateZ(e){return dn.makeRotationZ(e),this.applyMatrix4(dn),this}translate(e,t,n){return dn.makeTranslation(e,t,n),this.applyMatrix4(dn),this}scale(e,t,n){return dn.makeScale(e,t,n),this.applyMatrix4(dn),this}lookAt(e){return Zl.lookAt(e),Zl.updateMatrix(),this.applyMatrix4(Zl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(cs).negate(),this.translate(cs.x,cs.y,cs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new wt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ge("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Dn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];nn.setFromBufferAttribute(r),this.morphTargetsRelative?(kt.addVectors(this.boundingBox.min,nn.min),this.boundingBox.expandByPoint(kt),kt.addVectors(this.boundingBox.max,nn.max),this.boundingBox.expandByPoint(kt)):(this.boundingBox.expandByPoint(nn.min),this.boundingBox.expandByPoint(nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&We('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new di);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new B,1/0);return}if(e){let n=this.boundingSphere.center;if(nn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Js.setFromBufferAttribute(o),this.morphTargetsRelative?(kt.addVectors(nn.min,Js.min),nn.expandByPoint(kt),kt.addVectors(nn.max,Js.max),nn.expandByPoint(kt)):(nn.expandByPoint(Js.min),nn.expandByPoint(Js.max))}nn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)kt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(kt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)kt.fromBufferAttribute(o,c),l&&(cs.fromBufferAttribute(e,c),kt.add(cs)),s=Math.max(s,n.distanceToSquared(kt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&We('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){We("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new sn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let _=0;_<n.count;_++)o[_]=new B,l[_]=new B;let c=new B,h=new B,d=new B,u=new ye,p=new ye,f=new ye,y=new B,m=new B;function g(_,A,N){c.fromBufferAttribute(n,_),h.fromBufferAttribute(n,A),d.fromBufferAttribute(n,N),u.fromBufferAttribute(r,_),p.fromBufferAttribute(r,A),f.fromBufferAttribute(r,N),h.sub(c),d.sub(c),p.sub(u),f.sub(u);let T=1/(p.x*f.y-f.x*p.y);isFinite(T)&&(y.copy(h).multiplyScalar(f.y).addScaledVector(d,-p.y).multiplyScalar(T),m.copy(d).multiplyScalar(p.x).addScaledVector(h,-f.x).multiplyScalar(T),o[_].add(y),o[A].add(y),o[N].add(y),l[_].add(m),l[A].add(m),l[N].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let _=0,A=M.length;_<A;++_){let N=M[_],T=N.start,L=N.count;for(let z=T,I=T+L;z<I;z+=3)g(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let S=new B,v=new B,E=new B,w=new B;function P(_){E.fromBufferAttribute(s,_),w.copy(E);let A=o[_];S.copy(A),S.sub(E.multiplyScalar(E.dot(A))).normalize(),v.crossVectors(w,A);let T=v.dot(l[_])<0?-1:1;a.setXYZW(_,S.x,S.y,S.z,T)}for(let _=0,A=M.length;_<A;++_){let N=M[_],T=N.start,L=N.count;for(let z=T,I=T+L;z<I;z+=3)P(e.getX(z+0)),P(e.getX(z+1)),P(e.getX(z+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new sn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,p=n.count;u<p;u++)n.setXYZ(u,0,0,0);let s=new B,r=new B,a=new B,o=new B,l=new B,c=new B,h=new B,d=new B;if(e)for(let u=0,p=e.count;u<p;u+=3){let f=e.getX(u+0),y=e.getX(u+1),m=e.getX(u+2);s.fromBufferAttribute(t,f),r.fromBufferAttribute(t,y),a.fromBufferAttribute(t,m),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),o.fromBufferAttribute(n,f),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,p=t.count;u<p;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)kt.fromBufferAttribute(e,t),kt.normalize(),e.setXYZ(t,kt.x,kt.y,kt.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),p=0,f=0;for(let y=0,m=l.length;y<m;y++){o.isInterleavedBufferAttribute?p=l[y]*o.data.stride+o.offset:p=l[y]*h;for(let g=0;g<h;g++)u[f++]=c[p++]}return new sn(u,h,d)}if(this.index===null)return Ge("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],p=e(u,n);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let p=c[d];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,p=d.length;u<p;u++)h.push(d[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var jl=new B,ip=new B,sp=new Ye,vn=class{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=jl.subVectors(n,t).cross(ip.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(jl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||sp.getNormalMatrix(e),s=this.coplanarPoint(jl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},rp=0,ui=class extends Ln{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:rp++}),this.uuid=Ps(),this.name="",this.type="Material",this.blending=Cs,this.side=yi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=vc,this.blendDst=bc,this.blendEquation=Vi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Qe(0,0,0),this.blendAlpha=0,this.depthFunc=ms,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Wd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Na,this.stencilZFail=Na,this.stencilZPass=Na,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Ge(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Ge(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Qe().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new vn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new ye().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ye().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Zn=new B,Kl=new B,xa=new B,ya=new B,Ya=class{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Zn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Zn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Zn.copy(this.origin).addScaledVector(this.direction,t),Zn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Kl.copy(e).add(t).multiplyScalar(.5),xa.copy(t).sub(e).normalize(),ya.copy(this.origin).sub(Kl);let r=e.distanceTo(t)*.5,a=-this.direction.dot(xa),o=ya.dot(this.direction),l=-ya.dot(xa),c=ya.lengthSq(),h=Math.abs(1-a*a),d,u,p,f;if(h>0)if(d=a*l-o,u=a*o-l,f=r*h,d>=0)if(u>=-f)if(u<=f){let y=1/h;d*=y,u*=y,p=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=r,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;else u<=-f?(d=Math.max(0,-(-a*r+o)),u=d>0?-r:Math.min(Math.max(-r,-l),r),p=-d*d+u*(u+2*l)+c):u<=f?(d=0,u=Math.min(Math.max(-r,-l),r),p=u*(u+2*l)+c):(d=Math.max(0,-(a*r+o)),u=d>0?r:Math.min(Math.max(-r,-l),r),p=-d*d+u*(u+2*l)+c);else u=a>0?-r:r,d=Math.max(0,-(a*u+o)),p=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Kl).addScaledVector(xa,u),p}intersectSphere(e,t){if(e.radius<0)return null;Zn.subVectors(e.center,this.origin);let n=Zn.dot(this.direction),s=Zn.dot(Zn)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),h>=0?(r=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(r=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-u.z)*d,l=(e.max.z-u.z)*d):(o=(e.max.z-u.z)*d,l=(e.min.z-u.z)*d),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Zn)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,d=e.x-a.x,u=e.y-a.y,p=e.z-a.z,f=t.x-a.x,y=t.y-a.y,m=t.z-a.z,g=n.x-a.x,M=n.y-a.y,S=n.z-a.z,v=Math.abs(l),E=Math.abs(c),w=Math.abs(h),P,_,A,N,T,L,z,I,R,k,H,J;if(v>=E&&v>=w?(A=l,L=d,R=f,J=g,l>=0?(P=c,_=h,N=u,T=p,z=y,I=m,k=M,H=S):(P=h,_=c,N=p,T=u,z=m,I=y,k=S,H=M)):E>=w?(A=c,L=u,R=y,J=M,c>=0?(P=h,_=l,N=p,T=d,z=m,I=f,k=S,H=g):(P=l,_=h,N=d,T=p,z=f,I=m,k=g,H=S)):(A=h,L=p,R=m,J=S,h>=0?(P=l,_=c,N=d,T=u,z=f,I=y,k=g,H=M):(P=c,_=l,N=u,T=d,z=y,I=f,k=M,H=g)),A===0)return null;let G=P/A,F=_/A,Y=1/A,le=N-G*L,ae=T-F*L,qe=z-G*R,He=I-F*R,$e=k-G*J,$=H-F*J,ee=$e*He-$*qe,fe=le*$-ae*$e,Oe=qe*ae-He*le;if(s){if(ee<0||fe<0||Oe<0)return null}else if((ee<0||fe<0||Oe<0)&&(ee>0||fe>0||Oe>0))return null;let we=ee+fe+Oe;if(we===0)return null;let oe=Y*(ee*L+fe*R+Oe*J);return(we>0?oe<0:oe>0)?null:this.at(oe/we,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},dr=class extends ui{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Qe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=Mc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},nd=new ft,Di=new Ya,_a=new di,id=new B,va=new B,ba=new B,Ma=new B,Ql=new B,Sa=new B,sd=new B,wa=new B,Wt=class extends Rt{constructor(e=new Qt,t=new dr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Sa.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],d=r[l];h!==0&&(Ql.fromBufferAttribute(d,e),a?Sa.addScaledVector(Ql,h):Sa.addScaledVector(Ql.sub(t),h))}t.add(Sa)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),_a.copy(n.boundingSphere),_a.applyMatrix4(r),Di.copy(e.ray).recast(e.near),!(_a.containsPoint(Di.origin)===!1&&(Di.intersectSphere(_a,id)===null||Di.origin.distanceToSquared(id)>(e.far-e.near)**2))&&(nd.copy(r).invert(),Di.copy(e.ray).applyMatrix4(nd),!(n.boundingBox!==null&&Di.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Di)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let f=0,y=u.length;f<y;f++){let m=u[f],g=a[m.materialIndex],M=Math.max(m.start,p.start),S=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let v=M,E=S;v<E;v+=3){let w=o.getX(v),P=o.getX(v+1),_=o.getX(v+2);s=Ea(this,g,e,n,c,h,d,w,P,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let f=Math.max(0,p.start),y=Math.min(o.count,p.start+p.count);for(let m=f,g=y;m<g;m+=3){let M=o.getX(m),S=o.getX(m+1),v=o.getX(m+2);s=Ea(this,a,e,n,c,h,d,M,S,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let f=0,y=u.length;f<y;f++){let m=u[f],g=a[m.materialIndex],M=Math.max(m.start,p.start),S=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let v=M,E=S;v<E;v+=3){let w=v,P=v+1,_=v+2;s=Ea(this,g,e,n,c,h,d,w,P,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let f=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);for(let m=f,g=y;m<g;m+=3){let M=m,S=m+1,v=m+2;s=Ea(this,a,e,n,c,h,d,M,S,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function ap(i,e,t,n,s,r,a,o){let l;if(e.side===Yt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===yi,o),l===null)return null;wa.copy(o),wa.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(wa);return c<t.near||c>t.far?null:{distance:c,point:wa.clone(),object:i}}function Ea(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,va),i.getVertexPosition(l,ba),i.getVertexPosition(c,Ma);let h=ap(i,e,t,n,va,ba,Ma,sd);if(h){let d=new B;hi.getBarycoord(sd,va,ba,Ma,d),s&&(h.uv=hi.getInterpolatedAttribute(s,o,l,c,d,new ye)),r&&(h.uv1=hi.getInterpolatedAttribute(r,o,l,c,d,new ye)),a&&(h.normal=hi.getInterpolatedAttribute(a,o,l,c,d,new B),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new B,materialIndex:0};hi.getNormal(va,ba,Ma,u.normal),h.face=u,h.barycoord=d}return h}var Oi=class extends jt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Ft,h=Ft,d,u){super(null,a,o,l,c,h,s,r,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ur=class extends sn{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},hs=new ft,rd=new ft,Ta=[],ad=new Dn,op=new ft,Zs=new Wt,js=new di,Bi=class extends Wt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ur(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,op)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Dn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,hs),ad.copy(e.boundingBox).applyMatrix4(hs),this.boundingBox.union(ad)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new di),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,hs),js.copy(e.boundingSphere).applyMatrix4(hs),this.boundingSphere.union(js)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Zs.geometry=this.geometry,Zs.material=this.material,Zs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),js.copy(this.boundingSphere),js.applyMatrix4(n),e.ray.intersectsSphere(js)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,hs),rd.multiplyMatrices(n,hs),Zs.matrixWorld=rd,Zs.raycast(e,Ta);for(let a=0,o=Ta.length;a<o;a++){let l=Ta[a];l.instanceId=r,l.object=this,t.push(l)}Ta.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new ur(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Oi(new Float32Array(s*this.count),s,this.count,Eo,un));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ui=new di,lp=new ye(.5,.5),Aa=new B,bs=class{constructor(e=new vn,t=new vn,n=new vn,s=new vn,r=new vn,a=new vn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=bn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],p=r[7],f=r[8],y=r[9],m=r[10],g=r[11],M=r[12],S=r[13],v=r[14],E=r[15];if(s[0].setComponents(c-a,p-h,g-f,E-M).normalize(),s[1].setComponents(c+a,p+h,g+f,E+M).normalize(),s[2].setComponents(c+o,p+d,g+y,E+S).normalize(),s[3].setComponents(c-o,p-d,g-y,E-S).normalize(),n)s[4].setComponents(l,u,m,v).normalize(),s[5].setComponents(c-l,p-u,g-m,E-v).normalize();else if(s[4].setComponents(c-l,p-u,g-m,E-v).normalize(),t===bn)s[5].setComponents(c+l,p+u,g+m,E+v).normalize();else if(t===xs)s[5].setComponents(l,u,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ui.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ui.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ui)}intersectsSprite(e){Ui.center.set(0,0,0);let t=lp.distanceTo(e.center);return Ui.radius=.7071067811865476+t,Ui.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ui)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Aa.x=s.normal.x>0?e.max.x:e.min.x,Aa.y=s.normal.y>0?e.max.y:e.min.y,Aa.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Aa)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var fr=class extends jt{constructor(e=[],t=_i,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var fi=class extends jt{constructor(e,t,n=Sn,s,r,a,o=Ft,l=Ft,c,h=Pn,d=1){if(h!==Pn&&h!==vi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:d};super(u,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new _s(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},$a=class extends fi{constructor(e,t=Sn,n=_i,s,r,a=Ft,o=Ft,l,c=Pn){let h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},pr=class extends jt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Un=class i extends Qt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,p=0;f("z","y","x",-1,-1,n,t,e,a,r,0),f("z","y","x",1,-1,n,t,-e,a,r,1),f("x","z","y",1,1,e,n,t,s,a,2),f("x","z","y",1,-1,e,n,-t,s,a,3),f("x","y","z",1,-1,e,t,n,s,r,4),f("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new wt(c,3)),this.setAttribute("normal",new wt(h,3)),this.setAttribute("uv",new wt(d,2));function f(y,m,g,M,S,v,E,w,P,_,A){let N=v/P,T=E/_,L=v/2,z=E/2,I=w/2,R=P+1,k=_+1,H=0,J=0,G=new B;for(let F=0;F<k;F++){let Y=F*T-z;for(let le=0;le<R;le++){let ae=le*N-L;G[y]=ae*M,G[m]=Y*S,G[g]=I,c.push(G.x,G.y,G.z),G[y]=0,G[m]=0,G[g]=w>0?1:-1,h.push(G.x,G.y,G.z),d.push(le/P),d.push(1-F/_),H+=1}}for(let F=0;F<_;F++)for(let Y=0;Y<P;Y++){let le=u+Y+R*F,ae=u+Y+R*(F+1),qe=u+(Y+1)+R*(F+1),He=u+(Y+1)+R*F;l.push(le,ae,He),l.push(ae,qe,He),J+=6}o.addGroup(p,J,A),p+=J,u+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Ms=class i extends Qt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],u=[],p=[],f=0,y=[],m=n/2,g=0;M(),a===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new wt(d,3)),this.setAttribute("normal",new wt(u,3)),this.setAttribute("uv",new wt(p,2));function M(){let v=new B,E=new B,w=0,P=(t-e)/n;for(let _=0;_<=r;_++){let A=[],N=_/r,T=N*(t-e)+e;for(let L=0;L<=s;L++){let z=L/s,I=z*l+o,R=Math.sin(I),k=Math.cos(I);E.x=T*R,E.y=-N*n+m,E.z=T*k,d.push(E.x,E.y,E.z),v.set(R,P,k).normalize(),u.push(v.x,v.y,v.z),p.push(z,1-N),A.push(f++)}y.push(A)}for(let _=0;_<s;_++)for(let A=0;A<r;A++){let N=y[A][_],T=y[A+1][_],L=y[A+1][_+1],z=y[A][_+1];(e>0||A!==0)&&(h.push(N,T,z),w+=3),(t>0||A!==r-1)&&(h.push(T,L,z),w+=3)}c.addGroup(g,w,0),g+=w}function S(v){let E=f,w=new ye,P=new B,_=0,A=v===!0?e:t,N=v===!0?1:-1;for(let L=1;L<=s;L++)d.push(0,m*N,0),u.push(0,N,0),p.push(.5,.5),f++;let T=f;for(let L=0;L<=s;L++){let I=L/s*l+o,R=Math.cos(I),k=Math.sin(I);P.x=A*k,P.y=m*N,P.z=A*R,d.push(P.x,P.y,P.z),u.push(0,N,0),w.x=R*.5+.5,w.y=k*.5*N+.5,p.push(w.x,w.y),f++}for(let L=0;L<s;L++){let z=E+L,I=T+L;v===!0?h.push(I,I+1,z):h.push(I+1,I,z),_+=3}c.addGroup(g,_,v===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},mr=class i extends Ms{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var rn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ge("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let h=n[s],u=n[s+1]-h,p=(a-h)/u;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new ye:new B);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new B,s=[],r=[],a=[],o=new B,l=new ft;for(let p=0;p<=e;p++){let f=p/e;s[p]=this.getTangentAt(f,new B)}r[0]=new B,a[0]=new B;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(s[p-1],s[p]),o.length()>Number.EPSILON){o.normalize();let f=Math.acos(it(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(o,f))}a[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(it(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(p=-p);for(let f=1;f<=e;f++)r[f].applyMatrix4(l.makeRotationAxis(s[f],p*f)),a[f].crossVectors(s[f],r[f])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Ss=class extends rn{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new ye){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,p=c-this.aY;l=u*h-p*d+this.aX,c=u*d+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ja=class extends Ss{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Oc(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,d){let u=(a-r)/c-(o-r)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,p*=h,s(a,o,u,p)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var od=new B,ld=new B,ec=new Oc,tc=new Oc,nc=new Oc,Za=class extends rn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new B){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(ld.subVectors(s[0],s[1]).add(s[0]),c=ld);let d=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(od.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=od),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,f=Math.pow(c.distanceToSquared(d),p),y=Math.pow(d.distanceToSquared(u),p),m=Math.pow(u.distanceToSquared(h),p);y<1e-4&&(y=1),f<1e-4&&(f=y),m<1e-4&&(m=y),ec.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,f,y,m),tc.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,f,y,m),nc.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,f,y,m)}else this.curveType==="catmullrom"&&(ec.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),tc.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),nc.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return n.set(ec.calc(l),tc.calc(l),nc.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new B().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function cd(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function cp(i,e){let t=1-i;return t*t*e}function hp(i,e){return 2*(1-i)*i*e}function dp(i,e){return i*i*e}function Qs(i,e,t,n){return cp(i,e)+hp(i,t)+dp(i,n)}function up(i,e){let t=1-i;return t*t*t*e}function fp(i,e){let t=1-i;return 3*t*t*i*e}function pp(i,e){return 3*(1-i)*i*i*e}function mp(i,e){return i*i*i*e}function er(i,e,t,n,s){return up(i,e)+fp(i,t)+pp(i,n)+mp(i,s)}var gr=class extends rn{constructor(e=new ye,t=new ye,n=new ye,s=new ye){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new ye){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(er(e,s.x,r.x,a.x,o.x),er(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ja=class extends rn{constructor(e=new B,t=new B,n=new B,s=new B){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new B){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(er(e,s.x,r.x,a.x,o.x),er(e,s.y,r.y,a.y,o.y),er(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},xr=class extends rn{constructor(e=new ye,t=new ye){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ye){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ye){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ka=class extends rn{constructor(e=new B,t=new B){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new B){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new B){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},yr=class extends rn{constructor(e=new ye,t=new ye,n=new ye){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ye){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Qs(e,s.x,r.x,a.x),Qs(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Qa=class extends rn{constructor(e=new B,t=new B,n=new B){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new B){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Qs(e,s.x,r.x,a.x),Qs(e,s.y,r.y,a.y),Qs(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},_r=class extends rn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ye){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],d=s[a>s.length-3?s.length-1:a+2];return n.set(cd(o,l.x,c.x,h.x,d.x),cd(o,l.y,c.y,h.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new ye().fromArray(s))}return this}},cc=Object.freeze({__proto__:null,ArcCurve:Ja,CatmullRomCurve3:Za,CubicBezierCurve:gr,CubicBezierCurve3:ja,EllipseCurve:Ss,LineCurve:xr,LineCurve3:Ka,QuadraticBezierCurve:yr,QuadraticBezierCurve3:Qa,SplineCurve:_r}),eo=class extends rn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new cc[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new cc[s.type]().fromJSON(s))}return this}},vr=class extends eo{constructor(e){super(),this.type="Path",this.currentPoint=new ye,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new xr(this.currentPoint.clone(),new ye(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new yr(this.currentPoint.clone(),new ye(e,t),new ye(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,a){let o=new gr(this.currentPoint.clone(),new ye(e,t),new ye(n,s),new ye(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new _r(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,s,r,a),this}absarc(e,t,n,s,r,a){return this.absellipse(e,t,n,n,s,r,a),this}ellipse(e,t,n,s,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,s,r,a,o,l),this}absellipse(e,t,n,s,r,a,o,l){let c=new Ss(e,t,n,s,r,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},ws=class extends vr{constructor(e){super(e),this.uuid=Ps(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new vr().fromJSON(s))}return this}};function gp(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=iu(i,0,s,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=bp(i,e,r,t)),i.length>80*t){o=i[0],l=i[1];let h=o,d=l;for(let u=t;u<s;u+=t){let p=i[u],f=i[u+1];p<o&&(o=p),f<l&&(l=f),p>h&&(h=p),f>d&&(d=f)}c=Math.max(h-o,d-l),c=c!==0?32767/c:0}return br(r,a,t,o,l,c,0),a}function iu(i,e,t,n,s){let r;if(s===Lp(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=hd(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=hd(a/n|0,i[a],i[a+1],r);return r&&Es(r,r.next)&&(Sr(r),r=r.next),r}function zi(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Es(t,t.next)||St(t.prev,t,t.next)===0)){if(Sr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function br(i,e,t,n,s,r,a){if(!i)return;!a&&r&&Tp(i,n,s,r);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?yp(i,n,s,r):xp(i)){e.push(l.i,i.i,c.i),Sr(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=_p(zi(i),e),br(i,e,t,n,s,r,2)):a===2&&vp(i,e,t,n,s,r):br(zi(i),e,t,n,s,r,1);break}}}function xp(i){let e=i.prev,t=i,n=i.next;if(St(e,t,n)>=0)return!1;let s=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,h=Math.min(s,r,a),d=Math.min(o,l,c),u=Math.max(s,r,a),p=Math.max(o,l,c),f=n.next;for(;f!==e;){if(f.x>=h&&f.x<=u&&f.y>=d&&f.y<=p&&Ks(s,o,r,l,a,c,f.x,f.y)&&St(f.prev,f,f.next)>=0)return!1;f=f.next}return!0}function yp(i,e,t,n){let s=i.prev,r=i,a=i.next;if(St(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,h=s.y,d=r.y,u=a.y,p=Math.min(o,l,c),f=Math.min(h,d,u),y=Math.max(o,l,c),m=Math.max(h,d,u),g=hc(p,f,e,t,n),M=hc(y,m,e,t,n),S=i.prevZ,v=i.nextZ;for(;S&&S.z>=g&&v&&v.z<=M;){if(S.x>=p&&S.x<=y&&S.y>=f&&S.y<=m&&S!==s&&S!==a&&Ks(o,h,l,d,c,u,S.x,S.y)&&St(S.prev,S,S.next)>=0||(S=S.prevZ,v.x>=p&&v.x<=y&&v.y>=f&&v.y<=m&&v!==s&&v!==a&&Ks(o,h,l,d,c,u,v.x,v.y)&&St(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;S&&S.z>=g;){if(S.x>=p&&S.x<=y&&S.y>=f&&S.y<=m&&S!==s&&S!==a&&Ks(o,h,l,d,c,u,S.x,S.y)&&St(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;v&&v.z<=M;){if(v.x>=p&&v.x<=y&&v.y>=f&&v.y<=m&&v!==s&&v!==a&&Ks(o,h,l,d,c,u,v.x,v.y)&&St(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function _p(i,e){let t=i;do{let n=t.prev,s=t.next.next;!Es(n,s)&&ru(n,t,t.next,s)&&Mr(n,s)&&Mr(s,n)&&(e.push(n.i,t.i,s.i),Sr(t),Sr(t.next),t=i=s),t=t.next}while(t!==i);return zi(t)}function vp(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Rp(a,o)){let l=au(a,o);a=zi(a,a.next),l=zi(l,l.next),br(a,e,t,n,s,r,0),br(l,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function bp(i,e,t,n){let s=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*n,l=r<a-1?e[r+1]*n:i.length,c=iu(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Cp(c))}s.sort(Mp);for(let r=0;r<s.length;r++)t=Sp(s[r],t);return t}function Mp(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function Sp(i,e){let t=wp(i,e);if(!t)return e;let n=au(t,i);return zi(n,n.next),zi(t,t.next)}function wp(i,e){let t=e,n=i.x,s=i.y,r=-1/0,a;if(Es(i,t))return t;do{if(Es(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let d=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=n&&d>r&&(r=d,a=t.x<t.next.x?t:t.next,d===n))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&su(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){let d=Math.abs(s-t.y)/(n-t.x);Mr(t,i)&&(d<h||d===h&&(t.x>a.x||t.x===a.x&&Ep(a,t)))&&(a=t,h=d)}t=t.next}while(t!==o);return a}function Ep(i,e){return St(i.prev,i,e.prev)<0&&St(e.next,i,i.next)<0}function Tp(i,e,t,n){let s=i;do s.z===0&&(s.z=hc(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Ap(s)}function Ap(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function hc(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Cp(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function su(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function Ks(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&su(i,e,t,n,s,r,a,o)}function Rp(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Ip(i,e)&&(Mr(i,e)&&Mr(e,i)&&Pp(i,e)&&(St(i.prev,i,e.prev)||St(i,e.prev,e))||Es(i,e)&&St(i.prev,i,i.next)>0&&St(e.prev,e,e.next)>0)}function St(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Es(i,e){return i.x===e.x&&i.y===e.y}function ru(i,e,t,n){let s=Ra(St(i,e,t)),r=Ra(St(i,e,n)),a=Ra(St(t,n,i)),o=Ra(St(t,n,e));return!!(s!==r&&a!==o||s===0&&Ca(i,t,e)||r===0&&Ca(i,n,e)||a===0&&Ca(t,i,n)||o===0&&Ca(t,e,n))}function Ca(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Ra(i){return i>0?1:i<0?-1:0}function Ip(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&ru(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Mr(i,e){return St(i.prev,i,i.next)<0?St(i,e,i.next)>=0&&St(i,i.prev,e)>=0:St(i,e,i.prev)<0||St(i,i.next,e)<0}function Pp(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function au(i,e){let t=dc(i.i,i.x,i.y),n=dc(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function hd(i,e,t,n){let s=dc(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Sr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function dc(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Lp(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}var uc=class{static triangulate(e,t,n=2){return gp(e,t,n)}},ki=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];dd(e),ud(n,e);let a=e.length;t.forEach(dd);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,ud(n,t[l]);let o=uc.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function dd(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function ud(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var wr=class i extends Qt{constructor(e=new ws([new ye(.5,.5),new ye(-.5,.5),new ye(-.5,-.5),new ye(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,s=[],r=[];for(let o=0,l=e.length;o<l;o++){let c=e[o];a(c)}this.setAttribute("position",new wt(s,3)),this.setAttribute("uv",new wt(r,2)),this.computeVertexNormals();function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1,u=t.bevelEnabled!==void 0?t.bevelEnabled:!0,p=t.bevelThickness!==void 0?t.bevelThickness:.2,f=t.bevelSize!==void 0?t.bevelSize:p-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,M=t.UVGenerator!==void 0?t.UVGenerator:Np,S,v=!1,E,w,P,_;if(g){S=g.getSpacedPoints(h),v=!0,u=!1;let te=g.isCatmullRomCurve3?g.closed:!1;E=g.computeFrenetFrames(h,te),w=new B,P=new B,_=new B}u||(m=0,p=0,f=0,y=0);let A=o.extractPoints(c),N=A.shape,T=A.holes;if(!ki.isClockWise(N)){N=N.reverse();for(let te=0,j=T.length;te<j;te++){let re=T[te];ki.isClockWise(re)&&(T[te]=re.reverse())}}function z(te){let re=10000000000000001e-36,ce=te[0];for(let ue=1;ue<=te.length;ue++){let Be=ue%te.length,ke=te[Be],Xe=ke.x-ce.x,Je=ke.y-ce.y,D=Xe*Xe+Je*Je,ot=Math.max(Math.abs(ke.x),Math.abs(ke.y),Math.abs(ce.x),Math.abs(ce.y)),tt=re*ot*ot;if(D<=tt){te.splice(Be,1),ue--;continue}ce=ke}}z(N),T.forEach(z);let I=T.length,R=N;for(let te=0;te<I;te++){let j=T[te];N=N.concat(j)}function k(te,j,re){return j||We("ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(j,re)}let H=N.length;function J(te,j,re){let ce,ue,Be,ke=te.x-j.x,Xe=te.y-j.y,Je=re.x-te.x,D=re.y-te.y,ot=ke*ke+Xe*Xe,tt=ke*D-Xe*Je;if(Math.abs(tt)>Number.EPSILON){let C=Math.sqrt(ot),x=Math.sqrt(Je*Je+D*D),V=j.x-Xe/C,q=j.y+ke/C,K=re.x-D/x,he=re.y+Je/x,de=((K-V)*D-(he-q)*Je)/(ke*D-Xe*Je);ce=V+ke*de-te.x,ue=q+Xe*de-te.y;let Q=ce*ce+ue*ue;if(Q<=2)return new ye(ce,ue);Be=Math.sqrt(Q/2)}else{let C=!1;ke>Number.EPSILON?Je>Number.EPSILON&&(C=!0):ke<-Number.EPSILON?Je<-Number.EPSILON&&(C=!0):Math.sign(Xe)===Math.sign(D)&&(C=!0),C?(ce=-Xe,ue=ke,Be=Math.sqrt(ot)):(ce=ke,ue=Xe,Be=Math.sqrt(ot/2))}return new ye(ce/Be,ue/Be)}let G=[];for(let te=0,j=R.length,re=j-1,ce=te+1;te<j;te++,re++,ce++)re===j&&(re=0),ce===j&&(ce=0),G[te]=J(R[te],R[re],R[ce]);let F=[],Y,le=G.concat();for(let te=0,j=I;te<j;te++){let re=T[te];Y=[];for(let ce=0,ue=re.length,Be=ue-1,ke=ce+1;ce<ue;ce++,Be++,ke++)Be===ue&&(Be=0),ke===ue&&(ke=0),Y[ce]=J(re[ce],re[Be],re[ke]);F.push(Y),le=le.concat(Y)}let ae;if(m===0)ae=ki.triangulateShape(R,T);else{let te=[],j=[];for(let re=0;re<m;re++){let ce=re/m,ue=p*Math.cos(ce*Math.PI/2),Be=f*Math.sin(ce*Math.PI/2)+y;for(let ke=0,Xe=R.length;ke<Xe;ke++){let Je=k(R[ke],G[ke],Be);fe(Je.x,Je.y,-ue),ce===0&&te.push(Je)}for(let ke=0,Xe=I;ke<Xe;ke++){let Je=T[ke];Y=F[ke];let D=[];for(let ot=0,tt=Je.length;ot<tt;ot++){let C=k(Je[ot],Y[ot],Be);fe(C.x,C.y,-ue),ce===0&&D.push(C)}ce===0&&j.push(D)}}ae=ki.triangulateShape(te,j)}let qe=ae.length,He=f+y;for(let te=0;te<H;te++){let j=u?k(N[te],le[te],He):N[te];v?(P.copy(E.normals[0]).multiplyScalar(j.x),w.copy(E.binormals[0]).multiplyScalar(j.y),_.copy(S[0]).add(P).add(w),fe(_.x,_.y,_.z)):fe(j.x,j.y,0)}for(let te=1;te<=h;te++)for(let j=0;j<H;j++){let re=u?k(N[j],le[j],He):N[j];v?(P.copy(E.normals[te]).multiplyScalar(re.x),w.copy(E.binormals[te]).multiplyScalar(re.y),_.copy(S[te]).add(P).add(w),fe(_.x,_.y,_.z)):fe(re.x,re.y,d/h*te)}for(let te=m-1;te>=0;te--){let j=te/m,re=p*Math.cos(j*Math.PI/2),ce=f*Math.sin(j*Math.PI/2)+y;for(let ue=0,Be=R.length;ue<Be;ue++){let ke=k(R[ue],G[ue],ce);fe(ke.x,ke.y,d+re)}for(let ue=0,Be=T.length;ue<Be;ue++){let ke=T[ue];Y=F[ue];for(let Xe=0,Je=ke.length;Xe<Je;Xe++){let D=k(ke[Xe],Y[Xe],ce);v?fe(D.x,D.y+S[h-1].y,S[h-1].x+re):fe(D.x,D.y,d+re)}}}$e(),$();function $e(){let te=s.length/3;if(u){let j=0,re=H*j;for(let ce=0;ce<qe;ce++){let ue=ae[ce];Oe(ue[2]+re,ue[1]+re,ue[0]+re)}j=h+m*2,re=H*j;for(let ce=0;ce<qe;ce++){let ue=ae[ce];Oe(ue[0]+re,ue[1]+re,ue[2]+re)}}else{for(let j=0;j<qe;j++){let re=ae[j];Oe(re[2],re[1],re[0])}for(let j=0;j<qe;j++){let re=ae[j];Oe(re[0]+H*h,re[1]+H*h,re[2]+H*h)}}n.addGroup(te,s.length/3-te,0)}function $(){let te=s.length/3,j=0;ee(R,j),j+=R.length;for(let re=0,ce=T.length;re<ce;re++){let ue=T[re];ee(ue,j),j+=ue.length}n.addGroup(te,s.length/3-te,1)}function ee(te,j){let re=te.length;for(;--re>=0;){let ce=re,ue=re-1;ue<0&&(ue=te.length-1);for(let Be=0,ke=h+m*2;Be<ke;Be++){let Xe=H*Be,Je=H*(Be+1),D=j+ce+Xe,ot=j+ue+Xe,tt=j+ue+Je,C=j+ce+Je;we(D,ot,tt,C)}}}function fe(te,j,re){l.push(te),l.push(j),l.push(re)}function Oe(te,j,re){oe(te),oe(j),oe(re);let ce=s.length/3,ue=M.generateTopUV(n,s,ce-3,ce-2,ce-1);Le(ue[0]),Le(ue[1]),Le(ue[2])}function we(te,j,re,ce){oe(te),oe(j),oe(ce),oe(j),oe(re),oe(ce);let ue=s.length/3,Be=M.generateSideWallUV(n,s,ue-6,ue-3,ue-2,ue-1);Le(Be[0]),Le(Be[1]),Le(Be[3]),Le(Be[1]),Le(Be[2]),Le(Be[3])}function oe(te){s.push(l[te*3+0]),s.push(l[te*3+1]),s.push(l[te*3+2])}function Le(te){r.push(te.x),r.push(te.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Dp(t,n,e)}static fromJSON(e,t){let n=[];for(let r=0,a=e.shapes.length;r<a;r++){let o=t[e.shapes[r]];n.push(o)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new cc[s.type]().fromJSON(s)),new i(n,e.options)}},Np={generateTopUV:function(i,e,t,n,s){let r=e[t*3],a=e[t*3+1],o=e[n*3],l=e[n*3+1],c=e[s*3],h=e[s*3+1];return[new ye(r,a),new ye(o,l),new ye(c,h)]},generateSideWallUV:function(i,e,t,n,s,r){let a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],d=e[n*3+2],u=e[s*3],p=e[s*3+1],f=e[s*3+2],y=e[r*3],m=e[r*3+1],g=e[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new ye(a,1-l),new ye(c,1-d),new ye(u,1-f),new ye(y,1-g)]:[new ye(o,1-l),new ye(h,1-d),new ye(p,1-f),new ye(m,1-g)]}};function Dp(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Er=class i extends Qt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,d=e/o,u=t/l,p=[],f=[],y=[],m=[];for(let g=0;g<h;g++){let M=g*u-a;for(let S=0;S<c;S++){let v=S*d-r;f.push(v,-M,0),y.push(0,0,1),m.push(S/o),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let M=0;M<o;M++){let S=M+c*g,v=M+c*(g+1),E=M+1+c*(g+1),w=M+1+c*g;p.push(S,v,w),p.push(v,E,w)}this.setIndex(p),this.setAttribute("position",new wt(f,3)),this.setAttribute("normal",new wt(y,3)),this.setAttribute("uv",new wt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Tr=class i extends Qt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new B,u=new B,p=[],f=[],y=[],m=[];for(let g=0;g<=n;g++){let M=[],S=g/n,v=a+S*o,E=e*Math.cos(v),w=Math.sqrt(e*e-E*E),P=0;g===0&&a===0?P=.5/t:g===n&&l===Math.PI&&(P=-.5/t);for(let _=0;_<=t;_++){let A=_/t,N=s+A*r;d.x=-w*Math.cos(N),d.y=E,d.z=w*Math.sin(N),f.push(d.x,d.y,d.z),u.copy(d).normalize(),y.push(u.x,u.y,u.z),m.push(A+P,1-S),M.push(c++)}h.push(M)}for(let g=0;g<n;g++)for(let M=0;M<t;M++){let S=h[g][M+1],v=h[g][M],E=h[g+1][M],w=h[g+1][M+1];(g!==0||a>0)&&p.push(S,v,w),(g!==n-1||l<Math.PI)&&p.push(v,E,w)}this.setIndex(p),this.setAttribute("position",new wt(f,3)),this.setAttribute("normal",new wt(y,3)),this.setAttribute("uv",new wt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Ar=class i extends Qt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],h=[],d=[],u=new B,p=new B,f=new B;for(let y=0;y<=n;y++){let m=a+y/n*o;for(let g=0;g<=s;g++){let M=g/s*r;p.x=(e+t*Math.cos(m))*Math.cos(M),p.y=(e+t*Math.cos(m))*Math.sin(M),p.z=t*Math.sin(m),c.push(p.x,p.y,p.z),u.x=e*Math.cos(M),u.y=e*Math.sin(M),f.subVectors(p,u).normalize(),h.push(f.x,f.y,f.z),d.push(g/s),d.push(y/n)}}for(let y=1;y<=n;y++)for(let m=1;m<=s;m++){let g=(s+1)*y+m-1,M=(s+1)*(y-1)+m-1,S=(s+1)*(y-1)+m,v=(s+1)*y+m;l.push(g,M,v),l.push(M,S,v)}this.setIndex(l),this.setAttribute("position",new wt(c,3)),this.setAttribute("normal",new wt(h,3)),this.setAttribute("uv",new wt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};function Hi(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(fd(s))s.isRenderTargetTexture?(Ge("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(fd(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Xt(i){let e={};for(let t=0;t<i.length;t++){let n=Hi(i[t]);for(let s in n)e[s]=n[s]}return e}function fd(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Up(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Bc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:st.workingColorSpace}var ou={clone:Hi,merge:Xt},kp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Fp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,an=class extends ui{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=kp,this.fragmentShader=Fp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Hi(e.uniforms),this.uniformsGroups=Up(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Qe().setHex(s.value);break;case"v2":this.uniforms[n].value=new ye().fromArray(s.value);break;case"v3":this.uniforms[n].value=new B().fromArray(s.value);break;case"v4":this.uniforms[n].value=new bt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ye().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ft().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},to=class extends an{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Cr=class extends ui{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Qe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Qe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=rl,this.normalScale=new ye(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var no=class extends ui{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Gd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},io=class extends ui{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ds(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function ic(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var pi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},so=class extends pi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ac,endingEnd:ac}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case oc:r=e,o=2*t-n;break;case lc:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case oc:a=e,l=2*n-t;break;case lc:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,p=this._weightNext,f=(n-t)/(s-t),y=f*f,m=y*f,g=-u*m+2*u*y-u*f,M=(1+u)*m+(-1.5-2*u)*y+(-.5+u)*f+1,S=(-1-p)*m+(1.5+p)*y+.5*f,v=p*m-p*y;for(let E=0;E!==o;++E)r[E]=g*a[h+E]+M*a[c+E]+S*a[l+E]+v*a[d+E];return r}},ro=class extends pi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(s-t),d=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*d+a[l+u]*h;return r}},ao=class extends pi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},oo=class extends pi{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let f=(n-t)/(s-t),y=1-f;for(let m=0;m!==o;++m)r[m]=a[c+m]*y+a[l+m]*f;return r}let u=o*2,p=e-1;for(let f=0;f!==o;++f){let y=a[c+f],m=a[l+f],g=p*u+f*2,M=d[g],S=d[g+1],v=e*u+f*2,E=h[v],w=h[v+1],P=Bp(n,t,M,E,s);r[f]=lu(P,y,S,w,m)}return r}};function lu(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function Op(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function Bp(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=lu(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Op(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var on=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ds(t,this.TimeBufferType),this.values=ds(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ds(e.times,Array),values:ds(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),ic(e.settings)&&(n.settings={inTangents:ds(e.settings.inTangents,Array),outTangents:ds(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ao(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ro(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new so(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new oo(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case tr:t=this.InterpolantFactoryMethodDiscrete;break;case Ga:t=this.InterpolantFactoryMethodLinear;break;case La:t=this.InterpolantFactoryMethodSmooth;break;case rc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Ge("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return tr;case this.InterpolantFactoryMethodLinear:return Ga;case this.InterpolantFactoryMethodSmooth:return La;case this.InterpolantFactoryMethodBezier:return rc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;ic(this.settings)&&(pd(this.settings.inTangents,e),pd(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(We("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(We("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){We("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){We("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Gf(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){We("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===La,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let d=o*n,u=d-n,p=d+n;for(let f=0;f!==n;++f){let y=t[d+f];if(y!==t[u+f]||y!==t[p+f]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let d=o*n,u=a*n;for(let p=0;p!==n;++p)t[u+p]=t[d+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,ic(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function pd(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}on.prototype.ValueTypeName="";on.prototype.TimeBufferType=Float32Array;on.prototype.ValueBufferType=Float32Array;on.prototype.DefaultInterpolation=Ga;var mi=class extends on{constructor(e,t,n){super(e,t,n)}};mi.prototype.ValueTypeName="bool";mi.prototype.ValueBufferType=Array;mi.prototype.DefaultInterpolation=tr;mi.prototype.InterpolantFactoryMethodLinear=void 0;mi.prototype.InterpolantFactoryMethodSmooth=void 0;var lo=class extends on{constructor(e,t,n,s){super(e,t,n,s)}};lo.prototype.ValueTypeName="color";var co=class extends on{constructor(e,t,n,s){super(e,t,n,s)}};co.prototype.ValueTypeName="number";var ho=class extends pi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)Nn.slerpFlat(r,0,a,c-o,a,c,l);return r}},Rr=class extends on{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new ho(this.times,this.values,this.getValueSize(),e)}};Rr.prototype.ValueTypeName="quaternion";Rr.prototype.InterpolantFactoryMethodSmooth=void 0;var gi=class extends on{constructor(e,t,n){super(e,t,n)}};gi.prototype.ValueTypeName="string";gi.prototype.ValueBufferType=Array;gi.prototype.DefaultInterpolation=tr;gi.prototype.InterpolantFactoryMethodLinear=void 0;gi.prototype.InterpolantFactoryMethodSmooth=void 0;var uo=class extends on{constructor(e,t,n,s){super(e,t,n,s)}};uo.prototype.ValueTypeName="vector";var fo=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let p=c[d],f=c[d+1];if(p.global&&(p.lastIndex=0),p.test(h))return f}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},cu=new fo,po=class{constructor(e){this.manager=e!==void 0?e:cu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};po.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ir=class extends Rt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Qe(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Pr=class extends Ir{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Qe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},sc=new ft,md=new B,gd=new B,mo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ye(512,512),this.mapType=en,this.map=null,this.mapPass=null,this.matrix=new ft,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new bs,this._frameExtents=new ye(1,1),this._viewportCount=1,this._viewports=[new bt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;md.setFromMatrixPosition(e.matrixWorld),t.position.copy(md),gd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(gd),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){sc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(sc,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===xs||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(sc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ia=new B,Pa=new Nn,Rn=new B,Lr=class extends Rt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ft,this.projectionMatrix=new ft,this.projectionMatrixInverse=new ft,this.coordinateSystem=bn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ia,Pa,Rn),Rn.x===1&&Rn.y===1&&Rn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ia,Pa,Rn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ia,Pa,Rn),Rn.x===1&&Rn.y===1&&Rn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ia,Pa,Rn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ci=new B,xd=new ye,yd=new ye,Jt=class extends Lr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ha*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Nl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ha*2*Math.atan(Math.tan(Nl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ci.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ci.x,ci.y).multiplyScalar(-e/ci.z),ci.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ci.x,ci.y).multiplyScalar(-e/ci.z)}getViewSize(e,t){return this.getViewBounds(e,xd,yd),t.subVectors(yd,xd)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Nl*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var xi=class extends Lr{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},fc=class extends mo{constructor(){super(new xi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ts=class extends Ir{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.target=new Rt,this.shadow=new fc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var us=-90,fs=1,go=class extends Rt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Jt(us,fs,e,t);s.layers=this.layers,this.add(s);let r=new Jt(us,fs,e,t);r.layers=this.layers,this.add(r);let a=new Jt(us,fs,e,t);a.layers=this.layers,this.add(a);let o=new Jt(us,fs,e,t);o.layers=this.layers,this.add(o);let l=new Jt(us,fs,e,t);l.layers=this.layers,this.add(l);let c=new Jt(us,fs,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===bn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===xs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),f=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,u,p),e.xr.enabled=f,n.texture.needsPMREMUpdate=!0}},xo=class extends Jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var zc="\\[\\]\\.:\\/",zp=new RegExp("["+zc+"]","g"),Vc="[^"+zc+"]",Vp="[^"+zc.replace("\\.","")+"]",Gp=/((?:WC+[\/:])*)/.source.replace("WC",Vc),Hp=/(WCOD+)?/.source.replace("WCOD",Vp),Wp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Vc),Xp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Vc),qp=new RegExp("^"+Gp+Hp+Wp+Xp+"$"),Yp=["material","materials","bones","map"],pc=class{constructor(e,t,n){let s=n||_t.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},_t=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(zp,"")}static parseTrackName(e){let t=qp.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Yp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Ge("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){We("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){We("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){We("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){We("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){We("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){We("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){We("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;We("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){We("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){We("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};_t.Composite=pc;_t.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};_t.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};_t.prototype.GetterByBindingType=[_t.prototype._getValue_direct,_t.prototype._getValue_array,_t.prototype._getValue_arrayElement,_t.prototype._getValue_toArray];_t.prototype.SetterByBindingTypeAndVersioning=[[_t.prototype._setValue_direct,_t.prototype._setValue_direct_setNeedsUpdate,_t.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_array,_t.prototype._setValue_array_setNeedsUpdate,_t.prototype._setValue_array_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_arrayElement,_t.prototype._setValue_arrayElement_setNeedsUpdate,_t.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_fromArray,_t.prototype._setValue_fromArray_setNeedsUpdate,_t.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var f_=new Float32Array(1);var mc=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};function Gc(i,e,t,n){let s=$p(n);switch(t){case Dc:return i*e;case Eo:return i*e/s.components*s.byteLength;case To:return i*e/s.components*s.byteLength;case bi:return i*e*2/s.components*s.byteLength;case Ao:return i*e*2/s.components*s.byteLength;case Uc:return i*e*3/s.components*s.byteLength;case fn:return i*e*4/s.components*s.byteLength;case Co:return i*e*4/s.components*s.byteLength;case Fr:case Or:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Br:case zr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Io:case Lo:return Math.max(i,16)*Math.max(e,8)/4;case Ro:case Po:return Math.max(i,8)*Math.max(e,8)/2;case No:case Do:case ko:case Fo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Uo:case Vr:case Oo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Bo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case zo:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Vo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Go:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ho:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Wo:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Xo:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case qo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Yo:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case $o:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Jo:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Zo:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case jo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Ko:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Qo:case el:case tl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case nl:case il:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Gr:case sl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function $p(i){switch(i){case en:case Ic:return{byteLength:1,components:1};case Rs:case Pc:case wn:return{byteLength:2,components:1};case So:case wo:return{byteLength:2,components:4};case Sn:case Mo:case un:return{byteLength:4,components:1};case Lc:case Nc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Ge("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Pu(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Zp(i){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){let h=l.array,d=l.updateRanges;if(i.bindBuffer(c,o),d.length===0)i.bufferSubData(c,0,h);else{d.sort((p,f)=>p.start-f.start);let u=0;for(let p=1;p<d.length;p++){let f=d[u],y=d[p];y.start<=f.start+f.count+1?f.count=Math.max(f.count,y.start+y.count-f.start):(++u,d[u]=y)}d.length=u+1;for(let p=0,f=d.length;p<f;p++){let y=d[p];i.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var jp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Kp=`#ifdef USE_ALPHAHASH
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
#endif`,Qp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,em=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,tm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,nm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,im=`#ifdef USE_AOMAP
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
#endif`,sm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,rm=`#ifdef USE_BATCHING
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
#endif`,am=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,om=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,lm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,cm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,hm=`#ifdef USE_IRIDESCENCE
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
#endif`,dm=`#ifdef USE_BUMPMAP
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
#endif`,um=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,fm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,pm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,mm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,gm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,xm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,ym=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,_m=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,vm=`#define PI 3.141592653589793
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
} // validated`,bm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Mm=`vec3 transformedNormal = objectNormal;
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
#endif`,Sm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,wm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Em=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Tm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Am="gl_FragColor = linearToOutputTexel( gl_FragColor );",Cm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Rm=`#ifdef USE_ENVMAP
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
#endif`,Im=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Pm=`#ifdef USE_ENVMAP
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
#endif`,Lm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Nm=`#ifdef USE_ENVMAP
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
#endif`,Dm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Um=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,km=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Fm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Om=`#ifdef USE_GRADIENTMAP
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
}`,Bm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,zm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Vm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Gm=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Hm=`#ifdef USE_ENVMAP
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
#endif`,Wm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Xm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,qm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ym=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,$m=`PhysicalMaterial material;
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
#endif`,Jm=`uniform sampler2D dfgLUT;
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
}`,Zm=`
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
#endif`,jm=`#if defined( RE_IndirectDiffuse )
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
#endif`,Km=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Qm=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,e0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,t0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,n0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,i0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,s0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,r0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,a0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,o0=`#if defined( USE_POINTS_UV )
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
#endif`,l0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,c0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,h0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,d0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,u0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,f0=`#ifdef USE_MORPHTARGETS
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
#endif`,p0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,m0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,g0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,x0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,y0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,_0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,v0=`#ifdef USE_NORMALMAP
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
#endif`,b0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,M0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,S0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,w0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,E0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,T0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,A0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,C0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,R0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,I0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,P0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,L0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,N0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,D0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,U0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,k0=`float getShadowMask() {
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
}`,F0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,O0=`#ifdef USE_SKINNING
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
#endif`,B0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,z0=`#ifdef USE_SKINNING
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
#endif`,V0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,G0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,H0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,W0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,X0=`#ifdef USE_TRANSMISSION
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
#endif`,q0=`#ifdef USE_TRANSMISSION
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
#endif`,Y0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,$0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,J0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Z0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,j0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,K0=`uniform sampler2D t2D;
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
}`,Q0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,eg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,tg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ng=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ig=`#include <common>
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
}`,sg=`#if DEPTH_PACKING == 3200
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
}`,rg=`#define DISTANCE
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
}`,ag=`#define DISTANCE
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
}`,og=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,lg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cg=`uniform float scale;
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
}`,hg=`uniform vec3 diffuse;
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
}`,dg=`#include <common>
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
}`,ug=`uniform vec3 diffuse;
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
}`,fg=`#define LAMBERT
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
}`,pg=`#define LAMBERT
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
}`,mg=`#define MATCAP
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
}`,gg=`#define MATCAP
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
}`,xg=`#define NORMAL
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
}`,yg=`#define NORMAL
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
}`,_g=`#define PHONG
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
}`,vg=`#define PHONG
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
}`,bg=`#define STANDARD
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
}`,Mg=`#define STANDARD
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
}`,Sg=`#define TOON
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
}`,wg=`#define TOON
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
}`,Eg=`uniform float size;
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
}`,Tg=`uniform vec3 diffuse;
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
}`,Ag=`#include <common>
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
}`,Cg=`uniform vec3 color;
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
}`,Rg=`uniform float rotation;
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
}`,Ig=`uniform vec3 diffuse;
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
}`,et={alphahash_fragment:jp,alphahash_pars_fragment:Kp,alphamap_fragment:Qp,alphamap_pars_fragment:em,alphatest_fragment:tm,alphatest_pars_fragment:nm,aomap_fragment:im,aomap_pars_fragment:sm,batching_pars_vertex:rm,batching_vertex:am,begin_vertex:om,beginnormal_vertex:lm,bsdfs:cm,iridescence_fragment:hm,bumpmap_pars_fragment:dm,clipping_planes_fragment:um,clipping_planes_pars_fragment:fm,clipping_planes_pars_vertex:pm,clipping_planes_vertex:mm,color_fragment:gm,color_pars_fragment:xm,color_pars_vertex:ym,color_vertex:_m,common:vm,cube_uv_reflection_fragment:bm,defaultnormal_vertex:Mm,displacementmap_pars_vertex:Sm,displacementmap_vertex:wm,emissivemap_fragment:Em,emissivemap_pars_fragment:Tm,colorspace_fragment:Am,colorspace_pars_fragment:Cm,envmap_fragment:Rm,envmap_common_pars_fragment:Im,envmap_pars_fragment:Pm,envmap_pars_vertex:Lm,envmap_physical_pars_fragment:Hm,envmap_vertex:Nm,fog_vertex:Dm,fog_pars_vertex:Um,fog_fragment:km,fog_pars_fragment:Fm,gradientmap_pars_fragment:Om,lightmap_pars_fragment:Bm,lights_lambert_fragment:zm,lights_lambert_pars_fragment:Vm,lights_pars_begin:Gm,lights_toon_fragment:Wm,lights_toon_pars_fragment:Xm,lights_phong_fragment:qm,lights_phong_pars_fragment:Ym,lights_physical_fragment:$m,lights_physical_pars_fragment:Jm,lights_fragment_begin:Zm,lights_fragment_maps:jm,lights_fragment_end:Km,lightprobes_pars_fragment:Qm,logdepthbuf_fragment:e0,logdepthbuf_pars_fragment:t0,logdepthbuf_pars_vertex:n0,logdepthbuf_vertex:i0,map_fragment:s0,map_pars_fragment:r0,map_particle_fragment:a0,map_particle_pars_fragment:o0,metalnessmap_fragment:l0,metalnessmap_pars_fragment:c0,morphinstance_vertex:h0,morphcolor_vertex:d0,morphnormal_vertex:u0,morphtarget_pars_vertex:f0,morphtarget_vertex:p0,normal_fragment_begin:m0,normal_fragment_maps:g0,normal_pars_fragment:x0,normal_pars_vertex:y0,normal_vertex:_0,normalmap_pars_fragment:v0,clearcoat_normal_fragment_begin:b0,clearcoat_normal_fragment_maps:M0,clearcoat_pars_fragment:S0,iridescence_pars_fragment:w0,opaque_fragment:E0,packing:T0,premultiplied_alpha_fragment:A0,project_vertex:C0,dithering_fragment:R0,dithering_pars_fragment:I0,roughnessmap_fragment:P0,roughnessmap_pars_fragment:L0,shadowmap_pars_fragment:N0,shadowmap_pars_vertex:D0,shadowmap_vertex:U0,shadowmask_pars_fragment:k0,skinbase_vertex:F0,skinning_pars_vertex:O0,skinning_vertex:B0,skinnormal_vertex:z0,specularmap_fragment:V0,specularmap_pars_fragment:G0,tonemapping_fragment:H0,tonemapping_pars_fragment:W0,transmission_fragment:X0,transmission_pars_fragment:q0,uv_pars_fragment:Y0,uv_pars_vertex:$0,uv_vertex:J0,worldpos_vertex:Z0,background_vert:j0,background_frag:K0,backgroundCube_vert:Q0,backgroundCube_frag:eg,cube_vert:tg,cube_frag:ng,depth_vert:ig,depth_frag:sg,distance_vert:rg,distance_frag:ag,equirect_vert:og,equirect_frag:lg,linedashed_vert:cg,linedashed_frag:hg,meshbasic_vert:dg,meshbasic_frag:ug,meshlambert_vert:fg,meshlambert_frag:pg,meshmatcap_vert:mg,meshmatcap_frag:gg,meshnormal_vert:xg,meshnormal_frag:yg,meshphong_vert:_g,meshphong_frag:vg,meshphysical_vert:bg,meshphysical_frag:Mg,meshtoon_vert:Sg,meshtoon_frag:wg,points_vert:Eg,points_frag:Tg,shadow_vert:Ag,shadow_frag:Cg,sprite_vert:Rg,sprite_frag:Ig},ve={common:{diffuse:{value:new Qe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new ye(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Qe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new B},probesMax:{value:new B},probesResolution:{value:new B}},points:{diffuse:{value:new Qe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new Qe(16777215)},opacity:{value:1},center:{value:new ye(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},zn={basic:{uniforms:Xt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.fog]),vertexShader:et.meshbasic_vert,fragmentShader:et.meshbasic_frag},lambert:{uniforms:Xt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Qe(0)},envMapIntensity:{value:1}}]),vertexShader:et.meshlambert_vert,fragmentShader:et.meshlambert_frag},phong:{uniforms:Xt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Qe(0)},specular:{value:new Qe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:et.meshphong_vert,fragmentShader:et.meshphong_frag},standard:{uniforms:Xt([ve.common,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.roughnessmap,ve.metalnessmap,ve.fog,ve.lights,{emissive:{value:new Qe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag},toon:{uniforms:Xt([ve.common,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.gradientmap,ve.fog,ve.lights,{emissive:{value:new Qe(0)}}]),vertexShader:et.meshtoon_vert,fragmentShader:et.meshtoon_frag},matcap:{uniforms:Xt([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,{matcap:{value:null}}]),vertexShader:et.meshmatcap_vert,fragmentShader:et.meshmatcap_frag},points:{uniforms:Xt([ve.points,ve.fog]),vertexShader:et.points_vert,fragmentShader:et.points_frag},dashed:{uniforms:Xt([ve.common,ve.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:et.linedashed_vert,fragmentShader:et.linedashed_frag},depth:{uniforms:Xt([ve.common,ve.displacementmap]),vertexShader:et.depth_vert,fragmentShader:et.depth_frag},normal:{uniforms:Xt([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,{opacity:{value:1}}]),vertexShader:et.meshnormal_vert,fragmentShader:et.meshnormal_frag},sprite:{uniforms:Xt([ve.sprite,ve.fog]),vertexShader:et.sprite_vert,fragmentShader:et.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:et.background_vert,fragmentShader:et.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:et.backgroundCube_vert,fragmentShader:et.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:et.cube_vert,fragmentShader:et.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:et.equirect_vert,fragmentShader:et.equirect_frag},distance:{uniforms:Xt([ve.common,ve.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:et.distance_vert,fragmentShader:et.distance_frag},shadow:{uniforms:Xt([ve.lights,ve.fog,{color:{value:new Qe(0)},opacity:{value:1}}]),vertexShader:et.shadow_vert,fragmentShader:et.shadow_frag}};zn.physical={uniforms:Xt([zn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new ye(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new Qe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new ye},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new Qe(0)},specularColor:{value:new Qe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new ye},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag};var ll={r:0,b:0,g:0},Pg=new ft,Lu=new Ye;Lu.set(-1,0,0,0,1,0,0,0,1);function Lg(i,e,t,n,s,r){let a=new Qe(0),o=s===!0?0:1,l,c,h=null,d=0,u=null;function p(M){let S=M.isScene===!0?M.background:null;if(S&&S.isTexture){let v=M.backgroundBlurriness>0;S=e.get(S,v)}return S}function f(M){let S=!1,v=p(M);v===null?m(a,o):v&&v.isColor&&(m(v,1),S=!0);let E=i.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||S)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function y(M,S){let v=p(S);v&&(v.isCubeTexture||v.mapping===Ur)?(c===void 0&&(c=new Wt(new Un(1,1,1),new an({name:"BackgroundCubeMaterial",uniforms:Hi(zn.backgroundCube.uniforms),vertexShader:zn.backgroundCube.vertexShader,fragmentShader:zn.backgroundCube.fragmentShader,side:Yt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,w,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Pg.makeRotationFromEuler(S.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Lu),c.material.toneMapped=st.getTransfer(v.colorSpace)!==ht,(h!==v||d!==v.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,h=v,d=v.version,u=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Wt(new Er(2,2),new an({name:"BackgroundMaterial",uniforms:Hi(zn.background.uniforms),vertexShader:zn.background.vertexShader,fragmentShader:zn.background.fragmentShader,side:yi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=st.getTransfer(v.colorSpace)!==ht,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||d!==v.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,h=v,d=v.version,u=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function m(M,S){M.getRGB(ll,Bc(i)),t.buffers.color.setClear(ll.r,ll.g,ll.b,S,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,S=1){a.set(M),o=S,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,m(a,o)},render:f,addToRenderList:y,dispose:g}}function Ng(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(T,L,z,I,R){let k=!1,H=d(T,I,z,L);r!==H&&(r=H,c(r.object)),k=p(T,I,z,R),k&&f(T,I,z,R),R!==null&&e.update(R,i.ELEMENT_ARRAY_BUFFER),(k||a)&&(a=!1,v(T,L,z,I),R!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(R).buffer))}function l(){return i.createVertexArray()}function c(T){return i.bindVertexArray(T)}function h(T){return i.deleteVertexArray(T)}function d(T,L,z,I){let R=I.wireframe===!0,k=n[L.id];k===void 0&&(k={},n[L.id]=k);let H=T.isInstancedMesh===!0?T.id:0,J=k[H];J===void 0&&(J={},k[H]=J);let G=J[z.id];G===void 0&&(G={},J[z.id]=G);let F=G[R];return F===void 0&&(F=u(l()),G[R]=F),F}function u(T){let L=[],z=[],I=[];for(let R=0;R<t;R++)L[R]=0,z[R]=0,I[R]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:z,attributeDivisors:I,object:T,attributes:{},index:null}}function p(T,L,z,I){let R=r.attributes,k=L.attributes,H=0,J=z.getAttributes();for(let G in J)if(J[G].location>=0){let Y=R[G],le=k[G];if(le===void 0&&(G==="instanceMatrix"&&T.instanceMatrix&&(le=T.instanceMatrix),G==="instanceColor"&&T.instanceColor&&(le=T.instanceColor)),Y===void 0||Y.attribute!==le||le&&Y.data!==le.data)return!0;H++}return r.attributesNum!==H||r.index!==I}function f(T,L,z,I){let R={},k=L.attributes,H=0,J=z.getAttributes();for(let G in J)if(J[G].location>=0){let Y=k[G];Y===void 0&&(G==="instanceMatrix"&&T.instanceMatrix&&(Y=T.instanceMatrix),G==="instanceColor"&&T.instanceColor&&(Y=T.instanceColor));let le={};le.attribute=Y,Y&&Y.data&&(le.data=Y.data),R[G]=le,H++}r.attributes=R,r.attributesNum=H,r.index=I}function y(){let T=r.newAttributes;for(let L=0,z=T.length;L<z;L++)T[L]=0}function m(T){g(T,0)}function g(T,L){let z=r.newAttributes,I=r.enabledAttributes,R=r.attributeDivisors;z[T]=1,I[T]===0&&(i.enableVertexAttribArray(T),I[T]=1),R[T]!==L&&(i.vertexAttribDivisor(T,L),R[T]=L)}function M(){let T=r.newAttributes,L=r.enabledAttributes;for(let z=0,I=L.length;z<I;z++)L[z]!==T[z]&&(i.disableVertexAttribArray(z),L[z]=0)}function S(T,L,z,I,R,k,H){H===!0?i.vertexAttribIPointer(T,L,z,R,k):i.vertexAttribPointer(T,L,z,I,R,k)}function v(T,L,z,I){y();let R=I.attributes,k=z.getAttributes(),H=L.defaultAttributeValues;for(let J in k){let G=k[J];if(G.location>=0){let F=R[J];if(F===void 0&&(J==="instanceMatrix"&&T.instanceMatrix&&(F=T.instanceMatrix),J==="instanceColor"&&T.instanceColor&&(F=T.instanceColor)),F!==void 0){let Y=F.normalized,le=F.itemSize,ae=e.get(F);if(ae===void 0)continue;let qe=ae.buffer,He=ae.type,$e=ae.bytesPerElement,$=He===i.INT||He===i.UNSIGNED_INT||F.gpuType===Mo;if(F.isInterleavedBufferAttribute){let ee=F.data,fe=ee.stride,Oe=F.offset;if(ee.isInstancedInterleavedBuffer){for(let we=0;we<G.locationSize;we++)g(G.location+we,ee.meshPerAttribute);T.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let we=0;we<G.locationSize;we++)m(G.location+we);i.bindBuffer(i.ARRAY_BUFFER,qe);for(let we=0;we<G.locationSize;we++)S(G.location+we,le/G.locationSize,He,Y,fe*$e,(Oe+le/G.locationSize*we)*$e,$)}else{if(F.isInstancedBufferAttribute){for(let ee=0;ee<G.locationSize;ee++)g(G.location+ee,F.meshPerAttribute);T.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=F.meshPerAttribute*F.count)}else for(let ee=0;ee<G.locationSize;ee++)m(G.location+ee);i.bindBuffer(i.ARRAY_BUFFER,qe);for(let ee=0;ee<G.locationSize;ee++)S(G.location+ee,le/G.locationSize,He,Y,le*$e,le/G.locationSize*ee*$e,$)}}else if(H!==void 0){let Y=H[J];if(Y!==void 0)switch(Y.length){case 2:i.vertexAttrib2fv(G.location,Y);break;case 3:i.vertexAttrib3fv(G.location,Y);break;case 4:i.vertexAttrib4fv(G.location,Y);break;default:i.vertexAttrib1fv(G.location,Y)}}}}M()}function E(){A();for(let T in n){let L=n[T];for(let z in L){let I=L[z];for(let R in I){let k=I[R];for(let H in k)h(k[H].object),delete k[H];delete I[R]}}delete n[T]}}function w(T){if(n[T.id]===void 0)return;let L=n[T.id];for(let z in L){let I=L[z];for(let R in I){let k=I[R];for(let H in k)h(k[H].object),delete k[H];delete I[R]}}delete n[T.id]}function P(T){for(let L in n){let z=n[L];for(let I in z){let R=z[I];if(R[T.id]===void 0)continue;let k=R[T.id];for(let H in k)h(k[H].object),delete k[H];delete R[T.id]}}}function _(T){for(let L in n){let z=n[L],I=T.isInstancedMesh===!0?T.id:0,R=z[I];if(R!==void 0){for(let k in R){let H=R[k];for(let J in H)h(H[J].object),delete H[J];delete R[k]}delete z[I],Object.keys(z).length===0&&delete n[L]}}}function A(){N(),a=!0,r!==s&&(r=s,c(r.object))}function N(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:A,resetDefaultState:N,dispose:E,releaseStatesOfGeometry:w,releaseStatesOfObject:_,releaseStatesOfProgram:P,initAttributes:y,enableAttribute:m,disableUnusedAttributes:M}}function Dg(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let u=0;for(let p=0;p<h;p++)u+=c[p];t.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Ug(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let P=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(P){return!(P!==fn&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){let _=P===wn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(P!==en&&P!==un&&!_&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(P){if(P==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Ge("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Ge("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),w=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:f,maxTextureSize:y,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:M,maxVaryings:S,maxFragmentUniforms:v,maxSamples:E,samples:w}}function kg(i){let e=this,t=null,n=0,s=!1,r=!1,a=new vn,o=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let p=d.length!==0||u||n!==0||s;return s=u,n=d.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,p){let f=d.clippingPlanes,y=d.clipIntersection,m=d.clipShadows,g=i.get(d);if(!s||f===null||f.length===0||r&&!m)r?h(null):c();else{let M=r?0:n,S=M*4,v=g.clippingState||null;l.value=v,v=h(f,u,S,p);for(let E=0;E!==S;++E)v[E]=t[E];g.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(d,u,p,f){let y=d!==null?d.length:0,m=null;if(y!==0){if(m=l.value,f!==!0||m===null){let g=p+y*4,M=u.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<g)&&(m=new Float32Array(g));for(let S=0,v=p;S!==y;++S,v+=4)a.copy(d[S]).applyMatrix4(M,o),a.normal.toArray(m,v),m[v+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}var Ns=4,Fg=6,Og=20,Bg=256,Hr=new xi,hu=new Qe,Hc=null,Wc=0,Xc=0,qc=!1,zg=new B,Wi=new B,hl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=zg}=r;Hc=this._renderer.getRenderTarget(),Wc=this._renderer.getActiveCubeFace(),Xc=this._renderer.getActiveMipmapLevel(),qc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=fu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=uu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Hc,Wc,Xc),this._renderer.xr.enabled=qc,e.scissorTest=!1,Ls(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===_i||e.mapping===Gi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Hc=this._renderer.getRenderTarget(),Wc=this._renderer.getActiveCubeFace(),Xc=this._renderer.getActiveMipmapLevel(),qc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Pt,minFilter:Pt,generateMipmaps:!1,type:wn,format:fn,colorSpace:nr,depthBuffer:!1},s=du(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=du(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Vg(r)),this._blurMaterial=Hg(r,e,t),this._ggxMaterial=Gg(r,e,t)}return s}_compileMaterial(e){let t=new Wt(new Qt,e);this._renderer.compile(t,Hr)}_sceneToCubeUV(e,t,n,s,r){let l=new Jt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,p=d.toneMapping;d.getClearColor(hu),d.toneMapping=Mn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Wt(new Un,new dr({name:"PMREM.Background",side:Yt,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,m=y.material,g=!1,M=e.background;M?M.isColor&&(m.color.copy(M),e.background=null,g=!0):(m.color.copy(hu),g=!0);for(let S=0;S<6;S++){let v=S%3;v===0?(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[S],r.y,r.z)):v===1?(l.up.set(0,0,c[S]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[S],r.z)):(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[S]));let E=this._cubeSize;Ls(s,v*E,S>2?E:0,E,E),d.setRenderTarget(s),g&&d.render(y,l),d.render(e,l)}d.toneMapping=p,d.autoClear=u,e.background=M}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===_i||e.mapping===Gi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=fu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=uu());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;Ls(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Hr)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,p=d*u,{_lodMax:f}=this,y=this._sizeLods[n],m=3*y*(n>f-Ns?n-f+Ns:0),g=4*(this._cubeSize-y);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=f-t,Ls(r,m,g,3*y,2*y),s.setRenderTarget(r),s.render(o,Hr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=f-n,Ls(e,m,g,3*y,2*y),s.setRenderTarget(e),s.render(o,Hr)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[s],d=3*h*(s>this._lodMax-Ns?s-this._lodMax+Ns:0),u=4*(this._cubeSize-h);Ls(t,d,u,3*h,2*h),a.setRenderTarget(t),a.render(l,Hr)}};function Vg(i){let e=[],t=[],n=i,s=i-Ns+1+Fg;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,p=3,f=new Float32Array(p*u*d),y=new Float32Array(p*u*d);for(let g=0;g<d;g++){let M=g%3*2/3-1,S=g>2?0:-1,v=[M,S,0,M+2/3,S,0,M+2/3,S+1,0,M,S,0,M+2/3,S+1,0,M,S+1,0];f.set(v,p*u*g);for(let E=0;E<u;E++){let w=h[E*2]*2-1,P=h[E*2+1]*2-1;g===0?Wi.set(1,P,w):g===1?Wi.set(-w,1,-P):g===2?Wi.set(-w,P,1):g===3?Wi.set(-1,P,-w):g===4?Wi.set(-w,-1,P):Wi.set(w,P,-1),Wi.toArray(y,(g*u+E)*p)}}let m=new Qt;m.setAttribute("position",new sn(f,p)),m.setAttribute("outputDirection",new sn(y,p)),t.push(new Wt(m,null)),n>Ns&&n--}return{lodMeshes:t,sizeLods:e}}function du(i,e,t){let n=new Kt(i,e,t);return n.texture.mapping=Ur,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ls(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Gg(i,e,t){return new an({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Bg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:fl(),fragmentShader:`

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
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function Hg(i,e,t){return new an({name:"SphericalGaussianBlur",defines:{SAMPLES:Og,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:fl(),fragmentShader:`

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
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function uu(){return new an({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:fl(),fragmentShader:`

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
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function fu(){return new an({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:fl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function fl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var dl=class extends Kt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new fr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Un(5,5,5),r=new an({name:"CubemapFromEquirect",uniforms:Hi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Yt,blending:Fn});r.uniforms.tEquirect.value=t;let a=new Wt(s,r),o=t.minFilter;return t.minFilter===On&&(t.minFilter=Pt),new go(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function Wg(i){let e=new WeakMap,t=new WeakMap,n=null;function s(u,p=!1){return u==null?null:p?a(u):r(u)}function r(u){if(u&&u.isTexture){let p=u.mapping;if(p===_o||p===vo)if(e.has(u)){let f=e.get(u).texture;return o(f,u.mapping)}else{let f=u.image;if(f&&f.height>0){let y=new dl(f.height);return y.fromEquirectangularTexture(i,u),e.set(u,y),u.addEventListener("dispose",c),o(y.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let p=u.mapping,f=p===_o||p===vo,y=p===_i||p===Gi;if(f||y){let m=t.get(u),g=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==g)return n===null&&(n=new hl(i)),m=f?n.fromEquirectangular(u,m):n.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{let M=u.image;return f&&M&&M.height>0||y&&M&&l(M)?(n===null&&(n=new hl(i)),m=f?n.fromEquirectangular(u):n.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function o(u,p){return p===_o?u.mapping=_i:p===vo&&(u.mapping=Gi),u}function l(u){let p=0,f=6;for(let y=0;y<f;y++)u[y]!==void 0&&p++;return p===f}function c(u){let p=u.target;p.removeEventListener("dispose",c);let f=e.get(p);f!==void 0&&(e.delete(p),f.dispose())}function h(u){let p=u.target;p.removeEventListener("dispose",h);let f=t.get(p);f!==void 0&&(t.delete(p),f.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function Xg(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Fi("WebGLRenderer: "+n+" extension not supported."),s}}}function qg(i,e,t,n){let s={},r=new WeakMap;function a(d){let u=d.target;u.index!==null&&e.remove(u.index);for(let f in u.attributes)e.remove(u.attributes[f]);u.removeEventListener("dispose",a),delete s[u.id];let p=r.get(u);p&&(e.remove(p),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(d,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,t.memory.geometries++),u}function l(d){let u=d.attributes;for(let p in u)e.update(u[p],i.ARRAY_BUFFER)}function c(d){let u=[],p=d.index,f=d.attributes.position,y=0;if(f===void 0)return;if(p!==null){let M=p.array;y=p.version;for(let S=0,v=M.length;S<v;S+=3){let E=M[S+0],w=M[S+1],P=M[S+2];u.push(E,w,w,P,P,E)}}else{let M=f.array;y=f.version;for(let S=0,v=M.length/3-1;S<v;S+=3){let E=S+0,w=S+1,P=S+2;u.push(E,w,w,P,P,E)}}let m=new(f.count>=65535?hr:cr)(u,1);m.version=y;let g=r.get(d);g&&e.remove(g),r.set(d,m)}function h(d){let u=r.get(d);if(u){let p=d.index;p!==null&&u.version<p.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function Yg(i,e,t){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,u){i.drawElements(n,u,r,d*a),t.update(u,n,1)}function c(d,u,p){p!==0&&(i.drawElementsInstanced(n,u,r,d*a,p),t.update(u,n,p))}function h(d,u,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,d,0,p);let y=0;for(let m=0;m<p;m++)y+=u[m];t.update(y,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function $g(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:We("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Jg(i,e,t){let n=new WeakMap,s=new bt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=n.get(o);if(u===void 0||u.count!==d){let A=function(){P.dispose(),n.delete(o),o.removeEventListener("dispose",A)};u!==void 0&&u.texture.dispose();let p=o.morphAttributes.position!==void 0,f=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],S=0;p===!0&&(S=1),f===!0&&(S=2),y===!0&&(S=3);let v=o.attributes.position.count*S,E=1;v>e.maxTextureSize&&(E=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let w=new Float32Array(v*E*4*d),P=new rr(w,v,E,d);P.type=un,P.needsUpdate=!0;let _=S*4;for(let N=0;N<d;N++){let T=m[N],L=g[N],z=M[N],I=v*E*4*N;for(let R=0;R<T.count;R++){let k=R*_;p===!0&&(s.fromBufferAttribute(T,R),w[I+k+0]=s.x,w[I+k+1]=s.y,w[I+k+2]=s.z,w[I+k+3]=0),f===!0&&(s.fromBufferAttribute(L,R),w[I+k+4]=s.x,w[I+k+5]=s.y,w[I+k+6]=s.z,w[I+k+7]=0),y===!0&&(s.fromBufferAttribute(z,R),w[I+k+8]=s.x,w[I+k+9]=s.y,w[I+k+10]=s.z,w[I+k+11]=z.itemSize===4?s.w:1)}}u={count:d,texture:P,size:new ye(v,E)},n.set(o,u),o.addEventListener("dispose",A)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let y=0;y<c.length;y++)p+=c[y];let f=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",f),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function Zg(i,e,t,n,s){let r=new WeakMap;function a(c){let h=s.render.frame,d=c.geometry,u=e.get(c,d);if(r.get(u)!==h&&(e.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==h&&(p.update(),r.set(p,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var jg={[Sc]:"LINEAR_TONE_MAPPING",[wc]:"REINHARD_TONE_MAPPING",[Ec]:"CINEON_TONE_MAPPING",[Dr]:"ACES_FILMIC_TONE_MAPPING",[Ac]:"AGX_TONE_MAPPING",[Cc]:"NEUTRAL_TONE_MAPPING",[Tc]:"CUSTOM_TONE_MAPPING"};function Kg(i,e,t,n,s,r){let a=new Kt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Qt;c.setAttribute("position",new wt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new wt([0,2,0,0,2,0],2));let h=new to({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new Wt(c,h),u=new xi(-1,1,1,-1,0,1),p=null,f=null,y=!1,m,g=null,M=[],S=!1;this.setSize=function(v,E){a.setSize(v,E),o!==null&&o.setSize(v,E),l!==null&&l.setSize(v,E);for(let w=0;w<M.length;w++){let P=M[w];P.setSize&&P.setSize(v,E)}},this.setEffects=function(v){M=v,S=M.length>0&&M[0].isRenderPass===!0;let E=a.width,w=a.height;M.length>0&&o===null&&(o=new Kt(E,w,{type:wn,depthBuffer:!1,stencilBuffer:!1}),l=new Kt(E,w,{type:wn,depthBuffer:!1,stencilBuffer:!1}));for(let P=0;P<M.length;P++){let _=M[P];_.setSize&&_.setSize(E,w)}},this.begin=function(v,E){if(y||v.toneMapping===Mn&&M.length===0)return!1;if(g=E,E!==null){let w=E.width,P=E.height;(a.width!==w||a.height!==P)&&this.setSize(w,P)}return S===!1&&v.setRenderTarget(a),m=v.toneMapping,v.toneMapping=Mn,!0},this.hasRenderPass=function(){return S},this.end=function(v,E){v.toneMapping=m,y=!0;let w=a,P=o;for(let _=0;_<M.length;_++){let A=M[_];A.enabled!==!1&&(A.render(v,P,w,E),A.needsSwap!==!1&&(w=P,P=P===o?l:o))}if(p!==v.outputColorSpace||f!==v.toneMapping){p=v.outputColorSpace,f=v.toneMapping,h.defines={},st.getTransfer(p)===ht&&(h.defines.SRGB_TRANSFER="");let _=jg[f];_&&(h.defines[_]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=w.texture,v.setRenderTarget(g),v.render(d,u),g=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Nu=new jt,Jc=new fi(1,1),Du=new rr,Uu=new qa,ku=new fr,pu=[],mu=[],gu=new Float32Array(16),xu=new Float32Array(9),yu=new Float32Array(4);function Us(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=pu[s];if(r===void 0&&(r=new Float32Array(s),pu[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Lt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Nt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function pl(i,e){let t=mu[e];t===void 0&&(t=new Int32Array(e),mu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Qg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function ex(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2fv(this.addr,e),Nt(t,e)}}function tx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Lt(t,e))return;i.uniform3fv(this.addr,e),Nt(t,e)}}function nx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4fv(this.addr,e),Nt(t,e)}}function ix(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Nt(t,e)}else{if(Lt(t,n))return;yu.set(n),i.uniformMatrix2fv(this.addr,!1,yu),Nt(t,n)}}function sx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Nt(t,e)}else{if(Lt(t,n))return;xu.set(n),i.uniformMatrix3fv(this.addr,!1,xu),Nt(t,n)}}function rx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Nt(t,e)}else{if(Lt(t,n))return;gu.set(n),i.uniformMatrix4fv(this.addr,!1,gu),Nt(t,n)}}function ax(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function ox(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2iv(this.addr,e),Nt(t,e)}}function lx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Lt(t,e))return;i.uniform3iv(this.addr,e),Nt(t,e)}}function cx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4iv(this.addr,e),Nt(t,e)}}function hx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function dx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2uiv(this.addr,e),Nt(t,e)}}function ux(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Lt(t,e))return;i.uniform3uiv(this.addr,e),Nt(t,e)}}function fx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4uiv(this.addr,e),Nt(t,e)}}function px(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Jc.compareFunction=t.isReversedDepthBuffer()?ol:al,r=Jc):r=Nu,t.setTexture2D(e||r,s)}function mx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Uu,s)}function gx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||ku,s)}function xx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Du,s)}function yx(i){switch(i){case 5126:return Qg;case 35664:return ex;case 35665:return tx;case 35666:return nx;case 35674:return ix;case 35675:return sx;case 35676:return rx;case 5124:case 35670:return ax;case 35667:case 35671:return ox;case 35668:case 35672:return lx;case 35669:case 35673:return cx;case 5125:return hx;case 36294:return dx;case 36295:return ux;case 36296:return fx;case 35678:case 36198:case 36298:case 36306:case 35682:return px;case 35679:case 36299:case 36307:return mx;case 35680:case 36300:case 36308:case 36293:return gx;case 36289:case 36303:case 36311:case 36292:return xx}}function _x(i,e){i.uniform1fv(this.addr,e)}function vx(i,e){let t=Us(e,this.size,2);i.uniform2fv(this.addr,t)}function bx(i,e){let t=Us(e,this.size,3);i.uniform3fv(this.addr,t)}function Mx(i,e){let t=Us(e,this.size,4);i.uniform4fv(this.addr,t)}function Sx(i,e){let t=Us(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function wx(i,e){let t=Us(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Ex(i,e){let t=Us(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Tx(i,e){i.uniform1iv(this.addr,e)}function Ax(i,e){i.uniform2iv(this.addr,e)}function Cx(i,e){i.uniform3iv(this.addr,e)}function Rx(i,e){i.uniform4iv(this.addr,e)}function Ix(i,e){i.uniform1uiv(this.addr,e)}function Px(i,e){i.uniform2uiv(this.addr,e)}function Lx(i,e){i.uniform3uiv(this.addr,e)}function Nx(i,e){i.uniform4uiv(this.addr,e)}function Dx(i,e,t){let n=this.cache,s=e.length,r=pl(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Jc:a=Nu;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Ux(i,e,t){let n=this.cache,s=e.length,r=pl(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Uu,r[a])}function kx(i,e,t){let n=this.cache,s=e.length,r=pl(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||ku,r[a])}function Fx(i,e,t){let n=this.cache,s=e.length,r=pl(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Du,r[a])}function Ox(i){switch(i){case 5126:return _x;case 35664:return vx;case 35665:return bx;case 35666:return Mx;case 35674:return Sx;case 35675:return wx;case 35676:return Ex;case 5124:case 35670:return Tx;case 35667:case 35671:return Ax;case 35668:case 35672:return Cx;case 35669:case 35673:return Rx;case 5125:return Ix;case 36294:return Px;case 36295:return Lx;case 36296:return Nx;case 35678:case 36198:case 36298:case 36306:case 35682:return Dx;case 35679:case 36299:case 36307:return Ux;case 35680:case 36300:case 36308:case 36293:return kx;case 36289:case 36303:case 36311:case 36292:return Fx}}var Zc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=yx(t.type)}},jc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Ox(t.type)}},Kc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Yc=/(\w+)(\])?(\[|\.)?/g;function _u(i,e){i.seq.push(e),i.map[e.id]=e}function Bx(i,e,t){let n=i.name,s=n.length;for(Yc.lastIndex=0;;){let r=Yc.exec(n),a=Yc.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){_u(t,c===void 0?new Zc(o,i,e):new jc(o,i,e));break}else{let d=t.map[o];d===void 0&&(d=new Kc(o),_u(t,d)),t=d}}}var Ds=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Bx(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function vu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var zx=37297,Vx=0;function Gx(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var bu=new Ye;function Hx(i){st._getMatrix(bu,st.workingColorSpace,i);let e=`mat3( ${bu.elements.map(t=>t.toFixed(4))} )`;switch(st.getTransfer(i)){case ir:return[e,"LinearTransferOETF"];case ht:return[e,"sRGBTransferOETF"];default:return Ge("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Mu(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Gx(i.getShaderSource(e),o)}else return r}function Wx(i,e){let t=Hx(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Xx={[Sc]:"Linear",[wc]:"Reinhard",[Ec]:"Cineon",[Dr]:"ACESFilmic",[Ac]:"AgX",[Cc]:"Neutral",[Tc]:"Custom"};function qx(i,e){let t=Xx[e];return t===void 0?(Ge("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var cl=new B;function Yx(){st.getLuminanceCoefficients(cl);let i=cl.x.toFixed(4),e=cl.y.toFixed(4),t=cl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function $x(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Xr).join(`
`)}function Jx(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Zx(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Xr(i){return i!==""}function Su(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function wu(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var jx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Qc(i){return i.replace(jx,Qx)}var Kx=new Map;function Qx(i,e){let t=et[e];if(t===void 0){let n=Kx.get(e);if(n!==void 0)t=et[n],Ge('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Qc(t)}var ey=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Eu(i){return i.replace(ey,ty)}function ty(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Tu(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var ny={[Nr]:"SHADOWMAP_TYPE_PCF",[As]:"SHADOWMAP_TYPE_VSM"};function iy(i){return ny[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var sy={[_i]:"ENVMAP_TYPE_CUBE",[Gi]:"ENVMAP_TYPE_CUBE",[Ur]:"ENVMAP_TYPE_CUBE_UV"};function ry(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":sy[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var ay={[Gi]:"ENVMAP_MODE_REFRACTION"};function oy(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":ay[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var ly={[Mc]:"ENVMAP_BLENDING_MULTIPLY",[Bd]:"ENVMAP_BLENDING_MIX",[zd]:"ENVMAP_BLENDING_ADD"};function cy(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":ly[i.combine]||"ENVMAP_BLENDING_NONE"}function hy(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function dy(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=iy(t),c=ry(t),h=oy(t),d=cy(t),u=hy(t),p=$x(t),f=Jx(r),y=s.createProgram(),m,g,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(Xr).join(`
`),m.length>0&&(m+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(Xr).join(`
`),g.length>0&&(g+=`
`)):(m=[Tu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Xr).join(`
`),g=[Tu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Mn?"#define TONE_MAPPING":"",t.toneMapping!==Mn?et.tonemapping_pars_fragment:"",t.toneMapping!==Mn?qx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",et.colorspace_pars_fragment,Wx("linearToOutputTexel",t.outputColorSpace),Yx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Xr).join(`
`)),a=Qc(a),a=Su(a,t),a=wu(a,t),o=Qc(o),o=Su(o,t),o=wu(o,t),a=Eu(a),o=Eu(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,g=["#define varying in",t.glslVersion===kc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===kc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let S=M+m+a,v=M+g+o,E=vu(s,s.VERTEX_SHADER,S),w=vu(s,s.FRAGMENT_SHADER,v);s.attachShader(y,E),s.attachShader(y,w),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function P(T){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(y)||"",z=s.getShaderInfoLog(E)||"",I=s.getShaderInfoLog(w)||"",R=L.trim(),k=z.trim(),H=I.trim(),J=!0,G=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(J=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,E,w);else{let F=Mu(s,E,"vertex"),Y=Mu(s,w,"fragment");We("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+T.name+`
Material Type: `+T.type+`

Program Info Log: `+R+`
`+F+`
`+Y)}else R!==""?Ge("WebGLProgram: Program Info Log:",R):(k===""||H==="")&&(G=!1);G&&(T.diagnostics={runnable:J,programLog:R,vertexShader:{log:k,prefix:m},fragmentShader:{log:H,prefix:g}})}s.deleteShader(E),s.deleteShader(w),_=new Ds(s,y),A=Zx(s,y)}let _;this.getUniforms=function(){return _===void 0&&P(this),_};let A;this.getAttributes=function(){return A===void 0&&P(this),A};let N=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return N===!1&&(N=s.getProgramParameter(y,zx)),N},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Vx++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=E,this.fragmentShader=w,this}var uy=0,eh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new th(e),t.set(e,n)),n}},th=class{constructor(e){this.id=uy++,this.code=e,this.usedTimes=0}};function fy(i){return i===bi||i===Vr||i===Gr}function py(i,e,t,n,s,r){let a=new ar,o=new eh,l=new Set,c=[],h=new Map,d=n.logarithmicDepthBuffer,u=n.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(_){return l.add(_),_===0?"uv":`uv${_}`}function y(_,A,N,T,L,z){let I=T.fog,R=L.geometry,k=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?T.environment:null,H=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,J=e.get(_.envMap||k,H),G=J&&J.mapping===Ur?J.image.height:null,F=p[_.type];_.precision!==null&&(u=n.getMaxPrecision(_.precision),u!==_.precision&&Ge("WebGLProgram.getParameters:",_.precision,"not supported, using",u,"instead."));let Y=R.morphAttributes.position||R.morphAttributes.normal||R.morphAttributes.color,le=Y!==void 0?Y.length:0,ae=0;R.morphAttributes.position!==void 0&&(ae=1),R.morphAttributes.normal!==void 0&&(ae=2),R.morphAttributes.color!==void 0&&(ae=3);let qe,He,$e,$;if(F){let mt=zn[F];qe=mt.vertexShader,He=mt.fragmentShader}else{qe=_.vertexShader,He=_.fragmentShader;let mt=o.getVertexShaderStage(_),lt=o.getFragmentShaderStage(_);o.update(_,mt,lt),$e=mt.id,$=lt.id}let ee=i.getRenderTarget(),fe=i.state.buffers.depth.getReversed(),Oe=L.isInstancedMesh===!0,we=L.isBatchedMesh===!0,oe=!!_.map,Le=!!_.matcap,te=!!J,j=!!_.aoMap,re=!!_.lightMap,ce=!!_.bumpMap&&_.wireframe===!1,ue=!!_.normalMap,Be=!!_.displacementMap,ke=!!_.emissiveMap,Xe=!!_.metalnessMap,Je=!!_.roughnessMap,D=_.anisotropy>0,ot=_.clearcoat>0,tt=_.dispersion>0,C=_.retroreflectivity>0,x=_.iridescence>0,V=_.sheen>0,q=_.transmission>0,K=D&&!!_.anisotropyMap,he=ot&&!!_.clearcoatMap,de=ot&&!!_.clearcoatNormalMap,Q=ot&&!!_.clearcoatRoughnessMap,ie=x&&!!_.iridescenceMap,pe=x&&!!_.iridescenceThicknessMap,Ne=V&&!!_.sheenColorMap,_e=V&&!!_.sheenRoughnessMap,me=!!_.specularMap,De=!!_.specularColorMap,ze=!!_.specularIntensityMap,je=q&&!!_.transmissionMap,O=q&&!!_.thicknessMap,ge=!!_.gradientMap,ne=!!_.alphaMap,xe=_.alphaTest>0,Se=!!_.alphaHash,se=!!_.extensions,Ue=Mn;_.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Ue=i.toneMapping);let Ie={shaderID:F,shaderType:_.type,shaderName:_.name,vertexShader:qe,fragmentShader:He,defines:_.defines,customVertexShaderID:$e,customFragmentShaderID:$,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:u,batching:we,batchingColor:we&&L._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&L.instanceColor!==null,instancingMorph:Oe&&L.morphTexture!==null,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:st.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:oe,matcap:Le,envMap:te,envMapMode:te&&J.mapping,envMapCubeUVHeight:G,aoMap:j,lightMap:re,bumpMap:ce,normalMap:ue,displacementMap:Be,emissiveMap:ke,normalMapObjectSpace:ue&&_.normalMapType===Hd,normalMapTangentSpace:ue&&_.normalMapType===rl,packedNormalMap:ue&&_.normalMapType===rl&&fy(_.normalMap.format),metalnessMap:Xe,roughnessMap:Je,anisotropy:D,anisotropyMap:K,clearcoat:ot,clearcoatMap:he,clearcoatNormalMap:de,clearcoatRoughnessMap:Q,dispersion:tt,retroreflection:C,iridescence:x,iridescenceMap:ie,iridescenceThicknessMap:pe,sheen:V,sheenColorMap:Ne,sheenRoughnessMap:_e,specularMap:me,specularColorMap:De,specularIntensityMap:ze,transmission:q,transmissionMap:je,thicknessMap:O,gradientMap:ge,opaque:_.transparent===!1&&_.blending===Cs&&_.alphaToCoverage===!1,alphaMap:ne,alphaTest:xe,alphaHash:Se,combine:_.combine,mapUv:oe&&f(_.map.channel),aoMapUv:j&&f(_.aoMap.channel),lightMapUv:re&&f(_.lightMap.channel),bumpMapUv:ce&&f(_.bumpMap.channel),normalMapUv:ue&&f(_.normalMap.channel),displacementMapUv:Be&&f(_.displacementMap.channel),emissiveMapUv:ke&&f(_.emissiveMap.channel),metalnessMapUv:Xe&&f(_.metalnessMap.channel),roughnessMapUv:Je&&f(_.roughnessMap.channel),anisotropyMapUv:K&&f(_.anisotropyMap.channel),clearcoatMapUv:he&&f(_.clearcoatMap.channel),clearcoatNormalMapUv:de&&f(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&f(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ie&&f(_.iridescenceMap.channel),iridescenceThicknessMapUv:pe&&f(_.iridescenceThicknessMap.channel),sheenColorMapUv:Ne&&f(_.sheenColorMap.channel),sheenRoughnessMapUv:_e&&f(_.sheenRoughnessMap.channel),specularMapUv:me&&f(_.specularMap.channel),specularColorMapUv:De&&f(_.specularColorMap.channel),specularIntensityMapUv:ze&&f(_.specularIntensityMap.channel),transmissionMapUv:je&&f(_.transmissionMap.channel),thicknessMapUv:O&&f(_.thicknessMap.channel),alphaMapUv:ne&&f(_.alphaMap.channel),vertexTangents:!!R.attributes.tangent&&(ue||D),vertexNormals:!!R.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!R.attributes.color&&R.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!R.attributes.uv&&(oe||ne),fog:!!I,useFog:_.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||R.attributes.normal===void 0&&ue===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:fe,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:R.attributes.position!==void 0,morphTargets:R.morphAttributes.position!==void 0,morphNormals:R.morphAttributes.normal!==void 0,morphColors:R.morphAttributes.color!==void 0,morphTargetsCount:le,morphTextureStride:ae,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:z.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&N.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ue,decodeVideoTexture:oe&&_.map.isVideoTexture===!0&&st.getTransfer(_.map.colorSpace)===ht,decodeVideoTextureEmissive:ke&&_.emissiveMap.isVideoTexture===!0&&st.getTransfer(_.emissiveMap.colorSpace)===ht,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===kn,flipSided:_.side===Yt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:se&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(se&&_.extensions.multiDraw===!0||we)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ie.vertexUv1s=l.has(1),Ie.vertexUv2s=l.has(2),Ie.vertexUv3s=l.has(3),l.clear(),Ie}function m(_){let A=[];if(_.shaderID?A.push(_.shaderID):(A.push(_.customVertexShaderID),A.push(_.customFragmentShaderID)),_.defines!==void 0)for(let N in _.defines)A.push(N),A.push(_.defines[N]);return _.isRawShaderMaterial===!1&&(g(A,_),M(A,_),A.push(i.outputColorSpace)),A.push(_.customProgramCacheKey),A.join()}function g(_,A){_.push(A.precision),_.push(A.outputColorSpace),_.push(A.envMapMode),_.push(A.envMapCubeUVHeight),_.push(A.mapUv),_.push(A.alphaMapUv),_.push(A.lightMapUv),_.push(A.aoMapUv),_.push(A.bumpMapUv),_.push(A.normalMapUv),_.push(A.displacementMapUv),_.push(A.emissiveMapUv),_.push(A.metalnessMapUv),_.push(A.roughnessMapUv),_.push(A.anisotropyMapUv),_.push(A.clearcoatMapUv),_.push(A.clearcoatNormalMapUv),_.push(A.clearcoatRoughnessMapUv),_.push(A.iridescenceMapUv),_.push(A.iridescenceThicknessMapUv),_.push(A.sheenColorMapUv),_.push(A.sheenRoughnessMapUv),_.push(A.specularMapUv),_.push(A.specularColorMapUv),_.push(A.specularIntensityMapUv),_.push(A.transmissionMapUv),_.push(A.thicknessMapUv),_.push(A.combine),_.push(A.fogExp2),_.push(A.sizeAttenuation),_.push(A.morphTargetsCount),_.push(A.morphAttributeCount),_.push(A.numSunLights),_.push(A.numDirLights),_.push(A.numPointLights),_.push(A.numSpotLights),_.push(A.numSpotLightMaps),_.push(A.numHemiLights),_.push(A.numRectAreaLights),_.push(A.numSunLightShadows),_.push(A.numDirLightShadows),_.push(A.numPointLightShadows),_.push(A.numSpotLightShadows),_.push(A.numSpotLightShadowsWithMaps),_.push(A.numLightProbes),_.push(A.shadowMapType),_.push(A.toneMapping),_.push(A.numClippingPlanes),_.push(A.numClipIntersection),_.push(A.depthPacking)}function M(_,A){a.disableAll(),A.instancing&&a.enable(0),A.instancingColor&&a.enable(1),A.instancingMorph&&a.enable(2),A.matcap&&a.enable(3),A.envMap&&a.enable(4),A.normalMapObjectSpace&&a.enable(5),A.normalMapTangentSpace&&a.enable(6),A.clearcoat&&a.enable(7),A.iridescence&&a.enable(8),A.alphaTest&&a.enable(9),A.vertexColors&&a.enable(10),A.vertexAlphas&&a.enable(11),A.vertexUv1s&&a.enable(12),A.vertexUv2s&&a.enable(13),A.vertexUv3s&&a.enable(14),A.vertexTangents&&a.enable(15),A.anisotropy&&a.enable(16),A.alphaHash&&a.enable(17),A.batching&&a.enable(18),A.dispersion&&a.enable(19),A.retroreflection&&a.enable(24),A.batchingColor&&a.enable(20),A.gradientMap&&a.enable(21),A.packedNormalMap&&a.enable(22),A.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),A.fog&&a.enable(0),A.useFog&&a.enable(1),A.flatShading&&a.enable(2),A.logarithmicDepthBuffer&&a.enable(3),A.reversedDepthBuffer&&a.enable(4),A.skinning&&a.enable(5),A.morphTargets&&a.enable(6),A.morphNormals&&a.enable(7),A.morphColors&&a.enable(8),A.premultipliedAlpha&&a.enable(9),A.shadowMapEnabled&&a.enable(10),A.doubleSided&&a.enable(11),A.flipSided&&a.enable(12),A.useDepthPacking&&a.enable(13),A.dithering&&a.enable(14),A.transmission&&a.enable(15),A.sheen&&a.enable(16),A.opaque&&a.enable(17),A.pointsUvs&&a.enable(18),A.decodeVideoTexture&&a.enable(19),A.decodeVideoTextureEmissive&&a.enable(20),A.alphaToCoverage&&a.enable(21),A.numLightProbeGrids>0&&a.enable(22),A.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function S(_){let A=p[_.type],N;if(A){let T=zn[A];N=ou.clone(T.uniforms)}else N=_.uniforms;return N}function v(_,A){let N=h.get(A);return N!==void 0?++N.usedTimes:(N=new dy(i,A,_,s),c.push(N),h.set(A,N)),N}function E(_){if(--_.usedTimes===0){let A=c.indexOf(_);c[A]=c[c.length-1],c.pop(),h.delete(_.cacheKey),_.destroy()}}function w(_){o.remove(_)}function P(){o.dispose()}return{getParameters:y,getProgramCacheKey:m,getUniforms:S,acquireProgram:v,releaseProgram:E,releaseShaderCache:w,programs:c,dispose:P}}function my(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function gy(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Au(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Cu(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(u){let p=0;return u.isInstancedMesh&&(p+=2),u.isSkinnedMesh&&(p+=1),p}function o(u,p,f,y,m,g){let M=i[e];return M===void 0?(M={id:u.id,object:u,geometry:p,material:f,materialVariant:a(u),groupOrder:y,renderOrder:u.renderOrder,z:m,group:g},i[e]=M):(M.id=u.id,M.object=u,M.geometry=p,M.material=f,M.materialVariant=a(u),M.groupOrder=y,M.renderOrder=u.renderOrder,M.z=m,M.group=g),e++,M}function l(u,p,f,y,m,g,M){M.reversedDepth===!0&&(m=-m);let S=o(u,p,f,y,m,g);f.transmission>0?n.push(S):f.transparent===!0?s.push(S):t.push(S)}function c(u,p,f,y,m,g){let M=o(u,p,f,y,m,g);f.transmission>0?n.unshift(M):f.transparent===!0?s.unshift(M):t.unshift(M)}function h(u,p){t.length>1&&t.sort(u||gy),n.length>1&&n.sort(p||Au),s.length>1&&s.sort(p||Au)}function d(){for(let u=e,p=i.length;u<p;u++){let f=i[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:d,sort:h}}function xy(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new Cu,i.set(n,[a])):s>=r.length?(a=new Cu,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function yy(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new B,color:new Qe};break;case"SpotLight":t={position:new B,direction:new B,color:new Qe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new B,color:new Qe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new B,skyColor:new Qe,groundColor:new Qe};break;case"RectAreaLight":t={color:new Qe,position:new B,halfWidth:new B,halfHeight:new B};break}return i[e.id]=t,t}}}function _y(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ye};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ye};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ye,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var vy=0;function by(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function My(i){let e=new yy,t=_y(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new B);let s=new B,r=new ft,a=new ft;function o(c){let h=0,d=0,u=0;for(let L=0;L<9;L++)n.probe[L].set(0,0,0);let p=0,f=0,y=0,m=0,g=0,M=0,S=0,v=0,E=0,w=0,P=0,_=0,A=0,N=0;c.sort(by);for(let L=0,z=c.length;L<z;L++){let I=c[L],R=I.color,k=I.intensity,H=I.distance,J=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===bi?J=I.shadow.map.texture:J=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=R.r*k,d+=R.g*k,u+=R.b*k;else if(I.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(I.sh.coefficients[G],k);N++}else if(I.isSunLight){let G=e.get(I);if(G.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let F=I.shadow,Y=t.get(I);Y.shadowIntensity=F.intensity,Y.shadowBias=F.bias,Y.shadowNormalBias=F.normalBias,Y.shadowRadius=F.radius,Y.shadowMapSize.copy(F.mapSize).multiply(F.getFrameExtents()),n.sunShadow[f]=Y,n.sunShadowMap[f]=J;let le=F.getViewportCount();for(let ae=0;ae<le;ae++)n.sunShadowMatrix[y+ae]=F.getMatrix(ae),n.sunShadowCascade[y+ae]=F._cascadeData[ae];y+=le,f++}n.sun[p]=G,p++}else if(I.isDirectionalLight){let G=e.get(I);if(G.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let F=I.shadow,Y=t.get(I);Y.shadowIntensity=F.intensity,Y.shadowBias=F.bias,Y.shadowNormalBias=F.normalBias,Y.shadowRadius=F.radius,Y.shadowMapSize=F.mapSize,n.directionalShadow[m]=Y,n.directionalShadowMap[m]=J,n.directionalShadowMatrix[m]=I.shadow.matrix,E++}n.directional[m]=G,m++}else if(I.isSpotLight){let G=e.get(I);G.position.setFromMatrixPosition(I.matrixWorld),G.color.copy(R).multiplyScalar(k),G.distance=H,G.coneCos=Math.cos(I.angle),G.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),G.decay=I.decay,n.spot[M]=G;let F=I.shadow;if(I.map&&(n.spotLightMap[_]=I.map,_++,F.updateMatrices(I),I.castShadow&&A++),n.spotLightMatrix[M]=F.matrix,I.castShadow){let Y=t.get(I);Y.shadowIntensity=F.intensity,Y.shadowBias=F.bias,Y.shadowNormalBias=F.normalBias,Y.shadowRadius=F.radius,Y.shadowMapSize=F.mapSize,n.spotShadow[M]=Y,n.spotShadowMap[M]=J,P++}M++}else if(I.isRectAreaLight){let G=e.get(I);G.color.copy(R).multiplyScalar(k),G.halfWidth.set(I.width*.5,0,0),G.halfHeight.set(0,I.height*.5,0),n.rectArea[S]=G,S++}else if(I.isPointLight){let G=e.get(I);if(G.color.copy(I.color).multiplyScalar(I.intensity),G.distance=I.distance,G.decay=I.decay,I.castShadow){let F=I.shadow,Y=t.get(I);Y.shadowIntensity=F.intensity,Y.shadowBias=F.bias,Y.shadowNormalBias=F.normalBias,Y.shadowRadius=F.radius,Y.shadowMapSize=F.mapSize,Y.shadowCameraNear=F.camera.near,Y.shadowCameraFar=F.camera.far,n.pointShadow[g]=Y,n.pointShadowMap[g]=J,n.pointShadowMatrix[g]=I.shadow.matrix,w++}n.point[g]=G,g++}else if(I.isHemisphereLight){let G=e.get(I);G.skyColor.copy(I.color).multiplyScalar(k),G.groundColor.copy(I.groundColor).multiplyScalar(k),n.hemi[v]=G,v++}}S>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ve.LTC_FLOAT_1,n.rectAreaLTC2=ve.LTC_FLOAT_2):(n.rectAreaLTC1=ve.LTC_HALF_1,n.rectAreaLTC2=ve.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;let T=n.hash;(T.sunLength!==p||T.directionalLength!==m||T.pointLength!==g||T.spotLength!==M||T.rectAreaLength!==S||T.hemiLength!==v||T.numSunShadows!==f||T.numDirectionalShadows!==E||T.numPointShadows!==w||T.numSpotShadows!==P||T.numSpotMaps!==_||T.numLightProbes!==N)&&(n.sun.length=p,n.directional.length=m,n.spot.length=M,n.rectArea.length=S,n.point.length=g,n.hemi.length=v,n.sunShadow.length=f,n.sunShadowMap.length=f,n.sunShadowMatrix.length=y,n.sunShadowCascade.length=y,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=w,n.pointShadowMap.length=w,n.pointShadowMatrix.length=w,n.spotShadow.length=P,n.spotShadowMap.length=P,n.spotLightMatrix.length=P+_-A,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=N,T.sunLength=p,T.directionalLength=m,T.pointLength=g,T.spotLength=M,T.rectAreaLength=S,T.hemiLength=v,T.numSunShadows=f,T.numDirectionalShadows=E,T.numPointShadows=w,T.numSpotShadows=P,T.numSpotMaps=_,T.numLightProbes=N,n.version=vy++)}function l(c,h){let d=0,u=0,p=0,f=0,y=0,m=0,g=h.matrixWorldInverse;for(let M=0,S=c.length;M<S;M++){let v=c[M];if(v.isSunLight){let E=n.sun[d];E.direction.setFromMatrixPosition(v.matrixWorld),E.direction.transformDirection(g),d++}else if(v.isDirectionalLight){let E=n.directional[u];E.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),u++}else if(v.isSpotLight){let E=n.spot[f];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(g),E.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),f++}else if(v.isRectAreaLight){let E=n.rectArea[y];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(g),a.identity(),r.copy(v.matrixWorld),r.premultiply(g),a.extractRotation(r),E.halfWidth.set(v.width*.5,0,0),E.halfHeight.set(0,v.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),y++}else if(v.isPointLight){let E=n.point[p];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(g),p++}else if(v.isHemisphereLight){let E=n.hemi[m];E.direction.setFromMatrixPosition(v.matrixWorld),E.direction.transformDirection(g),m++}}}return{setup:o,setupView:l,state:n}}function Ru(i){let e=new My(i),t=[],n=[],s=[];function r(u){d.camera=u,t.length=0,n.length=0,s.length=0}function a(u){t.push(u)}function o(u){n.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function h(u){e.setupView(t,u)}let d={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Sy(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Ru(i),e.set(s,[o])):r>=a.length?(o=new Ru(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var wy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ey=`uniform sampler2D shadow_pass;
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
}`,Ty=[new B(1,0,0),new B(-1,0,0),new B(0,1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1)],Ay=[new B(0,-1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1),new B(0,-1,0),new B(0,-1,0)],Iu=new ft,Wr=new B,$c=new B;function Cy(i,e,t){let n=new bs,s=new ye,r=new ye,a=new bt,o=new no,l=new io,c={},h=t.maxTextureSize,d={[yi]:Yt,[Yt]:yi,[kn]:kn},u=new an({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ye},radius:{value:4}},vertexShader:wy,fragmentShader:Ey}),p=u.clone();p.defines.HORIZONTAL_PASS=1;let f=new Qt;f.setAttribute("position",new sn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Wt(f,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Nr;let g=this.type;this.render=function(w,P,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;this.type===yo&&(Ge("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Nr);let A=i.getRenderTarget(),N=i.getActiveCubeFace(),T=i.getActiveMipmapLevel(),L=i.state;L.setBlending(Fn),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let z=g!==this.type;z&&P.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(R=>R.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,R=w.length;I<R;I++){let k=w[I],H=k.shadow;if(H===void 0){Ge("WebGLShadowMap:",k,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);let J=H.getFrameExtents();s.multiply(J),r.copy(H.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/J.x),s.x=r.x*J.x,H.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/J.y),s.y=r.y*J.y,H.mapSize.y=r.y));let G=i.state.buffers.depth.getReversed();if(H.camera._reversedDepth=G,H.map===null||z===!0){if(H.map!==null&&(H.map.depthTexture!==null&&(H.map.depthTexture.dispose(),H.map.depthTexture=null),H.map.dispose()),this.type===As){if(k.isPointLight){Ge("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}H.map=new Kt(s.x,s.y,{format:bi,type:wn,minFilter:Pt,magFilter:Pt,generateMipmaps:!1}),H.map.texture.name=k.name+".shadowMap",H.map.depthTexture=new fi(s.x,s.y,un),H.map.depthTexture.name=k.name+".shadowMapDepth",H.map.depthTexture.format=Pn,H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=Ft,H.map.depthTexture.magFilter=Ft}else k.isPointLight?(H.map=new dl(s.x),H.map.depthTexture=new $a(s.x,Sn)):(H.map=new Kt(s.x,s.y),H.map.depthTexture=new fi(s.x,s.y,Sn)),H.map.depthTexture.name=k.name+".shadowMap",H.map.depthTexture.format=Pn,this.type===Nr?(H.map.depthTexture.compareFunction=G?ol:al,H.map.depthTexture.minFilter=Pt,H.map.depthTexture.magFilter=Pt):(H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=Ft,H.map.depthTexture.magFilter=Ft);H.camera.updateProjectionMatrix()}H.map.isWebGLCubeRenderTarget!==!0&&(H.map.width!==s.x||H.map.height!==s.y)&&H.map.setSize(s.x,s.y);let F=H.map.isWebGLCubeRenderTarget?6:H.getViewportCount();k.isPointLight!==!0&&H.updateMatrices(k,_);for(let Y=0;Y<F;Y++){let le=H.getCamera(Y);if(k.isPointLight){let ae=H.camera,qe=H.matrix,He=k.distance||ae.far;He!==ae.far&&(ae.far=He,ae.updateProjectionMatrix()),Wr.setFromMatrixPosition(k.matrixWorld),ae.position.copy(Wr),$c.copy(ae.position),$c.add(Ty[Y]),ae.up.copy(Ay[Y]),ae.lookAt($c),ae.updateMatrixWorld(),qe.makeTranslation(-Wr.x,-Wr.y,-Wr.z),Iu.multiplyMatrices(ae.projectionMatrix,ae.matrixWorldInverse),H._frustum.setFromProjectionMatrix(Iu,ae.coordinateSystem,ae.reversedDepth)}if(H.map.isWebGLCubeRenderTarget)i.setRenderTarget(H.map,Y),i.clear();else{Y===0&&(i.setRenderTarget(H.map),i.clear());let ae=H.getViewport(Y);a.set(r.x*ae.x,r.y*ae.y,r.x*ae.z,r.y*ae.w),L.viewport(a)}n=H.getFrustum(Y),v(P,_,le,k,this.type)}H.isPointLightShadow!==!0&&this.type===As&&M(H,_),H.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(A,N,T)};function M(w,P){let _=e.update(y);u.defines.VSM_SAMPLES!==w.blurSamples&&(u.defines.VSM_SAMPLES=w.blurSamples,p.defines.VSM_SAMPLES=w.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),w.mapPass===null?w.mapPass=new Kt(s.x,s.y,{format:bi,type:wn}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),u.uniforms.shadow_pass.value=w.map.depthTexture,u.uniforms.resolution.value.set(w.map.width,w.map.height),u.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(P,null,_,u,y,null),p.uniforms.shadow_pass.value=w.mapPass.texture,p.uniforms.resolution.value.set(w.map.width,w.map.height),p.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(P,null,_,p,y,null)}function S(w,P,_,A){let N=null,T=_.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(T!==void 0)N=T;else if(N=_.isPointLight===!0?l:o,i.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let L=N.uuid,z=P.uuid,I=c[L];I===void 0&&(I={},c[L]=I);let R=I[z];R===void 0&&(R=N.clone(),I[z]=R,P.addEventListener("dispose",E)),N=R}if(N.visible=P.visible,N.wireframe=P.wireframe,A===As?N.side=P.shadowSide!==null?P.shadowSide:P.side:N.side=P.shadowSide!==null?P.shadowSide:d[P.side],N.alphaMap=P.alphaMap,N.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,N.map=P.map,N.clipShadows=P.clipShadows,N.clippingPlanes=P.clippingPlanes,N.clipIntersection=P.clipIntersection,N.displacementMap=P.displacementMap,N.displacementScale=P.displacementScale,N.displacementBias=P.displacementBias,N.wireframeLinewidth=P.wireframeLinewidth,N.linewidth=P.linewidth,_.isPointLight===!0&&N.isMeshDistanceMaterial===!0){let L=i.properties.get(N);L.light=_}return N}function v(w,P,_,A,N){if(w.visible===!1)return;if(w.layers.test(P.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&N===As)&&(!w.frustumCulled||w.intersectsFrustum(n))){w.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,w.matrixWorld);let z=e.update(w),I=w.material;if(Array.isArray(I)){let R=z.groups;for(let k=0,H=R.length;k<H;k++){let J=R[k],G=I[J.materialIndex];if(G&&G.visible){let F=S(w,G,A,N);w.onBeforeShadow(i,w,P,_,z,F,J),i.renderBufferDirect(_,null,z,F,w,J),w.onAfterShadow(i,w,P,_,z,F,J)}}}else if(I.visible){let R=S(w,I,A,N);w.onBeforeShadow(i,w,P,_,z,R,null),i.renderBufferDirect(_,null,z,R,w,null),w.onAfterShadow(i,w,P,_,z,R,null)}}let L=w.children;for(let z=0,I=L.length;z<I;z++)v(L[z],P,_,A,N)}function E(w){w.target.removeEventListener("dispose",E);for(let _ in c){let A=c[_],N=w.target.uuid;N in A&&(A[N].dispose(),delete A[N])}}}function Ry(i,e){function t(){let O=!1,ge=new bt,ne=null,xe=new bt(0,0,0,0);return{setMask:function(Se){ne!==Se&&!O&&(i.colorMask(Se,Se,Se,Se),ne=Se)},setLocked:function(Se){O=Se},setClear:function(Se,se,Ue,Ie,mt){mt===!0&&(Se*=Ie,se*=Ie,Ue*=Ie),ge.set(Se,se,Ue,Ie),xe.equals(ge)===!1&&(i.clearColor(Se,se,Ue,Ie),xe.copy(ge))},reset:function(){O=!1,ne=null,xe.set(-1,0,0,0)}}}function n(){let O=!1,ge=!1,ne=null,xe=null,Se=null;return{setReversed:function(se){if(ge!==se){let Ue=e.get("EXT_clip_control");se?Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.ZERO_TO_ONE_EXT):Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.NEGATIVE_ONE_TO_ONE_EXT),ge=se;let Ie=Se;Se=null,this.setClear(Ie)}},getReversed:function(){return ge},setTest:function(se){se?ee(i.DEPTH_TEST):fe(i.DEPTH_TEST)},setMask:function(se){ne!==se&&!O&&(i.depthMask(se),ne=se)},setFunc:function(se){if(ge&&(se=tu[se]),xe!==se){switch(se){case Da:i.depthFunc(i.NEVER);break;case Ua:i.depthFunc(i.ALWAYS);break;case ka:i.depthFunc(i.LESS);break;case ms:i.depthFunc(i.LEQUAL);break;case Fa:i.depthFunc(i.EQUAL);break;case Oa:i.depthFunc(i.GEQUAL);break;case Ba:i.depthFunc(i.GREATER);break;case za:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}xe=se}},setLocked:function(se){O=se},setClear:function(se){Se!==se&&(Se=se,ge&&(se=1-se),i.clearDepth(se))},reset:function(){O=!1,ne=null,xe=null,Se=null,ge=!1}}}function s(){let O=!1,ge=null,ne=null,xe=null,Se=null,se=null,Ue=null,Ie=null,mt=null;return{setTest:function(lt){O||(lt?ee(i.STENCIL_TEST):fe(i.STENCIL_TEST))},setMask:function(lt){ge!==lt&&!O&&(i.stencilMask(lt),ge=lt)},setFunc:function(lt,mn,An){(ne!==lt||xe!==mn||Se!==An)&&(i.stencilFunc(lt,mn,An),ne=lt,xe=mn,Se=An)},setOp:function(lt,mn,An){(se!==lt||Ue!==mn||Ie!==An)&&(i.stencilOp(lt,mn,An),se=lt,Ue=mn,Ie=An)},setLocked:function(lt){O=lt},setClear:function(lt){mt!==lt&&(i.clearStencil(lt),mt=lt)},reset:function(){O=!1,ge=null,ne=null,xe=null,Se=null,se=null,Ue=null,Ie=null,mt=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,h={},d={},u={},p=new WeakMap,f=[],y=null,m=!1,g=null,M=null,S=null,v=null,E=null,w=null,P=null,_=new Qe(0,0,0),A=0,N=!1,T=null,L=null,z=null,I=null,R=null,k=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),H=!1,J=0,G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(J=parseFloat(/^WebGL (\d)/.exec(G)[1]),H=J>=1):G.indexOf("OpenGL ES")!==-1&&(J=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),H=J>=2);let F=null,Y={},le=i.getParameter(i.SCISSOR_BOX),ae=i.getParameter(i.VIEWPORT),qe=new bt().fromArray(le),He=new bt().fromArray(ae);function $e(O,ge,ne,xe){let Se=new Uint8Array(4),se=i.createTexture();i.bindTexture(O,se),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ue=0;Ue<ne;Ue++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(ge,0,i.RGBA,1,1,xe,0,i.RGBA,i.UNSIGNED_BYTE,Se):i.texImage2D(ge+Ue,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Se);return se}let $={};$[i.TEXTURE_2D]=$e(i.TEXTURE_2D,i.TEXTURE_2D,1),$[i.TEXTURE_CUBE_MAP]=$e(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),$[i.TEXTURE_2D_ARRAY]=$e(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),$[i.TEXTURE_3D]=$e(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ee(i.DEPTH_TEST),a.setFunc(ms),ce(!1),ue(gc),ee(i.CULL_FACE),j(Fn);function ee(O){h[O]!==!0&&(i.enable(O),h[O]=!0)}function fe(O){h[O]!==!1&&(i.disable(O),h[O]=!1)}function Oe(O,ge){return u[O]!==ge?(i.bindFramebuffer(O,ge),u[O]=ge,O===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ge),O===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ge),!0):!1}function we(O,ge){let ne=f,xe=!1;if(O){ne=p.get(ge),ne===void 0&&(ne=[],p.set(ge,ne));let Se=O.textures;if(ne.length!==Se.length||ne[0]!==i.COLOR_ATTACHMENT0){for(let se=0,Ue=Se.length;se<Ue;se++)ne[se]=i.COLOR_ATTACHMENT0+se;ne.length=Se.length,xe=!0}}else ne[0]!==i.BACK&&(ne[0]=i.BACK,xe=!0);xe&&i.drawBuffers(ne)}function oe(O){return y!==O?(i.useProgram(O),y=O,!0):!1}let Le={[Vi]:i.FUNC_ADD,[Md]:i.FUNC_SUBTRACT,[Sd]:i.FUNC_REVERSE_SUBTRACT};Le[wd]=i.MIN,Le[Ed]=i.MAX;let te={[Td]:i.ZERO,[Ad]:i.ONE,[Cd]:i.SRC_COLOR,[vc]:i.SRC_ALPHA,[Dd]:i.SRC_ALPHA_SATURATE,[Ld]:i.DST_COLOR,[Id]:i.DST_ALPHA,[Rd]:i.ONE_MINUS_SRC_COLOR,[bc]:i.ONE_MINUS_SRC_ALPHA,[Nd]:i.ONE_MINUS_DST_COLOR,[Pd]:i.ONE_MINUS_DST_ALPHA,[Ud]:i.CONSTANT_COLOR,[kd]:i.ONE_MINUS_CONSTANT_COLOR,[Fd]:i.CONSTANT_ALPHA,[Od]:i.ONE_MINUS_CONSTANT_ALPHA};function j(O,ge,ne,xe,Se,se,Ue,Ie,mt,lt){if(O===Fn){m===!0&&(fe(i.BLEND),m=!1);return}if(m===!1&&(ee(i.BLEND),m=!0),O!==bd){if(O!==g||lt!==N){if((M!==Vi||E!==Vi)&&(i.blendEquation(i.FUNC_ADD),M=Vi,E=Vi),lt)switch(O){case Cs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case xc:i.blendFunc(i.ONE,i.ONE);break;case yc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case _c:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:We("WebGLState: Invalid blending: ",O);break}else switch(O){case Cs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case xc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case yc:We("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case _c:We("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:We("WebGLState: Invalid blending: ",O);break}S=null,v=null,w=null,P=null,_.set(0,0,0),A=0,g=O,N=lt}return}Se=Se||ge,se=se||ne,Ue=Ue||xe,(ge!==M||Se!==E)&&(i.blendEquationSeparate(Le[ge],Le[Se]),M=ge,E=Se),(ne!==S||xe!==v||se!==w||Ue!==P)&&(i.blendFuncSeparate(te[ne],te[xe],te[se],te[Ue]),S=ne,v=xe,w=se,P=Ue),(Ie.equals(_)===!1||mt!==A)&&(i.blendColor(Ie.r,Ie.g,Ie.b,mt),_.copy(Ie),A=mt),g=O,N=!1}function re(O,ge){O.side===kn?fe(i.CULL_FACE):ee(i.CULL_FACE);let ne=O.side===Yt;ge&&(ne=!ne),ce(ne),O.blending===Cs&&O.transparent===!1?j(Fn):j(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),a.setFunc(O.depthFunc),a.setTest(O.depthTest),a.setMask(O.depthWrite),r.setMask(O.colorWrite);let xe=O.stencilWrite;o.setTest(xe),xe&&(o.setMask(O.stencilWriteMask),o.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),o.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),ke(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):fe(i.SAMPLE_ALPHA_TO_COVERAGE)}function ce(O){T!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),T=O)}function ue(O){O!==_d?(ee(i.CULL_FACE),O!==L&&(O===gc?i.cullFace(i.BACK):O===vd?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):fe(i.CULL_FACE),L=O}function Be(O){O!==z&&(H&&i.lineWidth(O),z=O)}function ke(O,ge,ne){O?(ee(i.POLYGON_OFFSET_FILL),(I!==ge||R!==ne)&&(I=ge,R=ne,a.getReversed()&&(ge=-ge),i.polygonOffset(ge,ne))):fe(i.POLYGON_OFFSET_FILL)}function Xe(O){O?ee(i.SCISSOR_TEST):fe(i.SCISSOR_TEST)}function Je(O){O===void 0&&(O=i.TEXTURE0+k-1),F!==O&&(i.activeTexture(O),F=O)}function D(O,ge,ne){ne===void 0&&(F===null?ne=i.TEXTURE0+k-1:ne=F);let xe=Y[ne];xe===void 0&&(xe={type:void 0,texture:void 0},Y[ne]=xe),(xe.type!==O||xe.texture!==ge)&&(F!==ne&&(i.activeTexture(ne),F=ne),i.bindTexture(O,ge||$[O]),xe.type=O,xe.texture=ge)}function ot(){let O=Y[F];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function tt(){try{i.compressedTexImage2D(...arguments)}catch(O){We("WebGLState:",O)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(O){We("WebGLState:",O)}}function x(){try{i.texSubImage2D(...arguments)}catch(O){We("WebGLState:",O)}}function V(){try{i.texSubImage3D(...arguments)}catch(O){We("WebGLState:",O)}}function q(){try{i.compressedTexSubImage2D(...arguments)}catch(O){We("WebGLState:",O)}}function K(){try{i.compressedTexSubImage3D(...arguments)}catch(O){We("WebGLState:",O)}}function he(){try{i.texStorage2D(...arguments)}catch(O){We("WebGLState:",O)}}function de(){try{i.texStorage3D(...arguments)}catch(O){We("WebGLState:",O)}}function Q(){try{i.texImage2D(...arguments)}catch(O){We("WebGLState:",O)}}function ie(){try{i.texImage3D(...arguments)}catch(O){We("WebGLState:",O)}}function pe(O){return d[O]!==void 0?d[O]:i.getParameter(O)}function Ne(O,ge){d[O]!==ge&&(i.pixelStorei(O,ge),d[O]=ge)}function _e(O){qe.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),qe.copy(O))}function me(O){He.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),He.copy(O))}function De(O,ge){let ne=c.get(ge);ne===void 0&&(ne=new WeakMap,c.set(ge,ne));let xe=ne.get(O);xe===void 0&&(xe=i.getUniformBlockIndex(ge,O.name),ne.set(O,xe))}function ze(O,ge){let xe=c.get(ge).get(O);l.get(ge)!==xe&&(i.uniformBlockBinding(ge,xe,O.__bindingPointIndex),l.set(ge,xe))}function je(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},d={},F=null,Y={},u={},p=new WeakMap,f=[],y=null,m=!1,g=null,M=null,S=null,v=null,E=null,w=null,P=null,_=new Qe(0,0,0),A=0,N=!1,T=null,L=null,z=null,I=null,R=null,qe.set(0,0,i.canvas.width,i.canvas.height),He.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ee,disable:fe,bindFramebuffer:Oe,drawBuffers:we,useProgram:oe,setBlending:j,setMaterial:re,setFlipSided:ce,setCullFace:ue,setLineWidth:Be,setPolygonOffset:ke,setScissorTest:Xe,activeTexture:Je,bindTexture:D,unbindTexture:ot,compressedTexImage2D:tt,compressedTexImage3D:C,texImage2D:Q,texImage3D:ie,pixelStorei:Ne,getParameter:pe,updateUBOMapping:De,uniformBlockBinding:ze,texStorage2D:he,texStorage3D:de,texSubImage2D:x,texSubImage3D:V,compressedTexSubImage2D:q,compressedTexSubImage3D:K,scissor:_e,viewport:me,reset:je}}function Iy(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ye,h=new WeakMap,d=new Set,u,p=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(C,x){return f?new OffscreenCanvas(C,x):sr("canvas")}function m(C,x,V){let q=1,K=tt(C);if((K.width>V||K.height>V)&&(q=V/Math.max(K.width,K.height)),q<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let he=Math.floor(q*K.width),de=Math.floor(q*K.height);u===void 0&&(u=y(he,de));let Q=x?y(he,de):u;return Q.width=he,Q.height=de,Q.getContext("2d").drawImage(C,0,0,he,de),Ge("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+he+"x"+de+")."),Q}else return"data"in C&&Ge("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),C;return C}function g(C){return C.generateMipmaps}function M(C){i.generateMipmap(C)}function S(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(C,x,V,q,K,he=!1){if(C!==null){if(i[C]!==void 0)return i[C];Ge("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let de;q&&(de=e.get("EXT_texture_norm16"),de||Ge("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=x;if(x===i.RED&&(V===i.FLOAT&&(Q=i.R32F),V===i.HALF_FLOAT&&(Q=i.R16F),V===i.UNSIGNED_BYTE&&(Q=i.R8),V===i.UNSIGNED_SHORT&&de&&(Q=de.R16_EXT),V===i.SHORT&&de&&(Q=de.R16_SNORM_EXT)),x===i.RED_INTEGER&&(V===i.UNSIGNED_BYTE&&(Q=i.R8UI),V===i.UNSIGNED_SHORT&&(Q=i.R16UI),V===i.UNSIGNED_INT&&(Q=i.R32UI),V===i.BYTE&&(Q=i.R8I),V===i.SHORT&&(Q=i.R16I),V===i.INT&&(Q=i.R32I)),x===i.RG&&(V===i.FLOAT&&(Q=i.RG32F),V===i.HALF_FLOAT&&(Q=i.RG16F),V===i.UNSIGNED_BYTE&&(Q=i.RG8),V===i.UNSIGNED_SHORT&&de&&(Q=de.RG16_EXT),V===i.SHORT&&de&&(Q=de.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(V===i.UNSIGNED_BYTE&&(Q=i.RG8UI),V===i.UNSIGNED_SHORT&&(Q=i.RG16UI),V===i.UNSIGNED_INT&&(Q=i.RG32UI),V===i.BYTE&&(Q=i.RG8I),V===i.SHORT&&(Q=i.RG16I),V===i.INT&&(Q=i.RG32I)),x===i.RGB_INTEGER&&(V===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),V===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),V===i.UNSIGNED_INT&&(Q=i.RGB32UI),V===i.BYTE&&(Q=i.RGB8I),V===i.SHORT&&(Q=i.RGB16I),V===i.INT&&(Q=i.RGB32I)),x===i.RGBA_INTEGER&&(V===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),V===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),V===i.UNSIGNED_INT&&(Q=i.RGBA32UI),V===i.BYTE&&(Q=i.RGBA8I),V===i.SHORT&&(Q=i.RGBA16I),V===i.INT&&(Q=i.RGBA32I)),x===i.RGB&&(V===i.UNSIGNED_SHORT&&de&&(Q=de.RGB16_EXT),V===i.SHORT&&de&&(Q=de.RGB16_SNORM_EXT),V===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),V===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),x===i.RGBA){let ie=he?ir:st.getTransfer(K);V===i.FLOAT&&(Q=i.RGBA32F),V===i.HALF_FLOAT&&(Q=i.RGBA16F),V===i.UNSIGNED_BYTE&&(Q=ie===ht?i.SRGB8_ALPHA8:i.RGBA8),V===i.UNSIGNED_SHORT&&de&&(Q=de.RGBA16_EXT),V===i.SHORT&&de&&(Q=de.RGBA16_SNORM_EXT),V===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),V===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function E(C,x){let V;return C?x===null||x===Sn||x===Is?V=i.DEPTH24_STENCIL8:x===un?V=i.DEPTH32F_STENCIL8:x===Rs&&(V=i.DEPTH24_STENCIL8,Ge("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Sn||x===Is?V=i.DEPTH_COMPONENT24:x===un?V=i.DEPTH_COMPONENT32F:x===Rs&&(V=i.DEPTH_COMPONENT16),V}function w(C,x){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==Ft&&C.minFilter!==Pt?Math.log2(Math.max(x.width,x.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?x.mipmaps.length:1}function P(C){let x=C.target;x.removeEventListener("dispose",P),A(x),x.isVideoTexture&&h.delete(x),x.isHTMLTexture&&d.delete(x)}function _(C){let x=C.target;x.removeEventListener("dispose",_),T(x)}function A(C){let x=n.get(C);if(x.__webglInit===void 0)return;let V=C.source,q=p.get(V);if(q){let K=q[x.__cacheKey];K.usedTimes--,K.usedTimes===0&&N(C),Object.keys(q).length===0&&p.delete(V)}n.remove(C)}function N(C){let x=n.get(C);i.deleteTexture(x.__webglTexture);let V=C.source,q=p.get(V);delete q[x.__cacheKey],a.memory.textures--}function T(C){let x=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(x.__webglFramebuffer[q]))for(let K=0;K<x.__webglFramebuffer[q].length;K++)i.deleteFramebuffer(x.__webglFramebuffer[q][K]);else i.deleteFramebuffer(x.__webglFramebuffer[q]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[q])}else{if(Array.isArray(x.__webglFramebuffer))for(let q=0;q<x.__webglFramebuffer.length;q++)i.deleteFramebuffer(x.__webglFramebuffer[q]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let q=0;q<x.__webglColorRenderbuffer.length;q++)x.__webglColorRenderbuffer[q]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[q]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let V=C.textures;for(let q=0,K=V.length;q<K;q++){let he=n.get(V[q]);he.__webglTexture&&(i.deleteTexture(he.__webglTexture),a.memory.textures--),n.remove(V[q])}n.remove(C)}let L=0;function z(){L=0}function I(){return L}function R(C){L=C}function k(){let C=L;return C>=s.maxTextures&&Ge("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),L+=1,C}function H(C){let x=[];return x.push(C.wrapS),x.push(C.wrapT),x.push(C.wrapR||0),x.push(C.magFilter),x.push(C.minFilter),x.push(C.anisotropy),x.push(C.internalFormat),x.push(C.format),x.push(C.type),x.push(C.generateMipmaps),x.push(C.premultiplyAlpha),x.push(C.flipY),x.push(C.unpackAlignment),x.push(C.colorSpace),x.join()}function J(C,x){let V=n.get(C);if(C.isVideoTexture&&D(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&V.__version!==C.version){let q=C.image;if(q===null)Ge("WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)Ge("WebGLRenderer: Texture marked for update but image is incomplete");else{fe(V,C,x);return}}else C.isExternalTexture&&(V.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,V.__webglTexture,i.TEXTURE0+x)}function G(C,x){let V=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&V.__version!==C.version){fe(V,C,x);return}else C.isExternalTexture&&(V.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,V.__webglTexture,i.TEXTURE0+x)}function F(C,x){let V=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&V.__version!==C.version){fe(V,C,x);return}t.bindTexture(i.TEXTURE_3D,V.__webglTexture,i.TEXTURE0+x)}function Y(C,x){let V=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&V.__version!==C.version){Oe(V,C,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,V.__webglTexture,i.TEXTURE0+x)}let le={[gs]:i.REPEAT,[In]:i.CLAMP_TO_EDGE,[Va]:i.MIRRORED_REPEAT},ae={[Ft]:i.NEAREST,[Vd]:i.NEAREST_MIPMAP_NEAREST,[kr]:i.NEAREST_MIPMAP_LINEAR,[Pt]:i.LINEAR,[bo]:i.LINEAR_MIPMAP_NEAREST,[On]:i.LINEAR_MIPMAP_LINEAR},qe={[Xd]:i.NEVER,[Zd]:i.ALWAYS,[qd]:i.LESS,[al]:i.LEQUAL,[Yd]:i.EQUAL,[ol]:i.GEQUAL,[$d]:i.GREATER,[Jd]:i.NOTEQUAL};function He(C,x){if(x.type===un&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Pt||x.magFilter===bo||x.magFilter===kr||x.magFilter===On||x.minFilter===Pt||x.minFilter===bo||x.minFilter===kr||x.minFilter===On)&&Ge("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,le[x.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,le[x.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,le[x.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,ae[x.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,ae[x.minFilter]),x.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,qe[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Ft||x.minFilter!==kr&&x.minFilter!==On||x.type===un&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let V=e.get("EXT_texture_filter_anisotropic");i.texParameterf(C,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function $e(C,x){let V=!1;C.__webglInit===void 0&&(C.__webglInit=!0,x.addEventListener("dispose",P));let q=x.source,K=p.get(q);K===void 0&&(K={},p.set(q,K));let he=H(x);if(he!==C.__cacheKey){K[he]===void 0&&(K[he]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,V=!0),K[he].usedTimes++;let de=K[C.__cacheKey];de!==void 0&&(K[C.__cacheKey].usedTimes--,de.usedTimes===0&&N(x)),C.__cacheKey=he,C.__webglTexture=K[he].texture}return V}function $(C,x,V){return Math.floor(Math.floor(C/V)/x)}function ee(C,x,V,q){let he=C.updateRanges;if(he.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,V,q,x.data);else{he.sort((Ne,_e)=>Ne.start-_e.start);let de=0;for(let Ne=1;Ne<he.length;Ne++){let _e=he[de],me=he[Ne],De=_e.start+_e.count,ze=$(me.start,x.width,4),je=$(_e.start,x.width,4);me.start<=De+1&&ze===je&&$(me.start+me.count-1,x.width,4)===ze?_e.count=Math.max(_e.count,me.start+me.count-_e.start):(++de,he[de]=me)}he.length=de+1;let Q=t.getParameter(i.UNPACK_ROW_LENGTH),ie=t.getParameter(i.UNPACK_SKIP_PIXELS),pe=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let Ne=0,_e=he.length;Ne<_e;Ne++){let me=he[Ne],De=Math.floor(me.start/4),ze=Math.ceil(me.count/4),je=De%x.width,O=Math.floor(De/x.width),ge=ze,ne=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,je),t.pixelStorei(i.UNPACK_SKIP_ROWS,O),t.texSubImage2D(i.TEXTURE_2D,0,je,O,ge,ne,V,q,x.data)}C.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Q),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ie),t.pixelStorei(i.UNPACK_SKIP_ROWS,pe)}}function fe(C,x,V){let q=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(q=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(q=i.TEXTURE_3D);let K=$e(C,x),he=x.source;t.bindTexture(q,C.__webglTexture,i.TEXTURE0+V);let de=n.get(he);if(he.version!==de.__version||K===!0){if(t.activeTexture(i.TEXTURE0+V),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let ne=st.getPrimaries(st.workingColorSpace),xe=x.colorSpace===Qn?null:st.getPrimaries(x.colorSpace),Se=x.colorSpace===Qn||ne===xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let ie=m(x.image,!1,s.maxTextureSize);ie=ot(x,ie);let pe=r.convert(x.format,x.colorSpace),Ne=r.convert(x.type),_e=v(x.internalFormat,pe,Ne,x.normalized,x.colorSpace,x.isVideoTexture);He(q,x);let me,De=x.mipmaps,ze=x.isVideoTexture!==!0,je=de.__version===void 0||K===!0,O=he.dataReady,ge=w(x,ie);if(x.isDepthTexture)_e=E(x.format===vi,x.type),je&&(ze?t.texStorage2D(i.TEXTURE_2D,1,_e,ie.width,ie.height):t.texImage2D(i.TEXTURE_2D,0,_e,ie.width,ie.height,0,pe,Ne,null));else if(x.isDataTexture)if(De.length>0){ze&&je&&t.texStorage2D(i.TEXTURE_2D,ge,_e,De[0].width,De[0].height);for(let ne=0,xe=De.length;ne<xe;ne++)me=De[ne],ze?O&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,me.width,me.height,pe,Ne,me.data):t.texImage2D(i.TEXTURE_2D,ne,_e,me.width,me.height,0,pe,Ne,me.data);x.generateMipmaps=!1}else ze?(je&&t.texStorage2D(i.TEXTURE_2D,ge,_e,ie.width,ie.height),O&&ee(x,ie,pe,Ne)):t.texImage2D(i.TEXTURE_2D,0,_e,ie.width,ie.height,0,pe,Ne,ie.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){ze&&je&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,_e,De[0].width,De[0].height,ie.depth);for(let ne=0,xe=De.length;ne<xe;ne++)if(me=De[ne],x.format!==fn)if(pe!==null)if(ze){if(O)if(x.layerUpdates.size>0){let Se=Gc(me.width,me.height,x.format,x.type);for(let se of x.layerUpdates){let Ue=me.data.subarray(se*Se/me.data.BYTES_PER_ELEMENT,(se+1)*Se/me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,se,me.width,me.height,1,pe,Ue)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,0,me.width,me.height,ie.depth,pe,me.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ne,_e,me.width,me.height,ie.depth,0,me.data,0,0);else Ge("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ze?O&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,0,me.width,me.height,ie.depth,pe,Ne,me.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ne,_e,me.width,me.height,ie.depth,0,pe,Ne,me.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{ze&&je&&t.texStorage2D(i.TEXTURE_2D,ge,_e,De[0].width,De[0].height);for(let ne=0,xe=De.length;ne<xe;ne++)me=De[ne],x.format!==fn?pe!==null?ze?O&&t.compressedTexSubImage2D(i.TEXTURE_2D,ne,0,0,me.width,me.height,pe,me.data):t.compressedTexImage2D(i.TEXTURE_2D,ne,_e,me.width,me.height,0,me.data):Ge("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ze?O&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,me.width,me.height,pe,Ne,me.data):t.texImage2D(i.TEXTURE_2D,ne,_e,me.width,me.height,0,pe,Ne,me.data)}else if(x.isDataArrayTexture)if(ze){if(je&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,_e,ie.width,ie.height,ie.depth),O)if(x.layerUpdates.size>0){let ne=Gc(ie.width,ie.height,x.format,x.type);for(let xe of x.layerUpdates){let Se=ie.data.subarray(xe*ne/ie.data.BYTES_PER_ELEMENT,(xe+1)*ne/ie.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,xe,ie.width,ie.height,1,pe,Ne,Se)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ie.width,ie.height,ie.depth,pe,Ne,ie.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,_e,ie.width,ie.height,ie.depth,0,pe,Ne,ie.data);else if(x.isData3DTexture)ze?(je&&t.texStorage3D(i.TEXTURE_3D,ge,_e,ie.width,ie.height,ie.depth),O&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ie.width,ie.height,ie.depth,pe,Ne,ie.data)):t.texImage3D(i.TEXTURE_3D,0,_e,ie.width,ie.height,ie.depth,0,pe,Ne,ie.data);else if(x.isFramebufferTexture){if(je)if(ze)t.texStorage2D(i.TEXTURE_2D,ge,_e,ie.width,ie.height);else{let ne=ie.width,xe=ie.height;for(let Se=0;Se<ge;Se++)t.texImage2D(i.TEXTURE_2D,Se,_e,ne,xe,0,pe,Ne,null),ne>>=1,xe>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){let ne=i.canvas;if(ne.hasAttribute("layoutsubtree")||ne.setAttribute("layoutsubtree","true"),ie.parentNode!==ne){ne.appendChild(ie),d.add(x),ne.onpaint=xe=>{let Se=xe.changedElements;for(let se of d)Se.includes(se.image)&&(se.needsUpdate=!0)},ne.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ie);else{let Se=i.RGBA,se=i.RGBA,Ue=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Se,se,Ue,ie)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(De.length>0){if(ze&&je){let ne=tt(De[0]);t.texStorage2D(i.TEXTURE_2D,ge,_e,ne.width,ne.height)}for(let ne=0,xe=De.length;ne<xe;ne++)me=De[ne],ze?O&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,pe,Ne,me):t.texImage2D(i.TEXTURE_2D,ne,_e,pe,Ne,me);x.generateMipmaps=!1}else if(ze){if(je){let ne=tt(ie);t.texStorage2D(i.TEXTURE_2D,ge,_e,ne.width,ne.height)}O&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,pe,Ne,ie)}else t.texImage2D(i.TEXTURE_2D,0,_e,pe,Ne,ie);g(x)&&M(q),de.__version=he.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Oe(C,x,V){if(x.image.length!==6)return;let q=$e(C,x),K=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+V);let he=n.get(K);if(K.version!==he.__version||q===!0){t.activeTexture(i.TEXTURE0+V);let de=st.getPrimaries(st.workingColorSpace),Q=x.colorSpace===Qn?null:st.getPrimaries(x.colorSpace),ie=x.colorSpace===Qn||de===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ie);let pe=x.isCompressedTexture||x.image[0].isCompressedTexture,Ne=x.image[0]&&x.image[0].isDataTexture,_e=[];for(let se=0;se<6;se++)!pe&&!Ne?_e[se]=m(x.image[se],!0,s.maxCubemapSize):_e[se]=Ne?x.image[se].image:x.image[se],_e[se]=ot(x,_e[se]);let me=_e[0],De=r.convert(x.format,x.colorSpace),ze=r.convert(x.type),je=v(x.internalFormat,De,ze,x.normalized,x.colorSpace),O=x.isVideoTexture!==!0,ge=he.__version===void 0||q===!0,ne=K.dataReady,xe=w(x,me);He(i.TEXTURE_CUBE_MAP,x);let Se;if(pe){O&&ge&&t.texStorage2D(i.TEXTURE_CUBE_MAP,xe,je,me.width,me.height);for(let se=0;se<6;se++){Se=_e[se].mipmaps;for(let Ue=0;Ue<Se.length;Ue++){let Ie=Se[Ue];x.format!==fn?De!==null?O?ne&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ue,0,0,Ie.width,Ie.height,De,Ie.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ue,je,Ie.width,Ie.height,0,Ie.data):Ge("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ue,0,0,Ie.width,Ie.height,De,ze,Ie.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ue,je,Ie.width,Ie.height,0,De,ze,Ie.data)}}}else{if(Se=x.mipmaps,O&&ge){Se.length>0&&xe++;let se=tt(_e[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,xe,je,se.width,se.height)}for(let se=0;se<6;se++)if(Ne){O?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,_e[se].width,_e[se].height,De,ze,_e[se].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,je,_e[se].width,_e[se].height,0,De,ze,_e[se].data);for(let Ue=0;Ue<Se.length;Ue++){let mt=Se[Ue].image[se].image;O?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ue+1,0,0,mt.width,mt.height,De,ze,mt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ue+1,je,mt.width,mt.height,0,De,ze,mt.data)}}else{O?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,De,ze,_e[se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,je,De,ze,_e[se]);for(let Ue=0;Ue<Se.length;Ue++){let Ie=Se[Ue];O?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ue+1,0,0,De,ze,Ie.image[se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ue+1,je,De,ze,Ie.image[se])}}}g(x)&&M(i.TEXTURE_CUBE_MAP),he.__version=K.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function we(C,x,V,q,K,he){let de=r.convert(V.format,V.colorSpace),Q=r.convert(V.type),ie=v(V.internalFormat,de,Q,V.normalized,V.colorSpace),pe=n.get(x),Ne=n.get(V);if(Ne.__renderTarget=x,!pe.__hasExternalTextures){let _e=Math.max(1,x.width>>he),me=Math.max(1,x.height>>he);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?t.texImage3D(K,he,ie,_e,me,x.depth,0,de,Q,null):t.texImage2D(K,he,ie,_e,me,0,de,Q,null)}t.bindFramebuffer(i.FRAMEBUFFER,C),Je(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,q,K,Ne.__webglTexture,0,Xe(x)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,q,K,Ne.__webglTexture,he),t.bindFramebuffer(i.FRAMEBUFFER,null)}function oe(C,x,V){if(i.bindRenderbuffer(i.RENDERBUFFER,C),x.depthBuffer){let q=x.depthTexture,K=q&&q.isDepthTexture?q.type:null,he=E(x.stencilBuffer,K),de=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Je(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Xe(x),he,x.width,x.height):V?i.renderbufferStorageMultisample(i.RENDERBUFFER,Xe(x),he,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,he,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,de,i.RENDERBUFFER,C)}else{let q=x.textures;for(let K=0;K<q.length;K++){let he=q[K],de=r.convert(he.format,he.colorSpace),Q=r.convert(he.type),ie=v(he.internalFormat,de,Q,he.normalized,he.colorSpace);Je(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Xe(x),ie,x.width,x.height):V?i.renderbufferStorageMultisample(i.RENDERBUFFER,Xe(x),ie,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ie,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Le(C,x,V){let q=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,C),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let K=n.get(x.depthTexture);if(K.__renderTarget=x,(!K.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),q){if(K.__webglInit===void 0&&(K.__webglInit=!0,x.depthTexture.addEventListener("dispose",P)),K.__webglTexture===void 0){K.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),He(i.TEXTURE_CUBE_MAP,x.depthTexture);let pe=r.convert(x.depthTexture.format),Ne=r.convert(x.depthTexture.type),_e;x.depthTexture.format===Pn?_e=i.DEPTH_COMPONENT24:x.depthTexture.format===vi&&(_e=i.DEPTH24_STENCIL8);for(let me=0;me<6;me++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,_e,x.width,x.height,0,pe,Ne,null)}}else J(x.depthTexture,0);let he=K.__webglTexture,de=Xe(x),Q=q?i.TEXTURE_CUBE_MAP_POSITIVE_X+V:i.TEXTURE_2D,ie=x.depthTexture.format===vi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===Pn)Je(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ie,Q,he,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,ie,Q,he,0);else if(x.depthTexture.format===vi)Je(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ie,Q,he,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,ie,Q,he,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function te(C){let x=n.get(C),V=C.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==C.depthTexture){let q=C.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),q){let K=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,q.removeEventListener("dispose",K)};q.addEventListener("dispose",K),x.__depthDisposeCallback=K}x.__boundDepthTexture=q}if(C.depthTexture&&!x.__autoAllocateDepthBuffer)if(V)for(let q=0;q<6;q++)Le(x.__webglFramebuffer[q],C,q);else{let q=C.texture.mipmaps;q&&q.length>0?Le(x.__webglFramebuffer[0],C,0):Le(x.__webglFramebuffer,C,0)}else if(V){x.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[q]),x.__webglDepthbuffer[q]===void 0)x.__webglDepthbuffer[q]=i.createRenderbuffer(),oe(x.__webglDepthbuffer[q],C,!1);else{let K=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,he=x.__webglDepthbuffer[q];i.bindRenderbuffer(i.RENDERBUFFER,he),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,he)}}else{let q=C.texture.mipmaps;if(q&&q.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),oe(x.__webglDepthbuffer,C,!1);else{let K=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,he=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,he),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,he)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function j(C,x,V){let q=n.get(C);x!==void 0&&we(q.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),V!==void 0&&te(C)}function re(C){let x=C.texture,V=n.get(C),q=n.get(x);C.addEventListener("dispose",_);let K=C.textures,he=C.isWebGLCubeRenderTarget===!0,de=K.length>1;if(de||(q.__webglTexture===void 0&&(q.__webglTexture=i.createTexture()),q.__version=x.version,a.memory.textures++),he){V.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(x.mipmaps&&x.mipmaps.length>0){V.__webglFramebuffer[Q]=[];for(let ie=0;ie<x.mipmaps.length;ie++)V.__webglFramebuffer[Q][ie]=i.createFramebuffer()}else V.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){V.__webglFramebuffer=[];for(let Q=0;Q<x.mipmaps.length;Q++)V.__webglFramebuffer[Q]=i.createFramebuffer()}else V.__webglFramebuffer=i.createFramebuffer();if(de)for(let Q=0,ie=K.length;Q<ie;Q++){let pe=n.get(K[Q]);pe.__webglTexture===void 0&&(pe.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&Je(C)===!1){V.__webglMultisampledFramebuffer=i.createFramebuffer(),V.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let Q=0;Q<K.length;Q++){let ie=K[Q];V.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,V.__webglColorRenderbuffer[Q]);let pe=r.convert(ie.format,ie.colorSpace),Ne=r.convert(ie.type),_e=v(ie.internalFormat,pe,Ne,ie.normalized,ie.colorSpace,C.isXRRenderTarget===!0),me=Xe(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,me,_e,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,V.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(V.__webglDepthRenderbuffer=i.createRenderbuffer(),oe(V.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(he){t.bindTexture(i.TEXTURE_CUBE_MAP,q.__webglTexture),He(i.TEXTURE_CUBE_MAP,x);for(let Q=0;Q<6;Q++)if(x.mipmaps&&x.mipmaps.length>0)for(let ie=0;ie<x.mipmaps.length;ie++)we(V.__webglFramebuffer[Q][ie],C,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ie);else we(V.__webglFramebuffer[Q],C,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);g(x)&&M(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(de){for(let Q=0,ie=K.length;Q<ie;Q++){let pe=K[Q],Ne=n.get(pe),_e=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(_e=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(_e,Ne.__webglTexture),He(_e,pe),we(V.__webglFramebuffer,C,pe,i.COLOR_ATTACHMENT0+Q,_e,0),g(pe)&&M(_e)}t.unbindTexture()}else{let Q=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Q=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Q,q.__webglTexture),He(Q,x),x.mipmaps&&x.mipmaps.length>0)for(let ie=0;ie<x.mipmaps.length;ie++)we(V.__webglFramebuffer[ie],C,x,i.COLOR_ATTACHMENT0,Q,ie);else we(V.__webglFramebuffer,C,x,i.COLOR_ATTACHMENT0,Q,0);g(x)&&M(Q),t.unbindTexture()}C.depthBuffer&&te(C)}function ce(C){let x=C.textures;for(let V=0,q=x.length;V<q;V++){let K=x[V];if(g(K)){let he=S(C),de=n.get(K).__webglTexture;t.bindTexture(he,de),M(he),t.unbindTexture()}}}let ue=[],Be=[];function ke(C){if(C.samples>0){if(Je(C)===!1){let x=C.textures,V=C.width,q=C.height,K=i.COLOR_BUFFER_BIT,he=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=n.get(C),Q=x.length>1;if(Q)for(let pe=0;pe<x.length;pe++)t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,de.__webglMultisampledFramebuffer);let ie=C.texture.mipmaps;ie&&ie.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer);for(let pe=0;pe<x.length;pe++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,de.__webglColorRenderbuffer[pe]);let Ne=n.get(x[pe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ne,0)}i.blitFramebuffer(0,0,V,q,0,0,V,q,K,i.NEAREST),l===!0&&(ue.length=0,Be.length=0,ue.push(i.COLOR_ATTACHMENT0+pe),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(ue.push(he),Be.push(he),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Be)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ue))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let pe=0;pe<x.length;pe++){t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,de.__webglColorRenderbuffer[pe]);let Ne=n.get(x[pe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,Ne,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let x=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function Xe(C){return Math.min(s.maxSamples,C.samples)}function Je(C){let x=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function D(C){let x=a.render.frame;h.get(C)!==x&&(h.set(C,x),C.update())}function ot(C,x){let V=C.colorSpace,q=C.format,K=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||V!==nr&&V!==Qn&&(st.getTransfer(V)===ht?(q!==fn||K!==en)&&Ge("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):We("WebGLTextures: Unsupported texture color space:",V)),x}function tt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=z,this.getTextureUnits=I,this.setTextureUnits=R,this.setTexture2D=J,this.setTexture2DArray=G,this.setTexture3D=F,this.setTextureCube=Y,this.rebindTextures=j,this.setupRenderTarget=re,this.updateRenderTargetMipmap=ce,this.updateMultisampleRenderTarget=ke,this.setupDepthRenderbuffer=te,this.setupFrameBufferTexture=we,this.useMultisampledRTT=Je,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Py(i,e){function t(n,s=Qn){let r,a=st.getTransfer(s);if(n===en)return i.UNSIGNED_BYTE;if(n===So)return i.UNSIGNED_SHORT_4_4_4_4;if(n===wo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Lc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Nc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Ic)return i.BYTE;if(n===Pc)return i.SHORT;if(n===Rs)return i.UNSIGNED_SHORT;if(n===Mo)return i.INT;if(n===Sn)return i.UNSIGNED_INT;if(n===un)return i.FLOAT;if(n===wn)return i.HALF_FLOAT;if(n===Dc)return i.ALPHA;if(n===Uc)return i.RGB;if(n===fn)return i.RGBA;if(n===Pn)return i.DEPTH_COMPONENT;if(n===vi)return i.DEPTH_STENCIL;if(n===Eo)return i.RED;if(n===To)return i.RED_INTEGER;if(n===bi)return i.RG;if(n===Ao)return i.RG_INTEGER;if(n===Co)return i.RGBA_INTEGER;if(n===Fr||n===Or||n===Br||n===zr)if(a===ht)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Fr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Or)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Fr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Or)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===zr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ro||n===Io||n===Po||n===Lo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ro)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Io)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Po)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Lo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===No||n===Do||n===Uo||n===ko||n===Fo||n===Vr||n===Oo)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===No||n===Do)return a===ht?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Uo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===ko)return r.COMPRESSED_R11_EAC;if(n===Fo)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Vr)return r.COMPRESSED_RG11_EAC;if(n===Oo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Bo||n===zo||n===Vo||n===Go||n===Ho||n===Wo||n===Xo||n===qo||n===Yo||n===$o||n===Jo||n===Zo||n===jo||n===Ko)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Bo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===zo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Vo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Go)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ho)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Wo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Xo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===qo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Yo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===$o)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Jo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Zo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===jo)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ko)return a===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Qo||n===el||n===tl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Qo)return a===ht?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===el)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===tl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===nl||n===il||n===Gr||n===sl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===nl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===il)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Gr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===sl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Is?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Ly=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ny=`
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

}`,nh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new pr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new an({vertexShader:Ly,fragmentShader:Ny,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Wt(new Er(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ih=class extends Ln{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,p=null,f=null,y=typeof XRWebGLBinding<"u",m=new nh,g={},M=t.getContextAttributes(),S=null,v=null,E=[],w=[],P=new ye,_=null,A=null,N=new Jt;N.viewport=new bt;let T=new Jt;T.viewport=new bt;let L=[N,T],z=new xo,I=null,R=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let ee=E[$];return ee===void 0&&(ee=new vs,E[$]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function($){let ee=E[$];return ee===void 0&&(ee=new vs,E[$]=ee),ee.getGripSpace()},this.getHand=function($){let ee=E[$];return ee===void 0&&(ee=new vs,E[$]=ee),ee.getHandSpace()};function k($){let ee=w.indexOf($.inputSource);if(ee===-1)return;let fe=E[ee];fe!==void 0&&(fe.update($.inputSource,$.frame,c||a),fe.dispatchEvent({type:$.type,data:$.inputSource}))}function H(){s.removeEventListener("select",k),s.removeEventListener("selectstart",k),s.removeEventListener("selectend",k),s.removeEventListener("squeeze",k),s.removeEventListener("squeezestart",k),s.removeEventListener("squeezeend",k),s.removeEventListener("end",H),s.removeEventListener("inputsourceschange",J);for(let $=0;$<E.length;$++){let ee=w[$];ee!==null&&(w[$]=null,E[$].disconnect(ee))}I=null,R=null,m.reset();for(let $ in g)delete g[$];if(e.setRenderTarget(S),p=null,u=null,d=null,s=null,v=null,$e.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(P.width,P.height,!1),A!==null){let $=A.camera;$.fov=A.fov,$.zoom=A.zoom,$.updateProjectionMatrix(),A=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,n.isPresenting===!0&&Ge("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){o=$,n.isPresenting===!0&&Ge("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return f},this.getSession=function(){return s},this.setSession=async function($){if(s=$,s!==null){if(S=e.getRenderTarget(),s.addEventListener("select",k),s.addEventListener("selectstart",k),s.addEventListener("selectend",k),s.addEventListener("squeeze",k),s.addEventListener("squeezestart",k),s.addEventListener("squeezeend",k),s.addEventListener("end",H),s.addEventListener("inputsourceschange",J),M.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(P),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let fe=null,Oe=null,we=null;M.depth&&(we=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,fe=M.stencil?vi:Pn,Oe=M.stencil?Is:Sn);let oe={colorFormat:t.RGBA8,depthFormat:we,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(oe),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),v=new Kt(u.textureWidth,u.textureHeight,{format:fn,type:en,depthTexture:new fi(u.textureWidth,u.textureHeight,Oe,void 0,void 0,void 0,void 0,void 0,void 0,fe),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let fe={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,fe),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new Kt(p.framebufferWidth,p.framebufferHeight,{format:fn,type:en,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),$e.setContext(s),$e.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function J($){for(let ee=0;ee<$.removed.length;ee++){let fe=$.removed[ee],Oe=w.indexOf(fe);Oe>=0&&(w[Oe]=null,E[Oe].disconnect(fe))}for(let ee=0;ee<$.added.length;ee++){let fe=$.added[ee],Oe=w.indexOf(fe);if(Oe===-1){for(let oe=0;oe<E.length;oe++)if(oe>=w.length){w.push(fe),Oe=oe;break}else if(w[oe]===null){w[oe]=fe,Oe=oe;break}if(Oe===-1)break}let we=E[Oe];we&&we.connect(fe)}}let G=new B,F=new B;function Y($,ee,fe){G.setFromMatrixPosition(ee.matrixWorld),F.setFromMatrixPosition(fe.matrixWorld);let Oe=G.distanceTo(F),we=ee.projectionMatrix.elements,oe=fe.projectionMatrix.elements,Le=we[14]/(we[10]-1),te=we[14]/(we[10]+1),j=(we[9]+1)/we[5],re=(we[9]-1)/we[5],ce=(we[8]-1)/we[0],ue=(oe[8]+1)/oe[0],Be=Le*ce,ke=Le*ue,Xe=Oe/(-ce+ue),Je=Xe*-ce;if(ee.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(Je),$.translateZ(Xe),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),we[10]===-1)$.projectionMatrix.copy(ee.projectionMatrix),$.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{let D=Le+Xe,ot=te+Xe,tt=Be-Je,C=ke+(Oe-Je),x=j*te/ot*D,V=re*te/ot*D;$.projectionMatrix.makePerspective(tt,C,x,V,D,ot),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function le($,ee){ee===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(ee.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(s===null)return;let ee=$.near,fe=$.far;m.texture!==null&&(m.depthNear>0&&(ee=m.depthNear),m.depthFar>0&&(fe=m.depthFar)),z.near=T.near=N.near=ee,z.far=T.far=N.far=fe,(I!==z.near||R!==z.far)&&(s.updateRenderState({depthNear:z.near,depthFar:z.far}),I=z.near,R=z.far),z.layers.mask=$.layers.mask|6,N.layers.mask=z.layers.mask&-5,T.layers.mask=z.layers.mask&-3;let Oe=$.parent,we=z.cameras;le(z,Oe);for(let oe=0;oe<we.length;oe++)le(we[oe],Oe);we.length===2?Y(z,N,T):z.projectionMatrix.copy(N.projectionMatrix),A===null&&$.isPerspectiveCamera&&(A={camera:$,fov:$.fov,zoom:$.zoom}),ae($,z,Oe)};function ae($,ee,fe){fe===null?$.matrix.copy(ee.matrixWorld):($.matrix.copy(fe.matrixWorld),$.matrix.invert(),$.matrix.multiply(ee.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(ee.projectionMatrix),$.projectionMatrixInverse.copy(ee.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=Ha*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function($){l=$,u!==null&&(u.fixedFoveation=$),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=$)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(z)},this.getCameraTexture=function($){return g[$]};let qe=null;function He($,ee){if(h=ee.getViewerPose(c||a),f=ee,h!==null){let fe=h.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let Oe=!1;fe.length!==z.cameras.length&&(z.cameras.length=0,Oe=!0);for(let te=0;te<fe.length;te++){let j=fe[te],re=null;if(p!==null)re=p.getViewport(j);else{let ue=d.getViewSubImage(u,j);re=ue.viewport,te===0&&(e.setRenderTargetTextures(v,ue.colorTexture,ue.depthStencilTexture),e.setRenderTarget(v))}let ce=L[te];ce===void 0&&(ce=new Jt,ce.layers.enable(te),ce.viewport=new bt,L[te]=ce),ce.matrix.fromArray(j.transform.matrix),ce.matrix.decompose(ce.position,ce.quaternion,ce.scale),ce.projectionMatrix.fromArray(j.projectionMatrix),ce.projectionMatrixInverse.copy(ce.projectionMatrix).invert(),ce.viewport.set(re.x,re.y,re.width,re.height),te===0&&(z.matrix.copy(ce.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),Oe===!0&&z.cameras.push(ce)}let we=s.enabledFeatures;if(we&&we.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){d=n.getBinding();let te=d.getDepthInformation(fe[0]);te&&te.isValid&&te.texture&&m.init(te,s.renderState)}if(we&&we.includes("camera-access")&&y){e.state.unbindTexture(),d=n.getBinding();for(let te=0;te<fe.length;te++){let j=fe[te].camera;if(j){let re=g[j];re||(re=new pr,g[j]=re);let ce=d.getCameraImage(j);re.sourceTexture=ce}}}}for(let fe=0;fe<E.length;fe++){let Oe=w[fe],we=E[fe];Oe!==null&&we!==void 0&&we.update(Oe,ee,c||a)}qe&&qe($,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),f=null}let $e=new Pu;$e.setAnimationLoop(He),this.setAnimationLoop=function($){qe=$},this.dispose=function(){}}},Dy=new ft,Fu=new Ye;Fu.set(-1,0,0,0,1,0,0,0,1);function Uy(i,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,Bc(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,M,S,v){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),d(m,g)):g.isMeshPhongMaterial?(r(m,g),h(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),u(m,g),g.isMeshPhysicalMaterial&&p(m,g,v)):g.isMeshMatcapMaterial?(r(m,g),f(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),y(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(a(m,g),g.isLineDashedMaterial&&o(m,g)):g.isPointsMaterial?l(m,g,M,S):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===Yt&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===Yt&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let M=e.get(g),S=M.envMap,v=M.envMapRotation;S&&(m.envMap.value=S,m.envMapRotation.value.setFromMatrix4(Dy.makeRotationFromEuler(v)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Fu),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function a(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function o(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,M,S){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*M,m.scale.value=S*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function h(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function d(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function u(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function p(m,g,M){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Yt&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function f(m,g){g.matcap&&(m.matcap.value=g.matcap)}function y(m,g){let M=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function ky(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,E){let w=E.program;n.uniformBlockBinding(v,w)}function c(v,E){let w=s[v.id];w===void 0&&(m(v),w=h(v),s[v.id]=w,v.addEventListener("dispose",M));let P=E.program;n.updateUBOMapping(v,P);let _=e.render.frame;r[v.id]!==_&&(u(v),r[v.id]=_)}function h(v){let E=d();v.__bindingPointIndex=E;let w=i.createBuffer(),P=v.__size,_=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,P,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,w),w}function d(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return We("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(v){let E=s[v.id],w=v.uniforms,P=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let _=0,A=w.length;_<A;_++){let N=w[_];if(Array.isArray(N))for(let T=0,L=N.length;T<L;T++)p(N[T],_,T,P);else p(N,_,0,P)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(v,E,w,P){if(y(v,E,w,P)===!0){let _=v.__offset,A=v.value;if(Array.isArray(A)){let N=0;for(let T=0;T<A.length;T++){let L=A[T],z=g(L);f(L,v.__data,N),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(N+=z.storage/Float32Array.BYTES_PER_ELEMENT)}}else f(A,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,v.__data)}}function f(v,E,w){typeof v=="number"||typeof v=="boolean"?E[0]=v:v.isMatrix3?(E[0]=v.elements[0],E[1]=v.elements[1],E[2]=v.elements[2],E[3]=0,E[4]=v.elements[3],E[5]=v.elements[4],E[6]=v.elements[5],E[7]=0,E[8]=v.elements[6],E[9]=v.elements[7],E[10]=v.elements[8],E[11]=0):ArrayBuffer.isView(v)?E.set(new v.constructor(v.buffer,v.byteOffset,E.length)):v.toArray(E,w)}function y(v,E,w,P){let _=v.value,A=E+"_"+w;if(P[A]===void 0)return typeof _=="number"||typeof _=="boolean"?P[A]=_:ArrayBuffer.isView(_)?P[A]=_.slice():P[A]=_.clone(),!0;{let N=P[A];if(typeof _=="number"||typeof _=="boolean"){if(N!==_)return P[A]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(N.equals(_)===!1)return N.copy(_),!0}}return!1}function m(v){let E=v.uniforms,w=0,P=16;for(let A=0,N=E.length;A<N;A++){let T=Array.isArray(E[A])?E[A]:[E[A]];for(let L=0,z=T.length;L<z;L++){let I=T[L],R=Array.isArray(I.value)?I.value:[I.value];for(let k=0,H=R.length;k<H;k++){let J=R[k],G=g(J),F=w%P,Y=F%G.boundary,le=F+Y;w+=Y,le!==0&&P-le<G.storage&&(w+=P-le),I.__data=new Float32Array(G.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=w,w+=G.storage}}}let _=w%P;return _>0&&(w+=P-_),v.__size=w,v.__cache={},this}function g(v){let E={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(E.boundary=4,E.storage=4):v.isVector2?(E.boundary=8,E.storage=8):v.isVector3||v.isColor?(E.boundary=16,E.storage=12):v.isVector4?(E.boundary=16,E.storage=16):v.isMatrix3?(E.boundary=48,E.storage=48):v.isMatrix4?(E.boundary=64,E.storage=64):v.isTexture?Ge("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(E.boundary=16,E.storage=v.byteLength):Ge("WebGLRenderer: Unsupported uniform value type.",v),E}function M(v){let E=v.target;E.removeEventListener("dispose",M);let w=a.indexOf(E.__bindingPointIndex);a.splice(w,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function S(){for(let v in s)i.deleteBuffer(s[v]);a=[],s={},r={}}return{bind:l,update:c,dispose:S}}var Fy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Bn=null;function Oy(){return Bn===null&&(Bn=new Oi(Fy,16,16,bi,wn),Bn.name="DFG_LUT",Bn.minFilter=Pt,Bn.magFilter=Pt,Bn.wrapS=In,Bn.wrapT=In,Bn.generateMipmaps=!1,Bn.needsUpdate=!0),Bn}var ul=class{constructor(e={}){let{canvas:t=Kd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:p=en}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;let y=p,m=new Set([Co,Ao,To]),g=new Set([en,Sn,Rs,Is,So,wo]),M=new Uint32Array(4),S=new Int32Array(4),v=new B,E=null,w=null,P=[],_=[],A=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Mn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let N=this,T=!1,L=null,z=null,I=null,R=null;this._outputColorSpace=Bt;let k=0,H=0,J=null,G=-1,F=null,Y=new bt,le=new bt,ae=null,qe=new Qe(0),He=0,$e=t.width,$=t.height,ee=1,fe=null,Oe=null,we=new bt(0,0,$e,$),oe=new bt(0,0,$e,$),Le=!1,te=new bs,j=!1,re=!1,ce=new ft,ue=new B,Be=new bt,ke={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Xe=!1;function Je(){return J===null?ee:1}let D=n;function ot(b,U){return t.getContext(b,U)}let tt,C,x,V,q,K,he,de,Q,ie,pe,Ne,_e,me,De,ze,je,O,ge,ne,xe,Se,se;try{let b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",mt,!1),t.addEventListener("webglcontextrestored",lt,!1),t.addEventListener("webglcontextcreationerror",mn,!1),D===null){let U="webgl2";if(D=ot(U,b),D===null)throw ot(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ue()}catch(b){throw t.removeEventListener("webglcontextlost",mt,!1),t.removeEventListener("webglcontextrestored",lt,!1),t.removeEventListener("webglcontextcreationerror",mn,!1),We("WebGLRenderer: "+b.message),b}function Ue(){tt=new Xg(D),tt.init(),xe=new Py(D,tt),C=new Ug(D,tt,e,xe),x=new Ry(D,tt),C.reversedDepthBuffer&&u&&x.buffers.depth.setReversed(!0),z=D.createFramebuffer(),I=D.createFramebuffer(),R=D.createFramebuffer(),V=new $g(D),q=new my,K=new Iy(D,tt,x,q,C,xe,V),he=new Wg(N),de=new Zp(D),Se=new Ng(D,de),Q=new qg(D,de,V,Se),ie=new Zg(D,Q,de,Se,V),O=new Jg(D,C,K),De=new kg(q),pe=new py(N,he,tt,C,Se,De),Ne=new Uy(N,q),_e=new xy,me=new Sy(tt),je=new Lg(N,he,x,ie,f,l),ze=new Cy(N,ie,C),se=new ky(D,V,C,x),ge=new Dg(D,tt,V),ne=new Yg(D,tt,V),V.programs=pe.programs,N.capabilities=C,N.extensions=tt,N.properties=q,N.renderLists=_e,N.shadowMap=ze,N.state=x,N.info=V}y!==en&&(A=new Kg(y,t.width,t.height,o,s,r));let Ie=new ih(N,D);this.xr=Ie,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let b=tt.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=tt.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(b){b!==void 0&&(ee=b,this.setSize($e,$,!1))},this.getSize=function(b){return b.set($e,$)},this.setSize=function(b,U,Z=!0){if(Ie.isPresenting){Ge("WebGLRenderer: Can't change size while VR device is presenting.");return}$e=b,$=U,t.width=Math.floor(b*ee),t.height=Math.floor(U*ee),Z===!0&&(t.style.width=b+"px",t.style.height=U+"px"),A!==null&&A.setSize(t.width,t.height),this.setViewport(0,0,b,U)},this.getDrawingBufferSize=function(b){return b.set($e*ee,$*ee).floor()},this.setDrawingBufferSize=function(b,U,Z){$e=b,$=U,ee=Z,t.width=Math.floor(b*Z),t.height=Math.floor(U*Z),this.setViewport(0,0,b,U)},this.setEffects=function(b){if(y===en){We("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let U=0;U<b.length;U++)if(b[U].isOutputPass===!0){Ge("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(Y)},this.getViewport=function(b){return b.copy(we)},this.setViewport=function(b,U,Z,W){b.isVector4?we.set(b.x,b.y,b.z,b.w):we.set(b,U,Z,W),x.viewport(Y.copy(we).multiplyScalar(ee).round())},this.getScissor=function(b){return b.copy(oe)},this.setScissor=function(b,U,Z,W){b.isVector4?oe.set(b.x,b.y,b.z,b.w):oe.set(b,U,Z,W),x.scissor(le.copy(oe).multiplyScalar(ee).round())},this.getScissorTest=function(){return Le},this.setScissorTest=function(b){x.setScissorTest(Le=b)},this.setOpaqueSort=function(b){fe=b},this.setTransparentSort=function(b){Oe=b},this.getClearColor=function(b){return b.copy(je.getClearColor())},this.setClearColor=function(){je.setClearColor(...arguments)},this.getClearAlpha=function(){return je.getClearAlpha()},this.setClearAlpha=function(){je.setClearAlpha(...arguments)},this.clear=function(b=!0,U=!0,Z=!0){let W=0;if(b){let X=!1;if(J!==null){let Me=J.texture.format;X=m.has(Me)}if(X){let Me=J.texture.type,Te=g.has(Me),be=je.getClearColor(),Ce=je.getClearAlpha(),Pe=be.r,Ke=be.g,nt=be.b;Te?(M[0]=Pe,M[1]=Ke,M[2]=nt,M[3]=Ce,D.clearBufferuiv(D.COLOR,0,M)):(S[0]=Pe,S[1]=Ke,S[2]=nt,S[3]=Ce,D.clearBufferiv(D.COLOR,0,S))}else W|=D.COLOR_BUFFER_BIT}U&&(W|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Z&&(W|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&D.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),L=b},this.dispose=function(){t.removeEventListener("webglcontextlost",mt,!1),t.removeEventListener("webglcontextrestored",lt,!1),t.removeEventListener("webglcontextcreationerror",mn,!1),je.dispose(),_e.dispose(),me.dispose(),q.dispose(),he.dispose(),ie.dispose(),Se.dispose(),se.dispose(),pe.dispose(),Ie.dispose(),Ie.removeEventListener("sessionstart",bh),Ie.removeEventListener("sessionend",Mh),Ii.stop()};function mt(b){b.preventDefault(),Fc("WebGLRenderer: Context Lost."),T=!0}function lt(){Fc("WebGLRenderer: Context Restored."),T=!1;let b=V.autoReset,U=ze.enabled,Z=ze.autoUpdate,W=ze.needsUpdate,X=ze.type;Ue(),V.autoReset=b,ze.enabled=U,ze.autoUpdate=Z,ze.needsUpdate=W,ze.type=X}function mn(b){We("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function An(b){let U=b.target;U.removeEventListener("dispose",An),Mf(U)}function Mf(b){Sf(b),q.remove(b)}function Sf(b){let U=q.get(b).programs;U!==void 0&&(U.forEach(function(Z){pe.releaseProgram(Z)}),b.isShaderMaterial&&pe.releaseShaderCache(b))}this.renderBufferDirect=function(b,U,Z,W,X,Me){U===null&&(U=ke);let Te=X.isMesh&&X.matrixWorld.determinantAffine()<0,be=Tf(b,U,Z,W,X);x.setMaterial(W,Te);let Ce=Z.index,Pe=1;if(W.wireframe===!0){if(Ce=Q.getWireframeAttribute(Z),Ce===void 0)return;Pe=2}let Ke=Z.drawRange,nt=Z.attributes.position,Re=Ke.start*Pe,ct=(Ke.start+Ke.count)*Pe;Me!==null&&(Re=Math.max(Re,Me.start*Pe),ct=Math.min(ct,(Me.start+Me.count)*Pe)),Ce!==null?(Re=Math.max(Re,0),ct=Math.min(ct,Ce.count)):nt!=null&&(Re=Math.max(Re,0),ct=Math.min(ct,nt.count));let At=ct-Re;if(At<0||At===1/0)return;Se.setup(X,W,be,Z,Ce);let yt,ut=ge;if(Ce!==null&&(yt=de.get(Ce),ut=ne,ut.setIndex(yt)),X.isMesh)W.wireframe===!0?(x.setLineWidth(W.wireframeLinewidth*Je()),ut.setMode(D.LINES)):ut.setMode(D.TRIANGLES);else if(X.isLine){let Vt=W.linewidth;Vt===void 0&&(Vt=1),x.setLineWidth(Vt*Je()),X.isLineSegments?ut.setMode(D.LINES):X.isLineLoop?ut.setMode(D.LINE_LOOP):ut.setMode(D.LINE_STRIP)}else X.isPoints?ut.setMode(D.POINTS):X.isSprite&&ut.setMode(D.TRIANGLES);if(X.isBatchedMesh)if(tt.get("WEBGL_multi_draw"))ut.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let Vt=X._multiDrawStarts,Ee=X._multiDrawCounts,qt=X._multiDrawCount,rt=Ce?de.get(Ce).bytesPerElement:1,hn=q.get(W).currentProgram.getUniforms();for(let Cn=0;Cn<qt;Cn++)hn.setValue(D,"_gl_DrawID",Cn),ut.render(Vt[Cn]/rt,Ee[Cn])}else if(X.isInstancedMesh)ut.renderInstances(Re,At,X.count);else if(Z.isInstancedBufferGeometry){let Vt=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,Ee=Math.min(Z.instanceCount,Vt);ut.renderInstances(Re,At,Ee)}else ut.render(Re,At)};function vh(b,U,Z,W){L!==null&&b.isNodeMaterial&&L.setObject(W,b),j===!0&&De.setState(b,Z,!1),b.transparent===!0&&b.side===kn&&b.forceSinglePass===!1?(b.side=Yt,b.needsUpdate=!0,ra(b,U,W),b.side=yi,b.needsUpdate=!0,ra(b,U,W),b.side=kn):ra(b,U,W)}this.compile=function(b,U,Z=null){Z===null&&(Z=b),L!==null&&L.renderStart(b,U,Z),w=me.get(Z),w.init(U),_.push(w),Z.traverseVisible(function(X){X.isLight&&X.layers.test(U.layers)&&(w.pushLight(X),X.castShadow&&w.pushShadow(X))}),b!==Z&&b.traverseVisible(function(X){X.isLight&&X.layers.test(U.layers)&&(w.pushLight(X),X.castShadow&&w.pushShadow(X))}),w.setupLights(),L!==null&&L.updateLights(w.state.lightsArray),re=this.localClippingEnabled,j=De.init(this.clippingPlanes,re),j===!0&&De.setGlobalState(this.clippingPlanes,U),L!==null&&ze.render(w.state.shadowsArray,Z,U);let W=new Set;return b.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let Me=X.material;if(Me)if(Array.isArray(Me))for(let Te=0;Te<Me.length;Te++){let be=Me[Te];vh(be,Z,U,X),W.add(be)}else vh(Me,Z,U,X),W.add(Me)}),w=_.pop(),L!==null&&L.renderEnd(),W},this.compileAsync=function(b,U,Z=null){let W=this.compile(b,U,Z);return new Promise(X=>{function Me(){if(W.forEach(function(Te){let Ce=q.get(Te).currentProgram;(Ce===void 0||Ce.isReady())&&W.delete(Te)}),W.size===0){X(b);return}setTimeout(Me,10)}tt.get("KHR_parallel_shader_compile")!==null?Me():setTimeout(Me,10)})};let wl=null;function wf(b){wl&&wl(b)}function bh(){Ii.stop()}function Mh(){Ii.start()}let Ii=new Pu;Ii.setAnimationLoop(wf),typeof self<"u"&&Ii.setContext(self),this.setAnimationLoop=function(b){wl=b,Ie.setAnimationLoop(b),b===null?Ii.stop():Ii.start()},Ie.addEventListener("sessionstart",bh),Ie.addEventListener("sessionend",Mh),this.render=function(b,U){if(U!==void 0&&U.isCamera!==!0){We("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;L!==null&&L.renderStart(b,U);let Z=Ie.enabled===!0&&Ie.isPresenting===!0,W=A!==null&&(J===null||Z)&&A.begin(N,J);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Ie.enabled===!0&&Ie.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(Ie.cameraAutoUpdate===!0&&Ie.updateCamera(U),U=Ie.getCamera()),b.isScene===!0&&b.onBeforeRender(N,b,U,J),w=me.get(b,_.length),w.init(U),w.state.textureUnits=K.getTextureUnits(),_.push(w),ce.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),te.setFromProjectionMatrix(ce,bn,U.reversedDepth),re=this.localClippingEnabled,j=De.init(this.clippingPlanes,re),E=_e.get(b,P.length),E.init(),P.push(E),Ie.enabled===!0&&Ie.isPresenting===!0){let Te=N.xr.getDepthSensingMesh();Te!==null&&El(Te,U,-1/0,N.sortObjects)}El(b,U,0,N.sortObjects),E.finish(),L!==null&&L.updateLights(w.state.lightsArray),N.sortObjects===!0&&E.sort(fe,Oe),Xe=Ie.enabled===!1||Ie.isPresenting===!1||Ie.hasDepthSensing()===!1,Xe&&je.addToRenderList(E,b),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),j===!0&&De.beginShadows();let X=w.state.shadowsArray;if(ze.render(X,b,U),j===!0&&De.endShadows(),(W&&A.hasRenderPass())===!1){let Te=E.opaque,be=E.transmissive;if(w.setupLights(),U.isArrayCamera){let Ce=U.cameras;if(be.length>0)for(let Pe=0,Ke=Ce.length;Pe<Ke;Pe++){let nt=Ce[Pe];wh(Te,be,b,nt)}Xe&&je.render(b);for(let Pe=0,Ke=Ce.length;Pe<Ke;Pe++){let nt=Ce[Pe];Sh(E,b,nt,nt.viewport)}}else be.length>0&&wh(Te,be,b,U),Xe&&je.render(b),Sh(E,b,U)}J!==null&&H===0&&(K.updateMultisampleRenderTarget(J),K.updateRenderTargetMipmap(J)),W&&A.end(N),b.isScene===!0&&b.onAfterRender(N,b,U),Se.resetDefaultState(),G=-1,F=null,_.pop(),_.length>0?(w=_[_.length-1],K.setTextureUnits(w.state.textureUnits),j===!0&&De.setGlobalState(N.clippingPlanes,w.state.camera)):w=null,P.pop(),P.length>0?E=P[P.length-1]:E=null,L!==null&&L.renderEnd()};function El(b,U,Z,W){if(b.visible===!1)return;if(b.layers.test(U.layers)){if(b.isGroup)Z=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(U);else if(b.isLightProbeGrid)w.pushLightProbeGrid(b);else if(b.isLight)w.pushLight(b),b.castShadow&&w.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||b.intersectsFrustum(te)){W&&Be.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ce);let Te=ie.update(b),be=b.material;be.visible&&E.push(b,Te,be,Z,Be.z,null,U)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||b.intersectsFrustum(te))){let Te=ie.update(b),be=b.material;if(W&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Be.copy(b.boundingSphere.center)):(Te.boundingSphere===null&&Te.computeBoundingSphere(),Be.copy(Te.boundingSphere.center)),Be.applyMatrix4(b.matrixWorld).applyMatrix4(ce)),Array.isArray(be)){let Ce=Te.groups;for(let Pe=0,Ke=Ce.length;Pe<Ke;Pe++){let nt=Ce[Pe],Re=be[nt.materialIndex];Re&&Re.visible&&E.push(b,Te,Re,Z,Be.z,nt,U)}}else be.visible&&E.push(b,Te,be,Z,Be.z,null,U)}}let Me=b.children;for(let Te=0,be=Me.length;Te<be;Te++)El(Me[Te],U,Z,W)}function Sh(b,U,Z,W){let{opaque:X,transmissive:Me,transparent:Te}=b;w.setupLightsView(Z),j===!0&&De.setGlobalState(N.clippingPlanes,Z),W&&x.viewport(Y.copy(W)),X.length>0&&sa(X,U,Z),Me.length>0&&sa(Me,U,Z),Te.length>0&&sa(Te,U,Z),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function wh(b,U,Z,W){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[W.id]===void 0){let Re=tt.has("EXT_color_buffer_half_float")||tt.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[W.id]=new Kt(1,1,{generateMipmaps:!0,type:Re?wn:en,minFilter:On,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:st.workingColorSpace})}let Me=w.state.transmissionRenderTarget[W.id],Te=W.viewport||Y;Me.setSize(Te.z*N.transmissionResolutionScale,Te.w*N.transmissionResolutionScale);let be=N.getRenderTarget(),Ce=N.getActiveCubeFace(),Pe=N.getActiveMipmapLevel();N.setRenderTarget(Me),N.getClearColor(qe),He=N.getClearAlpha(),He<1&&N.setClearColor(16777215,.5),N.clear(),Xe&&je.render(Z);let Ke=N.toneMapping;N.toneMapping=Mn;let nt=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),w.setupLightsView(W),j===!0&&De.setGlobalState(N.clippingPlanes,W),sa(b,Z,W),K.updateMultisampleRenderTarget(Me),K.updateRenderTargetMipmap(Me),tt.has("WEBGL_multisampled_render_to_texture")===!1){let Re=!1;for(let ct=0,At=U.length;ct<At;ct++){let yt=U[ct],{object:ut,geometry:Vt,material:Ee,group:qt}=yt;if(Ee.side===kn&&ut.layers.test(W.layers)){let rt=Ee.side;Ee.side=Yt,Ee.needsUpdate=!0,Eh(ut,Z,W,Vt,Ee,qt),Ee.side=rt,Ee.needsUpdate=!0,Re=!0}}Re===!0&&(K.updateMultisampleRenderTarget(Me),K.updateRenderTargetMipmap(Me))}N.setRenderTarget(be,Ce,Pe),N.setClearColor(qe,He),nt!==void 0&&(W.viewport=nt),N.toneMapping=Ke}function sa(b,U,Z){let W=U.isScene===!0?U.overrideMaterial:null;for(let X=0,Me=b.length;X<Me;X++){let Te=b[X],{object:be,geometry:Ce,group:Pe}=Te,Ke=Te.material;Ke.allowOverride===!0&&W!==null&&(Ke=W),be.layers.test(Z.layers)&&Eh(be,U,Z,Ce,Ke,Pe)}}function Eh(b,U,Z,W,X,Me){L!==null&&X.isNodeMaterial&&L.setObject(b,X),b.onBeforeRender(N,U,Z,W,X,Me),b.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),X.onBeforeRender(N,U,Z,W,b,Me),X.transparent===!0&&X.side===kn&&X.forceSinglePass===!1?(X.side=Yt,X.needsUpdate=!0,N.renderBufferDirect(Z,U,W,X,b,Me),X.side=yi,X.needsUpdate=!0,N.renderBufferDirect(Z,U,W,X,b,Me),X.side=kn):N.renderBufferDirect(Z,U,W,X,b,Me),b.onAfterRender(N,U,Z,W,X,Me)}function ra(b,U,Z){U.isScene!==!0&&(U=ke);let W=q.get(b),X=w.state.lights,Me=w.state.shadowsArray,Te=X.state.version,be=pe.getParameters(b,X.state,Me,U,Z,w.state.lightProbeGridArray),Ce=pe.getProgramCacheKey(be),Pe=W.programs;W.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?U.environment:null,W.fog=U.fog;let Ke=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;W.envMap=he.get(b.envMap||W.environment,Ke),W.envMapRotation=W.environment!==null&&b.envMap===null?U.environmentRotation:b.envMapRotation,Pe===void 0&&(b.addEventListener("dispose",An),Pe=new Map,W.programs=Pe);let nt=Pe.get(Ce);if(nt!==void 0){if(W.currentProgram===nt&&W.lightsStateVersion===Te)return Ah(b,be),nt}else be.uniforms=pe.getUniforms(b),L!==null&&b.isNodeMaterial&&L.build(b,Z,be),b.onBeforeCompile(be,N),nt=pe.acquireProgram(be,Ce),Pe.set(Ce,nt),W.uniforms=be.uniforms;let Re=W.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Re.clippingPlanes=De.uniform),Ah(b,be),W.needsLights=Cf(b),W.lightsStateVersion=Te,W.needsLights&&(Re.ambientLightColor.value=X.state.ambient,Re.lightProbe.value=X.state.probe,Re.sunLights.value=X.state.sun,Re.sunLightShadows.value=X.state.sunShadow,Re.directionalLights.value=X.state.directional,Re.directionalLightShadows.value=X.state.directionalShadow,Re.spotLights.value=X.state.spot,Re.spotLightShadows.value=X.state.spotShadow,Re.rectAreaLights.value=X.state.rectArea,Re.ltc_1.value=X.state.rectAreaLTC1,Re.ltc_2.value=X.state.rectAreaLTC2,Re.pointLights.value=X.state.point,Re.pointLightShadows.value=X.state.pointShadow,Re.hemisphereLights.value=X.state.hemi,Re.sunShadowMatrix.value=X.state.sunShadowMatrix,Re.sunShadowCascade.value=X.state.sunShadowCascade,Re.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Re.spotLightMatrix.value=X.state.spotLightMatrix,Re.spotLightMap.value=X.state.spotLightMap,Re.pointShadowMatrix.value=X.state.pointShadowMatrix),W.lightProbeGrid=w.state.lightProbeGridArray.length>0,W.currentProgram=nt,W.uniformsList=null,nt}function Th(b){if(b.uniformsList===null){let U=b.currentProgram.getUniforms();b.uniformsList=Ds.seqWithValue(U.seq,b.uniforms)}return b.uniformsList}function Ah(b,U){let Z=q.get(b);Z.outputColorSpace=U.outputColorSpace,Z.batching=U.batching,Z.batchingColor=U.batchingColor,Z.instancing=U.instancing,Z.instancingColor=U.instancingColor,Z.instancingMorph=U.instancingMorph,Z.skinning=U.skinning,Z.morphTargets=U.morphTargets,Z.morphNormals=U.morphNormals,Z.morphColors=U.morphColors,Z.morphTargetsCount=U.morphTargetsCount,Z.numClippingPlanes=U.numClippingPlanes,Z.numIntersection=U.numClipIntersection,Z.vertexAlphas=U.vertexAlphas,Z.vertexTangents=U.vertexTangents,Z.toneMapping=U.toneMapping}function Ef(b,U){if(b.length===0)return null;if(b.length===1)return b[0].texture!==null?b[0]:null;v.setFromMatrixPosition(U.matrixWorld);for(let Z=0,W=b.length;Z<W;Z++){let X=b[Z];if(X.texture!==null&&X.boundingBox.containsPoint(v))return X}return null}function Tf(b,U,Z,W,X){U.isScene!==!0&&(U=ke),K.resetTextureUnits();let Me=U.fog,Te=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?U.environment:null,be=J===null?N.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:st.workingColorSpace,Ce=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,Pe=he.get(W.envMap||Te,Ce),Ke=W.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,nt=!!Z.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Re=!!Z.morphAttributes.position,ct=!!Z.morphAttributes.normal,At=!!Z.morphAttributes.color,yt=Mn;W.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(yt=N.toneMapping);let ut=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Vt=ut!==void 0?ut.length:0,Ee=q.get(W),qt=w.state.lights;if(j===!0&&(re===!0||b!==F)){let gt=b===F&&W.id===G;De.setState(W,b,gt)}let rt=!1;W.version===Ee.__version?(Ee.needsLights&&Ee.lightsStateVersion!==qt.state.version||Ee.outputColorSpace!==be||X.isBatchedMesh&&Ee.batching===!1||!X.isBatchedMesh&&Ee.batching===!0||X.isBatchedMesh&&Ee.batchingColor===!0&&X._colorsTexture===null||X.isBatchedMesh&&Ee.batchingColor===!1&&X._colorsTexture!==null||X.isInstancedMesh&&Ee.instancing===!1||!X.isInstancedMesh&&Ee.instancing===!0||X.isSkinnedMesh&&Ee.skinning===!1||!X.isSkinnedMesh&&Ee.skinning===!0||X.isInstancedMesh&&Ee.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Ee.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Ee.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Ee.instancingMorph===!1&&X.morphTexture!==null||Ee.envMap!==Pe||W.fog===!0&&Ee.fog!==Me||Ee.numClippingPlanes!==void 0&&(Ee.numClippingPlanes!==De.numPlanes||Ee.numIntersection!==De.numIntersection)||Ee.vertexAlphas!==Ke||Ee.vertexTangents!==nt||Ee.morphTargets!==Re||Ee.morphNormals!==ct||Ee.morphColors!==At||Ee.toneMapping!==yt||Ee.morphTargetsCount!==Vt||!!Ee.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(rt=!0):(rt=!0,Ee.__version=W.version);let hn=Ee.currentProgram;rt===!0&&(hn=ra(W,U,X),L&&W.isNodeMaterial&&L.onUpdateProgram(W,hn,Ee));let Cn=!1,ti=!1,Ki=!1,dt=hn.getUniforms(),Tt=Ee.uniforms;if(x.useProgram(hn.program)&&(Cn=!0,ti=!0,Ki=!0),W.id!==G&&(G=W.id,ti=!0),Ee.needsLights){let gt=Ef(w.state.lightProbeGridArray,X);Ee.lightProbeGrid!==gt&&(Ee.lightProbeGrid=gt,ti=!0)}if(Cn||F!==b){x.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),dt.setValue(D,"projectionMatrix",b.projectionMatrix),dt.setValue(D,"viewMatrix",b.matrixWorldInverse);let ii=dt.map.cameraPosition;ii!==void 0&&ii.setValue(D,ue.setFromMatrixPosition(b.matrixWorld)),C.logarithmicDepthBuffer&&dt.setValue(D,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&dt.setValue(D,"isOrthographic",b.isOrthographicCamera===!0),F!==b&&(F=b,ti=!0,Ki=!0)}if(Ee.needsLights&&(qt.state.sunShadowMap.length>0&&dt.setValue(D,"sunShadowMap",qt.state.sunShadowMap,K),qt.state.directionalShadowMap.length>0&&dt.setValue(D,"directionalShadowMap",qt.state.directionalShadowMap,K),qt.state.spotShadowMap.length>0&&dt.setValue(D,"spotShadowMap",qt.state.spotShadowMap,K),qt.state.pointShadowMap.length>0&&dt.setValue(D,"pointShadowMap",qt.state.pointShadowMap,K)),X.isSkinnedMesh){dt.setOptional(D,X,"bindMatrix"),dt.setOptional(D,X,"bindMatrixInverse");let gt=X.skeleton;gt&&(gt.boneTexture===null&&gt.computeBoneTexture(),dt.setValue(D,"boneTexture",gt.boneTexture,K))}X.isBatchedMesh&&(dt.setOptional(D,X,"batchingTexture"),dt.setValue(D,"batchingTexture",X._matricesTexture,K),dt.setOptional(D,X,"batchingIdTexture"),dt.setValue(D,"batchingIdTexture",X._indirectTexture,K),dt.setOptional(D,X,"batchingColorTexture"),X._colorsTexture!==null&&dt.setValue(D,"batchingColorTexture",X._colorsTexture,K));let ni=Z.morphAttributes;if((ni.position!==void 0||ni.normal!==void 0||ni.color!==void 0)&&O.update(X,Z,hn),(ti||Ee.receiveShadow!==X.receiveShadow)&&(Ee.receiveShadow=X.receiveShadow,dt.setValue(D,"receiveShadow",X.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&U.environment!==null&&(Tt.envMapIntensity.value=U.environmentIntensity),Tt.dfgLUT!==void 0&&(Tt.dfgLUT.value=Oy()),ti){if(dt.setValue(D,"toneMappingExposure",N.toneMappingExposure),Ee.needsLights&&Af(Tt,Ki),Me&&W.fog===!0&&Ne.refreshFogUniforms(Tt,Me),Ne.refreshMaterialUniforms(Tt,W,ee,$,w.state.transmissionRenderTarget[b.id]),Ee.needsLights&&Ee.lightProbeGrid){let gt=Ee.lightProbeGrid;Tt.probesSH.value=gt.texture,Tt.probesMin.value.copy(gt.boundingBox.min),Tt.probesMax.value.copy(gt.boundingBox.max),Tt.probesResolution.value.copy(gt.resolution)}Ds.upload(D,Th(Ee),Tt,K)}if(W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(Ds.upload(D,Th(Ee),Tt,K),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&dt.setValue(D,"center",X.center),dt.setValue(D,"modelViewMatrix",X.modelViewMatrix),dt.setValue(D,"normalMatrix",X.normalMatrix),dt.setValue(D,"modelMatrix",X.matrixWorld),W.uniformsGroups!==void 0){let gt=W.uniformsGroups;for(let ii=0,Qi=gt.length;ii<Qi;ii++){let Rh=gt[ii];se.update(Rh,hn),se.bind(Rh,hn)}}return hn}function Af(b,U){b.ambientLightColor.needsUpdate=U,b.lightProbe.needsUpdate=U,b.sunLights.needsUpdate=U,b.sunLightShadows.needsUpdate=U,b.directionalLights.needsUpdate=U,b.directionalLightShadows.needsUpdate=U,b.pointLights.needsUpdate=U,b.pointLightShadows.needsUpdate=U,b.spotLights.needsUpdate=U,b.spotLightShadows.needsUpdate=U,b.rectAreaLights.needsUpdate=U,b.hemisphereLights.needsUpdate=U}function Cf(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return H},this.getRenderTarget=function(){return J},this.setRenderTargetTextures=function(b,U,Z){let W=q.get(b);W.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),q.get(b.texture).__webglTexture=U,q.get(b.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:Z,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,U){let Z=q.get(b);Z.__webglFramebuffer=U,Z.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(b,U=0,Z=0){J=b,k=U,H=Z;let W=null,X=!1,Me=!1;if(b){let be=q.get(b);if(be.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(D.FRAMEBUFFER,be.__webglFramebuffer),Y.copy(b.viewport),le.copy(b.scissor),ae=b.scissorTest,x.viewport(Y),x.scissor(le),x.setScissorTest(ae),G=-1;return}else if(be.__webglFramebuffer===void 0)K.setupRenderTarget(b);else if(be.__hasExternalTextures)K.rebindTextures(b,q.get(b.texture).__webglTexture,q.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let Ke=b.depthTexture;if(be.__boundDepthTexture!==Ke){if(Ke!==null&&q.has(Ke)&&(b.width!==Ke.image.width||b.height!==Ke.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");K.setupDepthRenderbuffer(b)}}let Ce=b.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(Me=!0);let Pe=q.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Pe[U])?W=Pe[U][Z]:W=Pe[U],X=!0):b.samples>0&&K.useMultisampledRTT(b)===!1?W=q.get(b).__webglMultisampledFramebuffer:Array.isArray(Pe)?W=Pe[Z]:W=Pe,Y.copy(b.viewport),le.copy(b.scissor),ae=b.scissorTest}else Y.copy(we).multiplyScalar(ee).floor(),le.copy(oe).multiplyScalar(ee).floor(),ae=Le;if(Z!==0&&(W=z),x.bindFramebuffer(D.FRAMEBUFFER,W)&&x.drawBuffers(b,W),x.viewport(Y),x.scissor(le),x.setScissorTest(ae),X){let be=q.get(b.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,be.__webglTexture,Z)}else if(Me){let be=U;for(let Ce=0;Ce<b.textures.length;Ce++){let Pe=q.get(b.textures[Ce]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Ce,Pe.__webglTexture,Z,be)}}else if(b!==null&&Z!==0){let be=q.get(b.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,be.__webglTexture,Z)}G=-1};function Ch(b){let U=q.get(b);return(U.__readFormat!==b.format||U.__readType!==b.type)&&(U.__readFormat=b.format,U.__readType=b.type,U.__formatReadable=C.textureFormatReadable(b.format),U.__typeReadable=C.textureTypeReadable(b.type)),U}this.readRenderTargetPixels=function(b,U,Z,W,X,Me,Te,be=0){if(!(b&&b.isWebGLRenderTarget)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ce=q.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Te!==void 0&&(Ce=Ce[Te]),Ce){x.bindFramebuffer(D.FRAMEBUFFER,Ce);try{let Pe=b.textures[be],Ke=Pe.format,nt=Pe.type;b.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+be);let Re=Ch(Pe);if(Re.__formatReadable===!1){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Re.__typeReadable===!1){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=b.width-W&&Z>=0&&Z<=b.height-X&&D.readPixels(U,Z,W,X,xe.convert(Ke),xe.convert(nt),Me)}finally{let Pe=J!==null?q.get(J).__webglFramebuffer:null;x.bindFramebuffer(D.FRAMEBUFFER,Pe)}}},this.readRenderTargetPixelsAsync=async function(b,U,Z,W,X,Me,Te,be=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ce=q.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Te!==void 0&&(Ce=Ce[Te]),Ce)if(U>=0&&U<=b.width-W&&Z>=0&&Z<=b.height-X){x.bindFramebuffer(D.FRAMEBUFFER,Ce);let Pe=b.textures[be],Ke=Pe.format,nt=Pe.type;b.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+be);let Re=Ch(Pe);if(Re.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Re.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ct=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,ct),D.bufferData(D.PIXEL_PACK_BUFFER,Me.byteLength,D.STREAM_READ),D.readPixels(U,Z,W,X,xe.convert(Ke),xe.convert(nt),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let At=J!==null?q.get(J).__webglFramebuffer:null;x.bindFramebuffer(D.FRAMEBUFFER,At);let yt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await eu(D,yt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,ct),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,Me),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(ct),D.deleteSync(yt),Me}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,U=null,Z=0){let W=Math.pow(2,-Z),X=Math.floor(b.image.width*W),Me=Math.floor(b.image.height*W),Te=U!==null?U.x:0,be=U!==null?U.y:0;K.setTexture2D(b,0),D.copyTexSubImage2D(D.TEXTURE_2D,Z,0,0,Te,be,X,Me),x.unbindTexture()},this.copyTextureToTexture=function(b,U,Z=null,W=null,X=0,Me=0){let Te,be,Ce,Pe,Ke,nt,Re,ct,At,yt=b.isCompressedTexture?b.mipmaps[Me]:b.image;if(Z!==null)Te=Z.max.x-Z.min.x,be=Z.max.y-Z.min.y,Ce=Z.isBox3?Z.max.z-Z.min.z:1,Pe=Z.min.x,Ke=Z.min.y,nt=Z.isBox3?Z.min.z:0;else{let Tt=Math.pow(2,-X);Te=Math.floor(yt.width*Tt),be=Math.floor(yt.height*Tt),b.isDataArrayTexture?Ce=yt.depth:b.isData3DTexture?Ce=Math.floor(yt.depth*Tt):Ce=1,Pe=0,Ke=0,nt=0}W!==null?(Re=W.x,ct=W.y,At=W.z):(Re=0,ct=0,At=0);let ut=xe.convert(U.format),Vt=xe.convert(U.type),Ee;U.isData3DTexture?(K.setTexture3D(U,0),Ee=D.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(K.setTexture2DArray(U,0),Ee=D.TEXTURE_2D_ARRAY):(K.setTexture2D(U,0),Ee=D.TEXTURE_2D),x.activeTexture(D.TEXTURE0),x.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),x.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),x.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);let qt=x.getParameter(D.UNPACK_ROW_LENGTH),rt=x.getParameter(D.UNPACK_IMAGE_HEIGHT),hn=x.getParameter(D.UNPACK_SKIP_PIXELS),Cn=x.getParameter(D.UNPACK_SKIP_ROWS),ti=x.getParameter(D.UNPACK_SKIP_IMAGES);x.pixelStorei(D.UNPACK_ROW_LENGTH,yt.width),x.pixelStorei(D.UNPACK_IMAGE_HEIGHT,yt.height),x.pixelStorei(D.UNPACK_SKIP_PIXELS,Pe),x.pixelStorei(D.UNPACK_SKIP_ROWS,Ke),x.pixelStorei(D.UNPACK_SKIP_IMAGES,nt);let Ki=b.isDataArrayTexture||b.isData3DTexture,dt=U.isDataArrayTexture||U.isData3DTexture;if(b.isDepthTexture){let Tt=q.get(b),ni=q.get(U),gt=q.get(Tt.__renderTarget),ii=q.get(ni.__renderTarget);x.bindFramebuffer(D.READ_FRAMEBUFFER,gt.__webglFramebuffer),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,ii.__webglFramebuffer);for(let Qi=0;Qi<Ce;Qi++)Ki&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,q.get(b).__webglTexture,X,nt+Qi),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,q.get(U).__webglTexture,Me,At+Qi)),D.blitFramebuffer(Pe,Ke,Te,be,Re,ct,Te,be,D.DEPTH_BUFFER_BIT,D.NEAREST);x.bindFramebuffer(D.READ_FRAMEBUFFER,null),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(X!==0||b.isRenderTargetTexture||q.has(b)){let Tt=q.get(b),ni=q.get(U);x.bindFramebuffer(D.READ_FRAMEBUFFER,I),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,R);for(let gt=0;gt<Ce;gt++)Ki?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Tt.__webglTexture,X,nt+gt):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Tt.__webglTexture,X),dt?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,ni.__webglTexture,Me,At+gt):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,ni.__webglTexture,Me),X!==0?D.blitFramebuffer(Pe,Ke,Te,be,Re,ct,Te,be,D.COLOR_BUFFER_BIT,D.NEAREST):dt?D.copyTexSubImage3D(Ee,Me,Re,ct,At+gt,Pe,Ke,Te,be):D.copyTexSubImage2D(Ee,Me,Re,ct,Pe,Ke,Te,be);x.bindFramebuffer(D.READ_FRAMEBUFFER,null),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else dt?b.isDataTexture||b.isData3DTexture?D.texSubImage3D(Ee,Me,Re,ct,At,Te,be,Ce,ut,Vt,yt.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(Ee,Me,Re,ct,At,Te,be,Ce,ut,yt.data):D.texSubImage3D(Ee,Me,Re,ct,At,Te,be,Ce,ut,Vt,yt):b.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,Me,Re,ct,Te,be,ut,Vt,yt.data):b.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,Me,Re,ct,yt.width,yt.height,ut,yt.data):D.texSubImage2D(D.TEXTURE_2D,Me,Re,ct,Te,be,ut,Vt,yt);x.pixelStorei(D.UNPACK_ROW_LENGTH,qt),x.pixelStorei(D.UNPACK_IMAGE_HEIGHT,rt),x.pixelStorei(D.UNPACK_SKIP_PIXELS,hn),x.pixelStorei(D.UNPACK_SKIP_ROWS,Cn),x.pixelStorei(D.UNPACK_SKIP_IMAGES,ti),Me===0&&U.generateMipmaps&&D.generateMipmap(Ee),x.unbindTexture()},this.initRenderTarget=function(b){q.get(b).__webglFramebuffer===void 0&&K.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?K.setTextureCube(b,0):b.isData3DTexture?K.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?K.setTexture2DArray(b,0):K.setTexture2D(b,0),x.unbindTexture()},this.resetState=function(){k=0,H=0,J=null,x.reset(),Se.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return bn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=st._getDrawingBufferColorSpace(e),t.unpackColorSpace=st._getUnpackColorSpace()}};var qr=new B;function pn(i,e,t,n,s,r){let a=2*Math.PI*s/4,o=Math.max(r-2*s,0),l=Math.PI/4;qr.copy(e),qr[n]=0,qr.normalize();let c=.5*a/(a+o),h=1-qr.angleTo(i)/l;return Math.sign(qr[t])===1?h*c:o/(a+o)+c+c*(1-h)}var ml=class i extends Un{constructor(e=1,t=1,n=1,s=2,r=.1){let a=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let l=new B,c=new B,h=new B(e,t,n).divideScalar(2).subScalar(r),d=this.attributes.position.array,u=this.attributes.normal.array,p=this.attributes.uv.array,f=d.length/6,y=new B,m=.5/a;for(let g=0,M=0;g<d.length;g+=3,M+=2)switch(l.fromArray(d,g),c.copy(l),c.x-=Math.sign(c.x)*m,c.y-=Math.sign(c.y)*m,c.z-=Math.sign(c.z)*m,c.normalize(),d[g+0]=h.x*Math.sign(l.x)+c.x*r,d[g+1]=h.y*Math.sign(l.y)+c.y*r,d[g+2]=h.z*Math.sign(l.z)+c.z*r,u[g+0]=c.x,u[g+1]=c.y,u[g+2]=c.z,Math.floor(g/f)){case 0:y.set(1,0,0),p[M+0]=pn(y,c,"z","y",r,n),p[M+1]=1-pn(y,c,"y","z",r,t);break;case 1:y.set(-1,0,0),p[M+0]=1-pn(y,c,"z","y",r,n),p[M+1]=1-pn(y,c,"y","z",r,t);break;case 2:y.set(0,1,0),p[M+0]=1-pn(y,c,"x","z",r,e),p[M+1]=pn(y,c,"z","x",r,n);break;case 3:y.set(0,-1,0),p[M+0]=1-pn(y,c,"x","z",r,e),p[M+1]=1-pn(y,c,"z","x",r,n);break;case 4:y.set(0,0,1),p[M+0]=1-pn(y,c,"x","y",r,e),p[M+1]=1-pn(y,c,"y","x",r,t);break;case 5:y.set(0,0,-1),p[M+0]=pn(y,c,"x","y",r,e),p[M+1]=1-pn(y,c,"y","x",r,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}};function Yr(){let i=new Map,e=new Map,t=new Map,n=!1;function s(o){if(t.has(o))return t.get(o);let l=64,c=new Uint8Array(l*l*4);for(let d=0;d<l;d++)for(let u=0;u<l;u++){let p=(u*73+d*151+u*d*17)%31/31,f=235;o==="wood"&&(f=190+35*Math.sin(d*.6+Math.sin(u*.14)*2)+p*20),o==="metal"&&(f=215+d%3*6+p*12),o==="brick"&&(f=d%16<2||(u+Math.floor(d/16)%2*16)%32<2?145:230+p*20),o==="fabric"&&(f=205+(u+d)%2*23+p*15),o==="leaf"&&(f=185+35*Math.sin((u-d)*.25)+(Math.abs(u-32)<2?35:0)),o==="tile"&&(f=u<2||d<2?145:242+p*10);let y=(d*l+u)*4;c[y]=c[y+1]=c[y+2]=f,c[y+3]=255}let h=new Oi(c,l,l);return h.colorSpace=Bt,h.wrapS=h.wrapT=gs,h.magFilter=Pt,h.minFilter=On,h.generateMipmaps=!0,h.needsUpdate=!0,t.set(o,h),h}function r(o="plain",l="#ffffff",c={}){if(n)throw new Error("Disposed material pool");let h=JSON.stringify([o,l,c]);return e.has(h)||e.set(h,new Cr({color:l,roughness:o==="metal"?.34:.78,metalness:o==="metal"?.65:0,map:o==="plain"?null:s(o),...c})),e.get(h)}function a(o){if(n)throw new Error("Disposed geometry pool");if(!i.has(o)){let l;switch(o){case"box":l=new Un(1,1,1);break;case"round":l=new ml(1,1,1,2,.12);break;case"sphere":l=new Tr(.5,20,12);break;case"cylinder":l=new Ms(.5,.5,1,20);break;case"cone":l=new mr(.5,1,20);break;case"torus":l=new Ar(.4,.1,8,24);break;case"star":{let c=new ws;for(let h=0;h<10;h++){let d=h*Math.PI/5+Math.PI/2,u=h%2?.23:.5,p=Math.cos(d)*u,f=Math.sin(d)*u;h?c.lineTo(p,f):c.moveTo(p,f)}c.closePath(),l=new wr(c,{depth:.13,bevelEnabled:!0,bevelSegments:2,steps:1,bevelSize:.04,bevelThickness:.04});break}default:throw new Error(`Unknown geometry: ${o}`)}i.set(o,l)}return i.get(o)}return{material:r,geometry:a,stats:()=>({geometries:i.size,materials:e.size,textures:t.size}),dispose(){n||(n=!0,i.forEach(o=>o.dispose()),e.forEach(o=>o.dispose()),t.forEach(o=>o.dispose()),i.clear(),e.clear(),t.clear())}}}function Dt(i,e="asset"){let t=!i;i??=Yr();let n=new Zt;n.name=e;function s(o,l,c=[1,1,1],h=[0,0,0],d="",u=n,p="plain",f={}){let y=new Wt(i.geometry(o),i.material(p,l,f));return y.scale.set(...c),y.position.set(...h),y.name=d,y.castShadow=!0,y.receiveShadow=!0,u.add(y),y}function r(o,l,c=n){let h=new Zt;return h.name=o,h.position.set(...l),c.add(h),h}let a=!1;return{group:n,pool:i,part:s,joint:r,update(o){n.position.set(o.x??0,o.y??0,0)},dispose(){a||(a=!0,n.traverse(o=>{o.isInstancedMesh&&o.dispose()}),n.removeFromParent(),n.clear(),t&&i.dispose())}}}function Ou(i="chip",e){let t=Dt(e,i),{group:n,part:s,joint:r}=t,a=i==="dale",o=a?"#ad652e":"#85502e",l="#f4d8aa",c="#392723",h=r("body",[0,0,0]),d=r("striped-tail",[-.24,.41,-.18],h);d.rotation.z=-.45,s("sphere",o,[.27,.69,.24],[0,.13,0],"tail",d);for(let[m,g]of[[-.065,l],[0,c],[.065,l]])s("sphere",g,[.048,.57,.035],[m,.16,.116],"tail-stripe",d);if(s("sphere",l,[.45,.58,.34],[0,.51,.02],"belly",h),a){let m=s("sphere","#db4537",[.54,.46,.39],[0,.57,0],"floral-shirt",h,"fabric");for(let g=0;g<9;g++){let M=(g%3-1)*.14,S=.43+Math.floor(g/3)*.12;for(let v=0;v<5;v++)s("sphere","#ffdc81",[.046,.05,.02],[M+Math.cos(v*1.257)*.025,S+Math.sin(v*1.257)*.026,.193],"flower-petal",h)}m.rotation.z=-.04}else{for(let m of[-1,1])s("sphere","#995e39",[.2,.43,.37],[m*.19,.57,0],"jacket",h,"fabric");for(let m of[-1,1]){let g=s("round","#c79050",[.1,.24,.06],[m*.125,.69,.18],"lapel",h,"fabric");g.rotation.z=m*.28}}let u=r("head",[0,.97,.025],h);s("sphere",o,[.66,.56,.43],[0,0,0],"head-fur",u);for(let m of[-1,1]){s("sphere",o,[.23,.28,.16],[m*.27,.2,-.025],"ear",u),s("sphere","#daac80",[.14,.18,.035],[m*.27,.2,.061],"inner-ear",u),s("sphere",l,[.32,.25,.19],[m*.145,-.12,.18],"cheek",u),s("sphere","#fff8e7",[.18,.245,.085],[m*.125,.046,.214],"eye",u),s("sphere","#292126",[.075,.125,.045],[m*.123+.02,.037,.254],"pupil",u),s("sphere","#ffffff",[.027,.038,.012],[m*.123+.033,.07,.274],"eye-glint",u);let g=s("sphere",c,[.2,.045,.04],[m*.125,.185,.204],"brow",u);g.rotation.z=m*(a?.2:-.12)}s("sphere",a?"#cd3d36":"#302125",[a?.18:.125,.115,.12],[0,-.075,.326],"nose",u),s("sphere","#663724",[.18,.086,.04],[0,-.202,.241],"smile",u);for(let m of[-1,1])s("round","#fff6df",[.051,.084,.04],[m*.029,-.18,.262],"tooth",u);if(a)for(let m of[-1,0,1]){let g=s("cone",o,[.13,.2,.1],[m*.09,.29,.015],"tuft",u);g.rotation.z=m*.25}else{let m=r("fedora",[0,.27,0],u);m.rotation.z=-.1,s("sphere","#b9945c",[.76,.09,.58],[0,0,0],"hat-brim",m,"fabric"),s("round","#b9945c",[.47,.24,.36],[0,.1,-.025],"hat-crown",m,"fabric"),s("round","#57412e",[.485,.075,.37],[0,.055,-.025],"hat-ribbon",m)}let p=[],f=[];for(let m of[-1,1]){let g=r(m<0?"left-arm":"right-arm",[m*.25,.68,.01],h);p.push(g),s("sphere",a?"#dc493b":"#955e39",[.17,.31,.19],[0,-.11,0],"sleeve",g,"fabric"),s("sphere",l,[.18,.18,.18],[0,-.29,.025],"hand",g);let M=r(m<0?"left-leg":"right-leg",[m*.13,.3,0],h);f.push(M),s("sphere",o,[.18,.26,.23],[0,-.1,0],"leg",M),s("sphere",o,[.24,.13,.33],[m*.025,-.24,.07],"foot",M)}let y=t.update;return t.update=(m,g=0)=>{y(m),n.rotation.y=(m.facing??1)<0?-.38:.38;let M=m.animation==="run"||m.carrying&&Math.abs(m.vx??0)>.1,S=M?Math.sin(g*17)*.57:0;h.scale.y=m.hidden?.38:1,h.position.y=M?Math.abs(Math.sin(g*17))*.025:Math.sin(g*3)*.008;for(let v=0;v<2;v++){f[v].rotation.z=(v?1:-1)*S,p[v].rotation.z=m.carrying?v?2.95:-2.95:(v?S:-S)*.7,p[v].position.y=m.carrying?.75:.68;let E=m.carrying?2.4:1;p[v].getObjectByName("sleeve").scale.y=.31*E,p[v].getObjectByName("sleeve").position.y=-.11*E,p[v].getObjectByName("hand").position.y=-.29*E}(m.animation==="jump"||m.animation==="held")&&(f[0].rotation.z=-.35,f[1].rotation.z=.35,m.carrying||(p[0].rotation.z=-1,p[1].rotation.z=1)),u.rotation.z=m.animation==="hurt"?.2:Math.sin(g*2)*.018,d.rotation.z=-.45+S*.12,n.visible=(m.lives??1)>0&&(!(m.invulnerable>0)||Math.floor(g*15)%3!==0)},t}var Si="#e9b952",ln="#abbcc2",Vn="#37424c",$r="#f5dfae";function Xi(i,e,t=.7,n=.16,s=.12){for(let r of[-1,1])i.part("sphere","#fff9df",[s,s*1.2,s*.45],[r*n,t,.29],"eye",e),i.part("sphere","#242638",[s*.45,s*.65,s*.25],[r*n+.015,t,.318],"pupil",e)}function Mi(i,e,t,n=2){for(let s=0;s<n;s++){let r=(s-(n-1)/2)*(.65/n);i.part("sphere",t,[.18,.22,.28],[r,.12,.01],"foot",e)}}function wi(i,e=1,t=1){let n=i.update;return i.update=(s,r=0)=>{n(s),i.group.scale.set((s.w??e)/e,(s.h??t)/t,1),i.group.rotation.y=(s.facing??1)<0?-.22:.22},i}function Bu(i,e=!1){let t=Dt(i,e?"bigcrate":"crate");t.part("round","#bf874e",[.96,.96,.88],[0,.5,0],"wooden-box",t.group,"wood");for(let s of[-1,1])t.part("box","#e2b778",[.12,.94,.08],[s*.37,.5,.47],"frame",t.group,"wood"),t.part("box","#e2b778",[.94,.11,.08],[0,.5+s*.37,.47],"frame",t.group,"wood");let n=t.part("box","#deb078",[.12,1.04,.08],[0,.5,.49],"diagonal-brace",t.group,"wood");n.rotation.z=-.7;for(let s of[-.36,.36])for(let r of[.13,.87])t.part("sphere",Vn,[.045,.045,.025],[s,r,.527],"nail");return wi(t)}function By(i){let e=Dt(i,"metal");e.part("round",ln,[.96,.96,.88],[0,.5,0],"metal-box",e.group,"metal"),e.part("round",Vn,[.67,.67,.03],[0,.5,.455],"recess");let t=e.part("torus",ln,[.56,.56,.23],[0,.5,.49],"vent-ring",e.group,"metal");for(let n=0;n<5;n++)e.part("box",ln,[.46,.045,.06],[0,.34+n*.08,.5],"vent",e.group,"metal");return wi(e)}function zy(i){let e=Dt(i,"apple");for(let s of[-.14,.14])e.part("sphere","#df483b",[.65,.8,.75],[s,.44,0],"apple-lobe");let t=e.part("cylinder","#724530",[.06,.23,.06],[0,.88,0],"stem");t.rotation.z=-.25;let n=e.part("sphere","#77a852",[.35,.1,.15],[.15,.9,0],"leaf",e.group,"leaf");return n.rotation.z=.4,wi(e)}function zu(i){let e=Dt(i,"ball");e.part("sphere","#e56337",[.96,.96,.96],[0,.5,0],"ball");for(let t of[0,Math.PI/2]){let n=e.part("torus","#fff0ac",[1.02,1.02,.09],[0,.5,0],"ball-seam");n.rotation.y=t}return wi(e)}function Vu(i,e){switch(i){case"crate":return Bu(e);case"bigcrate":return Bu(e,!0);case"metal":return By(e);case"apple":return zy(e);case"ball":return zu(e);default:throw new Error(`Unknown object ${i}`)}}function rh(i,e){let t=Dt(e,i),{part:n,group:s}=t;switch(s.userData.silhouette=i,i){case"dog":n("round","#699bb0",[.73,.43,.44],[0,.47,0],"robot-dog-body",s,"metal"),n("round",ln,[.48,.4,.44],[.24,.71,.02],"head",s,"metal"),n("round",Vn,[.26,.15,.28],[.45,.65,.18],"muzzle");for(let a of[-1,1])n("cone",Vn,[.16,.25,.19],[.15+a*.19,.95,0],"ear"),n("cylinder",Vn,[.22,.13,.22],[a*.27,.17,0],"wheel").rotation.x=Math.PI/2;n("sphere","#ec7856",[.09,.1,.05],[.33,.79,.26],"eye");break;case"bird":case"pelican":n("sphere",i==="bird"?"#ab75c0":"#e9e6d4",[.62,.64,.44],[0,.49,0],"bird-body"),n("sphere","#eee4c9",[.42,.4,.42],[.12,.78,.07],"bird-head"),n("cone","#e9b047",[i==="pelican"?.57:.3,.25,.19],[.32,.7,.2],"beak").rotation.z=-Math.PI/2;for(let a of[-1,1]){let o=n("sphere",i==="bird"?"#77549b":"#a6bcc6",[.42,.2,.19],[a*.35,.53,0],`wing-${a}`);o.rotation.z=a*.4}Xi(t,t.joint("bird-face",[.12,0,-.024]),.845,.08,.115),Mi(t,s,"#dfac52");break;case"caterpillar":for(let a=0;a<4;a++)n("sphere",a===3?"#c4d955":"#73a54d",[.35,.48,.42],[-.33+a*.22,.36,0],`segment-${a}`),n("sphere","#bd7845",[.16,.12,.23],[-.33+a*.22,.08,.1],"foot");n("sphere","#243428",[.06,.09,.035],[.38,.49,.2],"eye");break;case"mouse":case"kangaroo":{let a=i==="mouse"?"#b1a3bf":"#b88763";n("sphere",a,[.52,.64,.4],[0,.45,0],"body"),n("sphere",a,[.5,.38,.4],[.1,.78,.03],"head");for(let l of[-1,1])n("sphere","#cfabb4",[.22,i==="mouse"?.25:.45,.12],[l*.17,.94,-.02],"ear");n("sphere",$r,[.36,.2,.2],[.12,.69,.23],"muzzle"),n("sphere","#49303a",[.1,.07,.065],[.13,.75,.33],"nose"),Xi(t,s,.84,.1,.09),Mi(t,s,a);let o=n("sphere",a,[.58,.12,.12],[-.37,.23,-.1],"tail");o.rotation.z=.4;break}case"mimic":{n("round","#936148",[.96,.64,.88],[0,.36,0],"wooden-box",s,"wood");let a=t.joint("mimic-lid",[0,.72,-.38]);n("round","#b47c4e",[.98,.25,.91],[0,.125,.38],"lid",a,"wood"),n("box","#623f48",[.98,.05,.06],[0,.015,.86],"lid-rim",a);for(let o of[-1,1]){n("box","#d7aa6b",[.1,.61,.06],[o*.38,.36,.48],"frame",s,"wood"),n("sphere","#fff7cb",[.22,.22,.1],[o*.21,.15,.93],"eye",a),n("sphere","#332438",[.105,.15,.055],[o*.21,.15,.995],"pupil",a);let l=n("round","#623f48",[.25,.045,.05],[o*.21,.28,.965],"eyebrow",a);l.rotation.z=o*.25}n("round","#392331",[.8,.08,.09],[0,.72,.53],"mouth"),n("sphere","#d86b79",[.31,.07,.07],[0,.71,.59],"tongue");for(let o of[-.25,0,.25])n("cone","#fff6df",[.14,.19,.12],[o,.71,.59],"tooth"),n("cone","#fff6df",[.14,.19,.12],[o,-.05,.94],"tooth",a).rotation.z=Math.PI;break}case"toy":n("round","#d66556",[.55,.5,.4],[0,.48,0],"body",s,"metal"),n("round","#e7ba65",[.52,.34,.43],[0,.85,.02],"head",s,"metal"),Xi(t,s,.87,.14,.11),Mi(t,s,Vn);for(let a of[-1,1])n("sphere",ln,[.16,.39,.18],[a*.36,.5,0],"arm",s,"metal");n("torus",Si,[.28,.28,.15],[.4,.65,-.22],"windup-key");break;case"bee":n("sphere","#e8b94d",[.55,.58,.45],[0,.5,0],"bee-body");for(let a of[.36,.54])n("torus",Vn,[.61,.25,.61],[0,a,0],"stripe").rotation.x=Math.PI/2;for(let a of[-1,1])n("sphere","#d5f6f5",[.4,.51,.065],[a*.31,.79,-.04],`wing-${a}`,s,"plain",{transparent:!0,opacity:.72});Xi(t,s,.69,.12,.11);break;case"rhino":n("sphere","#909daf",[.87,.67,.55],[0,.47,0],"rhino"),n("sphere","#a8b2bc",[.5,.44,.51],[.31,.57,.09],"head"),n("cone",$r,[.17,.37,.17],[.49,.85,.15],"horn"),Mi(t,s,"#6d798d",4),n("sphere","#273040",[.065,.09,.04],[.36,.68,.35],"eye");break;case"crab":n("sphere","#ce6147",[.69,.44,.52],[0,.35,0],"shell");for(let a of[-1,1])n("sphere","#db7454",[.26,.3,.23],[a*.4,.66,.04],"claw"),n("cylinder","#d97d53",[.07,.3,.07],[a*.15,.66,.19],"eye-stalk"),n("sphere","#202a32",[.1,.12,.1],[a*.15,.82,.2],"eye");Mi(t,s,"#c96046",6);break;case"lizard":n("sphere","#6ba96b",[.8,.43,.35],[0,.4,0],"body"),n("sphere","#a3c577",[.4,.33,.38],[.35,.57,.03],"head"),n("cone","#559361",[.25,.72,.24],[-.57,.31,-.07],"tail").rotation.z=Math.PI/2,Mi(t,s,"#619757",4),n("sphere","#292c2d",[.07,.09,.045],[.38,.63,.22],"eye");break;default:throw new Error(`Unknown enemy ${i}`)}let r=wi(t).update;return t.update=(a,o=0)=>{r(a,o),s.scale.x*=(a.facing??1)<0?-1:1;for(let l of[-1,1]){let c=s.getObjectByName(`wing-${l}`);c&&(c.rotation.z=l*(.3+Math.sin(o*20)*.6))}if(i==="mimic"){let l=a.animation==="lunge",c=l?.44+.14*(.5+.5*Math.sin(o*22)):.015;s.getObjectByName("mimic-lid").rotation.x=-c;let h=s.getObjectByName("mouth"),d=.04+Math.sin(c)*.8;h.scale.y=d,h.position.y=.68+d/2,s.traverse(u=>{["mouth","tooth","tongue"].includes(u.name)&&(u.visible=l),u.name==="eye"&&(u.scale.y=l?.22:.16)})}},t}function Gu(i,e){let t=Dt(e,i),{part:n,group:s}=t;switch(i){case"flower":n("cylinder","#5d914b",[.055,.5,.055],[0,.25,0],"stem");for(let a=0;a<6;a++){let o=a*Math.PI/3;n("sphere","#f2c851",[.25,.25,.14],[Math.cos(o)*.19,.68+Math.sin(o)*.19,0],"petal")}n("sphere","#986539",[.2,.2,.15],[0,.68,.06],"flower-heart");break;case"star":n("star",Si,[.9,.9,1],[0,.5,0],"star",s,"metal",{emissive:"#946626",emissiveIntensity:.22});break;case"acorn":n("sphere","#b37b43",[.59,.65,.5],[0,.4,0],"acorn"),n("sphere","#694b31",[.66,.3,.55],[0,.68,0],"cap",s,"wood"),n("cylinder","#61472f",[.09,.19,.09],[0,.88,0],"stem");break;case"zipper":n("sphere","#4dbca6",[.4,.65,.35],[0,.5,0],"zipper-body");for(let a of[-1,1])n("sphere","#e8ffff",[.45,.5,.06],[a*.24,.61,-.12],"wing",s,"plain",{transparent:!0,opacity:.7}),n("sphere","#ffffff",[.23,.3,.12],[a*.1,.77,.12],"eye"),n("sphere","#222d3e",[.075,.14,.05],[a*.1,.79,.19],"pupil");break;default:throw new Error(`Unknown pickup ${i}`)}let r=wi(t).update;return t.update=(a,o=0)=>{r(a,o),s.rotation.y=Math.sin(o*2)*.35},t}function Hu(i,e){if(i==="alien"){let r=rh("mouse",e);return r.group.traverse(a=>{a.isMesh&&["body","head","ear"].includes(a.name)&&(a.material=r.pool.material("plain","#9dbb63"))}),r}if(i==="colorBall"){let r=zu(e),a=r.update,o;return r.group.traverse(l=>{l.isMesh&&l.name==="ball"&&(o=l)}),r.update=(l,c)=>{a(l,c),o.material=r.pool.material("plain",{red:"#dc6253",blue:"#649fcb",green:"#92b968"}[l.color]??"#e56337")},r}if(i==="segment"){let r=Dt(e,"segment");r.part("sphere","#98bd54",[.9,.78,.65],[0,.46,0],"segment-body");for(let a of[-.3,.3])r.part("sphere","#cba277",[.24,.18,.27],[a,.12,.08],"foot");return wi(r)}let t=Dt(e,i),{part:n,group:s}=t;switch(i){case"lightning":case"spark":for(let r=0;r<4;r++){let a=n("round","#d9f7a2",[.16,.35,.13],[Math.sin(r*2)*.14,.15+r*.22,0],"electric-bolt",s,"plain",{emissive:"#bcff55",emissiveIntensity:1});a.rotation.z=r%2?.7:-.7}break;case"feather":n("sphere","#d2a873",[.32,.85,.12],[0,.5,0],"feather"),n("cylinder","#fff3d5",[.05,.9,.05],[0,.5,.04],"shaft");break;case"token":n("cylinder",Si,[.83,.15,.83],[0,.5,0],"coin",s,"metal").rotation.x=Math.PI/2,n("star","#fff2b1",[.43,.43,.5],[0,.5,.1],"coin-star");break;case"ash":n("sphere","#a99889",[.65,.7,.5],[0,.45,0],"ash",s,"plain",{emissive:"#d95b29",emissiveIntensity:.25});for(let r=0;r<3;r++)n("sphere","#ddc3a9",[.32,.32,.28],[Math.sin(r*3)*.2,.65+r*.15,-.1],"smoke");break;case"gear":n("torus",ln,[.8,.8,.3],[0,.5,0],"gear",s,"metal");for(let r=0;r<8;r++){let a=r*Math.PI/4,o=n("box",ln,[.18,.23,.15],[Math.sin(a)*.4,.5+Math.cos(a)*.4,0],"cog",s,"metal");o.rotation.z=-a}break;case"drop":n("sphere","#88cbd2",[.6,.73,.55],[0,.36,0],"drop"),n("cone","#a9e1e2",[.46,.48,.44],[0,.8,0],"drop-tip");break;default:throw new Error(`Unknown projectile ${i}`)}return wi(t)}function gl(i,e){let t=Dt(e,i),{part:n,joint:s,group:r}=t;switch(r.userData.silhouette=i,i){case"robot":{n("cylinder","#d65f72",[.25,.79,.35],[0,.43,0],"coil-core",r,"metal");for(let a=0;a<13;a++)n("torus",a%2?"#df8cab":"#4e6d9f",[.35,.11,.4],[0,.1+a*.055,0],"coil-ring",r,"metal").rotation.x=Math.PI/2;for(let a of[-1,1]){let o=s(a<0?"contact-arm-left":"contact-arm-right",[a*.38,.45,0]);for(let l=0;l<3;l++){let c=n("cylinder",ln,[.04,.22,.08],[a*-.03,(l-1)*.27,0],"arm-link",o,"metal");c.rotation.z=a*(l%2?.8:-.8),n("sphere",ln,[.1,.1,.12],[a*.06,(l-1)*.27+.05,0],"elbow",o,"metal"),n(l===0?"round":"sphere",l===0?"#c88a55":"#ede4d2",[.18,.12,.2],[a*.025,(l-1)*.27,0],"hand-brush",o)}}for(let a of[-1,1])for(let o of[.2,.47,.74]){let l=n("cylinder",ln,[.035,.34,.055],[a*.22,o,-.05],"arm-connector",r,"metal");l.rotation.z=Math.PI/2}n("sphere","#aeef54",[.15,.12,.23],[0,.92,0],"weakpoint",r,"plain",{emissive:"#64ad19",emissiveIntensity:.6});break}case"toyRobot":n("round","#6f8a90",[.56,.57,.43],[0,.46,0],"armour",r,"metal"),n("round",ln,[.48,.24,.42],[0,.83,0],"head",r,"metal"),n("round",Vn,[.34,.07,.04],[0,.85,.23],"visor");for(let a of[-.11,.11])n("sphere","#d7eea6",[.07,.07,.04],[a,.85,.26],"eye");n("round","#e8bd53",[.2,.14,.06],[0,.53,.24],"weakpoint",r,"plain",{emissive:"#f4a828",emissiveIntensity:.6});for(let a of[-1,1]){n("sphere",ln,[.22,.37,.3],[a*.36,.44,0],"arm",r,"metal"),n("round",Vn,[.35,.18,.48],[a*.2,.1,0],"tank-tread");for(let o=0;o<4;o++)n("sphere",ln,[.07,.1,.06],[a*.2-.11+o*.075,.1,.25],"tread-wheel",r,"metal")}break;case"owl":n("sphere","#a97144",[.56,.69,.42],[0,.43,0],"owl-body"),n("sphere",$r,[.39,.49,.06],[0,.4,.23],"breast");for(let a of[-1,1])n("sphere","#8b5739",[.45,.26,.18],[a*.37,.56,0],`wing-${a}`),n("sphere","#ead8b1",[.29,.33,.1],[a*.14,.77,.18],"eye-mask"),n("sphere","#f8e874",[.14,.17,.08],[a*.14,.78,.25],"eye"),n("sphere","#2e2830",[.07,.1,.03],[a*.14,.78,.3],"pupil"),n("cone","#744732",[.19,.26,.2],[a*.2,.98,0],"ear");n("cone","#e4ad43",[.17,.22,.14],[0,.61,.27],"beak").rotation.z=Math.PI,Mi(t,r,Si);break;case"ufo":n("sphere","#90aa9c",[.99,.29,.72],[0,.39,0],"saucer",r,"metal"),n("sphere","#9ce6d5",[.51,.47,.44],[0,.65,0],"dome",r,"plain",{metalness:.35,roughness:.2}),n("torus",Si,[1,.34,.7],[0,.4,0],"rim",r,"metal").rotation.x=Math.PI/2;for(let a of[-.3,0,.3])n("sphere","#f8c66c",[.11,.11,.07],[a,.38,.35],"navigation-light",r,"plain",{emissive:"#f9c457",emissiveIntensity:.5});Xi(t,r,.66,.13,.12);break;case"electricFish":n("sphere","#a4bf4c",[.72,.61,.45],[0,.5,0],"fish-body"),n("sphere",$r,[.6,.34,.1],[0,.4,.24],"belly");for(let a of[-1,1])n("cone","#738d36",[.28,.43,.17],[a*.4,.53,0],"fin").rotation.z=a*Math.PI/2,n("sphere","#f8f0ce",[.2,.23,.12],[a*.16,.68,.19],"eye"),n("sphere","#27342e",[.08,.11,.04],[a*.16,.7,.27],"pupil");for(let a=0;a<5;a++)n("cone",Si,[.08,.25,.1],[-.2+a*.1,.88,0],"spine");break;case"casinoCat":case"fatCat":{let a=i==="fatCat";n("sphere",a?"#7b6a83":"#648cbe",[.83,.66,.48],[0,.36,0],"suit",r,"fabric"),n("sphere","#e5d6ba",[.42,.5,.07],[0,.43,.26],"shirt");for(let o of[-1,1])n("round",a?"#654e6a":"#315788",[.19,.45,.09],[o*.23,.43,.25],"lapel").rotation.z=o*.25,n("sphere",a?"#95847d":"#938e98",[.26,.34,.27],[o*.4,.47,.07],"hand"),n("cone",a?"#928078":"#817780",[.21,.27,.19],[o*.2,.96,0],"cat-ear");n("sphere",a?"#a99b89":"#a3a0a7",[.59,.43,.4],[0,a?.835:.78,0],"head");for(let o of[-1,1])n("sphere",$r,[.27,.17,.1],[o*.13,a?.775:.7,.22],"muzzle");if(Xi(t,r,a?.905:.82,.135,.12),n("sphere","#785157",[.14,.09,.08],[0,a?.815:.74,.29],"nose"),n("round","#be6860",[.15,.16,.06],[0,.53,.32],"tie"),Mi(t,r,Vn),a){let o=s("chair",[0,0,-.16]);n("round","#65516a",[.96,.06,.62],[0,0,0],"chair-seat",o,"fabric"),n("round","#8b6c51",[.96,.8,.1],[0,.38,-.28],"chair-back",o,"wood"),n("round","#775c72",[.8,.65,.06],[0,.38,-.215],"chair-cushion",o,"fabric");for(let c of[-.39,.39])for(let h of[-.23,.23])n("cylinder",Si,[.055,.15,.055],[c,-.11,h],"chair-leg",o,"metal");for(let c of[-.45,.45])n("sphere",Si,[.08,.08,.08],[c,.82,-.28],"chair-finial",o,"metal");n("sphere","#5b3b37",[.13,.055,.06],[-.16,.78,.29],"mouth");for(let c of[-1,1]){let h=n("round","#5c5355",[.19,.035,.035],[c*.135,.98,.28],"brow");h.rotation.z=c*.25}let l=s("cigar-tip",[-.16,.78,.32]);n("cylinder","#875237",[.04,.19,.04],[-.09,0,0],"cigar",l).rotation.z=Math.PI/2,n("sphere","#f1a366",[.035,.04,.04],[0,0,0],"ember",l,"plain",{emissive:"#ec591a",emissiveIntensity:.8})}else n("cylinder","#344960",[.58,.1,.47],[0,.99,0],"hat-brim"),n("cylinder","#344960",[.4,.21,.35],[0,1.08,0],"top-hat");break}case"caterpillar":for(let a=0;a<5;a++){let o=s(`body-segment-${a}`,[0,.1+a*.2,0]);n("sphere",a===4?"#c98a58":"#97bf50",[.98,.87,.48],[0,.48,0],"segment",o);for(let l of[-1,1])n("sphere","#d2a86e",[.19,.15,.23],[l*.27,.08,.08],"foot",o);a===4&&Xi(t,o,.63,.17,.19)}break;default:throw new Error(`Unknown Boss ${i}`)}return t.update=(a,o=0)=>{r.position.set(a.x,a.y,0),r.scale.set(a.w??2,a.h??2.4,Math.min(a.w??2,3)),r.visible=!a.defeated&&a.phase!=="separated";let l=r.getObjectByName("weakpoint");if(l&&a.weakpoint&&(l.position.x=(a.weakpoint.x-a.x)/a.w,l.position.y=(a.weakpoint.y+a.weakpoint.h/2-a.y)/a.h,l.scale.x=a.weakpoint.w/a.w,l.scale.y=a.weakpoint.h/a.h),i==="robot")for(let[d,u]of["contact-arm-left","contact-arm-right"].entries()){let p=a.contactRegions?.[d];if(p){let f=r.getObjectByName(u);f.position.x=(p.x-a.x)/a.w,f.position.y=(p.y+p.h/2-a.y)/a.h}}let c=r.getObjectByName("chair");if(c){let d=((a.arena?.y??a.y-1.2)-a.y)/a.h;c.traverse(u=>{u.name==="chair-leg"&&(u.position.y=(d-.03)/2,u.scale.y=Math.max(.01,-.03-d))})}let h=r.getObjectByName("cigar-tip");if(h&&a.anchors?.mouth){h.position.x=(a.anchors.mouth.x-a.x)/a.w,h.position.y=(a.anchors.mouth.y-a.y)/a.h;let d=r.getObjectByName("mouth");d.position.x=h.position.x,d.position.y=h.position.y}if(i==="caterpillar")for(let d=0;d<5;d++){let u=r.getObjectByName(`body-segment-${d}`),p=a.segments?.[d];u.visible=!!p,p&&(u.position.set((p.x-a.x)/a.w,(p.y-a.y)/a.h,0),u.scale.set(p.w/a.w,p.h/a.h,1))}for(let d of[-1,1]){let u=r.getObjectByName(`wing-${d}`);u&&(u.rotation.z=d*Math.sin(o*6)*.45)}},t}var Yi={street:{sky:"#b5d5d3",fog:"#b5d5d3",surface:"#b59375",accent:"#779c9a"},tree:{sky:"#a8cdc4",fog:"#adcbb3",surface:"#a47a48",accent:"#6d9556"},kitchen:{sky:"#e1c7aa",fog:"#d7c4b1",surface:"#aa7450",accent:"#81aaa2"},study:{sky:"#beb8c2",fog:"#cbc1b6",surface:"#a48161",accent:"#987886"},toys:{sky:"#bfb9d2",fog:"#c8bfd1",surface:"#b78c74",accent:"#888db8"},river:{sky:"#b2d6d1",fog:"#bad9d1",surface:"#a78460",accent:"#6ba69a"},factory:{sky:"#a7b6b8",fog:"#aebabc",surface:"#7f979a",accent:"#c79d57"},casino:{sky:"#8e879e",fog:"#a7a0b1",surface:"#b1816f",accent:"#cfb571"},sewer:{sky:"#829b9c",fog:"#a1b7b0",surface:"#7e9ba1",accent:"#b78660"},office:{sky:"#c0cdd0",fog:"#c0cbcb",surface:"#a48c76",accent:"#6d9baa"},fatcat:{sky:"#93949e",fog:"#a2a1aa",surface:"#819194",accent:"#b4756c"},bonus:{sky:"#c3b2cc",fog:"#c8b7ce",surface:"#d0a875",accent:"#efc86d"}},qi="#a57547",Ut="#a9bbc0",En="#485b65",Tn="#d9b664";function at(i,e,t,n,s="plain",r="repeated-detail"){if(!n.length)return;let a=new Bi(i.pool.geometry(e),i.pool.material(s,t),n.length),o=new Rt;a.name=r;for(let[l,c]of n.entries())o.position.set(...c.p),o.scale.set(...c.s),o.rotation.set(0,0,c.r??0),o.updateMatrix(),a.setMatrixAt(l,o.matrix);return a.castShadow=!0,a.receiveShadow=!0,a.instanceMatrix.needsUpdate=!0,i.group.add(a),a}function xt(i,e){return Array.from({length:i},(t,n)=>e(n))}function Vy(i,e,t="street"){let n=Dt(e,`decor:${i.id??i.kind}`),{part:s,group:r}=n;r.userData.kind=i.kind;let a=(p,f,y,m,g="plain")=>s("round",p,f,y,m,r,g),o=(p,f,y,m,g="metal")=>s("cylinder",p,f,y,m,r,g),l=(p,f,y,m,g="plain")=>s("sphere",p,f,y,m,r,g),c=(p=qi)=>{for(let f of[.27,.72])a(p,[1,.065,.09],[0,f,.05],"cross-rail","wood");at(n,"round",p,xt(Math.max(5,Math.min(30,Math.round(i.w??10))),f=>({p:[-.48+f/(Math.max(5,Math.min(30,Math.round(i.w??10)))-1)*.96,.5,.01],s:[.025,.98,.11]})),"wood","fence-pickets")},h=()=>{let p=(i.w??1)>(i.h??1);o(t==="sewer"?"#b8794a":Ut,p?[.2,1,.2]:[.72,1,.65],[0,.5,0],"pipe").rotation.z=p?Math.PI/2:0;for(let f of[-.4,.4]){let y=s("torus",t==="sewer"?"#c89968":"#6e8790",p?[.3,.3,.25]:[.87,.87,.35],p?[f,.5,0]:[0,.5+f,0],"pipe-collar",r,"metal");y.rotation.y=p?Math.PI/2:0,y.rotation.x=p?0:Math.PI/2}},d=(p=qi)=>{a(p,[1,.94,.46],[0,.48,0],"cabinet","wood"),a("#4d4d4b",[.91,.82,.025],[0,.5,.25],"interior");for(let f of[.11,.38,.65,.92])a(p,[1,.045,.58],[0,f,.025],"shelf","wood")},u=(p=qi)=>{a(p,[1,.12,.7],[0,.91,0],"table-top","wood");for(let f of[-.4,.4])a(p,[.055,.9,.12],[f,.45,0],"table-leg","wood")};switch(i.kind){case"fence":c();break;case"planter":o("#b27558",[.84,.56,.73],[0,.28,0],"terracotta","plain"),o("#ce9370",[1,.13,.83],[0,.55,0],"pot-rim","plain"),o("#5f503b",[.82,.04,.7],[0,.6,0],"soil","plain"),at(n,"sphere","#759357",xt(11,f=>({p:[Math.sin(f*2.4)*.3,.7+f%3*.08,Math.cos(f*2.4)*.2],s:[.35,.35,.18],r:f})),"leaf","leaves");break;case"trash":o("#8ca3a5",[.9,.88,.83],[0,.44,0],"trash-can"),o("#b7c7c2",[1,.1,.91],[0,.93,0],"lid"),at(n,"round",Ut,xt(9,f=>({p:[-.39+f*.097,.45,.38],s:[.025,.72,.035]})),"metal","can-ribs"),a(En,[.23,.08,.1],[0,1,.05],"lid-handle");break;case"pole":o(qi,[.7,1,.65],[0,.5,0],"wood-pole","wood");for(let f of[.48,.83,.94])a("#675441",[1.9,.025,.12],[0,f,0],"crossarm","wood"),at(n,"cylinder","#c9d9d6",[-.75,-.4,.4,.75].map(y=>({p:[y,f+.025,0],s:[.15,.055,.15]})),"plain","insulators");break;case"building":case"lab":case"tileWall":case"brickWall":case"brick":{let f=i.kind==="lab",y=i.kind==="tileWall";if(a(y?"#d4ac84":f?"#92aeb0":t==="sewer"?"#69909a":"#b88f79",[1,1,.35],[0,.5,-.25],"masonry",y?"tile":"brick"),i.kind==="building"||f){let m=Math.min(18,Math.max(4,Math.round((i.w??20)/4)));at(n,"round",f?"#638c94":"#6c8a91",xt(m,g=>({p:[-.45+g/(m-1)*.9,.63,0],s:[.7/m,.4,.045]})),"metal","windows"),at(n,"box","#d2c7a7",xt(m,g=>({p:[-.45+g/(m-1)*.9,.44,.025],s:[.8/m,.025,.07]})),"plain","sills"),a("#d3c6ae",[1.04,.08,.5],[0,.96,0],"cornice")}break}case"satellite":{let f=l("#c9d4d1",[.86,.18,.74],[0,.64,0],"dish","metal");f.rotation.z=-.35,a(En,[.07,.63,.08],[0,.31,0],"antenna-stem"),o(Ut,[.04,.5,.04],[.1,.8,.14],"receiver").rotation.z=-.6;break}case"testTubes":a(qi,[1,.06,.49],[0,.1,0],"tube-rack","wood"),a(qi,[1,.05,.44],[0,.47,0],"tube-rack","wood");for(let f=0;f<5;f++){let y=-.4+f*.2;o(["#89bca4","#dba66d","#a692c1"][f%3],[.12,.68,.12],[y,.59,0],"tube","plain"),o("#e0ece0",[.14,.035,.14],[y,.95,0],"tube-lip")}break;case"pencil":o("#edbd5f",[.7,.82,.7],[-.07,.5,0],"pencil","wood").rotation.z=Math.PI/2,s("cone","#e4c89a",[.7,.18,.7],[.43,.5,0],"pencil-tip").rotation.z=-Math.PI/2,a("#c77f83",[.1,.67,.65],[-.48,.5,0],"eraser");break;case"trunk":o("#a57a4c",[.93,1,.8],[0,.5,0],"tree-trunk","wood"),at(n,"sphere","#785739",xt(12,f=>({p:[Math.sin(f*2)*.3,.05+f*.081,.32],s:[.11,.14,.045],r:.35})),"wood","bark-knots");break;case"treeHole":l("#514734",[.78,.84,.22],[0,.5,0],"tree-hole"),s("torus","#9e7446",[.98,1.14,.37],[0,.5,.02],"hole-rim",r,"wood");break;case"tree":o(qi,[.16,.78,.14],[0,.38,0],"trunk","wood");case"leaves":at(n,"sphere","#71935c",xt(26,f=>({p:[Math.sin(f*2.399)*(.12+f%5*.075),.5+Math.cos(f*1.7)*.26,Math.sin(f*.9)*.2],s:[.3,.44,.18],r:f*.4})),"leaf","leaf-canopy");break;case"counter":case"bar":d("#a9845f"),a("#d7c4a2",[1.04,.12,.69],[0,1,0],"countertop","wood");break;case"stool":o("#a77858",[.86,.13,.75],[0,.93,0],"stool-seat","wood");for(let f of[-.3,.3])a("#8d6d50",[.1,.87,.12],[f,.44,0],"stool-leg","wood");a("#b08b66",[.7,.07,.13],[0,.36,0],"footrest","wood");break;case"bottle":o("#65958b",[.58,.69,.5],[0,.34,0],"bottle-body","plain"),o("#73a599",[.23,.34,.21],[0,.83,0],"bottle-neck","plain"),o("#c5ad79",[.26,.08,.24],[0,1,0],"bottle-cap"),a("#ead7b1",[.54,.26,.035],[0,.4,.255],"label","fabric");break;case"sink":a(Ut,[1,.16,.83],[0,.93,0],"sink-rim","metal"),a("#657b84",[.82,.46,.62],[0,.67,0],"sink-basin","metal");for(let f of[-.47,.47])a(Ut,[.06,.52,.82],[f,.68,0],"sink-side","metal");o(Ut,[.08,.57,.08],[.25,.28,0],"sink-drain");break;case"faucet":o(Ut,[.15,.82,.15],[.23,.41,0],"faucet-stem"),o(Ut,[.16,.6,.16],[0,.85,0],"faucet-spout").rotation.z=Math.PI/2,o(Ut,[.17,.21,.17],[-.3,.77,0],"nozzle"),s("torus","#a6b9ba",[.4,.4,.2],[.23,.38,.14],"tap-wheel",r,"metal");break;case"stove":a("#d6c9ad",[1,.85,.56],[0,.43,0],"oven"),a(En,[.7,.5,.04],[0,.37,.3],"oven-window"),a(Ut,[1.04,.06,.62],[0,.9,0],"stovetop","metal");for(let f of[-.25,.25])s("torus",En,[.35,.35,.2],[f,.95,0],"burner").rotation.x=Math.PI/2;for(let f of[-.34,0,.34])o(En,[.1,.05,.1],[f,.75,.32],"knob").rotation.x=Math.PI/2;break;case"drain":a(En,[1,.9,.24],[0,.5,0],"grille"),at(n,"round",Ut,xt(14,f=>({p:[-.46+f*.071,.5,.15],s:[.028,.85,.07]})),"metal","drain-bars");break;case"bookshelf":d(),at(n,"round","#98a9a1",xt(33,f=>({p:[-.43+f%11*.085,.22+Math.floor(f/11)*.27,.12],s:[.045,.18+f%3*.02,.18],r:(f%5-2)*.025})),"fabric","book-spines"),at(n,"round","#b28370",xt(12,f=>({p:[-.36+f%4*.23,.24+Math.floor(f/4)*.27,.15],s:[.05,.22,.2]})),"fabric","red-books");break;case"books":for(let f=0;f<5;f++)a(["#a86460","#759899","#b9a575","#8588a2"][f%4],[.9-f*.07,.13,.56],[f%2*.025,.1+f*.18,0],"book-cover","fabric"),a("#e4d6b9",[.83-f*.07,.075,.51],[f%2*.025,.17+f*.18,.02],"pages");break;case"desk":case"table":if(u(),i.kind==="desk")for(let f of[-.31,.31]){a("#886d54",[.23,.7,.45],[f,.42,-.04],"drawer-unit","wood");for(let y of[.2,.42,.64])a(Tn,[.1,.025,.04],[f,y,.2],"drawer-handle","metal")}break;case"fan":o(Ut,[.07,.55,.07],[0,.75,0],"fan-stem"),l("#bcbca7",[.21,.18,.21],[0,.47,0],"fan-hub","metal");for(let f=0;f<4;f++){let y=f*Math.PI/2,m=a("#b29465",[.4,.065,.17],[Math.cos(y)*.27,.47+Math.sin(y)*.2,0],"fan-blade","wood");m.rotation.z=y}break;case"lamp":o(Tn,[.07,.75,.07],[0,.39,0],"lamp-stem"),s("cone","#e3c995",[.8,.36,.65],[0,.87,0],"shade",r,"fabric"),o(Tn,[.42,.06,.35],[0,.04,0],"lamp-base");break;case"toyBox":case"gift":case"catBox":case"shippingCrates":{let f=i.kind==="gift"?"#a37aa8":i.kind==="toyBox"?"#799fa5":"#ba9064";if(a(f,[1,.94,.6],[0,.47,0],"box","wood"),a("#e5c88c",[.1,.98,.04],[0,.5,.325],"ribbon"),a("#e5c88c",[1,.1,.05],[0,.6,.33],"ribbon"),i.kind==="gift")for(let y of[-1,1])s("torus",Tn,[.35,.28,.14],[y*.15,1,0],"bow").rotation.z=y*.4;else i.kind==="toyBox"?s("star","#edcc83",[.36,.36,.6],[.24,.5,.35],"star-logo"):at(n,"box","#966b44",xt(5,y=>({p:[-.4+y*.2,.5,.32],s:[.015,.85,.04]})),"wood","crate-planks");break}case"toyRobot":{let f=gl("toyRobot",n.pool);r.add(f.group),f.group.scale.set(1,1,.7);break}case"conveyor":a(En,[1,.5,.56],[0,.4,0],"conveyor-bed","metal"),at(n,"cylinder",Ut,xt(Math.min(32,Math.max(8,Math.round(i.w??8))),f=>({p:[-.46+f/(Math.min(32,Math.max(8,Math.round(i.w??8)))-1)*.92,.6,.28],s:[.025,.42,.025],r:Math.PI/2})),"metal","rollers");break;case"stairs":for(let f=0;f<5;f++)a("#9990b3",[.21,(f+1)*.19,.5],[-.4+f*.2,(f+1)*.095,0],"step","wood");break;case"pipe":case"duct":h();break;case"sluice":case"gate":a("#849d94",[1,.11,.6],[0,.96,0],"bridge-top","metal");for(let f of[-.4,.4])a("#86938b",[.15,.91,.35],[f,.46,0],"pier","brick");at(n,"box",Ut,xt(9,f=>({p:[-.34+f*.085,.53,.05],s:[.035,.72,.1]})),"metal","sluice-bars");break;case"water":a(t==="sewer"?"#719d80":"#6ca9ad",[1,.12,1],[0,.12,0],"water","plain"),at(n,"sphere","#bcdfd7",xt(12,f=>({p:[-.46+f*.083,.2,f%3*.14-.2],s:[.035,.013,.16]})),"plain","ripples");break;case"pump":case"machine":a("#809b92",[.9,.72,.56],[0,.37,0],"pump-body","metal"),s("torus",Tn,[.46,.46,.25],[0,.59,.32],"wheel",r,"metal");for(let f of[0,Math.PI/2])a(Ut,[.035,.39,.05],[0,.59,.35],"wheel-spoke","metal").rotation.z=f;o(Ut,[.12,.4,.12],[.31,.85,0],"outlet");break;case"piston":case"press":a(En,[1,.17,.52],[0,.9,0],"press-housing","metal"),o(Ut,[.19,.62,.19],[0,.54,0],"hydraulic-ram"),a("#b69c70",[.8,.14,.6],[0,.22,0],"press-head","metal");break;case"warning":a("#e5bd63",[1,.9,.1],[0,.5,0],"warning-panel"),at(n,"box",En,xt(7,f=>({p:[-.45+f*.15,.5,.07],s:[.06,.8,.025],r:-.3})),"plain","warning-stripes");break;case"slotMachine":a("#ad7752",[.84,.9,.54],[0,.48,0],"slot-case","wood"),a(Tn,[.78,.48,.07],[0,.65,.3],"slot-frame","metal"),a("#433e51",[.69,.37,.05],[0,.65,.35],"slot-window");for(let f of[-.23,0,.23])a("#e4d7b6",[.19,.28,.03],[f,.65,.39],"reel"),s("star",f===0?"#bfa444":"#b65f57",[.13,.13,.2],[f,.65,.42],"reel-symbol");a("#728c8e",[.63,.14,.18],[0,.28,.3],"payout"),o(Ut,[.045,.41,.045],[.48,.59,0],"slot-lever"),l("#b96659",[.14,.13,.13],[.48,.84,0],"lever-knob");break;case"restaurantDoor":a("#9a7159",[1,1,.2],[0,.5,0],"door-frame","wood"),a("#546f70",[.8,.86,.08],[0,.5,.14],"door"),s("torus",Tn,[.23,.3,.2],[.24,.45,.23],"door-handle",r,"metal");break;case"curtain":at(n,"cylinder",t==="fatcat"?"#927382":"#777d9c",xt(28,f=>({p:[-.48+f*.0355,.5,0],s:[.055,1,.18]})),"fabric","curtain-folds"),a(Tn,[1.06,.045,.11],[0,1,.06],"curtain-rail","metal");break;case"chandelier":o(Tn,[.035,.6,.035],[0,.73,0],"chain"),s("torus",Tn,[.85,.49,.3],[0,.4,0],"chandelier-ring",r,"metal");for(let f of[-.36,-.18,.18,.36])o(Tn,[.04,.3,.04],[f,.37,.02],"candle-holder"),l("#f9deb1",[.15,.22,.14],[f,.55,.03],"lamp");break;case"cans":for(let f=0;f<6;f++){let y=f<3?0:f<5?1:2,m=y===0?-.32+f*.32:y===1?-.16+(f-3)*.32:0;o(["#a5b7a3","#b79d77","#87a5a9"][f%3],[.29,.3,.29],[m,.15+y*.31,0],"tin"),o(Ut,[.3,.025,.3],[m,.31+y*.31,0],"lid")}break;case"phone":a("#659bac",[.91,.38,.65],[0,.21,0],"telephone-base");let p=a("#83b5c0",[.95,.16,.27],[0,.68,0],"receiver");for(let f of[-.37,.37])l("#79abb8",[.24,.32,.32],[f,.58,0],"earpiece");at(n,"round","#e4dfc7",xt(12,f=>({p:[-.2+f%3*.2,.21+Math.floor(f/3)*.09,.345],s:[.12,.05,.025]})),"plain","phone-buttons"),at(n,"torus",En,xt(15,f=>({p:[.48,.2+f*.033,0],s:[.12,.06,.12]})),"plain","coiled-cord"),p.rotation.z=-.03;break;case"drawers":a("#849ca2",[1,.98,.55],[0,.5,0],"filing-cabinet","metal");for(let f=0;f<4;f++)a("#a3b5b3",[.91,.21,.05],[0,.14+f*.24,.3],"drawer","metal"),a(En,[.22,.032,.07],[0,.17+f*.24,.34],"handle"),a("#dfd3b2",[.24,.045,.02],[0,.1+f*.24,.34],"label");break;default:throw new Error(`Unimplemented scenery: ${i.kind}`)}return r.position.set(i.x,i.y,-2.4),r.scale.set(i.w??1,i.h??1,Math.min(3.6,Math.max(1,(i.w??1)*.3))),n}function Wu(i,e){let t=!e;e??=Yr();let n=new Zt;n.name="scenery";let s=(i.decor??[]).map(r=>Vy(r,e,i.theme));return s.forEach(r=>n.add(r.group)),{group:n,dispose(){s.forEach(r=>r.dispose()),n.clear(),n.removeFromParent(),t&&e.dispose()}}}function Xu(i,e){let t=Dt(e,"backdrop"),{part:n}=t,{width:s,height:r,theme:a}=i,o=Yi[a]??Yi.street;if(a==="tree"||a==="river"){let l=Math.ceil(s/12)+2;at(t,"cylinder","#82927a",xt(l,h=>({p:[h*12-6,r/2,-11-h%3*2],s:[3+h%3,r+10,3]})),"wood","distant-trunks");let c=[];for(let h=-8;h<s+12;h+=8)for(let d=a==="river"?6:0;d<r+10;d+=13)for(let u=0;u<3;u++)c.push({p:[h+Math.sin(u*2.4)*3,d+Math.cos(u*2)*2,-9-u%2*2],s:[8,5,2],r:u*.5});at(t,"sphere","#8ea984",c,"leaf","distant-canopies"),a==="river"&&n("round","#8bbfc0",[s+20,2,4],[s/2,-1,-8],"distant-river")}else if(a==="street"){let l=Math.ceil(s/14)+1;at(t,"box","#97b4af",xt(l,h=>({p:[h*14,12+h%3*3,-16],s:[11,24+h%3*6,2]})),"brick","city-silhouettes");let c=[];for(let h=0;h<l;h++)for(let d=0;d<5;d++)for(let u=0;u<3;u++)c.push({p:[h*14-3.5+u*3.5,3+d*4,-14.9],s:[1.3,2,.04]});at(t,"box","#b9cebb",c,"plain","city-windows")}else if(a==="kitchen"){n("box","#c1b69e",[s+20,r+8,.2],[s/2,r/2,-12],"kitchen-wall",t.group,"plain");let l=[];for(let c=-8;c<s+10;c+=4)for(let h=-3;h<r+8;h+=3)l.push({p:[c,h,-11.8],s:[3.92,2.92,.12]});at(t,"round","#d2c5aa",l,"tile","ceramic-tiles")}else if(a==="casino"||a==="bonus"){let l=Math.ceil(s/.8)+4;at(t,"cylinder","#8a8da7",xt(l,h=>({p:[h*.8-1,r/2,-11],s:[1,r+6,.7]})),"fabric","distant-drapes");let c=[];for(let h=0;h<s;h+=5)for(let d=2;d<r;d+=5)c.push({p:[h,d,-10.4],s:[.6,.6,.2],r:.4});at(t,"star","#c5b58a",c,"metal","curtain-stars")}else if(a==="study"||a==="office")n("box",a==="study"?"#b5a79d":"#9eafb0",[s+20,r+8,.2],[s/2,r/2,-12],"wallpaper",t.group,"fabric"),at(t,"round",a==="study"?"#c2b298":"#b7c3ba",xt(Math.ceil(s/2)+8,l=>({p:[l*2-8,r/2,-11.8],s:[.08,r+8,.06]})),"plain","wallpaper-stripes"),at(t,"round","#819699",xt(Math.ceil(s/18),l=>({p:[l*18+8,6,-10.9],s:[6,4,.25]})),"wood","wall-panels");else if(a==="toys"){n("box","#b5acbd",[s+20,r+8,.2],[s/2,r/2,-12],"workshop-wall",t.group,"fabric");let l=Math.ceil(s/9)+2;at(t,"round","#9a9bb9",xt(l,c=>({p:[c*9-4,4+c%3*3,-10],s:[6,8+c%3*6,1]})),"fabric","toy-packaging"),at(t,"star","#d6c28f",xt(l,c=>({p:[c*9-4,5+c%3*3,-9.4],s:[2,2,.2]})),"metal","package-stars")}else{n("box",a==="sewer"?"#809c99":"#96a8a5",[s+20,r+8,.2],[s/2,r/2,-13],"industrial-wall",t.group,a==="sewer"?"brick":"metal");let l=Math.ceil(s/9)+2;at(t,"cylinder",a==="sewer"?"#a68c70":"#839995",xt(l,h=>({p:[h*9-4,r/2,-10],s:[.75,r+8,.75]})),"metal","distant-pipework");let c=[];for(let h=2;h<r+10;h+=7)c.push({p:[s/2,h,-11],s:[s+20,.35,.6]});at(t,"box","#7b9393",c,"metal","wall-beams")}return t.group.traverse(l=>{l.isMesh&&(l.castShadow=!1,l.receiveShadow=!1)}),t}function Gy(i,e=1){e=Math.max(.2,e||1);let t=i.filter(d=>(d.lives??1)>0);t.length||t.push({x:2,y:1,w:.8,h:1.3});let n=Math.min(...t.map(d=>d.x-(d.w??.8)/2))-2,s=Math.max(...t.map(d=>d.x+(d.w??.8)/2))+2,r=Math.min(...t.map(d=>d.y))-2.2,a=Math.max(...t.map(d=>d.y+(d.h??1.3)))+3.5,o=Math.max(10.5,11/e,a-r,(s-n)/e),l=o*e,c=(n+s)/2,h=(a+r)/2;return{x:c,y:h,width:l,height:o,left:c-l/2,right:c+l/2,bottom:h-o/2,top:h+o/2}}function Hy(i=1){let e={mode:"auto",dpr:Math.min(i,1.6),shadows:!0,frameMs:0,samples:0},t=0,n=0;return e.set=s=>{if(!["auto","high","low"].includes(s))throw new RangeError("\u753B\u8D28\u5FC5\u987B\u4E3A high\u3001auto \u6216 low");s==="auto"&&e.mode==="auto"||(e.mode=s,e.dpr=s==="low"?Math.min(i,1):Math.min(i,s==="high"?2:1.6),e.shadows=s!=="low",t=0,n=0)},e.observe=s=>{!Number.isFinite(s)||s<=0||(e.frameMs=e.samples?e.frameMs*.95+s*.05:s,e.samples++,n++,e.mode==="auto"&&n>30&&(t=s>28?t+1:Math.max(0,t-2),t>=60&&(e.dpr=Math.max(.5,e.dpr*.75),e.shadows=!1,t=0)))},e}function Wy(i,e,t){let n=Dt(e,`platform:${i.id}`),s=Yi[t]??Yi.street,r=t==="tree"?"wood":["factory","fatcat","sewer"].includes(t)?"metal":"wood";if(["branch","pipe","wire"].includes(i.kind)){let a=n.part("cylinder",i.kind==="wire"?"#657b79":i.kind==="pipe"?"#b8875e":s.surface,[1,1,1],[0,0,0],"platform-body",n.group,i.kind==="branch"?"wood":"metal");a.rotation.z=Math.PI/2}else n.part("round",s.surface,[1,1,1],[0,0,0],"platform-body",n.group,r);if(n.part("box",i.kind==="conveyor"?"#495e63":s.accent,[1,.12,1.04],[0,.46,0],"walkable-top",n.group,r),i.kind==="conveyor")for(let a=0;a<12;a++)n.part("box","#d8bd7c",[.024,.13,1.05],[-.46+a*.084,.46,0],"belt-tread",n.group,"metal");if(i.kind==="moving")for(let a of[-.43,.43])n.part("sphere","#edcc75",[.09,.4,.13],[a,0,.53],"lift-light");return n.update=a=>{n.group.position.set(a.x+a.w/2,a.y-a.h/2,0),n.group.scale.set(a.w,a.h??.65,1.5)},n.update(i),n}function Xy(i,e){let t=Dt(e,`hazard:${i.id}`),n=i.w??1,s=i.h??1;if(i.kind==="spike"){let r=Math.max(1,Math.ceil(n/.35));for(let a=0;a<r;a++)t.part("cone","#bdc8c3",[n/r*.9,s,.5],[-n/2+(a+.5)*n/r,s/2,0],"spike",t.group,"metal")}else if(i.kind==="electric")for(let r=0;r<5;r++){let a=t.part("round","#d4f3a8",[n/5*.4,s,.12],[-n/2+(r+.5)*n/5,s/2,.3],"arc",t.group,"plain",{emissive:"#bddd6a",emissiveIntensity:.7});a.rotation.z=r%2?.25:-.25}else i.kind==="press"?(t.part("round","#81999c",[n,s,1.2],[0,s/2,0],"press",t.group,"metal"),t.part("box","#e4b661",[n,.14,1.24],[0,.08,0],"press-warning")):t.part("round",i.kind==="water"?"#65a9ad":"#8bced0",[n,s,.65],[0,s/2,0],"falling-water",t.group,"plain",{transparent:!0,opacity:.65});return t.update=r=>{t.group.position.set(r.x,r.y,0),t.group.visible=r.active!==!1},t}function qy(){let i=Yr(),e=new Zt,t=new Map;e.name="rescue-world";let n=null,s=null,r=null,a=null,o=0,l=!1,c=[],h=new Rt,d=new Bi(i.geometry("sphere"),i.material("plain","#ffe1a0",{emissive:"#d5a558",emissiveIntensity:.2}),48);d.name="hit-particles",d.frustumCulled=!1,d.count=0,e.add(d);function u(){t.forEach(m=>m.dispose()),t.clear(),n?.dispose(),n=null,s?.dispose(),s=null,c.length=0,d.count=0}function p(m){if(l)throw new Error("Scene has been disposed");if(r===m)return;u(),r=m,n=Wu(m,i),e.add(n.group),s=Xu(m,i),e.add(s.group);let g=Dt(i,"exit-marker");g.part("torus","#ead090",[1,1.6,.25],[0,1,0],"exit-ring",g.group,"metal"),g.part("star","#f4d888",[.4,.4,.4],[0,1.95,0],"exit-star"),g.group.position.set(m.exit?.x??0,m.exit?.y??1,-.5),t.set("exit",g),e.add(g.group)}function f(m,g,M,S,v=()=>!0){let E=new Set;for(let w of g??[]){if(!v(w))continue;let P=`${m}:${w.id}`;E.add(P);let _=t.get(P);_||(_=M(w),_.group.name=P,t.set(P,_),e.add(_.group)),_.update?.(w,w.renderTime??S)}for(let[w,P]of t)w.startsWith(`${m}:`)&&!E.has(w)&&(P.dispose(),t.delete(w))}function y(m,g){(!r||r.id!==m.level.id)&&p(m.level),a!==m&&(a=m,o=0,c.length=0);let M=m.time??0;f("platform",m.platforms??m.level.platforms,S=>Wy(S,i,m.level.theme),M),f("player",m.players,S=>Ou(S.character,i),M,S=>S.lives>0),f("object",m.objects,S=>Vu(S.kind,i),M,S=>S.active!==!1),f("enemy",m.enemies,S=>rh(S.kind,i),M,S=>S.alive!==!1),f("pickup",m.pickups,S=>Gu(S.kind,i),M,S=>!S.collected),f("hazard",m.hazards,S=>Xy(S,i),M),f("projectile",m.projectiles,S=>Hu(S.kind,i),M,S=>(S.ttl??1)>0),f("boss",m.boss?[m.boss]:[],S=>gl(S.kind,i),M,S=>!S.defeated);for(let S of m.events??[]){let v=Number(String(S.id).split("-").at(-1));if(!(!Number.isFinite(v)||v<=o)&&(o=v,["hit","break","collect","bossHit","damage"].includes(S.type))){let E=m.players.find(w=>w.id===S.player)??m.players[0];for(let w=0;w<6&&c.length<48;w++)c.push({x:S.x??E.x,y:(S.y??E.y)+.7,vx:Math.cos(w*2.4)*2,vy:1.3+Math.sin(w)*2,life:.45})}}for(let S=c.length-1;S>=0;S--){let v=c[S];v.life-=g,v.x+=v.vx*g,v.y+=v.vy*g,v.vy-=7*g,v.life<=0&&c.splice(S,1)}d.count=c.length,c.forEach((S,v)=>{h.position.set(S.x,S.y,.3),h.scale.setScalar(.08*S.life/.45),h.updateMatrix(),d.setMatrixAt(v,h.matrix)}),d.instanceMatrix.needsUpdate=!0}return{group:e,resources:i,setLevel:p,update:y,get level(){return r},get entityCount(){return t.size},get particleCount(){return c.length},dispose(){l||(l=!0,u(),d.dispose(),e.clear(),e.removeFromParent(),i.dispose())}}}function qu(i){let e;try{e=new ul({canvas:i,antialias:!1,alpha:!1,powerPreference:"high-performance"})}catch(T){throw new Error("\u65E0\u6CD5\u542F\u52A8 WebGL 2 \u4E09\u7EF4\u753B\u9762\uFF0C\u8BF7\u542F\u7528\u6D4F\u89C8\u5668\u786C\u4EF6\u52A0\u901F\u6216\u66F4\u6362\u652F\u6301 WebGL 2 \u7684\u6D4F\u89C8\u5668\u3002",{cause:T})}e.outputColorSpace=Bt,e.toneMapping=Dr,e.toneMappingExposure=1.28,e.shadowMap.enabled=!0,e.shadowMap.type=yo;let t=new lr,n=qy();t.add(n.group);let s=new xi(-8,8,5,-5,.1,180);s.position.set(0,6,34);let r=new Pr("#fff7df","#827363",2.7);t.add(r);let a=new Ts("#fff0d5",3.1);a.castShadow=!0,a.shadow.mapSize.set(1024,1024),a.shadow.normalBias=.035,a.shadow.bias=-15e-5,a.shadow.camera.near=.5,a.shadow.camera.far=80,t.add(a,a.target);let o=new Ts("#bfdcdd",1.2);o.position.set(-8,8,-10),t.add(o);let l=Hy(Math.max(1,globalThis.devicePixelRatio??1)),c=1,h=1,d=null,u=!1,p=!1,f=0,y=0,m=null,g=null,M=null,S=null,v=T=>{T.preventDefault(),p=!0},E=()=>{p=!1,w(!0)};i.addEventListener("webglcontextlost",v),i.addEventListener("webglcontextrestored",E);function w(T=!1){(T||!M||M.width!==c||M.height!==h||M.dpr!==l.dpr)&&(e.setDrawingBufferSize(c,h,l.dpr),M={width:c,height:h,dpr:l.dpr}),(T||S!==l.shadows)&&(e.shadowMap.enabled=l.shadows,e.shadowMap.needsUpdate=!0,S=l.shadows)}function P(T,L){c=Math.max(1,T),h=Math.max(1,L),w()}function _(T){n.setLevel(T),d=null,m=null}function A(T,L=1/60){if(u||p)return;if(n.update(T,Math.max(0,Math.min(L,.1))),m!==T.level.theme){m=T.level.theme;let F=Yi[m]??Yi.street;t.background=new Qe(F.sky),t.fog=new or(F.fog,40,95)}let z=T.players.filter(F=>F.lives>0).map(F=>({...F}));T.boss?.active&&!T.boss.defeated&&z.push({...T.boss,lives:1});let I=Gy(z,c/h);if(!d)d=I;else{let F=1-Math.exp(-Math.max(L,.001)*8),Y={x:d.x+(I.x-d.x)*F,y:d.y+(I.y-d.y)*F,width:d.width+(I.width-d.width)*F,height:d.height+(I.height-d.height)*F},le=Math.max(Y.height,2*Math.max(Y.y-I.bottom,I.top-Y.y),2*Math.max(Y.x-I.left,I.right-Y.x)/(c/h));d={x:Y.x,y:Y.y,height:le,width:le*c/h}}s.left=-d.width/2,s.right=d.width/2,s.top=d.height/2,s.bottom=-d.height/2,s.updateProjectionMatrix(),s.position.set(d.x,d.y+3,34),s.lookAt(d.x,d.y,0);let R=Math.min(24,Math.max(12,d.width*.6));a.position.set(d.x-6,d.y+12,15),a.target.position.set(d.x,d.y,0),Object.assign(a.shadow.camera,{left:-R,right:R,top:R,bottom:-R}),a.shadow.camera.updateProjectionMatrix();for(let F of n.group.children)if(F.name==="scenery")for(let Y of F.children){let le=Y.scale.x*.7;Y.visible=Math.abs(Y.position.x-d.x)<d.width/2+le+5&&Math.abs(Y.position.y+Y.scale.y/2-d.y)<d.height/2+Y.scale.y/2+5}else F.name!=="hit-particles"&&F.name!=="backdrop"&&!F.name.startsWith("player:")&&!F.name.startsWith("boss:")&&!F.name.startsWith("hazard:")&&(F.visible=Math.abs(F.position.x-d.x)<d.width/2+Math.max(3,F.scale.x/2)+4&&Math.abs(F.position.y-d.y)<d.height/2+Math.max(3,F.scale.y/2)+4);let k=performance.now();e.render(t,s),f=performance.now()-k,y++;let H=l.dpr,J=l.shadows,G=performance.now();l.observe(Math.max(f,g===null?f:Math.min(250,G-g))),g=G,(H!==l.dpr||J!==l.shadows)&&w()}function N(){return{webgl:!p,contextLost:p,quality:l.mode,dpr:l.dpr,shadows:l.shadows,frameMs:Number(l.frameMs.toFixed(2)),renderMs:Number(f.toFixed(2)),fps:l.frameMs?Number((1e3/l.frameMs).toFixed(1)):0,frames:y,drawCalls:e.info.render.calls,triangles:e.info.render.triangles,geometries:e.info.memory.geometries,textures:e.info.memory.textures,resources:n.resources.stats(),entities:n.entityCount,particles:n.particleCount,viewport:{width:c,height:h},camera:d?{...d}:null}}return{setLevel:_,update:A,resize:P,setQuality(T){l.set(T),w()},diagnostics:N,dispose(){u||(u=!0,i.removeEventListener("webglcontextlost",v),i.removeEventListener("webglcontextrestored",E),n.dispose(),a.shadow.map?.dispose(),e.dispose(),t.clear())}}}var Yu=[{left:"KeyA",right:"KeyD",up:"KeyW",down:"KeyS",jump:"Space",action:"KeyE"},{left:"ArrowLeft",right:"ArrowRight",up:"ArrowUp",down:"ArrowDown",jump:"Enter",action:"ShiftRight"}],ah=(i,e)=>!!(i.buttons?.[e]?.pressed||i.buttons?.[e]?.value>.5);function $u({target:i=globalThis.window,players:e=1,gamepads:t=()=>globalThis.navigator?.getGamepads?.()??[],onPause:n=()=>{},capture:s=()=>!0,joystick:r=null,jump:a=null,action:o=null}={}){let l=e,c=new Set,h=new Set,d=new Set,u=[null,null],p=new Map,f=new Map,y=[],m=Array.from({length:2},()=>({jump:[],action:[]})),g=Array.from({length:2},()=>({jump:!1,action:!1})),M={move:0,up:!1,down:!1,jump:!1,action:!1},S=new Set,v=new Map,E=new Set,w=(T,L,z)=>{T?.addEventListener(L,z),y.push(()=>T?.removeEventListener(L,z))},P=new Set([...Yu.flatMap(T=>Object.values(T)),"Escape"]);w(i,"keydown",T=>{P.has(T.code)&&(s()&&T.preventDefault(),!c.has(T.code)&&!h.has(T.code)&&(d.add(T.code),T.code==="Escape"&&n()),c.add(T.code))}),w(i,"keyup",T=>{c.delete(T.code),h.delete(T.code)});function _(){for(let T of c)h.add(T);d.clear();for(let T=0;T<2;T++)for(let L of["jump","action"])m[T][L].length=0,g[T][L]=!1;M.move=0,M.up=!1,M.down=!1,M.jump=!1,M.action=!1,S.clear();for(let T of v.keys())E.add(T);for(let T of Array.from(t()??[]).filter(Boolean))f.set(T.index,{buttons:new Set(T.buttons?.map((L,z)=>z).filter(L=>ah(T,L))??[]),axis:Math.abs(T.axes?.[0]??0)>.2||Math.abs(T.axes?.[1]??0)>.2})}w(i,"blur",_);function A(T,L){let z=R=>{if(!E.has(R.pointerId))if(L==="stick"){let k=T.getBoundingClientRect(),H=(R.clientX-k.x-k.width/2)/(k.width*.35),J=(R.clientY-k.y-k.height/2)/(k.height*.35);M.move=Math.abs(H)>.25?Math.max(-1,Math.min(1,H)):0,M.up=J<-.3,M.down=J>.3,M.move&&S.add(M.move>0?"right":"left"),M.up&&S.add("up"),M.down&&S.add("down"),T.style.setProperty("--stick-x",`${Math.max(-30,Math.min(30,H*30))}px`),T.style.setProperty("--stick-y",`${Math.max(-30,Math.min(30,J*30))}px`)}else M[L]||(M[L]=!0,S.add(L))};w(T,"pointerdown",R=>{R.preventDefault(),v.set(R.pointerId,L),T.setPointerCapture?.(R.pointerId),z(R)}),w(T,"pointermove",R=>{v.get(R.pointerId)===L&&z(R)});let I=R=>{v.get(R.pointerId)===L&&(v.delete(R.pointerId),E.delete(R.pointerId),L==="stick"?(M.move=0,M.up=!1,M.down=!1,T.style.setProperty("--stick-x","0px"),T.style.setProperty("--stick-y","0px")):M[L]=!1)};w(T,"pointerup",I),w(T,"pointercancel",I),w(T,"lostpointercapture",I)}A(r,"stick"),A(a,"jump"),A(o,"action");function N(){let T=Array.from(t()??[]).filter(I=>I&&I.connected!==!1&&I.mapping==="standard"),L=new Set(T.map(I=>I.index));for(let I=0;I<2;I++)if(u[I]!==null&&!L.has(u[I])){for(let R of["jump","action"])m[I][R]=m[I][R].filter(k=>k.pad!==u[I]);p.delete(u[I]),f.delete(u[I]),u[I]=null}for(let I=0;I<l;I++)u[I]===null&&(u[I]=T.find(R=>!u.includes(R.index))?.index??null);let z=Array.from({length:l},(I,R)=>{let k=Yu[R],H=F=>!h.has(F)&&(c.has(F)||d.has(F)),J={move:Number(H(k.right))-Number(H(k.left)),up:H(k.up),down:H(k.down),jump:d.has(k.jump)&&!h.has(k.jump),action:d.has(k.action)&&!h.has(k.action)},G=T.find(F=>F.index===u[R]);if(G){let F=f.get(G.index);if(F){for(let $ of F.buttons)ah(G,$)||F.buttons.delete($);Math.abs(G.axes?.[0]??0)<.2&&Math.abs(G.axes?.[1]??0)<.2&&(F.axis=!1)}let Y=p.get(G.index)??new Set,le=new Set(G.buttons?.map(($,ee)=>ee).filter($=>ah(G,$))??[]),ae=$=>le.has($)&&!Y.has($)&&!F?.buttons.has($),qe=F?.axis?0:G.axes?.[0]??0,He=F?.axis?0:G.axes?.[1]??0,$e=Number(le.has(15)&&!F?.buttons.has(15))-Number(le.has(14)&&!F?.buttons.has(14))||(Math.abs(qe)>.2?qe:0);Math.abs($e)>Math.abs(J.move)&&(J.move=$e),J.up||=He<-.3||le.has(12)&&!F?.buttons.has(12),J.down||=He>.3||le.has(13)&&!F?.buttons.has(13),J.jump||=ae(0),J.action||=ae(1),p.set(G.index,le),ae(9)&&n()}R===0&&(Math.abs(M.move)>Math.abs(J.move)?J.move=M.move:J.move||(J.move=Number(S.has("right"))-Number(S.has("left"))),J.up||=M.up||S.has("up"),J.down||=M.down||S.has("down"),J.jump||=S.has("jump"),J.action||=S.has("action"));for(let F of["jump","action"]){if(J[F]&&m[R][F].length<8){let le=d.has(k[F])&&!h.has(k[F])||R===0&&S.has(F);m[R][F].push({up:J.up,down:J.down,pad:le?null:G?.index})}let Y=g[R][F]?null:m[R][F].shift();J[F]=!!Y,Y&&(J.up||=Y.up,J.down||=Y.down),g[R][F]=J[F]}return J});return d.clear(),S.clear(),z}return{sample:N,clear:_,setPlayers(T){l=Math.max(1,Math.min(2,T)),l===1&&(u[1]=null),_()},dispose(){_(),y.forEach(T=>T())},get bindings(){return u.slice(0,l)}}}function oh(i,e){e.getElementById("complete-title").textContent=i.ending?"\u670B\u53CB\u83B7\u6551\u4E86\uFF01":"\u533A\u57DF\u5B8C\u6210\uFF01",e.getElementById("complete-copy").textContent=i.ending?`\u5947\u5947\u548C\u8482\u8482\u7EC8\u4E8E\u6551\u51FA\u4E86\u670B\u53CB\u3002\u4E00\u8DEF\u6536\u83B7 ${i.score} \u5206\uFF0C${i.flowers} \u6735\u82B1\u548C ${i.stars} \u9897\u661F\u3002`:`${i.areaLevel.name}\u63A2\u7D22\u5B8C\u6210\uFF0C\u6536\u83B7 ${i.score} \u5206\u3002\u9009\u62E9\u5730\u56FE\u4E0A\u4EAE\u8D77\u7684\u4E0B\u4E00\u7AD9\u3002`,e.getElementById("next-area").textContent=i.ending?"\u518D\u53BB\u63A2\u9669":"\u9009\u62E9\u4E0B\u4E00\u7AD9"}var Ju="rescue-rangers-3d-v1",Jr=(i,e=0,t=1e9)=>Number.isFinite(i)&&i>=0?Math.min(t,Math.floor(i)):e;function xl(i={}){let e=Lh();for(let a of Array.isArray(i?.campaign?.completed)?i.campaign.completed:[])typeof a=="string"&&oa(e,a);Pi(e).includes(i?.campaign?.current)&&(e.current=i.campaign.current);let t=i?.options??{},n={music:t.music!==!1,sound:t.sound!==!1,quality:["auto","high","low"].includes(t.quality)?t.quality:"auto",players:t.players===2?2:1,character:t.character==="dale"?"dale":"chip"},s=i?.run,r=null;if(s&&Pi(e).includes(s.areaId)&&Array.isArray(s.lives)&&s.lives.length>0&&s.lives.every(a=>Number.isFinite(a)&&a>=0)){let a=s.players===2?2:1;r={areaId:s.areaId,score:Jr(s.score),flowers:Jr(s.flowers),stars:Jr(s.stars),lives:Array.from({length:a},(o,l)=>Jr(s.lives[l],3,99)),players:a,character:s.character==="dale"?"dale":"chip"},r.lives.every(o=>o===0)&&(r=null)}return{version:1,campaign:e,options:n,run:r,bestScore:Math.max(Jr(i?.bestScore),r?.score??0)}}function Zu(i){if(i===void 0)try{i=globalThis.localStorage}catch{i={getItem(){throw new Error("storage denied")},setItem(){throw new Error("storage denied")}}}let e="",t=0;return{load(){try{let n=i.getItem(Ju);e="";try{let s=xl(n?JSON.parse(n):{});return t=s.bestScore,s}catch{return xl()}}catch{return e="\u8FDB\u5EA6\u8BFB\u53D6\u5931\u8D25\uFF0C\u672C\u6B21\u4ECE\u65B0\u5192\u9669\u5F00\u59CB\u3002",xl()}},save(n){try{let s=xl(n);return s.bestScore=Math.max(t,s.bestScore),i.setItem(Ju,JSON.stringify(s)),t=s.bestScore,e="",{ok:!0}}catch{return e="\u8FDB\u5EA6\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u6D4F\u89C8\u5668\u5B58\u50A8\u7A7A\u95F4\u3002",{ok:!1,error:e}}},get error(){return e}}}var ju={street:[0,4,7,9,7,4,2,7],tree:[0,7,9,12,9,7,4,2],kitchen:[0,3,7,10,7,5,3,7],study:[0,4,9,7,4,2,5,7],toys:[12,7,9,4,7,12,14,9],river:[0,5,7,9,7,5,2,4],factory:[0,3,7,3,5,2,7,5],casino:[0,4,7,10,9,5,7,2],sewer:[0,2,5,7,5,2,-2,2],office:[0,7,4,11,9,4,7,2],fatcat:[0,3,6,7,6,3,2,-2],bonus:[0,4,7,12,11,7,9,12]};function Ku(i={}){let e=null,t={music:!0,sound:!0,...i},n=!1,s=null,r=0,a=null,o=0,l="street",c=new Map,h={};function d(f,y=.14,m="triangle",g=.045,M=!0){if(!e||e.state!=="running")return!1;let S=e.createOscillator(),v=e.createGain(),E=e.currentTime;return S.type=m,S.frequency.value=261.63*2**(f/12),v.gain.setValueAtTime(0,E),v.gain.linearRampToValueAtTime(g,E+.012),v.gain.exponentialRampToValueAtTime(1e-4,E+y),S.connect(v),v.connect(e.destination),c.set(S,M),S.onended=()=>{c.delete(S),S.disconnect(),v.disconnect()},S.start(E),S.stop(E+y+.02),!0}function u(f=!1){for(let[y,m]of c)if(!(f&&m)){try{y.stop()}catch{}c.delete(y)}}function p(){s&&(clearInterval(s),s=null),n&&t.music&&e?.state==="running"&&(s=setInterval(()=>{let f=ju[l]??ju.tree,y=f[r%f.length];d(y,.16,"triangle",.032,!1),r%2===0&&d(y-24,.19,"sine",.025,!1),r++},210))}return{async unlock(){try{if(!e){let f=globalThis.AudioContext??globalThis.webkitAudioContext;if(!f)return;e=new f}e.state==="suspended"&&await e.resume(),p()}catch{}},setOptions(f){t={...t,...f},u(),p()},setActive(f,{finishEffects:y=!1}={}){n=!!f,n||u(y),p()},consume(f){a!==f&&(a=f,o=0,r=0),l!==f.level.theme&&(l=f.level.theme,r=0);for(let y of f.events){let m=Number(y.id.split("-").at(-1));if(m<=o||(o=m,!n||!t.sound))continue;let g={jump:7,pickup:4,throw:12,hit:14,break:2,damage:-12,lifeLost:-19,collect:16,extraLife:24,bossHit:19,bossDefeated:24,bonus:21,clear:28,stun:-4};g[y.type]!==void 0&&d(g[y.type],["clear","bossDefeated","extraLife"].includes(y.type)?.5:.13,y.type==="damage"?"sawtooth":"sine",.06)&&(h[y.type]=(h[y.type]??0)+1)}},diagnostics(){return{state:e?.state??"locked",active:n,music:t.music,sound:t.sound,voices:c.size,lastEvent:o,effects:{...h}}},dispose(){n=!1,s&&clearInterval(s),s=null,u(),e?.close().catch(()=>{}),e=null}}}var Qu=["players","platforms","objects","enemies","hazards","pickups"],ef=["x","y","vx","vy","grounded","groundId","active","alive","facing","timer","animation","carrying","heldBy","hidden","invulnerable","stun","zipper","dropTimer","throwTimer","hearts","lives","thrown","hitIds","opened","owner","dx","dy","collected","speed","w","h"],tf=new WeakMap,nf=new WeakMap,Zr=i=>structuredClone(i);function Yy(i,e){let t=tf.get(i);if(t||tf.set(i,t=new Map),!t.has(e)){let{level:n,areaLevel:s,...r}=Ws(i,{players:e});t.set(e,r)}return t.get(e)}function $y(i,e){let[,t,n,s]=i,r=Zr(n),a={...e,...Zr(s??{})},o=0;for(let l=0;l<ef.length;l++)t&1<<l&&(a[ef[l]]=r[o++]);return a}function Jy(i){let e=Uint8Array.from(atob(i.bytes),s=>s.charCodeAt(0)),t=new DataView(e.buffer),n=[];for(let s=0;s<e.length/10;s++)n.push({id:i.ids?.[s]??`event-${i.first+s}`,type:i.types[t.getUint8(s*10+8)],time:t.getFloat64(s*10,!0),...Zr(i.extras[t.getUint8(s*10+9)])});return n}function sf(i,e){if(i?.type!=="state"||i.version!==1)throw Error("Unsupported state frame");let t=e?.areaLevel.id===i.areaId?e.areaLevel:i.stage?.area,n=e?.level.id===i.levelId?e.level:i.stage?.level;if(!t||!n||t.id!==i.areaId||n.id!==i.levelId)throw Error("Missing static stage");let s=Yy(n,i.playerCount),r=Zr(s),a=i.data;for(let[c,h]of Object.entries(a))!Qu.includes(c)&&c!=="events"&&(r[c]=Zr(c==="previousInputs"&&h===!0?i.inputs:h));for(let c of Qu)if(a[c]){let[h,d]=a[c];r[c].length=h;for(let u of d)r[c][u[0]]=$y(u,r[c][u[0]])}r.events=Jy(a.events),r.level=n,r.areaLevel=t;let l=e&&nf.get(e)===i.room.run?Object.assign(e,r):r;return nf.set(l,i.room.run),l}var jr=1/60,Zy=120,jy=8,lf=["players","objects","enemies","platforms","projectiles","effects","hazards","pickups"],Ky=["x","y","vx","vy","facing","grounded","groundId","animation","carrying","heldBy","hidden","thrown"],rf=()=>({move:0,up:!1,down:!1,jump:!1,action:!1}),yl=i=>i&&!i.paused&&["playing","bonus"].includes(i.status),Qy=i=>({move:Math.max(-1,Math.min(1,Number(i?.move)||0)),up:!!i?.up,down:!!i?.down,jump:!!i?.jump,action:!!i?.action});function af(i){let{level:e,areaLevel:t,...n}=i;return{...structuredClone(n),level:e,areaLevel:t}}function e_(i){let e={};for(let t of lf)e[t]=(i[t]??[]).map(n=>({id:n.id,x:n.x,y:n.y,heldBy:n.heldBy,carrying:JSON.stringify(n.carrying),lives:n.lives,hearts:n.hearts}));return i.boss&&(e.boss=[{...i.boss}]),e}function of(i,e){return!i||!e||i.heldBy!==e.heldBy||i.carrying!==e.carrying||i.lives!==e.lives||i.hearts!==e.hearts||Math.hypot(i.x-e.x,i.y-e.y)>3}function cf({slot:i,clock:e={now:()=>performance.now()}}={}){if(i!==0&&i!==1)throw Error("Invalid player slot");let t=null,n=null,s=null,r=null,a=0,o=0,l=[],c=[],h=0,d=rf(),u={jump:!1,action:!1},p={x:0,y:0,at:0},f=null,y=null,m={x:0,y:0,at:0},g=0,M=null,S=null,v=0;function E(){l=[],c=[],a=0,o=0,h=0,d=rf(),u={jump:!1,action:!1},p={x:0,y:0,at:0},f=null,y=null,m={x:0,y:0,at:0},M=null}function w(T){let L=n.players[i].carrying;Hh(n,i,T.input,jr);let z=n.players[i];if(T.input.action&&(z.carrying?.type==="object"||L?.type==="object")&&M?.seq!==T.seq){let I=z.carrying?.type==="object"?z.carrying.id:L.id;M={id:I,seq:T.seq,released:!z.carrying,last:s?.objects?.find(R=>R.id===I)}}}function P(T,L){if(!Number.isSafeInteger(L?.epoch)||L.epoch<0||!Number.isSafeInteger(L?.ack)||L.ack<0||r!==null&&L.epoch<r)return!1;let z=L.epoch!==r||t!==T||t?.level!==T.level;if(!z&&L.ack<o)return!1;let I=t!==T,R=s?.players?.[i],k=R?.x,H=R?.y,J=s?.players?.[1-i];z&&E(),t=T,r=L.epoch,o=L.ack,a=Math.max(a,o),l=l.filter($=>$.seq>o);let G=e.now(),F=e_(T),Y=z||of(f,F.players[i]),le=z||of(y,F.players[1-i]);y=F.players[1-i],m={x:0,y:0,at:G},g=Number.isFinite(L.at)?Math.min(G,L.at):G,S=null,v=0,f=F.players[i],c.push({at:G,positions:F}),c.length>jy&&c.shift(),n=af(T),n._localObjectIds=new Set(M?[M.id]:[]);for(let $ of l)w($);(!s||I)&&(s={});let ae=n.players[i],qe=k-ae.x,He=H-ae.y;p=!Y&&ae.lives===T.players[i].lives&&ae.hearts===T.players[i].hearts&&!T.players[i].heldBy&&Number.isFinite(qe)&&Number.isFinite(He)?{x:qe,y:He,at:G,duration:Math.min(240,Math.max(80,Math.hypot(qe,He)*60))}:{x:0,y:0,at:G},A(G);let $e=s.players[1-i];if(!le&&G-g>jr*1e3&&yl(t)&&!$e.heldBy&&J){let $=J.x-$e.x,ee=J.y-$e.y;Number.isFinite($)&&Number.isFinite(ee)&&(m={x:$,y:ee,at:G})}return A(G),!0}function _(T={},L=0){if(!yl(t)||!n)return{commands:[],state:A()};let z=Qy(T);u.jump||=z.jump&&!d.jump,u.action||=z.action&&!d.action,d=z,h+=Math.min(5*jr,Math.max(0,Number(L)||0));let I=[];for(;h+1e-9>=jr;){if(h=Math.max(0,h-jr),l.length>=Zy){h=0;break}let R={seq:++a,input:{...z,...u}};u={jump:!1,action:!1},l.push(R),I.push(R),w(R)}return{commands:I,state:A()}}function A(T=e.now()){if(!t)return null;s??={},Object.assign(s,t);let L=n&&yl(t)&&n.level===t.level,z=yl(t)?Math.min(.25,Math.max(0,(T-g)/1e3)):0;L&&((!S||z<v)&&(S=af(t),v=0),Gh(S,z-v),v=z);let I=L?S:t;for(let R of lf)s[R]=(I[R]??[]).map(k=>({...k}));if(t.boss&&(s.boss={...I.boss}),s.time=I.time,L){let R=t.players[i],k=n.players[i];if(k.lives===R.lives&&k.hearts===R.hearts&&!R.heldBy){for(let ae of Ky)ae in k&&(s.players[i][ae]=typeof k[ae]=="object"?structuredClone(k[ae]):k[ae]);s.players[i].renderTime=I.time,(k.carrying?.type==="player"||R.carrying?.type==="player")&&(s.players[i].carrying=R.carrying);let F=s.players[i].carrying;if(F?.type==="object"){let ae=t.objects.find(qe=>qe.id===F.id);(!ae?.active||ae.heldBy&&ae.heldBy!==R.id)&&(s.players[i].carrying=null)}let Y=n.platforms.find(ae=>ae.id===k.groundId),le=s.platforms.find(ae=>ae.id===k.groundId);k.grounded&&Y?.kind==="moving"&&le&&(s.players[i].x+=le.x-Y.x,s.players[i].y+=le.y-Y.y)}if(M){let F=t.objects.find(le=>le.id===M.id),Y=n.objects.find(le=>le.id===M.id);if(!F?.active||F.heldBy&&F.heldBy!==R.id||!Y||!M.released&&o>=M.seq&&F.heldBy!==R.id)M=null;else{let le=s.objects.find(ae=>ae.id===F.id);if(M.released&&o>=M.seq&&!F.heldBy){M.handoff??={at:T,x:(M.last?.x??le.x)-le.x,y:(M.last?.y??le.y)-le.y,duration:Math.min(1e3,Math.max(100,Math.abs((M.last?.x??le.x)-le.x)/Math.max(1,Math.abs(le.vx)*.5)*1e3))};let ae=M.handoff,qe=Math.max(0,1-(T-ae.at)/ae.duration);le.x+=ae.x*qe,le.y+=ae.y*qe,qe||(M=null)}else if(k.lives===R.lives&&k.hearts===R.hearts&&(Y.heldBy===R.id||M.released&&Y.owner===R.id))for(let ae of["x","y","vx","vy","heldBy","thrown"])le[ae]=Y[ae];M&&(M.last={...le})}}let H=s.players[i],J=H.grounded&&s.platforms.some(F=>F.id===H.groundId&&F.kind==="moving");J&&(p={x:0,y:0,at:T});let G=J?0:Math.max(0,1-(T-p.at)/(p.duration??80));k.lives===R.lives&&k.hearts===R.hearts&&!R.heldBy&&(H.x+=p.x*G,H.y+=p.y*G)}if(L){let R=s.players[1-i],k=R.grounded&&s.platforms.some(J=>J.id===R.groundId&&J.kind==="moving");k&&(m={x:0,y:0,at:T});let H=k?0:Math.max(0,1-(T-m.at)/120);R.heldBy||(R.x+=m.x*H,R.y+=m.y*H)}for(let R of s.players){let k=s.players.find(H=>H.id===R.heldBy);k&&(R.x=k.x,R.y=k.hidden?k.y:k.y+k.h+.15)}for(let R of s.objects){let k=s.players.find(H=>H.id===R.heldBy);k&&(R.x=k.x,R.y=k.hidden?k.y:k.y+k.h+.15)}return s}function N(){E(),n=null,r=null}return{receive:P,advance:_,render:A,clear:N,diagnostics:()=>({pending:l.length,history:c.length,epoch:r,ack:o,sequence:a})}}var lh="rescue.online.session.v1",t_={now:()=>performance.now(),setInterval:(i,e)=>setInterval(i,e),clearInterval:i=>clearInterval(i)};function n_(){try{return globalThis.sessionStorage}catch{return null}}function i_(){let i=new URL("/rescue-ws",globalThis.location.href);return i.protocol=i.protocol==="https:"?"wss:":"ws:",i.href}function hf({onState:i=()=>{},onStatus:e=()=>{},url:t=i_(),storage:n=n_(),transport:s=a=>new WebSocket(a),clock:r=t_}={}){let a=null,o=null,l=null,c=null,h=null,d=null,u=null,p=!1,f=!1,y=null,m=-1,g=0,M=0,S=null,v=0,E=0,w=null,P=null,_=1/0,A=0,N=0,T={connection:"idle",message:"",rtt:null,code:null,slot:null,room:null,suspended:!1};function L(oe=T.connection,Le=""){T={connection:oe,message:Le,rtt:T.rtt,code:l?.code??d?.code??null,slot:c,room:l,suspended:f},e({...T})}function z(oe){d=oe;try{oe?n?.setItem(lh,JSON.stringify(oe)):n?.removeItem(lh)}catch{}}function I(){try{let oe=JSON.parse(n?.getItem(lh)??"null");if(oe&&/^[A-F0-9]{6}$/.test(oe.code)&&typeof oe.token=="string"&&oe.token.length>=20)return{code:oe.code,token:oe.token}}catch{}return null}function R(oe){if(a?.readyState!==1)return!1;let Le=JSON.stringify(oe);try{return a.send(Le),N+=new TextEncoder().encode(Le).length,!0}catch{return!1}}function k(){let oe=a;if(a=null,w=null,T.rtt=null,P=null,_=1/0,oe)try{oe.close()}catch{}}function H(){h?.clear()}function J(oe,Le="closed"){u=null,g=0,S=null,z(null),H(),h=null,k(),l=null,c=null,o=null,y=null,m=-1,L(Le,oe)}function G(){if(H(),k(),w=null,!p){if(!d){u=null,L("error","\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u8BF7\u91CD\u65B0\u52A0\u5165");return}S??=r.now(),g=r.now()+Math.min(4e3,250*2**Math.min(M++,4)),L("reconnecting","\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u6B63\u5728\u91CD\u8FDE")}}function F(oe){k(),u=oe,g=0,v=r.now(),E=r.now(),L(d?"reconnecting":"connecting");let Le;try{Le=s(t),a=Le}catch{G();return}Le.addEventListener("open",()=>{p||a!==Le||(v=r.now(),R(oe),w=r.now(),E=w,R({type:"ping",at:w}))}),Le.addEventListener("message",te=>{if(p||a!==Le)return;v=r.now();let j;try{let re=typeof te.data=="string"?te.data:String(te.data);A+=new TextEncoder().encode(re).length,j=JSON.parse(re)}catch{G();return}if(j.type==="joined"){if(j.slot!==0&&j.slot!==1||typeof j.token!="string"||typeof j.code!="string"){J("\u65E0\u6548\u7684\u623F\u95F4\u54CD\u5E94","error");return}let re=c===j.slot;c=j.slot,z({code:j.code,token:j.token}),!h||!re?h=cf({slot:c,clock:r}):H(),M=0,S=null,y=null,m=-1,L("connected")}else if(j.type==="state"){if(c===null||!j.room||!Number.isSafeInteger(j.epoch)||!Number.isSafeInteger(j.tick)||y!==null&&(j.epoch<y||j.epoch===y&&j.tick<m))return;let re=j.epoch!==y&&j.room.mode==="playing";try{o=sf(j,o)}catch{G();return}if(y=j.epoch,m=j.tick,l=j.room,!f&&l.mode==="playing"&&["playing","bonus"].includes(o.status)?h.receive(o,{epoch:y,ack:j.acks[c],inputs:j.inputs,at:Number.isFinite(j.serverAt)&&P!==null?j.serverAt-P:r.now()-(T.rtt??0)/2}):H(),re&&!f&&l.members?.[c]?.ready&&(qe({},1/60),a!==Le))return;i(o,j),L("connected")}else if(j.type==="pong"){if(j.at===w){let re=r.now();T.rtt=Math.max(0,re-j.at),Number.isFinite(j.serverAt)&&T.rtt<=_&&(_=T.rtt,P=j.serverAt-(j.at+re)/2),w=null,L(T.connection,T.message)}}else j.type==="closed"?J(j.message||"\u623F\u95F4\u5DF2\u7ED3\u675F"):j.type==="error"&&(u?.type==="join"&&u.token&&y===null?J(j.message||"\u623F\u95F4\u65E0\u6CD5\u91CD\u8FDE","error"):L("error",j.message||"\u64CD\u4F5C\u5931\u8D25"))}),Le.addEventListener("close",()=>{a===Le&&G()}),Le.addEventListener("error",()=>{a===Le&&G()})}function Y(){return p?!1:((l||d)&&ee(),f=!1,o=null,c=null,y=null,m=-1,F({type:"create"}),!0)}function le(oe){if(p)return!1;let Le=String(oe??"").trim().toUpperCase();return/^[A-F0-9]{6}$/.test(Le)?((l||d)&&ee(),f=!1,o=null,c=null,y=null,m=-1,F({type:"join",code:Le}),!0):(L("error","\u8BF7\u8F93\u51656\u4F4D\u623F\u95F4\u53F7"),!1)}function ae(oe,Le={}){return!["start","pause","resume","retry","next","finishBonus"].includes(oe)||p||!l?!1:(oe==="pause"&&H(),R(oe==="next"?{type:oe,areaId:Le.areaId}:{type:oe}))}function qe(oe,Le){if(p||f||a?.readyState!==1||!l||l.mode!=="playing"||!["playing","bonus"].includes(o?.status))return{commands:[],state:He()};if(a.bufferedAmount>65536||h.diagnostics().pending>=120)return $e(),L("connected","\u7F51\u7EDC\u62E5\u5835\uFF0C\u5DF2\u6682\u505C"),{commands:[],state:He()};let te=h.advance(oe,Le);return te.commands.length&&!R({type:"input",epoch:y,commands:te.commands})?(G(),{commands:[],state:He()}):te}function He(oe){return h?.render(oe)??o}function $e(oe=!1){f=!0,H(),R({type:"ready",value:!!oe}),oe&&R({type:"pause"}),L()}function $(oe){if(p||!l)return!1;f=!oe,oe||H();let Le=R({type:"ready",value:!!oe});return L(),Le}function ee(){p||(R({type:"leave"}),f=!1,J("\u5DF2\u9000\u51FA\u623F\u95F4"))}function fe(){p||(R({type:"ready",value:!1}),p=!0,r.clearInterval(we),globalThis.removeEventListener?.("pagehide",Oe),H(),k(),L("closed","\u8FDE\u63A5\u5DF2\u5173\u95ED"))}function Oe(){$e(),fe()}let we=r.setInterval(()=>{if(p)return;let oe=r.now();if(S!==null&&oe-S>12e4){J("\u91CD\u8FDE\u7B49\u5F85\u5DF2\u8D85\u65F6","error");return}if(g&&oe>=g){F({type:"join",code:d.code,token:d.token});return}if(a&&oe-v>8e3){G();return}a?.readyState===1&&oe-E>=2e3&&(E=oe,w=oe,R({type:"ping",at:oe}))},250);return globalThis.addEventListener?.("pagehide",Oe),d=I(),d&&F({type:"join",code:d.code,token:d.token}),{create:Y,join:le,command:ae,advance:qe,render:He,suspend:$e,setReady:$,leave:ee,dispose:fe,get authority(){return o},get slot(){return c},get room(){return l},diagnostics:()=>({...h?.diagnostics(),connection:T.connection,rtt:T.rtt,slot:c,code:l?.code??d?.code??null,epoch:y,tick:m,suspended:f,receivedBytes:A,sentBytes:N})}}var vt=i=>document.getElementById(i),ch={idle:"\u5C1A\u672A\u8FDE\u63A5",connecting:"\u6B63\u5728\u8FDE\u63A5",connected:"\u5DF2\u8FDE\u63A5",reconnecting:"\u6B63\u5728\u91CD\u8FDE",closed:"\u623F\u95F4\u5DF2\u7ED3\u675F",error:"\u8FDE\u63A5\u63D0\u793A"};function hh(i,e){let t=i.room,n=i.slot===0,s=!!t?.members.every(o=>o?.connected&&o.ready),r=i.slot===null?"\u7B49\u5F85\u52A0\u5165":n?"\u5947\u5947 \xB7 \u623F\u4E3B":"\u8482\u8482 \xB7 \u961F\u5458",a=i.connection!=="connected"?ch[i.connection]:i.rtt===null?"\u5EF6\u8FDF\u6D4B\u91CF\u4E2D":`\u5EF6\u8FDF ${Math.round(i.rtt)} ms`;vt("online-code").textContent=i.code??"\u2014\u2014",vt("online-role").textContent=`\u4F60\u7684\u89D2\u8272\uFF1A${r}`,vt("online-message").textContent=i.message||ch[i.connection],vt("online-members").textContent=t?t.members.map((o,l)=>`${l===0?"\u5947\u5947":"\u8482\u8482"}\uFF1A${o?o.connected?o.ready?"\u5DF2\u51C6\u5907":"\u7B49\u5F85\u6062\u590D":"\u5DF2\u65AD\u5F00":"\u7B49\u5F85\u52A0\u5165"}`).join(" \xB7 "):"\u521B\u5EFA\u623F\u95F4\uFF0C\u628A\u623F\u95F4\u53F7\u53D1\u7ED9\u642D\u6863\uFF1B\u4E5F\u53EF\u4EE5\u8F93\u5165\u623F\u95F4\u53F7\u52A0\u5165\u3002",vt("online-entry").hidden=!!t,vt("online-start").hidden=!t||t.mode!=="lobby"||!n,vt("online-start").disabled=!s||!e||i.connection!=="connected",vt("online-hud").textContent=`\u623F\u95F4 ${i.code??"\u2014\u2014"} \xB7 ${r} \xB7 ${ch[i.connection]}`,vt("online-hud").hidden=!1,vt("online-latency").textContent=a,vt("online-latency").hidden=!1,vt("resume").disabled=!n||!s||!e||i.connection!=="connected",vt("retry").disabled=!n||!s||!e,vt("gameover-retry").disabled=!n||!s||!e,vt("next-area").disabled=!n||!s,vt("bonus-finish").disabled=!n,vt("pause-copy").textContent=e?s?n?"\u4E24\u4F4D\u642D\u6863\u5DF2\u51C6\u5907\uFF0C\u70B9\u51FB\u7EE7\u7EED\u5192\u9669\u3002":"\u7B49\u5F85\u623F\u4E3B\u7EE7\u7EED\u5192\u9669\u3002":"\u7B49\u5F85\u4E24\u4F4D\u642D\u6863\u8FDE\u63A5\u5E76\u51C6\u5907\u3002":"\u672C\u8BBE\u5907\u6B63\u5728\u6062\u590D\uFF0C\u6062\u590D\u540E\u7531\u623F\u4E3B\u7EE7\u7EED\u3002"}function df(){hh({connection:"idle",message:"",rtt:null,code:null,slot:null,room:null,suspended:!1},!0),vt("online-input").value="",vt("online-hud").hidden=!0,vt("online-latency").hidden=!0,vt("online-leave").hidden=!0,vt("home").hidden=!1,vt("online-entry").hidden=!1;for(let i of["resume","retry","gameover-retry","next-area","bonus-finish"])vt(i).disabled=!1;vt("pause-copy").textContent="\u51C6\u5907\u597D\u4E86\uFF0C\u5C31\u7EE7\u7EED\u4E00\u8D77\u51FA\u53D1\u3002"}function uf(i,e){let t=e?Math.max(0,(i-e)/1e3):.016666666666666666;return{local:Math.min(1/30,t),online:t}}var Ve=i=>document.getElementById(i),Gn=Ve("view"),Qr=Zu(),Ze=Qr.load(),Ot=Ku(Ze.options),Mt,Ae,zt="home",pt=null,Zi=null,Ti=null,ea=0,$i=!1,Ml=!1,dh=null,uh,pf=!Qr.error,Fe=null,_l=null,ks=null,Kr=0,Ei=!1,Ai=null,Hn=null,fh=!1,mh=!0,vl=!1,mf=[],Ci=()=>mh&&!document.hidden&&!!Mt&&!Mt.diagnostics().contextLost,gh=()=>!!Fe?.room?.members.every(i=>i?.connected&&i.ready),cn=$u({players:Ze.options.players,joystick:Ve("joystick"),jump:Ve("touch-jump"),action:Ve("touch-action"),capture:()=>zt==="game"&&!pt,onPause:()=>{zt==="game"&&(pt==="pause"?xh():pt||Et("pause"))}});function Fs(i,e=!1){clearTimeout(uh),Ve("notice").textContent=i,i&&!e&&(uh=setTimeout(()=>{Ve("notice").textContent=""},5e3))}function Bs(){if(Fe)return!0;let i=Qr.save(Ze);return pf=i.ok,i.ok||Fs(i.error,!0),i.ok}function ji(){Ve("best-score").textContent=`\u6700\u9AD8\u7EAA\u5F55\uFF1A${Ze.bestScore} \u5206`;for(let[i,e]of[["players-one",Ze.options.players===1],["players-two",Ze.options.players===2],["chip",Ze.options.character==="chip"],["dale",Ze.options.character==="dale"],["music",Ze.options.music],["sound",Ze.options.sound]])Ve(i).setAttribute("aria-pressed",String(e));Ve("music").textContent=`\u97F3\u4E50\uFF1A${Ze.options.music?"\u5F00":"\u5173"}`,Ve("sound").textContent=`\u97F3\u6548\uFF1A${Ze.options.sound?"\u5F00":"\u5173"}`;for(let i of document.querySelectorAll("[data-quality]"))i.setAttribute("aria-pressed",String(i.dataset.quality===Ze.options.quality));Ve("continue").hidden=!Ze.run,Ve("saved-label").textContent=Ze.run?`${pf?"\u5DF2\u4FDD\u5B58":"\u672C\u6B21\u8FDB\u5EA6\u672A\u4FDD\u5B58"}\uFF1A${aa(Ze.run.areaId).name}\u8D77\u70B9 \xB7 ${Ze.run.score} \u5206`:""}function Ri(){if(!Mt)return;let i=Gn.getBoundingClientRect();Mt.resize(i.width,i.height)}function gf(i,e=Ae){return{areaId:i,score:e.score,flowers:e.flowers,stars:e.stars,lives:e.players.map(t=>t.lives),players:e.players.length,character:e.players[0].character}}function ei(i,e=!1){if(i&&Mt?.diagnostics().contextLost){Et("pause");return}Ae&&!Fe&&Cl(Ae,!i),cn.clear(),Ot.setActive(i&&!document.hidden&&(!Fe||Fe.room?.mode==="playing"&&Ci()),{finishEffects:e&&!document.hidden}),ea=0,Mt&&Ae&&yh()}function Os(){for(let i of document.querySelectorAll(".panel"))i.hidden=!0;Ve("overlay").hidden=!0,pt=null}function Et(i,e=!1){pt!==i&&(Fe&&zt==="game"&&Fe.room?.mode==="playing"&&!["complete","gameover"].includes(i)&&Fe.command("pause"),ei(!1,e),Os(),pt=i,Ve(i+"-panel").hidden=!1,Ve("overlay").hidden=!1,i==="map"&&s_(),Gn.dataset.phase=i==="pause"?"paused":i)}function xh(){if(Fe&&pt==="pause"){cn.clear(),Fe.slot===0&&gh()&&Ci()&&Fe.command("resume");return}let i=Zi;if(Zi=null,Os(),i){Et(i);return}zt==="game"&&["playing","bonus"].includes(Ae.status)?(ei(!0),Gn.focus({preventScroll:!0})):ei(!1)}function Ji(){if(Hn=null,_l&&(Ze.options=_l,_l=null,Ot.setOptions(Ze.options),Mt?.setQuality(Ze.options.quality)),Fe){let i=Fe;Fe=null,ks=null,Kr++,i.leave(),i.dispose()}document.body.dataset.online="false",df(),cn.setPlayers(Ze.options.players),Zi=null,Os(),zt="home",document.body.dataset.screen="home",Ve("home-panel").hidden=!1,Ve("hud").hidden=!0,Ve("touch-controls").hidden=!0,Ve("bonus-bar").hidden=!0,$i=!1,Ae=Ws(aa("0"),{players:2,character:Ze.options.character}),Cl(Ae,!0),Mt.setLevel(Ae.level),ei(!1),ji(),Ri()}function bl(i,{resume:e=!1,reset:t=!1,retry:n=!1}={}){Zi=null,Os(),zt="game",document.body.dataset.screen="game",Ve("home-panel").hidden=!0,Ve("hud").hidden=!1,Ve("touch-controls").hidden=!1,$i=!1;let s=e?Ze.run:n?dh:t?null:Ze.run,r=e&&s?{players:s.players,character:s.character}:Ze.options;if(Ae=Ws(aa(i),{players:r.players,character:r.character,campaign:Ze.campaign}),s){Ae.score=s.score,Ae.flowers=s.flowers,Ae.stars=s.stars;let a=r.players===1&&s.players===2?[s.lives[0]>0?s.lives[0]:s.lives[1]]:s.lives;Ae.players.forEach((o,l)=>{o.lives=n?3:a[l]??3,o.hearts=o.lives>0?3:0})}Ze.campaign.current=i,dh=gf(i),Ze.run=structuredClone(dh),Bs(),ji(),cn.setPlayers(Ae.players.length),Mt.setLevel(Ae.level),Ri(),ei(!0),Gn.focus({preventScroll:!0}),Ot.unlock()}function s_(){let i=Fe?Ae.campaign:Ze.campaign,e=Pi(i);Ve("area-grid").replaceChildren();for(let t of zs){let n=document.createElement("button");n.dataset.area=t.id,n.disabled=!e.includes(t.id)||!!Fe&&(Fe.slot!==0||Ae.status!=="cleared"||!gh());let s=document.createElement("b");s.textContent=t.id;let r=document.createElement("span");r.textContent=t.name,n.append(s,r),i.completed.includes(t.id)&&(n.setAttribute("aria-label",`${t.id} ${t.name}\uFF0C\u5DF2\u5B8C\u6210\uFF0C\u53EF\u56DE\u73A9`),n.append(document.createTextNode("\u2713 \u5DF2\u5B8C\u6210"))),n.addEventListener("click",()=>Fe?Fe.command("next",{areaId:t.id}):bl(t.id)),Ve("area-grid").append(n)}Ve("map-copy").textContent=i.ending?"\u670B\u53CB\u5DF2\u83B7\u6551\uFF01\u4E5F\u53EF\u4EE5\u56DE\u5230\u559C\u6B22\u7684\u533A\u57DF\u518D\u5192\u9669\u3002":"\u5B8C\u6210\u533A\u57DF\u540E\uFF0C\u65B0\u7684\u8DEF\u7EBF\u4F1A\u4EAE\u8D77\u6765\u3002"}function xf(){if(Fe){$i||($i=!0,oh(Ae,document),Et("complete",!0));return}if($i)return;$i=!0;let i=Ze.campaign.current,e=gf(i);Ze.run=e;let t=Bs();ji(),oh(Ae,document),Et("complete",!0),t&&Fs("\u8FDB\u5EA6\u5DF2\u4FDD\u5B58\uFF0C\u53EF\u4ECE\u4E0B\u4E00\u7AD9\u8D77\u70B9\u7EE7\u7EED\u3002")}function yf(){let i=Ae.players;Ve("area-name").textContent=Ae.areaLevel.name,Ve("hearts").textContent=i.map((e,t)=>`${i.length>1?`${t+1}P `:""}${e.character==="chip"?"\u5947\u5947":"\u8482\u8482"} ${"\u2665".repeat(e.hearts)}${"\u2661".repeat(3-e.hearts)} \xD7${e.lives}`).join("  "),Ve("score").textContent=`${Ae.score} \u5206`,Ve("collectibles").textContent=`\u82B1 ${Ae.flowers} \xB7 \u661F ${Ae.stars}`,Ve("bonus-bar").hidden=Ae.status!=="bonus"||!!pt,Ae.bonus&&(Ve("bonus-count").textContent=`\u5956\u52B1\u65F6\u95F4 ${Math.ceil(Ae.bonus.remaining)} \u79D2 \xB7 \u5DF2\u6536\u96C6 ${Ae.bonus.collected}`)}function yh(){let i=Mt.diagnostics(),e=Ae.players;Object.assign(Gn.dataset,{webgl:String(i.webgl),contextLost:String(i.contextLost),phase:pt==="pause"?"paused":pt??(zt==="home"?"home":Ae.status),theme:Ae.level.theme,area:Ae.areaLevel.id,level:Ae.level.id,x:String(e[0].x),y:String(e[0].y),positions:JSON.stringify(e.map(t=>({id:t.id,character:t.character,x:t.x,y:t.y,hearts:t.hearts,lives:t.lives,carrying:t.carrying,hidden:t.hidden,grounded:t.grounded,groundId:t.groundId,vx:t.vx,vy:t.vy}))),players:String(e.length),carrying:String(e.filter(t=>t.carrying).length),hidden:String(e[0].hidden),graphics:JSON.stringify(i),audio:JSON.stringify(Ot.diagnostics()),pads:JSON.stringify(cn.bindings),score:String(Ae.score),flowers:String(Ae.flowers),stars:String(Ae.stars),simTime:String(Ae.time),completed:JSON.stringify(Fe?Ae.completed:Ze.campaign.completed),renderPositions:JSON.stringify(mf),network:JSON.stringify(Fe?{...Fe.diagnostics(),room:Fe.room}:null),physics:JSON.stringify({platforms:Ae.platforms,objects:Ae.objects,enemies:Ae.enemies,hazards:Ae.hazards,projectiles:Ae.projectiles})})}function _f(i){if(Ti=null,Ml||!Mt||!Ae||document.hidden)return;let e=uf(i,ea),t=e.local;if(ea=i,zt==="game"){let o=pt,l=cn.sample();Fe?Fe.advance(pt||o?{}:l[0]??{},e.online):!pt&&!o&&Ll(Ae,l,t),Ae.level!==ta&&(Mt.setLevel(Ae.level),ta=Ae.level),Ot.consume(Ae),!Fe&&Ae.score>Ze.bestScore&&(Ze.bestScore=Ae.score,Bs(),ji()),Ae.status==="cleared"?xf():Ae.status==="gameover"&&!pt&&Et("gameover",!0),yf()}zt==="home"&&!pt&&!Fe&&(Ae.time+=t);let n=Fe?.render()??Ae,s=Mt.diagnostics().frames;Mt.update(n,t);let r=Mt.diagnostics().frames,a=Hn===null||Fe?.room?.mode==="paused"&&Fe.room.members[Fe.slot]?.ready===!1&&Fe.diagnostics().epoch>Hn;Fe?.authority&&!Ei&&a&&Ci()&&ks?.connection==="connected"&&r>s&&(Ai===null?Ai=r:r>Ai&&(Ei=!0,Hn=null,Fe.setReady(!0))),mf=n.players.map(o=>({id:o.id,x:o.x,y:o.y})),yh(),Ti=requestAnimationFrame(_f)}var ta;function _h(){ea=0,Mt&&Ae&&Ti===null&&!Ml&&!document.hidden&&!Mt.diagnostics().contextLost&&(Ti=requestAnimationFrame(_f))}function na(){mh=!1,Ei=!1,Ai=null,Fe?.suspend(),cn.clear(),Ot.setActive(!1),zt==="game"&&!pt&&Et("pause"),Ti!==null&&cancelAnimationFrame(Ti),Ti=null,ea=0}function ff(){if(Fe){Fe.command("retry");return}bl(Ae.areaLevel.id,{retry:!0})}for(let[i,e]of Object.entries({start:()=>bl("0",{reset:!0}),continue:()=>Ze.run&&bl(Ze.run.areaId,{resume:!0}),pause:()=>Et("pause"),resume:xh,retry:ff,home:Ji,"gameover-retry":ff,"gameover-home":Ji,"complete-home":Ji,"next-area":()=>{Zi="complete",Et("map")},"map-open":()=>Et("map"),"help-open":()=>Et("help"),"options-open":()=>Et("options"),"paused-options":()=>{Zi="pause",Et("options")},"bonus-finish":()=>{Fe?Fe.command("finishBonus"):Pl(Ae)}}))Ve(i).addEventListener("click",()=>{Ot.unlock(),e(),zt==="game"&&!pt&&Gn.focus({preventScroll:!0})});for(let i of document.querySelectorAll(".close-panel"))i.addEventListener("click",xh);for(let[i,e,t]of[["players-one","players",1],["players-two","players",2],["chip","character","chip"],["dale","character","dale"]])Ve(i).addEventListener("click",()=>{Ze.options[e]=t,Bs(),ji(),zt==="home"&&Mt&&Ae&&Ji()});for(let i of["music","sound"])Ve(i).addEventListener("click",()=>{Ze.options[i]=!Ze.options[i],Ot.unlock(),Ot.setOptions(Ze.options),Bs(),ji()});for(let i of document.querySelectorAll("[data-quality]"))i.addEventListener("click",()=>{Ze.options.quality=i.dataset.quality,Mt?.setQuality(Ze.options.quality),Bs(),ji()});window.addEventListener("resize",Ri);var vf=new ResizeObserver(Ri);vf.observe(Ve("stage"));window.addEventListener("blur",()=>{cn.clear(),Ot.setActive(!1),Fe?na():zt==="game"&&!pt&&Et("pause")});document.addEventListener("visibilitychange",()=>{document.hidden?na():ia()});window.addEventListener("focus",()=>{Fe&&ia()});document.addEventListener("freeze",na);document.addEventListener("resume",ia);window.addEventListener("pagehide",i=>{vl=!!Fe&&i.persisted,na(),i.persisted||(Ml=!0,clearTimeout(uh),vf.disconnect(),cn.dispose(),Ot.dispose(),Mt?.dispose())});window.addEventListener("pageshow",()=>{if(!Ml){if(vl){vl=!1;let i=Fe;Fe=null,Kr++,i?.dispose(),Sl()}Ri(),ia()}});function ia(){mh=!0,cn.clear(),Fe&&(Ei=!1,Ai=null),bf(),_h()}function bf(){ks&&hh(ks,Ci()&&Hn===null)}function r_(i,e){if(Ae=i,!!Mt){if(fh||(fh=!0,document.body.dataset.screen="game",Ve("home-panel").hidden=!0,Ri()),Ae.level!==ta&&(Mt.setLevel(Ae.level),ta=Ae.level),e.room.mode==="lobby")pt!=="online"&&Et("online");else{let t=zt!=="game"||ph!==e.room.run;ph=e.room.run,zt="game",document.body.dataset.screen="game",Ve("home-panel").hidden=!0,Ve("hud").hidden=!1,Ve("touch-controls").hidden=!1,t&&($i=!1,Zi=null,Os(),Ri(),ei(e.room.mode==="playing"&&Hn===null)),Hn!==null&&e.room.mode==="playing"?(pt!=="pause"&&Et("pause"),ei(!1)):e.room.mode==="paused"?((!pt||pt==="online")&&Et("pause"),ei(!1)):e.room.mode==="playing"&&["pause","online"].includes(pt)?(Os(),ei(!0),Gn.focus({preventScroll:!0})):!pt&&Ot.diagnostics().active!==Ci()&&Ot.setActive(Ci()),Ae.status==="cleared"?xf():Ae.status==="gameover"&&!pt&&Et("gameover",!0),yf()}yh(),Ti===null&&_h()}}var ph=null;function Sl(){if(Fe)return Fe;_l??={...Ze.options};let i=++Kr;return Ei=!1,Ai=null,Hn=null,fh=!1,ph=null,cn.setPlayers(1),document.body.dataset.online="true",Ve("online-leave").hidden=!1,Ve("home").hidden=!0,Fe=hf({onState(e,t){i===Kr&&r_(e,t)},onStatus(e){if(i!==Kr)return;let t=e.suspended&&!ks?.suspended&&Ei&&Ci();if(ks=e,t&&(Hn=Fe.diagnostics().epoch,Ei=!1,Ai=null,cn.clear(),Ot.setActive(!1),zt==="game"&&pt!=="pause"&&Et("pause")),e.connection==="reconnecting"&&(Ei=!1,Ai=null,Hn=null),["reconnecting","closed","error"].includes(e.connection)&&(cn.clear(),Ot.setActive(!1)),bf(),e.message&&e.connection==="error"&&Fs(e.message),e.connection==="closed"&&Fe&&!Fe.authority&&!vl){let n=e.message;Ji(),Fs(n)}else e.connection==="reconnecting"&&zt==="game"&&!pt&&Et("pause")}}),Fe}Ve("online-open").addEventListener("click",()=>{Et("online"),Ve("online-hud").hidden=!0});Ve("online-create").addEventListener("click",()=>{Ot.unlock(),Sl().create()});Ve("online-join").addEventListener("click",()=>{Ot.unlock(),Sl().join(Ve("online-input").value)});Ve("online-start").addEventListener("click",()=>{Ot.unlock(),gh()&&Ci()&&Fe?.command("start")});for(let i of document.querySelectorAll("[data-online-leave]"))i.addEventListener("click",Ji);for(let i of["contextmenu","selectstart"])Ve("app").addEventListener(i,e=>e.preventDefault());try{Mt=qu(Gn),Gn.addEventListener("webglcontextlost",na),Gn.addEventListener("webglcontextrestored",()=>{Ri(),ia()}),Mt.setQuality(Ze.options.quality),Ji(),ta=Ae.level;try{sessionStorage.getItem("rescue.online.session.v1")&&(Et("online"),Sl())}catch{}Qr.error&&Fs(Qr.error,!0),_h()}catch(i){Fs(i.message,!0),Ve("start").disabled=!0,Ve("continue").disabled=!0,Ve("map-open").disabled=!0}
