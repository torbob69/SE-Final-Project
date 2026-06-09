import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProducts, createProduct, updateProduct, archiveProduct, generateBarcode } from '../../api/products'
import { useToast } from '../../context/ToastContext'
import Layout from '../../components/Layout'
import { X } from 'lucide-react'

const EMPTY_FORM = { name: '', description: '', base_price: '', stock: '0', barcode: '' }

export default function AdminConsole() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
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

  return (
    <Layout>
      <div className="px-4 md:px-8 pt-6 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-on-surface">Product Management</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">{products.length} products</p>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm text-primary active:opacity-60 transition-opacity"
            >
              Users
            </button>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="text-sm text-on-surface active:opacity-60 transition-opacity"
            >
              {showForm ? 'Cancel' : '+ Add'}
            </button>
          </div>
        </div>

        {/* Add Product form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="border-t border-outline pt-5 pb-6 mb-2">
            <p className="text-xs text-on-surface-variant mb-5">New Product</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <Field label="Name *" value={form.name} onChange={(v) => setField('name', v)} placeholder="Product name" required />
              <Field label="Description" value={form.description} onChange={(v) => setField('description', v)} placeholder="Optional" />
              <Field label="Base Price (Rp)" value={form.base_price} onChange={(v) => setField('base_price', v)} placeholder="0" inputMode="decimal" />
              <Field label="Initial Stock" value={form.stock} onChange={(v) => setField('stock', v)} placeholder="0" inputMode="numeric" />
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs text-on-surface-variant">Barcode *</label>
                <div className="flex gap-3 items-end">
                  <input
                    value={form.barcode}
                    onChange={(e) => setField('barcode', e.target.value)}
                    placeholder="12-digit barcode"
                    required
                    className="flex-1 py-2 border-b border-outline bg-transparent text-on-surface
                      focus:outline-none focus:border-primary text-sm transition-colors
                      placeholder:text-on-surface-variant/50"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="text-xs text-primary active:opacity-60 transition-opacity whitespace-nowrap pb-2"
                  >
                    Auto-generate
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-on-primary font-medium text-sm py-2.5 px-6 rounded-full
                min-h-[44px] active:opacity-80 transition-opacity disabled:opacity-40"
            >
              {submitting ? 'Creating…' : 'Create Product'}
            </button>
          </form>
        )}

        {/* Search */}
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-sm px-4 py-3 rounded-full border border-outline bg-surface text-on-surface
            focus:outline-none focus:border-primary mb-4 md:mb-6 min-h-[48px]"
        />

        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="flex flex-col gap-3 md:hidden pb-4">
              {filtered.map((p) => (
                <MobileProductRow
                  key={p.id}
                  product={p}
                  onClick={() => setSelectedProduct(p)}
                />
              ))}
            </div>

            {/* Desktop: flex list */}
            <div className="hidden md:block bg-surface overflow-hidden mb-8 text-sm">
              <div className="flex items-center px-4 py-3 font-semibold text-on-surface-variant">
                <span className="flex-[3]">Product</span>
                <span className="flex-[2]">Barcode</span>
                <span className="flex-[2]">Price</span>
                <span className="flex-1 text-right">Stock</span>
                <span className="flex-[1.5] text-center">Status</span>
              </div>
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`flex items-center px-4 py-3 border-y border-black/10 cursor-pointer transition-colors
                    hover:bg-surface-variant/40
                    ${p.is_archived ? 'opacity-50' : ''}
                    ${i !== filtered.length - 1 ? 'border-y border-black/10' : ''}`}
                >
                  <div className="flex-[3] min-w-0 pr-3">
                    <p className="font-medium text-on-surface truncate">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-on-surface-variant truncate">{p.description}</p>
                    )}
                  </div>
                  <span className="flex-[2] font-mono text-on-surface-variant text-xs pr-3">{p.barcode}</span>
                  <span className="flex-[2] text-on-surface pr-3">
                    {p.base_price != null ? `Rp ${Number(p.base_price).toLocaleString('id-ID')}` : '—'}
                  </span>
                  <span className="flex-1 text-right font-semibold text-on-surface">{p.stock}</span>
                  <span className="flex-[1.5] text-center">
                    {p.is_archived ? (
                      <span className="text-xs font-semibold text-on-surface-variant">Archived</span>
                    ) : p.stock === 0 ? (
                      <span className="text-xs font-semibold text-error">Out of Stock</span>
                    ) : p.stock <= 10 ? (
                      <span className="text-xs font-semibold text-warning">Low Stock</span>
                    ) : (
                      <span className="text-xs font-semibold text-success">In Stock</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedProduct && (
        <AdminProductOverlay
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSaved={() => { load(); setSelectedProduct(null) }}
        />
      )}
    </Layout>
  )
}

