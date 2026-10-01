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
   PAGE TRANSITIONS — fade out on nav click,
   fade in on load. Works across every room.
   ============================================ */
(function pageTransitions() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // fade in on load
  document.documentElement.classList.add('page-ready');

  if (prefersReduced) return;

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        // skip external/hash links, new tabs, modified clicks
        if (!href || link.target === '_blank' || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        document.documentElement.classList.add('page-leaving');
        setTimeout(() => { window.location.href = href; }, 280);
      });
    });
  });
})();

/* ============================================
   CURSOR GLOW — makes .door-glow / .finale-glow
   follow the pointer instead of sitting static.
   No-op harmlessly if the element isn't present.
   ============================================ */
(function cursorGlow() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  document.addEventListener('DOMContentLoaded', () => {
    const glow = document.querySelector('.door-glow, .finale-glow');
    if (!glow) return;

    let targetX = 50, targetY = 45, curX = 50, curY = 45;
    let raf = null;

    function onMove(e) {
      const x = (e.clientX !== undefined) ? e.clientX : window.innerWidth / 2;
      const y = (e.clientY !== undefined) ? e.clientY : window.innerHeight / 2;
      targetX = (x / window.innerWidth) * 100;
      targetY = (y / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function tick() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      glow.style.background = `radial-gradient(ellipse 60% 50% at ${curX}% ${curY}%, rgba(201, 154, 91, 0.16), transparent 70%)`;
      if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true });
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
