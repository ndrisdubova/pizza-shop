import { createSelector, createSlice } from '@reduxjs/toolkit'
import { MENU } from '../data/menu'

// The tracking pipeline. `after` is how long (ms) the order sits in the
// previous stage before it moves into this one — stage 0 happens instantly.
export const ORDER_STAGES = [
  {
    key: 'placed',
    label: 'Order placed',
    short: 'Received',
    blurb: 'Payment authorised and your ticket has printed in the kitchen.',
    after: 0,
  },
  {
    key: 'accepted',
    label: 'Confirmed by the kitchen',
    short: 'Confirmed',
    blurb: 'The head chef has taken your ticket and slotted it into service.',
    after: 6000,
  },
  {
    key: 'preparing',
    label: 'Being prepared',
    short: 'Preparing',
    blurb: 'Ninety seconds at 450°C on the stone. Pasta goes into the pan to order.',
    after: 9000,
  },
  {
    key: 'on_the_way',
    label: 'Out for delivery',
    short: 'On the way',
    blurb: 'Boxed, sealed and with the courier. You will get a call on arrival.',
    after: 9000,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    short: 'Delivered',
    blurb: 'Handed over. Buon appetito.',
    after: 12000,
  },
]

export const DELIVERY_FEE = 1.5

// Single source of truth: checkout and the placed order must never disagree
// about what delivery costs. Collection is free, delivery is a flat fee.
export const deliveryFeeFor = (method) => (method === 'pickup' ? 0 : DELIVERY_FEE)

const makeOrderId = () =>
  'SP-' + Math.random().toString(36).slice(2, 6).toUpperCase() + Date.now().toString().slice(-3)

const initialState = {
  current: null, // the order being tracked
  history: [], // completed orders, newest first
}

// The back office edits orders by id, whether they are live or archived.
const findOrder = (state, id) =>
  state.current?.id === id ? state.current : state.history.find((o) => o.id === id)

// Offered as one-click choices in the back office, so declining an order still
// tells the customer something useful.
export const REJECTION_REASONS = [
  'The kitchen is at capacity right now',
  'Something on the order has run out',
  'The address is outside our delivery area',
  'We are about to close for the night',
]

const DEMO_CUSTOMERS = [
  { name: 'Arben Krasniqi', phone: '+383 44 210 118', address: 'Rr. Idriz Seferi 8, Gjilan' },
  { name: 'Elira Musliu', phone: '+383 45 887 402', address: 'Rr. Bulevardi i Pavarësisë 21, Gjilan' },
  { name: 'Driton Pireva', phone: '+383 49 302 766', address: 'Rr. Skenderbeu 4, Gjilan' },
  { name: 'Blerta Hoxha', phone: '+383 44 551 903', address: 'Rr. Agim Ramadani 17, Gjilan' },
  { name: 'Faton Berisha', phone: '+383 43 118 720', address: 'Rr. Nëna Terezë 2, Gjilan' },
  { name: 'Rina Gashi', phone: '+383 44 909 231', address: 'Rr. Dëshmorët e Kombit 33, Gjilan' },
  { name: 'Leart Sylejmani', phone: '+383 45 664 015', address: 'Rr. Rexhep Mala 12, Gjilan' },
  { name: 'Vlora Bytyqi', phone: '+383 49 773 188', address: 'Rr. Ismail Qemali 9, Gjilan' },
]

