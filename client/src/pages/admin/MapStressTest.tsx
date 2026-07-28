import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const createCustomMarker = () => {
  return L.divIcon({
    className: 'bg-transparent border-none overflow-visible',
    html: `<div style="width:10px;height:10px;background:red;border-radius:50%;"></div>`,
    iconSize: [10, 10],
  });
};

const mapCenter: [number, number] = [14.5995, 120.9842]; // Manila default

export default function MapStressTest() {
  const [numMarkers, setNumMarkers] = useState(100);
  const [fps, setFps] = useState(60);
  const [runners, setRunners] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // FPS Counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const calculateFPS = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(calculateFPS);
    };

    calculateFPS();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Generate Dummy Runners
  const generateRunners = (count: number) => {
    const newRunners = Array.from({ length: count }).map((_, i) => ({
      id: `runner_${i}`,
      position: [
        mapCenter[0] + (Math.random() - 0.5) * 0.05,
        mapCenter[1] + (Math.random() - 0.5) * 0.05,
      ] as [number, number],
      path: [] as [number, number][],
    }));
    setRunners(newRunners);
  };

  // Simulate Telemetry Movement
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRunners((prev) =>
        prev.map((r) => {
          const newPos = [
            r.position[0] + (Math.random() - 0.5) * 0.0005,
            r.position[1] + (Math.random() - 0.5) * 0.0005,
          ] as [number, number];
          const newPath = [...r.path, newPos].slice(-20);
          return { ...r, position: newPos, path: newPath };
        }),
      );
    }, 1000); // Update every 1 second (simulated GPS burst)

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Frontend Map Stress Test (Leaflet Max Overload)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <Button
              variant={numMarkers === 100 ? 'default' : 'outline'}
              onClick={() => setNumMarkers(100)}
            >
              100 Markers
            </Button>
            <Button
              variant={numMarkers === 500 ? 'default' : 'outline'}
              onClick={() => setNumMarkers(500)}
            >
              500 Markers
            </Button>
            <Button
              variant={numMarkers === 1000 ? 'default' : 'outline'}
              onClick={() => setNumMarkers(1000)}
            >
              1,000 Markers
            </Button>
            <Button
              variant={numMarkers === 2000 ? 'default' : 'outline'}
              onClick={() => setNumMarkers(2000)}
            >
              2,000 Markers
            </Button>
            <Button
              variant={numMarkers === 5000 ? 'default' : 'outline'}
              onClick={() => setNumMarkers(5000)}
            >
              5,000 Markers
            </Button>
          </div>

          <div className="flex gap-4 items-center p-4 border rounded-lg bg-muted">
            <Button
              onClick={() => generateRunners(numMarkers)}
              disabled={isRunning}
            >
              1. Spawn {numMarkers} Runners
            </Button>
            <Button
              variant={isRunning ? 'destructive' : 'default'}
              onClick={() => setIsRunning(!isRunning)}
              disabled={runners.length === 0}
            >
              {isRunning ? 'Stop Simulation' : '2. Start 1-sec GPS Updates'}
            </Button>

            <div className="ml-auto font-mono text-lg flex items-center gap-2">
              FPS:{' '}
              <span
                className={
                  fps < 30
                    ? 'text-red-500 font-bold'
                    : 'text-green-500 font-bold'
                }
              >
                {fps}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Instruction: Click spawn, then start. If the FPS drops below 30 or
            the browser freezes, you have found the overload limit for the
            DOM-based Leaflet markers.
          </p>

          <div className="w-full h-[600px] border rounded-lg relative overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={13}
              className="w-full h-full z-0"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {runners.map((r) => (
                <React.Fragment key={r.id}>
                  <Marker position={r.position} icon={createCustomMarker()} />
                  {r.path.length > 1 && (
                    <Polyline
                      positions={r.path}
                      color="blue"
                      weight={2}
                      opacity={0.5}
                    />
                  )}
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
