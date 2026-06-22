import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, idleLoggedOut, setIdleLoggedOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (idleLoggedOut) {
      setError("You were logged out due to 5 minutes of inactivity. Please login again.")
      setIdleLoggedOut(false)
    }
  }, [idleLoggedOut, setIdleLoggedOut])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await loginAPI(form)
      login(data)
      if (data.role === 'EMPLOYER') navigate('/employer/dashboard')
      else if (data.role === 'ADMIN') navigate('/admin/dashboard')
      else navigate('/seeker/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-5">

              {/* Logo + Title */}
              <div className="text-center mb-4">
                <img src="/logo.svg" alt="SkillBridge" width="52" height="52"
                  style={{ borderRadius: 14 }}
                  onError={e => { e.target.style.display = 'none' }} />
                <h3 className="fw-bold mt-2 mb-1">Welcome Back</h3>
                <p className="text-muted small">Sign in to SkillBridge</p>
              </div>

              {/* Error */}
              {error && (
                <div className="alert alert-danger py-2 small rounded-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <input type="email" className="form-control form-control-lg rounded-3" required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com" />
                </div>

                {/* Password + Forgot Password link */}
                <div className="mb-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold small mb-0">Password</label>
                    {/* ── FORGOT PASSWORD LINK ── */}
                    <Link to="/forgot-password"
                      className="small fw-semibold"
                      style={{ color: '#dc3545', textDecoration: 'none', fontSize: '0.82rem' }}>
                      <i className="bi bi-key me-1"></i>Forgot Password?
                    </Link>
                  </div>
                  <div className="input-group mb-4">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control form-control-lg rounded-start-3"
                      required
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••" />
                    <button type="button"
                      className="btn btn-outline-secondary rounded-end-3"
                      onClick={() => setShowPassword(!showPassword)}>
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button type="submit"
                  className="btn btn-lg w-100 text-white fw-bold rounded-3"
                  style={{ background: '#0A66C2' }}
                  disabled={loading}>
                  {loading
                    ? <span className="spinner-border spinner-border-sm me-2"></span>
                    : <i className="bi bi-box-arrow-in-right me-2"></i>}
                  Sign In
                </button>
              </form>

              {/* Sign Up link */}
              <p className="text-center mt-4 mb-3 small">
                Don't have an account?{' '}
                <Link to="/register" className="fw-semibold" style={{ color: '#0A66C2' }}>
                  Create Account
                </Link>
              </p>

              {/* Divider */}
              <hr className="my-3" />

              {/* Change Password - for logged in users who know current password */}
              <div className="text-center">
                <p className="text-muted small mb-2">Already logged in and want to change password?</p>
                <Link to="/profile"
                  className="btn btn-sm rounded-pill fw-semibold"
                  style={{ background: '#EEF3F8', color: '#0A66C2', border: '1px solid #D0D9E0', fontSize: '0.82rem' }}>
                  <i className="bi bi-shield-lock me-1"></i>Go to Profile → Change Password
                </Link>
              </div>

              {/* Admin hint */}
              <div className="text-center mt-3">
                <small style={{ color: '#e9ecef', fontSize: '0.65rem', userSelect: 'none' }}>
                  v1.0 · CDAC 2026
                </small>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}