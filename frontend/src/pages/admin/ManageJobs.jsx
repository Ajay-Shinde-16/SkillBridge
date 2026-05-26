import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllJobs, deleteJob } from '../../services/api'

export default function ManageJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleting, setDeleting] = useState(null)

  const fetchJobs = () => {
    setLoading(true)
    getAllJobs().then(({ data }) => { setJobs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { fetchJobs(); const t=setInterval(fetchJobs,30000); return ()=>clearInterval(t) }, [])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete job "${title}"? This will also delete all applications for this job.`)) return
    setDeleting(id)
    try { await deleteJob(id); fetchJobs() }
    catch (e) { alert('Failed to delete job') } finally { setDeleting(null) }
  }

  const filtered = jobs.filter(j =>
    (j.title?.toLowerCase().includes(search.toLowerCase()) ||
     j.companyName?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === '' || j.status === statusFilter)
  )

  const statusColors = { OPEN: 'success', CLOSED: 'danger', PAUSED: 'warning' }

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
            <h2 className="fw-bold mb-1"><i className="bi bi-briefcase me-2"></i>Manage All Jobs</h2>
            <p className="mb-0">{jobs.length} total job postings on the platform</p>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex gap-2 mb-3 flex-wrap">
                <div className="input-group" style={{ maxWidth: 280 }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input className="form-control border-start-0 rounded-end-3"
                    placeholder="Search title or company..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select rounded-3" style={{ maxWidth: 140 }}
                  value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="PAUSED">Paused</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <span className="text-muted small align-self-center ms-auto">
                  {filtered.length} results
                </span>
              </div>

              {loading ? (
                <div className="text-center py-4"><div className="spinner-border" style={{ color: '#0A66C2' }}></div></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th className="d-none d-md-table-cell">Salary</th>
                        <th>Applicants</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(job => (
                        <tr key={job.id} style={{ opacity: deleting === job.id ? 0.5 : 1 }}>
                          <td className="fw-semibold">{job.title}</td>
                          <td><span className="company-badge"><i className="bi bi-building"></i>{job.companyName}</span></td>
                          <td className="d-none d-md-table-cell text-muted small">
                            ₹{job.minSalary?.toLocaleString()}–{job.maxSalary?.toLocaleString()}
                          </td>
                          <td>
                            <span className="badge rounded-pill" style={{ background: '#EEF3F8', color: '#0A66C2' }}>
                              {job.applicationCount || 0}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${statusColors[job.status]} rounded-pill`} style={{ fontSize: '0.72rem' }}>
                              {job.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm rounded-pill"
                              style={{ background: '#FEE2E2', color: '#991b1b', fontSize: '0.72rem', padding: '3px 10px' }}
                              disabled={deleting === job.id}
                              onClick={() => handleDelete(job.id, job.title)}>
                              {deleting === job.id
                                ? <span className="spinner-border spinner-border-sm" style={{ width: 10, height: 10 }}></span>
                                : <><i className="bi bi-trash me-1"></i>Delete</>}
                            </button>
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
