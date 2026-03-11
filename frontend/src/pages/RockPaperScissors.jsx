import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import api from '../services/api'
import { useStats } from '../context/StatsContext'

const CHOICES = [
  { id: 'rock', emoji: '✊', label: 'Rock', beats: 'scissors' },
  { id: 'paper', emoji: '✋', label: 'Paper', beats: 'rock' },
  { id: 'scissors', emoji: '✌️', label: 'Scissors', beats: 'paper' },
]

const BOT_EMOJIS = ['🤔', '💭', '🧠', '⚡']

const getResult = (player, bot) => {
  if (player === bot) return 'draw'
  const p = CHOICES.find(c => c.id === player)
  return p.beats === bot ? 'win' : 'lose'
}

const getBotChoice = () => CHOICES[Math.floor(Math.random() * 3)].id

const COUNTDOWN_SECONDS = 3
// Best of 5 → first to 3 wins; Best of 10 → first to 5 wins
const getWinsNeeded = (mode) => (mode === 9 ? 5 : 3)

// SVG ring countdown timer
function CountdownRing({ seconds, total = COUNTDOWN_SECONDS }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = seconds / total
  const dashoffset = circumference * (1 - progress)
  const color = seconds <= 1 ? '#ef4444' : seconds <= 2 ? '#f59e0b' : '#6366f1'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: dashoffset, stroke: color }}
          transition={{ duration: 0.9, ease: 'linear' }}
        />
      </svg>
      <motion.span
        key={seconds}
        initial={{ scale: 1.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute text-3xl font-display font-black"
        style={{ color }}
      >
        {seconds}
      </motion.span>
    </div>
  )
}

function ChoiceButton({ choice, selected, disabled, onClick }) {
  const isSelected = selected === choice.id

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.06, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.94 } : {}}
      onClick={() => !disabled && onClick(choice.id)}
      disabled={disabled}
      aria-label={choice.label}
      className={`
        relative flex flex-col items-center gap-2 p-3 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none
        ${isSelected
          ? 'border-primary bg-primary/20 shadow-neon-indigo'
          : 'border-surface-border glass-card hover:border-primary/50'}
        ${disabled && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      <motion.span
        className="text-3xl sm:text-5xl"
        animate={isSelected ? { rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {choice.emoji}
      </motion.span>
      <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-primary-light' : 'text-gray-400'}`}>
        {choice.label}
      </span>
      {isSelected && (
        <motion.div
          layoutId="selection-indicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full"
        />
      )}
    </motion.button>
  )
}

function ResultReveal({ playerChoice, botChoice, result }) {
  const pc = CHOICES.find(c => c.id === playerChoice)
  const bc = CHOICES.find(c => c.id === botChoice)

  const colors = { win: 'text-neon-green', lose: 'text-red-400', draw: 'text-yellow-400' }
  const messages = {
    win:  ['You win! 🔥', 'Unstoppable! 💪', 'Nice move! ⚡'],
    lose: ['Bot wins...', 'Better luck!', 'So close!'],
    draw: ["It's a draw!", 'Equal match!', 'Tied!'],
  }
  const msg = messages[result][Math.floor(Math.random() * 3)]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="flex items-center gap-6 sm:gap-8">
        <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center gap-2">
          <span className="text-5xl sm:text-6xl">{pc?.emoji}</span>
          <span className="text-sm text-gray-400">You</span>
        </motion.div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="text-xl sm:text-2xl font-bold text-gray-500">VS</motion.div>
        <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center gap-2">
          <span className="text-5xl sm:text-6xl">{bc?.emoji}</span>
          <span className="text-sm text-gray-400">Bot</span>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`font-display text-2xl sm:text-3xl font-black ${colors[result]}`}>
        {msg}
      </motion.div>
    </motion.div>
  )
}

