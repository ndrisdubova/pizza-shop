import { Link } from 'react-router-dom'
import { ArrowRight, UtensilsCrossed } from 'lucide-react'
import { IMAGES } from '../data/menu'

export default function NotFound() {
  return (
    <section className="page-header" style={{ paddingBottom: 'clamp(80px, 12vw, 160px)' }}>
      <div className="page-header-media">
        <img src={IMAGES.diningRoomDark} alt="" />
      </div>
      <div className="wrap">
        <UtensilsCrossed
          aria-hidden="true"
          style={{ width: 28, height: 28, color: 'var(--gold)', marginBottom: 24 }}
        />
        <span className="label">Error 404</span>
        <h1>This page has been cleared away.</h1>
        <p className="lede">
          Whatever was here is off the menu. The food, thankfully, is exactly where you left it.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
          <Link to="/menu" className="btn btn-light">
            View the menu
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/" className="btn btn-on-dark">
            Back home
          </Link>
        </div>
      </div>
    </section>
  )
}
