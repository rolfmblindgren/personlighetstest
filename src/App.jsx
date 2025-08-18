// App.jsx
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import Dashboard from './dashboard'
import Profile from './Profile'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'  // <-- legg til
import { H1 } from './components/Heading'

function App() {
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

          <Route
            path="/forgot"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset"
            element={<ResetPassword />}
          />
          
          <Route
            path="*"
            element={<div>Ingen rute matchet</div>}
          />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
