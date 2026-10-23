function getMatchLabel(match) {
  if (match >= 90)
    return { label: "Excellent Match", color: "#16a34a", bg: "#dcfce7" }
  if (match >= 70)
    return { label: "Good Match", color: "#2563EB", bg: "#dbeafe" }
  if (match >= 50)
    return { label: "Moderate Match", color: "#d97706", bg: "#fef3c7" }
  return { label: "Low Match", color: "#dc2626", bg: "#fee2e2" }
}
export function CircularProgress({ match }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (match / 100) * circ
  const { color } = getMatchLabel(match)
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-center">
        <span
          className="block text-xl font-bold"
          style={{ color, fontFamily: "'Outfit',sans-serif" }}
        >
          {match}%
        </span>
      </span>
    </div>
  )
}
export default function SkillMatchCard({
  match,
  matched,
  missing,
  compact = false,
}) {
  const { label, color, bg } = getMatchLabel(match)
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="font-semibold text-slate-800"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          Skill Match
        </h3>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ color, background: bg }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-5">
        <CircularProgress match={match} />
        <div className="flex-1 space-y-3">
          {matched.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">
                Matched Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matched.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700 border border-green-200"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {missing.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">
                Missing Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-600 border border-red-200"
                  >
                    ✕ {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {!compact && missing.length > 0 && (
        <div className="rounded-xl p-3 bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Learn {missing.slice(0, 2).join(", ")} to
            boost your match score and improve your chances.
          </p>
        </div>
      )}
    </div>
  )
}
