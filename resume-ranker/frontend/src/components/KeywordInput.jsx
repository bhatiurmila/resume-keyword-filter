import React, { useState } from 'react'

const WEIGHT_LABELS = { 1: 'Nice to have', 2: 'Important', 3: 'Must have' }
const WEIGHT_COLORS = { 1: 'secondary', 2: 'warning', 3: 'danger' }

export default function KeywordInput({ keywords, setKeywords }) {
  const [input, setInput] = useState('')

  const addKeyword = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    // support comma-separated entry
    const entries = trimmed.split(',').map(k => k.trim()).filter(Boolean)
    const existing = keywords.map(k => k.keyword.toLowerCase())
    const newOnes = entries
      .filter(e => !existing.includes(e.toLowerCase()))
      .map(e => ({ keyword: e, weight: 2 }))
    setKeywords(prev => [...prev, ...newOnes])
    setInput('')
  }

  const updateWeight = (index, weight) => {
    setKeywords(prev => prev.map((k, i) => i === index ? { ...k, weight } : k))
  }

  const remove = (index) => {
    setKeywords(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="card-panel">
      <h5 className="mb-3"><i className="bi bi-tags text-primary me-2"></i>Job Keywords</h5>
      <label className="form-label text-muted small">
        Type a keyword and press Add. Set weight: 1 = nice to have, 2 = important, 3 = must have.
      </label>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="e.g. Python, SQL, Docker"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addKeyword()}
        />
        <button className="btn btn-primary" onClick={addKeyword}>
          <i className="bi bi-plus-lg me-1"></i>Add
        </button>
      </div>

      {keywords.length > 0 && (
        <div className="keyword-table">
          <div className="kw-header">
            <span>Keyword</span>
            <span>Weight</span>
            <span></span>
          </div>
          {keywords.map((kw, i) => (
            <div key={i} className="kw-row">
              <span className="kw-name">
                <i className="bi bi-tag me-1 text-muted"></i>{kw.keyword}
              </span>
              <div className="kw-weights">
                {[1, 2, 3].map(w => (
                  <button
                    key={w}
                    onClick={() => updateWeight(i, w)}
                    className={`btn btn-sm weight-btn ${kw.weight === w ? `btn-${WEIGHT_COLORS[w]}` : 'btn-outline-secondary'}`}
                    title={WEIGHT_LABELS[w]}
                  >
                    {w}
                  </button>
                ))}
                <span className={`weight-label text-${WEIGHT_COLORS[kw.weight]}`}>
                  {WEIGHT_LABELS[kw.weight]}
                </span>
              </div>
              <button className="btn btn-sm btn-link text-danger p-0" onClick={() => remove(i)}>
                <i className="bi bi-x-circle"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
