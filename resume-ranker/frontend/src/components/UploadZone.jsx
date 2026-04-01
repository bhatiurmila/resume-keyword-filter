import React, { useRef, useState } from 'react'

export default function UploadZone({ files, setFiles }) {
  const inputRef = useRef()
  const [over, setOver] = useState(false)

  const addFiles = (incoming) => {
    const pdfs = [...incoming].filter(f => f.type === 'application/pdf')
    setFiles(prev => {
      const names = prev.map(f => f.name)
      return [...prev, ...pdfs.filter(f => !names.includes(f.name))]
    })
  }

  const remove = (name) => setFiles(prev => prev.filter(f => f.name !== name))

  return (
    <div className="card-panel">
      <h5 className="mb-3"><i className="bi bi-cloud-upload text-primary me-2"></i>Upload Resumes</h5>

      <div
        className={`drop-zone${over ? ' over' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files) }}
      >
        <i className="bi bi-file-earmark-arrow-up"></i>
        Drag &amp; drop PDF resumes here, or click to browse
        <div><small className="text-muted">Multiple files supported</small></div>
      </div>

      <input ref={inputRef} type="file" accept=".pdf" multiple hidden
        onChange={e => addFiles(e.target.files)} />

      <div className="mt-3">
        {files.map(f => (
          <div key={f.name} className="file-row">
            <i className="bi bi-file-earmark-pdf text-danger"></i>
            <span className="flex-grow-1">{f.name}</span>
            <small className="text-muted">{(f.size / 1024).toFixed(1)} KB</small>
            <button className="btn btn-sm btn-link text-danger p-0" onClick={() => remove(f.name)}>
              <i className="bi bi-x-circle"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