export default function RockPaperScissors() {
  const { refreshStats } = useStats()

  const [mode, setMode] = useState(null) // null | 5 | 10
  const modeRef = useRef(null) // readable inside closures without stale ref
  const [phase, setPhase] = useState('select') // select | countdown | reveal | done
  const [playerChoice, setPlayerChoice] = useState(null)
  const [botChoice, setBotChoice] = useState(null)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [botEmoji, setBotEmoji] = useState(BOT_EMOJIS[0])
  const scoresRef = useRef({ player: 0, bot: 0, draws: 0 })
  const [scores, setScores] = useState({ player: 0, bot: 0, draws: 0 })
  const [round, setRound] = useState(1)
  const [roundResult, setRoundResult] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [streak, setStreak] = useState(0)
  const [saving, setSaving] = useState(false)
  const resultLockedRef = useRef(false)

  const timerRef = useRef(null)
  const botAnimRef = useRef(null)
  const playerChoiceRef = useRef(null)

  // Keep playerChoiceRef in sync
  const handlePlayerChoice = (id) => {
    playerChoiceRef.current = id
    setPlayerChoice(id)
  }

  const startCountdown = useCallback(() => {
    resultLockedRef.current = false
    setPhase('countdown')
    setCountdown(COUNTDOWN_SECONDS)
    setBotEmoji(BOT_EMOJIS[0])
    setRoundResult(null)
    setBotChoice(null)

    let i = 0
    botAnimRef.current = setInterval(() => {
      i = (i + 1) % BOT_EMOJIS.length
      setBotEmoji(BOT_EMOJIS[i])
    }, 400)

    let secs = COUNTDOWN_SECONDS
    timerRef.current = setInterval(() => {
      secs -= 1
      setCountdown(secs)
      if (secs <= 0) {
        clearInterval(timerRef.current)
        clearInterval(botAnimRef.current)
        setBotEmoji('🤖')
        revealResult()
      }
    }, 1000)
  }, []) // eslint-disable-line

  const revealResult = useCallback(() => {
    // Guard: only reveal once per round
    if (resultLockedRef.current) return
    resultLockedRef.current = true

    const bot = getBotChoice()
    setBotChoice(bot)
    setPhase('reveal')

    setTimeout(() => {
      const finalPlayer = playerChoiceRef.current || 'rock'
      const res = getResult(finalPlayer, bot)
      setRoundResult(res)

      // --- FIX: update scoresRef atomically first, then mirror to state ---
      const prev = scoresRef.current
      const next = {
        player: prev.player + (res === 'win' ? 1 : 0),
        bot:    prev.bot    + (res === 'lose' ? 1 : 0),
        draws:  prev.draws  + (res === 'draw' ? 1 : 0),
      }
      scoresRef.current = next
      setScores({ ...next })

      setStreak(s => res === 'win' ? s + 1 : 0)

      // Game over: first to getWinsNeeded(mode) wins or last round played
      const target = getWinsNeeded(modeRef.current)
      if (next.player >= target || next.bot >= target) {
        setTimeout(() => setGameOver(true), 1500)
      }
    }, 300)
  }, []) // eslint-disable-line

  const nextRound = () => {
    if (gameOver) return
    resultLockedRef.current = false
    setRound(r => r + 1)
    playerChoiceRef.current = null
    setPlayerChoice(null)
    setBotChoice(null)
    setRoundResult(null)
    setPhase('select')
  }

  // ── Auto-save as soon as game ends ────────────────────────────────────────
  useEffect(() => {
    if (!gameOver) return
    const s = scoresRef.current
    const target = getWinsNeeded(modeRef.current)
    const finalResult = s.player >= target ? 'win' : s.bot >= target ? 'lose' : s.player > s.bot ? 'win' : 'lose'
    // Fire-and-forget — save silently, no button needed
    api.post('/game/result', {
      gameType: 'rps',
      score: s.player,
      result: finalResult,
      streak,
    })
      .then(() => refreshStats())
      .catch(() => {}) // silent fail
  }, [gameOver]) // eslint-disable-line

  const resetGame = () => {
    scoresRef.current = { player: 0, bot: 0, draws: 0 }
    setScores({ player: 0, bot: 0, draws: 0 })
    setMode(null)
    setPhase('select')
    playerChoiceRef.current = null
    setPlayerChoice(null)
    setBotChoice(null)
    setRound(1)
    setGameOver(false)
    setStreak(0)
    setRoundResult(null)
    resultLockedRef.current = false
    modeRef.current = null
  }

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(botAnimRef.current)
    }
  }, [])

  // Mode selection screen
  if (!mode) {
    return (
      <PageWrapper className="page-container">
        <div className="max-w-2xl mx-auto text-center px-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-5xl sm:text-6xl mb-4">✊✋✌️</div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-white mb-2">Rock Paper Scissors</h1>
            <p className="text-gray-400 mb-10">Beat the bot — first to reach the target wins the match</p>
          </motion.div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {[5, 9].map((m, i) => (
              <motion.button
                key={m}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { modeRef.current = m; setMode(m); scoresRef.current = { player: 0, bot: 0, draws: 0 }; setScores({ player: 0, bot: 0, draws: 0 }); }}
                className="glass-card border border-primary/30 hover:border-primary/70 hover:shadow-neon-indigo p-6 sm:p-8 cursor-pointer transition-all duration-200 flex flex-col items-center gap-3 group"
              >
                <span className="font-display text-5xl font-black text-white group-hover:neon-text transition-all">{m}</span>
                <span className="text-gray-400 text-sm font-medium">Rounds Max</span>
                <span className="text-xs text-gray-600">First to {getWinsNeeded(m)} wins</span>
              </motion.button>
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper className="page-container">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white mb-1">Rock Paper Scissors</h1>
          <p className="text-gray-500 text-sm">Best of {mode} • First to <span className="text-primary-light">{getWinsNeeded(mode)}</span> wins</p>
        </motion.div>

        {/* Scoreboard */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <div className="font-display text-4xl font-black text-neon-green">{scores.player}</div>
              <div className="text-gray-500 text-xs">You</div>
              <div className="text-xs text-gray-700 mt-1">need {Math.max(0, getWinsNeeded(mode) - scores.player)} more</div>
            </div>
            <div className="px-4">
              <div className="text-gray-600 text-sm font-mono">Round {round}</div>
              <div className="text-xs text-gray-700">{scores.draws} draws</div>
            </div>
            <div className="flex-1">
              <div className="font-display text-4xl font-black text-red-400">{scores.bot}</div>
              <div className="text-gray-500 text-xs">Bot</div>
              <div className="text-xs text-gray-700 mt-1">need {Math.max(0, getWinsNeeded(mode) - scores.bot)} more</div>
            </div>
          </div>
        </motion.div>

        {/* Game Area */}
        <AnimatePresence mode="wait">
          {gameOver ? (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 sm:p-10 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: 3 }}
                className="text-6xl sm:text-7xl mb-6"
              >
                {scores.player >= getWinsNeeded(mode) ? '🏆' : '💀'}
              </motion.div>
              <h2 className={`font-display text-3xl sm:text-4xl font-black mb-2 ${scores.player >= getWinsNeeded(mode) ? 'text-neon-green' : 'text-red-400'}`}>
                {scores.player >= getWinsNeeded(mode) ? 'You Win!' : 'Bot Wins!'}
              </h2>
              <p className="text-gray-400 mb-2">Final: {scores.player} – {scores.bot}</p>
              {streak > 1 && <p className="text-neon-green text-sm mb-6">🔥 Best Streak: {streak}</p>}
              <Button onClick={resetGame} variant="neon" size="lg">
                Play Again
              </Button>
            </motion.div>
          ) : phase === 'select' ? (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 sm:p-8">
              <div className="text-center mb-6">
                <p className="text-gray-300 font-medium">Choose your weapon</p>
                <p className="text-gray-600 text-sm mt-1">You can change until the timer hits 0</p>
              </div>
              <div className="flex justify-center gap-3 sm:gap-4 mb-8">
                {CHOICES.map(c => (
                  <ChoiceButton key={c.id} choice={c} selected={playerChoice} disabled={false} onClick={handlePlayerChoice} />
                ))}
              </div>
              <div className="flex justify-center">
                <Button onClick={startCountdown} disabled={!playerChoice} variant="neon" size="lg">
                  {playerChoice ? 'Lock In & Fight! ⚡' : 'Pick a choice first'}
                </Button>
              </div>
            </motion.div>
          ) : phase === 'countdown' ? (
            <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 sm:p-8">
              <div className="text-center mb-4">
                <p className="text-gray-300 font-medium">Round locking in...</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-2 sm:gap-3">
                    {CHOICES.map(c => (
                      <ChoiceButton key={c.id} choice={c} selected={playerChoice} disabled={false} onClick={handlePlayerChoice} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">You can still change!</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="text-4xl sm:text-5xl"
                  >
                    {botEmoji}
                  </motion.div>
                  <span className="text-xs text-gray-500">Bot thinking...</span>
                </div>
              </div>
              <div className="flex justify-center">
                <CountdownRing seconds={countdown} total={COUNTDOWN_SECONDS} />
              </div>
            </motion.div>
          ) : phase === 'reveal' ? (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 sm:p-8">
              <div className="text-center mb-6">
                {roundResult ? (
                  <ResultReveal playerChoice={playerChoice} botChoice={botChoice} result={roundResult} />
                ) : (
                  <div className="text-gray-400 animate-pulse">Revealing...</div>
                )}
              </div>
              {roundResult && !gameOver && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center mt-6"
                >
                  <Button onClick={nextRound} variant="primary" size="lg">
                    Next Round →
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="text-center mt-6">
          <button
            onClick={() => { clearInterval(timerRef.current); clearInterval(botAnimRef.current); setMode(null); }}
            className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← Back to mode select
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
