import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { FacebookIcon, InstagramIcon, XIcon } from './SocialIcons'
import { SHOP } from '../data/shop'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: 20 }}>
              <span className="brand-mark" aria-hidden="true">
                {SHOP.mark}
              </span>
              <span className="brand-text">
                {SHOP.name}
                <small>{SHOP.kind}</small>
              </span>
            </div>
            <p>
              A wood oven, a pasta board and two people who have been doing this since{' '}
              {SHOP.foundedYear}. Everything is made to order, which is why it takes the time it
              takes.
            </p>
            <div className="socials">
              <a href={SHOP.social.instagram || '#'} aria-label="Instagram">
                <InstagramIcon aria-hidden="true" />
              </a>
              <a href={SHOP.social.facebook || '#'} aria-label="Facebook">
                <FacebookIcon aria-hidden="true" />
              </a>
              <a href={SHOP.social.x || '#'} aria-label="X">
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
            {SHOP.hours.map(([day, time]) => (
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
                  {SHOP.street}
                  <br />
                  {SHOP.city}, {SHOP.country}
                </span>
              </li>
              <li>
                <Phone aria-hidden="true" />
                <a href={`tel:${SHOP.phone.tel}`}>{SHOP.phone.display}</a>
              </li>
              {SHOP.email && (
                <li>
                  <Mail aria-hidden="true" />
                  <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="footer-base">
          <span>
            © {new Date().getFullYear()} {SHOP.fullName}
          </span>
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
