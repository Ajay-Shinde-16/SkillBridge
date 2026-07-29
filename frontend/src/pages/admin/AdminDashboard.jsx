import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllUsers, getAllApplications, getAllInterviews, getAllJobs } from '../../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0, interviews: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAllUsers(),
      getAllApplications(),
      getAllInterviews(),
    ]).then(([u, a, i]) => {
      setStats({
        users: u.data.length,
        applications: a.data.length,
        interviews: i.data.length,
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2">
          <div className="sidebar rounded-4">
            <p className="text-muted small fw-bold text-uppercase px-2 mb-2">Admin Panel</p>
            <nav className="nav flex-column">
              <Link to="/admin/dashboard" className="nav-link active">
                <i className="bi bi-speedometer2"></i>Dashboard
              </Link>
              <Link to="/admin/users" className="nav-link">
                <i className="bi bi-people"></i>Manage Users
              </Link>
              <Link to="/admin/skills" className="nav-link">
                <i className="bi bi-patch-check"></i>Verify Skills
              </Link>
              <Link to="/jobs" className="nav-link">
                <i className="bi bi-briefcase"></i>All Jobs
              </Link>
            </nav>
          </div>
        </div>

        <div className="col-md-9 col-lg-10">
          <div className="page-header">
            <h3 className="fw-bold mb-1">⚙️ Admin Dashboard</h3>
            <p className="mb-0 opacity-75">Platform overview and management</p>
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <>
              <div className="row g-3 mb-4">
                {[
                  { label: 'Total Users', value: stats.users, icon: 'bi-people-fill', color: 'primary' },
                  { label: 'Applications', value: stats.applications, icon: 'bi-file-text-fill', color: 'info' },
                  { label: 'Interviews', value: stats.interviews, icon: 'bi-camera-video-fill', color: 'warning' },
                  { label: 'Platform Status', value: 'LIVE', icon: 'bi-activity', color: 'success' },
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

              <div className="row g-3">
                {[
                  { title: 'Manage Users', desc: 'View, manage, and delete users across all roles', icon: 'bi-people', color: 'primary', link: '/admin/users' },
                  { title: 'Verify Skills', desc: 'Approve skill verifications for job seekers', icon: 'bi-patch-check', color: 'success', link: '/admin/skills' },
                  { title: 'Browse All Jobs', desc: 'View all job postings on the platform', icon: 'bi-briefcase', color: 'info', link: '/jobs' },
                ].map((card, i) => (
                  <div key={i} className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                      <div className="card-body p-4 text-center">
                        <i className={`bi ${card.icon} text-${card.color} fs-1 mb-3 d-block`}></i>
                        <h5 className="fw-bold">{card.title}</h5>
                        <p className="text-muted small mb-3">{card.desc}</p>
                        <Link to={card.link} className={`btn btn-${card.color} w-100`}>Go to {card.title}</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
