import client from './client'

export const listTransactions = (productId = null, limit = 100) =>
  client
    .get('/transactions/', { params: { product_id: productId, limit } })
    .then((r) => r.data)

