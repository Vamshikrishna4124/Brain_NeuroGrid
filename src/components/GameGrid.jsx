import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import styles from './GameGrid.module.css'

export default function GameGrid() {
  const { grid, sequence, currentIndex, gamePhase, gridSize, clickCell } = useGameStore()

  const handleClick = useCallback((num) => {
    if (gamePhase !== 'playing') return
    clickCell(num)
  }, [gamePhase, clickCell])

  const fontSize =
    gridSize <= 3 ? 24 :
    gridSize <= 4 ? 20 :
    gridSize <= 5 ? 17 :
    gridSize <= 6 ? 15 :
    gridSize <= 7 ? 13 :
    gridSize <= 8 ? 12 :
    gridSize <= 9 ? 11 : 10

  const gap =
    gridSize <= 5 ? 6 :
    gridSize <= 7 ? 5 : 4

  const inSequence = new Set(sequence)
  const currentTarget = sequence[currentIndex]

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {grid.map((num) => {
        const isInSeq = inSequence.has(num)
        const isTarget = num === currentTarget && gamePhase === 'playing'

        return (
          <motion.button
            key={num}
            className={`${styles.cell} ${!isInSeq ? styles.ghost : ''}`}
            style={{ fontSize: `${fontSize}px` }}
            onClick={() => handleClick(num)}
            whileTap={isInSeq ? { scale: 0.88 } : {}}
            disabled={!isInSeq}
          >
            {/* Faint center dot on current target only — position hint, not a cheat */}
            {isTarget && <span className={styles.centerDot} aria-hidden="true" />}
            <span className={styles.numLabel}>{num}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
