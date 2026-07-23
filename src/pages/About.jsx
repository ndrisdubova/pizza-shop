import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { IMAGES } from '../data/menu'

const TIMELINE = [
  {
    year: 'Spring 2025',
    title: 'One oven, six tables',
    text: 'Semi took a narrow room on Gavran, put a wood oven at the back of it, and opened with four pizzas on the board.',
  },
  {
    year: 'Summer 2025',
    title: 'The pasta board arrives',
    text: 'Tagliatelle started being rolled in the back each morning. Nothing has come out of a packet since.',
  },
  {
    year: 'Winter 2025',
    title: 'We learned to deliver',
    text: 'A scooter and insulated boxes, with one rule: if the cheese has stopped pulling on arrival, it is on us.',
  },
  {
    year: '2026',
    title: 'Live order tracking',
    text: 'You stopped calling to ask where the food was, and we stopped answering the phone mid-service.',
  },
]

const TEAM = [
  {
    name: 'Semi Berisha',
    role: 'Owner · Pizzaiolo',
    text: 'Runs the oven every service. Will tell you exactly how long your dough rested if you ask.',
    image: IMAGES.kitchen,
  },
  {
    name: 'Lira Berisha',
    role: 'Pasta & Sauces',
    text: 'In at six every morning. The ragù is hers and the recipe has never been written down.',
    image: IMAGES.service,
  },
  {
    name: 'Ardit Krasniqi',
    role: 'Kitchen lead',
    text: 'Keeps twelve tickets moving at once and somehow never raises his voice at the pass.',
    image: IMAGES.diningRoom,
  },
]

export default function About() {
  return (
    <>
      <section className="page-header">
        <div className="page-header-media">
          <img src={IMAGES.diningRoom} alt="" />
        </div>
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight aria-hidden="true" />
            <span>Our story</span>
          </nav>
          <span className="label">Since 2025</span>
          <h1>A small kitchen that got carried away.</h1>
          <p className="lede">
            One year on Gavran. One oven, one dough recipe, a pasta board and one very reliable
            scooter — and no plans to complicate any of it.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <motion.div
            className="prose"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
          >
            <span className="label">How we cook</span>
            <h2>Good flour, real tomatoes, and time.</h2>
            <p className="intro">
              There is nothing clever going on here. The difference is entirely in what we refuse
              to rush.
            </p>
            <p>
              The dough ferments cold for forty-eight hours before it sees the oven. That is what
              makes a crust light enough to finish and easy to digest — the opposite of the heavy
              base you get from a same-day dough. It bakes for ninety seconds on a stone floor that
              never drops below 450°C.
            </p>
            <p>
              The pasta is rolled each morning and cooked to order, never held in a warmer. The
              ragù goes on the heat before we unlock the door and stays there for five hours. The
              mozzarella comes from a producer two towns over who we have used since day one.
            </p>

            <blockquote className="pull">
              If it is not good enough for my own table, it does not leave the pass.
              <cite>Semi Berisha, owner</cite>
            </blockquote>
          </motion.div>

          <motion.div
            className="split-media"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <img src={IMAGES.service} alt="A plate being carried to a table in the dining room" loading="lazy" />
          </motion.div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="wrap">
          <div className="section-head">
            <span className="label">Our first year</span>
            <h2>How we got here</h2>
          </div>

          <div className="timeline">
            {TIMELINE.map((entry, i) => (
              <motion.div
                className="tl-item"
                key={entry.year}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <div className="tl-year">{entry.year}</div>
                <h3>{entry.title}</h3>
                <p>{entry.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="label">The people</span>
            <h2>Three of us, most nights</h2>
          </div>

          <div className="people">
            {TEAM.map((person, i) => (
              <motion.article
                className="person"
                key={person.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <figure>
                  <img src={person.image} alt={person.name} loading="lazy" />
                </figure>
                <span className="role">{person.role}</span>
                <h3>{person.name}</h3>
                <p>{person.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-media">
          <img src={IMAGES.oven} alt="" loading="lazy" />
        </div>
        <div className="wrap">
          <div>
            <h2>Come and eat with us.</h2>
            <p>
              Gavran 1, Gjilan — or have it brought to you in about thirty minutes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/order" className="btn btn-light">
              Order now
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/menu" className="btn btn-on-dark">
              View the menu
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
