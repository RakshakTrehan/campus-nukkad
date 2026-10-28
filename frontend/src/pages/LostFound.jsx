import { useState, useEffect } from 'react'
import LostFoundCard from '../components/LostFoundCard'
import { getLostFoundItems, createLostFoundItem, claimItem } from '../api/lostfound'

const SEED_ITEMS = [
  { id: 'lf1', item_name: 'Blue Water Bottle', description: 'Has a sticker of a mountain on it. Found near the canteen.', location_found: 'Main Canteen', claimed: false },
  { id: 'lf2', item_name: 'Prescription Glasses', description: 'Black rectangular frame. Please claim ASAP.', location_found: 'Library Reading Room', claimed: false },
  { id: 'lf3', item_name: 'Maths Notebook (Sem 4)', description: 'Name "Rohan V." written inside. Very important!', location_found: 'Seminar Hall 2', claimed: true },
  { id: 'lf4', item_name: 'USB-C Charger', description: '65W laptop charger, no brand markings.', location_found: 'Computer Lab 3', claimed: false },
]

const EMPTY_FORM = { item_name: '', description: '', location_found: '' }

export default function LostFound() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    getLostFoundItems()
      .then((data) => setItems(Array.isArray(data) ? data : data.items || []))
      .catch(() => setItems(SEED_ITEMS))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.item_name.trim() || !form.location_found.trim()) {
      setFormError('Item name and location are required.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const newItem = await createLostFoundItem(form)
      setItems((prev) => [newItem, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch {
      // Optimistic add with temp id
      setItems((prev) => [{ ...form, id: `tmp-${Date.now()}`, claimed: false }, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClaim = async (id) => {
    try {
      await claimItem(id)
    } catch {
      // ignore
    }
    setItems((prev) => prev.map((item) => (item.id === id || item._id === id) ? { ...item, claimed: true } : item))
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 mb-1">
            Campus Lost &amp; Found
          </h1>
          <p className="text-slate-500 text-sm">Official student directory for lost, misplaced, or retrieved items on campus.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm"
        >
          {showForm ? '✕ Close Form' : '+ Report Found Item'}
        </button>
      </div>

      {/* Found item form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="font-heading text-xl font-bold text-slate-900 mb-4">Register Retrieved Property</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="item_name"
              value={form.item_name}
              onChange={handleChange}
              type="text"
              placeholder="Item name (e.g. Blue Wildcraft Backpack) *"
              className="border border-slate-300 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              required
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Description (colour, markings, etc.)"
              className="border border-slate-300 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
            />
            <input
              name="location_found"
              value={form.location_found}
              onChange={handleChange}
              type="text"
              placeholder="Where did you find it? *"
              className="border border-slate-300 bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              required
            />
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="self-start bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Registering...' : 'Register Found Item'}
            </button>
          </form>
        </div>
      )}

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 h-40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="font-heading text-lg font-semibold text-slate-700 mb-1">No items registered currently</p>
          <p className="text-sm">Submit a found item using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <LostFoundCard
              key={item.id || item._id || idx}
              item={item}
              index={idx}
              onClaim={handleClaim}
            />
          ))}
        </div>
      )}
    </main>
  )
}
