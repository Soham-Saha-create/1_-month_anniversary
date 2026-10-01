/* ============================================
   MAIN — small shared helpers for every room
   ============================================ */

// Fetch and cache memories.json so every room can pull from one source
async function loadMemories() {
  if (window.__memoriesCache) return window.__memoriesCache;
  try {
    const res = await fetch('data/memories.json');
    const data = await res.json();
    window.__memoriesCache = data;
    return data;
  } catch (err) {
    console.error('Could not load memories.json', err);
    return null;
  }
}

// Mark current nav link active based on filename
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.room-nav a').forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('current');
    }
  });
});

/* ============================================
   PAGE TRANSITIONS — curtain wipe on nav click,
   wipe-away reveal on load. Works across every room.
   ============================================ */
(function pageTransitions() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // curtain element, injected fresh on every page
  const curtain = document.createElement('div');
  curtain.className = 'page-curtain entering';
  document.body.appendChild(curtain);
  setTimeout(() => curtain.remove(), 550);

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || link.target === '_blank' || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        const leave = document.createElement('div');
        leave.className = 'page-curtain leaving';
        document.body.appendChild(leave);
        setTimeout(() => { window.location.href = href; }, 420);
      });
    });
  });
})();

/* ============================================
   GLOW — makes .door-glow / .finale-glow drift.
   Uses mouse on desktop, device tilt on phones
   (with permission where iOS requires it), and
   falls back to a gentle auto-drift either way.
   ============================================ */
(function glowMotion() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  document.addEventListener('DOMContentLoaded', () => {
    const glow = document.querySelector('.door-glow, .finale-glow');
    if (!glow) return;

    let targetX = 50, targetY = 45, curX = 50, curY = 45;
    let raf = null;
    let autoAngle = 0;
    let usingInput = false;

    function setTarget(xPct, yPct) {
      usingInput = true;
      targetX = xPct;
      targetY = yPct;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function tick() {
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;
      glow.style.background = `radial-gradient(ellipse 60% 50% at ${curX}% ${curY}%, rgba(201, 154, 91, 0.16), transparent 70%)`;
      raf = requestAnimationFrame(tick);
    }

    // desktop: mouse
    window.addEventListener('mousemove', (e) => {
      setTarget((e.clientX / window.innerWidth) * 100, (e.clientY / window.innerHeight) * 100);
    }, { passive: true });

    // phone: device tilt
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma === null || e.beta === null) return;
      const x = 50 + Math.max(-30, Math.min(30, e.gamma)) * 0.8;
      const y = 45 + Math.max(-30, Math.min(30, e.beta - 45)) * 0.6;
      setTarget(x, y);
    }, true);

    // fallback: slow auto-drift so it's never fully static, even with no input
    raf = requestAnimationFrame(function autoTick() {
      if (!usingInput) {
        autoAngle += 0.004;
        targetX = 50 + Math.sin(autoAngle) * 14;
        targetY = 45 + Math.cos(autoAngle * 0.7) * 10;
      }
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;
      glow.style.background = `radial-gradient(ellipse 60% 50% at ${curX}% ${curY}%, rgba(201, 154, 91, 0.16), transparent 70%)`;
      raf = requestAnimationFrame(autoTick);
    });
  });
})();

/* ============================================
   SCROLL REVEAL — any element with
   data-reveal fades/slides in on scroll into view.
   ============================================ */
(function scrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    items.forEach(el => io.observe(el));
  });
})();
