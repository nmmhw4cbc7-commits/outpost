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
  restaurant: '#d4a028',
  university: '#3d6450',
  hotel: '#8a6419',
  bakery: '#b39d7d',
  other: '#7d6a54'
}

const TYPE_ICONS: Record<string, string> = {
  cafe: '☕',
  library: '📚',
  coworking_space: '💻',
  restaurant: '🍽️',
  university: '🎓',
  hotel: '🏨',
  bakery: '🥐',
  other: '📍'
}

function createPlaceIcon(place: OSMPlace, isSelected: boolean) {
  const color = TYPE_COLORS[place.type] || '#7d6a54'
  const emoji = TYPE_ICONS[place.type] || '📍'
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
        font-size: ${isSelected ? 18 : 14}px;
        transition: all 0.2s ease;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        cursor: pointer;
      ">${emoji}</div>
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
  const popupsRef = useRef<L.Popup[]>([])

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
    popupsRef.current.forEach((p) => map.removeLayer(p))
    markersRef.current = []
    popupsRef.current = []

    places.forEach((place) => {
      const isSelected = place.id === selectedPlaceId
      const marker = L.marker([place.lat, place.lng], {
        icon: createPlaceIcon(place, isSelected)
      })
        .addTo(map)

      const popupContent = `
        <div style="min-width: 160px; font-family: Inter, sans-serif;">
          <div style="font-weight: 600; font-size: 13px; color: #1f3329; margin-bottom: 4px;">
            ${place.name}
          </div>
          <div style="font-size: 11px; color: #7d6a54; text-transform: capitalize;">
            ${place.type.replace('_', ' ')}
          </div>
          ${place.address ? `<div style="font-size: 11px; color: #9a8468; margin-top: 2px;">${place.address}</div>` : ''}
          ${place.opening_hours ? `<div style="font-size: 10px; color: #b39d7d; margin-top: 4px;">⏰ ${place.opening_hours}</div>` : ''}
          ${onPlaceNavigate ? `<button onclick="window.__placeNavigate=${place.id}" style="margin-top: 6px; background: #6a9e82; color: white; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11px; cursor: pointer; width: 100%;">View Details</button>` : ''}
        </div>
      `

      const popup = L.popup({
        closeButton: false,
        className: 'place-popup',
        offset: [0, -10]
      })
        .setLatLng([place.lat, place.lng])
        .setContent(popupContent)

      marker.on('click', () => {
        onPlaceSelect(place.id)
        popup.openOn(map)
      })

      markersRef.current.push(marker)
      popupsRef.current.push(popup)
    })

    if (places.length > 0 && !selectedPlaceId) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }, [places, selectedPlaceId, onPlaceSelect, onPlaceNavigate])

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
