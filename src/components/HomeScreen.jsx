import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { nanoid } from 'nanoid'
import { useGameStore } from '../store/gameStore'
import DailyChallenge from './DailyChallenge'
import { getTodayKey, formatDateKey } from '../hooks/useDailyChallenge'
import styles from './HomeScreen.module.css'

const DAILY_STORAGE_KEY = 'neurogrid-daily'
function getDailyDone() {
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY)
    if (!raw) return false
    return !!JSON.parse(raw)[getTodayKey()]
  } catch { return false }
}

const MODES = [
  { id: 'normal',  name: 'Normal',   desc: 'Click 1 → N in order'      },
  { id: 'reverse', name: 'Reverse',  desc: 'Click N → 1 backwards'     },
  { id: 'even',    name: 'Even',     desc: 'Find 2, 4, 6, 8...'        },
  { id: 'odd',     name: 'Odd',      desc: 'Find 1, 3, 5, 7...'        },
]

const container = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 280 } },
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const {
    playerName, selectedMode, gridSize, bestTimes, totalGames, allTimes,
    currentStreak, longestStreak,
    setConfig, initGame,
  } = useGameStore()

  const [roomInput, setRoomInput] = useState('')
  const [roomMsg, setRoomMsg] = useState('')
  const [nameVal, setNameVal] = useState(playerName)
  const [sizeVal, setSizeVal] = useState(gridSize)
  const [modeVal, setModeVal] = useState(selectedMode)
  const [showDaily, setShowDaily] = useState(false)
  const dailyDone = getDailyDone()

  const bestKey = `${sizeVal}-${modeVal}`
  const sessionBest = bestTimes[bestKey]
  const avgMs = allTimes.length ? Math.round(allTimes.reduce((a,b)=>a+b,0)/allTimes.length) : null

  function genRoom() {
    const code = nanoid(6).toUpperCase()
    setRoomInput(code)
    flash(`Room ${code} created — share with friends!`)
  }

  function flash(msg) {
    setRoomMsg(msg)
    setTimeout(() => setRoomMsg(''), 3000)
  }

  function handlePlay() {
    setConfig({
      playerName: nameVal.trim() || 'Player',
      selectedMode: modeVal,
      gridSize: sizeVal,
      roomCode: roomInput.trim().toUpperCase(),
      inRoom: roomInput.trim().length >= 4,
    })
    initGame()
    navigate('/game')
  }

  return (
    <>
      <AnimatePresence>
        {showDaily && <DailyChallenge onBack={() => setShowDaily(false)} />}
      </AnimatePresence>

    <motion.div
      className={styles.screen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div variants={container} initial="hidden" animate="show" className={styles.inner}>

        {/* Logo */}
        <motion.div variants={item} className={styles.logoWrap}>
          <h1 className={styles.logo}>NEURO<span>GRID</span></h1>
          <p className={styles.tagline}>Train your focus · Think faster</p>
        </motion.div>

        {/* Daily Challenge banner */}
        <motion.button
          variants={item}
          className={`${styles.dailyBtn} ${dailyDone ? styles.dailyDone : ''}`}
          onClick={() => setShowDaily(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={styles.dailyLeft}>
            <span className={styles.dailyIcon}>{dailyDone ? '✓' : '◈'}</span>
            <div>
              <div className={styles.dailyTitle}>Daily Challenge</div>
              <div className={styles.dailyDate}>{formatDateKey(getTodayKey())}</div>
            </div>
          </div>
          <div className={styles.dailyRight}>
            {dailyDone ? <span className={styles.dailyDoneTag}>Completed</span> : <span className={styles.dailyPlayTag}>Play →</span>}
          </div>
        </motion.button>

        {/* Stats bar (if returning player) */}
        {totalGames > 0 && (
          <motion.div variants={item} className={styles.statsBar}>
            <div className={styles.statPill}>
              <span className={styles.statVal}>{totalGames}</span>
              <span className={styles.statLbl}>games</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statPill}>
              <span className={styles.statVal}>{currentStreak}</span>
              <span className={styles.statLbl}>streak</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statPill}>
              <span className={styles.statVal}>{longestStreak}</span>
              <span className={styles.statLbl}>best streak</span>
            </div>
            {avgMs && <>
              <div className={styles.statDivider} />
              <div className={styles.statPill}>
                <span className={styles.statVal}>{(avgMs/1000).toFixed(1)}s</span>
                <span className={styles.statLbl}>avg</span>
              </div>
            </>}
          </motion.div>
        )}

        {/* Card */}
        <motion.div variants={item} className={styles.card}>

          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label}>Your name</label>
            <input
              className={styles.input}
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              placeholder="Enter your name..."
              maxLength={18}
              autoComplete="off"
            />
          </div>

          {/* Mode */}
          <div className={styles.field}>
            <label className={styles.label}>Game mode</label>
            <div className={styles.modeGrid}>
              {MODES.map(m => (
                <button
                  key={m.id}
                  className={`${styles.modeBtn} ${modeVal === m.id ? styles.modeActive : ''}`}
                  onClick={() => setModeVal(m.id)}
                >
                  <span className={styles.modeName}>{m.name}</span>
                  <span className={styles.modeDesc}>{m.desc}</span>
                  {modeVal === m.id && <span className={styles.modeDot} />}
                </button>
              ))}
            </div>
          </div>

          {/* Grid size */}
          <div className={styles.field}>
            <div className={styles.sizeHeader}>
              <label className={styles.label}>Grid size</label>
              <span className={styles.sizeNum}>{sizeVal}<span>×{sizeVal}</span></span>
            </div>
            <input
              type="range" min={3} max={10} step={1} value={sizeVal}
              onChange={e => setSizeVal(+e.target.value)}
            />
            <div className={styles.sizeLabels}>
              <span>3×3</span>
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
              <span>10×10</span>
            </div>
            {sessionBest && (
              <div className={styles.bestHint}>
                Your best on {sizeVal}×{sizeVal} {modeVal}: <strong>{(sessionBest/1000).toFixed(2)}s</strong>
              </div>
            )}
          </div>

          {/* Multiplayer */}
          <div className={styles.field}>
            <label className={styles.label}>Multiplayer <span className={styles.optionalTag}>optional</span></label>
            <div className={styles.roomRow}>
              <input
                className={`${styles.input} ${styles.roomInput}`}
                value={roomInput}
                onChange={e => setRoomInput(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ROOM CODE"
                maxLength={6}
                autoComplete="off"
              />
              <button className={styles.btnSm} onClick={genRoom}>Create</button>
            </div>
            {roomMsg && <p className={styles.roomMsg}>{roomMsg}</p>}
          </div>

          {/* Play */}
          <motion.button
            className={styles.btnPlay}
            onClick={handlePlay}
            whileHover={{ scale: 1.02, boxShadow: '0 0 60px rgba(124,58,237,0.55)' }}
            whileTap={{ scale: 0.97 }}
          >
            PLAY NOW
          </motion.button>
        </motion.div>

      </motion.div>
    </motion.div>
    </>
  )
}
