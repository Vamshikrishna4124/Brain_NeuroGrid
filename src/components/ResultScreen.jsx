import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore, getRank, calcScore } from '../store/gameStore'
import { useMultiplayer } from '../hooks/useMultiplayer'
import { useConfetti } from '../hooks/useConfetti'
import styles from './ResultScreen.module.css'

const AVATAR_COLORS = [
  { bg: '#7c3aed', fg: '#e9d5ff' },
  { bg: '#4f46e5', fg: '#e0e7ff' },
  { bg: '#0891b2', fg: '#cffafe' },
  { bg: '#16a34a', fg: '#dcfce7' },
  { bg: '#d97706', fg: '#fef3c7' },
  { bg: '#db2777', fg: '#fce7f3' },
]

function initials(name) {
  return name.slice(0, 2).toUpperCase()
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 300 } },
}

export default function ResultScreen() {
  const navigate = useNavigate()
  const spawnConfetti = useConfetti()

  const {
    startTime, endTime, gridSize, selectedMode, playerName,
    bestTimes, allTimes, currentStreak, longestStreak, totalGames,
    inRoom, roomCode, sequence,
    initGame,
  } = useGameStore()

  const peers = useMultiplayer(inRoom, sequence.length, 'playing')

  const ms = startTime && endTime ? endTime - startTime : 0
  const secs = ms ? (ms / 1000).toFixed(2) : '—'
  const rank = getRank(ms, gridSize)
  const score = ms ? calcScore(ms, gridSize) : 0

  const key = `${gridSize}-${selectedMode}`
  const best = bestTimes[key]
  const avg = allTimes.length
    ? (allTimes.reduce((a, b) => a + b, 0) / allTimes.length / 1000).toFixed(2)
    : '—'

  const isNewBest = best === ms && allTimes.length > 0

  // Confetti on expert
  useEffect(() => {
    if (!ms) { navigate('/', { replace: true }); return }
    if (rank.cls === 'expert') spawnConfetti(100)
    else if (rank.cls === 'pro') spawnConfetti(50)
  }, [])

  // Build leaderboard with simulated peers
  const lbEntries = [
    { name: playerName, time: ms, me: true, avatarIdx: 0 },
    ...peers
      .filter(p => p.done && p.finishTime)
      .map((p, i) => ({ name: p.name, time: p.finishTime, me: false, avatarIdx: i + 1 })),
  ].sort((a, b) => a.time - b.time)

  function handlePlayAgain() {
    initGame()
    navigate('/game')
  }

  return (
    <motion.div
      className={styles.screen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.inner}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Main result card */}
        <motion.div variants={item} className={styles.resultCard}>
          <div className={`${styles.rankBadge} ${styles[`rank_${rank.cls}`]}`}>
            {rank.label.toUpperCase()}
          </div>

          {isNewBest && (
            <div className={styles.newBest}>NEW BEST</div>
          )}

          <div className={styles.timeDisplay}>
            <span className={styles.timeSecs}>{secs}</span>
            <span className={styles.timeUnit}>s</span>
          </div>

          <div className={styles.scoreRow}>
            Brain Score: <strong>{score.toLocaleString()}</strong>
          </div>

          {/* Stats row */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statVal}>
                {best ? `${(best / 1000).toFixed(2)}s` : secs + 's'}
              </div>
              <div className={styles.statLbl}>Best</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statVal}>{avg}s</div>
              <div className={styles.statLbl}>Avg</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statVal}>{currentStreak}</div>
              <div className={styles.statLbl}>Streak</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <div className={styles.statVal}>{totalGames}</div>
              <div className={styles.statLbl}>Games</div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard (multiplayer) */}
        {inRoom && lbEntries.length > 1 && (
          <motion.div variants={item} className={styles.lbCard}>
            <div className={styles.lbHeader}>
              Room <span className={styles.lbRoom}>{roomCode}</span>
            </div>
            {lbEntries.map((e, i) => (
              <div key={e.name + i} className={`${styles.lbRow} ${e.me ? styles.lbMe : ''}`}>
                <span className={`${styles.lbPos} ${i === 0 ? styles.lbGold : ''}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div
                  className={styles.lbAvatar}
                  style={{
                    background: AVATAR_COLORS[e.avatarIdx % AVATAR_COLORS.length].bg,
                    color: AVATAR_COLORS[e.avatarIdx % AVATAR_COLORS.length].fg,
                  }}
                >
                  {initials(e.name)}
                </div>
                <span className={styles.lbName}>
                  {e.name}{e.me && <span className={styles.youTag}>you</span>}
                </span>
                <span className={`${styles.lbTime} ${i === 0 ? styles.lbBest : ''}`}>
                  {(e.time / 1000).toFixed(2)}s
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Rank info */}
        <motion.div variants={item} className={styles.rankInfo}>
          <div className={styles.rankInfoTitle}>Rank thresholds for {gridSize}×{gridSize}</div>
          <div className={styles.rankInfoRow}>
            {[
              { label: 'Expert',      cls: 'expert' },
              { label: 'Pro',         cls: 'pro' },
              { label: 'Intermediate',cls: 'intermediate' },
              { label: 'Beginner',    cls: 'beginner' },
            ].map(r => (
              <span
                key={r.cls}
                className={`${styles.rankPill} ${styles[`rp_${r.cls}`]} ${rank.cls === r.cls ? styles.rankPillActive : ''}`}
              >
                {r.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={item} className={styles.actions}>
          <motion.button
            className={styles.btnPrimary}
            onClick={handlePlayAgain}
            whileHover={{ scale: 1.03, boxShadow: '0 0 50px rgba(124,58,237,0.5)' }}
            whileTap={{ scale: 0.97 }}
          >
            Play again
          </motion.button>
          <motion.button
            className={styles.btnSecondary}
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Home
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
