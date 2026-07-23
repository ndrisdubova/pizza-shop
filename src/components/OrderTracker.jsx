import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Bike,
  Check,
  ChefHat,
  Flame,
  MapPin,
  PackageCheck,
  Phone,
  ReceiptText,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import {
  ORDER_STAGES,
  advanceStage,
  archiveOrder,
  selectCurrentOrder,
} from '../store/orderSlice'

const STAGE_ICONS = {
  placed: ReceiptText,
  accepted: ChefHat,
  preparing: Flame,
  on_the_way: Bike,
  delivered: PackageCheck,
}

const clock = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function OrderTracker() {
  const dispatch = useDispatch()
  const order = useSelector(selectCurrentOrder)
  const stageIndex = order?.stageIndex ?? 0
  const isDone = stageIndex === ORDER_STAGES.length - 1

  // Walk the order through the pipeline, one stage at a time — unless the
  // kitchen has taken it over from the back office, in which case the status
  // only moves when they move it.
  useEffect(() => {
    if (!order || isDone || order.manual || order.rejected) return
    const timer = setTimeout(
      () => dispatch(advanceStage()),
      ORDER_STAGES[stageIndex + 1].after,
    )
    return () => clearTimeout(timer)
  }, [dispatch, order, stageIndex, isDone])

  if (!order) return null

  // A declined order gets its own panel — a stalled timeline would leave the
  // customer waiting for food that is never coming.
  if (order.rejected) {
    return (
      <div className="order-grid">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="card-body" style={{ padding: '38px 32px 34px' }}>
            <span className="chip chip-declined" style={{ marginBottom: 18 }}>
              <XCircle aria-hidden="true" />
              Declined
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: 10 }}>
              We could not take this order.
            </h2>
            <p className="track-sub" style={{ maxWidth: '52ch' }}>
              {order.rejected.reason}. Nothing has been charged — you were only ever going to pay
              on delivery.
            </p>
            <p className="order-ref" style={{ marginTop: 16 }}>
              REF {order.id} · declined at {clock(order.rejected.at)}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 30 }}>
              <button className="btn btn-primary" onClick={() => dispatch(archiveOrder())}>
                <RotateCcw aria-hidden="true" />
                Start another order
              </button>
              <a className="btn btn-outline" href="tel:+38348303222">
                <Phone aria-hidden="true" />
                Call the restaurant
              </a>
            </div>
          </div>
        </motion.div>

        <aside>
          <div className="card">
            <div className="card-head">
              <div>
                <h2>What you had chosen</h2>
                <p>Placed at {clock(order.placedAt)}</p>
              </div>
            </div>
            <div className="card-body">
              <div className="lines">
                {order.items.map((item) => (
                  <div className="line" key={item.id}>
                    <img className="line-thumb" src={item.image} alt="" loading="lazy" />
                    <div>
                      <div className="line-name">{item.name}</div>
                      <div className="line-meta">
                        {item.qty} × €{item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="line-total">€{(item.price * item.qty).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    )
  }

  const isPickup = order.customer.method === 'pickup'
  const eta = order.placedAt + (isPickup ? 20 : 32) * 60_000
  const progress = (stageIndex / (ORDER_STAGES.length - 1)) * 100
  const stage = ORDER_STAGES[stageIndex]

  return (
    <div className="order-grid">
      <div>
        <div className="card">
          <div className="track-hero">
            <div>
              {isDone ? (
                <span className="live" style={{ color: 'var(--olive)', borderColor: 'rgba(92,107,74,.3)', background: 'rgba(92,107,74,.08)' }}>
                  <Check aria-hidden="true" style={{ width: 12, height: 12 }} />
                  Completed
                </span>
              ) : (
                <span className="live">
                  <motion.i
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  Live
                </span>
              )}

              <h2 className="track-status">
                {isDone ? 'Your order has been delivered' : stage.label}
              </h2>
              <p className="track-sub">{stage.blurb}</p>
              <p className="order-ref" style={{ marginTop: 14 }}>
                REF {order.id} · {order.items.reduce((n, i) => n + i.qty, 0)} items · €
                {order.total.toFixed(2)}
              </p>
            </div>

            <div className="eta-box">
              <span className="eta-label">
                {isDone ? 'Delivered at' : isPickup ? 'Ready at' : 'Estimated arrival'}
              </span>
              <div className="eta-time">
                {clock(isDone ? order.timestamps[stageIndex] : eta)}
              </div>
              <div className="eta-note">
                {isPickup ? 'Collection at Gavran 1, Gjilan' : order.customer.address}
              </div>
            </div>
          </div>

          <div className="track-progress">
            <motion.i
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
            />
          </div>

          <AnimatePresence>
            {stageIndex === 3 && (
              <motion.div
                className="courier"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0, marginTop: 28 }}
                exit={{ opacity: 0 }}
              >
                <span className="courier-avatar" aria-hidden="true">
                  <Bike />
                </span>
                <div>
                  <b>Rina is bringing your order</b>
                  <span>Courier · usually 8–12 minutes across town</span>
                </div>
                <a className="btn btn-outline btn-sm" href="tel:+38348303222">
                  <Phone aria-hidden="true" />
                  Call
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          <ol className="stages" style={{ marginTop: stageIndex === 3 ? 0 : 20 }}>
            {ORDER_STAGES.map((item, i) => {
              // Once delivered, the final stage is complete rather than in
              // progress — it should read green, not accent red.
              const state =
                i < stageIndex || (i === stageIndex && isDone)
                  ? 'done'
                  : i === stageIndex
                    ? 'active'
                    : 'pending'
              const Icon = STAGE_ICONS[item.key]
              return (
                <li className={`stage ${state}`} key={item.key}>
                  <motion.span
                    className="stage-mark"
                    animate={
                      state === 'active' && !isDone
                        ? { boxShadow: ['0 0 0 0 rgba(178,58,40,0.28)', '0 0 0 9px rgba(178,58,40,0)'] }
                        : {}
                    }
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    {state === 'done' ? <Check aria-hidden="true" /> : <Icon aria-hidden="true" />}
                  </motion.span>

                  <div>
                    <p className="stage-title">{item.label}</p>
                    {state !== 'pending' && (
                      <motion.p
                        className="stage-blurb"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        {item.blurb}
                      </motion.p>
                    )}
                  </div>

                  <span className="stage-time">
                    {order.timestamps[i] ? clock(order.timestamps[i]) : '—'}
                  </span>
                </li>
              )
            })}
          </ol>

          {isDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-body"
              style={{ borderTop: '1px solid var(--line)', display: 'flex', gap: 12, flexWrap: 'wrap' }}
            >
              <button className="btn btn-dark" onClick={() => dispatch(archiveOrder())}>
                <RotateCcw aria-hidden="true" />
                Start a new order
              </button>
              <Link to="/menu" className="btn btn-outline">
                Back to the menu
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      <aside>
        <div className="card sticky">
          <div className="card-head">
            <div>
              <h2>Order summary</h2>
              <p>Placed at {clock(order.placedAt)}</p>
            </div>
            <ReceiptText aria-hidden="true" style={{ width: 18, height: 18, color: 'var(--ink-40)' }} />
          </div>

          <div className="card-body">
            <div className="lines">
              {order.items.map((item) => (
                <div className="line" key={item.id}>
                  <img className="line-thumb" src={item.image} alt="" loading="lazy" />
                  <div>
                    <div className="line-name">{item.name}</div>
                    <div className="line-meta">
                      {item.qty} × €{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="line-total">€{(item.price * item.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-body tight" style={{ borderTop: '1px solid var(--line)' }}>
            <div className="totals">
              <div className="row">
                <span>Subtotal</span>
                <b>€{order.subtotal.toFixed(2)}</b>
              </div>
              <div className="row">
                <span>{isPickup ? 'Collection' : 'Delivery'}</span>
                {order.deliveryFee ? (
                  <b>€{order.deliveryFee.toFixed(2)}</b>
                ) : (
                  <b className="free">Free</b>
                )}
              </div>
              <div className="row total">
                <span>Total paid</span>
                <b>€{order.total.toFixed(2)}</b>
              </div>
            </div>
          </div>

          <div className="card-body" style={{ borderTop: '1px solid var(--line)' }}>
            <div className="receipt-row">
              <span>Name</span>
              <span>{order.customer.name}</span>
            </div>
            <div className="receipt-row">
              <span>Phone</span>
              <span>{order.customer.phone}</span>
            </div>
            {!isPickup && (
              <div className="receipt-row">
                <span>Address</span>
                <span>{order.customer.address}</span>
              </div>
            )}
            {order.customer.notes && (
              <div className="receipt-row">
                <span>Notes</span>
                <span>{order.customer.notes}</span>
              </div>
            )}
          </div>

          {isPickup && (
            <div className="card-body" style={{ borderTop: '1px solid var(--line)' }}>
              <div className="reassure" style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
                <div>
                  <MapPin aria-hidden="true" />
                  Gavran 1, Gjilan, Kosovo
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
