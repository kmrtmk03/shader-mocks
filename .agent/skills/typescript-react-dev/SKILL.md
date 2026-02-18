---
name: typescript-react-dev
description: TypeScript、React.js、Next.js、SASS を使用したプログラミングに特化したスキル。コンポーネント設計、カスタムフック、型安全なコード作成をサポートします。
---

# TypeScript React Development Skill

このスキルは、TypeScript、React.js、Next.js、SASSを使用したモダンなフロントエンド開発をサポートします。

## 技術スタック

- **言語**: TypeScript, HTML, SASS/SCSS
- **フレームワーク**: React.js, Next.js
- **状態管理**: React Hooks, Context API
- **スタイリング**: SASS/SCSS Modules

---

## 開発原則

### 1. 型安全性 (Type Safety)

TypeScriptの型システムを最大限に活用します。

```typescript
// ❌ 避けるべき: any型の使用
const handleData = (data: any) => { ... }

// ✅ 推奨: 適切な型定義
interface TransactionData {
  id: string
  amount: number
  category: CategoryType
  date: Date
}

const handleData = (data: TransactionData) => { ... }
```

**型定義のベストプラクティス**:
- `interface` は拡張可能なオブジェクト型に使用
- `type` はユニオン型や複雑な型に使用
- `enum` より `const` オブジェクト + `typeof` を推奨
- ジェネリクスを活用して再利用性を高める

```typescript
// 定数オブジェクトパターン
export const CATEGORY_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const

export type CategoryType = typeof CATEGORY_TYPES[keyof typeof CATEGORY_TYPES]
```

---

### 2. コンポーネント設計 (Component Design)

**単一責任の原則**を守り、コンポーネントを適切に分割します。

#### ディレクトリ構造
```
src/
├── components/          # 再利用可能なUIコンポーネント
│   ├── common/          # 汎用コンポーネント (Button, Input, Card)
│   └── features/        # 機能固有コンポーネント
├── pages/               # ページコンポーネント
├── hooks/               # カスタムフック
├── types/               # 型定義ファイル
├── constants/           # 定数ファイル
├── utils/               # ユーティリティ関数
└── styles/              # SASSスタイル
    ├── _variables.sass  # 変数定義
    ├── _mixins.sass     # ミックスイン
    └── _common.sass     # 共通スタイル
```

#### コンポーネントパターン

```typescript
// コンポーネントの基本構造
import { FC, memo } from 'react'
import styles from './ComponentName.module.sass'

// Props型定義（コンポーネント名 + Props）
interface ComponentNameProps {
  /** ボタンのラベルテキスト */
  label: string
  /** クリック時のコールバック */
  onClick?: () => void
  /** 無効状態 */
  disabled?: boolean
  /** 子要素 */
  children?: React.ReactNode
}

/**
 * コンポーネントの説明
 * @description 役割や使用方法の詳細
 */
export const ComponentName: FC<ComponentNameProps> = memo(({
  label,
  onClick,
  disabled = false,
  children,
}) => {
  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
      {children}
    </div>
  )
})

ComponentName.displayName = 'ComponentName'
```

---

### 3. カスタムフック (Custom Hooks)

ビジネスロジックをコンポーネントから分離し、再利用可能なフックとして抽出します。

#### 命名規則
- ファイル名: `use[機能名].ts` (例: `useTransaction.ts`)
- フック名: `use[機能名]` (例: `useTransaction`)

#### フックパターン

```typescript
import { useState, useCallback, useMemo } from 'react'

// 戻り値の型定義
interface UseTransactionReturn {
  transactions: Transaction[]
  isLoading: boolean
  error: Error | null
  addTransaction: (data: TransactionInput) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

/**
 * トランザクション管理カスタムフック
 * @description トランザクションのCRUD操作を提供
 */
export const useTransaction = (): UseTransactionReturn => {
  // 状態管理
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // メモ化されたコールバック
  const addTransaction = useCallback(async (data: TransactionInput) => {
    setIsLoading(true)
    setError(null)
    try {
      // 処理ロジック
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    // 削除ロジック
  }, [])

  // メモ化された計算値
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [transactions]
  )

  return {
    transactions: sortedTransactions,
    isLoading,
    error,
    addTransaction,
    deleteTransaction,
  }
}
```

