import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import Kontrollpanel from './kontrollpanel'
// import Dashboard from './kontrollpanel2'

function App() {
  console.log("App.jsx laster")

  return (
    <HelmetProvider>
      <Router>
        <Routes>
	  <Route path="*" element={<div>Ingen rute matchet</div>} />
          <Route path="/" element={<LandingPage />} />
//          <Route path="/kontrollpanel2" element={<Dashboard />} />
          <Route path="/kontrollpanel" element={<Kontrollpanel />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
