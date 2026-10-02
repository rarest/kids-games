// Shared completion presentation used by the live page after a real clear.
export function presentCompletion(state, document) {
  document.getElementById("complete-title").textContent = state.ending
    ? "朋友获救了！"
    : "区域完成！";
  document.getElementById("complete-copy").textContent = state.ending
    ? `奇奇和蒂蒂终于救出了朋友。一路收获 ${state.score} 分，${state.flowers} 朵花和 ${state.stars} 颗星。`
    : `${state.areaLevel.name}探索完成，收获 ${state.score} 分。选择地图上亮起的下一站。`;
  document.getElementById("next-area").textContent = state.ending
    ? "再去探险"
    : "选择下一站";
}
