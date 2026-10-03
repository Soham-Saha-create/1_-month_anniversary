document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadMemories();
  const btn = document.getElementById('quoteBtn');
  const text = document.getElementById('quoteText');
  const counter = document.getElementById('quoteCounter');
  if (!data || !btn || !text) return;

  const palette = ['#e35b3f', '#3f9ee3', '#5fb86a', '#c45fb8', '#e3b33f'];
  let lastIndex = -1;
  let seen = 0;

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
    seen = Math.min(seen + 1, quotes.length);

    text.classList.remove('pop');
    void text.offsetWidth; // restart animation
    text.textContent = quotes[i];
    text.classList.add('pop');

    if (counter) counter.textContent = `${seen} / ${quotes.length} unlocked`;

    const color = palette[i % palette.length];
    document.documentElement.style.setProperty('--pop-accent-live', color);
    btn.style.background = color;

    burstConfetti(color);
  });

  // ---------- lightweight confetti burst on tap ----------
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function burstConfetti(color) {
    if (!ctx) return;
    const rect = btn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let n = 0; n < 18; n++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        color,
        size: 3 + Math.random() * 3
      });
    }
    if (!animId) animId = requestAnimationFrame(renderConfetti);
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.life -= 0.018;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    particles = particles.filter(p => p.life > 0);
    ctx.globalAlpha = 1;

    if (particles.length) {
      animId = requestAnimationFrame(renderConfetti);
    } else {
      animId = null;
    }
  }

  // ============================================
  // QUIZ — one question at a time, hints hidden
  // behind a tap, score + reaction at the end.
  // ============================================
  const quizRoot = document.getElementById('quizRoot');
  const quiz = data.quiz;
  if (!quizRoot || !quiz || !quiz.length) return;

  let qIndex = 0;
  let score = 0;
  const letterIndex = (i) => String.fromCharCode(65 + i); // 0 -> A, 1 -> B...

  function renderQuestion() {
    const q = quiz[qIndex];
    quizRoot.innerHTML = `
      <p class="quiz-progress">question ${qIndex + 1} of ${quiz.length}</p>
      <p class="quiz-question">${q.question}</p>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <button class="quiz-option tappable" data-i="${i}">
            <span class="quiz-option-letter">${letterIndex(i)}</span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>
      <button class="quiz-hint-btn tappable" id="quizHintBtn">need a hint?</button>
      <p class="quiz-hint-text" id="quizHintText" hidden>${q.hint || ''}</p>
      <p class="quiz-feedback" id="quizFeedback"></p>
    `;

    const hintBtn = quizRoot.querySelector('#quizHintBtn');
    const hintText = quizRoot.querySelector('#quizHintText');
    hintBtn.addEventListener('click', () => {
      hintText.hidden = !hintText.hidden;
      hintBtn.textContent = hintText.hidden ? 'need a hint?' : 'hide hint';
    });

    const options = quizRoot.querySelectorAll('.quiz-option');
    let answered = false;

    options.forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        const chosen = Number(btn.dataset.i);
        const feedback = quizRoot.querySelector('#quizFeedback');

        options.forEach((b, i) => {
          b.classList.add('locked');
          if (i === q.correct) b.classList.add('correct');
          else if (i === chosen) b.classList.add('wrong');
        });

        if (chosen === q.correct) {
          score++;
          feedback.textContent = 'yep. exactly that.';
          feedback.classList.add('is-correct');
        } else {
          feedback.textContent = 'close, but no.';
          feedback.classList.add('is-wrong');
        }

        setTimeout(() => {
          qIndex++;
          if (qIndex < quiz.length) {
            renderQuestion();
          } else {
            renderResult();
          }
        }, 1100);
      });
    });
  }

  function renderResult() {
    const pct = Math.round((score / quiz.length) * 100);
    let line;
    if (score === quiz.length) line = "perfect score. obviously.";
    else if (score >= quiz.length - 1) line = "basically perfect. i'll allow it.";
    else if (score >= quiz.length / 2) line = "decent. we've got some catching up to do.";
    else line = "okay we need to talk more, clearly.";

    quizRoot.innerHTML = `
      <div class="quiz-result">
        <p class="quiz-result-score">${score} / ${quiz.length}</p>
        <p class="quiz-result-line">${line}</p>
        <button class="quiz-retry tappable" id="quizRetry">try again</button>
      </div>
    `;
    quizRoot.querySelector('#quizRetry').addEventListener('click', () => {
      qIndex = 0;
      score = 0;
      renderQuestion();
    });
  }

  renderQuestion();
});
