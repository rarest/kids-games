export function canvasHasRgbVariation(pixels){
  let firstRed,firstGreen,firstBlue,hasFirst=false;
  for(let offset=0;offset<pixels.length;offset+=388){
    const red=pixels[offset],green=pixels[offset+1],blue=pixels[offset+2];
    if(!hasFirst){firstRed=red;firstGreen=green;firstBlue=blue;hasFirst=true;continue}
    if(red!==firstRed||green!==firstGreen||blue!==firstBlue)return true;
  }
  return false;
}
