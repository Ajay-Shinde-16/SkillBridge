import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { scheduleInterview } from '../../services/api'

export default function ScheduleInterview() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    applicationId,
    scheduledDateTime: '',
    mode: 'VIDEO',
    meetingLink: '',
    venue: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await scheduleInterview(form)
      navigate('/employer/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Failed to schedule interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="d-flex align-items-center mb-4">
            <Link to="/employer/dashboard" className="btn btn-outline-secondary me-3">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <h3 className="fw-bold mb-0">Schedule Interview</h3>
          </div>
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Interview Mode *</label>
                    <div className="d-flex gap-3">
                      {[
                        { value: 'VIDEO', icon: 'bi-camera-video', label: 'Video Call' },
                        { value: 'PHONE', icon: 'bi-telephone', label: 'Phone Call' },
                        { value: 'IN_PERSON', icon: 'bi-geo-alt', label: 'In Person' }
                      ].map(m => (
                        <div key={m.value}
                          className={`border rounded-3 p-3 flex-fill text-center ${form.mode === m.value ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setForm({ ...form, mode: m.value })}>
                          <i className={`bi ${m.icon} fs-4 d-block mb-1 ${form.mode === m.value ? 'text-primary' : 'text-muted'}`}></i>
                          <small className={form.mode === m.value ? 'text-primary fw-semibold' : 'text-muted'}>{m.label}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Date & Time *</label>
                    <input type="datetime-local" className="form-control form-control-lg" required
                      value={form.scheduledDateTime}
                      onChange={e => setForm({ ...form, scheduledDateTime: e.target.value })} />
                  </div>
                  {form.mode === 'VIDEO' && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">Meeting Link</label>
                      <input className="form-control" placeholder="https://meet.google.com/..."
                        value={form.meetingLink}
                        onChange={e => setForm({ ...form, meetingLink: e.target.value })} />
                    </div>
                  )}
                  {form.mode === 'IN_PERSON' && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">Venue / Address</label>
                      <input className="form-control" placeholder="Office address or location"
                        value={form.venue}
                        onChange={e => setForm({ ...form, venue: e.target.value })} />
                    </div>
                  )}
                </div>
                <div className="d-flex gap-3 mt-4">
                  <button type="submit" className="btn btn-primary btn-lg px-5" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                    <i className="bi bi-calendar-check me-2"></i>Schedule Interview
                  </button>
                  <Link to="/employer/dashboard" className="btn btn-outline-secondary btn-lg">Cancel</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
