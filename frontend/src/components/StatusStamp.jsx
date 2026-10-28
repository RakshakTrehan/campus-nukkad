/**
 * StatusStamp — rubber-stamp style status badge
 * Props: status (string)
 */
export default function StatusStamp({ status, large = false }) {
  const config = {
    reported: {
      label: 'REPORTED',
      color: 'text-stone-500 border-stone-400',
      rotate: 'rotate(-1deg)',
    },
    seen: {
      label: '👁 SEEN',
      color: 'text-stamp-blue border-stamp-blue',
      rotate: 'rotate(1deg)',
    },
    in_progress: {
      label: '⚡ IN PROGRESS',
      color: 'text-stamp-orange border-stamp-orange',
      rotate: 'rotate(-1.5deg)',
    },
    fixed: {
      label: '✓ FIXED',
      color: 'text-stamp-red border-stamp-red',
      rotate: 'rotate(1.5deg)',
    },
  }

  const cfg = config[status?.toLowerCase()] || config.reported

  return (
    <span
      className={`inline-block font-mono font-bold uppercase tracking-widest border-2 rounded-sm ${
        large ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5'
      } ${cfg.color}`}
      style={{ transform: cfg.rotate, display: 'inline-block' }}
    >
      {cfg.label}
    </span>
  )
}
