export default function LostFoundCard({ item, index = 0, onClaim }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 transition-all hover:shadow-md hover:border-slate-300 flex flex-col justify-between">
      <div>
        {/* Claimed badge */}
        {item.claimed ? (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded uppercase tracking-wider mb-2.5 inline-block">
            ✓ Returned to Owner
          </span>
        ) : (
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded uppercase tracking-wider mb-2.5 inline-block">
            Awaiting Owner
          </span>
        )}

        <h3 className="font-heading text-base font-semibold text-slate-900 mb-1 leading-snug">
          {item.item_name || item.name}
        </h3>
        <p className="text-sm text-slate-600 mb-2 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4 font-medium">
          <span>📍</span>
          <span>{item.location_found || item.location}</span>
        </p>
      </div>

      {!item.claimed && onClaim && (
        <button
          onClick={() => onClaim(item.id || item._id)}
          className="text-xs bg-slate-900 text-white px-3.5 py-1.5 rounded-md font-semibold hover:bg-blue-600 transition-colors self-start"
        >
          Claim This Item
        </button>
      )}
    </div>
  )
}
