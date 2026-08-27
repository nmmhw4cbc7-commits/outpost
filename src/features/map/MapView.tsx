import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordinates } from '../../lib/geo'
import type { Spot } from '../../types'

interface MapViewProps {
  center: Coordinates
  spots: Spot[]
  selectedSpotId: string | null
  onSpotSelect: (id: string) => void
  loading?: boolean
}

const createSpotIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${isSelected ? 40 : 32}px;
        height: ${isSelected ? 40 : 32}px;
        background: ${isSelected ? '#2d4a3e' : '#4d7d64'};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
    iconAnchor: [isSelected ? 20 : 16, isSelected ? 40 : 32]
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
    ">
      <div style="
        width: 100%;
        height: 100%;
        background: #4d7d64;
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
    </div>
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
  spots,
  selectedSpotId,
  onSpotSelect,
  loading
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

    markersRef.current.forEach((marker) => map.removeLayer(marker))
    markersRef.current = []

    spots.forEach((spot) => {
      const isSelected = spot.id === selectedSpotId
      const marker = L.marker([spot.latitude, spot.longitude], {
        icon: createSpotIcon(isSelected)
      })
        .addTo(map)
        .on('click', () => onSpotSelect(spot.id))

      markersRef.current.push(marker)
    })

    if (spots.length > 0 && !selectedSpotId) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }, [spots, selectedSpotId, onSpotSelect])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedSpotId) return

    const spot = spots.find((s) => s.id === selectedSpotId)
    if (spot) {
      map.flyTo([spot.latitude, spot.longitude], 16, { duration: 0.5 })
    }
  }, [selectedSpotId, spots])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    map.setView([center.lat, center.lng], 14)
  }, [center])

  return (
    <div
      ref={mapRef}
      className={`w-full h-full ${loading ? 'opacity-50' : ''}`}
    />
  )
}
