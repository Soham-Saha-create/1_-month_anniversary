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
