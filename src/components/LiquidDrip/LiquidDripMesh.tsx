/**
 * LiquidDripMesh コンポーネント
 *
 * フルスクリーンクアッドにカスタムシェーダーを適用し、
 * 液体が垂れ落ちるエフェクトを描画するメッシュ
 * スクロール位置に応じて表示領域をオフセットする
 */
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './liquidDripShader'

interface Props {
  /** スクロール進捗（0.0〜1.0） */
  scrollProgress: number
}

const LiquidDripMesh = ({ scrollProgress }: Props) => {
  // シェーダーマテリアルへの参照
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // ビューポートのサイズを取得
  const { size } = useThree()

  /**
   * ユニフォーム変数の初期値を定義
   * useMemo でメモ化し、不要な再生成を防ぐ
   */
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0.0 },
      u_resolution: {
        value: new THREE.Vector2(size.width, size.height),
      },
      // スクロール量（0.0〜1.0）をシェーダーに渡す
      u_scroll: { value: 0.0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  /**
   * フレームごとの更新処理
   * - 経過時間・解像度・スクロール位置をシェーダーに渡す
   */
  useFrame((state) => {
    if (!materialRef.current) return

    // 経過時間を更新
    materialRef.current.uniforms.u_time.value = state.clock.elapsedTime

    // 画面解像度を更新（リサイズ対応）
    materialRef.current.uniforms.u_resolution.value.set(
      state.size.width,
      state.size.height
    )

    // スクロール進捗を更新
    materialRef.current.uniforms.u_scroll.value = scrollProgress
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export default LiquidDripMesh
