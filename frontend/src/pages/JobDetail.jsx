import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getJobById, applyToJob, getMatchScore } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [matchScore, setMatchScore] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getJobById(id)
        setJob(data)
        if (user?.role === 'SEEKER') {
          try {
            const { data: score } = await getMatchScore(id)
            setMatchScore(score.score)
          } catch (e) {}
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  const handleApply = async () => {
    if (!user) { navigate('/login'); return }
    setApplying(true)
    try {
      await applyToJob(id, { coverLetter })
      setMessage('success')
    } catch (e) {
      setMessage(e.response?.data || 'error')
    } finally {
      setApplying(false)
    }
  }

  const scoreColor = (s) => s >= 70 ? '#198754' : s >= 40 ? '#ffc107' : '#dc3545'

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
  if (!job) return <div className="text-center py-5">Job not found</div>

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="fw-bold mb-1">{job.title}</h2>
                  <p className="text-muted mb-0 fs-5">
                    <i className="bi bi-building me-2"></i>{job.companyName}
                  </p>
                </div>
                {job.remote && <span className="badge bg-success fs-6">Remote</span>}
              </div>

              <div className="d-flex flex-wrap gap-3 mb-4 text-muted">
                <span><i className="bi bi-currency-rupee me-1"></i>
                  ₹{job.minSalary?.toLocaleString()} – ₹{job.maxSalary?.toLocaleString()} / yr</span>
                <span><i className="bi bi-bar-chart me-1"></i>{job.experienceLevel}</span>
                <span><i className="bi bi-clock me-1"></i>{job.jobType}</span>
                <span><i className="bi bi-people me-1"></i>{job.applicationCount} applicants</span>
              </div>

              <h5 className="fw-bold mb-3">Required Skills</h5>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {job.requiredSkills?.map((s, i) => (
                  <span key={i} className="skill-badge unverified">{s}</span>
                ))}
              </div>

              <h5 className="fw-bold mb-3">Job Description</h5>
              <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Match Score Card */}
          {user?.role === 'SEEKER' && matchScore !== null && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4 text-center">
                <h6 className="fw-bold text-muted mb-3">Your Skill Match Score</h6>
                <div className="match-score-ring mx-auto mb-2"
                     style={{ background: scoreColor(matchScore), width: 80, height: 80, fontSize: '1.4rem' }}>
                  {matchScore}%
                </div>
                <p className="text-muted small mb-0">
                  {matchScore >= 70 ? '🎯 Great fit! Apply now.' :
                   matchScore >= 40 ? '⚡ Decent match. Worth trying!' :
                   '📚 Low match. Upskill first.'}
                </p>
              </div>
            </div>
          )}

          {/* Apply Card */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Apply for this Job</h5>
              {message === 'success' ? (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>Application submitted!
                </div>
              ) : (
                <>
                  {message && <div className="alert alert-danger py-2">{message}</div>}
                  {!user ? (
                    <button className="btn btn-primary w-100" onClick={() => navigate('/login')}>
                      Login to Apply
                    </button>
                  ) : user.role !== 'SEEKER' ? (
                    <p className="text-muted small">Only job seekers can apply.</p>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Cover Letter (optional)</label>
                        <textarea className="form-control" rows={4}
                          placeholder="Tell the employer why you're a great fit..."
                          value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                      </div>
                      <button className="btn btn-primary btn-lg w-100" onClick={handleApply} disabled={applying}>
                        {applying ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                        <i className="bi bi-send me-2"></i>Submit Application
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
