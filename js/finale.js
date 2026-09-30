document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadMemories();
  const heading = document.getElementById('finaleHeading');
  const body = document.getElementById('finaleBody');
  if (!data || !data.finale) return;

  if (data.finale.heading) heading.textContent = data.finale.heading;
  if (data.finale.body) body.textContent = data.finale.body;
});
