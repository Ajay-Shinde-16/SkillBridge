import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const register = (data) => API.post('/auth/register', data)
export const login = (data) => API.post('/auth/login', data)

// Jobs
export const getAllJobs = () => API.get('/jobs/all')
export const searchJobs = (params) => API.get('/jobs/search', { params })
export const getJobById = (id) => API.get(`/jobs/${id}`)
export const createJob = (data) => API.post('/jobs/create', data)
export const getMyJobs = () => API.get('/jobs/my-jobs')
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data)
export const deleteJob = (id) => API.delete(`/jobs/${id}`)
export const getMatchScore = (jobId) => API.get(`/jobs/match-score/${jobId}`)

// Applications
export const applyToJob = (jobId, data) => API.post(`/applications/apply/${jobId}`, data)
export const getMyApplications = () => API.get('/applications/my-applications')
export const getJobApplications = (jobId) => API.get(`/applications/job/${jobId}`)
export const updateApplicationStatus = (id, data) => API.put(`/applications/${id}/status`, data)
export const getAllApplications = () => API.get('/applications/all')

// Interviews
export const scheduleInterview = (data) => API.post('/interviews/schedule', data)
export const getMyInterviews = () => API.get('/interviews/my-interviews')
export const getEmployerInterviews = () => API.get('/interviews/employer-interviews')
export const updateInterview = (id, data) => API.put(`/interviews/${id}`, data)
export const getAllInterviews = () => API.get('/interviews/all')

// Skills
export const getAllSkills = () => API.get('/skills/all')
export const getVerifiedSkills = () => API.get('/skills/verified')
export const updateMySkills = (skills) => API.put('/skills/update-my-skills', { skills })
export const verifyUserSkill = (data) => API.put('/skills/verify-user-skill', data)
export const addSkill = (data) => API.post('/skills/add', data)

// Profile
export const getProfile = () => API.get('/users/profile')
export const updateProfile = (data) => API.put('/users/profile', data)
export const getAllUsers = () => API.get('/users/all')
export const deleteUser = (id) => API.delete(`/users/${id}`)

export default API
