import './style.css';
import { renderHome } from './pages/home.js';
import { renderQuiz } from './pages/quiz.js';
import { renderResult } from './pages/result.js';
import { clearPat, renderPatStatusBadge } from './auth/pat.js';

async function route(): Promise<void> {
  const hash = location.hash;

  // Ensure #main-content exists
  let main = document.getElementById('main-content');
  if (main === null) {
    main = document.createElement('main');
    main.id = 'main-content';
    document.body.appendChild(main);
  }

  if (hash === '' || hash === '#' || hash === '#/') {
    await renderHome();
  } else if (hash.startsWith('#/quiz/')) {
    const testId = hash.slice('#/quiz/'.length);
    await renderQuiz(testId);
  } else if (hash.startsWith('#/result/')) {
    renderResult();
  }
}

window.addEventListener('hashchange', () => {
  void route();
});
void route();

const patStatusEl = document.getElementById('pat-status');
const clearPatBtn = document.getElementById('clear-pat-btn');
if (patStatusEl !== null && clearPatBtn instanceof HTMLButtonElement) {
  renderPatStatusBadge(patStatusEl, clearPatBtn);
  clearPatBtn.addEventListener('click', () => {
    if (confirm('PAT をクリアしますか？')) {
      clearPat();
    }
  });
}
