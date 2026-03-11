import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `text-sm font-medium transition-colors duration-200 ${
        isActive ? 'text-primary-light' : 'text-gray-400 hover:text-white'
      }`
    }
  >
    {children}
  </NavLink>
)

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-surface-border/50 backdrop-blur-xl rounded-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold shadow-neon-indigo"
            >
              🧠
            </motion.div>
            <span className="font-display font-bold text-xl neon-text">BrainFlip</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavItem to="/games">Games</NavItem>
            <NavItem to="/leaderboard">Leaderboard</NavItem>
            <NavItem to="/feedback">Feedback</NavItem>
            {isAuthenticated && <NavItem to="/dashboard">Dashboard</NavItem>}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 glass-card px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300">{user?.username}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-2"
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/signup" className="btn-primary text-sm py-2 px-5 inline-block">
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg glass-card text-gray-400 hover:text-white"
            aria-label="Toggle menu"
          >
            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-current mt-1 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-current mt-1 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-surface-border/50"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {[
                { to: '/games', label: 'Games' },
                { to: '/leaderboard', label: 'Leaderboard' },
                { to: '/feedback', label: 'Feedback' },
                ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors py-2"
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300 py-2">
                  Logout
                </button>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost flex-1 text-center text-sm py-2">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-center text-sm py-2">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
