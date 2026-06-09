import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProducts, createProduct, updateProduct, archiveProduct, generateBarcode } from '../../api/products'
import { useToast } from '../../context/ToastContext'
import Layout from '../../components/Layout'

const EMPTY_FORM = { name: '', description: '', base_price: '', stock: '0', barcode: '' }
const EMPTY_EDIT = { name: '', description: '', base_price: '' }

export default function AdminConsole() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_EDIT)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()

  function load() {
    setLoading(true)
    listProducts(true).then(setProducts).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  )

  function setField(key, val) { setForm((prev) => ({ ...prev, [key]: val })) }
  function setEditField(key, val) { setEditForm((prev) => ({ ...prev, [key]: val })) }

  function openEdit(product) {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      description: product.description ?? '',
      base_price: product.base_price != null ? String(product.base_price) : '',
    })
    setShowForm(false)
  }

  function closeEdit() {
    setEditingProduct(null)
    setEditForm(EMPTY_EDIT)
  }

  async function handleGenerateBarcode() {
    try { setField('barcode', await generateBarcode()) }
    catch { showToast('Could not generate barcode', 'error') }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.barcode) return
    setSubmitting(true)
    try {
      await createProduct({
        name: form.name,
        description: form.description || null,
        base_price: form.base_price ? parseFloat(form.base_price) : null,
        stock: parseInt(form.stock, 10) || 0,
        barcode: form.barcode,
      })
      showToast('Product created', 'success')
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    } catch (err) {
      showToast(err?.response?.data?.detail ?? 'Failed to create product', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditSave(e) {
    e.preventDefault()
    if (!editForm.name) return
    setEditSubmitting(true)
    try {
      await updateProduct(editingProduct.id, {
        name: editForm.name,
        description: editForm.description || null,
        base_price: editForm.base_price ? parseFloat(editForm.base_price) : null,
      })
      showToast(`"${editForm.name}" updated`, 'success')
      closeEdit()
      load()
    } catch (err) {
      showToast(err?.response?.data?.detail ?? 'Failed to update product', 'error')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleArchive(product) {
    try {
      await archiveProduct(product.id)
      showToast(`"${product.name}" archived`, 'success')
      load()
    } catch {
      showToast('Failed to archive product', 'error')
    }
  }

  async function handleUnarchive(product) {
    try {
      await updateProduct(product.id, { is_archived: false })
      showToast(`"${product.name}" restored`, 'success')
      load()
    } catch {
      showToast('Failed to restore product', 'error')
    }
  }

  return (
    <Layout>
      <div className="px-4 md:px-8 pt-6 md:pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Admin Console</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">{products.length} products total</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm font-medium text-primary border border-primary rounded-xl px-4 py-2 min-h-[48px] active:bg-primary-container"
            >
              Manage Users
            </button>
            <button
              onClick={() => { setShowForm((v) => !v); closeEdit() }}
              className="bg-primary text-on-primary px-4 py-2 rounded-xl font-semibold text-sm min-h-[48px] active:scale-95 transition-transform"
            >
              {showForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>
        </div>

        {/* Add Product form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-surface-variant rounded-2xl p-5 mb-6">
            <h2 className="font-semibold text-on-surface mb-4">New Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name *" value={form.name} onChange={(v) => setField('name', v)} placeholder="Product name" required />
              <Field label="Description" value={form.description} onChange={(v) => setField('description', v)} placeholder="Optional" />
              <Field label="Base Price (Rp)" value={form.base_price} onChange={(v) => setField('base_price', v)} placeholder="0" inputMode="decimal" />
              <Field label="Initial Stock" value={form.stock} onChange={(v) => setField('stock', v)} placeholder="0" inputMode="numeric" />
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-sm font-medium text-on-surface-variant">Barcode *</label>
                <div className="flex gap-2">
                  <input
                    value={form.barcode}
                    onChange={(e) => setField('barcode', e.target.value)}
                    placeholder="12-digit barcode"
                    required
                    className="flex-1 px-3 py-2 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:border-primary text-sm min-h-[48px]"
                  />
                  <button type="button" onClick={handleGenerateBarcode}
                    className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-medium text-sm min-h-[48px] active:scale-95 transition-transform whitespace-nowrap">
                    Auto-generate
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full md:w-auto md:px-8 bg-primary text-on-primary font-semibold py-3 rounded-xl min-h-[48px] active:scale-95 transition-transform disabled:opacity-60 mt-4">
              {submitting ? 'Creating…' : 'Create Product'}
            </button>
          </form>
        )}

        {/* Edit Product form */}
        {editingProduct && (
          <form onSubmit={handleEditSave} className="bg-surface-variant rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-on-surface">Edit Product</h2>
              <button type="button" onClick={closeEdit}
                className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name *" value={editForm.name} onChange={(v) => setEditField('name', v)} placeholder="Product name" required />
              <Field label="Description" value={editForm.description} onChange={(v) => setEditField('description', v)} placeholder="Optional" />
              <Field label="Base Price (Rp)" value={editForm.base_price} onChange={(v) => setEditField('base_price', v)} placeholder="0" inputMode="decimal" />
            </div>
            <button type="submit" disabled={editSubmitting}
              className="w-full md:w-auto md:px-8 bg-primary text-on-primary font-semibold py-3 rounded-xl min-h-[48px] active:scale-95 transition-transform disabled:opacity-60 mt-4">
              {editSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* Search */}
        <input type="search" placeholder="Search products…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-sm px-4 py-3 rounded-full border border-outline bg-surface text-on-surface
            focus:outline-none focus:border-primary mb-4 min-h-[48px]"
        />

        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="flex flex-col gap-2 md:hidden pb-4">
              {filtered.map((p) => (
                <MobileProductRow key={p.id} product={p}
                  isEditing={editingProduct?.id === p.id}
                  onView={() => navigate(`/product/${p.id}`, { state: { product: p } })}
                  onEdit={() => openEdit(p)}
                  onArchive={() => handleArchive(p)}
                  onUnarchive={() => handleUnarchive(p)} />
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-surface border border-surface-variant rounded-2xl overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-variant bg-surface-variant/50">
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Product</th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Barcode</th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Price</th>
                    <th className="text-right px-4 py-3 font-semibold text-on-surface-variant">Stock</th>
                    <th className="text-center px-4 py-3 font-semibold text-on-surface-variant">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id}
                      className={`${p.is_archived ? 'opacity-50' : ''} ${editingProduct?.id === p.id ? 'bg-primary-container/20' : ''} ${i !== filtered.length - 1 ? 'border-b border-surface-variant' : ''}`}>
                      <td className="px-4 py-3">
                        <button className="text-left hover:text-primary transition-colors"
                          onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}>
                          <p className="font-medium text-on-surface">{p.name}</p>
                          {p.description && <p className="text-xs text-on-surface-variant truncate max-w-xs">{p.description}</p>}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{p.barcode}</td>
                      <td className="px-4 py-3 text-on-surface">
                        {p.base_price != null ? `Rp ${Number(p.base_price).toLocaleString('id-ID')}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-on-surface">{p.stock}</td>
                      <td className="px-4 py-3 text-center">
                        {p.is_archived ? (
                          <span className="text-xs text-outline bg-surface-variant px-2 py-1 rounded-full">Archived</span>
                        ) : p.stock === 0 ? (
                          <span className="text-xs bg-error-container text-error px-2 py-1 rounded-full">Out</span>
                        ) : p.stock <= 10 ? (
                          <span className="text-xs bg-warning-container text-warning px-2 py-1 rounded-full">Low</span>
                        ) : (
                          <span className="text-xs bg-success-container text-success px-2 py-1 rounded-full">OK</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)}
                            className="text-xs text-on-surface-variant border border-outline rounded-lg px-3 py-1.5 hover:bg-surface-variant transition-colors">
                            Edit
                          </button>
                          {p.is_archived ? (
                            <button onClick={() => handleUnarchive(p)}
                              className="text-xs text-primary border border-primary rounded-lg px-3 py-1.5 hover:bg-primary-container transition-colors">
                              Restore
                            </button>
                          ) : (
                            <button onClick={() => handleArchive(p)}
                              className="text-xs text-error border border-error rounded-lg px-3 py-1.5 hover:bg-error-container transition-colors">
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

function MobileProductRow({ product: p, isEditing, onView, onEdit, onArchive, onUnarchive }) {
  return (
    <div className={`bg-surface border rounded-xl p-3 flex items-center justify-between gap-2
      ${isEditing ? 'border-primary' : p.is_archived ? 'border-outline opacity-50' : 'border-surface-variant'}`}>
      <button className="flex-1 text-left min-w-0" onClick={onView}>
        <p className="font-medium text-on-surface text-sm truncate">{p.name}</p>
        <p className="text-xs text-on-surface-variant font-mono">{p.barcode}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Stock: <span className="font-semibold">{p.stock}</span>
          {p.is_archived && <span className="ml-2 text-outline">[archived]</span>}
        </p>
      </button>
      <div className="flex gap-1.5">
        <button onClick={onEdit}
          className="text-xs text-on-surface-variant border border-outline rounded-lg px-2 py-1 min-h-[40px] min-w-[44px] active:bg-surface-variant">
          Edit
        </button>
        {p.is_archived ? (
          <button onClick={onUnarchive}
            className="text-xs text-primary border border-primary rounded-lg px-2 py-1 min-h-[40px] min-w-[60px] active:bg-primary-container">
            Restore
          </button>
        ) : (
          <button onClick={onArchive}
            className="text-xs text-error border border-error rounded-lg px-2 py-1 min-h-[40px] min-w-[60px] active:bg-error-container">
            Archive
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required, inputMode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-on-surface-variant">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required} inputMode={inputMode}
        className="px-3 py-2 rounded-xl border border-outline bg-surface text-on-surface focus:outline-none focus:border-primary text-sm min-h-[48px]"
      />
    </div>
  )
}
