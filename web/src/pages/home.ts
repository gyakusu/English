import { listReading } from '../api/github.js';
import { cachedFetchRaw } from '../cache.js';
import { parseMockTestSource } from '../parser/mockTest.js';
import { parseAttempts } from '../parser/attempts.js';

export async function renderHome(): Promise<void> {
  const mainContent = document.getElementById('main-content');
  if (mainContent === null) return;
  mainContent.innerHTML = '<p>読み込み中...</p>';

  let files: { name: string; path: string; sha: string }[];
  try {
    files = await listReading();
  } catch (e) {
    mainContent.innerHTML = `<p>エラー: ${String(e)}</p>`;
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
        const attemptMd = await cachedFetchRaw(`Reading/${testId}.md`);
        const log = parseAttempts(attemptMd);
        attemptCount = log.attempts.length;
        if (log.latestScore !== undefined) {
          latestScore = log.latestScore;
        }
      } catch {
        // 404 or parse error — leave as defaults
      }

      return { testId, testName, latestScore, attemptCount };
    })
  );

  const listItems = items
    .map(
      (item) =>
        `<li><a href="#/quiz/${item.testId}">${item.testName}</a> — スコア: ${item.latestScore} — 試行: ${String(item.attemptCount)}回</li>`
    )
    .join('\n');

  mainContent.innerHTML = `<h1>Home (MVP1)</h1>
<ul class="test-list">
${listItems}
</ul>`;
}
