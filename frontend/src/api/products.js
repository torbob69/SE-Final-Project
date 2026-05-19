import client from './client'

export const listProducts = (includeArchived = false) =>
  client.get('/products/', { params: { include_archived: includeArchived } }).then((r) => r.data)

export const getProduct = (id) =>
  client.get(`/products/${id}`).then((r) => r.data)

export const getByBarcode = (barcode) =>
  client.get(`/products/barcode/${barcode}`).then((r) => r.data)

export const createProduct = (data) =>
  client.post('/products/', data).then((r) => r.data)

export const updateProduct = (id, data) =>
  client.patch(`/products/${id}`, data).then((r) => r.data)

export const archiveProduct = (id) =>
  client.delete(`/products/${id}`)

export const generateBarcode = () =>
  client.get('/products/generate-barcode').then((r) => r.data.barcode)
