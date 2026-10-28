const CATEGORIES = ['All', 'Electrical', 'Plumbing', 'Wi-Fi', 'Cleanliness', 'Furniture', 'Other']

export default function FilterBar({ activeCategory, setActiveCategory, sortBy, setSortBy }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
              activeCategory === cat
                ? 'bg-marigold text-white border-marigold shadow-sm'
                : 'bg-card border-amber-300 text-ink-dark hover:border-marigold'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted font-medium">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border-2 border-amber-300 bg-card text-ink-dark rounded px-2 py-1 focus:outline-none focus:border-marigold"
        >
          <option value="newest">Newest</option>
          <option value="most_upvoted">Most Upvoted</option>
        </select>
      </div>
    </div>
  )
}
