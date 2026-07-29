import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { searchJobs } from '../services/api'

const statusColor = { OPEN: 'success', CLOSED: 'danger', PAUSED: 'warning' }

export default function JobList() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    keyword: '', minSalary: '', maxSalary: '', remote: '', experienceLevel: ''
  })

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.keyword) params.keyword = filters.keyword
      if (filters.minSalary) params.minSalary = filters.minSalary
      if (filters.maxSalary) params.maxSalary = filters.maxSalary
      if (filters.remote !== '') params.remote = filters.remote
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel
      const { data } = await searchJobs(params)
      setJobs(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [])

  return (
    <div className="container py-4">
      <div className="page-header">
        <h2 className="fw-bold mb-1"><i className="bi bi-briefcase me-2"></i>Browse Remote Jobs</h2>
        <p className="mb-0 opacity-75">{jobs.length} positions available</p>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Search</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input className="form-control" placeholder="Job title, skill, keyword..."
                  value={filters.keyword} onChange={e => setFilters({ ...filters, keyword: e.target.value })} />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold small">Min Salary (₹)</label>
              <input type="number" className="form-control" placeholder="e.g. 500000"
                value={filters.minSalary} onChange={e => setFilters({ ...filters, minSalary: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold small">Max Salary (₹)</label>
              <input type="number" className="form-control" placeholder="e.g. 2000000"
                value={filters.maxSalary} onChange={e => setFilters({ ...filters, maxSalary: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold small">Remote</label>
              <select className="form-select" value={filters.remote}
                onChange={e => setFilters({ ...filters, remote: e.target.value })}>
                <option value="">All</option>
                <option value="true">Remote Only</option>
                <option value="false">On-site</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-semibold small">Experience</label>
              <select className="form-select" value={filters.experienceLevel}
                onChange={e => setFilters({ ...filters, experienceLevel: e.target.value })}>
                <option value="">All Levels</option>
                <option value="ENTRY">Entry</option>
                <option value="MID">Mid</option>
                <option value="SENIOR">Senior</option>
              </select>
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary px-4" onClick={fetchJobs}>
                <i className="bi bi-search me-2"></i>Search
              </button>
              <button className="btn btn-outline-secondary" onClick={() => {
                setFilters({ keyword: '', minSalary: '', maxSalary: '', remote: '', experienceLevel: '' })
                setTimeout(fetchJobs, 100)
              }}>Clear</button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
          <h5 className="text-muted">No jobs found. Try different filters.</h5>
        </div>
      ) : (
        <div className="row g-3">
          {jobs.map(job => (
            <div key={job.id} className="col-md-6 col-lg-4">
              <div className="job-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold mb-1">{job.title}</h6>
                    <p className="text-muted small mb-0">
                      <i className="bi bi-building me-1"></i>{job.companyName}
                    </p>
                  </div>
                  {job.remote && <span className="badge bg-success-subtle text-success">Remote</span>}
                </div>
                <div className="mb-3">
                  <span className="text-muted small">
                    <i className="bi bi-currency-rupee"></i>
                    {job.minSalary?.toLocaleString()} – {job.maxSalary?.toLocaleString()} / yr
                  </span>
                  <span className="badge bg-light text-dark ms-2">{job.experienceLevel}</span>
                  <span className="badge bg-light text-dark ms-1">{job.jobType}</span>
                </div>
                <div className="mb-3 d-flex flex-wrap gap-1">
                  {job.requiredSkills?.slice(0, 4).map((s, i) => (
                    <span key={i} className="skill-badge unverified">{s}</span>
                  ))}
                  {job.requiredSkills?.length > 4 && (
                    <span className="skill-badge unverified">+{job.requiredSkills.length - 4}</span>
                  )}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-people me-1"></i>{job.applicationCount} applied
                  </small>
                  <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
                    View Job <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
