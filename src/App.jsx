import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import SiteLayout from './components/SiteLayout'
import RequireAuth from './components/admin/RequireAuth'
import AdminLayout from './components/admin/AdminLayout'
import Home from './pages/Home'
import About from './pages/About'
import Menu from './pages/Menu'
import Order from './pages/Order'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AdminOrders from './pages/admin/AdminOrders'
import MenuManager from './pages/admin/MenuManager'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Routes>
        {/* customer-facing site */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/order" element={<Order />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* back office */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/menu" element={<MenuManager />} />
          </Route>
        </Route>
      </Routes>
    </div>
  )
}
