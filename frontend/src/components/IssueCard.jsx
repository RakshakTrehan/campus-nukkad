import { useNavigate } from 'react-router-dom'
import StatusStamp from './StatusStamp'

const CATEGORY_COLORS = {
  Electrical: 'bg-yellow-100 text-yellow-800',
  Plumbing: 'bg-blue-100 text-blue-800',
  'Wi-Fi': 'bg-purple-100 text-purple-800',
  Cleanliness: 'bg-green-100 text-green-800',
  Furniture: 'bg-orange-100 text-orange-800',
  Other: 'bg-stone-100 text-stone-600',
}

// Subtle tilt angles — alternating based on index
const TILTS = ['-rotate-1', 'rotate-1', 'rotate-2', '-rotate-2', 'rotate-0']

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function IssueCard({ issue, index = 0 }) {
  const navigate = useNavigate()
  const tilt = TILTS[index % TILTS.length]
  const categoryColor = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS.Other

  return (
    <div
      onClick={() => navigate(`/issues/${issue.id || issue._id}`)}
      className={`
        bg-card rounded shadow-md cursor-pointer
        border border-amber-200 p-4
        transition-all duration-200
        hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5
        ${tilt}
        relative
      `}
      style={{ minHeight: 160 }}
    >
      {/* Pin decoration */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-stamp-red shadow-sm border border-red-700 z-10" />

      {/* Category badge */}
      <div className="flex items-start justify-between gap-2 mt-2 mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColor}`}>
          {issue.category || 'Other'}
        </span>
        <StatusStamp status={issue.status || 'reported'} />
      </div>

      {/* Title */}
      <h3 className="font-kalam text-base font-bold text-ink-dark mb-1 leading-snug line-clamp-2">
        {issue.title}
      </h3>

      {/* Location */}
      {issue.location && (
        <p className="text-xs text-muted mb-2 flex items-center gap-1">
          <span>📍</span>
          <span className="line-clamp-1">{issue.location}</span>
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-amber-100">
        <span className="text-xs text-muted">{formatDate(issue.created_at || issue.createdAt)}</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-muted">
          <span>△</span>
          <span>{issue.upvotes ?? 0}</span>
        </span>
      </div>
    </div>
  )
}
