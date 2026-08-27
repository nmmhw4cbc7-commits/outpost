import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/Layout'
import { ExplorePage } from './pages/ExplorePage'
import { SpotDetailPage } from './pages/SpotDetailPage'
import { PassportPage } from './pages/PassportPage'
import { SavedPage } from './pages/SavedPage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { WriteReviewPage } from './pages/WriteReviewPage'
import { LocationPrompt } from './components/LocationPrompt'
import { useLocation } from './hooks/useLocation'

function AppContent() {
  const { user, loading: authLoading } = useAuth()
  const { location, status, requestLocation } = useLocation()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-matcha-200 border-t-matcha-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-matcha-600 font-serif text-lg">Loading Outpost...</p>
        </div>
      </div>
    )
  }

  if (status === 'denied' || status === 'unavailable') {
    return <LocationPrompt onRetry={requestLocation} status={status} />
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <ExplorePage
                location={location}
                locationLoading={status === 'loading'}
              />
            }
          />
          <Route path="/spot/:id" element={<SpotDetailPage />} />
          <Route
            path="/passport"
            element={
              user ? <PassportPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/saved"
            element={
              user ? <SavedPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/profile"
            element={
              user ? <ProfilePage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/spot/:id/review"
            element={
              user ? <WriteReviewPage /> : <Navigate to="/login" />
            }
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default function App() {
  return <AppContent />
}
