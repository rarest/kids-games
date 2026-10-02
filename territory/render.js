const TAU=Math.PI*2;
function paperPath(c){c.beginPath();c.moveTo(0,0);c.lineTo(78,0);c.lineTo(100,22);c.lineTo(100,100);c.lineTo(0,100);c.closePath()}
function line(c,x,y,u,v){c.beginPath();c.moveTo(x,y);c.lineTo(u,v);c.stroke()}
function star(c,x,y,r,n=5){c.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,d=i%2?r*.42:r;c.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d)}c.closePath();c.fill()}
function texture(c,pattern){
  c.save();c.lineWidth=1;c.strokeStyle='#fff8';c.fillStyle='#fff7';
  switch(pattern){
    case 'rice':for(let i=0;i<80;i++){const x=(i*37)%100,y=(i*61)%100;line(c,x,y,x+3,y+1)}break;
    case 'watercolor':for(let i=0;i<7;i++){c.globalAlpha=.1+i*.017;c.beginPath();c.ellipse((i*39)%100,(i*23)%100,30,15,i,0,TAU);c.fill()}break;
    case 'washi':c.lineWidth=2;for(let i=0;i<30;i++){const x=(i*29)%100,y=(i*47)%100;line(c,x,y,x+8,y-6)}break;
    case 'linen':c.globalAlpha=.3;for(let i=0;i<100;i+=4){line(c,i,0,i,100);line(c,0,i,100,i)}break;
    case 'gold-leaf':c.fillStyle='#ffe598aa';for(let i=0;i<24;i++){const x=(i*31)%100,y=(i*53)%100;c.beginPath();c.moveTo(x,y);c.lineTo(x+11,y+3);c.lineTo(x+5,y+11);c.fill()}break;
    case 'silver-leaf':c.fillStyle='#e7faffb0';for(let i=0;i<12;i++){const x=(i*47)%100,y=(i*29)%100;c.beginPath();c.moveTo(x,y);c.lineTo(x+14,y-7);c.lineTo(x+20,y+12);c.lineTo(x+3,y+17);c.fill()}break;
    case 'pearl':{const g=c.createRadialGradient(28,27,2,50,50,60);g.addColorStop(0,'#fff9');g.addColorStop(.45,'#ffeef42a');g.addColorStop(.7,'#c4f3ed66');g.addColorStop(1,'#fff0');c.fillStyle=g;c.fillRect(0,0,100,100);for(let i=0;i<8;i++){c.fillStyle='#fff7';c.beginPath();c.arc((i*37)%100,(i*67)%100,3,0,TAU);c.fill()}break}
    case 'plaid':c.lineWidth=9;c.globalAlpha=.32;for(let i=12;i<100;i+=25){line(c,i,0,i,100);line(c,0,i,100,i)}c.lineWidth=1;c.globalAlpha=.65;for(let i=5;i<100;i+=25){line(c,i,0,i,100);line(c,0,i,100,i)}break;
    case 'stripes':c.lineWidth=6;c.globalAlpha=.45;for(let i=-100;i<150;i+=17)line(c,i,0,i+100,100);break;
    case 'dots':for(let y=10;y<100;y+=18)for(let x=10;x<100;x+=18){c.beginPath();c.arc(x+(y%36?0:7),y,2.3,0,TAU);c.fill()}break;
    case 'clouds':c.lineWidth=2;for(let i=0;i<8;i++){const x=(i*41)%95,y=10+(i*27)%85;c.beginPath();c.arc(x,y,7,Math.PI,0);c.arc(x+10,y,10,Math.PI,0);c.arc(x+21,y,6,Math.PI,0);c.stroke()}break;
    case 'waves':c.lineWidth=2;for(let y=9;y<100;y+=14){c.beginPath();for(let x=0;x<=100;x+=2)c.lineTo(x,y+Math.sin(x*.14)*3);c.stroke()}break;
    case 'wood':c.strokeStyle='#593c3433';for(let y=4;y<100;y+=8){c.beginPath();for(let x=0;x<=100;x+=3)c.lineTo(x,y+Math.sin(x*.07+y)*5);c.stroke()}c.beginPath();c.ellipse(63,55,8,17,.3,0,TAU);c.stroke();break;
    case 'marble':c.lineWidth=2;for(let i=0;i<5;i++){c.beginPath();c.moveTo(i*25-10,0);c.bezierCurveTo(i*12+40,25,i*35-30,50,i*25+30,100);c.stroke()}c.lineWidth=.6;c.strokeStyle='#163d5738';line(c,0,45,100,75);break;
    case 'stars':for(let i=0;i<13;i++)star(c,8+(i*29)%90,8+(i*43)%85,3+i%3);break;
    case 'petals':for(let i=0;i<15;i++){c.beginPath();c.ellipse((i*31)%100,(i*59)%100,3,7,i,0,TAU);c.fill()}break;
    case 'snow':for(let i=0;i<9;i++){const x=10+(i*37)%80,y=10+(i*53)%80;for(let a=0;a<3;a++){const dx=Math.cos(a*Math.PI/3)*6,dy=Math.sin(a*Math.PI/3)*6;line(c,x-dx,y-dy,x+dx,y+dy)}}break;
    case 'woven':c.lineWidth=3;c.globalAlpha=.35;for(let y=0;y<100;y+=10)for(let x=0;x<100;x+=10)if((x+y)%20===0)line(c,x,y,x+8,y+8);else line(c,x+8,y,x,y+8);break;
    case 'brocade':c.lineWidth=1.3;for(let y=14;y<100;y+=24)for(let x=14;x<100;x+=24){c.beginPath();c.moveTo(x,y-8);c.quadraticCurveTo(x+11,y,x,y+8);c.quadraticCurveTo(x-11,y,x,y-8);c.stroke();c.fillRect(x-1,y-1,2,2)}break;
    case 'candy':c.lineWidth=12;c.globalAlpha=.5;c.strokeStyle='#ffe1eb';for(let i=-100;i<150;i+=28)line(c,i,0,i+100,100);c.lineWidth=4;c.strokeStyle='#fff';for(let i=-85;i<150;i+=28)line(c,i,0,i+100,100);break;
    case 'foil':c.globalAlpha=.3;for(let i=0;i<8;i++){c.fillStyle=['#ffeaa1','#b9fff0','#d9c6ff'][i%3];c.beginPath();c.moveTo((i*19)%100,0);c.lineTo((i*19+32)%120,100);c.lineTo((i*19+50)%120,100);c.fill()}break;
  }c.restore();
}
function effectMark(c,e,x,y,r,a){
  c.save();c.translate(x,y);c.rotate(a);c.lineWidth=1.1;c.strokeStyle='#fffbe8cc';c.fillStyle='#fffbe8dc';
  switch(e){
    case 'galaxy':star(c,0,0,r);c.beginPath();c.arc(0,0,r*1.7,0,TAU);c.stroke();break;
    case 'aurora':c.strokeStyle='#a7ffd3';c.beginPath();c.moveTo(-r,-r);c.bezierCurveTo(r,-r*2,-r,r*2,r,r);c.stroke();break;
    case 'fireflies':c.shadowColor='#eaff79';c.shadowBlur=5;c.fillStyle='#f5ff9b';c.beginPath();c.arc(0,0,r*.5,0,TAU);c.fill();break;
    case 'meteor':star(c,0,0,r);line(c,-r*3,0,-r,0);break;
    case 'fireworks':for(let i=0;i<6;i++){const angle=i*TAU/6;line(c,Math.cos(angle)*r*.5,Math.sin(angle)*r*.5,Math.cos(angle)*r*1.5,Math.sin(angle)*r*1.5)}break;
    case 'ice-crystals':c.fillStyle='#c3fbff';c.beginPath();c.moveTo(0,-r*1.5);c.lineTo(r*.6,0);c.lineTo(0,r);c.lineTo(-r*.6,0);c.fill();break;
    case 'lava':c.fillStyle='#ffd067';c.beginPath();c.moveTo(-r,r);c.quadraticCurveTo(-r,-r,0,-r*1.7);c.quadraticCurveTo(r*2,0,r,r);c.fill();break;
    case 'lightning':c.beginPath();c.moveTo(r,-r*2);c.lineTo(-r,0);c.lineTo(r*.3,0);c.lineTo(-r,r*2);c.stroke();break;
    case 'cherry-fall':c.fillStyle='#ffd2e0';for(let i=0;i<5;i++){c.rotate(TAU/5);c.beginPath();c.ellipse(0,-r*.65,r*.45,r*.8,0,0,TAU);c.fill()}break;
    case 'autumn-leaves':c.fillStyle='#ffc783';c.beginPath();c.ellipse(0,0,r*.6,r*1.4,.5,0,TAU);c.fill();break;
    case 'sea-foam':c.strokeStyle='#e3ffff';for(let i=0;i<3;i++){c.beginPath();c.arc(i*r*.7,0,r*.55,0,TAU);c.stroke()}break;
    case 'moonlight':c.beginPath();c.arc(0,0,r,Math.PI*.25,Math.PI*1.75);c.quadraticCurveTo(-r*.7,0,r*.7,r*.7);c.fill();break;
    case 'corona':c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();for(let i=0;i<8;i++){c.rotate(TAU/8);line(c,r*1.3,0,r*1.7,0)}break;
    case 'rainbow':for(let i=0;i<4;i++){c.strokeStyle=['#ffd6be','#fff6b4','#bcebd5','#d5d4ff'][i];c.beginPath();c.arc(0,0,r+i,Math.PI,TAU);c.stroke()}break;
    case 'ghost':c.globalAlpha=.65;c.beginPath();c.arc(0,-r*.2,r,Math.PI,0);c.lineTo(r,r);c.lineTo(0,r*.5);c.lineTo(-r,r);c.fill();break;
    case 'pixel-sparks':c.fillRect(-r,-r,r*2,r*2);c.fillRect(r*1.8,0,r,r);break;
    case 'hearts':c.beginPath();c.moveTo(0,r);c.bezierCurveTo(-r*2,0,-r,-r*2,0,-r*.6);c.bezierCurveTo(r,-r*2,r*2,0,0,r);c.fill();break;
    case 'music-notes':c.beginPath();c.ellipse(-r*.5,r*.7,r*.8,r*.5,-.3,0,TAU);c.fill();line(c,r*.15,r*.7,r*.15,-r*1.5);line(c,r*.15,-r*1.5,r*1.2,-r);break;
    case 'diamond':c.beginPath();c.moveTo(0,-r*1.3);c.lineTo(r,0);c.lineTo(0,r*1.3);c.lineTo(-r,0);c.closePath();c.stroke();line(c,-r,0,r,0);break;
    case 'clockwork':c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();line(c,0,0,0,-r*.7);line(c,0,0,r*.6,0);break;
  }c.restore();
}

