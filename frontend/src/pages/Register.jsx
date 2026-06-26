import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerAPI } from '../services/api'
import PhoneInput from '../components/PhoneInput'
import { validatePassword, validatePhone, getPasswordStrength } from '../utils/validation'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', role:'SEEKER', phone:'', companyName:'', skills:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const pwdCheck = validatePassword(form.password)
    if (!pwdCheck.valid) { setError(pwdCheck.message); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    const [phoneCode, phoneNumber] = form.phone ? form.phone.split(' ') : ['+91', '']
    const phoneCheck = validatePhone(phoneCode, phoneNumber)
    if (!phoneCheck.valid) { setError(phoneCheck.message); return }

    setLoading(true); setError('')
    try {
      const { confirmPassword, ...rest } = form
      const payload = {
        ...rest,
        skills: form.skills ? form.skills.split(',').map(s=>s.trim()).filter(Boolean) : []
      }
      const { data } = await registerAPI(payload)
      login(data)
      navigate(data.role==='EMPLOYER'?'/employer/dashboard':'/seeker/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Email may already be used.')
    } finally { setLoading(false) }
  }

  const pwdStrength = getPasswordStrength(form.password)

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow border-0 rounded-4 overflow-hidden">
            <div className="row g-0">

              {/* ── BRAND PANEL: horizontal strip on mobile/tablet, full
                   centered panel at lg+ — always visible, never hidden ── */}
              <div className="col-12 col-lg-4 d-flex flex-row flex-lg-column align-items-center justify-content-lg-center text-start text-lg-center p-3 p-lg-5 gap-3 gap-lg-0"
                style={{ background: 'linear-gradient(160deg, #003766 0%, #15487F 100%)', color: '#fff' }}>
                <div className="bg-white rounded-4 p-2 p-lg-3 mb-0 mb-lg-4 d-inline-flex flex-shrink-0">
                  <img src="/logo.svg" alt="SkillBridge" className="auth-logo-img"
                    onError={e => { e.target.style.display = 'none' }} />
                </div>
                <div>
                  <h2 className="heading-serif fw-bold mb-1 mb-lg-2 auth-brand-title">SkillBridge</h2>
                  <p className="opacity-75 small mb-0 auth-tagline">
                    Join free — for job seekers and employers alike.
                  </p>
                </div>
              </div>

              {/* ── RIGHT PANEL: form ── */}
              <div className="col-lg-8">
                <div className="p-4 p-lg-5">

                  <div className="mb-4">
                    <h3 className="heading-serif fw-bold mb-1">Create Account</h3>
                    <p className="text-muted small mb-0">Join SkillBridge today — 100% free</p>
                  </div>

                  {error && <div className="alert alert-danger py-2 small rounded-3"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}

                  {/* Role Selector — big and clear */}
                  <div className="mb-4">
                    <label className="form-label fw-bold mb-2">I am a...</label>
                    <div className="d-flex gap-3">
                      {[
                        { role:'SEEKER', icon:'bi-person-fill', label:'Job Seeker', desc:'Looking for remote jobs' },
                        { role:'EMPLOYER', icon:'bi-building-fill', label:'Employer', desc:'Hiring remote talent' }
                      ].map(r => (
                        <div key={r.role}
                          className={`flex-fill rounded-3 p-3 text-center role-card${form.role===r.role?' role-card-active':''}`}
                          onClick={()=>setForm({...form,role:r.role})}>
                          <i className={`bi ${r.icon} d-block mb-1 role-card-icon`}></i>
                          <div className="fw-bold role-card-label" style={{fontSize:'0.9rem'}}>{r.label}</div>
                          <div className="text-muted" style={{fontSize:'0.72rem'}}>{r.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-semibold small">Full Name <span className="text-danger">*</span></label>
                        <input className="form-control rounded-3" required value={form.name}
                          onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name"/>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold small">Email Address <span className="text-danger">*</span></label>
                        <input type="email" className="form-control rounded-3" required value={form.email}
                          onChange={e=>setForm({...form,email:e.target.value})} placeholder="your@email.com"/>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Password <span className="text-danger">*</span></label>
                        <input type="password" className="form-control rounded-3" required value={form.password}
                          onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 8 characters"/>
                        {form.password && (
                          <div className="mt-1">
                            <div className="rounded-pill overflow-hidden" style={{ height:5, background:'var(--border-color)' }}>
                              <div className="rounded-pill h-100" style={{ width:pwdStrength.width, background:pwdStrength.color, transition:'all 0.3s' }}></div>
                            </div>
                            <span style={{ color:pwdStrength.color, fontSize:'0.78rem' }}>{pwdStrength.label}</span>
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Confirm Password <span className="text-danger">*</span></label>
                        <input type="password" className="form-control rounded-3" required value={form.confirmPassword}
                          onChange={e=>setForm({...form,confirmPassword:e.target.value})} placeholder="Re-enter password"/>
                        {form.confirmPassword && form.password !== form.confirmPassword && (
                          <span className="text-danger d-block mt-1" style={{ fontSize:'0.78rem' }}>Passwords don't match</span>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Phone Number</label>
                        <PhoneInput value={form.phone} onChange={phone => setForm({...form, phone})} />
                      </div>
                      {form.role==='EMPLOYER' && (
                        <div className="col-12">
                          <label className="form-label fw-semibold small">Company Name <span className="text-danger">*</span></label>
                          <input className="form-control rounded-3" required={form.role==='EMPLOYER'} value={form.companyName}
                            onChange={e=>setForm({...form,companyName:e.target.value})} placeholder="Your Company Pvt Ltd"/>
                        </div>
                      )}
                      {form.role==='SEEKER' && (
                        <div className="col-12">
                          <label className="form-label fw-semibold small">Your Skills (comma separated)</label>
                          <input className="form-control rounded-3" value={form.skills}
                            onChange={e=>setForm({...form,skills:e.target.value})}
                            placeholder="React, Java, Spring Boot, MongoDB..."/>
                          <small className="text-muted">Add more skills from your profile after signup</small>
                        </div>
                      )}
                    </div>
                    <button type="submit" className="btn w-100 text-white fw-bold mt-4 rounded-pill py-2"
                      style={{background:'#15487F',fontSize:'1rem'}} disabled={loading}>
                      {loading?<span className="spinner-border spinner-border-sm me-2"></span>:null}
                      Create {form.role==='SEEKER'?'Seeker':'Employer'} Account
                    </button>
                  </form>

                  <p className="text-center mt-4 mb-0 small">
                    Already have an account?{' '}
                    <Link to="/login" className="fw-semibold" style={{color:'var(--accent)'}}>Sign In</Link>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}