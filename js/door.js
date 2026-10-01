// index.html only — currently just relies on CSS animation delays.

/* ============================================
   PARALLAX — door-inner shifts subtly opposite
   the cursor for a slight depth effect.
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

    function onMove(e) {
      const nx = (e.clientX / window.innerWidth) - 0.5;
      const ny = (e.clientY / window.innerHeight) - 0.5;
      targetX = nx * maxShift * -1;
      targetY = ny * maxShift * -1;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function tick() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      inner.style.transform = `translate(${curX.toFixed(2)}px, ${curY.toFixed(2)}px)`;
      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true });
  });
})();
