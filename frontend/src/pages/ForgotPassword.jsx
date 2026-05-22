import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../services/api'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1=email, 2=otp+new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email'); return }
    setLoading(true); setError('')
    try {
      await forgotPassword({ email })
      setStep(2)
    } catch (err) {
      setError(err.response?.data || 'No account found with this email')
    } finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      await resetPassword({ email, otp, newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data || 'Invalid or expired OTP. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 text-center">
          <div className="card border-0 shadow-sm rounded-4 p-5">
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
              style={{width:72,height:72,background:'#D1FAE5'}}>
              <i className="bi bi-check-circle-fill" style={{fontSize:36,color:'#057642'}}></i>
            </div>
            <h4 className="fw-bold mb-2">Password Reset!</h4>
            <p className="text-muted mb-0">Your password has been reset successfully. Redirecting to login...</p>
            <div className="mt-3 spinner-border spinner-border-sm" style={{color:'#0A66C2'}}></div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{width:60,height:60,background:'#EEF3F8'}}>
                  <i className="bi bi-shield-lock-fill fs-3" style={{color:'#0A66C2'}}></i>
                </div>
                <h4 className="fw-bold mb-1">{step===1?'Forgot Password':'Reset Password'}</h4>
                <p className="text-muted small mb-0">
                  {step===1
                    ? 'Enter your email to receive a 6-digit OTP'
                    : `OTP sent to ${email}. Check your inbox.`}
                </p>
              </div>

              {/* Step indicator */}
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                  style={{width:28,height:28,background:'#0A66C2',color:'#fff',fontSize:13,flexShrink:0}}>1</div>
                <div className="flex-fill" style={{height:2,background:step>=2?'#0A66C2':'#e2e8f0'}}></div>
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                  style={{width:28,height:28,background:step>=2?'#0A66C2':'#e2e8f0',color:step>=2?'#fff':'#aaa',fontSize:13,flexShrink:0}}>2</div>
              </div>
              <div className="d-flex justify-content-between mb-4" style={{fontSize:'0.72rem',color:'#666'}}>
                <span>Enter Email</span>
                <span>OTP + New Password</span>
              </div>

              {error && (
                <div className="alert alert-danger rounded-3 py-2 small mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold small">Email Address</label>
                    <input type="email" className="form-control form-control-lg rounded-3" required
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com" />
                  </div>
                  <button type="submit" className="btn w-100 text-white fw-bold rounded-pill py-2"
                    style={{background:'#0A66C2',fontSize:'1rem'}} disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send me-2"></i>}
                    Send OTP to Email
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReset}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">6-Digit OTP</label>
                    <input className="form-control form-control-lg rounded-3 text-center fw-bold"
                      style={{fontSize:'1.3rem',letterSpacing:'8px'}}
                      maxLength={6} placeholder="000000" required
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} />
                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-muted">Check your email for the OTP</small>
                      <button type="button" className="btn btn-link btn-sm p-0"
                        style={{fontSize:'0.78rem',color:'#0A66C2'}}
                        onClick={() => { setStep(1); setError('') }}>
                        Resend OTP
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">New Password</label>
                    <div className="input-group">
                      <input type={showPwd?'text':'password'} className="form-control rounded-start-3" required
                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters" />
                      <button type="button" className="btn btn-outline-secondary rounded-end-3"
                        onClick={() => setShowPwd(!showPwd)}>
                        <i className={`bi ${showPwd?'bi-eye-slash':'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold small">Confirm New Password</label>
                    <input type="password" className={`form-control rounded-3 ${confirmPassword&&(newPassword!==confirmPassword?'is-invalid':'is-valid')}`}
                      required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password" />
                    {confirmPassword && newPassword===confirmPassword && (
                      <div className="valid-feedback">Passwords match!</div>
                    )}
                  </div>
                  <button type="submit" className="btn w-100 text-white fw-bold rounded-pill py-2"
                    style={{background:'#057642',fontSize:'1rem'}} disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-shield-check me-2"></i>}
                    Reset Password
                  </button>
                </form>
              )}

              <p className="text-center mt-4 mb-0 small">
                Remember your password?{' '}
                <Link to="/login" className="fw-semibold" style={{color:'#0A66C2'}}>Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
