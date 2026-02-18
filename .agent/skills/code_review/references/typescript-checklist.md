# TypeScript 型定義ベストプラクティス

このドキュメントは、TypeScriptコードレビュー時に確認すべき型定義のベストプラクティスをまとめています。

---

## 🚨 避けるべきパターン

### 1. any 型の乱用

```typescript
// ❌ any型の使用
const handleData = (data: any) => {
  return data.value // 型安全性がない
}

// ✅ 適切な型定義
interface DataType {
  value: string
  count: number
}

const handleData = (data: DataType) => {
  return data.value // 型安全
}
```

**any が許容されるケース**:
- 外部ライブラリの型定義がない場合（ただしカスタム型定義を検討）
- 一時的なプロトタイピング（本番コードでは必ず修正）

---

### 2. as による型アサーションの乱用

```typescript
// ❌ 危険な型アサーション
const user = response.data as User // 実際のデータ構造を検証していない

// ✅ 型ガードで安全に
const isUser = (data: unknown): data is User => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  )
}

if (isUser(response.data)) {
  const user = response.data // 型安全
}
```

---

### 3. 非null アサーション (!) の乱用

```typescript
// ❌ 危険な非nullアサーション
const element = document.getElementById('app')!
element.innerHTML = 'Hello' // 実行時エラーの可能性

// ✅ nullチェックを行う
const element = document.getElementById('app')
if (element) {
  element.innerHTML = 'Hello'
}
```

---

## ✅ 推奨パターン

### 1. interface vs type の使い分け

```typescript
// interface: 拡張可能なオブジェクト型に使用
interface User {
  id: string
  name: string
}

interface AdminUser extends User {
  permissions: string[]
}

// type: ユニオン型や複雑な型に使用
type Status = 'pending' | 'success' | 'error'
type UserOrNull = User | null
type AsyncFunction<T> = () => Promise<T>
```

---

### 2. const オブジェクトパターン（enum の代替）

```typescript
// ❌ enum（ツリーシェイキングの問題がある）
enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

// ✅ const オブジェクト（推奨）
export const CATEGORY_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const

export type CategoryType = typeof CATEGORY_TYPES[keyof typeof CATEGORY_TYPES]
// 結果: 'income' | 'expense'
```

---

### 3. ジェネリクスの活用

```typescript
// 汎用的なAPIレスポンス型
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

// 使用例
const fetchUser = async (): Promise<ApiResponse<User>> => {
  // ...
}

// 汎用的なリスト型
interface PaginatedList<T> {
  items: T[]
  total: number
  page: number
  hasMore: boolean
}
```

---

### 4. Props 型の命名規則

```typescript
// コンポーネント名 + Props
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

// 子要素を受け取る場合
interface ContainerProps {
  children: React.ReactNode
  className?: string
}

// イベントハンドラの型
interface FormProps {
  onSubmit: (data: FormData) => void
  onChange?: (field: string, value: string) => void
}
```

---

### 5. オプショナルプロパティとデフォルト値

```typescript
interface ComponentProps {
  required: string        // 必須
  optional?: number       // オプショナル
}

// デフォルト値の設定方法
const Component: FC<ComponentProps> = ({
  required,
  optional = 10,  // デストラクチャリングでデフォルト値
}) => {
  // ...
}
```

---

### 6. Utility Types の活用

```typescript
// Partial: 全てのプロパティをオプショナルに
type UpdateUser = Partial<User>

// Required: 全てのプロパティを必須に
type RequiredUser = Required<User>

// Pick: 特定のプロパティのみ抽出
type UserName = Pick<User, 'name' | 'email'>

// Omit: 特定のプロパティを除外
type UserWithoutId = Omit<User, 'id'>

// Record: キーと値の型を指定
type CategoryMap = Record<CategoryType, string>

// Extract / Exclude: ユニオン型の操作
type SuccessStatus = Extract<Status, 'success'>
type NonPendingStatus = Exclude<Status, 'pending'>
```

---

### 7. 厳格なnullチェック

```typescript
// Optional chaining
const userName = user?.profile?.name

// Nullish coalescing
const displayName = user?.name ?? 'Anonymous'

// 型の絞り込み
const processUser = (user: User | null) => {
  if (!user) {
    return 'No user'
  }
  // ここでは user は User 型
  return user.name
}
```

---

## レビュー時のクイックチェック

| カテゴリ | チェック項目 |
|---------|-------------|
| **基本** | `any` 型を使用していないか |
| **基本** | 型アサーション (`as`) を乱用していないか |
| **基本** | 非nullアサーション (`!`) を乱用していないか |
| **設計** | interface と type を適切に使い分けているか |
| **設計** | enum の代わりに const オブジェクトを使っているか |
| **命名** | Props型は `コンポーネント名Props` になっているか |
| **活用** | Utility Types を適切に活用しているか |
| **安全性** | Optional chaining で nullチェックしているか |
| **再利用** | ジェネリクスで汎用性を持たせているか |
