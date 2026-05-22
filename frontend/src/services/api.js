import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Auth ───
export const register = (data) => API.post('/auth/register', data)
export const login    = (data) => API.post('/auth/login', data)

// ─── Jobs ───
export const getAllJobs    = ()           => API.get('/jobs/all')
export const searchJobs   = (params)     => API.get('/jobs/search', { params })
export const getJobById   = (id)         => API.get(`/jobs/${id}`)
export const createJob    = (data)       => API.post('/jobs/create', data)
export const getMyJobs    = ()           => API.get('/jobs/my-jobs')
export const updateJob    = (id, data)   => API.put(`/jobs/${id}`, data)
export const deleteJob    = (id)         => API.delete(`/jobs/${id}`)
export const getMatchScore = (jobId)     => API.get(`/jobs/match-score/${jobId}`)

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

// ─── Resume ───
export const uploadResume = (formData) => API.post('/files/upload-resume', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const deleteResume = () => API.delete('/files/resume')

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
