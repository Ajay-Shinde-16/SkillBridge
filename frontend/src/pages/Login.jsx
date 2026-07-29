import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

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
      setError(err.response?.data || 'Login failed. Check your credentials.')
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
              <div className="text-center mb-4">
                <i className="bi bi-layers-fill text-primary fs-1"></i>
                <h3 className="fw-bold mt-2">Welcome Back</h3>
                <p className="text-muted">Sign in to SkillBridge</p>
              </div>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control form-control-lg" required
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com" />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                  <input type="password" className="form-control form-control-lg" required
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••" />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Sign In
                </button>
              </form>
              <p className="text-center mt-4 mb-0">
                Don't have an account? <Link to="/register" className="text-primary fw-semibold">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
