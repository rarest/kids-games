export const DIFFICULTIES=Object.freeze({
  easy:Object.freeze({id:'easy',name:'轻松',luckyEvery:15,winReward:200,lossReward:60,pairBias:.65}),
  joy:Object.freeze({id:'joy',name:'欢乐',luckyEvery:25,winReward:300,lossReward:100,pairBias:.45}),
  challenge:Object.freeze({id:'challenge',name:'挑战',luckyEvery:35,winReward:450,lossReward:150,pairBias:.3})
});

export const getDifficulty=id=>DIFFICULTIES[id]??DIFFICULTIES.joy;

export function ordinaryValueCap(roundMax) {
  if(roundMax<32)return 8;
  return Math.min(512,2**Math.max(3,Math.floor(Math.log2(roundMax))-2));
}
