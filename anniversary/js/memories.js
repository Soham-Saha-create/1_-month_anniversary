document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadMemories();
  const list = document.getElementById('timelineList');
  if (!data || !list) return;

  list.innerHTML = data.timeline.map(item => `
    <article class="memory-card">
      <div class="memory-photo">
        <img src="${item.image}" alt="" onerror="this.parentElement.innerHTML='photo goes here'">
      </div>
      <p class="memory-date">${item.date}</p>
      <h2 class="memory-title">${item.title}</h2>
      <p class="memory-caption">${item.caption}</p>
    </article>
  `).join('');
});
