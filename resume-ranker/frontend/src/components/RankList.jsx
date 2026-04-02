import React, { useState } from 'react'

const badgeClass = (i) => ['r1', 'r2', 'r3'][i] ?? 'rn'
const barColor   = (s) => s >= 70 ? 'bg-success' : s >= 40 ? 'bg-warning' : 'bg-danger'
const weightColor = (w) => w === 3 ? 'danger' : w === 2 ? 'warning' : 'secondary'

export default function RankList({ results }) {
  const [expanded, setExpanded] = useState(null)
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
              {r.matched.length} matched / {r.missed.length} missed &nbsp;|&nbsp; {r.total_keywords} keywords
            </div>

            {/* keyword tags */}
            <div className="mt-2">
              {r.matched.map(k => (
                <span key={k.keyword} className={`tag tag-hit`} title={`Weight: ${k.weight} | Found ${k.frequency}x`}>
                  ✓ {k.keyword}
                  <span className="tag-meta">×{k.frequency} w{k.weight}</span>
                </span>
              ))}
              {r.missed.map(k => (
                <span key={k.keyword} className="tag tag-miss" title={`Weight: ${k.weight} | Not found`}>
                  ✗ {k.keyword}
                  <span className="tag-meta">w{k.weight}</span>
                </span>
              ))}
            </div>

            {/* breakdown toggle */}
            <button
              className="btn btn-link btn-sm p-0 mt-2 text-muted"
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
            >
              {expanded === r.id ? 'Hide breakdown ▲' : 'Show breakdown ▼'}
            </button>

            {expanded === r.id && (
              <table className="table table-sm mt-2 breakdown-table">
                <thead>
                  <tr>
                    <th>Keyword</th>
                    <th>Weight</th>
                    <th>Frequency</th>
                    <th>Weighted Score</th>
                  </tr>
                </thead>
                <tbody>
                  {r.breakdown.map(k => (
                    <tr key={k.keyword} className={k.found ? '' : 'table-danger'}>
                      <td>{k.keyword}</td>
                      <td>
                        <span className={`badge bg-${weightColor(k.weight)}`}>{k.weight}</span>
                      </td>
                      <td>{k.frequency}x</td>
                      <td>{k.weighted_score} / {3 * k.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="score-pct">{r.score}%</div>
        </div>
      ))}
    </div>
  )
}
