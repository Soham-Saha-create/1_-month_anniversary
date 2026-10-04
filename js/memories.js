document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadMemories();
  const list = document.getElementById('timelineList');
  if (!data || !list) return;

  list.innerHTML = data.timeline.map((item, i) => `
    <article class="memory-card tappable" data-reveal="blur-up" style="transition-delay: ${Math.min(i * 90, 360)}ms">
      <div class="memory-photo" data-photo-trigger>
        <img src="${item.image}" alt="" onerror="this.parentElement.innerHTML='photo goes here'">
      </div>
      <p class="memory-date">${item.date}</p>
      <h2 class="memory-title">${item.title}</h2>
      <p class="memory-caption memory-caption--clamped">${item.caption}</p>
      <span class="memory-expand-hint">tap to read</span>
    </article>
  `).join('');

  // tap to expand caption: toggles a class that un-clamps it and hides the hint.
  // Tapping the photo itself opens the lightbox instead (handled below) and
  // must not also trigger this toggle, so it's excluded here.
  list.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-photo-trigger]')) return;
      card.classList.toggle('is-expanded');
    });
  });

  // ---------- fullscreen photo lightbox ----------
  const lightbox = document.createElement('div');
  lightbox.className = 'photo-lightbox';
  lightbox.innerHTML = `
    <button class="photo-lightbox-close tappable" aria-label="close">&times;</button>
    <img src="" alt="">
  `;
  document.body.appendChild(lightbox);
  const lightboxImg = lightbox.querySelector('img');

  function openLightbox(src) {
    if (!src) return; // placeholder images have no real src, nothing to show fullscreen
    lightboxImg.src = src;
    lightbox.classList.add('is-open');
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
  }

  list.querySelectorAll('[data-photo-trigger]').forEach(photoEl => {
    photoEl.addEventListener('click', (e) => {
      e.stopPropagation(); // don't also toggle the caption on the parent card
      const img = photoEl.querySelector('img');
      if (img && img.complete && img.naturalWidth > 0) {
        openLightbox(img.src);
      }
    });
  });

  lightbox.querySelector('.photo-lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // re-run scroll reveal observer now that cards exist (main.js runs on DOMContentLoaded,
  // which may fire before this async render finishes)
  const items = list.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add('is-visible'));
  }
});
