import client from './client'

export const getMe = () => client.get('/users/me').then((r) => r.data)

export const listUsers = () => client.get('/users/').then((r) => r.data)
