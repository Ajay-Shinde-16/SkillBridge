import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Auto-logout on expired/invalid token ───
// When the server rejects the JWT (401), the stored session is stale. Clear it and
// send the user to login instead of leaving the UI stuck on failed calls. The login
// and auth endpoints are exempt so a wrong password on the login page doesn't redirect.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/verify-login-otp')
    if (status === 401 && !isAuthCall) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ───
export const register = (data) => API.post('/auth/register', data)
export const login    = (data) => API.post('/auth/login', data)
export const verifyLoginOtp = (data) => API.post('/auth/verify-login-otp', data)
export const toggle2FA = (enabled) => API.put('/users/2fa', { enabled })

// ─── Jobs ───
export const getAllJobs    = ()           => API.get('/jobs/all')
export const searchJobs   = (params)     => API.get('/jobs/search', { params })
export const getJobById   = (id)         => API.get(`/jobs/${id}`)
export const createJob    = (data)       => API.post('/jobs/create', data)
export const getMyJobs    = ()           => API.get('/jobs/my-jobs')
export const updateJob    = (id, data)   => API.put(`/jobs/${id}`, data)
export const deleteJob    = (id)         => API.delete(`/jobs/${id}`)
export const getMatchScore = (jobId)     => API.get(`/jobs/match-score/${jobId}`)

// ─── Resume viewing (authenticated blob) ───
// Resume endpoints now require a valid JWT, so a plain <a href> link won't work
// (links don't send the Authorization header). These fetch the PDF as a blob
// through the authenticated axios instance and return an object URL to open.
export const fetchResumeByUserId = (userId) =>
  API.get(`/files/resume/${userId}`, { responseType: 'blob' })
export const fetchResumeById = (resumeId) =>
  API.get(`/files/resumes/${resumeId}/view`, { responseType: 'blob' })

// Opens a resume PDF in a new tab after fetching it with auth. `ref` is either
// a userId (default) or a resumeId when byResumeId=true.
export const openResume = async (ref, byResumeId = false) => {
  try {
    const { data } = byResumeId ? await fetchResumeById(ref) : await fetchResumeByUserId(ref)
    const url = window.URL.createObjectURL(data)
    window.open(url, '_blank')
    // give the browser a moment to load it before revoking
    setTimeout(() => window.URL.revokeObjectURL(url), 60000)
  } catch (e) {
    alert('Could not open resume. You may not have permission, or it is unavailable.')
  }
}
// ─── Admin job verification ───
export const getAllJobsAdmin = ()        => API.get('/jobs/admin/all')
export const getPendingJobs = ()         => API.get('/jobs/admin/pending')
export const verifyJob      = (id)       => API.put(`/jobs/${id}/verify`)
export const unverifyJob    = (id)       => API.put(`/jobs/${id}/unverify`)

// ─── Applications ───
export const applyToJob              = (jobId, data) => API.post(`/applications/apply/${jobId}`, data)
export const getMyApplications       = ()            => API.get('/applications/my-applications')
export const getJobApplications      = (jobId)       => API.get(`/applications/job/${jobId}`)
export const updateApplicationStatus = (id, data)    => API.put(`/applications/${id}/status`, data)
export const withdrawApplication     = (id)          => API.delete(`/applications/${id}/withdraw`)
export const getAllApplications       = ()            => API.get('/applications/all')
export const downloadOfferLetterPdf  = (id)          => API.get(`/applications/${id}/offer-letter-pdf`, { responseType: 'blob' })

// ─── Interviews ───
export const scheduleInterview         = (data)     => API.post('/interviews/schedule', data)
export const getMyInterviews           = ()         => API.get('/interviews/my-interviews')
export const getEmployerInterviewsList = ()         => API.get('/interviews/employer-interviews')
export const updateInterview           = (id, data) => API.put(`/interviews/${id}`, data)
export const joinInterview             = (id)       => API.put(`/interviews/${id}/join`)
export const getAllInterviews           = ()         => API.get('/interviews/all')

// ─── Skills ───
export const getAllSkills      = ()       => API.get('/skills/all')
export const getVerifiedSkills = ()       => API.get('/skills/verified')
export const updateMySkills   = (skills)  => API.put('/skills/update-my-skills', { skills })
export const verifyUserSkill  = (data)    => API.put('/skills/verify-user-skill', data)
export const addSkill         = (data)    => API.post('/skills/add', data)

// ─── Users / Profile ───
export const getProfile      = ()       => API.get('/users/profile')
export const updateProfile   = (data)   => API.put('/users/profile', data)
export const changePassword  = (data)   => API.put('/users/change-password', data)
export const getAllUsers      = ()       => API.get('/users/all')
export const deleteUser      = (id)     => API.delete(`/users/${id}`)
export const toggleUserActive = (id)    => API.put(`/users/${id}/toggle-active`)

// ─── Resume (multiple resumes per seeker) ───
export const uploadResume   = (formData) => API.post('/files/upload-resume', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getResumes     = ()           => API.get('/files/resumes')
export const setPrimaryResume = (resumeId) => API.put(`/files/resumes/${resumeId}/primary`)
export const deleteResumeById = (resumeId) => API.delete(`/files/resumes/${resumeId}`)

export default API

// ─── Notifications ───
export const getNotifications    = ()    => API.get('/notifications')
export const getUnreadCount      = ()    => API.get('/notifications/unread-count')
export const markAllRead         = ()    => API.put('/notifications/mark-all-read')
export const markNotifRead       = (id)  => API.put(`/notifications/${id}/read`)
export const clearNotifications  = ()    => API.delete('/notifications/clear')

// ─── Saved Jobs ───
export const toggleSavedJob  = (jobId) => API.put(`/users/saved-jobs/${jobId}`)
export const getSavedJobs    = ()      => API.get('/users/saved-jobs')

// ─── Forgot Password ───
export const forgotPassword  = (data) => API.post('/users/forgot-password', data)
export const resetPassword   = (data) => API.post('/users/reset-password', data)

// ─── Job Status Toggle ───
export const updateJobStatus = (id, status) => API.put(`/jobs/${id}/status`, { status })

// ─── Job Alerts ───
export const createJobAlert = (data) => API.post('/job-alerts', data)
export const getJobAlerts   = ()     => API.get('/job-alerts')
export const deleteJobAlert = (id)   => API.delete(`/job-alerts/${id}`)

// ─── Messages ───
export const getMessageThread = (applicationId) => API.get(`/messages/${applicationId}`)
export const sendMessage      = (applicationId, content) => API.post(`/messages/${applicationId}`, { content })

// Pre-application inquiries (message a company before applying)
export const getMyJobThread   = (jobId)            => API.get(`/messages/job/${jobId}`)
export const sendMyJobMessage = (jobId, content)   => API.post(`/messages/job/${jobId}`, { content })
export const getJobInquiries  = (jobId)            => API.get(`/messages/job/${jobId}/inquiries`)
export const getInquiryThread = (jobId, seekerId)  => API.get(`/messages/job/${jobId}/seeker/${seekerId}`)
export const replyToInquiry   = (jobId, seekerId, content) => API.post(`/messages/job/${jobId}/seeker/${seekerId}`, { content })