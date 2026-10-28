import client from './client'

export const getIssues = (params = {}) =>
  client.get('/issues', { params }).then((r) => r.data)

export const getIssue = (id) =>
  client.get(`/issues/${id}`).then((r) => r.data)

export const createIssue = (data) =>
  client.post('/issues', data).then((r) => r.data)

export const updateIssueStatus = (id, status, note = '') =>
  client.patch(`/admin/issues/${id}/status`, { status, note }).then((r) => r.data)

export const voteIssue = (id) =>
  client.post(`/issues/${id}/vote`).then((r) => r.data)

export const getComments = (id) =>
  client.get(`/issues/${id}/comments`).then((r) => r.data)

export const addComment = (id, text) =>
  client.post(`/issues/${id}/comments`, { text }).then((r) => r.data)

export const getStats = () =>
  client.get('/stats').then((r) => r.data)
