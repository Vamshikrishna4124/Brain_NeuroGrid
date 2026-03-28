import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDailyChallenge, getTodayKey, formatDateKey } from '../hooks/useDailyChallenge'
import { useGameStore, getRank, calcScore } from '../store/gameStore'
import { useTimer } from '../hooks/useTimer'
import { useConfetti } from '../hooks/useConfetti'
import Countdown from './Countdown'
import styles from './DailyChallenge.module.css'

const STORAGE_KEY = 'neurogrid-daily'

function loadDailyRecord() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveDailyRecord(record) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export default function DailyChallenge({ onBack }) {
  const { playerName } = useGameStore()
  const spawnConfetti = useConfetti()

  const daily = getDailyChallenge()
  const todayKey = getTodayKey()
  const record = loadDailyRecord()
  const todayRecord = record[todayKey]

  // Game state
  const [phase, setPhase] = useState('countdown') // countdown | playing | done
  const [doneSet, setDoneSet] = useState(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [alreadyDone] = useState(!!todayRecord)

  const sequence = Array.from({ length: daily.gridSize * daily.gridSize }, (_, i) => i + 1)
  const elapsed = useTimer(startTime, phase === 'playing' && !!startTime)

  const handleCountdownDone = useCallback(() => {
    setPhase('playing')
  }, [])

  const handleClick = useCallback((num) => {
    if (phase !== 'playing') return
    if (doneSet.has(num)) return
    if (num !== sequence[currentIndex]) return // silent wrong

    const now = Date.now()
    const newStart = startTime || now
    if (!startTime) setStartTime(newStart)

    const newDone = new Set(doneSet)
    newDone.add(num)
    const newIdx = currentIndex + 1

    setDoneSet(newDone)

    if (newIdx >= sequence.length) {
      const ms = now - newStart
      setEndTime(now)
      setPhase('done')

      // Save record
      const newRecord = { ...record }
      newRecord[todayKey] = {
        ms,
        player: playerName || 'Player',
        rank: getRank(ms, daily.gridSize).cls,
        score: calcScore(ms, daily.gridSize),
      }
      saveDailyRecord(newRecord)

      const rank = getRank(ms, daily.gridSize)
      if (rank.cls === 'expert') spawnConfetti(100)
      else if (rank.cls === 'pro') spawnConfetti(50)
    } else {
      setCurrentIndex(newIdx)
      if (!startTime) setStartTime(newStart)
    }
  }, [phase, doneSet, currentIndex, startTime, sequence, record, todayKey, playerName, daily.gridSize, spawnConfetti])

  const ms = startTime && endTime ? endTime - startTime : 0
  const rank = ms ? getRank(ms, daily.gridSize) : null
  const score = ms ? calcScore(ms, daily.gridSize) : 0
  const elapsedSec = startTime ? (elapsed / 1000).toFixed(1) : '0.0'

  const fontSize = 18
  const gap = 8

  // If already completed today — show previous result
  if (alreadyDone) {
    const prev = todayRecord
    const prevRank = getRank(prev.ms, daily.gridSize)
    return (
      <motion.div className={styles.screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className={styles.inner}>
          <button className={styles.backBtn} onClick={onBack}>← Back</button>

          <div className={styles.dateTag}>{formatDateKey(todayKey)}</div>
          <h2 className={styles.title}>DAILY CHALLENGE</h2>
          <p className={styles.sub}>You already completed today's challenge!</p>

          <div className={styles.doneCard}>
            <div className={`${styles.rankBadge} ${styles[`rank_${prevRank.cls}`]}`}>
              {prevRank.label.toUpperCase()}
            </div>
            <div className={styles.bigTime}>{(prev.ms / 1000).toFixed(2)}<span>s</span></div>
            <div className={styles.scoreRow}>Brain Score: <strong>{prev.score.toLocaleString()}</strong></div>
          </div>

          <div className={styles.nextInfo}>
            <span className={styles.nextLabel}>Next challenge in</span>
            <Countdown24h />
          </div>

          <p className={styles.shareHint}>Come back tomorrow for a new grid!</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div className={styles.screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <AnimatePresence>
        {phase === 'countdown' && <Countdown onComplete={handleCountdownDone} />}
      </AnimatePresence>

      <div className={styles.inner}>
        <div className={styles.topRow}>
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
          <div className={styles.dateTag}>{formatDateKey(todayKey)}</div>
          <div className={styles.timerPill}>{elapsedSec}s</div>
        </div>

        <div className={styles.header}>
          <h2 className={styles.title}>DAILY CHALLENGE</h2>
          <p className={styles.sub}>5×5 · Normal · Same grid for everyone today</p>
        </div>

        {/* Grid */}
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${daily.gridSize}, minmax(0, 1fr))`,
            gap: `${gap}px`,
          }}
        >
          {daily.grid.map((num) => (
            <motion.button
              key={num}
              className={styles.cell}
              style={{ fontSize: `${fontSize}px` }}
              onClick={() => handleClick(num)}
              whileTap={phase === 'playing' ? { scale: 0.9 } : {}}
            >
              {num}
            </motion.button>
          ))}
        </div>

        <p className={styles.hint}>Find 1 → 25 in order. No hints. No feedback.</p>
      </div>

      {/* Result overlay */}
      <AnimatePresence>
        {phase === 'done' && rank && (
          <motion.div
            className={styles.resultOverlay}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.resultCard}>
              <div className={styles.resultDateTag}>{formatDateKey(todayKey)}</div>
              <p className={styles.resultLabel}>Today's Challenge</p>
              <div className={`${styles.rankBadge} ${styles[`rank_${rank.cls}`]}`}>
                {rank.label.toUpperCase()}
              </div>
              <div className={styles.bigTime}>{(ms / 1000).toFixed(2)}<span>s</span></div>
              <div className={styles.scoreRow}>Brain Score: <strong>{score.toLocaleString()}</strong></div>
              <div className={styles.resultActions}>
                <button className={styles.btnHome} onClick={onBack}>Back to home</button>
              </div>
              <p className={styles.nextInfo2}>Next challenge in <Countdown24h inline /></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Counts down to midnight
function Countdown24h({ inline }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight - now
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  if (inline) return <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent2)' }}>{timeLeft}</span>

  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '28px',
      fontWeight: 700,
      color: 'var(--accent2)',
      letterSpacing: '3px',
    }}>
      {timeLeft}
    </div>
  )
}
