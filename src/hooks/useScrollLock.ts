import { useEffect } from 'react'

// グローバルカウンタで複数箇所からの使用を管理
let lockCount = 0
let originalOverflow = ''

/**
 * スクロールをロックするカスタムフック
 * 
 * 複数のコンポーネントで同時に使用可能。
 * 全てのロックが解除されるまで overflow: hidden を維持します。
 */
const useScrollLock = () => {
  useEffect(() => {
    // 初回ロック時のみ元のスタイルを保存
    if (lockCount === 0) {
      originalOverflow = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
    }
    lockCount++

    // コンポーネントのアンマウント時にカウントを減らす
    return () => {
      lockCount--
      // 全てのロックが解除されたら元のスタイルに戻す
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [])
}

export default useScrollLock