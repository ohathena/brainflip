import React from 'react'
import { motion } from 'framer-motion'

export default function Loader({ fullScreen = false, size = 'md', text = '' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' }

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className={`${sizes[size]} rounded-full border-2 border-surface-elevated border-t-primary`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className="text-gray-400 text-sm animate-pulse">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-animated">
        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl"
          >🎮</motion.div>
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}
