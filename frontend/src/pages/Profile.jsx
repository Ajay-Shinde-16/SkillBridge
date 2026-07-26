import React, { useState, useEffect } from 'react'
import { getProfile, updateProfile, updateMySkills } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    getProfile().then(({ data }) => { setProfile(data); setLoading(false) })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(profile)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {} finally { setSaving(false) }
  }

  const addSkill = async () => {
    if (!newSkill.trim()) return
    const updated = [...(profile.skills || []), newSkill.trim()]
    setProfile({ ...profile, skills: updated })
    setNewSkill('')
    await updateMySkills(updated)
  }

  const removeSkill = async (skill) => {
    const updated = profile.skills.filter(s => s !== skill)
    setProfile({ ...profile, skills: updated })
    await updateMySkills(updated)
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                     style={{ width: 60, height: 60, fontSize: 22, fontWeight: 700 }}>
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="fw-bold mb-0">{profile?.name}</h4>
                  <span className="badge bg-primary">{profile?.role}</span>
                </div>
              </div>

              {success && <div className="alert alert-success py-2"><i className="bi bi-check me-2"></i>Profile updated!</div>}

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input className="form-control" value={profile?.name || ''}
                    onChange={e => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone</label>
                  <input className="form-control" value={profile?.phone || ''}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Location</label>
                  <input className="form-control" value={profile?.location || ''}
                    onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="City, Country" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Bio</label>
                  <textarea className="form-control" rows={3} value={profile?.bio || ''}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell employers about yourself" />
                </div>
                {profile?.role === 'SEEKER' && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Experience (years)</label>
                      <input type="number" className="form-control" value={profile?.experienceYears || ''}
                        onChange={e => setProfile({ ...profile, experienceYears: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Resume URL</label>
                      <input className="form-control" value={profile?.resumeUrl || ''}
                        onChange={e => setProfile({ ...profile, resumeUrl: e.target.value })}
                        placeholder="https://drive.google.com/..." />
                    </div>
                  </>
                )}
                {profile?.role === 'EMPLOYER' && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Company Name</label>
                      <input className="form-control" value={profile?.companyName || ''}
                        onChange={e => setProfile({ ...profile, companyName: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Company Website</label>
                      <input className="form-control" value={profile?.companyWebsite || ''}
                        onChange={e => setProfile({ ...profile, companyWebsite: e.target.value })} />
                    </div>
                  </>
                )}
              </div>

              {profile?.role === 'SEEKER' && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">My Skills</h6>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {profile?.skills?.map((s, i) => (
                      <span key={i} className={`skill-badge ${profile?.verifiedSkills?.includes(s) ? 'verified' : 'unverified'}`}>
                        {profile?.verifiedSkills?.includes(s) && <i className="bi bi-patch-check-fill me-1"></i>}
                        {s}
                        <i className="bi bi-x ms-1" style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)}></i>
                      </span>
                    ))}
                  </div>
                  <div className="input-group">
                    <input className="form-control" placeholder="Add a skill..." value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSkill()} />
                    <button className="btn btn-outline-primary" onClick={addSkill}>Add</button>
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-patch-check-fill text-success me-1"></i> = Admin verified skill
                  </small>
                </div>
              )}

              <button className="btn btn-primary px-5" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
