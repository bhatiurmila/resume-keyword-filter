import React from 'react'

const badgeClass = (i) => ['r1','r2','r3'][i] ?? 'rn'
const barColor   = (s) => s >= 70 ? 'bg-success' : s >= 40 ? 'bg-warning' : 'bg-danger'

export default function RankList({ results }) {
  if (!results.length) return null

  return (
    <div className="mt-2">
      <h5 className="mb-3"><i className="bi bi-bar-chart-line text-success me-2"></i>Ranked Results</h5>
      {results.map((r, i) => (
        <div key={r.id} className="rank-card">
          <div className={`rank-badge ${badgeClass(i)}`}>#{i + 1}</div>

          <div className="score-wrap">
            <div className="score-name">{r.filename}</div>
            <div className="progress">
              <div className={`progress-bar ${barColor(r.score)}`} style={{ width: `${r.score}%` }} />
            </div>
            <div className="score-meta">
              Matched {r.matched_keywords.length} / {r.total_keywords} keywords
              <div className="mt-1">
                {r.matched_keywords.map(k => (
                  <span key={k} className="tag tag-hit">✓ {k}</span>
                ))}
                {r.missed_keywords.map(k => (
                  <span key={k} className="tag tag-miss">✗ {k}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="score-pct">{r.score}%</div>
        </div>
      ))}
    </div>
  )
}
