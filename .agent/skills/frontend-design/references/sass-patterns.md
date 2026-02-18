# SASS パターン＆ミックスイン活用ガイド

このドキュメントは、当プロジェクトで使用するSASSのパターンとミックスインの活用方法をまとめています。

---

## プロジェクト構造

```
src/styles/
├── variables/             # 変数定義
│   ├── _aurora-theme.sass # Aurora Glass テーマ（グラスモーフィズム）
│   ├── _color.sass        # 基本カラーパレット
│   ├── _layout.sass       # レイアウト関連変数
│   └── _z-index.sass      # z-index 管理
├── mixins/                # ミックスイン定義
│   ├── _utility.sass      # ユーティリティ（flex, hover等）
│   ├── _media-query.sass  # レスポンシブ対応
│   ├── _size.sass         # サイズ関連
│   └── _position.sass     # 位置関連
└── reset.sass             # リセットCSS
```

---

## カラーパレット

### Aurora Glass テーマ

プロジェクトのメインテーマです。グラスモーフィズムを基調としたダークテーマ。

```sass
// 使用方法
@use '@/styles/variables/aurora-theme' as theme

.container
  background: theme.$bg-deep        // #0F0F23 - 最深の背景
  color: theme.$text-primary        // #FFFFFF - メインテキスト

.glass-card
  background: theme.$glass-bg       // rgba(255, 255, 255, 0.05)
  border: 1px solid theme.$border-glass
  
  &:hover
    background: theme.$glass-bg-hover
```

### カラー変数一覧

| 変数名 | 値 | 用途 |
|--------|-----|------|
| `$bg-deep` | `#0F0F23` | 最深の背景色 |
| `$bg-surface` | `#1A1A2E` | サーフェス背景 |
| `$accent-cyan` | `#00D9FF` | アクセント（シアン） |
| `$accent-pink` | `#FF6B9D` | アクセント（ピンク） |
| `$accent-purple` | `#8B5CF6` | アクセント（パープル） |
| `$text-primary` | `#FFFFFF` | メインテキスト |
| `$text-muted` | `rgba(255, 255, 255, 0.6)` | サブテキスト |
| `$glass-bg` | `rgba(255, 255, 255, 0.05)` | グラス背景 |

---

## ミックスイン活用

### ユーティリティミックスイン

```sass
@use '@/styles/mixins' as m

// フレックスボックスセンタリング
.centered-content
  @include m.flex-center()

// 均等配置
.header
  @include m.flex-between()

// 要素の中央配置（absolute）
.modal
  @include m.absolute-center()

// テキスト省略（...）
.truncated-text
  @include m.text-ellipsis()
  max-width: 200px
```

### ホバー効果

```sass
@use '@/styles/mixins' as m

.button
  background: transparent
  
  // hover: hover をサポートするデバイスのみ適用
  @include m.hover()
    background: rgba(255, 255, 255, 0.1)
    transform: scale(1.02)
```

---

## グラスモーフィズム実装パターン

### 基本的なグラスカード

```sass
.glass-card
  background: rgba(255, 255, 255, 0.05)
  backdrop-filter: blur(10px)
  -webkit-backdrop-filter: blur(10px)
  border: 1px solid rgba(255, 255, 255, 0.1)
  border-radius: 16px
```

### グラデーショングロー効果

```sass
.glow-element
  position: relative
  
  &::before
    content: ''
    position: absolute
    inset: -2px
    background: linear-gradient(135deg, #00D9FF, #FF6B9D, #8B5CF6)
    border-radius: inherit
    z-index: -1
    opacity: 0.5
    filter: blur(20px)
```

### カテゴリアイコンスタイル

```sass
@use '@/styles/variables/aurora-theme' as theme

.category-icon
  @include theme.category-style(theme.$category-food)
  // 結果:
  //   background: rgba(251, 146, 60, 0.2)
  //   color: #FB923C
```

---

## コンポーネントスタイルのベストプラクティス

### 1. 変数のインポート順序

```sass
// 1. SASSビルトインモジュール
@use 'sass:math'
@use 'sass:list'

// 2. プロジェクト変数
@use '@/styles/variables' as var
@use '@/styles/variables/aurora-theme' as theme

// 3. ミックスイン
@use '@/styles/mixins' as m
```

### 2. CSS Module構造

```sass
// ComponentName.module.sass

// コンテナ
.container
  padding: 16px
  
  // ネストは2階層まで
  .header
    @include m.flex-between()
    
    .title
      font-weight: 600
```

### 3. レスポンシブ対応

```sass
@use '@/styles/mixins' as m

.container
  padding: 16px
  
  @include m.sp()
    padding: 12px
    
  @include m.tablet()
    padding: 24px
```

---

## アニメーションパターン

### フェードイン

```sass
@keyframes fadeIn
  from
    opacity: 0
    transform: translateY(10px)
  to
    opacity: 1
    transform: translateY(0)

.animated-element
  animation: fadeIn 0.3s ease-out
```

### スケールホバー

```sass
.interactive-card
  transition: transform 0.2s ease, box-shadow 0.2s ease
  
  @include m.hover()
    transform: translateY(-4px)
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3)
```

---

## チェックリスト

| カテゴリ | チェック項目 |
|---------|-------------|
| **変数** | ハードコードされた色がないか |
| **変数** | Aurora Glassテーマを適切に使用しているか |
| **ミックスイン** | flex-center などを活用しているか |
| **グラス** | backdrop-filter に webkit プレフィックスがあるか |
| **構造** | ネストが3階層以上になっていないか |
| **レスポンシブ** | メディアクエリミックスインを使用しているか |
