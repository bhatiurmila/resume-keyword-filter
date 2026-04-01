import React from 'react'

export default function KeywordInput({ value, onChange }) {
  return (
    <div className="card-panel">
      <h5 className="mb-3"><i className="bi bi-tags text-primary me-2"></i>Job Keywords</h5>
      <label className="form-label text-muted small">
        Enter comma-separated keywords from the job description
      </label>
      <textarea
        className="form-control"
        rows={3}
        placeholder="e.g. Python, REST API, SQL, Docker, Agile, Machine Learning"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
