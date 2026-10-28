import client from './client'

export const getLostFoundItems = () =>
  client.get('/lost-found').then((r) => r.data)

export const createLostFoundItem = (data) =>
  client.post('/lost-found', data).then((r) => r.data)

export const claimItem = (id) =>
  client.post(`/lost-found/${id}/claim`).then((r) => r.data)
