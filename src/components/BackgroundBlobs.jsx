import { motion } from 'framer-motion'
import styles from './BackgroundBlobs.module.css'

export default function BackgroundBlobs() {
  return (
    <div className={styles.blobWrap} aria-hidden="true">
      <motion.div
        className={`${styles.blob} ${styles.blob1}`}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.94, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`${styles.blob} ${styles.blob2}`}
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -20, 0], scale: [1, 0.92, 1.06, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: -6 }}
      />
      <motion.div
        className={`${styles.blob} ${styles.blob3}`}
        animate={{ x: [0, 30, -40, 0], y: [0, -20, 35, 0], scale: [1, 1.05, 0.97, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: -13 }}
      />
    </div>
  )
}
