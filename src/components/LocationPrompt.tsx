import { MapPin, RefreshCw } from 'lucide-react'
import type { LocationStatus } from '../hooks/useLocation'

interface LocationPromptProps {
  onRetry: () => void
  status: LocationStatus
}

export function LocationPrompt({ onRetry, status }: LocationPromptProps) {
  return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 rounded-full bg-matcha-100 flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 text-matcha-600" />
        </div>

        <h1 className="font-serif text-3xl font-bold text-matcha-800 mb-3">
          Outpost
        </h1>

        <p className="text-beige-600 mb-2">
          Find your next Larp spot.
        </p>

        <p className="text-sm text-beige-500 mb-8">
          Outpost needs your location to discover Larp Spots nearby.
          Your location is only used to find spots and verify check-ins.
        </p>

        {status === 'denied' && (
          <div className="bg-gold-50 border border-gold-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gold-800">
              Location access was denied. Please enable location permissions in your browser settings to use Outpost.
            </p>
          </div>
        )}

        {status === 'unavailable' && (
          <div className="bg-gold-50 border border-gold-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gold-800">
              Location services are unavailable on this device. Outpost requires location to function properly.
            </p>
          </div>
        )}

        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-matcha-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-matcha-700 transition-colors"
        >
          <RefreshCw size={18} />
          Try Again
        </button>

        <p className="text-xs text-beige-400 mt-6">
          You can still browse the app, but spots and check-ins require location access.
        </p>
      </div>
    </div>
  )
}
