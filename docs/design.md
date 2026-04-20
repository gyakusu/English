---
tags: [design, doc]
type: design
status: draft
date: 2026-04-20
---

# English Learning Site — 設計書 (MVP1)

GitHub Pages 上で動作する、このリポジトリを出題源とする TOEIC 学習サイトの設計。
実装前の共通理解を固めるためのドキュメント。

## 1. 目的

- 既存 Obsidian vault (`Reading/` 以下の MockTest ファイル) を出題源とする学習用 Web サイトを GitHub Pages に立てる。
- 解答履歴を「リポジトリ内のファイル」として記録し、Web からも Obsidian からも読める状態にする。
- 必要に応じて出題ファイルを Web から編集できる（ただし MVP1 では範囲外）。
- 書き込み操作には簡単な認証をかける。

## 2. スコープ

### MVP1 に含むもの

- Part 7 読解のみの出題 (`Reading/MockTestN_source.md`)。
- MockTest 一覧ホーム画面（最新スコア・試行回数表示）。
- セット一括提出型の解答画面（タイマー + 自信度タグ付き）。
- 採点結果と解説の表示。
- 解答履歴を該当 `MockTestN.md` に追記して GitHub にコミット。
- 書き込み時のみ Fine-grained PAT を要求する認証。

### MVP1 に含まないもの（後続）

- Web 上での出題ファイル編集（raw markdown textarea + プレビュー）。
- Web 上での新規 MockTest 作成（空ファイル生成と連番管理）。
- 単語テスト（`Vocabulary/words.md`）や文法出題（`Grammar/`）。
- スコア推移の時系列チャート。

## 3. アーキテクチャ

- 静的 SPA を GitHub Pages にホスト。バックエンドなし。
- フロントエンド: **Vite + Vanilla TypeScript**。
- ソースコードは `web/` ディレクトリ配下。既存の `Vocabulary/` `Grammar/` `Reading/` と並列。
- デプロイは **GitHub Actions → GitHub Pages** (`actions/deploy-pages`)。ビルド成果物はコミットしない。
- 出題・履歴の読み込みはランタイムに `raw.githubusercontent.com` から直接 fetch（public repo 前提、PAT 不要）。
- 書き込みは GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`) で `main` ブランチに直接コミット。

```
English/ (repo root)
├── Reading/                      # 出題源 (既存)
│   ├── MockTest1_source.md       # 問題データ
│   ├── MockTest1.md              # 試行履歴 (Web から append)
│   └── ...
├── Vocabulary/ Grammar/ TODO.md  # 既存 vault 資産 (MVP1 では未使用)
├── web/                          # フロントエンドソース (新規)
│   ├── index.html
│   ├── src/
│   │   ├── main.ts
│   │   ├── api/github.ts         # raw fetch + Contents API ラッパ
│   │   ├── parser/mockTest.ts    # _source.md → 構造化データ
│   │   ├── parser/attempts.ts    # MockTestN.md の ## Attempt 集計
│   │   ├── pages/home.ts         # 一覧
│   │   ├── pages/quiz.ts         # 解答
│   │   ├── pages/result.ts       # 採点・解説
│   │   └── auth/pat.ts           # LocalStorage + モーダル
│   ├── package.json / vite.config.ts / tsconfig.json
│   └── ...
├── .github/workflows/pages.yml   # ビルド & デプロイ (新規)
└── docs/design.md                # 本書
```

## 4. データ形式

### 4.1 出題ファイル (`Reading/MockTestN_source.md`) のスキーマ変更

パーサ安定化のため、フロントマターに **正解配列** を明示的に追加する。本文の markdown 構造 (`[Passage]` / `[Questions]` / 💡 解答・解説 / 🔑 重要語彙) は現状維持。

```markdown
---
test: Mock Test 1
answers: [B, C]
time_goal_min: 3
---

### Part 7: Single Passage (E-mail)
**Time Goal:** 3 mins

#### [Passage]
...

#### [Questions]

**1. What is the main purpose of the e-mail?**
(A) ...
(B) ...
...

### 💡 解答・解説
> [!success]- 解答を表示
> **1. 正解: (B)**
> ...
```

- `answers` は各問題の正解選択肢を順に並べた配列。問題数と `answers.length` は一致する前提。
- `time_goal_min` はタイマーの目安表示に使用。

### 4.2 試行ログ (`Reading/MockTestN.md`) の追記形式

既存の `## Score` / `## Mistakes` / `## New words` は「最新の代表値」として維持しつつ、試行ごとに `## Attempt <ISO日時>` セクションを追記する。append-only。

```markdown
---
tags: [reading, mock-test, part7]
type: reading
date: 2026-04-20
test: Mock Test 1
score_part5:
score_part7: 1/2
---

# Mock Test 1

## Score
- Part 5: /40
- Part 7: 1/2

## Mistakes
| Q | My answer | Correct | Why |
|---|-----------|---------|-----|
| 2 | (A) ... | (C) ... | ... |

## New words → [[Vocabulary/words]]
- ...

## Attempt 2026-04-20T14:05:32+09:00
- score: 2/2
- elapsed: 00:02:48
- answers: [B, C]
- mistakes:

| Q | My answer | Correct | Confidence |
|---|-----------|---------|------------|
|   |           |         |            |

## Attempt 2026-04-21T09:12:08+09:00
...
```