// One folded-paper design shared by the hero, shop, results and live players.
export function drawPaper(ctx,x,y,size,skin,time=0,{locked=false,active=false}={}){
  ctx.save();ctx.translate(x-size/2,y-size/2);ctx.scale(size/100,size/100);
  paperPath(ctx);ctx.shadowColor='#27484d3a';ctx.shadowBlur=10;ctx.shadowOffsetX=3;ctx.shadowOffsetY=6;ctx.fillStyle=locked?'#202727':skin.color;ctx.fill();ctx.shadowColor='transparent';
  if(!locked){
    ctx.save();paperPath(ctx);ctx.clip();const shine=ctx.createLinearGradient(0,0,100,100);shine.addColorStop(0,'#ffffff45');shine.addColorStop(.5,'#ffffff00');shine.addColorStop(1,'#173b401f');ctx.fillStyle=shine;ctx.fillRect(0,0,100,100);texture(ctx,skin.pattern);
    if(skin.tier==='hidden')for(let i=0;i<5;i++)effectMark(ctx,skin.effect,14+(i*29)%75,18+(i*37)%70,3+i%2,(active?time*.3:0)+i);
    ctx.restore();ctx.strokeStyle='#fff9';ctx.lineWidth=1.3;line(ctx,3,3,76,3);line(ctx,3,3,3,95);
  }
  ctx.beginPath();ctx.moveTo(78,0);ctx.lineTo(78,22);ctx.lineTo(100,22);ctx.closePath();ctx.fillStyle=locked?'#303636':'#fff8';ctx.fill();ctx.strokeStyle=locked?'#151c1c':'#293c4225';ctx.lineWidth=.7;ctx.stroke();
  if(active&&!locked&&skin.tier==='hidden')for(let i=0;i<12;i++){
    const a=i*2.399+time*.38,r=58+(i%3)*8,px=50+Math.cos(a)*r,py=50+Math.sin(a)*r;
    ctx.globalAlpha=.35+.35*Math.sin(time*1.4+i)**2;effectMark(ctx,skin.effect,px,py,2.5+i%2,a);
  }
  ctx.restore();
}

