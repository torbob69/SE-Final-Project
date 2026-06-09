import { useEffect, useState } from "react";
import { listProducts } from "../api/products";
import Layout from "../components/Layout";
import ProductOverlay from "../components/ProductOverlay";

function statusBadge(stock) {
  if (stock === 0) return { label: "Out of Stock", cls: "text-error" };
  if (stock <= 10) return { label: "Low Stock", cls: "text-warning" };
  return { label: "In Stock", cls: "text-success" };
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
