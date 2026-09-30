document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadMemories();
  const btn = document.getElementById('quoteBtn');
  const text = document.getElementById('quoteText');
  if (!data || !btn || !text) return;

  let lastIndex = -1;

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

    text.classList.remove('pop');
    void text.offsetWidth; // restart animation
    text.textContent = quotes[i];
    text.classList.add('pop');
  });
});
