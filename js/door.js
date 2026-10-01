// index.html only — currently just relies on CSS animation delays.

/* ============================================
   PARALLAX — door-inner shifts subtly opposite
   the cursor (desktop) or device tilt (phone).
   ============================================ */
(function parallax() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  document.addEventListener('DOMContentLoaded', () => {
    const inner = document.querySelector('.door-inner');
    if (!inner) return;

    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    let raf = null;
    const maxShift = 10; // px

    function tick() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      inner.style.transform = `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px)`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth) - 0.5;
      const ny = (e.clientY / window.innerHeight) - 0.5;
      targetX = nx * maxShift * -1;
      targetY = ny * maxShift * -1;
    }, { passive: true });

    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma === null || e.beta === null) return;
      const nx = Math.max(-1, Math.min(1, e.gamma / 30));
      const ny = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      targetX = nx * maxShift * -1;
      targetY = ny * maxShift * -1;
    }, true);
  });
})();
