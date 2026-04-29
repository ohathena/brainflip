import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Loader from './components/ui/Loader'

// Lazy-loaded pages
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const GameHub = lazy(() => import('./pages/GameHub'))
const MemoryFlip = lazy(() => import('./pages/MemoryFlip'))
const RPS = lazy(() => import('./pages/RPS'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Feedback = lazy(() => import('./pages/Feedback'))
const NotFound = lazy(() => import('./pages/NotFound'))

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Loader fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Loader fullScreen />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen gradient-animated">
      <Navbar />
      <Suspense fallback={<Loader fullScreen />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/games" element={<ProtectedRoute><GameHub /></ProtectedRoute>} />
            <Route path="/games/memory" element={<ProtectedRoute><MemoryFlip /></ProtectedRoute>} />
            <Route path="/games/rps" element={<ProtectedRoute><RPS /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  )
}
