import { getResult } from '../store.js';
import { appendAttempt } from '../commit/appendAttempt.js';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min)}:${sec.toString().padStart(2, '0')}`;
}

function showToast(message: string, isError = false): void {
  const toast = document.createElement('div');
  toast.style.cssText = [
    'position: fixed',
    'bottom: 1.5rem',
    'left: 50%',
    'transform: translateX(-50%)',
    'padding: 0.75rem 1.25rem',
    'border-radius: 6px',
    'color: #fff',
    `background: ${isError ? '#c0392b' : '#27ae60'}`,
    'box-shadow: 0 2px 8px rgba(0,0,0,0.3)',
    'z-index: 9999',
    'display: flex',
    'align-items: center',
    'gap: 0.75rem',
    'font-size: 0.95rem',
  ].join('; ');

  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  document.body.appendChild(toast);
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
}

export function renderResult(): void {
  const mainContent = document.getElementById('main-content');
  if (mainContent === null) return;

  const result = getResult();
  if (result === null) {
    location.hash = '#/';
    return;
  }

  const { source, userAnswers, confidence, elapsedMs } = result;
  const questions = source.questions;

  // Calculate score
  let correct = 0;
  for (const q of questions) {
    const answer = userAnswers.get(q.id);
    if (answer === q.correct) correct++;
  }
  const total = questions.length;

  // Confidence breakdown: 確信/迷い/勘 vs 正解/不正解
  const confLabels = ['確信', '迷い', '勘'] as const;
  type ConfLabel = (typeof confLabels)[number];

  const breakdown: Record<ConfLabel, { correct: number; incorrect: number }> = {
    確信: { correct: 0, incorrect: 0 },
    迷い: { correct: 0, incorrect: 0 },
    勘: { correct: 0, incorrect: 0 },
  };

  for (const q of questions) {
    const conf = confidence.get(q.id);
    if (conf === '確信' || conf === '迷い' || conf === '勘') {
      const answer = userAnswers.get(q.id);
      if (answer === q.correct) {
        breakdown[conf].correct++;
      } else {
        breakdown[conf].incorrect++;
      }
    }
  }

  const breakdownRows = confLabels
    .map(
      (label) =>
        `<tr><td>${label}</td><td>${String(breakdown[label].correct)}</td><td>${String(breakdown[label].incorrect)}</td></tr>`
    )
    .join('\n');

  // Per-question table
  const questionRows = questions
    .map((q) => {
      const userAnswer = userAnswers.get(q.id) ?? '未回答';
      const isCorrect = userAnswer === q.correct;
      const mark = isCorrect ? '✓' : '✗';
      const explanation = q.explanation || '';
      return `<tr>
  <td>Q${String(q.id)}</td>
  <td>${mark}</td>
  <td>${userAnswer}</td>
  <td>${q.correct}</td>
  <td>${explanation}</td>
</tr>`;
    })
    .join('\n');

  mainContent.innerHTML = `<h1>結果</h1>
<p>スコア: ${String(correct)}/${String(total)}</p>
<p>経過時間: ${formatTime(elapsedMs)}</p>

<h2>確信度別内訳</h2>
<table>
  <thead>
    <tr><th>確信度</th><th>正解</th><th>不正解</th></tr>
  </thead>
  <tbody>
${breakdownRows}
  </tbody>
</table>

<h2>問題別詳細</h2>
<table>
  <thead>
    <tr><th>問題</th><th>正誤</th><th>あなたの回答</th><th>正解</th><th>解説</th></tr>
  </thead>
  <tbody>
${questionRows}
  </tbody>
</table>

<button id="save-btn">履歴を保存</button>
<p><a href="#/">ホームへ</a></p>`;

  const saveBtn = document.getElementById('save-btn');
  if (saveBtn !== null) {
    const doSave = (): void => {
      saveBtn.setAttribute('disabled', '');
      appendAttempt(result)
        .then(() => {
          showToast('保存しました ✓');
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : '不明なエラー';
          const toastMsg = `保存失敗: ${msg}`;
          showToastWithRetry(toastMsg, doSave);
          saveBtn.removeAttribute('disabled');
        });
    };
    saveBtn.addEventListener('click', doSave);
  }
}

function showToastWithRetry(message: string, onRetry: () => void): void {
  const toast = document.createElement('div');
  toast.style.cssText = [
    'position: fixed',
    'bottom: 1.5rem',
    'left: 50%',
    'transform: translateX(-50%)',
    'padding: 0.75rem 1.25rem',
    'border-radius: 6px',
    'color: #fff',
    'background: #c0392b',
    'box-shadow: 0 2px 8px rgba(0,0,0,0.3)',
    'z-index: 9999',
    'display: flex',
    'align-items: center',
    'gap: 0.75rem',
    'font-size: 0.95rem',
  ].join('; ');

  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  const retryBtn = document.createElement('button');
  retryBtn.textContent = 'リトライ';
  retryBtn.style.cssText = [
    'background: rgba(255,255,255,0.2)',
    'border: 1px solid rgba(255,255,255,0.5)',
    'color: #fff',
    'border-radius: 4px',
    'padding: 0.2rem 0.6rem',
    'cursor: pointer',
    'font-size: 0.9rem',
  ].join('; ');
  retryBtn.addEventListener('click', () => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
    onRetry();
  });
  toast.appendChild(retryBtn);

  document.body.appendChild(toast);
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
}
