import { useState, useEffect, useRef } from 'react'

export function useTimer(startTime, active) {
  const [elapsed, setElapsed] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (!active || !startTime) {
      setElapsed(0)
      return
    }

    const tick = () => {
      setElapsed(Date.now() - startTime)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [startTime, active])

  return elapsed
}
