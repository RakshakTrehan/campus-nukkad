const TILTS = ['-rotate-1', 'rotate-1', 'rotate-2', '-rotate-2', 'rotate-0']

export default function LostFoundCard({ item, index = 0, onClaim }) {
  const tilt = TILTS[index % TILTS.length]

  return (
    <div
      className={`
        bg-card rounded shadow-md border border-amber-200 p-4
        relative ${tilt}
        transition-all hover:shadow-lg hover:scale-[1.02]
      `}
    >
      {/* Pin */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-marigold shadow-sm border border-yellow-500 z-10" />

      <div className="mt-2">
        {/* Claimed badge */}
        {item.claimed && (
          <span className="text-xs font-bold text-stamp-red border border-stamp-red px-2 py-0.5 rounded-sm uppercase tracking-wide mb-2 inline-block">
            ✓ Claimed
          </span>
        )}

        <h3 className="font-kalam text-lg font-bold text-ink-dark mb-1">
          {item.item_name || item.name}
        </h3>
        <p className="text-sm text-muted mb-2 line-clamp-2">
          {item.description}
        </p>
        <p className="text-xs text-muted flex items-center gap-1 mb-3">
          <span>📍</span>
          <span>{item.location_found || item.location}</span>
        </p>

        {!item.claimed && onClaim && (
          <button
            onClick={() => onClaim(item.id || item._id)}
            className="text-xs bg-stamp-blue text-white px-3 py-1 rounded font-semibold hover:bg-blue-700 transition-colors"
          >
            This is mine!
          </button>
        )}
      </div>
    </div>
  )
}
