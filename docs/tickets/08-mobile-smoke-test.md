---
tags: [ticket, mvp1]
type: ticket
status: todo
ticket: "08"
---

# 08. モバイルで通し確認

## Goal
実機または Chrome DevTools のモバイルエミュレーションで、ホーム → 解答 → 採点 → コミットの一連の動作をモバイル想定で確認する。

## Dependencies
- 先行: 05（UI）, 06（コミット）, 07（Pages 公開）

## Scope
- 実機 (iPhone Safari など) または Chrome DevTools の iPhone 14 プロファイル等で以下を確認:
  - [ ] ホーム画面でテスト一覧・最新スコア・試行回数が表示される。
  - [ ] 解答画面でタイマーが動き、選択肢と自信度タグがタップしやすい。
  - [ ] passage と問題のスクロール導線（必要に応じて passage の折り畳みを検討: design §10）。
  - [ ] 提出後の採点画面で集計と解説が読める。
  - [ ] 「履歴を保存」で PAT モーダルが出て、正しい PAT を入れるとコミットが走り Success トーストが出る。
  - [ ] 再読み込み後にホームの試行回数が 1 増えている。
- 見つかった不具合は GitHub Issue に記載する（本チケットでは fix しない）。
  - Issue のラベル例: `mvp1`, `ux`, `bug`。
- 検証結果を本 Markdown 末尾にチェックリストの埋めとして記録してもよい。

## Out of Scope
- 実際の UX 改善 / デザイン調整（別チケット化）。
- Android 固有調整。

## Acceptance Criteria
- [ ] 上記チェックリストがすべてチェック済み、もしくは未達の項目が Issue 化されている。
- [ ] 通しで壊れる致命的な不具合（タップ不能 / レイアウト崩れで操作不能）が残っていない。

## References
- `docs/design.md` §6, §7, §10
