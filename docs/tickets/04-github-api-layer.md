---
tags: [ticket, mvp1]
type: ticket
status: todo
ticket: "04"
---

# 04. GitHub raw fetch + Contents API + PAT モーダル

## Goal
ブラウザから GitHub 上の markdown を読み書きするためのラッパと、書き込み時だけ走る PAT 入力フローを用意する。

## Dependencies
- 先行: 01（`web/` プロジェクト前提）

## Scope
- `web/src/api/github.ts`
  - `fetchRaw(path: string): Promise<string>` — `https://raw.githubusercontent.com/{owner}/{repo}/main/{path}` から取得。未認証。
  - `listReading(): Promise<{ name: string; path: string; sha: string }[]>` — `GET /repos/{owner}/{repo}/contents/Reading` を叩き、`MockTest*_source.md` 等を一覧化。
  - `getContent(path: string): Promise<{ content: string; sha: string }>` — Contents API `GET` で既存ファイルの sha を取得。
  - `putContent({ path, message, content, sha }): Promise<void>` — `PUT /repos/{owner}/{repo}/contents/{path}` で `main` に直接コミット。リクエストヘッダは `Authorization: Bearer <PAT>`。
  - 失敗時は `Error` を throw し、呼び出し側がハンドル。
- `web/src/auth/pat.ts`
  - `getPat(): string | null` / `setPat(v: string): void` / `clearPat(): void` — LocalStorage キー `gh_pat`。
  - `ensurePat(): Promise<string>` — 未設定なら入力モーダルを開き、保存後に resolve。
- 「PAT をクリア」ボタンを画面のどこか（ヘッダ等の暫定位置でよい）に出す。
- `owner` / `repo` はビルド時定数として `web/src/config.ts` にハードコード（本リポジトリ固定）。

## Out of Scope
- 実際の書き込みを呼び出す箇所（06 で採点後コミットに使う）。
- レート制限のリトライ（必要になった時点で拡張）。
- セッション内 in-memory キャッシュ（05 の画面実装時に §7 方針で追加）。

## Acceptance Criteria
- [ ] ブラウザ devtools から `fetchRaw('Reading/MockTest1_source.md')` を呼ぶと markdown 文字列が返る。
- [ ] `listReading()` が `MockTest1_source.md` / `MockTest2_source.md` / `MockTest1.md` / `MockTest2.md` 等を含む配列を返す。
- [ ] PAT 未設定の状態で書き込み系 API を呼ぶと、PAT 入力モーダルが出て、入力後に書き込みが走る。
- [ ] 「PAT をクリア」ボタンで LocalStorage から削除され、次の書き込み時に再度モーダルが出る。
- [ ] PAT が誤っている場合は 401/403 を上位に throw する（UI 側で通知）。

## References
- `docs/design.md` §3（読み込み / 書き込み方式）, §5（認証）
