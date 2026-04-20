---
tags: [ticket, mvp1]
type: ticket
status: todo
ticket: "07"
---

# 07. GitHub Actions → Pages デプロイ

## Goal
`main` にマージされると `web/` がビルドされ GitHub Pages に公開される。ビルド成果物はリポジトリにコミットしない。

## Dependencies
- 先行: 01（`web/` が `npm run build` で成果物を吐ける状態）

## Scope
- `.github/workflows/pages.yml` を新規作成。
  - トリガー: `push` to `main`、`paths: [ 'web/**', '.github/workflows/pages.yml' ]`、加えて `workflow_dispatch`。
  - `permissions: { contents: read, pages: write, id-token: write }`。
  - `concurrency: { group: pages, cancel-in-progress: false }`。
  - build job:
    - `actions/checkout@v4`
    - `actions/setup-node@v4` (Node 20)
    - `cd web && npm ci && npm run build`
    - `actions/configure-pages@v5`
    - `actions/upload-pages-artifact@v3` with `path: web/dist`
  - deploy job:
    - `actions/deploy-pages@v4`
    - `environment: { name: github-pages, url: steps.deployment.outputs.page_url }`
- リポジトリ設定「Settings → Pages → Build and deployment: GitHub Actions」を有効化する手順を PR 説明か `docs/tickets/07-pages-workflow.md` のメモに残す（手動対応が必要）。
- `web/vite.config.ts` の `base` が `'./'`（相対パス）になっているか確認。なっていなければ 01 に戻って合わせる。

## Out of Scope
- カスタムドメイン設定。
- プレビュー URL（PR 単位デプロイ）。

## Acceptance Criteria
- [ ] `main` への push 後に Actions が走り、`pages-build-deployment` 相当のジョブが成功する。
- [ ] Pages URL にアクセスしてホーム画面が表示される（データ表示は 05 が完了していれば）。
- [ ] `web/dist/` や `node_modules/` が git に含まれていない。

## References
- `docs/design.md` §3
