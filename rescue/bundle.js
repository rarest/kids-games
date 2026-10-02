function Kn(i,e,t,n,s,r,a,o={}){i.projectiles.push({id:`boss-shot-${i.nextEntityId++}`,kind:t,owner:e.id,x:n,y:s,vx:r,vy:a,w:.45,h:.45,ttl:6,gravity:0,...o})}var Uu=(i,e)=>i.players.filter(t=>t.lives>0&&!t.heldBy).sort((t,n)=>Math.abs(t.x-e.x)-Math.abs(n.x-e.x))[0];function sh(i,e){let t=i.boss;if(!t||t.defeated)return;let n=Uu(i,t);if(!n||(!t.active&&Math.abs(n.x-t.x)<18&&(t.active=!0,i.events.push({id:`event-${i.nextEventId++}`,type:"bossStart",kind:t.kind,time:i.time})),!t.active))return;t.timer+=e,t.attackTimer+=e,t.invulnerable=Math.max(0,t.invulnerable-e);let s=t.timer,r=Math.sign(n.x-t.x)||-1;switch(t.kind){case"robot":t.phase="armSweep",t.x=t.homeX,t.attackTimer>1.65&&(t.attackTimer=0,Kn(i,t,"lightning",t.x-t.w*.42,t.y+.4,-7,0),Kn(i,t,"lightning",t.x+t.w*.42,t.y+t.h*.65,5,-1.4));break;case"owl":{let a=s%4.5;t.phase=a>2.4&&a<3.4?"dive":"perch",t.x=t.homeX+Math.sin(s)*2,t.y=t.homeY-(t.phase==="dive"?Math.sin((a-2.4)*Math.PI)*2.4:0),t.attackTimer>1.8&&(t.attackTimer=0,Kn(i,t,"feather",t.x,t.y+.6,r*4,-4));break}case"ufo":t.phase=s%5>3.5?"ram":"alienDrop",t.x=t.homeX+Math.sin(s*(t.phase==="ram"?2.2:1.1))*3,t.y=t.phase==="ram"?(t.arena?.y??t.homeY)+.5:t.homeY+Math.sin(s*1.8)*.65,t.attackTimer>1.4&&(t.attackTimer=0,Kn(i,t,"alien",t.x,t.y,r*1.4,-1,{gravity:9,w:.7,h:.7,bounce:!0}));break;case"toyRobot":if(t.phase=s%5>3.6?"charge":"march",t.x=t.homeX+Math.sin(s*(t.phase==="charge"?2:.7))*2,t.attackTimer>1.9){t.attackTimer=0;for(let[a,o]of["red","blue","green"].entries())Kn(i,t,"colorBall",n.x+(a-1)*1.7,t.y+t.h+2,0,-1,{gravity:12,bounce:!0,color:o})}break;case"electricFish":if(t.phase=s%3.2>2?"discharge":"swim",t.x=t.homeX+Math.sin(s)*1.8,t.y=t.homeY+Math.sin(s*2)*.6,t.attackTimer>2.1){t.attackTimer=0;for(let a of[-Math.PI*.8,-Math.PI*.5,-Math.PI*.2])Kn(i,t,"spark",t.x,t.y,Math.cos(a)*5,Math.sin(a)*5)}break;case"casinoCat":if(t.phase="slot",t.x=t.homeX+Math.sin(s*.8)*1.2,t.attackTimer>1.7){t.attackTimer=0;let a=n.x-t.x,o=n.y+.6-t.y,l=Math.hypot(a,o)||1;for(let c of[-.35,0,.35])Kn(i,t,"token",t.x,t.y+.6,a/l*5,o/l*5+c,{gravity:1})}break;case"caterpillar":t.breakTimer=Math.max(0,(t.breakTimer??0)-e),t.phase=t.breakTimer>0?"separated":"segmentWave",t.x=t.homeX+Math.sin(s*.9)*2,t.y=t.homeY+Math.sin(s*1.4)*.8,t.segments=t.breakTimer>0?[]:Array.from({length:5},(a,o)=>({x:t.x+Math.sin(s*2-o*.7)*.6,y:t.y+o*(t.h/5),w:.7,h:t.h/5}));break;case"fatCat":if(t.phase=s%4>2?"cigar":"taunt",t.x=t.homeX+Math.sin(s*.45)*.4,t.attackTimer>1.75){t.attackTimer=0;for(let a of[-1,0,1])Kn(i,t,"ash",t.x-t.w*.16,t.y+t.h*.78,r*(4+a*.8),5+a*1.2,{gravity:10})}break}t.anchors={mouth:{x:t.x-t.w*.16,y:t.y+t.h*.78},hand:{x:t.x-t.w*.34,y:t.y+t.h*.52}},t.contactRegions=t.kind==="fatCat"||t.kind==="caterpillar"&&t.breakTimer>0?[]:t.kind==="robot"?[-1,1].map(a=>({x:t.x+a*t.w*.38,y:t.y+.2,w:t.w*.25,h:t.h*.85})):[{x:t.x,y:t.y,w:t.w,h:t.h}],t.kind==="robot"?t.weakpoint={kind:"orb",x:t.x,y:t.y+t.h-.45,w:.75,h:.6}:t.kind==="toyRobot"?t.weakpoint={kind:"chest",x:t.x,y:t.y+t.h*.48,w:1,h:.7}:t.weakpoint=null,t.attackTimer===0&&i.events.push({id:`event-${i.nextEventId++}`,type:"bossAttack",kind:t.kind,time:i.time})}var Ts=[{id:"0",name:"\u8857\u533A\u4E0E\u5B9E\u9A8C\u5BA4",theme:"street",width:242,height:74,spawn:{x:2.881,y:1},platforms:[{id:"street-west",x:0,y:1,w:38.893,h:.65,kind:"solid",oneWay:!1},{id:"trash-step",x:11.524,y:2.6,w:4.321,h:.65,kind:"solid",oneWay:!1},{id:"planter-step",x:23.048,y:3.2,w:5.762,h:.65,kind:"solid",oneWay:!1},{id:"street-east",x:40.333,y:1,w:28.81,h:.65,kind:"solid",oneWay:!1},{id:"pole-foot",x:66.262,y:2.4,w:7.202,h:.65,kind:"solid",oneWay:!1},{id:"pole-a",x:70.583,y:4.8,w:5.762,h:.65,kind:"wire",oneWay:!0},{id:"pole-b",x:66.262,y:7.2,w:5.762,h:.65,kind:"wire",oneWay:!0},{id:"pole-c",x:70.583,y:9.6,w:5.762,h:.65,kind:"wire",oneWay:!0},{id:"pole-d",x:66.262,y:12,w:5.762,h:.65,kind:"wire",oneWay:!0},{id:"pole-e",x:70.583,y:14.4,w:5.762,h:.65,kind:"wire",oneWay:!0},{id:"roof-east",x:53.298,y:28.8,w:16.5,h:.65,kind:"solid",oneWay:!1},{id:"roof-mid",x:31.69,y:28.8,w:20.167,h:.65,kind:"solid",oneWay:!1},{id:"roof-west",x:7.202,y:28.8,w:23.048,h:.65,kind:"solid",oneWay:!1},{id:"roof-chimney",x:37.452,y:30.8,w:5.762,h:.65,kind:"solid",oneWay:!1},{id:"left-pole-a",x:4.321,y:31.2,w:7.202,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-b",x:0,y:33.6,w:7.202,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-c",x:4.321,y:36,w:7.202,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-d",x:0,y:38.4,w:7.202,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-e",x:4.321,y:40.8,w:7.202,h:.65,kind:"wire",oneWay:!0},{id:"wire-one",x:7.202,y:55.2,w:34.571,h:.65,kind:"wire",oneWay:!0},{id:"wire-two",x:44.655,y:55.2,w:30.25,h:.65,kind:"wire",oneWay:!0},{id:"wire-three",x:77.786,y:55.2,w:28.81,h:.65,kind:"wire",oneWay:!0},{id:"wire-four",x:109.476,y:55.2,w:28.29,h:.65,kind:"wire",oneWay:!0},{id:"wire-high",x:122.44,y:57.6,w:21.607,h:.65,kind:"wire",oneWay:!0},{id:"wall-approach",x:141.167,y:57.6,w:12.964,h:.65,kind:"solid",oneWay:!1},{id:"lab-west",x:154.131,y:57.6,w:28.81,h:.65,kind:"solid",oneWay:!1},{id:"lab-books",x:164.214,y:59.8,w:5.762,h:.65,kind:"solid",oneWay:!1},{id:"lab-tubes",x:177.179,y:60,w:7.202,h:.65,kind:"shelf",oneWay:!0},{id:"lab-east",x:185.821,y:57.6,w:56.179,h:.65,kind:"solid",oneWay:!1},{id:"right-pole-f",x:70.5,y:16.8,w:5.8,h:.65,kind:"wire",oneWay:!0},{id:"right-pole-g",x:66.3,y:19.2,w:5.8,h:.65,kind:"wire",oneWay:!0},{id:"right-pole-h",x:70.5,y:21.6,w:5.8,h:.65,kind:"wire",oneWay:!0},{id:"right-pole-i",x:66.3,y:24,w:5.8,h:.65,kind:"wire",oneWay:!0},{id:"right-pole-j",x:70.5,y:26.4,w:5.8,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-f",x:0,y:43.2,w:7.2,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-g",x:4.3,y:45.6,w:7.2,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-h",x:0,y:48,w:7.2,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-i",x:4.3,y:50.4,w:7.2,h:.65,kind:"wire",oneWay:!0},{id:"left-pole-j",x:0,y:52.8,w:7.2,h:.65,kind:"wire",oneWay:!0}],objects:[{id:"s1",kind:"crate",x:5.762,y:1},{id:"s2",kind:"crate",x:8.643,y:1,contents:"flower"},{id:"s3",kind:"apple",x:17.286,y:2.6},{id:"s4",kind:"metal",x:31.69,y:1},{id:"s5",kind:"bigcrate",x:44.655,y:1,contents:"zipper"},{id:"s6",kind:"crate",x:53.298,y:1},{id:"p1",kind:"crate",x:69.143,y:2.4},{id:"r1",kind:"crate",x:59.06,y:28.8},{id:"r2",kind:"crate",x:37.452,y:30.8,contents:"star"},{id:"w1",kind:"metal",x:50.417,y:55.2},{id:"w2",kind:"crate",x:92.19,y:55.2},{id:"l1",kind:"crate",x:158.452,y:57.6},{id:"l2",kind:"apple",x:171.417,y:57.6},{id:"l3",kind:"bigcrate",x:191.583,y:57.6,contents:"acorn"},{id:"ball-0",kind:"ball",x:217.512,y:57.6}],enemies:[{id:"dog1",kind:"dog",x:14.405,y:1,min:11.524,max:20.167},{id:"dog2",kind:"dog",x:40.333,y:1,min:33.131,max:48.976},{id:"dog3",kind:"dog",x:57.619,y:1,min:51.857,max:64.821},{id:"bird1",kind:"bird",x:38.893,y:32,min:24.488,max:54.738},{id:"dog4",kind:"dog",x:37.452,y:28.8,min:33.131,max:48.976},{id:"bird2",kind:"bird",x:89.31,y:58,min:77.786,max:102.274},{id:"dog5",kind:"dog",x:126.762,y:55.2,min:113.798,max:135.405},{id:"lab-mouse",kind:"mouse",x:171.417,y:57.6,min:158.452,max:180.06},{id:"street-mimic",kind:"mimic",x:53,y:1,min:50,max:60}],hazards:[{id:"hazard-0",kind:"electric",x:87.87,y:55.2,w:2.881,h:.6,period:3,activeFor:.8}],decor:[{id:"fence-8-1",kind:"fence",x:11.524,y:1,w:31.69,h:5},{id:"planter-16-1",kind:"planter",x:23.048,y:1,w:5.762,h:3},{id:"trash-24-1",kind:"trash",x:34.571,y:1,w:2.881,h:4},{id:"pole-49-1",kind:"pole",x:70.583,y:1,w:2.881,h:32},{id:"building-27-1",kind:"building",x:38.893,y:1,w:53.298,h:16},{id:"pole-4-1",kind:"pole",x:5.762,y:1,w:2.881,h:33},{id:"satellite-102-33.6",kind:"satellite",x:146.929,y:57.6,w:4.321,h:4},{id:"lab-138-33.6",kind:"lab",x:198.786,y:57.6,w:79.226,h:10},{id:"testTubes-115-33.6",kind:"testTubes",x:165.655,y:57.6,w:8.643,h:5},{id:"pencil-135-33.6",kind:"pencil",x:194.464,y:57.6,w:11.524,h:1}],exit:{x:237.679,y:57.6},boss:{id:"boss-robot",kind:"robot",x:230.476,y:57.6,w:5,h:5.5,hp:5,arena:{x:213.19,y:57.6,w:28.81}},checkpoints:[{x:60.5,y:28.8},{x:10.083,y:55.2},{x:155.571,y:57.6}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["street east","right utility pole climb","roof west","left pole climb","overhead wires east","laboratory","robot arena"],landmarks:["flower pots and trash cans","two pole climbs and return along roofs","giant laboratory test tubes and pencil"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"A",name:"\u5927\u6811\u6500\u767B",theme:"tree",width:65,height:96,spawn:{x:10.156,y:1},platforms:[{id:"branch-base",x:2.031,y:1,w:24.375,h:.65,kind:"branch",oneWay:!0,route:!0},{id:"branch-1",x:14.219,y:3.4,w:20.313,h:.65,kind:"branch",oneWay:!0,route:!0,flowers:!0},{id:"branch-2",x:4.063,y:5.8,w:20.313,h:.65,kind:"branch",oneWay:!0,route:!0},{id:"branch-3",x:16.25,y:8.2,w:18.281,h:.65,kind:"branch",oneWay:!0,route:!0},{id:"branch-4",x:6.094,y:10.6,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-5",x:14.219,y:13,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-6",x:4.063,y:15.4,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-7",x:16.25,y:17.8,w:18.281,h:.65,kind:"branch",oneWay:!0},{id:"branch-8",x:8.125,y:20.2,w:20.313,h:.65,kind:"branch",oneWay:!0,flowers:!0},{id:"branch-9",x:2.031,y:22.6,w:18.281,h:.65,kind:"branch",oneWay:!0},{id:"branch-10",x:14.219,y:25,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-11",x:6.094,y:27.4,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-12",x:16.25,y:29.8,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-13",x:4.063,y:32.2,w:18.281,h:.65,kind:"branch",oneWay:!0},{id:"branch-14",x:14.219,y:34.6,w:20.313,h:.65,kind:"branch",oneWay:!0,flowers:!0},{id:"branch-15",x:6.094,y:37,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-16",x:16.25,y:39.4,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-17",x:4.063,y:41.8,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-18",x:14.219,y:44.2,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-19",x:6.094,y:46.6,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-20",x:16.25,y:49,w:20.313,h:.65,kind:"branch",oneWay:!0,flowers:!0},{id:"branch-21",x:4.063,y:51.4,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-22",x:14.219,y:53.8,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-23",x:6.094,y:56.2,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-24",x:16.25,y:58.6,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-25",x:4.063,y:61,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-26",x:14.219,y:63.4,w:20.313,h:.65,kind:"branch",oneWay:!0,flowers:!0},{id:"branch-27",x:6.094,y:65.8,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-28",x:16.25,y:68.2,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-29",x:6.094,y:70.6,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-30",x:16.25,y:73,w:20.313,h:.65,kind:"branch",oneWay:!0},{id:"branch-31",x:6,y:75.4,w:20,h:.65,kind:"branch",oneWay:!0},{id:"branch-32",x:17,y:77.8,w:20,h:.65,kind:"branch",oneWay:!0},{id:"branch-33",x:6,y:80.2,w:20,h:.65,kind:"branch",oneWay:!0},{id:"branch-34",x:17,y:82.6,w:20,h:.65,kind:"branch",oneWay:!0},{id:"branch-35",x:6,y:85,w:20,h:.65,kind:"branch",oneWay:!0},{id:"branch-36",x:17,y:87.4,w:20,h:.65,kind:"branch",oneWay:!0},{id:"owl-perch",x:17,y:89.8,w:48,h:.65,kind:"branch",oneWay:!0}],objects:[{id:"a0",kind:"crate",x:6.094,y:1},{id:"a1",kind:"crate",x:18.281,y:8.2,contents:"flower"},{id:"a2",kind:"metal",x:18.281,y:17.8},{id:"a3",kind:"crate",x:16.25,y:25},{id:"a4",kind:"bigcrate",x:16.25,y:34.6,contents:"zipper"},{id:"a5",kind:"apple",x:10.156,y:41.8},{id:"a6",kind:"crate",x:18.281,y:49},{id:"a7",kind:"crate",x:10.156,y:56.2,contents:"acorn"},{id:"a8",kind:"crate",x:20.313,y:68.2},{id:"ball-A",kind:"ball",x:40.625,y:89.8}],enemies:[{id:"c1",kind:"caterpillar",x:20.313,y:3.4,min:16.25,max:30.469},{id:"c2",kind:"caterpillar",x:12.188,y:15.4,min:6.094,max:20.313},{id:"bee1",kind:"bee",x:30.469,y:22,min:16.25,max:34.531},{id:"c3",kind:"caterpillar",x:16.25,y:27.4,min:8.125,max:22.344},{id:"bird1",kind:"bird",x:24.375,y:36,min:8.125,max:30.469},{id:"c4",kind:"caterpillar",x:14.219,y:46.6,min:8.125,max:22.344},{id:"bee2",kind:"bee",x:28.438,y:52,min:12.188,max:32.5},{id:"bird2",kind:"bird",x:16.25,y:67,min:6.094,max:32.5},{id:"c5",kind:"caterpillar",x:22.344,y:73,min:18.281,max:30.469}],hazards:[],decor:[{id:"trunk-19-1",kind:"trunk",x:38.594,y:1,w:10.156,h:90},{id:"leaves-7-7",kind:"leaves",x:14.219,y:7,w:28.438,h:8},{id:"leaves-9-23",kind:"leaves",x:18.281,y:23,w:26.406,h:8},{id:"treeHole-19-30",kind:"treeHole",x:38.594,y:30,w:4.063,h:3},{id:"leaves-8-43",kind:"leaves",x:16.25,y:43,w:28.438,h:7},{id:"leaves-8-60",kind:"leaves",x:16.25,y:60,w:24.375,h:7},{id:"treeHole-19-72",kind:"treeHole",x:38.594,y:72,w:6.094,h:3},{id:"leaves-23-79",kind:"leaves",x:46.719,y:79,w:40.625,h:5}],exit:{x:58.906,y:89.8},boss:{id:"boss-owl",kind:"owl",x:48.75,y:93.4,w:3.2,h:2.7,hp:5,arena:{x:32.5,y:89.8,w:32.5}},checkpoints:[{x:18.281,y:25},{x:18.281,y:49}],pickups:[{id:"branch-1-flower-1",kind:"flower",x:19.297,y:3.75},{id:"branch-1-flower-2",kind:"flower",x:24.375,y:3.75},{id:"branch-1-flower-3",kind:"flower",x:29.453,y:3.75},{id:"branch-8-flower-1",kind:"flower",x:13.203,y:20.55},{id:"branch-8-flower-2",kind:"flower",x:18.281,y:20.55},{id:"branch-8-flower-3",kind:"flower",x:23.359,y:20.55},{id:"branch-14-flower-1",kind:"flower",x:19.297,y:34.95},{id:"branch-14-flower-2",kind:"flower",x:24.375,y:34.95},{id:"branch-14-flower-3",kind:"flower",x:29.453,y:34.95},{id:"branch-20-flower-1",kind:"flower",x:21.328,y:49.35},{id:"branch-20-flower-2",kind:"flower",x:26.406,y:49.35},{id:"branch-20-flower-3",kind:"flower",x:31.484,y:49.35},{id:"branch-26-flower-1",kind:"flower",x:19.297,y:63.75},{id:"branch-26-flower-2",kind:"flower",x:24.375,y:63.75},{id:"branch-26-flower-3",kind:"flower",x:29.453,y:63.75}],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["lower trunk branches","alternating ascending boughs","upper canopy","owl arena"],landmarks:["giant central tree trunk","stacked zigzag branches","tree holes and caterpillars"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"B",name:"\u5DE8\u578B\u9910\u5385\u4E0E\u6C34\u69FD",theme:"kitchen",width:354,height:14,spawn:{x:5.168,y:1},platforms:[{id:"bar-floor",x:0,y:1,w:67.182,h:.65,kind:"solid",oneWay:!1},{id:"stool-one",x:20.672,y:3,w:14.688,h:.65,kind:"shelf",oneWay:!0},{id:"counter",x:38.759,y:4.8,w:36.175,h:.65,kind:"solid",oneWay:!1},{id:"bottles",x:74.934,y:4.8,w:25.839,h:.65,kind:"solid",oneWay:!1},{id:"sink-west",x:103.358,y:4.8,w:17.272,h:.65,kind:"solid",oneWay:!1},{id:"sink-basin",x:116.277,y:2.2,w:38.759,h:.65,kind:"solid",oneWay:!1},{id:"sink-east",x:155.036,y:4.8,w:15.504,h:.65,kind:"solid",oneWay:!1},{id:"tap-cross",x:124.029,y:5.3,w:12.92,h:.65,kind:"shelf",oneWay:!0},{id:"dry-counter",x:170.54,y:4.8,w:25.839,h:.65,kind:"solid",oneWay:!1},{id:"stove-one",x:198.964,y:3.4,w:27.607,h:.65,kind:"solid",oneWay:!1},{id:"stove-two",x:229.971,y:3.4,w:25.839,h:.65,kind:"solid",oneWay:!1},{id:"drain-west",x:258.394,y:4.8,w:19.855,h:.65,kind:"solid",oneWay:!1},{id:"drain-ridge",x:281.65,y:5.8,w:14.688,h:.65,kind:"solid",oneWay:!1},{id:"drain-step",x:299.737,y:3.4,w:12.92,h:.65,kind:"solid",oneWay:!1},{id:"drain-floor",x:312.657,y:1,w:41.343,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"b1",kind:"crate",x:10.336,y:1},{id:"b2",kind:"crate",x:51.679,y:4.8},{id:"b3",kind:"apple",x:90.438,y:4.8},{id:"b4",kind:"metal",x:111.109,y:4.8},{id:"b5",kind:"crate",x:134.365,y:5.3},{id:"b6",kind:"bigcrate",x:186.044,y:4.8,contents:"acorn"},{id:"b7",kind:"crate",x:240.307,y:3.4},{id:"ball-B",kind:"ball",x:322.993,y:1}],enemies:[{id:"kang1",kind:"kangaroo",x:49.095,y:4.8,min:43.927,max:67.182},{id:"crab1",kind:"crab",x:126.613,y:2.2,min:118.861,max:147.285},{id:"pelican1",kind:"pelican",x:178.292,y:7,min:170.54,max:193.796},{id:"lizard1",kind:"lizard",x:235.139,y:3.4,min:232.555,max:250.642},{id:"lizard2",kind:"lizard",x:289.401,y:5.8,min:284.234,max:294.569},{id:"lizard3",kind:"lizard",x:320.409,y:1,min:312.657,max:325.577}],hazards:[{id:"hazard-0",kind:"faucet",x:122.737,y:2.2,w:2.584,h:3,period:2.8,activeFor:1.2},{id:"hazard-1",kind:"faucet",x:143.409,y:2.2,w:2.584,h:3,period:3.4,activeFor:1.1},{id:"hazard-2",kind:"press",x:210.591,y:3.4,w:2.584,h:2,period:3,activeFor:.7}],decor:[{id:"counter-18-1",kind:"counter",x:46.511,y:1,w:56.847,h:4},{id:"stool-8-1",kind:"stool",x:20.672,y:1,w:7.752,h:3},{id:"bottle-34-4.8",kind:"bottle",x:87.854,y:4.8,w:5.168,h:5},{id:"sink-52-1",kind:"sink",x:134.365,y:1,w:51.679,h:4},{id:"faucet-47-5",kind:"faucet",x:121.445,y:5,w:5.168,h:5},{id:"faucet-55-5",kind:"faucet",x:142.117,y:5,w:5.168,h:5},{id:"stove-86-1",kind:"stove",x:222.219,y:1,w:62.015,h:4},{id:"drain-114-1",kind:"drain",x:294.569,y:1,w:36.175,h:4},{id:"tileWall-80-1",kind:"tileWall",x:206.715,y:1,w:310.073,h:12}],exit:{x:346.248,y:1},boss:{id:"boss-ufo",kind:"ufo",x:335.912,y:5,w:4,h:1.8,hp:5,arena:{x:307.489,y:1,w:46.511}},checkpoints:[{x:170.54,y:4.8}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["bar and stools","bottles and running sink","burners","draining board","UFO arena"],landmarks:["oversized bar stools","multiple faucets","ridged metal draining board"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"C",name:"\u4E66\u623F\u4E0E\u540A\u6247",theme:"study",width:253,height:29,spawn:{x:4.217,y:1},platforms:[{id:"bookcase-lower",x:0,y:1,w:59.033,h:.65,kind:"solid",oneWay:!1},{id:"bookcase-upper",x:0,y:5.2,w:52.708,h:.65,kind:"shelf",oneWay:!0},{id:"book-step",x:54.817,y:3.2,w:8.433,h:.65,kind:"solid",oneWay:!1},{id:"book-stack",x:61.142,y:5.4,w:8.433,h:.65,kind:"solid",oneWay:!1},{id:"desk-west",x:69.575,y:7.6,w:38.767,h:.65,kind:"solid",oneWay:!1},{id:"book-high",x:82.225,y:9.8,w:10.542,h:.65,kind:"solid",oneWay:!1},{id:"desk-east",x:111.742,y:7.6,w:29.517,h:.65,kind:"solid",oneWay:!1},{id:"fan-one",x:143.367,y:9.7,w:14.758,h:.65,kind:"moving",oneWay:!0,axis:"x",range:1.2,speed:1},{id:"fan-two",x:160.233,y:7.6,w:15.575,h:.65,kind:"moving",oneWay:!0,axis:"x",range:1,speed:.8},{id:"fan-three",x:179.208,y:9.5,w:14.758,h:.65,kind:"moving",oneWay:!0,axis:"x",range:1.2,speed:1},{id:"desk-bridge",x:191.858,y:7.6,w:16.867,h:.65,kind:"solid",oneWay:!1},{id:"fan-four",x:210.833,y:9.6,w:15.575,h:.65,kind:"moving",oneWay:!0,axis:"x",range:.8,speed:1},{id:"final-desk",x:229.808,y:9.6,w:23.192,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"c1",kind:"crate",x:10.542,y:1},{id:"c2",kind:"crate",x:25.3,y:1,contents:"flower"},{id:"c3",kind:"metal",x:56.925,y:3.2},{id:"c4",kind:"crate",x:73.792,y:7.6},{id:"c5",kind:"apple",x:92.767,y:9.8},{id:"c6",kind:"bigcrate",x:128.608,y:7.6,contents:"zipper"},{id:"c7",kind:"crate",x:166.558,y:7.6},{id:"c8",kind:"crate",x:236.133,y:9.6,contents:"star"}],enemies:[{id:"m1",kind:"mouse",x:31.625,y:1,min:16.867,max:50.6},{id:"m2",kind:"mouse",x:88.55,y:7.6,min:71.683,max:103.308},{id:"b1",kind:"bird",x:111.742,y:11,min:86.442,max:130.717},{id:"m3",kind:"mouse",x:130.717,y:7.6,min:113.85,max:139.15},{id:"b2",kind:"bird",x:179.208,y:12,min:156.017,max:193.967},{id:"m4",kind:"mouse",x:240.35,y:9.6,min:231.917,max:248.783}],hazards:[{id:"hazard-0",kind:"electric",x:203.454,y:7.6,w:2.108,h:2,period:3,activeFor:.7}],decor:[{id:"bookshelf-12-1",kind:"bookshelf",x:25.3,y:1,w:59.033,h:9},{id:"books-30-1",kind:"books",x:63.25,y:1,w:8.433,h:6},{id:"desk-43-1",kind:"desk",x:90.658,y:1,w:40.058,h:7},{id:"books-40-7.6",kind:"books",x:84.333,y:7.6,w:10.542,h:3},{id:"fan-72-9.7",kind:"fan",x:151.8,y:9.7,w:16.867,h:5},{id:"fan-80-7.6",kind:"fan",x:168.667,y:7.6,w:16.867,h:5},{id:"fan-89-9.5",kind:"fan",x:187.642,y:9.5,w:16.867,h:5},{id:"lamp-99-7.6",kind:"lamp",x:208.725,y:7.6,w:4.217,h:6},{id:"desk-114-1",kind:"desk",x:240.35,y:1,w:25.3,h:9}],exit:{x:246.675,y:9.6},boss:null,checkpoints:[{x:113.85,y:7.6}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["bookshelf passage","desk stacks","ceiling fan crossing","hanging lights"],landmarks:["two-level bookcase","giant desktop books","suspended fan blades used as platforms"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"D",name:"\u73A9\u5177\u5DE5\u5382",theme:"toys",width:402,height:29,spawn:{x:5.545,y:1},platforms:[{id:"toy-floor",x:0,y:1,w:85.945,h:.65,kind:"solid",oneWay:!1},{id:"toy-box-a",x:19.407,y:3.2,w:11.09,h:.65,kind:"solid",oneWay:!1},{id:"toy-box-b",x:41.586,y:5.4,w:13.862,h:.65,kind:"solid",oneWay:!1},{id:"assembly",x:69.31,y:3.2,w:35.414,h:.65,kind:"conveyor",oneWay:!0,speed:1.6},{id:"assembly-two",x:108.124,y:3.2,w:27.724,h:.65,kind:"conveyor",oneWay:!0,speed:-1.2},{id:"stair-a",x:138.621,y:1,w:22.179,h:.65,kind:"solid",oneWay:!1},{id:"stair-b",x:152.483,y:3,w:22.179,h:.65,kind:"solid",oneWay:!1},{id:"stair-c",x:166.345,y:5,w:22.179,h:.65,kind:"solid",oneWay:!1},{id:"stair-d",x:180.207,y:7,w:66.538,h:.65,kind:"solid",oneWay:!1},{id:"stairs-down",x:235.655,y:5,w:27.724,h:.65,kind:"solid",oneWay:!1},{id:"pipe-top",x:266.152,y:6.8,w:13.234,h:.65,kind:"shelf",oneWay:!0},{id:"pipe-two",x:282.786,y:4.5,w:13.234,h:.65,kind:"shelf",oneWay:!0},{id:"pipe-three",x:299.421,y:6.7,w:13.234,h:.65,kind:"shelf",oneWay:!0},{id:"pipe-four",x:316.055,y:4.4,w:16.007,h:.65,kind:"shelf",oneWay:!0},{id:"package-base",x:327.145,y:1,w:27.724,h:.65,kind:"solid",oneWay:!1},{id:"gift-step",x:335.462,y:3.2,w:11.09,h:.65,kind:"solid",oneWay:!1},{id:"gift-upper",x:346.552,y:5.4,w:16.634,h:.65,kind:"solid",oneWay:!1},{id:"robot-floor",x:363.186,y:5.4,w:38.814,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"d1",kind:"crate",x:8.317,y:1},{id:"d2",kind:"crate",x:49.903,y:5.4},{id:"d3",kind:"metal",x:80.4,y:3.2},{id:"d4",kind:"crate",x:127.531,y:3.2},{id:"d5",kind:"apple",x:169.117,y:5},{id:"d6",kind:"bigcrate",x:210.703,y:7,contents:"zipper"},{id:"d7",kind:"crate",x:291.103,y:4.5},{id:"d8",kind:"crate",x:338.234,y:3.2},{id:"ball-D",kind:"ball",x:368.731,y:5.4}],enemies:[{id:"t1",kind:"toy",x:33.269,y:1,min:24.952,max:49.903},{id:"t2",kind:"toy",x:80.4,y:3.2,min:72.083,max:97.034},{id:"t3",kind:"toy",x:121.986,y:3.2,min:110.897,max:130.303},{id:"rh1",kind:"rhino",x:188.524,y:7,min:182.979,max:232.883},{id:"t4",kind:"toy",x:249.517,y:5,min:238.428,max:260.607},{id:"bee",kind:"bee",x:302.193,y:9,min:280.014,max:321.6},{id:"t5",kind:"toy",x:352.097,y:5.4,min:346.552,max:360.414},{id:"toy-mimic",kind:"mimic",x:50,y:1,min:47,max:60}],hazards:[{id:"hazard-0",kind:"press",x:95.648,y:3.2,w:2.772,h:2,period:3.1,activeFor:.8},{id:"hazard-1",kind:"electric",x:300.807,y:6.7,w:2.772,h:.7,period:3,activeFor:.7}],decor:[{id:"toyBox-8-1",kind:"toyBox",x:22.179,y:1,w:16.634,h:5},{id:"toyBox-18-1",kind:"toyBox",x:49.903,y:1,w:13.862,h:7},{id:"toyRobot-27-1",kind:"toyRobot",x:74.855,y:1,w:8.317,h:4},{id:"conveyor-37-1",kind:"conveyor",x:102.579,y:1,w:72.083,h:3},{id:"stairs-66-1",kind:"stairs",x:182.979,y:1,w:83.172,h:7},{id:"pipe-99-1",kind:"pipe",x:274.469,y:1,w:5.545,h:6},{id:"pipe-111-1",kind:"pipe",x:307.738,y:1,w:5.545,h:7},{id:"gift-124-1",kind:"gift",x:343.779,y:1,w:16.634,h:8},{id:"gift-131-1",kind:"gift",x:363.186,y:1,w:11.09,h:5}],exit:{x:393.683,y:5.4},boss:{id:"boss-toyRobot",kind:"toyRobot",x:385.366,y:5.4,w:4.6,h:5,hp:5,arena:{x:352.097,y:5.4,w:49.903}},checkpoints:[{x:180.207,y:7},{x:335.462,y:3.2}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["toy packaging","assembly conveyors","purple stepped racks","hanging pipes","gift towers","robot arena"],landmarks:["printed toy boxes","long purple stair racks","tall colorful wrapped gifts"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"E",name:"\u6CB3\u5CB8\u4E0E\u6C34\u95F8",theme:"river",width:354,height:14,spawn:{x:5.446,y:1},platforms:[{id:"fence-bank",x:0,y:1,w:59.908,h:.65,kind:"solid",oneWay:!1},{id:"fence-top",x:8.169,y:3.2,w:51.062,h:.65,kind:"shelf",oneWay:!0},{id:"brick-step",x:62.631,y:2.4,w:13.615,h:.65,kind:"solid",oneWay:!1},{id:"bank-high",x:76.246,y:4.8,w:46.292,h:.65,kind:"solid",oneWay:!1},{id:"bridge-start",x:125.262,y:4.8,w:18.385,h:.65,kind:"solid",oneWay:!1},{id:"sluice-one",x:147.046,y:4.8,w:21.108,h:.65,kind:"moving",oneWay:!0,axis:"y",range:1,speed:1},{id:"sluice-two",x:171.554,y:4.8,w:21.108,h:.65,kind:"moving",oneWay:!0,axis:"y",range:1,speed:.8},{id:"high-bank",x:196.062,y:6.8,w:35.4,h:.65,kind:"solid",oneWay:!1},{id:"sluice-wall",x:228.738,y:9,w:19.062,h:.65,kind:"solid",oneWay:!1},{id:"gate-down",x:247.8,y:6.6,w:15.662,h:.65,kind:"solid",oneWay:!1},{id:"islet-one",x:266.862,y:4.2,w:15.662,h:.65,kind:"solid",oneWay:!1},{id:"islet-two",x:285.923,y:3,w:15.662,h:.65,kind:"solid",oneWay:!1},{id:"last-bank",x:304.985,y:1,w:24.508,h:.65,kind:"solid",oneWay:!1},{id:"fish-deck",x:329.492,y:1,w:24.508,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"e1",kind:"crate",x:10.892,y:1},{id:"e2",kind:"apple",x:46.292,y:3.2},{id:"e3",kind:"crate",x:81.692,y:4.8},{id:"e4",kind:"bigcrate",x:119.815,y:4.8,contents:"acorn"},{id:"e5",kind:"metal",x:177,y:4.8},{id:"e6",kind:"crate",x:220.569,y:6.8},{id:"e7",kind:"crate",x:285.923,y:3},{id:"ball-E",kind:"ball",x:331.671,y:1}],enemies:[{id:"bee1",kind:"bee",x:29.954,y:7,min:8.169,max:54.462},{id:"p1",kind:"pelican",x:117.092,y:7,min:92.585,max:133.431},{id:"cr1",kind:"crab",x:209.677,y:6.8,min:201.508,max:226.015},{id:"bird1",kind:"bird",x:253.246,y:10,min:236.908,max:288.646},{id:"p2",kind:"pelican",x:310.431,y:5,min:291.369,max:324.046}],hazards:[{id:"hazard-0",kind:"water",x:167.47,y:-1,w:57.185,h:2},{id:"hazard-1",kind:"water",x:283.2,y:-1,w:43.569,h:2}],decor:[{id:"fence-11-1",kind:"fence",x:29.954,y:1,w:62.631,h:5},{id:"tree-7-1",kind:"tree",x:19.062,y:1,w:13.615,h:10},{id:"brick-34-1",kind:"brick",x:92.585,y:1,w:49.015,h:5},{id:"sluice-59-1",kind:"sluice",x:160.662,y:1,w:16.338,h:6},{id:"sluice-68-1",kind:"sluice",x:185.169,y:1,w:16.338,h:6},{id:"water-63--1",kind:"water",x:171.554,y:-1,w:81.692,h:2},{id:"brick-80-1",kind:"brick",x:217.846,y:1,w:54.462,h:8},{id:"gate-89-1",kind:"gate",x:242.354,y:1,w:16.338,h:9},{id:"pump-125-1",kind:"pump",x:340.385,y:1,w:13.615,h:6}],exit:{x:345.831,y:1},boss:{id:"boss-electricFish",kind:"electricFish",x:340.385,y:4.2,w:3.1,h:1.8,hp:5,arena:{x:307.708,y:1,w:46.292}},checkpoints:[{x:198.785,y:6.8}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["fenced river bank","brick embankments","moving water-gate crossing","stepped islands","fish pool"],landmarks:["wooden riverside fences","broad water gap and sluice pistons","sloped brick banks"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"F",name:"\u8FD0\u8F93\u5DE5\u5382\u4E0E\u5347\u964D\u4E95",theme:"factory",width:145,height:59,spawn:{x:2.613,y:1},platforms:[{id:"loading-west",x:0,y:1,w:13.063,h:.65,kind:"solid",oneWay:!1},{id:"loading-two",x:15.676,y:1,w:11.757,h:.65,kind:"solid",oneWay:!1},{id:"loading-three",x:30.045,y:1,w:11.757,h:.65,kind:"solid",oneWay:!1},{id:"loading-four",x:44.414,y:1,w:13.063,h:.65,kind:"solid",oneWay:!1},{id:"loading-five",x:60.09,y:1,w:13.063,h:.65,kind:"solid",oneWay:!1},{id:"belt-low",x:75.766,y:1,w:19.595,h:.65,kind:"conveyor",oneWay:!0,speed:1.6},{id:"belt-top",x:78.378,y:4,w:14.369,h:.65,kind:"conveyor",oneWay:!0,speed:-1.3},{id:"crate-ramp",x:94.054,y:3.2,w:9.144,h:.65,kind:"solid",oneWay:!1},{id:"crate-ramp-top",x:100.586,y:5.4,w:10.45,h:.65,kind:"solid",oneWay:!1},{id:"shaft-foot",x:111.036,y:5.4,w:15.676,h:.65,kind:"shelf",oneWay:!0,route:!0},{id:"shaft-1",x:116.261,y:7.8,w:13.063,h:.65,kind:"shelf",oneWay:!0,route:!0},{id:"shaft-2",x:111.036,y:10.2,w:13.063,h:.65,kind:"shelf",oneWay:!0,route:!0},{id:"shaft-3",x:116.261,y:12.6,w:13.063,h:.65,kind:"shelf",oneWay:!0,route:!0},{id:"shaft-4",x:111.036,y:15,w:13.063,h:.65,kind:"moving",oneWay:!0,axis:"x",range:.7,speed:.9},{id:"shaft-5",x:116.261,y:17.4,w:13.063,h:.65,kind:"shelf",oneWay:!0},{id:"shaft-6",x:111.036,y:19.8,w:13.063,h:.65,kind:"shelf",oneWay:!0},{id:"shaft-7",x:116.261,y:22.2,w:13.063,h:.65,kind:"moving",oneWay:!0,axis:"x",range:.6,speed:.7},{id:"shaft-8",x:111.036,y:24.6,w:13.063,h:.65,kind:"shelf",oneWay:!0},{id:"shaft-9",x:116.261,y:27,w:13.063,h:.65,kind:"shelf",oneWay:!0},{id:"shaft-10",x:111.036,y:29.4,w:13.063,h:.65,kind:"conveyor",oneWay:!0,speed:1},{id:"shaft-11",x:116.261,y:31.8,w:13.063,h:.65,kind:"conveyor",oneWay:!0,speed:-1},{id:"shaft-12",x:111.036,y:34.2,w:13.063,h:.65,kind:"conveyor",oneWay:!0,speed:1},{id:"shaft-13",x:111,y:36.6,w:14,h:.65,kind:"shelf",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-14",x:116,y:39,w:14,h:.65,kind:"moving",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-15",x:111,y:41.4,w:14,h:.65,kind:"shelf",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-16",x:116,y:43.8,w:14,h:.65,kind:"conveyor",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-17",x:111,y:46.2,w:14,h:.65,kind:"conveyor",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-18",x:116,y:48.6,w:14,h:.65,kind:"shelf",oneWay:!0,axis:"x",range:.6,speed:1},{id:"shaft-exit",x:118,y:51,w:27,h:.65,kind:"solid",oneWay:!1,axis:"x",range:.6,speed:1}],objects:[{id:"f1",kind:"crate",x:6.532,y:1},{id:"f2",kind:"metal",x:20.901,y:1},{id:"f3",kind:"crate",x:35.27,y:1,contents:"flower"},{id:"f4",kind:"apple",x:52.252,y:1},{id:"f5",kind:"bigcrate",x:82.297,y:1,contents:"zipper"},{id:"f6",kind:"crate",x:97.973,y:3.2},{id:"f7",kind:"crate",x:113.649,y:10.2},{id:"f8",kind:"metal",x:118.874,y:19.8},{id:"f9",kind:"crate",x:117.568,y:29.4},{id:"f10",kind:"crate",x:129.324,y:51,contents:"star"}],enemies:[{id:"rh1",kind:"rhino",x:84.91,y:1,min:77.072,max:94.054},{id:"m1",kind:"mouse",x:104.505,y:5.4,min:101.892,max:109.73},{id:"m2",kind:"mouse",x:121.486,y:12.6,min:117.568,max:126.712},{id:"bird",kind:"bird",x:118.874,y:25,min:113.649,max:128.018}],hazards:[{id:"hazard-0",kind:"press",x:18.941,y:1,w:1.306,h:2,period:3,activeFor:.6},{id:"hazard-1",kind:"press",x:48.986,y:1,w:1.306,h:2,period:3.7,activeFor:.7},{id:"hazard-2",kind:"electric",x:120.833,y:27,w:1.306,h:.6,period:3,activeFor:.7}],decor:[{id:"piston-6-3",kind:"piston",x:7.838,y:3,w:5.225,h:8},{id:"piston-18-3",kind:"piston",x:23.514,y:3,w:5.225,h:8},{id:"piston-29-3",kind:"piston",x:37.883,y:3,w:5.225,h:8},{id:"piston-42-3",kind:"piston",x:54.865,y:3,w:5.225,h:8},{id:"conveyor-65-1",kind:"conveyor",x:84.91,y:1,w:23.514,h:5},{id:"shippingCrates-79-1",kind:"shippingCrates",x:103.198,y:1,w:15.676,h:7},{id:"pipe-85-5",kind:"pipe",x:111.036,y:5,w:2.613,h:34},{id:"pipe-102-5",kind:"pipe",x:133.243,y:5,w:2.613,h:34},{id:"warning-100-38",kind:"warning",x:130.631,y:38,w:15.676,h:2}],exit:{x:141.081,y:51},boss:null,checkpoints:[{x:78.378,y:1},{x:116.261,y:19.8}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["loading press bays","two-tier conveyors","wooden shipping crates","vertical elevator shaft"],landmarks:["round industrial presses","green riveted walls","alternating narrow lift ledges"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"G",name:"\u9910\u5385\u4E0E\u8D4C\u573A",theme:"casino",width:402,height:14,spawn:{x:6.432,y:1},platforms:[{id:"restaurant-floor",x:0,y:1,w:70.752,h:.65,kind:"solid",oneWay:!1},{id:"table-a",x:25.728,y:3.2,w:28.76,h:.65,kind:"shelf",oneWay:!0},{id:"table-b",x:57.888,y:5.4,w:25.728,h:.65,kind:"shelf",oneWay:!0},{id:"bar-west",x:83.616,y:5.4,w:54.672,h:.65,kind:"solid",oneWay:!1},{id:"bar-step",x:131.856,y:3.2,w:22.512,h:.65,kind:"solid",oneWay:!1},{id:"restaurant-east",x:151.152,y:1,w:57.888,h:.65,kind:"solid",oneWay:!1},{id:"casino-step",x:205.824,y:3.2,w:19.296,h:.65,kind:"solid",oneWay:!1},{id:"casino-one",x:225.12,y:5.4,w:31.976,h:.65,kind:"shelf",oneWay:!0},{id:"casino-two",x:260.496,y:5.4,w:25.728,h:.65,kind:"shelf",oneWay:!0},{id:"casino-low",x:283.008,y:3.2,w:25.728,h:.65,kind:"solid",oneWay:!1},{id:"casino-three",x:308.736,y:5.4,w:28.76,h:.65,kind:"shelf",oneWay:!0},{id:"casino-four",x:340.896,y:7.6,w:22.512,h:.65,kind:"shelf",oneWay:!0},{id:"slot-floor",x:360.192,y:1,w:41.808,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"g1",kind:"crate",x:16.08,y:1},{id:"g2",kind:"apple",x:67.536,y:5.4},{id:"g3",kind:"crate",x:106.128,y:5.4},{id:"g4",kind:"metal",x:176.88,y:1},{id:"g5",kind:"bigcrate",x:234.768,y:5.4,contents:"zipper"},{id:"g6",kind:"crate",x:273.36,y:5.4},{id:"g7",kind:"crate",x:318.384,y:5.4},{id:"ball-G",kind:"ball",x:373.056,y:1}],enemies:[{id:"rh1",kind:"rhino",x:48.24,y:1,min:19.296,max:67.536},{id:"m1",kind:"mouse",x:99.696,y:5.4,min:86.832,max:131.856},{id:"rh2",kind:"rhino",x:183.312,y:1,min:157.584,max:202.608},{id:"bee",kind:"bee",x:266.928,y:8,min:237.984,max:292.656},{id:"m2",kind:"mouse",x:315.168,y:5.4,min:311.952,max:331.248}],hazards:[{id:"hazard-0",kind:"electric",x:287.832,y:3.2,w:3.216,h:.7,period:3.5,activeFor:.9},{id:"casino-floor-spikes",kind:"spike",x:357.078,y:1,w:1.5,h:.5}],decor:[{id:"slotMachine-7-5",kind:"slotMachine",x:22.512,y:5,w:12.864,h:6},{id:"table-12-1",kind:"table",x:38.592,y:1,w:25.728,h:3},{id:"bar-33-1",kind:"bar",x:106.128,y:1,w:73.968,h:5},{id:"bottle-35-5.4",kind:"bottle",x:112.56,y:5.4,w:9.648,h:3},{id:"restaurantDoor-58-1",kind:"restaurantDoor",x:186.528,y:1,w:16.08,h:8},{id:"curtain-86-1",kind:"curtain",x:276.576,y:1,w:128.64,h:14},{id:"chandelier-80-8",kind:"chandelier",x:257.28,y:8,w:12.864,h:5},{id:"chandelier-100-8",kind:"chandelier",x:321.6,y:8,w:12.864,h:5},{id:"slotMachine-119-1",kind:"slotMachine",x:382.704,y:1,w:16.08,h:11}],exit:{x:392.352,y:1},boss:{id:"boss-casinoCat",kind:"casinoCat",x:382.704,y:5.5,w:3.3,h:3.5,hp:5,arena:{x:347.328,y:1,w:57.888}},checkpoints:[{x:205.824,y:3.2}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["red restaurant","bottles and counter","blue-curtain casino platforms","slot machine cat"],landmarks:["restaurant stools and bottle shelves","hanging brass lamps","slot machine occupied by casino cat"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"H",name:"\u4E0B\u6C34\u9053\u4E0E\u7BA1\u9053\u6500\u767B",theme:"sewer",width:241,height:59,spawn:{x:3.708,y:1},platforms:[{id:"sewer-west",x:0,y:1,w:25.954,h:.65,kind:"solid",oneWay:!1},{id:"pipe-low",x:25.954,y:2,w:14.831,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-mid",x:38.931,y:4.4,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"sewer-east",x:55.615,y:1,w:22.246,h:.65,kind:"solid",oneWay:!1},{id:"pipe-base",x:74.154,y:2.4,w:22.246,h:.65,kind:"pipe",oneWay:!0,route:!0},{id:"pipe-1",x:81.569,y:4.8,w:18.538,h:.65,kind:"pipe",oneWay:!0,route:!0},{id:"pipe-2",x:74.154,y:7.2,w:18.538,h:.65,kind:"pipe",oneWay:!0,route:!0},{id:"pipe-3",x:81.569,y:9.6,w:18.538,h:.65,kind:"pipe",oneWay:!0,route:!0},{id:"pipe-4",x:74.154,y:12,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-5",x:81.569,y:14.4,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-6",x:74.154,y:16.8,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-7",x:81.569,y:19.2,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-8",x:74.154,y:21.6,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-9",x:81.569,y:24,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-10",x:74.154,y:26.4,w:18.538,h:.65,kind:"pipe",oneWay:!0},{id:"upper-pipe",x:88.985,y:48,w:31.515,h:.65,kind:"pipe",oneWay:!0},{id:"upper-bank",x:120.5,y:48,w:20.392,h:.65,kind:"solid",oneWay:!1},{id:"water-ledge",x:142.746,y:50.2,w:13.285,h:.65,kind:"solid",oneWay:!1},{id:"water-middle",x:159.431,y:48.2,w:13.285,h:.65,kind:"solid",oneWay:!1},{id:"brick-ridge",x:176.115,y:50.6,w:14.831,h:.65,kind:"solid",oneWay:!1},{id:"final-pipe",x:192.8,y:50.6,w:29.662,h:.65,kind:"pipe",oneWay:!0},{id:"exit-bank",x:224.315,y:50.6,w:16.685,h:.65,kind:"solid",oneWay:!1},{id:"pipe-11",x:82,y:28.8,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-12",x:74,y:31.2,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-13",x:82,y:33.6,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-14",x:74,y:36,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-15",x:82,y:38.4,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-16",x:74,y:40.8,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-17",x:82,y:43.2,w:18,h:.65,kind:"pipe",oneWay:!0},{id:"pipe-18",x:74,y:45.6,w:18,h:.65,kind:"pipe",oneWay:!0}],objects:[{id:"h1",kind:"crate",x:5.562,y:1},{id:"h2",kind:"metal",x:42.638,y:4.4},{id:"h3",kind:"crate",x:64.885,y:1},{id:"h4",kind:"crate",x:79.715,y:7.2},{id:"h5",kind:"bigcrate",x:87.131,y:14.4,contents:"zipper"},{id:"h6",kind:"metal",x:81.569,y:21.6},{id:"h7",kind:"crate",x:114.938,y:48},{id:"h8",kind:"apple",x:148.308,y:50.2},{id:"h9",kind:"crate",x:202.069,y:50.6,contents:"star"}],enemies:[{id:"cr1",kind:"crab",x:18.538,y:1,min:5.562,max:24.1},{id:"cr2",kind:"crab",x:48.2,y:4.4,min:40.785,max:55.615},{id:"b1",kind:"bird",x:83.423,y:12,min:76.008,max:94.546},{id:"cr3",kind:"crab",x:87.131,y:19.2,min:83.423,max:98.254},{id:"l1",kind:"lizard",x:129.769,y:48,min:122.354,max:139.038},{id:"l2",kind:"lizard",x:166.846,y:48.2,min:161.285,max:170.554},{id:"b2",kind:"bird",x:202.069,y:54.2,min:190.946,max:218.754},{id:"l3",kind:"lizard",x:231.731,y:50.6,min:226.169,max:239.146}],hazards:[{id:"hazard-0",kind:"water",x:40.785,y:-1,w:29.662,h:2},{id:"hazard-1",kind:"water",x:159.431,y:45.2,w:37.077,h:2},{id:"hazard-2",kind:"faucet",x:204.85,y:50.6,w:1.854,h:3,period:3,activeFor:.8}],decor:[{id:"brickWall-64-1",kind:"brickWall",x:118.646,y:1,w:237.292,h:37},{id:"water-22--1",kind:"water",x:40.785,y:-1,w:31.515,h:2},{id:"pipe-17-2",kind:"pipe",x:31.515,y:2,w:3.708,h:7},{id:"pipe-28-1",kind:"pipe",x:51.908,y:1,w:3.708,h:7},{id:"pipe-40-2",kind:"pipe",x:74.154,y:2,w:3.708,h:29},{id:"pipe-55-2",kind:"pipe",x:101.962,y:2,w:3.708,h:31},{id:"drain-59-31",kind:"drain",x:109.377,y:50.2,w:5.562,h:3},{id:"water-85-26",kind:"water",x:157.577,y:45.2,w:37.077,h:2},{id:"pipe-112-30",kind:"pipe",x:207.631,y:49.2,w:37.077,h:2}],exit:{x:235.438,y:50.6},boss:null,checkpoints:[{x:81.569,y:16.8},{x:122.354,y:48}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["low sewer pipe maze","tall pipe climb","upper white banks","three-tier upper pipes"],landmarks:["orange pipe maze against blue brick","green wastewater","upper pipe racks and lizards"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"I",name:"\u529E\u516C\u5BA4\u4E0E\u7535\u8BDD",theme:"office",width:290,height:14,spawn:{x:4.531,y:1},platforms:[{id:"can-table",x:0,y:1,w:36.25,h:.65,kind:"solid",oneWay:!1},{id:"can-step",x:15.859,y:3.2,w:11.328,h:.65,kind:"solid",oneWay:!1},{id:"desk-a",x:38.516,y:3.4,w:33.984,h:.65,kind:"solid",oneWay:!1},{id:"phone-pole",x:70.234,y:5.6,w:12.459,h:.65,kind:"shelf",oneWay:!0},{id:"desk-b",x:86.094,y:3.4,w:27.188,h:.65,kind:"solid",oneWay:!1},{id:"drawer-step",x:113.281,y:1.4,w:11.328,h:.65,kind:"solid",oneWay:!1},{id:"file-cans",x:126.875,y:3.6,w:13.594,h:.65,kind:"solid",oneWay:!1},{id:"phone-pole-two",x:140.469,y:5.8,w:12.459,h:.65,kind:"shelf",oneWay:!0},{id:"desk-c",x:156.328,y:3.6,w:36.25,h:.65,kind:"solid",oneWay:!1},{id:"phone-table",x:194.844,y:3.6,w:27.188,h:.65,kind:"solid",oneWay:!1},{id:"drawer-a",x:208.438,y:5.8,w:12.459,h:.65,kind:"solid",oneWay:!1},{id:"drawer-b",x:224.297,y:8,w:12.459,h:.65,kind:"solid",oneWay:!1},{id:"ceiling-cross",x:240.156,y:8,w:13.594,h:.65,kind:"shelf",oneWay:!0},{id:"phone-final",x:251.484,y:5.8,w:13.594,h:.65,kind:"solid",oneWay:!1},{id:"caterpillar-floor",x:265.078,y:5.8,w:24.922,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"i1",kind:"crate",x:6.797,y:1},{id:"i2",kind:"apple",x:24.922,y:3.2},{id:"i3",kind:"crate",x:54.375,y:3.4},{id:"i4",kind:"metal",x:99.688,y:3.4},{id:"i5",kind:"bigcrate",x:163.125,y:3.6,contents:"acorn"},{id:"i6",kind:"crate",x:203.906,y:3.6},{id:"i7",kind:"crate",x:228.828,y:8},{id:"ball-I",kind:"ball",x:269.609,y:5.8}],enemies:[{id:"m1",kind:"mouse",x:45.313,y:3.4,min:40.781,max:67.969},{id:"b1",kind:"bird",x:77.031,y:8,min:63.438,max:101.953},{id:"m2",kind:"mouse",x:95.156,y:3.4,min:88.359,max:111.016},{id:"m3",kind:"mouse",x:178.984,y:3.6,min:158.594,max:190.313},{id:"b2",kind:"bird",x:219.766,y:10,min:197.109,max:242.422},{id:"m4",kind:"mouse",x:253.75,y:5.8,min:251.484,max:262.813}],hazards:[{id:"hazard-0",kind:"electric",x:143.867,y:5.8,w:2.266,h:.6,period:3.4,activeFor:1}],decor:[{id:"cans-7-1",kind:"cans",x:15.859,y:1,w:27.188,h:6},{id:"desk-24-1",kind:"desk",x:54.375,y:1,w:36.25,h:3},{id:"phone-32-3.4",kind:"phone",x:72.5,y:3.4,w:9.063,h:5},{id:"desk-43-1",kind:"desk",x:97.422,y:1,w:29.453,h:3},{id:"cans-57-1",kind:"cans",x:129.141,y:1,w:13.594,h:5},{id:"desk-77-1",kind:"desk",x:174.453,y:1,w:38.516,h:3},{id:"phone-78-3.6",kind:"phone",x:176.719,y:3.6,w:9.063,h:4},{id:"drawers-96-3.6",kind:"drawers",x:217.5,y:3.6,w:18.125,h:6},{id:"phone-113-5.8",kind:"phone",x:256.016,y:5.8,w:9.063,h:4}],exit:{x:283.203,y:5.8},boss:{id:"boss-caterpillar",kind:"caterpillar",x:278.672,y:7.4,w:1.5,h:4.8,hp:5,arena:{x:253.75,y:5.8,w:36.25}},checkpoints:[{x:156.328,y:3.6}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["can pyramids","desks and upright telephones","drawer stacks","hanging cabinet passages","caterpillar arena"],landmarks:["pyramids of office cans","giant blue telephones","orange filing drawers"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}},{id:"J",name:"\u80A5\u732B\u7684\u5DE5\u5382",theme:"fatcat",width:128,height:58,spawn:{x:1.803,y:1},platforms:[{id:"lower-west",x:0,y:1,w:14.423,h:.65,kind:"solid",oneWay:!1},{id:"lower-belt-a",x:15.324,y:1,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:-1.8},{id:"lower-belt-b",x:38.761,y:1,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:1.5},{id:"lower-belt-c",x:62.197,y:1,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:-1.8},{id:"lower-east",x:84.732,y:1,w:10.817,h:.65,kind:"solid",oneWay:!1},{id:"right-shaft-a",x:91.944,y:3.4,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"right-shaft-b",x:95.549,y:5.8,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"right-shaft-c",x:91.944,y:8.2,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"right-shaft-d",x:95.549,y:10.6,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"right-shaft-e",x:102,y:13,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"middle-east",x:82.028,y:15.4,w:18.93,h:.65,kind:"solid",oneWay:!1},{id:"middle-machine",x:67.606,y:15.4,w:13.521,h:.65,kind:"solid",oneWay:!1},{id:"middle-duct",x:54.085,y:15.4,w:11.718,h:.65,kind:"solid",oneWay:!1},{id:"middle-belt",x:30.648,y:15.4,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:1.8},{id:"middle-boxes",x:14.423,y:15.4,w:14.423,h:.65,kind:"solid",oneWay:!1},{id:"middle-west",x:0,y:15.4,w:12.62,h:.65,kind:"solid",oneWay:!1},{id:"left-shaft-a",x:0,y:17.8,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"left-shaft-b",x:3.606,y:20.2,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"left-shaft-c",x:0,y:22.6,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"left-shaft-d",x:3.606,y:25,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"left-shaft-e",x:0,y:27.4,w:5.408,h:.65,kind:"shelf",oneWay:!0},{id:"upper-west",x:3.606,y:29.8,w:12.62,h:.65,kind:"solid",oneWay:!1},{id:"upper-belt",x:18.028,y:29.8,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:-1.7},{id:"upper-press",x:41.465,y:29.8,w:21.634,h:.65,kind:"conveyor",oneWay:!0,speed:1.6},{id:"upper-boxes",x:64.901,y:29.8,w:17.127,h:.65,kind:"solid",oneWay:!1},{id:"upper-gifts",x:83.831,y:32.2,w:11.718,h:.65,kind:"solid",oneWay:!1},{id:"cat-door",x:97.352,y:34.6,w:9.014,h:.65,kind:"solid",oneWay:!1},{id:"fat-cat-desk",x:107.268,y:34.6,w:20.732,h:.65,kind:"solid",oneWay:!1}],objects:[{id:"j1",kind:"crate",x:3.606,y:1},{id:"j2",kind:"metal",x:17.127,y:1},{id:"j3",kind:"bigcrate",x:31.549,y:1,contents:"zipper"},{id:"j4",kind:"crate",x:55.887,y:1},{id:"j5",kind:"crate",x:87.437,y:1},{id:"j6",kind:"apple",x:74.817,y:15.4},{id:"j7",kind:"crate",x:44.169,y:15.4},{id:"j8",kind:"crate",x:4.507,y:15.4},{id:"j9",kind:"bigcrate",x:24.338,y:29.8,contents:"acorn"},{id:"j10",kind:"metal",x:49.577,y:29.8},{id:"j11",kind:"crate",x:87.437,y:32.2},{id:"ball-J",kind:"ball",x:110.873,y:34.6}],enemies:[{id:"rh1",kind:"rhino",x:19.831,y:1,min:16.225,max:36.056},{id:"rh2",kind:"rhino",x:65.803,y:1,min:63.099,max:82.93},{id:"k1",kind:"kangaroo",x:86.535,y:15.4,min:82.93,max:98.254},{id:"k2",kind:"kangaroo",x:43.268,y:15.4,min:32.451,max:49.577},{id:"l1",kind:"lizard",x:18.93,y:15.4,min:15.324,max:27.944},{id:"l2",kind:"lizard",x:69.408,y:29.8,min:65.803,max:81.127},{id:"k3",kind:"kangaroo",x:48.676,y:29.8,min:42.366,max:62.197}],hazards:[{id:"hazard-0",kind:"press",x:22.22,y:1,w:1.172,h:2.5,period:3.3,activeFor:.7},{id:"hazard-1",kind:"press",x:45.656,y:1,w:1.172,h:2.5,period:3.8,activeFor:.7},{id:"hazard-2",kind:"press",x:71.797,y:1,w:1.172,h:2.5,period:4.1,activeFor:.8},{id:"hazard-3",kind:"electric",x:35.606,y:15.4,w:.901,h:.8,period:3.4,activeFor:.8},{id:"hazard-4",kind:"press",x:46.513,y:29.8,w:1.082,h:2.5,period:3.9,activeFor:.8},{id:"hazard-5",kind:"press",x:58.231,y:29.8,w:1.082,h:2.5,period:3.4,activeFor:.7}],decor:[{id:"catBox-6-1",kind:"catBox",x:5.408,y:1,w:7.211,h:7},{id:"press-25-4",kind:"press",x:22.535,y:4,w:2.704,h:8},{id:"press-51-4",kind:"press",x:45.972,y:4,w:2.704,h:8},{id:"press-80-4",kind:"press",x:72.113,y:4,w:2.704,h:8},{id:"pipe-107-1",kind:"pipe",x:96.451,y:1,w:3.606,h:16},{id:"machine-82-15.4",kind:"machine",x:73.915,y:15.4,w:10.817,h:6},{id:"duct-64-15.4",kind:"duct",x:57.69,y:15.4,w:4.507,h:10},{id:"catBox-22-15.4",kind:"catBox",x:19.831,y:15.4,w:8.113,h:6},{id:"conveyor-44-29.8",kind:"conveyor",x:39.662,y:29.8,w:44.169,h:3},{id:"catBox-80-29.8",kind:"catBox",x:72.113,y:29.8,w:16.225,h:7},{id:"desk-129-31",kind:"desk",x:116.282,y:31,w:20.732,h:4},{id:"curtain-129-34.6",kind:"curtain",x:116.282,y:34.6,w:20.732,h:12}],exit:{x:125.296,y:34.6},boss:{id:"boss-fatCat",kind:"fatCat",x:119.887,y:35.8,w:6,h:6.5,hp:5,arena:{x:107.268,y:34.6,w:20.732}},checkpoints:[{x:85.634,y:1},{x:86.535,y:15.4},{x:5.408,y:29.8}],pickups:[],reference:{source:"https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers",sections:["lower conveyor floor east","right shaft up","middle machines and boxes west","left climb","upper presses and belts east","Fat Cat desk"],landmarks:["Fat Cat branded orange boxes","multi-tier reversal through machinery","giant purple-suited Fat Cat behind desk"],scale:"1 world unit = 16 source pixels; original approximate area span, individually reconstructed platforms"}}],ku={0:["A","B"],A:["C"],B:["D"],C:["D"],D:["E","F"],E:["F"],F:["G"],G:["H"],H:["I"],I:["J"],J:[]};function Br(i){let e=Ts.find(t=>t.id===String(i));if(!e)throw new RangeError(`Unknown area: ${i}`);return structuredClone(e)}function rl(i){return[...ku[String(i)]??[]]}function rh(){return{current:"0",completed:[],unlocked:["0"],ending:!1}}function vi(i){let e=new Set(["0",...i?.completed??[]]);for(let t of i?.completed??[])for(let n of rl(t))e.add(n);return Ts.map(t=>t.id).filter(t=>e.has(t))}function zr(i,e){return e=String(e),!i||!vi(i).includes(e)?!1:(i.completed.includes(e)||i.completed.push(e),i.unlocked=vi(i),i.current=rl(e).find(t=>!i.completed.includes(t))??e,i.ending=i.completed.includes("J"),!0)}var Fu=28,al=1/120,wn=i=>structuredClone(i),Gr=(i,e,t)=>Math.max(e,Math.min(t,i)),ah=i=>({left:i.x-i.w/2,right:i.x+i.w/2,bottom:i.y,top:i.y+i.h});function Bn(i,e){let t=ah(i),n=ah(e);return t.left<n.right&&t.right>n.left&&t.bottom<n.top&&t.top>n.bottom}function Et(i,e,t={}){i.events.push({id:`event-${i.nextEventId++}`,type:e,time:i.time,...t}),i.events.length>100&&i.events.splice(0,i.events.length-100)}function Ou(i){return{w:i.kind==="bigcrate"?1.6:.8,h:i.kind==="bigcrate"?1.6:.8,vx:0,vy:0,active:!0,heldBy:null,thrown:!1,grounded:!1,hitIds:[],recover:{x:i.x,y:i.y},...wn(i)}}function ch(i,e,t,n=0){return{id:i,character:e,x:t.x+n,y:t.y,vx:0,vy:0,w:.8,h:1.3,facing:1,hearts:3,lives:3,grounded:!0,groundId:null,carrying:null,heldBy:null,hidden:!1,invulnerable:0,stun:0,zipper:0,dropTimer:0,throwTimer:0,animation:"idle"}}function hh(i,e){i.level=wn(e),i.platforms=(e.platforms??[]).map(t=>({...wn(t),homeX:t.x,homeY:t.y,dx:0,dy:0})),i.objects=(e.objects??[]).map(Ou),i.enemies=(e.enemies??[]).map(t=>({w:1,h:1,vx:0,vy:0,alive:!0,facing:-1,speed:1.7,timer:0,homeY:t.y,min:t.x-3,max:t.x+3,...wn(t)})),i.hazards=wn(e.hazards??[]),i.pickups=(e.pickups??[]).map(t=>({w:.55,h:.6,collected:!1,...wn(t)})),i.boss=e.boss?{w:2,h:2.4,...wn(e.boss),homeX:e.boss.x,homeY:e.boss.y,active:!1,hp:5,defeated:!1,invulnerable:0,timer:0,attackTimer:0}:null,i.projectiles=[],i.effects=[]}function ll(i,{players:e=1,character:t="chip",campaign:n=null}={}){let s={areaLevel:wn(i),level:null,players:[],objects:[],enemies:[],hazards:[],boss:null,projectiles:[],effects:[],events:[],time:0,paused:!1,status:"playing",score:0,flowers:0,stars:0,completed:[...n?.completed??[]],checkpoint:wn(i.spawn),campaign:n,bonus:null,ending:!1,nextEntityId:1,nextEventId:1,previousInputs:[],_accumulator:0,_pendingEdges:[]};return hh(s,i),s.players=Array.from({length:Gr(e,1,2)},(r,a)=>ch(`p${a+1}`,a===0?t:t==="chip"?"dale":"chip",i.spawn,a*.9)),s}function cl(i,e){i.paused=!!e,i.previousInputs=[],i._accumulator=0,i._pendingEdges=[]}function hl(i,e,t=!1,n=!1){let s=e.carrying;if(!s)return;let r=(s.type==="player"?i.players:i.objects).find(a=>a.id===s.id);e.carrying=null,r&&(r.heldBy=null,r.x=e.x+(n?0:e.facing*(e.w/2+r.w/2+.15)),r.y=e.y+.9,r.vx=t?n?0:e.facing*(r.kind==="apple"?7:11):0,r.vy=t?n?16:3:0,r.grounded=!1,s.type==="object"?(r.thrown=t,r.hitIds=[],r.owner=e.id):(r.throwTimer=t?.55:0,r.stun=t?.18:0),t&&Et(i,"throw",{player:e.id,kind:r.kind??"player",up:n}))}function Bu(i,e,t){if(e.heldBy||e.stun>0||e.hidden)return;if(e.carrying){hl(i,e,!0,t.up);return}let n=o=>Math.abs(o.x-e.x)<1.5&&Math.abs(o.y-e.y)<1.6,r=i.objects.filter(o=>o.active&&!o.heldBy&&o.kind!=="bigcrate"&&n(o)).sort((o,l)=>Math.abs(o.x-e.x)-Math.abs(l.x-e.x))[0],a="object";r||(a="player",r=i.players.find(o=>o.id!==e.id&&o.lives>0&&!o.heldBy&&!o.carrying&&n(o))),r&&(r.heldBy=e.id,r.thrown=!1,r.vx=0,r.vy=0,e.carrying={type:a,id:r.id},Et(i,"pickup",{player:e.id,kind:r.kind??"player"}))}function zu(i,e,t=!0){let n=i.platforms.map(s=>({...s,top:s.y,left:s.x,right:s.x+s.w}));if(t)for(let s of i.objects)s!==e&&s.active&&!s.heldBy&&!s.thrown&&s.grounded&&s.kind!=="ball"&&n.push({id:s.id,left:s.x-s.w/2,right:s.x+s.w/2,top:s.y+s.h,h:s.h,oneWay:!1,object:!0});return n}function dl(i,e,t,{ignoreOneWay:n=!1,objects:s=!0,sideWalls:r=!0}={}){let a=e.y,o=e.x,l=e.grounded,c=zu(i,e,s);e.vy-=Fu*t,e.x+=e.vx*t,e.y+=e.vy*t,e.grounded=!1,e.groundId=null;let h=null;for(let d of c){if(n&&d.oneWay)continue;let u=e.x-e.w/2,m=e.x+e.w/2;m>d.left+.025&&u<d.right-.025&&e.vy<=0&&a>=d.top-.06&&e.y<=d.top+.001&&(!h||d.top>h.top)&&(h=d),!d.oneWay&&m>d.left+.025&&u<d.right-.025&&e.vy>0&&a+e.h<=d.top-d.h+.03&&e.y+e.h>=d.top-d.h&&(e.y=d.top-d.h-e.h,e.vy=0),r&&!d.oneWay&&!d.object&&e.y<d.top-.12&&e.y+e.h>d.top-d.h+.1&&(o+e.w/2<=d.left+.025&&m>d.left?(e.x=d.left-e.w/2,e.vx=0):o-e.w/2>=d.right-.025&&u<d.right&&(e.x=d.right+e.w/2,e.vx=0))}return h&&(e.y=h.top,e.vy=0,e.grounded=!0,e.groundId=h.id,h.kind==="conveyor"&&(e.x+=(h.speed??1.5)*t)),!l&&e.grounded}function As(i,e,t,n=!1){e.lives<=0||e.heldBy||!n&&(e.invulnerable>0||e.zipper>0)||(n?e.hearts=0:e.hearts--,hl(i,e),e.invulnerable=1.5,e.stun=.25,e.vx=(Math.sign(e.x-t.x)||-e.facing)*4,e.vy=6,e.hidden=!1,Et(i,"damage",{player:e.id,hearts:e.hearts}),e.hearts<=0&&(e.lives--,Et(i,"lifeLost",{player:e.id,lives:e.lives}),e.lives>0?Object.assign(e,{x:i.checkpoint.x,y:i.checkpoint.y,hearts:3,vx:0,vy:0,grounded:!0,stun:0,invulnerable:2,throwTimer:0}):(e.hearts=0,e.vx=0,e.vy=0),i.players.every(s=>s.lives<=0)&&(i.status="gameover")))}function oh(i,e=!1){if(i.stars++,e&&Et(i,"star",{converted:!0}),i.stars%10===0){for(let t of i.players){let n=t.lives<=0;t.lives++,n&&Object.assign(t,ch(t.id,t.character,i.checkpoint),{lives:t.lives,invulnerable:2})}Et(i,"extraLife")}}function Vu(i,e,t){t.collected=!0;let n=t.kind;if(n==="flower")i.flowers++,i.score+=100,i.flowers%50===0&&oh(i,!0);else if(n==="star")i.score+=500,oh(i);else if(n==="acorn")e.hearts=Math.min(3,e.hearts+1);else if(n==="zipper")for(let s of i.players)s.zipper=10;i.bonus&&i.bonus.collected++,Et(i,"collect",{kind:n,player:e.id})}function Vr(i,e){if(!e.contents||e.opened)return;e.opened=!0;let t=Array.isArray(e.contents)?e.contents:[e.contents];for(let[n,s]of t.entries())i.pickups.push({id:`${e.id}-contents-${n}`,kind:s,x:e.x+n%3*.65,y:e.y,w:.55,h:.6,collected:!1})}function dh(i,e){if(!e.hidden)return!1;let t=i.objects.find(n=>n.id===e.carrying?.id);return t?.kind==="crate"&&(e.carrying=null,t.heldBy=null,t.active=!1,t.x=e.x,t.y=e.y,Vr(i,t),e.hidden=!1,e.invulnerable=Math.max(e.invulnerable,.3),Et(i,"break",{kind:"crate"})),!0}function ol(i,e,t){if(!e.hitIds.includes(t.id)){if(t===i.boss){if(e.kind!=="ball"||t.invulnerable>0||t.breakTimer>0||!t.active||t.defeated)return;if(t.hp--,t.invulnerable=.65,i.score+=500,Et(i,"bossHit",{kind:t.kind,hp:t.hp}),t.kind==="caterpillar"){t.breakTimer=.9,t.phase="separated",t.contactRegions=[],t.segments=[];for(let n=0;n<5;n++)i.projectiles.push({id:`segment-${i.nextEntityId++}`,kind:"segment",owner:t.id,x:t.x,y:t.y+n*t.h/5,w:.7,h:.7,vx:(n-2)*2.1,vy:4-n*.3,gravity:12,ttl:2})}e.vx=(Math.sign(e.x-t.x)||-1)*4,e.vy=5,e.thrown=!1,t.hp<=0&&(t.defeated=!0,i.projectiles=i.projectiles.filter(n=>n.owner!==t.id),i.score+=2500,Et(i,"bossDefeated",{kind:t.kind}))}else t.kind==="bigcrate"?(t.active=!1,Vr(i,t),Et(i,"break",{kind:"bigcrate"})):(t.alive=!1,i.score+=200,Et(i,"hit",{kind:t.kind}));e.kind==="crate"?(e.active=!1,Vr(i,e)):e.kind!=="apple"?(e.vx*=.35,e.vy=4):(e.active=!1,Vr(i,e)),e.hitIds.push(t.id)}}function lh(i,e){Object.assign(e,{x:e.recover.x,y:e.recover.y,vx:0,vy:0,thrown:!1,grounded:!1,groundId:null,hitIds:[]}),Et(i,"recover",{kind:e.kind})}function Gu(i,e){for(let t of[...i.objects].sort((n,s)=>n.y-s.y)){if(!t.active||t.heldBy)continue;let n=t.vx,s=dl(i,t,e,{sideWalls:!t.thrown});if(t.kind==="ball"&&t.vy<-1)for(let r of i.players)!r.heldBy&&r.lives>0&&Bn(t,r)&&(r.stun=.5,t.vy=4,t.vx=(Math.sign(t.x-r.x)||1)*3,Et(i,"stun",{player:r.id,kind:"ball"}));if(t.grounded&&(t.vx*=Math.max(0,1-e*7),Math.abs(t.vx)<.2&&(t.vx=0,t.thrown=!1)),s&&t.thrown&&t.kind==="ball"&&(t.vy=3,t.grounded=!1,t.vx=n*.5),t.y<-4||t.x<-2||t.x>i.level.width+2){t.kind==="ball"||t.kind==="metal"?lh(i,t):t.active=!1;continue}if(t.kind==="ball"&&i.boss?.active&&!i.boss.defeated&&i.boss.arena){let r=i.boss.arena;(t.x<r.x-.8||t.x>r.x+r.w+.8||t.y<r.y-2)&&lh(i,t)}if(t.thrown){for(let r of i.enemies)r.alive&&Bn(t,r)&&ol(i,t,r);for(let r of i.objects)r!==t&&r.active&&r.kind==="bigcrate"&&Bn(t,r)&&ol(i,t,r);i.boss&&!i.boss.defeated&&Bn(t,i.boss.weakpoint??i.boss)&&ol(i,t,i.boss)}}}function Hu(i,e){for(let t of i.enemies){if(!t.alive)continue;let n=i.players.find(s=>s.lives>0&&Math.abs(s.x-t.x)<24&&Math.abs(s.y-t.y)<12);if(n){t.timer+=e,["bird","bee","pelican"].includes(t.kind)?(t.x+=t.facing*(t.speed??2)*e,t.y=t.homeY+Math.sin(t.timer*(t.kind==="bee"?4:2))*1.1,t.kind==="pelican"&&t.timer>2.4&&(t.timer=0,i.projectiles.push({id:`enemy-shot-${i.nextEntityId++}`,kind:"drop",owner:t.id,x:t.x,y:t.y,vx:0,vy:-2,w:.4,h:.5,ttl:4,gravity:10}))):(t.kind==="mimic"?(t.animation=Math.abs(n.x-t.x)<4?"lunge":"disguise",t.vx=t.animation==="lunge"?Math.sign(n.x-t.x)*4:0):["rhino","dog"].includes(t.kind)&&Math.abs(n.x-t.x)<4?(t.vx=t.speed===0?0:Math.sign(n.x-t.x)*(t.kind==="rhino"?4.4:2.8),t.animation="charge"):t.vx=t.facing*(t.speed??1.7),t.kind==="kangaroo"&&t.grounded&&t.timer>.9&&(t.vy=9,t.timer=0),t.kind==="toy"&&t.timer>2.8&&(t.timer=0,i.projectiles.push({id:`enemy-shot-${i.nextEntityId++}`,kind:"gear",owner:t.id,x:t.x,y:t.y+.5,vx:t.facing*4,vy:3,w:.4,h:.4,ttl:4,gravity:10,bounce:!0})),dl(i,t,e,{objects:!1}),t.y<-4&&(t.alive=!1)),t.x<=t.min&&(t.x=t.min,t.facing=1),t.x>=t.max&&(t.x=t.max,t.facing=-1);for(let s of i.players)s.lives>0&&!s.heldBy&&Bn(s,t)&&(s.hidden||s.zipper>0||s.throwTimer>0?(t.alive=!1,i.score+=200,Et(i,"hit",{kind:t.kind}),dh(i,s)):As(i,s,t))}}}function Wu(i,e){for(let t of i.projectiles){if(t.ttl-=e,t.vy-=(t.gravity??0)*e,t.x+=t.vx*e,t.y+=t.vy*e,t.bounce)for(let n of i.platforms)t.vy<0&&t.y<n.y&&t.y>n.y-.4&&t.x>n.x&&t.x<n.x+n.w&&(t.y=n.y,t.vy=5);for(let n of i.players)n.lives>0&&Bn(n,t)&&(dh(i,n)||As(i,n,t),t.ttl=0)}i.projectiles=i.projectiles.filter(t=>t.ttl>0&&t.y>-5&&t.x>-5&&t.x<i.level.width+5)}function Xu(i){return{id:`bonus-${i}`,name:"\u901A\u5173\u5956\u52B1\u623F",theme:"bonus",width:24,height:12,spawn:{x:2,y:1},platforms:[{id:"bonus-floor",x:0,y:1,w:24,h:1},{id:"bonus-low",x:5,y:3.2,w:6,h:.5,kind:"shelf",oneWay:!0},{id:"bonus-high",x:13,y:5.4,w:7,h:.5,kind:"shelf",oneWay:!0}],objects:[{id:"bonus-box",kind:"bigcrate",x:10,y:1,contents:["star","acorn"]},{id:"bonus-crate",kind:"crate",x:3,y:1}],pickups:[...Array.from({length:10},(e,t)=>({id:`bonus-flower-${t}`,kind:"flower",x:4+t*1.6,y:1.2})),{id:"bonus-star",kind:"star",x:17,y:5.5}],enemies:[],hazards:[],boss:null,checkpoints:[],decor:[{id:"bonus-back",kind:"curtain",x:12,y:1,w:24,h:10}],exit:{x:23,y:1},reference:{sections:["timed collection room"],landmarks:["three reward shelves"]}}}function uh(i){let e=i.areaLevel.id;i.status="cleared",i.completed.includes(e)||i.completed.push(e),i.campaign&&(zr(i.campaign,e),i.completed=[...i.campaign.completed]),i.ending=e==="J",i.bonus=null,Et(i,"clear",{area:e,ending:i.ending})}function ul(i){i.status==="bonus"&&uh(i)}function qu(i){if(i.areaLevel.id==="J"){uh(i);return}for(let e of i.players)hl(i,e);hh(i,Xu(i.areaLevel.id)),i.status="bonus",i.bonus={areaId:i.areaLevel.id,remaining:20,collected:0};for(let[e,t]of i.players.entries())Object.assign(t,{x:2+e,y:1,vx:0,vy:0,heldBy:null,carrying:null,hidden:!1,grounded:!0,groundId:null,invulnerable:1});Et(i,"bonus",{area:i.areaLevel.id})}function Yu(i,e,t,n){i.time+=t;for(let s of i.platforms){let r=s.x,a=s.y;if(s.kind==="moving"){let o=Math.sin(i.time*(s.speed??1))*(s.range??2);s.axis==="y"?s.y=s.homeY+o:s.x=s.homeX+o}s.dx=s.x-r,s.dy=s.y-a;for(let o of i.players)o.grounded&&o.groundId===s.id&&(o.x+=s.dx,o.y+=s.dy)}for(let[s,r]of i.players.entries()){if(r.lives<=0)continue;let a=e[s]??{};for(let h of["invulnerable","stun","zipper","dropTimer","throwTimer"])r[h]=Math.max(0,r[h]-t);if(r.heldBy)continue;let o=r.carrying?.type==="object"?i.objects.find(h=>h.id===r.carrying.id):null;r.hidden=!!(a.down&&o&&["crate","metal"].includes(o.kind)&&r.grounded),n&&a.action&&Bu(i,r,a),n&&a.jump&&r.grounded&&r.stun<=0&&(a.down?i.platforms.find(d=>d.id===r.groundId)?.oneWay&&(r.dropTimer=.3,r.y-=.12,r.grounded=!1):(r.vy=o?.kind==="apple"?11:14,r.grounded=!1,Et(i,"jump",{player:r.id})));let l=Gr(Number(a.move)||0,-1,1);r.stun<=0&&r.throwTimer<=0&&(r.vx=r.hidden?0:l*(o?.kind==="apple"?4.1:7.2)),l&&!r.hidden&&(r.facing=Math.sign(l));let c=dl(i,r,t,{ignoreOneWay:r.dropTimer>0});r.x=Gr(r.x,r.w/2,i.level.width-r.w/2),c&&Et(i,"land",{player:r.id}),r.y<-4&&As(i,r,{x:r.x},!0),r.animation=r.hidden?"hide":r.heldBy?"held":r.stun>0?"hurt":r.grounded?r.carrying?"carry":Math.abs(r.vx)>.1?"run":"idle":"jump"}sh(i,t),Gu(i,t),Hu(i,t),Wu(i,t);for(let s of i.players)if(!(s.lives<=0||s.heldBy)){i.boss?.active&&!i.boss.defeated&&(i.boss.contactRegions??[i.boss]).some(r=>Bn(s,r))&&As(i,s,i.boss);for(let r of i.hazards)r.active=r.period?(i.time+(r.offset??0))%r.period<(r.activeFor??r.period/2):!0,r.active&&Bn(s,{...r,w:r.w,h:r.h??1})&&As(i,s,r);for(let r of i.pickups)!r.collected&&Bn(s,r)&&Vu(i,s,r);for(let r of i.level.checkpoints??[])Math.abs(s.x-r.x)<2&&Math.abs(s.y-r.y)<1.5&&(i.checkpoint=wn(r))}for(let s of i.players)if(s.carrying){let r=(s.carrying.type==="player"?i.players:i.objects).find(a=>a.id===s.carrying.id);r&&(r.x=s.x,r.y=s.hidden?s.y:s.y+s.h+.15,r.vx=0,r.vy=0,r.grounded=!1,s.carrying.type==="player"&&(r.animation="held"))}i.status==="playing"&&(!i.boss||i.boss.defeated)&&i.players.some(s=>s.lives>0&&!s.heldBy&&Math.abs(s.x-i.level.exit.x)<1&&Math.abs(s.y-i.level.exit.y)<2)?qu(i):i.status==="bonus"&&(i.bonus.remaining-=t,(i.bonus.remaining<=0||i.players.some(s=>s.x>i.level.exit.x-.8))&&ul(i)),i.events=i.events.slice(-100),i.effects=i.effects.filter(s=>i.time-s.time<1.5)}function fh(i,e=[],t=1/60){if(i.paused||!["playing","bonus"].includes(i.status))return i;for(let[s,r]of e.entries())i._pendingEdges[s]={action:!!(i._pendingEdges[s]?.action||r.action&&!i.previousInputs[s]?.action),jump:!!(i._pendingEdges[s]?.jump||r.jump&&!i.previousInputs[s]?.jump)};i.previousInputs=e.map(s=>({...s})),i._accumulator+=Gr(Number(t)||0,0,1/30);let n=!0;for(;i._accumulator+1e-9>=al&&["playing","bonus"].includes(i.status);){let s=n?e.map((r,a)=>({...r,...i._pendingEdges[a]})):e;Yu(i,s,al,n),i._accumulator=Math.max(0,i._accumulator-al),n&&(i._pendingEdges=[]),n=!1}return i}var Hh=0,$l=1,Wh=2;var gr=1,$a=2,ms=3,di=0,Vt=1,Ln=2,Nn=0,gs=1,Kl=2,jl=3,Ql=4,Xh=5;var Ii=100,qh=101,Yh=102,Zh=103,Jh=104,$h=200,Kh=201,jh=202,Qh=203,ec=204,tc=205,ed=206,td=207,nd=208,id=209,sd=210,rd=211,ad=212,od=213,ld=214,fa=0,pa=1,ma=2,is=3,ga=4,xa=5,ya=6,_a=7,nc=0,cd=1,hd=2,xn=0,ic=1,sc=2,rc=3,xr=4,ac=5,oc=6,lc=7;var cc=300,ui=301,Pi=302,Ka=303,ja=304,yr=306,ss=1e3,Tn=1001,va=1002,Lt=1003,dd=1004;var _r=1005;var Tt=1006,Qa=1007;var Dn=1008;var Jt=1009,hc=1010,dc=1011,xs=1012,eo=1013,yn=1014,an=1015,_n=1016,to=1017,no=1018,ys=1020,uc=35902,fc=35899,pc=1021,mc=1022,on=1023,An=1026,fi=1027,io=1028,so=1029,pi=1030,ro=1031;var ao=1033,vr=33776,br=33777,Mr=33778,Sr=33779,oo=35840,lo=35841,co=35842,ho=35843,uo=36196,fo=37492,po=37496,mo=37488,go=37489,wr=37490,xo=37491,yo=37808,_o=37809,vo=37810,bo=37811,Mo=37812,So=37813,wo=37814,Eo=37815,To=37816,Ao=37817,Co=37818,Ro=37819,Io=37820,Po=37821,Lo=36492,No=36494,Do=36495,Uo=36283,ko=36284,Er=36285,Fo=36286;var Os=2300,ba=2301,da=2302,Bl=2303,zl=2400,Vl=2401,Gl=2402;var ud=3200;var Oo=0,fd=1,Yn="",Nt="srgb",Bs="srgb-linear",zs="linear",lt="srgb";var ua=7680;var pd=519,md=512,gd=513,xd=514,Bo=515,yd=516,_d=517,zo=518,vd=519,bd=35044;var gc="300 es",gn=2e3,rs=2001;function Zu(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Ju(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Vs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Md(){let i=Vs("canvas");return i.style.display="block",i}var ph={},as=null;function xc(...i){let e="THREE."+i.shift();as?as("log",e,...i):console.log(e,...i)}function Sd(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Fe(...i){i=Sd(i);let e="THREE."+i.shift();if(as)as("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Be(...i){i=Sd(i);let e="THREE."+i.shift();if(as)as("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Ti(...i){let e=i.join(" ");e in ph||(ph[e]=!0,Fe(...i))}function wd(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Ed={[fa]:pa,[ma]:ya,[ga]:_a,[is]:xa,[pa]:fa,[ya]:ma,[_a]:ga,[xa]:is},Cn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Ut=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var fl=Math.PI/180,Ma=180/Math.PI;function _s(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ut[i&255]+Ut[i>>8&255]+Ut[i>>16&255]+Ut[i>>24&255]+"-"+Ut[e&255]+Ut[e>>8&255]+"-"+Ut[e>>16&15|64]+Ut[e>>24&255]+"-"+Ut[t&63|128]+Ut[t>>8&255]+"-"+Ut[t>>16&255]+Ut[t>>24&255]+Ut[n&255]+Ut[n>>8&255]+Ut[n>>16&255]+Ut[n>>24&255]).toLowerCase()}function Qe(i,e,t){return Math.max(e,Math.min(t,i))}function $u(i,e){return(i%e+e)%e}function pl(i,e,t){return(1-t)*i+t*e}function Cs(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Ht(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var pe=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Qe(this.x,e.x,t.x),this.y=Qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Qe(this.x,e,t),this.y=Qe(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Rn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],d=n[s+3],u=r[a+0],m=r[a+1],f=r[a+2],y=r[a+3];if(d!==y||l!==u||c!==m||h!==f){let p=l*u+c*m+h*f+d*y;p<0&&(u=-u,m=-m,f=-f,y=-y,p=-p);let g=1-o;if(p<.9995){let M=Math.acos(p),S=Math.sin(M);g=Math.sin(g*M)/S,o=Math.sin(o*M)/S,l=l*g+u*o,c=c*g+m*o,h=h*g+f*o,d=d*g+y*o}else{l=l*g+u*o,c=c*g+m*o,h=h*g+f*o,d=d*g+y*o;let M=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=M,c*=M,h*=M,d*=M}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],d=r[a],u=r[a+1],m=r[a+2],f=r[a+3];return e[t]=o*f+h*d+l*m-c*u,e[t+1]=l*f+h*u+c*d-o*m,e[t+2]=c*f+h*m+o*u-l*d,e[t+3]=h*f-o*d-l*u-c*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),d=o(r/2),u=l(n/2),m=l(s/2),f=l(r/2);switch(a){case"XYZ":this._x=u*h*d+c*m*f,this._y=c*m*d-u*h*f,this._z=c*h*f+u*m*d,this._w=c*h*d-u*m*f;break;case"YXZ":this._x=u*h*d+c*m*f,this._y=c*m*d-u*h*f,this._z=c*h*f-u*m*d,this._w=c*h*d+u*m*f;break;case"ZXY":this._x=u*h*d-c*m*f,this._y=c*m*d+u*h*f,this._z=c*h*f+u*m*d,this._w=c*h*d-u*m*f;break;case"ZYX":this._x=u*h*d-c*m*f,this._y=c*m*d+u*h*f,this._z=c*h*f-u*m*d,this._w=c*h*d+u*m*f;break;case"YZX":this._x=u*h*d+c*m*f,this._y=c*m*d+u*h*f,this._z=c*h*f-u*m*d,this._w=c*h*d-u*m*f;break;case"XZY":this._x=u*h*d-c*m*f,this._y=c*m*d-u*h*f,this._z=c*h*f+u*m*d,this._w=c*h*d+u*m*f;break;default:Fe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],d=t[10],u=n+o+d;if(u>0){let m=.5/Math.sqrt(u+1);this._w=.25/m,this._x=(h-l)*m,this._y=(r-c)*m,this._z=(a-s)*m}else if(n>o&&n>d){let m=2*Math.sqrt(1+n-o-d);this._w=(h-l)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+c)/m}else if(o>d){let m=2*Math.sqrt(1+o-n-d);this._w=(r-c)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(l+h)/m}else{let m=2*Math.sqrt(1+d-n-o);this._w=(a-s)/m,this._x=(r+c)/m,this._y=(l+h)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Qe(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},F=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(mh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(mh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),d=2*(r*n-a*t);return this.x=t+l*c+a*d-o*h,this.y=n+l*h+o*c-r*d,this.z=s+l*d+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Qe(this.x,e.x,t.x),this.y=Qe(this.y,e.y,t.y),this.z=Qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Qe(this.x,e,t),this.y=Qe(this.y,e,t),this.z=Qe(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ml.copy(this).projectOnVector(e),this.sub(ml)}reflect(e){return this.sub(ml.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ml=new F,mh=new Rn,Ge=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],m=n[5],f=n[8],y=s[0],p=s[3],g=s[6],M=s[1],S=s[4],v=s[7],E=s[2],w=s[5],R=s[8];return r[0]=a*y+o*M+l*E,r[3]=a*p+o*S+l*w,r[6]=a*g+o*v+l*R,r[1]=c*y+h*M+d*E,r[4]=c*p+h*S+d*w,r[7]=c*g+h*v+d*R,r[2]=u*y+m*M+f*E,r[5]=u*p+m*S+f*w,r[8]=u*g+m*v+f*R,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=h*a-o*c,u=o*l-h*r,m=c*r-a*l,f=t*d+n*u+s*m;if(f===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/f;return e[0]=d*y,e[1]=(s*c-h*n)*y,e[2]=(o*n-s*a)*y,e[3]=u*y,e[4]=(h*t-s*l)*y,e[5]=(s*r-o*t)*y,e[6]=m*y,e[7]=(n*l-c*t)*y,e[8]=(a*t-n*r)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Ti("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(gl.makeScale(e,t)),this}rotate(e){return Ti("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(gl.makeRotation(-e)),this}translate(e,t){return Ti("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(gl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},gl=new Ge,gh=new Ge().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),xh=new Ge().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ku(){let i={enabled:!0,workingColorSpace:Bs,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===lt&&(s.r=Xn(s.r),s.g=Xn(s.g),s.b=Xn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===lt&&(s.r=ns(s.r),s.g=ns(s.g),s.b=ns(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Yn?zs:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ti("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ti("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Bs]:{primaries:e,whitePoint:n,transfer:zs,toXYZ:gh,fromXYZ:xh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Nt},outputColorSpaceConfig:{drawingBufferColorSpace:Nt}},[Nt]:{primaries:e,whitePoint:n,transfer:lt,toXYZ:gh,fromXYZ:xh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Nt}}}),i}var tt=Ku();function Xn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ns(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Gi,Sa=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Gi===void 0&&(Gi=Vs("canvas")),Gi.width=e.width,Gi.height=e.height;let s=Gi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Gi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Vs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Xn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Xn(t[n]/255)*255):t[n]=Xn(t[n]);return{data:t,width:e.width,height:e.height}}else return Fe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},ju=0,os=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:ju++}),this.uuid=_s(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(xl(s[a].image)):r.push(xl(s[a]))}else r=xl(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function xl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Sa.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Fe("Texture: Unable to serialize Texture."),{})}var Qu=0,yl=new F,qt=class i extends Cn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Tn,s=Tn,r=Tt,a=Dn,o=on,l=Jt,c=i.DEFAULT_ANISOTROPY,h=Yn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Qu++}),this.uuid=_s(),this.name="",this.source=new os(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new pe(0,0),this.repeat=new pe(1,1),this.center=new pe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ge,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(yl).x}get height(){return this.source.getSize(yl).y}get depth(){return this.source.getSize(yl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Fe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Fe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==cc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ss:e.x=e.x-Math.floor(e.x);break;case Tn:e.x=e.x<0?0:1;break;case va:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ss:e.y=e.y-Math.floor(e.y);break;case Tn:e.y=e.y<0?0:1;break;case va:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};qt.DEFAULT_IMAGE=null;qt.DEFAULT_MAPPING=cc;qt.DEFAULT_ANISOTROPY=1;var yt=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],d=l[8],u=l[1],m=l[5],f=l[9],y=l[2],p=l[6],g=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-y)<.01&&Math.abs(f-p)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+y)<.1&&Math.abs(f+p)<.1&&Math.abs(c+m+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let S=(c+1)/2,v=(m+1)/2,E=(g+1)/2,w=(h+u)/4,R=(d+y)/4,_=(f+p)/4;return S>v&&S>E?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=w/n,r=R/n):v>E?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=w/s,r=_/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=R/r,s=_/r),this.set(n,s,r,t),this}let M=Math.sqrt((p-f)*(p-f)+(d-y)*(d-y)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(p-f)/M,this.y=(d-y)/M,this.z=(u-h)/M,this.w=Math.acos((c+m+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Qe(this.x,e.x,t.x),this.y=Qe(this.y,e.y,t.y),this.z=Qe(this.z,e.z,t.z),this.w=Qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Qe(this.x,e,t),this.y=Qe(this.y,e,t),this.z=Qe(this.z,e,t),this.w=Qe(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},wa=class extends Cn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new yt(0,0,e,t),this.scissorTest=!1,this.viewport=new yt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new qt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Tt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new os(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Yt=class extends wa{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Gs=class extends qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Lt,this.minFilter=Lt,this.wrapR=Tn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ea=class extends qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Lt,this.minFilter=Lt,this.wrapR=Tn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var ut=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,a,o,l,c,h,d,u,m,f,y,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,d,u,m,f,y,p)}set(e,t,n,s,r,a,o,l,c,h,d,u,m,f,y,p){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=h,g[10]=d,g[14]=u,g[3]=m,g[7]=f,g[11]=y,g[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Hi.setFromMatrixColumn(e,0).length(),r=1/Hi.setFromMatrixColumn(e,1).length(),a=1/Hi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let u=a*h,m=a*d,f=o*h,y=o*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=m+f*c,t[5]=u-y*c,t[9]=-o*l,t[2]=y-u*c,t[6]=f+m*c,t[10]=a*l}else if(e.order==="YXZ"){let u=l*h,m=l*d,f=c*h,y=c*d;t[0]=u+y*o,t[4]=f*o-m,t[8]=a*c,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=m*o-f,t[6]=y+u*o,t[10]=a*l}else if(e.order==="ZXY"){let u=l*h,m=l*d,f=c*h,y=c*d;t[0]=u-y*o,t[4]=-a*d,t[8]=f+m*o,t[1]=m+f*o,t[5]=a*h,t[9]=y-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let u=a*h,m=a*d,f=o*h,y=o*d;t[0]=l*h,t[4]=f*c-m,t[8]=u*c+y,t[1]=l*d,t[5]=y*c+u,t[9]=m*c-f,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let u=a*l,m=a*c,f=o*l,y=o*c;t[0]=l*h,t[4]=y-u*d,t[8]=f*d+m,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=m*d+f,t[10]=u-y*d}else if(e.order==="XZY"){let u=a*l,m=a*c,f=o*l,y=o*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=u*d+y,t[5]=a*h,t[9]=m*d-f,t[2]=f*d-m,t[6]=o*h,t[10]=y*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ef,e,tf)}lookAt(e,t,n){let s=this.elements;return $t.subVectors(e,t),$t.lengthSq()===0&&($t.z=1),$t.normalize(),jn.crossVectors(n,$t),jn.lengthSq()===0&&(Math.abs(n.z)===1?$t.x+=1e-4:$t.z+=1e-4,$t.normalize(),jn.crossVectors(n,$t)),jn.normalize(),Hr.crossVectors($t,jn),s[0]=jn.x,s[4]=Hr.x,s[8]=$t.x,s[1]=jn.y,s[5]=Hr.y,s[9]=$t.y,s[2]=jn.z,s[6]=Hr.z,s[10]=$t.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],m=n[13],f=n[2],y=n[6],p=n[10],g=n[14],M=n[3],S=n[7],v=n[11],E=n[15],w=s[0],R=s[4],_=s[8],T=s[12],P=s[1],C=s[5],N=s[9],B=s[13],I=s[2],U=s[6],H=s[10],Y=s[14],X=s[3],z=s[7],q=s[11],j=s[15];return r[0]=a*w+o*P+l*I+c*X,r[4]=a*R+o*C+l*U+c*z,r[8]=a*_+o*N+l*H+c*q,r[12]=a*T+o*B+l*Y+c*j,r[1]=h*w+d*P+u*I+m*X,r[5]=h*R+d*C+u*U+m*z,r[9]=h*_+d*N+u*H+m*q,r[13]=h*T+d*B+u*Y+m*j,r[2]=f*w+y*P+p*I+g*X,r[6]=f*R+y*C+p*U+g*z,r[10]=f*_+y*N+p*H+g*q,r[14]=f*T+y*B+p*Y+g*j,r[3]=M*w+S*P+v*I+E*X,r[7]=M*R+S*C+v*U+E*z,r[11]=M*_+S*N+v*H+E*q,r[15]=M*T+S*B+v*Y+E*j,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],d=e[6],u=e[10],m=e[14],f=e[3],y=e[7],p=e[11],g=e[15],M=l*m-c*u,S=o*m-c*d,v=o*u-l*d,E=a*m-c*h,w=a*u-l*h,R=a*d-o*h;return t*(y*M-p*S+g*v)-n*(f*M-p*E+g*w)+s*(f*S-y*E+g*R)-r*(f*v-y*w+p*R)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=e[9],u=e[10],m=e[11],f=e[12],y=e[13],p=e[14],g=e[15],M=t*o-n*a,S=t*l-s*a,v=t*c-r*a,E=n*l-s*o,w=n*c-r*o,R=s*c-r*l,_=h*y-d*f,T=h*p-u*f,P=h*g-m*f,C=d*p-u*y,N=d*g-m*y,B=u*g-m*p,I=M*B-S*N+v*C+E*P-w*T+R*_;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let U=1/I;return e[0]=(o*B-l*N+c*C)*U,e[1]=(s*N-n*B-r*C)*U,e[2]=(y*R-p*w+g*E)*U,e[3]=(u*w-d*R-m*E)*U,e[4]=(l*P-a*B-c*T)*U,e[5]=(t*B-s*P+r*T)*U,e[6]=(p*v-f*R-g*S)*U,e[7]=(h*R-u*v+m*S)*U,e[8]=(a*N-o*P+c*_)*U,e[9]=(n*P-t*N-r*_)*U,e[10]=(f*w-y*v+g*M)*U,e[11]=(d*v-h*w-m*M)*U,e[12]=(o*T-a*C-l*_)*U,e[13]=(t*C-n*T+s*_)*U,e[14]=(y*S-f*E-p*M)*U,e[15]=(h*E-d*S+u*M)*U,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,d=o+o,u=r*c,m=r*h,f=r*d,y=a*h,p=a*d,g=o*d,M=l*c,S=l*h,v=l*d,E=n.x,w=n.y,R=n.z;return s[0]=(1-(y+g))*E,s[1]=(m+v)*E,s[2]=(f-S)*E,s[3]=0,s[4]=(m-v)*w,s[5]=(1-(u+g))*w,s[6]=(p+M)*w,s[7]=0,s[8]=(f+S)*R,s[9]=(p-M)*R,s[10]=(1-(u+y))*R,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Hi.set(s[0],s[1],s[2]).length(),o=Hi.set(s[4],s[5],s[6]).length(),l=Hi.set(s[8],s[9],s[10]).length();r<0&&(a=-a),un.copy(this);let c=1/a,h=1/o,d=1/l;return un.elements[0]*=c,un.elements[1]*=c,un.elements[2]*=c,un.elements[4]*=h,un.elements[5]*=h,un.elements[6]*=h,un.elements[8]*=d,un.elements[9]*=d,un.elements[10]*=d,t.setFromRotationMatrix(un),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=gn,l=!1){let c=this.elements,h=2*r/(t-e),d=2*r/(n-s),u=(t+e)/(t-e),m=(n+s)/(n-s),f,y;if(l)f=r/(a-r),y=a*r/(a-r);else if(o===gn)f=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(o===rs)f=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=m,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=gn,l=!1){let c=this.elements,h=2/(t-e),d=2/(n-s),u=-(t+e)/(t-e),m=-(n+s)/(n-s),f,y;if(l)f=1/(a-r),y=a/(a-r);else if(o===gn)f=-2/(a-r),y=-(a+r)/(a-r);else if(o===rs)f=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=m,c[2]=0,c[6]=0,c[10]=f,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Hi=new F,un=new ut,ef=new F(0,0,0),tf=new F(1,1,1),jn=new F,Hr=new F,$t=new F,yh=new ut,_h=new Rn,qn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(Qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Qe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,m),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Qe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Qe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-Qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,m),this._y=0);break;default:Fe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return yh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(yh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return _h.setFromEuler(this),this.setFromQuaternion(_h,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};qn.DEFAULT_ORDER="XYZ";var Hs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},nf=0,vh=new F,Wi=new Rn,zn=new ut,Wr=new F,Rs=new F,sf=new F,rf=new Rn,bh=new F(1,0,0),Mh=new F(0,1,0),Sh=new F(0,0,1),wh={type:"added"},af={type:"removed"},Xi={type:"childadded",child:null},_l={type:"childremoved",child:null},wt=class i extends Cn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:nf++}),this.uuid=_s(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new F,t=new qn,n=new Rn,s=new F(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ut},normalMatrix:{value:new Ge}}),this.matrix=new ut,this.matrixWorld=new ut,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Hs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Wi.setFromAxisAngle(e,t),this.quaternion.multiply(Wi),this}rotateOnWorldAxis(e,t){return Wi.setFromAxisAngle(e,t),this.quaternion.premultiply(Wi),this}rotateX(e){return this.rotateOnAxis(bh,e)}rotateY(e){return this.rotateOnAxis(Mh,e)}rotateZ(e){return this.rotateOnAxis(Sh,e)}translateOnAxis(e,t){return vh.copy(e).applyQuaternion(this.quaternion),this.position.add(vh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(bh,e)}translateY(e){return this.translateOnAxis(Mh,e)}translateZ(e){return this.translateOnAxis(Sh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(zn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Wr.copy(e):Wr.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Rs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?zn.lookAt(Rs,Wr,this.up):zn.lookAt(Wr,Rs,this.up),this.quaternion.setFromRotationMatrix(zn),s&&(zn.extractRotation(s.matrixWorld),Wi.setFromRotationMatrix(zn),this.quaternion.premultiply(Wi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Be("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(wh),Xi.child=e,this.dispatchEvent(Xi),Xi.child=null):Be("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(af),_l.child=e,this.dispatchEvent(_l),_l.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),zn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),zn.multiply(e.parent.matrixWorld)),e.applyMatrix4(zn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(wh),Xi.child=e,this.dispatchEvent(Xi),Xi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rs,e,sf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rs,rf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),d=a(e.shapes),u=a(e.skeletons),m=a(e.animations),f=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),m.length>0&&(n.animations=m),f.length>0&&(n.nodes=f)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};wt.DEFAULT_UP=new F(0,1,0);wt.DEFAULT_MATRIX_AUTO_UPDATE=!0;wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Xt=class extends wt{constructor(){super(),this.isGroup=!0,this.type="Group"}},of={type:"move"},ls=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new F,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new F),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new F,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new F,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let y of e.hand.values()){let p=t.getJointPose(y,n),g=this._getHandJoint(c,y);p!==null&&(g.matrix.fromArray(p.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=p.radius),g.visible=p!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),m=.02,f=.005;c.inputState.pinching&&u>m+f?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=m-f&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(of)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Xt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Td={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Qn={h:0,s:0,l:0},Xr={h:0,s:0,l:0};function vl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Je=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Nt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=tt.workingColorSpace){return this.r=e,this.g=t,this.b=n,tt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=tt.workingColorSpace){if(e=$u(e,1),t=Qe(t,0,1),n=Qe(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=vl(a,r,e+1/3),this.g=vl(a,r,e),this.b=vl(a,r,e-1/3)}return tt.colorSpaceToWorking(this,s),this}setStyle(e,t=Nt){function n(r){r!==void 0&&parseFloat(r)<1&&Fe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Fe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Fe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Nt){let n=Td[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Fe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Xn(e.r),this.g=Xn(e.g),this.b=Xn(e.b),this}copyLinearToSRGB(e){return this.r=ns(e.r),this.g=ns(e.g),this.b=ns(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Nt){return tt.workingToColorSpace(kt.copy(this),e),Math.round(Qe(kt.r*255,0,255))*65536+Math.round(Qe(kt.g*255,0,255))*256+Math.round(Qe(kt.b*255,0,255))}getHexString(e=Nt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=tt.workingColorSpace){tt.workingToColorSpace(kt.copy(this),t);let n=kt.r,s=kt.g,r=kt.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=tt.workingColorSpace){return tt.workingToColorSpace(kt.copy(this),t),e.r=kt.r,e.g=kt.g,e.b=kt.b,e}getStyle(e=Nt){tt.workingToColorSpace(kt.copy(this),e);let t=kt.r,n=kt.g,s=kt.b;return e!==Nt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Qn),this.setHSL(Qn.h+e,Qn.s+t,Qn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Qn),e.getHSL(Xr);let n=pl(Qn.h,Xr.h,t),s=pl(Qn.s,Xr.s,t),r=pl(Qn.l,Xr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},kt=new Je;Je.NAMES=Td;var Ws=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Je(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Xs=class extends wt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new qn,this.environmentIntensity=1,this.environmentRotation=new qn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},fn=new F,Vn=new F,bl=new F,Gn=new F,qi=new F,Yi=new F,Eh=new F,Ml=new F,Sl=new F,wl=new F,El=new yt,Tl=new yt,Al=new yt,ii=class i{constructor(e=new F,t=new F,n=new F){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),fn.subVectors(e,t),s.cross(fn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){fn.subVectors(s,t),Vn.subVectors(n,t),bl.subVectors(e,t);let a=fn.dot(fn),o=fn.dot(Vn),l=fn.dot(bl),c=Vn.dot(Vn),h=Vn.dot(bl),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let u=1/d,m=(c*l-o*h)*u,f=(a*h-o*l)*u;return r.set(1-m-f,f,m)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Gn)===null?!1:Gn.x>=0&&Gn.y>=0&&Gn.x+Gn.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Gn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Gn.x),l.addScaledVector(a,Gn.y),l.addScaledVector(o,Gn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return El.setScalar(0),Tl.setScalar(0),Al.setScalar(0),El.fromBufferAttribute(e,t),Tl.fromBufferAttribute(e,n),Al.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(El,r.x),a.addScaledVector(Tl,r.y),a.addScaledVector(Al,r.z),a}static isFrontFacing(e,t,n,s){return fn.subVectors(n,t),Vn.subVectors(e,t),fn.cross(Vn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return fn.subVectors(this.c,this.b),Vn.subVectors(this.a,this.b),fn.cross(Vn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;qi.subVectors(s,n),Yi.subVectors(r,n),Ml.subVectors(e,n);let l=qi.dot(Ml),c=Yi.dot(Ml);if(l<=0&&c<=0)return t.copy(n);Sl.subVectors(e,s);let h=qi.dot(Sl),d=Yi.dot(Sl);if(h>=0&&d<=h)return t.copy(s);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(qi,a);wl.subVectors(e,r);let m=qi.dot(wl),f=Yi.dot(wl);if(f>=0&&m<=f)return t.copy(r);let y=m*c-l*f;if(y<=0&&c>=0&&f<=0)return o=c/(c-f),t.copy(n).addScaledVector(Yi,o);let p=h*f-m*d;if(p<=0&&d-h>=0&&m-f>=0)return Eh.subVectors(r,s),o=(d-h)/(d-h+(m-f)),t.copy(s).addScaledVector(Eh,o);let g=1/(p+y+u);return a=y*g,o=u*g,t.copy(n).addScaledVector(qi,a).addScaledVector(Yi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},In=class{constructor(e=new F(1/0,1/0,1/0),t=new F(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(pn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(pn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=pn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,pn):pn.fromBufferAttribute(r,a),pn.applyMatrix4(e.matrixWorld),this.expandByPoint(pn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),qr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),qr.copy(n.boundingBox)),qr.applyMatrix4(e.matrixWorld),this.union(qr)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,pn),pn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Is),Yr.subVectors(this.max,Is),Zi.subVectors(e.a,Is),Ji.subVectors(e.b,Is),$i.subVectors(e.c,Is),ei.subVectors(Ji,Zi),ti.subVectors($i,Ji),bi.subVectors(Zi,$i);let t=[0,-ei.z,ei.y,0,-ti.z,ti.y,0,-bi.z,bi.y,ei.z,0,-ei.x,ti.z,0,-ti.x,bi.z,0,-bi.x,-ei.y,ei.x,0,-ti.y,ti.x,0,-bi.y,bi.x,0];return!Cl(t,Zi,Ji,$i,Yr)||(t=[1,0,0,0,1,0,0,0,1],!Cl(t,Zi,Ji,$i,Yr))?!1:(Zr.crossVectors(ei,ti),t=[Zr.x,Zr.y,Zr.z],Cl(t,Zi,Ji,$i,Yr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,pn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(pn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Hn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Hn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Hn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Hn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Hn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Hn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Hn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Hn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Hn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Hn=[new F,new F,new F,new F,new F,new F,new F,new F],pn=new F,qr=new In,Zi=new F,Ji=new F,$i=new F,ei=new F,ti=new F,bi=new F,Is=new F,Yr=new F,Zr=new F,Mi=new F;function Cl(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Mi.fromArray(i,r);let o=s.x*Math.abs(Mi.x)+s.y*Math.abs(Mi.y)+s.z*Math.abs(Mi.z),l=e.dot(Mi),c=t.dot(Mi),h=n.dot(Mi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var St=new F,Jr=new pe,lf=0,jt=class extends Cn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:lf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=bd,this.updateRanges=[],this.gpuType=an,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Jr.fromBufferAttribute(this,t),Jr.applyMatrix3(e),this.setXY(t,Jr.x,Jr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix3(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix4(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyNormalMatrix(e),this.setXYZ(t,St.x,St.y,St.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.transformDirection(e),this.setXYZ(t,St.x,St.y,St.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Cs(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ht(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Cs(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Cs(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Cs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Cs(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array),s=Ht(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array),s=Ht(s,this.array),r=Ht(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var qs=class extends jt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ys=class extends jt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var vt=class extends jt{constructor(e,t,n){super(new Float32Array(e),t,n)}},cf=new In,Ps=new F,Rl=new F,si=class{constructor(e=new F,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):cf.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ps.subVectors(e,this.center);let t=Ps.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Ps,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Rl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ps.copy(e.center).add(Rl)),this.expandByPoint(Ps.copy(e.center).sub(Rl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},hf=0,rn=new ut,Il=new wt,Ki=new F,Kt=new In,Ls=new In,Pt=new F,Zt=class i extends Cn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:hf++}),this.uuid=_s(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Zu(e)?Ys:qs)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ge().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return rn.makeRotationFromQuaternion(e),this.applyMatrix4(rn),this}rotateX(e){return rn.makeRotationX(e),this.applyMatrix4(rn),this}rotateY(e){return rn.makeRotationY(e),this.applyMatrix4(rn),this}rotateZ(e){return rn.makeRotationZ(e),this.applyMatrix4(rn),this}translate(e,t,n){return rn.makeTranslation(e,t,n),this.applyMatrix4(rn),this}scale(e,t,n){return rn.makeScale(e,t,n),this.applyMatrix4(rn),this}lookAt(e){return Il.lookAt(e),Il.updateMatrix(),this.applyMatrix4(Il.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ki).negate(),this.translate(Ki.x,Ki.y,Ki.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new vt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Fe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new In);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Be("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new F(-1/0,-1/0,-1/0),new F(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Kt.setFromBufferAttribute(r),this.morphTargetsRelative?(Pt.addVectors(this.boundingBox.min,Kt.min),this.boundingBox.expandByPoint(Pt),Pt.addVectors(this.boundingBox.max,Kt.max),this.boundingBox.expandByPoint(Pt)):(this.boundingBox.expandByPoint(Kt.min),this.boundingBox.expandByPoint(Kt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Be('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new si);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Be("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new F,1/0);return}if(e){let n=this.boundingSphere.center;if(Kt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Ls.setFromBufferAttribute(o),this.morphTargetsRelative?(Pt.addVectors(Kt.min,Ls.min),Kt.expandByPoint(Pt),Pt.addVectors(Kt.max,Ls.max),Kt.expandByPoint(Pt)):(Kt.expandByPoint(Ls.min),Kt.expandByPoint(Ls.max))}Kt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Pt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Pt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Pt.fromBufferAttribute(o,c),l&&(Ki.fromBufferAttribute(e,c),Pt.add(Ki)),s=Math.max(s,n.distanceToSquared(Pt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Be('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Be("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new jt(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let _=0;_<n.count;_++)o[_]=new F,l[_]=new F;let c=new F,h=new F,d=new F,u=new pe,m=new pe,f=new pe,y=new F,p=new F;function g(_,T,P){c.fromBufferAttribute(n,_),h.fromBufferAttribute(n,T),d.fromBufferAttribute(n,P),u.fromBufferAttribute(r,_),m.fromBufferAttribute(r,T),f.fromBufferAttribute(r,P),h.sub(c),d.sub(c),m.sub(u),f.sub(u);let C=1/(m.x*f.y-f.x*m.y);isFinite(C)&&(y.copy(h).multiplyScalar(f.y).addScaledVector(d,-m.y).multiplyScalar(C),p.copy(d).multiplyScalar(m.x).addScaledVector(h,-f.x).multiplyScalar(C),o[_].add(y),o[T].add(y),o[P].add(y),l[_].add(p),l[T].add(p),l[P].add(p))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let _=0,T=M.length;_<T;++_){let P=M[_],C=P.start,N=P.count;for(let B=C,I=C+N;B<I;B+=3)g(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let S=new F,v=new F,E=new F,w=new F;function R(_){E.fromBufferAttribute(s,_),w.copy(E);let T=o[_];S.copy(T),S.sub(E.multiplyScalar(E.dot(T))).normalize(),v.crossVectors(w,T);let C=v.dot(l[_])<0?-1:1;a.setXYZW(_,S.x,S.y,S.z,C)}for(let _=0,T=M.length;_<T;++_){let P=M[_],C=P.start,N=P.count;for(let B=C,I=C+N;B<I;B+=3)R(e.getX(B+0)),R(e.getX(B+1)),R(e.getX(B+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new jt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,m=n.count;u<m;u++)n.setXYZ(u,0,0,0);let s=new F,r=new F,a=new F,o=new F,l=new F,c=new F,h=new F,d=new F;if(e)for(let u=0,m=e.count;u<m;u+=3){let f=e.getX(u+0),y=e.getX(u+1),p=e.getX(u+2);s.fromBufferAttribute(t,f),r.fromBufferAttribute(t,y),a.fromBufferAttribute(t,p),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),o.fromBufferAttribute(n,f),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,p),o.add(h),l.add(h),c.add(h),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let u=0,m=t.count;u<m;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Pt.fromBufferAttribute(e,t),Pt.normalize(),e.setXYZ(t,Pt.x,Pt.y,Pt.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),m=0,f=0;for(let y=0,p=l.length;y<p;y++){o.isInterleavedBufferAttribute?m=l[y]*o.data.stride+o.offset:m=l[y]*h;for(let g=0;g<h;g++)u[f++]=c[m++]}return new jt(u,h,d)}if(this.index===null)return Fe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],m=e(u,n);l.push(m)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let m=c[d];h.push(m.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,m=d.length;u<m;u++)h.push(d[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Pl=new F,df=new F,uf=new Ge,mn=class{constructor(e=new F(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Pl.subVectors(n,t).cross(df.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Pl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||uf.getNormalMatrix(e),s=this.coplanarPoint(Pl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},ff=0,ri=class extends Cn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ff++}),this.uuid=_s(),this.name="",this.type="Material",this.blending=gs,this.side=di,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ec,this.blendDst=tc,this.blendEquation=Ii,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Je(0,0,0),this.blendAlpha=0,this.depthFunc=is,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=pd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ua,this.stencilZFail=ua,this.stencilZPass=ua,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Fe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Fe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Je().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new mn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new pe().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new pe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Wn=new F,Ll=new F,$r=new F,Kr=new F,Ta=class{constructor(e=new F,t=new F(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Wn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Wn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Wn.copy(this.origin).addScaledVector(this.direction,t),Wn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Ll.copy(e).add(t).multiplyScalar(.5),$r.copy(t).sub(e).normalize(),Kr.copy(this.origin).sub(Ll);let r=e.distanceTo(t)*.5,a=-this.direction.dot($r),o=Kr.dot(this.direction),l=-Kr.dot($r),c=Kr.lengthSq(),h=Math.abs(1-a*a),d,u,m,f;if(h>0)if(d=a*l-o,u=a*o-l,f=r*h,d>=0)if(u>=-f)if(u<=f){let y=1/h;d*=y,u*=y,m=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=r,d=Math.max(0,-(a*u+o)),m=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(a*u+o)),m=-d*d+u*(u+2*l)+c;else u<=-f?(d=Math.max(0,-(-a*r+o)),u=d>0?-r:Math.min(Math.max(-r,-l),r),m=-d*d+u*(u+2*l)+c):u<=f?(d=0,u=Math.min(Math.max(-r,-l),r),m=u*(u+2*l)+c):(d=Math.max(0,-(a*r+o)),u=d>0?r:Math.min(Math.max(-r,-l),r),m=-d*d+u*(u+2*l)+c);else u=a>0?-r:r,d=Math.max(0,-(a*u+o)),m=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Ll).addScaledVector($r,u),m}intersectSphere(e,t){if(e.radius<0)return null;Wn.subVectors(e.center,this.origin);let n=Wn.dot(this.direction),s=Wn.dot(Wn)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),h>=0?(r=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(r=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-u.z)*d,l=(e.max.z-u.z)*d):(o=(e.max.z-u.z)*d,l=(e.min.z-u.z)*d),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Wn)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,d=e.x-a.x,u=e.y-a.y,m=e.z-a.z,f=t.x-a.x,y=t.y-a.y,p=t.z-a.z,g=n.x-a.x,M=n.y-a.y,S=n.z-a.z,v=Math.abs(l),E=Math.abs(c),w=Math.abs(h),R,_,T,P,C,N,B,I,U,H,Y,X;if(v>=E&&v>=w?(T=l,N=d,U=f,X=g,l>=0?(R=c,_=h,P=u,C=m,B=y,I=p,H=M,Y=S):(R=h,_=c,P=m,C=u,B=p,I=y,H=S,Y=M)):E>=w?(T=c,N=u,U=y,X=M,c>=0?(R=h,_=l,P=m,C=d,B=p,I=f,H=S,Y=g):(R=l,_=h,P=d,C=m,B=f,I=p,H=g,Y=S)):(T=h,N=m,U=p,X=S,h>=0?(R=l,_=c,P=d,C=u,B=f,I=y,H=g,Y=M):(R=c,_=l,P=u,C=d,B=y,I=f,H=M,Y=g)),T===0)return null;let z=R/T,q=_/T,j=1/T,Se=P-z*N,be=C-q*N,nt=B-z*U,Ye=I-q*U,et=H-z*X,J=Y-q*X,ee=et*Ye-J*nt,xe=Se*J-be*et,Oe=nt*be-Ye*Se;if(s){if(ee<0||xe<0||Oe<0)return null}else if((ee<0||xe<0||Oe<0)&&(ee>0||xe>0||Oe>0))return null;let Me=ee+xe+Oe;if(Me===0)return null;let ze=j*(ee*N+xe*U+Oe*X);return(Me>0?ze<0:ze>0)?null:this.at(ze/Me,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Zs=class extends ri{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Je(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qn,this.combine=nc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Th=new ut,Si=new Ta,jr=new si,Ah=new F,Qr=new F,ea=new F,ta=new F,Nl=new F,na=new F,Ch=new F,ia=new F,Ft=class extends wt{constructor(e=new Zt,t=new Zs){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){na.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],d=r[l];h!==0&&(Nl.fromBufferAttribute(d,e),a?na.addScaledVector(Nl,h):na.addScaledVector(Nl.sub(t),h))}t.add(na)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),jr.copy(n.boundingSphere),jr.applyMatrix4(r),Si.copy(e.ray).recast(e.near),!(jr.containsPoint(Si.origin)===!1&&(Si.intersectSphere(jr,Ah)===null||Si.origin.distanceToSquared(Ah)>(e.far-e.near)**2))&&(Th.copy(r).invert(),Si.copy(e.ray).applyMatrix4(Th),!(n.boundingBox!==null&&Si.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Si)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let f=0,y=u.length;f<y;f++){let p=u[f],g=a[p.materialIndex],M=Math.max(p.start,m.start),S=Math.min(o.count,Math.min(p.start+p.count,m.start+m.count));for(let v=M,E=S;v<E;v+=3){let w=o.getX(v),R=o.getX(v+1),_=o.getX(v+2);s=sa(this,g,e,n,c,h,d,w,R,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{let f=Math.max(0,m.start),y=Math.min(o.count,m.start+m.count);for(let p=f,g=y;p<g;p+=3){let M=o.getX(p),S=o.getX(p+1),v=o.getX(p+2);s=sa(this,a,e,n,c,h,d,M,S,v),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let f=0,y=u.length;f<y;f++){let p=u[f],g=a[p.materialIndex],M=Math.max(p.start,m.start),S=Math.min(l.count,Math.min(p.start+p.count,m.start+m.count));for(let v=M,E=S;v<E;v+=3){let w=v,R=v+1,_=v+2;s=sa(this,g,e,n,c,h,d,w,R,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{let f=Math.max(0,m.start),y=Math.min(l.count,m.start+m.count);for(let p=f,g=y;p<g;p+=3){let M=p,S=p+1,v=p+2;s=sa(this,a,e,n,c,h,d,M,S,v),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}}};function pf(i,e,t,n,s,r,a,o){let l;if(e.side===Vt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===di,o),l===null)return null;ia.copy(o),ia.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(ia);return c<t.near||c>t.far?null:{distance:c,point:ia.clone(),object:i}}function sa(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Qr),i.getVertexPosition(l,ea),i.getVertexPosition(c,ta);let h=pf(i,e,t,n,Qr,ea,ta,Ch);if(h){let d=new F;ii.getBarycoord(Ch,Qr,ea,ta,d),s&&(h.uv=ii.getInterpolatedAttribute(s,o,l,c,d,new pe)),r&&(h.uv1=ii.getInterpolatedAttribute(r,o,l,c,d,new pe)),a&&(h.normal=ii.getInterpolatedAttribute(a,o,l,c,d,new F),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new F,materialIndex:0};ii.getNormal(Qr,ea,ta,u.normal),h.face=u,h.barycoord=d}return h}var Ai=class extends qt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Lt,h=Lt,d,u){super(null,a,o,l,c,h,s,r,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Js=class extends jt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ji=new ut,Rh=new ut,ra=[],Ih=new In,mf=new ut,Ns=new Ft,Ds=new si,Ci=class extends Ft{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Js(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,mf)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new In),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ji),Ih.copy(e.boundingBox).applyMatrix4(ji),this.boundingBox.union(Ih)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new si),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ji),Ds.copy(e.boundingSphere).applyMatrix4(ji),this.boundingSphere.union(Ds)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Ns.geometry=this.geometry,Ns.material=this.material,Ns.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ds.copy(this.boundingSphere),Ds.applyMatrix4(n),e.ray.intersectsSphere(Ds)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ji),Rh.multiplyMatrices(n,ji),Ns.matrixWorld=Rh,Ns.raycast(e,ra);for(let a=0,o=ra.length;a<o;a++){let l=ra[a];l.instanceId=r,l.object=this,t.push(l)}ra.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Js(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ai(new Float32Array(s*this.count),s,this.count,io,an));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},wi=new si,gf=new pe(.5,.5),aa=new F,cs=class{constructor(e=new mn,t=new mn,n=new mn,s=new mn,r=new mn,a=new mn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=gn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],m=r[7],f=r[8],y=r[9],p=r[10],g=r[11],M=r[12],S=r[13],v=r[14],E=r[15];if(s[0].setComponents(c-a,m-h,g-f,E-M).normalize(),s[1].setComponents(c+a,m+h,g+f,E+M).normalize(),s[2].setComponents(c+o,m+d,g+y,E+S).normalize(),s[3].setComponents(c-o,m-d,g-y,E-S).normalize(),n)s[4].setComponents(l,u,p,v).normalize(),s[5].setComponents(c-l,m-u,g-p,E-v).normalize();else if(s[4].setComponents(c-l,m-u,g-p,E-v).normalize(),t===gn)s[5].setComponents(c+l,m+u,g+p,E+v).normalize();else if(t===rs)s[5].setComponents(l,u,p,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),wi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),wi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(wi)}intersectsSprite(e){wi.center.set(0,0,0);let t=gf.distanceTo(e.center);return wi.radius=.7071067811865476+t,wi.applyMatrix4(e.matrixWorld),this.intersectsSphere(wi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(aa.x=s.normal.x>0?e.max.x:e.min.x,aa.y=s.normal.y>0?e.max.y:e.min.y,aa.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(aa)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var $s=class extends qt{constructor(e=[],t=ui,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var ai=class extends qt{constructor(e,t,n=yn,s,r,a,o=Lt,l=Lt,c,h=An,d=1){if(h!==An&&h!==fi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:d};super(u,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new os(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Aa=class extends ai{constructor(e,t=yn,n=ui,s,r,a=Lt,o=Lt,l,c=An){let h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ks=class extends qt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Pn=class i extends Zt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,m=0;f("z","y","x",-1,-1,n,t,e,a,r,0),f("z","y","x",1,-1,n,t,-e,a,r,1),f("x","z","y",1,1,e,n,t,s,a,2),f("x","z","y",1,-1,e,n,-t,s,a,3),f("x","y","z",1,-1,e,t,n,s,r,4),f("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new vt(c,3)),this.setAttribute("normal",new vt(h,3)),this.setAttribute("uv",new vt(d,2));function f(y,p,g,M,S,v,E,w,R,_,T){let P=v/R,C=E/_,N=v/2,B=E/2,I=w/2,U=R+1,H=_+1,Y=0,X=0,z=new F;for(let q=0;q<H;q++){let j=q*C-B;for(let Se=0;Se<U;Se++){let be=Se*P-N;z[y]=be*M,z[p]=j*S,z[g]=I,c.push(z.x,z.y,z.z),z[y]=0,z[p]=0,z[g]=w>0?1:-1,h.push(z.x,z.y,z.z),d.push(Se/R),d.push(1-q/_),Y+=1}}for(let q=0;q<_;q++)for(let j=0;j<R;j++){let Se=u+j+U*q,be=u+j+U*(q+1),nt=u+(j+1)+U*(q+1),Ye=u+(j+1)+U*q;l.push(Se,be,Ye),l.push(be,nt,Ye),X+=6}o.addGroup(m,X,T),m+=X,u+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var hs=class i extends Zt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],u=[],m=[],f=0,y=[],p=n/2,g=0;M(),a===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new vt(d,3)),this.setAttribute("normal",new vt(u,3)),this.setAttribute("uv",new vt(m,2));function M(){let v=new F,E=new F,w=0,R=(t-e)/n;for(let _=0;_<=r;_++){let T=[],P=_/r,C=P*(t-e)+e;for(let N=0;N<=s;N++){let B=N/s,I=B*l+o,U=Math.sin(I),H=Math.cos(I);E.x=C*U,E.y=-P*n+p,E.z=C*H,d.push(E.x,E.y,E.z),v.set(U,R,H).normalize(),u.push(v.x,v.y,v.z),m.push(B,1-P),T.push(f++)}y.push(T)}for(let _=0;_<s;_++)for(let T=0;T<r;T++){let P=y[T][_],C=y[T+1][_],N=y[T+1][_+1],B=y[T][_+1];(e>0||T!==0)&&(h.push(P,C,B),w+=3),(t>0||T!==r-1)&&(h.push(C,N,B),w+=3)}c.addGroup(g,w,0),g+=w}function S(v){let E=f,w=new pe,R=new F,_=0,T=v===!0?e:t,P=v===!0?1:-1;for(let N=1;N<=s;N++)d.push(0,p*P,0),u.push(0,P,0),m.push(.5,.5),f++;let C=f;for(let N=0;N<=s;N++){let I=N/s*l+o,U=Math.cos(I),H=Math.sin(I);R.x=T*H,R.y=p*P,R.z=T*U,d.push(R.x,R.y,R.z),u.push(0,P,0),w.x=U*.5+.5,w.y=H*.5*P+.5,m.push(w.x,w.y),f++}for(let N=0;N<s;N++){let B=E+N,I=C+N;v===!0?h.push(I,I+1,B):h.push(I+1,I,B),_+=3}c.addGroup(g,_,v===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},js=class i extends hs{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Qt=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Fe("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let h=n[s],u=n[s+1]-h,m=(a-h)/u;return(s+m)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new pe:new F);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new F,s=[],r=[],a=[],o=new F,l=new ut;for(let m=0;m<=e;m++){let f=m/e;s[m]=this.getTangentAt(f,new F)}r[0]=new F,a[0]=new F;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let m=1;m<=e;m++){if(r[m]=r[m-1].clone(),a[m]=a[m-1].clone(),o.crossVectors(s[m-1],s[m]),o.length()>Number.EPSILON){o.normalize();let f=Math.acos(Qe(s[m-1].dot(s[m]),-1,1));r[m].applyMatrix4(l.makeRotationAxis(o,f))}a[m].crossVectors(s[m],r[m])}if(t===!0){let m=Math.acos(Qe(r[0].dot(r[e]),-1,1));m/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(m=-m);for(let f=1;f<=e;f++)r[f].applyMatrix4(l.makeRotationAxis(s[f],m*f)),a[f].crossVectors(s[f],r[f])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ds=class extends Qt{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new pe){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,m=c-this.aY;l=u*h-m*d+this.aX,c=u*d+m*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ca=class extends ds{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function yc(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,d){let u=(a-r)/c-(o-r)/(c+h)+(o-a)/h,m=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,m*=h,s(a,o,u,m)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var Ph=new F,Lh=new F,Dl=new yc,Ul=new yc,kl=new yc,Ra=class extends Qt{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new F){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(Lh.subVectors(s[0],s[1]).add(s[0]),c=Lh);let d=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(Ph.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Ph),this.curveType==="centripetal"||this.curveType==="chordal"){let m=this.curveType==="chordal"?.5:.25,f=Math.pow(c.distanceToSquared(d),m),y=Math.pow(d.distanceToSquared(u),m),p=Math.pow(u.distanceToSquared(h),m);y<1e-4&&(y=1),f<1e-4&&(f=y),p<1e-4&&(p=y),Dl.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,f,y,p),Ul.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,f,y,p),kl.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,f,y,p)}else this.curveType==="catmullrom"&&(Dl.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),Ul.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),kl.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return n.set(Dl.calc(l),Ul.calc(l),kl.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new F().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Nh(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function xf(i,e){let t=1-i;return t*t*e}function yf(i,e){return 2*(1-i)*i*e}function _f(i,e){return i*i*e}function ks(i,e,t,n){return xf(i,e)+yf(i,t)+_f(i,n)}function vf(i,e){let t=1-i;return t*t*t*e}function bf(i,e){let t=1-i;return 3*t*t*i*e}function Mf(i,e){return 3*(1-i)*i*i*e}function Sf(i,e){return i*i*i*e}function Fs(i,e,t,n,s){return vf(i,e)+bf(i,t)+Mf(i,n)+Sf(i,s)}var Qs=class extends Qt{constructor(e=new pe,t=new pe,n=new pe,s=new pe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new pe){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Fs(e,s.x,r.x,a.x,o.x),Fs(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ia=class extends Qt{constructor(e=new F,t=new F,n=new F,s=new F){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new F){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Fs(e,s.x,r.x,a.x,o.x),Fs(e,s.y,r.y,a.y,o.y),Fs(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},er=class extends Qt{constructor(e=new pe,t=new pe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new pe){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new pe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Pa=class extends Qt{constructor(e=new F,t=new F){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new F){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new F){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},tr=class extends Qt{constructor(e=new pe,t=new pe,n=new pe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new pe){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(ks(e,s.x,r.x,a.x),ks(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},La=class extends Qt{constructor(e=new F,t=new F,n=new F){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new F){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(ks(e,s.x,r.x,a.x),ks(e,s.y,r.y,a.y),ks(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},nr=class extends Qt{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new pe){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],d=s[a>s.length-3?s.length-1:a+2];return n.set(Nh(o,l.x,c.x,h.x,d.x),Nh(o,l.y,c.y,h.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new pe().fromArray(s))}return this}},Hl=Object.freeze({__proto__:null,ArcCurve:Ca,CatmullRomCurve3:Ra,CubicBezierCurve:Qs,CubicBezierCurve3:Ia,EllipseCurve:ds,LineCurve:er,LineCurve3:Pa,QuadraticBezierCurve:tr,QuadraticBezierCurve3:La,SplineCurve:nr}),Na=class extends Qt{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Hl[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new Hl[s.type]().fromJSON(s))}return this}},ir=class extends Na{constructor(e){super(),this.type="Path",this.currentPoint=new pe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new er(this.currentPoint.clone(),new pe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new tr(this.currentPoint.clone(),new pe(e,t),new pe(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,a){let o=new Qs(this.currentPoint.clone(),new pe(e,t),new pe(n,s),new pe(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new nr(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,s,r,a),this}absarc(e,t,n,s,r,a){return this.absellipse(e,t,n,n,s,r,a),this}ellipse(e,t,n,s,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,s,r,a,o,l),this}absellipse(e,t,n,s,r,a,o,l){let c=new ds(e,t,n,s,r,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},us=class extends ir{constructor(e){super(e),this.uuid=_s(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new ir().fromJSON(s))}return this}};function wf(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=Ad(i,0,s,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=Rf(i,e,r,t)),i.length>80*t){o=i[0],l=i[1];let h=o,d=l;for(let u=t;u<s;u+=t){let m=i[u],f=i[u+1];m<o&&(o=m),f<l&&(l=f),m>h&&(h=m),f>d&&(d=f)}c=Math.max(h-o,d-l),c=c!==0?32767/c:0}return sr(r,a,t,o,l,c,0),a}function Ad(i,e,t,n,s){let r;if(s===zf(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=Dh(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=Dh(a/n|0,i[a],i[a+1],r);return r&&fs(r,r.next)&&(ar(r),r=r.next),r}function Ri(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(fs(t,t.next)||_t(t.prev,t,t.next)===0)){if(ar(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function sr(i,e,t,n,s,r,a){if(!i)return;!a&&r&&Df(i,n,s,r);let o=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?Tf(i,n,s,r):Ef(i)){e.push(l.i,i.i,c.i),ar(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=Af(Ri(i),e),sr(i,e,t,n,s,r,2)):a===2&&Cf(i,e,t,n,s,r):sr(Ri(i),e,t,n,s,r,1);break}}}function Ef(i){let e=i.prev,t=i,n=i.next;if(_t(e,t,n)>=0)return!1;let s=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,h=Math.min(s,r,a),d=Math.min(o,l,c),u=Math.max(s,r,a),m=Math.max(o,l,c),f=n.next;for(;f!==e;){if(f.x>=h&&f.x<=u&&f.y>=d&&f.y<=m&&Us(s,o,r,l,a,c,f.x,f.y)&&_t(f.prev,f,f.next)>=0)return!1;f=f.next}return!0}function Tf(i,e,t,n){let s=i.prev,r=i,a=i.next;if(_t(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,h=s.y,d=r.y,u=a.y,m=Math.min(o,l,c),f=Math.min(h,d,u),y=Math.max(o,l,c),p=Math.max(h,d,u),g=Wl(m,f,e,t,n),M=Wl(y,p,e,t,n),S=i.prevZ,v=i.nextZ;for(;S&&S.z>=g&&v&&v.z<=M;){if(S.x>=m&&S.x<=y&&S.y>=f&&S.y<=p&&S!==s&&S!==a&&Us(o,h,l,d,c,u,S.x,S.y)&&_t(S.prev,S,S.next)>=0||(S=S.prevZ,v.x>=m&&v.x<=y&&v.y>=f&&v.y<=p&&v!==s&&v!==a&&Us(o,h,l,d,c,u,v.x,v.y)&&_t(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;S&&S.z>=g;){if(S.x>=m&&S.x<=y&&S.y>=f&&S.y<=p&&S!==s&&S!==a&&Us(o,h,l,d,c,u,S.x,S.y)&&_t(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;v&&v.z<=M;){if(v.x>=m&&v.x<=y&&v.y>=f&&v.y<=p&&v!==s&&v!==a&&Us(o,h,l,d,c,u,v.x,v.y)&&_t(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function Af(i,e){let t=i;do{let n=t.prev,s=t.next.next;!fs(n,s)&&Rd(n,t,t.next,s)&&rr(n,s)&&rr(s,n)&&(e.push(n.i,t.i,s.i),ar(t),ar(t.next),t=i=s),t=t.next}while(t!==i);return Ri(t)}function Cf(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Ff(a,o)){let l=Id(a,o);a=Ri(a,a.next),l=Ri(l,l.next),sr(a,e,t,n,s,r,0),sr(l,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function Rf(i,e,t,n){let s=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*n,l=r<a-1?e[r+1]*n:i.length,c=Ad(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(kf(c))}s.sort(If);for(let r=0;r<s.length;r++)t=Pf(s[r],t);return t}function If(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function Pf(i,e){let t=Lf(i,e);if(!t)return e;let n=Id(t,i);return Ri(n,n.next),Ri(t,t.next)}function Lf(i,e){let t=e,n=i.x,s=i.y,r=-1/0,a;if(fs(i,t))return t;do{if(fs(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let d=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=n&&d>r&&(r=d,a=t.x<t.next.x?t:t.next,d===n))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Cd(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){let d=Math.abs(s-t.y)/(n-t.x);rr(t,i)&&(d<h||d===h&&(t.x>a.x||t.x===a.x&&Nf(a,t)))&&(a=t,h=d)}t=t.next}while(t!==o);return a}function Nf(i,e){return _t(i.prev,i,e.prev)<0&&_t(e.next,i,i.next)<0}function Df(i,e,t,n){let s=i;do s.z===0&&(s.z=Wl(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Uf(s)}function Uf(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function Wl(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function kf(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Cd(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function Us(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&Cd(i,e,t,n,s,r,a,o)}function Ff(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Of(i,e)&&(rr(i,e)&&rr(e,i)&&Bf(i,e)&&(_t(i.prev,i,e.prev)||_t(i,e.prev,e))||fs(i,e)&&_t(i.prev,i,i.next)>0&&_t(e.prev,e,e.next)>0)}function _t(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function fs(i,e){return i.x===e.x&&i.y===e.y}function Rd(i,e,t,n){let s=la(_t(i,e,t)),r=la(_t(i,e,n)),a=la(_t(t,n,i)),o=la(_t(t,n,e));return!!(s!==r&&a!==o||s===0&&oa(i,t,e)||r===0&&oa(i,n,e)||a===0&&oa(t,i,n)||o===0&&oa(t,e,n))}function oa(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function la(i){return i>0?1:i<0?-1:0}function Of(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Rd(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function rr(i,e){return _t(i.prev,i,i.next)<0?_t(i,e,i.next)>=0&&_t(i,i.prev,e)>=0:_t(i,e,i.prev)<0||_t(i,i.next,e)<0}function Bf(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Id(i,e){let t=Xl(i.i,i.x,i.y),n=Xl(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Dh(i,e,t,n){let s=Xl(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function ar(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Xl(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function zf(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}var ql=class{static triangulate(e,t,n=2){return wf(e,t,n)}},Ei=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];Uh(e),kh(n,e);let a=e.length;t.forEach(Uh);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,kh(n,t[l]);let o=ql.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Uh(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function kh(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var or=class i extends Zt{constructor(e=new us([new pe(.5,.5),new pe(-.5,.5),new pe(-.5,-.5),new pe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,s=[],r=[];for(let o=0,l=e.length;o<l;o++){let c=e[o];a(c)}this.setAttribute("position",new vt(s,3)),this.setAttribute("uv",new vt(r,2)),this.computeVertexNormals();function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1,u=t.bevelEnabled!==void 0?t.bevelEnabled:!0,m=t.bevelThickness!==void 0?t.bevelThickness:.2,f=t.bevelSize!==void 0?t.bevelSize:m-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,p=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,M=t.UVGenerator!==void 0?t.UVGenerator:Vf,S,v=!1,E,w,R,_;if(g){S=g.getSpacedPoints(h),v=!0,u=!1;let ne=g.isCatmullRomCurve3?g.closed:!1;E=g.computeFrenetFrames(h,ne),w=new F,R=new F,_=new F}u||(p=0,m=0,f=0,y=0);let T=o.extractPoints(c),P=T.shape,C=T.holes;if(!Ei.isClockWise(P)){P=P.reverse();for(let ne=0,se=C.length;ne<se;ne++){let re=C[ne];Ei.isClockWise(re)&&(C[ne]=re.reverse())}}function B(ne){let re=10000000000000001e-36,ae=ne[0];for(let ce=1;ce<=ne.length;ce++){let Ue=ce%ne.length,De=ne[Ue],Ve=De.x-ae.x,He=De.y-ae.y,L=Ve*Ve+He*He,rt=Math.max(Math.abs(De.x),Math.abs(De.y),Math.abs(ae.x),Math.abs(ae.y)),Ke=re*rt*rt;if(L<=Ke){ne.splice(Ue,1),ce--;continue}ae=De}}B(P),C.forEach(B);let I=C.length,U=P;for(let ne=0;ne<I;ne++){let se=C[ne];P=P.concat(se)}function H(ne,se,re){return se||Be("ExtrudeGeometry: vec does not exist"),ne.clone().addScaledVector(se,re)}let Y=P.length;function X(ne,se,re){let ae,ce,Ue,De=ne.x-se.x,Ve=ne.y-se.y,He=re.x-ne.x,L=re.y-ne.y,rt=De*De+Ve*Ve,Ke=De*L-Ve*He;if(Math.abs(Ke)>Number.EPSILON){let A=Math.sqrt(rt),x=Math.sqrt(He*He+L*L),O=se.x-Ve/A,W=se.y+De/A,$=re.x-L/x,oe=re.y+He/x,le=(($-O)*L-(oe-W)*He)/(De*L-Ve*He);ae=O+De*le-ne.x,ce=W+Ve*le-ne.y;let K=ae*ae+ce*ce;if(K<=2)return new pe(ae,ce);Ue=Math.sqrt(K/2)}else{let A=!1;De>Number.EPSILON?He>Number.EPSILON&&(A=!0):De<-Number.EPSILON?He<-Number.EPSILON&&(A=!0):Math.sign(Ve)===Math.sign(L)&&(A=!0),A?(ae=-Ve,ce=De,Ue=Math.sqrt(rt)):(ae=De,ce=Ve,Ue=Math.sqrt(rt/2))}return new pe(ae/Ue,ce/Ue)}let z=[];for(let ne=0,se=U.length,re=se-1,ae=ne+1;ne<se;ne++,re++,ae++)re===se&&(re=0),ae===se&&(ae=0),z[ne]=X(U[ne],U[re],U[ae]);let q=[],j,Se=z.concat();for(let ne=0,se=I;ne<se;ne++){let re=C[ne];j=[];for(let ae=0,ce=re.length,Ue=ce-1,De=ae+1;ae<ce;ae++,Ue++,De++)Ue===ce&&(Ue=0),De===ce&&(De=0),j[ae]=X(re[ae],re[Ue],re[De]);q.push(j),Se=Se.concat(j)}let be;if(p===0)be=Ei.triangulateShape(U,C);else{let ne=[],se=[];for(let re=0;re<p;re++){let ae=re/p,ce=m*Math.cos(ae*Math.PI/2),Ue=f*Math.sin(ae*Math.PI/2)+y;for(let De=0,Ve=U.length;De<Ve;De++){let He=H(U[De],z[De],Ue);xe(He.x,He.y,-ce),ae===0&&ne.push(He)}for(let De=0,Ve=I;De<Ve;De++){let He=C[De];j=q[De];let L=[];for(let rt=0,Ke=He.length;rt<Ke;rt++){let A=H(He[rt],j[rt],Ue);xe(A.x,A.y,-ce),ae===0&&L.push(A)}ae===0&&se.push(L)}}be=Ei.triangulateShape(ne,se)}let nt=be.length,Ye=f+y;for(let ne=0;ne<Y;ne++){let se=u?H(P[ne],Se[ne],Ye):P[ne];v?(R.copy(E.normals[0]).multiplyScalar(se.x),w.copy(E.binormals[0]).multiplyScalar(se.y),_.copy(S[0]).add(R).add(w),xe(_.x,_.y,_.z)):xe(se.x,se.y,0)}for(let ne=1;ne<=h;ne++)for(let se=0;se<Y;se++){let re=u?H(P[se],Se[se],Ye):P[se];v?(R.copy(E.normals[ne]).multiplyScalar(re.x),w.copy(E.binormals[ne]).multiplyScalar(re.y),_.copy(S[ne]).add(R).add(w),xe(_.x,_.y,_.z)):xe(re.x,re.y,d/h*ne)}for(let ne=p-1;ne>=0;ne--){let se=ne/p,re=m*Math.cos(se*Math.PI/2),ae=f*Math.sin(se*Math.PI/2)+y;for(let ce=0,Ue=U.length;ce<Ue;ce++){let De=H(U[ce],z[ce],ae);xe(De.x,De.y,d+re)}for(let ce=0,Ue=C.length;ce<Ue;ce++){let De=C[ce];j=q[ce];for(let Ve=0,He=De.length;Ve<He;Ve++){let L=H(De[Ve],j[Ve],ae);v?xe(L.x,L.y+S[h-1].y,S[h-1].x+re):xe(L.x,L.y,d+re)}}}et(),J();function et(){let ne=s.length/3;if(u){let se=0,re=Y*se;for(let ae=0;ae<nt;ae++){let ce=be[ae];Oe(ce[2]+re,ce[1]+re,ce[0]+re)}se=h+p*2,re=Y*se;for(let ae=0;ae<nt;ae++){let ce=be[ae];Oe(ce[0]+re,ce[1]+re,ce[2]+re)}}else{for(let se=0;se<nt;se++){let re=be[se];Oe(re[2],re[1],re[0])}for(let se=0;se<nt;se++){let re=be[se];Oe(re[0]+Y*h,re[1]+Y*h,re[2]+Y*h)}}n.addGroup(ne,s.length/3-ne,0)}function J(){let ne=s.length/3,se=0;ee(U,se),se+=U.length;for(let re=0,ae=C.length;re<ae;re++){let ce=C[re];ee(ce,se),se+=ce.length}n.addGroup(ne,s.length/3-ne,1)}function ee(ne,se){let re=ne.length;for(;--re>=0;){let ae=re,ce=re-1;ce<0&&(ce=ne.length-1);for(let Ue=0,De=h+p*2;Ue<De;Ue++){let Ve=Y*Ue,He=Y*(Ue+1),L=se+ae+Ve,rt=se+ce+Ve,Ke=se+ce+He,A=se+ae+He;Me(L,rt,Ke,A)}}}function xe(ne,se,re){l.push(ne),l.push(se),l.push(re)}function Oe(ne,se,re){ze(ne),ze(se),ze(re);let ae=s.length/3,ce=M.generateTopUV(n,s,ae-3,ae-2,ae-1);ct(ce[0]),ct(ce[1]),ct(ce[2])}function Me(ne,se,re,ae){ze(ne),ze(se),ze(ae),ze(se),ze(re),ze(ae);let ce=s.length/3,Ue=M.generateSideWallUV(n,s,ce-6,ce-3,ce-2,ce-1);ct(Ue[0]),ct(Ue[1]),ct(Ue[3]),ct(Ue[1]),ct(Ue[2]),ct(Ue[3])}function ze(ne){s.push(l[ne*3+0]),s.push(l[ne*3+1]),s.push(l[ne*3+2])}function ct(ne){r.push(ne.x),r.push(ne.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Gf(t,n,e)}static fromJSON(e,t){let n=[];for(let r=0,a=e.shapes.length;r<a;r++){let o=t[e.shapes[r]];n.push(o)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Hl[s.type]().fromJSON(s)),new i(n,e.options)}},Vf={generateTopUV:function(i,e,t,n,s){let r=e[t*3],a=e[t*3+1],o=e[n*3],l=e[n*3+1],c=e[s*3],h=e[s*3+1];return[new pe(r,a),new pe(o,l),new pe(c,h)]},generateSideWallUV:function(i,e,t,n,s,r){let a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],d=e[n*3+2],u=e[s*3],m=e[s*3+1],f=e[s*3+2],y=e[r*3],p=e[r*3+1],g=e[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new pe(a,1-l),new pe(c,1-d),new pe(u,1-f),new pe(y,1-g)]:[new pe(o,1-l),new pe(h,1-d),new pe(m,1-f),new pe(p,1-g)]}};function Gf(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var lr=class i extends Zt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,d=e/o,u=t/l,m=[],f=[],y=[],p=[];for(let g=0;g<h;g++){let M=g*u-a;for(let S=0;S<c;S++){let v=S*d-r;f.push(v,-M,0),y.push(0,0,1),p.push(S/o),p.push(1-g/l)}}for(let g=0;g<l;g++)for(let M=0;M<o;M++){let S=M+c*g,v=M+c*(g+1),E=M+1+c*(g+1),w=M+1+c*g;m.push(S,v,w),m.push(v,E,w)}this.setIndex(m),this.setAttribute("position",new vt(f,3)),this.setAttribute("normal",new vt(y,3)),this.setAttribute("uv",new vt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var cr=class i extends Zt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new F,u=new F,m=[],f=[],y=[],p=[];for(let g=0;g<=n;g++){let M=[],S=g/n,v=a+S*o,E=e*Math.cos(v),w=Math.sqrt(e*e-E*E),R=0;g===0&&a===0?R=.5/t:g===n&&l===Math.PI&&(R=-.5/t);for(let _=0;_<=t;_++){let T=_/t,P=s+T*r;d.x=-w*Math.cos(P),d.y=E,d.z=w*Math.sin(P),f.push(d.x,d.y,d.z),u.copy(d).normalize(),y.push(u.x,u.y,u.z),p.push(T+R,1-S),M.push(c++)}h.push(M)}for(let g=0;g<n;g++)for(let M=0;M<t;M++){let S=h[g][M+1],v=h[g][M],E=h[g+1][M],w=h[g+1][M+1];(g!==0||a>0)&&m.push(S,v,w),(g!==n-1||l<Math.PI)&&m.push(v,E,w)}this.setIndex(m),this.setAttribute("position",new vt(f,3)),this.setAttribute("normal",new vt(y,3)),this.setAttribute("uv",new vt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var hr=class i extends Zt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],h=[],d=[],u=new F,m=new F,f=new F;for(let y=0;y<=n;y++){let p=a+y/n*o;for(let g=0;g<=s;g++){let M=g/s*r;m.x=(e+t*Math.cos(p))*Math.cos(M),m.y=(e+t*Math.cos(p))*Math.sin(M),m.z=t*Math.sin(p),c.push(m.x,m.y,m.z),u.x=e*Math.cos(M),u.y=e*Math.sin(M),f.subVectors(m,u).normalize(),h.push(f.x,f.y,f.z),d.push(g/s),d.push(y/n)}}for(let y=1;y<=n;y++)for(let p=1;p<=s;p++){let g=(s+1)*y+p-1,M=(s+1)*(y-1)+p-1,S=(s+1)*(y-1)+p,v=(s+1)*y+p;l.push(g,M,v),l.push(M,S,v)}this.setIndex(l),this.setAttribute("position",new vt(c,3)),this.setAttribute("normal",new vt(h,3)),this.setAttribute("uv",new vt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};function Li(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(Fh(s))s.isRenderTargetTexture?(Fe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Fh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Ot(i){let e={};for(let t=0;t<i.length;t++){let n=Li(i[t]);for(let s in n)e[s]=n[s]}return e}function Fh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Hf(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function _c(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}var Pd={clone:Li,merge:Ot},Wf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Xf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,en=class extends ri{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Wf,this.fragmentShader=Xf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Li(e.uniforms),this.uniformsGroups=Hf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Je().setHex(s.value);break;case"v2":this.uniforms[n].value=new pe().fromArray(s.value);break;case"v3":this.uniforms[n].value=new F().fromArray(s.value);break;case"v4":this.uniforms[n].value=new yt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ge().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ut().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Da=class extends en{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},dr=class extends ri{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Je(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Je(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Oo,this.normalScale=new pe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Ua=class extends ri{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ud,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ka=class extends ri{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Qi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Fl(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var oi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Fa=class extends oi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:zl,endingEnd:zl}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Vl:r=e,o=2*t-n;break;case Gl:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Vl:a=e,l=2*n-t;break;case Gl:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,m=this._weightNext,f=(n-t)/(s-t),y=f*f,p=y*f,g=-u*p+2*u*y-u*f,M=(1+u)*p+(-1.5-2*u)*y+(-.5+u)*f+1,S=(-1-m)*p+(1.5+m)*y+.5*f,v=m*p-m*y;for(let E=0;E!==o;++E)r[E]=g*a[h+E]+M*a[c+E]+S*a[l+E]+v*a[d+E];return r}},Oa=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(s-t),d=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*d+a[l+u]*h;return r}},Ba=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},za=class extends oi{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let f=(n-t)/(s-t),y=1-f;for(let p=0;p!==o;++p)r[p]=a[c+p]*y+a[l+p]*f;return r}let u=o*2,m=e-1;for(let f=0;f!==o;++f){let y=a[c+f],p=a[l+f],g=m*u+f*2,M=d[g],S=d[g+1],v=e*u+f*2,E=h[v],w=h[v+1],R=Yf(n,t,M,E,s);r[f]=Ld(R,y,S,w,p)}return r}};function Ld(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function qf(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function Yf(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=Ld(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=qf(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var tn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Qi(t,this.TimeBufferType),this.values=Qi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Qi(e.times,Array),values:Qi(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),Fl(e.settings)&&(n.settings={inTangents:Qi(e.settings.inTangents,Array),outTangents:Qi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ba(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Oa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Fa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new za(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Os:t=this.InterpolantFactoryMethodDiscrete;break;case ba:t=this.InterpolantFactoryMethodLinear;break;case da:t=this.InterpolantFactoryMethodSmooth;break;case Bl:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Fe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Os;case this.InterpolantFactoryMethodLinear:return ba;case this.InterpolantFactoryMethodSmooth:return da;case this.InterpolantFactoryMethodBezier:return Bl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;Fl(this.settings)&&(Oh(this.settings.inTangents,e),Oh(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Be("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Be("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Be("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){Be("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Ju(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Be("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===da,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let d=o*n,u=d-n,m=d+n;for(let f=0;f!==n;++f){let y=t[d+f];if(y!==t[u+f]||y!==t[m+f]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let d=o*n,u=a*n;for(let m=0;m!==n;++m)t[u+m]=t[d+m]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,Fl(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Oh(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}tn.prototype.ValueTypeName="";tn.prototype.TimeBufferType=Float32Array;tn.prototype.ValueBufferType=Float32Array;tn.prototype.DefaultInterpolation=ba;var li=class extends tn{constructor(e,t,n){super(e,t,n)}};li.prototype.ValueTypeName="bool";li.prototype.ValueBufferType=Array;li.prototype.DefaultInterpolation=Os;li.prototype.InterpolantFactoryMethodLinear=void 0;li.prototype.InterpolantFactoryMethodSmooth=void 0;var Va=class extends tn{constructor(e,t,n,s){super(e,t,n,s)}};Va.prototype.ValueTypeName="color";var Ga=class extends tn{constructor(e,t,n,s){super(e,t,n,s)}};Ga.prototype.ValueTypeName="number";var Ha=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)Rn.slerpFlat(r,0,a,c-o,a,c,l);return r}},ur=class extends tn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Ha(this.times,this.values,this.getValueSize(),e)}};ur.prototype.ValueTypeName="quaternion";ur.prototype.InterpolantFactoryMethodSmooth=void 0;var ci=class extends tn{constructor(e,t,n){super(e,t,n)}};ci.prototype.ValueTypeName="string";ci.prototype.ValueBufferType=Array;ci.prototype.DefaultInterpolation=Os;ci.prototype.InterpolantFactoryMethodLinear=void 0;ci.prototype.InterpolantFactoryMethodSmooth=void 0;var Wa=class extends tn{constructor(e,t,n,s){super(e,t,n,s)}};Wa.prototype.ValueTypeName="vector";var Xa=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let m=c[d],f=c[d+1];if(m.global&&(m.lastIndex=0),m.test(h))return f}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Nd=new Xa,qa=class{constructor(e){this.manager=e!==void 0?e:Nd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};qa.DEFAULT_MATERIAL_NAME="__DEFAULT";var fr=class extends wt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Je(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},pr=class extends fr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(wt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Je(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Ol=new ut,Bh=new F,zh=new F,Ya=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new pe(512,512),this.mapType=Jt,this.map=null,this.mapPass=null,this.matrix=new ut,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new cs,this._frameExtents=new pe(1,1),this._viewportCount=1,this._viewports=[new yt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Bh.setFromMatrixPosition(e.matrixWorld),t.position.copy(Bh),zh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(zh),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){Ol.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Ol,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===rs||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Ol)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},ca=new F,ha=new Rn,En=new F,mr=class extends wt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ut,this.projectionMatrix=new ut,this.projectionMatrixInverse=new ut,this.coordinateSystem=gn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ca,ha,En),En.x===1&&En.y===1&&En.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ca,ha,En.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ca,ha,En),En.x===1&&En.y===1&&En.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ca,ha,En.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ni=new F,Vh=new pe,Gh=new pe,Wt=class extends mr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ma*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(fl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ma*2*Math.atan(Math.tan(fl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ni.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ni.x,ni.y).multiplyScalar(-e/ni.z),ni.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ni.x,ni.y).multiplyScalar(-e/ni.z)}getViewSize(e,t){return this.getViewBounds(e,Vh,Gh),t.subVectors(Gh,Vh)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(fl*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var hi=class extends mr{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Yl=class extends Ya{constructor(){super(new hi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ps=class extends fr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(wt.DEFAULT_UP),this.updateMatrix(),this.target=new wt,this.shadow=new Yl}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var es=-90,ts=1,Za=class extends wt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Wt(es,ts,e,t);s.layers=this.layers,this.add(s);let r=new Wt(es,ts,e,t);r.layers=this.layers,this.add(r);let a=new Wt(es,ts,e,t);a.layers=this.layers,this.add(a);let o=new Wt(es,ts,e,t);o.layers=this.layers,this.add(o);let l=new Wt(es,ts,e,t);l.layers=this.layers,this.add(l);let c=new Wt(es,ts,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===gn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===rs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),f=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,u,m),e.xr.enabled=f,n.texture.needsPMREMUpdate=!0}},Ja=class extends Wt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var vc="\\[\\]\\.:\\/",Zf=new RegExp("["+vc+"]","g"),bc="[^"+vc+"]",Jf="[^"+vc.replace("\\.","")+"]",$f=/((?:WC+[\/:])*)/.source.replace("WC",bc),Kf=/(WCOD+)?/.source.replace("WCOD",Jf),jf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",bc),Qf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",bc),ep=new RegExp("^"+$f+Kf+jf+Qf+"$"),tp=["material","materials","bones","map"],Zl=class{constructor(e,t,n){let s=n||xt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},xt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Zf,"")}static parseTrackName(e){let t=ep.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);tp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Fe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Be("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Be("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Be("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Be("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Be("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Be("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Be("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;Be("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Be("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Be("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xt.Composite=Zl;xt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};xt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};xt.prototype.GetterByBindingType=[xt.prototype._getValue_direct,xt.prototype._getValue_array,xt.prototype._getValue_arrayElement,xt.prototype._getValue_toArray];xt.prototype.SetterByBindingTypeAndVersioning=[[xt.prototype._setValue_direct,xt.prototype._setValue_direct_setNeedsUpdate,xt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_array,xt.prototype._setValue_array_setNeedsUpdate,xt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_arrayElement,xt.prototype._setValue_arrayElement_setNeedsUpdate,xt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_fromArray,xt.prototype._setValue_fromArray_setNeedsUpdate,xt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var dy=new Float32Array(1);var Jl=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};function Mc(i,e,t,n){let s=np(n);switch(t){case pc:return i*e;case io:return i*e/s.components*s.byteLength;case so:return i*e/s.components*s.byteLength;case pi:return i*e*2/s.components*s.byteLength;case ro:return i*e*2/s.components*s.byteLength;case mc:return i*e*3/s.components*s.byteLength;case on:return i*e*4/s.components*s.byteLength;case ao:return i*e*4/s.components*s.byteLength;case vr:case br:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Mr:case Sr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case lo:case ho:return Math.max(i,16)*Math.max(e,8)/4;case oo:case co:return Math.max(i,8)*Math.max(e,8)/2;case uo:case fo:case mo:case go:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case po:case wr:case xo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case yo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case _o:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case vo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case bo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Mo:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case So:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case wo:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Eo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case To:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Ao:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Co:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ro:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Io:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Po:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Lo:case No:case Do:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Uo:case ko:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Er:case Fo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function np(i){switch(i){case Jt:case hc:return{byteLength:1,components:1};case xs:case dc:case _n:return{byteLength:2,components:1};case to:case no:return{byteLength:2,components:4};case yn:case eo:case an:return{byteLength:4,components:1};case uc:case fc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Fe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function tu(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function sp(i){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),o.onUploadCallback();let m;if(c instanceof Float32Array)m=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=i.SHORT;else if(c instanceof Uint32Array)m=i.UNSIGNED_INT;else if(c instanceof Int32Array)m=i.INT;else if(c instanceof Int8Array)m=i.BYTE;else if(c instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){let h=l.array,d=l.updateRanges;if(i.bindBuffer(c,o),d.length===0)i.bufferSubData(c,0,h);else{d.sort((m,f)=>m.start-f.start);let u=0;for(let m=1;m<d.length;m++){let f=d[u],y=d[m];y.start<=f.start+f.count+1?f.count=Math.max(f.count,y.start+y.count-f.start):(++u,d[u]=y)}d.length=u+1;for(let m=0,f=d.length;m<f;m++){let y=d[m];i.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var rp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ap=`#ifdef USE_ALPHAHASH
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
#endif`,op=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,lp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,cp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,hp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,dp=`#ifdef USE_AOMAP
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
#endif`,up=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,fp=`#ifdef USE_BATCHING
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
#endif`,pp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,mp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,gp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,xp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,yp=`#ifdef USE_IRIDESCENCE
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
#endif`,_p=`#ifdef USE_BUMPMAP
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
#endif`,vp=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,bp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Mp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Sp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,wp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Ep=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Tp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Ap=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Cp=`#define PI 3.141592653589793
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
} // validated`,Rp=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Ip=`vec3 transformedNormal = objectNormal;
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
#endif`,Pp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Lp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Np=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Dp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Up="gl_FragColor = linearToOutputTexel( gl_FragColor );",kp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Fp=`#ifdef USE_ENVMAP
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
#endif`,Op=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Bp=`#ifdef USE_ENVMAP
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
#endif`,zp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Vp=`#ifdef USE_ENVMAP
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
#endif`,Gp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Hp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Wp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Xp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,qp=`#ifdef USE_GRADIENTMAP
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
}`,Yp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Zp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Jp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$p=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Kp=`#ifdef USE_ENVMAP
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
#endif`,jp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Qp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,em=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,tm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,nm=`PhysicalMaterial material;
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
#endif`,im=`uniform sampler2D dfgLUT;
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
}`,sm=`
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
#endif`,rm=`#if defined( RE_IndirectDiffuse )
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
#endif`,am=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,om=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,lm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,cm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,um=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,fm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,pm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,mm=`#if defined( USE_POINTS_UV )
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
#endif`,gm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,xm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ym=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,_m=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,vm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,bm=`#ifdef USE_MORPHTARGETS
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
#endif`,Mm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,wm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Em=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Tm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Am=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Cm=`#ifdef USE_NORMALMAP
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
#endif`,Rm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Im=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Pm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Lm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Nm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Dm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Um=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,km=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Fm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Om=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Bm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,zm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Vm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Gm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Hm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Wm=`float getShadowMask() {
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
}`,Xm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,qm=`#ifdef USE_SKINNING
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
#endif`,Ym=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Zm=`#ifdef USE_SKINNING
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
#endif`,Jm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,$m=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Km=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,jm=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Qm=`#ifdef USE_TRANSMISSION
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
#endif`,e0=`#ifdef USE_TRANSMISSION
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
#endif`,t0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,n0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,i0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,s0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,r0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,a0=`uniform sampler2D t2D;
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
}`,o0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,l0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,c0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,h0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,d0=`#include <common>
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
}`,u0=`#if DEPTH_PACKING == 3200
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
}`,f0=`#define DISTANCE
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
}`,p0=`#define DISTANCE
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
}`,m0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,g0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,x0=`uniform float scale;
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
}`,y0=`uniform vec3 diffuse;
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
}`,_0=`#include <common>
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
}`,v0=`uniform vec3 diffuse;
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
}`,b0=`#define LAMBERT
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
}`,M0=`#define LAMBERT
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
}`,S0=`#define MATCAP
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
}`,w0=`#define MATCAP
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
}`,E0=`#define NORMAL
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
}`,T0=`#define NORMAL
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
}`,A0=`#define PHONG
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
}`,C0=`#define PHONG
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
}`,R0=`#define STANDARD
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
}`,I0=`#define STANDARD
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
}`,P0=`#define TOON
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
}`,L0=`#define TOON
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
}`,N0=`uniform float size;
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
}`,D0=`uniform vec3 diffuse;
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
}`,U0=`#include <common>
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
}`,k0=`uniform vec3 color;
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
}`,F0=`uniform float rotation;
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
}`,O0=`uniform vec3 diffuse;
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
}`,$e={alphahash_fragment:rp,alphahash_pars_fragment:ap,alphamap_fragment:op,alphamap_pars_fragment:lp,alphatest_fragment:cp,alphatest_pars_fragment:hp,aomap_fragment:dp,aomap_pars_fragment:up,batching_pars_vertex:fp,batching_vertex:pp,begin_vertex:mp,beginnormal_vertex:gp,bsdfs:xp,iridescence_fragment:yp,bumpmap_pars_fragment:_p,clipping_planes_fragment:vp,clipping_planes_pars_fragment:bp,clipping_planes_pars_vertex:Mp,clipping_planes_vertex:Sp,color_fragment:wp,color_pars_fragment:Ep,color_pars_vertex:Tp,color_vertex:Ap,common:Cp,cube_uv_reflection_fragment:Rp,defaultnormal_vertex:Ip,displacementmap_pars_vertex:Pp,displacementmap_vertex:Lp,emissivemap_fragment:Np,emissivemap_pars_fragment:Dp,colorspace_fragment:Up,colorspace_pars_fragment:kp,envmap_fragment:Fp,envmap_common_pars_fragment:Op,envmap_pars_fragment:Bp,envmap_pars_vertex:zp,envmap_physical_pars_fragment:Kp,envmap_vertex:Vp,fog_vertex:Gp,fog_pars_vertex:Hp,fog_fragment:Wp,fog_pars_fragment:Xp,gradientmap_pars_fragment:qp,lightmap_pars_fragment:Yp,lights_lambert_fragment:Zp,lights_lambert_pars_fragment:Jp,lights_pars_begin:$p,lights_toon_fragment:jp,lights_toon_pars_fragment:Qp,lights_phong_fragment:em,lights_phong_pars_fragment:tm,lights_physical_fragment:nm,lights_physical_pars_fragment:im,lights_fragment_begin:sm,lights_fragment_maps:rm,lights_fragment_end:am,lightprobes_pars_fragment:om,logdepthbuf_fragment:lm,logdepthbuf_pars_fragment:cm,logdepthbuf_pars_vertex:hm,logdepthbuf_vertex:dm,map_fragment:um,map_pars_fragment:fm,map_particle_fragment:pm,map_particle_pars_fragment:mm,metalnessmap_fragment:gm,metalnessmap_pars_fragment:xm,morphinstance_vertex:ym,morphcolor_vertex:_m,morphnormal_vertex:vm,morphtarget_pars_vertex:bm,morphtarget_vertex:Mm,normal_fragment_begin:Sm,normal_fragment_maps:wm,normal_pars_fragment:Em,normal_pars_vertex:Tm,normal_vertex:Am,normalmap_pars_fragment:Cm,clearcoat_normal_fragment_begin:Rm,clearcoat_normal_fragment_maps:Im,clearcoat_pars_fragment:Pm,iridescence_pars_fragment:Lm,opaque_fragment:Nm,packing:Dm,premultiplied_alpha_fragment:Um,project_vertex:km,dithering_fragment:Fm,dithering_pars_fragment:Om,roughnessmap_fragment:Bm,roughnessmap_pars_fragment:zm,shadowmap_pars_fragment:Vm,shadowmap_pars_vertex:Gm,shadowmap_vertex:Hm,shadowmask_pars_fragment:Wm,skinbase_vertex:Xm,skinning_pars_vertex:qm,skinning_vertex:Ym,skinnormal_vertex:Zm,specularmap_fragment:Jm,specularmap_pars_fragment:$m,tonemapping_fragment:Km,tonemapping_pars_fragment:jm,transmission_fragment:Qm,transmission_pars_fragment:e0,uv_pars_fragment:t0,uv_pars_vertex:n0,uv_vertex:i0,worldpos_vertex:s0,background_vert:r0,background_frag:a0,backgroundCube_vert:o0,backgroundCube_frag:l0,cube_vert:c0,cube_frag:h0,depth_vert:d0,depth_frag:u0,distance_vert:f0,distance_frag:p0,equirect_vert:m0,equirect_frag:g0,linedashed_vert:x0,linedashed_frag:y0,meshbasic_vert:_0,meshbasic_frag:v0,meshlambert_vert:b0,meshlambert_frag:M0,meshmatcap_vert:S0,meshmatcap_frag:w0,meshnormal_vert:E0,meshnormal_frag:T0,meshphong_vert:A0,meshphong_frag:C0,meshphysical_vert:R0,meshphysical_frag:I0,meshtoon_vert:P0,meshtoon_frag:L0,points_vert:N0,points_frag:D0,shadow_vert:U0,shadow_frag:k0,sprite_vert:F0,sprite_frag:O0},ge={common:{diffuse:{value:new Je(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ge}},envmap:{envMap:{value:null},envMapRotation:{value:new Ge},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ge}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ge}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ge},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ge},normalScale:{value:new pe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ge},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ge}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ge}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ge}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Je(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new F},probesMax:{value:new F},probesResolution:{value:new F}},points:{diffuse:{value:new Je(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0},uvTransform:{value:new Ge}},sprite:{diffuse:{value:new Je(16777215)},opacity:{value:1},center:{value:new pe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}}},kn={basic:{uniforms:Ot([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.fog]),vertexShader:$e.meshbasic_vert,fragmentShader:$e.meshbasic_frag},lambert:{uniforms:Ot([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,ge.lights,{emissive:{value:new Je(0)},envMapIntensity:{value:1}}]),vertexShader:$e.meshlambert_vert,fragmentShader:$e.meshlambert_frag},phong:{uniforms:Ot([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,ge.lights,{emissive:{value:new Je(0)},specular:{value:new Je(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:$e.meshphong_vert,fragmentShader:$e.meshphong_frag},standard:{uniforms:Ot([ge.common,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.roughnessmap,ge.metalnessmap,ge.fog,ge.lights,{emissive:{value:new Je(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag},toon:{uniforms:Ot([ge.common,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.gradientmap,ge.fog,ge.lights,{emissive:{value:new Je(0)}}]),vertexShader:$e.meshtoon_vert,fragmentShader:$e.meshtoon_frag},matcap:{uniforms:Ot([ge.common,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,{matcap:{value:null}}]),vertexShader:$e.meshmatcap_vert,fragmentShader:$e.meshmatcap_frag},points:{uniforms:Ot([ge.points,ge.fog]),vertexShader:$e.points_vert,fragmentShader:$e.points_frag},dashed:{uniforms:Ot([ge.common,ge.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$e.linedashed_vert,fragmentShader:$e.linedashed_frag},depth:{uniforms:Ot([ge.common,ge.displacementmap]),vertexShader:$e.depth_vert,fragmentShader:$e.depth_frag},normal:{uniforms:Ot([ge.common,ge.bumpmap,ge.normalmap,ge.displacementmap,{opacity:{value:1}}]),vertexShader:$e.meshnormal_vert,fragmentShader:$e.meshnormal_frag},sprite:{uniforms:Ot([ge.sprite,ge.fog]),vertexShader:$e.sprite_vert,fragmentShader:$e.sprite_frag},background:{uniforms:{uvTransform:{value:new Ge},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$e.background_vert,fragmentShader:$e.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ge}},vertexShader:$e.backgroundCube_vert,fragmentShader:$e.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$e.cube_vert,fragmentShader:$e.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$e.equirect_vert,fragmentShader:$e.equirect_frag},distance:{uniforms:Ot([ge.common,ge.displacementmap,{referencePosition:{value:new F},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:$e.distance_vert,fragmentShader:$e.distance_frag},shadow:{uniforms:Ot([ge.lights,ge.fog,{color:{value:new Je(0)},opacity:{value:1}}]),vertexShader:$e.shadow_vert,fragmentShader:$e.shadow_frag}};kn.physical={uniforms:Ot([kn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ge},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ge},clearcoatNormalScale:{value:new pe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ge},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ge},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ge},sheen:{value:0},sheenColor:{value:new Je(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ge},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ge},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ge},transmissionSamplerSize:{value:new pe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ge},attenuationDistance:{value:0},attenuationColor:{value:new Je(0)},specularColor:{value:new Je(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ge},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ge},anisotropyVector:{value:new pe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ge}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag};var Vo={r:0,b:0,g:0},B0=new ut,nu=new Ge;nu.set(-1,0,0,0,1,0,0,0,1);function z0(i,e,t,n,s,r){let a=new Je(0),o=s===!0?0:1,l,c,h=null,d=0,u=null;function m(M){let S=M.isScene===!0?M.background:null;if(S&&S.isTexture){let v=M.backgroundBlurriness>0;S=e.get(S,v)}return S}function f(M){let S=!1,v=m(M);v===null?p(a,o):v&&v.isColor&&(p(v,1),S=!0);let E=i.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||S)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function y(M,S){let v=m(S);v&&(v.isCubeTexture||v.mapping===yr)?(c===void 0&&(c=new Ft(new Pn(1,1,1),new en({name:"BackgroundCubeMaterial",uniforms:Li(kn.backgroundCube.uniforms),vertexShader:kn.backgroundCube.vertexShader,fragmentShader:kn.backgroundCube.fragmentShader,side:Vt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,w,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(B0.makeRotationFromEuler(S.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(nu),c.material.toneMapped=tt.getTransfer(v.colorSpace)!==lt,(h!==v||d!==v.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,h=v,d=v.version,u=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Ft(new lr(2,2),new en({name:"BackgroundMaterial",uniforms:Li(kn.background.uniforms),vertexShader:kn.background.vertexShader,fragmentShader:kn.background.fragmentShader,side:di,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=tt.getTransfer(v.colorSpace)!==lt,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||d!==v.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,h=v,d=v.version,u=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function p(M,S){M.getRGB(Vo,_c(i)),t.buffers.color.setClear(Vo.r,Vo.g,Vo.b,S,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,S=1){a.set(M),o=S,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,p(a,o)},render:f,addToRenderList:y,dispose:g}}function V0(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(C,N,B,I,U){let H=!1,Y=d(C,I,B,N);r!==Y&&(r=Y,c(r.object)),H=m(C,I,B,U),H&&f(C,I,B,U),U!==null&&e.update(U,i.ELEMENT_ARRAY_BUFFER),(H||a)&&(a=!1,v(C,N,B,I),U!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(U).buffer))}function l(){return i.createVertexArray()}function c(C){return i.bindVertexArray(C)}function h(C){return i.deleteVertexArray(C)}function d(C,N,B,I){let U=I.wireframe===!0,H=n[N.id];H===void 0&&(H={},n[N.id]=H);let Y=C.isInstancedMesh===!0?C.id:0,X=H[Y];X===void 0&&(X={},H[Y]=X);let z=X[B.id];z===void 0&&(z={},X[B.id]=z);let q=z[U];return q===void 0&&(q=u(l()),z[U]=q),q}function u(C){let N=[],B=[],I=[];for(let U=0;U<t;U++)N[U]=0,B[U]=0,I[U]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:B,attributeDivisors:I,object:C,attributes:{},index:null}}function m(C,N,B,I){let U=r.attributes,H=N.attributes,Y=0,X=B.getAttributes();for(let z in X)if(X[z].location>=0){let j=U[z],Se=H[z];if(Se===void 0&&(z==="instanceMatrix"&&C.instanceMatrix&&(Se=C.instanceMatrix),z==="instanceColor"&&C.instanceColor&&(Se=C.instanceColor)),j===void 0||j.attribute!==Se||Se&&j.data!==Se.data)return!0;Y++}return r.attributesNum!==Y||r.index!==I}function f(C,N,B,I){let U={},H=N.attributes,Y=0,X=B.getAttributes();for(let z in X)if(X[z].location>=0){let j=H[z];j===void 0&&(z==="instanceMatrix"&&C.instanceMatrix&&(j=C.instanceMatrix),z==="instanceColor"&&C.instanceColor&&(j=C.instanceColor));let Se={};Se.attribute=j,j&&j.data&&(Se.data=j.data),U[z]=Se,Y++}r.attributes=U,r.attributesNum=Y,r.index=I}function y(){let C=r.newAttributes;for(let N=0,B=C.length;N<B;N++)C[N]=0}function p(C){g(C,0)}function g(C,N){let B=r.newAttributes,I=r.enabledAttributes,U=r.attributeDivisors;B[C]=1,I[C]===0&&(i.enableVertexAttribArray(C),I[C]=1),U[C]!==N&&(i.vertexAttribDivisor(C,N),U[C]=N)}function M(){let C=r.newAttributes,N=r.enabledAttributes;for(let B=0,I=N.length;B<I;B++)N[B]!==C[B]&&(i.disableVertexAttribArray(B),N[B]=0)}function S(C,N,B,I,U,H,Y){Y===!0?i.vertexAttribIPointer(C,N,B,U,H):i.vertexAttribPointer(C,N,B,I,U,H)}function v(C,N,B,I){y();let U=I.attributes,H=B.getAttributes(),Y=N.defaultAttributeValues;for(let X in H){let z=H[X];if(z.location>=0){let q=U[X];if(q===void 0&&(X==="instanceMatrix"&&C.instanceMatrix&&(q=C.instanceMatrix),X==="instanceColor"&&C.instanceColor&&(q=C.instanceColor)),q!==void 0){let j=q.normalized,Se=q.itemSize,be=e.get(q);if(be===void 0)continue;let nt=be.buffer,Ye=be.type,et=be.bytesPerElement,J=Ye===i.INT||Ye===i.UNSIGNED_INT||q.gpuType===eo;if(q.isInterleavedBufferAttribute){let ee=q.data,xe=ee.stride,Oe=q.offset;if(ee.isInstancedInterleavedBuffer){for(let Me=0;Me<z.locationSize;Me++)g(z.location+Me,ee.meshPerAttribute);C.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Me=0;Me<z.locationSize;Me++)p(z.location+Me);i.bindBuffer(i.ARRAY_BUFFER,nt);for(let Me=0;Me<z.locationSize;Me++)S(z.location+Me,Se/z.locationSize,Ye,j,xe*et,(Oe+Se/z.locationSize*Me)*et,J)}else{if(q.isInstancedBufferAttribute){for(let ee=0;ee<z.locationSize;ee++)g(z.location+ee,q.meshPerAttribute);C.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let ee=0;ee<z.locationSize;ee++)p(z.location+ee);i.bindBuffer(i.ARRAY_BUFFER,nt);for(let ee=0;ee<z.locationSize;ee++)S(z.location+ee,Se/z.locationSize,Ye,j,Se*et,Se/z.locationSize*ee*et,J)}}else if(Y!==void 0){let j=Y[X];if(j!==void 0)switch(j.length){case 2:i.vertexAttrib2fv(z.location,j);break;case 3:i.vertexAttrib3fv(z.location,j);break;case 4:i.vertexAttrib4fv(z.location,j);break;default:i.vertexAttrib1fv(z.location,j)}}}}M()}function E(){T();for(let C in n){let N=n[C];for(let B in N){let I=N[B];for(let U in I){let H=I[U];for(let Y in H)h(H[Y].object),delete H[Y];delete I[U]}}delete n[C]}}function w(C){if(n[C.id]===void 0)return;let N=n[C.id];for(let B in N){let I=N[B];for(let U in I){let H=I[U];for(let Y in H)h(H[Y].object),delete H[Y];delete I[U]}}delete n[C.id]}function R(C){for(let N in n){let B=n[N];for(let I in B){let U=B[I];if(U[C.id]===void 0)continue;let H=U[C.id];for(let Y in H)h(H[Y].object),delete H[Y];delete U[C.id]}}}function _(C){for(let N in n){let B=n[N],I=C.isInstancedMesh===!0?C.id:0,U=B[I];if(U!==void 0){for(let H in U){let Y=U[H];for(let X in Y)h(Y[X].object),delete Y[X];delete U[H]}delete B[I],Object.keys(B).length===0&&delete n[N]}}}function T(){P(),a=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:T,resetDefaultState:P,dispose:E,releaseStatesOfGeometry:w,releaseStatesOfObject:_,releaseStatesOfProgram:R,initAttributes:y,enableAttribute:p,disableUnusedAttributes:M}}function G0(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let u=0;for(let m=0;m<h;m++)u+=c[m];t.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function H0(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let R=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==on&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let _=R===_n&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==Jt&&R!==an&&!_&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Fe("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Fe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),w=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:m,maxVertexTextures:f,maxTextureSize:y,maxCubemapSize:p,maxAttributes:g,maxVertexUniforms:M,maxVaryings:S,maxFragmentUniforms:v,maxSamples:E,samples:w}}function W0(i){let e=this,t=null,n=0,s=!1,r=!1,a=new mn,o=new Ge,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let m=d.length!==0||u||n!==0||s;return s=u,n=d.length,m},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,m){let f=d.clippingPlanes,y=d.clipIntersection,p=d.clipShadows,g=i.get(d);if(!s||f===null||f.length===0||r&&!p)r?h(null):c();else{let M=r?0:n,S=M*4,v=g.clippingState||null;l.value=v,v=h(f,u,S,m);for(let E=0;E!==S;++E)v[E]=t[E];g.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(d,u,m,f){let y=d!==null?d.length:0,p=null;if(y!==0){if(p=l.value,f!==!0||p===null){let g=m+y*4,M=u.matrixWorldInverse;o.getNormalMatrix(M),(p===null||p.length<g)&&(p=new Float32Array(g));for(let S=0,v=m;S!==y;++S,v+=4)a.copy(d[S]).applyMatrix4(M,o),a.normal.toArray(p,v),p[v+3]=a.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,p}}var bs=4,X0=6,q0=20,Y0=256,Tr=new hi,Dd=new Je,Sc=null,wc=0,Ec=0,Tc=!1,Z0=new F,Ni=new F,Ho=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=Z0}=r;Sc=this._renderer.getRenderTarget(),wc=this._renderer.getActiveCubeFace(),Ec=this._renderer.getActiveMipmapLevel(),Tc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Fd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=kd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Sc,wc,Ec),this._renderer.xr.enabled=Tc,e.scissorTest=!1,vs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ui||e.mapping===Pi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Sc=this._renderer.getRenderTarget(),wc=this._renderer.getActiveCubeFace(),Ec=this._renderer.getActiveMipmapLevel(),Tc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Tt,minFilter:Tt,generateMipmaps:!1,type:_n,format:on,colorSpace:Bs,depthBuffer:!1},s=Ud(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ud(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=J0(r)),this._blurMaterial=K0(r,e,t),this._ggxMaterial=$0(r,e,t)}return s}_compileMaterial(e){let t=new Ft(new Zt,e);this._renderer.compile(t,Tr)}_sceneToCubeUV(e,t,n,s,r){let l=new Wt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,m=d.toneMapping;d.getClearColor(Dd),d.toneMapping=xn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ft(new Pn,new Zs({name:"PMREM.Background",side:Vt,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,p=y.material,g=!1,M=e.background;M?M.isColor&&(p.color.copy(M),e.background=null,g=!0):(p.color.copy(Dd),g=!0);for(let S=0;S<6;S++){let v=S%3;v===0?(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[S],r.y,r.z)):v===1?(l.up.set(0,0,c[S]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[S],r.z)):(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[S]));let E=this._cubeSize;vs(s,v*E,S>2?E:0,E,E),d.setRenderTarget(s),g&&d.render(y,l),d.render(e,l)}d.toneMapping=m,d.autoClear=u,e.background=M}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===ui||e.mapping===Pi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Fd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=kd());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;vs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Tr)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,m=d*u,{_lodMax:f}=this,y=this._sizeLods[n],p=3*y*(n>f-bs?n-f+bs:0),g=4*(this._cubeSize-y);l.envMap.value=e.texture,l.roughness.value=m,l.mipInt.value=f-t,vs(r,p,g,3*y,2*y),s.setRenderTarget(r),s.render(o,Tr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=f-n,vs(e,p,g,3*y,2*y),s.setRenderTarget(e),s.render(o,Tr)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[s],d=3*h*(s>this._lodMax-bs?s-this._lodMax+bs:0),u=4*(this._cubeSize-h);vs(t,d,u,3*h,2*h),a.setRenderTarget(t),a.render(l,Tr)}};function J0(i){let e=[],t=[],n=i,s=i-bs+1+X0;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,m=3,f=new Float32Array(m*u*d),y=new Float32Array(m*u*d);for(let g=0;g<d;g++){let M=g%3*2/3-1,S=g>2?0:-1,v=[M,S,0,M+2/3,S,0,M+2/3,S+1,0,M,S,0,M+2/3,S+1,0,M,S+1,0];f.set(v,m*u*g);for(let E=0;E<u;E++){let w=h[E*2]*2-1,R=h[E*2+1]*2-1;g===0?Ni.set(1,R,w):g===1?Ni.set(-w,1,-R):g===2?Ni.set(-w,R,1):g===3?Ni.set(-1,R,-w):g===4?Ni.set(-w,-1,R):Ni.set(w,R,-1),Ni.toArray(y,(g*u+E)*m)}}let p=new Zt;p.setAttribute("position",new jt(f,m)),p.setAttribute("outputDirection",new jt(y,m)),t.push(new Ft(p,null)),n>bs&&n--}return{lodMeshes:t,sizeLods:e}}function Ud(i,e,t){let n=new Yt(i,e,t);return n.texture.mapping=yr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function vs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function $0(i,e,t){return new en({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Y0,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:qo(),fragmentShader:`

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
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function K0(i,e,t){return new en({name:"SphericalGaussianBlur",defines:{SAMPLES:q0,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:qo(),fragmentShader:`

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
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function kd(){return new en({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:qo(),fragmentShader:`

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
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function Fd(){return new en({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:qo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Nn,depthTest:!1,depthWrite:!1})}function qo(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Wo=class extends Yt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new $s(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Pn(5,5,5),r=new en({name:"CubemapFromEquirect",uniforms:Li(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Vt,blending:Nn});r.uniforms.tEquirect.value=t;let a=new Ft(s,r),o=t.minFilter;return t.minFilter===Dn&&(t.minFilter=Tt),new Za(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function j0(i){let e=new WeakMap,t=new WeakMap,n=null;function s(u,m=!1){return u==null?null:m?a(u):r(u)}function r(u){if(u&&u.isTexture){let m=u.mapping;if(m===Ka||m===ja)if(e.has(u)){let f=e.get(u).texture;return o(f,u.mapping)}else{let f=u.image;if(f&&f.height>0){let y=new Wo(f.height);return y.fromEquirectangularTexture(i,u),e.set(u,y),u.addEventListener("dispose",c),o(y.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let m=u.mapping,f=m===Ka||m===ja,y=m===ui||m===Pi;if(f||y){let p=t.get(u),g=p!==void 0?p.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==g)return n===null&&(n=new Ho(i)),p=f?n.fromEquirectangular(u,p):n.fromCubemap(u,p),p.texture.pmremVersion=u.pmremVersion,t.set(u,p),p.texture;if(p!==void 0)return p.texture;{let M=u.image;return f&&M&&M.height>0||y&&M&&l(M)?(n===null&&(n=new Ho(i)),p=f?n.fromEquirectangular(u):n.fromCubemap(u),p.texture.pmremVersion=u.pmremVersion,t.set(u,p),u.addEventListener("dispose",h),p.texture):null}}}return u}function o(u,m){return m===Ka?u.mapping=ui:m===ja&&(u.mapping=Pi),u}function l(u){let m=0,f=6;for(let y=0;y<f;y++)u[y]!==void 0&&m++;return m===f}function c(u){let m=u.target;m.removeEventListener("dispose",c);let f=e.get(m);f!==void 0&&(e.delete(m),f.dispose())}function h(u){let m=u.target;m.removeEventListener("dispose",h);let f=t.get(m);f!==void 0&&(t.delete(m),f.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function Q0(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Ti("WebGLRenderer: "+n+" extension not supported."),s}}}function eg(i,e,t,n){let s={},r=new WeakMap;function a(d){let u=d.target;u.index!==null&&e.remove(u.index);for(let f in u.attributes)e.remove(u.attributes[f]);u.removeEventListener("dispose",a),delete s[u.id];let m=r.get(u);m&&(e.remove(m),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(d,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,t.memory.geometries++),u}function l(d){let u=d.attributes;for(let m in u)e.update(u[m],i.ARRAY_BUFFER)}function c(d){let u=[],m=d.index,f=d.attributes.position,y=0;if(f===void 0)return;if(m!==null){let M=m.array;y=m.version;for(let S=0,v=M.length;S<v;S+=3){let E=M[S+0],w=M[S+1],R=M[S+2];u.push(E,w,w,R,R,E)}}else{let M=f.array;y=f.version;for(let S=0,v=M.length/3-1;S<v;S+=3){let E=S+0,w=S+1,R=S+2;u.push(E,w,w,R,R,E)}}let p=new(f.count>=65535?Ys:qs)(u,1);p.version=y;let g=r.get(d);g&&e.remove(g),r.set(d,p)}function h(d){let u=r.get(d);if(u){let m=d.index;m!==null&&u.version<m.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function tg(i,e,t){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,u){i.drawElements(n,u,r,d*a),t.update(u,n,1)}function c(d,u,m){m!==0&&(i.drawElementsInstanced(n,u,r,d*a,m),t.update(u,n,m))}function h(d,u,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,d,0,m);let y=0;for(let p=0;p<m;p++)y+=u[p];t.update(y,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function ng(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Be("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function ig(i,e,t){let n=new WeakMap,s=new yt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=n.get(o);if(u===void 0||u.count!==d){let T=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",T)};u!==void 0&&u.texture.dispose();let m=o.morphAttributes.position!==void 0,f=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],S=0;m===!0&&(S=1),f===!0&&(S=2),y===!0&&(S=3);let v=o.attributes.position.count*S,E=1;v>e.maxTextureSize&&(E=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let w=new Float32Array(v*E*4*d),R=new Gs(w,v,E,d);R.type=an,R.needsUpdate=!0;let _=S*4;for(let P=0;P<d;P++){let C=p[P],N=g[P],B=M[P],I=v*E*4*P;for(let U=0;U<C.count;U++){let H=U*_;m===!0&&(s.fromBufferAttribute(C,U),w[I+H+0]=s.x,w[I+H+1]=s.y,w[I+H+2]=s.z,w[I+H+3]=0),f===!0&&(s.fromBufferAttribute(N,U),w[I+H+4]=s.x,w[I+H+5]=s.y,w[I+H+6]=s.z,w[I+H+7]=0),y===!0&&(s.fromBufferAttribute(B,U),w[I+H+8]=s.x,w[I+H+9]=s.y,w[I+H+10]=s.z,w[I+H+11]=B.itemSize===4?s.w:1)}}u={count:d,texture:R,size:new pe(v,E)},n.set(o,u),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let m=0;for(let y=0;y<c.length;y++)m+=c[y];let f=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(i,"morphTargetBaseInfluence",f),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function sg(i,e,t,n,s){let r=new WeakMap;function a(c){let h=s.render.frame,d=c.geometry,u=e.get(c,d);if(r.get(u)!==h&&(e.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let m=c.skeleton;r.get(m)!==h&&(m.update(),r.set(m,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var rg={[ic]:"LINEAR_TONE_MAPPING",[sc]:"REINHARD_TONE_MAPPING",[rc]:"CINEON_TONE_MAPPING",[xr]:"ACES_FILMIC_TONE_MAPPING",[oc]:"AGX_TONE_MAPPING",[lc]:"NEUTRAL_TONE_MAPPING",[ac]:"CUSTOM_TONE_MAPPING"};function ag(i,e,t,n,s,r){let a=new Yt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Zt;c.setAttribute("position",new vt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new vt([0,2,0,0,2,0],2));let h=new Da({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new Ft(c,h),u=new hi(-1,1,1,-1,0,1),m=null,f=null,y=!1,p,g=null,M=[],S=!1;this.setSize=function(v,E){a.setSize(v,E),o!==null&&o.setSize(v,E),l!==null&&l.setSize(v,E);for(let w=0;w<M.length;w++){let R=M[w];R.setSize&&R.setSize(v,E)}},this.setEffects=function(v){M=v,S=M.length>0&&M[0].isRenderPass===!0;let E=a.width,w=a.height;M.length>0&&o===null&&(o=new Yt(E,w,{type:_n,depthBuffer:!1,stencilBuffer:!1}),l=new Yt(E,w,{type:_n,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<M.length;R++){let _=M[R];_.setSize&&_.setSize(E,w)}},this.begin=function(v,E){if(y||v.toneMapping===xn&&M.length===0)return!1;if(g=E,E!==null){let w=E.width,R=E.height;(a.width!==w||a.height!==R)&&this.setSize(w,R)}return S===!1&&v.setRenderTarget(a),p=v.toneMapping,v.toneMapping=xn,!0},this.hasRenderPass=function(){return S},this.end=function(v,E){v.toneMapping=p,y=!0;let w=a,R=o;for(let _=0;_<M.length;_++){let T=M[_];T.enabled!==!1&&(T.render(v,R,w,E),T.needsSwap!==!1&&(w=R,R=R===o?l:o))}if(m!==v.outputColorSpace||f!==v.toneMapping){m=v.outputColorSpace,f=v.toneMapping,h.defines={},tt.getTransfer(m)===lt&&(h.defines.SRGB_TRANSFER="");let _=rg[f];_&&(h.defines[_]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=w.texture,v.setRenderTarget(g),v.render(d,u),g=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var iu=new qt,Rc=new ai(1,1),su=new Gs,ru=new Ea,au=new $s,Od=[],Bd=[],zd=new Float32Array(16),Vd=new Float32Array(9),Gd=new Float32Array(4);function Ss(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Od[s];if(r===void 0&&(r=new Float32Array(s),Od[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function At(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Ct(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Yo(i,e){let t=Bd[e];t===void 0&&(t=new Int32Array(e),Bd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function og(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function lg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;i.uniform2fv(this.addr,e),Ct(t,e)}}function cg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(At(t,e))return;i.uniform3fv(this.addr,e),Ct(t,e)}}function hg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;i.uniform4fv(this.addr,e),Ct(t,e)}}function dg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(At(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Ct(t,e)}else{if(At(t,n))return;Gd.set(n),i.uniformMatrix2fv(this.addr,!1,Gd),Ct(t,n)}}function ug(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(At(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Ct(t,e)}else{if(At(t,n))return;Vd.set(n),i.uniformMatrix3fv(this.addr,!1,Vd),Ct(t,n)}}function fg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(At(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Ct(t,e)}else{if(At(t,n))return;zd.set(n),i.uniformMatrix4fv(this.addr,!1,zd),Ct(t,n)}}function pg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function mg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;i.uniform2iv(this.addr,e),Ct(t,e)}}function gg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(At(t,e))return;i.uniform3iv(this.addr,e),Ct(t,e)}}function xg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;i.uniform4iv(this.addr,e),Ct(t,e)}}function yg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function _g(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;i.uniform2uiv(this.addr,e),Ct(t,e)}}function vg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(At(t,e))return;i.uniform3uiv(this.addr,e),Ct(t,e)}}function bg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;i.uniform4uiv(this.addr,e),Ct(t,e)}}function Mg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Rc.compareFunction=t.isReversedDepthBuffer()?zo:Bo,r=Rc):r=iu,t.setTexture2D(e||r,s)}function Sg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||ru,s)}function wg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||au,s)}function Eg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||su,s)}function Tg(i){switch(i){case 5126:return og;case 35664:return lg;case 35665:return cg;case 35666:return hg;case 35674:return dg;case 35675:return ug;case 35676:return fg;case 5124:case 35670:return pg;case 35667:case 35671:return mg;case 35668:case 35672:return gg;case 35669:case 35673:return xg;case 5125:return yg;case 36294:return _g;case 36295:return vg;case 36296:return bg;case 35678:case 36198:case 36298:case 36306:case 35682:return Mg;case 35679:case 36299:case 36307:return Sg;case 35680:case 36300:case 36308:case 36293:return wg;case 36289:case 36303:case 36311:case 36292:return Eg}}function Ag(i,e){i.uniform1fv(this.addr,e)}function Cg(i,e){let t=Ss(e,this.size,2);i.uniform2fv(this.addr,t)}function Rg(i,e){let t=Ss(e,this.size,3);i.uniform3fv(this.addr,t)}function Ig(i,e){let t=Ss(e,this.size,4);i.uniform4fv(this.addr,t)}function Pg(i,e){let t=Ss(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Lg(i,e){let t=Ss(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Ng(i,e){let t=Ss(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Dg(i,e){i.uniform1iv(this.addr,e)}function Ug(i,e){i.uniform2iv(this.addr,e)}function kg(i,e){i.uniform3iv(this.addr,e)}function Fg(i,e){i.uniform4iv(this.addr,e)}function Og(i,e){i.uniform1uiv(this.addr,e)}function Bg(i,e){i.uniform2uiv(this.addr,e)}function zg(i,e){i.uniform3uiv(this.addr,e)}function Vg(i,e){i.uniform4uiv(this.addr,e)}function Gg(i,e,t){let n=this.cache,s=e.length,r=Yo(t,s);At(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Rc:a=iu;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Hg(i,e,t){let n=this.cache,s=e.length,r=Yo(t,s);At(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||ru,r[a])}function Wg(i,e,t){let n=this.cache,s=e.length,r=Yo(t,s);At(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||au,r[a])}function Xg(i,e,t){let n=this.cache,s=e.length,r=Yo(t,s);At(n,r)||(i.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||su,r[a])}function qg(i){switch(i){case 5126:return Ag;case 35664:return Cg;case 35665:return Rg;case 35666:return Ig;case 35674:return Pg;case 35675:return Lg;case 35676:return Ng;case 5124:case 35670:return Dg;case 35667:case 35671:return Ug;case 35668:case 35672:return kg;case 35669:case 35673:return Fg;case 5125:return Og;case 36294:return Bg;case 36295:return zg;case 36296:return Vg;case 35678:case 36198:case 36298:case 36306:case 35682:return Gg;case 35679:case 36299:case 36307:return Hg;case 35680:case 36300:case 36308:case 36293:return Wg;case 36289:case 36303:case 36311:case 36292:return Xg}}var Ic=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Tg(t.type)}},Pc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=qg(t.type)}},Lc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Ac=/(\w+)(\])?(\[|\.)?/g;function Hd(i,e){i.seq.push(e),i.map[e.id]=e}function Yg(i,e,t){let n=i.name,s=n.length;for(Ac.lastIndex=0;;){let r=Ac.exec(n),a=Ac.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Hd(t,c===void 0?new Ic(o,i,e):new Pc(o,i,e));break}else{let d=t.map[o];d===void 0&&(d=new Lc(o),Hd(t,d)),t=d}}}var Ms=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Yg(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Wd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Zg=37297,Jg=0;function $g(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var Xd=new Ge;function Kg(i){tt._getMatrix(Xd,tt.workingColorSpace,i);let e=`mat3( ${Xd.elements.map(t=>t.toFixed(4))} )`;switch(tt.getTransfer(i)){case zs:return[e,"LinearTransferOETF"];case lt:return[e,"sRGBTransferOETF"];default:return Fe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function qd(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+$g(i.getShaderSource(e),o)}else return r}function jg(i,e){let t=Kg(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Qg={[ic]:"Linear",[sc]:"Reinhard",[rc]:"Cineon",[xr]:"ACESFilmic",[oc]:"AgX",[lc]:"Neutral",[ac]:"Custom"};function ex(i,e){let t=Qg[e];return t===void 0?(Fe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Go=new F;function tx(){tt.getLuminanceCoefficients(Go);let i=Go.x.toFixed(4),e=Go.y.toFixed(4),t=Go.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function nx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Cr).join(`
`)}function ix(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function sx(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Cr(i){return i!==""}function Yd(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Zd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var rx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nc(i){return i.replace(rx,ox)}var ax=new Map;function ox(i,e){let t=$e[e];if(t===void 0){let n=ax.get(e);if(n!==void 0)t=$e[n],Fe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Nc(t)}var lx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Jd(i){return i.replace(lx,cx)}function cx(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function $d(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var hx={[gr]:"SHADOWMAP_TYPE_PCF",[ms]:"SHADOWMAP_TYPE_VSM"};function dx(i){return hx[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var ux={[ui]:"ENVMAP_TYPE_CUBE",[Pi]:"ENVMAP_TYPE_CUBE",[yr]:"ENVMAP_TYPE_CUBE_UV"};function fx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":ux[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var px={[Pi]:"ENVMAP_MODE_REFRACTION"};function mx(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":px[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var gx={[nc]:"ENVMAP_BLENDING_MULTIPLY",[cd]:"ENVMAP_BLENDING_MIX",[hd]:"ENVMAP_BLENDING_ADD"};function xx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":gx[i.combine]||"ENVMAP_BLENDING_NONE"}function yx(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function _x(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=dx(t),c=fx(t),h=mx(t),d=xx(t),u=yx(t),m=nx(t),f=ix(r),y=s.createProgram(),p,g,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(Cr).join(`
`),p.length>0&&(p+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(Cr).join(`
`),g.length>0&&(g+=`
`)):(p=[$d(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Cr).join(`
`),g=[$d(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==xn?"#define TONE_MAPPING":"",t.toneMapping!==xn?$e.tonemapping_pars_fragment:"",t.toneMapping!==xn?ex("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",$e.colorspace_pars_fragment,jg("linearToOutputTexel",t.outputColorSpace),tx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Cr).join(`
`)),a=Nc(a),a=Yd(a,t),a=Zd(a,t),o=Nc(o),o=Yd(o,t),o=Zd(o,t),a=Jd(a),o=Jd(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,g=["#define varying in",t.glslVersion===gc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===gc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let S=M+p+a,v=M+g+o,E=Wd(s,s.VERTEX_SHADER,S),w=Wd(s,s.FRAGMENT_SHADER,v);s.attachShader(y,E),s.attachShader(y,w),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function R(C){if(i.debug.checkShaderErrors){let N=s.getProgramInfoLog(y)||"",B=s.getShaderInfoLog(E)||"",I=s.getShaderInfoLog(w)||"",U=N.trim(),H=B.trim(),Y=I.trim(),X=!0,z=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(X=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,E,w);else{let q=qd(s,E,"vertex"),j=qd(s,w,"fragment");Be("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+U+`
`+q+`
`+j)}else U!==""?Fe("WebGLProgram: Program Info Log:",U):(H===""||Y==="")&&(z=!1);z&&(C.diagnostics={runnable:X,programLog:U,vertexShader:{log:H,prefix:p},fragmentShader:{log:Y,prefix:g}})}s.deleteShader(E),s.deleteShader(w),_=new Ms(s,y),T=sx(s,y)}let _;this.getUniforms=function(){return _===void 0&&R(this),_};let T;this.getAttributes=function(){return T===void 0&&R(this),T};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(y,Zg)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Jg++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=E,this.fragmentShader=w,this}var vx=0,Dc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Uc(e),t.set(e,n)),n}},Uc=class{constructor(e){this.id=vx++,this.code=e,this.usedTimes=0}};function bx(i){return i===pi||i===wr||i===Er}function Mx(i,e,t,n,s,r){let a=new Hs,o=new Dc,l=new Set,c=[],h=new Map,d=n.logarithmicDepthBuffer,u=n.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(_){return l.add(_),_===0?"uv":`uv${_}`}function y(_,T,P,C,N,B){let I=C.fog,U=N.geometry,H=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?C.environment:null,Y=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,X=e.get(_.envMap||H,Y),z=X&&X.mapping===yr?X.image.height:null,q=m[_.type];_.precision!==null&&(u=n.getMaxPrecision(_.precision),u!==_.precision&&Fe("WebGLProgram.getParameters:",_.precision,"not supported, using",u,"instead."));let j=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,Se=j!==void 0?j.length:0,be=0;U.morphAttributes.position!==void 0&&(be=1),U.morphAttributes.normal!==void 0&&(be=2),U.morphAttributes.color!==void 0&&(be=3);let nt,Ye,et,J;if(q){let ft=kn[q];nt=ft.vertexShader,Ye=ft.fragmentShader}else{nt=_.vertexShader,Ye=_.fragmentShader;let ft=o.getVertexShaderStage(_),at=o.getFragmentShaderStage(_);o.update(_,ft,at),et=ft.id,J=at.id}let ee=i.getRenderTarget(),xe=i.state.buffers.depth.getReversed(),Oe=N.isInstancedMesh===!0,Me=N.isBatchedMesh===!0,ze=!!_.map,ct=!!_.matcap,ne=!!X,se=!!_.aoMap,re=!!_.lightMap,ae=!!_.bumpMap&&_.wireframe===!1,ce=!!_.normalMap,Ue=!!_.displacementMap,De=!!_.emissiveMap,Ve=!!_.metalnessMap,He=!!_.roughnessMap,L=_.anisotropy>0,rt=_.clearcoat>0,Ke=_.dispersion>0,A=_.retroreflectivity>0,x=_.iridescence>0,O=_.sheen>0,W=_.transmission>0,$=L&&!!_.anisotropyMap,oe=rt&&!!_.clearcoatMap,le=rt&&!!_.clearcoatNormalMap,K=rt&&!!_.clearcoatRoughnessMap,te=x&&!!_.iridescenceMap,he=x&&!!_.iridescenceThicknessMap,Pe=O&&!!_.sheenColorMap,me=O&&!!_.sheenRoughnessMap,de=!!_.specularMap,Le=!!_.specularColorMap,ke=!!_.specularIntensityMap,We=W&&!!_.transmissionMap,k=W&&!!_.thicknessMap,ue=!!_.gradientMap,Q=!!_.alphaMap,fe=_.alphaTest>0,ve=!!_.alphaHash,ie=!!_.extensions,Ne=xn;_.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Ne=i.toneMapping);let Re={shaderID:q,shaderType:_.type,shaderName:_.name,vertexShader:nt,fragmentShader:Ye,defines:_.defines,customVertexShaderID:et,customFragmentShaderID:J,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:u,batching:Me,batchingColor:Me&&N._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&N.instanceColor!==null,instancingMorph:Oe&&N.morphTexture!==null,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:tt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:ze,matcap:ct,envMap:ne,envMapMode:ne&&X.mapping,envMapCubeUVHeight:z,aoMap:se,lightMap:re,bumpMap:ae,normalMap:ce,displacementMap:Ue,emissiveMap:De,normalMapObjectSpace:ce&&_.normalMapType===fd,normalMapTangentSpace:ce&&_.normalMapType===Oo,packedNormalMap:ce&&_.normalMapType===Oo&&bx(_.normalMap.format),metalnessMap:Ve,roughnessMap:He,anisotropy:L,anisotropyMap:$,clearcoat:rt,clearcoatMap:oe,clearcoatNormalMap:le,clearcoatRoughnessMap:K,dispersion:Ke,retroreflection:A,iridescence:x,iridescenceMap:te,iridescenceThicknessMap:he,sheen:O,sheenColorMap:Pe,sheenRoughnessMap:me,specularMap:de,specularColorMap:Le,specularIntensityMap:ke,transmission:W,transmissionMap:We,thicknessMap:k,gradientMap:ue,opaque:_.transparent===!1&&_.blending===gs&&_.alphaToCoverage===!1,alphaMap:Q,alphaTest:fe,alphaHash:ve,combine:_.combine,mapUv:ze&&f(_.map.channel),aoMapUv:se&&f(_.aoMap.channel),lightMapUv:re&&f(_.lightMap.channel),bumpMapUv:ae&&f(_.bumpMap.channel),normalMapUv:ce&&f(_.normalMap.channel),displacementMapUv:Ue&&f(_.displacementMap.channel),emissiveMapUv:De&&f(_.emissiveMap.channel),metalnessMapUv:Ve&&f(_.metalnessMap.channel),roughnessMapUv:He&&f(_.roughnessMap.channel),anisotropyMapUv:$&&f(_.anisotropyMap.channel),clearcoatMapUv:oe&&f(_.clearcoatMap.channel),clearcoatNormalMapUv:le&&f(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:K&&f(_.clearcoatRoughnessMap.channel),iridescenceMapUv:te&&f(_.iridescenceMap.channel),iridescenceThicknessMapUv:he&&f(_.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&f(_.sheenColorMap.channel),sheenRoughnessMapUv:me&&f(_.sheenRoughnessMap.channel),specularMapUv:de&&f(_.specularMap.channel),specularColorMapUv:Le&&f(_.specularColorMap.channel),specularIntensityMapUv:ke&&f(_.specularIntensityMap.channel),transmissionMapUv:We&&f(_.transmissionMap.channel),thicknessMapUv:k&&f(_.thicknessMap.channel),alphaMapUv:Q&&f(_.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(ce||L),vertexNormals:!!U.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!U.attributes.uv&&(ze||Q),fog:!!I,useFog:_.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||U.attributes.normal===void 0&&ce===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:xe,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:Se,morphTextureStride:be,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:B.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ne,decodeVideoTexture:ze&&_.map.isVideoTexture===!0&&tt.getTransfer(_.map.colorSpace)===lt,decodeVideoTextureEmissive:De&&_.emissiveMap.isVideoTexture===!0&&tt.getTransfer(_.emissiveMap.colorSpace)===lt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Ln,flipSided:_.side===Vt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ie&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ie&&_.extensions.multiDraw===!0||Me)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Re.vertexUv1s=l.has(1),Re.vertexUv2s=l.has(2),Re.vertexUv3s=l.has(3),l.clear(),Re}function p(_){let T=[];if(_.shaderID?T.push(_.shaderID):(T.push(_.customVertexShaderID),T.push(_.customFragmentShaderID)),_.defines!==void 0)for(let P in _.defines)T.push(P),T.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(g(T,_),M(T,_),T.push(i.outputColorSpace)),T.push(_.customProgramCacheKey),T.join()}function g(_,T){_.push(T.precision),_.push(T.outputColorSpace),_.push(T.envMapMode),_.push(T.envMapCubeUVHeight),_.push(T.mapUv),_.push(T.alphaMapUv),_.push(T.lightMapUv),_.push(T.aoMapUv),_.push(T.bumpMapUv),_.push(T.normalMapUv),_.push(T.displacementMapUv),_.push(T.emissiveMapUv),_.push(T.metalnessMapUv),_.push(T.roughnessMapUv),_.push(T.anisotropyMapUv),_.push(T.clearcoatMapUv),_.push(T.clearcoatNormalMapUv),_.push(T.clearcoatRoughnessMapUv),_.push(T.iridescenceMapUv),_.push(T.iridescenceThicknessMapUv),_.push(T.sheenColorMapUv),_.push(T.sheenRoughnessMapUv),_.push(T.specularMapUv),_.push(T.specularColorMapUv),_.push(T.specularIntensityMapUv),_.push(T.transmissionMapUv),_.push(T.thicknessMapUv),_.push(T.combine),_.push(T.fogExp2),_.push(T.sizeAttenuation),_.push(T.morphTargetsCount),_.push(T.morphAttributeCount),_.push(T.numSunLights),_.push(T.numDirLights),_.push(T.numPointLights),_.push(T.numSpotLights),_.push(T.numSpotLightMaps),_.push(T.numHemiLights),_.push(T.numRectAreaLights),_.push(T.numSunLightShadows),_.push(T.numDirLightShadows),_.push(T.numPointLightShadows),_.push(T.numSpotLightShadows),_.push(T.numSpotLightShadowsWithMaps),_.push(T.numLightProbes),_.push(T.shadowMapType),_.push(T.toneMapping),_.push(T.numClippingPlanes),_.push(T.numClipIntersection),_.push(T.depthPacking)}function M(_,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.retroreflection&&a.enable(24),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function S(_){let T=m[_.type],P;if(T){let C=kn[T];P=Pd.clone(C.uniforms)}else P=_.uniforms;return P}function v(_,T){let P=h.get(T);return P!==void 0?++P.usedTimes:(P=new _x(i,T,_,s),c.push(P),h.set(T,P)),P}function E(_){if(--_.usedTimes===0){let T=c.indexOf(_);c[T]=c[c.length-1],c.pop(),h.delete(_.cacheKey),_.destroy()}}function w(_){o.remove(_)}function R(){o.dispose()}return{getParameters:y,getProgramCacheKey:p,getUniforms:S,acquireProgram:v,releaseProgram:E,releaseShaderCache:w,programs:c,dispose:R}}function Sx(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function wx(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Kd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function jd(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(u){let m=0;return u.isInstancedMesh&&(m+=2),u.isSkinnedMesh&&(m+=1),m}function o(u,m,f,y,p,g){let M=i[e];return M===void 0?(M={id:u.id,object:u,geometry:m,material:f,materialVariant:a(u),groupOrder:y,renderOrder:u.renderOrder,z:p,group:g},i[e]=M):(M.id=u.id,M.object=u,M.geometry=m,M.material=f,M.materialVariant=a(u),M.groupOrder=y,M.renderOrder=u.renderOrder,M.z=p,M.group=g),e++,M}function l(u,m,f,y,p,g,M){M.reversedDepth===!0&&(p=-p);let S=o(u,m,f,y,p,g);f.transmission>0?n.push(S):f.transparent===!0?s.push(S):t.push(S)}function c(u,m,f,y,p,g){let M=o(u,m,f,y,p,g);f.transmission>0?n.unshift(M):f.transparent===!0?s.unshift(M):t.unshift(M)}function h(u,m){t.length>1&&t.sort(u||wx),n.length>1&&n.sort(m||Kd),s.length>1&&s.sort(m||Kd)}function d(){for(let u=e,m=i.length;u<m;u++){let f=i[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:d,sort:h}}function Ex(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new jd,i.set(n,[a])):s>=r.length?(a=new jd,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Tx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new F,color:new Je};break;case"SpotLight":t={position:new F,direction:new F,color:new Je,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new F,color:new Je,distance:0,decay:0};break;case"HemisphereLight":t={direction:new F,skyColor:new Je,groundColor:new Je};break;case"RectAreaLight":t={color:new Je,position:new F,halfWidth:new F,halfHeight:new F};break}return i[e.id]=t,t}}}function Ax(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Cx=0;function Rx(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Ix(i){let e=new Tx,t=Ax(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new F);let s=new F,r=new ut,a=new ut;function o(c){let h=0,d=0,u=0;for(let N=0;N<9;N++)n.probe[N].set(0,0,0);let m=0,f=0,y=0,p=0,g=0,M=0,S=0,v=0,E=0,w=0,R=0,_=0,T=0,P=0;c.sort(Rx);for(let N=0,B=c.length;N<B;N++){let I=c[N],U=I.color,H=I.intensity,Y=I.distance,X=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===pi?X=I.shadow.map.texture:X=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=U.r*H,d+=U.g*H,u+=U.b*H;else if(I.isLightProbe){for(let z=0;z<9;z++)n.probe[z].addScaledVector(I.sh.coefficients[z],H);P++}else if(I.isSunLight){let z=e.get(I);if(z.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let q=I.shadow,j=t.get(I);j.shadowIntensity=q.intensity,j.shadowBias=q.bias,j.shadowNormalBias=q.normalBias,j.shadowRadius=q.radius,j.shadowMapSize.copy(q.mapSize).multiply(q.getFrameExtents()),n.sunShadow[f]=j,n.sunShadowMap[f]=X;let Se=q.getViewportCount();for(let be=0;be<Se;be++)n.sunShadowMatrix[y+be]=q.getMatrix(be),n.sunShadowCascade[y+be]=q._cascadeData[be];y+=Se,f++}n.sun[m]=z,m++}else if(I.isDirectionalLight){let z=e.get(I);if(z.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let q=I.shadow,j=t.get(I);j.shadowIntensity=q.intensity,j.shadowBias=q.bias,j.shadowNormalBias=q.normalBias,j.shadowRadius=q.radius,j.shadowMapSize=q.mapSize,n.directionalShadow[p]=j,n.directionalShadowMap[p]=X,n.directionalShadowMatrix[p]=I.shadow.matrix,E++}n.directional[p]=z,p++}else if(I.isSpotLight){let z=e.get(I);z.position.setFromMatrixPosition(I.matrixWorld),z.color.copy(U).multiplyScalar(H),z.distance=Y,z.coneCos=Math.cos(I.angle),z.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),z.decay=I.decay,n.spot[M]=z;let q=I.shadow;if(I.map&&(n.spotLightMap[_]=I.map,_++,q.updateMatrices(I),I.castShadow&&T++),n.spotLightMatrix[M]=q.matrix,I.castShadow){let j=t.get(I);j.shadowIntensity=q.intensity,j.shadowBias=q.bias,j.shadowNormalBias=q.normalBias,j.shadowRadius=q.radius,j.shadowMapSize=q.mapSize,n.spotShadow[M]=j,n.spotShadowMap[M]=X,R++}M++}else if(I.isRectAreaLight){let z=e.get(I);z.color.copy(U).multiplyScalar(H),z.halfWidth.set(I.width*.5,0,0),z.halfHeight.set(0,I.height*.5,0),n.rectArea[S]=z,S++}else if(I.isPointLight){let z=e.get(I);if(z.color.copy(I.color).multiplyScalar(I.intensity),z.distance=I.distance,z.decay=I.decay,I.castShadow){let q=I.shadow,j=t.get(I);j.shadowIntensity=q.intensity,j.shadowBias=q.bias,j.shadowNormalBias=q.normalBias,j.shadowRadius=q.radius,j.shadowMapSize=q.mapSize,j.shadowCameraNear=q.camera.near,j.shadowCameraFar=q.camera.far,n.pointShadow[g]=j,n.pointShadowMap[g]=X,n.pointShadowMatrix[g]=I.shadow.matrix,w++}n.point[g]=z,g++}else if(I.isHemisphereLight){let z=e.get(I);z.skyColor.copy(I.color).multiplyScalar(H),z.groundColor.copy(I.groundColor).multiplyScalar(H),n.hemi[v]=z,v++}}S>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ge.LTC_FLOAT_1,n.rectAreaLTC2=ge.LTC_FLOAT_2):(n.rectAreaLTC1=ge.LTC_HALF_1,n.rectAreaLTC2=ge.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;let C=n.hash;(C.sunLength!==m||C.directionalLength!==p||C.pointLength!==g||C.spotLength!==M||C.rectAreaLength!==S||C.hemiLength!==v||C.numSunShadows!==f||C.numDirectionalShadows!==E||C.numPointShadows!==w||C.numSpotShadows!==R||C.numSpotMaps!==_||C.numLightProbes!==P)&&(n.sun.length=m,n.directional.length=p,n.spot.length=M,n.rectArea.length=S,n.point.length=g,n.hemi.length=v,n.sunShadow.length=f,n.sunShadowMap.length=f,n.sunShadowMatrix.length=y,n.sunShadowCascade.length=y,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=w,n.pointShadowMap.length=w,n.pointShadowMatrix.length=w,n.spotShadow.length=R,n.spotShadowMap.length=R,n.spotLightMatrix.length=R+_-T,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=P,C.sunLength=m,C.directionalLength=p,C.pointLength=g,C.spotLength=M,C.rectAreaLength=S,C.hemiLength=v,C.numSunShadows=f,C.numDirectionalShadows=E,C.numPointShadows=w,C.numSpotShadows=R,C.numSpotMaps=_,C.numLightProbes=P,n.version=Cx++)}function l(c,h){let d=0,u=0,m=0,f=0,y=0,p=0,g=h.matrixWorldInverse;for(let M=0,S=c.length;M<S;M++){let v=c[M];if(v.isSunLight){let E=n.sun[d];E.direction.setFromMatrixPosition(v.matrixWorld),E.direction.transformDirection(g),d++}else if(v.isDirectionalLight){let E=n.directional[u];E.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),u++}else if(v.isSpotLight){let E=n.spot[f];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(g),E.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),f++}else if(v.isRectAreaLight){let E=n.rectArea[y];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(g),a.identity(),r.copy(v.matrixWorld),r.premultiply(g),a.extractRotation(r),E.halfWidth.set(v.width*.5,0,0),E.halfHeight.set(0,v.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),y++}else if(v.isPointLight){let E=n.point[m];E.position.setFromMatrixPosition(v.matrixWorld),E.position.applyMatrix4(g),m++}else if(v.isHemisphereLight){let E=n.hemi[p];E.direction.setFromMatrixPosition(v.matrixWorld),E.direction.transformDirection(g),p++}}}return{setup:o,setupView:l,state:n}}function Qd(i){let e=new Ix(i),t=[],n=[],s=[];function r(u){d.camera=u,t.length=0,n.length=0,s.length=0}function a(u){t.push(u)}function o(u){n.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function h(u){e.setupView(t,u)}let d={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Px(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Qd(i),e.set(s,[o])):r>=a.length?(o=new Qd(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Lx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Nx=`uniform sampler2D shadow_pass;
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
}`,Dx=[new F(1,0,0),new F(-1,0,0),new F(0,1,0),new F(0,-1,0),new F(0,0,1),new F(0,0,-1)],Ux=[new F(0,-1,0),new F(0,-1,0),new F(0,0,1),new F(0,0,-1),new F(0,-1,0),new F(0,-1,0)],eu=new ut,Ar=new F,Cc=new F;function kx(i,e,t){let n=new cs,s=new pe,r=new pe,a=new yt,o=new Ua,l=new ka,c={},h=t.maxTextureSize,d={[di]:Vt,[Vt]:di,[Ln]:Ln},u=new en({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pe},radius:{value:4}},vertexShader:Lx,fragmentShader:Nx}),m=u.clone();m.defines.HORIZONTAL_PASS=1;let f=new Zt;f.setAttribute("position",new jt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Ft(f,u),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=gr;let g=this.type;this.render=function(w,R,_){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||w.length===0)return;this.type===$a&&(Fe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=gr);let T=i.getRenderTarget(),P=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),N=i.state;N.setBlending(Nn),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let B=g!==this.type;B&&R.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(U=>U.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,U=w.length;I<U;I++){let H=w[I],Y=H.shadow;if(Y===void 0){Fe("WebGLShadowMap:",H,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);let X=Y.getFrameExtents();s.multiply(X),r.copy(Y.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/X.x),s.x=r.x*X.x,Y.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/X.y),s.y=r.y*X.y,Y.mapSize.y=r.y));let z=i.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=z,Y.map===null||B===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===ms){if(H.isPointLight){Fe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new Yt(s.x,s.y,{format:pi,type:_n,minFilter:Tt,magFilter:Tt,generateMipmaps:!1}),Y.map.texture.name=H.name+".shadowMap",Y.map.depthTexture=new ai(s.x,s.y,an),Y.map.depthTexture.name=H.name+".shadowMapDepth",Y.map.depthTexture.format=An,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=Lt,Y.map.depthTexture.magFilter=Lt}else H.isPointLight?(Y.map=new Wo(s.x),Y.map.depthTexture=new Aa(s.x,yn)):(Y.map=new Yt(s.x,s.y),Y.map.depthTexture=new ai(s.x,s.y,yn)),Y.map.depthTexture.name=H.name+".shadowMap",Y.map.depthTexture.format=An,this.type===gr?(Y.map.depthTexture.compareFunction=z?zo:Bo,Y.map.depthTexture.minFilter=Tt,Y.map.depthTexture.magFilter=Tt):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=Lt,Y.map.depthTexture.magFilter=Lt);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==s.x||Y.map.height!==s.y)&&Y.map.setSize(s.x,s.y);let q=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();H.isPointLight!==!0&&Y.updateMatrices(H,_);for(let j=0;j<q;j++){let Se=Y.getCamera(j);if(H.isPointLight){let be=Y.camera,nt=Y.matrix,Ye=H.distance||be.far;Ye!==be.far&&(be.far=Ye,be.updateProjectionMatrix()),Ar.setFromMatrixPosition(H.matrixWorld),be.position.copy(Ar),Cc.copy(be.position),Cc.add(Dx[j]),be.up.copy(Ux[j]),be.lookAt(Cc),be.updateMatrixWorld(),nt.makeTranslation(-Ar.x,-Ar.y,-Ar.z),eu.multiplyMatrices(be.projectionMatrix,be.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(eu,be.coordinateSystem,be.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)i.setRenderTarget(Y.map,j),i.clear();else{j===0&&(i.setRenderTarget(Y.map),i.clear());let be=Y.getViewport(j);a.set(r.x*be.x,r.y*be.y,r.x*be.z,r.y*be.w),N.viewport(a)}n=Y.getFrustum(j),v(R,_,Se,H,this.type)}Y.isPointLightShadow!==!0&&this.type===ms&&M(Y,_),Y.needsUpdate=!1}g=this.type,p.needsUpdate=!1,i.setRenderTarget(T,P,C)};function M(w,R){let _=e.update(y);u.defines.VSM_SAMPLES!==w.blurSamples&&(u.defines.VSM_SAMPLES=w.blurSamples,m.defines.VSM_SAMPLES=w.blurSamples,u.needsUpdate=!0,m.needsUpdate=!0),w.mapPass===null?w.mapPass=new Yt(s.x,s.y,{format:pi,type:_n}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),u.uniforms.shadow_pass.value=w.map.depthTexture,u.uniforms.resolution.value.set(w.map.width,w.map.height),u.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(R,null,_,u,y,null),m.uniforms.shadow_pass.value=w.mapPass.texture,m.uniforms.resolution.value.set(w.map.width,w.map.height),m.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(R,null,_,m,y,null)}function S(w,R,_,T){let P=null,C=_.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(C!==void 0)P=C;else if(P=_.isPointLight===!0?l:o,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let N=P.uuid,B=R.uuid,I=c[N];I===void 0&&(I={},c[N]=I);let U=I[B];U===void 0&&(U=P.clone(),I[B]=U,R.addEventListener("dispose",E)),P=U}if(P.visible=R.visible,P.wireframe=R.wireframe,T===ms?P.side=R.shadowSide!==null?R.shadowSide:R.side:P.side=R.shadowSide!==null?R.shadowSide:d[R.side],P.alphaMap=R.alphaMap,P.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,P.map=R.map,P.clipShadows=R.clipShadows,P.clippingPlanes=R.clippingPlanes,P.clipIntersection=R.clipIntersection,P.displacementMap=R.displacementMap,P.displacementScale=R.displacementScale,P.displacementBias=R.displacementBias,P.wireframeLinewidth=R.wireframeLinewidth,P.linewidth=R.linewidth,_.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let N=i.properties.get(P);N.light=_}return P}function v(w,R,_,T,P){if(w.visible===!1)return;if(w.layers.test(R.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&P===ms)&&(!w.frustumCulled||w.intersectsFrustum(n))){w.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,w.matrixWorld);let B=e.update(w),I=w.material;if(Array.isArray(I)){let U=B.groups;for(let H=0,Y=U.length;H<Y;H++){let X=U[H],z=I[X.materialIndex];if(z&&z.visible){let q=S(w,z,T,P);w.onBeforeShadow(i,w,R,_,B,q,X),i.renderBufferDirect(_,null,B,q,w,X),w.onAfterShadow(i,w,R,_,B,q,X)}}}else if(I.visible){let U=S(w,I,T,P);w.onBeforeShadow(i,w,R,_,B,U,null),i.renderBufferDirect(_,null,B,U,w,null),w.onAfterShadow(i,w,R,_,B,U,null)}}let N=w.children;for(let B=0,I=N.length;B<I;B++)v(N[B],R,_,T,P)}function E(w){w.target.removeEventListener("dispose",E);for(let _ in c){let T=c[_],P=w.target.uuid;P in T&&(T[P].dispose(),delete T[P])}}}function Fx(i,e){function t(){let k=!1,ue=new yt,Q=null,fe=new yt(0,0,0,0);return{setMask:function(ve){Q!==ve&&!k&&(i.colorMask(ve,ve,ve,ve),Q=ve)},setLocked:function(ve){k=ve},setClear:function(ve,ie,Ne,Re,ft){ft===!0&&(ve*=Re,ie*=Re,Ne*=Re),ue.set(ve,ie,Ne,Re),fe.equals(ue)===!1&&(i.clearColor(ve,ie,Ne,Re),fe.copy(ue))},reset:function(){k=!1,Q=null,fe.set(-1,0,0,0)}}}function n(){let k=!1,ue=!1,Q=null,fe=null,ve=null;return{setReversed:function(ie){if(ue!==ie){let Ne=e.get("EXT_clip_control");ie?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT),ue=ie;let Re=ve;ve=null,this.setClear(Re)}},getReversed:function(){return ue},setTest:function(ie){ie?ee(i.DEPTH_TEST):xe(i.DEPTH_TEST)},setMask:function(ie){Q!==ie&&!k&&(i.depthMask(ie),Q=ie)},setFunc:function(ie){if(ue&&(ie=Ed[ie]),fe!==ie){switch(ie){case fa:i.depthFunc(i.NEVER);break;case pa:i.depthFunc(i.ALWAYS);break;case ma:i.depthFunc(i.LESS);break;case is:i.depthFunc(i.LEQUAL);break;case ga:i.depthFunc(i.EQUAL);break;case xa:i.depthFunc(i.GEQUAL);break;case ya:i.depthFunc(i.GREATER);break;case _a:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}fe=ie}},setLocked:function(ie){k=ie},setClear:function(ie){ve!==ie&&(ve=ie,ue&&(ie=1-ie),i.clearDepth(ie))},reset:function(){k=!1,Q=null,fe=null,ve=null,ue=!1}}}function s(){let k=!1,ue=null,Q=null,fe=null,ve=null,ie=null,Ne=null,Re=null,ft=null;return{setTest:function(at){k||(at?ee(i.STENCIL_TEST):xe(i.STENCIL_TEST))},setMask:function(at){ue!==at&&!k&&(i.stencilMask(at),ue=at)},setFunc:function(at,dn,Mn){(Q!==at||fe!==dn||ve!==Mn)&&(i.stencilFunc(at,dn,Mn),Q=at,fe=dn,ve=Mn)},setOp:function(at,dn,Mn){(ie!==at||Ne!==dn||Re!==Mn)&&(i.stencilOp(at,dn,Mn),ie=at,Ne=dn,Re=Mn)},setLocked:function(at){k=at},setClear:function(at){ft!==at&&(i.clearStencil(at),ft=at)},reset:function(){k=!1,ue=null,Q=null,fe=null,ve=null,ie=null,Ne=null,Re=null,ft=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,h={},d={},u={},m=new WeakMap,f=[],y=null,p=!1,g=null,M=null,S=null,v=null,E=null,w=null,R=null,_=new Je(0,0,0),T=0,P=!1,C=null,N=null,B=null,I=null,U=null,H=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,X=0,z=i.getParameter(i.VERSION);z.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(z)[1]),Y=X>=1):z.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(z)[1]),Y=X>=2);let q=null,j={},Se=i.getParameter(i.SCISSOR_BOX),be=i.getParameter(i.VIEWPORT),nt=new yt().fromArray(Se),Ye=new yt().fromArray(be);function et(k,ue,Q,fe){let ve=new Uint8Array(4),ie=i.createTexture();i.bindTexture(k,ie),i.texParameteri(k,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(k,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ne=0;Ne<Q;Ne++)k===i.TEXTURE_3D||k===i.TEXTURE_2D_ARRAY?i.texImage3D(ue,0,i.RGBA,1,1,fe,0,i.RGBA,i.UNSIGNED_BYTE,ve):i.texImage2D(ue+Ne,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ve);return ie}let J={};J[i.TEXTURE_2D]=et(i.TEXTURE_2D,i.TEXTURE_2D,1),J[i.TEXTURE_CUBE_MAP]=et(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[i.TEXTURE_2D_ARRAY]=et(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),J[i.TEXTURE_3D]=et(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ee(i.DEPTH_TEST),a.setFunc(is),ae(!1),ce($l),ee(i.CULL_FACE),se(Nn);function ee(k){h[k]!==!0&&(i.enable(k),h[k]=!0)}function xe(k){h[k]!==!1&&(i.disable(k),h[k]=!1)}function Oe(k,ue){return u[k]!==ue?(i.bindFramebuffer(k,ue),u[k]=ue,k===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ue),k===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ue),!0):!1}function Me(k,ue){let Q=f,fe=!1;if(k){Q=m.get(ue),Q===void 0&&(Q=[],m.set(ue,Q));let ve=k.textures;if(Q.length!==ve.length||Q[0]!==i.COLOR_ATTACHMENT0){for(let ie=0,Ne=ve.length;ie<Ne;ie++)Q[ie]=i.COLOR_ATTACHMENT0+ie;Q.length=ve.length,fe=!0}}else Q[0]!==i.BACK&&(Q[0]=i.BACK,fe=!0);fe&&i.drawBuffers(Q)}function ze(k){return y!==k?(i.useProgram(k),y=k,!0):!1}let ct={[Ii]:i.FUNC_ADD,[qh]:i.FUNC_SUBTRACT,[Yh]:i.FUNC_REVERSE_SUBTRACT};ct[Zh]=i.MIN,ct[Jh]=i.MAX;let ne={[$h]:i.ZERO,[Kh]:i.ONE,[jh]:i.SRC_COLOR,[ec]:i.SRC_ALPHA,[sd]:i.SRC_ALPHA_SATURATE,[nd]:i.DST_COLOR,[ed]:i.DST_ALPHA,[Qh]:i.ONE_MINUS_SRC_COLOR,[tc]:i.ONE_MINUS_SRC_ALPHA,[id]:i.ONE_MINUS_DST_COLOR,[td]:i.ONE_MINUS_DST_ALPHA,[rd]:i.CONSTANT_COLOR,[ad]:i.ONE_MINUS_CONSTANT_COLOR,[od]:i.CONSTANT_ALPHA,[ld]:i.ONE_MINUS_CONSTANT_ALPHA};function se(k,ue,Q,fe,ve,ie,Ne,Re,ft,at){if(k===Nn){p===!0&&(xe(i.BLEND),p=!1);return}if(p===!1&&(ee(i.BLEND),p=!0),k!==Xh){if(k!==g||at!==P){if((M!==Ii||E!==Ii)&&(i.blendEquation(i.FUNC_ADD),M=Ii,E=Ii),at)switch(k){case gs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Kl:i.blendFunc(i.ONE,i.ONE);break;case jl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ql:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Be("WebGLState: Invalid blending: ",k);break}else switch(k){case gs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Kl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case jl:Be("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ql:Be("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Be("WebGLState: Invalid blending: ",k);break}S=null,v=null,w=null,R=null,_.set(0,0,0),T=0,g=k,P=at}return}ve=ve||ue,ie=ie||Q,Ne=Ne||fe,(ue!==M||ve!==E)&&(i.blendEquationSeparate(ct[ue],ct[ve]),M=ue,E=ve),(Q!==S||fe!==v||ie!==w||Ne!==R)&&(i.blendFuncSeparate(ne[Q],ne[fe],ne[ie],ne[Ne]),S=Q,v=fe,w=ie,R=Ne),(Re.equals(_)===!1||ft!==T)&&(i.blendColor(Re.r,Re.g,Re.b,ft),_.copy(Re),T=ft),g=k,P=!1}function re(k,ue){k.side===Ln?xe(i.CULL_FACE):ee(i.CULL_FACE);let Q=k.side===Vt;ue&&(Q=!Q),ae(Q),k.blending===gs&&k.transparent===!1?se(Nn):se(k.blending,k.blendEquation,k.blendSrc,k.blendDst,k.blendEquationAlpha,k.blendSrcAlpha,k.blendDstAlpha,k.blendColor,k.blendAlpha,k.premultipliedAlpha),a.setFunc(k.depthFunc),a.setTest(k.depthTest),a.setMask(k.depthWrite),r.setMask(k.colorWrite);let fe=k.stencilWrite;o.setTest(fe),fe&&(o.setMask(k.stencilWriteMask),o.setFunc(k.stencilFunc,k.stencilRef,k.stencilFuncMask),o.setOp(k.stencilFail,k.stencilZFail,k.stencilZPass)),De(k.polygonOffset,k.polygonOffsetFactor,k.polygonOffsetUnits),k.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):xe(i.SAMPLE_ALPHA_TO_COVERAGE)}function ae(k){C!==k&&(k?i.frontFace(i.CW):i.frontFace(i.CCW),C=k)}function ce(k){k!==Hh?(ee(i.CULL_FACE),k!==N&&(k===$l?i.cullFace(i.BACK):k===Wh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):xe(i.CULL_FACE),N=k}function Ue(k){k!==B&&(Y&&i.lineWidth(k),B=k)}function De(k,ue,Q){k?(ee(i.POLYGON_OFFSET_FILL),(I!==ue||U!==Q)&&(I=ue,U=Q,a.getReversed()&&(ue=-ue),i.polygonOffset(ue,Q))):xe(i.POLYGON_OFFSET_FILL)}function Ve(k){k?ee(i.SCISSOR_TEST):xe(i.SCISSOR_TEST)}function He(k){k===void 0&&(k=i.TEXTURE0+H-1),q!==k&&(i.activeTexture(k),q=k)}function L(k,ue,Q){Q===void 0&&(q===null?Q=i.TEXTURE0+H-1:Q=q);let fe=j[Q];fe===void 0&&(fe={type:void 0,texture:void 0},j[Q]=fe),(fe.type!==k||fe.texture!==ue)&&(q!==Q&&(i.activeTexture(Q),q=Q),i.bindTexture(k,ue||J[k]),fe.type=k,fe.texture=ue)}function rt(){let k=j[q];k!==void 0&&k.type!==void 0&&(i.bindTexture(k.type,null),k.type=void 0,k.texture=void 0)}function Ke(){try{i.compressedTexImage2D(...arguments)}catch(k){Be("WebGLState:",k)}}function A(){try{i.compressedTexImage3D(...arguments)}catch(k){Be("WebGLState:",k)}}function x(){try{i.texSubImage2D(...arguments)}catch(k){Be("WebGLState:",k)}}function O(){try{i.texSubImage3D(...arguments)}catch(k){Be("WebGLState:",k)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(k){Be("WebGLState:",k)}}function $(){try{i.compressedTexSubImage3D(...arguments)}catch(k){Be("WebGLState:",k)}}function oe(){try{i.texStorage2D(...arguments)}catch(k){Be("WebGLState:",k)}}function le(){try{i.texStorage3D(...arguments)}catch(k){Be("WebGLState:",k)}}function K(){try{i.texImage2D(...arguments)}catch(k){Be("WebGLState:",k)}}function te(){try{i.texImage3D(...arguments)}catch(k){Be("WebGLState:",k)}}function he(k){return d[k]!==void 0?d[k]:i.getParameter(k)}function Pe(k,ue){d[k]!==ue&&(i.pixelStorei(k,ue),d[k]=ue)}function me(k){nt.equals(k)===!1&&(i.scissor(k.x,k.y,k.z,k.w),nt.copy(k))}function de(k){Ye.equals(k)===!1&&(i.viewport(k.x,k.y,k.z,k.w),Ye.copy(k))}function Le(k,ue){let Q=c.get(ue);Q===void 0&&(Q=new WeakMap,c.set(ue,Q));let fe=Q.get(k);fe===void 0&&(fe=i.getUniformBlockIndex(ue,k.name),Q.set(k,fe))}function ke(k,ue){let fe=c.get(ue).get(k);l.get(ue)!==fe&&(i.uniformBlockBinding(ue,fe,k.__bindingPointIndex),l.set(ue,fe))}function We(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},d={},q=null,j={},u={},m=new WeakMap,f=[],y=null,p=!1,g=null,M=null,S=null,v=null,E=null,w=null,R=null,_=new Je(0,0,0),T=0,P=!1,C=null,N=null,B=null,I=null,U=null,nt.set(0,0,i.canvas.width,i.canvas.height),Ye.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ee,disable:xe,bindFramebuffer:Oe,drawBuffers:Me,useProgram:ze,setBlending:se,setMaterial:re,setFlipSided:ae,setCullFace:ce,setLineWidth:Ue,setPolygonOffset:De,setScissorTest:Ve,activeTexture:He,bindTexture:L,unbindTexture:rt,compressedTexImage2D:Ke,compressedTexImage3D:A,texImage2D:K,texImage3D:te,pixelStorei:Pe,getParameter:he,updateUBOMapping:Le,uniformBlockBinding:ke,texStorage2D:oe,texStorage3D:le,texSubImage2D:x,texSubImage3D:O,compressedTexSubImage2D:W,compressedTexSubImage3D:$,scissor:me,viewport:de,reset:We}}function Ox(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new pe,h=new WeakMap,d=new Set,u,m=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(A,x){return f?new OffscreenCanvas(A,x):Vs("canvas")}function p(A,x,O){let W=1,$=Ke(A);if(($.width>O||$.height>O)&&(W=O/Math.max($.width,$.height)),W<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let oe=Math.floor(W*$.width),le=Math.floor(W*$.height);u===void 0&&(u=y(oe,le));let K=x?y(oe,le):u;return K.width=oe,K.height=le,K.getContext("2d").drawImage(A,0,0,oe,le),Fe("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+oe+"x"+le+")."),K}else return"data"in A&&Fe("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),A;return A}function g(A){return A.generateMipmaps}function M(A){i.generateMipmap(A)}function S(A){return A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?i.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(A,x,O,W,$,oe=!1){if(A!==null){if(i[A]!==void 0)return i[A];Fe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let le;W&&(le=e.get("EXT_texture_norm16"),le||Fe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=x;if(x===i.RED&&(O===i.FLOAT&&(K=i.R32F),O===i.HALF_FLOAT&&(K=i.R16F),O===i.UNSIGNED_BYTE&&(K=i.R8),O===i.UNSIGNED_SHORT&&le&&(K=le.R16_EXT),O===i.SHORT&&le&&(K=le.R16_SNORM_EXT)),x===i.RED_INTEGER&&(O===i.UNSIGNED_BYTE&&(K=i.R8UI),O===i.UNSIGNED_SHORT&&(K=i.R16UI),O===i.UNSIGNED_INT&&(K=i.R32UI),O===i.BYTE&&(K=i.R8I),O===i.SHORT&&(K=i.R16I),O===i.INT&&(K=i.R32I)),x===i.RG&&(O===i.FLOAT&&(K=i.RG32F),O===i.HALF_FLOAT&&(K=i.RG16F),O===i.UNSIGNED_BYTE&&(K=i.RG8),O===i.UNSIGNED_SHORT&&le&&(K=le.RG16_EXT),O===i.SHORT&&le&&(K=le.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(O===i.UNSIGNED_BYTE&&(K=i.RG8UI),O===i.UNSIGNED_SHORT&&(K=i.RG16UI),O===i.UNSIGNED_INT&&(K=i.RG32UI),O===i.BYTE&&(K=i.RG8I),O===i.SHORT&&(K=i.RG16I),O===i.INT&&(K=i.RG32I)),x===i.RGB_INTEGER&&(O===i.UNSIGNED_BYTE&&(K=i.RGB8UI),O===i.UNSIGNED_SHORT&&(K=i.RGB16UI),O===i.UNSIGNED_INT&&(K=i.RGB32UI),O===i.BYTE&&(K=i.RGB8I),O===i.SHORT&&(K=i.RGB16I),O===i.INT&&(K=i.RGB32I)),x===i.RGBA_INTEGER&&(O===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),O===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),O===i.UNSIGNED_INT&&(K=i.RGBA32UI),O===i.BYTE&&(K=i.RGBA8I),O===i.SHORT&&(K=i.RGBA16I),O===i.INT&&(K=i.RGBA32I)),x===i.RGB&&(O===i.UNSIGNED_SHORT&&le&&(K=le.RGB16_EXT),O===i.SHORT&&le&&(K=le.RGB16_SNORM_EXT),O===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),O===i.UNSIGNED_INT_10F_11F_11F_REV&&(K=i.R11F_G11F_B10F)),x===i.RGBA){let te=oe?zs:tt.getTransfer($);O===i.FLOAT&&(K=i.RGBA32F),O===i.HALF_FLOAT&&(K=i.RGBA16F),O===i.UNSIGNED_BYTE&&(K=te===lt?i.SRGB8_ALPHA8:i.RGBA8),O===i.UNSIGNED_SHORT&&le&&(K=le.RGBA16_EXT),O===i.SHORT&&le&&(K=le.RGBA16_SNORM_EXT),O===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),O===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function E(A,x){let O;return A?x===null||x===yn||x===ys?O=i.DEPTH24_STENCIL8:x===an?O=i.DEPTH32F_STENCIL8:x===xs&&(O=i.DEPTH24_STENCIL8,Fe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===yn||x===ys?O=i.DEPTH_COMPONENT24:x===an?O=i.DEPTH_COMPONENT32F:x===xs&&(O=i.DEPTH_COMPONENT16),O}function w(A,x){return g(A)===!0||A.isFramebufferTexture&&A.minFilter!==Lt&&A.minFilter!==Tt?Math.log2(Math.max(x.width,x.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?x.mipmaps.length:1}function R(A){let x=A.target;x.removeEventListener("dispose",R),T(x),x.isVideoTexture&&h.delete(x),x.isHTMLTexture&&d.delete(x)}function _(A){let x=A.target;x.removeEventListener("dispose",_),C(x)}function T(A){let x=n.get(A);if(x.__webglInit===void 0)return;let O=A.source,W=m.get(O);if(W){let $=W[x.__cacheKey];$.usedTimes--,$.usedTimes===0&&P(A),Object.keys(W).length===0&&m.delete(O)}n.remove(A)}function P(A){let x=n.get(A);i.deleteTexture(x.__webglTexture);let O=A.source,W=m.get(O);delete W[x.__cacheKey],a.memory.textures--}function C(A){let x=n.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),n.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(x.__webglFramebuffer[W]))for(let $=0;$<x.__webglFramebuffer[W].length;$++)i.deleteFramebuffer(x.__webglFramebuffer[W][$]);else i.deleteFramebuffer(x.__webglFramebuffer[W]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[W])}else{if(Array.isArray(x.__webglFramebuffer))for(let W=0;W<x.__webglFramebuffer.length;W++)i.deleteFramebuffer(x.__webglFramebuffer[W]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let W=0;W<x.__webglColorRenderbuffer.length;W++)x.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[W]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let O=A.textures;for(let W=0,$=O.length;W<$;W++){let oe=n.get(O[W]);oe.__webglTexture&&(i.deleteTexture(oe.__webglTexture),a.memory.textures--),n.remove(O[W])}n.remove(A)}let N=0;function B(){N=0}function I(){return N}function U(A){N=A}function H(){let A=N;return A>=s.maxTextures&&Fe("WebGLTextures: Trying to use "+(A+1)+" texture units while this GPU supports only "+s.maxTextures),N+=1,A}function Y(A){let x=[];return x.push(A.wrapS),x.push(A.wrapT),x.push(A.wrapR||0),x.push(A.magFilter),x.push(A.minFilter),x.push(A.anisotropy),x.push(A.internalFormat),x.push(A.format),x.push(A.type),x.push(A.generateMipmaps),x.push(A.premultiplyAlpha),x.push(A.flipY),x.push(A.unpackAlignment),x.push(A.colorSpace),x.join()}function X(A,x){let O=n.get(A);if(A.isVideoTexture&&L(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&O.__version!==A.version){let W=A.image;if(W===null)Fe("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Fe("WebGLRenderer: Texture marked for update but image is incomplete");else{xe(O,A,x);return}}else A.isExternalTexture&&(O.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,O.__webglTexture,i.TEXTURE0+x)}function z(A,x){let O=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&O.__version!==A.version){xe(O,A,x);return}else A.isExternalTexture&&(O.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,O.__webglTexture,i.TEXTURE0+x)}function q(A,x){let O=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&O.__version!==A.version){xe(O,A,x);return}t.bindTexture(i.TEXTURE_3D,O.__webglTexture,i.TEXTURE0+x)}function j(A,x){let O=n.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&O.__version!==A.version){Oe(O,A,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+x)}let Se={[ss]:i.REPEAT,[Tn]:i.CLAMP_TO_EDGE,[va]:i.MIRRORED_REPEAT},be={[Lt]:i.NEAREST,[dd]:i.NEAREST_MIPMAP_NEAREST,[_r]:i.NEAREST_MIPMAP_LINEAR,[Tt]:i.LINEAR,[Qa]:i.LINEAR_MIPMAP_NEAREST,[Dn]:i.LINEAR_MIPMAP_LINEAR},nt={[md]:i.NEVER,[vd]:i.ALWAYS,[gd]:i.LESS,[Bo]:i.LEQUAL,[xd]:i.EQUAL,[zo]:i.GEQUAL,[yd]:i.GREATER,[_d]:i.NOTEQUAL};function Ye(A,x){if(x.type===an&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Tt||x.magFilter===Qa||x.magFilter===_r||x.magFilter===Dn||x.minFilter===Tt||x.minFilter===Qa||x.minFilter===_r||x.minFilter===Dn)&&Fe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,Se[x.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,Se[x.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,Se[x.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,be[x.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,be[x.minFilter]),x.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,nt[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Lt||x.minFilter!==_r&&x.minFilter!==Dn||x.type===an&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let O=e.get("EXT_texture_filter_anisotropic");i.texParameterf(A,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function et(A,x){let O=!1;A.__webglInit===void 0&&(A.__webglInit=!0,x.addEventListener("dispose",R));let W=x.source,$=m.get(W);$===void 0&&($={},m.set(W,$));let oe=Y(x);if(oe!==A.__cacheKey){$[oe]===void 0&&($[oe]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,O=!0),$[oe].usedTimes++;let le=$[A.__cacheKey];le!==void 0&&($[A.__cacheKey].usedTimes--,le.usedTimes===0&&P(x)),A.__cacheKey=oe,A.__webglTexture=$[oe].texture}return O}function J(A,x,O){return Math.floor(Math.floor(A/O)/x)}function ee(A,x,O,W){let oe=A.updateRanges;if(oe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,O,W,x.data);else{oe.sort((Pe,me)=>Pe.start-me.start);let le=0;for(let Pe=1;Pe<oe.length;Pe++){let me=oe[le],de=oe[Pe],Le=me.start+me.count,ke=J(de.start,x.width,4),We=J(me.start,x.width,4);de.start<=Le+1&&ke===We&&J(de.start+de.count-1,x.width,4)===ke?me.count=Math.max(me.count,de.start+de.count-me.start):(++le,oe[le]=de)}oe.length=le+1;let K=t.getParameter(i.UNPACK_ROW_LENGTH),te=t.getParameter(i.UNPACK_SKIP_PIXELS),he=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let Pe=0,me=oe.length;Pe<me;Pe++){let de=oe[Pe],Le=Math.floor(de.start/4),ke=Math.ceil(de.count/4),We=Le%x.width,k=Math.floor(Le/x.width),ue=ke,Q=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,We),t.pixelStorei(i.UNPACK_SKIP_ROWS,k),t.texSubImage2D(i.TEXTURE_2D,0,We,k,ue,Q,O,W,x.data)}A.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,K),t.pixelStorei(i.UNPACK_SKIP_PIXELS,te),t.pixelStorei(i.UNPACK_SKIP_ROWS,he)}}function xe(A,x,O){let W=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(W=i.TEXTURE_3D);let $=et(A,x),oe=x.source;t.bindTexture(W,A.__webglTexture,i.TEXTURE0+O);let le=n.get(oe);if(oe.version!==le.__version||$===!0){if(t.activeTexture(i.TEXTURE0+O),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let Q=tt.getPrimaries(tt.workingColorSpace),fe=x.colorSpace===Yn?null:tt.getPrimaries(x.colorSpace),ve=x.colorSpace===Yn||Q===fe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let te=p(x.image,!1,s.maxTextureSize);te=rt(x,te);let he=r.convert(x.format,x.colorSpace),Pe=r.convert(x.type),me=v(x.internalFormat,he,Pe,x.normalized,x.colorSpace,x.isVideoTexture);Ye(W,x);let de,Le=x.mipmaps,ke=x.isVideoTexture!==!0,We=le.__version===void 0||$===!0,k=oe.dataReady,ue=w(x,te);if(x.isDepthTexture)me=E(x.format===fi,x.type),We&&(ke?t.texStorage2D(i.TEXTURE_2D,1,me,te.width,te.height):t.texImage2D(i.TEXTURE_2D,0,me,te.width,te.height,0,he,Pe,null));else if(x.isDataTexture)if(Le.length>0){ke&&We&&t.texStorage2D(i.TEXTURE_2D,ue,me,Le[0].width,Le[0].height);for(let Q=0,fe=Le.length;Q<fe;Q++)de=Le[Q],ke?k&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,de.width,de.height,he,Pe,de.data):t.texImage2D(i.TEXTURE_2D,Q,me,de.width,de.height,0,he,Pe,de.data);x.generateMipmaps=!1}else ke?(We&&t.texStorage2D(i.TEXTURE_2D,ue,me,te.width,te.height),k&&ee(x,te,he,Pe)):t.texImage2D(i.TEXTURE_2D,0,me,te.width,te.height,0,he,Pe,te.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){ke&&We&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ue,me,Le[0].width,Le[0].height,te.depth);for(let Q=0,fe=Le.length;Q<fe;Q++)if(de=Le[Q],x.format!==on)if(he!==null)if(ke){if(k)if(x.layerUpdates.size>0){let ve=Mc(de.width,de.height,x.format,x.type);for(let ie of x.layerUpdates){let Ne=de.data.subarray(ie*ve/de.data.BYTES_PER_ELEMENT,(ie+1)*ve/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,ie,de.width,de.height,1,he,Ne)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,de.width,de.height,te.depth,he,de.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,me,de.width,de.height,te.depth,0,de.data,0,0);else Fe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ke?k&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,de.width,de.height,te.depth,he,Pe,de.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Q,me,de.width,de.height,te.depth,0,he,Pe,de.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{ke&&We&&t.texStorage2D(i.TEXTURE_2D,ue,me,Le[0].width,Le[0].height);for(let Q=0,fe=Le.length;Q<fe;Q++)de=Le[Q],x.format!==on?he!==null?ke?k&&t.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,de.width,de.height,he,de.data):t.compressedTexImage2D(i.TEXTURE_2D,Q,me,de.width,de.height,0,de.data):Fe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ke?k&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,de.width,de.height,he,Pe,de.data):t.texImage2D(i.TEXTURE_2D,Q,me,de.width,de.height,0,he,Pe,de.data)}else if(x.isDataArrayTexture)if(ke){if(We&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ue,me,te.width,te.height,te.depth),k)if(x.layerUpdates.size>0){let Q=Mc(te.width,te.height,x.format,x.type);for(let fe of x.layerUpdates){let ve=te.data.subarray(fe*Q/te.data.BYTES_PER_ELEMENT,(fe+1)*Q/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,fe,te.width,te.height,1,he,Pe,ve)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,he,Pe,te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,me,te.width,te.height,te.depth,0,he,Pe,te.data);else if(x.isData3DTexture)ke?(We&&t.texStorage3D(i.TEXTURE_3D,ue,me,te.width,te.height,te.depth),k&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,he,Pe,te.data)):t.texImage3D(i.TEXTURE_3D,0,me,te.width,te.height,te.depth,0,he,Pe,te.data);else if(x.isFramebufferTexture){if(We)if(ke)t.texStorage2D(i.TEXTURE_2D,ue,me,te.width,te.height);else{let Q=te.width,fe=te.height;for(let ve=0;ve<ue;ve++)t.texImage2D(i.TEXTURE_2D,ve,me,Q,fe,0,he,Pe,null),Q>>=1,fe>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){let Q=i.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),te.parentNode!==Q){Q.appendChild(te),d.add(x),Q.onpaint=fe=>{let ve=fe.changedElements;for(let ie of d)ve.includes(ie.image)&&(ie.needsUpdate=!0)},Q.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,te);else{let ve=i.RGBA,ie=i.RGBA,Ne=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ve,ie,Ne,te)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Le.length>0){if(ke&&We){let Q=Ke(Le[0]);t.texStorage2D(i.TEXTURE_2D,ue,me,Q.width,Q.height)}for(let Q=0,fe=Le.length;Q<fe;Q++)de=Le[Q],ke?k&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,he,Pe,de):t.texImage2D(i.TEXTURE_2D,Q,me,he,Pe,de);x.generateMipmaps=!1}else if(ke){if(We){let Q=Ke(te);t.texStorage2D(i.TEXTURE_2D,ue,me,Q.width,Q.height)}k&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,he,Pe,te)}else t.texImage2D(i.TEXTURE_2D,0,me,he,Pe,te);g(x)&&M(W),le.__version=oe.version,x.onUpdate&&x.onUpdate(x)}A.__version=x.version}function Oe(A,x,O){if(x.image.length!==6)return;let W=et(A,x),$=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+O);let oe=n.get($);if($.version!==oe.__version||W===!0){t.activeTexture(i.TEXTURE0+O);let le=tt.getPrimaries(tt.workingColorSpace),K=x.colorSpace===Yn?null:tt.getPrimaries(x.colorSpace),te=x.colorSpace===Yn||le===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,te);let he=x.isCompressedTexture||x.image[0].isCompressedTexture,Pe=x.image[0]&&x.image[0].isDataTexture,me=[];for(let ie=0;ie<6;ie++)!he&&!Pe?me[ie]=p(x.image[ie],!0,s.maxCubemapSize):me[ie]=Pe?x.image[ie].image:x.image[ie],me[ie]=rt(x,me[ie]);let de=me[0],Le=r.convert(x.format,x.colorSpace),ke=r.convert(x.type),We=v(x.internalFormat,Le,ke,x.normalized,x.colorSpace),k=x.isVideoTexture!==!0,ue=oe.__version===void 0||W===!0,Q=$.dataReady,fe=w(x,de);Ye(i.TEXTURE_CUBE_MAP,x);let ve;if(he){k&&ue&&t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,We,de.width,de.height);for(let ie=0;ie<6;ie++){ve=me[ie].mipmaps;for(let Ne=0;Ne<ve.length;Ne++){let Re=ve[Ne];x.format!==on?Le!==null?k?Q&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne,0,0,Re.width,Re.height,Le,Re.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne,We,Re.width,Re.height,0,Re.data):Fe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):k?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne,0,0,Re.width,Re.height,Le,ke,Re.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne,We,Re.width,Re.height,0,Le,ke,Re.data)}}}else{if(ve=x.mipmaps,k&&ue){ve.length>0&&fe++;let ie=Ke(me[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,We,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(Pe){k?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,me[ie].width,me[ie].height,Le,ke,me[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,We,me[ie].width,me[ie].height,0,Le,ke,me[ie].data);for(let Ne=0;Ne<ve.length;Ne++){let ft=ve[Ne].image[ie].image;k?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne+1,0,0,ft.width,ft.height,Le,ke,ft.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne+1,We,ft.width,ft.height,0,Le,ke,ft.data)}}else{k?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Le,ke,me[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,We,Le,ke,me[ie]);for(let Ne=0;Ne<ve.length;Ne++){let Re=ve[Ne];k?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne+1,0,0,Le,ke,Re.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ne+1,We,Le,ke,Re.image[ie])}}}g(x)&&M(i.TEXTURE_CUBE_MAP),oe.__version=$.version,x.onUpdate&&x.onUpdate(x)}A.__version=x.version}function Me(A,x,O,W,$,oe){let le=r.convert(O.format,O.colorSpace),K=r.convert(O.type),te=v(O.internalFormat,le,K,O.normalized,O.colorSpace),he=n.get(x),Pe=n.get(O);if(Pe.__renderTarget=x,!he.__hasExternalTextures){let me=Math.max(1,x.width>>oe),de=Math.max(1,x.height>>oe);$===i.TEXTURE_3D||$===i.TEXTURE_2D_ARRAY?t.texImage3D($,oe,te,me,de,x.depth,0,le,K,null):t.texImage2D($,oe,te,me,de,0,le,K,null)}t.bindFramebuffer(i.FRAMEBUFFER,A),He(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,$,Pe.__webglTexture,0,Ve(x)):($===i.TEXTURE_2D||$>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,$,Pe.__webglTexture,oe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function ze(A,x,O){if(i.bindRenderbuffer(i.RENDERBUFFER,A),x.depthBuffer){let W=x.depthTexture,$=W&&W.isDepthTexture?W.type:null,oe=E(x.stencilBuffer,$),le=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;He(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ve(x),oe,x.width,x.height):O?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ve(x),oe,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,oe,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,le,i.RENDERBUFFER,A)}else{let W=x.textures;for(let $=0;$<W.length;$++){let oe=W[$],le=r.convert(oe.format,oe.colorSpace),K=r.convert(oe.type),te=v(oe.internalFormat,le,K,oe.normalized,oe.colorSpace);He(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ve(x),te,x.width,x.height):O?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ve(x),te,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,te,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ct(A,x,O){let W=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,A),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let $=n.get(x.depthTexture);if($.__renderTarget=x,(!$.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),W){if($.__webglInit===void 0&&($.__webglInit=!0,x.depthTexture.addEventListener("dispose",R)),$.__webglTexture===void 0){$.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),Ye(i.TEXTURE_CUBE_MAP,x.depthTexture);let he=r.convert(x.depthTexture.format),Pe=r.convert(x.depthTexture.type),me;x.depthTexture.format===An?me=i.DEPTH_COMPONENT24:x.depthTexture.format===fi&&(me=i.DEPTH24_STENCIL8);for(let de=0;de<6;de++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,me,x.width,x.height,0,he,Pe,null)}}else X(x.depthTexture,0);let oe=$.__webglTexture,le=Ve(x),K=W?i.TEXTURE_CUBE_MAP_POSITIVE_X+O:i.TEXTURE_2D,te=x.depthTexture.format===fi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===An)He(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,K,oe,0,le):i.framebufferTexture2D(i.FRAMEBUFFER,te,K,oe,0);else if(x.depthTexture.format===fi)He(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,K,oe,0,le):i.framebufferTexture2D(i.FRAMEBUFFER,te,K,oe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ne(A){let x=n.get(A),O=A.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==A.depthTexture){let W=A.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),W){let $=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,W.removeEventListener("dispose",$)};W.addEventListener("dispose",$),x.__depthDisposeCallback=$}x.__boundDepthTexture=W}if(A.depthTexture&&!x.__autoAllocateDepthBuffer)if(O)for(let W=0;W<6;W++)ct(x.__webglFramebuffer[W],A,W);else{let W=A.texture.mipmaps;W&&W.length>0?ct(x.__webglFramebuffer[0],A,0):ct(x.__webglFramebuffer,A,0)}else if(O){x.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[W]),x.__webglDepthbuffer[W]===void 0)x.__webglDepthbuffer[W]=i.createRenderbuffer(),ze(x.__webglDepthbuffer[W],A,!1);else{let $=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=x.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,oe)}}else{let W=A.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),ze(x.__webglDepthbuffer,A,!1);else{let $=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,oe)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function se(A,x,O){let W=n.get(A);x!==void 0&&Me(W.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),O!==void 0&&ne(A)}function re(A){let x=A.texture,O=n.get(A),W=n.get(x);A.addEventListener("dispose",_);let $=A.textures,oe=A.isWebGLCubeRenderTarget===!0,le=$.length>1;if(le||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=x.version,a.memory.textures++),oe){O.__webglFramebuffer=[];for(let K=0;K<6;K++)if(x.mipmaps&&x.mipmaps.length>0){O.__webglFramebuffer[K]=[];for(let te=0;te<x.mipmaps.length;te++)O.__webglFramebuffer[K][te]=i.createFramebuffer()}else O.__webglFramebuffer[K]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){O.__webglFramebuffer=[];for(let K=0;K<x.mipmaps.length;K++)O.__webglFramebuffer[K]=i.createFramebuffer()}else O.__webglFramebuffer=i.createFramebuffer();if(le)for(let K=0,te=$.length;K<te;K++){let he=n.get($[K]);he.__webglTexture===void 0&&(he.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&He(A)===!1){O.__webglMultisampledFramebuffer=i.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let K=0;K<$.length;K++){let te=$[K];O.__webglColorRenderbuffer[K]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,O.__webglColorRenderbuffer[K]);let he=r.convert(te.format,te.colorSpace),Pe=r.convert(te.type),me=v(te.internalFormat,he,Pe,te.normalized,te.colorSpace,A.isXRRenderTarget===!0),de=Ve(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,de,me,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,O.__webglColorRenderbuffer[K])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(O.__webglDepthRenderbuffer=i.createRenderbuffer(),ze(O.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(oe){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),Ye(i.TEXTURE_CUBE_MAP,x);for(let K=0;K<6;K++)if(x.mipmaps&&x.mipmaps.length>0)for(let te=0;te<x.mipmaps.length;te++)Me(O.__webglFramebuffer[K][te],A,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,te);else Me(O.__webglFramebuffer[K],A,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);g(x)&&M(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(le){for(let K=0,te=$.length;K<te;K++){let he=$[K],Pe=n.get(he),me=i.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(me=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(me,Pe.__webglTexture),Ye(me,he),Me(O.__webglFramebuffer,A,he,i.COLOR_ATTACHMENT0+K,me,0),g(he)&&M(me)}t.unbindTexture()}else{let K=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(K=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(K,W.__webglTexture),Ye(K,x),x.mipmaps&&x.mipmaps.length>0)for(let te=0;te<x.mipmaps.length;te++)Me(O.__webglFramebuffer[te],A,x,i.COLOR_ATTACHMENT0,K,te);else Me(O.__webglFramebuffer,A,x,i.COLOR_ATTACHMENT0,K,0);g(x)&&M(K),t.unbindTexture()}A.depthBuffer&&ne(A)}function ae(A){let x=A.textures;for(let O=0,W=x.length;O<W;O++){let $=x[O];if(g($)){let oe=S(A),le=n.get($).__webglTexture;t.bindTexture(oe,le),M(oe),t.unbindTexture()}}}let ce=[],Ue=[];function De(A){if(A.samples>0){if(He(A)===!1){let x=A.textures,O=A.width,W=A.height,$=i.COLOR_BUFFER_BIT,oe=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=n.get(A),K=x.length>1;if(K)for(let he=0;he<x.length;he++)t.bindFramebuffer(i.FRAMEBUFFER,le.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,le.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,le.__webglMultisampledFramebuffer);let te=A.texture.mipmaps;te&&te.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglFramebuffer);for(let he=0;he<x.length;he++){if(A.resolveDepthBuffer&&(A.depthBuffer&&($|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&($|=i.STENCIL_BUFFER_BIT)),K){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,le.__webglColorRenderbuffer[he]);let Pe=n.get(x[he]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Pe,0)}i.blitFramebuffer(0,0,O,W,0,0,O,W,$,i.NEAREST),l===!0&&(ce.length=0,Ue.length=0,ce.push(i.COLOR_ATTACHMENT0+he),A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&(ce.push(oe),Ue.push(oe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Ue)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ce))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),K)for(let he=0;he<x.length;he++){t.bindFramebuffer(i.FRAMEBUFFER,le.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.RENDERBUFFER,le.__webglColorRenderbuffer[he]);let Pe=n.get(x[he]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,le.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.TEXTURE_2D,Pe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,le.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&l){let x=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function Ve(A){return Math.min(s.maxSamples,A.samples)}function He(A){let x=n.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function L(A){let x=a.render.frame;h.get(A)!==x&&(h.set(A,x),A.update())}function rt(A,x){let O=A.colorSpace,W=A.format,$=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||O!==Bs&&O!==Yn&&(tt.getTransfer(O)===lt?(W!==on||$!==Jt)&&Fe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Be("WebGLTextures: Unsupported texture color space:",O)),x}function Ke(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=H,this.resetTextureUnits=B,this.getTextureUnits=I,this.setTextureUnits=U,this.setTexture2D=X,this.setTexture2DArray=z,this.setTexture3D=q,this.setTextureCube=j,this.rebindTextures=se,this.setupRenderTarget=re,this.updateRenderTargetMipmap=ae,this.updateMultisampleRenderTarget=De,this.setupDepthRenderbuffer=ne,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=He,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Bx(i,e){function t(n,s=Yn){let r,a=tt.getTransfer(s);if(n===Jt)return i.UNSIGNED_BYTE;if(n===to)return i.UNSIGNED_SHORT_4_4_4_4;if(n===no)return i.UNSIGNED_SHORT_5_5_5_1;if(n===uc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===fc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===hc)return i.BYTE;if(n===dc)return i.SHORT;if(n===xs)return i.UNSIGNED_SHORT;if(n===eo)return i.INT;if(n===yn)return i.UNSIGNED_INT;if(n===an)return i.FLOAT;if(n===_n)return i.HALF_FLOAT;if(n===pc)return i.ALPHA;if(n===mc)return i.RGB;if(n===on)return i.RGBA;if(n===An)return i.DEPTH_COMPONENT;if(n===fi)return i.DEPTH_STENCIL;if(n===io)return i.RED;if(n===so)return i.RED_INTEGER;if(n===pi)return i.RG;if(n===ro)return i.RG_INTEGER;if(n===ao)return i.RGBA_INTEGER;if(n===vr||n===br||n===Mr||n===Sr)if(a===lt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===vr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Mr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===vr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===br)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Mr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Sr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===oo||n===lo||n===co||n===ho)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===oo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===lo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===co)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ho)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===uo||n===fo||n===po||n===mo||n===go||n===wr||n===xo)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===uo||n===fo)return a===lt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===po)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===mo)return r.COMPRESSED_R11_EAC;if(n===go)return r.COMPRESSED_SIGNED_R11_EAC;if(n===wr)return r.COMPRESSED_RG11_EAC;if(n===xo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===yo||n===_o||n===vo||n===bo||n===Mo||n===So||n===wo||n===Eo||n===To||n===Ao||n===Co||n===Ro||n===Io||n===Po)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===yo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===_o)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===vo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===bo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Mo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===So)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===wo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Eo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===To)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ao)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Co)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ro)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Io)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Po)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Lo||n===No||n===Do)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Lo)return a===lt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===No)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Do)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Uo||n===ko||n===Er||n===Fo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Uo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ko)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Er)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Fo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ys?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var zx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Vx=`
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

}`,kc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ks(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new en({vertexShader:zx,fragmentShader:Vx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ft(new lr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Fc=class extends Cn{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,m=null,f=null,y=typeof XRWebGLBinding<"u",p=new kc,g={},M=t.getContextAttributes(),S=null,v=null,E=[],w=[],R=new pe,_=null,T=null,P=new Wt;P.viewport=new yt;let C=new Wt;C.viewport=new yt;let N=[P,C],B=new Ja,I=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let ee=E[J];return ee===void 0&&(ee=new ls,E[J]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(J){let ee=E[J];return ee===void 0&&(ee=new ls,E[J]=ee),ee.getGripSpace()},this.getHand=function(J){let ee=E[J];return ee===void 0&&(ee=new ls,E[J]=ee),ee.getHandSpace()};function H(J){let ee=w.indexOf(J.inputSource);if(ee===-1)return;let xe=E[ee];xe!==void 0&&(xe.update(J.inputSource,J.frame,c||a),xe.dispatchEvent({type:J.type,data:J.inputSource}))}function Y(){s.removeEventListener("select",H),s.removeEventListener("selectstart",H),s.removeEventListener("selectend",H),s.removeEventListener("squeeze",H),s.removeEventListener("squeezestart",H),s.removeEventListener("squeezeend",H),s.removeEventListener("end",Y),s.removeEventListener("inputsourceschange",X);for(let J=0;J<E.length;J++){let ee=w[J];ee!==null&&(w[J]=null,E[J].disconnect(ee))}I=null,U=null,p.reset();for(let J in g)delete g[J];if(e.setRenderTarget(S),m=null,u=null,d=null,s=null,v=null,et.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(R.width,R.height,!1),T!==null){let J=T.camera;J.fov=T.fov,J.zoom=T.zoom,J.updateProjectionMatrix(),T=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&Fe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,n.isPresenting===!0&&Fe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return u!==null?u:m},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return f},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(S=e.getRenderTarget(),s.addEventListener("select",H),s.addEventListener("selectstart",H),s.addEventListener("selectend",H),s.addEventListener("squeeze",H),s.addEventListener("squeezestart",H),s.addEventListener("squeezeend",H),s.addEventListener("end",Y),s.addEventListener("inputsourceschange",X),M.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(R),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let xe=null,Oe=null,Me=null;M.depth&&(Me=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,xe=M.stencil?fi:An,Oe=M.stencil?ys:yn);let ze={colorFormat:t.RGBA8,depthFormat:Me,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(ze),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),v=new Yt(u.textureWidth,u.textureHeight,{format:on,type:Jt,depthTexture:new ai(u.textureWidth,u.textureHeight,Oe,void 0,void 0,void 0,void 0,void 0,void 0,xe),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let xe={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,xe),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),v=new Yt(m.framebufferWidth,m.framebufferHeight,{format:on,type:Jt,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1,storeMultisampledDepthBuffer:m.ignoreDepthValues===!1,storeMultisampledStencilBuffer:m.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),et.setContext(s),et.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function X(J){for(let ee=0;ee<J.removed.length;ee++){let xe=J.removed[ee],Oe=w.indexOf(xe);Oe>=0&&(w[Oe]=null,E[Oe].disconnect(xe))}for(let ee=0;ee<J.added.length;ee++){let xe=J.added[ee],Oe=w.indexOf(xe);if(Oe===-1){for(let ze=0;ze<E.length;ze++)if(ze>=w.length){w.push(xe),Oe=ze;break}else if(w[ze]===null){w[ze]=xe,Oe=ze;break}if(Oe===-1)break}let Me=E[Oe];Me&&Me.connect(xe)}}let z=new F,q=new F;function j(J,ee,xe){z.setFromMatrixPosition(ee.matrixWorld),q.setFromMatrixPosition(xe.matrixWorld);let Oe=z.distanceTo(q),Me=ee.projectionMatrix.elements,ze=xe.projectionMatrix.elements,ct=Me[14]/(Me[10]-1),ne=Me[14]/(Me[10]+1),se=(Me[9]+1)/Me[5],re=(Me[9]-1)/Me[5],ae=(Me[8]-1)/Me[0],ce=(ze[8]+1)/ze[0],Ue=ct*ae,De=ct*ce,Ve=Oe/(-ae+ce),He=Ve*-ae;if(ee.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(He),J.translateZ(Ve),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Me[10]===-1)J.projectionMatrix.copy(ee.projectionMatrix),J.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{let L=ct+Ve,rt=ne+Ve,Ke=Ue-He,A=De+(Oe-He),x=se*ne/rt*L,O=re*ne/rt*L;J.projectionMatrix.makePerspective(Ke,A,x,O,L,rt),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function Se(J,ee){ee===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(ee.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let ee=J.near,xe=J.far;p.texture!==null&&(p.depthNear>0&&(ee=p.depthNear),p.depthFar>0&&(xe=p.depthFar)),B.near=C.near=P.near=ee,B.far=C.far=P.far=xe,(I!==B.near||U!==B.far)&&(s.updateRenderState({depthNear:B.near,depthFar:B.far}),I=B.near,U=B.far),B.layers.mask=J.layers.mask|6,P.layers.mask=B.layers.mask&-5,C.layers.mask=B.layers.mask&-3;let Oe=J.parent,Me=B.cameras;Se(B,Oe);for(let ze=0;ze<Me.length;ze++)Se(Me[ze],Oe);Me.length===2?j(B,P,C):B.projectionMatrix.copy(P.projectionMatrix),T===null&&J.isPerspectiveCamera&&(T={camera:J,fov:J.fov,zoom:J.zoom}),be(J,B,Oe)};function be(J,ee,xe){xe===null?J.matrix.copy(ee.matrixWorld):(J.matrix.copy(xe.matrixWorld),J.matrix.invert(),J.matrix.multiply(ee.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(ee.projectionMatrix),J.projectionMatrixInverse.copy(ee.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Ma*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(u===null&&m===null))return l},this.setFoveation=function(J){l=J,u!==null&&(u.fixedFoveation=J),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=J)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(B)},this.getCameraTexture=function(J){return g[J]};let nt=null;function Ye(J,ee){if(h=ee.getViewerPose(c||a),f=ee,h!==null){let xe=h.views;m!==null&&(e.setRenderTargetFramebuffer(v,m.framebuffer),e.setRenderTarget(v));let Oe=!1;xe.length!==B.cameras.length&&(B.cameras.length=0,Oe=!0);for(let ne=0;ne<xe.length;ne++){let se=xe[ne],re=null;if(m!==null)re=m.getViewport(se);else{let ce=d.getViewSubImage(u,se);re=ce.viewport,ne===0&&(e.setRenderTargetTextures(v,ce.colorTexture,ce.depthStencilTexture),e.setRenderTarget(v))}let ae=N[ne];ae===void 0&&(ae=new Wt,ae.layers.enable(ne),ae.viewport=new yt,N[ne]=ae),ae.matrix.fromArray(se.transform.matrix),ae.matrix.decompose(ae.position,ae.quaternion,ae.scale),ae.projectionMatrix.fromArray(se.projectionMatrix),ae.projectionMatrixInverse.copy(ae.projectionMatrix).invert(),ae.viewport.set(re.x,re.y,re.width,re.height),ne===0&&(B.matrix.copy(ae.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Oe===!0&&B.cameras.push(ae)}let Me=s.enabledFeatures;if(Me&&Me.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){d=n.getBinding();let ne=d.getDepthInformation(xe[0]);ne&&ne.isValid&&ne.texture&&p.init(ne,s.renderState)}if(Me&&Me.includes("camera-access")&&y){e.state.unbindTexture(),d=n.getBinding();for(let ne=0;ne<xe.length;ne++){let se=xe[ne].camera;if(se){let re=g[se];re||(re=new Ks,g[se]=re);let ae=d.getCameraImage(se);re.sourceTexture=ae}}}}for(let xe=0;xe<E.length;xe++){let Oe=w[xe],Me=E[xe];Oe!==null&&Me!==void 0&&Me.update(Oe,ee,c||a)}nt&&nt(J,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),f=null}let et=new tu;et.setAnimationLoop(Ye),this.setAnimationLoop=function(J){nt=J},this.dispose=function(){}}},Gx=new ut,ou=new Ge;ou.set(-1,0,0,0,1,0,0,0,1);function Hx(i,e){function t(p,g){p.matrixAutoUpdate===!0&&p.updateMatrix(),g.value.copy(p.matrix)}function n(p,g){g.color.getRGB(p.fogColor.value,_c(i)),g.isFog?(p.fogNear.value=g.near,p.fogFar.value=g.far):g.isFogExp2&&(p.fogDensity.value=g.density)}function s(p,g,M,S,v){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(p,g):g.isMeshLambertMaterial?(r(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(p,g),d(p,g)):g.isMeshPhongMaterial?(r(p,g),h(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(p,g),u(p,g),g.isMeshPhysicalMaterial&&m(p,g,v)):g.isMeshMatcapMaterial?(r(p,g),f(p,g)):g.isMeshDepthMaterial?r(p,g):g.isMeshDistanceMaterial?(r(p,g),y(p,g)):g.isMeshNormalMaterial?r(p,g):g.isLineBasicMaterial?(a(p,g),g.isLineDashedMaterial&&o(p,g)):g.isPointsMaterial?l(p,g,M,S):g.isSpriteMaterial?c(p,g):g.isShadowMaterial?(p.color.value.copy(g.color),p.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(p,g){p.opacity.value=g.opacity,g.color&&p.diffuse.value.copy(g.color),g.emissive&&p.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(p.map.value=g.map,t(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.bumpMap&&(p.bumpMap.value=g.bumpMap,t(g.bumpMap,p.bumpMapTransform),p.bumpScale.value=g.bumpScale,g.side===Vt&&(p.bumpScale.value*=-1)),g.normalMap&&(p.normalMap.value=g.normalMap,t(g.normalMap,p.normalMapTransform),p.normalScale.value.copy(g.normalScale),g.side===Vt&&p.normalScale.value.negate()),g.displacementMap&&(p.displacementMap.value=g.displacementMap,t(g.displacementMap,p.displacementMapTransform),p.displacementScale.value=g.displacementScale,p.displacementBias.value=g.displacementBias),g.emissiveMap&&(p.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,p.emissiveMapTransform)),g.specularMap&&(p.specularMap.value=g.specularMap,t(g.specularMap,p.specularMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest);let M=e.get(g),S=M.envMap,v=M.envMapRotation;S&&(p.envMap.value=S,p.envMapRotation.value.setFromMatrix4(Gx.makeRotationFromEuler(v)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(ou),p.reflectivity.value=g.reflectivity,p.ior.value=g.ior,p.refractionRatio.value=g.refractionRatio),g.lightMap&&(p.lightMap.value=g.lightMap,p.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,p.lightMapTransform)),g.aoMap&&(p.aoMap.value=g.aoMap,p.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,p.aoMapTransform))}function a(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,g.map&&(p.map.value=g.map,t(g.map,p.mapTransform))}function o(p,g){p.dashSize.value=g.dashSize,p.totalSize.value=g.dashSize+g.gapSize,p.scale.value=g.scale}function l(p,g,M,S){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.size.value=g.size*M,p.scale.value=S*.5,g.map&&(p.map.value=g.map,t(g.map,p.uvTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function c(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.rotation.value=g.rotation,g.map&&(p.map.value=g.map,t(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function h(p,g){p.specular.value.copy(g.specular),p.shininess.value=Math.max(g.shininess,1e-4)}function d(p,g){g.gradientMap&&(p.gradientMap.value=g.gradientMap)}function u(p,g){p.metalness.value=g.metalness,g.metalnessMap&&(p.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,p.metalnessMapTransform)),p.roughness.value=g.roughness,g.roughnessMap&&(p.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,p.roughnessMapTransform)),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)}function m(p,g,M){p.ior.value=g.ior,g.sheen>0&&(p.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),p.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(p.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,p.sheenColorMapTransform)),g.sheenRoughnessMap&&(p.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,p.sheenRoughnessMapTransform))),g.clearcoat>0&&(p.clearcoat.value=g.clearcoat,p.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(p.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,p.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(p.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Vt&&p.clearcoatNormalScale.value.negate())),g.dispersion>0&&(p.dispersion.value=g.dispersion),g.retroreflectivity>0&&(p.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(p.iridescence.value=g.iridescence,p.iridescenceIOR.value=g.iridescenceIOR,p.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(p.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,p.iridescenceMapTransform)),g.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),g.transmission>0&&(p.transmission.value=g.transmission,p.transmissionSamplerMap.value=M.texture,p.transmissionSamplerSize.value.set(M.width,M.height),g.transmissionMap&&(p.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,p.transmissionMapTransform)),p.thickness.value=g.thickness,g.thicknessMap&&(p.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=g.attenuationDistance,p.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(p.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(p.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=g.specularIntensity,p.specularColor.value.copy(g.specularColor),g.specularColorMap&&(p.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,p.specularColorMapTransform)),g.specularIntensityMap&&(p.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,p.specularIntensityMapTransform))}function f(p,g){g.matcap&&(p.matcap.value=g.matcap)}function y(p,g){let M=e.get(g).light;p.referencePosition.value.setFromMatrixPosition(M.matrixWorld),p.nearDistance.value=M.shadow.camera.near,p.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Wx(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,E){let w=E.program;n.uniformBlockBinding(v,w)}function c(v,E){let w=s[v.id];w===void 0&&(p(v),w=h(v),s[v.id]=w,v.addEventListener("dispose",M));let R=E.program;n.updateUBOMapping(v,R);let _=e.render.frame;r[v.id]!==_&&(u(v),r[v.id]=_)}function h(v){let E=d();v.__bindingPointIndex=E;let w=i.createBuffer(),R=v.__size,_=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,R,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,w),w}function d(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return Be("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(v){let E=s[v.id],w=v.uniforms,R=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let _=0,T=w.length;_<T;_++){let P=w[_];if(Array.isArray(P))for(let C=0,N=P.length;C<N;C++)m(P[C],_,C,R);else m(P,_,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(v,E,w,R){if(y(v,E,w,R)===!0){let _=v.__offset,T=v.value;if(Array.isArray(T)){let P=0;for(let C=0;C<T.length;C++){let N=T[C],B=g(N);f(N,v.__data,P),typeof N!="number"&&typeof N!="boolean"&&!N.isMatrix3&&!ArrayBuffer.isView(N)&&(P+=B.storage/Float32Array.BYTES_PER_ELEMENT)}}else f(T,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,v.__data)}}function f(v,E,w){typeof v=="number"||typeof v=="boolean"?E[0]=v:v.isMatrix3?(E[0]=v.elements[0],E[1]=v.elements[1],E[2]=v.elements[2],E[3]=0,E[4]=v.elements[3],E[5]=v.elements[4],E[6]=v.elements[5],E[7]=0,E[8]=v.elements[6],E[9]=v.elements[7],E[10]=v.elements[8],E[11]=0):ArrayBuffer.isView(v)?E.set(new v.constructor(v.buffer,v.byteOffset,E.length)):v.toArray(E,w)}function y(v,E,w,R){let _=v.value,T=E+"_"+w;if(R[T]===void 0)return typeof _=="number"||typeof _=="boolean"?R[T]=_:ArrayBuffer.isView(_)?R[T]=_.slice():R[T]=_.clone(),!0;{let P=R[T];if(typeof _=="number"||typeof _=="boolean"){if(P!==_)return R[T]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(P.equals(_)===!1)return P.copy(_),!0}}return!1}function p(v){let E=v.uniforms,w=0,R=16;for(let T=0,P=E.length;T<P;T++){let C=Array.isArray(E[T])?E[T]:[E[T]];for(let N=0,B=C.length;N<B;N++){let I=C[N],U=Array.isArray(I.value)?I.value:[I.value];for(let H=0,Y=U.length;H<Y;H++){let X=U[H],z=g(X),q=w%R,j=q%z.boundary,Se=q+j;w+=j,Se!==0&&R-Se<z.storage&&(w+=R-Se),I.__data=new Float32Array(z.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=w,w+=z.storage}}}let _=w%R;return _>0&&(w+=R-_),v.__size=w,v.__cache={},this}function g(v){let E={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(E.boundary=4,E.storage=4):v.isVector2?(E.boundary=8,E.storage=8):v.isVector3||v.isColor?(E.boundary=16,E.storage=12):v.isVector4?(E.boundary=16,E.storage=16):v.isMatrix3?(E.boundary=48,E.storage=48):v.isMatrix4?(E.boundary=64,E.storage=64):v.isTexture?Fe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(E.boundary=16,E.storage=v.byteLength):Fe("WebGLRenderer: Unsupported uniform value type.",v),E}function M(v){let E=v.target;E.removeEventListener("dispose",M);let w=a.indexOf(E.__bindingPointIndex);a.splice(w,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function S(){for(let v in s)i.deleteBuffer(s[v]);a=[],s={},r={}}return{bind:l,update:c,dispose:S}}var Xx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Un=null;function qx(){return Un===null&&(Un=new Ai(Xx,16,16,pi,_n),Un.name="DFG_LUT",Un.minFilter=Tt,Un.magFilter=Tt,Un.wrapS=Tn,Un.wrapT=Tn,Un.generateMipmaps=!1,Un.needsUpdate=!0),Un}var Xo=class{constructor(e={}){let{canvas:t=Md(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:m=Jt}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;let y=m,p=new Set([ao,ro,so]),g=new Set([Jt,yn,xs,ys,to,no]),M=new Uint32Array(4),S=new Int32Array(4),v=new F,E=null,w=null,R=[],_=[],T=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=xn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,C=!1,N=null,B=null,I=null,U=null;this._outputColorSpace=Nt;let H=0,Y=0,X=null,z=-1,q=null,j=new yt,Se=new yt,be=null,nt=new Je(0),Ye=0,et=t.width,J=t.height,ee=1,xe=null,Oe=null,Me=new yt(0,0,et,J),ze=new yt(0,0,et,J),ct=!1,ne=new cs,se=!1,re=!1,ae=new ut,ce=new F,Ue=new yt,De={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ve=!1;function He(){return X===null?ee:1}let L=n;function rt(b,D){return t.getContext(b,D)}let Ke,A,x,O,W,$,oe,le,K,te,he,Pe,me,de,Le,ke,We,k,ue,Q,fe,ve,ie;try{let b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",ft,!1),t.addEventListener("webglcontextrestored",at,!1),t.addEventListener("webglcontextcreationerror",dn,!1),L===null){let D="webgl2";if(L=rt(D,b),L===null)throw rt(D)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ne()}catch(b){throw t.removeEventListener("webglcontextlost",ft,!1),t.removeEventListener("webglcontextrestored",at,!1),t.removeEventListener("webglcontextcreationerror",dn,!1),Be("WebGLRenderer: "+b.message),b}function Ne(){Ke=new Q0(L),Ke.init(),fe=new Bx(L,Ke),A=new H0(L,Ke,e,fe),x=new Fx(L,Ke),A.reversedDepthBuffer&&u&&x.buffers.depth.setReversed(!0),B=L.createFramebuffer(),I=L.createFramebuffer(),U=L.createFramebuffer(),O=new ng(L),W=new Sx,$=new Ox(L,Ke,x,W,A,fe,O),oe=new j0(P),le=new sp(L),ve=new V0(L,le),K=new eg(L,le,O,ve),te=new sg(L,K,le,ve,O),k=new ig(L,A,$),Le=new W0(W),he=new Mx(P,oe,Ke,A,ve,Le),Pe=new Hx(P,W),me=new Ex,de=new Px(Ke),We=new z0(P,oe,x,te,f,l),ke=new kx(P,te,A),ie=new Wx(L,O,A,x),ue=new G0(L,Ke,O),Q=new tg(L,Ke,O),O.programs=he.programs,P.capabilities=A,P.extensions=Ke,P.properties=W,P.renderLists=me,P.shadowMap=ke,P.state=x,P.info=O}y!==Jt&&(T=new ag(y,t.width,t.height,o,s,r));let Re=new Fc(P,L);this.xr=Re,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let b=Ke.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=Ke.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(b){b!==void 0&&(ee=b,this.setSize(et,J,!1))},this.getSize=function(b){return b.set(et,J)},this.setSize=function(b,D,Z=!0){if(Re.isPresenting){Fe("WebGLRenderer: Can't change size while VR device is presenting.");return}et=b,J=D,t.width=Math.floor(b*ee),t.height=Math.floor(D*ee),Z===!0&&(t.style.width=b+"px",t.style.height=D+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,b,D)},this.getDrawingBufferSize=function(b){return b.set(et*ee,J*ee).floor()},this.setDrawingBufferSize=function(b,D,Z){et=b,J=D,ee=Z,t.width=Math.floor(b*Z),t.height=Math.floor(D*Z),this.setViewport(0,0,b,D)},this.setEffects=function(b){if(y===Jt){Be("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let D=0;D<b.length;D++)if(b[D].isOutputPass===!0){Fe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(j)},this.getViewport=function(b){return b.copy(Me)},this.setViewport=function(b,D,Z,V){b.isVector4?Me.set(b.x,b.y,b.z,b.w):Me.set(b,D,Z,V),x.viewport(j.copy(Me).multiplyScalar(ee).round())},this.getScissor=function(b){return b.copy(ze)},this.setScissor=function(b,D,Z,V){b.isVector4?ze.set(b.x,b.y,b.z,b.w):ze.set(b,D,Z,V),x.scissor(Se.copy(ze).multiplyScalar(ee).round())},this.getScissorTest=function(){return ct},this.setScissorTest=function(b){x.setScissorTest(ct=b)},this.setOpaqueSort=function(b){xe=b},this.setTransparentSort=function(b){Oe=b},this.getClearColor=function(b){return b.copy(We.getClearColor())},this.setClearColor=function(){We.setClearColor(...arguments)},this.getClearAlpha=function(){return We.getClearAlpha()},this.setClearAlpha=function(){We.setClearAlpha(...arguments)},this.clear=function(b=!0,D=!0,Z=!0){let V=0;if(b){let G=!1;if(X!==null){let _e=X.texture.format;G=p.has(_e)}if(G){let _e=X.texture.type,Ee=g.has(_e),ye=We.getClearColor(),Ae=We.getClearAlpha(),Ie=ye.r,Ze=ye.g,je=ye.b;Ee?(M[0]=Ie,M[1]=Ze,M[2]=je,M[3]=Ae,L.clearBufferuiv(L.COLOR,0,M)):(S[0]=Ie,S[1]=Ze,S[2]=je,S[3]=Ae,L.clearBufferiv(L.COLOR,0,S))}else V|=L.COLOR_BUFFER_BIT}D&&(V|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Z&&(V|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&L.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),N=b},this.dispose=function(){t.removeEventListener("webglcontextlost",ft,!1),t.removeEventListener("webglcontextrestored",at,!1),t.removeEventListener("webglcontextcreationerror",dn,!1),We.dispose(),me.dispose(),de.dispose(),W.dispose(),oe.dispose(),te.dispose(),ve.dispose(),ie.dispose(),he.dispose(),Re.dispose(),Re.removeEventListener("sessionstart",Jc),Re.removeEventListener("sessionend",$c),_i.stop()};function ft(b){b.preventDefault(),xc("WebGLRenderer: Context Lost."),C=!0}function at(){xc("WebGLRenderer: Context Restored."),C=!1;let b=O.autoReset,D=ke.enabled,Z=ke.autoUpdate,V=ke.needsUpdate,G=ke.type;Ne(),O.autoReset=b,ke.enabled=D,ke.autoUpdate=Z,ke.needsUpdate=V,ke.type=G}function dn(b){Be("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Mn(b){let D=b.target;D.removeEventListener("dispose",Mn),Cu(D)}function Cu(b){Ru(b),W.remove(b)}function Ru(b){let D=W.get(b).programs;D!==void 0&&(D.forEach(function(Z){he.releaseProgram(Z)}),b.isShaderMaterial&&he.releaseShaderCache(b))}this.renderBufferDirect=function(b,D,Z,V,G,_e){D===null&&(D=De);let Ee=G.isMesh&&G.matrixWorld.determinantAffine()<0,ye=Lu(b,D,Z,V,G);x.setMaterial(V,Ee);let Ae=Z.index,Ie=1;if(V.wireframe===!0){if(Ae=K.getWireframeAttribute(Z),Ae===void 0)return;Ie=2}let Ze=Z.drawRange,je=Z.attributes.position,Ce=Ze.start*Ie,ot=(Ze.start+Ze.count)*Ie;_e!==null&&(Ce=Math.max(Ce,_e.start*Ie),ot=Math.min(ot,(_e.start+_e.count)*Ie)),Ae!==null?(Ce=Math.max(Ce,0),ot=Math.min(ot,Ae.count)):je!=null&&(Ce=Math.max(Ce,0),ot=Math.min(ot,je.count));let Mt=ot-Ce;if(Mt<0||Mt===1/0)return;ve.setup(G,V,ye,Z,Ae);let gt,dt=ue;if(Ae!==null&&(gt=le.get(Ae),dt=Q,dt.setIndex(gt)),G.isMesh)V.wireframe===!0?(x.setLineWidth(V.wireframeLinewidth*He()),dt.setMode(L.LINES)):dt.setMode(L.TRIANGLES);else if(G.isLine){let Dt=V.linewidth;Dt===void 0&&(Dt=1),x.setLineWidth(Dt*He()),G.isLineSegments?dt.setMode(L.LINES):G.isLineLoop?dt.setMode(L.LINE_LOOP):dt.setMode(L.LINE_STRIP)}else G.isPoints?dt.setMode(L.POINTS):G.isSprite&&dt.setMode(L.TRIANGLES);if(G.isBatchedMesh)if(Ke.get("WEBGL_multi_draw"))dt.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{let Dt=G._multiDrawStarts,we=G._multiDrawCounts,zt=G._multiDrawCount,it=Ae?le.get(Ae).bytesPerElement:1,sn=W.get(V).currentProgram.getUniforms();for(let Sn=0;Sn<zt;Sn++)sn.setValue(L,"_gl_DrawID",Sn),dt.render(Dt[Sn]/it,we[Sn])}else if(G.isInstancedMesh)dt.renderInstances(Ce,Mt,G.count);else if(Z.isInstancedBufferGeometry){let Dt=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,we=Math.min(Z.instanceCount,Dt);dt.renderInstances(Ce,Mt,we)}else dt.render(Ce,Mt)};function Zc(b,D,Z,V){N!==null&&b.isNodeMaterial&&N.setObject(V,b),se===!0&&Le.setState(b,Z,!1),b.transparent===!0&&b.side===Ln&&b.forceSinglePass===!1?(b.side=Vt,b.needsUpdate=!0,Or(b,D,V),b.side=di,b.needsUpdate=!0,Or(b,D,V),b.side=Ln):Or(b,D,V)}this.compile=function(b,D,Z=null){Z===null&&(Z=b),N!==null&&N.renderStart(b,D,Z),w=de.get(Z),w.init(D),_.push(w),Z.traverseVisible(function(G){G.isLight&&G.layers.test(D.layers)&&(w.pushLight(G),G.castShadow&&w.pushShadow(G))}),b!==Z&&b.traverseVisible(function(G){G.isLight&&G.layers.test(D.layers)&&(w.pushLight(G),G.castShadow&&w.pushShadow(G))}),w.setupLights(),N!==null&&N.updateLights(w.state.lightsArray),re=this.localClippingEnabled,se=Le.init(this.clippingPlanes,re),se===!0&&Le.setGlobalState(this.clippingPlanes,D),N!==null&&ke.render(w.state.shadowsArray,Z,D);let V=new Set;return b.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;let _e=G.material;if(_e)if(Array.isArray(_e))for(let Ee=0;Ee<_e.length;Ee++){let ye=_e[Ee];Zc(ye,Z,D,G),V.add(ye)}else Zc(_e,Z,D,G),V.add(_e)}),w=_.pop(),N!==null&&N.renderEnd(),V},this.compileAsync=function(b,D,Z=null){let V=this.compile(b,D,Z);return new Promise(G=>{function _e(){if(V.forEach(function(Ee){let Ae=W.get(Ee).currentProgram;(Ae===void 0||Ae.isReady())&&V.delete(Ee)}),V.size===0){G(b);return}setTimeout(_e,10)}Ke.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let il=null;function Iu(b){il&&il(b)}function Jc(){_i.stop()}function $c(){_i.start()}let _i=new tu;_i.setAnimationLoop(Iu),typeof self<"u"&&_i.setContext(self),this.setAnimationLoop=function(b){il=b,Re.setAnimationLoop(b),b===null?_i.stop():_i.start()},Re.addEventListener("sessionstart",Jc),Re.addEventListener("sessionend",$c),this.render=function(b,D){if(D!==void 0&&D.isCamera!==!0){Be("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;N!==null&&N.renderStart(b,D);let Z=Re.enabled===!0&&Re.isPresenting===!0,V=T!==null&&(X===null||Z)&&T.begin(P,X);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),Re.enabled===!0&&Re.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(Re.cameraAutoUpdate===!0&&Re.updateCamera(D),D=Re.getCamera()),b.isScene===!0&&b.onBeforeRender(P,b,D,X),w=de.get(b,_.length),w.init(D),w.state.textureUnits=$.getTextureUnits(),_.push(w),ae.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),ne.setFromProjectionMatrix(ae,gn,D.reversedDepth),re=this.localClippingEnabled,se=Le.init(this.clippingPlanes,re),E=me.get(b,R.length),E.init(),R.push(E),Re.enabled===!0&&Re.isPresenting===!0){let Ee=P.xr.getDepthSensingMesh();Ee!==null&&sl(Ee,D,-1/0,P.sortObjects)}sl(b,D,0,P.sortObjects),E.finish(),N!==null&&N.updateLights(w.state.lightsArray),P.sortObjects===!0&&E.sort(xe,Oe),Ve=Re.enabled===!1||Re.isPresenting===!1||Re.hasDepthSensing()===!1,Ve&&We.addToRenderList(E,b),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),se===!0&&Le.beginShadows();let G=w.state.shadowsArray;if(ke.render(G,b,D),se===!0&&Le.endShadows(),(V&&T.hasRenderPass())===!1){let Ee=E.opaque,ye=E.transmissive;if(w.setupLights(),D.isArrayCamera){let Ae=D.cameras;if(ye.length>0)for(let Ie=0,Ze=Ae.length;Ie<Ze;Ie++){let je=Ae[Ie];jc(Ee,ye,b,je)}Ve&&We.render(b);for(let Ie=0,Ze=Ae.length;Ie<Ze;Ie++){let je=Ae[Ie];Kc(E,b,je,je.viewport)}}else ye.length>0&&jc(Ee,ye,b,D),Ve&&We.render(b),Kc(E,b,D)}X!==null&&Y===0&&($.updateMultisampleRenderTarget(X),$.updateRenderTargetMipmap(X)),V&&T.end(P),b.isScene===!0&&b.onAfterRender(P,b,D),ve.resetDefaultState(),z=-1,q=null,_.pop(),_.length>0?(w=_[_.length-1],$.setTextureUnits(w.state.textureUnits),se===!0&&Le.setGlobalState(P.clippingPlanes,w.state.camera)):w=null,R.pop(),R.length>0?E=R[R.length-1]:E=null,N!==null&&N.renderEnd()};function sl(b,D,Z,V){if(b.visible===!1)return;if(b.layers.test(D.layers)){if(b.isGroup)Z=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(D);else if(b.isLightProbeGrid)w.pushLightProbeGrid(b);else if(b.isLight)w.pushLight(b),b.castShadow&&w.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||b.intersectsFrustum(ne)){V&&Ue.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ae);let Ee=te.update(b),ye=b.material;ye.visible&&E.push(b,Ee,ye,Z,Ue.z,null,D)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||b.intersectsFrustum(ne))){let Ee=te.update(b),ye=b.material;if(V&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Ue.copy(b.boundingSphere.center)):(Ee.boundingSphere===null&&Ee.computeBoundingSphere(),Ue.copy(Ee.boundingSphere.center)),Ue.applyMatrix4(b.matrixWorld).applyMatrix4(ae)),Array.isArray(ye)){let Ae=Ee.groups;for(let Ie=0,Ze=Ae.length;Ie<Ze;Ie++){let je=Ae[Ie],Ce=ye[je.materialIndex];Ce&&Ce.visible&&E.push(b,Ee,Ce,Z,Ue.z,je,D)}}else ye.visible&&E.push(b,Ee,ye,Z,Ue.z,null,D)}}let _e=b.children;for(let Ee=0,ye=_e.length;Ee<ye;Ee++)sl(_e[Ee],D,Z,V)}function Kc(b,D,Z,V){let{opaque:G,transmissive:_e,transparent:Ee}=b;w.setupLightsView(Z),se===!0&&Le.setGlobalState(P.clippingPlanes,Z),V&&x.viewport(j.copy(V)),G.length>0&&Fr(G,D,Z),_e.length>0&&Fr(_e,D,Z),Ee.length>0&&Fr(Ee,D,Z),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function jc(b,D,Z,V){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[V.id]===void 0){let Ce=Ke.has("EXT_color_buffer_half_float")||Ke.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[V.id]=new Yt(1,1,{generateMipmaps:!0,type:Ce?_n:Jt,minFilter:Dn,samples:Math.max(4,A.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:tt.workingColorSpace})}let _e=w.state.transmissionRenderTarget[V.id],Ee=V.viewport||j;_e.setSize(Ee.z*P.transmissionResolutionScale,Ee.w*P.transmissionResolutionScale);let ye=P.getRenderTarget(),Ae=P.getActiveCubeFace(),Ie=P.getActiveMipmapLevel();P.setRenderTarget(_e),P.getClearColor(nt),Ye=P.getClearAlpha(),Ye<1&&P.setClearColor(16777215,.5),P.clear(),Ve&&We.render(Z);let Ze=P.toneMapping;P.toneMapping=xn;let je=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),w.setupLightsView(V),se===!0&&Le.setGlobalState(P.clippingPlanes,V),Fr(b,Z,V),$.updateMultisampleRenderTarget(_e),$.updateRenderTargetMipmap(_e),Ke.has("WEBGL_multisampled_render_to_texture")===!1){let Ce=!1;for(let ot=0,Mt=D.length;ot<Mt;ot++){let gt=D[ot],{object:dt,geometry:Dt,material:we,group:zt}=gt;if(we.side===Ln&&dt.layers.test(V.layers)){let it=we.side;we.side=Vt,we.needsUpdate=!0,Qc(dt,Z,V,Dt,we,zt),we.side=it,we.needsUpdate=!0,Ce=!0}}Ce===!0&&($.updateMultisampleRenderTarget(_e),$.updateRenderTargetMipmap(_e))}P.setRenderTarget(ye,Ae,Ie),P.setClearColor(nt,Ye),je!==void 0&&(V.viewport=je),P.toneMapping=Ze}function Fr(b,D,Z){let V=D.isScene===!0?D.overrideMaterial:null;for(let G=0,_e=b.length;G<_e;G++){let Ee=b[G],{object:ye,geometry:Ae,group:Ie}=Ee,Ze=Ee.material;Ze.allowOverride===!0&&V!==null&&(Ze=V),ye.layers.test(Z.layers)&&Qc(ye,D,Z,Ae,Ze,Ie)}}function Qc(b,D,Z,V,G,_e){N!==null&&G.isNodeMaterial&&N.setObject(b,G),b.onBeforeRender(P,D,Z,V,G,_e),b.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),G.onBeforeRender(P,D,Z,V,b,_e),G.transparent===!0&&G.side===Ln&&G.forceSinglePass===!1?(G.side=Vt,G.needsUpdate=!0,P.renderBufferDirect(Z,D,V,G,b,_e),G.side=di,G.needsUpdate=!0,P.renderBufferDirect(Z,D,V,G,b,_e),G.side=Ln):P.renderBufferDirect(Z,D,V,G,b,_e),b.onAfterRender(P,D,Z,V,G,_e)}function Or(b,D,Z){D.isScene!==!0&&(D=De);let V=W.get(b),G=w.state.lights,_e=w.state.shadowsArray,Ee=G.state.version,ye=he.getParameters(b,G.state,_e,D,Z,w.state.lightProbeGridArray),Ae=he.getProgramCacheKey(ye),Ie=V.programs;V.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?D.environment:null,V.fog=D.fog;let Ze=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;V.envMap=oe.get(b.envMap||V.environment,Ze),V.envMapRotation=V.environment!==null&&b.envMap===null?D.environmentRotation:b.envMapRotation,Ie===void 0&&(b.addEventListener("dispose",Mn),Ie=new Map,V.programs=Ie);let je=Ie.get(Ae);if(je!==void 0){if(V.currentProgram===je&&V.lightsStateVersion===Ee)return th(b,ye),je}else ye.uniforms=he.getUniforms(b),N!==null&&b.isNodeMaterial&&N.build(b,Z,ye),b.onBeforeCompile(ye,P),je=he.acquireProgram(ye,Ae),Ie.set(Ae,je),V.uniforms=ye.uniforms;let Ce=V.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Ce.clippingPlanes=Le.uniform),th(b,ye),V.needsLights=Du(b),V.lightsStateVersion=Ee,V.needsLights&&(Ce.ambientLightColor.value=G.state.ambient,Ce.lightProbe.value=G.state.probe,Ce.sunLights.value=G.state.sun,Ce.sunLightShadows.value=G.state.sunShadow,Ce.directionalLights.value=G.state.directional,Ce.directionalLightShadows.value=G.state.directionalShadow,Ce.spotLights.value=G.state.spot,Ce.spotLightShadows.value=G.state.spotShadow,Ce.rectAreaLights.value=G.state.rectArea,Ce.ltc_1.value=G.state.rectAreaLTC1,Ce.ltc_2.value=G.state.rectAreaLTC2,Ce.pointLights.value=G.state.point,Ce.pointLightShadows.value=G.state.pointShadow,Ce.hemisphereLights.value=G.state.hemi,Ce.sunShadowMatrix.value=G.state.sunShadowMatrix,Ce.sunShadowCascade.value=G.state.sunShadowCascade,Ce.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Ce.spotLightMatrix.value=G.state.spotLightMatrix,Ce.spotLightMap.value=G.state.spotLightMap,Ce.pointShadowMatrix.value=G.state.pointShadowMatrix),V.lightProbeGrid=w.state.lightProbeGridArray.length>0,V.currentProgram=je,V.uniformsList=null,je}function eh(b){if(b.uniformsList===null){let D=b.currentProgram.getUniforms();b.uniformsList=Ms.seqWithValue(D.seq,b.uniforms)}return b.uniformsList}function th(b,D){let Z=W.get(b);Z.outputColorSpace=D.outputColorSpace,Z.batching=D.batching,Z.batchingColor=D.batchingColor,Z.instancing=D.instancing,Z.instancingColor=D.instancingColor,Z.instancingMorph=D.instancingMorph,Z.skinning=D.skinning,Z.morphTargets=D.morphTargets,Z.morphNormals=D.morphNormals,Z.morphColors=D.morphColors,Z.morphTargetsCount=D.morphTargetsCount,Z.numClippingPlanes=D.numClippingPlanes,Z.numIntersection=D.numClipIntersection,Z.vertexAlphas=D.vertexAlphas,Z.vertexTangents=D.vertexTangents,Z.toneMapping=D.toneMapping}function Pu(b,D){if(b.length===0)return null;if(b.length===1)return b[0].texture!==null?b[0]:null;v.setFromMatrixPosition(D.matrixWorld);for(let Z=0,V=b.length;Z<V;Z++){let G=b[Z];if(G.texture!==null&&G.boundingBox.containsPoint(v))return G}return null}function Lu(b,D,Z,V,G){D.isScene!==!0&&(D=De),$.resetTextureUnits();let _e=D.fog,Ee=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?D.environment:null,ye=X===null?P.outputColorSpace:X.isXRRenderTarget===!0?X.texture.colorSpace:tt.workingColorSpace,Ae=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,Ie=oe.get(V.envMap||Ee,Ae),Ze=V.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,je=!!Z.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Ce=!!Z.morphAttributes.position,ot=!!Z.morphAttributes.normal,Mt=!!Z.morphAttributes.color,gt=xn;V.toneMapped&&(X===null||X.isXRRenderTarget===!0)&&(gt=P.toneMapping);let dt=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Dt=dt!==void 0?dt.length:0,we=W.get(V),zt=w.state.lights;if(se===!0&&(re===!0||b!==q)){let pt=b===q&&V.id===z;Le.setState(V,b,pt)}let it=!1;V.version===we.__version?(we.needsLights&&we.lightsStateVersion!==zt.state.version||we.outputColorSpace!==ye||G.isBatchedMesh&&we.batching===!1||!G.isBatchedMesh&&we.batching===!0||G.isBatchedMesh&&we.batchingColor===!0&&G._colorsTexture===null||G.isBatchedMesh&&we.batchingColor===!1&&G._colorsTexture!==null||G.isInstancedMesh&&we.instancing===!1||!G.isInstancedMesh&&we.instancing===!0||G.isSkinnedMesh&&we.skinning===!1||!G.isSkinnedMesh&&we.skinning===!0||G.isInstancedMesh&&we.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&we.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&we.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&we.instancingMorph===!1&&G.morphTexture!==null||we.envMap!==Ie||V.fog===!0&&we.fog!==_e||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==Le.numPlanes||we.numIntersection!==Le.numIntersection)||we.vertexAlphas!==Ze||we.vertexTangents!==je||we.morphTargets!==Ce||we.morphNormals!==ot||we.morphColors!==Mt||we.toneMapping!==gt||we.morphTargetsCount!==Dt||!!we.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(it=!0):(it=!0,we.__version=V.version);let sn=we.currentProgram;it===!0&&(sn=Or(V,D,G),N&&V.isNodeMaterial&&N.onUpdateProgram(V,sn,we));let Sn=!1,Zn=!1,zi=!1,ht=sn.getUniforms(),bt=we.uniforms;if(x.useProgram(sn.program)&&(Sn=!0,Zn=!0,zi=!0),V.id!==z&&(z=V.id,Zn=!0),we.needsLights){let pt=Pu(w.state.lightProbeGridArray,G);we.lightProbeGrid!==pt&&(we.lightProbeGrid=pt,Zn=!0)}if(Sn||q!==b){x.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),ht.setValue(L,"projectionMatrix",b.projectionMatrix),ht.setValue(L,"viewMatrix",b.matrixWorldInverse);let $n=ht.map.cameraPosition;$n!==void 0&&$n.setValue(L,ce.setFromMatrixPosition(b.matrixWorld)),A.logarithmicDepthBuffer&&ht.setValue(L,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&ht.setValue(L,"isOrthographic",b.isOrthographicCamera===!0),q!==b&&(q=b,Zn=!0,zi=!0)}if(we.needsLights&&(zt.state.sunShadowMap.length>0&&ht.setValue(L,"sunShadowMap",zt.state.sunShadowMap,$),zt.state.directionalShadowMap.length>0&&ht.setValue(L,"directionalShadowMap",zt.state.directionalShadowMap,$),zt.state.spotShadowMap.length>0&&ht.setValue(L,"spotShadowMap",zt.state.spotShadowMap,$),zt.state.pointShadowMap.length>0&&ht.setValue(L,"pointShadowMap",zt.state.pointShadowMap,$)),G.isSkinnedMesh){ht.setOptional(L,G,"bindMatrix"),ht.setOptional(L,G,"bindMatrixInverse");let pt=G.skeleton;pt&&(pt.boneTexture===null&&pt.computeBoneTexture(),ht.setValue(L,"boneTexture",pt.boneTexture,$))}G.isBatchedMesh&&(ht.setOptional(L,G,"batchingTexture"),ht.setValue(L,"batchingTexture",G._matricesTexture,$),ht.setOptional(L,G,"batchingIdTexture"),ht.setValue(L,"batchingIdTexture",G._indirectTexture,$),ht.setOptional(L,G,"batchingColorTexture"),G._colorsTexture!==null&&ht.setValue(L,"batchingColorTexture",G._colorsTexture,$));let Jn=Z.morphAttributes;if((Jn.position!==void 0||Jn.normal!==void 0||Jn.color!==void 0)&&k.update(G,Z,sn),(Zn||we.receiveShadow!==G.receiveShadow)&&(we.receiveShadow=G.receiveShadow,ht.setValue(L,"receiveShadow",G.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&D.environment!==null&&(bt.envMapIntensity.value=D.environmentIntensity),bt.dfgLUT!==void 0&&(bt.dfgLUT.value=qx()),Zn){if(ht.setValue(L,"toneMappingExposure",P.toneMappingExposure),we.needsLights&&Nu(bt,zi),_e&&V.fog===!0&&Pe.refreshFogUniforms(bt,_e),Pe.refreshMaterialUniforms(bt,V,ee,J,w.state.transmissionRenderTarget[b.id]),we.needsLights&&we.lightProbeGrid){let pt=we.lightProbeGrid;bt.probesSH.value=pt.texture,bt.probesMin.value.copy(pt.boundingBox.min),bt.probesMax.value.copy(pt.boundingBox.max),bt.probesResolution.value.copy(pt.resolution)}Ms.upload(L,eh(we),bt,$)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Ms.upload(L,eh(we),bt,$),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&ht.setValue(L,"center",G.center),ht.setValue(L,"modelViewMatrix",G.modelViewMatrix),ht.setValue(L,"normalMatrix",G.normalMatrix),ht.setValue(L,"modelMatrix",G.matrixWorld),V.uniformsGroups!==void 0){let pt=V.uniformsGroups;for(let $n=0,Vi=pt.length;$n<Vi;$n++){let ih=pt[$n];ie.update(ih,sn),ie.bind(ih,sn)}}return sn}function Nu(b,D){b.ambientLightColor.needsUpdate=D,b.lightProbe.needsUpdate=D,b.sunLights.needsUpdate=D,b.sunLightShadows.needsUpdate=D,b.directionalLights.needsUpdate=D,b.directionalLightShadows.needsUpdate=D,b.pointLights.needsUpdate=D,b.pointLightShadows.needsUpdate=D,b.spotLights.needsUpdate=D,b.spotLightShadows.needsUpdate=D,b.rectAreaLights.needsUpdate=D,b.hemisphereLights.needsUpdate=D}function Du(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return X},this.setRenderTargetTextures=function(b,D,Z){let V=W.get(b);V.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),W.get(b.texture).__webglTexture=D,W.get(b.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:Z,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,D){let Z=W.get(b);Z.__webglFramebuffer=D,Z.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(b,D=0,Z=0){X=b,H=D,Y=Z;let V=null,G=!1,_e=!1;if(b){let ye=W.get(b);if(ye.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(L.FRAMEBUFFER,ye.__webglFramebuffer),j.copy(b.viewport),Se.copy(b.scissor),be=b.scissorTest,x.viewport(j),x.scissor(Se),x.setScissorTest(be),z=-1;return}else if(ye.__webglFramebuffer===void 0)$.setupRenderTarget(b);else if(ye.__hasExternalTextures)$.rebindTextures(b,W.get(b.texture).__webglTexture,W.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let Ze=b.depthTexture;if(ye.__boundDepthTexture!==Ze){if(Ze!==null&&W.has(Ze)&&(b.width!==Ze.image.width||b.height!==Ze.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");$.setupDepthRenderbuffer(b)}}let Ae=b.texture;(Ae.isData3DTexture||Ae.isDataArrayTexture||Ae.isCompressedArrayTexture)&&(_e=!0);let Ie=W.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ie[D])?V=Ie[D][Z]:V=Ie[D],G=!0):b.samples>0&&$.useMultisampledRTT(b)===!1?V=W.get(b).__webglMultisampledFramebuffer:Array.isArray(Ie)?V=Ie[Z]:V=Ie,j.copy(b.viewport),Se.copy(b.scissor),be=b.scissorTest}else j.copy(Me).multiplyScalar(ee).floor(),Se.copy(ze).multiplyScalar(ee).floor(),be=ct;if(Z!==0&&(V=B),x.bindFramebuffer(L.FRAMEBUFFER,V)&&x.drawBuffers(b,V),x.viewport(j),x.scissor(Se),x.setScissorTest(be),G){let ye=W.get(b.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+D,ye.__webglTexture,Z)}else if(_e){let ye=D;for(let Ae=0;Ae<b.textures.length;Ae++){let Ie=W.get(b.textures[Ae]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Ae,Ie.__webglTexture,Z,ye)}}else if(b!==null&&Z!==0){let ye=W.get(b.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ye.__webglTexture,Z)}z=-1};function nh(b){let D=W.get(b);return(D.__readFormat!==b.format||D.__readType!==b.type)&&(D.__readFormat=b.format,D.__readType=b.type,D.__formatReadable=A.textureFormatReadable(b.format),D.__typeReadable=A.textureTypeReadable(b.type)),D}this.readRenderTargetPixels=function(b,D,Z,V,G,_e,Ee,ye=0){if(!(b&&b.isWebGLRenderTarget)){Be("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ae=W.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ee!==void 0&&(Ae=Ae[Ee]),Ae){x.bindFramebuffer(L.FRAMEBUFFER,Ae);try{let Ie=b.textures[ye],Ze=Ie.format,je=Ie.type;b.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+ye);let Ce=nh(Ie);if(Ce.__formatReadable===!1){Be("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ce.__typeReadable===!1){Be("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=b.width-V&&Z>=0&&Z<=b.height-G&&L.readPixels(D,Z,V,G,fe.convert(Ze),fe.convert(je),_e)}finally{let Ie=X!==null?W.get(X).__webglFramebuffer:null;x.bindFramebuffer(L.FRAMEBUFFER,Ie)}}},this.readRenderTargetPixelsAsync=async function(b,D,Z,V,G,_e,Ee,ye=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ae=W.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ee!==void 0&&(Ae=Ae[Ee]),Ae)if(D>=0&&D<=b.width-V&&Z>=0&&Z<=b.height-G){x.bindFramebuffer(L.FRAMEBUFFER,Ae);let Ie=b.textures[ye],Ze=Ie.format,je=Ie.type;b.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+ye);let Ce=nh(Ie);if(Ce.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ce.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ot=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,ot),L.bufferData(L.PIXEL_PACK_BUFFER,_e.byteLength,L.STREAM_READ),L.readPixels(D,Z,V,G,fe.convert(Ze),fe.convert(je),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let Mt=X!==null?W.get(X).__webglFramebuffer:null;x.bindFramebuffer(L.FRAMEBUFFER,Mt);let gt=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await wd(L,gt,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,ot),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,_e),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(ot),L.deleteSync(gt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,D=null,Z=0){let V=Math.pow(2,-Z),G=Math.floor(b.image.width*V),_e=Math.floor(b.image.height*V),Ee=D!==null?D.x:0,ye=D!==null?D.y:0;$.setTexture2D(b,0),L.copyTexSubImage2D(L.TEXTURE_2D,Z,0,0,Ee,ye,G,_e),x.unbindTexture()},this.copyTextureToTexture=function(b,D,Z=null,V=null,G=0,_e=0){let Ee,ye,Ae,Ie,Ze,je,Ce,ot,Mt,gt=b.isCompressedTexture?b.mipmaps[_e]:b.image;if(Z!==null)Ee=Z.max.x-Z.min.x,ye=Z.max.y-Z.min.y,Ae=Z.isBox3?Z.max.z-Z.min.z:1,Ie=Z.min.x,Ze=Z.min.y,je=Z.isBox3?Z.min.z:0;else{let bt=Math.pow(2,-G);Ee=Math.floor(gt.width*bt),ye=Math.floor(gt.height*bt),b.isDataArrayTexture?Ae=gt.depth:b.isData3DTexture?Ae=Math.floor(gt.depth*bt):Ae=1,Ie=0,Ze=0,je=0}V!==null?(Ce=V.x,ot=V.y,Mt=V.z):(Ce=0,ot=0,Mt=0);let dt=fe.convert(D.format),Dt=fe.convert(D.type),we;D.isData3DTexture?($.setTexture3D(D,0),we=L.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?($.setTexture2DArray(D,0),we=L.TEXTURE_2D_ARRAY):($.setTexture2D(D,0),we=L.TEXTURE_2D),x.activeTexture(L.TEXTURE0),x.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,D.flipY),x.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),x.pixelStorei(L.UNPACK_ALIGNMENT,D.unpackAlignment);let zt=x.getParameter(L.UNPACK_ROW_LENGTH),it=x.getParameter(L.UNPACK_IMAGE_HEIGHT),sn=x.getParameter(L.UNPACK_SKIP_PIXELS),Sn=x.getParameter(L.UNPACK_SKIP_ROWS),Zn=x.getParameter(L.UNPACK_SKIP_IMAGES);x.pixelStorei(L.UNPACK_ROW_LENGTH,gt.width),x.pixelStorei(L.UNPACK_IMAGE_HEIGHT,gt.height),x.pixelStorei(L.UNPACK_SKIP_PIXELS,Ie),x.pixelStorei(L.UNPACK_SKIP_ROWS,Ze),x.pixelStorei(L.UNPACK_SKIP_IMAGES,je);let zi=b.isDataArrayTexture||b.isData3DTexture,ht=D.isDataArrayTexture||D.isData3DTexture;if(b.isDepthTexture){let bt=W.get(b),Jn=W.get(D),pt=W.get(bt.__renderTarget),$n=W.get(Jn.__renderTarget);x.bindFramebuffer(L.READ_FRAMEBUFFER,pt.__webglFramebuffer),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,$n.__webglFramebuffer);for(let Vi=0;Vi<Ae;Vi++)zi&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(b).__webglTexture,G,je+Vi),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(D).__webglTexture,_e,Mt+Vi)),L.blitFramebuffer(Ie,Ze,Ee,ye,Ce,ot,Ee,ye,L.DEPTH_BUFFER_BIT,L.NEAREST);x.bindFramebuffer(L.READ_FRAMEBUFFER,null),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(G!==0||b.isRenderTargetTexture||W.has(b)){let bt=W.get(b),Jn=W.get(D);x.bindFramebuffer(L.READ_FRAMEBUFFER,I),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,U);for(let pt=0;pt<Ae;pt++)zi?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,bt.__webglTexture,G,je+pt):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,bt.__webglTexture,G),ht?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Jn.__webglTexture,_e,Mt+pt):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Jn.__webglTexture,_e),G!==0?L.blitFramebuffer(Ie,Ze,Ee,ye,Ce,ot,Ee,ye,L.COLOR_BUFFER_BIT,L.NEAREST):ht?L.copyTexSubImage3D(we,_e,Ce,ot,Mt+pt,Ie,Ze,Ee,ye):L.copyTexSubImage2D(we,_e,Ce,ot,Ie,Ze,Ee,ye);x.bindFramebuffer(L.READ_FRAMEBUFFER,null),x.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else ht?b.isDataTexture||b.isData3DTexture?L.texSubImage3D(we,_e,Ce,ot,Mt,Ee,ye,Ae,dt,Dt,gt.data):D.isCompressedArrayTexture?L.compressedTexSubImage3D(we,_e,Ce,ot,Mt,Ee,ye,Ae,dt,gt.data):L.texSubImage3D(we,_e,Ce,ot,Mt,Ee,ye,Ae,dt,Dt,gt):b.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,_e,Ce,ot,Ee,ye,dt,Dt,gt.data):b.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,_e,Ce,ot,gt.width,gt.height,dt,gt.data):L.texSubImage2D(L.TEXTURE_2D,_e,Ce,ot,Ee,ye,dt,Dt,gt);x.pixelStorei(L.UNPACK_ROW_LENGTH,zt),x.pixelStorei(L.UNPACK_IMAGE_HEIGHT,it),x.pixelStorei(L.UNPACK_SKIP_PIXELS,sn),x.pixelStorei(L.UNPACK_SKIP_ROWS,Sn),x.pixelStorei(L.UNPACK_SKIP_IMAGES,Zn),_e===0&&D.generateMipmaps&&L.generateMipmap(we),x.unbindTexture()},this.initRenderTarget=function(b){W.get(b).__webglFramebuffer===void 0&&$.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?$.setTextureCube(b,0):b.isData3DTexture?$.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?$.setTexture2DArray(b,0):$.setTexture2D(b,0),x.unbindTexture()},this.resetState=function(){H=0,Y=0,X=null,x.reset(),ve.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return gn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=tt._getDrawingBufferColorSpace(e),t.unpackColorSpace=tt._getUnpackColorSpace()}};var Rr=new F;function ln(i,e,t,n,s,r){let a=2*Math.PI*s/4,o=Math.max(r-2*s,0),l=Math.PI/4;Rr.copy(e),Rr[n]=0,Rr.normalize();let c=.5*a/(a+o),h=1-Rr.angleTo(i)/l;return Math.sign(Rr[t])===1?h*c:o/(a+o)+c+c*(1-h)}var Zo=class i extends Pn{constructor(e=1,t=1,n=1,s=2,r=.1){let a=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let l=new F,c=new F,h=new F(e,t,n).divideScalar(2).subScalar(r),d=this.attributes.position.array,u=this.attributes.normal.array,m=this.attributes.uv.array,f=d.length/6,y=new F,p=.5/a;for(let g=0,M=0;g<d.length;g+=3,M+=2)switch(l.fromArray(d,g),c.copy(l),c.x-=Math.sign(c.x)*p,c.y-=Math.sign(c.y)*p,c.z-=Math.sign(c.z)*p,c.normalize(),d[g+0]=h.x*Math.sign(l.x)+c.x*r,d[g+1]=h.y*Math.sign(l.y)+c.y*r,d[g+2]=h.z*Math.sign(l.z)+c.z*r,u[g+0]=c.x,u[g+1]=c.y,u[g+2]=c.z,Math.floor(g/f)){case 0:y.set(1,0,0),m[M+0]=ln(y,c,"z","y",r,n),m[M+1]=1-ln(y,c,"y","z",r,t);break;case 1:y.set(-1,0,0),m[M+0]=1-ln(y,c,"z","y",r,n),m[M+1]=1-ln(y,c,"y","z",r,t);break;case 2:y.set(0,1,0),m[M+0]=1-ln(y,c,"x","z",r,e),m[M+1]=ln(y,c,"z","x",r,n);break;case 3:y.set(0,-1,0),m[M+0]=1-ln(y,c,"x","z",r,e),m[M+1]=1-ln(y,c,"z","x",r,n);break;case 4:y.set(0,0,1),m[M+0]=1-ln(y,c,"x","y",r,e),m[M+1]=1-ln(y,c,"y","x",r,t);break;case 5:y.set(0,0,-1),m[M+0]=ln(y,c,"x","y",r,e),m[M+1]=1-ln(y,c,"y","x",r,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}};function Ir(){let i=new Map,e=new Map,t=new Map,n=!1;function s(o){if(t.has(o))return t.get(o);let l=64,c=new Uint8Array(l*l*4);for(let d=0;d<l;d++)for(let u=0;u<l;u++){let m=(u*73+d*151+u*d*17)%31/31,f=235;o==="wood"&&(f=190+35*Math.sin(d*.6+Math.sin(u*.14)*2)+m*20),o==="metal"&&(f=215+d%3*6+m*12),o==="brick"&&(f=d%16<2||(u+Math.floor(d/16)%2*16)%32<2?145:230+m*20),o==="fabric"&&(f=205+(u+d)%2*23+m*15),o==="leaf"&&(f=185+35*Math.sin((u-d)*.25)+(Math.abs(u-32)<2?35:0)),o==="tile"&&(f=u<2||d<2?145:242+m*10);let y=(d*l+u)*4;c[y]=c[y+1]=c[y+2]=f,c[y+3]=255}let h=new Ai(c,l,l);return h.colorSpace=Nt,h.wrapS=h.wrapT=ss,h.magFilter=Tt,h.minFilter=Dn,h.generateMipmaps=!0,h.needsUpdate=!0,t.set(o,h),h}function r(o="plain",l="#ffffff",c={}){if(n)throw new Error("Disposed material pool");let h=JSON.stringify([o,l,c]);return e.has(h)||e.set(h,new dr({color:l,roughness:o==="metal"?.34:.78,metalness:o==="metal"?.65:0,map:o==="plain"?null:s(o),...c})),e.get(h)}function a(o){if(n)throw new Error("Disposed geometry pool");if(!i.has(o)){let l;switch(o){case"box":l=new Pn(1,1,1);break;case"round":l=new Zo(1,1,1,2,.12);break;case"sphere":l=new cr(.5,20,12);break;case"cylinder":l=new hs(.5,.5,1,20);break;case"cone":l=new js(.5,1,20);break;case"torus":l=new hr(.4,.1,8,24);break;case"star":{let c=new us;for(let h=0;h<10;h++){let d=h*Math.PI/5+Math.PI/2,u=h%2?.23:.5,m=Math.cos(d)*u,f=Math.sin(d)*u;h?c.lineTo(m,f):c.moveTo(m,f)}c.closePath(),l=new or(c,{depth:.13,bevelEnabled:!0,bevelSegments:2,steps:1,bevelSize:.04,bevelThickness:.04});break}default:throw new Error(`Unknown geometry: ${o}`)}i.set(o,l)}return i.get(o)}return{material:r,geometry:a,stats:()=>({geometries:i.size,materials:e.size,textures:t.size}),dispose(){n||(n=!0,i.forEach(o=>o.dispose()),e.forEach(o=>o.dispose()),t.forEach(o=>o.dispose()),i.clear(),e.clear(),t.clear())}}}function Rt(i,e="asset"){let t=!i;i??=Ir();let n=new Xt;n.name=e;function s(o,l,c=[1,1,1],h=[0,0,0],d="",u=n,m="plain",f={}){let y=new Ft(i.geometry(o),i.material(m,l,f));return y.scale.set(...c),y.position.set(...h),y.name=d,y.castShadow=!0,y.receiveShadow=!0,u.add(y),y}function r(o,l,c=n){let h=new Xt;return h.name=o,h.position.set(...l),c.add(h),h}let a=!1;return{group:n,pool:i,part:s,joint:r,update(o){n.position.set(o.x??0,o.y??0,0)},dispose(){a||(a=!0,n.traverse(o=>{o.isInstancedMesh&&o.dispose()}),n.removeFromParent(),n.clear(),t&&i.dispose())}}}function lu(i="chip",e){let t=Rt(e,i),{group:n,part:s,joint:r}=t,a=i==="dale",o=a?"#ad652e":"#85502e",l="#f4d8aa",c="#392723",h=r("body",[0,0,0]),d=r("striped-tail",[-.24,.41,-.18],h);d.rotation.z=-.45,s("sphere",o,[.27,.69,.24],[0,.13,0],"tail",d);for(let[p,g]of[[-.065,l],[0,c],[.065,l]])s("sphere",g,[.048,.57,.035],[p,.16,.116],"tail-stripe",d);if(s("sphere",l,[.45,.58,.34],[0,.51,.02],"belly",h),a){let p=s("sphere","#db4537",[.54,.46,.39],[0,.57,0],"floral-shirt",h,"fabric");for(let g=0;g<9;g++){let M=(g%3-1)*.14,S=.43+Math.floor(g/3)*.12;for(let v=0;v<5;v++)s("sphere","#ffdc81",[.046,.05,.02],[M+Math.cos(v*1.257)*.025,S+Math.sin(v*1.257)*.026,.193],"flower-petal",h)}p.rotation.z=-.04}else{for(let p of[-1,1])s("sphere","#995e39",[.2,.43,.37],[p*.19,.57,0],"jacket",h,"fabric");for(let p of[-1,1]){let g=s("round","#c79050",[.1,.24,.06],[p*.125,.69,.18],"lapel",h,"fabric");g.rotation.z=p*.28}}let u=r("head",[0,.97,.025],h);s("sphere",o,[.66,.56,.43],[0,0,0],"head-fur",u);for(let p of[-1,1]){s("sphere",o,[.23,.28,.16],[p*.27,.2,-.025],"ear",u),s("sphere","#daac80",[.14,.18,.035],[p*.27,.2,.061],"inner-ear",u),s("sphere",l,[.32,.25,.19],[p*.145,-.12,.18],"cheek",u),s("sphere","#fff8e7",[.18,.245,.085],[p*.125,.046,.214],"eye",u),s("sphere","#292126",[.075,.125,.045],[p*.123+.02,.037,.254],"pupil",u),s("sphere","#ffffff",[.027,.038,.012],[p*.123+.033,.07,.274],"eye-glint",u);let g=s("sphere",c,[.2,.045,.04],[p*.125,.185,.204],"brow",u);g.rotation.z=p*(a?.2:-.12)}s("sphere",a?"#cd3d36":"#302125",[a?.18:.125,.115,.12],[0,-.075,.326],"nose",u),s("sphere","#663724",[.18,.086,.04],[0,-.202,.241],"smile",u);for(let p of[-1,1])s("round","#fff6df",[.051,.084,.04],[p*.029,-.18,.262],"tooth",u);if(a)for(let p of[-1,0,1]){let g=s("cone",o,[.13,.2,.1],[p*.09,.29,.015],"tuft",u);g.rotation.z=p*.25}else{let p=r("fedora",[0,.27,0],u);p.rotation.z=-.1,s("sphere","#b9945c",[.76,.09,.58],[0,0,0],"hat-brim",p,"fabric"),s("round","#b9945c",[.47,.24,.36],[0,.1,-.025],"hat-crown",p,"fabric"),s("round","#57412e",[.485,.075,.37],[0,.055,-.025],"hat-ribbon",p)}let m=[],f=[];for(let p of[-1,1]){let g=r(p<0?"left-arm":"right-arm",[p*.25,.68,.01],h);m.push(g),s("sphere",a?"#dc493b":"#955e39",[.17,.31,.19],[0,-.11,0],"sleeve",g,"fabric"),s("sphere",l,[.18,.18,.18],[0,-.29,.025],"hand",g);let M=r(p<0?"left-leg":"right-leg",[p*.13,.3,0],h);f.push(M),s("sphere",o,[.18,.26,.23],[0,-.1,0],"leg",M),s("sphere",o,[.24,.13,.33],[p*.025,-.24,.07],"foot",M)}let y=t.update;return t.update=(p,g=0)=>{y(p),n.rotation.y=(p.facing??1)<0?-.38:.38;let M=p.animation==="run"||p.carrying&&Math.abs(p.vx??0)>.1,S=M?Math.sin(g*17)*.57:0;h.scale.y=p.hidden?.38:1,h.position.y=M?Math.abs(Math.sin(g*17))*.025:Math.sin(g*3)*.008;for(let v=0;v<2;v++){f[v].rotation.z=(v?1:-1)*S,m[v].rotation.z=p.carrying?v?2.95:-2.95:(v?S:-S)*.7,m[v].position.y=p.carrying?.75:.68;let E=p.carrying?2.4:1;m[v].getObjectByName("sleeve").scale.y=.31*E,m[v].getObjectByName("sleeve").position.y=-.11*E,m[v].getObjectByName("hand").position.y=-.29*E}(p.animation==="jump"||p.animation==="held")&&(f[0].rotation.z=-.35,f[1].rotation.z=.35,p.carrying||(m[0].rotation.z=-1,m[1].rotation.z=1)),u.rotation.z=p.animation==="hurt"?.2:Math.sin(g*2)*.018,d.rotation.z=-.45+S*.12,n.visible=(p.lives??1)>0&&(!(p.invulnerable>0)||Math.floor(g*15)%3!==0)},t}var gi="#e9b952",nn="#abbcc2",Fn="#37424c",Pr="#f5dfae";function xi(i,e,t=.7,n=.16,s=.12){for(let r of[-1,1])i.part("sphere","#fff9df",[s,s*1.2,s*.45],[r*n,t,.29],"eye",e),i.part("sphere","#242638",[s*.45,s*.65,s*.25],[r*n+.015,t,.318],"pupil",e)}function mi(i,e,t,n=2){for(let s=0;s<n;s++){let r=(s-(n-1)/2)*(.65/n);i.part("sphere",t,[.18,.22,.28],[r,.12,.01],"foot",e)}}function yi(i,e=1,t=1){let n=i.update;return i.update=(s,r=0)=>{n(s),i.group.scale.set((s.w??e)/e,(s.h??t)/t,1),i.group.rotation.y=(s.facing??1)<0?-.22:.22},i}function Bc(i,e=!1){let t=Rt(i,e?"bigcrate":"crate");t.part("round","#bf874e",[.96,.96,.88],[0,.5,0],"wooden-box",t.group,"wood");for(let s of[-1,1])t.part("box","#e2b778",[.12,.94,.08],[s*.37,.5,.47],"frame",t.group,"wood"),t.part("box","#e2b778",[.94,.11,.08],[0,.5+s*.37,.47],"frame",t.group,"wood");let n=t.part("box","#deb078",[.12,1.04,.08],[0,.5,.49],"diagonal-brace",t.group,"wood");n.rotation.z=-.7;for(let s of[-.36,.36])for(let r of[.13,.87])t.part("sphere",Fn,[.045,.045,.025],[s,r,.527],"nail");return yi(t)}function Yx(i){let e=Rt(i,"metal");e.part("round",nn,[.96,.96,.88],[0,.5,0],"metal-box",e.group,"metal"),e.part("round",Fn,[.67,.67,.03],[0,.5,.455],"recess");let t=e.part("torus",nn,[.56,.56,.23],[0,.5,.49],"vent-ring",e.group,"metal");for(let n=0;n<5;n++)e.part("box",nn,[.46,.045,.06],[0,.34+n*.08,.5],"vent",e.group,"metal");return yi(e)}function Zx(i){let e=Rt(i,"apple");for(let s of[-.14,.14])e.part("sphere","#df483b",[.65,.8,.75],[s,.44,0],"apple-lobe");let t=e.part("cylinder","#724530",[.06,.23,.06],[0,.88,0],"stem");t.rotation.z=-.25;let n=e.part("sphere","#77a852",[.35,.1,.15],[.15,.9,0],"leaf",e.group,"leaf");return n.rotation.z=.4,yi(e)}function cu(i){let e=Rt(i,"ball");e.part("sphere","#e56337",[.96,.96,.96],[0,.5,0],"ball");for(let t of[0,Math.PI/2]){let n=e.part("torus","#fff0ac",[1.02,1.02,.09],[0,.5,0],"ball-seam");n.rotation.y=t}return yi(e)}function hu(i,e){switch(i){case"crate":return Bc(e);case"bigcrate":return Bc(e,!0);case"metal":return Yx(e);case"apple":return Zx(e);case"ball":return cu(e);default:throw new Error(`Unknown object ${i}`)}}function zc(i,e){let t=i==="mimic"?Bc(e):Rt(e,i),{part:n,group:s}=t;switch(s.userData.silhouette=i,i){case"dog":n("round","#699bb0",[.73,.43,.44],[0,.47,0],"robot-dog-body",s,"metal"),n("round",nn,[.48,.4,.44],[.24,.71,.02],"head",s,"metal"),n("round",Fn,[.26,.15,.28],[.45,.65,.18],"muzzle");for(let a of[-1,1])n("cone",Fn,[.16,.25,.19],[.15+a*.19,.95,0],"ear"),n("cylinder",Fn,[.22,.13,.22],[a*.27,.17,0],"wheel").rotation.x=Math.PI/2;n("sphere","#ec7856",[.09,.1,.05],[.33,.79,.26],"eye");break;case"bird":case"pelican":n("sphere",i==="bird"?"#ab75c0":"#e9e6d4",[.62,.64,.44],[0,.49,0],"bird-body"),n("sphere","#eee4c9",[.42,.4,.42],[.12,.78,.07],"bird-head"),n("cone","#e9b047",[i==="pelican"?.57:.3,.25,.19],[.32,.7,.2],"beak").rotation.z=-Math.PI/2;for(let a of[-1,1]){let o=n("sphere",i==="bird"?"#77549b":"#a6bcc6",[.42,.2,.19],[a*.35,.53,0],`wing-${a}`);o.rotation.z=a*.4}xi(t,s,.83,.1,.085),mi(t,s,"#dfac52");break;case"caterpillar":for(let a=0;a<4;a++)n("sphere",a===3?"#c4d955":"#73a54d",[.35,.48,.42],[-.33+a*.22,.36,0],`segment-${a}`),n("sphere","#bd7845",[.16,.12,.23],[-.33+a*.22,.08,.1],"foot");n("sphere","#243428",[.06,.09,.035],[.38,.49,.2],"eye");break;case"mouse":case"kangaroo":{let a=i==="mouse"?"#b1a3bf":"#b88763";n("sphere",a,[.52,.64,.4],[0,.45,0],"body"),n("sphere",a,[.5,.38,.4],[.1,.78,.03],"head");for(let l of[-1,1])n("sphere","#cfabb4",[.22,i==="mouse"?.25:.45,.12],[l*.17,.94,-.02],"ear");n("sphere",Pr,[.36,.2,.2],[.12,.69,.23],"muzzle"),n("sphere","#49303a",[.1,.07,.065],[.13,.75,.33],"nose"),xi(t,s,.84,.1,.09),mi(t,s,a);let o=n("sphere",a,[.58,.12,.12],[-.37,.23,-.1],"tail");o.rotation.z=.4;break}case"mimic":xi(t,s,.63,.2,.13),n("round","#452a30",[.53,.13,.08],[0,.31,.5],"mouth");for(let a of[-.18,0,.18])n("cone","#fff6df",[.08,.11,.06],[a,.33,.55],"tooth").rotation.z=Math.PI;break;case"toy":n("round","#d66556",[.55,.5,.4],[0,.48,0],"body",s,"metal"),n("round","#e7ba65",[.52,.34,.43],[0,.85,.02],"head",s,"metal"),xi(t,s,.87,.14,.11),mi(t,s,Fn);for(let a of[-1,1])n("sphere",nn,[.16,.39,.18],[a*.36,.5,0],"arm",s,"metal");n("torus",gi,[.28,.28,.15],[.4,.65,-.22],"windup-key");break;case"bee":n("sphere","#e8b94d",[.55,.58,.45],[0,.5,0],"bee-body");for(let a of[.36,.54])n("torus",Fn,[.61,.25,.61],[0,a,0],"stripe").rotation.x=Math.PI/2;for(let a of[-1,1])n("sphere","#d5f6f5",[.4,.51,.065],[a*.31,.79,-.04],`wing-${a}`,s,"plain",{transparent:!0,opacity:.72});xi(t,s,.69,.12,.11);break;case"rhino":n("sphere","#909daf",[.87,.67,.55],[0,.47,0],"rhino"),n("sphere","#a8b2bc",[.5,.44,.51],[.31,.57,.09],"head"),n("cone",Pr,[.17,.37,.17],[.49,.85,.15],"horn"),mi(t,s,"#6d798d",4),n("sphere","#273040",[.065,.09,.04],[.36,.68,.35],"eye");break;case"crab":n("sphere","#ce6147",[.69,.44,.52],[0,.35,0],"shell");for(let a of[-1,1])n("sphere","#db7454",[.26,.3,.23],[a*.4,.66,.04],"claw"),n("cylinder","#d97d53",[.07,.3,.07],[a*.15,.66,.19],"eye-stalk"),n("sphere","#202a32",[.1,.12,.1],[a*.15,.82,.2],"eye");mi(t,s,"#c96046",6);break;case"lizard":n("sphere","#6ba96b",[.8,.43,.35],[0,.4,0],"body"),n("sphere","#a3c577",[.4,.33,.38],[.35,.57,.03],"head"),n("cone","#559361",[.25,.72,.24],[-.57,.31,-.07],"tail").rotation.z=Math.PI/2,mi(t,s,"#619757",4),n("sphere","#292c2d",[.07,.09,.045],[.38,.63,.22],"eye");break;default:throw new Error(`Unknown enemy ${i}`)}let r=yi(t).update;return t.update=(a,o=0)=>{r(a,o);for(let l of[-1,1]){let c=s.getObjectByName(`wing-${l}`);c&&(c.rotation.z=l*(.3+Math.sin(o*20)*.6))}if(i==="mimic")for(let l of s.children)["eye","pupil","mouth","tooth"].includes(l.name)&&(l.visible=a.animation!=="disguise")},t}function du(i,e){let t=Rt(e,i),{part:n,group:s}=t;switch(i){case"flower":n("cylinder","#5d914b",[.055,.5,.055],[0,.25,0],"stem");for(let a=0;a<6;a++){let o=a*Math.PI/3;n("sphere","#f2c851",[.25,.25,.14],[Math.cos(o)*.19,.68+Math.sin(o)*.19,0],"petal")}n("sphere","#986539",[.2,.2,.15],[0,.68,.06],"flower-heart");break;case"star":n("star",gi,[.9,.9,1],[0,.5,0],"star",s,"metal",{emissive:"#946626",emissiveIntensity:.22});break;case"acorn":n("sphere","#b37b43",[.59,.65,.5],[0,.4,0],"acorn"),n("sphere","#694b31",[.66,.3,.55],[0,.68,0],"cap",s,"wood"),n("cylinder","#61472f",[.09,.19,.09],[0,.88,0],"stem");break;case"zipper":n("sphere","#4dbca6",[.4,.65,.35],[0,.5,0],"zipper-body");for(let a of[-1,1])n("sphere","#e8ffff",[.45,.5,.06],[a*.24,.61,-.12],"wing",s,"plain",{transparent:!0,opacity:.7}),n("sphere","#ffffff",[.23,.3,.12],[a*.1,.77,.12],"eye"),n("sphere","#222d3e",[.075,.14,.05],[a*.1,.79,.19],"pupil");break;default:throw new Error(`Unknown pickup ${i}`)}let r=yi(t).update;return t.update=(a,o=0)=>{r(a,o),s.rotation.y=Math.sin(o*2)*.35},t}function uu(i,e){if(i==="alien"){let r=zc("mouse",e);return r.group.traverse(a=>{a.isMesh&&["body","head","ear"].includes(a.name)&&(a.material=r.pool.material("plain","#9dbb63"))}),r}if(i==="colorBall"){let r=cu(e),a=r.update,o;return r.group.traverse(l=>{l.isMesh&&l.name==="ball"&&(o=l)}),r.update=(l,c)=>{a(l,c),o.material=r.pool.material("plain",{red:"#dc6253",blue:"#649fcb",green:"#92b968"}[l.color]??"#e56337")},r}if(i==="segment"){let r=Rt(e,"segment");r.part("sphere","#98bd54",[.9,.78,.65],[0,.46,0],"segment-body");for(let a of[-.3,.3])r.part("sphere","#cba277",[.24,.18,.27],[a,.12,.08],"foot");return yi(r)}let t=Rt(e,i),{part:n,group:s}=t;switch(i){case"lightning":case"spark":for(let r=0;r<4;r++){let a=n("round","#d9f7a2",[.16,.35,.13],[Math.sin(r*2)*.14,.15+r*.22,0],"electric-bolt",s,"plain",{emissive:"#bcff55",emissiveIntensity:1});a.rotation.z=r%2?.7:-.7}break;case"feather":n("sphere","#d2a873",[.32,.85,.12],[0,.5,0],"feather"),n("cylinder","#fff3d5",[.05,.9,.05],[0,.5,.04],"shaft");break;case"token":n("cylinder",gi,[.83,.15,.83],[0,.5,0],"coin",s,"metal").rotation.x=Math.PI/2,n("star","#fff2b1",[.43,.43,.5],[0,.5,.1],"coin-star");break;case"ash":n("sphere","#a99889",[.65,.7,.5],[0,.45,0],"ash",s,"plain",{emissive:"#d95b29",emissiveIntensity:.25});for(let r=0;r<3;r++)n("sphere","#ddc3a9",[.32,.32,.28],[Math.sin(r*3)*.2,.65+r*.15,-.1],"smoke");break;case"gear":n("torus",nn,[.8,.8,.3],[0,.5,0],"gear",s,"metal");for(let r=0;r<8;r++){let a=r*Math.PI/4,o=n("box",nn,[.18,.23,.15],[Math.sin(a)*.4,.5+Math.cos(a)*.4,0],"cog",s,"metal");o.rotation.z=-a}break;case"drop":n("sphere","#88cbd2",[.6,.73,.55],[0,.36,0],"drop"),n("cone","#a9e1e2",[.46,.48,.44],[0,.8,0],"drop-tip");break;default:throw new Error(`Unknown projectile ${i}`)}return yi(t)}function Jo(i,e){let t=Rt(e,i),{part:n,joint:s,group:r}=t;switch(r.userData.silhouette=i,i){case"robot":{n("cylinder","#d65f72",[.25,.79,.35],[0,.43,0],"coil-core",r,"metal");for(let a=0;a<13;a++)n("torus",a%2?"#df8cab":"#4e6d9f",[.35,.11,.4],[0,.1+a*.055,0],"coil-ring",r,"metal").rotation.x=Math.PI/2;for(let a of[-1,1]){let o=s(a<0?"contact-arm-left":"contact-arm-right",[a*.38,.45,0]);for(let l=0;l<3;l++){let c=n("cylinder",nn,[.04,.22,.08],[a*-.03,(l-1)*.27,0],"arm-link",o,"metal");c.rotation.z=a*(l%2?.8:-.8),n("sphere",nn,[.1,.1,.12],[a*.06,(l-1)*.27+.05,0],"elbow",o,"metal"),n(l===0?"round":"sphere",l===0?"#c88a55":"#ede4d2",[.18,.12,.2],[a*.025,(l-1)*.27,0],"hand-brush",o)}}for(let a of[-1,1])for(let o of[.2,.47,.74]){let l=n("cylinder",nn,[.035,.34,.055],[a*.22,o,-.05],"arm-connector",r,"metal");l.rotation.z=Math.PI/2}n("sphere","#aeef54",[.15,.12,.23],[0,.92,0],"weakpoint",r,"plain",{emissive:"#64ad19",emissiveIntensity:.6});break}case"toyRobot":n("round","#6f8a90",[.56,.57,.43],[0,.46,0],"armour",r,"metal"),n("round",nn,[.48,.24,.42],[0,.83,0],"head",r,"metal"),n("round",Fn,[.34,.07,.04],[0,.85,.23],"visor");for(let a of[-.11,.11])n("sphere","#d7eea6",[.07,.07,.04],[a,.85,.26],"eye");n("round","#e8bd53",[.2,.14,.06],[0,.53,.24],"weakpoint",r,"plain",{emissive:"#f4a828",emissiveIntensity:.6});for(let a of[-1,1]){n("sphere",nn,[.22,.37,.3],[a*.36,.44,0],"arm",r,"metal"),n("round",Fn,[.35,.18,.48],[a*.2,.1,0],"tank-tread");for(let o=0;o<4;o++)n("sphere",nn,[.07,.1,.06],[a*.2-.11+o*.075,.1,.25],"tread-wheel",r,"metal")}break;case"owl":n("sphere","#a97144",[.56,.69,.42],[0,.43,0],"owl-body"),n("sphere",Pr,[.39,.49,.06],[0,.4,.23],"breast");for(let a of[-1,1])n("sphere","#8b5739",[.45,.26,.18],[a*.37,.56,0],`wing-${a}`),n("sphere","#ead8b1",[.29,.33,.1],[a*.14,.77,.18],"eye-mask"),n("sphere","#f8e874",[.14,.17,.08],[a*.14,.78,.25],"eye"),n("sphere","#2e2830",[.07,.1,.03],[a*.14,.78,.3],"pupil"),n("cone","#744732",[.19,.26,.2],[a*.2,.98,0],"ear");n("cone","#e4ad43",[.17,.22,.14],[0,.61,.27],"beak").rotation.z=Math.PI,mi(t,r,gi);break;case"ufo":n("sphere","#90aa9c",[.99,.29,.72],[0,.39,0],"saucer",r,"metal"),n("sphere","#9ce6d5",[.51,.47,.44],[0,.65,0],"dome",r,"plain",{metalness:.35,roughness:.2}),n("torus",gi,[1,.34,.7],[0,.4,0],"rim",r,"metal").rotation.x=Math.PI/2;for(let a of[-.3,0,.3])n("sphere","#f8c66c",[.11,.11,.07],[a,.38,.35],"navigation-light",r,"plain",{emissive:"#f9c457",emissiveIntensity:.5});xi(t,r,.66,.13,.12);break;case"electricFish":n("sphere","#a4bf4c",[.72,.61,.45],[0,.5,0],"fish-body"),n("sphere",Pr,[.6,.34,.1],[0,.4,.24],"belly");for(let a of[-1,1])n("cone","#738d36",[.28,.43,.17],[a*.4,.53,0],"fin").rotation.z=a*Math.PI/2,n("sphere","#f8f0ce",[.2,.23,.12],[a*.16,.68,.19],"eye"),n("sphere","#27342e",[.08,.11,.04],[a*.16,.7,.27],"pupil");for(let a=0;a<5;a++)n("cone",gi,[.08,.25,.1],[-.2+a*.1,.88,0],"spine");break;case"casinoCat":case"fatCat":{let a=i==="fatCat";n("sphere",a?"#7b6a83":"#648cbe",[.83,.66,.48],[0,.36,0],"suit",r,"fabric"),n("sphere","#e5d6ba",[.42,.5,.07],[0,.43,.26],"shirt");for(let o of[-1,1])n("round",a?"#654e6a":"#315788",[.19,.45,.09],[o*.23,.43,.25],"lapel").rotation.z=o*.25,n("sphere",a?"#95847d":"#938e98",[.26,.34,.27],[o*.4,.47,.07],"hand"),n("cone",a?"#928078":"#817780",[.21,.27,.19],[o*.2,.96,0],"cat-ear");n("sphere",a?"#a99b89":"#a3a0a7",[.59,.43,.4],[0,a?.835:.78,0],"head");for(let o of[-1,1])n("sphere",Pr,[.27,.17,.1],[o*.13,a?.775:.7,.22],"muzzle");if(xi(t,r,a?.905:.82,.135,.12),n("sphere","#785157",[.14,.09,.08],[0,a?.815:.74,.29],"nose"),n("round","#be6860",[.15,.16,.06],[0,.53,.32],"tie"),mi(t,r,Fn),a){let o=s("chair",[0,0,-.16]);n("round","#65516a",[.96,.06,.62],[0,0,0],"chair-seat",o,"fabric"),n("round","#8b6c51",[.96,.8,.1],[0,.38,-.28],"chair-back",o,"wood"),n("round","#775c72",[.8,.65,.06],[0,.38,-.215],"chair-cushion",o,"fabric");for(let c of[-.39,.39])for(let h of[-.23,.23])n("cylinder",gi,[.055,.15,.055],[c,-.11,h],"chair-leg",o,"metal");for(let c of[-.45,.45])n("sphere",gi,[.08,.08,.08],[c,.82,-.28],"chair-finial",o,"metal");n("sphere","#5b3b37",[.13,.055,.06],[-.16,.78,.29],"mouth");for(let c of[-1,1]){let h=n("round","#5c5355",[.19,.035,.035],[c*.135,.98,.28],"brow");h.rotation.z=c*.25}let l=s("cigar-tip",[-.16,.78,.32]);n("cylinder","#875237",[.04,.19,.04],[-.09,0,0],"cigar",l).rotation.z=Math.PI/2,n("sphere","#f1a366",[.035,.04,.04],[0,0,0],"ember",l,"plain",{emissive:"#ec591a",emissiveIntensity:.8})}else n("cylinder","#344960",[.58,.1,.47],[0,.99,0],"hat-brim"),n("cylinder","#344960",[.4,.21,.35],[0,1.08,0],"top-hat");break}case"caterpillar":for(let a=0;a<5;a++){let o=s(`body-segment-${a}`,[0,.1+a*.2,0]);n("sphere",a===4?"#c98a58":"#97bf50",[.98,.87,.48],[0,.48,0],"segment",o);for(let l of[-1,1])n("sphere","#d2a86e",[.19,.15,.23],[l*.27,.08,.08],"foot",o);a===4&&xi(t,o,.63,.17,.19)}break;default:throw new Error(`Unknown Boss ${i}`)}return t.update=(a,o=0)=>{r.position.set(a.x,a.y,0),r.scale.set(a.w??2,a.h??2.4,Math.min(a.w??2,3)),r.visible=!a.defeated&&a.phase!=="separated";let l=r.getObjectByName("weakpoint");if(l&&a.weakpoint&&(l.position.x=(a.weakpoint.x-a.x)/a.w,l.position.y=(a.weakpoint.y+a.weakpoint.h/2-a.y)/a.h,l.scale.x=a.weakpoint.w/a.w,l.scale.y=a.weakpoint.h/a.h),i==="robot")for(let[d,u]of["contact-arm-left","contact-arm-right"].entries()){let m=a.contactRegions?.[d];if(m){let f=r.getObjectByName(u);f.position.x=(m.x-a.x)/a.w,f.position.y=(m.y+m.h/2-a.y)/a.h}}let c=r.getObjectByName("chair");if(c){let d=((a.arena?.y??a.y-1.2)-a.y)/a.h;c.traverse(u=>{u.name==="chair-leg"&&(u.position.y=(d-.03)/2,u.scale.y=Math.max(.01,-.03-d))})}let h=r.getObjectByName("cigar-tip");if(h&&a.anchors?.mouth){h.position.x=(a.anchors.mouth.x-a.x)/a.w,h.position.y=(a.anchors.mouth.y-a.y)/a.h;let d=r.getObjectByName("mouth");d.position.x=h.position.x,d.position.y=h.position.y}if(i==="caterpillar")for(let d=0;d<5;d++){let u=r.getObjectByName(`body-segment-${d}`),m=a.segments?.[d];u.visible=!!m,m&&(u.position.set((m.x-a.x)/a.w,(m.y-a.y)/a.h,0),u.scale.set(m.w/a.w,m.h/a.h,1))}for(let d of[-1,1]){let u=r.getObjectByName(`wing-${d}`);u&&(u.rotation.z=d*Math.sin(o*6)*.45)}},t}var Ui={street:{sky:"#b5d5d3",fog:"#b5d5d3",surface:"#b59375",accent:"#779c9a"},tree:{sky:"#a8cdc4",fog:"#adcbb3",surface:"#a47a48",accent:"#6d9556"},kitchen:{sky:"#e1c7aa",fog:"#d7c4b1",surface:"#aa7450",accent:"#81aaa2"},study:{sky:"#beb8c2",fog:"#cbc1b6",surface:"#a48161",accent:"#987886"},toys:{sky:"#bfb9d2",fog:"#c8bfd1",surface:"#b78c74",accent:"#888db8"},river:{sky:"#b2d6d1",fog:"#bad9d1",surface:"#a78460",accent:"#6ba69a"},factory:{sky:"#a7b6b8",fog:"#aebabc",surface:"#7f979a",accent:"#c79d57"},casino:{sky:"#8e879e",fog:"#a7a0b1",surface:"#b1816f",accent:"#cfb571"},sewer:{sky:"#829b9c",fog:"#a1b7b0",surface:"#7e9ba1",accent:"#b78660"},office:{sky:"#c0cdd0",fog:"#c0cbcb",surface:"#a48c76",accent:"#6d9baa"},fatcat:{sky:"#93949e",fog:"#a2a1aa",surface:"#819194",accent:"#b4756c"},bonus:{sky:"#c3b2cc",fog:"#c8b7ce",surface:"#d0a875",accent:"#efc86d"}},Di="#a57547",It="#a9bbc0",vn="#485b65",bn="#d9b664";function st(i,e,t,n,s="plain",r="repeated-detail"){if(!n.length)return;let a=new Ci(i.pool.geometry(e),i.pool.material(s,t),n.length),o=new wt;a.name=r;for(let[l,c]of n.entries())o.position.set(...c.p),o.scale.set(...c.s),o.rotation.set(0,0,c.r??0),o.updateMatrix(),a.setMatrixAt(l,o.matrix);return a.castShadow=!0,a.receiveShadow=!0,a.instanceMatrix.needsUpdate=!0,i.group.add(a),a}function mt(i,e){return Array.from({length:i},(t,n)=>e(n))}function Jx(i,e,t="street"){let n=Rt(e,`decor:${i.id??i.kind}`),{part:s,group:r}=n;r.userData.kind=i.kind;let a=(m,f,y,p,g="plain")=>s("round",m,f,y,p,r,g),o=(m,f,y,p,g="metal")=>s("cylinder",m,f,y,p,r,g),l=(m,f,y,p,g="plain")=>s("sphere",m,f,y,p,r,g),c=(m=Di)=>{for(let f of[.27,.72])a(m,[1,.065,.09],[0,f,.05],"cross-rail","wood");st(n,"round",m,mt(Math.max(5,Math.min(30,Math.round(i.w??10))),f=>({p:[-.48+f/(Math.max(5,Math.min(30,Math.round(i.w??10)))-1)*.96,.5,.01],s:[.025,.98,.11]})),"wood","fence-pickets")},h=()=>{let m=(i.w??1)>(i.h??1);o(t==="sewer"?"#b8794a":It,m?[.2,1,.2]:[.72,1,.65],[0,.5,0],"pipe").rotation.z=m?Math.PI/2:0;for(let f of[-.4,.4]){let y=s("torus",t==="sewer"?"#c89968":"#6e8790",m?[.3,.3,.25]:[.87,.87,.35],m?[f,.5,0]:[0,.5+f,0],"pipe-collar",r,"metal");y.rotation.y=m?Math.PI/2:0,y.rotation.x=m?0:Math.PI/2}},d=(m=Di)=>{a(m,[1,.94,.46],[0,.48,0],"cabinet","wood"),a("#4d4d4b",[.91,.82,.025],[0,.5,.25],"interior");for(let f of[.11,.38,.65,.92])a(m,[1,.045,.58],[0,f,.025],"shelf","wood")},u=(m=Di)=>{a(m,[1,.12,.7],[0,.91,0],"table-top","wood");for(let f of[-.4,.4])a(m,[.055,.9,.12],[f,.45,0],"table-leg","wood")};switch(i.kind){case"fence":c();break;case"planter":o("#b27558",[.84,.56,.73],[0,.28,0],"terracotta","plain"),o("#ce9370",[1,.13,.83],[0,.55,0],"pot-rim","plain"),o("#5f503b",[.82,.04,.7],[0,.6,0],"soil","plain"),st(n,"sphere","#759357",mt(11,f=>({p:[Math.sin(f*2.4)*.3,.7+f%3*.08,Math.cos(f*2.4)*.2],s:[.35,.35,.18],r:f})),"leaf","leaves");break;case"trash":o("#8ca3a5",[.9,.88,.83],[0,.44,0],"trash-can"),o("#b7c7c2",[1,.1,.91],[0,.93,0],"lid"),st(n,"round",It,mt(9,f=>({p:[-.39+f*.097,.45,.38],s:[.025,.72,.035]})),"metal","can-ribs"),a(vn,[.23,.08,.1],[0,1,.05],"lid-handle");break;case"pole":o(Di,[.7,1,.65],[0,.5,0],"wood-pole","wood");for(let f of[.48,.83,.94])a("#675441",[1.9,.025,.12],[0,f,0],"crossarm","wood"),st(n,"cylinder","#c9d9d6",[-.75,-.4,.4,.75].map(y=>({p:[y,f+.025,0],s:[.15,.055,.15]})),"plain","insulators");break;case"building":case"lab":case"tileWall":case"brickWall":case"brick":{let f=i.kind==="lab",y=i.kind==="tileWall";if(a(y?"#d4ac84":f?"#92aeb0":t==="sewer"?"#69909a":"#b88f79",[1,1,.35],[0,.5,-.25],"masonry",y?"tile":"brick"),i.kind==="building"||f){let p=Math.min(18,Math.max(4,Math.round((i.w??20)/4)));st(n,"round",f?"#638c94":"#6c8a91",mt(p,g=>({p:[-.45+g/(p-1)*.9,.63,0],s:[.7/p,.4,.045]})),"metal","windows"),st(n,"box","#d2c7a7",mt(p,g=>({p:[-.45+g/(p-1)*.9,.44,.025],s:[.8/p,.025,.07]})),"plain","sills"),a("#d3c6ae",[1.04,.08,.5],[0,.96,0],"cornice")}break}case"satellite":{let f=l("#c9d4d1",[.86,.18,.74],[0,.64,0],"dish","metal");f.rotation.z=-.35,a(vn,[.07,.63,.08],[0,.31,0],"antenna-stem"),o(It,[.04,.5,.04],[.1,.8,.14],"receiver").rotation.z=-.6;break}case"testTubes":a(Di,[1,.06,.49],[0,.1,0],"tube-rack","wood"),a(Di,[1,.05,.44],[0,.47,0],"tube-rack","wood");for(let f=0;f<5;f++){let y=-.4+f*.2;o(["#89bca4","#dba66d","#a692c1"][f%3],[.12,.68,.12],[y,.59,0],"tube","plain"),o("#e0ece0",[.14,.035,.14],[y,.95,0],"tube-lip")}break;case"pencil":o("#edbd5f",[.7,.82,.7],[-.07,.5,0],"pencil","wood").rotation.z=Math.PI/2,s("cone","#e4c89a",[.7,.18,.7],[.43,.5,0],"pencil-tip").rotation.z=-Math.PI/2,a("#c77f83",[.1,.67,.65],[-.48,.5,0],"eraser");break;case"trunk":o("#a57a4c",[.93,1,.8],[0,.5,0],"tree-trunk","wood"),st(n,"sphere","#785739",mt(12,f=>({p:[Math.sin(f*2)*.3,.05+f*.081,.32],s:[.11,.14,.045],r:.35})),"wood","bark-knots");break;case"treeHole":l("#514734",[.78,.84,.22],[0,.5,0],"tree-hole"),s("torus","#9e7446",[.98,1.14,.37],[0,.5,.02],"hole-rim",r,"wood");break;case"tree":o(Di,[.16,.78,.14],[0,.38,0],"trunk","wood");case"leaves":st(n,"sphere","#71935c",mt(26,f=>({p:[Math.sin(f*2.399)*(.12+f%5*.075),.5+Math.cos(f*1.7)*.26,Math.sin(f*.9)*.2],s:[.3,.44,.18],r:f*.4})),"leaf","leaf-canopy");break;case"counter":case"bar":d("#a9845f"),a("#d7c4a2",[1.04,.12,.69],[0,1,0],"countertop","wood");break;case"stool":o("#a77858",[.86,.13,.75],[0,.93,0],"stool-seat","wood");for(let f of[-.3,.3])a("#8d6d50",[.1,.87,.12],[f,.44,0],"stool-leg","wood");a("#b08b66",[.7,.07,.13],[0,.36,0],"footrest","wood");break;case"bottle":o("#65958b",[.58,.69,.5],[0,.34,0],"bottle-body","plain"),o("#73a599",[.23,.34,.21],[0,.83,0],"bottle-neck","plain"),o("#c5ad79",[.26,.08,.24],[0,1,0],"bottle-cap"),a("#ead7b1",[.54,.26,.035],[0,.4,.255],"label","fabric");break;case"sink":a(It,[1,.16,.83],[0,.93,0],"sink-rim","metal"),a("#657b84",[.82,.46,.62],[0,.67,0],"sink-basin","metal");for(let f of[-.47,.47])a(It,[.06,.52,.82],[f,.68,0],"sink-side","metal");o(It,[.08,.57,.08],[.25,.28,0],"sink-drain");break;case"faucet":o(It,[.15,.82,.15],[.23,.41,0],"faucet-stem"),o(It,[.16,.6,.16],[0,.85,0],"faucet-spout").rotation.z=Math.PI/2,o(It,[.17,.21,.17],[-.3,.77,0],"nozzle"),s("torus","#a6b9ba",[.4,.4,.2],[.23,.38,.14],"tap-wheel",r,"metal");break;case"stove":a("#d6c9ad",[1,.85,.56],[0,.43,0],"oven"),a(vn,[.7,.5,.04],[0,.37,.3],"oven-window"),a(It,[1.04,.06,.62],[0,.9,0],"stovetop","metal");for(let f of[-.25,.25])s("torus",vn,[.35,.35,.2],[f,.95,0],"burner").rotation.x=Math.PI/2;for(let f of[-.34,0,.34])o(vn,[.1,.05,.1],[f,.75,.32],"knob").rotation.x=Math.PI/2;break;case"drain":a(vn,[1,.9,.24],[0,.5,0],"grille"),st(n,"round",It,mt(14,f=>({p:[-.46+f*.071,.5,.15],s:[.028,.85,.07]})),"metal","drain-bars");break;case"bookshelf":d(),st(n,"round","#98a9a1",mt(33,f=>({p:[-.43+f%11*.085,.22+Math.floor(f/11)*.27,.12],s:[.045,.18+f%3*.02,.18],r:(f%5-2)*.025})),"fabric","book-spines"),st(n,"round","#b28370",mt(12,f=>({p:[-.36+f%4*.23,.24+Math.floor(f/4)*.27,.15],s:[.05,.22,.2]})),"fabric","red-books");break;case"books":for(let f=0;f<5;f++)a(["#a86460","#759899","#b9a575","#8588a2"][f%4],[.9-f*.07,.13,.56],[f%2*.025,.1+f*.18,0],"book-cover","fabric"),a("#e4d6b9",[.83-f*.07,.075,.51],[f%2*.025,.17+f*.18,.02],"pages");break;case"desk":case"table":if(u(),i.kind==="desk")for(let f of[-.31,.31]){a("#886d54",[.23,.7,.45],[f,.42,-.04],"drawer-unit","wood");for(let y of[.2,.42,.64])a(bn,[.1,.025,.04],[f,y,.2],"drawer-handle","metal")}break;case"fan":o(It,[.07,.55,.07],[0,.75,0],"fan-stem"),l("#bcbca7",[.21,.18,.21],[0,.47,0],"fan-hub","metal");for(let f=0;f<4;f++){let y=f*Math.PI/2,p=a("#b29465",[.4,.065,.17],[Math.cos(y)*.27,.47+Math.sin(y)*.2,0],"fan-blade","wood");p.rotation.z=y}break;case"lamp":o(bn,[.07,.75,.07],[0,.39,0],"lamp-stem"),s("cone","#e3c995",[.8,.36,.65],[0,.87,0],"shade",r,"fabric"),o(bn,[.42,.06,.35],[0,.04,0],"lamp-base");break;case"toyBox":case"gift":case"catBox":case"shippingCrates":{let f=i.kind==="gift"?"#a37aa8":i.kind==="toyBox"?"#799fa5":"#ba9064";if(a(f,[1,.94,.6],[0,.47,0],"box","wood"),a("#e5c88c",[.1,.98,.04],[0,.5,.325],"ribbon"),a("#e5c88c",[1,.1,.05],[0,.6,.33],"ribbon"),i.kind==="gift")for(let y of[-1,1])s("torus",bn,[.35,.28,.14],[y*.15,1,0],"bow").rotation.z=y*.4;else i.kind==="toyBox"?s("star","#edcc83",[.36,.36,.6],[.24,.5,.35],"star-logo"):st(n,"box","#966b44",mt(5,y=>({p:[-.4+y*.2,.5,.32],s:[.015,.85,.04]})),"wood","crate-planks");break}case"toyRobot":{let f=Jo("toyRobot",n.pool);r.add(f.group),f.group.scale.set(1,1,.7);break}case"conveyor":a(vn,[1,.5,.56],[0,.4,0],"conveyor-bed","metal"),st(n,"cylinder",It,mt(Math.min(32,Math.max(8,Math.round(i.w??8))),f=>({p:[-.46+f/(Math.min(32,Math.max(8,Math.round(i.w??8)))-1)*.92,.6,.28],s:[.025,.42,.025],r:Math.PI/2})),"metal","rollers");break;case"stairs":for(let f=0;f<5;f++)a("#9990b3",[.21,(f+1)*.19,.5],[-.4+f*.2,(f+1)*.095,0],"step","wood");break;case"pipe":case"duct":h();break;case"sluice":case"gate":a("#849d94",[1,.11,.6],[0,.96,0],"bridge-top","metal");for(let f of[-.4,.4])a("#86938b",[.15,.91,.35],[f,.46,0],"pier","brick");st(n,"box",It,mt(9,f=>({p:[-.34+f*.085,.53,.05],s:[.035,.72,.1]})),"metal","sluice-bars");break;case"water":a(t==="sewer"?"#719d80":"#6ca9ad",[1,.12,1],[0,.12,0],"water","plain"),st(n,"sphere","#bcdfd7",mt(12,f=>({p:[-.46+f*.083,.2,f%3*.14-.2],s:[.035,.013,.16]})),"plain","ripples");break;case"pump":case"machine":a("#809b92",[.9,.72,.56],[0,.37,0],"pump-body","metal"),s("torus",bn,[.46,.46,.25],[0,.59,.32],"wheel",r,"metal");for(let f of[0,Math.PI/2])a(It,[.035,.39,.05],[0,.59,.35],"wheel-spoke","metal").rotation.z=f;o(It,[.12,.4,.12],[.31,.85,0],"outlet");break;case"piston":case"press":a(vn,[1,.17,.52],[0,.9,0],"press-housing","metal"),o(It,[.19,.62,.19],[0,.54,0],"hydraulic-ram"),a("#b69c70",[.8,.14,.6],[0,.22,0],"press-head","metal");break;case"warning":a("#e5bd63",[1,.9,.1],[0,.5,0],"warning-panel"),st(n,"box",vn,mt(7,f=>({p:[-.45+f*.15,.5,.07],s:[.06,.8,.025],r:-.3})),"plain","warning-stripes");break;case"slotMachine":a("#ad7752",[.84,.9,.54],[0,.48,0],"slot-case","wood"),a(bn,[.78,.48,.07],[0,.65,.3],"slot-frame","metal"),a("#433e51",[.69,.37,.05],[0,.65,.35],"slot-window");for(let f of[-.23,0,.23])a("#e4d7b6",[.19,.28,.03],[f,.65,.39],"reel"),s("star",f===0?"#bfa444":"#b65f57",[.13,.13,.2],[f,.65,.42],"reel-symbol");a("#728c8e",[.63,.14,.18],[0,.28,.3],"payout"),o(It,[.045,.41,.045],[.48,.59,0],"slot-lever"),l("#b96659",[.14,.13,.13],[.48,.84,0],"lever-knob");break;case"restaurantDoor":a("#9a7159",[1,1,.2],[0,.5,0],"door-frame","wood"),a("#546f70",[.8,.86,.08],[0,.5,.14],"door"),s("torus",bn,[.23,.3,.2],[.24,.45,.23],"door-handle",r,"metal");break;case"curtain":st(n,"cylinder",t==="fatcat"?"#927382":"#777d9c",mt(28,f=>({p:[-.48+f*.0355,.5,0],s:[.055,1,.18]})),"fabric","curtain-folds"),a(bn,[1.06,.045,.11],[0,1,.06],"curtain-rail","metal");break;case"chandelier":o(bn,[.035,.6,.035],[0,.73,0],"chain"),s("torus",bn,[.85,.49,.3],[0,.4,0],"chandelier-ring",r,"metal");for(let f of[-.36,-.18,.18,.36])o(bn,[.04,.3,.04],[f,.37,.02],"candle-holder"),l("#f9deb1",[.15,.22,.14],[f,.55,.03],"lamp");break;case"cans":for(let f=0;f<6;f++){let y=f<3?0:f<5?1:2,p=y===0?-.32+f*.32:y===1?-.16+(f-3)*.32:0;o(["#a5b7a3","#b79d77","#87a5a9"][f%3],[.29,.3,.29],[p,.15+y*.31,0],"tin"),o(It,[.3,.025,.3],[p,.31+y*.31,0],"lid")}break;case"phone":a("#659bac",[.91,.38,.65],[0,.21,0],"telephone-base");let m=a("#83b5c0",[.95,.16,.27],[0,.68,0],"receiver");for(let f of[-.37,.37])l("#79abb8",[.24,.32,.32],[f,.58,0],"earpiece");st(n,"round","#e4dfc7",mt(12,f=>({p:[-.2+f%3*.2,.21+Math.floor(f/3)*.09,.345],s:[.12,.05,.025]})),"plain","phone-buttons"),st(n,"torus",vn,mt(15,f=>({p:[.48,.2+f*.033,0],s:[.12,.06,.12]})),"plain","coiled-cord"),m.rotation.z=-.03;break;case"drawers":a("#849ca2",[1,.98,.55],[0,.5,0],"filing-cabinet","metal");for(let f=0;f<4;f++)a("#a3b5b3",[.91,.21,.05],[0,.14+f*.24,.3],"drawer","metal"),a(vn,[.22,.032,.07],[0,.17+f*.24,.34],"handle"),a("#dfd3b2",[.24,.045,.02],[0,.1+f*.24,.34],"label");break;default:throw new Error(`Unimplemented scenery: ${i.kind}`)}return r.position.set(i.x,i.y,-2.4),r.scale.set(i.w??1,i.h??1,Math.min(3.6,Math.max(1,(i.w??1)*.3))),n}function fu(i,e){let t=!e;e??=Ir();let n=new Xt;n.name="scenery";let s=(i.decor??[]).map(r=>Jx(r,e,i.theme));return s.forEach(r=>n.add(r.group)),{group:n,dispose(){s.forEach(r=>r.dispose()),n.clear(),n.removeFromParent(),t&&e.dispose()}}}function pu(i,e){let t=Rt(e,"backdrop"),{part:n}=t,{width:s,height:r,theme:a}=i,o=Ui[a]??Ui.street;if(a==="tree"||a==="river"){let l=Math.ceil(s/12)+2;st(t,"cylinder","#82927a",mt(l,h=>({p:[h*12-6,r/2,-11-h%3*2],s:[3+h%3,r+10,3]})),"wood","distant-trunks");let c=[];for(let h=-8;h<s+12;h+=8)for(let d=a==="river"?6:0;d<r+10;d+=13)for(let u=0;u<3;u++)c.push({p:[h+Math.sin(u*2.4)*3,d+Math.cos(u*2)*2,-9-u%2*2],s:[8,5,2],r:u*.5});st(t,"sphere","#8ea984",c,"leaf","distant-canopies"),a==="river"&&n("round","#8bbfc0",[s+20,2,4],[s/2,-1,-8],"distant-river")}else if(a==="street"){let l=Math.ceil(s/14)+1;st(t,"box","#97b4af",mt(l,h=>({p:[h*14,12+h%3*3,-16],s:[11,24+h%3*6,2]})),"brick","city-silhouettes");let c=[];for(let h=0;h<l;h++)for(let d=0;d<5;d++)for(let u=0;u<3;u++)c.push({p:[h*14-3.5+u*3.5,3+d*4,-14.9],s:[1.3,2,.04]});st(t,"box","#b9cebb",c,"plain","city-windows")}else if(a==="kitchen"){n("box","#c1b69e",[s+20,r+8,.2],[s/2,r/2,-12],"kitchen-wall",t.group,"plain");let l=[];for(let c=-8;c<s+10;c+=4)for(let h=-3;h<r+8;h+=3)l.push({p:[c,h,-11.8],s:[3.92,2.92,.12]});st(t,"round","#d2c5aa",l,"tile","ceramic-tiles")}else if(a==="casino"||a==="bonus"){let l=Math.ceil(s/.8)+4;st(t,"cylinder","#8a8da7",mt(l,h=>({p:[h*.8-1,r/2,-11],s:[1,r+6,.7]})),"fabric","distant-drapes");let c=[];for(let h=0;h<s;h+=5)for(let d=2;d<r;d+=5)c.push({p:[h,d,-10.4],s:[.6,.6,.2],r:.4});st(t,"star","#c5b58a",c,"metal","curtain-stars")}else if(a==="study"||a==="office")n("box",a==="study"?"#b5a79d":"#9eafb0",[s+20,r+8,.2],[s/2,r/2,-12],"wallpaper",t.group,"fabric"),st(t,"round",a==="study"?"#c2b298":"#b7c3ba",mt(Math.ceil(s/2)+8,l=>({p:[l*2-8,r/2,-11.8],s:[.08,r+8,.06]})),"plain","wallpaper-stripes"),st(t,"round","#819699",mt(Math.ceil(s/18),l=>({p:[l*18+8,6,-10.9],s:[6,4,.25]})),"wood","wall-panels");else if(a==="toys"){n("box","#b5acbd",[s+20,r+8,.2],[s/2,r/2,-12],"workshop-wall",t.group,"fabric");let l=Math.ceil(s/9)+2;st(t,"round","#9a9bb9",mt(l,c=>({p:[c*9-4,4+c%3*3,-10],s:[6,8+c%3*6,1]})),"fabric","toy-packaging"),st(t,"star","#d6c28f",mt(l,c=>({p:[c*9-4,5+c%3*3,-9.4],s:[2,2,.2]})),"metal","package-stars")}else{n("box",a==="sewer"?"#809c99":"#96a8a5",[s+20,r+8,.2],[s/2,r/2,-13],"industrial-wall",t.group,a==="sewer"?"brick":"metal");let l=Math.ceil(s/9)+2;st(t,"cylinder",a==="sewer"?"#a68c70":"#839995",mt(l,h=>({p:[h*9-4,r/2,-10],s:[.75,r+8,.75]})),"metal","distant-pipework");let c=[];for(let h=2;h<r+10;h+=7)c.push({p:[s/2,h,-11],s:[s+20,.35,.6]});st(t,"box","#7b9393",c,"metal","wall-beams")}return t.group.traverse(l=>{l.isMesh&&(l.castShadow=!1,l.receiveShadow=!1)}),t}function $x(i,e=1){e=Math.max(.2,e||1);let t=i.filter(d=>(d.lives??1)>0);t.length||t.push({x:2,y:1,w:.8,h:1.3});let n=Math.min(...t.map(d=>d.x-(d.w??.8)/2))-2,s=Math.max(...t.map(d=>d.x+(d.w??.8)/2))+2,r=Math.min(...t.map(d=>d.y))-2.2,a=Math.max(...t.map(d=>d.y+(d.h??1.3)))+3.5,o=Math.max(10.5,11/e,a-r,(s-n)/e),l=o*e,c=(n+s)/2,h=(a+r)/2;return{x:c,y:h,width:l,height:o,left:c-l/2,right:c+l/2,bottom:h-o/2,top:h+o/2}}function Kx(i=1){let e={mode:"auto",dpr:Math.min(i,1.6),shadows:!0,frameMs:0,samples:0},t=0,n=0;return e.set=s=>{if(!["auto","high","low"].includes(s))throw new RangeError("\u753B\u8D28\u5FC5\u987B\u4E3A high\u3001auto \u6216 low");e.mode=s,e.dpr=s==="low"?Math.min(i,1):Math.min(i,s==="high"?2:1.6),e.shadows=s!=="low",t=0,n=0},e.observe=s=>{!Number.isFinite(s)||s<=0||(e.frameMs=e.samples?e.frameMs*.95+s*.05:s,e.samples++,n++,e.mode==="auto"&&n>30&&(t=s>28?t+1:Math.max(0,t-2),t>=60&&(e.dpr=Math.max(.75,e.dpr*.75),e.shadows=!1,t=0)))},e}function jx(i,e,t){let n=Rt(e,`platform:${i.id}`),s=Ui[t]??Ui.street,r=t==="tree"?"wood":["factory","fatcat","sewer"].includes(t)?"metal":"wood";if(["branch","pipe","wire"].includes(i.kind)){let a=n.part("cylinder",i.kind==="wire"?"#657b79":i.kind==="pipe"?"#b8875e":s.surface,[1,1,1],[0,0,0],"platform-body",n.group,i.kind==="branch"?"wood":"metal");a.rotation.z=Math.PI/2}else n.part("round",s.surface,[1,1,1],[0,0,0],"platform-body",n.group,r);if(n.part("box",i.kind==="conveyor"?"#495e63":s.accent,[1,.12,1.04],[0,.46,0],"walkable-top",n.group,r),i.kind==="conveyor")for(let a=0;a<12;a++)n.part("box","#d8bd7c",[.024,.13,1.05],[-.46+a*.084,.46,0],"belt-tread",n.group,"metal");if(i.kind==="moving")for(let a of[-.43,.43])n.part("sphere","#edcc75",[.09,.4,.13],[a,0,.53],"lift-light");return n.update=a=>{n.group.position.set(a.x+a.w/2,a.y-a.h/2,0),n.group.scale.set(a.w,a.h??.65,1.5)},n.update(i),n}function Qx(i,e){let t=Rt(e,`hazard:${i.id}`),n=i.w??1,s=i.h??1;if(i.kind==="spike"){let r=Math.max(1,Math.ceil(n/.35));for(let a=0;a<r;a++)t.part("cone","#bdc8c3",[n/r*.9,s,.5],[-n/2+(a+.5)*n/r,s/2,0],"spike",t.group,"metal")}else if(i.kind==="electric")for(let r=0;r<5;r++){let a=t.part("round","#d4f3a8",[n/5*.4,s,.12],[-n/2+(r+.5)*n/5,s/2,.3],"arc",t.group,"plain",{emissive:"#bddd6a",emissiveIntensity:.7});a.rotation.z=r%2?.25:-.25}else i.kind==="press"?(t.part("round","#81999c",[n,s,1.2],[0,s/2,0],"press",t.group,"metal"),t.part("box","#e4b661",[n,.14,1.24],[0,.08,0],"press-warning")):t.part("round",i.kind==="water"?"#65a9ad":"#8bced0",[n,s,.65],[0,s/2,0],"falling-water",t.group,"plain",{transparent:!0,opacity:.65});return t.update=r=>{t.group.position.set(r.x,r.y,0),t.group.visible=r.active!==!1},t}function ey(){let i=Ir(),e=new Xt,t=new Map;e.name="rescue-world";let n=null,s=null,r=null,a=null,o=0,l=!1,c=[],h=new wt,d=new Ci(i.geometry("sphere"),i.material("plain","#ffe1a0",{emissive:"#d5a558",emissiveIntensity:.2}),48);d.name="hit-particles",d.frustumCulled=!1,d.count=0,e.add(d);function u(){t.forEach(p=>p.dispose()),t.clear(),n?.dispose(),n=null,s?.dispose(),s=null,c.length=0,d.count=0}function m(p){if(l)throw new Error("Scene has been disposed");if(r===p)return;u(),r=p,n=fu(p,i),e.add(n.group),s=pu(p,i),e.add(s.group);let g=Rt(i,"exit-marker");g.part("torus","#ead090",[1,1.6,.25],[0,1,0],"exit-ring",g.group,"metal"),g.part("star","#f4d888",[.4,.4,.4],[0,1.95,0],"exit-star"),g.group.position.set(p.exit?.x??0,p.exit?.y??1,-.5),t.set("exit",g),e.add(g.group)}function f(p,g,M,S,v=()=>!0){let E=new Set;for(let w of g??[]){if(!v(w))continue;let R=`${p}:${w.id}`;E.add(R);let _=t.get(R);_||(_=M(w),_.group.name=R,t.set(R,_),e.add(_.group)),_.update?.(w,S)}for(let[w,R]of t)w.startsWith(`${p}:`)&&!E.has(w)&&(R.dispose(),t.delete(w))}function y(p,g){(!r||r.id!==p.level.id)&&m(p.level),a!==p&&(a=p,o=0,c.length=0);let M=p.time??0;f("platform",p.platforms??p.level.platforms,S=>jx(S,i,p.level.theme),M),f("player",p.players,S=>lu(S.character,i),M,S=>S.lives>0),f("object",p.objects,S=>hu(S.kind,i),M,S=>S.active!==!1),f("enemy",p.enemies,S=>zc(S.kind,i),M,S=>S.alive!==!1),f("pickup",p.pickups,S=>du(S.kind,i),M,S=>!S.collected),f("hazard",p.hazards,S=>Qx(S,i),M),f("projectile",p.projectiles,S=>uu(S.kind,i),M,S=>(S.ttl??1)>0),f("boss",p.boss?[p.boss]:[],S=>Jo(S.kind,i),M,S=>!S.defeated);for(let S of p.events??[]){let v=Number(String(S.id).split("-").at(-1));if(!(!Number.isFinite(v)||v<=o)&&(o=v,["hit","break","collect","bossHit","damage"].includes(S.type))){let E=p.players.find(w=>w.id===S.player)??p.players[0];for(let w=0;w<6&&c.length<48;w++)c.push({x:S.x??E.x,y:(S.y??E.y)+.7,vx:Math.cos(w*2.4)*2,vy:1.3+Math.sin(w)*2,life:.45})}}for(let S=c.length-1;S>=0;S--){let v=c[S];v.life-=g,v.x+=v.vx*g,v.y+=v.vy*g,v.vy-=7*g,v.life<=0&&c.splice(S,1)}d.count=c.length,c.forEach((S,v)=>{h.position.set(S.x,S.y,.3),h.scale.setScalar(.08*S.life/.45),h.updateMatrix(),d.setMatrixAt(v,h.matrix)}),d.instanceMatrix.needsUpdate=!0}return{group:e,resources:i,setLevel:m,update:y,get level(){return r},get entityCount(){return t.size},get particleCount(){return c.length},dispose(){l||(l=!0,u(),d.dispose(),e.clear(),e.removeFromParent(),i.dispose())}}}function mu(i){let e;try{e=new Xo({canvas:i,antialias:!0,alpha:!1,powerPreference:"high-performance"})}catch(T){throw new Error("\u65E0\u6CD5\u542F\u52A8 WebGL 2 \u4E09\u7EF4\u753B\u9762\uFF0C\u8BF7\u542F\u7528\u6D4F\u89C8\u5668\u786C\u4EF6\u52A0\u901F\u6216\u66F4\u6362\u652F\u6301 WebGL 2 \u7684\u6D4F\u89C8\u5668\u3002",{cause:T})}e.outputColorSpace=Nt,e.toneMapping=xr,e.toneMappingExposure=1.28,e.shadowMap.enabled=!0,e.shadowMap.type=$a;let t=new Xs,n=ey();t.add(n.group);let s=new hi(-8,8,5,-5,.1,180);s.position.set(0,6,34);let r=new pr("#fff7df","#827363",2.7);t.add(r);let a=new ps("#fff0d5",3.1);a.castShadow=!0,a.shadow.mapSize.set(1024,1024),a.shadow.normalBias=.035,a.shadow.bias=-15e-5,a.shadow.camera.near=.5,a.shadow.camera.far=80,t.add(a,a.target);let o=new ps("#bfdcdd",1.2);o.position.set(-8,8,-10),t.add(o);let l=Kx(Math.max(1,globalThis.devicePixelRatio??1)),c=1,h=1,d=null,u=!1,m=!1,f=0,y=0,p=null,g=null,M=T=>{T.preventDefault(),m=!0},S=()=>{m=!1};i.addEventListener("webglcontextlost",M),i.addEventListener("webglcontextrestored",S);function v(){e.setPixelRatio(l.dpr),e.setSize(c,h,!1),e.shadowMap.enabled=l.shadows,e.shadowMap.needsUpdate=!0}function E(T,P){c=Math.max(1,T),h=Math.max(1,P),v()}function w(T){n.setLevel(T),d=null,p=null}function R(T,P=1/60){if(u||m)return;if(n.update(T,Math.max(0,Math.min(P,.1))),p!==T.level.theme){p=T.level.theme;let X=Ui[p]??Ui.street;t.background=new Je(X.sky),t.fog=new Ws(X.fog,40,95)}let C=T.players.filter(X=>X.lives>0).map(X=>({...X}));T.boss?.active&&!T.boss.defeated&&C.push({...T.boss,lives:1});let N=$x(C,c/h);if(!d)d=N;else{let X=1-Math.exp(-Math.max(P,.001)*8),z={x:d.x+(N.x-d.x)*X,y:d.y+(N.y-d.y)*X,width:d.width+(N.width-d.width)*X,height:d.height+(N.height-d.height)*X},q=Math.max(z.height,2*Math.max(z.y-N.bottom,N.top-z.y),2*Math.max(z.x-N.left,N.right-z.x)/(c/h));d={x:z.x,y:z.y,height:q,width:q*c/h}}s.left=-d.width/2,s.right=d.width/2,s.top=d.height/2,s.bottom=-d.height/2,s.updateProjectionMatrix(),s.position.set(d.x,d.y+3,34),s.lookAt(d.x,d.y,0);let B=Math.min(24,Math.max(12,d.width*.6));a.position.set(d.x-6,d.y+12,15),a.target.position.set(d.x,d.y,0),Object.assign(a.shadow.camera,{left:-B,right:B,top:B,bottom:-B}),a.shadow.camera.updateProjectionMatrix();for(let X of n.group.children)if(X.name==="scenery")for(let z of X.children){let q=z.scale.x*.7;z.visible=Math.abs(z.position.x-d.x)<d.width/2+q+5&&Math.abs(z.position.y+z.scale.y/2-d.y)<d.height/2+z.scale.y/2+5}else X.name!=="hit-particles"&&X.name!=="backdrop"&&!X.name.startsWith("player:")&&!X.name.startsWith("boss:")&&!X.name.startsWith("hazard:")&&(X.visible=Math.abs(X.position.x-d.x)<d.width/2+Math.max(3,X.scale.x/2)+4&&Math.abs(X.position.y-d.y)<d.height/2+Math.max(3,X.scale.y/2)+4);let I=performance.now();e.render(t,s),f=performance.now()-I,y++;let U=l.dpr,H=l.shadows,Y=performance.now();l.observe(Math.max(f,g===null?f:Math.min(250,Y-g))),g=Y,(U!==l.dpr||H!==l.shadows)&&v()}function _(){return{webgl:!m,contextLost:m,quality:l.mode,dpr:l.dpr,shadows:l.shadows,frameMs:Number(l.frameMs.toFixed(2)),renderMs:Number(f.toFixed(2)),fps:l.frameMs?Number((1e3/l.frameMs).toFixed(1)):0,frames:y,drawCalls:e.info.render.calls,triangles:e.info.render.triangles,geometries:e.info.memory.geometries,textures:e.info.memory.textures,resources:n.resources.stats(),entities:n.entityCount,particles:n.particleCount,viewport:{width:c,height:h},camera:d?{...d}:null}}return{setLevel:w,update:R,resize:E,setQuality(T){l.set(T),v()},diagnostics:_,dispose(){u||(u=!0,i.removeEventListener("webglcontextlost",M),i.removeEventListener("webglcontextrestored",S),n.dispose(),a.shadow.map?.dispose(),e.dispose(),t.clear())}}}var gu=[{left:"KeyA",right:"KeyD",up:"KeyW",down:"KeyS",jump:"Space",action:"KeyE"},{left:"ArrowLeft",right:"ArrowRight",up:"ArrowUp",down:"ArrowDown",jump:"Enter",action:"ShiftRight"}],Vc=(i,e)=>!!(i.buttons?.[e]?.pressed||i.buttons?.[e]?.value>.5);function xu({target:i=globalThis.window,players:e=1,gamepads:t=()=>globalThis.navigator?.getGamepads?.()??[],onPause:n=()=>{},capture:s=()=>!0,joystick:r=null,jump:a=null,action:o=null}={}){let l=e,c=new Set,h=new Set,d=new Set,u=[null,null],m=new Map,f=new Map,y=[],p=Array.from({length:2},()=>({jump:[],action:[]})),g=Array.from({length:2},()=>({jump:!1,action:!1})),M={move:0,up:!1,down:!1,jump:!1,action:!1},S=new Set,v=new Map,E=new Set,w=(C,N,B)=>{C?.addEventListener(N,B),y.push(()=>C?.removeEventListener(N,B))},R=new Set([...gu.flatMap(C=>Object.values(C)),"Escape"]);w(i,"keydown",C=>{R.has(C.code)&&(s()&&C.preventDefault(),!c.has(C.code)&&!h.has(C.code)&&(d.add(C.code),C.code==="Escape"&&n()),c.add(C.code))}),w(i,"keyup",C=>{c.delete(C.code),h.delete(C.code)});function _(){for(let C of c)h.add(C);d.clear();for(let C=0;C<2;C++)for(let N of["jump","action"])p[C][N].length=0,g[C][N]=!1;M.move=0,M.up=!1,M.down=!1,M.jump=!1,M.action=!1,S.clear();for(let C of v.keys())E.add(C);for(let C of Array.from(t()??[]).filter(Boolean))f.set(C.index,{buttons:new Set(C.buttons?.map((N,B)=>B).filter(N=>Vc(C,N))??[]),axis:Math.abs(C.axes?.[0]??0)>.2||Math.abs(C.axes?.[1]??0)>.2})}w(i,"blur",_);function T(C,N){let B=U=>{if(!E.has(U.pointerId))if(N==="stick"){let H=C.getBoundingClientRect(),Y=(U.clientX-H.x-H.width/2)/(H.width*.35),X=(U.clientY-H.y-H.height/2)/(H.height*.35);M.move=Math.abs(Y)>.25?Math.max(-1,Math.min(1,Y)):0,M.up=X<-.3,M.down=X>.3,M.move&&S.add(M.move>0?"right":"left"),M.up&&S.add("up"),M.down&&S.add("down"),C.style.setProperty("--stick-x",`${Math.max(-30,Math.min(30,Y*30))}px`),C.style.setProperty("--stick-y",`${Math.max(-30,Math.min(30,X*30))}px`)}else M[N]||(M[N]=!0,S.add(N))};w(C,"pointerdown",U=>{U.preventDefault(),v.set(U.pointerId,N),C.setPointerCapture?.(U.pointerId),B(U)}),w(C,"pointermove",U=>{v.get(U.pointerId)===N&&B(U)});let I=U=>{v.get(U.pointerId)===N&&(v.delete(U.pointerId),E.delete(U.pointerId),N==="stick"?(M.move=0,M.up=!1,M.down=!1,C.style.setProperty("--stick-x","0px"),C.style.setProperty("--stick-y","0px")):M[N]=!1)};w(C,"pointerup",I),w(C,"pointercancel",I),w(C,"lostpointercapture",I)}T(r,"stick"),T(a,"jump"),T(o,"action");function P(){let C=Array.from(t()??[]).filter(I=>I&&I.connected!==!1&&I.mapping==="standard"),N=new Set(C.map(I=>I.index));for(let I=0;I<2;I++)if(u[I]!==null&&!N.has(u[I])){for(let U of["jump","action"])p[I][U]=p[I][U].filter(H=>H.pad!==u[I]);m.delete(u[I]),f.delete(u[I]),u[I]=null}for(let I=0;I<l;I++)u[I]===null&&(u[I]=C.find(U=>!u.includes(U.index))?.index??null);let B=Array.from({length:l},(I,U)=>{let H=gu[U],Y=q=>!h.has(q)&&(c.has(q)||d.has(q)),X={move:Number(Y(H.right))-Number(Y(H.left)),up:Y(H.up),down:Y(H.down),jump:d.has(H.jump)&&!h.has(H.jump),action:d.has(H.action)&&!h.has(H.action)},z=C.find(q=>q.index===u[U]);if(z){let q=f.get(z.index);if(q){for(let J of q.buttons)Vc(z,J)||q.buttons.delete(J);Math.abs(z.axes?.[0]??0)<.2&&Math.abs(z.axes?.[1]??0)<.2&&(q.axis=!1)}let j=m.get(z.index)??new Set,Se=new Set(z.buttons?.map((J,ee)=>ee).filter(J=>Vc(z,J))??[]),be=J=>Se.has(J)&&!j.has(J)&&!q?.buttons.has(J),nt=q?.axis?0:z.axes?.[0]??0,Ye=q?.axis?0:z.axes?.[1]??0,et=Number(Se.has(15)&&!q?.buttons.has(15))-Number(Se.has(14)&&!q?.buttons.has(14))||(Math.abs(nt)>.2?nt:0);Math.abs(et)>Math.abs(X.move)&&(X.move=et),X.up||=Ye<-.3||Se.has(12)&&!q?.buttons.has(12),X.down||=Ye>.3||Se.has(13)&&!q?.buttons.has(13),X.jump||=be(0),X.action||=be(1),m.set(z.index,Se),be(9)&&n()}U===0&&(Math.abs(M.move)>Math.abs(X.move)?X.move=M.move:X.move||(X.move=Number(S.has("right"))-Number(S.has("left"))),X.up||=M.up||S.has("up"),X.down||=M.down||S.has("down"),X.jump||=S.has("jump"),X.action||=S.has("action"));for(let q of["jump","action"]){if(X[q]&&p[U][q].length<8){let Se=d.has(H[q])&&!h.has(H[q])||U===0&&S.has(q);p[U][q].push({up:X.up,down:X.down,pad:Se?null:z?.index})}let j=g[U][q]?null:p[U][q].shift();X[q]=!!j,j&&(X.up||=j.up,X.down||=j.down),g[U][q]=X[q]}return X});return d.clear(),S.clear(),B}return{sample:P,clear:_,setPlayers(C){l=Math.max(1,Math.min(2,C)),l===1&&(u[1]=null),_()},dispose(){_(),y.forEach(C=>C())},get bindings(){return u.slice(0,l)}}}var yu="rescue-rangers-3d-v1",Lr=(i,e=0,t=1e9)=>Number.isFinite(i)&&i>=0?Math.min(t,Math.floor(i)):e;function $o(i={}){let e=rh();for(let a of Array.isArray(i?.campaign?.completed)?i.campaign.completed:[])typeof a=="string"&&zr(e,a);vi(e).includes(i?.campaign?.current)&&(e.current=i.campaign.current);let t=i?.options??{},n={music:t.music!==!1,sound:t.sound!==!1,quality:["auto","high","low"].includes(t.quality)?t.quality:"auto",players:t.players===2?2:1,character:t.character==="dale"?"dale":"chip"},s=i?.run,r=null;if(s&&vi(e).includes(s.areaId)&&Array.isArray(s.lives)&&s.lives.length>0&&s.lives.every(a=>Number.isFinite(a)&&a>=0)){let a=s.players===2?2:1;r={areaId:s.areaId,score:Lr(s.score),flowers:Lr(s.flowers),stars:Lr(s.stars),lives:Array.from({length:a},(o,l)=>Lr(s.lives[l],3,99)),players:a,character:s.character==="dale"?"dale":"chip"},r.lives.every(o=>o===0)&&(r=null)}return{version:1,campaign:e,options:n,run:r,bestScore:Math.max(Lr(i?.bestScore),r?.score??0)}}function _u(i){if(i===void 0)try{i=globalThis.localStorage}catch{i={getItem(){throw new Error("storage denied")},setItem(){throw new Error("storage denied")}}}let e="",t=0;return{load(){try{let n=i.getItem(yu);e="";try{let s=$o(n?JSON.parse(n):{});return t=s.bestScore,s}catch{return $o()}}catch{return e="\u8FDB\u5EA6\u8BFB\u53D6\u5931\u8D25\uFF0C\u672C\u6B21\u4ECE\u65B0\u5192\u9669\u5F00\u59CB\u3002",$o()}},save(n){try{let s=$o(n);return s.bestScore=Math.max(t,s.bestScore),i.setItem(yu,JSON.stringify(s)),t=s.bestScore,e="",{ok:!0}}catch{return e="\u8FDB\u5EA6\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u6D4F\u89C8\u5668\u5B58\u50A8\u7A7A\u95F4\u3002",{ok:!1,error:e}}},get error(){return e}}}var vu={street:[0,4,7,9,7,4,2,7],tree:[0,7,9,12,9,7,4,2],kitchen:[0,3,7,10,7,5,3,7],study:[0,4,9,7,4,2,5,7],toys:[12,7,9,4,7,12,14,9],river:[0,5,7,9,7,5,2,4],factory:[0,3,7,3,5,2,7,5],casino:[0,4,7,10,9,5,7,2],sewer:[0,2,5,7,5,2,-2,2],office:[0,7,4,11,9,4,7,2],fatcat:[0,3,6,7,6,3,2,-2],bonus:[0,4,7,12,11,7,9,12]};function bu(i={}){let e=null,t={music:!0,sound:!0,...i},n=!1,s=null,r=0,a=null,o=0,l="street",c=new Map,h={};function d(f,y=.14,p="triangle",g=.045,M=!0){if(!e||e.state!=="running")return!1;let S=e.createOscillator(),v=e.createGain(),E=e.currentTime;return S.type=p,S.frequency.value=261.63*2**(f/12),v.gain.setValueAtTime(0,E),v.gain.linearRampToValueAtTime(g,E+.012),v.gain.exponentialRampToValueAtTime(1e-4,E+y),S.connect(v),v.connect(e.destination),c.set(S,M),S.onended=()=>{c.delete(S),S.disconnect(),v.disconnect()},S.start(E),S.stop(E+y+.02),!0}function u(f=!1){for(let[y,p]of c)if(!(f&&p)){try{y.stop()}catch{}c.delete(y)}}function m(){s&&(clearInterval(s),s=null),n&&t.music&&e?.state==="running"&&(s=setInterval(()=>{let f=vu[l]??vu.tree,y=f[r%f.length];d(y,.16,"triangle",.032,!1),r%2===0&&d(y-24,.19,"sine",.025,!1),r++},210))}return{async unlock(){try{if(!e){let f=globalThis.AudioContext??globalThis.webkitAudioContext;if(!f)return;e=new f}e.state==="suspended"&&await e.resume(),m()}catch{}},setOptions(f){t={...t,...f},u(),m()},setActive(f,{finishEffects:y=!1}={}){n=!!f,n||u(y),m()},consume(f){a!==f&&(a=f,o=0,r=0),l!==f.level.theme&&(l=f.level.theme,r=0);for(let y of f.events){let p=Number(y.id.split("-").at(-1));if(p<=o||(o=p,!n||!t.sound))continue;let g={jump:7,pickup:4,throw:12,hit:14,break:2,damage:-12,lifeLost:-19,collect:16,extraLife:24,bossHit:19,bossDefeated:24,bonus:21,clear:28,stun:-4};g[y.type]!==void 0&&d(g[y.type],["clear","bossDefeated","extraLife"].includes(y.type)?.5:.13,y.type==="damage"?"sawtooth":"sine",.06)&&(h[y.type]=(h[y.type]??0)+1)}},diagnostics(){return{state:e?.state??"locked",active:n,music:t.music,sound:t.sound,voices:c.size,lastEvent:o,effects:{...h}}},dispose(){n=!1,s&&clearInterval(s),s=null,u(),e?.close().catch(()=>{}),e=null}}}var qe=i=>document.getElementById(i),Fi=qe("view"),Dr=_u(),Xe=Dr.load(),On=bu(Xe.options),Gt,Te,hn="home",Bt=null,Hc=null,ki=null,ws=0,Ko=!1,el=!1,Gc=null,Wc,Su=!Dr.error,Oi=xu({players:Xe.options.players,joystick:qe("joystick"),jump:qe("touch-jump"),action:qe("touch-action"),capture:()=>hn==="game"&&!Bt,onPause:()=>{hn==="game"&&(Bt==="pause"?qc():Bt||cn("pause"))}});function jo(i,e=!1){clearTimeout(Wc),qe("notice").textContent=i,i&&!e&&(Wc=setTimeout(()=>{qe("notice").textContent=""},5e3))}function Es(){let i=Dr.save(Xe);return Su=i.ok,i.ok||jo(i.error,!0),i.ok}function Bi(){qe("best-score").textContent=`\u6700\u9AD8\u7EAA\u5F55\uFF1A${Xe.bestScore} \u5206`;for(let[i,e]of[["players-one",Xe.options.players===1],["players-two",Xe.options.players===2],["chip",Xe.options.character==="chip"],["dale",Xe.options.character==="dale"],["music",Xe.options.music],["sound",Xe.options.sound]])qe(i).setAttribute("aria-pressed",String(e));qe("music").textContent=`\u97F3\u4E50\uFF1A${Xe.options.music?"\u5F00":"\u5173"}`,qe("sound").textContent=`\u97F3\u6548\uFF1A${Xe.options.sound?"\u5F00":"\u5173"}`;for(let i of document.querySelectorAll("[data-quality]"))i.setAttribute("aria-pressed",String(i.dataset.quality===Xe.options.quality));qe("continue").hidden=!Xe.run,qe("saved-label").textContent=Xe.run?`${Su?"\u5DF2\u4FDD\u5B58":"\u672C\u6B21\u8FDB\u5EA6\u672A\u4FDD\u5B58"}\uFF1A${Br(Xe.run.areaId).name}\u8D77\u70B9 \xB7 ${Xe.run.score} \u5206`:""}function kr(){if(!Gt)return;let i=Fi.getBoundingClientRect();Gt.resize(i.width,i.height)}function wu(i,e=Te){return{areaId:i,score:e.score,flowers:e.flowers,stars:e.stars,lives:e.players.map(t=>t.lives),players:e.players.length,character:e.players[0].character}}function Ur(i,e=!1){Te&&cl(Te,!i),Oi.clear(),On.setActive(i&&!document.hidden,{finishEffects:e&&!document.hidden}),ws=0,Gt&&Te&&Eu()}function tl(){for(let i of document.querySelectorAll(".panel"))i.hidden=!0;qe("overlay").hidden=!0,Bt=null}function cn(i,e=!1){Bt!==i&&(Ur(!1,e),tl(),Bt=i,qe(i+"-panel").hidden=!1,qe("overlay").hidden=!1,i==="map"&&ty(),Fi.dataset.phase=i==="pause"?"paused":i)}function qc(){let i=Hc;if(Hc=null,tl(),i){cn(i);return}hn==="game"&&["playing","bonus"].includes(Te.status)?(Ur(!0),Fi.focus({preventScroll:!0})):Ur(!1)}function Nr(){tl(),hn="home",document.body.dataset.screen="home",qe("home-panel").hidden=!1,qe("hud").hidden=!0,qe("touch-controls").hidden=!0,qe("bonus-bar").hidden=!0,Ko=!1,Te=ll(Br("0"),{players:2,character:Xe.options.character}),cl(Te,!0),Gt.setLevel(Te.level),Ur(!1),Bi(),kr()}function Qo(i,{resume:e=!1,reset:t=!1,retry:n=!1}={}){tl(),hn="game",document.body.dataset.screen="game",qe("home-panel").hidden=!0,qe("hud").hidden=!1,qe("touch-controls").hidden=!1,Ko=!1;let s=e?Xe.run:n?Gc:t?null:Xe.run,r=e&&s?{players:s.players,character:s.character}:Xe.options;Te=ll(Br(i),{players:r.players,character:r.character,campaign:Xe.campaign}),s&&(Te.score=s.score,Te.flowers=s.flowers,Te.stars=s.stars,Te.players.forEach((a,o)=>{a.lives=n?3:s.lives[o]??3,a.hearts=a.lives>0?3:0})),Xe.campaign.current=i,Gc=wu(i),Xe.run=structuredClone(Gc),Es(),Bi(),Oi.setPlayers(Te.players.length),Gt.setLevel(Te.level),kr(),Ur(!0),Fi.focus({preventScroll:!0}),On.unlock()}function ty(){let i=vi(Xe.campaign);qe("area-grid").replaceChildren();for(let e of Ts){let t=document.createElement("button");t.dataset.area=e.id,t.disabled=!i.includes(e.id);let n=document.createElement("b");n.textContent=e.id;let s=document.createElement("span");s.textContent=e.name,t.append(n,s),Xe.campaign.completed.includes(e.id)&&(t.setAttribute("aria-label",`${e.id} ${e.name}\uFF0C\u5DF2\u5B8C\u6210\uFF0C\u53EF\u56DE\u73A9`),t.append(document.createTextNode("\u2713 \u5DF2\u5B8C\u6210"))),t.addEventListener("click",()=>Qo(e.id)),qe("area-grid").append(t)}qe("map-copy").textContent=Xe.campaign.ending?"\u670B\u53CB\u5DF2\u83B7\u6551\uFF01\u4E5F\u53EF\u4EE5\u56DE\u5230\u559C\u6B22\u7684\u533A\u57DF\u518D\u5192\u9669\u3002":"\u5B8C\u6210\u533A\u57DF\u540E\uFF0C\u65B0\u7684\u8DEF\u7EBF\u4F1A\u4EAE\u8D77\u6765\u3002"}function ny(){if(Ko)return;Ko=!0;let i=Xe.campaign.current,e=wu(i);Xe.run=e;let t=Es();Bi(),qe("complete-title").textContent=Te.ending?"\u670B\u53CB\u83B7\u6551\u4E86\uFF01":"\u533A\u57DF\u5B8C\u6210\uFF01",qe("complete-copy").textContent=Te.ending?`\u5947\u5947\u548C\u8482\u8482\u7EC8\u4E8E\u6551\u51FA\u4E86\u670B\u53CB\u3002\u4E00\u8DEF\u6536\u83B7 ${Te.score} \u5206\uFF0C${Te.flowers} \u6735\u82B1\u548C ${Te.stars} \u9897\u661F\u3002`:`${Te.areaLevel.name}\u63A2\u7D22\u5B8C\u6210\uFF0C\u6536\u83B7 ${Te.score} \u5206\u3002\u9009\u62E9\u5730\u56FE\u4E0A\u4EAE\u8D77\u7684\u4E0B\u4E00\u7AD9\u3002`,qe("next-area").textContent=Te.ending?"\u518D\u53BB\u63A2\u9669":"\u9009\u62E9\u4E0B\u4E00\u7AD9",cn("complete",!0),t&&jo("\u8FDB\u5EA6\u5DF2\u4FDD\u5B58\uFF0C\u53EF\u4ECE\u4E0B\u4E00\u7AD9\u8D77\u70B9\u7EE7\u7EED\u3002")}function iy(){let i=Te.players;qe("area-name").textContent=Te.areaLevel.name,qe("hearts").textContent=i.map((e,t)=>`${i.length>1?`${t+1}P `:""}${e.character==="chip"?"\u5947\u5947":"\u8482\u8482"} ${"\u2665".repeat(e.hearts)}${"\u2661".repeat(3-e.hearts)} \xD7${e.lives}`).join("  "),qe("score").textContent=`${Te.score} \u5206`,qe("collectibles").textContent=`\u82B1 ${Te.flowers} \xB7 \u661F ${Te.stars}`,qe("bonus-bar").hidden=Te.status!=="bonus"||!!Bt,Te.bonus&&(qe("bonus-count").textContent=`\u5956\u52B1\u65F6\u95F4 ${Math.ceil(Te.bonus.remaining)} \u79D2 \xB7 \u5DF2\u6536\u96C6 ${Te.bonus.collected}`)}function Eu(){let i=Gt.diagnostics(),e=Te.players;Object.assign(Fi.dataset,{webgl:String(i.webgl),contextLost:String(i.contextLost),phase:Bt==="pause"?"paused":Bt??(hn==="home"?"home":Te.status),theme:Te.level.theme,area:Te.areaLevel.id,level:Te.level.id,x:String(e[0].x),y:String(e[0].y),positions:JSON.stringify(e.map(t=>({id:t.id,character:t.character,x:t.x,y:t.y,hearts:t.hearts,lives:t.lives,carrying:t.carrying,hidden:t.hidden,grounded:t.grounded,groundId:t.groundId,vx:t.vx,vy:t.vy}))),players:String(e.length),carrying:String(e.filter(t=>t.carrying).length),hidden:String(e[0].hidden),graphics:JSON.stringify(i),audio:JSON.stringify(On.diagnostics()),pads:JSON.stringify(Oi.bindings),score:String(Te.score),flowers:String(Te.flowers),stars:String(Te.stars),simTime:String(Te.time),completed:JSON.stringify(Xe.campaign.completed),physics:JSON.stringify({platforms:Te.platforms,objects:Te.objects,enemies:Te.enemies,hazards:Te.hazards,projectiles:Te.projectiles})})}function Tu(i){if(ki=null,el||!Gt||!Te||document.hidden)return;let e=ws?Math.min(1/30,(i-ws)/1e3):1/60;if(ws=i,hn==="game"){let t=Bt,n=Oi.sample();!Bt&&!t&&fh(Te,n,e),Te.level!==Xc&&(Gt.setLevel(Te.level),Xc=Te.level),On.consume(Te),Te.score>Xe.bestScore&&(Xe.bestScore=Te.score,Es(),Bi()),Te.status==="cleared"?ny():Te.status==="gameover"&&!Bt&&cn("gameover",!0),iy()}hn==="home"&&!Bt&&(Te.time+=e),Gt.update(Te,e),Eu(),ki=requestAnimationFrame(Tu)}var Xc;function nl(){ws=0,Gt&&Te&&ki===null&&!el&&!document.hidden&&(ki=requestAnimationFrame(Tu))}function Yc(){Oi.clear(),On.setActive(!1),hn==="game"&&!Bt&&cn("pause"),ki!==null&&cancelAnimationFrame(ki),ki=null,ws=0}function Mu(){Qo(Te.areaLevel.id,{retry:!0})}for(let[i,e]of Object.entries({start:()=>Qo("0",{reset:!0}),continue:()=>Xe.run&&Qo(Xe.run.areaId,{resume:!0}),pause:()=>cn("pause"),resume:qc,retry:Mu,home:Nr,"gameover-retry":Mu,"gameover-home":Nr,"complete-home":Nr,"next-area":()=>cn("map"),"map-open":()=>cn("map"),"help-open":()=>cn("help"),"options-open":()=>cn("options"),"paused-options":()=>{Hc="pause",cn("options")},"bonus-finish":()=>{ul(Te)}}))qe(i).addEventListener("click",()=>{On.unlock(),e(),hn==="game"&&!Bt&&Fi.focus({preventScroll:!0})});for(let i of document.querySelectorAll(".close-panel"))i.addEventListener("click",qc);for(let[i,e,t]of[["players-one","players",1],["players-two","players",2],["chip","character","chip"],["dale","character","dale"]])qe(i).addEventListener("click",()=>{Xe.options[e]=t,Es(),Bi(),hn==="home"&&Gt&&Te&&Nr()});for(let i of["music","sound"])qe(i).addEventListener("click",()=>{Xe.options[i]=!Xe.options[i],On.unlock(),On.setOptions(Xe.options),Es(),Bi()});for(let i of document.querySelectorAll("[data-quality]"))i.addEventListener("click",()=>{Xe.options.quality=i.dataset.quality,Gt?.setQuality(Xe.options.quality),Es(),Bi()});window.addEventListener("resize",kr);var Au=new ResizeObserver(kr);Au.observe(qe("stage"));window.addEventListener("blur",()=>{Oi.clear(),On.setActive(!1),hn==="game"&&!Bt&&cn("pause")});document.addEventListener("visibilitychange",()=>{document.hidden?Yc():nl()});document.addEventListener("freeze",Yc);document.addEventListener("resume",nl);window.addEventListener("pagehide",i=>{Yc(),i.persisted||(el=!0,clearTimeout(Wc),Au.disconnect(),Oi.dispose(),On.dispose(),Gt?.dispose())});window.addEventListener("pageshow",()=>{el||(kr(),nl())});try{Gt=mu(Fi),Gt.setQuality(Xe.options.quality),Nr(),Xc=Te.level,Dr.error&&jo(Dr.error,!0),nl()}catch(i){jo(i.message,!0),qe("start").disabled=!0,qe("continue").disabled=!0,qe("map-open").disabled=!0}
