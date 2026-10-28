import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { voteIssue } from '../api/issues'

export default function UpvoteButton({ issueId, initialCount = 0, initialVoted = false }) {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [count, setCount] = useState(initialCount)
  const [voted, setVoted] = useState(initialVoted)
  const [loading, setLoading] = useState(false)

  const handleVote = async (e) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const data = await voteIssue(issueId)
      setCount(data.vote_count ?? data.upvotes ?? (voted ? count - 1 : count + 1))
      setVoted(data.voted ?? !voted)
    } catch {
      // Optimistic fallback
      setCount((c) => (voted ? c - 1 : c + 1))
      setVoted((v) => !v)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 font-semibold text-sm transition-all ${
        voted
          ? 'bg-marigold border-marigold text-white shadow-sm'
          : 'bg-card border-amber-300 text-muted hover:border-marigold hover:text-marigold'
      } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      title={user ? (voted ? 'Remove vote' : 'Upvote') : 'Login to vote'}
    >
      <span>{voted ? '▲' : '△'}</span>
      <span>{count}</span>
    </button>
  )
}
