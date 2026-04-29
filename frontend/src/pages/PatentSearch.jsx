import { useState } from 'react'
import { Search, Upload, X } from 'lucide-react'
import { patentAPI } from '../utils/api.js'

const RISK_COLOR = { HIGH: 'var(--danger)', MEDIUM: 'var(--warn)', LOW: 'var(--ok)' }

function ResultCard({ patent }) {
  const color = RISK_COLOR[patent.risk_level] || 'var(--text3)'
  return (
    <div className="result-card fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{patent.title}</div>
          <div className="mono" style={{ marginBottom: 8 }}>
            {patent.id} · {patent.assignee} · {patent.year} · Class {patent.class}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--mono)', color }}>
            {patent.similarity_score}%
          </div>
          <span className={`pill pill-${patent.risk_level[0]}`}>{patent.risk_level}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
        {patent.abstract}
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="bar-bg">
          <div className="bar-fill" style={{
            width: `${patent.similarity_score}%`,
            background: color,
          }} />
        </div>
      </div>
    </div>
  )
}

export default function PatentSearch() {
  const [query, setQuery] = useState('')
  const [topK, setTopK] = useState(5)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await patentAPI.search(query, topK)
      setResults(res.data.results)
      setSearched(true)
    } catch {
      setError('Could not connect to backend. Make sure the API server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const res = await patentAPI.upload(file)
      setResults(res.data.similar_patents)
      setQuery(res.data.extracted_text_preview)
      setSearched(true)
    } catch {
      setError('File upload failed. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <div className="card mb-20">
        <div className="card-title">Patent similarity search</div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
          Paste your invention description, patent abstract, or upload a PDF. The AI will find similar existing patents and assess infringement risk.
        </p>

        <textarea
          rows={5}
          placeholder="Describe your invention or paste a patent abstract here..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ marginBottom: 12 }}
        />

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
          >
            {loading ? <span className="spinner" /> : <Search size={14} />}
            Find Similar Patents
          </button>

          <label className="btn" style={{ cursor: 'pointer' }}>
            <Upload size={14} />
            Upload PDF
            <input type="file" accept=".pdf,.txt" onChange={handleUpload} style={{ display: 'none' }} />
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Results:</span>
            <select
              value={topK}
              onChange={e => setTopK(Number(e.target.value))}
              style={{ width: 70 }}
            >
              {[3, 5, 8, 10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: 12, padding: '10px 14px', background: 'rgba(240,101,101,0.1)',
            border: '1px solid rgba(240,101,101,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)'
          }}>
            {error}
          </div>
        )}
      </div>

      {searched && results.length === 0 && !loading && (
        <div className="empty-state">
          <Search size={32} color="var(--text3)" />
          <p>No similar patents found. Try a different description.</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>
              Found {results.length} similar patents
            </span>
            <button className="btn" style={{ fontSize: 12 }} onClick={() => { setResults([]); setSearched(false); }}>
              <X size={13} /> Clear
            </button>
          </div>
          {results.map((p, i) => <ResultCard key={i} patent={p} />)}
        </div>
      )}

      {!searched && !loading && (
        <div className="card" style={{ opacity: 0.6 }}>
          <div className="card-title">How it works</div>
          <div className="grid-3" style={{ gap: 12 }}>
            {[
              ['1. Input', 'Enter an invention description or upload a patent PDF document.'],
              ['2. AI Analysis', 'Sentence Transformers encode your text into semantic embeddings.'],
              ['3. Results', 'FAISS searches 100k+ patents and returns ranked similarity scores.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: 14, background: 'var(--bg3)', borderRadius: 8 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
