import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.username) e.username = 'Username is required'
    else if (form.username.length < 3) e.username = 'Username must be at least 3 characters'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
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
      await signup(form.email, form.username, form.password)
      navigate('/games')
    } catch (err) {
      setServerError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-8 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚀</div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Join ArcadeHub</h1>
          <p className="text-gray-400 text-sm">Create your account and start playing</p>
        </div>

        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm text-center"
          >
            {serverError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" error={errors.email} required />
          <Input label="Username" name="username" value={form.username} onChange={handleChange} placeholder="Pick a cool username" error={errors.username} required />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" error={errors.password} required />
          <Input label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Repeat your password" error={errors.confirm} required />

          <Button type="submit" loading={loading} size="lg" variant="neon" className="mt-2 w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light hover:text-white transition-colors font-medium">
            Login
          </Link>
        </p>
      </motion.div>
    </PageWrapper>
  )
}
