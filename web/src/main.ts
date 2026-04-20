import './style.css';
import { renderHome } from './pages/home.js';
import { renderQuiz } from './pages/quiz.js';
import { renderResult } from './pages/result.js';
import { clearPat } from './auth/pat.js';

async function route(): Promise<void> {
  const hash = location.hash;

  // Ensure #main-content exists
  let main = document.getElementById('main-content');
  if (!main) {
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

window.addEventListener('hashchange', () => void route());
void route();

const clearPatBtn = document.getElementById('clear-pat-btn');
if (clearPatBtn !== null) {
  clearPatBtn.addEventListener('click', () => {
    clearPat();
    alert('PATをクリアしました');
  });
}
