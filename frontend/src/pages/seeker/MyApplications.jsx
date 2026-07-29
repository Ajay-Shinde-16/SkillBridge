import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyApplications } from '../../services/api'

const statusColors = {
  APPLIED: 'secondary', SHORTLISTED: 'info', INTERVIEW_SCHEDULED: 'warning',
  OFFERED: 'success', REJECTED: 'danger', ACCEPTED: 'primary'
}

const statusIcons = {
  APPLIED: 'bi-send', SHORTLISTED: 'bi-star-fill', INTERVIEW_SCHEDULED: 'bi-camera-video',
  OFFERED: 'bi-trophy-fill', REJECTED: 'bi-x-circle', ACCEPTED: 'bi-check-circle-fill'
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyApplications().then(({ data }) => { setApplications(data); setLoading(false) })
  }, [])

  return (
    <div className="container py-4">
      <div className="page-header">
        <h3 className="fw-bold mb-1"><i className="bi bi-file-text me-2"></i>My Applications</h3>
        <p className="mb-0 opacity-75">{applications.length} total applications</p>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : applications.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-file-text fs-1 text-muted mb-3 d-block"></i>
          <h5 className="text-muted">No applications yet</h5>
          <Link to="/jobs" className="btn btn-primary mt-2">Browse Jobs</Link>
        </div>
      ) : (
        <div className="row g-3">
          {applications.map(app => (
            <div key={app.id} className="col-12">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-md-5">
                      <h5 className="fw-bold mb-1">{app.jobTitle}</h5>
                      <p className="text-muted mb-0">
                        <i className="bi bi-building me-1"></i>{app.companyName}
                      </p>
                    </div>
                    <div className="col-md-2 text-center">
                      <div className="fw-bold text-primary">{app.skillMatchScore}%</div>
                      <div className="text-muted small">Skill Match</div>
                    </div>
                    <div className="col-md-3 text-center">
                      <span className={`badge bg-${statusColors[app.status]} px-3 py-2`}>
                        <i className={`bi ${statusIcons[app.status]} me-1`}></i>
                        {app.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="col-md-2 text-muted small text-end">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                  {app.employerNote && (
                    <div className="mt-3 p-3 bg-light rounded-3">
                      <small className="text-muted fw-semibold">Employer Note: </small>
                      <small>{app.employerNote}</small>
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