// Ten plausible tickets spread across the past week, so a fresh install has a
// dashboard worth looking at.
function buildDemoHistory() {
  const now = Date.now()
  const HOUR = 3_600_000

  return DEMO_CUSTOMERS.flatMap((customer, i) => {
    const orders = i < 2 ? 2 : 1 // a couple of repeat customers
    return Array.from({ length: orders }, (_, j) => {
      const seed = i * 7 + j * 3
      const method = seed % 5 === 0 ? 'pickup' : 'delivery'
      const placedAt = now - (i * 17 + j * 29) * HOUR - (seed % 11) * 900_000

      const items = Array.from({ length: (seed % 3) + 1 }, (_, k) => {
        const dish = MENU[(seed * 5 + k * 6) % MENU.length]
        return {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          qty: ((seed + k) % 2) + 1,
        }
      })

      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
      const deliveryFee = deliveryFeeFor(method)
      const last = ORDER_STAGES.length - 1

      return {
        id: 'SP-' + (seed * 977).toString(36).toUpperCase().slice(0, 4) + (100 + seed),
        items,
        customer: { ...customer, method, notes: '' },
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        placedAt,
        stageIndex: last,
        timestamps: ORDER_STAGES.map((_, s) => placedAt + s * 7 * 60_000),
      }
    })
  }).sort((a, b) => b.placedAt - a.placedAt)
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    placeOrder: {
      reducer(state, action) {
        state.current = action.payload
      },
      prepare({ items, customer, subtotal }) {
        const now = Date.now()
        const deliveryFee = deliveryFeeFor(customer.method)
        return {
          payload: {
            id: makeOrderId(),
            items,
            customer,
            subtotal,
            deliveryFee,
            total: subtotal + deliveryFee,
            placedAt: now,
            stageIndex: 0,
            // Orders wait for the kitchen. Nothing moves on its own unless the
            // back office explicitly hands this order to the simulation.
            manual: true,
            // timestamps[i] is when stage i was reached, null until it happens
            timestamps: ORDER_STAGES.map((_, i) => (i === 0 ? now : null)),
          },
        }
      },
    },
    // The automatic simulation. Skipped once the kitchen takes manual control.
    advanceStage(state) {
      const order = state.current
      if (!order) return
      const next = order.stageIndex + 1
      if (next >= ORDER_STAGES.length) return
      order.stageIndex = next
      order.timestamps[next] = Date.now()
    },
    // Set any order to any stage from the back office, forwards or back.
    // Stages skipped over get stamped now; stages undone lose their stamp, so
    // the timeline always matches the stage the order is actually at.
    setOrderStage(state, action) {
      const { id, stage } = action.payload
      const order = findOrder(state, id)
      if (!order) return

      const target = Math.max(0, Math.min(stage, ORDER_STAGES.length - 1))
      const now = Date.now()

      order.stageIndex = target
      order.timestamps = order.timestamps.map((ts, i) => {
        if (i > target) return null
        if (i === 0) return ts ?? order.placedAt
        return ts ?? now
      })
      // Picking a real stage takes an order back off the declined pile.
      delete order.rejected
      order.manual = true
    },
    resumeAutoStages(state) {
      if (state.current) state.current.manual = false
    },
    // Turning an order away. A live order stays live so the customer sees what
    // happened and why, rather than the ticket just vanishing.
    rejectOrder(state, action) {
      const { id, reason } = action.payload
      const order = findOrder(state, id)
      if (!order) return
      order.rejected = { at: Date.now(), reason: reason || REJECTION_REASONS[0] }
      order.manual = true
    },
    archiveOrder(state) {
      if (!state.current) return
      state.history.unshift(state.current)
      state.current = null
    },
    // Gives the admin dashboard something to show on a fresh install. Never
    // runs on its own — it is behind an explicit button in the back office.
    seedDemoOrders(state) {
      state.history = [...buildDemoHistory(), ...state.history]
    },
    // Wipes the book: archived orders and anything still in the pass.
    clearOrders(state) {
      state.history = []
      state.current = null
    },
    clearOrder(state) {
      state.current = null
    },
  },
})

export const {
  placeOrder,
  advanceStage,
  setOrderStage,
  resumeAutoStages,
  rejectOrder,
  archiveOrder,
  clearOrder,
  seedDemoOrders,
  clearOrders,
} = orderSlice.actions

export const selectCurrentOrder = (state) => state.order.current
export const selectOrderHistory = (state) => state.order.history

export const ORDER_STATUS = {
  awaiting: 'Awaiting confirmation',
  progress: 'In progress',
  completed: 'Completed',
  declined: 'Declined',
}

// One definition of an order's status, read from the order itself, so the
// table, the dashboard and the ticket can never label the same order
// differently.
export const statusOf = (order) => {
  if (order.rejected) return 'declined'
  if (order.stageIndex >= ORDER_STAGES.length - 1) return 'completed'
  return order.stageIndex === 0 ? 'awaiting' : 'progress'
}

// Everything the back office counts: the live ticket plus everything archived.
export const selectAllOrders = createSelector(
  [selectCurrentOrder, selectOrderHistory],
  (current, history) => (current ? [current, ...history] : history),
)

export default orderSlice.reducer
