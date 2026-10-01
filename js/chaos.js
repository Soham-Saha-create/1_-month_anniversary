document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadMemories();
  const btn = document.getElementById('quoteBtn');
  const text = document.getElementById('quoteText');
  const counter = document.getElementById('quoteCounter');
  if (!data || !btn || !text) return;

  const palette = ['#e35b3f', '#3f9ee3', '#5fb86a', '#c45fb8', '#e3b33f'];
  let lastIndex = -1;
  let seen = 0;

  btn.addEventListener('click', () => {
    const quotes = data.quotes;
    if (!quotes || !quotes.length) return;

    let i = Math.floor(Math.random() * quotes.length);
    if (quotes.length > 1) {
      while (i === lastIndex) {
        i = Math.floor(Math.random() * quotes.length);
      }
    }
    lastIndex = i;
    seen = Math.min(seen + 1, quotes.length);

    text.classList.remove('pop');
    void text.offsetWidth; // restart animation
    text.textContent = quotes[i];
    text.classList.add('pop');

    if (counter) counter.textContent = `${seen} / ${quotes.length} unlocked`;

    const color = palette[i % palette.length];
    document.documentElement.style.setProperty('--pop-accent-live', color);
    btn.style.background = color;

    burstConfetti(color);
  });

  // ---------- lightweight confetti burst on tap ----------
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function burstConfetti(color) {
    if (!ctx) return;
    const rect = btn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let n = 0; n < 18; n++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        color,
        size: 3 + Math.random() * 3
      });
    }
    if (!animId) animId = requestAnimationFrame(renderConfetti);
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.life -= 0.018;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    particles = particles.filter(p => p.life > 0);
    ctx.globalAlpha = 1;

    if (particles.length) {
      animId = requestAnimationFrame(renderConfetti);
    } else {
      animId = null;
    }
  }
});
