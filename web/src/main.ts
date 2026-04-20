import { renderHome } from './pages/home.js';

function route(): void {
  const hash = location.hash;
  if (hash === '' || hash === '#' || hash === '#/') {
    document.body.innerHTML = renderHome();
  }
}

window.addEventListener('hashchange', route);
route();

