import { createSelector, createSlice } from '@reduxjs/toolkit'
import { MENU } from '../data/menu'

// What the home page shows under "Most ordered" until the owner changes it.
// Four fills the grid neatly on a desktop row.
const DEFAULT_FEATURED = ['p-semis', 'pa-ragu', 'p-prosciutto', 'pa-carbonara']

// `data/menu.js` is only the starting menu. Once the owner edits anything the
// list in here is the real one, which is why the whole thing lives in state.
const initialState = {
  dishes: MENU.map((dish) => ({ ...dish })),
  soldOut: [], // dish ids
  featured: DEFAULT_FEATURED,
}

const slugId = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24) || 'dish'

// Saved state from before the menu was editable holds `priceOverrides` and no
// `dishes`. Rebuild the list from it so an existing basket or price survives.
export function migrateMenuState(menu) {
  if (!menu || menu.dishes) return menu
  const overrides = menu.priceOverrides ?? {}
  return {
    dishes: MENU.map((dish) => ({ ...dish, price: overrides[dish.id] ?? dish.price })),
    soldOut: menu.soldOut ?? [],
    featured: menu.featured ?? DEFAULT_FEATURED,
  }
}

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    addDish: {
      reducer(state, action) {
        state.dishes.unshift(action.payload)
      },
      prepare(dish) {
        // Names collide (two "Margherita"s), so ids get a short random tail.
        const id = `${slugId(dish.name)}-${Math.random().toString(36).slice(2, 6)}`
        return { payload: { ...dish, id } }
      },
    },
    updateDish(state, action) {
      const { id, ...changes } = action.payload
      const dish = state.dishes.find((d) => d.id === id)
      if (dish) Object.assign(dish, changes)
    },
    removeDish(state, action) {
      const id = action.payload
      state.dishes = state.dishes.filter((d) => d.id !== id)
      state.soldOut = state.soldOut.filter((x) => x !== id)
      state.featured = state.featured.filter((x) => x !== id)
    },
    setPrice(state, action) {
      const { id, price } = action.payload
      const dish = state.dishes.find((d) => d.id === id)
      if (dish) dish.price = price
    },
    toggleSoldOut(state, action) {
      const id = action.payload
      state.soldOut = state.soldOut.includes(id)
        ? state.soldOut.filter((x) => x !== id)
        : [...state.soldOut, id]
    },
    toggleFeatured(state, action) {
      const id = action.payload
      state.featured = state.featured.includes(id)
        ? state.featured.filter((x) => x !== id)
        : [...state.featured, id]
    },
    resetMenu() {
      return { ...initialState, dishes: MENU.map((dish) => ({ ...dish })) }
    },
  },
})

export const {
  addDish,
  updateDish,
  removeDish,
  setPrice,
  toggleSoldOut,
  toggleFeatured,
  resetMenu,
} = menuSlice.actions

const ORIGINAL = new Map(MENU.map((dish) => [dish.id, dish]))

// The single place the rest of the app reads the menu from, so the customer
// side and the admin side can never show different prices. Memoised, because
// it builds a new array and every component that reads it would otherwise
// re-render on every dispatch.
export const selectMenu = createSelector(
  [
    (state) => state.menu.dishes,
    (state) => state.menu.soldOut,
    (state) => state.menu.featured ?? [],
  ],
  (dishes, soldOut, featured) =>
    dishes.map((dish) => ({
      ...dish,
      soldOut: soldOut.includes(dish.id),
      featured: featured.includes(dish.id),
      isCustom: !ORIGINAL.has(dish.id),
      edited: ORIGINAL.has(dish.id) && ORIGINAL.get(dish.id).price !== dish.price,
    })),
)

// What the home page puts under "Most ordered". A sold-out dish is dropped —
// there is no point leading with something nobody can order tonight.
export const selectFeaturedDishes = createSelector([selectMenu], (menu) =>
  menu.filter((dish) => dish.featured && !dish.soldOut),
)

export const selectSoldOutCount = (state) => state.menu.soldOut.length
export const selectDishCount = (state) => state.menu.dishes.length

export default menuSlice.reducer
