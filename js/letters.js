// Stars don't depend on memories.json, so they run independently —
// a failed/slow fetch for letter content should never also kill the background.
document.addEventListener('DOMContentLoaded', () => {
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

document.addEventListener('DOMContentLoaded', async () => {
  const lane = document.getElementById('letterLane');
  if (!lane) return;

  const data = await loadMemories();
  if (!data) {
    lane.innerHTML = '<p style="opacity:0.5; font-size:0.85rem;">couldn\'t load letters right now</p>';
    return;
  }

  const letters = (data.letters && data.letters.length) ? data.letters : [{ heading: '', body: '' }];

  // build one card per letter, body empty for now — typed in once scrolled into view
  lane.innerHTML = letters.map((letter, idx) => `
    <article class="letter-card" data-reveal data-letter-index="${idx}">
      <p class="letter-number">letter ${idx + 1} of ${letters.length}</p>
      <h2 class="letter-card-heading">${letter.heading || ''}</h2>
      <p class="letter-body" data-letter-body></p>
      <button class="letter-skip tappable" data-letter-skip>skip</button>
    </article>
  `).join('');

  const cards = lane.querySelectorAll('.letter-card');
  const typedState = new Map(); // idx -> { done, timer }

  // main.js's scroll-reveal observer runs on DOMContentLoaded, before these
  // cards exist (this fetch is async). Re-run reveal handling now that the
  // cards are actually in the DOM, same fix as memories.js.
  if ('IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    cards.forEach(el => revealIO.observe(el));
  } else {
    cards.forEach(el => el.classList.add('is-visible'));
  }

  function typeLetter(card, idx) {
    if (typedState.get(idx)?.started) return;
    typedState.set(idx, { started: true, done: false, timer: null });

    const fullText = letters[idx].body || '';
    const bodyEl = card.querySelector('[data-letter-body]');
    const skipBtn = card.querySelector('[data-letter-skip]');
    let i = 0;

    function typeStep() {
      if (i >= fullText.length) {
        typedState.get(idx).done = true;
        bodyEl.innerHTML = fullText;
        return;
      }
      bodyEl.innerHTML = fullText.slice(0, i + 1) + '<span class="cursor"></span>';
      i++;
      const state = typedState.get(idx);
      state.timer = setTimeout(typeStep, 20);
    }
    typeStep();

    skipBtn.addEventListener('click', () => {
      const state = typedState.get(idx);
      if (state && !state.done) {
        clearTimeout(state.timer);
        state.done = true;
        bodyEl.innerHTML = fullText;
      }
    });
  }

  // trigger typing when each letter card scrolls into view
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.letterIndex);
          typeLetter(entry.target, idx);
        }
      });
    }, { threshold: 0.3 });
    cards.forEach(card => io.observe(card));
  } else {
    cards.forEach((card, idx) => typeLetter(card, idx));
  }
});
