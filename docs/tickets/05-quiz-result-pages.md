---
tags: [ticket, mvp1]
type: ticket
status: todo
ticket: "05"
---

# 05. ホーム / 解答 / 採点画面の実装

## Goal
ホーム画面からテストを選び、タイマー付きで解答し、採点結果を確認できる一連の UI を実装する（コミット処理はまだ繋がなくてよい）。

## Dependencies
- 先行: 01（Vite 雛形）, 03（parser）, 04（GitHub fetch）

## Scope
- `web/src/pages/home.ts`
  - `listReading()` で `MockTest*_source.md` を列挙。
  - 各テストについて対応する `MockTestN.md` を `fetchRaw` → `parseAttempts` で集計。
  - 表示項目: テスト名（`test:` フロントマター）、最新スコア、試行回数。
  - クリックで `#/quiz/MockTestN` に遷移。
- `web/src/pages/quiz.ts`
  - 対応 `_source.md` を fetch & parse。
  - 画面遷移と同時にタイマー開始。経過時間と目安時間 (`time_goal_min`) を上部に表示。
  - passage と全問題を 1 ページに表示（スクロール）。
  - 各問題に (A)-(D) ラジオと自信度トグル（`確信 / 迷い / 勘`）。
  - 「提出」で採点画面へ。提出時点で経過時間を確定し state に持つ。
- `web/src/pages/result.ts`
  - 問題ごとに 正誤 / 自分の解答 / 正解 / 解説 を表示。
  - サマリ: 全体スコア、所要時間、自信度別集計（例: 勘で正解した問題一覧）。
  - 画面上に「履歴を保存」ボタン（実処理は 06）を配置（押しても今はトーストのみで可）。
- 画面遷移は 01 で導入した hash ルータに `#/`, `#/quiz/:id`, `#/result/:id` を追加。
- セッション内 in-memory キャッシュで `_source.md` / `MockTestN.md` の重複 fetch を避ける（§7）。
- 最低限のレスポンシブ CSS（モバイル想定、幅 360px〜で崩れない）。

## Out of Scope
- `## Attempt` append とコミット（06）。
- Pages デプロイ（07）。
- モバイル実機検証（08）。

## Acceptance Criteria
- [ ] `npm run dev` でホームにテスト一覧が表示される（試行 0 回でもエラーにならない）。
- [ ] テストをクリックすると解答画面に遷移し、タイマーが動く。
- [ ] 全問選択して提出すると採点画面に遷移し、正答/誤答・自信度別集計が見える。
- [ ] `MockTestN.md` にまだ `## Attempt` が無い状態でも最新スコアはフロントマター `score_part7` をフォールバックとして表示できる（空でも可）。
- [ ] スマホ幅 (375px) で主要ボタンがタップ可能。

## References
- `docs/design.md` §6, §7
