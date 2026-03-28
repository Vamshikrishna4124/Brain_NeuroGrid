import { useCallback } from 'react'

const COLORS = ['#7c3aed', '#a855f7', '#22c55e', '#f59e0b', '#06b6d4', '#ec4899', '#f0f0f8']

export function useConfetti() {
  const spawn = useCallback((count = 80) => {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      el.className = 'confetti-piece'
      const size = 6 + Math.random() * 10
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -${size * 2}px;
        width: ${size}px;
        height: ${size}px;
        background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        animation: confettiFall ${2 + Math.random() * 2}s linear ${Math.random() * 1.2}s forwards;
        transform: rotate(${Math.random() * 360}deg);
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      `
      document.body.appendChild(el)
      el.addEventListener('animationend', () => el.remove(), { once: true })
    }

    // Inject animation if not present
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style')
      style.id = 'confetti-style'
      style.textContent = `
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return spawn
}
