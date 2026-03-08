import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Timer, CircleDot, Ban, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Event } from "@/types/event";
import { RaceResult } from "@/types/race-result";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import axiosInstance from "@/api/axios";
import { io } from "socket.io-client";
import { format } from "date-fns";

type LeaderboardProps = {
  event: Event;
};

/** Format elapsed milliseconds into HH:MM:SS */
function formatElapsed(ms?: number): string {
  if (!ms) return "--:--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  finished: {
    label: "Finished",
    className:
      "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    icon: <Trophy className='w-3 h-3 mr-1' />,
  },
  running: {
    label: "Running",
    className:
      "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
    icon: <Timer className='w-3 h-3 mr-1' />,
  },
  not_started: {
    label: "Not Started",
    className:
      "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30",
    icon: <CircleDot className='w-3 h-3 mr-1' />,
  },
  dnf: {
    label: "DNF",
    className: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
    icon: <AlertTriangle className='w-3 h-3 mr-1' />,
  },
  dns: {
    label: "DNS",
    className:
      "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
    icon: <Ban className='w-3 h-3 mr-1' />,
  },
};

export default function Leaderboard({ event }: LeaderboardProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Build query params
  const queryParams = new URLSearchParams({ eventID: event._id });
  if (categoryFilter !== "all") {
    queryParams.append("raceCategory", categoryFilter);
  }

  const { data: results = [] } = useQuery({
    queryKey: [QUERY_KEYS.RACE_RESULTS, event._id, categoryFilter],
    queryFn: async (): Promise<RaceResult[]> => {
      const { data } = await axiosInstance.get(
        `/race-result?${queryParams.toString()}`,
      );
      return Array.isArray(data.data) ? data.data : [];
    },
    refetchInterval: 30000, // fallback polling every 30s
  });

  // Socket.IO live updates
  useEffect(() => {
    const socket = io(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/race`,
      { transports: ["websocket"] },
    );

    socket.on("raceUpdate", (payload: { eventId: string }) => {
      if (payload.eventId === event._id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.RACE_RESULTS, event._id],
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [event._id, queryClient]);

  const finishedCount = results.filter((r) => r.status === "finished").length;
  const runningCount = results.filter((r) => r.status === "running").length;

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='w-5 h-5 text-yellow-500' />
              Live Leaderboard
            </CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              {finishedCount} finished · {runningCount} running ·{" "}
              {results.length} total
            </p>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='All Categories' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {event.raceCategories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name} ({cat.distanceKm}km)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[80px]'>Rank</TableHead>
              <TableHead>Bib #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Finish</TableHead>
              {/* <TableHead>Checkpoints</TableHead> */}
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results &&
              results.map((result, index) => {
                const reg = result.registration;
                const cfg =
                  statusConfig[result.status] ?? statusConfig.not_started;

                return (
                  <TableRow key={result._id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {result.rank === 1 && (
                          <Trophy className='w-4 h-4 text-yellow-500' />
                        )}
                        {result.rank === 2 && (
                          <Trophy className='w-4 h-4 text-gray-400' />
                        )}
                        {result.rank === 3 && (
                          <Trophy className='w-4 h-4 text-amber-600' />
                        )}
                        <span className='font-bold'>
                          {result.rank ?? index + 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>
                      {reg?.bibNumber ?? "--"}
                    </TableCell>
                    <TableCell>{reg?.user?.name ?? "--"}</TableCell>
                    <TableCell>
                      <Badge variant='secondary'>
                        {reg?.raceCategory?.name ?? "--"}
                      </Badge>
                    </TableCell>
                    <TableCell className='font-mono'>
                      {formatElapsed(result.elapsedMs)}
                    </TableCell>
                    <TableCell className='font-mono'>
                      {result.startTime
                        ? format(new Date(result.startTime), "HH:mm:ss")
                        : "--"}
                    </TableCell>
                    <TableCell className='font-mono'>
                      {result.finishTime
                        ? format(new Date(result.finishTime), "HH:mm:ss")
                        : "--"}
                    </TableCell>
                    {/* <TableCell>
                      {result.checkpoints.length > 0 ? (
                        <Badge variant='outline'>
                          {
                            result.checkpoints[result.checkpoints.length - 1]
                              .name
                          }
                        </Badge>
                      ) : (
                        <span className='text-muted-foreground'>--</span>
                      )}
                    </TableCell> */}
                    <TableCell>
                      <Badge variant='outline' className={cfg.className}>
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            {results.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center py-8 text-muted-foreground'
                >
                  No race results yet. Results will appear here once RFID scans
                  are received.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
