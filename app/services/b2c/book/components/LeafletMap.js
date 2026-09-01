"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icon references image paths that don't resolve
// correctly through a bundler — point them at the CDN copies instead of
// wiring up asset imports for three small PNGs.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickCapture({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function LeafletMap({ center, marker, onPick }) {
  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCapture onPick={onPick} />
      {marker && <Marker position={marker} icon={markerIcon} />}
      <RecenterOnMarker marker={marker} />
    </MapContainer>
  );
}

// Keeps the view centered on the marker whenever it's set programmatically
// (e.g. via the "use current location" button) instead of only reacting to
// user clicks.
function RecenterOnMarker({ marker }) {
  const map = useMap();
  useEffect(() => {
    if (marker) map.setView(marker, map.getZoom());
  }, [marker, map]);
  return null;
}
