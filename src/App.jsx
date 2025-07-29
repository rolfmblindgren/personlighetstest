import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import Kontrollpanel from './Kontrollpanel'

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/kontrollpanel" element={<Kontrollpanel />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
