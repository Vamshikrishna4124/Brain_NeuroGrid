import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Countdown.module.css'

export default function Countdown({ onComplete }) {
  const [count, setCount] = useState(3)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const steps = [3, 2, 1, 'GO']
    let idx = 0

    const iv = setInterval(() => {
      idx++
      if (idx >= steps.length) {
        clearInterval(iv)
        setDone(true)
        setTimeout(onComplete, 200)
      } else {
        setCount(steps[idx])
      }
    }, 900)

    return () => clearInterval(iv)
  }, [onComplete])

  if (done) return null

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          className={styles.num}
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          exit={{    scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 300 }}
        >
          {count}
        </motion.div>
      </AnimatePresence>
      <p className={styles.label}>
        {typeof count === 'number' ? 'GET READY' : 'FIND THE NUMBERS IN ORDER'}
      </p>
    </motion.div>
  )
}
