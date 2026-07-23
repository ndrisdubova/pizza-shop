# Semi's Pizza & Pasta

Restaurant site with online ordering and live order tracking. React 19, React Router 7, Redux Toolkit, Framer Motion, Vite.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
npm run lint     # oxlint
```

## Pages

| Route | What's there |
| --- | --- |
| `/` | Dark photographic hero, guarantees bar, craft section, four signatures, three-step ordering, reviews, CTA |
| `/menu` | 20 dishes with photography, sticky category + search bar, floating basket bar |
| `/about` | Story, pull quote, first-year timeline, the team |
| `/order` | Basket, checkout form, confirmation animation, live tracker |
| `/admin/login` | Staff sign-in |
| `/admin` | Dashboard — KPIs, live ticket, last seven days, best sellers |
| `/admin/orders` | Searchable order table with status filters |
| `/admin/menu` | Price editing and sold-out switches |

## Back office

Sign in at [`/admin`](http://localhost:5173/admin) with **`semiss123` / `pizza123`**.

> The credentials are checked in the browser, in [`src/store/authSlice.js`](src/store/authSlice.js), which means they ship in the bundle and anyone can read them. This is a demo gate, not security. To make it real, replace the check inside the `login` reducer with a server call and keep a session token instead.

What it does:

- **Dashboard** — orders and takings for today and all time, average order value, how many dishes are off. A bar chart of the last seven days and the best sellers by quantity.
- **Live ticket** — the order currently in progress, with its items, notes, customer and a button that advances it a stage. Pressing it updates the customer's tracker instantly, because both read the same `order.current` in Redux.
- **Orders** — every ticket, searchable by reference, name, phone or dish, filterable by in-progress / completed.
- **Menu** — edit any price inline and flip a dish to sold out. Both are reflected on the customer site immediately: a sold-out dish greys out, gets a "Sold out" badge and can no longer be added to a basket.
- **Load sample orders** seeds ten plausible tickets across the past week so the dashboard has something to show. It is behind an explicit button and never runs on its own.

Everything under `/admin` sits behind [`RequireAuth`](src/components/admin/RequireAuth.jsx), which redirects to the login page and remembers where you were headed. The session is persisted, so a reload keeps you signed in.

## The ordering flow

1. Add dishes anywhere on the site. The basket lives in Redux and is persisted to `localStorage`.
2. On `/order`, pick delivery or collection and fill in name / phone / address. Fields are validated on submit.
3. **Place order** runs a full-screen confirmation sequence — a progress ring fills through four beats (confirming → sending to the kitchen → loading the oven → confirmed).
4. The page swaps to the **live tracker**, which advances itself through five stages:

   `Order placed → Confirmed by the kitchen → Being prepared → Out for delivery → Delivered`

   Each stage stamps the real time it happened, the progress bar fills, the active stage pulses, and a courier card appears while it is out for delivery. On delivery the order is archived into **Previous orders**.

Stage labels and timings live in `ORDER_STAGES` in [`src/store/orderSlice.js`](src/store/orderSlice.js) — change the `after` values (ms) to speed the demo up or slow it down. The full run is about 36 seconds.

## Design system

All tokens are at the top of [`src/styles/index.css`](src/styles/index.css): warm near-black ink on paper, a single terracotta accent, olive for success, gold on dark. Type is Fraunces (display) over Inter (interface), loaded from Google Fonts with system fallbacks. Icons are [lucide-react](https://lucide.dev) throughout — no emoji in the UI.

Photography is hotlinked from the Unsplash CDN with `auto=format` and width hints; ids live in [`src/data/menu.js`](src/data/menu.js). Brand marks (Instagram, Facebook, X) are hand-drawn SVGs in `src/components/SocialIcons.jsx`, because lucide deliberately ships no brand icons.

## Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminLayout.jsx   dark rail, nav counts, signed-in user
│   │   └── RequireAuth.jsx   route guard for everything under /admin
│   ├── DishCard.jsx        photo card, badge, sold-out state, add to basket
│   ├── Footer.jsx
│   ├── Header.jsx          announcement bar, scroll-aware header, mobile drawer
│   ├── OrderTracker.jsx    status card, stage timeline, courier, receipt
│   ├── PlacingOverlay.jsx  the confirmation sequence
│   ├── SiteLayout.jsx      customer chrome (the admin area has its own)
│   └── SocialIcons.jsx
├── data/menu.js            menu + image ids
├── pages/
│   ├── admin/              AdminLogin, Dashboard, AdminOrders, MenuManager
│   └── …                   Home, Menu, About, Order, NotFound
├── store/
│   ├── authSlice.js        demo credentials, login / logout
│   ├── cartSlice.js        add / remove / decrement / clear + selectors
│   ├── menuSlice.js        sold-out ids, price overrides, memoised selectMenu
│   ├── orderSlice.js       ORDER_STAGES, delivery pricing, placeOrder, advanceStage
│   └── store.js            configureStore + localStorage persistence
└── styles/
    ├── index.css           tokens and the customer site
    └── admin.css           the back office
```

## Notes

- There is no backend. Stage progression is simulated with a timer in [`OrderTracker.jsx`](src/components/OrderTracker.jsx) — swap that `setTimeout` for a poll or a websocket to make it real.
- Delivery pricing (a flat `€1.50`, free for collection) is defined once in `orderSlice.js` and used by both checkout and the placed order, so the two can never disagree.
- Persistence is debounced, with a flush on `pagehide`/`visibilitychange` so a basket change is never lost to a reload.
