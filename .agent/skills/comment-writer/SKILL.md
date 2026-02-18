---
name: comment-writer
description: TypeScript、React、SASS、HTML のコードに良質なコメントを追加・改善するスキル。JSDoc形式のドキュメントコメントとインラインコメントを日本語で生成。「このファイルにコメントを追加して」「コメントを改善して」などのリクエストで使用。
---

# Comment Writer Skill

このスキルは、コードに良質な日本語コメントを追加・改善します。

## 対象

- **言語**: TypeScript, JavaScript, SASS/SCSS, HTML
- **フレームワーク**: React.js, Next.js
- **コメント形式**: JSDoc, インラインコメント

---

## コメント作成の原則

### 1. 「なぜ」を説明する

コードが「何をしているか」ではなく、「なぜそうしているか」を説明します。

```typescript
// ❌ 避けるべき: コードをそのまま言い換えている
// iを1増やす
i++

// ✅ 推奨: 意図や理由を説明
// ループカウンタを進める（配列の先頭から順に処理するため）
i++
```

### 2. 適切な粒度

- **関数**: JSDocで目的・引数・戻り値を記述
- **複雑なロジック**: インラインコメントで処理の流れを説明
- **明らかなコード**: コメント不要（過剰なコメントは避ける）

### 3. 一貫性

プロジェクト全体で統一されたスタイルを維持します。

---

## JSDoc コメント

👉 詳細なパターンと例は [jsdoc-patterns.md](references/jsdoc-patterns.md) を参照

### 基本構造

```typescript
/**
 * 関数の簡潔な説明（1行で完結）
 * @description より詳細な説明が必要な場合に使用
 * @param {型} 引数名 - 引数の説明
 * @returns {型} 戻り値の説明
 * @throws {Error} 例外の説明
 * @example
 * // 使用例
 * const result = functionName(arg)
 */
```

### React コンポーネント

```typescript
/**
 * ユーザー情報を表示するカードコンポーネント
 * @description プロフィール画面やユーザー一覧で使用
 */
interface UserCardProps {
  /** ユーザーの表示名 */
  name: string
  /** プロフィール画像のURL（未設定時はデフォルト画像を表示） */
  avatarUrl?: string
  /** カードクリック時のコールバック */
  onClick?: () => void
}

export const UserCard: FC<UserCardProps> = memo(({ name, avatarUrl, onClick }) => {
  // ...
})
```

---

## インラインコメント

👉 詳細なパターンと例は [inline-patterns.md](references/inline-patterns.md) を参照

### 使用場面

1. **複雑なロジック**: アルゴリズムや条件分岐の意図
2. **回避策(Workaround)**: なぜその実装が必要か
3. **ビジネスルール**: ドメイン知識が必要な処理
4. **TODO/FIXME**: 将来の改善ポイント

### パターン

```typescript
// 処理のセクション区切り
// ============================

// 条件分岐の理由
if (user.age >= 20) {
  // 日本の法律上、20歳以上のみアルコール購入可能
  showAlcoholSection()
}

// 回避策の説明
// NOTE: ライブラリのバグ回避のため一時的に遅延を追加
// 参照: https://github.com/example/issue/123
await delay(100)

// 将来の改善
// TODO: パフォーマンス改善のためメモ化を検討
// FIXME: エッジケースで null が返る可能性あり
```

---

## SASS/SCSS コメント

```sass
// ============================
// ボタンコンポーネント
// デザインシステムの基本ボタンスタイル
// ============================

.button
  // ベーススタイル
  +flex-center
  padding: $spacing-sm $spacing-md
  
  // ホバー時のインタラクション
  // ユーザーにクリック可能であることを伝える
  &:hover
    transform: translateY(-2px)
    box-shadow: $shadow-md
  
  // 無効状態
  // クリック不可を視覚的に示す
  &:disabled
    opacity: 0.5
    cursor: not-allowed
```

---

## HTML コメント

```html
<!-- ============================
     ヘッダーセクション
     ナビゲーションとロゴを含む
     ============================ -->
<header class="header">
  <!-- ロゴ: クリックでホームに戻る -->
  <a href="/" class="logo">...</a>
  
  <!-- メインナビゲーション -->
  <nav class="nav">...</nav>
</header>

<!-- メインコンテンツ開始 -->
<main>...</main>
```

---

## コメント追加の手順

1. **ファイル全体を確認**: 構造と複雑さを把握
2. **優先順位付け**: 複雑なロジック・公開API・重要な関数から
3. **JSDoc追加**: 関数・クラス・インターフェースに
4. **インラインコメント追加**: 複雑な部分に
5. **確認**: 過剰なコメントを削除

---

## 注意事項

- **日本語で記述**: コメントはすべて日本語
- **簡潔に**: 冗長な説明は避ける
- **更新を忘れずに**: コード変更時はコメントも更新
- **自明なコードにはコメント不要**: `i++` に「1を足す」は不要
