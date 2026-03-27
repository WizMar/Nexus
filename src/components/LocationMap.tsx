import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon broken by webpack/vite
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

type Props = {
  lat: number
  lng: number
  label?: string
}

export default function LocationMap({ lat, lng, label }: Props) {
  return (
    <div className="rounded-lg overflow-hidden border border-stone-700" style={{ height: 200 }}>
      <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <Marker position={[lat, lng]} icon={icon}>
          {label && <Popup>{label}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  )
}
