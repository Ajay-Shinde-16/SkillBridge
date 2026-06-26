import React, { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { login as loginAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()

  // Seekers/employers who are already logged in should never see this page,
  // even if they navigate here directly by URL.
  if (user && user.role === 'SEEKER') return <Navigate to="/seeker/dashboard" replace />
  if (user && user.role === 'EMPLOYER') return <Navigate to="/employer/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await loginAPI(form)
      if (data.role !== 'ADMIN') {
        setError('Access denied. This login is for Admins only.')
        setLoading(false)
        return
      }
      login(data)
      navigate('/admin/dashboard')
    } catch (err) {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: '#0f172a' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
        <div className="card border-0 shadow-lg rounded-4">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 68, height: 68, background: '#0A66C2' }}>
                <i className="bi bi-shield-lock-fill text-white" style={{ fontSize: 28 }}></i>
              </div>
              <h4 className="heading-serif fw-bold mb-1">Admin Portal</h4>
              <p className="text-muted small mb-0">SkillBridge — Restricted Access Only</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small rounded-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small text-uppercase"
                  style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>
                  Admin Email
                </label>
                <input type="email" className="form-control form-control-lg rounded-3" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@skillbridge.com" />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold small text-uppercase"
                  style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>
                  Password
                </label>
                <input type="password" className="form-control form-control-lg rounded-3" required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" />
              </div>
              <button type="submit"
                className="btn w-100 text-white fw-bold py-2 rounded-3"
                style={{ background: '#0A66C2', fontSize: '1rem' }}
                disabled={loading}>
                {loading
                  ? <span className="spinner-border spinner-border-sm me-2"></span>
                  : <i className="bi bi-shield-check me-2"></i>}
                Login as Admin
              </button>
            </form>

            <hr className="my-4" />

            <div className="text-center mb-2">
              <small className="text-muted">
                Don't have an admin account?{' '}
                <Link to="/admin/register" className="fw-semibold" style={{ color: '#7C3AED' }}>
                  <i className="bi bi-shield-plus me-1"></i>Register as Admin
                </Link>
              </small>
            </div>
            <div className="text-center">
              <small className="text-muted">
                Not an admin?{' '}
                <Link to="/login" className="fw-semibold" style={{ color: '#0A66C2' }}>
                  Go to normal login
                </Link>
              </small>
            </div>
            <div className="text-center mt-3">
              <small className="text-muted opacity-50">
                <i className="bi bi-lock-fill me-1"></i>
                Authorized personnel only
              </small>
            </div>
          </div>
        </div>
        <div className="text-center mt-3">
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
            SkillBridge Admin Portal — CDAC PGCP-AC-002
          </span>
        </div>
      </div>
    </div>
  )
}