import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import JobList from './pages/JobList'
import JobDetail from './pages/JobDetail'
import Profile from './pages/Profile'

import SeekerDashboard from './pages/seeker/SeekerDashboard'
import MyApplications from './pages/seeker/MyApplications'
import MyInterviews from './pages/seeker/MyInterviews'

import EmployerDashboard from './pages/employer/EmployerDashboard'
import PostJob from './pages/employer/PostJob'
import ManageApplications from './pages/employer/ManageApplications'
import ScheduleInterview from './pages/employer/ScheduleInterview'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import VerifySkills from './pages/admin/VerifySkills'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border text-primary"></div></div>
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Seeker Routes */}
        <Route path="/seeker/dashboard" element={<ProtectedRoute roles={['SEEKER']}><SeekerDashboard /></ProtectedRoute>} />
        <Route path="/seeker/applications" element={<ProtectedRoute roles={['SEEKER']}><MyApplications /></ProtectedRoute>} />
        <Route path="/seeker/interviews" element={<ProtectedRoute roles={['SEEKER']}><MyInterviews /></ProtectedRoute>} />

        {/* Employer Routes */}
        <Route path="/employer/dashboard" element={<ProtectedRoute roles={['EMPLOYER']}><EmployerDashboard /></ProtectedRoute>} />
        <Route path="/employer/post-job" element={<ProtectedRoute roles={['EMPLOYER']}><PostJob /></ProtectedRoute>} />
        <Route path="/employer/applications/:jobId" element={<ProtectedRoute roles={['EMPLOYER']}><ManageApplications /></ProtectedRoute>} />
        <Route path="/employer/schedule/:applicationId" element={<ProtectedRoute roles={['EMPLOYER']}><ScheduleInterview /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/skills" element={<ProtectedRoute roles={['ADMIN']}><VerifySkills /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
