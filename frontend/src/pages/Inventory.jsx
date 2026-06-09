import { useEffect, useState } from "react";
import { listProducts } from "../api/products";
import { adjustStock } from "../api/stock";
import { listTransactions } from "../api/transactions";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import { X, AlertTriangle } from "lucide-react";

function statusBadge(stock) {
  if (stock === 0) return { label: "Out of Stock", cls: "text-error" };
  if (stock <= 10) return { label: "Low Stock", cls: "text-warning" };
  return { label: "In Stock", cls: "text-success" };
}

function ProductOverlay({ product: initial, onClose, onStockUpdate }) {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [visible, setVisible] = useState(false);
  const [product, setProduct] = useState(initial);
  const [delta, setDelta] = useState(0);
  const [loading, setLoading] = useState(false);
  const [txs, setTxs] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    if (isAdmin) {
      setTxLoading(true);
      listTransactions(initial.id, 20)
        .then(setTxs)
        .finally(() => setTxLoading(false));
    }
    return () => cancelAnimationFrame(raf);
  }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 150);
  }

  const newStock = product.stock + delta;
  const canConfirm = delta !== 0 && newStock >= 0;

  function handleDelta(change) {
    setDelta((prev) => {
      const next = prev + change;
      if (product.stock + next < 0) return prev;
      return next;
    });
  }

  function handleInput(raw) {
    const val = raw.replace(/[^0-9-]/g, "");
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setDelta(0);
      return;
    }
    if (product.stock + num < 0) return;
    setDelta(num);
  }

  async function handleConfirm() {
    if (!canConfirm) return;
    setLoading(true);
    try {
      const res = await adjustStock(product.id, delta);
      setProduct((p) => ({ ...p, stock: res.new_total }));
      onStockUpdate?.(product.id, res.new_total);
      if (isAdmin) listTransactions(product.id, 20).then(setTxs);
      setDelta(0);
      showToast("Stock Updated Successfully", "success");
    } catch (err) {
      showToast(
        err?.response?.data?.detail ?? "Failed to update stock",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  const stockColor =
    product.stock === 0
      ? "text-error"
      : product.stock <= 10
        ? "text-warning"
        : "text-success";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm bg-black/40
        transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={close}
    >
      <div
        className={`bg-surface w-full sm:max-w-lg rounded-4xl overflow-hidden flex flex-col
          max-h-[92vh] sm:max-h-[85vh] transition-transform duration-150
          ${visible ? "translate-y-0" : "translate-y-6 sm:translate-y-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-mono text-on-surface-variant mb-0.5">
              {product.barcode}
            </p>
            <h2 className="text-lg font-bold text-on-surface">
              {product.name}
            </h2>
          </div>
          <button
            onClick={close}
            className="text-on-surface-variant active:opacity-60 transition-opacity ml-4 mt-0.5 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pb-6 flex flex-col gap-6">
          {/* Price + Stock */}
          <div className="flex items-end justify-between">
            {product.base_price != null ? (
              <div>
                <p className="text-xs text-on-surface-variant">Base Price</p>
                <p className="font-semibold text-on-surface">
                  Rp {Number(product.base_price).toLocaleString("id-ID")}
                </p>
              </div>
            ) : (
              <div />
            )}
            <div className="text-right">
              <p className="text-xs text-on-surface-variant">Current Stock</p>
              <p className={`text-xl font-bold`}>
                {product.stock}
              </p>
            </div>
          </div>

          {/* Adjustment controls */}
          <div>
            <p className="text-xs text-on-surface-variant mb-4">Adjust Stock</p>
            <div className="flex items-center gap-4 justify-center mb-4">
              <button
                onClick={() => handleDelta(-1)}
                disabled={newStock <= 0}
                className="w-12 h-12 rounded-full border text-on-surface text-xl
                  flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={delta === 0 ? "" : String(delta)}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="0"
                className="w-24 text-center text-2xl font-semibold text-on-surface
                  bg-transparent focus:outline-none py-1"
              />
              <button
                onClick={() => handleDelta(1)}
                className="w-12 h-12 rounded-full text-primary text-xl border
                  flex items-center justify-center active:scale-90 transition-transform"
              >
                +
              </button>
            </div>

            <div className="flex flex-col justify-center items-center">
              <p
                className={`text-center text-sm text-on-surface-variant overflow-hidden transition-all duration-150
              ${delta !== 0 ? "max-h-8 mb-4" : "max-h-0 mb-0"}`}
              >
                New stock:{" "}
                <span
                  className={`font-semibold ${newStock === 0 ? "text-error" : "text-on-surface"}`}
                >
                  {newStock}
                </span>
                <span className="ml-1.5">
                  {delta > 0 ? `(+${delta})` : `(${delta})`}
                </span>
              </p>

              <button
                onClick={handleConfirm}
                disabled={!canConfirm || loading}
                className="px-4 bg-primary text-on-primary py-3 rounded-full text-sm
                min-h-[48px] active:scale-95 transition-transform disabled:opacity-40"
              >
                {loading ? "Updating…" : "Confirm Adjustment"}
              </button>
            </div>

            {product.stock === 0 && delta === 0 && (
              <p className="text-xs text-error text-center mt-3 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                This product is out of stock
              </p>
            )}
          </div>

          {/* Admin: transaction history */}
          {isAdmin && (
            <div className="pt-5">
              <p className="text-xs text-on-surface-variant mb-3">
                Recent Adjustments
              </p>
              {txLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : txs.length === 0 ? (
                <p className="text-xs text-on-surface-variant py-3">
                  No transactions yet.
                </p>
              ) : (
                <div className="flex flex-col">
                  {txs.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-xs py-2.5 border-b border-outline last:border-0"
                    >
                      <span className="text-on-surface-variant">
                        {new Date(tx.timestamp).toLocaleString("id-ID", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      <span
                        className={`font-bold ${tx.adjustment > 0 ? "text-success" : "text-error"}`}
                      >
                        {tx.adjustment > 0 ? "+" : ""}
                        {tx.adjustment}
                      </span>
                      <span className="text-on-surface">→ {tx.new_total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search),
  );

  function handleStockUpdate(productId, newTotal) {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newTotal } : p)),
    );
  }

  return (
    <Layout>
      <div className="px-4 md:px-8 pt-6 md:pt-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h1 className="text-lg font-bold text-on-surface">Inventory</h1>
          <span className="text-sm text-on-surface-variant">
            {filtered.length} products
          </span>
        </div>

        <input
          type="search"
          placeholder="Search name or barcode…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-sm px-4 py-3 rounded-full border border-outline bg-surface text-on-surface
            focus:outline-none focus:border-primary focus:ring-primary/20 mb-4 md:mb-6 min-h-[48px]"
        />

        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-on-surface-variant py-12">
            No products found.
          </p>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="flex flex-col gap-3 md:hidden pb-4">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => setSelected(p)}
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
              {filtered.map((p, i) => {
                const badge = statusBadge(p.stock);
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`flex items-center px-4 py-3 cursor-pointer hover:bg-surface-variant/40 transition-colors border-y border-black/10
                      ${i !== filtered.length - 1 ? "border-y border-black" : ""}`}
                  >
                    <div className="flex-[3] min-w-0 pr-3">
                      <p className="font-medium text-on-surface truncate">
                        {p.name}
                      </p>
                      {p.description && (
                        <p className="text-xs text-on-surface-variant truncate">
                          {p.description}
                        </p>
                      )}
                    </div>
                    <span className="flex-[2] font-mono text-on-surface-variant text-xs pr-3">
                      {p.barcode}
                    </span>
                    <span className="flex-[2] text-on-surface pr-3">
                      {p.base_price != null
                        ? `Rp ${Number(p.base_price).toLocaleString("id-ID")}`
                        : "—"}
                    </span>
                    <span className="flex-1 text-right font-bold text-on-surface">
                      {p.stock}
                    </span>
                    <span className="flex-[1.5] text-center">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {selected && (
        <ProductOverlay
          product={selected}
          onClose={() => setSelected(null)}
          onStockUpdate={handleStockUpdate}
        />
      )}
    </Layout>
  );
}

function ProductCard({ product: p, onClick }) {
  const badge = statusBadge(p.stock);
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface p-4 active:bg-surface-variant transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-on-surface truncate">{p.name}</p>
          <p className="text-xs text-on-surface-variant font-mono mt-0.5">
            {p.barcode}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full shrink-0 ${badge.cls}`}
        >
          {badge.label}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-on-surface-variant">
          {p.base_price != null
            ? `Rp ${Number(p.base_price).toLocaleString("id-ID")}`
            : "—"}
        </span>
        <span className="text-lg font-semibold text-on-surface">
          {p.stock}{" "}
          <span className="text-xs font-normal text-on-surface-variant">
            units
          </span>
        </span>
      </div>
    </button>
  );
}
