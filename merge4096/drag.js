export function columnIndexAtPoint(rects,x,y) {
  return rects.findIndex(rect=>x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom);
}

export function columnIndexForDrop(rects,releasePoint,lastPoint) {
  const released=columnIndexAtPoint(rects,releasePoint.x,releasePoint.y);
  return released>=0?released:columnIndexAtPoint(rects,lastPoint.x,lastPoint.y);
}
