---
tags: [ticket, mvp1]
type: ticket
status: todo
ticket: "01"
---

# 01. `web/` を Vite + Vanilla TS で初期化しホームスタブを用意

## Goal
`web/` 配下に Vite + TypeScript の雛形と最小ルーティングを整え、`npm run dev` でホーム画面のスタブが表示される状態にする。

## Dependencies
- 先行: なし

## Scope
- `web/` ディレクトリを作成し、Vite (Vanilla TS テンプレ) を初期化。
- `web/package.json` / `web/vite.config.ts` / `web/tsconfig.json` を追加。
  - `vite.config.ts` の `base` は GitHub Pages 配下にデプロイできるよう `'./'` を想定。
- `web/index.html` と `web/src/main.ts` を用意。
- `web/src/pages/home.ts` をスタブとして作成（「Home (MVP1)」の見出しだけでよい）。
- location.hash ベースの最小ルータ相当のディスパッチを `main.ts` に実装（現状はホームのみ）。
- `web/.gitignore` に `node_modules/` と `dist/` を追加。ビルド成果物はコミットしない。

## Out of Scope
- GitHub API 呼び出しや認証（04 で実装）。
- ホーム画面の実データ表示（05 で実装）。
- Pages デプロイ用 workflow（07 で実装）。

## Acceptance Criteria
- [ ] `cd web && npm install && npm run dev` で dev server が起動し、ブラウザに「Home (MVP1)」が表示される。
- [ ] `npm run build` が成功し `web/dist/` が生成される。
- [ ] ルートリポジトリの `.gitignore` もしくは `web/.gitignore` により `node_modules/` と `web/dist/` が追跡されない。

## References
- `docs/design.md` §3（アーキテクチャ / ディレクトリ構成）
