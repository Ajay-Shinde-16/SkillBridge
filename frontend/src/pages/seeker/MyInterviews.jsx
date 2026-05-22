import React, { useState, useEffect } from 'react'
import { getMyInterviews } from '../../services/api'

const modeInfo = {
  VIDEO:     { icon:'bi-camera-video-fill', label:'Video Call',  color:'#0A66C2' },
  PHONE:     { icon:'bi-telephone-fill',    label:'Phone Call',  color:'#057642' },
  IN_PERSON: { icon:'bi-geo-alt-fill',      label:'In Person',   color:'#d97706' },
}
const statusStyle = {
  SCHEDULED:   { bg:'#FEF3C7', color:'#92400e', label:'Scheduled' },
  COMPLETED:   { bg:'#D1FAE5', color:'#065f46', label:'Completed' },
  CANCELLED:   { bg:'#FEE2E2', color:'#991b1b', label:'Cancelled' },
  RESCHEDULED: { bg:'#DBEAFE', color:'#1e40af', label:'Rescheduled' },
}
const resultStyle = {
  PASS:    { bg:'#D1FAE5', color:'#065f46', label:'Pass' },
  FAIL:    { bg:'#FEE2E2', color:'#991b1b', label:'Fail' },
  PENDING: { bg:'#F1F5F9', color:'#475569', label:'Pending' },
}

export default function MyInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const fetchInterviews = () => {
    getMyInterviews()
      .then(({data})=>{ setInterviews(data); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  useEffect(() => { fetchInterviews(); const t=setInterval(fetchInterviews,30000); return ()=>clearInterval(t) }, [])

  const upcoming = interviews.filter(i=>i.status==='SCHEDULED')
  const completed = interviews.filter(i=>i.status==='COMPLETED')
  const other = interviews.filter(i=>!['SCHEDULED','COMPLETED'].includes(i.status))
  const filtered = filter==='ALL'?interviews:interviews.filter(i=>i.status===filter)

  const isUpcoming = (iv) => {
    if (!iv.scheduledDateTime) return false
    return new Date(iv.scheduledDateTime) > new Date()
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:'60vh'}}>
      <div className="spinner-border" style={{color:'#0A66C2'}}></div>
    </div>
  )

  return (
    <div className="container py-4">
      <div className="welcome-header mb-4">
        <div className="d-flex justify-content-between flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1"><i className="bi bi-camera-video me-2"></i>My Interviews</h2>
            <p className="mb-0">{upcoming.length} upcoming • {completed.length} completed</p>
          </div>
          <button className="btn btn-sm btn-outline-light rounded-pill" onClick={fetchInterviews}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {label:'Upcoming',  value:upcoming.length,  color:'#d97706', bg:'#FEF3C7'},
          {label:'Completed', value:completed.length,  color:'#057642', bg:'#D1FAE5'},
          {label:'Passed',    value:interviews.filter(i=>i.result==='PASS').length, color:'#0A66C2', bg:'#DBEAFE'},
          {label:'Total',     value:interviews.length, color:'#475569', bg:'#F1F5F9'},
        ].map((s,i)=>(
          <div key={i} className="col-6 col-md-3">
            <div className="text-center p-3 rounded-3" style={{background:s.bg}}>
              <div className="fw-bold" style={{fontSize:'1.6rem',color:s.color}}>{s.value}</div>
              <div style={{fontSize:'0.75rem',color:s.color}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {['ALL','SCHEDULED','COMPLETED','CANCELLED'].map(s=>(
          <button key={s} className="btn btn-sm rounded-pill fw-semibold"
            style={{background:filter===s?'#0A66C2':'#EEF3F8',color:filter===s?'#fff':'#0A66C2',border:'none'}}
            onClick={()=>setFilter(s)}>
            {s==='ALL'?`All (${interviews.length})`:s+` (${interviews.filter(i=>i.status===s).length})`}
          </button>
        ))}
      </div>

      {filtered.length===0 ? (
        <div className="text-center py-5">
          <i className="bi bi-camera-video fs-1 text-muted mb-3 d-block"></i>
          <h5 className="text-muted">No interviews {filter!=='ALL'?`with status "${filter}"`:''} yet</h5>
          <p className="text-muted small">Once an employer schedules an interview, it will appear here with the meeting link.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(iv=>{
            const mode = modeInfo[iv.mode] || modeInfo.VIDEO
            const ss = statusStyle[iv.status] || statusStyle.SCHEDULED
            const rs = resultStyle[iv.result] || resultStyle.PENDING
            const upcoming = isUpcoming(iv)
            return (
              <div key={iv.id} className="col-12 col-md-6">
                <div className="card border-0 shadow-sm rounded-4 h-100"
                  style={{borderLeft:`4px solid ${ss.color}`}}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-1">{iv.jobTitle}</h6>
                        <div className="text-muted small">{iv.seekerName}</div>
                      </div>
                      <div className="d-flex gap-1 flex-wrap justify-content-end">
                        <span className="badge rounded-pill" style={{background:ss.bg,color:ss.color,fontSize:'0.72rem'}}>{ss.label}</span>
                        {iv.result && iv.result!=='PENDING' && (
                          <span className="badge rounded-pill" style={{background:rs.bg,color:rs.color,fontSize:'0.72rem'}}>
                            {rs.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2 mb-3" style={{fontSize:'0.85rem'}}>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-calendar flex-shrink-0" style={{color:'#0A66C2',width:18}}></i>
                        <span>{iv.scheduledDateTime?new Date(iv.scheduledDateTime).toLocaleString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'To be confirmed'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${mode.icon} flex-shrink-0`} style={{color:mode.color,width:18}}></i>
                        <span>{mode.label}</span>
                      </div>
                      {iv.meetingLink && (
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-link-45deg flex-shrink-0" style={{color:'#0A66C2',width:18}}></i>
                          <a href={iv.meetingLink} target="_blank" rel="noreferrer"
                            className="text-truncate" style={{color:'#0A66C2',fontSize:'0.8rem'}}>
                            {iv.meetingLink}
                          </a>
                        </div>
                      )}
                      {iv.venue && (
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-geo-alt flex-shrink-0" style={{color:'#d97706',width:18}}></i>
                          <span className="text-muted">{iv.venue}</span>
                        </div>
                      )}
                    </div>

                    {/* Join button for upcoming video interviews */}
                    {iv.meetingLink && iv.status==='SCHEDULED' && (
                      <a href={iv.meetingLink} target="_blank" rel="noreferrer"
                        className="btn w-100 text-white rounded-pill fw-semibold"
                        style={{background:'#0A66C2',fontSize:'0.85rem'}}>
                        <i className="bi bi-camera-video me-2"></i>
                        {upcoming?'Join Interview':'Open Meeting Link'}
                      </a>
                    )}

                    {/* Feedback from employer */}
                    {iv.feedback && (
                      <div className="mt-3 p-2 rounded-3" style={{background:'#EEF3F8',fontSize:'0.8rem'}}>
                        <span className="fw-semibold" style={{color:'#0A66C2'}}>
                          <i className="bi bi-chat-square-text me-1"></i>Feedback:{' '}
                        </span>
                        <span className="text-muted">{iv.feedback}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
