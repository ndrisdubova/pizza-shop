import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  Clock,
  Flame,
  MapPin,
  Radar,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Timer,
  Truck,
  Wheat,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import DishCard from '../components/DishCard'
import { IMAGES } from '../data/menu'
import { SHOP } from '../data/shop'
import { selectFeaturedDishes, selectMenu } from '../store/menuSlice'

const FACTS = [
  { icon: Flame, value: '450°C', label: 'Wood-fired stone oven' },
  { icon: Timer, value: '48 hrs', label: 'Cold dough fermentation' },
  { icon: Truck, value: '~30 min', label: 'Average delivery time' },
  { icon: Star, value: '4.9 / 5', label: 'From 240 reviews' },
]

const ASSURANCES = [
  { icon: Truck, title: 'Flat €1.50 delivery', text: 'Anywhere in Gjilan, in insulated boxes.' },
  { icon: Radar, title: 'Live tracking', text: 'Every stage, timestamped as it happens.' },
  { icon: ShieldCheck, title: 'Made to order', text: 'Nothing is pre-cooked or held warm.' },
  { icon: Clock, title: 'Open late', text: 'Until 01:00 on Friday and Saturday.' },
]

const SPECS = [
  {
    icon: Wheat,
    title: 'Italian type 00 flour, two days of rest',
    text: 'A slow cold ferment builds flavour and makes the crust light enough to finish.',
  },
  {
    icon: Flame,
    title: 'Ninety seconds on the stone',
    text: 'The oven never drops below 450°C, which is what gives the base its leopard spotting.',
  },
  {
    icon: Sparkles,
    title: 'Pasta rolled every morning',
    text: 'Tagliatelle and trofie cut by hand before service. The ragù starts before we open.',
  },
]

const STEPS = [
  {
    icon: ShoppingBag,
    title: 'Choose your dishes',
    text: 'Browse the full menu and build your basket. It follows you around the site and survives a refresh.',
  },
  {
    icon: MapPin,
    title: 'Delivery or collection',
    text: 'Give us a name, a number and an address. Collection skips the fee and takes about twenty minutes.',
  },
  {
    icon: Radar,
    title: 'Follow it to the door',
    text: 'Confirmed, prepared, out for delivery — each step appears on your tracker with the time it happened.',
  },
]

const REVIEWS = [
  {
    name: 'Arben K.',
    meta: 'Ordered 3 days ago',
    text: 'The best crust in Gjilan, and the first place where I actually knew when the food would arrive.',
  },
  {
    name: 'Elira M.',
    meta: 'Regular since we opened',
    text: 'The tagliatelle al ragù tastes like a Sunday at home. I order it every other week without fail.',
  },
  {
    name: 'Driton P.',
    meta: 'Ordered last week',
    text: 'Arrived hot, boxed properly, exactly at the time the tracker said. That never happens.',
  },
]

// The featured heading reads better spelled out for the counts that fit a row.
const COUNT_WORDS = {
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
}

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
}

