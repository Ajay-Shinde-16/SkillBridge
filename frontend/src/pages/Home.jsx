import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-primary text-white py-5">
        <div className="container py-4 text-center">
          <h1 className="display-4 fw-bold mb-3">
            <i className="bi bi-layers-fill me-3"></i>SkillBridge
          </h1>
          <p className="lead mb-4 opacity-75">
            Remote Job Portal with Verified Skill Tagging — find jobs that actually match your skills
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/jobs" className="btn btn-light btn-lg px-5">
              <i className="bi bi-search me-2"></i>Browse Jobs
            </Link>
            <Link to="/register" className="btn btn-outline-light btn-lg px-5">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container py-5">
        <div className="row g-4 text-center mb-5">
          {[
            { icon: 'bi-briefcase-fill', color: 'primary', label: 'Remote Jobs', value: '500+' },
            { icon: 'bi-people-fill', color: 'success', label: 'Job Seekers', value: '2000+' },
            { icon: 'bi-building', color: 'warning', label: 'Employers', value: '150+' },
            { icon: 'bi-patch-check-fill', color: 'info', label: 'Verified Skills', value: '80+' },
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="stat-card">
                <i className={`bi ${s.icon} text-${s.color} fs-2 mb-2 d-block`}></i>
                <div className="number">{s.value}</div>
                <div className="label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <h2 className="text-center fw-bold mb-4">Why SkillBridge?</h2>
        <div className="row g-4">
          {[
            {
              icon: 'bi-patch-check-fill',
              color: 'success',
              title: 'Verified Skill Tagging',
              desc: 'Skills are verified by admins — not just self-declared. Employers see only real talent.'
            },
            {
              icon: 'bi-bar-chart-fill',
              color: 'primary',
              title: 'Skill Match Score',
              desc: 'Auto-calculates % match between your skills and job requirements. Apply smarter.'
            },
            {
              icon: 'bi-kanban-fill',
              color: 'warning',
              title: 'Full Application Tracker',
              desc: 'Track every application: Applied → Shortlisted → Interview → Offer.'
            },
            {
              icon: 'bi-calendar-check-fill',
              color: 'info',
              title: 'Interview Scheduler',
              desc: 'Employers schedule interviews directly. Seekers get notified instantly.'
            },
            {
              icon: 'bi-currency-rupee',
              color: 'danger',
              title: 'Salary Range Filter',
              desc: 'Filter jobs by exact salary range. No more wasting time on wrong budgets.'
            },
            {
              icon: 'bi-globe',
              color: 'secondary',
              title: '100% Remote Focus',
              desc: 'Built for remote work. Every job listing clearly states remote availability.'
            }
          ].map((f, i) => (
            <div key={i} className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-3">
                <div className="card-body">
                  <i className={`bi ${f.icon} text-${f.color} fs-3 mb-3 d-block`}></i>
                  <h5 className="fw-bold">{f.title}</h5>
                  <p className="text-muted mb-0">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-5 pt-3">
          <h3 className="fw-bold mb-3">Ready to find your remote job?</h3>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-primary btn-lg">
              <i className="bi bi-person-plus me-2"></i>Join as Job Seeker
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg">
              <i className="bi bi-building me-2"></i>Hire Talent
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
