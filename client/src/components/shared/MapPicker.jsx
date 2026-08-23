import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/** Internal: listens for map clicks and calls onSelect with {lat, lng} */
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * MapPicker — click or drag marker to pick a lat/lng.
 *
 * Props:
 *   lat, lng     – current value (number | string | null)
 *   onChange     – called with { lat: number, lng: number }
 *   height       – CSS height string (default "300px")
 *   defaultCenter – [lat, lng] array — where to start if no value yet
 */
export default function MapPicker({
  lat,
  lng,
  onChange,
  height = '300px',
  defaultCenter = [20.5937, 78.9629], // centre of India
}) {
  const markerRef = useRef(null);

  const hasPin = lat != null && lng != null &&
    lat !== '' && lng !== '' &&
    !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));

  const center = hasPin
    ? [parseFloat(lat), parseFloat(lng)]
    : defaultCenter;

  function handleSelect({ lat: newLat, lng: newLng }) {
    onChange({
      lat: parseFloat(newLat.toFixed(7)),
      lng: parseFloat(newLng.toFixed(7)),
    });
  }

  function handleDragEnd() {
    const marker = markerRef.current;
    if (marker) {
      const { lat: newLat, lng: newLng } = marker.getLatLng();
      onChange({
        lat: parseFloat(newLat.toFixed(7)),
        lng: parseFloat(newLng.toFixed(7)),
      });
    }
  }

  return (
    <div className="space-y-2">
      <div
        className="rounded-xl overflow-hidden border border-gray-300 shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={hasPin ? 14 : 5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleSelect} />
          {hasPin && (
            <Marker
              position={[parseFloat(lat), parseFloat(lng)]}
              draggable
              ref={markerRef}
              eventHandlers={{ dragend: handleDragEnd }}
            />
          )}
        </MapContainer>
      </div>

      {/* Coordinate readout */}
      <div className="flex items-center gap-3 text-sm">
        {hasPin ? (
          <>
            <span className="text-gray-500">📍 Selected:</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono text-xs">
              {parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}
            </code>
            <button
              type="button"
              onClick={() => onChange({ lat: null, lng: null })}
              className="text-xs text-red-500 hover:underline ml-auto"
            >
              Clear pin
            </button>
          </>
        ) : (
          <span className="text-gray-400 text-xs">Click on the map to place a pin</span>
        )}
      </div>
    </div>
  );
}
