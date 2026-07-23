import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  CreditCard,
  Lock,
  Minus,
  Plus,
  Radar,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  UtensilsCrossed,
} from 'lucide-react'
import {
  addItem,
  clearCart,
  decrementItem,
  removeItem,
  selectCartItems,
  selectCartSubtotal,
} from '../store/cartSlice'
import {
  DELIVERY_FEE,
  ORDER_STAGES,
  deliveryFeeFor,
  placeOrder,
  selectCurrentOrder,
  selectOrderHistory,
} from '../store/orderSlice'
import PlacingOverlay from '../components/PlacingOverlay'
import OrderTracker from '../components/OrderTracker'
import { IMAGES } from '../data/menu'

const EMPTY_FORM = { name: '', phone: '', address: '', notes: '', method: 'delivery' }

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'We need a name for the kitchen ticket.'
  if (!/^[+\d][\d\s-]{5,}$/.test(form.phone.trim()))
    errors.phone = 'Enter a number the courier can reach you on.'
  if (form.method === 'delivery' && form.address.trim().length < 6)
    errors.address = 'Street and house number, so the courier can find you.'
  return errors
}

export default function Order() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartSubtotal)
  const currentOrder = useSelector(selectCurrentOrder)
  const history = useSelector(selectOrderHistory)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)

  const isPickup = form.method === 'pickup'
  const fee = deliveryFeeFor(form.method)
  const total = items.length ? subtotal + fee : 0

  const update = (key) => (e) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validate(form)
    if (Object.keys(found).length || !items.length) {
      setErrors(found)
      return
    }
    setPlacing(true)
  }

  // Runs when the confirmation animation has finished playing. The page swaps
  // from a long checkout to the tracker, so send the viewport back to the top —
  // otherwise you land halfway down the timeline.
  const commitOrder = useCallback(() => {
    dispatch(placeOrder({ items, customer: form, subtotal }))
    dispatch(clearCart())
    setPlacing(false)
    setForm(EMPTY_FORM)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [dispatch, items, form, subtotal])

  return (
    <>
      <AnimatePresence>{placing && <PlacingOverlay onDone={commitOrder} />}</AnimatePresence>

      <section className="page-header">
        <div className="page-header-media">
          <img src={IMAGES.diningRoomDark} alt="" />
        </div>
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight aria-hidden="true" />
            <span>{currentOrder ? 'Order tracking' : 'Checkout'}</span>
          </nav>
          <span className="label">{currentOrder ? 'Live tracking' : 'Checkout'}</span>
          <h1>{currentOrder ? 'Follow your order in real time.' : 'Almost there.'}</h1>
          <p className="lede">
            {currentOrder
              ? 'This page updates on its own as the kitchen works through your ticket. You can leave it open.'
              : 'Check your basket, tell us where it is going, and we will start cooking straight away.'}
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'clamp(40px, 5vw, 64px)' }}>
        <div className="wrap">
          {currentOrder ? (
            <OrderTracker />
          ) : (
            <div className="order-grid">
              {/* ------------- basket + details ------------- */}
              <div>
                <div className="card">
                  <div className="card-head">
                    <div>
                      <h2>Your basket</h2>
                      <p>
                        {items.length
                          ? `${items.length} dish${items.length === 1 ? '' : 'es'} selected`
                          : 'Nothing selected yet'}
                      </p>
                    </div>
                    {items.length > 0 && (
                      <button className="text-btn" onClick={() => dispatch(clearCart())}>
                        <Trash2 aria-hidden="true" />
                        Empty basket
                      </button>
                    )}
                  </div>

                  <div className="card-body">
                    {items.length === 0 ? (
                      <div className="empty-state" style={{ padding: '52px 20px' }}>
                        <UtensilsCrossed aria-hidden="true" />
                        <h3>Your basket is empty</h3>
                        <p>Pick a few things from the menu and they will show up here.</p>
                        <Link to="/menu" className="btn btn-dark btn-sm">
                          Browse the menu
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </div>
                    ) : (
                      <div className="lines">
                        <AnimatePresence initial={false}>
                          {items.map((item) => (
                            <motion.div
                              className="line"
                              key={item.id}
                              layout
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                              transition={{ duration: 0.25 }}
                            >
                              <img className="line-thumb" src={item.image} alt="" loading="lazy" />
                              <div>
                                <div className="line-name">{item.name}</div>
                                <div className="line-meta">€{item.price.toFixed(2)} each</div>
                              </div>
                              <div className="line-end">
                                <div className="stepper">
                                  <button
                                    onClick={() => dispatch(decrementItem(item.id))}
                                    aria-label={`One less ${item.name}`}
                                  >
                                    <Minus aria-hidden="true" />
                                  </button>
                                  <span>{item.qty}</span>
                                  <button
                                    onClick={() => dispatch(addItem(item))}
                                    aria-label={`One more ${item.name}`}
                                  >
                                    <Plus aria-hidden="true" />
                                  </button>
                                </div>
                                <div className="line-total">
                                  €{(item.price * item.qty).toFixed(2)}
                                </div>
                                <button
                                  className="remove"
                                  onClick={() => dispatch(removeItem(item.id))}
                                  aria-label={`Remove ${item.name}`}
                                >
                                  <Trash2 aria-hidden="true" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>

                <form className="card" onSubmit={handleSubmit} noValidate>
                  <div className="card-head">
                    <div>
                      <h2>Delivery details</h2>
                      <p>Used only to get this order to you.</p>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="choices">
                      <button
                        type="button"
                        className={`choice ${!isPickup ? 'active' : ''}`}
                        onClick={() => setForm((prev) => ({ ...prev, method: 'delivery' }))}
                        aria-pressed={!isPickup}
                      >
                        <Truck aria-hidden="true" />
                        <span>
                          <b>Delivery</b>
                          <span>
                            ~30 min · €{DELIVERY_FEE.toFixed(2)}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`choice ${isPickup ? 'active' : ''}`}
                        onClick={() => setForm((prev) => ({ ...prev, method: 'pickup' }))}
                        aria-pressed={isPickup}
                      >
                        <Store aria-hidden="true" />
                        <span>
                          <b>Collection</b>
                          <span>~20 min · no fee</span>
                        </span>
                      </button>
                    </div>

                    <div className="field-grid">
                      <div className="field">
                        <label htmlFor="name">Full name</label>
                        <input
                          id="name"
                          value={form.name}
                          onChange={update('name')}
                          aria-invalid={Boolean(errors.name)}
                          placeholder="Your full name"
                          autoComplete="name"
                        />
                        {errors.name && (
                          <p className="field-error">
                            <AlertCircle aria-hidden="true" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="field">
                        <label htmlFor="phone">Phone number</label>
                        <input
                          id="phone"
                          value={form.phone}
                          onChange={update('phone')}
                          aria-invalid={Boolean(errors.phone)}
                          placeholder="+383 44 123 456"
                          autoComplete="tel"
                          inputMode="tel"
                        />
                        {errors.phone && (
                          <p className="field-error">
                            <AlertCircle aria-hidden="true" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {!isPickup && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="field">
                            <label htmlFor="address">Delivery address</label>
                            <input
                              id="address"
                              value={form.address}
                              onChange={update('address')}
                              aria-invalid={Boolean(errors.address)}
                              placeholder="Rr. Idriz Seferi 8, Gjilan"
                              autoComplete="street-address"
                            />
                            {errors.address && (
                              <p className="field-error">
                                <AlertCircle aria-hidden="true" />
                                {errors.address}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="field">
                      <label htmlFor="notes">Notes for the kitchen (optional)</label>
                      <textarea
                        id="notes"
                        value={form.notes}
                        onChange={update('notes')}
                        placeholder="Extra chilli, no onion, second bell on the left…"
                      />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={!items.length}>
                      <Lock aria-hidden="true" />
                      {items.length ? `Place order · €${total.toFixed(2)}` : 'Add something to your basket'}
                    </button>

                    <div className="reassure">
                      <div>
                        <CreditCard aria-hidden="true" />
                        Pay on delivery by card or cash — nothing is charged now.
                      </div>
                      <div>
                        <Radar aria-hidden="true" />
                        Live tracking starts the moment the kitchen confirms.
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* ------------- summary ------------- */}
              <aside>
                <div className="card sticky">
                  <div className="card-head">
                    <div>
                      <h2>Summary</h2>
                      <p>{isPickup ? 'Collection from Gavran 1' : 'Delivered across Gjilan'}</p>
                    </div>
                    <ShoppingBag aria-hidden="true" style={{ width: 18, height: 18, color: 'var(--ink-40)' }} />
                  </div>

                  <div className="card-body">
                    <div className="totals">
                      <div className="row">
                        <span>
                          Subtotal{items.length > 0 && ` · ${items.reduce((n, i) => n + i.qty, 0)} items`}
                        </span>
                        <b>€{subtotal.toFixed(2)}</b>
                      </div>
                      <div className="row">
                        <span>{isPickup ? 'Collection' : 'Delivery'}</span>
                        {fee ? <b>€{fee.toFixed(2)}</b> : <b className="free">Free</b>}
                      </div>
                      <div className="row total">
                        <span>Total</span>
                        <b>€{total.toFixed(2)}</b>
                      </div>
                    </div>
                  </div>

                  <div className="card-body tight" style={{ borderTop: '1px solid var(--line)' }}>
                    <h4
                      style={{
                        fontFamily: 'var(--sans)',
                        fontSize: '0.6875rem',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-40)',
                        marginBottom: 14,
                      }}
                    >
                      After you order
                    </h4>
                    <ol style={{ display: 'grid', gap: 9 }}>
                      {ORDER_STAGES.map((stage, i) => (
                        <li
                          key={stage.key}
                          style={{
                            display: 'flex',
                            gap: 10,
                            alignItems: 'center',
                            fontSize: '0.8125rem',
                            color: 'var(--ink-60)',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--mono)',
                              fontSize: '0.6875rem',
                              color: 'var(--ink-40)',
                            }}
                          >
                            0{i + 1}
                          </span>
                          {stage.label}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {history.length > 0 && (
                    <div className="card-body" style={{ borderTop: '1px solid var(--line)' }}>
                      <h4
                        style={{
                          fontFamily: 'var(--sans)',
                          fontSize: '0.6875rem',
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          color: 'var(--ink-40)',
                          marginBottom: 6,
                        }}
                      >
                        Previous orders
                      </h4>
                      {history.slice(0, 4).map((past) => (
                        <div className="past-order" key={past.id}>
                          <div>
                            <b>{past.id}</b>
                            <span>
                              {new Date(past.placedAt).toLocaleDateString()} ·{' '}
                              {past.items.reduce((n, i) => n + i.qty, 0)} items
                            </span>
                          </div>
                          <b style={{ fontFamily: 'var(--sans)', fontWeight: 600 }}>
                            €{past.total.toFixed(2)}
                          </b>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
