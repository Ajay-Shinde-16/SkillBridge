import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllUsers, verifyUserSkill, addSkill, getAllSkills } from '../../services/api'

export default function VerifySkills() {
  const [users, setUsers] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSkill, setNewSkill] = useState({ name: '', category: 'PROGRAMMING' })
  const [verifying, setVerifying] = useState(null)
  const [success, setSuccess] = useState('')

  const fetchData = () => {
    Promise.all([getAllUsers(), getAllSkills()]).then(([u, s]) => {
      setUsers(u.data.filter(usr => usr.role === 'SEEKER'))
      setSkills(s.data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  const handleVerify = async (userId, skillName) => {
    setVerifying(`${userId}-${skillName}`)
    try {
      await verifyUserSkill({ userId, skillName })
      setSuccess(`"${skillName}" verified for user!`)
      setTimeout(() => setSuccess(''), 3000)
      fetchData()
    } catch (e) { console.error(e) }
    finally { setVerifying(null) }
  }

  const handleAddSkill = async (e) => {
    e.preventDefault()
    try {
      await addSkill({ ...newSkill, verified: true })
      setNewSkill({ name: '', category: 'PROGRAMMING' })
      fetchData()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-3 col-lg-2">
          <div className="sidebar rounded-4">
            <nav className="nav flex-column">
              <Link to="/admin/dashboard" className="nav-link">
                <i className="bi bi-speedometer2"></i>Dashboard
              </Link>
              <Link to="/admin/users" className="nav-link">
                <i className="bi bi-people"></i>Manage Users
              </Link>
              <Link to="/admin/skills" className="nav-link active">
                <i className="bi bi-patch-check"></i>Verify Skills
              </Link>
            </nav>
          </div>
        </div>

        <div className="col-md-9 col-lg-10">
          <div className="page-header">
            <h3 className="fw-bold mb-1"><i className="bi bi-patch-check me-2"></i>Skill Verification</h3>
            <p className="mb-0 opacity-75">Verify seeker skills and manage skill catalogue</p>
          </div>

          {success && (
            <div className="alert alert-success alert-dismissible">
              <i className="bi bi-check-circle me-2"></i>{success}
            </div>
          )}

          {/* Add Skill to Catalogue */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Add Skill to Catalogue</h5>
              <form onSubmit={handleAddSkill} className="row g-3 align-items-end">
                <div className="col-md-5">
                  <label className="form-label fw-semibold">Skill Name</label>
                  <input className="form-control" required value={newSkill.name}
                    onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                    placeholder="e.g. Spring Boot" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Category</label>
                  <select className="form-select" value={newSkill.category}
                    onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}>
                    <option value="PROGRAMMING">Programming</option>
                    <option value="DESIGN">Design</option>
                    <option value="MANAGEMENT">Management</option>
                    <option value="DEVOPS">DevOps</option>
                    <option value="DATABASE">Database</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <button type="submit" className="btn btn-success w-100">
                    <i className="bi bi-plus me-2"></i>Add Skill
                  </button>
                </div>
              </form>
              <div className="mt-3 d-flex flex-wrap gap-2">
                {skills.slice(0, 15).map((s, i) => (
                  <span key={i} className="skill-badge verified">
                    <i className="bi bi-patch-check-fill me-1"></i>{s.name}
                  </span>
                ))}
                {skills.length > 15 && <span className="text-muted small">+{skills.length - 15} more</span>}
              </div>
            </div>
          </div>

          {/* Verify User Skills */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Verify Seeker Skills</h5>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
              ) : (
                <div className="row g-3">
                  {users.filter(u => u.skills?.length > 0).map(user => (
                    <div key={user.id} className="col-12">
                      <div className="border rounded-3 p-3">
                        <div className="d-flex align-items-center mb-3">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                               style={{ width: 40, height: 40, fontWeight: 700 }}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="fw-bold">{user.name}</span>
                            <span className="text-muted small ms-2">{user.email}</span>
                          </div>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {user.skills?.map((skill, i) => {
                            const isVerified = user.verifiedSkills?.includes(skill)
                            const key = `${user.id}-${skill}`
                            return (
                              <div key={i} className="d-flex align-items-center gap-1">
                                <span className={`skill-badge ${isVerified ? 'verified' : 'unverified'}`}>
                                  {isVerified && <i className="bi bi-patch-check-fill me-1"></i>}
                                  {skill}
                                </span>
                                {!isVerified && (
                                  <button className="btn btn-sm btn-outline-success py-0 px-2"
                                    disabled={verifying === key}
                                    onClick={() => handleVerify(user.id, skill)}
                                    title="Verify this skill">
                                    {verifying === key
                                      ? <span className="spinner-border spinner-border-sm"></span>
                                      : <i className="bi bi-check-lg"></i>}
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {users.filter(u => u.skills?.length > 0).length === 0 && (
                    <p className="text-muted text-center py-3">No seekers with skills to verify</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
