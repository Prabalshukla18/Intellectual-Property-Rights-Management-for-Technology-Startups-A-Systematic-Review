import { useState } from 'react'
import { Shield, Upload, Search } from 'lucide-react'
import { trademarkAPI } from '../utils/api.js'

const NICE_CLASSES = [
  { value: 9,  label: '9 — Electronics & software' },
  { value: 35, label: '35 — Business services' },
  { value: 42, label: '42 — Technology & SaaS' },
  { value: 38, label: '38 — Telecommunications' },
  { value: 25, label: '25 — Clothing & apparel' },
]

const RISK_COLOR = { HIGH: 'var(--danger)', MEDIUM: 'var(--warn)', LOW: 'var(--ok)' }

function ConflictCard({ conflict }) {
  const color = RISK_COLOR[conflict.risk] || 'var(--text3)'
  return (
    <div className="result-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 500, marginBottom: 3 }}>{conflict.mark}</div>
          <div className="mono">{conflict.owner} · {conflict.country} · Class {conflict.class || '—'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--mono)', color }}>
            {conflict.similarity}%
          </div>
          <span className={`pill pill-${conflict.risk[0]}`}>{conflict.risk}</span>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="bar-bg">
          <div className="bar-fill" style={{ width: `${conflict.similarity}%`, background: color }} />
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
        Match type: {conflict.match_type}
      </div>
    </div>
  )
}

export default function TrademarkCheck() {
  const [brandName, setBrandName] = useState('')
  const [niceClass, setNiceClass] = useState(42)
  const [imageFile, setImageFile] = useState(null)
  const [mode, setMode] = useState('text')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleTextCheck = async () => {
    if (!brandName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await trademarkAPI.checkText(brandName, niceClass)
      setResults(res.data.conflicts)
      setSearched(true)
    } catch {
      setError('Backend not reachable. Please start the API server.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageCheck = async () => {
    if (!imageFile) return
    setLoading(true)
    setError(null)
    try {
      const res = await trademarkAPI.checkImage(imageFile)
      setResults(res.data.conflicts)
      setSearched(true)
    } catch {
      setError('Backend not reachable. Please start the API server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <div className="card mb-20">
        <div className="card-title">Trademark conflict detector</div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['text', 'Text / Brand Name'], ['image', 'Logo Image']].map(([m, label]) => (
            <button
              key={m}
              className={`btn ${mode === m ? 'btn-primary' : ''}`}
              onClick={() => { setMode(m); setResults([]); setSearched(false); }}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'text' ? (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Enter brand name (e.g. NovaMind)"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTextCheck()}
                style={{ flex: 1, minWidth: 200 }}
              />
              <select
                value={niceClass}
                onChange={e => setNiceClass(Number(e.target.value))}
                style={{ width: 220 }}
              >
                {NICE_CLASSES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleTextCheck}
              disabled={loading || !brandName.trim()}
            >
              {loading ? <span className="spinner" /> : <Search size={14} />}
              Check Trademark
            </button>
          </div>
        ) : (
          <div>
            <label
              className="upload-zone"
              style={{ display: 'block', marginBottom: 12 }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
              <Upload size={28} color="var(--text3)" style={{ marginBottom: 8 }} />
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>
                {imageFile ? imageFile.name : 'Click to upload your logo (PNG, JPG, SVG)'}
              </p>
            </label>
            <button
              className="btn btn-primary"
              onClick={handleImageCheck}
              disabled={loading || !imageFile}
            >
              {loading ? <span className="spinner" /> : <Shield size={14} />}
              Check Logo
            </button>
          </div>
        )}

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
          <Shield size={32} color="var(--ok)" />
          <p style={{ color: 'var(--ok)' }}>No conflicts found — mark appears to be clear.</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>
              {results.length} conflict{results.length > 1 ? 's' : ''} detected
            </span>
            <span className={`pill pill-${results[0].risk[0]}`}>
              Highest risk: {results[0].risk}
            </span>
          </div>
          {results.map((c, i) => <ConflictCard key={i} conflict={c} />)}
        </div>
      )}
    </div>
  )
}
