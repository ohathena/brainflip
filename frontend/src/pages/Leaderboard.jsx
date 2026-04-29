import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import PageWrapper from '../components/layout/PageWrapper'
import Loader from '../components/ui/Loader'

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' }
const GAME_FILTERS = [
  { id: null,     label: 'All Games' },
  { id: 'memory', label: '🃏 Memory' },
  { id: 'rps',    label: '✊ RPS' },
]

const GAME_LABELS = {
  memory: '🃏 Memory',
  rps:    '✊ RPS',
}

export default function Leaderboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/leaderboard${filter ? `?gameType=${filter}` : ''}`)
      .then(r => setData(r.data.leaderboard || []))
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <PageWrapper className="page-container">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="font-display text-5xl font-black mb-2">
            <span className="neon-text">Leader</span>
            <span className="text-white">board</span>
          </h1>
          <p className="text-gray-400">Top players ranked by score</p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 justify-center mb-8">
          {GAME_FILTERS.map(f => (
            <motion.button
              key={String(f.id)}
              whileTap={{ scale: 0.96 }}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === f.id
                  ? 'bg-primary text-white shadow-neon-indigo'
                  : 'glass-card text-gray-400 hover:text-white border border-surface-border/50'
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <Loader size="lg" text="Loading leaderboard..." />
        ) : error ? (
          <div className="text-red-400 text-center py-10">{error}</div>
        ) : data.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="font-display text-xl font-bold text-white mb-2">No scores yet</h3>
            <p className="text-gray-400 text-sm">Be the first to play and claim the top spot!</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 px-6 py-3 border-b border-surface-border/50 text-xs text-gray-500 uppercase tracking-wider font-medium">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Player</div>
              <div className="col-span-3">Game</div>
              <div className="col-span-2 text-right">Score</div>
              <div className="col-span-2 text-right">Streak</div>
            </div>

            {data.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`grid grid-cols-12 px-6 py-4 border-b border-surface-border/30 last:border-0 items-center hover:bg-primary/5 transition-colors ${
                  i < 3 ? 'bg-primary/5' : ''
                }`}
              >
                <div className="col-span-1 font-display font-black">
                  {RANK_ICONS[row.rank] || (
                    <span className="text-gray-600 text-sm">{row.rank}</span>
                  )}
                </div>
                <div className="col-span-4">
                  <div className={`font-semibold ${i === 0 ? 'neon-text text-base' : i < 3 ? 'text-white' : 'text-gray-300'}`}>
                    {row.username}
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="text-xs glass-card px-2 py-1 rounded-full text-gray-400">
                    {GAME_LABELS[row.gameType] || GAME_LABELS[filter] || '🎮 Game'}
                  </span>
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-white">{row.score}</div>
                <div className="col-span-2 text-right">
                  {row.streak > 0 ? (
                    <span className="text-neon-green font-mono text-sm">🔥 {row.streak}</span>
                  ) : (
                    <span className="text-gray-700 text-sm">–</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}
