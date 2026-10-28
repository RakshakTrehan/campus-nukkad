import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StatusStamp from '../components/StatusStamp'
import UpvoteButton from '../components/UpvoteButton'
import CommentSection from '../components/CommentSection'
import { getIssue } from '../api/issues'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Seed detail for offline/dev usage
const SEED_DETAIL = {
  id: 'seed-2',
  title: "Wi-Fi dead near Library Annex — can't attend online classes",
  description:
    "The Wi-Fi has been completely non-functional near the Library Annex for the past 3 days. Multiple students are affected — especially those attending online lectures and submitting assignments. The issue seems to be with the access point on the ground floor. Restarting devices doesn't help. Please fix ASAP.",
  category: 'Wi-Fi',
  location: 'Library Annex, Ground Floor',
  status: 'in_progress',
  upvotes: 47,
  photo_url: null,
  created_at: new Date(Date.now() - 86400000).toISOString(),
  status_updates: [
    { status: 'reported', note: 'Issue filed by student.', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { status: 'seen', note: 'IT department notified.', timestamp: new Date(Date.now() - 43200000).toISOString() },
    { status: 'in_progress', note: 'Technician assigned. Access point replacement ordered.', timestamp: new Date(Date.now() - 18000000).toISOString() },
  ],
}

export default function IssueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getIssue(id)
      .then((data) => {
        setIssue(data)
        setError('')
      })
      .catch(() => {
        setIssue(SEED_DETAIL)
        setError('')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-card rounded shadow-md border border-amber-200 h-64 animate-pulse" />
      </main>
    )
  }

  if (!issue) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="font-kalam text-2xl text-muted">Issue not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-stamp-blue underline text-sm">
          ← Back to Home
        </button>
      </main>
    )
  }

  const statusUpdates = issue.status_updates || []

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-muted hover:text-ink-dark mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      {/* Main card */}
      <div className="bg-card border border-amber-200 rounded shadow-md p-6 mb-6 relative">
        {/* Pin */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-stamp-red shadow border border-red-700" />

        {/* Category + Status */}
        <div className="flex flex-wrap items-center gap-3 mt-2 mb-4">
          <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            {issue.category}
          </span>
          <StatusStamp status={issue.status} large />
        </div>

        {/* Title */}
        <h1 className="font-kalam text-2xl md:text-3xl font-bold text-ink-dark mb-3 leading-tight">
          {issue.title}
        </h1>

        {/* Meta */}
        <p className="text-sm text-muted mb-1 flex items-center gap-1">
          <span>📍</span> {issue.location}
        </p>
        <p className="text-xs text-muted mb-4">
          Reported on {formatDate(issue.created_at || issue.createdAt)}
        </p>

        {/* Description */}
        {issue.description && (
          <p className="text-sm text-ink-dark leading-relaxed mb-4 border-t border-amber-100 pt-3">
            {issue.description}
          </p>
        )}

        {/* Photo */}
        {issue.photo_url && (
          <img
            src={issue.photo_url}
            alt="Issue photo"
            className="w-full max-h-72 object-cover rounded border border-amber-200 mb-4"
          />
        )}

        {/* Upvote */}
        <div className="flex items-center gap-3">
          <UpvoteButton issueId={id} initialCount={issue.upvotes ?? 0} initialVoted={issue.user_voted ?? false} />
          <span className="text-xs text-muted">people agree this needs fixing</span>
        </div>
      </div>

      {/* Status timeline */}
      {statusUpdates.length > 0 && (
        <div className="bg-card border border-amber-200 rounded shadow-sm p-5 mb-6">
          <h2 className="font-kalam text-xl font-bold text-ink-dark mb-4">🗓 Status Timeline</h2>
          <ol className="relative border-l-2 border-amber-300 ml-2 flex flex-col gap-5">
            {statusUpdates.map((update, i) => (
              <li key={i} className="ml-4 relative">
                <div className="absolute -left-[1.4rem] top-0.5 w-3 h-3 rounded-full bg-marigold border-2 border-amber-300" />
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <StatusStamp status={update.status} />
                  <span className="text-xs text-muted">{formatDate(update.timestamp)}</span>
                </div>
                {update.note && <p className="text-sm text-ink-dark">{update.note}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Comments */}
      <div className="bg-card border border-amber-200 rounded shadow-sm p-5">
        <CommentSection issueId={id} />
      </div>
    </main>
  )
}
