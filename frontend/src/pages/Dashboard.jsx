import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { dashboardAPI } from '../utils/api.js'
import { TrendingUp, AlertTriangle, FileText, Shield } from 'lucide-react'

const RISK_COLORS = { HIGH: '#f06565', MEDIUM: '#f0a840', LOW: '#52c48a' }

function MetricCard({ label, value, sub, subColor }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-val">{value}</div>
      {sub && <div className="metric-sub" style={{ color: subColor || 'var(--text3)' }}>{sub}</div>}
    </div>
  )
}

function RiskBar({ label, score }) {
  const color = score >= 70 ? 'var(--danger)' : score >= 50 ? 'var(--warn)' : 'var(--ok)'
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
        <span style={{ color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--mono)', color }}>{score}%</span>
      </div>
      <div className="bar-bg">
        <div className="bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardAPI.summary(),
      dashboardAPI.trends(),
      dashboardAPI.alerts(),
    ]).then(([s, t, a]) => {
      setSummary(s.data)
      setTrends(t.data)
      setAlerts(a.data)
    }).catch(() => {
      // Fallback data if API is not running
      setSummary({
        overall_risk_score: 72, risk_level: 'HIGH',
        patents_analyzed: 148, patents_delta: 12,
        trademark_conflicts: 7, trademark_high_risk: 2,
        prior_art_matches: 23, prior_art_domains: 4,
        risk_dimensions: { patent: 85, trademark: 74, prior_art: 69, geographic: 55, litigation: 40 },
        trademark_by_category: [
          { category: 'Logo / image', score: 88 },
          { category: 'Brand name',   score: 74 },
          { category: 'Slogan',       score: 55 },
          { category: 'Domain name',  score: 31 },
          { category: 'Color palette',score: 18 },
        ],
        risk_distribution: { high: 21, medium: 45, low: 34 },
        recent_records: [
          { name: 'NovaMind logo',             type: 'Trademark', similarity: 88, risk: 'HIGH',   status: 'Conflict detected' },
          { name: 'US10234567 — Neural iface',  type: 'Patent',    similarity: 85, risk: 'HIGH',   status: 'High similarity' },
          { name: 'EdgeSync brand name',        type: 'Trademark', similarity: 74, risk: 'MEDIUM', status: 'Review pending' },
          { name: 'AI scheduler claim 4',       type: 'Prior Art', similarity: 69, risk: 'MEDIUM', status: 'Prior art found' },
          { name: 'US09812345 — Edge ML',       type: 'Patent',    similarity: 65, risk: 'MEDIUM', status: 'Under analysis' },
          { name: 'Federated model patent',     type: 'Prior Art', similarity: 61, risk: 'MEDIUM', status: 'Prior art found' },
          { name: 'US08765432 — Secure encl',   type: 'Patent',    similarity: 44, risk: 'LOW',    status: 'Clear' },
          { name: 'TechNova wordmark',          type: 'Trademark', similarity: 32, risk: 'LOW',    status: 'Clear' },
        ],
      })
      setTrends({
        labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
        patent_filings:   [14, 18, 12, 22, 19, 27],
        tm_conflicts:     [3,  5,  4,  7,  6,  9],
        risk_score_trend: [58, 61, 65, 68, 71, 72],
      })
      setAlerts([
        { level: 'HIGH',   title: 'Patent infringement risk',     message: 'Neural interface patent US10234567 — 91% similarity.',      time: '2h ago',  module: 'Patent' },
        { level: 'HIGH',   title: 'Trademark conflict — EU',       message: 'NovaMind logo conflicts with EU TM-2018-04421 (88%).',       time: '1d ago',  module: 'Trademark' },
        { level: 'MEDIUM', title: 'Brand name phonetic conflict',  message: 'EdgeSync similar to 3 registered marks in class 42.',        time: '3d ago',  module: 'Trademark' },
      ])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text3)' }}>Loading dashboard...</span>
    </div>
  )

  const radarData = summary ? Object.entries(summary.risk_dimensions).map(([key, val]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
  })) : []

  const trendData = trends ? trends.labels.map((label, i) => ({
    label,
    Patents:    trends.patent_filings[i],
    Trademarks: trends.tm_conflicts[i],
    'Risk Score': trends.risk_score_trend[i],
  })) : []

  const pieData = summary ? [
    { name: 'High',   value: summary.risk_distribution.high,   color: '#f06565' },
    { name: 'Medium', value: summary.risk_distribution.medium, color: '#f0a840' },
    { name: 'Low',    value: summary.risk_distribution.low,    color: '#52c48a' },
  ] : []

  return (
    <div className="fade-up">
      {/* Metric cards */}
      <div className="metric-grid">
        <MetricCard
          label="Overall IP risk score"
          value={`${summary?.overall_risk_score}/100`}
          sub={`${summary?.risk_level} — action needed`}
          subColor="var(--danger)"
        />
        <MetricCard
          label="Patents analyzed"
          value={summary?.patents_analyzed}
          sub={`+${summary?.patents_delta} this month`}
        />
        <MetricCard
          label="Trademark conflicts"
          value={summary?.trademark_conflicts}
          sub={`${summary?.trademark_high_risk} high-risk`}
          subColor="var(--danger)"
        />
        <MetricCard
          label="Prior art matches"
          value={summary?.prior_art_matches}
          sub={`Across ${summary?.prior_art_domains} domains`}
        />
      </div>

      {/* Row 1: Radar + Risk bars */}
      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-title">IP risk dimensions</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9a9895', fontSize: 11 }} />
              <Radar name="Risk" dataKey="value" stroke="#6c8fff" fill="#6c8fff" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Trademark conflict by category</div>
          {summary?.trademark_by_category.map(({ category, score }) => (
            <RiskBar key={category} label={category} score={score} />
          ))}
        </div>
      </div>

      {/* Row 2: Trend chart + Alerts */}
      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-title">Monthly trends</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <XAxis dataKey="label" tick={{ fill: '#5e5d5a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5e5d5a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1c1d20', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9a9895' }}
              />
              <Line type="monotone" dataKey="Patents"    stroke="#6c8fff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Trademarks" stroke="#f06565" strokeWidth={2} dot={false} strokeDasharray="4 3" />
              <Line type="monotone" dataKey="Risk Score" stroke="#f0a840" strokeWidth={2} dot={false} strokeDasharray="2 3" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {[['Patents','#6c8fff'], ['Trademarks','#f06565'], ['Risk Score','#f0a840']].map(([l, c]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text3)' }}>
                <span style={{ width: 20, height: 2, background: c, display: 'inline-block', borderRadius: 2 }} />
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Active alerts</div>
          {alerts.map((a, i) => (
            <div key={i} className="alert-item">
              <div className={`alert-dot dot-${a.level}`} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{a.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{a.time} · {a.module}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Table + Pie */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">All IP records</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Similarity</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {summary?.recent_records.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 12 }}>{r.name}</td>
                    <td><span className="mono">{r.type}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="bar-bg" style={{ width: 60 }}>
                          <div className={`bar-fill bar-${r.risk[0]}`} style={{ width: `${r.similarity}%` }} />
                        </div>
                        <span className="mono">{r.similarity}%</span>
                      </div>
                    </td>
                    <td><span className={`pill pill-${r.risk[0]}`}>{r.risk}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Risk distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1c1d20', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
            {pieData.map(({ name, value, color }) => (
              <span key={name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}>
                <span style={{ width: 10, height: 10, background: color, borderRadius: 2, display: 'inline-block' }} />
                {name} {value}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
