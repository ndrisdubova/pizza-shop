// Everything that changes when this site is put in front of a different
// restaurant. Nothing outside this file should hardcode a name, an address or
// a phone number — if it does, swapping shops means hunting through components.
//
// Two things live outside it, because they are not JavaScript: the <title> and
// og: tags in index.html, and the prose on the About page. Change those by hand.

const street = 'Gavran 1'
const city = 'Gjilan'
const country = 'Kosovo'

export const SHOP = {
  // ---- identity ----
  name: 'Semi’s',
  kind: 'Pizza & Pasta',
  fullName: 'Semi’s Pizza & Pasta',
  mark: 'S', // the square badge next to the wordmark
  tagline: 'Wood-fired pizza & fresh pasta in Gjilan',
  foundedYear: 2025,

  // ---- where ----
  street,
  city,
  country,
  address: `${street}, ${city}`,
  addressFull: `${street}, ${city}, ${country}`,

  // ---- contact ----
  // `tel` is what the dialler gets, `display` is what people read.
  phone: { display: '+383 048 303 222', tel: '+38348303222' },
  // Small shops here run on phone and WhatsApp, not email. Left empty on
  // purpose: the footer drops the row rather than showing an address that
  // nobody reads.
  email: '',

  // ---- opening ----
  hours: [
    ['Monday — Thursday', '11:00 — 23:00'],
    ['Friday — Saturday', '11:00 — 01:00'],
    ['Sunday', '12:00 — 22:00'],
  ],
  closesToday: '23:00', // shown in the announcement bar

  // ---- social ----
  // Empty strings render as a dead link; fill them in per shop.
  social: { instagram: '', facebook: '', x: '' },
}

export default SHOP
