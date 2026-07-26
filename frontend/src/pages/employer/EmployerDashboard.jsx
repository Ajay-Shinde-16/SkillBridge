import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyJobs, deleteJob } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function EmployerDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = () => {
    getMyJobs().then(({ data }) => { setJobs(data); setLoading(false) })
  }

  useEffect(() => { fetchJobs() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this job posting?')) return
    await deleteJob(id)
    fetchJobs()
  }

  const statusColors = { OPEN: 'success', CLOSED: 'danger', PAUSED: 'warning' }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2">
          <div className="sidebar rounded-4">
            <p className="text-muted small fw-bold text-uppercase px-2 mb-2">Menu</p>
            <nav className="nav flex-column">
              <Link to="/employer/dashboard" className="nav-link active">
                <i className="bi bi-speedometer2"></i>Dashboard
              </Link>
              <Link to="/employer/post-job" className="nav-link">
                <i className="bi bi-plus-circle"></i>Post a Job
              </Link>
              <Link to="/profile" className="nav-link">
                <i className="bi bi-building"></i>Company Profile
              </Link>
            </nav>
          </div>
        </div>

        <div className="col-md-9 col-lg-10">
          <div className="page-header">
            <h3 className="fw-bold mb-1">Employer Dashboard 🏢</h3>
            <p className="mb-0 opacity-75">Manage your job postings and applicants</p>
          </div>

          {/* Stats */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Total Jobs', value: jobs.length, icon: 'bi-briefcase', color: 'primary' },
              { label: 'Open Jobs', value: jobs.filter(j => j.status === 'OPEN').length, icon: 'bi-door-open', color: 'success' },
              { label: 'Total Applicants', value: jobs.reduce((a, j) => a + (j.applicationCount || 0), 0), icon: 'bi-people', color: 'info' },
            ].map((s, i) => (
              <div key={i} className="col-4">
                <div className="stat-card">
                  <i className={`bi ${s.icon} text-${s.color} fs-3 mb-2 d-block`}></i>
                  <div className="number">{s.value}</div>
                  <div className="label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Jobs Table */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">My Job Postings</h5>
                <Link to="/employer/post-job" className="btn btn-primary">
                  <i className="bi bi-plus me-2"></i>Post New Job
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-briefcase fs-1 text-muted mb-3 d-block"></i>
                  <h5 className="text-muted">No jobs posted yet</h5>
                  <Link to="/employer/post-job" className="btn btn-primary mt-2">Post Your First Job</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Job Title</th><th>Type</th><th>Salary</th>
                        <th>Applicants</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => (
                        <tr key={job.id}>
                          <td className="fw-semibold">{job.title}</td>
                          <td><span className="badge bg-light text-dark">{job.jobType}</span></td>
                          <td className="text-muted small">
                            ₹{job.minSalary?.toLocaleString()} – ₹{job.maxSalary?.toLocaleString()}
                          </td>
                          <td>
                            <Link to={`/employer/applications/${job.id}`} className="btn btn-sm btn-outline-info">
                              <i className="bi bi-people me-1"></i>{job.applicationCount}
                            </Link>
                          </td>
                          <td>
                            <span className={`badge bg-${statusColors[job.status]}`}>{job.status}</span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Link to={`/employer/applications/${job.id}`} className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-eye"></i>
                              </Link>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(job.id)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
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