---

### 4. SASS スタイリング

#### 変数とミックスインの活用

```sass
// _variables.sass
// カラーパレット
$color-primary: #6366f1
$color-primary-light: lighten($color-primary, 10%)
$color-primary-dark: darken($color-primary, 10%)

// スペーシング
$spacing-xs: 4px
$spacing-sm: 8px
$spacing-md: 16px
$spacing-lg: 24px
$spacing-xl: 32px

// ブレイクポイント
$breakpoint-sm: 640px
$breakpoint-md: 768px
$breakpoint-lg: 1024px

// _mixins.sass
// フレックスボックスセンタリング
=flex-center
  display: flex
  justify-content: center
  align-items: center

// レスポンシブ対応
=responsive($breakpoint)
  @media (min-width: $breakpoint)
    @content

// グラスモーフィズム効果
=glass-effect($opacity: 0.1)
  background: rgba(255, 255, 255, $opacity)
  backdrop-filter: blur(10px)
  border: 1px solid rgba(255, 255, 255, 0.2)
```

#### コンポーネントスタイル

```sass
// ComponentName.module.sass
@import '@/styles/variables'
@import '@/styles/mixins'

.container
  +flex-center
  padding: $spacing-md
  
  +responsive($breakpoint-md)
    padding: $spacing-lg

.button
  +glass-effect
  padding: $spacing-sm $spacing-md
  border-radius: 8px
  color: $color-primary
  cursor: pointer
  transition: all 0.2s ease
  
  &:hover
    background: rgba($color-primary, 0.1)
    transform: translateY(-2px)
  
  &:disabled
    opacity: 0.5
    cursor: not-allowed
```

---

### 5. パフォーマンス最適化

**再レンダリング防止**:

```typescript
import { memo, useMemo, useCallback } from 'react'

// コンポーネントのメモ化
export const ExpensiveComponent = memo(({ data }: Props) => {
  // 重い計算のメモ化
  const processedData = useMemo(() => 
    heavyCalculation(data),
    [data]
  )
  
  // コールバックのメモ化
  const handleClick = useCallback(() => {
    // 処理
  }, [])
  
  return <div>{processedData}</div>
})
```

**コード分割**:

```typescript
import { lazy, Suspense } from 'react'

// 遅延読み込み
const HeavyComponent = lazy(() => import('./HeavyComponent'))

const App = () => (
  <Suspense fallback={<Loading />}>
    <HeavyComponent />
  </Suspense>
)
```

---

### 6. エラーハンドリング

```typescript
// Error Boundary コンポーネント
import { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

---

## 開発フロー

### 1. 新機能実装時のステップ

1. **型定義**: `types/` に必要な型を定義
2. **定数定義**: `constants/` に定数を定義
3. **カスタムフック**: `hooks/` にロジックを実装
4. **コンポーネント**: `components/` にUIを実装
5. **スタイル**: SASS Moduleでスタイリング
6. **ページ統合**: `pages/` で全てを統合

### 2. コードを書く前のチェックリスト

- [ ] 既存のコンポーネントで再利用できるものはないか？
- [ ] 型定義は適切か？
- [ ] カスタムフックに抽出すべきロジックはないか？
- [ ] SASSの変数・ミックスインを活用しているか？
- [ ] アクセシビリティ（a11y）は考慮されているか？

---

## 注意事項

- **日本語コメント**: 複雑なロジックには必ず日本語でコメントを追加
- **型の厳格化**: `any` の使用は最小限に抑える
- **コンポーネント分割**: 1ファイル150行を目安に分割を検討
- **命名規則**: 既存のコードベースの規則に従う
- **インポート順序**: 外部ライブラリ → 内部モジュール → スタイル
