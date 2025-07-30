import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import Dashboard from './dashboard'

function App() {
  console.log("App.jsx laster")

  return (
    <HelmetProvider>
      <Router>
        <Routes>
	  <Route path="*" element={<div>Ingen rute matchet</div>} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
