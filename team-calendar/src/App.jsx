import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { Typography } from '@mui/material'
import { LoginPage } from './pages/login.jsx' 
import { SignupPage } from './pages/signup.jsx'
import { CalendarPage } from './pages/calendar.jsx'
import { GetCurrentUser } from './routes/auth.js'

const TOKEN_STORAGE_KEY = 'team-calendar-token'

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY))
  const [currentUser, setCurrentUser] = useState(null)
  const [authStatus, setAuthStatus] = useState(() =>
    sessionStorage.getItem(TOKEN_STORAGE_KEY) ? 'checking' : 'unauthenticated'
  )

  useEffect(() => {
    const handleSessionExpired = (event) => {
      if (sessionStorage.getItem(TOKEN_STORAGE_KEY) !== event.detail?.token) return
      sessionStorage.removeItem(TOKEN_STORAGE_KEY)
      setToken(null)
      setCurrentUser(null)
      setAuthStatus('unauthenticated')
    }

    window.addEventListener('team-calendar:session-expired', handleSessionExpired)
    return () => window.removeEventListener('team-calendar:session-expired', handleSessionExpired)
  }, [])

  useEffect(() => {
    if (!token) return

    let active = true
    GetCurrentUser(token)
      .then(user => {
        if (!active) return
        setCurrentUser(user)
        setAuthStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        sessionStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
        setCurrentUser(null)
        setAuthStatus('unauthenticated')
      })

    return () => {
      active = false
    }
  }, [token])

  const handleLogin = (newToken, user) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, newToken)
    setToken(newToken)
    setCurrentUser(user)
    setAuthStatus('authenticated')
  }

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setCurrentUser(null)
    setAuthStatus('unauthenticated')
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/calendar"
          element={
            authStatus === 'checking' ? (
              <Typography role="status">Checking your session...</Typography>
            ) : authStatus === 'authenticated' && token ? (
              <CalendarPage token={token} currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
