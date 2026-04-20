import { cachedFetchRaw } from '../cache.js';
import { parseMockTestSource, MockTestSource } from '../parser/mockTest.js';
import { setResult } from '../store.js';

let timerIntervalId: ReturnType<typeof setInterval> | null = null;

function stopTimer(): void {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min)}:${sec.toString().padStart(2, '0')}`;
}

function renderQuizHTML(source: MockTestSource, startTime: number): string {
  const totalGoalSec = source.timeGoalMin * 60;
  const goalMinStr = String(source.timeGoalMin);

  const questionsHTML = source.questions
    .map((q) => {
      const choicesHTML = q.choices
        .map(
          (c) => `<label class="choice-label">
  <input type="radio" name="q${String(q.id)}" value="${c.key}" />
  (${c.key}) ${c.text}
</label>`,
        )
        .join('\n');

      const confidenceHTML = `<div class="confidence-group" data-qid="${String(q.id)}">
  <button type="button" class="conf-btn" data-qid="${String(q.id)}" data-value="確信">確信</button>
  <button type="button" class="conf-btn" data-qid="${String(q.id)}" data-value="迷い">迷い</button>
  <button type="button" class="conf-btn" data-qid="${String(q.id)}" data-value="勘">勘</button>
</div>`;

      return `<div class="question" data-qid="${String(q.id)}">
  <p><strong>Q${String(q.id)}. ${q.stem}</strong></p>
  <div class="choices">
${choicesHTML}
  </div>
${confidenceHTML}
</div>`;
    })
    .join('\n');

  const elapsed = Date.now() - startTime;
  const elapsedStr = formatTime(elapsed);

  return `<div id="timer">経過: ${elapsedStr} / 目安: ${goalMinStr}min</div>
<div class="passage">${source.passage.replace(/\n/g, '<br />')}</div>
${questionsHTML}
<button id="submit-btn">提出</button>
<input type="hidden" id="total-goal-sec" value="${String(totalGoalSec)}" />`;
}

export async function renderQuiz(testId: string): Promise<void> {
  stopTimer();

  const mainContent = document.getElementById('main-content');
  if (mainContent === null) return;
  mainContent.innerHTML = '<p>読み込み中...</p>';

  let source: MockTestSource;
  try {
    const md = await cachedFetchRaw(`Reading/${testId}_source.md`);
    source = parseMockTestSource(md);
  } catch (e) {
    mainContent.innerHTML = `<p>エラー: ${String(e)}</p>`;
    return;
  }

  const startTime = Date.now();
  mainContent.innerHTML = renderQuizHTML(source, startTime);

  // Start timer update
  timerIntervalId = setInterval(() => {
    const timerEl = document.getElementById('timer');
    if (timerEl) {
      const elapsed = Date.now() - startTime;
      timerEl.textContent = `経過: ${formatTime(elapsed)} / 目安: ${String(source.timeGoalMin)}min`;
    }
  }, 1000);

  // Confidence button toggle
  mainContent.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('conf-btn')) {
      const qid = target.dataset['qid'];
      if (qid === undefined) return;
      const group = mainContent.querySelector(`.confidence-group[data-qid="${qid}"]`);
      if (!group) return;
      group.querySelectorAll('.conf-btn').forEach((btn) => {
        btn.classList.remove('conf-active');
      });
      target.classList.add('conf-active');
    }
  });

  // Submit
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      stopTimer();
      const elapsedMs = Date.now() - startTime;

      const userAnswers = new Map<number, string>();
      const confidence = new Map<number, string>();

      for (const q of source.questions) {
        const radios = mainContent.querySelectorAll<HTMLInputElement>(
          `input[name="q${String(q.id)}"]:checked`,
        );
        if (radios.length > 0) {
          const checked = radios[0];
          if (checked !== undefined) {
            userAnswers.set(q.id, checked.value);
          }
        }

        const activeConf = mainContent.querySelector<HTMLElement>(
          `.confidence-group[data-qid="${String(q.id)}"] .conf-btn.conf-active`,
        );
        if (activeConf !== null) {
          const val = activeConf.dataset['value'];
          if (val !== undefined) {
            confidence.set(q.id, val);
          }
        }
      }

      setResult({ testId, source, userAnswers, confidence, elapsedMs });
      location.hash = `#/result/${testId}`;
    });
  }
}
