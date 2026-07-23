import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthed } from '../../store/authSlice'

// Route guard for everything under /admin. `replace` keeps the login page out
// of the history stack, and `state.from` sends you where you were headed.
export default function RequireAuth() {
  const isAuthed = useSelector(selectIsAuthed)
  const location = useLocation()

  if (!isAuthed) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
