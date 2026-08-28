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
import { useLocation } from './hooks/useLocation'

function AppContent() {
  const { location, status } = useLocation()

  const effectiveLocation = location || { lat: 52.52, lng: 13.405 }

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
                location={effectiveLocation}
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
