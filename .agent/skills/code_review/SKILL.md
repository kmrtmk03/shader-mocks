---
name: code_review
description: コードの品質、バグ、パフォーマンス、セキュリティなどをチェックするためのスキル。TypeScript/React/SASS プロジェクトに特化したチェックリストとスクリプトを含む。
---

# Code Review Skill

このスキルは、コードの品質を高め、潜在的な問題を早期に発見するために使用します。

## リソース

このスキルには以下の補助リソースが含まれています：

### References（詳細ガイド）

- **[react-patterns.md](references/react-patterns.md)** - React アンチパターン＆推奨パターンチェックリスト
  - useEffect の依存配列、クリーンアップ処理、再レンダリング最適化など
- **[typescript-checklist.md](references/typescript-checklist.md)** - TypeScript 型定義ベストプラクティス
  - any型回避、interface vs type、Utility Types活用など

### Scripts（自動チェック）

- **[lint-check.sh](scripts/lint-check.sh)** - ESLint/TypeScript エラー自動チェックスクリプト
  - 使用方法: `./scripts/lint-check.sh [対象ディレクトリ]`

---

## レビューの観点

以下の観点に基づいてコードを確認してください。

1.  **機能性 (Functionality)**:
    - 仕様通りに動作するか？
    - エッジケースやエラーハンドリングは適切か？
    - 特に `useEffect` や非同期処理の依存関係、クリーンアップ処理は正しいか？
    - 👉 詳細は [react-patterns.md](references/react-patterns.md) を参照
2.  **可読性と保守性 (Readability & Maintainability)**:
    - 変数名、関数名は意図を明確に表しているか？
    - 関数は単一の責任を持っているか？
    - コードの重複はないか？
    - 適切なコメント（特に複雑なロジックに対する日本語コメント）はあるか？
3.  **パフォーマンス (Performance)**:
    - 無駄な再レンダリングを防いでいるか（`memo`, `useMemo`, `useCallback` の適切な使用）？
    - 計算量の多い処理が頻繁に実行されていないか？
    - 👉 詳細は [react-patterns.md](references/react-patterns.md) を参照
4.  **セキュリティ (Security)**:
    - XSSやインジェクションのリスクはないか？
    - ユーザー入力のバリデーションは適切か？
5.  **型安全性 (Type Safety)**:
    - TypeScriptの型定義は適切か（`any` の乱用がないか）？
    - 型アサーション (`as`) や非nullアサーション (`!`) を乱用していないか？
    - 👉 詳細は [typescript-checklist.md](references/typescript-checklist.md) を参照
6.  **スタイルと規約 (Style & Conventions)**:
    - プロジェクトの既存のコードスタイルに沿っているか？
    - SASS の変数・ミックスインを適切に活用しているか？

## レビュー手順

1.  **自動チェック**: `scripts/lint-check.sh` を実行して、基本的なエラーを検出
2.  **コード確認**: `view_file` や `render_diffs` を使用して、対象のコードや変更差分を読み込む
3.  **詳細分析**: 上記の観点に基づいてコードを分析（必要に応じてreferencesを参照）
4.  **フィードバック**: 問題が見つかった場合は、**なぜそれが問題なのか**という理由と、**具体的な修正コード**を提示

## 出力フォーマット

レビュー結果は以下のMarkdown形式で出力してください。

```markdown
## コードレビュー結果

### 概要
[変更内容やコードの全体的な品質に対する簡潔なサマリー]

### 詳細レビュー

#### 1. [ファイル名]

- **[行番号]**: [指摘内容の要約]
  - **問題点**: [何が問題なのか具体的かつ論理的に説明]
  - **改善案**:
    ```typescript
    // 修正コードの例
    ```
  - **重要度**: [高 / 中 / 低]

（複数のファイルがある場合は同様に繰り返す）

### 全体的なフィードバック
- [良かった点]
- [さらに改善できるかもしれない点（Optional）]
```

## 注意事項

- **常に日本語で**出力してください。
- 開発者を尊重し、**建設的かつ丁寧なトーン**でコメントしてください。
- 「良いコード」には積極的に称賛のコメントをしてください。
