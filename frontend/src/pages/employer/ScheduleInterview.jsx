import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { scheduleInterview } from '../../services/api'

const generateMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const rand = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`
}

const generateZoomLink = () => {
  const id = Math.floor(Math.random() * 9000000000) + 1000000000
  return `https://zoom.us/j/${id}`
}

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
  const [success, setSuccess] = useState(false)
  const [linkType, setLinkType] = useState('googlemeet')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Set default datetime to tomorrow 10:00 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    // Format: "yyyy-MM-ddTHH:mm" for datetime-local input
    const yr = tomorrow.getFullYear()
    const mo = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const dy = String(tomorrow.getDate()).padStart(2, '0')
    const formatted = `${yr}-${mo}-${dy}T10:00`
    setForm(f => ({ ...f, scheduledDateTime: formatted, meetingLink: generateMeetLink() }))
  }, [])

  const handleLinkTypeChange = (type) => {
    setLinkType(type)
    if (type === 'googlemeet') setForm(f => ({ ...f, meetingLink: generateMeetLink() }))
    else if (type === 'zoom') setForm(f => ({ ...f, meetingLink: generateZoomLink() }))
    else setForm(f => ({ ...f, meetingLink: '' }))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(form.meetingLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.scheduledDateTime) { setError('Please select interview date and time'); return }
    if (form.mode === 'VIDEO' && !form.meetingLink.trim()) { setError('Please provide a meeting link'); return }
    if (form.mode === 'IN_PERSON' && !form.venue.trim()) { setError('Please provide venue/address'); return }

    // Validate date is in the future
    if (new Date(form.scheduledDateTime) <= new Date()) {
      setError('Interview date must be in the future'); return
    }

    setLoading(true)
    try {
      // ─── Send payload with properly formatted datetime ───
      const payload = {
        applicationId: form.applicationId,
        mode: form.mode,
        meetingLink: form.mode === 'VIDEO' ? form.meetingLink.trim() : form.meetingLink,
        venue: form.mode === 'IN_PERSON' ? form.venue.trim() : '',
        // Send as "yyyy-MM-dd'T'HH:mm" — matches @JsonFormat on backend
        scheduledDateTime: form.scheduledDateTime
      }

      console.log('Scheduling interview with payload:', payload)
      await scheduleInterview(payload)
      setSuccess(true)
      setTimeout(() => navigate('/employer/dashboard'), 2000)
    } catch (err) {
      console.error('Schedule interview error:', err)
      setError(err.response?.data || 'Failed to schedule interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 text-center">
          <div className="card border-0 shadow-sm rounded-4 p-5">
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: 72, height: 72, background: '#D1FAE5' }}>
              <i className="bi bi-check-circle-fill" style={{ fontSize: 36, color: '#057642' }}></i>
            </div>
            <h4 className="fw-bold mb-2">Interview Scheduled! 🎉</h4>
            <p className="text-muted mb-3">
              Email with interview details has been sent to the candidate automatically.
            </p>
            <div className="spinner-border spinner-border-sm" style={{ color: '#0A66C2' }}></div>
            <div className="text-muted small mt-2">Redirecting to dashboard...</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container-fluid p-0">
      <div className="d-flex">
        {/* Sidebar */}
        <div className="sidebar d-none d-md-block">
          <p className="text-muted small fw-bold text-uppercase px-2 mb-2"
            style={{ fontSize: '0.7rem', letterSpacing: '0.8px' }}>Menu</p>
          <nav className="nav flex-column">
            {[
              { to: '/employer/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
              { to: '/employer/post-job', icon: 'bi-plus-circle', label: 'Post a Job' },
              { to: '/employer/interviews', icon: 'bi-camera-video', label: 'Interviews' },
              { to: '/profile', icon: 'bi-building', label: 'Company Profile' },
            ].map((item, i) => (
              <Link key={i} to={item.to} className="nav-link">
                <i className={`bi ${item.icon}`}></i>{item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-fill main-content p-3">
          <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
            <Link to="/employer/dashboard" className="btn btn-sm btn-outline-secondary rounded-pill">
              <i className="bi bi-arrow-left me-1"></i>Back
            </Link>
            <div>
              <h4 className="fw-bold mb-0">
                <i className="bi bi-calendar-plus me-2" style={{ color: '#0A66C2' }}></i>
                Schedule Interview
              </h4>
              <p className="text-muted small mb-0">
                Candidate will receive email notification automatically
              </p>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger rounded-3 mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill fs-5"></i>
              <span>{error}</span>
              <button className="btn-close ms-auto" onClick={() => setError('')}></button>
            </div>
          )}

          <div className="row g-4">
            {/* Form */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>

                    {/* Step 1: Mode */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        <span className="badge rounded-pill me-2 text-white" style={{ background: '#0A66C2' }}>1</span>
                        Interview Mode
                      </label>
                      <div className="d-flex gap-3">
                        {[
                          { value: 'VIDEO', icon: 'bi-camera-video-fill', label: 'Video Call', color: '#0A66C2' },
                          { value: 'PHONE', icon: 'bi-telephone-fill', label: 'Phone Call', color: '#057642' },
                          { value: 'IN_PERSON', icon: 'bi-geo-alt-fill', label: 'In Person', color: '#d97706' },
                        ].map(m => (
                          <div key={m.value}
                            className="flex-fill text-center rounded-3 p-3"
                            style={{
                              cursor: 'pointer',
                              border: form.mode === m.value ? `2px solid ${m.color}` : '1.5px solid #e2e8f0',
                              background: form.mode === m.value ? m.color + '11' : '#fff',
                              transition: 'all 0.15s'
                            }}
                            onClick={() => setForm({ ...form, mode: m.value })}>
                            <i className={`bi ${m.icon} d-block mb-1 fs-4`}
                              style={{ color: form.mode === m.value ? m.color : '#adb5bd' }}></i>
                            <div className="fw-semibold small"
                              style={{ color: form.mode === m.value ? m.color : '#6c757d' }}>
                              {m.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Date & Time */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        <span className="badge rounded-pill me-2 text-white" style={{ background: '#0A66C2' }}>2</span>
                        Date & Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control form-control-lg rounded-3"
                        value={form.scheduledDateTime}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={e => setForm({ ...form, scheduledDateTime: e.target.value })}
                        required />
                      {form.scheduledDateTime && (
                        <small className="text-success mt-1 d-block">
                          <i className="bi bi-check-circle me-1"></i>
                          {new Date(form.scheduledDateTime).toLocaleString('en-IN', {
                            weekday: 'long', day: 'numeric', month: 'long',
                            year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </small>
                      )}
                    </div>

                    {/* Step 3: Meeting Details */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        <span className="badge rounded-pill me-2 text-white" style={{ background: '#0A66C2' }}>3</span>
                        {form.mode === 'VIDEO' ? 'Meeting Link' : form.mode === 'PHONE' ? 'Call Notes' : 'Venue / Address'}
                        {(form.mode === 'VIDEO' || form.mode === 'IN_PERSON') && <span className="text-danger ms-1">*</span>}
                      </label>

                      {/* Video: Platform selector */}
                      {form.mode === 'VIDEO' && (
                        <>
                          <div className="d-flex gap-2 mb-3 flex-wrap">
                            {[
                              { type: 'googlemeet', emoji: '🎥', label: 'Google Meet' },
                              { type: 'zoom', emoji: '📹', label: 'Zoom' },
                              { type: 'custom', emoji: '🔗', label: 'Custom' },
                            ].map(p => (
                              <button key={p.type} type="button"
                                className="btn btn-sm rounded-pill fw-semibold"
                                style={{
                                  background: linkType === p.type ? '#0A66C2' : '#EEF3F8',
                                  color: linkType === p.type ? '#fff' : '#0A66C2',
                                  border: 'none', fontSize: '0.8rem', padding: '6px 16px'
                                }}
                                onClick={() => handleLinkTypeChange(p.type)}>
                                {p.emoji} {p.label}
                              </button>
                            ))}
                          </div>
                          <div className="input-group">
                            <input className="form-control rounded-start-3"
                              placeholder="Paste or generate a meeting link..."
                              value={form.meetingLink}
                              onChange={e => setForm({ ...form, meetingLink: e.target.value })}
                              required />
                            {linkType !== 'custom' && (
                              <button type="button"
                                className="btn btn-outline-secondary"
                                title="Regenerate link"
                                onClick={() => {
                                  const generated = linkType === 'googlemeet' ? generateMeetLink() : generateZoomLink()
                                  if (form.meetingLink && form.meetingLink !== generated &&
                                      !window.confirm('Replace the current link with a newly generated one?')) return
                                  handleLinkTypeChange(linkType)
                                }}>
                                <i className="bi bi-arrow-clockwise"></i>
                              </button>
                            )}
                            <button type="button"
                              className="btn rounded-end-3 text-white"
                              style={{ background: copied ? '#057642' : '#0A66C2' }}
                              onClick={handleCopy}
                              disabled={!form.meetingLink}>
                              <i className={`bi ${copied ? 'bi-check' : 'bi-copy'} me-1`}></i>
                              {copied ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          {form.meetingLink && (
                            <div className="mt-2 p-2 rounded-3 d-flex align-items-center gap-2"
                              style={{ background: '#EEF3F8' }}>
                              <i className="bi bi-link-45deg" style={{ color: '#0A66C2' }}></i>
                              <a href={form.meetingLink} target="_blank" rel="noreferrer"
                                className="text-truncate" style={{ color: '#0A66C2', fontSize: '0.82rem' }}>
                                {form.meetingLink}
                              </a>
                            </div>
                          )}
                          <small className="text-muted mt-1 d-block">
                            <i className="bi bi-info-circle me-1"></i>
                            {linkType === 'custom'
                              ? 'Paste your own Zoom/Teams/Google Meet link'
                              : 'Auto-generated placeholder link — replace with your actual meeting room link'}
                          </small>
                        </>
                      )}

                      {/* Phone: notes */}
                      {form.mode === 'PHONE' && (
                        <textarea className="form-control rounded-3" rows={2}
                          placeholder="e.g. We will call you on your registered mobile number at the scheduled time"
                          value={form.meetingLink}
                          onChange={e => setForm({ ...form, meetingLink: e.target.value })} />
                      )}

                      {/* In Person: venue */}
                      {form.mode === 'IN_PERSON' && (
                        <textarea className="form-control rounded-3" rows={3} required
                          placeholder="e.g. 3rd Floor, TechCorp Office, MG Road, Bangalore - 560001&#10;Landmark: Near Forum Mall"
                          value={form.venue}
                          onChange={e => setForm({ ...form, venue: e.target.value })} />
                      )}
                    </div>

                    {/* Submit */}
                    <div className="d-flex gap-3 flex-wrap">
                      <button type="submit"
                        className="btn fw-bold px-5 rounded-pill text-white"
                        style={{ background: '#0A66C2', fontSize: '1rem' }}
                        disabled={loading}>
                        {loading
                          ? <><span className="spinner-border spinner-border-sm me-2"></span>Scheduling...</>
                          : <><i className="bi bi-calendar-check me-2"></i>Schedule Interview</>}
                      </button>
                      <Link to="/employer/dashboard"
                        className="btn btn-outline-secondary fw-bold px-4 rounded-pill">
                        Cancel
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="col-lg-5">
              <div className="card border-0 rounded-4 mb-3" style={{ background: '#EEF3F8' }}>
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3" style={{ color: '#0A66C2' }}>
                    <i className="bi bi-send-fill me-2"></i>What happens next?
                  </h6>
                  <div className="d-flex flex-column gap-3">
                    {[
                      { icon: 'bi-envelope-fill', color: '#0A66C2', text: 'Candidate gets email with date, time, mode and meeting link' },
                      { icon: 'bi-kanban-fill', color: '#057642', text: "Application status updates to INTERVIEW SCHEDULED automatically" },
                      { icon: 'bi-camera-video-fill', color: '#d97706', text: 'Interview appears in your Interviews tab for tracking' },
                      { icon: 'bi-star-fill', color: '#7C3AED', text: 'After interview, update result (Pass/Fail) and add feedback' },
                    ].map((item, i) => (
                      <div key={i} className="d-flex align-items-start gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 36, height: 36, background: item.color + '22' }}>
                          <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: 16 }}></i>
                        </div>
                        <p className="text-muted small mb-0" style={{ lineHeight: 1.5 }}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card border-0 rounded-4" style={{ background: '#FEF3C7' }}>
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3" style={{ color: '#92400e' }}>
                    <i className="bi bi-lightbulb-fill me-2"></i>How to get a real meeting link?
                  </h6>
                  <ul className="mb-0 small" style={{ paddingLeft: 16, lineHeight: 2, color: '#78350f' }}>
                    <li><strong>Google Meet:</strong> meet.google.com → New Meeting → Copy link</li>
                    <li><strong>Zoom:</strong> zoom.us → New Meeting → Copy invite link</li>
                    <li><strong>MS Teams:</strong> teams.microsoft.com → Calendar → New Meeting</li>
                    <li><strong>Jitsi (Free):</strong> meet.jit.si/YourRoomName</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
