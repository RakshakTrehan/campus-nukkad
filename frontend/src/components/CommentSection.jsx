import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getComments, addComment } from '../api/issues'
import { useEffect } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function CommentSection({ issueId }) {
  const { user } = useContext(AuthContext)
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getComments(issueId)
      .then((data) => setComments(Array.isArray(data) ? data : data.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false))
  }, [issueId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const newComment = await addComment(issueId, text.trim())
      setComments((prev) => [...prev, newComment])
      setText('')
    } catch (err) {
      setError(err.message || 'Failed to post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-kalam text-xl font-bold text-ink-dark mb-4">
        💬 Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {loading ? (
        <p className="text-muted text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-muted text-sm italic">No comments yet. Be the first to add one!</p>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          {comments.map((c, i) => (
            <div
              key={c.id || c._id || i}
              className="bg-card border border-amber-200 rounded p-3 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-ink-dark">
                  👤 {c.author?.name || c.author_name || 'Anonymous'}
                </span>
                <span className="text-xs text-muted">{formatDate(c.created_at || c.createdAt)}</span>
              </div>
              <p className="text-sm text-ink-dark leading-relaxed">{c.text || c.body || c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add comment */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {error && <p className="text-stamp-red text-sm">{error}</p>}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Add a comment..."
            className="w-full border-2 border-amber-300 bg-card rounded p-2 text-sm text-ink-dark focus:outline-none focus:border-marigold resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="self-end bg-ink-dark text-paper px-4 py-1.5 rounded text-sm font-semibold hover:bg-opacity-80 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Add Comment'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted italic">
          <Link to="/login" className="text-stamp-blue underline">Login</Link> to add a comment.
        </p>
      )}
    </div>
  )
}
