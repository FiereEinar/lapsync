import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

interface RoutingMachineProps {
  waypoints: [number, number][];
  onRouteFound?: (distance: number) => void;
}

export default function RoutingMachine({ waypoints, onRouteFound }: RoutingMachineProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: waypoints.map((wp) => L.latLng(wp[0], wp[1])),
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: {
        styles: [{ color: "#3b82f6", weight: 4, opacity: 0.7 }],
        extendToWaypoints: true,
        missingRouteTolerance: 10,
      },
      show: false, // Hide the text itinerary
      addWaypoints: false, // Prevent adding waypoints by dragging the line
      routeWhileDragging: false,
      fitSelectedRoutes: false,
      showAlternatives: false,
      // @ts-ignore - The types for leaflet-routing-machine are incomplete
      createMarker: () => null, // We handle our own markers
    }).addTo(map);

    routingControl.on('routesfound', function(e: any) {
      if (e.routes && e.routes.length > 0 && onRouteFound) {
        onRouteFound(e.routes[0].summary.totalDistance);
      }
    });

    // Hide the routing control container from DOM as well to be completely invisible
    if (routingControl.getContainer()) {
       routingControl.getContainer()!.style.display = 'none';
    }

    return () => {
      try {
        if (map && routingControl) {
          map.removeControl(routingControl);
        }
      } catch (e) {
        console.error("Error cleaning up routing control", e);
      }
    };
  }, [map, waypoints]);

  return null;
}
