import { useEffect, useRef, useState } from "react";
import { getSocket, disconnectSocket } from "@/services/socket";
import { RaceStatsCards } from "@/components/RaceStatsCards.tsx";
import { RaceProgress } from "@/components/RaceProgress.tsx";
import { BioSignalMonitor } from "@/components/BioSignalMonitor.tsx";
import { LiveMap } from "@/components/LiveMap.tsx";
import { CheckpointList } from "@/components/CheckpointList.tsx";
import { useParams, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { QUERY_KEYS } from "@/constants";
import { useUserStore } from "@/stores/user";
import { Registration } from "@/types/registration";
import { Activity } from "lucide-react";

type Checkpoint = {
  name: string;
  status: "completed" | "approaching" | "pending";
  time: string;
};

const MAX_HISTORY = 50;

function getTimeLabel() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function RaceParticipation() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore((state) => state);

  // Fetch user's registrations to power the select dropdown
  const { data: userRegistrations = [] } = useQuery({
    queryKey: [QUERY_KEYS.REGISTRATIONS, user?._id],
    queryFn: async (): Promise<Registration[]> => {
      const { data } = await axiosInstance.get(`/registration`, {
        params: { user: user?._id },
      });
      return Array.isArray(data.data) ? data.data : [];
    },
    enabled: !!user?._id,
  });

  // Since it's a live race, let's allow selecting any registration (especially confirmed/active ones)
  // For safety, we'll list all of them incase testing requires checking past events.
  const selectOptions = userRegistrations;

  // If no registrationid is in URL, see if we should auto-select the first one or just show empty state
  useEffect(() => {
    if (!registrationId && selectOptions.length > 0) {
      // Opt: automatically navigate to the first available registration if none is selected
      // navigate(`/client/race/${selectOptions[0]._id}`, { replace: true });
    }
  }, [registrationId, selectOptions, navigate]);

  const [raceData, setRaceData] = useState({
    currentPosition: "-",
    timeElapsed: "-",
    pace: "-",
    heartRate: 0,
    heartRateZone: "-",
    distance: 0,
    totalDistance: 42.2,
    nextCheckpoint: "-",
    distanceToCheckpoint: "-",
    estimatedTime: "-",
    emg: "Normal",
    warning: null as string | null,
    checkpoints: [] as Checkpoint[],
  });

  const heartRateHistoryRef = useRef<{ time: string; value: number }[]>([]);
  const emgHistoryRef = useRef<{ time: string; value: number }[]>([]);
  const [heartRateHistory, setHeartRateHistory] = useState<
    { time: string; value: number }[]
  >([]);
  const [emgHistory, setEmgHistory] = useState<
    { time: string; value: number }[]
  >([]);

  useEffect(() => {
    if (!registrationId) return;

    const socket = getSocket("race");
    console.log("Joining race room for registration:", registrationId);

    socket.emit("joinRace", { registrationId });

    socket.on("positionUpdate", (data) =>
      setRaceData((prev) => ({ ...prev, currentPosition: data.position })),
    );
    socket.on("timeUpdate", (data) =>
      setRaceData((prev) => ({
        ...prev,
        timeElapsed: data.timeElapsed,
        pace: data.pace,
      })),
    );
    socket.on("heartRateUpdate", (data) => {
      setRaceData((prev) => ({
        ...prev,
        heartRate: data.heartRate,
        heartRateZone: data.heartRateZone,
      }));
      const entry = { time: getTimeLabel(), value: data.heartRate };
      heartRateHistoryRef.current = [
        ...heartRateHistoryRef.current,
        entry,
      ].slice(-MAX_HISTORY);
      setHeartRateHistory([...heartRateHistoryRef.current]);
    });
    socket.on("emgUpdate", (data) => {
      setRaceData((prev) => ({
        ...prev,
        emg: data.emg,
      }));
      const numericValue = parseFloat(data.emg) || 0;
      const entry = { time: getTimeLabel(), value: numericValue };
      emgHistoryRef.current = [
        ...emgHistoryRef.current,
        entry,
      ].slice(-MAX_HISTORY);
      setEmgHistory([...emgHistoryRef.current]);
    });
    socket.on("checkpointUpdate", (data) =>
      setRaceData((prev) => ({
        ...prev,
        nextCheckpoint: data.nextCheckpoint,
        distanceToCheckpoint: data.distanceToCheckpoint,
        estimatedTime: data.estimatedTime,
        checkpoints: data.checkpoints,
        distance: data.distance,
      })),
    );

    return () => {
      socket.emit("leaveRace", { registrationId });
      disconnectSocket("race");
    };
  }, [registrationId]);

  return (
    <div className='space-y-6 animate-appear'>
      {/* Modernized Hero Section with Live Race Selector */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-primary/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
          <div>
            <p className='text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5'>
              <span className='w-2 h-2 rounded-full bg-amber-500 animate-pulse'></span>
              Live Broadcast
            </p>
            <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>Live Race View</h1>
            <p className='text-muted-foreground mt-1.5 text-sm flex items-center gap-2'>
              Monitor your real-time performance, location, and vitals
            </p>
          </div>

          <div className='w-full md:w-auto'>
            <Select 
              value={registrationId || ""} 
              onValueChange={(id) => navigate(`/client/race/${id}`)}
            >
              <SelectTrigger className='w-full md:w-[320px] rounded-xl bg-background/50 backdrop-blur-sm'>
                <SelectValue placeholder='Select a registered event' />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map((reg) => (
                  <SelectItem key={reg._id} value={reg._id}>
                    {reg.event?.name} {reg.raceCategory ? `(${reg.raceCategory.name})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!registrationId ? (
        <div className='text-center py-16 px-4 border border-dashed border-border rounded-2xl bg-muted/10'>
          <Activity className='w-12 h-12 text-muted-foreground/30 mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>No Race Selected</h2>
          <p className='text-muted-foreground text-sm max-w-sm mx-auto'>
            Please select an active event registration from the dropdown above to view your live stats and map.
          </p>
        </div>
      ) : (
        (() => {
          const selectedReg = selectOptions.find(r => r._id === registrationId);
          const eventId = selectedReg?.event?._id;
          
          return (
            <>
              <RaceStatsCards
                currentPosition={raceData.currentPosition}
                timeElapsed={raceData.timeElapsed}
                pace={raceData.pace}
                heartRate={raceData.heartRate}
                heartRateZone={raceData.heartRateZone}
              />
              <RaceProgress
                distance={raceData.distance}
                totalDistance={raceData.totalDistance}
                nextCheckpoint={raceData.nextCheckpoint}
                distanceToCheckpoint={raceData.distanceToCheckpoint}
                estimatedTime={raceData.estimatedTime}
              />
              <BioSignalMonitor
                heartRate={raceData.heartRate}
                heartRateZone={raceData.heartRateZone}
                emg={raceData.emg}
                warning={raceData.warning}
                heartRateHistory={heartRateHistory}
                emgHistory={emgHistory}
              />
              <LiveMap eventId={eventId} />
              <CheckpointList checkpoints={raceData.checkpoints} />
            </>
          );
        })()
      )}
    </div>
  );
}
