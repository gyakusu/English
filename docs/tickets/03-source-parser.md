---
tags: [ticket, mvp1]
type: ticket
status: todo
ticket: "03"
---

# 03. 出題 / 試行ログ parser を実装

## Goal
`_source.md` と `MockTestN.md` をブラウザ上で構造化データに変換する pure function を用意し、既存 2 ファイル (MockTest1 / MockTest2) でパースが成立することを確認する。

## Dependencies
- 先行: 02（`answers` フロントマター前提）

## Scope
- `web/src/parser/mockTest.ts` — `_source.md` → 構造化データ
  - 入力: markdown 文字列。
  - 出力（想定）:
    ```ts
    type Question = { id: number; stem: string; choices: { key: 'A'|'B'|'C'|'D'; text: string }[]; correct: 'A'|'B'|'C'|'D'; explanation: string };
    type MockTestSource = { test: string; timeGoalMin: number; passage: string; questions: Question[] };
    ```
  - `correct` はフロントマター `answers[i]` を使用（本文の `> **正解: (X)**` には依存しない）。
  - `explanation` は `### 💡 解答・解説` 以下 `**N. 正解: (X)**` ブロックから抽出。
- `web/src/parser/attempts.ts` — `MockTestN.md` → 試行履歴
  - 出力（想定）:
    ```ts
    type Attempt = { iso: string; score: string; elapsed: string; answers: string[] };
    type AttemptLog = { test: string; attempts: Attempt[]; latestScore?: string };
    ```
  - `## Attempt <ISO>` セクション以下の `- score:` / `- elapsed:` / `- answers:` を読む。
  - `latestScore` は最後の Attempt の score、もしくは `## Score` セクションの Part 7 値。
- どちらも pure function として実装し、入力 markdown を引数で受ける（fetch は 04 側）。
- `web/src/parser/*.test.ts` に MockTest1 / MockTest2 の markdown を貼り付けたスナップショット相当の簡易テストを置く（Vitest 採用なら `vitest`、なしなら後続チケットで対応可）。

## Out of Scope
- GitHub からのファイル取得（04）。
- UI 側への組み込み（05）。

## Acceptance Criteria
- [ ] MockTest1 (2 問) / MockTest2 (5 問) の `_source.md` 文字列を入れて `questions.length` が一致する。
- [ ] 各 `question.correct` がフロントマター `answers[i]` と一致する。
- [ ] `parser/attempts.ts` が既存の `Reading/MockTest1.md` / `MockTest2.md` を空の attempts 配列として正しく返す（まだ Attempt セクションがないため）。
- [ ] parser は fetch / window などブラウザ API に依存しない。

## References
- `docs/design.md` §4.1, §4.2, §6.1
- `Reading/MockTest_template.md`
