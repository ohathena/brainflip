import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'

const PARTICLE_COUNT = 40

function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? '#6366f1' : Math.random() > 0.5 ? '#bc13fe' : '#00ffff',
      })
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })
      // Draw connections
      ctx.globalAlpha = 0.05
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 0.5
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        })
      })
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

const GAMES = [
  {
    icon: '✊',
    title: 'Rock Paper Scissors',
    description: 'Face off against a smart bot in fast-paced tournament mode. Best of 5 or 10 rounds.',
    path: '/games/rps',
    color: 'from-indigo-500/20 to-purple-500/20',
    border: 'border-indigo-500/30',
    glow: 'shadow-neon-indigo',
  },
  {
    icon: '🃏',
    title: 'Memory Flip',
    description: 'Test your memory with progressive difficulty grids. Match all pairs to win.',
    path: '/games/memory',
    color: 'from-cyan-500/20 to-teal-500/20',
    border: 'border-cyan-500/30',
    glow: 'shadow-neon-cyan',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Landing() {
  return (
    <PageWrapper>
      {/* Hero */}
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <ParticleField />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm text-primary-light font-medium">
              <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              Live • Multi-Game Platform
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-6xl sm:text-7xl lg:text-8xl font-black mb-6 leading-none"
          >
            <span className="neon-text">Brain</span>
            <span className="text-white">Flip</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-xl sm:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Flip your brain into high gear — real-time scores, leaderboards, and endlessly addictive games.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/games"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-neon-indigo"
              >
                🧠 Play Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 glass-card text-white font-semibold px-8 py-4 rounded-xl text-lg border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-200"
              >
                ✨ Sign Up Free
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-primary/40 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-primary rounded-full" />
          </motion.div>
        </motion.div>
      </div>

      {/* Game Preview Cards */}
      <div className="max-w-5xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl font-bold text-white mb-3">Choose Your Game</h2>
          <p className="text-gray-400">Competitive mini-games with real score tracking</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative glass-card p-8 border ${game.border} cursor-pointer overflow-hidden group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="text-5xl mb-4">{game.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{game.title}</h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">{game.description}</p>
                <Link
                  to={game.path}
                  className={`inline-flex items-center gap-2 btn-primary text-sm py-2 px-5 ${game.glow}`}
                >
                  Play Now →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats section */}
      <div className="max-w-5xl mx-auto px-4 py-16 border-t border-surface-border/50">
        <div className="grid grid-cols-3 gap-8 text-center">
          {[
            { label: 'Games Available', value: '2+', icon: '🎮' },
            { label: 'Score Tracking', value: '100%', icon: '📊' },
            { label: 'Live Leaderboard', value: '✓', icon: '🏆' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-3xl">{stat.icon}</span>
              <span className="font-display text-3xl font-black neon-text">{stat.value}</span>
              <span className="text-gray-500 text-sm">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
