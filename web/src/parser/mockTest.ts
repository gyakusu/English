export type Choice = { key: 'A' | 'B' | 'C' | 'D'; text: string };
export type Question = {
  id: number;
  stem: string;
  choices: Choice[];
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
};
export type MockTestSource = {
  test: string;
  timeGoalMin: number;
  passage: string;
  questions: Question[];
};

function extractFrontmatter(markdown: string): {
  test: string;
  timeGoalMin: number;
  answers: string[];
  rest: string;
} {
  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(markdown);
  if (!fmMatch) {
    return { test: '', timeGoalMin: 0, answers: [], rest: markdown };
  }
  const fmBlock = fmMatch[1] ?? '';
  const rest = markdown.slice(fmMatch[0].length);

  const testMatch = /^test:\s*"?([^"\r\n]+)"?/m.exec(fmBlock);
  const timeMatch = /^time_goal_min:\s*(\d+)/m.exec(fmBlock);
  const answersMatch = /^answers:\s*(\[.*?\])/m.exec(fmBlock);

  const test = testMatch ? (testMatch[1] ?? '').trim() : '';
  const timeGoalMin = timeMatch ? parseInt(timeMatch[1] ?? '0', 10) : 0;

  let answers: string[] = [];
  if (answersMatch) {
    const raw = answersMatch[1] ?? '[]';
    // Parse JSON array like ["B", "C"]
    const items = raw.match(/"([A-D])"/g);
    if (items) {
      answers = items.map((s) => s.replace(/"/g, ''));
    }
  }

  return { test, timeGoalMin, answers, rest };
}

function extractPassage(markdown: string): string {
  // Match [Passage] or [Passage N: ...] at any heading level (### or ####)
  const passageStart = /#{3,}\s*\[Passage[^\]]*\]/i;
  const questionsStart = /#{3,}\s*\[Questions\]/i;

  const startIdx = markdown.search(passageStart);
  const endIdx = markdown.search(questionsStart);

  if (startIdx === -1 || endIdx === -1) {
    return '';
  }

  // Skip to end of the heading line(s) before the actual passage text
  // For double passage, we grab everything between first [Passage...] and [Questions]
  const afterStart = markdown.indexOf('\n', startIdx);
  if (afterStart === -1) return '';

  const rawPassage = markdown.slice(afterStart, endIdx).trim();
  return rawPassage;
}

function parseChoicesFromBlock(block: string): Choice[] {
  const choices: Choice[] = [];
  const choiceRegex = /^\(([ABCD])\)\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = choiceRegex.exec(block)) !== null) {
    const key = m[1] as 'A' | 'B' | 'C' | 'D';
    const text = (m[2] ?? '').trim();
    choices.push({ key, text });
  }
  return choices;
}

function extractQuestions(markdown: string, answers: string[]): Omit<Question, 'explanation'>[] {
  // From ### [Questions] to ### 💡 解答・解説
  const questionsHeading = /#{3,}\s*\[Questions\]/i;
  const explanationHeading = /#{3,}\s*💡/;

  const qStart = markdown.search(questionsHeading);
  const qEnd = markdown.search(explanationHeading);

  if (qStart === -1) return [];

  const qSection = qEnd === -1 ? markdown.slice(qStart) : markdown.slice(qStart, qEnd);

  // Split on question blocks starting with **N.
  const questionBlockRegex = /\*\*(\d+)\.\s+([\s\S]*?)(?=\*\*\d+\.|$)/g;
  const results: Omit<Question, 'explanation'>[] = [];

  let match: RegExpExecArray | null;
  while ((match = questionBlockRegex.exec(qSection)) !== null) {
    const idStr = match[1] ?? '0';
    const id = parseInt(idStr, 10);
    const rest = match[2] ?? '';

    // stem is the first line (up to first newline or **)
    const stemMatch = /^([^*\n]+)\*\*/.exec(rest);
    const stem = stemMatch ? (stemMatch[1] ?? '').trim() : (rest.split('\n')[0]?.trim() ?? '');

    const choices = parseChoicesFromBlock(rest);

    const answerIndex = id - 1;
    const answerRaw = answers[answerIndex];
    const correct = (answerRaw ?? 'A') as 'A' | 'B' | 'C' | 'D';

    results.push({ id, stem, choices, correct });
  }

  return results;
}

function extractExplanations(markdown: string): Map<number, string> {
  const explanationHeading = /#{3,}\s*💡/;
  const startIdx = markdown.search(explanationHeading);

  const map = new Map<number, string>();
  if (startIdx === -1) return map;

  const section = markdown.slice(startIdx);

  // Match blocks like **N. 正解: (X)** ... **解説:** ...
  const blockRegex =
    /\*\*(\d+)\.\s*正解[：:]\s*\([A-D]\)\*\*\s*\r?\n\s*\*\*解説[：:]\*\*\s*([^\r\n>]+)/g;
  let m: RegExpExecArray | null;
  while ((m = blockRegex.exec(section)) !== null) {
    const id = parseInt(m[1] ?? '0', 10);
    const explanation = (m[2] ?? '').trim();
    map.set(id, explanation);
  }

  return map;
}

export function parseMockTestSource(markdown: string): MockTestSource {
  const { test, timeGoalMin, answers, rest } = extractFrontmatter(markdown);

  const passage = extractPassage(rest);
  const partialQuestions = extractQuestions(rest, answers);
  const explanations = extractExplanations(rest);

  const questions: Question[] = partialQuestions.map((q) => ({
    ...q,
    explanation: explanations.get(q.id) ?? '',
  }));

  return { test, timeGoalMin, passage, questions };
}
