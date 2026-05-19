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
        <h1 className="text-2xl font-bold text-on-surface mb-6">Analytics</h1>

        {/* Summary cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : summary && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <SummaryCard
                label="Income This Month"
                value={`Rp ${Number(summary.income_this_month).toLocaleString('id-ID')}`}
                sub="sales revenue"
                color="bg-primary-container text-on-primary-container"
              />
              <SummaryCard
                label="Items Sold This Month"
                value={summary.items_sold_this_month.toLocaleString()}
                sub="units sold"
                color="bg-success-container text-success"
              />
              <SummaryCard
                label="All-Time Income"
                value={`Rp ${Number(summary.income_all_time).toLocaleString('id-ID')}`}
                sub="total revenue"
                color="bg-surface-variant text-on-surface"
              />
              <SummaryCard
                label="All-Time Items Sold"
                value={summary.items_sold_all_time.toLocaleString()}
                sub="total units"
                color="bg-surface-variant text-on-surface"
              />
            </div>

            {/* Desktop: two-column — chart + top products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Daily income chart */}
              <div className="bg-surface border border-surface-variant rounded-2xl p-4">
                <h2 className="font-semibold text-on-surface text-sm mb-4">Daily Income — Last 30 Days</h2>
                {summary.daily_breakdown.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-8">No sales data yet.</p>
                ) : (
                  <div className="flex items-end gap-1 h-32">
                    {summary.daily_breakdown.map((d) => {
                      const height = Math.max((Number(d.income) / maxIncome) * 100, 2)
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div
                            className="w-full bg-primary rounded-t-sm opacity-80 hover:opacity-100 transition-opacity cursor-default"
                            style={{ height: `${height}%` }}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex
                            flex-col items-center bg-on-surface text-surface text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
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
              <div className="bg-surface border border-surface-variant rounded-2xl p-4">
                <h2 className="font-semibold text-on-surface text-sm mb-4">Top Products</h2>
                {summary.top_products.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-8">No sales data yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {summary.top_products.map((p, i) => (
                      <div key={p.product_id} className="flex items-center gap-3">
                        <span className="w-5 text-xs font-bold text-on-surface-variant text-center shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">{p.name}</p>
                          <p className="text-xs text-on-surface-variant">{p.qty_sold} sold</p>
                        </div>
                        <span className="text-sm font-bold text-on-surface shrink-0">
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
        <div className="bg-surface border border-surface-variant rounded-2xl overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-surface-variant flex flex-col md:flex-row md:items-center gap-3">
            <h2 className="font-semibold text-on-surface text-sm">Transaction Log</h2>
            <div className="flex flex-wrap gap-2 md:ml-auto">
              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm border border-outline rounded-xl px-3 py-1.5 bg-surface text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">All types</option>
                <option value="sale">Sales only</option>
                <option value="adjustment">Adjustments only</option>
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm border border-outline rounded-xl px-3 py-1.5 bg-surface text-on-surface focus:outline-none focus:border-primary"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm border border-outline rounded-xl px-3 py-1.5 bg-surface text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {txLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : txs.length === 0 ? (
            <p className="text-center text-on-surface-variant text-sm py-10">No transactions match the filter.</p>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="flex flex-col divide-y divide-surface-variant md:hidden">
                {txs.map((tx) => (
                  <div key={tx.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-on-surface">{tx.product_name ?? `#${tx.product_id}`}</span>
                      <TypeBadge type={tx.transaction_type} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span>{new Date(tx.timestamp).toLocaleString('id-ID')}</span>
                      <span className={`font-bold ${tx.adjustment < 0 ? 'text-error' : 'text-success'}`}>
                        {tx.adjustment > 0 ? '+' : ''}{tx.adjustment}
                      </span>
                    </div>
                    {tx.unit_price && (
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Rp {Number(tx.unit_price).toLocaleString('id-ID')} × {Math.abs(tx.adjustment)} = Rp {(Number(tx.unit_price) * Math.abs(tx.adjustment)).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <table className="hidden md:table w-full text-sm">
                <thead>
                  <tr className="bg-surface-variant/50 text-on-surface-variant">
                    <th className="text-left px-4 py-2 font-semibold">Time</th>
                    <th className="text-left px-4 py-2 font-semibold">Product</th>
                    <th className="text-center px-4 py-2 font-semibold">Type</th>
                    <th className="text-right px-4 py-2 font-semibold">Qty</th>
                    <th className="text-right px-4 py-2 font-semibold">Unit Price</th>
                    <th className="text-right px-4 py-2 font-semibold">Subtotal</th>
                    <th className="text-right px-4 py-2 font-semibold">Stock After</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx, i) => (
                    <tr key={tx.id} className={`${i !== txs.length - 1 ? 'border-b border-surface-variant' : ''} hover:bg-surface-variant/30`}>
                      <td className="px-4 py-2 text-on-surface-variant text-xs whitespace-nowrap">
                        {new Date(tx.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-2 font-medium text-on-surface">{tx.product_name ?? `#${tx.product_id}`}</td>
                      <td className="px-4 py-2 text-center"><TypeBadge type={tx.transaction_type} /></td>
                      <td className={`px-4 py-2 text-right font-bold ${tx.adjustment < 0 ? 'text-error' : 'text-success'}`}>
                        {tx.adjustment > 0 ? '+' : ''}{tx.adjustment}
                      </td>
                      <td className="px-4 py-2 text-right text-on-surface-variant">
                        {tx.unit_price ? `Rp ${Number(tx.unit_price).toLocaleString('id-ID')}` : '—'}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-on-surface">
                        {tx.unit_price
                          ? `Rp ${(Number(tx.unit_price) * Math.abs(tx.adjustment)).toLocaleString('id-ID')}`
                          : '—'}
                      </td>
                      <td className="px-4 py-2 text-right text-on-surface-variant">{tx.new_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold leading-tight">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  )
}

function TypeBadge({ type }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
      ${type === 'sale' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
      {type}
    </span>
  )
}
