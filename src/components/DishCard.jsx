import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Ban, Check, Flame, Leaf, Plus, Star } from 'lucide-react'
import { addItem, selectCartItems } from '../store/cartSlice'

// The one tag worth calling out on the photo itself.
function featuredTag(tags) {
  if (tags.includes('Signature')) return { label: 'Signature', Icon: Star, hot: false }
  if (tags.includes('Spicy')) return { label: 'Spicy', Icon: Flame, hot: true }
  if (tags.includes('Vegan')) return { label: 'Vegan', Icon: Leaf, hot: false }
  return null
}

export default function DishCard({ dish, index = 0 }) {
  const dispatch = useDispatch()
  const inCart = useSelector(selectCartItems).find((item) => item.id === dish.id)
  const [loaded, setLoaded] = useState(false)
  const badge = featuredTag(dish.tags)

  return (
    <motion.article
      className={`dish ${dish.soldOut ? 'sold-out' : ''}`}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.045, 0.36), ease: [0.22, 0.61, 0.36, 1] }}
    >
      <div className="dish-media">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          decoding="async"
          className={loaded ? '' : 'loading'}
          onLoad={() => setLoaded(true)}
        />
        {dish.soldOut ? (
          <span className="badge muted">
            <Ban aria-hidden="true" />
            Sold out
          </span>
        ) : (
          badge && (
            <span className={`badge ${badge.hot ? 'hot' : ''}`}>
              <badge.Icon aria-hidden="true" />
              {badge.label}
            </span>
          )
        )}
      </div>

      <div className="dish-body">
        <div className="dish-head">
          <h3>{dish.name}</h3>
          <span className="price">€{dish.price.toFixed(2)}</span>
        </div>

        <p className="dish-desc">{dish.description}</p>

        <div className="dish-tags">
          {dish.tags.map((tag) => (
            <span key={tag} className={`pill ${tag === 'Signature' ? 'accent' : ''}`}>
              {tag}
            </span>
          ))}
        </div>

        <div className="dish-foot">
          {dish.soldOut ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-40)' }}>
              Back on the menu tomorrow
            </span>
          ) : inCart ? (
            <span className="in-cart">
              <Check aria-hidden="true" />
              {inCart.qty} in basket
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-40)' }}>
              Ready in ~{dish.category === 'pizza' ? 12 : 14} min
            </span>
          )}

          <button
            className="btn btn-outline btn-sm"
            disabled={dish.soldOut}
            onClick={() =>
              dispatch(
                addItem({
                  id: dish.id,
                  name: dish.name,
                  price: dish.price,
                  image: dish.image,
                }),
              )
            }
          >
            {dish.soldOut ? (
              'Unavailable'
            ) : (
              <>
                <Plus aria-hidden="true" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
