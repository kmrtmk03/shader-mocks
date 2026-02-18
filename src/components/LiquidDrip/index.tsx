/**
 * LiquidDrip メインコンポーネント
 *
 * R3F の Canvas を配置し、液体垂れエフェクトのシーンを描画する
 * Canvas は sticky で 100vh に固定し、スクロール位置をシェーダーに渡す
 */
import { useRef, useCallback, useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Canvas } from '@react-three/fiber'
import LiquidDripMesh from './LiquidDripMesh'
import styles from './LiquidDrip.module.sass'

const LiquidDrip = (): ReactElement => {
  // コンテナ要素の参照
  const containerRef = useRef<HTMLElement>(null)
  // スクロール進捗（0.0〜1.0）
  const [scrollProgress, setScrollProgress] = useState(0)

  /**
   * スクロール位置を計算するハンドラー
   * コンテナのスクロール範囲に対する現在位置の割合を算出
   */
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    // コンテナの上端がビューポートの上に来た量
    const scrolled = -rect.top
    // スクロール可能な範囲（コンテナ高さ - ビューポート高さ）
    const scrollable = containerRef.current.offsetHeight - window.innerHeight
    // 0〜1 にクランプ
    const progress = Math.max(0, Math.min(1, scrolled / scrollable))
    setScrollProgress(progress)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初期値を設定
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <section ref={containerRef} className={styles.container}>
      {/* Canvas は sticky で常にビューポートに固定（解像度維持） */}
      <div className={styles.canvasWrapper}>
        <Canvas
          orthographic
          camera={{
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            near: 0.1,
            far: 10,
            position: [0, 0, 1],
          }}
          dpr={[1, 2]}
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
          }}
        >
          {/* スクロール進捗をメッシュに渡す */}
          <LiquidDripMesh scrollProgress={scrollProgress} />
        </Canvas>
      </div>
    </section>
  )
}

export default LiquidDrip
