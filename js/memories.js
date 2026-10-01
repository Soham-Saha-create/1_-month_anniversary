document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadMemories();
  const list = document.getElementById('timelineList');
  if (!data || !list) return;

  list.innerHTML = data.timeline.map((item, i) => `
    <article class="memory-card" data-reveal style="transition-delay: ${Math.min(i * 90, 360)}ms">
      <div class="memory-photo">
        <img src="${item.image}" alt="" onerror="this.parentElement.innerHTML='photo goes here'">
      </div>
      <p class="memory-date">${item.date}</p>
      <h2 class="memory-title">${item.title}</h2>
      <p class="memory-caption">${item.caption}</p>
    </article>
  `).join('');

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
