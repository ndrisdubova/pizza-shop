import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Eye, EyeOff, Info, Lock, LogIn } from 'lucide-react'
import { clearAuthError, login, selectAuthError, selectIsAuthed } from '../../store/authSlice'
import { IMAGES } from '../../data/menu'

export default function AdminLogin() {
  const dispatch = useDispatch()
  const location = useLocation()
  const isAuthed = useSelector(selectIsAuthed)
  const error = useSelector(selectAuthError)

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  // A stale error from a previous visit should not greet you on arrival.
  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const destination = location.state?.from ?? '/admin'

  if (isAuthed) return <Navigate to={destination} replace />

  const update = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    if (error) dispatch(clearAuthError())
  }

  // On success `isAuthed` flips and the redirect above takes over; on failure
  // the slice sets an error. Either way there is nothing imperative to do here.
  const submit = (e) => {
    e.preventDefault()
    dispatch(login(form))
  }

  return (
    <div className="login">
      <aside className="login-aside">
        <div className="login-aside-media">
          <img src={IMAGES.kitchen} alt="" />
        </div>

        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span className="brand-text" style={{ color: 'var(--on-dark)' }}>
            Semi&rsquo;s
            <small>Pizza &amp; Pasta</small>
          </span>
        </div>

        <div>
          <span className="label">Staff access</span>
          <h2>Everything that happens behind the pass.</h2>
          <p>
            Live tickets, the night&rsquo;s takings and what has run out — all in one place, so
            nobody has to shout across the kitchen.
          </p>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--on-dark-40)' }}>
          Gavran 1, Gjilan
        </p>
      </aside>

      <div className="login-main">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="label">Back office</span>
          <h1>Sign in</h1>
          <p>Enter the staff credentials to manage orders and the menu.</p>

          {error && (
            <motion.div
              className="login-alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
            >
              <AlertCircle aria-hidden="true" />
              {error}
            </motion.div>
          )}

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                value={form.username}
                onChange={update('username')}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                placeholder="semiss123"
                aria-invalid={Boolean(error)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={Boolean(error)}
                  style={{ paddingRight: 46 }}
                />
                <button
                  type="button"
                  className="remove"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-dark btn-block" style={{ marginTop: 6 }}>
              <LogIn aria-hidden="true" />
              Sign in
            </button>
          </form>

          <div className="login-hint">
            <b>
              <Info aria-hidden="true" />
              Demo credentials
            </b>
            Username <code>semiss123</code> · Password <code>pizza123</code>
            <div style={{ marginTop: 10, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <Lock aria-hidden="true" style={{ width: 13, height: 13, marginTop: 3, flex: 'none' }} />
              <span>
                Checked in the browser, so treat this as a demo gate rather than real security.
              </span>
            </div>
          </div>

          <Link to="/" className="link login-back">
            <ArrowLeft aria-hidden="true" />
            Back to the restaurant
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
