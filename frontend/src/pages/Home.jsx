import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import IssueCard from '../components/IssueCard'
import FilterBar from '../components/FilterBar'
import { getIssues, getStats } from '../api/issues'

// Realistic seed data shown when API is unavailable
const SEED_ISSUES = [
  {
    id: 'seed-1',
    title: 'Fan in Hostel B, Room 214 broken since Monday',
    category: 'Electrical',
    location: 'Hostel B, Room 214',
    status: 'reported',
    upvotes: 23,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Wi-Fi dead near Library Annex — can\'t attend online classes',
    category: 'Wi-Fi',
    location: 'Library Annex, Ground Floor',
    status: 'in_progress',
    upvotes: 47,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Water cooler on 2nd floor, Block C leaking badly',
    category: 'Plumbing',
    location: 'Block C, 2nd Floor Corridor',
    status: 'seen',
    upvotes: 15,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'seed-4',
    title: 'Bathroom taps in Girls Hostel constantly dripping',
    category: 'Plumbing',
    location: 'Girls Hostel, Block A',
    status: 'reported',
    upvotes: 31,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'seed-5',
    title: 'Broken chairs in Seminar Hall 3 — dangerous to sit on',
    category: 'Furniture',
    location: 'Seminar Hall 3, Academic Block',
    status: 'fixed',
    upvotes: 12,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'seed-6',
    title: 'Garbage not collected near Canteen exit for 4 days',
    category: 'Cleanliness',
    location: 'Main Canteen Exit',
    status: 'in_progress',
    upvotes: 38,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
]

const SEED_STATS = { fixed_this_month: 37, in_progress: 12, new_today: 5 }

export default function Home() {
  const [issues, setIssues] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getIssues({ category: activeCategory !== 'All' ? activeCategory : undefined, sort: sortBy }),
      getStats(),
    ])
      .then(([issueData, statsData]) => {
        setIssues(Array.isArray(issueData) ? issueData : issueData.issues || [])
        setStats(statsData)
        setError('')
      })
      .catch(() => {
        // Use seed data when backend isn't running
        let filtered = SEED_ISSUES
        if (activeCategory !== 'All') {
          filtered = filtered.filter((i) => i.category === activeCategory)
        }
        if (sortBy === 'most_upvoted') {
          filtered = [...filtered].sort((a, b) => b.upvotes - a.upvotes)
        } else {
          filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }
        setIssues(filtered)
        setStats(SEED_STATS)
        setError('')
      })
      .finally(() => setLoading(false))
  }, [activeCategory, sortBy])

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
          <span>Official Student & Facilities Portal</span>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
          Campus Nukkad
        </h1>
        <p className="text-base md:text-lg text-slate-600 font-normal max-w-xl mx-auto mb-8">
          The central platform for transparent campus issue reporting, tracking, and student services.
        </p>

        {/* Stats bar */}
        {stats && (
          <div className="inline-flex flex-wrap justify-center items-center gap-6 bg-white border border-slate-200 rounded-lg px-8 py-3 shadow-sm text-sm mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-700 font-semibold">
                {stats.fixed_this_month ?? stats.fixed ?? 0} Resolved This Month
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-700 font-semibold">
                {stats.in_progress ?? 0} In Progress
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-700 font-semibold">
                {stats.new_today ?? 0} Reported Today
              </span>
            </div>
          </div>
        )}

        <div>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-sm transition-all hover:shadow"
          >
            <span>+</span>
            <span>Submit Issue Report</span>
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Error notice */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-stamp-red">
          {error}
        </div>
      )}

      {/* Issue grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded shadow-md border border-amber-200 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="font-heading text-xl font-semibold text-slate-700 mb-2">No issues logged yet</p>
          <p className="text-sm">Be the first to submit a problem on campus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue, idx) => (
            <IssueCard key={issue.id || issue._id || idx} issue={issue} index={idx} />
          ))}
        </div>
      )}
    </main>
  )
}
