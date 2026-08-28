import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordinates } from '../../lib/geo'
import type { OSMPlace } from '../../services/places'

interface MapViewProps {
  center: Coordinates
  places: OSMPlace[]
  selectedPlaceId: number | null
  onPlaceSelect: (id: number) => void
  onPlaceNavigate?: (place: OSMPlace) => void
  loading?: boolean
}

const TYPE_COLORS: Record<string, string> = {
  cafe: '#6a9e82',
  library: '#4d7d64',
  coworking_space: '#2d4a3e',
  university: '#3d6450',
  hotel: '#8a6419',
  other: '#7d6a54'
}

const TYPE_SVG_ICONS: Record<string, string> = {
  cafe: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>',
  library: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
  coworking_space: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>',
  university: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  hotel: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/><path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"/><path d="M8 7h.01"/><path d="M16 7h.01"/></svg>',
  other: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'
}

function createPlaceIcon(place: OSMPlace, isSelected: boolean) {
  const color = TYPE_COLORS[place.type] || '#7d6a54'
  const svg = TYPE_SVG_ICONS[place.type] || TYPE_SVG_ICONS.other
  const size = isSelected ? 44 : 36

  return L.divIcon({
    className: 'place-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        cursor: pointer;
      ">${svg}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #4d7d64;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(77, 125, 100, 0.2), 0 2px 8px rgba(0,0,0,0.2);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(77, 125, 100, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(77, 125, 100, 0); }
        100% { box-shadow: 0 0 0 0 rgba(77, 125, 100, 0); }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
})

export function MapView({
  center,
  places,
  selectedPlaceId,
  onPlaceSelect,
  onPlaceNavigate,
  loading
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)
  const navigateRef = useRef(onPlaceNavigate)
  navigateRef.current = onPlaceNavigate

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
    }

    const marker = L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(map)
    userMarkerRef.current = marker
  }, [center])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    markersRef.current.forEach((m) => map.removeLayer(m))
    markersRef.current = []

    places.forEach((place) => {
      const isSelected = place.id === selectedPlaceId
      const marker = L.marker([place.lat, place.lng], {
        icon: createPlaceIcon(place, isSelected)
      })
        .addTo(map)

      marker.on('click', () => {
        onPlaceSelect(place.id)
      })

      markersRef.current.push(marker)
    })

    if (places.length > 0 && !selectedPlaceId) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }, [places, selectedPlaceId, onPlaceSelect])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedPlaceId) return

    const place = places.find((p) => p.id === selectedPlaceId)
    if (place) {
      map.flyTo([place.lat, place.lng], 16, { duration: 0.5 })
    }
  }, [selectedPlaceId, places])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    map.setView([center.lat, center.lng], map.getZoom())
  }, [center])

  return (
    <div
      ref={mapRef}
      className={`w-full h-full ${loading ? 'opacity-50' : ''}`}
    />
  )
}
