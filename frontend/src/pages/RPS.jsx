import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../components/layout/PageWrapper'
import api from '../services/api'
import { useStats } from '../context/StatsContext'

// ─── Constants ────────────────────────────────────────────────────────────────
const CHOICES = [
  {
    id: 'rock',
    label: 'Rock',
    emoji: '✊',
    beats: 'scissors',
    color: 'from-orange-500/30 to-red-500/10',
    border: 'border-orange-500/50',
    glow: 'shadow-orange-500/40',
    accent: 'text-orange-400',
  },
  {
    id: 'paper',
    label: 'Paper',
    emoji: '✋',
    beats: 'scissors',
    color: 'from-blue-500/30 to-cyan-500/10',
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/40',
    accent: 'text-blue-400',
  },
  {
    id: 'scissors',
    label: 'Scissors',
    emoji: '✌️',
    beats: 'paper',
    color: 'from-purple-500/30 to-pink-500/10',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/40',
    accent: 'text-purple-400',
  },
]

// Fix beats logic properly
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' }

const MODES = [
  { id: 'bo3', label: 'Best of 3', total: 3, wins: 2, emoji: '⚡' },
  { id: 'bo5', label: 'Best of 5', total: 5, wins: 3, emoji: '🔥' },
]

const ROUND_TIME = 5

function getResult(player, ai) {
  if (player === ai) return 'draw'
  if (BEATS[player] === ai) return 'win'
  return 'lose'
}

function getChoice(id) {
  return CHOICES.find((c) => c.id === id)
}

// ─── Animated Hand ────────────────────────────────────────────────────────────
function HandEmoji({ choice, isAI = false, shaking = false }) {
  const emoji = choice ? getChoice(choice)?.emoji : '❓'

  return (
    <motion.div
      className={`text-7xl select-none ${isAI ? 'scale-x-[-1]' : ''}`}
      animate={
        shaking
          ? { y: [0, -12, 0, -12, 0], rotate: [0, -5, 5, -5, 0] }
          : { y: 0, rotate: 0 }
      }
      transition={{ duration: 0.5, repeat: shaking ? Infinity : 0, ease: 'easeInOut' }}
    >
      {emoji}
    </motion.div>
  )
}

// ─── Circular Timer ───────────────────────────────────────────────────────────
function CircularTimer({ timeLeft, total }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const fraction = timeLeft / total
  const dashOffset = circumference * (1 - fraction)
  const color = timeLeft <= 2 ? '#f87171' : timeLeft <= 3 ? '#facc15' : '#818cf8'

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg className="absolute w-20 h-20 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#1f2937" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
        />
      </svg>
      <span
        className="relative font-mono font-black text-2xl"
        style={{ color }}
      >
        {timeLeft}
      </span>
    </div>
  )
}

