import { renderHome } from './pages/home.js';
import { clearPat } from './auth/pat.js';

function route(): void {
  const hash = location.hash;
  if (hash === '' || hash === '#' || hash === '#/') {
    document.body.innerHTML = renderHome();
  }
}

window.addEventListener('hashchange', route);
route();

const clearPatBtn = document.getElementById('clear-pat-btn');
if (clearPatBtn !== null) {
  clearPatBtn.addEventListener('click', () => {
    clearPat();
    alert('PATをクリアしました');
  });
}

