document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadMemories();
  const heading = document.getElementById('finaleHeading');
  const body = document.getElementById('finaleBody');
  const gate = document.getElementById('finaleGate');
  const gateBtn = document.getElementById('finaleGateBtn');
  const reveal = document.getElementById('finaleReveal');

  if (data && data.finale) {
    if (data.finale.heading) heading.textContent = data.finale.heading;
    if (data.finale.body) body.textContent = data.finale.body;
  }

  if (!gateBtn || !gate || !reveal) return;

  gateBtn.addEventListener('click', () => {
    gate.classList.add('is-leaving');
    setTimeout(() => {
      gate.hidden = true;
      reveal.hidden = false;
      // force reflow so the animation classes below actually trigger
      void reveal.offsetWidth;
      reveal.classList.add('is-visible');
    }, 380);
  });
});
