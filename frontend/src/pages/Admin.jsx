import { useState, useEffect } from 'react'
import { getIssues, updateIssueStatus } from '../api/issues'

const STATUSES = ['reported', 'seen', 'in_progress', 'fixed']

const STATUS_LABELS = {
  reported: 'Reported',
  seen: 'Seen',
  in_progress: 'In Progress',
  fixed: 'Fixed',
}

// Seed data for offline usage
const SEED = [
  { id: 's1', title: 'Fan broken in Hostel B 214', location: 'Hostel B, Room 214', status: 'reported', upvotes: 23, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 's2', title: "Wi-Fi dead near Library Annex", location: 'Library Annex, GF', status: 'in_progress', upvotes: 47, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 's3', title: 'Water cooler leaking Block C 2F', location: 'Block C, 2nd Floor', status: 'seen', upvotes: 15, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
]

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function Admin() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingChanges, setPendingChanges] = useState({}) // { [id]: { status, note } }
  const [saving, setSaving] = useState({})
  const [saved, setSaved] = useState({})

  useEffect(() => {
    getIssues()
      .then((data) => setIssues(Array.isArray(data) ? data : data.issues || []))
      .catch(() => setIssues(SEED))
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = (id, newStatus) => {
    setPendingChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: newStatus, note: prev[id]?.note || '' },
    }))
  }

  const handleNoteChange = (id, note) => {
    setPendingChanges((prev) => ({
      ...prev,
      [id]: { ...prev[id], note },
    }))
  }

  const handleSave = async (id, originalStatus) => {
    const change = pendingChanges[id]
    if (!change) return
    setSaving((prev) => ({ ...prev, [id]: true }))
    try {
      await updateIssueStatus(id, change.status, change.note || '')
      setIssues((prev) =>
        prev.map((issue) =>
          (issue.id || issue._id) === id ? { ...issue, status: change.status } : issue
        )
      )
      setPendingChanges((prev) => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
      setSaved((prev) => ({ ...prev, [id]: true }))
      setTimeout(() => setSaved((prev) => { const c = { ...prev }; delete c[id]; return c }), 2000)
    } catch {
      // silently fail — in real app show error
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }))
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 mb-1.5">
          Campus Facilities Administration
        </h1>
        <p className="text-slate-500 text-sm">Review reported issues, update resolution milestones, and post administrative remarks.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-lg border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-sm border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Title</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Location</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Status</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Official Note</th>
                <th className="text-right px-4 py-3.5 font-semibold text-slate-700">Votes</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Date</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, i) => {
                const id = issue.id || issue._id
                const pending = pendingChanges[id]
                const currentStatus = pending?.status ?? issue.status ?? 'reported'
                const isDirty = !!pending

                return (
                  <tr
                    key={id || i}
                    className={`border-b border-amber-100 ${i % 2 === 0 ? 'bg-card' : 'bg-paper'} ${isDirty ? 'ring-1 ring-inset ring-marigold' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-ink-dark max-w-xs">
                      <span className="line-clamp-2">{issue.title}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">{issue.location}</td>
                    <td className="px-4 py-3">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(id, e.target.value)}
                        className="border-2 border-amber-300 bg-paper rounded px-2 py-1 text-xs focus:outline-none focus:border-marigold"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {isDirty && (
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={pending?.note || ''}
                          onChange={(e) => handleNoteChange(id, e.target.value)}
                          className="w-full border border-amber-300 bg-paper rounded px-2 py-1 text-xs focus:outline-none focus:border-marigold"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">{issue.upvotes ?? 0}</td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {formatDate(issue.created_at || issue.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {saved[id] ? (
                        <span className="text-xs text-green-600 font-semibold">✓ Saved</span>
                      ) : (
                        <button
                          onClick={() => handleSave(id, issue.status)}
                          disabled={!isDirty || saving[id]}
                          className="text-xs bg-marigold text-white px-3 py-1 rounded font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {saving[id] ? '...' : 'Save'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