// ─── Score Pips ───────────────────────────────────────────────────────────────
function ScorePips({ wins, total, color }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: Math.ceil(total / 2) }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.5 }}
          animate={{ scale: i < wins ? 1.15 : 1 }}
          className={`w-4 h-4 rounded-full border-2 ${
            i < wins ? `${color} border-transparent` : 'bg-transparent border-gray-700'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RPS() {
  const { refreshStats } = useStats()
  const [mode, setMode] = useState(null)
  const [phase, setPhase] = useState('choose') // choose | reveal | result
  const [round, setRound] = useState(1)
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [playerChoice, setPlayerChoice] = useState(null)
  const [aiChoice, setAiChoice] = useState(null)
  const [roundResult, setRoundResult] = useState(null) // win|lose|draw
  const [matchResult, setMatchResult] = useState(null) // win|lose|draw|null
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)

  const timerRef = useRef(null)
  const playerChoiceRef = useRef(null)
  const savedRef = useRef(false)

  const clearTimer = () => clearInterval(timerRef.current)

  // ── Resolve round ─────────────────────────────────────────────────────────
  const resolveRound = useCallback(
    (pChoice) => {
      clearTimer()
      const aiPick = CHOICES[Math.floor(Math.random() * 3)].id
      const res = pChoice ? getResult(pChoice, aiPick) : 'lose' // timeout = lose

      setAiChoice(aiPick)
      setRoundResult(res)
      setPhase('reveal')

      const newPlayerScore = playerScore + (res === 'win' ? 1 : 0)
      const newAiScore = aiScore + (res === 'lose' ? 1 : 0)
      const newStreak = res === 'win' ? streak + 1 : 0
      const newScore = score + (res === 'win' ? 1 : res === 'lose' ? -1 : 0)

      setPlayerScore(newPlayerScore)
      setAiScore(newAiScore)
      setStreak(newStreak)
      setScore(newScore)

      const winsNeeded = Math.ceil(mode.total / 2)
      if (newPlayerScore >= winsNeeded) {
        setTimeout(() => setMatchResult('win'), 1200)
      } else if (newAiScore >= winsNeeded) {
        setTimeout(() => setMatchResult('lose'), 1200)
      } else {
        setTimeout(() => nextRound(newPlayerScore, newAiScore), 1800)
      }
    },
    [playerScore, aiScore, streak, score, mode]
  )

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'choose' || !mode) return

    setTimeLeft(ROUND_TIME)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          resolveRound(playerChoiceRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [phase, round]) // re-run each round

  // ── Player picks ──────────────────────────────────────────────────────────
  const handlePick = (id) => {
    if (phase !== 'choose') return
    setPlayerChoice(id)
    playerChoiceRef.current = id
    // Don't resolve immediately — let them change within 5s
    // They can click Confirm or wait for timer
  }

  const handleConfirm = () => {
    if (phase !== 'choose' || !playerChoiceRef.current) return
    resolveRound(playerChoiceRef.current)
  }

  // ── Next round ────────────────────────────────────────────────────────────
  const nextRound = (ps = playerScore, as = aiScore) => {
    setRound((r) => r + 1)
    setPlayerChoice(null)
    setAiChoice(null)
    setRoundResult(null)
    playerChoiceRef.current = null
    setPhase('choose')
  }

  // ── Save match result ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!matchResult || savedRef.current) return
    savedRef.current = true
    api
      .post('/game/result', {
        gameType: 'rps',
        score,
        result: matchResult,
        streak,
      })
      .then(() => refreshStats())
      .catch(() => {})
  }, [matchResult])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetGame = () => {
    clearTimer()
    setMode(null)
    setPhase('choose')
    setRound(1)
    setPlayerScore(0)
    setAiScore(0)
    setPlayerChoice(null)
    setAiChoice(null)
    setRoundResult(null)
    setMatchResult(null)
    setTimeLeft(ROUND_TIME)
    setStreak(0)
    setScore(0)
    savedRef.current = false
    playerChoiceRef.current = null
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCREEN 1: Mode selection
  // ─────────────────────────────────────────────────────────────────────────
  if (!mode) {
    return (
      <PageWrapper className="page-container">
        <div className="max-w-2xl mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-6xl mb-4">✊✋✌️</div>
            <h1 className="font-display text-4xl font-black text-white mb-2">
              Rock Paper <span className="neon-text">Scissors</span>
            </h1>
            <p className="text-gray-400 mb-10">
              5 seconds per round. Pick your mode below.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-md mx-auto">
            {MODES.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode(m)}
                className="glass-card border border-primary/20 hover:border-primary/60 hover:shadow-neon-indigo p-8 cursor-pointer transition-all duration-200 flex flex-col items-center gap-3 group"
              >
                <span className="text-4xl">{m.emoji}</span>
                <span className="font-display text-2xl font-black text-white group-hover:neon-text transition-all">
                  {m.label}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  First to {m.wins} wins
                </span>
              </motion.button>
            ))}
          </div>

          {/* Rules */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 glass-card p-5 text-sm text-gray-400 text-left max-w-md mx-auto rounded-xl space-y-2"
          >
            <p className="font-semibold text-white mb-2">📋 Rules</p>
            <p>⏱ 5 seconds to pick — you can change anytime before the timer ends</p>
            <p>⚡ Hit <span className="text-white font-bold">Confirm</span> early to lock in your choice</p>
            <p>⌛ If time runs out without a choice, the AI gets the point</p>
            <p>🏆 Win = +1 &nbsp;|&nbsp; Lose = −1 &nbsp;|&nbsp; Draw = 0</p>
          </motion.div>
        </div>
      </PageWrapper>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCREEN 2: Match over
  // ─────────────────────────────────────────────────────────────────────────
  if (matchResult) {
    const isWin = matchResult === 'win'
    return (
      <PageWrapper className="page-container">
        <div className="max-w-md mx-auto text-center px-4">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180 }}
            className="glass-card p-10 rounded-2xl"
          >
            <motion.div
              className="text-7xl mb-4"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {isWin ? '🏆' : '💀'}
            </motion.div>
            <h2
              className={`font-display text-4xl font-black mb-2 ${
                isWin ? 'text-neon-green' : 'text-red-400'
              }`}
            >
              {isWin ? 'You Won!' : 'You Lost!'}
            </h2>
            <p className="text-gray-400 mb-1">
              {playerScore} – {aiScore}
            </p>
            <p className="text-gray-500 text-sm mb-2">
              Score: <span className="text-white font-bold">{score > 0 ? `+${score}` : score}</span>
            </p>
            {streak > 1 && (
              <p className="text-yellow-400 text-sm mb-4">
                🔥 Best streak: {streak}
              </p>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={resetGame}
                className="btn-primary"
              >
                Play Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      </PageWrapper>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCREEN 3: Game arena
  // ─────────────────────────────────────────────────────────────────────────
  const winsNeeded = Math.ceil(mode.total / 2)

  return (
    <PageWrapper className="page-container">
      <div className="max-w-2xl mx-auto px-4">

        {/* ── Header bar ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between glass-card px-5 py-3 mb-6"
        >
          <button
            onClick={resetGame}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Quit
          </button>
          <span className="font-mono text-sm text-gray-400">
            Round <span className="text-white font-bold">{round}</span> / {mode.total}
          </span>
          <span className="text-xs text-gray-500 font-mono">{mode.label}</span>
        </motion.div>

        {/* ── Score board ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card px-6 py-4 mb-6 flex items-center justify-between"
        >
          {/* Player */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">You</span>
            <span className="font-display text-4xl font-black text-white">{playerScore}</span>
            <ScorePips wins={playerScore} total={mode.total} color="bg-indigo-500" />
          </div>

          {/* VS */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-gray-600">VS</span>
            {score !== 0 && (
              <motion.span
                key={score}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-xs font-mono font-bold ${score > 0 ? 'text-neon-green' : 'text-red-400'}`}
              >
                {score > 0 ? `+${score}` : score} pts
              </motion.span>
            )}
          </div>

          {/* AI */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">AI</span>
            <span className="font-display text-4xl font-black text-white">{aiScore}</span>
            <ScorePips wins={aiScore} total={mode.total} color="bg-red-500" />
          </div>
        </motion.div>

        {/* ── Arena ──────────────────────────────────────────────────────── */}
        <div className="glass-card p-6 mb-6">
          {/* Hands */}
          <div className="flex items-center justify-around mb-6">
            {/* Player hand */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500 font-mono uppercase">You</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={playerChoice || 'none'}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HandEmoji choice={playerChoice} shaking={phase === 'choose'} />
                </motion.div>
              </AnimatePresence>
              <AnimatePresence>
                {phase === 'reveal' && playerChoice && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-semibold text-gray-300"
                  >
                    {getChoice(playerChoice)?.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Center timer / result */}
            <div className="flex flex-col items-center gap-2">
              <AnimatePresence mode="wait">
                {phase === 'choose' && (
                  <motion.div
                    key="timer"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <CircularTimer timeLeft={timeLeft} total={ROUND_TIME} />
                  </motion.div>
                )}
                {phase === 'reveal' && roundResult && (
                  <motion.div
                    key="result"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className={`text-2xl font-black font-display px-4 py-2 rounded-xl ${
                      roundResult === 'win'
                        ? 'text-neon-green bg-neon-green/10 border border-neon-green/30'
                        : roundResult === 'lose'
                        ? 'text-red-400 bg-red-400/10 border border-red-400/30'
                        : 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30'
                    }`}
                  >
                    {roundResult === 'win' ? '🎉 Win!' : roundResult === 'lose' ? '💀 Loss' : '🤝 Draw'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI hand */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500 font-mono uppercase">AI</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={aiChoice || 'none-ai'}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HandEmoji choice={aiChoice} isAI shaking={phase === 'choose'} />
                </motion.div>
              </AnimatePresence>
              <AnimatePresence>
                {phase === 'reveal' && aiChoice && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-semibold text-gray-300"
                  >
                    {getChoice(aiChoice)?.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Choice buttons ─────────────────────────────────────────── */}
          <AnimatePresence>
            {phase === 'choose' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
              >
                <p className="text-center text-xs text-gray-500 mb-3 font-mono uppercase tracking-widest">
                  {playerChoice ? 'Change your mind or confirm' : 'Pick your move'}
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {CHOICES.map((c) => {
                    const isSelected = playerChoice === c.id
                    return (
                      <motion.button
                        key={c.id}
                        whileHover={{ scale: 1.06, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePick(c.id)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden
                          ${isSelected
                            ? `${c.border} bg-gradient-to-br ${c.color} shadow-lg ${c.glow}`
                            : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600'
                          }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="selection-ring"
                            className="absolute inset-0 rounded-xl border-2 border-white/20"
                            transition={{ type: 'spring', stiffness: 300 }}
                          />
                        )}
                        <motion.span
                          className="text-4xl"
                          animate={isSelected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {c.emoji}
                        </motion.span>
                        <span className={`text-xs font-semibold ${isSelected ? c.accent : 'text-gray-500'}`}>
                          {c.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Confirm button */}
                <AnimatePresence>
                  {playerChoice && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex justify-center"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleConfirm}
                        className="btn-primary px-8 py-3 text-sm font-bold tracking-widest"
                      >
                        ⚡ CONFIRM
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Streak badge */}
        <AnimatePresence>
          {streak >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-yellow-400 text-sm font-mono font-bold"
            >
              🔥 {streak} win streak!
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  )
}
