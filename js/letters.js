document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadMemories();
  const heading = document.getElementById('letterHeading');
  const bodyEl = document.getElementById('letterBody');
  const skipBtn = document.getElementById('letterSkip');
  if (!data || !bodyEl) return;

  const letter = (data.letters && data.letters[0]) || { heading: '', body: '' };
  if (letter.heading) heading.textContent = letter.heading;

  const fullText = letter.body || '';
  let i = 0;
  let done = false;
  const speed = 28; // ms per character

  function typeStep() {
    if (i >= fullText.length) {
      done = true;
      bodyEl.innerHTML = fullText;
      return;
    }
    bodyEl.innerHTML = fullText.slice(0, i + 1) + '<span class="cursor"></span>';
    i++;
    setTimeout(typeStep, speed);
  }

  typeStep();

  skipBtn?.addEventListener('click', () => {
    if (!done) {
      done = true;
      i = fullText.length;
      bodyEl.innerHTML = fullText;
    }
  });
});
