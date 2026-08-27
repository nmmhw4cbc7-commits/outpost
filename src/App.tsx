import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
  const { location, status, requestLocation } = useLocation()

  if (status === 'denied' || status === 'unavailable') {
    return <LocationPrompt onRetry={requestLocation} status={status} />
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/login" element={<LoginPage />} />
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
          <Route path="/passport" element={<PassportPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/spot/:id/review" element={<WriteReviewPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default function App() {
  return <AppContent />
}
