import { useState } from 'react'
import { BookOpen, Search, X } from 'lucide-react'
import { priorArtAPI } from '../utils/api.js'

const RISK_COLOR = { HIGH: 'var(--danger)', MEDIUM: 'var(--warn)', LOW: 'var(--ok)' }

function PriorArtCard({ doc }) {
  const color = RISK_COLOR[doc.risk] || 'var(--text3)'
  return (
    <div className="result-card fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{doc.title}</div>
          <div className="mono" style={{ marginBottom: 8 }}>
            {doc.id} · {doc.source} · {doc.year}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
            {doc.abstract}
          </div>
          {doc.matching_keywords?.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {doc.matching_keywords.map(kw => (
                <span key={kw} style={{
                  fontSize: 11, padding: '2px 8px',
                  background: 'rgba(108,143,255,0.1)',
                  color: 'var(--accent)',
                  borderRadius: 99,
                  fontFamily: 'var(--mono)',
                }}>
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--mono)', color }}>
            {doc.relevance_score}%
          </div>
          <span className={`pill pill-${doc.risk[0]}`}>{doc.risk}</span>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="bar-bg">
          <div className="bar-fill" style={{ width: `${doc.relevance_score}%`, background: color }} />
        </div>
      </div>
    </div>
  )
}

const EXAMPLES = [
  'A system for accelerating neural network inference using custom hardware tensor processing units',
  'Privacy-preserving machine learning using federated training with differential privacy noise',
  'Autonomous vehicle perception using multi-sensor fusion of LIDAR and camera data',
  'Blockchain-based smart contract system for managing digital intellectual property rights',
]

export default function PriorArt() {
  const [query, setQuery] = useState('')
  const [topK, setTopK] = useState(5)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleAnalyze = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await priorArtAPI.analyze(query, topK)
      setResults(res.data.prior_art_found)
      setSearched(true)
    } catch {
      setError('Backend not reachable. Please start the API server on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <div className="card mb-20">
        <div className="card-title">Prior art analyzer</div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
          Describe your invention or patent claim. The BM25 engine will search academic papers and prior patents for conflicting prior art.
        </p>

        <textarea
          rows={5}
          placeholder="Describe your patent claim or invention in detail..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ marginBottom: 12 }}
        />

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={loading || !query.trim()}
          >
            {loading ? <span className="spinner" /> : <BookOpen size={14} />}
            Analyze Prior Art
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Top results:</span>
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
            marginTop: 12, padding: '10px 14px',
            background: 'rgba(240,101,101,0.1)',
            border: '1px solid rgba(240,101,101,0.2)',
            borderRadius: 8, fontSize: 13, color: 'var(--danger)'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Example queries */}
      {!searched && !loading && (
        <div className="card mb-20">
          <div className="card-title">Example queries — click to try</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EXAMPLES.map((ex, i) => (
              <div
                key={i}
                onClick={() => setQuery(ex)}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: 'var(--text2)',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition), color var(--transition)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text2)'
                }}
              >
                {ex}
              </div>
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <div className="empty-state">
          <BookOpen size={32} color="var(--ok)" />
          <p style={{ color: 'var(--ok)' }}>No significant prior art found for this description.</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>
              {results.length} prior art document{results.length > 1 ? 's' : ''} found
            </span>
            <button className="btn" style={{ fontSize: 12 }}
              onClick={() => { setResults([]); setSearched(false) }}>
              <X size={13} /> Clear
            </button>
          </div>
          {results.map((doc, i) => <PriorArtCard key={i} doc={doc} />)}
        </div>
      )}
    </div>
  )
}
