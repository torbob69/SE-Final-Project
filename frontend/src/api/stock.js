import client from './client'

export const adjustStock = (productId, adjustment) =>
  client.patch(`/products/${productId}/stock`, { adjustment }).then((r) => r.data)
