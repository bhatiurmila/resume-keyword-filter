import React, { useState } from 'react'
import axios from 'axios'
import UploadZone from './components/UploadZone'
import KeywordInput from './components/KeywordInput'
import RankList from './components/RankList'

const API = 'http://127.0.0.1:8000'

export default function App() {
  const [files, setFiles]       = useState([])
  const [keywords, setKeywords] = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const analyze = async () => {
    setError('')
    if (!keywords.trim()) return setError('Please enter at least one keyword.')
    if (!files.length)    return setError('Please upload at least one resume.')

    const form = new FormData()
    files.forEach(f => form.append('files', f))
    form.append('keywords', keywords)

    setLoading(true)
    setResults([])
    try {
      const { data } = await axios.post(`${API}/upload`, form)
      setResults(data.results)
    } catch {
      setError('Cannot connect to backend. Make sure the Python server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="hero">
        <h1><i className="bi bi-file-earmark-person me-2"></i>Resume Keyword Ranker</h1>
        <p>Upload resumes, enter job keywords, and instantly see who ranks highest.</p>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            <UploadZone files={files} setFiles={setFiles} />
            <KeywordInput value={keywords} onChange={setKeywords} />

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill"></i> {error}
              </div>
            )}

            <div className="text-center mb-4">
              <button className="btn btn-primary btn-lg px-5" onClick={analyze} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Analyzing...</>
                  : <><i className="bi bi-search me-2"></i>Analyze &amp; Rank</>
                }
              </button>
            </div>

            <RankList results={results} />

          </div>
        </div>
      </div>
    </>
  )
}
