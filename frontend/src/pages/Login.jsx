import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginAPI, verifyLoginOtp } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState('')
  const { login, idleLoggedOut, setIdleLoggedOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (idleLoggedOut) {
      setError("You were logged out due to 5 minutes of inactivity. Please login again.")
      setIdleLoggedOut(false)
    }
  }, [idleLoggedOut, setIdleLoggedOut])

  const goToDashboard = (role) => {
    if (role === 'EMPLOYER') navigate('/employer/dashboard')
    else if (role === 'ADMIN') navigate('/admin/dashboard')
    else navigate('/seeker/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await loginAPI(form)
      if (data.twoFactorRequired) {
        setOtpStep(true)
      } else {
        login(data)
        goToDashboard(data.role)
      }
    } catch (err) {
      setError(err.response?.data || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await verifyLoginOtp({ email: form.email, otp })
      login(data)
      goToDashboard(data.role)
    } catch (err) {
      setError(err.response?.data || 'Incorrect OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card shadow border-0 rounded-4 overflow-hidden">
            <div className="row g-0">

              {/* ── LEFT PANEL: brand / info ── */}
              <div className="col-lg-5 d-none d-lg-flex flex-column align-items-center justify-content-center text-center p-5"
                style={{ background: 'linear-gradient(160deg, #003766 0%, #15487F 100%)', color: '#fff' }}>
                <div className="bg-white rounded-4 p-3 mb-4 d-inline-flex">
                  <img src="/logo.svg" alt="SkillBridge" width="56" height="56"
                    onError={e => { e.target.style.display = 'none' }} />
                </div>
                <h2 className="heading-serif fw-bold mb-2">SkillBridge</h2>
                <p className="opacity-75 small mb-0" style={{ maxWidth: 240 }}>
                  Remote jobs, matched to your verified skills.
                </p>
              </div>

              {/* ── RIGHT PANEL: form ── */}
              <div className="col-lg-7">
                <div className="p-4 p-lg-5">

                  <div className="mb-4">
                    <h3 className="heading-serif fw-bold mb-1">Sign In</h3>
                    <p className="text-muted small mb-0">Enter your credentials to access SkillBridge</p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="alert alert-danger py-2 small rounded-3">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                    </div>
                  )}

                  <form onSubmit={otpStep ? handleVerifyOtp : handleSubmit}>
                    {otpStep ? (
                      <>
                        <div className="alert alert-info py-2 small rounded-3">
                          <i className="bi bi-shield-lock-fill me-2"></i>
                          We sent a 6-digit code to <strong>{form.email}</strong>. Enter it below to finish signing in.
                        </div>
                        <div className="mb-4">
                          <label className="form-label fw-semibold small">Verification Code</label>
                          <input type="text" inputMode="numeric" maxLength={6}
                            className="form-control form-control-lg rounded-3 text-center"
                            style={{ letterSpacing: 6, fontSize: '1.3rem' }}
                            required value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000" autoFocus />
                        </div>
                        <button type="submit"
                          className="btn btn-lg w-100 text-white fw-bold rounded-3 mb-2"
                          style={{ background: '#15487F' }}
                          disabled={loading || otp.length !== 6}>
                          {loading
                            ? <span className="spinner-border spinner-border-sm me-2"></span>
                            : <i className="bi bi-shield-check me-2"></i>}
                          Verify & Sign In
                        </button>
                        <button type="button" className="btn btn-sm w-100 btn-outline-secondary rounded-3"
                          onClick={() => { setOtpStep(false); setOtp(''); setError('') }}>
                          ← Back to login
                        </button>
                      </>
                    ) : (
                      <>
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
                          style={{ background: '#15487F' }}
                          disabled={loading}>
                          {loading
                            ? <span className="spinner-border spinner-border-sm me-2"></span>
                            : <i className="bi bi-box-arrow-in-right me-2"></i>}
                          Sign In
                        </button>
                      </>
                    )}
                  </form>

                  {!otpStep && (
                  <>
                  {/* Sign Up link */}
                  <p className="text-center mt-4 mb-0 small">
                    Don't have an account?{' '}
                    <Link to="/register" className="fw-semibold" style={{ color: '#15487F' }}>
                      Create Account
                    </Link>
                  </p>
                  </>
                  )}

                  {/* Admin hint */}
                  <div className="text-center mt-3">
                    <span className="text-muted" style={{ fontSize: '0.65rem', userSelect: 'none' }}>
                      v1.0 · CDAC 2026
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}