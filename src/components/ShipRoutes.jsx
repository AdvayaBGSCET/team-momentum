import { useEffect, useState } from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-ant-path';
import { GLOBAL_SHIPPING_ROUTES, generateShipPositions } from '../services/prediction';

// Custom ship icon
const shipIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmNDNmNWUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMiAyMSBjMSAtOSAzIC0xNSAxMCAtMTUgYzcgMCA5IDYgMTAgMTUiLz48cGF0aCBkPSJNMTIgNiBWIDIiLz48cGF0aCBkPSJNMTIgMiBMIDggNiBMIDEyIDYgTCAxNiA2IFoiLz48L3N2Zz4=',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

export default function ShipRoutes({ showShips = true }) {
  const [ships, setShips] = useState([]);

  useEffect(() => {
    if (!showShips) return;

    // Update ship positions every 2 seconds
    const interval = setInterval(() => {
      const positions = generateShipPositions(GLOBAL_SHIPPING_ROUTES);
      setShips(positions);
    }, 2000);

    // Initial positions
    setShips(generateShipPositions(GLOBAL_SHIPPING_ROUTES));

    return () => clearInterval(interval);
  }, [showShips]);

  return (
    <>
      {/* Animated shipping routes */}
      {GLOBAL_SHIPPING_ROUTES.map(route => (
        <Polyline
          key={route.id}
          positions={[route.from, route.to]}
          pathOptions={{
            color: route.risk > 85 ? '#f43f5e' : route.risk > 70 ? '#f59e0b' : '#0ea5e9',
            weight: 2,
            opacity: 0.6,
            dashArray: '10, 20'
          }}
          className="animated-shipping-route"
        />
      ))}

      {/* Moving ships */}
      {showShips && ships.map(ship => (
        <Marker
          key={ship.id}
          position={[ship.lat, ship.lng]}
          icon={shipIcon}
        >
          <Popup>
            <div style={{ background: '#1e293b', color: 'white', padding: '10px', borderRadius: '8px', minWidth: '200px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#f43f5e' }}>🚢 Cargo Vessel</h4>
              <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                <strong>Route:</strong> {ship.fromPort} → {ship.toPort}
              </p>
              <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                <strong>Progress:</strong> {ship.progress}%
              </p>
              <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                <strong>Risk Score:</strong> {ship.risk}/100
              </p>
              <p style={{ margin: '8px 0 4px 0', fontSize: '0.75rem', color: '#f59e0b' }}>
                <strong>Potential Species:</strong>
              </p>
              <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '0.75rem' }}>
                {ship.species.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
