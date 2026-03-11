import React from 'react'
import { motion } from 'framer-motion'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const base = 'relative font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface inline-flex items-center justify-center gap-2 select-none'

  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-neon-indigo focus:ring-primary',
    ghost: 'bg-transparent text-primary border border-primary/30 hover:bg-primary/10 hover:border-primary/60 focus:ring-primary',
    danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 focus:ring-red-500',
    neon: 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-neon-purple focus:ring-primary',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      type={type}
      whileTap={!disabled && !loading ? { scale: 0.96 } : {}}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </motion.button>
  )
}
