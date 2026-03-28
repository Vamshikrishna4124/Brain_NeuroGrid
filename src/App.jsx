import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HomeScreen from './components/HomeScreen'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'
import BackgroundBlobs from './components/BackgroundBlobs'

export default function App() {
  return (
    <>
      <BackgroundBlobs />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/result" element={<ResultScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
