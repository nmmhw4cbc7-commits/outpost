import { useRef, useEffect, useCallback, memo } from 'react'
import {
  X,
  Coffee,
  BookOpen,
  Laptop,
  GraduationCap,
  Building2,
  MapPin,
  Navigation,
  Clock,
  Wifi,
  Volume2,
  Plug,
  Star,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { formatDistance, calculateDistance } from '../../lib/geo'
import type { Coordinates } from '../../lib/geo'
import type { OSMPlace } from '../../services/places'

interface SpotPreviewPanelProps {
  place: OSMPlace
  userLocation: Coordinates | null
  onClose: () => void
  onOpenFull: () => void
  loading?: boolean
}

const TYPE_GRADIENTS: Record<string, string> = {
  cafe: 'from-matcha-400 to-matcha-600',
  library: 'from-emerald-400 to-emerald-600',
  coworking_space: 'from-teal-400 to-teal-600',
  university: 'from-green-400 to-green-600',
  hotel: 'from-amber-400 to-amber-600',
  other: 'from-stone-400 to-stone-600'
}

const TYPE_LABELS: Record<string, string> = {
  cafe: 'Cafe',
  library: 'Library',
  coworking_space: 'Coworking',
  university: 'University',
  hotel: 'Hotel',
  other: 'Place'
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  cafe: <Coffee size={24} className="text-white" />,
  library: <BookOpen size={24} className="text-white" />,
  coworking_space: <Laptop size={24} className="text-white" />,
  university: <GraduationCap size={24} className="text-white" />,
  hotel: <Building2 size={24} className="text-white" />,
  other: <MapPin size={24} className="text-white" />
}

function SpotPreviewPanel({ place, userLocation, onClose, onOpenFull, loading }: SpotPreviewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)
  const currentTranslateY = useRef(0)
  const isDragging = useRef(false)

  const distance = userLocation
    ? calculateDistance(userLocation, { lat: place.lat, lng: place.lng })
    : null

  const gradient = TYPE_GRADIENTS[place.type] || TYPE_GRADIENTS.other
  const icon = TYPE_ICONS[place.type] || TYPE_ICONS.other

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true
    dragStartY.current = e.touches[0].clientY
    if (panelRef.current) {
      panelRef.current.style.transition = 'none'
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !panelRef.current) return
    const deltaY = e.touches[0].clientY - dragStartY.current
    const newY = Math.max(0, deltaY)
    currentTranslateY.current = newY
    panelRef.current.style.transform = `translateY(${newY}px)`
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !panelRef.current) return
    isDragging.current = false
    panelRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'

    if (currentTranslateY.current > 120) {
      onClose()
    } else {
      panelRef.current.style.transform = 'translateY(0)'
    }
    currentTranslateY.current = 0
  }, [onClose])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    requestAnimationFrame(() => {
      panel.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
      panel.style.transform = 'translateY(0)'
    })
  }, [])

  if (loading) {
    return (
      <div
        ref={panelRef}
        className="fixed bottom-16 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
        style={{ transform: 'translateY(100%)' }}
      >
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-matcha-500" size={28} />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={panelRef}
      className="fixed bottom-16 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] overflow-hidden"
      style={{ transform: 'translateY(100%)', maxHeight: '75vh' }}
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
      >
        <div className="w-10 h-1 rounded-full bg-beige-300" />
      </div>

      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        {icon}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"
        >
          <X size={16} className="text-white" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(75vh - 140px)' }}>
        <div>
          <h2 className="font-serif text-xl font-bold text-matcha-800">{place.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-beige-500 capitalize">{TYPE_LABELS[place.type] || place.type}</span>
            {distance !== null && (
              <>
                <span className="text-beige-300">|</span>
                <span className="text-sm text-beige-500 flex items-center gap-1">
                  <Navigation size={12} />
                  {formatDistance(distance)}
                </span>
              </>
            )}
          </div>
          {place.address && (
            <p className="text-sm text-beige-400 mt-1 flex items-center gap-1">
              <MapPin size={12} /> {place.address}
            </p>
          )}
        </div>

        {place.opening_hours && (
          <div className="flex items-center gap-2 text-sm text-beige-500">
            <Clock size={14} />
            <span>{place.opening_hours}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <QuickRating icon={<Wifi size={14} />} label="WiFi" />
          <QuickRating icon={<Volume2 size={14} />} label="Noise" />
          <QuickRating icon={<Plug size={14} />} label="Outlets" />
          <QuickRating icon={<Laptop size={14} />} label="Laptop" />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onOpenFull}
            className="flex-1 bg-matcha-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-matcha-700 transition-colors"
          >
            <Star size={18} />
            Full Details
          </button>
          <a
            href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=16/${place.lat}/${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-beige-100 text-matcha-700 px-5 py-3 rounded-xl font-medium hover:bg-beige-200 transition-colors"
          >
            <ExternalLink size={16} />
            Maps
          </a>
        </div>

        <p className="text-xs text-beige-400 text-center pb-2">
          Tap "Full Details" to check in, review, and see Larp Score
        </p>
      </div>
    </div>
  )
}

function QuickRating({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-beige-50 rounded-lg px-3 py-2">
      <div className="text-beige-400">{icon}</div>
      <span className="text-xs text-beige-500">{label}</span>
      <div className="flex gap-0.5 ml-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-beige-200" />
        ))}
      </div>
    </div>
  )
}

export default memo(SpotPreviewPanel)