export default function Home() {
  const MENU = useSelector(selectMenu)
  // Chosen in the back office, under Menu → Featured.
  const signatures = useSelector(selectFeaturedDishes)

  return (
    <>
      {/* ---------------- hero ---------------- */}
      <section className="hero">
        <div className="hero-media">
          <motion.img
            src={IMAGES.hero}
            alt="A pizza coming out of the wood-fired oven at Semi's"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
            fetchPriority="high"
          />
        </div>

        <div className="hero-body">
          <div className="wrap">
            <motion.div initial="hidden" animate="show" variants={reveal} transition={{ duration: 0.6 }}>
              <span className="label">Gjilan · Open since 2025</span>
              <h1>
                Wood-fired pizza and pasta, <em>made the slow way</em>.
              </h1>
              <p className="lede">
                A two-day dough, a stone oven that never cools down and pasta rolled before
                service. Order in a minute and watch it travel from our pass to your table.
              </p>

              <div className="hero-actions">
                <Link to="/order" className="btn btn-primary">
                  Order now
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link to="/menu" className="btn btn-on-dark">
                  View the menu
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="hero-facts"
              initial="hidden"
              animate="show"
              variants={reveal}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              {FACTS.map((fact) => (
                <div className="fact" key={fact.label}>
                  <div className="fact-value">
                    <fact.icon aria-hidden="true" />
                    {fact.value}
                  </div>
                  <div className="fact-label">{fact.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <span className="scroll-hint">
          Scroll
          <ArrowDown aria-hidden="true" />
        </span>
      </section>

      {/* ---------------- assurances ---------------- */}
      <section className="assurances">
        <div className="wrap">
          {ASSURANCES.map((item) => (
            <div className="assurance" key={item.title}>
              <item.icon aria-hidden="true" />
              <div>
                <b>{item.title}</b>
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- craft ---------------- */}
      <section className="section">
        <div className="wrap split">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={reveal}
            transition={{ duration: 0.55 }}
          >
            <span className="label">The kitchen</span>
            <h2>We only do two things, and we do them properly.</h2>
            <p className="lede">
              Pizza and pasta, nothing else. A year of making the same two things every single day
              means we have stopped guessing — we know how the dough behaves when it rains and how
              long the ragù needs when the pot is only half full.
            </p>

            <div className="spec-list">
              {SPECS.map((spec) => (
                <div className="spec" key={spec.title}>
                  <spec.icon aria-hidden="true" />
                  <div>
                    <b>{spec.title}</b>
                    <span>{spec.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 34 }}>
              <Link to="/about" className="link">
                Read our story
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="split-media"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <img src={IMAGES.oven} alt="Pizza on a wooden peel in front of the wood-fired oven" loading="lazy" />
            <div className="stamp">
              <div>
                <b>1</b>
                <span>Year in Gjilan</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- signatures ---------------- */}
      {signatures.length > 0 && (
        <section className="section section-tint">
          <div className="wrap">
            <div className="head-row">
              <div className="section-head">
                <span className="label">Most ordered</span>
                <h2>
                  {signatures.length === 1
                    ? 'The one we make most nights'
                    : `The ${COUNT_WORDS[signatures.length] ?? signatures.length} we make most nights`}
                </h2>
              </div>
              <Link to="/menu" className="link">
                All {MENU.length} dishes
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className="dish-grid">
              {signatures.map((dish, i) => (
                <DishCard key={dish.id} dish={dish} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- how it works ---------------- */}
      <section className="section">
        <div className="wrap">
          <div className="section-head center">
            <span className="label">Ordering</span>
            <h2>Three steps, then you can watch it happen</h2>
          </div>
        </div>

        <div className="wrap" style={{ padding: 0 }}>
          <div className="steps">
            {STEPS.map((step, i) => (
              <motion.div
                className="step"
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.09 }}
              >
                <span className="step-n">STEP {String(i + 1).padStart(2, '0')}</span>
                <step.icon aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="wrap" style={{ textAlign: 'center', marginTop: 48 }}>
          <Link to="/order" className="btn btn-dark">
            Start your order
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ---------------- reviews ---------------- */}
      <section className="section section-tint">
        <div className="wrap">
          <div className="section-head center">
            <span className="label">What people say</span>
            <h2>4.9 out of 5, across 240 reviews</h2>
          </div>

          <div className="quotes">
            {REVIEWS.map((review, i) => (
              <motion.figure
                className="quote"
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <div className="stars" aria-label="Five out of five">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} aria-hidden="true" />
                  ))}
                </div>
                <blockquote>“{review.text}”</blockquote>
                <figcaption>
                  <span className="avatar-initial" aria-hidden="true">
                    {review.name[0]}
                  </span>
                  <span>
                    <b>{review.name}</b> · {review.meta}
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- cta ---------------- */}
      <section className="cta">
        <div className="cta-media">
          <img src={IMAGES.diningRoom} alt="" loading="lazy" />
        </div>
        <div className="wrap">
          <div>
            <h2>The oven is already hot.</h2>
            <p>
              Put an order together in under a minute and follow it from our pass to your door.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/order" className="btn btn-light">
              Order now
              <ArrowRight aria-hidden="true" />
            </Link>
            <a className="btn btn-on-dark" href={`tel:${SHOP.phone.tel}`}>
              Call the restaurant
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
