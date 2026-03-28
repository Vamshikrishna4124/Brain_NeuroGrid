import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Rank thresholds per grid size (ms) ──────────────────────
const RANK_THRESHOLDS = {
  3:  [6000,  12000,  20000],
  4:  [14000, 26000,  42000],
  5:  [24000, 42000,  68000],
  6:  [38000, 65000, 105000],
  7:  [52000, 90000, 140000],
  8:  [68000,115000, 180000],
  9:  [85000,145000, 230000],
  10:[110000,185000, 295000],
}

export function getRank(ms, size) {
  const t = RANK_THRESHOLDS[size] || RANK_THRESHOLDS[5]
  if (ms <= t[0]) return { label: 'Expert',       cls: 'expert',       color: '#f59e0b' }
  if (ms <= t[1]) return { label: 'Pro',           cls: 'pro',          color: '#a855f7' }
  if (ms <= t[2]) return { label: 'Intermediate',  cls: 'intermediate', color: '#22c55e' }
  return                  { label: 'Beginner',      cls: 'beginner',     color: '#7070a0' }
}

export function calcScore(ms, size) {
  return Math.round((size * size * 10000) / ms * 100)
}

// ── Shuffle ──────────────────────────────────────────────────
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Build sequence for a mode ────────────────────────────────
export function buildSequence(size, mode) {
  const all = Array.from({ length: size * size }, (_, i) => i + 1)
  let seq = [...all]
  if (mode === 'even')    seq = seq.filter(n => n % 2 === 0)
  if (mode === 'odd')     seq = seq.filter(n => n % 2 !== 0)
  if (mode === 'reverse') seq = seq.reverse()
  return seq
}

// ── Store ────────────────────────────────────────────────────
export const useGameStore = create(
  persist(
    (set, get) => ({
      // Persistent stats
      bestTimes: {},          // key: `${size}-${mode}` => ms
      totalGames: 0,
      allTimes: [],           // last 50 times (ms)
      currentStreak: 0,
      longestStreak: 0,
      sessionGames: 0,

      // Active game config
      playerName: '',
      selectedMode: 'normal',
      gridSize: 4,
      roomCode: '',
      inRoom: false,

      // Active game state (not persisted)
      grid: [],
      sequence: [],
      currentIndex: 0,
      doneSet: new Set(),
      startTime: null,
      endTime: null,
      gamePhase: 'idle', // idle | countdown | playing | finished

      // Actions
      setConfig: (cfg) => set(cfg),

      initGame: () => {
        const { gridSize, selectedMode } = get()
        const total = gridSize * gridSize
        const nums = shuffle(Array.from({ length: total }, (_, i) => i + 1))
        const sequence = buildSequence(gridSize, selectedMode)
        set({
          grid: nums,
          sequence,
          currentIndex: 0,
          doneSet: new Set(),
          startTime: null,
          endTime: null,
          gamePhase: 'countdown',
        })
      },

      startPlaying: () => set({ gamePhase: 'playing' }),

      clickCell: (num) => {
        const { sequence, currentIndex, doneSet, startTime, gamePhase } = get()
        if (gamePhase !== 'playing') return
        if (doneSet.has(num)) return
        if (!sequence.includes(num)) return

        const expected = sequence[currentIndex]
        if (num !== expected) return // Silent — no feedback

        const now = Date.now()
        const newStart = startTime || now
        const newDone = new Set(doneSet)
        newDone.add(num)
        const newIndex = currentIndex + 1

        if (newIndex >= sequence.length) {
          // Game complete
          const ms = now - newStart
          const { gridSize, selectedMode, allTimes, bestTimes, currentStreak, longestStreak, totalGames, sessionGames } = get()
          const key = `${gridSize}-${selectedMode}`
          const prevBest = bestTimes[key] || Infinity
          const newBest = Math.min(prevBest, ms)
          const newStreak = currentStreak + 1
          const newAllTimes = [...allTimes.slice(-49), ms]
          set({
            doneSet: newDone,
            currentIndex: newIndex,
            startTime: newStart,
            endTime: now,
            gamePhase: 'finished',
            bestTimes: { ...bestTimes, [key]: newBest },
            allTimes: newAllTimes,
            currentStreak: newStreak,
            longestStreak: Math.max(longestStreak, newStreak),
            totalGames: totalGames + 1,
            sessionGames: sessionGames + 1,
          })
        } else {
          set({
            doneSet: newDone,
            currentIndex: newIndex,
            startTime: newStart,
          })
        }
      },

      resetStreak: () => set({ currentStreak: 0 }),
    }),
    {
      name: 'neurogrid-storage',
      partialize: (s) => ({
        bestTimes: s.bestTimes,
        totalGames: s.totalGames,
        allTimes: s.allTimes,
        currentStreak: s.currentStreak,
        longestStreak: s.longestStreak,
        playerName: s.playerName,
        gridSize: s.gridSize,
        selectedMode: s.selectedMode,
      }),
    }
  )
)
