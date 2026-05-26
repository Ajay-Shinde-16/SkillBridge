import React, { useState, useEffect } from 'react'
import CompanyLogo from '../../components/CompanyLogo'
import { Link } from 'react-router-dom'
import { getAllApplications } from '../../services/api'

const statusColors = {
  APPLIED: 'secondary', SHORTLISTED: 'info', INTERVIEW_SCHEDULED: 'info',
  OFFERED: 'success', REJECTED: 'danger', ACCEPTED: 'primary'
}
const scoreColor = s => s >= 70 ? '#057642' : s >= 40 ? '#d97706' : '#dc3545'

export default function AllApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    getAllApplications()
      .then(({ data }) => {
        const sorted = [...data].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        setApplications(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = applications.filter(a =>
    (a.seekerName?.toLowerCase().includes(search.toLowerCase()) ||
     a.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
     a.companyName?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === '' || a.status === statusFilter)
  )

  return (
    <div className="container-fluid p-0">
      <div className="d-flex">
        <div className="sidebar d-none d-md-block">
          <p className="text-muted small fw-bold text-uppercase px-2 mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.8px' }}>Admin Panel</p>
          <nav className="nav flex-column">
            {[
              { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
              { to: '/admin/users', icon: 'bi-people', label: 'Manage Users' },
              { to: '/admin/skills', icon: 'bi-patch-check', label: 'Verify Skills' },
              { to: '/admin/jobs', icon: 'bi-briefcase', label: 'Manage Jobs' },
              { to: '/admin/applications', icon: 'bi-file-text', label: 'All Applications' },
            ].map((item, i) => (
              <Link key={i} to={item.to} className="nav-link"><i className={`bi ${item.icon}`}></i>{item.label}</Link>
            ))}
          </nav>
        </div>
        <div className="flex-fill main-content p-3">
          <div className="welcome-header">
            <h2 className="fw-bold mb-1"><i className="bi bi-file-text me-2"></i>All Applications</h2>
            <p className="mb-0">{applications.length} total applications on the platform</p>
          </div>

          {/* Stats */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Applied', value: applications.filter(a => a.status === 'APPLIED').length, color: '#6c757d' },
              { label: 'Shortlisted', value: applications.filter(a => a.status === 'SHORTLISTED').length, color: '#0ea5e9' },
              { label: 'Interviews', value: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length, color: '#0F766E' },
              { label: 'Offered', value: applications.filter(a => a.status === 'OFFERED').length, color: '#057642' },
              { label: 'Accepted', value: applications.filter(a => a.status === 'ACCEPTED').length, color: '#0A66C2' },
              { label: 'Rejected', value: applications.filter(a => a.status === 'REJECTED').length, color: '#dc3545' },
            ].map((s, i) => (
              <div key={i} className="col-4 col-md-2">
                <div className="stat-card">
                  <div className="number" style={{ fontSize: '1.4rem', color: s.color }}>{s.value}</div>
                  <div className="label" style={{ fontSize: '0.72rem' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex gap-2 mb-3 flex-wrap">
                <div className="input-group" style={{ maxWidth: 280 }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input className="form-control border-start-0 rounded-end-3"
                    placeholder="Search seeker, job or company..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select rounded-3" style={{ maxWidth: 180 }}
                  value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  {Object.keys(statusColors).map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <span className="text-muted small align-self-center ms-auto">{filtered.length} results</span>
              </div>

              {loading ? (
                <div className="text-center py-4"><div className="spinner-border" style={{ color: '#0A66C2' }}></div></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th>Seeker</th>
                        <th>Job Title</th>
                        <th className="d-none d-md-table-cell">Company</th>
                        <th>Match</th>
                        <th>Status</th>
                        <th className="d-none d-lg-table-cell">Applied On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(app => (
                        <tr key={app.id}>
                          <td>
                            <div className="fw-semibold">{app.seekerName}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{app.seekerEmail}</div>
                          </td>
                          <td className="fw-semibold">{app.jobTitle}</td>
                          <td className="d-none d-md-table-cell"><span className="company-badge"><i className="bi bi-building"></i>{app.companyName}</span></td>
                          <td>
                            <span className="fw-bold" style={{ color: scoreColor(app.skillMatchScore) }}>
                              {app.skillMatchScore}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${statusColors[app.status]} rounded-pill`} style={{ fontSize: '0.7rem' }}>
                              {app.status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="d-none d-lg-table-cell text-muted small">
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
