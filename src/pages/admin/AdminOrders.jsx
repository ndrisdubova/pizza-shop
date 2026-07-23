import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Database, Inbox, Search, Store, Truck, X } from 'lucide-react'
import { seedDemoOrders, selectAllOrders, statusOf } from '../../store/orderSlice'
import ClearOrdersButton from '../../components/admin/ClearOrdersButton'
import StatusSelect from '../../components/admin/StatusSelect'

const money = (n) => '€' + n.toFixed(2)

const stamp = (ts) =>
  new Date(ts).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'awaiting', label: 'Awaiting' },
  { id: 'progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'declined', label: 'Declined' },
]

const DAY = 86_400_000

// Returns the earliest timestamp a given period includes.
function periodStart(period) {
  const startOfToday = new Date().setHours(0, 0, 0, 0)
  if (period === 'today') return startOfToday
  if (period === 'week') {
    const weekday = new Date(startOfToday).getDay()
    return startOfToday - ((weekday + 6) % 7) * DAY
  }
  return 0
}

export default function AdminOrders() {
  const dispatch = useDispatch()
  const orders = useSelector(selectAllOrders)

  const [status, setStatus] = useState('all')
  const [method, setMethod] = useState('all')
  const [period, setPeriod] = useState('all')
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const from = periodStart(period)

    return orders.filter((order) => {
      if (status !== 'all' && statusOf(order) !== status) return false
      if (method !== 'all' && order.customer.method !== method) return false
      if (order.placedAt < from) return false
      if (!q) return true
      return (
        order.id.toLowerCase().includes(q) ||
        order.customer.name.toLowerCase().includes(q) ||
        order.customer.phone.includes(q) ||
        order.items.some((item) => item.name.toLowerCase().includes(q))
      )
    })
  }, [orders, status, method, period, query])

  // Declined orders were never paid for, so they must not inflate the takings.
  const revenue = rows
    .filter((order) => !order.rejected)
    .reduce((sum, order) => sum + order.total, 0)

  const countFor = (id) =>
    id === 'all' ? orders.length : orders.filter((o) => statusOf(o) === id).length

  const filtered = status !== 'all' || method !== 'all' || period !== 'all' || query.trim()

  const reset = () => {
    setStatus('all')
    setMethod('all')
    setPeriod('all')
    setQuery('')
  }

  return (
    <>
      <div className="work-head">
        <div>
          <h1>Orders</h1>
          <p>
            {rows.length} order{rows.length === 1 ? '' : 's'} · {money(revenue)} taken
            {filtered && ' · filtered'}
          </p>
        </div>
        <div className="work-actions">
          <ClearOrdersButton disabled={!orders.length} />
          <button className="btn btn-outline btn-sm" onClick={() => dispatch(seedDemoOrders())}>
            <Database aria-hidden="true" />
            Load sample orders
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head filter-bar">
          <div className="filters">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                className={`filter ${status === f.id ? 'active' : ''}`}
                onClick={() => setStatus(f.id)}
              >
                {f.label}
                <span className="count">{countFor(f.id)}</span>
              </button>
            ))}
          </div>

          <div className="filter-controls">
            <label className="select">
              <span>Method</span>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="all">Any</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Collection</option>
              </select>
            </label>

            <label className="select">
              <span>Period</span>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
              </select>
            </label>

            <div className="search">
              <Search aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Reference, name or dish"
                aria-label="Search orders"
              />
            </div>

            {filtered && (
              <button className="text-btn" onClick={reset}>
                <X aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
        </div>

        {rows.length ? (
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Placed</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order, i) => {
                  const key = statusOf(order)
                  return (
                    <motion.tr
                      key={order.id}
                      className={key === 'declined' ? 'is-declined' : ''}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                    >
                      <td className="ref" data-label="Reference">{order.id}</td>
                      <td data-label="Placed" style={{ color: 'var(--ink-60)', whiteSpace: 'nowrap' }}>
                        {stamp(order.placedAt)}
                      </td>
                      <td className="who" data-label="Customer">
                        <b>{order.customer.name}</b>
                        <span>{order.customer.phone}</span>
                      </td>
                      <td data-label="Items" style={{ color: 'var(--ink-60)', minWidth: 200 }}>
                        {order.items.map((item) => `${item.qty}× ${item.name}`).join(', ')}
                      </td>
                      <td data-label="Method">
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 7,
                            color: 'var(--ink-60)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {order.customer.method === 'pickup' ? (
                            <Store aria-hidden="true" style={{ width: 14, height: 14 }} />
                          ) : (
                            <Truck aria-hidden="true" style={{ width: 14, height: 14 }} />
                          )}
                          {order.customer.method === 'pickup' ? 'Collection' : 'Delivery'}
                        </span>
                      </td>
                      <td data-label="Status">
                        <StatusSelect order={order} />
                      </td>
                      <td className="num" data-label="Total" style={{ fontWeight: 600 }}>
                        {money(order.total)}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <Inbox aria-hidden="true" />
            <h3>{filtered ? 'Nothing matches these filters' : 'No orders yet'}</h3>
            <p>
              {filtered
                ? 'Try a wider period, a different status, or clear the filters.'
                : 'Orders placed on the site land here. Load a week of sample orders to see how it looks in service.'}
            </p>
            {filtered ? (
              <button className="btn btn-outline btn-sm" onClick={reset}>
                Clear filters
              </button>
            ) : (
              <button className="btn btn-dark btn-sm" onClick={() => dispatch(seedDemoOrders())}>
                <Database aria-hidden="true" />
                Load sample orders
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
