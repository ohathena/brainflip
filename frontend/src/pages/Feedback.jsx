import React, { useState } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const FORMSPREE_URL = 'https://formspree.io/f/xnjgdlwr'

const CATEGORIES = ['Bug Report', 'Game Suggestion', 'UI/UX Feedback', 'Performance', 'Other']
const GAMES = ['Rock Paper Scissors', 'Memory Flip', 'General (All Games)']

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <motion.button
        type="button"
        key={star}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(star)}
        className={`text-2xl transition-all duration-150 ${star <= value ? 'text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`}
        aria-label={`Rate ${star} stars`}
      >
        ★
      </motion.button>
    ))}
  </div>
)

export default function Feedback() {
  const [form, setForm] = useState({
    email: '', category: '', game: '', message: '', rating: 0,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.category) e.category = 'Please select a category'
    if (!form.message || form.message.length < 10) e.message = 'Message must be at least 10 characters'
    return e
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setServerError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: form.email || 'Not provided',
          category: form.category,
          game: form.game || 'Not specified',
          message: form.message,
          rating: form.rating ? `${form.rating} / 5 stars` : 'Not rated',
        }),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        setServerError('Failed to submit feedback. Please try again.')
      }
    } catch {
      setServerError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper className="page-container">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="text-5xl mb-3">💬</div>
          <h1 className="font-display text-4xl font-black text-white mb-2">Help Us Improve</h1>
          <p className="text-gray-400">Your feedback shapes the future of ArcadeHub</p>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-6xl mb-4"
            >🎉</motion.div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Thank You!</h2>
            <p className="text-gray-400 mb-6">Your feedback has been received. We appreciate you helping us improve.</p>
            <Button onClick={() => {
              setSuccess(false)
              setForm({ email: '', category: '', game: '', message: '', rating: 0 })
            }} variant="ghost">
              Submit More Feedback
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8"
          >
            {serverError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm text-center"
              >
                {serverError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Email (optional)"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="For follow-up (optional)"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">
                  Category <span className="text-primary-light">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-400 text-xs">{errors.category}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Game (optional)</label>
                <select
                  name="game"
                  value={form.game}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select a game...</option>
                  {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">
                  Message <span className="text-primary-light">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what you think, what broke, or what game you want next..."
                  rows={5}
                  className={`input-field resize-none ${errors.message ? 'border-red-500' : ''}`}
                />
                {errors.message && <p className="text-red-400 text-xs">{errors.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Overall Rating</label>
                <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
              </div>

              <Button type="submit" loading={loading} variant="neon" size="lg" className="mt-2">
                Submit Feedback 🚀
              </Button>
            </form>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}