## 5. 認証

- 閲覧は誰でも可（repo が public なので、そもそも問題は誰でも見える）。
- 書き込み (解答履歴コミット、後続 MVP では編集・新規作成) のみ PAT が必要。
- 採用方式: **Fine-grained PAT を Web UI に貣り付け** → LocalStorage 保存。
  - 必要スコープ: このリポジトリの `Contents: Read and write`。
  - 書き込み発生時に PAT 未設定なら入力モーダルを表示。
  - 「PAT をクリア」ボタンで端末から削除可能。
- サーバレスで完結。OAuth App 登録や外部サーバ不要。
- トレードオフ: PAT は LocalStorage に平文保存されるため端末紛失時のリスクあり。Fine-grained で repo スコープを絞ることで被害範囲を限定する。

## 6. UX

### 6.1 ホーム画面

- `Reading/MockTest*_source.md` を GitHub API (`GET /repos/{owner}/{repo}/contents/Reading`) で一覧取得。
- 各テストについて、対応する `MockTestN.md` を fetch → `## Attempt` セクションをパースして以下を表示:
  - テスト名（`test:` フロントマター値）
  - 最新スコア
  - 試行回数
- クリックで解答画面へ。

### 6.2 解答画面

- ページ遷移時に**自動でタイマー開始**。画面上部に経過時間を表示。目安時間 (`time_goal_min`) も併記。
- passage と全問題を 1 ページに表示（スクロール）。
- 各問題の下に選択肢 (A)-(D) とラジオボタン、加えて**自信度タグ** (`確信 / 迷い / 勘`) のトグル。
- 「提出」ボタンで採点画面へ。提出時点で経過時間を確定。

### 6.3 採点画面

- 問題ごとに 正誤 / 自分の解答 / 正解 / 解説 を表示。
- 全体スコア、所要時間、自信度ごとの正答率（例: 勘なのに正解した問題の一覧）をサマリ表示。
- 自動で `MockTestN.md` に `## Attempt` を追記してコミット。
  - コミットメッセージ例: `record: Mock Test 1 attempt 2026-04-20T14:05`
  - 失敗時はトーストで通知し、リトライボタンを出す。

## 7. 非機能

- **レスポンシブ対応**: スマホ/タブレットで学習できること（モバイル必須）。
- **オフライン対応**: 不要（書き込みに GitHub 接続必須のため）。
- **単一ユーザー前提**: 同時編集のコンフリクト対策は実装しない。
- **レート制限**: GitHub API は未認証 60 req/h、認証済 5000 req/h。一覧ページで fetch 数が増えやすいため、セッション内で結果を in-memory キャッシュする。

## 8. 主要な意思決定とトレードオフ

| 決定 | 採用 | 却下した代替案 | 理由 |
|------|------|----------------|------|
| コンテンツスコープ | Part 7 のみ | 単語・文法も含む | 既存データが揃っており最短で動く |
| 永続化 | GitHub API で repo に書き込み | LocalStorage のみ | デバイス間共有と履歴残しのため |
| 認証 | Fine-grained PAT 貼り付け | OAuth Device Flow / 合言葉 | サーバレス + シンプルさ優先 |
| 出題形式 | フロントマターに `answers` 追加 | 既存 `> **正解: (X)**` を正規表現で抽出 | パースの安定性 |
| 読み込み | ランタイム fetch | ビルド時 JSON 埋め込み | 編集後の反映をリアルタイムに |
| 記録 | MockTestN.md に Attempt を append | results.json に集約 | 人間可読 + 既存ワークフローに馴染む |
| UX | 一括提出型 | 1 問ずつ即時正誤 | TOEIC 本番に近い |
| デプロイ | GitHub Actions → Pages | `docs/` フォルダ方式 / gh-pages ブランチ | ビルド成果物を履歴に混ぜない |
| フロントエンド | Vite + Vanilla TS | React / Astro | 規模に対して軽量で十分 |

## 9. 後続タスク（実装時の参考）

1. `web/` に Vite + TS プロジェクトを初期化し、最小ルーティングとホーム画面のスタブを作る。
2. `Reading/MockTest1_source.md` / `MockTest2_source.md` のフロントマターに `answers` を追加。
3. `_source.md` → 構造化データのパーサを書き、2 ファイルで成立することを確認。
4. GitHub raw fetch 層と Contents API 書き込み層を実装（PAT モーダル含む）。
5. 解答画面・採点画面を実装。
6. `MockTestN.md` に `## Attempt` を append するコミット処理を実装。
7. `.github/workflows/pages.yml` を用意して Pages デプロイを有効化。
8. モバイルで通しで動かしてみる。

## 10. 未決事項（実装時に判断すれば足りるもの）

- 自信度タグの具体的な UI コンポーネント（chip / toggle / segmented control）。
- コミットメッセージの細かい文言規約。
- モバイル時の passage 表示の折り畳み有無。
- PAT 入力モーダルのデザイン。
