// App.jsx
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '@/LandingPage';
import Dashboard from '@/pages/Dashboard';
import ForgotPassword from '@/ForgotPassword';
import ResetPassword from '@/ResetPassword';
import VerifyEmailPage from '@/VerifyEmailPage';
import ProtectedRoute from '@/components/ProtectedRoute';  // <-- legg til
import { Layout } from '@/components/Layout';
import { H1, H2 } from '@/components/Heading';
import TestRunner from '@/pages/TestRunner';
import TestSetup from '@/pages/TestSetup';
import TestPicker from '@/pages/TestPicker';
import ScoresPage from '@/pages/ScorePage';
import Profile from '@/pages/Profile';
import TestsOverview from '@/pages/TestOverviews';
import InviteTestsPage from '@/pages/InviteTestsPage';
import PublicInvitePage from '@/pages/PublicInvitePage';
import DonationPage from "@/pages/DonationPage";
import GDPR from "@/pages/GDPR";
import CHANGELOG from "@/pages/ChangeLog";
import IpipNeo from '@/ipip_neo';
import MaintenancePage from '@/pages/MaintenancePage';
import {
  MAINTENANCE_EVENT,
  captureMaintenanceBypassFromUrl,
  fetchMaintenanceState,
  getEnvMaintenanceState,
} from '@/lib/maintenance';

function App() {
  const [maintenance, setMaintenance] = useState(
    () => {
      captureMaintenanceBypassFromUrl();
      return getEnvMaintenanceState() || { active: false };
    }
  );

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const next = await fetchMaintenanceState();
      if (!cancelled) setMaintenance(next);
    };

    refresh();
    const intervalId = window.setInterval(refresh, 60000);

    const handleMaintenance = (event) => {
      setMaintenance(event.detail || { active: false });
    };

    window.addEventListener(MAINTENANCE_EVENT, handleMaintenance);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener(MAINTENANCE_EVENT, handleMaintenance);
    };
  }, []);

  const retryMaintenanceCheck = async () => {
    const next = await fetchMaintenanceState();
    setMaintenance(next);
    if (!next.active) window.location.reload();
  };

  return (
    <HelmetProvider>
      {maintenance.active ? (
        <MaintenancePage state={maintenance} onRetry={retryMaintenanceCheck} />
      ) : (
      <Router>
        <Layout>
        <Routes>

          <Route path="/"
                 element={<LandingPage />
                         }
          />

          <Route path="/test/:testId/donate" element={<DonationPage />} />
          <Route path="/test/:testId/results" element={<ScoresPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invites"
            element={
              <ProtectedRoute>
                <InviteTestsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/testsOverview"
                 element={
                   <ProtectedRoute>
                     <TestsOverview />
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
            path="/invite"
            element={<PublicInvitePage />}
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
            path="/testsetup/:testId"
            element={
              <ProtectedRoute>
              <TestSetup />
              </ProtectedRoute>
            }
          />

          <Route
            path="/testsetup/:testId"
            element={
              <ProtectedRoute>
                <TestSetup />
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
            path="/GDPR"
            element={<GDPR
                     />
                    }
          />

          <Route
            path="/CHANGELOG"
            element={<CHANGELOG
                     />
                    }
          />

          <Route
            path="*"
            element={<div>Ingen rute matchet</div>}
          />


        </Routes>
        </Layout>
      </Router>
      )}
    </HelmetProvider>
  )
}

export default App
