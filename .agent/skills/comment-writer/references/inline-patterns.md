# インラインコメントパターンガイド

コード内で使用するインラインコメントの詳細パターン。

---

## 基本原則

1. **「なぜ」を説明**: コードが何をしているかではなく、なぜそうしているか
2. **簡潔に**: 1行で収まるように
3. **コードと同期**: コード変更時は必ずコメントも更新

---

## コメントの種類

### セクション区切り

大きな処理ブロックを区切る場合に使用。

```typescript
// ============================
// 状態管理
// ============================
const [items, setItems] = useState<Item[]>([])
const [isLoading, setIsLoading] = useState(false)

// ============================
// イベントハンドラ
// ============================
const handleSubmit = () => { ... }
const handleCancel = () => { ... }

// ============================
// 副作用
// ============================
useEffect(() => { ... }, [])
```

### 処理の説明

複雑なロジックの意図を説明。

```typescript
// 日付でソートし、最新の5件のみ取得
const recentItems = items
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 5)

// 税込価格を計算（消費税10%）
const priceWithTax = Math.floor(price * 1.1)

// 配列を2次元配列に変換（3要素ずつのグループに分割）
const chunks = chunkArray(items, 3)
```

### 条件分岐の理由

なぜその条件が必要かを説明。

```typescript
// nullチェック: APIレスポンスが空の場合がある
if (!data) return null

// 日本の法律上、20歳未満はアルコール購入不可
if (user.age < 20) {
  throw new ValidationError('年齢制限')
}

// 空配列の場合は早期リターンでパフォーマンス向上
if (items.length === 0) return []
```

### TODO / FIXME

将来の改善点やバグを記録。

```typescript
// TODO: パフォーマンス改善のためメモ化を検討
// TODO(2024-06): v2.0リリース後に削除
// FIXME: 大量データ時にメモリリークの可能性あり
// HACK: ライブラリのバグ回避策（issue #123 参照）
```

### NOTE / WARNING

特に注意が必要な箇所を明示。

```typescript
// NOTE: この関数はレンダリングごとに呼ばれるため軽量に保つ
// WARNING: この変更はDBマイグレーションが必要
// IMPORTANT: 本番環境では必ず環境変数を設定すること
```

---

## React 特有のパターン

### useEffect

```typescript
// 初回マウント時にデータを取得
useEffect(() => {
  fetchData()
}, [])

// ユーザーIDが変更されたら再取得
useEffect(() => {
  if (userId) {
    fetchUserData(userId)
  }
}, [userId])

// クリーンアップ: タイマーの解除
useEffect(() => {
  const timer = setInterval(tick, 1000)
  return () => clearInterval(timer) // アンマウント時に解除
}, [])
```

### useMemo / useCallback

```typescript
// 計算コストが高いため、依存値が変わらない限りキャッシュ
const expensiveResult = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// 子コンポーネントに渡すためメモ化（不要な再レンダリング防止）
const handleClick = useCallback(() => {
  // ...
}, [dependency])
```

### 条件付きレンダリング

```typescript
return (
  <div>
    {/* ローディング中はスピナーを表示 */}
    {isLoading && <Spinner />}
    
    {/* データがある場合のみリストを表示 */}
    {data && data.length > 0 && (
      <List items={data} />
    )}
    
    {/* エラー時はエラーメッセージを表示 */}
    {error && <ErrorMessage message={error} />}
  </div>
)
```

---

## SASS/SCSS 特有のパターン

### 変数定義

```sass
// ============================
// カラーパレット
// デザインシステムの基本色定義
// ============================

// プライマリカラー（ブランドカラー）
$color-primary: #6366f1
$color-primary-light: lighten($color-primary, 10%)
$color-primary-dark: darken($color-primary, 10%)

// セマンティックカラー（意味を持つ色）
$color-success: #10b981  // 成功・完了
$color-warning: #f59e0b  // 警告・注意
$color-error: #ef4444    // エラー・削除
```

### ミックスイン

```sass
// フレックスボックスで中央配置するミックスイン
// 使用例: +flex-center
=flex-center
  display: flex
  justify-content: center
  align-items: center

// レスポンシブブレイクポイント
// 引数: ブレイクポイントの最小幅
=responsive($breakpoint)
  @media (min-width: $breakpoint)
    @content
```

### コンポーネントスタイル

```sass
.card
  // ベーススタイル
  padding: $spacing-md
  border-radius: $radius-lg
  
  // グラスモーフィズム効果
  // 背景をぼかして奥行きを表現
  +glass-effect
  
  // ホバー時のインタラクション
  // ユーザーにクリック可能であることを示す
  &:hover
    transform: translateY(-2px)
    box-shadow: $shadow-lg
  
  // 内部要素のスタイル
  &__title
    font-size: $font-size-lg
    font-weight: bold
    
  &__content
    margin-top: $spacing-sm
```

---

## HTML コメントパターン

```html
<!-- ヘッダーエリア -->
<header>...</header>

<!-- 
  メインコンテンツ
  - 商品一覧
  - フィルター機能
  - ページネーション
-->
<main>
  <!-- 検索・フィルターセクション -->
  <section class="filters">...</section>
  
  <!-- 商品グリッド -->
  <section class="products">...</section>
  
  <!-- ページネーション -->
  <nav class="pagination">...</nav>
</main>

<!-- フッターエリア -->
<footer>...</footer>
```

---

## 避けるべきコメント

```typescript
// ❌ 自明なコードへのコメント
// 変数iを1増やす
i++

// ❌ コードをそのまま言い換える
// userがnullでなければ
if (user !== null) { ... }

// ❌ 古い・嘘のコメント
// ユーザー名を取得（実際はメールアドレスを取得している）
const email = getEmail()

// ❌ コメントアウトされたコード（削除すべき）
// const oldFunction = () => { ... }
```

---

## コメント追加のチェックリスト

- [ ] コードだけで意図が伝わらない箇所にコメントがあるか
- [ ] 「なぜ」を説明しているか（「何」ではなく）
- [ ] 簡潔か（冗長になっていないか）
- [ ] コードと同期しているか（古いコメントがないか）
- [ ] 自明なコードに不要なコメントがないか
