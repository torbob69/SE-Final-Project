import client from './client'

export const checkout = (items) =>
  client
    .post('/checkout/', { items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })) })
    .then((r) => r.data)
