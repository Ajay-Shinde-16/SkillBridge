import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getMyJobs, deleteJob, updateJobStatus } from '../../services/api'
import CompanyLogo from '../../components/CompanyLogo'
import { useAuth } from '../../context/AuthContext'

export default function EmployerDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [toast, setToast] = useState('')

  const fetchJobs = useCallback(() => {
    setLoading(true)
    getMyJobs().then(({data}) => { setJobs(data); setLoading(false) }).catch(()=>setLoading(false))
  }, [])

  useEffect(() => {
    fetchJobs()
    const t = setInterval(fetchJobs, 30000)
    return () => clearInterval(t)
  }, [fetchJobs])

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?\nThis will remove the job posting. This cannot be undone.`)) return
    setDeleting(id)
    try { await deleteJob(id); setJobs(prev=>prev.filter(j=>j.id!==id)); showToast('Job deleted successfully') }
    catch { showToast('Failed to delete job') } finally { setDeleting(null) }
  }

  const handleStatusToggle = async (jobId, currentStatus) => {
    const next = currentStatus === 'OPEN' ? 'PAUSED' : currentStatus === 'PAUSED' ? 'OPEN' : 'OPEN'
    try {
      await updateJobStatus(jobId, next)
      setJobs(prev => prev.map(j => j.id===jobId ? {...j, status:next} : j))
      showToast(`Job status changed to ${next}`)
    } catch { showToast('Failed to update status') }
  }

  const statusColors = { OPEN:'success', CLOSED:'danger', PAUSED:'warning' }
  const totalApplicants = jobs.reduce((a,j)=>a+(j.applicationCount||0),0)

  return (
    <div className="container-fluid p-0">
      <div className="d-flex">
        <div className="sidebar d-none d-md-block">
          <p className="text-muted small fw-bold text-uppercase px-2 mb-2" style={{fontSize:'0.7rem',letterSpacing:'0.8px'}}>Menu</p>
          <nav className="nav flex-column">
            {[
              {to:'/employer/dashboard',icon:'bi-speedometer2',label:'Dashboard'},
              {to:'/employer/post-job',icon:'bi-plus-circle',label:'Post a Job'},
              {to:'/employer/interviews',icon:'bi-camera-video',label:'My Interviews'},
              {to:'/profile',icon:'bi-building',label:'Company Profile'},
              {to:'/change-password',icon:'bi-shield-lock',label:'Change Password'},
            ].map((item,i)=>(
              <Link key={i} to={item.to} className="nav-link"><i className={`bi ${item.icon}`}></i>{item.label}</Link>
            ))}
          </nav>
        </div>

        <div className="flex-fill main-content p-3">
          {toast && <div className="alert alert-success rounded-3 py-2 mb-3 d-flex align-items-center gap-2" style={{position:'sticky',top:8,zIndex:99}}>
            <i className="bi bi-check-circle-fill"></i><span className="fw-semibold">{toast}</span>
          </div>}

          <div className="welcome-header">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h2 className="fw-bold mb-1">Employer Dashboard</h2>
                <p className="mb-0">Manage your job postings, applicants and interviews</p>
              </div>
              <button className="btn btn-sm btn-outline-light rounded-pill" onClick={fetchJobs}>
                <i className="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
          </div>

          {/* Stats — live */}
          <div className="row g-3 mb-4">
            {[
              {label:'Total Jobs', value:jobs.length, color:'#0A66C2', icon:'bi-briefcase-fill'},
              {label:'Open Jobs', value:jobs.filter(j=>j.status==='OPEN').length, color:'#057642', icon:'bi-door-open-fill'},
              {label:'Paused Jobs', value:jobs.filter(j=>j.status==='PAUSED').length, color:'#d97706', icon:'bi-pause-circle-fill'},
              {label:'Total Applicants', value:totalApplicants, color:'#7C3AED', icon:'bi-people-fill'},
            ].map((s,i)=>(
              <div key={i} className="col-6 col-md-3">
                <div className="stat-card h-100">
                  <i className={`bi ${s.icon} fs-3 mb-2 d-block`} style={{color:s.color}}></i>
                  <div className="number" style={{color:s.color}}>{s.value}</div>
                  <div className="label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h6 className="fw-bold mb-0">My Job Postings</h6>
                <Link to="/employer/post-job" className="btn text-white btn-sm rounded-pill fw-semibold"
                  style={{background:'#0A66C2'}}>
                  <i className="bi bi-plus me-1"></i>Post New Job
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-4"><div className="spinner-border" style={{color:'#0A66C2'}}></div></div>
              ) : jobs.length===0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-briefcase fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted">No jobs posted yet.</p>
                  <Link to="/employer/post-job" className="btn text-white rounded-pill px-4" style={{background:'#0A66C2'}}>
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {jobs.map(job=>(
                    <div key={job.id} className="border rounded-3 p-3"
                      style={{opacity:deleting===job.id?0.5:1,borderLeft:`4px solid ${job.status==='OPEN'?'#057642':job.status==='PAUSED'?'#d97706':'#dc3545'}`}}>
                      <div className="d-flex align-items-start gap-3 flex-wrap">
                        <div className="flex-fill">
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <span className="fw-bold">{job.title}</span>
                            <span className={`badge bg-${statusColors[job.status]||'secondary'} rounded-pill`} style={{fontSize:'0.72rem'}}>
                              {job.status}
                            </span>
                            {job.remote && <span className="badge rounded-pill" style={{background:'#D1FAE5',color:'#065f46',fontSize:'0.7rem'}}>Remote</span>}
                          </div>
                          <div className="text-muted small">
                            <i className="bi bi-currency-rupee"></i>
                            {job.minSalary?.toLocaleString()} – {job.maxSalary?.toLocaleString()} / yr &nbsp;•&nbsp;
                            {job.experienceLevel} &nbsp;•&nbsp; {job.jobType?.replace('_',' ')}
                          </div>
                          <div className="mt-2 d-flex flex-wrap gap-1">
                            {(job.requiredSkillsList||[]).slice(0,4).map((s,i)=>(
                              <span key={i} className="skill-badge unverified">{s}</span>
                            ))}
                          </div>
                        </div>

                        {/* Applicant count + Actions */}
                        <div className="d-flex gap-2 align-items-start flex-shrink-0">
                          <Link to={`/employer/applications/${job.id}`}
                            className="btn btn-sm rounded-pill fw-semibold"
                            style={{background:'#EEF3F8',color:'#0A66C2',border:'1px solid #D0D9E0',fontSize:'0.78rem'}}>
                            <i className="bi bi-people me-1"></i>{job.applicationCount||0} Applicants
                          </Link>
                          <Link to={`/employer/edit-job/${job.id}`}
                            className="btn btn-sm rounded-pill"
                            style={{background:'#FEF3C7',color:'#92400e',border:'1px solid #FCD34D',fontSize:'0.78rem',padding:'5px 10px'}}>
                            <i className="bi bi-pencil"></i>
                          </Link>
                          {/* Quick Status Toggle */}
                          <button className="btn btn-sm rounded-pill"
                            style={{
                              background: job.status==='OPEN'?'#FEF3C7':'#D1FAE5',
                              color: job.status==='OPEN'?'#92400e':'#065f46',
                              border: `1px solid ${job.status==='OPEN'?'#FCD34D':'#6EE7B7'}`,
                              fontSize:'0.72rem', padding:'5px 10px'
                            }}
                            onClick={() => handleStatusToggle(job.id, job.status)}
                            title={job.status==='OPEN'?'Pause Job':'Reopen Job'}>
                            <i className={`bi ${job.status==='OPEN'?'bi-pause-fill':'bi-play-fill'}`}></i>
                          </button>
                          <button className="btn btn-sm rounded-pill"
                            style={{background:'#FEE2E2',color:'#991b1b',border:'1px solid #fca5a5',fontSize:'0.78rem',padding:'5px 10px'}}
                            disabled={deleting===job.id}
                            onClick={()=>handleDelete(job.id,job.title)}>
                            {deleting===job.id?<span className="spinner-border spinner-border-sm" style={{width:10,height:10}}></span>:<i className="bi bi-trash"></i>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
