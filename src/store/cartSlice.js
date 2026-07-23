import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [], // { id, name, price, image, qty }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const { id, name, price, image } = action.payload
      const existing = state.items.find((item) => item.id === id)
      if (existing) {
        existing.qty += 1
      } else {
        state.items.push({ id, name, price, image, qty: 1 })
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    decrementItem(state, action) {
      const existing = state.items.find((item) => item.id === action.payload)
      if (!existing) return
      existing.qty -= 1
      if (existing.qty <= 0) {
        state.items = state.items.filter((item) => item.id !== action.payload)
      }
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addItem, removeItem, decrementItem, clearCart } = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.qty, 0)
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)

export default cartSlice.reducer
