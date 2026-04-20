# English Learning Vault

TOEIC 550 → 900 を目指す、個人英語学習のための Obsidian Vault です。

## 目標

| 項目 | 現在 | 目標 |
|------|------|------|
| TOEIC スコア | 550 | 900 |
| 重点パート | Part 5（文法）・Part 7（読解） | — |

---

## フォルダ構成

```
English/
├── Vocabulary/   # 新出単語の蓄積
├── Grammar/      # 苦手文法ポイントの記録
├── Reading/      # 模試の記録・分析
└── TODO.md       # 次にやるべきタスク
```

---

## 勉強の進め方

### 1. 模試を解く（Reading/）

1. `Reading/MockTest_template.md` をコピーして `MockTestN.md` という名前で保存する
2. 模試を解いたあと、スコア・間違えた問題・理由を表に記録する
3. 模試中に出てきた新出単語は `Vocabulary/words.md` にリンクして追記する

**テンプレートの項目：**
- スコア（Part 5 / Part 7）
- 間違えた問題一覧（問題番号・自分の回答・正解・間違えた理由）
- 新出単語リスト

---

### 2. 単語を記録する（Vocabulary/）

模試や教材で出てきた知らない単語を `words.md` に追記する。

**記録フォーマット：**
```markdown
## [単語]
- meaning: [日本語の意味]
- example: [例文]
- source: [Mock Test N, Part X]
```

**例：**
```markdown
## beverage
- meaning: 飲み物
- example: The company will provide a variety of beverages.
- source: Mock Test 1, Part 7
```

---

### 3. 文法の弱点を記録する（Grammar/）

問題を解いていて詰まった文法は、**トピックごとにファイルを作って**記録する。

**ファイル名の例：** `prepositions.md`, `tense.md`, `relative-clauses.md`

**記録フォーマット：**
```markdown
## [ポイント名]
- Issue: 何に詰まったか
- Rule: 正しいルール
- ✗ 間違い例
- ✓ 正しい例
- Source: [Mock Test N, Part X]
```

**例：**
```markdown
## despite vs. in spite of
- Issue: despite の後ろに "of" を付けてしまいがち
- Rule: despite + noun / in spite of + noun
- ✗ despite of the rain
- ✓ despite the rain
- Source: Mock Test 1, Part 5
```

---

### 4. タスクを管理する（TODO.md）

次にやること・進行中・完了をチェックボックス形式で管理する。

```markdown
- [ ] Mock Test 2 を解く
- [x] Mock Test 1 の単語を words.md に追記する
```

---

## 1回の学習サイクル（推奨）

```
模試を解く
   ↓
スコア・間違いを MockTestN.md に記録
   ↓
新出単語を Vocabulary/words.md に追記
   ↓
文法ミスを Grammar/ の該当ファイルに追記
   ↓
TODO.md を更新して次の課題を設定
```

---

## Obsidian での使い方のヒント

- `[[Vocabulary/words]]` のようにリンクを使うと、模試ノートから単語帳へ素早くジャンプできる
- タグ（`tags: [vocabulary]` など）を使うと関連ノートをまとめて検索できる
- グラフビューで単語・文法・模試のつながりを視覚的に確認できる
