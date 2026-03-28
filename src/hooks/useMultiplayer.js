import { useState, useEffect, useRef } from 'react'

const FAKE_NAMES = ['Arjun', 'Priya', 'Ravi', 'Sneha', 'Karthik', 'Divya', 'Rahul']
const AVATAR_COLORS = [
  { bg: '#4f46e5', fg: '#e0e7ff' },
  { bg: '#0891b2', fg: '#cffafe' },
  { bg: '#16a34a', fg: '#dcfce7' },
  { bg: '#d97706', fg: '#fef3c7' },
  { bg: '#db2777', fg: '#fce7f3' },
  { bg: '#dc2626', fg: '#fee2e2' },
  { bg: '#7c3aed', fg: '#ede9fe' },
]

export function useMultiplayer(inRoom, sequenceLength, gamePhase) {
  const [peers, setPeers] = useState([])
  const timersRef = useRef([])

  useEffect(() => {
    if (!inRoom || !sequenceLength || gamePhase !== 'playing') return

    const count = Math.floor(Math.random() * 3) + 1
    const names = [...FAKE_NAMES].sort(() => Math.random() - 0.5).slice(0, count)

    const initial = names.map((name, i) => ({
      id: i,
      name,
      progress: 0,
      total: sequenceLength,
      done: false,
      finishTime: null,
      color: AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length],
    }))
    setPeers(initial)

    // Simulate each peer independently
    initial.forEach((peer) => {
      const totalTime = 18000 + Math.random() * 65000
      const perStep = totalTime / sequenceLength
      let step = 0

      const iv = setInterval(() => {
        step++
        if (step >= sequenceLength) {
          clearInterval(iv)
          setPeers((prev) =>
            prev.map((p) =>
              p.id === peer.id
                ? { ...p, progress: sequenceLength, done: true, finishTime: totalTime + Math.random() * 3000 }
                : p
            )
          )
        } else {
          setPeers((prev) =>
            prev.map((p) => (p.id === peer.id ? { ...p, progress: step } : p))
          )
        }
      }, perStep + Math.random() * 300)

      timersRef.current.push(iv)
    })

    return () => {
      timersRef.current.forEach(clearInterval)
      timersRef.current = []
    }
  }, [inRoom, sequenceLength, gamePhase])

  return peers
}

export { AVATAR_COLORS }
