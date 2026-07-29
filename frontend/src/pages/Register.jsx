import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'SEEKER',
    phone: '', companyName: '', skills: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      }
      const { data } = await registerAPI(payload)
      login(data)
      if (data.role === 'EMPLOYER') navigate('/employer/dashboard')
      else navigate('/seeker/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-layers-fill text-primary fs-1"></i>
                <h3 className="fw-bold mt-2">Create Account</h3>
                <p className="text-muted">Join SkillBridge today</p>
              </div>
              {error && <div className="alert alert-danger py-2">{error}</div>}

              {/* Role Selector */}
              <div className="mb-4">
                <label className="form-label fw-semibold">I am a...</label>
                <div className="d-flex gap-3">
                  {['SEEKER', 'EMPLOYER'].map(role => (
                    <div key={role} className={`border rounded-3 p-3 flex-fill text-center cursor-pointer
                      ${form.role === role ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setForm({ ...form, role })}>
                      <i className={`bi ${role === 'SEEKER' ? 'bi-person' : 'bi-building'} fs-4 d-block mb-1
                        ${form.role === role ? 'text-primary' : 'text-muted'}`}></i>
                      <span className={`fw-semibold ${form.role === role ? 'text-primary' : 'text-muted'}`}>
                        {role === 'SEEKER' ? 'Job Seeker' : 'Employer'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input className="form-control" required value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Email</label>
                    <input type="email" className="form-control" required value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Password</label>
                    <input type="password" className="form-control" required value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Phone</label>
                    <input className="form-control" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  {form.role === 'EMPLOYER' && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">Company Name</label>
                      <input className="form-control" value={form.companyName}
                        onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Your Company" />
                    </div>
                  )}
                  {form.role === 'SEEKER' && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">Skills (comma separated)</label>
                      <input className="form-control" value={form.skills}
                        onChange={e => setForm({ ...form, skills: e.target.value })}
                        placeholder="React, Java, MongoDB, Spring Boot" />
                      <small className="text-muted">You can add more from your profile</small>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100 mt-4" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Create Account
                </button>
              </form>
              <p className="text-center mt-3 mb-0">
                Already have an account? <Link to="/login" className="text-primary fw-semibold">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
