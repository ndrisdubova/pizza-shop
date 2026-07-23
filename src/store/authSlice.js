import { createSlice } from '@reduxjs/toolkit'

// DEMO ONLY. These live in the client bundle, so anyone who opens devtools can
// read them — this gate keeps the admin area out of the way, it does not secure
// it. A real deployment authenticates against a server and stores a session
// token; the only line that changes is the check inside `login` below.
const CREDENTIALS = {
  username: 'semiss123',
  password: 'pizza123',
}

const initialState = {
  user: null, // { username, since }
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      const { username, password } = action.payload
      const ok =
        username.trim().toLowerCase() === CREDENTIALS.username &&
        password === CREDENTIALS.password

      if (ok) {
        state.user = { username: CREDENTIALS.username, since: Date.now() }
        state.error = null
      } else {
        state.user = null
        state.error = 'That username and password combination is not recognised.'
      }
    },
    logout(state) {
      state.user = null
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    },
  },
})

export const { login, logout, clearAuthError } = authSlice.actions

export const selectUser = (state) => state.auth.user
export const selectIsAuthed = (state) => Boolean(state.auth.user)
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
