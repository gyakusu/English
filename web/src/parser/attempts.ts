export type Attempt = {
  iso: string;
  score: string;
  elapsed: string;
  answers: string[];
};
export type AttemptLog = {
  test: string;
  attempts: Attempt[];
  latestScore?: string;
};

function extractFrontmatterFields(markdown: string): {
  test: string;
  scorePart7: string;
  hasFrontmatter: boolean;
  rest: string;
} {
  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(markdown);
  if (!fmMatch) {
    return { test: '', scorePart7: '', hasFrontmatter: false, rest: markdown };
  }

  const fmBlock = fmMatch[1] ?? '';
  const rest = markdown.slice(fmMatch[0].length);

  const testMatch = /^test:\s*"?([^"\r\n]+)"?/m.exec(fmBlock);
  const scoreMatch = /^score_part7:\s*([^\r\n]+)/m.exec(fmBlock);

  const test = testMatch ? (testMatch[1] ?? '').trim() : '';
  const scorePart7Raw = scoreMatch ? (scoreMatch[1] ?? '').trim() : '';
  // Ignore empty/blank values
  const scorePart7 = /\S/.test(scorePart7Raw) ? scorePart7Raw : '';

  return { test, scorePart7, hasFrontmatter: true, rest };
}

function detectTestFromHeading(markdown: string): string {
  // Try first heading (# or ###)
  const headingMatch = /^#{1,3}\s+(.+)$/m.exec(markdown);
  if (headingMatch) {
    return (headingMatch[1] ?? '').trim();
  }
  return '';
}

function parseAnswersList(raw: string): string[] {
  // raw looks like "[B, C]" or "[A, B, C, D]"
  const inner = raw.replace(/^\[/, '').replace(/\]$/, '');
  return inner
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[A-D]$/.test(s));
}

function parseAttemptSection(section: string): Attempt | null {
  // Header line: ## Attempt <ISO>
  const headerMatch = /^##\s+Attempt\s+(\S+)/m.exec(section);
  if (!headerMatch) return null;

  const iso = (headerMatch[1] ?? '').trim();

  const scoreMatch = /^-\s+score:\s*(\S+)/m.exec(section);
  const elapsedMatch = /^-\s+elapsed:\s*(\S+)/m.exec(section);
  const answersMatch = /^-\s+answers:\s*(\[[^\]]*\])/m.exec(section);

  const score = scoreMatch ? (scoreMatch[1] ?? '').trim() : '';
  const elapsed = elapsedMatch ? (elapsedMatch[1] ?? '').trim() : '';
  const answers = answersMatch ? parseAnswersList(answersMatch[1] ?? '[]') : [];

  return { iso, score, elapsed, answers };
}

export function parseAttempts(markdown: string): AttemptLog {
  const { test: fmTest, scorePart7, hasFrontmatter, rest } = extractFrontmatterFields(markdown);

  // Determine test name
  let test = fmTest;
  if (!test) {
    // Try detecting from first heading in full markdown
    test = detectTestFromHeading(hasFrontmatter ? rest : markdown);
  }

  // Find all ## Attempt sections
  // Split on "## Attempt " boundaries
  const attemptSplitRegex = /(?=^## Attempt\s)/m;
  const sections = (hasFrontmatter ? rest : markdown).split(attemptSplitRegex);

  const attempts: Attempt[] = [];
  for (const section of sections) {
    if (/^## Attempt\s/.test(section)) {
      const attempt = parseAttemptSection(section);
      if (attempt) {
        attempts.push(attempt);
      }
    }
  }

  // latestScore: last attempt's score, or score_part7 from frontmatter
  const lastAttempt = attempts[attempts.length - 1];
  const latestScoreValue = lastAttempt ? lastAttempt.score : scorePart7;

  const log: AttemptLog = { test, attempts };
  if (latestScoreValue !== '') {
    log.latestScore = latestScoreValue;
  }

  return log;
}
