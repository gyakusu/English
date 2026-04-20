import { MockTestSource } from './parser/mockTest.js';

export type QuizResult = {
  testId: string;
  source: MockTestSource;
  userAnswers: Map<number, string>;
  confidence: Map<number, string>;
  elapsedMs: number;
};

let _result: QuizResult | null = null;

export function setResult(r: QuizResult): void {
  _result = r;
}

export function getResult(): QuizResult | null {
  return _result;
}
