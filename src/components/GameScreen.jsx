import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useMultiplayer } from '../hooks/useMultiplayer'
import Countdown from './Countdown'
import HUD from './HUD'
import GameGrid from './GameGrid'
import MultiplayerPanel from './MultiplayerPanel'
import styles from './GameScreen.module.css'

export default function GameScreen() {
  const navigate = useNavigate()
  const {
    gamePhase, playerName, selectedMode, gridSize,
    roomCode, inRoom, sequence, currentIndex,
    startPlaying, initGame,
  } = useGameStore()

  // Redirect if game not initialized
  useEffect(() => {
    if (gamePhase === 'idle') navigate('/', { replace: true })
  }, [])

  // Navigate to result when done
  useEffect(() => {
    if (gamePhase === 'finished') {
      setTimeout(() => navigate('/result'), 400)
    }
  }, [gamePhase, navigate])

  const peers = useMultiplayer(inRoom, sequence.length, gamePhase)

  const handleCountdownDone = useCallback(() => {
    startPlaying()
  }, [startPlaying])

  const modeLabels = {
    normal:  'NORMAL',
    reverse: 'REVERSE',
    even:    'EVEN ONLY',
    odd:     'ODD ONLY',
  }

  return (
    <motion.div
      className={styles.screen}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Countdown overlay */}
      <AnimatePresence>
        {gamePhase === 'countdown' && (
          <Countdown onComplete={handleCountdownDone} />
        )}
      </AnimatePresence>

      <div className={styles.layout}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.playerTag}>
            <span className={styles.playerName}>{playerName}</span>
          </div>

          <div className={styles.rightRow}>
            <span className={styles.modeBadge}>{modeLabels[selectedMode]}</span>
            <span className={styles.sizeBadge}>{gridSize}×{gridSize}</span>
            <button className={styles.backBtn} onClick={() => navigate('/')}>
              ← Back
            </button>
          </div>
        </div>

        {/* HUD */}
        <HUD />

        {/* Progress — count only, never shows which number is next */}
        {gamePhase === 'playing' && (
          <div className={styles.progressRow}>
            <span className={styles.progressLabel}>
              <strong>{currentIndex}</strong> / {sequence.length} found
            </span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(currentIndex / sequence.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Grid */}
        <GameGrid />

        {/* Multiplayer */}
        {inRoom && peers.length > 0 && (
          <MultiplayerPanel
            roomCode={roomCode}
            peers={peers}
            myProgress={currentIndex}
            myTotal={sequence.length}
            playerName={playerName}
          />
        )}

        {/* Restart */}
        <button className={styles.restartBtn} onClick={() => { initGame() }}>
          New game
        </button>
      </div>
    </motion.div>
  )
}
