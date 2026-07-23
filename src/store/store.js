import { combineReducers, configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import orderReducer from './orderSlice'
import authReducer from './authSlice'
import menuReducer, { migrateMenuState } from './menuSlice'

const STORAGE_KEY = 'semis-state'
const HYDRATE = 'app/hydrate'

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const state = JSON.parse(raw)
    // Saved state can predate a feature. Upgrade it rather than crash on it.
    if (state.menu) state.menu = migrateMenuState(state.menu)
    return state
  } catch {
    return undefined
  }
}

const combined = combineReducers({
  cart: cartReducer,
  order: orderReducer,
  auth: authReducer,
  menu: menuReducer,
})

// A root reducer so another tab's state can replace this one wholesale.
const rootReducer = (state, action) =>
  action.type === HYDRATE ? action.payload : combined(state, action)

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
})

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState()))
  } catch {
    // storage full or blocked — the app still works, just without persistence
  }
}

// Writes are debounced so a burst of quantity changes is one write...
let saveTimer = null
store.subscribe(() => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 200)
})

// ...but a pending write must never be lost to a reload or a closed tab,
// which would silently drop a basket item added a moment earlier.
window.addEventListener('pagehide', save)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') save()
})

// Keep tabs in step. `storage` only fires in the *other* tabs, so this is what
// lets the back office drive a customer's tracker in a second window: the admin
// sets a stage, this tab picks up the new state and re-renders.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return
  try {
    store.dispatch({ type: HYDRATE, payload: JSON.parse(event.newValue) })
  } catch {
    // a malformed write from another tab is not worth crashing over
  }
})
