import { useGameStore } from '../store/gameStore'
import { useTimer } from '../hooks/useTimer'
import styles from './HUD.module.css'

function StreakDots({ count }) {
  const max = 7
  return (
    <div className={styles.dots}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`${styles.dot} ${i < count ? styles.dotLit : ''}`} />
      ))}
    </div>
  )
}

export default function HUD() {
  const {
    startTime, gamePhase, gridSize, selectedMode,
    bestTimes, allTimes, currentStreak,
  } = useGameStore()

  const elapsed = useTimer(startTime, gamePhase === 'playing' && !!startTime)

  const key = `${gridSize}-${selectedMode}`
  const best = bestTimes[key]
  const avg = allTimes.length
    ? Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)
    : null

  const elapsedSec = startTime ? (elapsed / 1000).toFixed(1) : '0.0'

  return (
    <div className={styles.hud}>
      <div className={styles.card}>
        <div className={`${styles.val} ${styles.accent}`}>{elapsedSec}s</div>
        <div className={styles.lbl}>Time</div>
      </div>

      <div className={styles.card}>
        <div className={`${styles.val} ${styles.green}`}>
          {best ? `${(best / 1000).toFixed(2)}s` : '—'}
        </div>
        <div className={styles.lbl}>Best</div>
      </div>

      <div className={styles.card}>
        <div className={styles.val}>
          {avg ? `${(avg / 1000).toFixed(2)}s` : '—'}
        </div>
        <div className={styles.lbl}>Avg</div>
      </div>

      <div className={styles.card}>
        <StreakDots count={currentStreak} />
        <div className={styles.lbl}>Streak ×{currentStreak}</div>
      </div>
    </div>
  )
}
