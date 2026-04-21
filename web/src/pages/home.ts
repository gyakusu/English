import { listReading } from '../api/github.js';
import { cachedFetchRaw } from '../cache.js';
import { VAULT_READING_DIR } from '../config.js';
import { parseMockTestSource } from '../parser/mockTest.js';
import { parseAttempts } from '../parser/attempts.js';
import { renderPatPanel } from '../auth/pat.js';

export async function renderHome(): Promise<void> {
  const mainContent = document.getElementById('main-content');
  if (mainContent === null) return;

  mainContent.innerHTML = `<h1>Home (MVP1)</h1>
<section id="pat-panel-slot"></section>
<div id="test-list-slot"><p>読み込み中...</p></div>`;

  const panelSlot = document.getElementById('pat-panel-slot');
  if (panelSlot !== null) renderPatPanel(panelSlot);

  const listSlot = document.getElementById('test-list-slot');
  if (listSlot === null) return;

  let files: { name: string; path: string; sha: string }[];
  try {
    files = await listReading();
  } catch (e) {
    listSlot.innerHTML = `<p>エラー: ${String(e)}</p>
<p>PAT が未設定の場合、上の「GitHub PAT」で設定してから再読み込みしてください。</p>`;
    return;
  }

  const sourceFiles = files.filter((f) => /^MockTest\d+_source\.md$/.test(f.name));

  type TestItem = {
    testId: string;
    testName: string;
    latestScore: string;
    attemptCount: number;
  };

  const items: TestItem[] = await Promise.all(
    sourceFiles.map(async (file) => {
      const numMatch = /^MockTest(\d+)_source\.md$/.exec(file.name);
      const testNum = numMatch ? (numMatch[1] ?? '') : '';
      const testId = `MockTest${testNum}`;

      let testName = testId;
      let latestScore = '未受験';
      let attemptCount = 0;

      try {
        const sourceMd = await cachedFetchRaw(file.path);
        const source = parseMockTestSource(sourceMd);
        testName = source.test || testId;
      } catch {
        // use defaults
      }

      try {
        const attemptMd = await cachedFetchRaw(`${VAULT_READING_DIR}/${testId}.md`);
        const log = parseAttempts(attemptMd);
        attemptCount = log.attempts.length;
        if (log.latestScore !== undefined) {
          latestScore = log.latestScore;
        }
      } catch {
        // 404 or parse error — leave as defaults
      }

      return { testId, testName, latestScore, attemptCount };
    }),
  );

  const listItems = items
    .map(
      (item) =>
        `<li><a href="#/quiz/${item.testId}">${item.testName}</a> — スコア: ${item.latestScore} — 試行: ${String(item.attemptCount)}回</li>`,
    )
    .join('\n');

  listSlot.innerHTML = `<ul class="test-list">
${listItems}
</ul>`;
}
