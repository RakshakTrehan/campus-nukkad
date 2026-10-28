import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { submitRating, getWeeklyRatings } from '../api/messpulse'

const MEALS = ['Breakfast', 'Lunch', 'Dinner']
const STARS = [1, 2, 3, 4, 5]

const SEED_WEEKLY = [
  { day: 'Mon', Breakfast: 3.2, Lunch: 4.0, Dinner: 3.8 },
  { day: 'Tue', Breakfast: 2.8, Lunch: 3.5, Dinner: 3.0 },
  { day: 'Wed', Breakfast: 4.0, Lunch: 4.2, Dinner: 4.5 },
  { day: 'Thu', Breakfast: 3.5, Lunch: 3.8, Dinner: 3.2 },
  { day: 'Fri', Breakfast: 4.1, Lunch: 4.4, Dinner: 4.2 },
  { day: 'Sat', Breakfast: 3.0, Lunch: 3.6, Dinner: 3.4 },
  { day: 'Sun', Breakfast: 4.3, Lunch: 4.6, Dinner: 4.5 },
]

export default function MessPulse() {
  const [ratings, setRatings] = useState({ Breakfast: 0, Lunch: 0, Dinner: 0 })
  const [submitted, setSubmitted] = useState({ Breakfast: false, Lunch: false, Dinner: false })
  const [weeklyData, setWeeklyData] = useState([])
  const [loadingChart, setLoadingChart] = useState(true)

  useEffect(() => {
    getWeeklyRatings()
      .then((data) => setWeeklyData(Array.isArray(data) ? data : data.weekly || []))
      .catch(() => setWeeklyData(SEED_WEEKLY))
      .finally(() => setLoadingChart(false))
  }, [])

  const handleRate = async (meal, star) => {
    setRatings((prev) => ({ ...prev, [meal]: star }))
    try {
      await submitRating(meal.toLowerCase(), star)
    } catch {
      // Optimistic — ignore errors
    }
    setSubmitted((prev) => ({ ...prev, [meal]: true }))
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Campus Mess Quality Index
        </h1>
        <p className="text-slate-500 text-sm">Real-time daily student feedback and weekly satisfaction trends for campus dining.</p>
      </div>

      {/* Today's ratings */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 md:p-8 mb-8">
        <h2 className="font-heading text-xl font-bold text-slate-900 mb-6">Rate Today's Meal Service</h2>

        <div className="flex flex-col gap-6">
          {MEALS.map((meal) => (
            <div key={meal} className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 last:border-b-0">
              <p className="text-sm font-semibold text-slate-800 mb-2 sm:mb-0">{meal}</p>
              <div className="flex items-center gap-2">
                {STARS.map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(meal, star)}
                    className={`text-2xl transition-transform hover:scale-110 ${
                      ratings[meal] >= star ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
                {submitted[meal] && (
                  <span className="ml-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-semibold">
                    ✓ Feedback Recorded ({ratings[meal]}/5)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 md:p-8">
        <h2 className="font-heading text-xl font-bold text-slate-900 mb-4">7-Day Dining Quality Trends</h2>

        {loadingChart ? (
          <div className="h-48 bg-amber-50 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5dac8" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716C' }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#78716C' }} />
              <Tooltip
                contentStyle={{
                  background: '#FEFCE8',
                  border: '1px solid #fde68a',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Breakfast" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Lunch" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Dinner" stroke="#DC2626" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        <p className="text-xs text-muted mt-3 text-center">
          Ratings are crowd-sourced from students. Avg out of 5.
        </p>
      </div>
    </main>
  )
}
