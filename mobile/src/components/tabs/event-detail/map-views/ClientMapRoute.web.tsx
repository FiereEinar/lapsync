import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
let MapContainer: any,
  TileLayer: any,
  Marker: any,
  Polyline: any,
  Popup: any,
  useMap: any,
  L: any;

if (typeof window !== "undefined") {
  const ReactLeaflet = require("react-leaflet");
  MapContainer = ReactLeaflet.MapContainer;
  TileLayer = ReactLeaflet.TileLayer;
  Marker = ReactLeaflet.Marker;
  Polyline = ReactLeaflet.Polyline;
  Popup = ReactLeaflet.Popup;
  useMap = ReactLeaflet.useMap;
  L = require("leaflet");
  require("leaflet/dist/leaflet.css");

  // Fix for default marker icons in Leaflet with webpack
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
}

const getPinIcon = (type: string, index?: number) => {
  if (typeof L === "undefined") return null;
  const color =
    type === "start"
      ? "#10b981"
      : type === "finish"
        ? "#ef4444"
        : type === "waypoint"
          ? "#94a3b8"
          : "#3b82f6";

  const indexText =
    index !== undefined
      ? `<text x="12" y="14" font-family="sans-serif" font-size="10" font-weight="bold" fill="${color}" text-anchor="middle">${index}</text>`
      : `<circle cx="12" cy="10" r="3" fill="white" stroke="none" />`;

  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); width: 24px; height: 36px; position: absolute; left: 12px; top: 36px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        ${
          index !== undefined
            ? `<circle cx="12" cy="10" r="7" fill="white" stroke="none" />`
            : ""
        }
        ${indexText}
      </svg>
    </div>
  `;
  return L.divIcon({
    className: "bg-transparent border-none overflow-visible",
    html,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
  });
};

function BoundsUpdater({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords && coords.length > 1) {
      map.fitBounds(coords, { padding: [50, 50] });
    }
  }, [map, coords]);
  return null;
}

export function ClientMapRoute({
  sortedCheckpoints,
}: {
  sortedCheckpoints: any[];
}) {
  const center = useMemo(() => {
    if (!sortedCheckpoints || sortedCheckpoints.length === 0) {
      return { lat: 10.3157, lng: 123.8854 }; // Default center
    }
    return {
      lat: sortedCheckpoints[0].location.lat,
      lng: sortedCheckpoints[0].location.lng,
    };
  }, [sortedCheckpoints]);

  if (typeof window === "undefined" || !MapContainer) {
    return null;
  }

  const routeCoordinates = useMemo(() => {
    return sortedCheckpoints.map(
      (cp) => [cp.location.lat, cp.location.lng] as [number, number],
    );
  }, [sortedCheckpoints]);

  return (
    <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 0 }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <BoundsUpdater coords={routeCoordinates} />
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {sortedCheckpoints.map((cp, idx) => (
          <Marker
            key={cp._id || idx}
            position={[cp.location.lat, cp.location.lng]}
            icon={getPinIcon(
              cp.type,
              cp.type !== "waypoint" ? idx + 1 : undefined,
            )}
          >
            <Popup>
              {idx + 1}. {cp.name}
              <br />
              {cp.type}
            </Popup>
          </Marker>
        ))}

        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color='hsl(217, 91%, 60%)'
            weight={4}
          />
        )}
      </MapContainer>
    </View>
  );
}
