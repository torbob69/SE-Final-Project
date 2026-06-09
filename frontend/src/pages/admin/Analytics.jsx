import { useEffect, useState } from 'react'
import { getAnalyticsSummary, listAnalyticsTransactions } from '../../api/analytics'
import Layout from '../../components/Layout'

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('sale')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    getAnalyticsSummary().then(setSummary).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setTxLoading(true)
    listAnalyticsTransactions({
      transaction_type: typeFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      limit: 200,
    }).then(setTxs).finally(() => setTxLoading(false))
  }, [typeFilter, dateFrom, dateTo])

  const maxIncome = summary?.daily_breakdown?.length
    ? Math.max(...summary.daily_breakdown.map((d) => Number(d.income)), 1)
    : 1

  return (
    <Layout>
      <div className="px-4 md:px-8 pt-6 md:pt-8 max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-bold text-on-surface">Analytics</h1>
        </div>

        {/* Summary stats */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : summary && (
          <>
            <div className="flex flex-wrap gap-x-12 gap-y-6 py-6">
              <StatBlock
                label="Income This Month"
                value={`Rp ${Number(summary.income_this_month).toLocaleString('id-ID')}`}
              />
              <StatBlock
                label="Items Sold This Month"
                value={summary.items_sold_this_month.toLocaleString()}
              />
              <StatBlock
                label="All-Time Income"
                value={`Rp ${Number(summary.income_all_time).toLocaleString('id-ID')}`}
              />
              <StatBlock
                label="All-Time Items Sold"
                value={summary.items_sold_all_time.toLocaleString()}
              />
            </div>

            {/* Chart + Top Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 mb-0">

              {/* Daily income chart */}
              <div>
                <p className="text-[10px] text-on-surface-variant mb-4">
                  Daily Income — Last 30 Days
                </p>
                {summary.daily_breakdown.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-6">No sales data yet.</p>
                ) : (
                  <div className="flex items-end gap-0.5 h-28">
                    {summary.daily_breakdown.map((d) => {
                      const height = Math.max((Number(d.income) / maxIncome) * 100, 2)
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                          <div
                            className="w-full bg-on-surface/20 hover:bg-primary transition-colors cursor-default"
                            style={{ height: `${height}%` }}
                          />
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex
                            flex-col items-center bg-on-surface text-surface text-[10px] rounded px-2 py-1
                            whitespace-nowrap z-10 pointer-events-none gap-0.5">
                            <span>{d.date}</span>
                            <span>Rp {Number(d.income).toLocaleString('id-ID')}</span>
                            <span>{d.items_sold} sold</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Top products */}
              <div>
                <p className="text-[10px] text-on-surface-variant mb-4">
                  Top Products
                </p>
                {summary.top_products.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-6">No sales data yet.</p>
                ) : (
                  <div className="flex flex-col">
                    {summary.top_products.map((p, i) => (
                      <div key={p.product_id} className="flex items-center gap-3 py-2.5">
                        <span className="w-4 text-xs text-on-surface-variant tabular-nums shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-on-surface truncate">{p.name}</p>
                          <p className="text-xs text-on-surface-variant">{p.qty_sold} units sold</p>
                        </div>
                        <span className="text-sm font-semibold text-on-surface tabular-nums shrink-0">
                          Rp {Number(p.revenue).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Transaction log */}
        <div className="pt-4 mt-4 mb-8">
          {/* Header + filters */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-5">
            <p className="text-xl text-on-surface shrink-0">
              Transaction Log
            </p>
            <div className="flex flex-wrap gap-4 md:ml-auto items-end">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm border-b border-outline bg-transparent text-on-surface
                  focus:outline-none focus:border-primary py-1 pr-4 appearance-none cursor-pointer"
              >
                <option value="">All types</option>
                <option value="sale">Sales</option>
                <option value="adjustment">Adjustments</option>
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm border-b border-outline bg-transparent text-on-surface
                  focus:outline-none focus:border-primary py-1"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm border-b border-outline bg-transparent text-on-surface
                  focus:outline-none focus:border-primary py-1"
              />
            </div>
          </div>

          {txLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : txs.length === 0 ? (
            <p className="text-on-surface-variant text-sm py-8">No transactions match the filter.</p>
          ) : (
            <>
              {/* Mobile */}
              <div className="flex flex-col md:hidden">
                {txs.map((tx) => {
                  const subtotal = tx.unit_price
                    ? Number(tx.unit_price) * Math.abs(tx.adjustment)
                    : null
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3 gap-3">
                      {/* Left: name + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">
                          {tx.product_name ?? `#${tx.product_id}`}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          <span className={tx.transaction_type === 'sale' ? 'text-primary' : ''}>
                            {tx.transaction_type}
                          </span>
                          {' · '}
                          {new Date(tx.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          {' · '}
                          <span className="tabular-nums">→ {tx.new_total}</span>
                        </p>
                      </div>
                      {/* Right: primary value */}
                      <div className="text-right shrink-0">
                        {subtotal != null ? (
                          <p className="text-sm font-semibold text-on-surface tabular-nums">
                            Rp {subtotal.toLocaleString('id-ID')}
                          </p>
                        ) : null}
                        <p className={`text-xs font-semibold tabular-nums ${tx.adjustment < 0 ? 'text-error' : 'text-success'}`}>
                          {tx.adjustment > 0 ? '+' : ''}{tx.adjustment} units
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop: flex list */}
              <div className="hidden md:block text-sm">
                <div className="flex items-center px-0 py-2 text-[10px] text-on-surface-variant font-semibold">
                  <span className="flex-[2]">Time</span>
                  <span className="flex-[3]">Product</span>
                  <span className="flex-1 text-center">Type</span>
                  <span className="flex-1 text-right">Qty</span>
                  <span className="flex-[2] text-right">Unit Price</span>
                  <span className="flex-[2] text-right">Subtotal</span>
                  <span className="flex-1 text-right">After</span>
                </div>
                {txs.map((tx) => (
                  <div key={tx.id} className="flex items-center px-0 py-2.5 hover:bg-surface-variant/20 transition-colors">
                    <span className="flex-[2] text-on-surface-variant text-xs tabular-nums">
                      {new Date(tx.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <span className="flex-[3] font-medium text-on-surface truncate pr-3">
                      {tx.product_name ?? `#${tx.product_id}`}
                    </span>
                    <span className={`flex-1 text-center text-xs font-semibold ${tx.transaction_type === 'sale' ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {tx.transaction_type}
                    </span>
                    <span className={`flex-1 text-right font-semibold tabular-nums ${tx.adjustment < 0 ? 'text-error' : 'text-success'}`}>
                      {tx.adjustment > 0 ? '+' : ''}{tx.adjustment}
                    </span>
                    <span className="flex-[2] text-right text-on-surface-variant tabular-nums">
                      {tx.unit_price ? `Rp ${Number(tx.unit_price).toLocaleString('id-ID')}` : '—'}
                    </span>
                    <span className="flex-[2] text-right font-medium text-on-surface tabular-nums">
                      {tx.unit_price
                        ? `Rp ${(Number(tx.unit_price) * Math.abs(tx.adjustment)).toLocaleString('id-ID')}`
                        : '—'}
                    </span>
                    <span className="flex-1 text-right text-on-surface-variant tabular-nums">{tx.new_total}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

function StatBlock({ label, value }) {
  return (
    <div className="flex flex-col">
      <p className="text-[10px] text-on-surface-variant mb-1">{label}</p>
      <p className="text-2xl font-semibold text-on-surface tabular-nums leading-tight">{value}</p>
    </div>
  )
}
