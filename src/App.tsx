import './App.sass'
import type { ReactElement } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LiquidDrip from './components/LiquidDrip'

function App(): ReactElement {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<h1>App</h1>} />
          {/* 液体垂れエフェクトページ */}
          <Route path="/liquid" element={<LiquidDrip />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
