import client from './client'

export const getAnalyticsSummary = () =>
  client.get('/analytics/summary').then((r) => r.data)

export const listAnalyticsTransactions = (params = {}) =>
  client.get('/analytics/transactions', { params }).then((r) => r.data)
