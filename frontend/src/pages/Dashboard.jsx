import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useStats } from '../context/StatsContext'
import PageWrapper from '../components/layout/PageWrapper'
import Loader from '../components/ui/Loader'

const RESULT_COLORS = { win: 'text-neon-green', lose: 'text-red-400', draw: 'text-yellow-400' }
const RESULT_ICONS  = { win: '🏆', lose: '💀', draw: '🤝' }
const GAME_ICONS    = { rps: '✊', memory: '🃏' }

function StatCard({ icon, label, value, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="glass-card p-6 border border-surface-border/50 relative overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40`} />
      <div className="relative z-10">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="font-display text-3xl font-black text-white mt-1">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.2 }}>
            {value}
          </motion.span>
        </div>
        <div className="text-gray-400 text-sm mt-1">{label}</div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  // FIX 4: consume global StatsContext — auto-updates after any game page calls refreshStats()
  const { stats, loading, refreshStats } = useStats()

  useEffect(() => {
    refreshStats()
  }, []) // eslint-disable-line

  if (loading && !stats) return <Loader fullScreen text="Loading your stats..." />

  return (
    <PageWrapper className="page-container">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 sm:mb-10">
          <p className="text-gray-400 text-sm mb-1">Welcome back,</p>
          <h1 className="font-display text-3xl sm:text-4xl font-black">
            <span className="neon-text">{user?.username}</span> 👋
          </h1>
        </motion.div>

        {/* Stat Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            <StatCard icon="🎮" label="Total Games" value={stats.totalGames ?? 0} gradient="from-indigo-500/10 to-transparent" delay={0} />
            <StatCard icon="🏆" label="Wins"        value={stats.wins ?? 0}       gradient="from-emerald-500/10 to-transparent" delay={0.1} />
            <StatCard icon="💀" label="Losses"      value={stats.losses ?? 0}     gradient="from-red-500/10 to-transparent" delay={0.2} />
            <StatCard icon="🔥" label="Best Streak" value={stats.bestStreak ?? 0} gradient="from-orange-500/10 to-transparent" delay={0.3} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8 sm:mb-10">
          {[
            { to: '/games/rps',    icon: '✊', title: 'Rock Paper Scissors', color: 'border-primary/30 hover:border-primary/60' },
            { to: '/games/memory', icon: '🃏', title: 'Memory Flip',         color: 'border-cyan-500/30 hover:border-cyan-500/60' },
          ].map((g) => (
            <motion.div key={g.to} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link to={g.to} className={`glass-card flex items-center gap-4 p-5 border ${g.color} transition-all duration-200 group`}>
                <span className="text-3xl group-hover:scale-110 transition-transform">{g.icon}</span>
                <div>
                  <div className="font-semibold text-white">{g.title}</div>
                  <div className="text-gray-500 text-sm">Play now →</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        {stats?.recentActivity?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-5 sm:p-6">
            <h2 className="font-display font-bold text-lg text-white mb-4">Recent Games</h2>
            <div className="flex flex-col gap-3">
              {stats.recentActivity.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center justify-between py-2 border-b border-surface-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{GAME_ICONS[item.game_type] || '🎮'}</span>
                    <div>
                      <div className="text-sm text-white capitalize">
                        {item.game_type === 'rps' ? 'Rock Paper Scissors' : 'Memory Flip'}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${RESULT_COLORS[item.result]}`}>
                    {RESULT_ICONS[item.result]} {item.result?.toUpperCase()}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {stats?.totalGames === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 glass-card">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="font-display text-xl font-bold text-white mb-2">No games yet!</h3>
            <p className="text-gray-400 text-sm mb-6">Play your first game to start tracking stats</p>
            <Link to="/games" className="btn-primary inline-flex">Browse Games →</Link>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}
