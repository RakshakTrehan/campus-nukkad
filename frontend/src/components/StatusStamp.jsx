/**
 * StatusStamp — formal college status badge
 * Props: status (string), large (boolean)
 */
export default function StatusStamp({ status, large = false }) {
  const config = {
    reported: {
      label: 'REPORTED',
      color: 'text-slate-600 bg-slate-100 border-slate-300',
    },
    seen: {
      label: 'SEEN 👁',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    in_progress: {
      label: 'IN PROGRESS ⚡',
      color: 'text-amber-700 bg-amber-50 border-amber-300',
    },
    fixed: {
      label: 'RESOLVED ✓',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    },
  }

  const cfg = config[status?.toLowerCase()] || config.reported

  return (
    <span
      className={`inline-flex items-center font-semibold uppercase tracking-wider border rounded ${
        large ? 'text-xs px-3 py-1 font-bold' : 'text-[11px] px-2 py-0.5'
      } ${cfg.color}`}
    >
      {cfg.label}
    </span>
  )
}
