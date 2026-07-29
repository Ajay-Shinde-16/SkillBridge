import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'EMPLOYER') return '/employer/dashboard'
    if (user.role === 'ADMIN') return '/admin/dashboard'
    return '/seeker/dashboard'
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-layers-fill me-2"></i>SkillBridge
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/jobs"><i className="bi bi-briefcase me-1"></i>Browse Jobs</Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to={getDashboardLink()}>
                  <i className="bi bi-speedometer2 me-1"></i>Dashboard
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light btn-sm ms-2" to="/register">Sign Up</Link>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" data-bs-toggle="dropdown">
                  <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-2"
                       style={{ width: 32, height: 32, fontWeight: 700, fontSize: 14 }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><span className="dropdown-item-text text-muted small">{user.role}</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person me-2"></i>Profile</Link></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
