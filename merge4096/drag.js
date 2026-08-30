export function columnIndexAtPoint(rects,x,y) {
  return rects.findIndex(rect=>x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom);
}
