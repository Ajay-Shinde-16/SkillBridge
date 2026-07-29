import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllUsers, deleteUser } from '../../services/api'

const roleColors = { SEEKER: 'primary', EMPLOYER: 'warning', ADMIN: 'danger' }

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = () => {
    getAllUsers().then(({ data }) => { setUsers(data); setLoading(false) })
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return
    await deleteUser(id)
    fetchUsers()
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-3 col-lg-2">
          <div className="sidebar rounded-4">
            <nav className="nav flex-column">
              <Link to="/admin/dashboard" className="nav-link">
                <i className="bi bi-speedometer2"></i>Dashboard
              </Link>
              <Link to="/admin/users" className="nav-link active">
                <i className="bi bi-people"></i>Manage Users
              </Link>
              <Link to="/admin/skills" className="nav-link">
                <i className="bi bi-patch-check"></i>Verify Skills
              </Link>
            </nav>
          </div>
        </div>

        <div className="col-md-9 col-lg-10">
          <div className="page-header">
            <h3 className="fw-bold mb-1"><i className="bi bi-people me-2"></i>Manage Users</h3>
            <p className="mb-0 opacity-75">{users.length} registered users</p>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="mb-3">
                <input className="form-control" placeholder="Search by name, email, or role..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>

              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>User</th><th>Email</th><th>Role</th>
                        <th>Skills</th><th>Verified Skills</th><th>Joined</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                   style={{ width: 36, height: 36, fontWeight: 700, fontSize: 14 }}>
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="fw-semibold">{user.name}</span>
                            </div>
                          </td>
                          <td className="text-muted small">{user.email}</td>
                          <td>
                            <span className={`badge bg-${roleColors[user.role] || 'secondary'}`}>{user.role}</span>
                          </td>
                          <td>
                            <span className="text-muted small">{user.skills?.length || 0} skills</span>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success">
                              {user.verifiedSkills?.length || 0} verified
                            </span>
                          </td>
                          <td className="text-muted small">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(user.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
