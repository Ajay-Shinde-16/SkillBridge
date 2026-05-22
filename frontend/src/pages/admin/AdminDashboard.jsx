import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getAllUsers, getAllApplications, getAllInterviews, getAllJobs } from '../../services/api'

const sidebarItems = [
  {to:'/admin/dashboard',icon:'bi-speedometer2',label:'Dashboard'},
  {to:'/admin/users',icon:'bi-people',label:'Manage Users'},
  {to:'/admin/skills',icon:'bi-patch-check',label:'Verify Skills'},
  {to:'/admin/jobs',icon:'bi-briefcase',label:'Manage Jobs'},
  {to:'/admin/applications',icon:'bi-file-text',label:'All Applications'},
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({users:0,jobs:0,applications:0,interviews:0,offers:0,accepted:0,seekers:0,employers:0})
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([getAllUsers(),getAllApplications(),getAllInterviews(),getAllJobs()])
      .then(([u,a,i,j])=>{
        setStats({
          users: u.data.length,
          seekers: u.data.filter(x=>x.role==='SEEKER').length,
          employers: u.data.filter(x=>x.role==='EMPLOYER').length,
          jobs: j.data.length,
          applications: a.data.length,
          interviews: i.data.length,
          applied: a.data.filter(x=>x.status==='APPLIED').length,
          shortlisted: a.data.filter(x=>x.status==='SHORTLISTED').length,
          offers: a.data.filter(x=>x.status==='OFFERED').length,
          accepted: a.data.filter(x=>x.status==='ACCEPTED').length,
          rejected: a.data.filter(x=>x.status==='REJECTED').length,
        })
        setLoading(false)
      }).catch(()=>setLoading(false))
  }, [])

  useEffect(() => { load(); const t=setInterval(load,30000); return ()=>clearInterval(t) }, [load])

  return (
    <div className="container-fluid p-0">
      <div className="d-flex">
        <div className="sidebar d-none d-md-block">
          <p className="text-muted small fw-bold text-uppercase px-2 mb-2" style={{fontSize:'0.7rem',letterSpacing:'0.8px'}}>Admin Panel</p>
          <nav className="nav flex-column">
            {sidebarItems.map((item,i)=>(
              <Link key={i} to={item.to} className="nav-link"><i className={`bi ${item.icon}`}></i>{item.label}</Link>
            ))}
          </nav>
        </div>

        <div className="flex-fill main-content p-3">
          <div className="welcome-header">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h2 className="fw-bold mb-1">Admin Dashboard</h2>
                <p className="mb-0">Full platform overview and control</p>
              </div>
              <button className="btn btn-sm btn-outline-light rounded-pill" onClick={load}>
                <i className="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border" style={{color:'#0A66C2'}}></div></div>
          ) : (
            <>
              {/* Main Stats */}
              <div className="row g-3 mb-4">
                {[
                  {label:'Total Users',    value:stats.users,        color:'#0A66C2', icon:'bi-people-fill'},
                  {label:'Job Seekers',    value:stats.seekers,      color:'#0ea5e9', icon:'bi-person-fill'},
                  {label:'Employers',      value:stats.employers,    color:'#d97706', icon:'bi-building-fill'},
                  {label:'Active Jobs',    value:stats.jobs,         color:'#057642', icon:'bi-briefcase-fill'},
                  {label:'Applications',   value:stats.applications, color:'#7C3AED', icon:'bi-file-text-fill'},
                  {label:'Interviews',     value:stats.interviews,   color:'#0A66C2', icon:'bi-camera-video-fill'},
                  {label:'Pending Offers', value:stats.offers,       color:'#d97706', icon:'bi-trophy-fill'},
                  {label:'Hired',          value:stats.accepted,     color:'#057642', icon:'bi-check-circle-fill'},
                ].map((s,i)=>(
                  <div key={i} className="col-6 col-md-3">
                    <div className="stat-card h-100">
                      <i className={`bi ${s.icon} fs-3 mb-2 d-block`} style={{color:s.color}}></i>
                      <div className="number" style={{color:s.color,fontSize:'1.6rem'}}>{s.value}</div>
                      <div className="label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Access Cards */}
              <div className="row g-3">
                {[
                  {title:'Manage Users',      desc:'View, search and delete all user accounts', icon:'bi-people-fill',      color:'#0A66C2', link:'/admin/users'},
                  {title:'Verify Skills',     desc:'Approve skill badges for job seekers',       icon:'bi-patch-check-fill', color:'#057642', link:'/admin/skills'},
                  {title:'Manage Jobs',       desc:'View and delete all job postings',           icon:'bi-briefcase-fill',   color:'#d97706', link:'/admin/jobs'},
                  {title:'All Applications',  desc:'Monitor all applications and pipeline',       icon:'bi-file-text-fill',   color:'#7C3AED', link:'/admin/applications'},
                ].map((card,i)=>(
                  <div key={i} className="col-12 col-sm-6 col-lg-3">
                    <Link to={card.link} className="text-decoration-none">
                      <div className="card border-0 shadow-sm rounded-4 h-100 text-center p-3"
                        style={{transition:'transform 0.15s',cursor:'pointer'}}
                        onMouseOver={e=>e.currentTarget.style.transform='translateY(-3px)'}
                        onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                        <i className={`bi ${card.icon} fs-2 mb-3 d-block`} style={{color:card.color}}></i>
                        <h6 className="fw-bold" style={{color:'#191919'}}>{card.title}</h6>
                        <p className="text-muted small mb-0">{card.desc}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