function AdminProductOverlay({ product: initial, onClose, onSaved }) {
  const { showToast } = useToast()
  const [visible, setVisible] = useState(false)
  const [product] = useState(initial)
  const [editForm, setEditForm] = useState({
    name: initial.name,
    description: initial.description ?? '',
    base_price: initial.base_price != null ? String(initial.base_price) : '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  function close() {
    setVisible(false)
    setTimeout(onClose, 150)
  }

  function setField(key, val) {
    setEditForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!editForm.name) return
    setSubmitting(true)
    try {
      await updateProduct(product.id, {
        name: editForm.name,
        description: editForm.description || null,
        base_price: editForm.base_price ? parseFloat(editForm.base_price) : null,
      })
      showToast(`"${editForm.name}" updated`, 'success')
      onSaved()
    } catch (err) {
      showToast(err?.response?.data?.detail ?? 'Failed to update product', 'error')
      setSubmitting(false)
    }
  }

  async function handleArchiveToggle() {
    setArchiving(true)
    try {
      if (product.is_archived) {
        await updateProduct(product.id, { is_archived: false })
        showToast(`"${product.name}" restored`, 'success')
      } else {
        await archiveProduct(product.id)
        showToast(`"${product.name}" archived`, 'success')
      }
      onSaved()
    } catch {
      showToast('Action failed', 'error')
      setArchiving(false)
    }
  }

  const statusCls = product.is_archived
    ? 'text-on-surface-variant'
    : product.stock === 0 ? 'text-error'
    : product.stock <= 10 ? 'text-warning'
    : 'text-success'

  const statusLabel = product.is_archived
    ? 'Archived'
    : product.stock === 0 ? 'Out of Stock'
    : product.stock <= 10 ? 'Low Stock'
    : 'In Stock'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end backdrop-blur-sm bg-black/40
        transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={close}
    >
      <div
        className={`bg-surface w-full md:w-[400px] rounded-t-2xl md:rounded-none
          overflow-hidden flex flex-col max-h-[92vh] md:max-h-full md:h-full transition-transform duration-150
          ${visible ? 'translate-y-0 md:translate-x-0' : 'translate-y-6 md:translate-y-0 md:translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-mono text-on-surface-variant mb-0.5">{product.barcode}</p>
            <h2 className="text-lg font-bold text-on-surface">{product.name}</h2>
          </div>
          <button
            onClick={close}
            className="text-on-surface-variant active:opacity-60 transition-opacity ml-4 mt-0.5 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 pb-6 flex flex-col gap-6">
          {/* Price + Stock */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-on-surface-variant">Base Price</p>
              <p className="font-semibold text-on-surface">
                {product.base_price != null
                  ? `Rp ${Number(product.base_price).toLocaleString('id-ID')}`
                  : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant">
                Stock · <span className={statusCls}>{statusLabel}</span>
              </p>
              <p className="text-xl font-bold text-on-surface tabular-nums">{product.stock}</p>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <p className="text-xs text-on-surface-variant -mb-1">Edit Details</p>
            <Field
              label="Name *"
              value={editForm.name}
              onChange={(v) => setField('name', v)}
              placeholder="Product name"
              required
            />
            <Field
              label="Description"
              value={editForm.description}
              onChange={(v) => setField('description', v)}
              placeholder="Optional"
            />
            <Field
              label="Base Price (Rp)"
              value={editForm.base_price}
              onChange={(v) => setField('base_price', v)}
              placeholder="0"
              inputMode="decimal"
            />

            <div className="flex items-center gap-5 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 bg-primary text-on-primary py-3 rounded-full text-sm
                  min-h-[48px] active:scale-95 transition-transform disabled:opacity-40"
              >
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleArchiveToggle}
                disabled={archiving}
                className={`text-sm active:opacity-60 transition-opacity disabled:opacity-40
                  ${product.is_archived ? 'text-primary' : 'text-error'}`}
              >
                {archiving ? '…' : product.is_archived ? 'Restore' : 'Archive'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function MobileProductRow({ product: p, onClick }) {
  const statusCls = p.is_archived
    ? 'text-on-surface-variant'
    : p.stock === 0 ? 'text-error'
    : p.stock <= 10 ? 'text-warning'
    : 'text-success'
  const statusLabel = p.is_archived
    ? 'Archived'
    : p.stock === 0 ? 'Out of Stock'
    : p.stock <= 10 ? 'Low Stock'
    : 'In Stock'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-surface p-4 active:bg-surface-variant transition-colors ${p.is_archived ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-on-surface truncate">{p.name}</p>
          <p className="text-xs text-on-surface-variant font-mono mt-0.5">{p.barcode}</p>
        </div>
        <span className={`text-xs font-semibold shrink-0 ${statusCls}`}>{statusLabel}</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-on-surface-variant">
          {p.base_price != null ? `Rp ${Number(p.base_price).toLocaleString('id-ID')}` : '—'}
        </span>
        <span className="text-lg font-normal text-on-surface">
          {p.stock} <span className="text-xs font-normal text-on-surface-variant">units</span>
        </span>
      </div>
    </button>
  )
}

function Field({ label, value, onChange, placeholder, required, inputMode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-on-surface-variant">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        className="py-2 border-b border-outline bg-transparent text-on-surface text-sm
          focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
      />
    </div>
  )
}
