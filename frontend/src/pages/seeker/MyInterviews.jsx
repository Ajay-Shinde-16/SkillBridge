import React, { useState, useEffect } from 'react'
import { getMyInterviews } from '../../services/api'

const modeIcons = { VIDEO: 'bi-camera-video', PHONE: 'bi-telephone', IN_PERSON: 'bi-geo-alt' }

export default function MyInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyInterviews().then(({ data }) => { setInterviews(data); setLoading(false) })
  }, [])

  return (
    <div className="container py-4">
      <div className="page-header">
        <h3 className="fw-bold mb-1"><i className="bi bi-camera-video me-2"></i>My Interviews</h3>
        <p className="mb-0 opacity-75">{interviews.length} scheduled interviews</p>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-camera-video fs-1 text-muted mb-3 d-block"></i>
          <h5 className="text-muted">No interviews scheduled yet</h5>
        </div>
      ) : (
        <div className="row g-3">
          {interviews.map(iv => (
            <div key={iv.id} className="col-md-6">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold mb-0">{iv.jobTitle}</h5>
                    <span className={`badge ${iv.status === 'SCHEDULED' ? 'bg-warning' :
                      iv.status === 'COMPLETED' ? 'bg-success' : 'bg-danger'}`}>
                      {iv.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-calendar text-primary me-2"></i>
                      <span>{new Date(iv.scheduledDateTime).toLocaleString()}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className={`bi ${modeIcons[iv.mode] || 'bi-camera-video'} text-primary me-2`}></i>
                      <span>{iv.mode}</span>
                    </div>
                    {iv.meetingLink && (
                      <div className="d-flex align-items-center">
                        <i className="bi bi-link text-primary me-2"></i>
                        <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="text-primary">
                          Join Meeting
                        </a>
                      </div>
                    )}
                    {iv.venue && (
                      <div className="d-flex align-items-center">
                        <i className="bi bi-geo-alt text-primary me-2"></i>
                        <span>{iv.venue}</span>
                      </div>
                    )}
                  </div>
                  {iv.result !== 'PENDING' && (
                    <div className={`badge ${iv.result === 'PASS' ? 'bg-success' : 'bg-danger'} px-3 py-2`}>
                      Result: {iv.result}
                    </div>
                  )}
                  {iv.feedback && (
                    <div className="mt-3 p-3 bg-light rounded-3">
                      <small className="fw-semibold text-muted">Feedback: </small>
                      <small>{iv.feedback}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
