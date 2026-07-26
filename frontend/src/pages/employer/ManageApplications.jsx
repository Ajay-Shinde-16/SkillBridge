import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getJobApplications, updateApplicationStatus } from '../../services/api'

const statusOptions = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED', 'ACCEPTED']
const statusColors = {
  APPLIED: 'secondary', SHORTLISTED: 'info', INTERVIEW_SCHEDULED: 'warning',
  OFFERED: 'success', REJECTED: 'danger', ACCEPTED: 'primary'
}

export default function ManageApplications() {
  const { jobId } = useParams()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchApplications = () => {
    getJobApplications(jobId).then(({ data }) => {
      const sorted = [...data].sort((a, b) => b.skillMatchScore - a.skillMatchScore)
      setApplications(sorted)
      setLoading(false)
    })
  }

  useEffect(() => { fetchApplications() }, [jobId])

  const handleStatusChange = async (id, status) => {
    setUpdating(id)
    try {
      await updateApplicationStatus(id, { status })
      fetchApplications()
    } catch (e) { console.error(e) }
    finally { setUpdating(null) }
  }

  const scoreColor = (s) => s >= 70 ? 'success' : s >= 40 ? 'warning' : 'danger'

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <Link to="/employer/dashboard" className="btn btn-outline-secondary me-3">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div>
          <h3 className="fw-bold mb-0">Applications</h3>
          <p className="text-muted mb-0">{applications.length} applicants — sorted by skill match score</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : applications.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-people fs-1 text-muted mb-3 d-block"></i>
          <h5 className="text-muted">No applications yet for this job</h5>
        </div>
      ) : (
        <div className="row g-3">
          {applications.map(app => (
            <div key={app.id} className="col-12">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-md-1 text-center">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                           style={{ width: 44, height: 44, fontWeight: 700 }}>
                        {app.seekerName?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <h6 className="fw-bold mb-0">{app.seekerName}</h6>
                      <small className="text-muted">{app.seekerEmail}</small>
                    </div>
                    <div className="col-md-2 text-center">
                      <div className={`fw-bold text-${scoreColor(app.skillMatchScore)} fs-5`}>
                        {app.skillMatchScore}%
                      </div>
                      <small className="text-muted">Match Score</small>
                    </div>
                    <div className="col-md-2">
                      <span className={`badge bg-${statusColors[app.status]} px-3 py-2`}>
                        {app.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="col-md-2">
                      <select className="form-select form-select-sm"
                        value={app.status}
                        disabled={updating === app.id}
                        onChange={e => handleStatusChange(app.id, e.target.value)}>
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2 text-end">
                      {app.status === 'SHORTLISTED' && (
                        <Link to={`/employer/schedule/${app.id}`}
                          className="btn btn-sm btn-warning">
                          <i className="bi bi-calendar-plus me-1"></i>Schedule
                        </Link>
                      )}
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noreferrer"
                           className="btn btn-sm btn-outline-primary ms-1">
                          <i className="bi bi-file-pdf"></i>
                        </a>
                      )}
                    </div>
                  </div>
                  {app.coverLetter && (
                    <div className="mt-3 p-3 bg-light rounded-3">
                      <small className="fw-semibold text-muted">Cover Letter: </small>
                      <small>{app.coverLetter}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
