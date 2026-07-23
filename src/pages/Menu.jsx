import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { ArrowRight, ChevronRight, Search, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import DishCard from '../components/DishCard'
import { CATEGORIES, IMAGES } from '../data/menu'
import { selectCartCount, selectCartSubtotal } from '../store/cartSlice'
import { selectMenu } from '../store/menuSlice'

export default function Menu() {
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const count = useSelector(selectCartCount)
  const subtotal = useSelector(selectCartSubtotal)
  const MENU = useSelector(selectMenu)

  const dishes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MENU.filter((dish) => {
      const inCategory = category === 'all' || dish.category === category
      const matches =
        !q ||
        dish.name.toLowerCase().includes(q) ||
        dish.description.toLowerCase().includes(q) ||
        dish.tags.some((tag) => tag.toLowerCase().includes(q))
      return inCategory && matches
    })
  }, [MENU, category, query])

  const countFor = (id) => (id === 'all' ? MENU.length : MENU.filter((d) => d.category === id).length)

  return (
    <>
      <section className="page-header">
        <div className="page-header-media">
          <img src={IMAGES.diningRoomDark} alt="" />
        </div>
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight aria-hidden="true" />
            <span>Menu</span>
          </nav>
          <span className="label">The full list</span>
          <h1>Twenty dishes, all made to order.</h1>
          <p className="lede">
            Prices in euro, including tax. Most things can be made vegetarian — leave a note at
            checkout and the kitchen will sort it.
          </p>
        </div>
      </section>

      <div className="menu-bar">
        <div className="wrap menu-bar-inner">
          <div className="filters" role="tablist" aria-label="Menu categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={category === cat.id}
                className={`filter ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
                <span className="count">{countFor(cat.id)}</span>
              </button>
            ))}
          </div>

          <div className="search">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the menu"
              aria-label="Search the menu"
            />
          </div>
        </div>
      </div>

      <section style={{ paddingBottom: 'clamp(64px, 9vw, 120px)' }}>
        <div className="wrap">
          {dishes.length > 0 ? (
            <motion.div layout className="dish-grid">
              <AnimatePresence mode="popLayout">
                {dishes.map((dish, i) => (
                  <DishCard key={dish.id} dish={dish} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="empty-state">
              <UtensilsCrossed aria-hidden="true" />
              <h3>Nothing matches “{query}”</h3>
              <p>Try “pizza”, “vegan” or clear the filters to see everything.</p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setQuery('')
                  setCategory('all')
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {count > 0 && (
          <motion.div
            className="basket-bar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <span className="info">
              <ShoppingBag aria-hidden="true" />
              <b>
                {count} item{count === 1 ? '' : 's'}
              </b>
              <span className="muted">·</span>
              <b>€{subtotal.toFixed(2)}</b>
            </span>
            <Link to="/order" className="btn btn-light btn-sm">
              Checkout
              <ArrowRight aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
