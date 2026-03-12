import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '../components/layout/PageWrapper'

const GAMES = [
  {
    id: 'memory',
    icon: '🃏',
    title: 'Memory Flip',
    subtitle: 'Card Matching',
    description: 'Flip cards and match pairs before time runs out. Three difficulty levels for every skill set.',
    tags: ['4×4', '6×6', '8×8'],
    path: '/games/memory',
    gradient: 'from-cyan-600/20 via-teal-600/10 to-transparent',
    border: 'border-cyan-500/30',
    glow: 'shadow-neon-cyan',
    accent: 'text-cyan-400',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -8 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function GameHub() {
  return (
    <PageWrapper className="page-container">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-5xl font-black mb-3">
            <span className="neon-text">Game</span>{' '}
            <span className="text-white">Hub</span>
          </h1>
          <p className="text-gray-400 text-lg">Pick a game. Compete. Climb the leaderboard.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-6"
          style={{ perspective: '1000px' }}
        >
          {GAMES.map((game) => (
            <motion.div
              key={game.id}
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.02, rotateX: 2, rotateY: -2 }}
              style={{ transformStyle: 'preserve-3d' }}
              className={`glass-card border ${game.border} overflow-hidden cursor-pointer group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />
              
              <div className="relative z-10 p-8">
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {game.icon}
                </motion.div>

                <div className={`text-xs font-mono uppercase tracking-widest ${game.accent} mb-1`}>
                  {game.subtitle}
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-3">{game.title}</h2>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">{game.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {game.tags.map((tag) => (
                    <span key={tag} className="text-xs glass-card px-3 py-1 rounded-full text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to={game.path}
                    className={`btn-primary inline-flex items-center gap-2 ${game.glow}`}
                  >
                    Play Now <span className="text-lg">→</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-gray-600"
        >
          More games coming soon...
        </motion.div>
      </div>
    </PageWrapper>
  )
}