export function createRenderer(canvas){
  const ctx=canvas.getContext('2d'),base=document.createElement('canvas');let previous='',geometry={scale:1,ox:0,oy:0},width=0,height=0;
  function draw(game,skin,time=0){
    const r=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(1,r.width),h=Math.max(1,r.height);
    if(width!==w||height!==h||canvas.width!==Math.round(w*dpr)){width=w;height=h;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);previous=''}
    const scale=Math.min((w-26)/game.cols,(h-32)/game.rows),ox=(w-game.cols*scale)/2,oy=(h-game.rows*scale)/2;geometry={scale,ox,oy};
    const key=`${game.runId}:${game.revision}:${w}:${h}:${dpr}:${skin.color}`;
    if(key!==previous){
      previous=key;base.width=canvas.width;base.height=canvas.height;const c=base.getContext('2d');c.scale(dpr,dpr);
      const water=c.createLinearGradient(0,0,w,h);water.addColorStop(0,'#b2dcd5');water.addColorStop(.5,'#83c5c8');water.addColorStop(1,'#64aeb9');c.fillStyle=water;c.fillRect(0,0,w,h);
      c.lineWidth=1;c.strokeStyle='#e9fffa34';for(let i=0;i<65;i++){const x=(i*137.31)%w,y=(i*87.47)%h;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+7,y+3,x+15,y);c.stroke()}
      const shape=new Path2D();for(let i=0;i<game.mask.length;i++)if(game.mask[i])shape.rect(ox+(i%game.cols)*scale,oy+Math.floor(i/game.cols)*scale,scale+.12,scale+.12);
      c.shadowColor='#3f6b6955';c.shadowBlur=13;c.shadowOffsetX=1;c.shadowOffsetY=8;c.fillStyle='#f8efd8';c.fill(shape);c.shadowColor='transparent';
      c.save();c.clip(shape);c.fillStyle='#fff9e7';c.fillRect(0,0,w,h);for(let i=0;i<game.mask.length;i++)if(game.mask[i]&&game.owners[i]>=0){const p=game.players[game.owners[i]];c.fillStyle=(p.id===0?skin.color:p.color)+'7a';c.fillRect(ox+i%game.cols*scale,oy+Math.floor(i/game.cols)*scale,scale+.2,scale+.2)}
      c.fillStyle='#c5ac732c';for(let i=0;i<1000;i++)c.fillRect((i*97.47)%w,(i*39.67)%h,.8,.8);c.restore();
      // Stroke the coastline only: the interior remains a continuous sheet.
      c.strokeStyle='#fff8';c.lineWidth=1;c.beginPath();for(let i=0;i<game.mask.length;i++)if(game.mask[i]){
        const gx=i%game.cols,gy=Math.floor(i/game.cols),x=ox+gx*scale,y=oy+gy*scale;
        if(gy===0||!game.mask[i-game.cols]){c.moveTo(x,y);c.lineTo(x+scale,y)}
        if(gy===game.rows-1||!game.mask[i+game.cols]){c.moveTo(x,y+scale);c.lineTo(x+scale,y+scale)}
        if(gx===0||!game.mask[i-1]){c.moveTo(x,y);c.lineTo(x,y+scale)}
        if(gx===game.cols-1||!game.mask[i+1]){c.moveTo(x+scale,y);c.lineTo(x+scale,y+scale)}
      }c.stroke();
    }
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(base,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
    for(const p of game.players){
      if(!p.alive)continue;const color=p.id===0?skin.color:p.color;
      for(const t of p.trail){
        const x=ox+Math.floor(t.x)*scale,y=oy+Math.floor(t.y)*scale;ctx.save();ctx.beginPath();ctx.rect(x,y,scale,scale);ctx.clip();ctx.fillStyle=color+'60';ctx.fillRect(x,y,scale,scale);ctx.strokeStyle=color+'b0';ctx.lineWidth=Math.max(.6,scale*.1);for(let k=-scale;k<scale*2;k+=scale*.45)line(ctx,x+k,y,x+k+scale,y+scale);ctx.restore();
      }
      const size=Math.max(16,scale*1.45);drawPaper(ctx,ox+p.x*scale,oy+p.y*scale,size,p.id===0?skin:{color:p.color,pattern:'plain',tier:'normal'},time,{active:true});
      if(p.id===0){ctx.fillStyle='#fffef1';ctx.font=`700 ${Math.max(9,scale*.6)}px system-ui`;ctx.textAlign='center';ctx.shadowColor='#356c69';ctx.shadowBlur=3;ctx.fillText('你',ox+p.x*scale,oy+p.y*scale-size*.8);ctx.shadowBlur=0}
    }
    canvas.dataset.scale=scale;canvas.dataset.offsetX=ox;canvas.dataset.offsetY=oy;canvas.dataset.paperSize=Math.max(16,scale*1.45);
    return geometry;
  }
  return{draw,getGeometry:()=>geometry};
}
