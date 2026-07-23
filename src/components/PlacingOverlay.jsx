import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChefHat, CheckCircle2, Flame, ReceiptText } from 'lucide-react'

const BEATS = [
  { Icon: ReceiptText, title: 'Confirming your order', note: 'Checking the basket and your details' },
  { Icon: ChefHat, title: 'Sending it to the kitchen', note: 'Your ticket is printing at the pass' },
  { Icon: Flame, title: 'The oven is being loaded', note: 'Stone at 450°C, ready for your pizza' },
  { Icon: CheckCircle2, title: 'Order confirmed', note: 'Opening your live tracker' },
]

const BEAT_MS = 850
const TOTAL = BEATS.length * BEAT_MS

const R = 66
const CIRCUMFERENCE = 2 * Math.PI * R

export default function PlacingOverlay({ onDone }) {
  const [beat, setBeat] = useState(0)
  const fired = useRef(false)

  useEffect(() => {
    const timers = BEATS.map((_, i) => setTimeout(() => setBeat(i), i * BEAT_MS))
    // The overlay owns the hand-off: the order is committed exactly once, when
    // the sequence has finished playing.
    const finish = setTimeout(() => {
      if (fired.current) return
      fired.current = true
      onDone()
    }, TOTAL + 400)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(finish)
    }
  }, [onDone])

  const { Icon, title, note } = BEATS[beat]
  const isLast = beat === BEATS.length - 1

  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
    >
      <div className="overlay-inner">
        <div className="ring-wrap">
          <svg className="ring" viewBox="0 0 140 140" aria-hidden="true">
            <circle
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke="rgba(242,236,228,0.12)"
              strokeWidth="1.5"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={isLast ? '#5c6b4a' : '#b98a45'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: TOTAL / 1000, ease: 'easeInOut' }}
            />
          </svg>

          <AnimatePresence mode="wait">
            <motion.div
              key={beat}
              className="ring-icon"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.25 }}
              transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              style={isLast ? { color: '#8fa06f' } : undefined}
            >
              <Icon aria-hidden="true" />
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={beat}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26 }}
          >
            <h2>{title}</h2>
            <p>{note}</p>
          </motion.div>
        </AnimatePresence>

        <div className="overlay-steps" aria-hidden="true">
          {BEATS.map((_, i) => (
            <i key={i}>
              <motion.b
                initial={{ width: '0%' }}
                animate={{ width: i <= beat ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </i>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
