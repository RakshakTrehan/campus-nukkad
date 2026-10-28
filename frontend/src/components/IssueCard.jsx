import { useNavigate } from 'react-router-dom'
import StatusStamp from './StatusStamp'

const CATEGORY_COLORS = {
  electrical: 'bg-amber-50 text-amber-800 border border-amber-200',
  plumbing: 'bg-blue-50 text-blue-800 border border-blue-200',
  wifi: 'bg-purple-50 text-purple-800 border border-purple-200',
  'wi-fi': 'bg-purple-50 text-purple-800 border border-purple-200',
  cleanliness: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  furniture: 'bg-orange-50 text-orange-800 border border-orange-200',
  other: 'bg-slate-100 text-slate-700 border border-slate-200',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function IssueCard({ issue, index = 0 }) {
  const navigate = useNavigate()
  const catKey = (issue.category || 'other').toLowerCase()
  const categoryColor = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.other

  return (
    <div
      onClick={() => navigate(`/issues/${issue.id || issue._id}`)}
      className="bg-white rounded-lg shadow-sm border border-slate-200/90 p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-slate-400/80 hover:-translate-y-0.5 flex flex-col justify-between"
      style={{ minHeight: 160 }}
    >
      <div>
        {/* Category badge & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${categoryColor}`}>
            {issue.category || 'Other'}
          </span>
          <StatusStamp status={issue.status || 'reported'} />
        </div>

        {/* Title */}
        <h3 className="font-heading text-base font-semibold text-slate-900 mb-1.5 leading-snug line-clamp-2">
          {issue.title}
        </h3>

        {/* Location */}
        {issue.location && (
          <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 font-medium">
            <span>📍</span>
            <span className="line-clamp-1">{issue.location}</span>
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
        <span className="text-xs text-slate-400 font-medium">{formatDate(issue.created_at || issue.createdAt)}</span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          <span>▲</span>
          <span>{issue.vote_count ?? issue.upvotes ?? 0}</span>
        </span>
      </div>
    </div>
  )
}
