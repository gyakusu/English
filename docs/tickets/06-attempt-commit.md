---
tags: [ticket, mvp1]
type: ticket
status: todo
ticket: "06"
---

# 06. `MockTestN.md` への `## Attempt` append コミット

## Goal
採点画面で確定した試行結果を `Reading/MockTestN.md` に `## Attempt <ISO>` として追記し、Contents API で `main` ブランチにコミットする。失敗時はリトライできる。

## Dependencies
- 先行: 04（GitHub API + PAT）, 05（採点画面からの呼び出し口）

## Scope
- `web/src/commit/appendAttempt.ts`（または `src/api/` 内でも可）
  - 入力: `{ testNumber, iso, elapsed, score, answers, mistakes }` 相当。
  - 処理:
    1. `getContent('Reading/MockTestN.md')` で現行内容と `sha` を取得。
    2. 末尾に以下のブロックを append:
       ```
       ## Attempt <ISO>
       - score: <X>/<N>
       - elapsed: <HH:MM:SS>
       - answers: [A, B, ...]
       - mistakes:

       | Q | My answer | Correct | Confidence |
       |---|-----------|---------|------------|
       | ... |
       ```
    3. `putContent({ path, message, content, sha })` で PUT。
  - `iso` は `new Date().toISOString()`、表示側は JST オフセット付きで出す（`+09:00`）。
  - コミットメッセージ: `record: Mock Test N attempt <ISO>`。
- 05 の採点画面「履歴を保存」ボタンから呼ぶ。
- PAT 未設定なら 04 の `ensurePat()` 経由でモーダルを出す。
- 失敗時はトーストで通知 + 「リトライ」ボタン。成功時もトーストで「保存しました」と出す。
- 既存の `## Score` / `## Mistakes` / `## New words` は今回は書き換えない（append のみ）。

## Out of Scope
- 最新スコアをフロントマターや `## Score` に反映する自動更新（後続で検討）。
- コンフリクト解消（単一ユーザー前提）。

## Acceptance Criteria
- [ ] 採点画面で「履歴を保存」を押すと、GitHub 上の `Reading/MockTestN.md` に `## Attempt <ISO>` が 1 つ増える。
- [ ] コミットメッセージが `record: Mock Test N attempt ...` 形式である。
- [ ] 連続で 2 回保存しても競合せずに 2 ブロック追記される（2 回目は 1 回目の sha を再取得してから PUT）。
- [ ] PAT エラー時はトーストで通知され、リトライボタンで再試行できる。

## References
- `docs/design.md` §4.2, §6.3
