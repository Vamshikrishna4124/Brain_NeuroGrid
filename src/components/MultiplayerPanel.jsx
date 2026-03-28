import styles from './MultiplayerPanel.module.css'

function initials(name) {
  return name.slice(0, 2).toUpperCase()
}

export default function MultiplayerPanel({ roomCode, peers, myProgress, myTotal, playerName }) {
  const myPct = myTotal > 0 ? Math.round((myProgress / myTotal) * 100) : 0

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        Players in room
        <span className={styles.code}>{roomCode}</span>
      </div>

      <div className={styles.list}>
        {/* Me */}
        <div className={styles.row}>
          <div className={styles.avatar} style={{ background: '#7c3aed', color: '#e9d5ff' }}>
            {initials(playerName)}
          </div>
          <span className={styles.name}>
            {playerName}
            <span className={styles.youBadge}>you</span>
          </span>
          <div className={styles.progressWrap}>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${myPct}%`, background: 'var(--accent2)' }} />
            </div>
            <span className={styles.count}>{myProgress}/{myTotal}</span>
          </div>
        </div>

        {/* Peers */}
        {peers.map((p) => {
          const pct = p.total > 0 ? Math.round((p.progress / p.total) * 100) : 0
          return (
            <div key={p.id} className={styles.row}>
              <div className={styles.avatar} style={{ background: p.color.bg, color: p.color.fg }}>
                {initials(p.name)}
              </div>
              <span className={styles.name}>
                {p.name}
                {p.done && <span className={styles.doneBadge}>done</span>}
              </span>
              <div className={styles.progressWrap}>
                <div className={styles.bar}>
                  <div
                    className={styles.fill}
                    style={{
                      width: `${pct}%`,
                      background: p.done ? 'var(--green)' : p.color.bg,
                    }}
                  />
                </div>
                <span className={styles.count}>{p.progress}/{p.total}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
