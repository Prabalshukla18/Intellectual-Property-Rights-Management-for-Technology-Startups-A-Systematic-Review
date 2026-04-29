import { useState } from 'react'
import { LayoutDashboard, Search, Shield, BookOpen, FileText, Bell, ChevronRight } from 'lucide-react'
import Dashboard from './pages/Dashboard.jsx'
import PatentSearch from './pages/PatentSearch.jsx'
import TrademarkCheck from './pages/TrademarkCheck.jsx'
import PriorArt from './pages/PriorArt.jsx'
import Reports from './pages/Reports.jsx'

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'patent',     label: 'Patent Search',     icon: Search },
  { id: 'trademark',  label: 'Trademark Check',   icon: Shield },
  { id: 'prior-art',  label: 'Prior Art',         icon: BookOpen },
  { id: 'reports',    label: 'Reports',           icon: FileText },
]

const PAGES = {
  dashboard:  Dashboard,
  patent:     PatentSearch,
  trademark:  TrademarkCheck,
  'prior-art': PriorArt,
  reports:    Reports,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const Page = PAGES[page] || Dashboard

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>IP Manager</h1>
          <span>AI-Powered · v1.0</span>
        </div>

        <span className="nav-section">Main</span>
        {NAV.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className={`nav-item ${page === id ? 'active' : ''}`}
            onClick={() => setPage(id)}
          >
            <Icon size={15} />
            {label}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: '0 20px' }}>
          <div style={{
            background: 'rgba(108,143,255,0.08)',
            border: '1px solid rgba(108,143,255,0.2)',
            borderRadius: 10,
            padding: '12px',
          }}>
            <p style={{ fontSize: 11, color: '#6c8fff', fontWeight: 500, marginBottom: 4 }}>
              TechNova AI
            </p>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>Plan: Research Pro</p>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>148 assets indexed</p>
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text3)', fontSize: 13 }}>
              {NAV.find(n => n.id === page)?.label || 'Dashboard'}
            </span>
          </div>
          <div className="topbar-right">
            <span style={{
              background: 'rgba(240,101,101,0.15)',
              color: '#f06565',
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 99,
              fontWeight: 500,
            }}>
              3 Active Alerts
            </span>
            <button className="btn" style={{ padding: '6px 10px' }}>
              <Bell size={14} />
            </button>
          </div>
        </div>

        <div className="page-content">
          <Page />
        </div>
      </div>
    </div>
  )
}
