import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

// The public-facing chrome. The admin area deliberately has its own.
export default function SiteLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
