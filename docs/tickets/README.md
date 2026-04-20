---
tags: [ticket, mvp1, index]
type: ticket-index
status: draft
date: 2026-04-20
---

# MVP1 実装チケット一覧

`docs/design.md` §9「後続タスク」を 1 チケット = 1 PR 相当の粒度に分割したもの。
MVP1 スコープ（Part 7 読解のみ / 履歴 append / PAT 書き込み / Pages デプロイ）に限定。

## 作業順と依存

```
01 ──┬─ 04 ──┐
     │       ├─ 05 ─ 06 ─┐
02 ─ 03 ─────┘           ├─ 08
                         │
01 ─────────── 07 ───────┘
```

## チケット

| # | タイトル | 依存 |
|---|---------|------|
| [01](./01-vite-setup.md) | `web/` を Vite + Vanilla TS で初期化しホームスタブを用意 | なし |
| [02](./02-add-answers-frontmatter.md) | `Reading/MockTest{1,2}_source.md` に `answers` / `time_goal_min` を追加 | なし |
| [03](./03-source-parser.md) | 出題 / 試行ログ parser を実装 | 02 |
| [04](./04-github-api-layer.md) | GitHub raw fetch + Contents API + PAT モーダル | 01 |
| [05](./05-quiz-result-pages.md) | ホーム / 解答 / 採点画面の実装 | 01, 03, 04 |
| [06](./06-attempt-commit.md) | `MockTestN.md` への `## Attempt` append コミット | 04, 05 |
| [07](./07-pages-workflow.md) | GitHub Actions → Pages デプロイ | 01 |
| [08](./08-mobile-smoke-test.md) | モバイルで通し確認 | 05, 06, 07 |

## MVP1 に含まないもの（§2.2）

- Web 上での出題ファイル編集 / 新規 MockTest 作成。
- 単語テスト / 文法出題。
- スコア推移チャート。
