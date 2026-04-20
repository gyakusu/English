---
tags: [ticket, mvp1]
type: ticket
status: todo
ticket: "02"
---

# 02. `Reading/MockTest{1,2}_source.md` に `answers` / `time_goal_min` を追加

## Goal
parser が正解を安定抽出できるよう、既存 2 ファイルのフロントマターに正解配列と目安時間を明示する。

## Dependencies
- 先行: なし

## Scope
- `Reading/MockTest1_source.md` と `Reading/MockTest2_source.md` のフロントマターに以下を追加:
  - `answers: [X, Y, ...]` — 各問題の正解選択肢 (A〜D) を順に並べた配列。
  - `time_goal_min: N` — passage 先頭の「Time Goal: N mins」に揃える。
- 本文 (`[Passage]` / `[Questions]` / 💡 解答・解説 / 🔑 重要語彙) は変更しない。
- `answers.length` と `[Questions]` 内の問題数が一致することを目視確認。
  - MockTest1 は 2 問、MockTest2 は 5 問。

## Out of Scope
- parser 実装や正解の正規表現抽出（03 で扱う）。
- 問題文そのものの修正。

## Acceptance Criteria
- [ ] 2 ファイル両方に `answers` と `time_goal_min` が追加されている。
- [ ] `answers` の要素数が各ファイルの問題数と一致する。
- [ ] 本文側の「💡 解答・解説」に書かれた正解と `answers` が一致する。
- [ ] フロントマターが YAML として valid（既存ツールで開けるか Obsidian でプレビューできる）。

## References
- `docs/design.md` §4.1（出題ファイルのスキーマ変更）
- `Reading/MockTest1_source.md`, `Reading/MockTest2_source.md`
