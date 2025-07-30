import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
// import Kontrollpanel from './Kontrollpanel'
import Dashboard from './Kontrollpanel2.tsx'

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/kontrollpanel2" element={<Kontrollpanel />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
