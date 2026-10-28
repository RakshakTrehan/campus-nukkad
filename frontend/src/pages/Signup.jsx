import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { signup as signupApi } from '../api/auth'

export default function Signup() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await signupApi(form.name, form.email, form.password)
      login(data.token || data.access_token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-card border border-amber-200 rounded shadow-md p-8 relative rotate-1 hover:rotate-0 transition-transform">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-marigold shadow border border-yellow-500" />

          <div className="text-center mb-6 mt-1">
            <h1 className="font-kalam text-3xl font-bold text-ink-dark">Join Campus Nukkad</h1>
            <p className="text-muted text-sm mt-1">Create an account and start making a difference.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-dark mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-dark mb-1">College Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                className="w-full border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-dark mb-1">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-stamp-red text-sm border border-red-200 bg-red-50 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-marigold text-white font-bold py-2.5 rounded shadow hover:bg-yellow-500 transition-colors disabled:opacity-60 mt-1"
            >
              {loading ? 'Creating Account...' : '📌 Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-stamp-blue font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
