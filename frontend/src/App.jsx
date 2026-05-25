import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import StandoutAnimations from './components/StandoutAnimations'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import JobList from './pages/JobList'
import JobDetail from './pages/JobDetail'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import NotFound from './pages/NotFound'
import ForgotPassword from './pages/ForgotPassword'
import SavedJobs from './pages/seeker/SavedJobs'

import SeekerDashboard from './pages/seeker/SeekerDashboard'
import MyApplications from './pages/seeker/MyApplications'
import MyInterviews from './pages/seeker/MyInterviews'
import MyOffers from './pages/seeker/MyOffers'

import EmployerDashboard from './pages/employer/EmployerDashboard'
import PostJob from './pages/employer/PostJob'
import EditJob from './pages/employer/EditJob'
import ManageApplications from './pages/employer/ManageApplications'
import ScheduleInterview from './pages/employer/ScheduleInterview'
import EmployerInterviews from './pages/employer/EmployerInterviews'
import CompanyProfile from './pages/employer/CompanyProfile'

import AdminLogin from './pages/admin/AdminLogin'
import AdminRegister from './pages/admin/AdminRegister'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import VerifySkills from './pages/admin/VerifySkills'
import ManageJobs from './pages/admin/ManageJobs'
import AllApplications from './pages/admin/AllApplications'
import CareerRoom from './pages/CareerRoom'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight:'60vh' }}>
      <div className="spinner-border" style={{ color:'#0A66C2' }}></div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function WithNav({ children }) {
  return <>
    <Navbar />
    <StandoutAnimations />
    <div className="sb-page-shell">{children}</div>
  </>
}

function WithBackground({ children }) {
  return <>
    <StandoutAnimations />
    <div className="sb-page-shell">{children}</div>
  </>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Admin standalone - no navbar */}
      <Route path="/admin/login" element={<WithBackground><AdminLogin /></WithBackground>} />
      <Route path="/admin/register" element={<WithBackground><AdminRegister /></WithBackground>} />

      {/* Public */}
      <Route path="/" element={<WithNav><Home /></WithNav>} />
      <Route path="/login" element={<WithNav><Login /></WithNav>} />
      <Route path="/register" element={<WithNav><Register /></WithNav>} />
      <Route path="/jobs" element={<WithNav><JobList /></WithNav>} />
      <Route path="/career-room" element={<ProtectedRoute roles={['SEEKER']}><WithNav><CareerRoom /></WithNav></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<WithNav><JobDetail /></WithNav>} />

      {/* Forgot Password — public */}
      <Route path="/forgot-password" element={<WithNav><ForgotPassword /></WithNav>} />

      {/* Any logged in user */}
      <Route path="/profile" element={<ProtectedRoute><WithNav><Profile /></WithNav></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><WithNav><ChangePassword /></WithNav></ProtectedRoute>} />

      {/* ── SEEKER ── */}
      <Route path="/seeker/dashboard" element={<ProtectedRoute roles={['SEEKER']}><WithNav><SeekerDashboard /></WithNav></ProtectedRoute>} />
      <Route path="/seeker/applications" element={<ProtectedRoute roles={['SEEKER']}><WithNav><MyApplications /></WithNav></ProtectedRoute>} />
      <Route path="/seeker/interviews" element={<ProtectedRoute roles={['SEEKER']}><WithNav><MyInterviews /></WithNav></ProtectedRoute>} />
      <Route path="/seeker/saved-jobs" element={<ProtectedRoute roles={['SEEKER']}><WithNav><SavedJobs /></WithNav></ProtectedRoute>} />
      <Route path="/seeker/offers" element={<ProtectedRoute roles={['SEEKER']}><WithNav><MyOffers /></WithNav></ProtectedRoute>} />

      {/* ── EMPLOYER ── */}
      <Route path="/employer/dashboard" element={<ProtectedRoute roles={['EMPLOYER']}><WithNav><EmployerDashboard /></WithNav></ProtectedRoute>} />
      <Route path="/employer/post-job" element={<ProtectedRoute roles={['EMPLOYER']}><WithNav><PostJob /></WithNav></ProtectedRoute>} />
      <Route path="/employer/edit-job/:jobId" element={<ProtectedRoute roles={['EMPLOYER']}><WithNav><EditJob /></WithNav></ProtectedRoute>} />
      <Route path="/employer/applications/:jobId" element={<ProtectedRoute roles={['EMPLOYER']}><WithNav><ManageApplications /></WithNav></ProtectedRoute>} />
      <Route path="/employer/schedule/:applicationId" element={<ProtectedRoute roles={['EMPLOYER']}><WithNav><ScheduleInterview /></WithNav></ProtectedRoute>} />
      <Route path="/employer/interviews" element={<ProtectedRoute roles={['EMPLOYER']}><WithNav><EmployerInterviews /></WithNav></ProtectedRoute>} />
      <Route path="/employer/company-profile" element={<ProtectedRoute roles={['EMPLOYER']}><WithNav><CompanyProfile /></WithNav></ProtectedRoute>} />

      {/* ── ADMIN ── */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><WithNav><AdminDashboard /></WithNav></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><WithNav><ManageUsers /></WithNav></ProtectedRoute>} />
      <Route path="/admin/skills" element={<ProtectedRoute roles={['ADMIN']}><WithNav><VerifySkills /></WithNav></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute roles={['ADMIN']}><WithNav><ManageJobs /></WithNav></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute roles={['ADMIN']}><WithNav><AllApplications /></WithNav></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<WithNav><NotFound /></WithNav>} />
    </Routes>
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
