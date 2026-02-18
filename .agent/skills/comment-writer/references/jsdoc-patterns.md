# JSDoc パターンガイド

TypeScript/React プロジェクトでの JSDoc コメントの詳細パターン。

---

## 基本タグ一覧

| タグ | 用途 |
|------|------|
| `@param` | 引数の説明 |
| `@returns` | 戻り値の説明 |
| `@throws` | 例外の説明 |
| `@example` | 使用例 |
| `@description` | 詳細説明 |
| `@deprecated` | 非推奨マーク |
| `@see` | 関連リンク |
| `@since` | 追加バージョン |

---

## 関数のパターン

### シンプルな関数

```typescript
/**
 * 金額を日本円形式でフォーマットする
 * @param amount - フォーマットする金額
 * @returns ¥記号付きのカンマ区切り文字列
 * @example
 * formatCurrency(1000) // "¥1,000"
 */
export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('ja-JP')}`
}
```

### 複数引数

```typescript
/**
 * 日付を指定フォーマットで文字列に変換する
 * @param date - 変換対象の日付
 * @param format - 出力フォーマット（デフォルト: 'YYYY-MM-DD'）
 * @param locale - ロケール設定（デフォルト: 'ja-JP'）
 * @returns フォーマット済み日付文字列
 */
export const formatDate = (
  date: Date,
  format: string = 'YYYY-MM-DD',
  locale: string = 'ja-JP'
): string => { ... }
```

### 例外を投げる関数

```typescript
/**
 * ユーザーIDからユーザー情報を取得する
 * @param userId - 検索対象のユーザーID
 * @returns ユーザー情報オブジェクト
 * @throws {NotFoundError} ユーザーが見つからない場合
 * @throws {NetworkError} APIリクエストが失敗した場合
 */
export const fetchUser = async (userId: string): Promise<User> => { ... }
```

### ジェネリック関数

```typescript
/**
 * 配列から重複を除去する
 * @template T - 配列要素の型
 * @param items - 重複を含む可能性のある配列
 * @param keyFn - 重複判定に使用するキー取得関数（省略時は要素自体を比較）
 * @returns 重複を除去した新しい配列
 */
export const unique = <T>(
  items: T[],
  keyFn?: (item: T) => unknown
): T[] => { ... }
```

---

## React コンポーネントのパターン

### Props インターフェース

```typescript
/**
 * トランザクション入力フォームのProps
 */
interface TransactionFormProps {
  /** フォーム送信時のコールバック */
  onSubmit: (data: TransactionInput) => Promise<void>
  /** キャンセル時のコールバック */
  onCancel?: () => void
  /** 編集モード時の初期値（新規作成時はundefined） */
  initialData?: Transaction
  /** ローディング状態 */
  isLoading?: boolean
}
```

### コンポーネント本体

```typescript
/**
 * トランザクション入力用フォームコンポーネント
 * @description 収入・支出の登録および編集に使用
 * 金額、カテゴリ、日付、メモの入力をサポート
 */
export const TransactionForm: FC<TransactionFormProps> = memo(({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => { ... })
```

### カスタムフック

```typescript
/**
 * トランザクションデータを管理するカスタムフック
 * @description CRUD操作とフィルタリング機能を提供
 * @returns トランザクション管理用のステートと関数
 *
 * @example
 * const {
 *   transactions,
 *   addTransaction,
 *   deleteTransaction,
 *   filterByCategory,
 * } = useTransactions()
 */
export const useTransactions = (): UseTransactionsReturn => { ... }
```

---

## 型定義のパターン

### インターフェース

```typescript
/**
 * トランザクション（収支記録）を表すインターフェース
 * @description アプリケーション全体で使用される中核的なデータ型
 */
export interface Transaction {
  /** 一意識別子（UUID形式） */
  id: string
  /** 金額（正数: 収入、負数: 支出） */
  amount: number
  /** カテゴリID（CATEGORIESの定義を参照） */
  categoryId: string
  /** 取引日時 */
  date: Date
  /** ユーザー入力のメモ（任意） */
  memo?: string
  /** 作成日時（自動設定） */
  createdAt: Date
  /** 更新日時（自動設定） */
  updatedAt: Date
}
```

### 型エイリアス

```typescript
/**
 * トランザクションの種類
 * - 'income': 収入
 * - 'expense': 支出
 */
export type TransactionType = 'income' | 'expense'

/**
 * APIレスポンスのラッパー型
 * @template T - レスポンスデータの型
 */
export type ApiResponse<T> = {
  /** 成功フラグ */
  success: boolean
  /** レスポンスデータ（成功時のみ） */
  data?: T
  /** エラーメッセージ（失敗時のみ） */
  error?: string
}
```

---

## 非推奨(Deprecated)の記述

```typescript
/**
 * @deprecated v2.0.0で削除予定。代わりに `formatCurrency` を使用してください
 * @see formatCurrency
 */
export const formatMoney = (amount: number): string => { ... }
```

---

## 複雑な関数の例

```typescript
/**
 * 期間内のトランザクションを集計し、カテゴリ別サマリーを生成する
 *
 * @description
 * 指定期間のトランザクションを分析し、以下の情報を含むサマリーを返す:
 * - カテゴリ別の合計金額
 * - 収入・支出の総額
 * - 前期間との比較（オプション）
 *
 * @param transactions - 分析対象のトランザクション配列
 * @param startDate - 集計開始日（この日を含む）
 * @param endDate - 集計終了日（この日を含む）
 * @param options - 追加オプション
 * @param options.includeComparison - 前期間との比較を含めるか
 * @param options.groupBy - グループ化の単位（'day' | 'week' | 'month'）
 *
 * @returns カテゴリ別サマリーオブジェクト
 *
 * @throws {ValidationError} 日付範囲が不正な場合
 *
 * @example
 * const summary = calculateCategorySummary(
 *   transactions,
 *   new Date('2024-01-01'),
 *   new Date('2024-01-31'),
 *   { includeComparison: true, groupBy: 'week' }
 * )
 */
export const calculateCategorySummary = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
  options?: {
    includeComparison?: boolean
    groupBy?: 'day' | 'week' | 'month'
  }
): CategorySummary => { ... }
```
