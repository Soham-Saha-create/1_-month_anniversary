document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadMemories();
  const heading = document.getElementById('letterHeading');
  const bodyEl = document.getElementById('letterBody');
  const skipBtn = document.getElementById('letterSkip');
  const prevBtn = document.getElementById('letterPrev');
  const nextBtn = document.getElementById('letterNext');
  const progressEl = document.getElementById('letterProgress');
  if (!data || !bodyEl) return;

  const letters = (data.letters && data.letters.length) ? data.letters : [{ heading: '', body: '' }];
  let current = 0;
  let typeTimer = null;
  let done = false;

  function renderLetter(idx) {
    clearTimeout(typeTimer);
    const letter = letters[idx];
    if (letter.heading) heading.textContent = letter.heading;
    if (progressEl) progressEl.textContent = letters.length > 1 ? `letter ${idx + 1} of ${letters.length}` : '';
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.textContent = (idx === letters.length - 1) ? 'read again ↻' : 'next →';

    const fullText = letter.body || '';
    let i = 0;
    done = false;
    bodyEl.innerHTML = '';

    function typeStep() {
      if (i >= fullText.length) {
        done = true;
        bodyEl.innerHTML = fullText;
        return;
      }
      bodyEl.innerHTML = fullText.slice(0, i + 1) + '<span class="cursor"></span>';
      i++;
      typeTimer = setTimeout(typeStep, 28);
    }
    typeStep();

    skipBtn.onclick = () => {
      if (!done) {
        clearTimeout(typeTimer);
        done = true;
        bodyEl.innerHTML = fullText;
      }
    };
  }

  prevBtn?.addEventListener('click', () => {
    if (current > 0) { current--; renderLetter(current); }
  });

  nextBtn?.addEventListener('click', () => {
    current = (current + 1) % letters.length;
    renderLetter(current);
  });

  renderLetter(current);

  // ---------- starry parallax background ----------
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if (!ctx) return;

  let stars = [];
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      depth: Math.random() * 0.6 + 0.2, // parallax depth factor
      twinkle: Math.random() * Math.PI * 2
    }));
  }
  resize();
  window.addEventListener('resize', resize);

  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const parallaxOffset = scrollY * s.depth * 0.3;
      const y = (s.y + parallaxOffset) % canvas.height;
      const twinkle = prefersReduced ? 1 : 0.6 + 0.4 * Math.sin(t / 900 + s.twinkle);
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = '#d9cce3';
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
});
