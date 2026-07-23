import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { FacebookIcon, InstagramIcon, XIcon } from './SocialIcons'

const HOURS = [
  ['Monday — Thursday', '11:00 — 23:00'],
  ['Friday — Saturday', '11:00 — 01:00'],
  ['Sunday', '12:00 — 22:00'],
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: 20 }}>
              <span className="brand-mark" aria-hidden="true">
                S
              </span>
              <span className="brand-text">
                Semi&rsquo;s
                <small>Pizza &amp; Pasta</small>
              </span>
            </div>
            <p>
              A wood oven, a pasta board and two people who have been doing this since 2025.
              Everything is made to order, which is why it takes the time it takes.
            </p>
            <div className="socials">
              <a href="#" aria-label="Instagram">
                <InstagramIcon aria-hidden="true" />
              </a>
              <a href="#" aria-label="Facebook">
                <FacebookIcon aria-hidden="true" />
              </a>
              <a href="#" aria-label="X">
                <XIcon aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/menu">Full menu</Link>
              </li>
              <li>
                <Link to="/about">Our story</Link>
              </li>
              <li>
                <Link to="/order">Order &amp; track</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Opening hours</h4>
            {HOURS.map(([day, time]) => (
              <div className="hours-row" key={day}>
                <span>{day}</span>
                <span>{time}</span>
              </div>
            ))}
          </div>

          <div>
            <h4>Find us</h4>
            <ul className="footer-contact">
              <li>
                <MapPin aria-hidden="true" />
                <span>
                  Gavran 1
                  <br />
                  Gjilan, Kosovo
                </span>
              </li>
              <li>
                <Phone aria-hidden="true" />
                <a href="tel:+38348303222">+383 048 303 222</a>
              </li>
              <li>
                <Mail aria-hidden="true" />
                <a href="mailto:hello@semis.example">hello@semis.example</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} Semi&rsquo;s Pizza &amp; Pasta</span>
          <span>
            Developed by{' '}
            <a
              className="footer-credit"
              href="https://ndris-dubova.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ndris Dubova
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
