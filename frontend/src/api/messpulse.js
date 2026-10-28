import client from './client'

export const submitRating = (meal, rating) =>
  client.post('/mess-pulse/rate', { meal, rating }).then((r) => r.data)

export const getWeeklyRatings = () =>
  client.get('/mess-pulse/weekly').then((r) => r.data)

export const getTodayRatings = () =>
  client.get('/mess-pulse/today').then((r) => r.data)
