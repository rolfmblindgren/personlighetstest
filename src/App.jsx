// App.jsx
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import Dashboard from './dashboard'
import ProtectedRoute from './components/ProtectedRoute'  // <-- legg til

function App() {
  console.log("App.jsx laster")

  return (
    <HelmetProvider>
      <Router>
        <Routes>

          <Route path="/" element={<LandingPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

	  <Route
	    path="/profile"
	    element={
	      <ProtectedRoute>
		<Profile />
	      </ProtectedRoute>
	    }
	  />
	  
          <Route path="*" element={<div>Ingen rute matchet</div>} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
