import { getContent, putContent } from '../api/github.js';
import { ensurePat } from '../auth/pat.js';
import { QuizResult } from '../store.js';

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export async function appendAttempt(result: QuizResult): Promise<void> {
  // 1. Build JST timestamp
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const iso = jst.toISOString().replace('Z', '+09:00');

  // 2. Calculate score
  const questions = result.source.questions;
  let correctCount = 0;
  for (const q of questions) {
    if (result.userAnswers.get(q.id) === q.correct) {
      correctCount++;
    }
  }
  const total = questions.length;

  // 3. Format elapsed time
  const elapsed = formatElapsed(result.elapsedMs);

  // 4. Build answers array in question order
  const answersArr = questions.map((q) => result.userAnswers.get(q.id) ?? '未回答');
  const answersStr = `[${answersArr.join(', ')}]`;

  // 5. Build mistakes table rows for incorrect answers
  const mistakeRows: string[] = [];
  for (const q of questions) {
    const myAnswer = result.userAnswers.get(q.id) ?? '未回答';
    if (myAnswer !== q.correct) {
      const conf = result.confidence.get(q.id) ?? '';
      mistakeRows.push(`| ${q.id} | ${myAnswer} | ${q.correct} | ${conf} |`);
    }
  }

  // 6. Build the append block
  const mistakeTable =
    `| Q | My answer | Correct | Confidence |\n` +
    `|---|-----------|---------|------------|\n` +
    mistakeRows.join('\n');

  const appendBlock =
    `\n## Attempt ${iso}\n` +
    `- score: ${correctCount}/${total}\n` +
    `- elapsed: ${elapsed}\n` +
    `- answers: ${answersStr}\n` +
    `- mistakes:\n\n` +
    mistakeTable +
    (mistakeRows.length > 0 ? '\n' : '');

  // 7. Build path
  const path = `Reading/${result.testId}.md`;

  // 8. Get current content and sha
  const { content, sha } = await getContent(path);

  // 9. Get PAT
  const pat = await ensurePat();

  // 10. Write updated content
  await putContent({
    path,
    message: `record: ${result.testId} attempt ${iso}`,
    content: content + appendBlock,
    sha,
    pat,
  });
}
