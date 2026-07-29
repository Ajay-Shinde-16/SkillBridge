import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyApplications, getMyInterviews, getProfile } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const statusColors = {
  APPLIED: 'secondary', SHORTLISTED: 'info', INTERVIEW_SCHEDULED: 'warning',
  OFFERED: 'success', REJECTED: 'danger', ACCEPTED: 'primary'
}

export default function SeekerDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])

  useEffect(() => {
    getProfile().then(({ data }) => setProfile(data))
    getMyApplications().then(({ data }) => setApplications(data))
    getMyInterviews().then(({ data }) => setInterviews(data))
  }, [])

  const scoreColor = (s) => s >= 70 ? 'success' : s >= 40 ? 'warning' : 'danger'

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2">
          <div className="sidebar rounded-4">
            <p className="text-muted small fw-bold text-uppercase px-2 mb-2">Menu</p>
            <nav className="nav flex-column">
              <Link to="/seeker/dashboard" className="nav-link active">
                <i className="bi bi-speedometer2"></i>Dashboard
              </Link>
              <Link to="/jobs" className="nav-link">
                <i className="bi bi-search"></i>Browse Jobs
              </Link>
              <Link to="/seeker/applications" className="nav-link">
                <i className="bi bi-file-text"></i>My Applications
              </Link>
              <Link to="/seeker/interviews" className="nav-link">
                <i className="bi bi-camera-video"></i>Interviews
              </Link>
              <Link to="/profile" className="nav-link">
                <i className="bi bi-person"></i>Profile
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          <div className="page-header">
            <h3 className="fw-bold mb-1">Welcome back, {user?.name}! 👋</h3>
            <p className="mb-0 opacity-75">Here's your job search overview</p>
          </div>

          {/* Stats */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Applied', value: applications.length, icon: 'bi-send', color: 'primary' },
              { label: 'Shortlisted', value: applications.filter(a => a.status === 'SHORTLISTED').length, icon: 'bi-star', color: 'info' },
              { label: 'Interviews', value: interviews.length, icon: 'bi-camera-video', color: 'warning' },
              { label: 'Offers', value: applications.filter(a => a.status === 'OFFERED').length, icon: 'bi-trophy', color: 'success' },
            ].map((s, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="stat-card">
                  <i className={`bi ${s.icon} text-${s.color} fs-3 mb-2 d-block`}></i>
                  <div className="number">{s.value}</div>
                  <div className="label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          {profile && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">My Skills</h5>
                  <Link to="/profile" className="btn btn-outline-primary btn-sm">Edit Skills</Link>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {profile.skills?.map((s, i) => (
                    <span key={i} className={`skill-badge ${profile.verifiedSkills?.includes(s) ? 'verified' : 'unverified'}`}>
                      {profile.verifiedSkills?.includes(s) && <i className="bi bi-patch-check-fill me-1"></i>}
                      {s}
                    </span>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <span className="text-muted small">No skills added yet. <Link to="/profile">Add skills →</Link></span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recent Applications */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Recent Applications</h5>
                <Link to="/seeker/applications" className="btn btn-outline-primary btn-sm">View All</Link>
              </div>
              {applications.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-file-text fs-2 text-muted mb-2 d-block"></i>
                  <p className="text-muted">No applications yet. <Link to="/jobs">Browse jobs →</Link></p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Job</th><th>Company</th><th>Match</th><th>Status</th><th>Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map(app => (
                        <tr key={app.id}>
                          <td className="fw-semibold">{app.jobTitle}</td>
                          <td>{app.companyName}</td>
                          <td>
                            <span className={`badge bg-${scoreColor(app.skillMatchScore)}`}>
                              {app.skillMatchScore}%
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${statusColors[app.status] || 'secondary'}`}>
                              {app.status?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="text-muted small">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Upcoming Interviews</h5>
                <Link to="/seeker/interviews" className="btn btn-outline-primary btn-sm">View All</Link>
              </div>
              {interviews.length === 0 ? (
                <p className="text-muted text-center py-3">No interviews scheduled yet.</p>
              ) : (
                <div className="row g-3">
                  {interviews.slice(0, 3).map(iv => (
                    <div key={iv.id} className="col-md-4">
                      <div className="border rounded-3 p-3">
                        <h6 className="fw-bold mb-1">{iv.jobTitle}</h6>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-calendar me-1"></i>
                          {new Date(iv.scheduledDateTime).toLocaleString()}
                        </p>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-camera-video me-1"></i>{iv.mode}
                        </p>
                        <span className={`badge bg-${iv.status === 'SCHEDULED' ? 'warning' : 'secondary'}`}>
                          {iv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
