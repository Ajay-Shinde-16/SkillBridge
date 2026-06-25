import React, { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { register as registerAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PhoneInput from '../../components/PhoneInput'
import { validatePassword, validatePhone, getPasswordStrength } from '../../utils/validation'

export default function AdminRegister() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', secretCode: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Seekers/employers who are already logged in should never see this page,
  // even if they navigate here directly by URL.
  if (user && user.role === 'SEEKER') return <Navigate to="/seeker/dashboard" replace />
  if (user && user.role === 'EMPLOYER') return <Navigate to="/employer/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const pwdCheck = validatePassword(form.password)
    if (!pwdCheck.valid) {
      setError(pwdCheck.message)
      return
    }

    if (form.phone) {
      const [phoneCode, phoneNumber] = form.phone.split(' ')
      const phoneCheck = validatePhone(phoneCode, phoneNumber)
      if (!phoneCheck.valid) { setError(phoneCheck.message); return }
    }

    setLoading(true)
    try {
      // Register with ADMIN role
      await registerAPI({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: 'ADMIN',
        secretCode: form.secretCode
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Email may already exist.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: '#0f172a' }}>
        <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
          <div className="card border-0 shadow-lg rounded-4 text-center p-5">
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: 68, height: 68, background: '#D1FAE5' }}>
              <i className="bi bi-check-circle-fill" style={{ fontSize: 32, color: '#057642' }}></i>
            </div>
            <h4 className="fw-bold mb-2">Admin Account Created!</h4>
            <p className="text-muted mb-4">
              Your admin account has been created successfully. You can now login via the Admin Portal.
            </p>
            <Link to="/admin/login" className="btn w-100 text-white fw-bold rounded-3 py-2"
              style={{ background: '#15487F' }}>
              <i className="bi bi-shield-check me-2"></i>Go to Admin Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: '#0f172a' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '0 16px' }}>
        <div className="card border-0 shadow-lg rounded-4">
          <div className="card-body p-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 68, height: 68, background: '#7C3AED' }}>
                <i className="bi bi-shield-plus" style={{ fontSize: 28, color: '#fff' }}></i>
              </div>
              <h4 className="fw-bold mb-1">Admin Registration</h4>
              <p className="text-muted small mb-0">Create a new Admin account — restricted access</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small rounded-3 mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold small text-uppercase"
                    style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>
                    Full Name
                  </label>
                  <input className="form-control form-control-lg rounded-3" required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Admin Full Name" />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small text-uppercase"
                    style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>
                    Email Address
                  </label>
                  <input type="email" className="form-control form-control-lg rounded-3" required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@skillbridge.com" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-uppercase"
                    style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>
                    Password
                  </label>
                  <input type="password" className="form-control rounded-3" required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 8 characters" />
                  {form.password && (() => {
                    const s = getPasswordStrength(form.password)
                    return (
                      <div className="mt-1">
                        <div className="rounded-pill overflow-hidden" style={{ height: 5, background: '#e2e8f0' }}>
                          <div className="rounded-pill h-100" style={{ width: s.width, background: s.color, transition: 'all 0.3s' }}></div>
                        </div>
                        <span style={{ color: s.color, fontSize: '0.78rem' }}>{s.label}</span>
                      </div>
                    )
                  })()}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-uppercase"
                    style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>
                    Confirm Password
                  </label>
                  <input type="password" className="form-control rounded-3" required
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat password" />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <span className="text-danger d-block mt-1" style={{ fontSize: '0.78rem' }}>Passwords don't match</span>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small text-uppercase"
                    style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>
                    Phone Number
                  </label>
                  <PhoneInput value={form.phone} onChange={phone => setForm({ ...form, phone })} />
                </div>

                {/* Secret Code */}
                <div className="col-12">
                  <label className="form-label fw-semibold small text-uppercase"
                    style={{ letterSpacing: '0.5px', fontSize: '0.72rem' }}>
                    Admin Secret Code <span className="text-danger">*</span>
                  </label>
                  <input type="password" className="form-control rounded-3" required
                    value={form.secretCode}
                    onChange={e => setForm({ ...form, secretCode: e.target.value })}
                    placeholder="Enter the admin secret code" />
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Contact project leader Sudarshan for the secret code
                  </small>
                </div>
              </div>

              <button type="submit"
                className="btn w-100 text-white fw-bold py-2 mt-4 rounded-3"
                style={{ background: '#7C3AED', fontSize: '1rem' }}
                disabled={loading}>
                {loading
                  ? <span className="spinner-border spinner-border-sm me-2"></span>
                  : <i className="bi bi-shield-plus me-2"></i>}
                Create Admin Account
              </button>
            </form>

            <hr className="my-4" />
            <div className="text-center">
              <small className="text-muted">
                Already have an account?{' '}
                <Link to="/admin/login" className="fw-semibold" style={{ color: '#15487F' }}>
                  Admin Login
                </Link>
              </small>
            </div>
            <div className="text-center mt-2">
              <small className="text-muted opacity-50">
                <i className="bi bi-lock-fill me-1"></i>
                Contact your project leader for the admin secret code
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