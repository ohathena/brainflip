import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '../components/layout/PageWrapper'

export default function NotFound() {
  return (
    <PageWrapper className="page-container flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-6"
        >🕹️</motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-display text-8xl font-black neon-text mb-4"
        >404</motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-xl mb-8"
        >
          Looks like this level doesn't exist yet.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            🏠 Back to Home
          </Link>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
