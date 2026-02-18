# React パターン＆アンチパターン チェックリスト

このドキュメントは、Reactコードレビュー時に確認すべきパターンとアンチパターンをまとめています。

---

## 🚨 アンチパターン（避けるべき）

### 1. useEffect の依存配列の問題

```typescript
// ❌ 依存配列の欠落
useEffect(() => {
  fetchData(userId)
}, []) // userIdが依存配列にない

// ✅ 正しい依存配列
useEffect(() => {
  fetchData(userId)
}, [userId])
```

**チェックポイント**:
- [ ] 依存配列に使用している全ての変数が含まれているか
- [ ] ESLint の `react-hooks/exhaustive-deps` 警告を無視していないか

---

### 2. 無限ループを引き起こす useEffect

```typescript
// ❌ オブジェクト/配列を依存配列に直接渡す
useEffect(() => {
  setData({ ...data, updated: true })
}, [data]) // 毎回新しい参照で無限ループ

// ✅ 特定のプロパティのみ依存
useEffect(() => {
  setData(prev => ({ ...prev, updated: true }))
}, [data.id])
```

---

### 3. クリーンアップ関数の欠落

```typescript
// ❌ クリーンアップなし
useEffect(() => {
  const subscription = api.subscribe(handleData)
  // クリーンアップがない → メモリリーク
}, [])

// ✅ クリーンアップあり
useEffect(() => {
  const subscription = api.subscribe(handleData)
  return () => subscription.unsubscribe()
}, [])
```

**チェックポイント**:
- [ ] イベントリスナー、タイマー、購読はクリーンアップされているか
- [ ] 非同期処理のキャンセル処理があるか

---

### 4. 不要な再レンダリング

```typescript
// ❌ インラインでオブジェクト/関数を渡す
<ChildComponent style={{ color: 'red' }} onClick={() => handleClick()} />

// ✅ useMemo/useCallback でメモ化
const style = useMemo(() => ({ color: 'red' }), [])
const handleClickMemo = useCallback(() => handleClick(), [])
<ChildComponent style={style} onClick={handleClickMemo} />
```

**チェックポイント**:
- [ ] 子コンポーネントが `memo` でラップされている場合、propsがメモ化されているか
- [ ] 高頻度で再レンダリングされるコンポーネントで最適化が行われているか

---

### 5. 条件付きフックの使用

```typescript
// ❌ 条件文内でフックを使用
if (isLoggedIn) {
  const [user, setUser] = useState(null) // エラー！
}

// ✅ フックは常にトップレベルで呼び出す
const [user, setUser] = useState(null)
useEffect(() => {
  if (isLoggedIn) {
    fetchUser()
  }
}, [isLoggedIn])
```

---

### 6. 直接的な状態変更

```typescript
// ❌ 状態を直接変更
const handleAdd = () => {
  items.push(newItem) // 直接変更
  setItems(items)
}

// ✅ 新しい配列/オブジェクトを作成
const handleAdd = () => {
  setItems([...items, newItem])
}
```

---

### 7. Props Drilling

```typescript
// ❌ 深いPropsの受け渡し
<Parent user={user}>
  <Child user={user}>
    <GrandChild user={user}>
      <GreatGrandChild user={user} />
    </GrandChild>
  </Child>
</Parent>

// ✅ Context API を使用
const UserContext = createContext<User | null>(null)

<UserContext.Provider value={user}>
  <Parent>
    <Child>
      <GrandChild>
        <GreatGrandChild /> {/* useContext(UserContext) で取得 */}
      </GrandChild>
    </Child>
  </Parent>
</UserContext.Provider>
```

---

## ✅ 推奨パターン

### 1. カスタムフックによるロジック分離

```typescript
// ビジネスロジックをカスタムフックに抽出
const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const addTransaction = useCallback(async (data: TransactionInput) => {
    // 追加ロジック
  }, [])
  
  return { transactions, isLoading, addTransaction }
}

// コンポーネントはUIのみに集中
const TransactionList: FC = () => {
  const { transactions, isLoading } = useTransactions()
  
  if (isLoading) return <Loading />
  return <List items={transactions} />
}
```

---

### 2. コンポーネントの適切な分割

**分割の目安**:
- 150行を超えたら分割を検討
- 複数の責務を持っている場合は分割
- 再利用可能な部分は抽出

---

### 3. 早期リターンパターン

```typescript
// ✅ 早期リターンで可読性向上
const UserProfile: FC<Props> = ({ user, isLoading, error }) => {
  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />
  if (!user) return <NotFound />
  
  return <Profile user={user} />
}
```

---

## レビュー時のクイックチェック

| カテゴリ | チェック項目 |
|---------|-------------|
| **Hooks** | 依存配列は正しいか |
| **Hooks** | クリーンアップ処理があるか |
| **Hooks** | 条件文内で使用していないか |
| **パフォーマンス** | 不要な再レンダリングがないか |
| **パフォーマンス** | memo/useMemo/useCallbackは適切か |
| **状態管理** | 状態を直接変更していないか |
| **設計** | Props Drillingが深くないか |
| **設計** | コンポーネントは適切に分割されているか |
