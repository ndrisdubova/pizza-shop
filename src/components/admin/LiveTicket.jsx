import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bike,
  Check,
  ChefHat,
  ChevronRight,
  Flame,
  Inbox,
  MapPin,
  PackageCheck,
  Phone,
  Play,
  ReceiptText,
  StickyNote,
  Store,
  Truck,
  Undo2,
  X,
  XCircle,
} from 'lucide-react'
import {
  ORDER_STAGES,
  REJECTION_REASONS,
  archiveOrder,
  rejectOrder,
  resumeAutoStages,
  selectCurrentOrder,
  setOrderStage,
} from '../../store/orderSlice'

const STAGE_ICONS = {
  placed: ReceiptText,
  accepted: ChefHat,
  preparing: Flame,
  on_the_way: Bike,
  delivered: PackageCheck,
}

const money = (n) => '€' + n.toFixed(2)
const clock = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function LiveTicket() {
  const dispatch = useDispatch()
  const order = useSelector(selectCurrentOrder)
  const [declining, setDeclining] = useState(false)

  const stageIndex = order?.stageIndex ?? 0
  const lastStage = ORDER_STAGES.length - 1
  const isFinal = stageIndex === lastStage
  const rejected = Boolean(order?.rejected)
  // An order still sitting on stage one has not been confirmed by anybody yet.
  const awaiting = !rejected && stageIndex === 0

  const decline = (reason) => {
    dispatch(rejectOrder({ id: order.id, reason }))
    setDeclining(false)
  }

  return (
    <div className={`panel ${order ? 'ticket-live' : ''}`}>
      <div className="panel-head">
        <div>
          <h2>Live ticket</h2>
          <p>{order ? 'Set the status as the kitchen works' : 'Nothing in the pass right now'}</p>
        </div>
        {order && (
          <span
            className={`chip ${
              rejected ? 'chip-declined' : awaiting ? 'chip-warn' : order.manual ? 'chip-neutral' : 'chip-live'
            }`}
          >
            {rejected ? (
              <>
                <XCircle aria-hidden="true" />
                Declined
              </>
            ) : awaiting ? (
              'Needs confirming'
            ) : order.manual ? (
              'Manual'
            ) : (
              <>
                <motion.span
                  aria-hidden="true"
                  style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                Auto
              </>
            )}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {order ? (
          <motion.div
            key={order.id}
            className="panel-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="ticket-stage">
              {rejected ? 'Order declined' : ORDER_STAGES[stageIndex].label}
            </p>
            <p className="ref" style={{ color: 'var(--ink-40)' }}>
              {order.id} · placed {clock(order.placedAt)} · {money(order.total)}
            </p>

            <div className="ticket-items">
              {order.items.map((item) => (
                <div className="ticket-item" key={item.id}>
                  <span className="q">{item.qty}×</span>
                  <span>{item.name}</span>
                  <span className="p">{money(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {order.customer.notes && (
              <div className="ticket-note">
                <StickyNote aria-hidden="true" />
                <span>{order.customer.notes}</span>
              </div>
            )}

            <div className="ticket-meta">
              <div>
                {order.customer.method === 'pickup' ? (
                  <Store aria-hidden="true" />
                ) : (
                  <Truck aria-hidden="true" />
                )}
                <span>
                  <b style={{ color: 'var(--ink)' }}>{order.customer.name}</b> ·{' '}
                  {order.customer.method === 'pickup' ? 'Collection' : 'Delivery'}
                </span>
              </div>
              <div>
                <Phone aria-hidden="true" />
                <span>{order.customer.phone}</span>
              </div>
              {order.customer.method !== 'pickup' && (
                <div>
                  <MapPin aria-hidden="true" />
                  <span>{order.customer.address}</span>
                </div>
              )}
            </div>

            {/* ---- accept or turn it away ---- */}
            <AnimatePresence initial={false}>
              {awaiting && !declining && (
                <motion.div
                  className="decide"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p>
                    <b>This order is waiting on you.</b> Accept it to start cooking, or turn it away
                    if you cannot take it.
                  </p>
                  <div className="decide-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => dispatch(setOrderStage({ id: order.id, stage: 1 }))}>
                      <Check aria-hidden="true" />
                      Accept order
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setDeclining(true)}>
                      <XCircle aria-hidden="true" />
                      Decline
                    </button>
                  </div>
                </motion.div>
              )}

              {declining && (
                <motion.div
                  className="decide declining"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="decide-head">
                    <b>Why are you turning it away?</b>
                    <button className="remove" onClick={() => setDeclining(false)} aria-label="Cancel">
                      <X aria-hidden="true" />
                    </button>
                  </div>
                  <p>The customer sees this on their tracker straight away.</p>
                  <div className="reasons">
                    {REJECTION_REASONS.map((reason) => (
                      <button key={reason} className="reason" onClick={() => decline(reason)}>
                        {reason}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ---- the stage manager ---- */}
            {!rejected && (
              <>
            <p className="rail-label" style={{ color: 'var(--ink-40)', padding: 0, marginBottom: 10 }}>
              Set status
            </p>

            <ol className="stage-control">
              {ORDER_STAGES.map((stage, i) => {
                const state = i < stageIndex ? 'done' : i === stageIndex ? 'current' : 'ahead'
                const Icon = STAGE_ICONS[stage.key]
                return (
                  <li key={stage.key}>
                    <button
                      type="button"
                      className={`stage-btn ${state}`}
                      aria-current={state === 'current' ? 'step' : undefined}
                      onClick={() => dispatch(setOrderStage({ id: order.id, stage: i }))}
                    >
                      <span className="stage-btn-mark">
                        {state === 'done' ? <Check aria-hidden="true" /> : <Icon aria-hidden="true" />}
                      </span>
                      <span className="stage-btn-label">{stage.label}</span>
                      <span className="stage-btn-time">
                        {order.timestamps[i] ? clock(order.timestamps[i]) : '—'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>

            <div className="ticket-actions">
              {isFinal ? (
                <button className="btn btn-dark btn-block" onClick={() => dispatch(archiveOrder())}>
                  <Check aria-hidden="true" />
                  Complete &amp; clear the pass
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => dispatch(setOrderStage({ id: order.id, stage: stageIndex + 1 }))}
                >
                  Mark as {ORDER_STAGES[stageIndex + 1].short.toLowerCase()}
                  <ChevronRight aria-hidden="true" />
                </button>
              )}

              <div className="ticket-actions-row">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={stageIndex === 0}
                  onClick={() => dispatch(setOrderStage({ id: order.id, stage: stageIndex - 1 }))}
                >
                  <Undo2 aria-hidden="true" />
                  Step back
                </button>

                {order.manual && !isFinal && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => dispatch(resumeAutoStages())}
                    title="Let the demo advance this order on a timer"
                  >
                    <Play aria-hidden="true" />
                    Run automatically
                  </button>
                )}
              </div>
            </div>

            <p className="ticket-hint">
              {order.manual
                ? 'Nothing moves until you move it — the customer’s tracker follows your clicks.'
                : 'Running on a timer. Set a status by hand to take back control.'}
            </p>
              </>
            )}

            {rejected && (
              <div className="ticket-actions">
                <p className="ticket-hint" style={{ textAlign: 'left', marginTop: 0 }}>
                  Declined at {clock(order.rejected.at)} — “{order.rejected.reason}”. The customer
                  has been told.
                </p>
                <button className="btn btn-dark btn-block" onClick={() => dispatch(archiveOrder())}>
                  Clear the pass
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="empty" className="admin-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Inbox aria-hidden="true" />
            <h3>No live order</h3>
            <p>
              When a customer places an order it lands here, and you can walk it through the kitchen
              stage by stage.
            </p>
            <Link to="/order" className="btn btn-outline btn-sm">
              Place a test order
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
