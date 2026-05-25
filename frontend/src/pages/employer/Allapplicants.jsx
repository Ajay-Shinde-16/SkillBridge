import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import UserAvatar from '../../components/UserAvatar'
import { getMyJobs, getJobApplications, updateApplicationStatus } from '../../services/api'

const STATUS_STYLE = {
  APPLIED:              { bg:'#F1F5F9', color:'#475569', label:'Applied'            },
  SHORTLISTED:          { bg:'#DBEAFE', color:'#1e40af', label:'Shortlisted'        },
  INTERVIEW_SCHEDULED:  { bg:'#CCFBF1', color:'#0F766E', label:'Interview Scheduled'},
  INTERVIEW_COMPLETED:  { bg:'#CCFBF1', color:'#0F766E', label:'Interview Done'     },
  OFFERED:              { bg:'#D1FAE5', color:'#065f46', label:'Offered'            },
  REJECTED:             { bg:'#FEE2E2', color:'#991b1b', label:'Rejected'           },
  ACCEPTED:             { bg:'#DBEAFE', color:'#1e40af', label:'Accepted'           },
}
const scoreColor = s => s >= 70 ? '#057642' : s >= 40 ? '#d97706' : '#dc3545'
const spinner = <span className="spinner-border spinner-border-sm" style={{ width:12, height:12 }}></span>

