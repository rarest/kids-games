export function createCelebration(root) {
  let timer = 0;
  function stop() {
    clearTimeout(timer);
    root.hidden = true;
    root.replaceChildren();
  }
  return {
    stop,
    start(onEnd) {
      stop();
      root.hidden = false;
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 36; i++) {
          const spark = document.createElement('i');
          const angle = i * Math.PI * 2 / 12;
          spark.style.cssText = `--dx:${Math.cos(angle) * 150}px;--dy:${Math.sin(angle) * 150}px;--delay:${Math.floor(i / 12) * .45}s;left:${25 + Math.floor(i / 12) * 25}%;top:${30 + (i % 3) * 7}%;background:hsl(${i * 29} 85% 65%)`;
          fragment.append(spark);
        }
        root.append(fragment);
      }
      timer = setTimeout(() => { stop(); onEnd?.(); }, 3000);
    },
  };
}
