import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock, Menu, Phone, ShoppingBag, X } from 'lucide-react'
import { selectCartCount } from '../store/cartSlice'
import { selectCurrentOrder } from '../store/orderSlice'
import { SHOP } from '../data/shop'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'Our story' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const count = useSelector(selectCartCount)
  const activeOrder = useSelector(selectCurrentOrder)
  const { pathname } = useLocation()

  // The header sits over a dark hero on every page, so it only gains a
  // background once you have scrolled past it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setDrawer(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawer])

  const brand = (
    <Link to="/" className="brand">
      <span className="brand-mark" aria-hidden="true">
        {SHOP.mark}
      </span>
      <span className="brand-text">
        {SHOP.name}
        <small>{SHOP.kind}</small>
      </span>
    </Link>
  )

  return (
    <>
      <div className="announce">
        <div className="wrap">
          <span>
            <Clock aria-hidden="true" /> Open today until {SHOP.closesToday}
          </span>
          <i className="sep" aria-hidden="true" />
          <span>
            <Phone aria-hidden="true" /> {SHOP.phone.display}
          </span>
        </div>
      </div>

      <header className={`header ${scrolled ? 'solid' : 'over-hero'}`}>
        <div className="wrap header-inner">
          {brand}

          <nav className="nav">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <Link
              to="/order"
              className="icon-btn"
              aria-label={`Basket, ${count} item${count === 1 ? '' : 's'}`}
            >
              <ShoppingBag aria-hidden="true" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    className="cart-count"
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <Link to="/order" className="btn btn-primary btn-sm header-cta">
              {activeOrder ? 'Track order' : 'Order now'}
              <ArrowRight aria-hidden="true" />
            </Link>

            <button
              className="icon-btn burger"
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {drawer && (
          <motion.div
            className="drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <div className="drawer-top">
              {brand}
              <button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close menu">
                <X aria-hidden="true" />
              </button>
            </div>

            <nav>
              {LINKS.map((link) => (
                <Link key={link.to} to={link.to}>
                  {link.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              ))}
              <Link to="/order">
                {activeOrder ? 'Track order' : 'Order now'}
                <ArrowRight aria-hidden="true" />
              </Link>
            </nav>

            <div className="drawer-foot">
              <a className="btn btn-outline" href={`tel:${SHOP.phone.tel}`}>
                <Phone aria-hidden="true" /> {SHOP.phone.display}
              </a>
              <Link to="/order" className="btn btn-primary">
                <ShoppingBag aria-hidden="true" />
                Basket {count > 0 && `· ${count}`}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
