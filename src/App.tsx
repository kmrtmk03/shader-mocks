import './App.sass'
import type { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import ImageSlide from './components/ImageSlide'

/**
 * App メインコンポーネント
 * ルーティングとグローバルな演出コンポーネントを管理します。
 */
function App(): ReactElement {
  return (
    <BrowserRouter>
      <main>
        {/* 全ページ共通のスライドアニメーション演出 */}
        <ImageSlide />
      </main>
    </BrowserRouter>
  )
}

export default App