export default function AllApplicants() {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [busy, setBusy]                 = useState(null)
  const [notes, setNotes]               = useState({})
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [jobFilter, setJobFilter]       = useState('ALL')
  const [toast, setToast]               = useState({ msg:'', type:'success' })
  const prevRef                         = useRef('')
  const navigate                        = useNavigate()

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg:'', type:'success' }), 3000)
  }

  const fetchAll = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const { data: myJobs } = await getMyJobs()
      setJobs(myJobs || [])
      const allApps = []
      await Promise.all((myJobs || []).map(async job => {
        try {
          const { data } = await getJobApplications(job.id)
          ;(data || []).forEach(app => allApps.push({ ...app, jobObject: job }))
        } catch {}
      }))
      allApps.sort((a, b) => b.skillMatchScore - a.skillMatchScore)
      const newData = JSON.stringify(allApps.map(a => ({ id:a.id, status:a.status })))
      if (newData !== prevRef.current) {
        prevRef.current = newData
        setApplications(allApps)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchAll(true)
    const t = setInterval(() => fetchAll(false), 10000)
    return () => clearInterval(t)
  }, [fetchAll])

  const handleStatus = async (id, status, jobId) => {
    setBusy(id)
    try {
      await updateApplicationStatus(id, { status, employerNote: notes[id] || '' })
      setApplications(prev => prev.map(a =>
        a.id === id ? { ...a, status, employerNote: notes[id] || a.employerNote } : a
      ))
      showToast(`Status updated to ${STATUS_STYLE[status]?.label || status}`)
    } catch { showToast('Failed to update status', 'danger') }
    finally { setBusy(null) }
  }

  // Same action buttons as ManageApplications
  const getActionBtns = (app) => {
    const { id, status, jobId } = app
    const busy2 = busy === id

    switch (status) {
      case 'APPLIED':
        return (
          <div className="d-flex gap-2 flex-wrap mt-2">
            <button className="btn btn-sm rounded-pill fw-semibold"
              style={{ background:'#DBEAFE', color:'#1e40af', border:'1px solid #BFDBFE', fontSize:'0.8rem' }}
              disabled={busy2} onClick={() => handleStatus(id, 'SHORTLISTED', jobId)}>
              {busy2 ? spinner : <i className="bi bi-star me-1"></i>}Shortlist
            </button>
            <button className="btn btn-sm rounded-pill fw-semibold"
              style={{ background:'#FEE2E2', color:'#991b1b', border:'1px solid #fca5a5', fontSize:'0.8rem' }}
              disabled={busy2} onClick={() => handleStatus(id, 'REJECTED', jobId)}>
              <i className="bi bi-x me-1"></i>Reject
            </button>
          </div>
        )
      case 'SHORTLISTED':
        return (
          <div className="d-flex gap-2 flex-wrap mt-2">
            <Link to={`/employer/schedule/${id}`}
              className="btn btn-sm rounded-pill fw-semibold"
              style={{ background:'#CCFBF1', color:'#0F766E', border:'1px solid #99F6E4', fontSize:'0.8rem' }}>
              <i className="bi bi-calendar-plus me-1"></i>Schedule Interview
            </Link>
            <button className="btn btn-sm rounded-pill fw-semibold"
              style={{ background:'#FEE2E2', color:'#991b1b', border:'1px solid #fca5a5', fontSize:'0.8rem' }}
              disabled={busy2} onClick={() => handleStatus(id, 'REJECTED', jobId)}>
              <i className="bi bi-x me-1"></i>Reject
            </button>
          </div>
        )
      case 'INTERVIEW_SCHEDULED':
        return (
          <div className="d-flex flex-column gap-2 mt-2">
            <div className="rounded-3 p-2 d-flex align-items-center gap-2"
              style={{ background:'#CCFBF1', border:'1px solid #99F6E4' }}>
              <i className="bi bi-hourglass-split" style={{ color:'#0F766E' }}></i>
              <span className="small fw-semibold" style={{ color:'#0F766E' }}>
                Waiting for seeker to join interview...
              </span>
            </div>
            <button className="btn btn-sm rounded-pill fw-semibold"
              style={{ background:'#FEE2E2', color:'#991b1b', border:'1px solid #fca5a5', fontSize:'0.8rem' }}
              disabled={busy2} onClick={() => handleStatus(id, 'REJECTED', jobId)}>
              <i className="bi bi-x me-1"></i>Reject
            </button>
          </div>
        )
      case 'INTERVIEW_COMPLETED':
        return (
          <div className="d-flex flex-column gap-2 mt-2">
            <div className="rounded-3 p-2 d-flex align-items-center gap-2"
              style={{ background:'#CCFBF1', border:'1px solid #99F6E4' }}>
              <i className="bi bi-check-circle-fill" style={{ color:'#0F766E' }}></i>
              <span className="small fw-semibold" style={{ color:'#0F766E' }}>
                Interview completed! Send offer or reject.
              </span>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-sm rounded-pill fw-semibold"
                style={{ background:'#057642', color:'#fff', border:'none', fontSize:'0.85rem', padding:'6px 18px' }}
                disabled={busy2} onClick={() => handleStatus(id, 'OFFERED', jobId)}>
                {busy2 ? spinner : <i className="bi bi-trophy me-1"></i>}Send Offer Letter
              </button>
              <button className="btn btn-sm rounded-pill fw-semibold"
                style={{ background:'#FEE2E2', color:'#991b1b', border:'1px solid #fca5a5', fontSize:'0.8rem' }}
                disabled={busy2} onClick={() => {
                  if (window.confirm('Reject this candidate after interview?')) handleStatus(id, 'REJECTED', jobId)
                }}>
                <i className="bi bi-x-circle me-1"></i>Reject After Interview
              </button>
            </div>
          </div>
        )
      case 'OFFERED':
        return (
          <div className="mt-2">
            <span className="badge rounded-pill px-3 py-2"
              style={{ background:'#D1FAE5', color:'#065f46', fontSize:'0.8rem' }}>
              <i className="bi bi-trophy-fill me-1"></i>Offer sent — waiting for response
            </span>
          </div>
        )
      case 'ACCEPTED':
        return (
          <div className="mt-2">
            <span className="badge rounded-pill px-3 py-2"
              style={{ background:'#DBEAFE', color:'#1e40af', fontSize:'0.8rem' }}>
              <i className="bi bi-check-circle-fill me-1"></i>Accepted — New Hire! 🎉
            </span>
          </div>
        )
      case 'REJECTED':
        return (
          <div className="mt-2">
            <span className="badge rounded-pill px-3 py-2"
              style={{ background:'#FEE2E2', color:'#991b1b', fontSize:'0.8rem' }}>
              <i className="bi bi-x-circle me-1"></i>Rejected
            </span>
          </div>
        )
      default:
        return null
    }
  }

  const filtered = applications.filter(a => {
    const matchSearch = !search ||
      a.seekerName?.toLowerCase().includes(search.toLowerCase()) ||
      a.seekerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      a.jobTitle?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter
    const matchJob    = jobFilter === 'ALL' || a.jobId === jobFilter
    return matchSearch && matchStatus && matchJob
  })

  return (
    <div className="container-fluid p-0">
      <div className="d-flex">
        <div className="sidebar d-none d-md-block">
          <p className="text-muted small fw-bold text-uppercase px-2 mb-2"
            style={{ fontSize:'0.7rem', letterSpacing:'0.8px' }}>Menu</p>
          <nav className="nav flex-column">
            {[
              { to:'/employer/dashboard',      icon:'bi-speedometer2', label:'Dashboard'       },
              { to:'/employer/post-job',        icon:'bi-plus-circle',  label:'Post a Job'      },
              { to:'/employer/applicants',      icon:'bi-people-fill',  label:'All Applicants', active:true },
              { to:'/employer/interviews',      icon:'bi-camera-video', label:'Interviews'      },
              { to:'/employer/company-profile', icon:'bi-building',     label:'Company Profile' },
            ].map((item, i) => (
              <Link key={i} to={item.to} className={`nav-link${item.active ? ' active' : ''}`}>
                <i className={`bi ${item.icon}`}></i>{item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-fill main-content p-3">

          {toast.msg && (
            <div className={`alert alert-${toast.type} rounded-3 py-2 mb-3 d-flex align-items-center gap-2`}
              style={{ position:'sticky', top:8, zIndex:99 }}>
              <i className={`bi ${toast.type==='success'?'bi-check-circle-fill':'bi-exclamation-triangle-fill'}`}></i>
              <span className="fw-semibold small">{toast.msg}</span>
            </div>
          )}

          <div className="welcome-header mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h2 className="fw-bold mb-1">
                  <i className="bi bi-people-fill me-2"></i>All Applicants
                  <span className="badge rounded-pill ms-2"
                    style={{ background:'rgba(255,255,255,0.2)', fontSize:'0.75rem' }}>
                    {applications.length} total
                  </span>
                </h2>
                <p className="mb-0 opacity-75 small">All applicants across all your jobs</p>
              </div>
              <button className="btn btn-sm btn-outline-light rounded-pill"
                onClick={() => fetchAll(false)}>
                <i className="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
            <div className="row g-2">
              <div className="col-12 col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input className="form-control border-start-0 rounded-end-3"
                    placeholder="Search by name, email or job..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="col-6 col-md-4">
                <select className="form-select rounded-3" value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}>
                  <option value="ALL">All Status</option>
                  {Object.entries(STATUS_STYLE).map(([k,v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-3">
                <select className="form-select rounded-3" value={jobFilter}
                  onChange={e => setJobFilter(e.target.value)}>
                  <option value="ALL">All Jobs</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Applicant Cards — same style as ManageApplications */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color:'#0A66C2' }}></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people fs-1 text-muted mb-3 d-block"></i>
              <p className="text-muted">No applicants found</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filtered.map((app, i) => {
                const st = STATUS_STYLE[app.status] || STATUS_STYLE.APPLIED
                return (
                  <div key={app.id} className="card border-0 shadow-sm rounded-4"
                    style={{
                      borderLeft:`4px solid ${st.color}`,
                      opacity: busy === app.id ? 0.7 : 1
                    }}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start gap-3 flex-wrap">

                        {/* Avatar */}
                        <UserAvatar name={app.seekerName} size={46} />

                        {/* Main info */}
                        <div style={{ flex:1, minWidth:200 }}>
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <span className="fw-bold" style={{ fontSize:'1rem' }}>
                              #{i+1} {app.seekerName}
                            </span>
                            <span className="badge rounded-pill px-2 py-1"
                              style={{ background:st.bg, color:st.color, fontSize:'0.72rem' }}>
                              {st.label}
                            </span>
                          </div>
                          <div className="text-muted small mb-1">{app.seekerEmail}</div>
                          <div className="small">
                            <span className="fw-semibold" style={{ color:'#0A66C2' }}>{app.jobTitle}</span>
                            <span className="text-muted ms-2">• {app.companyName}</span>
                          </div>

                          {/* Cover letter */}
                          {app.coverLetter && (
                            <div className="mt-2 small text-muted">
                              <i className="bi bi-chat-quote me-1"></i>
                              {app.coverLetter.length > 100
                                ? app.coverLetter.slice(0, 100) + '...'
                                : app.coverLetter}
                            </div>
                          )}

                          {/* Action buttons */}
                          {getActionBtns(app)}

                          {/* Note input for non-final statuses */}
                          {!['REJECTED','ACCEPTED'].includes(app.status) && (
                            <div className="mt-2 d-flex gap-2">
                              <input
                                className="form-control form-control-sm rounded-3"
                                placeholder="Add a note to candidate..."
                                value={notes[app.id] || ''}
                                onChange={e => setNotes({ ...notes, [app.id]: e.target.value })}
                                style={{ fontSize:'0.8rem' }}
                              />
                              <button
                                className="btn btn-sm rounded-3 fw-semibold"
                                style={{ background:'#EEF3F8', color:'#0A66C2', border:'1px solid #D0D9E0', whiteSpace:'nowrap' }}
                                onClick={() => handleStatus(app.id, app.status, app.jobId)}>
                                Save Note
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Right: Score + Resume */}
                        <div className="text-center flex-shrink-0">
                          <div className="fw-bold mb-1" style={{ fontSize:'1.6rem', color:scoreColor(app.skillMatchScore) }}>
                            {app.skillMatchScore}%
                          </div>
                          <div className="text-muted" style={{ fontSize:'0.72rem' }}>Match</div>
                          {app.resumeUrl && (
                            <div className="mt-2 d-flex gap-1">
                              <a href={`${import.meta.env.VITE_API_URL || ''}${app.resumeUrl}`}
                                target="_blank" rel="noreferrer"
                                className="btn btn-sm rounded-pill"
                                style={{ background:'#EEF3F8', color:'#0A66C2', border:'1px solid #D0D9E0', fontSize:'0.72rem' }}>
                                <i className="bi bi-eye me-1"></i>Resume
                              </a>
                            </div>
                          )}
                          <div className="text-muted mt-1" style={{ fontSize:'0.7rem' }}>
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="text-muted small text-center mt-3">
            Showing {filtered.length} of {applications.length} applicants • Auto-refreshes every 10s
          </div>
        </div>
      </div>
    </div>
  )
}
