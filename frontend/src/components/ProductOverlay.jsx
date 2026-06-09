import { useEffect, useState } from "react";
import { adjustStock } from "../api/stock";
import { listTransactions } from "../api/transactions";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { X, AlertTriangle } from "lucide-react";

export default function ProductOverlay({ product: initial, onClose, onStockUpdate }) {
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
    if (isNaN(num)) { setDelta(0); return; }
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
      showToast(err?.response?.data?.detail ?? "Failed to update stock", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end backdrop-blur-sm bg-black/40
        transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={close}
    >
      <div
        className={`bg-surface w-full md:w-[400px] rounded-t-2xl md:rounded-none
          overflow-hidden flex flex-col max-h-[92vh] md:max-h-full md:h-full transition-transform duration-150
          ${visible ? "translate-y-0 md:translate-x-0" : "translate-y-6 md:translate-y-0 md:translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-mono text-on-surface-variant mb-0.5">{product.barcode}</p>
            <h2 className="text-lg font-bold text-on-surface">{product.name}</h2>
          </div>
          <button onClick={close} className="text-on-surface-variant active:opacity-60 transition-opacity ml-4 mt-0.5 shrink-0">
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
              <p className="text-xl font-bold text-on-surface">{product.stock}</p>
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
                className="w-24 text-center text-2xl font-semibold text-on-surface bg-transparent focus:outline-none py-1"
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
              <p className={`text-center text-sm text-on-surface-variant overflow-hidden transition-all duration-150
                ${delta !== 0 ? "max-h-8 mb-4" : "max-h-0 mb-0"}`}>
                New stock:{" "}
                <span className={`font-semibold ${newStock === 0 ? "text-error" : "text-on-surface"}`}>
                  {newStock}
                </span>
                <span className="ml-1.5">{delta > 0 ? `(+${delta})` : `(${delta})`}</span>
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

          {/* Admin: transaction history (desktop only) */}
          {isAdmin && (
            <div className="hidden md:block pt-5">
              <p className="text-xs text-on-surface-variant mb-3">Recent Adjustments</p>
              {txLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : txs.length === 0 ? (
                <p className="text-xs text-on-surface-variant py-3">No transactions yet.</p>
              ) : (
                <div className="flex flex-col">
                  {txs.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-xs py-2.5 border-b border-outline last:border-0">
                      <span className="text-on-surface-variant">
                        {new Date(tx.timestamp).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      <span className={`font-bold ${tx.adjustment > 0 ? "text-success" : "text-error"}`}>
                        {tx.adjustment > 0 ? "+" : ""}{tx.adjustment}
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
