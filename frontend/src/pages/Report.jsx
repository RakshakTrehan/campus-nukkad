import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { createIssue } from '../api/issues'

const CATEGORIES = ['Electrical', 'Plumbing', 'Wi-Fi', 'Cleanliness', 'Furniture', 'Other']

export default function Report() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Electrical',
    location: '',
    photo_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = { ...form }
      if (!payload.photo_url.trim()) delete payload.photo_url
      const data = await createIssue(payload)
      setSuccess(true)
      setTimeout(() => navigate(`/issues/${data.id || data._id || ''}`), 1200)
    } catch (err) {
      setError(err.message || 'Failed to submit issue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-card border border-amber-200 rounded shadow-md p-8">
          <p className="font-kalam text-3xl font-bold text-ink-dark mb-2">📌 Pinned!</p>
          <p className="text-muted text-sm">Your issue has been reported. Redirecting...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-kalam text-4xl font-bold text-ink-dark mb-2">Report a Problem</h1>
        <p className="text-muted text-sm">Pin it to the board so it gets noticed.</p>
      </div>

      {/* Form card */}
      <div className="bg-card border border-amber-200 rounded shadow-md p-6 relative">
        {/* Pin decoration */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-stamp-red shadow border border-red-700" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-ink-dark mb-1">
              Title <span className="text-stamp-red">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              type="text"
              placeholder="e.g. Fan in Hostel B broken since Monday"
              className="w-full border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-ink-dark mb-1">
              Description <span className="text-stamp-red">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the problem in detail..."
              className="w-full border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold resize-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-ink-dark mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-ink-dark mb-1">
              Location <span className="text-stamp-red">*</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              type="text"
              placeholder="e.g. Hostel B, Room 214"
              className="w-full border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold"
              required
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-semibold text-ink-dark mb-1">
              Photo URL{' '}
              <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              name="photo_url"
              value={form.photo_url}
              onChange={handleChange}
              type="url"
              placeholder="https://..."
              className="w-full border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-stamp-red text-sm border border-red-200 bg-red-50 rounded px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-marigold text-white font-bold text-base py-3 rounded shadow-md hover:bg-yellow-500 transition-colors disabled:opacity-60 mt-1"
          >
            {loading ? 'Pinning...' : '📌 Pin This Issue'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-muted mt-4">
        Reporting as <strong>{user?.name || user?.email}</strong>
      </p>
    </main>
  )
}
