import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence } from 'framer-motion'
import { ImageOff, Pencil, Plus, RotateCcw, Search, Star, Trash2, UtensilsCrossed } from 'lucide-react'
import { CATEGORIES } from '../../data/menu'
import {
  removeDish,
  resetMenu,
  selectMenu,
  setPrice,
  toggleFeatured,
  toggleSoldOut,
} from '../../store/menuSlice'
import DishEditor from '../../components/admin/DishEditor'

// Kept out of the component so the input can hold a half-typed value like "8."
// without the store rejecting it on every keystroke.
function parsePrice(raw) {
  const value = Number.parseFloat(raw.replace(',', '.'))
  if (!Number.isFinite(value) || value < 0 || value > 999) return null
  return Math.round(value * 100) / 100
}

export default function MenuManager() {
  const dispatch = useDispatch()
  const menu = useSelector(selectMenu)
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [drafts, setDrafts] = useState({})
  const [editing, setEditing] = useState(null) // { dish } | { dish: null } for new
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null) // id awaiting a second click

  const rows = menu.filter((dish) => {
    const inCategory = category === 'all' || dish.category === category
    const q = query.trim().toLowerCase()
    return inCategory && (!q || dish.name.toLowerCase().includes(q))
  })

  const available = menu.filter((dish) => !dish.soldOut).length
  const featured = menu.filter((dish) => dish.featured)
  const hiddenFeatured = featured.filter((dish) => dish.soldOut).length

  const commitPrice = (dish, raw) => {
    const value = parsePrice(raw)
    if (value !== null) dispatch(setPrice({ id: dish.id, price: value }))
    // Either way, drop the draft so the field falls back to the stored price.
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[dish.id]
      return next
    })
  }

  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    dispatch(resetMenu())
    setConfirmReset(false)
  }

  // Deleting takes two clicks, since it cannot be undone.
  const deleteDish = (id) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }
    dispatch(removeDish(id))
    setConfirmDelete(null)
  }

  const countFor = (id) =>
    id === 'all' ? menu.length : menu.filter((d) => d.category === id).length

  return (
    <>
      <div className="work-head">
        <div>
          <h1>Menu</h1>
          <p>
            {menu.length} dishes · {available} available · {featured.length} featured on the home
            page
          </p>
        </div>
        <div className="work-actions">
          <div className="search">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes"
              aria-label="Search dishes"
            />
          </div>
          <button
            className={`btn btn-sm ${confirmReset ? 'btn-primary' : 'btn-outline'}`}
            onClick={reset}
            onBlur={() => setConfirmReset(false)}
          >
            <RotateCcw aria-hidden="true" />
            {confirmReset ? 'Tap again to reset' : 'Reset menu'}
          </button>
          <button className="btn btn-dark btn-sm" onClick={() => setEditing({ dish: null })}>
            <Plus aria-hidden="true" />
            Add dish
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`filter ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
                <span className="count">{countFor(cat.id)}</span>
              </button>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ink-60)' }}>
            {featured.length === 0 ? (
              <span style={{ color: 'var(--accent)' }}>
                Nothing featured — the home page is hiding that section
              </span>
            ) : hiddenFeatured > 0 ? (
              <span style={{ color: 'var(--accent)' }}>
                {hiddenFeatured} featured dish{hiddenFeatured === 1 ? '' : 'es'} sold out, so not on
                the{' '}
                <Link to="/" className="link" style={{ fontSize: 'inherit' }}>
                  home page
                </Link>
              </span>
            ) : (
              'Changes show on the site immediately'
            )}
          </p>
        </div>

        {rows.length ? (
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Featured</th>
                  <th className="num">Edit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((dish) => (
                  <tr key={dish.id} className={dish.soldOut ? 'is-sold-out' : ''}>
                    <td data-label="Dish">
                      <div className="dish-cell">
                        {dish.image ? (
                          <img src={dish.image} alt="" loading="lazy" />
                        ) : (
                          <span className="dish-cell-blank" aria-hidden="true">
                            <ImageOff />
                          </span>
                        )}
                        <div>
                          <b>
                            {dish.name}
                            {dish.isCustom && <span className="new-dot" title="Added by you" />}
                          </b>
                          <span>{dish.category}</span>
                        </div>
                      </div>
                    </td>

                    <td data-label="Price">
                      <label className="price-edit">
                        <span>€</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          aria-label={`Price for ${dish.name}`}
                          value={drafts[dish.id] ?? dish.price.toFixed(2)}
                          onChange={(e) =>
                            setDrafts((prev) => ({ ...prev, [dish.id]: e.target.value }))
                          }
                          onBlur={(e) => commitPrice(dish, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        />
                      </label>
                      {dish.edited && (
                        <span className="edited-dot" title="Changed from the original price" />
                      )}
                    </td>

                    <td data-label="Availability">
                      <div className="switch-cell">
                        <button
                          className="switch"
                          role="switch"
                          aria-checked={!dish.soldOut}
                          aria-label={`${dish.name} available`}
                          onClick={() => dispatch(toggleSoldOut(dish.id))}
                        />
                        <span>{dish.soldOut ? 'Sold out' : 'Available'}</span>
                      </div>
                    </td>

                    <td data-label="Featured">
                      <button
                        className={`feature-btn ${dish.featured ? 'on' : ''}`}
                        aria-pressed={dish.featured}
                        onClick={() => dispatch(toggleFeatured(dish.id))}
                        title={
                          dish.featured
                            ? 'Showing on the home page'
                            : 'Show this dish on the home page'
                        }
                      >
                        <Star aria-hidden="true" />
                        {dish.featured ? 'Featured' : 'Feature'}
                      </button>
                    </td>

                    <td className="num" data-label="">
                      <div className="row-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setEditing({ dish })}
                        >
                          <Pencil aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm ${confirmDelete === dish.id ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => deleteDish(dish.id)}
                          onBlur={() => setConfirmDelete(null)}
                          aria-label={`Delete ${dish.name}`}
                        >
                          <Trash2 aria-hidden="true" />
                          {confirmDelete === dish.id && 'Sure?'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <UtensilsCrossed aria-hidden="true" />
            <h3>{query ? `Nothing matches “${query}”` : 'No dishes in here yet'}</h3>
            <p>
              {query
                ? 'Try a different name, or clear the search.'
                : 'Add the first dish and it appears on the menu straight away.'}
            </p>
            <button className="btn btn-dark btn-sm" onClick={() => setEditing({ dish: null })}>
              <Plus aria-hidden="true" />
              Add dish
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && <DishEditor dish={editing.dish} onClose={() => setEditing(null)} />}
      </AnimatePresence>
    </>
  )
}
