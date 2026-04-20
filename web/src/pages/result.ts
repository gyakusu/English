import { getResult } from '../store.js';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export async function renderResult(_testId: string): Promise<void> {
  const mainContent = document.getElementById('main-content')!;

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
        `<tr><td>${label}</td><td>${breakdown[label].correct}</td><td>${breakdown[label].incorrect}</td></tr>`
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
  <td>Q${q.id}</td>
  <td>${mark}</td>
  <td>${userAnswer}</td>
  <td>${q.correct}</td>
  <td>${explanation}</td>
</tr>`;
    })
    .join('\n');

  mainContent.innerHTML = `<h1>結果</h1>
<p>スコア: ${correct}/${total}</p>
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
    saveBtn.addEventListener('click', () => {
      alert('保存機能は近日実装予定');
    });
  }
}
