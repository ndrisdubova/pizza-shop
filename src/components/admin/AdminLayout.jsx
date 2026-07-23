import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ExternalLink, LayoutDashboard, LogOut, ReceiptText, UtensilsCrossed } from 'lucide-react'
import { logout, selectUser } from '../../store/authSlice'
import { selectAllOrders, selectCurrentOrder } from '../../store/orderSlice'
import { selectSoldOutCount } from '../../store/menuSlice'
import { SHOP } from '../../data/shop'

export default function AdminLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const orders = useSelector(selectAllOrders)
  const live = useSelector(selectCurrentOrder)
  const soldOut = useSelector(selectSoldOutCount)

  const signOut = () => {
    dispatch(logout())
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin">
      <aside className="rail">
        <div className="rail-brand">
          <span className="brand-mark" aria-hidden="true">
            {SHOP.mark}
          </span>
          <span className="brand-text">
            {SHOP.name}
            <small>Back office</small>
          </span>
        </div>

        <p className="rail-label">Manage</p>
        <nav>
          <NavLink to="/admin" end className={({ isActive }) => `rail-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard aria-hidden="true" />
            <span className="text">Dashboard</span>
            {live && <span className="tally">1 live</span>}
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `rail-link ${isActive ? 'active' : ''}`}>
            <ReceiptText aria-hidden="true" />
            <span className="text">Orders</span>
            <span className="tally">{orders.length}</span>
          </NavLink>
          <NavLink to="/admin/menu" className={({ isActive }) => `rail-link ${isActive ? 'active' : ''}`}>
            <UtensilsCrossed aria-hidden="true" />
            <span className="text">Menu</span>
            {soldOut > 0 && <span className="tally">{soldOut} off</span>}
          </NavLink>
          <Link to="/" className="rail-link">
            <ExternalLink aria-hidden="true" />
            <span className="text">View site</span>
          </Link>
        </nav>

        <div className="rail-foot">
          <div className="rail-user">
            <span className="rail-avatar" aria-hidden="true">
              {user?.username?.[0]?.toUpperCase()}
            </span>
            <span>
              <b>{user?.username}</b>
              <span>Owner</span>
            </span>
          </div>
          <button className="btn btn-on-dark btn-sm rail-logout" onClick={signOut}>
            <LogOut aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="work">
        <Outlet />
      </main>
    </div>
  )
}
