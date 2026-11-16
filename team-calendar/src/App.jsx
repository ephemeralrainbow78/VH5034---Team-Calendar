import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LoginPage } from './pages/login.jsx' 
import { SignupPage } from './pages/signup.jsx'
import { CalendarPage } from './pages/calendar.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </Router>
  )
}

export default App
