// Rigid rectangles rotate about their shared edge, with no scaling or interpolated vertices.
export function foldNet(solid='cube',t=0){
 if(!['cube','cuboid'].includes(solid)||!Number.isFinite(t)||t<0||t>1)throw new RangeError('Invalid net');
 const w=solid==='cube'?1:1.6,h=1,d=solid==='cube'?1:.7,a=t*Math.PI/2,c=Math.cos(a),s=Math.sin(a),bx=w+d*c,bz=d*s;
 const faces=[
 {name:'上',color:0,points:[[0,0,0],[w,0,0],[w,-d*c,d*s],[0,-d*c,d*s]]},
 {name:'左',color:1,points:[[0,0,0],[-d*c,0,d*s],[-d*c,h,d*s],[0,h,0]]},
 {name:'前',color:2,points:[[0,0,0],[w,0,0],[w,h,0],[0,h,0]]},
 {name:'右',color:3,points:[[w,0,0],[bx,0,bz],[bx,h,bz],[w,h,0]]},
 {name:'后',color:4,points:[[bx,0,bz],[bx+w*Math.cos(2*a),0,bz+w*Math.sin(2*a)],[bx+w*Math.cos(2*a),h,bz+w*Math.sin(2*a)],[bx,h,bz]]},
 {name:'下',color:5,points:[[0,h,0],[w,h,0],[w,h+d*c,d*s],[0,h+d*c,d*s]]},
 ];
 for(const face of faces)face.points=face.points.map(p=>p.map(v=>Math.abs(v)<1e-12?0:v));
 return faces;
}
