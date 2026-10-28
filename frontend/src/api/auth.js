import client from './client'

export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then((r) => r.data)

export const signup = (name, email, password) =>
  client.post('/auth/signup', { name, email, password }).then((r) => r.data)

export const getMe = () =>
  client.get('/auth/me').then((r) => r.data)
