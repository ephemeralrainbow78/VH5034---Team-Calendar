import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LoginPage } from './pages/login.jsx' 
import { SignupPage } from './pages/signup.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  )
}

export default App
