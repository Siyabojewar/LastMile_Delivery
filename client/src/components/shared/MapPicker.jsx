import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/** Forces Leaflet to recalculate container size after mount (fixes 0px-height tile issue) */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // Small delay lets the DOM finish painting before invalidateSize
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

/** Handles map clicks → calls onSelect({lat, lng}) */
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * MapPicker — click or drag marker to set a GPS location.
 *
 * Props:
 *   lat, lng       – current value (number | string | '' | null)
 *   onChange       – called with { lat: number, lng: number } or { lat: null, lng: null }
 *   height         – CSS height for the map (default "280px")
 *   defaultCenter  – [lat, lng] to start at when no pin is set (default: centre of India)
 */
export default function MapPicker({
  lat,
  lng,
  onChange,
  height = '280px',
  defaultCenter = [20.5937, 78.9629],
}) {
  const markerRef = useRef(null);

  const hasPin =
    lat != null && lng != null &&
    lat !== '' && lng !== '' &&
    !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));

  const pinLat = hasPin ? parseFloat(lat) : null;
  const pinLng = hasPin ? parseFloat(lng) : null;
  const center = hasPin ? [pinLat, pinLng] : defaultCenter;

  function emit(newLat, newLng) {
    onChange({
      lat: parseFloat(newLat.toFixed(7)),
      lng: parseFloat(newLng.toFixed(7)),
    });
  }

  function handleDragEnd() {
    const m = markerRef.current;
    if (m) {
      const ll = m.getLatLng();
      emit(ll.lat, ll.lng);
    }
  }

  return (
    <div className="space-y-2">
      {/* Map wrapper — explicit height prevents the 0px Leaflet trap */}
      <div
        className="rounded-xl overflow-hidden border border-gray-300 shadow-sm"
        style={{ height, minHeight: height, position: 'relative' }}
      >
        {/* key={String(hasPin)} re-mounts only when pin state changes from absent→present */}
        <MapContainer
          key={`map-${defaultCenter[0]}-${defaultCenter[1]}`}
          center={center}
          zoom={hasPin ? 14 : 5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapResizer />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={({ lat: la, lng: lo }) => emit(la, lo)} />
          {hasPin && (
            <Marker
              position={[pinLat, pinLng]}
              draggable
              ref={markerRef}
              eventHandlers={{ dragend: handleDragEnd }}
            />
          )}
        </MapContainer>
      </div>

      {/* Coordinate readout / instructions */}
      <div className="flex items-center gap-3 min-h-[24px]">
        {hasPin ? (
          <>
            <span className="text-gray-500 text-sm">📍 Selected:</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono text-xs">
              {pinLat.toFixed(6)}, {pinLng.toFixed(6)}
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
          <span className="text-gray-400 text-xs">Click anywhere on the map to place a pin, then drag to fine-tune</span>
        )}
      </div>
    </div>
  );
}
