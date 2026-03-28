// Seeded random number generator (mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Get today's date string YYYY-MM-DD in local time
export function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Convert date string to numeric seed
function dateSeed(dateKey) {
  return dateKey.split('-').reduce((acc, part) => acc * 10000 + parseInt(part, 10), 0)
}

// Seeded shuffle
function seededShuffle(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Get today's daily challenge config — same for all players
export function getDailyChallenge() {
  const dateKey = getTodayKey()
  const seed = dateSeed(dateKey)
  const rng = mulberry32(seed)

  // Daily always uses 5×5 normal mode for fairness
  const gridSize = 5
  const mode = 'normal'
  const total = gridSize * gridSize
  const nums = Array.from({ length: total }, (_, i) => i + 1)
  const grid = seededShuffle(nums, rng)

  return { grid, gridSize, mode, dateKey }
}

// Format date key for display: "Mon, 28 Mar"
export function formatDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
}
