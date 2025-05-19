
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const truckIcon = new L.DivIcon({
  html: `<div style="font-size: 24px; color: #1E90FF;">🚚</div>`,
  className: 'truck-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});


const RoutingMachine = ({ waypoints, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    const cleanupRoutingControl = () => {
      if (routingControlRef.current && map) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          console.warn("Error removing routing control, map might already be gone:", e);
        }
        routingControlRef.current = null;
      }
    };

    if (!map) {
      return cleanupRoutingControl;
    }

    if (!waypoints || waypoints.length < 2) {
      cleanupRoutingControl();
      return;
    }
    
    const validWaypoints = waypoints.filter(wp => wp && typeof wp.lat === 'number' && typeof wp.lng === 'number');
    if (validWaypoints.length < 2) {
      cleanupRoutingControl();
      return;
    }

    cleanupRoutingControl(); 

    const leafletWaypoints = validWaypoints.map(wp => L.latLng(wp.lat, wp.lng));

    routingControlRef.current = L.Routing.control({
      waypoints: leafletWaypoints,
      routeWhileDragging: true,
      show: false, 
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#62A7FC', opacity: 0.8, weight: 6 }]
      },
      createMarker: () => null 
    });
    
    routingControlRef.current.addTo(map);
    
    routingControlRef.current.on('routesfound', function(e) {
      const routes = e.routes;
      if (routes.length > 0) {
        const summary = routes[0].summary;
        if(onRouteFound) {
          onRouteFound({
            distance: (summary.totalDistance / 1000).toFixed(2), 
            time: (summary.totalTime / 60).toFixed(0) 
          });
        }
      }
    });
    
    return cleanupRoutingControl;
  }, [map, waypoints, onRouteFound]);

  return null;
};


const MapEvents = ({ onClick }) => {
  const map = useMap();
  useEffect(() => {
    if (onClick) {
      map.on('click', onClick);
    }
    return () => {
      if (onClick) {
        map.off('click', onClick);
      }
    };
  }, [map, onClick]);
  return null;
};

const RecenterAutomatically = ({center, zoom, isInteractive}) => {
  const map = useMap();
   useEffect(() => {
    if (center && !isInteractive) { 
      map.setView(center, zoom || map.getZoom());
    } else if (center && isInteractive && map.getCenter() && !map.getCenter().equals(L.latLng(center[0], center[1]))) {
      // For interactive maps, only recenter if the center prop changes significantly
      // This condition might need adjustment based on desired behavior
    }
  }, [center, zoom, map, isInteractive]);
  return null;
};


const MapDisplay = ({ 
  pickupCoords, 
  deliveryCoords, 
  driverLocation, 
  onMapClick, 
  isInteractive = true, 
  showRoute = false,
  onRouteFound,
  mapHeight = '400px',
  mapKey // This key forces re-mount of MapContainer when it changes
}) => {
  const defaultCenter = [4.60971, -74.08175]; // Bogotá
  let currentCenter = defaultCenter;
  let currentZoom = 6;

  if (pickupCoords && typeof pickupCoords.lat === 'number' && typeof pickupCoords.lng === 'number') {
    currentCenter = [pickupCoords.lat, pickupCoords.lng];
    currentZoom = 13;
  }
  if (driverLocation && typeof driverLocation.lat === 'number' && typeof driverLocation.lng === 'number') {
     currentCenter = [driverLocation.lat, driverLocation.lng];
     currentZoom = 13;
  }


  return (
    <div style={{ height: mapHeight, borderRadius: 'var(--radius)', overflow: 'hidden' }} className="shadow-lg">
      <MapContainer key={mapKey} center={currentCenter} zoom={currentZoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {isInteractive && onMapClick && <MapEvents onClick={onMapClick} />}
        
        {pickupCoords && typeof pickupCoords.lat === 'number' && typeof pickupCoords.lng === 'number' && (
          <Marker position={[pickupCoords.lat, pickupCoords.lng]}>
            <Popup>Punto de Recogida</Popup>
          </Marker>
        )}
        {deliveryCoords && typeof deliveryCoords.lat === 'number' && typeof deliveryCoords.lng === 'number' && (
          <Marker position={[deliveryCoords.lat, deliveryCoords.lng]}>
            <Popup>Punto de Entrega</Popup>
          </Marker>
        )}
        {driverLocation && typeof driverLocation.lat === 'number' && typeof driverLocation.lng === 'number' && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={truckIcon}>
            <Popup>Ubicación del Conductor</Popup>
          </Marker>
        )}
        
        {showRoute && pickupCoords && deliveryCoords && (
          <RoutingMachine 
            waypoints={[pickupCoords, deliveryCoords]} 
            onRouteFound={onRouteFound} 
          />
        )}
        <RecenterAutomatically center={currentCenter} zoom={currentZoom} isInteractive={isInteractive} />
      </MapContainer>
    </div>
  );
};

export default MapDisplay;
  