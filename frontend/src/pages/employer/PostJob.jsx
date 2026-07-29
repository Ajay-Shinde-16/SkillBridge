import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createJob } from '../../services/api'

export default function PostJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', jobType: 'FULL_TIME', experienceLevel: 'MID',
    remote: true, minSalary: '', maxSalary: '', requiredSkills: '', deadline: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        minSalary: parseFloat(form.minSalary),
        maxSalary: parseFloat(form.maxSalary),
      }
      await createJob(payload)
      navigate('/employer/dashboard')
    } catch (e) {
      setError(e.response?.data || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-3 col-lg-2">
          <div className="sidebar rounded-4">
            <nav className="nav flex-column">
              <Link to="/employer/dashboard" className="nav-link">
                <i className="bi bi-speedometer2"></i>Dashboard
              </Link>
              <Link to="/employer/post-job" className="nav-link active">
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
            <h3 className="fw-bold mb-1"><i className="bi bi-plus-circle me-2"></i>Post a New Job</h3>
            <p className="mb-0 opacity-75">Fill in the details to attract the right candidates</p>
          </div>
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Job Title *</label>
                    <input className="form-control form-control-lg" required
                      value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Senior React Developer" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Job Type *</label>
                    <select className="form-select" value={form.jobType}
                      onChange={e => setForm({ ...form, jobType: e.target.value })}>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="FREELANCE">Freelance</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Experience Level *</label>
                    <select className="form-select" value={form.experienceLevel}
                      onChange={e => setForm({ ...form, experienceLevel: e.target.value })}>
                      <option value="ENTRY">Entry Level (0-2 yrs)</option>
                      <option value="MID">Mid Level (2-5 yrs)</option>
                      <option value="SENIOR">Senior Level (5+ yrs)</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Min Salary (₹/year) *</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input type="number" className="form-control" required
                        value={form.minSalary} onChange={e => setForm({ ...form, minSalary: e.target.value })}
                        placeholder="500000" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Max Salary (₹/year) *</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input type="number" className="form-control" required
                        value={form.maxSalary} onChange={e => setForm({ ...form, maxSalary: e.target.value })}
                        placeholder="1200000" />
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Required Skills * (comma separated)</label>
                    <input className="form-control" required
                      value={form.requiredSkills} onChange={e => setForm({ ...form, requiredSkills: e.target.value })}
                      placeholder="React, Java, Spring Boot, MongoDB, REST API" />
                    <small className="text-muted">These will be used to calculate candidate skill match scores</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Job Description *</label>
                    <textarea className="form-control" rows={6} required
                      value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe the role, responsibilities, what you're looking for..." />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Application Deadline</label>
                    <input type="datetime-local" className="form-control"
                      value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div className="col-md-6 d-flex align-items-end">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="remoteSwitch"
                        checked={form.remote} onChange={e => setForm({ ...form, remote: e.target.checked })} />
                      <label className="form-check-label fw-semibold" htmlFor="remoteSwitch">
                        <i className="bi bi-globe me-2 text-primary"></i>Remote Position
                      </label>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-3 mt-4">
                  <button type="submit" className="btn btn-primary btn-lg px-5" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                    <i className="bi bi-send me-2"></i>Post Job
                  </button>
                  <Link to="/employer/dashboard" className="btn btn-outline-secondary btn-lg">Cancel</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
