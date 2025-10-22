// App.jsx
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '@/LandingPage';
import Dashboard from '@/dashboard';
import Profile from '@/Profile';
import ForgotPassword from '@/ForgotPassword';
import ResetPassword from '@/ResetPassword';
import VerifyEmailPage from '@/VerifyEmailPage';
import ProtectedRoute from '@/components/ProtectedRoute';  // <-- legg til
import { Layout } from '@/components/Layout';
import { H1, H2 } from '@/components/Heading';
import TestRunner from '@/pages/TestRunner';
import TestPicker from '@/pages/TestPicker';
import ScoresPage from '@/pages/ScorePage';

import IpipNeo from '@/ipip_neo';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Layout>
        <Routes>

          <Route path="/"
                 element={<LandingPage />
                         }
          />

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
            element={
              <ForgotPassword />
            }
          />

          <Route
            path="/reset"
            element={
                <ResetPassword />

            }
          />

          <Route
            path="/verify-email"
            element={
                <VerifyEmailPage />
            }
          />

          <Route
            path="/ipip-neo"
            element={
              <ProtectedRoute>
                <IpipNeo />
              </ProtectedRoute>
            }

          />

          <Route
            path="/testrunner/:testId"
            element={
              <ProtectedRoute>
              <TestRunner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tests"
            element={
              <ProtectedRoute>
                <TestPicker />
              </ProtectedRoute>
            }
          />



          <Route
            path="/tests/:testId/scores"
            element={
              <ProtectedRoute>
                <ScoresPage />
              </ProtectedRoute>

            }
          />

          <Route
            path="*"
            element={<div>Ingen rute matchet</div>}
          />

        </Routes>
        </Layout>
      </Router>
    </HelmetProvider>
  )
}

export default App
