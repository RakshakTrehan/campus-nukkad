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
          <h1 className="font-kalam text-4xl font-bold text-ink-dark mb-1">Lost &amp; Found 🔍</h1>
          <p className="text-muted text-sm">Found something? Missed something? Put it on the board.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-marigold text-white font-bold px-4 py-2 rounded shadow hover:bg-yellow-500 transition-colors text-sm"
        >
          {showForm ? '✕ Cancel' : '📦 Found Something?'}
        </button>
      </div>

      {/* Found item form */}
      {showForm && (
        <div className="bg-card border border-amber-200 rounded shadow-md p-5 mb-8 relative -rotate-1">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-marigold shadow border border-yellow-500" />
          <h2 className="font-kalam text-xl font-bold text-ink-dark mb-4 mt-1">Post a Found Item</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="item_name"
              value={form.item_name}
              onChange={handleChange}
              type="text"
              placeholder="Item name *"
              className="border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold"
              required
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Description (colour, markings, etc.)"
              className="border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold resize-none"
            />
            <input
              name="location_found"
              value={form.location_found}
              onChange={handleChange}
              type="text"
              placeholder="Where did you find it? *"
              className="border-2 border-amber-300 bg-paper rounded px-3 py-2 text-sm text-ink-dark focus:outline-none focus:border-marigold"
              required
            />
            {formError && <p className="text-stamp-red text-sm">{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-ink-dark text-paper font-bold py-2 rounded text-sm hover:bg-opacity-80 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Posting...' : '📌 Post to Board'}
            </button>
          </form>
        </div>
      )}

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded border border-amber-200 h-40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="font-kalam text-2xl mb-2">Nothing here yet!</p>
          <p className="text-sm">Post a found item using the button above.</p>
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
