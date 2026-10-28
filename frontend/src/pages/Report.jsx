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
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
          <p className="font-heading text-2xl font-bold text-slate-900 mb-2">Report Logged Successfully</p>
          <p className="text-slate-500 text-sm">Your issue has been submitted for campus review. Redirecting...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Submit Issue Report
        </h1>
        <p className="text-slate-500 text-sm">Submit campus facility or maintenance issues for administrative review.</p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              type="text"
              placeholder="e.g. Wi-Fi down in Library East Wing"
              className="w-full border border-slate-300 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the issue in detail, including affected areas..."
              className="w-full border border-slate-300 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-slate-300 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Location / Building <span className="text-red-500">*</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              type="text"
              placeholder="e.g. Hostel B, Room 214 or Block C 2nd Floor"
              className="w-full border border-slate-300 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              required
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Photo URL{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              name="photo_url"
              value={form.photo_url}
              onChange={handleChange}
              type="url"
              placeholder="https://..."
              className="w-full border border-slate-300 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-600 text-sm border border-red-200 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold text-sm py-3 rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Submitting Report...' : 'Submit Official Report'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-muted mt-4">
        Reporting as <strong>{user?.name || user?.email}</strong>
      </p>
    </main>
  )
}
