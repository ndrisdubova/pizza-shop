import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowRight, Coins, Database, Receipt, TrendingUp, Utensils } from 'lucide-react'
import { seedDemoOrders, selectAllOrders } from '../../store/orderSlice'
import { selectMenu } from '../../store/menuSlice'
import ClearOrdersButton from '../../components/admin/ClearOrdersButton'
import LiveTicket from '../../components/admin/LiveTicket'

const money = (n) => '€' + n.toFixed(2)
const DAY = 86_400_000
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Dashboard() {
  const dispatch = useDispatch()
  const orders = useSelector(selectAllOrders)
  const menu = useSelector(selectMenu)

  const stats = useMemo(() => {
    const startOfToday = new Date().setHours(0, 0, 0, 0)
    // Declined orders were never cooked or paid for — they are not takings and
    // they are not sales, so they are excluded from every figure here.
    const taken = orders.filter((o) => !o.rejected)
    const declined = orders.length - taken.length

    const today = taken.filter((o) => o.placedAt >= startOfToday)
    const revenue = taken.reduce((sum, o) => sum + o.total, 0)
    const todayRevenue = today.reduce((sum, o) => sum + o.total, 0)

    // The trading week runs Monday to Sunday and starts again each Monday,
    // rather than rolling backwards from today. getDay() puts Sunday at 0, so
    // shift it to make Monday the first column.
    const weekday = new Date(startOfToday).getDay()
    const monday = startOfToday - ((weekday + 6) % 7) * DAY

    const week = Array.from({ length: 7 }, (_, i) => {
      const from = monday + i * DAY
      const dayOrders = taken.filter((o) => o.placedAt >= from && o.placedAt < from + DAY)
      return {
        label: DAY_LABELS[i],
        count: dayOrders.length,
        isToday: from === startOfToday,
        isFuture: from > startOfToday,
      }
    })

    const dishCount = new Map()
    taken.forEach((o) =>
      o.items.forEach((item) => dishCount.set(item.name, (dishCount.get(item.name) ?? 0) + item.qty)),
    )
    const top = [...dishCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

    return {
      declined,
      takenCount: taken.length,
      todayCount: today.length,
      todayRevenue,
      revenue,
      average: taken.length ? revenue / taken.length : 0,
      week,
      weekTotal: week.reduce((sum, day) => sum + day.count, 0),
      peak: Math.max(1, ...week.map((d) => d.count)),
      top,
    }
  }, [orders])

  const soldOut = menu.filter((dish) => dish.soldOut)

  return (
    <>
      <div className="work-head">
        <div>
          <h1>Dashboard</h1>
          <p>
            {new Date().toLocaleDateString([], {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="work-actions">
          <ClearOrdersButton disabled={!orders.length} />
          <button className="btn btn-outline btn-sm" onClick={() => dispatch(seedDemoOrders())}>
            <Database aria-hidden="true" />
            Load sample orders
          </button>
          <Link to="/admin/orders" className="btn btn-dark btn-sm">
            All orders
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Orders today</span>
            <Receipt aria-hidden="true" />
          </div>
          <div className="kpi-value">{stats.todayCount}</div>
          <div className="kpi-note">
            {stats.takenCount} all time
            {stats.declined > 0 && ` · ${stats.declined} declined`}
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Takings today</span>
            <Coins aria-hidden="true" />
          </div>
          <div className="kpi-value">{money(stats.todayRevenue)}</div>
          <div className="kpi-note">{money(stats.revenue)} all time</div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Average order</span>
            <TrendingUp aria-hidden="true" />
          </div>
          <div className="kpi-value">{money(stats.average)}</div>
          <div className="kpi-note up">Across {stats.takenCount} tickets</div>
        </div>

        <div className="kpi">
          <div className="kpi-top">
            <span className="kpi-label">Off the menu</span>
            <Utensils aria-hidden="true" />
          </div>
          <div className="kpi-value">{soldOut.length}</div>
          <div className="kpi-note">
            {soldOut.length ? soldOut.map((d) => d.name).join(', ') : 'Everything available'}
          </div>
        </div>
      </div>

      <div className="cols">
        <LiveTicket />

        <div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>This week</h2>
                <p>Monday to Sunday · starts again each Monday</p>
              </div>
              <span className="chip chip-neutral">{stats.weekTotal} orders</span>
            </div>
            <div className="panel-body">
              <div className="bars">
                {stats.week.map((day, i) => (
                  <div className={`bar-col ${day.isFuture ? 'future' : ''}`} key={day.label}>
                    <span className="bar-value">{day.isFuture ? '' : day.count}</span>
                    <motion.span
                      className={`bar ${day.isToday ? 'today' : ''}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.count / stats.peak) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 0.61, 0.36, 1] }}
                    />
                    <span className="bar-label">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Best sellers</h2>
                <p>By quantity sold</p>
              </div>
            </div>
            {stats.top.length ? (
              <div className="table-scroll">
                {/* two columns already fit a phone — keep it a real table */}
                <table className="data data-plain">
                  <tbody>
                    {stats.top.map(([name, qty]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td className="num" style={{ color: 'var(--ink-60)' }}>
                          {qty} sold
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty" style={{ padding: '40px 24px' }}>
                <p style={{ marginBottom: 0 }}>Nothing sold yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
