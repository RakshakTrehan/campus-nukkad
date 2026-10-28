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

export default function IssueCard({ issue, index = 0 }) {
  const navigate = useNavigate()
  const categoryColor = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS.Other

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
