import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import api from '../services/api'
import { useStats } from '../context/StatsContext'

// ─── Config ──────────────────────────────────────────────────────────────────
const DIFFICULTY = {
  easy:   { label: 'Easy',   cols: 4, pairs: 8,  time: 120, cardPx: 86  },
  medium: { label: 'Medium', cols: 6, pairs: 18, time: 180, cardPx: 72  },
  hard:   { label: 'Hard',   cols: 8, pairs: 32, time: 300, cardPx: 58  },
}

const EMOJIS = [
  '🎮','🎯','🎲','🎸','🎺','🎻','🥁','🎷',
  '🌟','💎','🔥','⚡','🌈','🎪','🚀','🛸',
  '🦁','🐯','🦊','🐺','🦋','🐬','🦜','🐙',
  '🍕','🍔','🍦','🍭','🎂','🍩','🍿','🍓',
]

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function generateCards(pairs) {
  const pool = EMOJIS.slice(0, pairs)
  return [...pool, ...pool]
    .map((emoji, i) => ({ id: i, emoji, matched: false }))
    .sort(() => Math.random() - 0.5)
    .map((card, i) => ({ ...card, pos: i }))
}

// ─── Single card with a CSS 3-D flip ─────────────────────────────────────────
function MemoryCard({ card, flipped, onClick, disabled, sizePx }) {
  const fontSize = Math.round(sizePx * 0.45)

  return (
    <div
      style={{ width: sizePx, height: sizePx, perspective: 600, flexShrink: 0 }}
      className="cursor-pointer select-none"
      onClick={() => !disabled && onClick(card)}
      role="button"
      aria-label={flipped ? card.emoji : 'Hidden card'}
    >
      <motion.div
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Back */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="absolute inset-0 rounded-lg glass-card border border-surface-border/50 flex items-center justify-center hover:border-primary/40 transition-colors"
        >
          <span style={{ fontSize: Math.round(sizePx * 0.28), opacity: 0.25 }} className="text-primary font-bold">?</span>
        </div>

        {/* Front */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className={`absolute inset-0 rounded-lg flex items-center justify-center border-2 ${
            card.matched
              ? 'border-neon-green/60 bg-neon-green/10'
              : 'border-primary/50 bg-primary/10'
          }`}
        >
          <span style={{ fontSize }}>{card.emoji}</span>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MemoryFlip() {
  const { refreshStats } = useStats()

  const [difficulty, setDifficulty] = useState(null)
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])      // at most 2 positions
  const [matched, setMatched] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle | playing | won | lost

  const timerRef    = useRef(null)
  const lockRef     = useRef(false)
  const matchedRef  = useRef(0)
  const difficultyRef = useRef(null)   // readable inside timer closure

  const cfg = difficulty ? DIFFICULTY[difficulty] : null

  // ── Start ──────────────────────────────────────────────────────────────────
  const startGame = useCallback((diff) => {
    const c = DIFFICULTY[diff]
    clearInterval(timerRef.current)
    lockRef.current = false
    matchedRef.current = 0
    difficultyRef.current = diff

    setDifficulty(diff)
    setCards(generateCards(c.pairs))
    setFlipped([])
    setMatched(0)
    setMoves(0)
    setTimeLeft(c.time)
    setGameState('playing')

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setGameState(gs => gs === 'playing' ? 'lost' : gs)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [])

  const flippedRef = useRef([])   // source of truth for current flipped cards

  // ── Card click ─────────────────────────────────────────────────────────────
  const handleCardClick = useCallback((card) => {
    if (lockRef.current) return
    if (card.matched) return
    if (flippedRef.current.find(f => f.pos === card.pos)) return
    if (flippedRef.current.length >= 2) return

    const newFlipped = [...flippedRef.current, card]
    flippedRef.current = newFlipped
    setFlipped([...newFlipped])

    if (newFlipped.length === 2) {
      lockRef.current = true
      setMoves(m => m + 1)

      if (newFlipped[0].emoji === newFlipped[1].emoji) {
        // Match! — run side effects in setTimeout, NOT inside a setState callback
        setTimeout(() => {
          setCards(cs => cs.map(c =>
            c.emoji === newFlipped[0].emoji ? { ...c, matched: true } : c
          ))
          matchedRef.current += 1          // runs exactly once per pair
          setMatched(matchedRef.current)

          const pairs = DIFFICULTY[difficultyRef.current]?.pairs || 0
          if (matchedRef.current >= pairs) {
            clearInterval(timerRef.current)
            setGameState('won')
          }
          flippedRef.current = []
          setFlipped([])
          lockRef.current = false
        }, 350)
      } else {
        // No match — flip back
        setTimeout(() => {
          flippedRef.current = []
          setFlipped([])
          lockRef.current = false
        }, 800)
      }
    }
  }, [])

  // ── Auto-save the moment game ends ──────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'won' && gameState !== 'lost') return
    const c = DIFFICULTY[difficultyRef.current]
    const score = gameState === 'won' ? computeScore(c, moves, timeLeft) : 0
    // Fire-and-forget — save silently in background
    api.post('/game/result', {
      gameType: 'memory',
      score,
      result: gameState === 'won' ? 'win' : 'lose',
      streak: 0,
    })
      .then(() => refreshStats())
      .catch(() => {})
  }, [gameState, moves, timeLeft, refreshStats]) // eslint-disable-line react-hooks/exhaustive-deps

  const computeScore = (c, mv, tLeft) =>
    Math.max(0, Math.round(1000 - mv * 8 - (c.time - tLeft) * 1.5))

  const resetGame = () => {
    clearInterval(timerRef.current)
    setDifficulty(null)
    difficultyRef.current = null
    matchedRef.current = 0
    flippedRef.current = []
    lockRef.current = false
    setGameState('idle')
    setCards([])
    setFlipped([])
    setMatched(0)
    setMoves(0)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  // ─── Difficulty picker ───────────────────────────────────────────────────
  if (!difficulty) {
    return (
      <PageWrapper className="page-container">
        <div className="max-w-3xl mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-5xl sm:text-6xl mb-4">🃏</div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-white mb-2">Memory Flip</h1>
            <p className="text-gray-400 mb-10">Match all pairs before the timer runs out</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            {Object.entries(DIFFICULTY).map(([key, c], i) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startGame(key)}
                className="glass-card border border-primary/20 hover:border-primary/50 hover:shadow-neon-indigo p-6 cursor-pointer transition-all duration-200 flex flex-col items-center gap-3 group"
              >
                <span className="font-display text-4xl font-black text-white group-hover:neon-text transition-all">
                  {c.cols}×{c.cols}
                </span>
                <span className={`text-sm font-semibold ${key === 'easy' ? 'text-neon-green' : key === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {c.label}
                </span>
                <span className="text-xs text-gray-600">{formatTime(c.time)}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  const isFlipped = (card) => !!flipped.find(f => f.pos === card.pos) || card.matched
  const { cols, cardPx, pairs } = cfg

  // Gap between cards: smaller for larger grids
  const gap = cols > 6 ? 4 : cols > 4 ? 6 : 8

  return (
    <PageWrapper className="page-container">
      <div className="max-w-3xl mx-auto px-4">

        {/* ── Stats bar ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between glass-card px-4 py-2 mb-4"
        >
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-500">Moves</span>
            <span className="font-mono font-bold text-white">{moves}</span>
          </div>

          <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => { clearInterval(timerRef.current); setDifficulty(null); setGameState('idle'); setCards([]); }}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← Back
          </button>
        </motion.div>

        {/* ── Win / Loss result ─────────────────────────────────────────── */}
        <AnimatePresence>
          {(gameState === 'won' || gameState === 'lost') && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 text-center mb-4"
            >
              <div className="text-5xl mb-2">{gameState === 'won' ? '🏆' : '⏰'}</div>
              <h2 className={`font-display text-2xl font-black mb-1 ${gameState === 'won' ? 'text-neon-green' : 'text-red-400'}`}>
                {gameState === 'won' ? 'You Won!' : "Time's Up!"}
              </h2>
              {gameState === 'won' && (
                <p className="text-gray-400 text-sm mb-1">Score: <span className="text-white font-bold">{computeScore(cfg, moves, timeLeft)}</span></p>
              )}
              <p className="text-gray-500 text-sm mb-4">Completed in <span className="text-white font-bold">{moves}</span> moves</p>
              <Button onClick={resetGame} variant="neon">
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Card grid — compact, fixed-size, centered ─────────────────── */}
        {gameState === 'playing' && (
          <div className="flex justify-center">
            {/* Outer wrapper constrains to the exact grid pixel width */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, ${cardPx}px)`,
                gap,
              }}
            >
              {cards.map(card => (
                <MemoryCard
                  key={card.pos}
                  card={card}
                  flipped={isFlipped(card)}
                  onClick={handleCardClick}
                  disabled={gameState !== 'playing'}
                  sizePx={cardPx}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
