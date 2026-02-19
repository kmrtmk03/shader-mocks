import { motion } from 'framer-motion'
import type { ReactElement } from 'react'
import './ImageSlide.sass'

/**
 * アニメーション設定の定数
 * クリームがゆっくりと垂れる表現を制御します。
 */
const SLIDE_ANIMATION_CONFIG = {
  initial: { y: '-100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: {
    duration: 5, // 5秒かけてゆっくりと下降
    ease: 'easeOut', // 自然な減速感
  },
} as const

/**
 * ImageSlide コンポーネント
 * 
 * ページ読み込み時に、画面上部から画像がスライドして表示される演出を提供します。
 * 背景のUI操作を妨げないよう、コンテナには pointer-events: none を設定しています。
 * 
 * @returns {ReactElement} スライドアニメーションを含む画像要素
 */
const ImageSlide = (): ReactElement => {
  return (
    <div className="image-slide-container">
      <motion.img
        src="/images/green_removed_transparent.png"
        alt="Cream Slide Effect"
        className="sliding-image"
        initial={SLIDE_ANIMATION_CONFIG.initial}
        animate={SLIDE_ANIMATION_CONFIG.animate}
        transition={SLIDE_ANIMATION_CONFIG.transition}
      />
    </div>
  )
}

export default ImageSlide
