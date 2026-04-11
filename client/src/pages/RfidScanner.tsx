import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Radio,
  Wifi,
  WifiOff,
  Play,
  Pause,
  Trash2,
  Plus,
  MoreVertical,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ScanLine,
  Pencil,
  Zap,
  Clock,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import axiosInstance from "@/api/axios";
import { Event } from "@/types/event";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";
import { format } from "date-fns";
import { StatCard } from "@/components/StatCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

// ── Types ──

type DeviceMapping = {
  _id: string;
  deviceName: string;
  event: { _id: string; name: string; raceCategories: any[] };
  raceCategory: string;
  raceCategoryName: string;
  raceCategoryDistanceKm: number;
  scanType: "start" | "checkpoint" | "finish";
  checkpointName?: string;
  isActive: boolean;
  createdAt: string;
};

type ScanFeedEntry = {
  id: string;
  tag: string;
  device: string;
  time: string;
  type: "success" | "skipped" | "error";
  message: string;
  participantName?: string;
  bibNumber?: number;
  scanType?: string;
  timestamp: number;
};

// ── Scan Type Config ──

const scanTypeConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  start: {
    label: "Start",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0",
    icon: <Play className="w-3 h-3 mr-1" />,
  },
  checkpoint: {
    label: "Checkpoint",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0",
    icon: <CircleDot className="w-3 h-3 mr-1" />,
  },
  finish: {
    label: "Finish",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0",
    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
  },
};

// ── Component ──

export default function RfidScanner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Scanner state
  const [isScanning, setIsScanning] = useState(true);
  const [connectedDeviceCount, setConnectedDeviceCount] = useState(0);
  const [scanFeed, setScanFeed] = useState<ScanFeedEntry[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMapping, setEditMapping] = useState<DeviceMapping | null>(null);

  // Form state
  const [formDeviceName, setFormDeviceName] = useState("");
  const [formEventId, setFormEventId] = useState("");
  const [formRaceCategory, setFormRaceCategory] = useState("");
  const [formScanType, setFormScanType] = useState<string>("");
  const [formCheckpointName, setFormCheckpointName] = useState("");

  // ── Queries ──

  const { data: mappings = [], isLoading: mappingsLoading } = useQuery({
    queryKey: [QUERY_KEYS.RFID_DEVICE_MAPPINGS],
    queryFn: async (): Promise<DeviceMapping[]> => {
      const { data } = await axiosInstance.get("/rfid-device-mapping");
      return Array.isArray(data.data) ? data.data : [];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: [QUERY_KEYS.EVENTS],
    queryFn: async (): Promise<Event[]> => {
      const { data } = await axiosInstance.get("/event");
      return Array.isArray(data.data) ? data.data : [];
    },
  });

  // Selected event for form (to show race categories)
  const selectedEvent = events.find((e) => e._id === formEventId);

  // ── Mutations ──

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/rfid-device-mapping", {
        deviceName: formDeviceName.trim(),
        eventId: formEventId,
        raceCategory: formRaceCategory,
        scanType: formScanType,
        checkpointName: formScanType === "checkpoint" ? formCheckpointName.trim() : undefined,
      });
      return data;
    },
    onSuccess: () => {
      toast({ title: "Created", description: "Device mapping created successfully" });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RFID_DEVICE_MAPPINGS] });
      resetForm();
      setAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error?.response?.data?.message || error?.message || "Failed to create mapping",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editMapping) return;
      const { data } = await axiosInstance.patch(
        `/rfid-device-mapping/${editMapping._id}`,
        {
          deviceName: formDeviceName.trim(),
          eventId: formEventId,
          raceCategory: formRaceCategory,
          scanType: formScanType,
          checkpointName: formScanType === "checkpoint" ? formCheckpointName.trim() : undefined,
        },
      );
      return data;
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Device mapping updated successfully" });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RFID_DEVICE_MAPPINGS] });
      resetForm();
      setEditDialogOpen(false);
      setEditMapping(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error?.response?.data?.message || error?.message || "Failed to update mapping",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/rfid-device-mapping/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Device mapping deleted successfully" });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RFID_DEVICE_MAPPINGS] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description: error?.message || "Failed to delete mapping",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await axiosInstance.patch(`/rfid-device-mapping/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RFID_DEVICE_MAPPINGS] });
    },
  });

  // ── Helpers ──

  const resetForm = () => {
    setFormDeviceName("");
    setFormEventId("");
    setFormRaceCategory("");
    setFormScanType("");
    setFormCheckpointName("");
  };

  const openEditDialog = (mapping: DeviceMapping) => {
    setEditMapping(mapping);
    setFormDeviceName(mapping.deviceName);
    setFormEventId(mapping.event._id);
    setFormRaceCategory(mapping.raceCategory);
    setFormScanType(mapping.scanType);
    setFormCheckpointName(mapping.checkpointName || "");
    setEditDialogOpen(true);
  };

  const addFeedEntry = useCallback((entry: ScanFeedEntry) => {
    setScanFeed((prev) => {
      const updated = [...prev, entry];
      // Keep last 200 entries
      if (updated.length > 200) return updated.slice(-200);
      return updated;
    });
  }, []);

  // Auto-scroll feed
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scanFeed]);

  // ── Socket.IO Connection ──

  useEffect(() => {
    const socket = io(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/rfid-scanner`,
      { transports: ["websocket"] },
    );
    socketRef.current = socket;

    socket.on("scannerState", ({ isScanning: state }: { isScanning: boolean }) => {
      setIsScanning(state);
    });

    socket.on("rfidDeviceConnected", ({ connectedCount }: { connectedCount: number }) => {
      setConnectedDeviceCount(connectedCount);
      addFeedEntry({
        id: `sys-${Date.now()}`,
        tag: "--",
        device: "--",
        time: new Date().toISOString(),
        type: "success",
        message: "RFID hardware device connected",
        timestamp: Date.now(),
      });
    });

    socket.on("rfidDeviceDisconnected", ({ device, connectedCount }: { device: string; connectedCount: number }) => {
      setConnectedDeviceCount(connectedCount);
      addFeedEntry({
        id: `sys-${Date.now()}`,
        tag: "--",
        device: device,
        time: new Date().toISOString(),
        type: "error",
        message: `Hardware device "${device}" disconnected`,
        timestamp: Date.now(),
      });
    });

    socket.on("rfidRawScan", (data: { tag: string; time: string; device: string; timestamp: number }) => {
      // Raw scan is just logged — processed/skipped event will follow
    });

    socket.on(
      "rfidScanProcessed",
      (data: {
        tag: string;
        device: string;
        result: {
          success: boolean;
          participantName?: string;
          bibNumber?: number;
          scanType: string;
          message: string;
        };
        timestamp: number;
      }) => {
        addFeedEntry({
          id: `scan-${data.timestamp}-${Math.random()}`,
          tag: data.tag,
          device: data.device,
          time: new Date(data.timestamp).toISOString(),
          type: data.result.success ? "success" : "error",
          message: data.result.message,
          participantName: data.result.participantName,
          bibNumber: data.result.bibNumber,
          scanType: data.result.scanType,
          timestamp: data.timestamp,
        });
      },
    );

    socket.on(
      "rfidScanSkipped",
      (data: { tag: string; device: string; reason: string; timestamp: number }) => {
        addFeedEntry({
          id: `skip-${data.timestamp}-${Math.random()}`,
          tag: data.tag,
          device: data.device,
          time: new Date(data.timestamp).toISOString(),
          type: "skipped",
          message: data.reason,
          timestamp: data.timestamp,
        });
      },
    );

    socket.on(
      "rfidScanError",
      (data: { error: string; timestamp: number }) => {
        addFeedEntry({
          id: `err-${data.timestamp}-${Math.random()}`,
          tag: "--",
          device: "--",
          time: new Date(data.timestamp).toISOString(),
          type: "error",
          message: data.error,
          timestamp: data.timestamp,
        });
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [addFeedEntry]);

  const handleToggleScanner = () => {
    if (isScanning) {
      socketRef.current?.emit("stopScanner");
    } else {
      socketRef.current?.emit("startScanner");
    }
  };

  // ── Stats ──
  const activeMappings = mappings.filter((m) => m.isActive).length;
  const successCount = scanFeed.filter((s) => s.type === "success").length;
  const skippedCount = scanFeed.filter((s) => s.type === "skipped").length;

  // ── Form Valid ──
  const isFormValid =
    formDeviceName.trim() &&
    formEventId &&
    formRaceCategory &&
    formScanType &&
    (formScanType !== "checkpoint" || formCheckpointName.trim());

  // ── Render ──

  const renderMappingForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Device Name</Label>
        <Input
          placeholder='e.g. reader-1, start-gate...'
          value={formDeviceName}
          onChange={(e) => setFormDeviceName(e.target.value)}
          className="rounded-xl"
        />
        <p className="text-xs text-muted-foreground">
          Must match the device identifier sent by the RFID hardware
        </p>
      </div>

      <div className="space-y-2">
        <Label>Event</Label>
        <Select value={formEventId} onValueChange={(v) => { setFormEventId(v); setFormRaceCategory(""); }}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e._id} value={e._id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formEventId && selectedEvent && (
        <div className="space-y-2">
          <Label>Race Category</Label>
          <Select value={formRaceCategory} onValueChange={setFormRaceCategory}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {selectedEvent.raceCategories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name} ({cat.distanceKm}km)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Scan Type</Label>
        <Select value={formScanType} onValueChange={setFormScanType}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="What does this reader record?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">
              <span className="flex items-center gap-2">
                <Play className="w-3 h-3 text-emerald-500" /> Start Line
              </span>
            </SelectItem>
            <SelectItem value="checkpoint">
              <span className="flex items-center gap-2">
                <CircleDot className="w-3 h-3 text-blue-500" /> Checkpoint
              </span>
            </SelectItem>
            <SelectItem value="finish">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-amber-500" /> Finish Line
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formScanType === "checkpoint" && (
        <div className="space-y-2">
          <Label>Checkpoint Name</Label>
          <Input
            placeholder='e.g. Water Station, Km 5...'
            value={formCheckpointName}
            onChange={(e) => setFormCheckpointName(e.target.value)}
            className="rounded-xl"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-appear">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">
              Live Timing
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
              RFID Scanner
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Monitor and configure RFID readers for race timing
            </p>
          </div>
          <div className="flex items-center gap-3">
            {connectedDeviceCount > 0 ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 gap-1.5 py-1.5 px-3">
                <Wifi className="w-3.5 h-3.5" />
                {connectedDeviceCount} device{connectedDeviceCount !== 1 ? "s" : ""} connected
              </Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground border-0 gap-1.5 py-1.5 px-3">
                <WifiOff className="w-3.5 h-3.5" />
                No devices connected
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Device Mappings"
          value={mappings.length}
          subtitle={`${activeMappings} active`}
          icon={Radio}
          accentColor="teal"
        />
        <StatCard
          title="Scanner Status"
          value={isScanning ? "Active" : "Paused"}
          subtitle={isScanning ? "Processing scans" : "Scans paused"}
          icon={isScanning ? Zap : Pause}
          accentColor={isScanning ? "green" : "purple"}
        />
        <StatCard
          title="Scans Processed"
          value={successCount}
          subtitle="This session"
          icon={CheckCircle2}
          accentColor="green"
        />
        <StatCard
          title="Scans Skipped"
          value={skippedCount}
          subtitle="Unmapped or inactive"
          icon={AlertTriangle}
          accentColor="purple"
        />
      </div>

      {/* Scanner Control */}
      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <ScanLine className="w-4.5 h-4.5 text-primary" />
              </div>
              Scanner Control
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {isScanning ? "Scanner is active" : "Scanner is paused"}
              </span>
              <Button
                variant={isScanning ? "destructive" : "default"}
                size="sm"
                onClick={handleToggleScanner}
                className="gap-2 rounded-xl"
              >
                {isScanning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Scanner
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Scanner
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Device Mappings */}
      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Radio className="w-4.5 h-4.5 text-blue-500" />
              </div>
              Device Mappings
            </CardTitle>
            <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Mapping
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Device Mapping</DialogTitle>
                </DialogHeader>
                {renderMappingForm()}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="rounded-xl">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={!isFormValid || createMutation.isPending}
                    className="rounded-xl"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Mapping"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Device</TableHead>
                  <TableHead className="font-semibold">Event</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Scan Type</TableHead>
                  <TableHead className="font-semibold">Active</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Loading mappings...</p>
                    </TableCell>
                  </TableRow>
                ) : mappings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Radio className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">
                        No device mappings configured. Add one to start receiving scans.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  mappings.map((mapping) => {
                    const cfg = scanTypeConfig[mapping.scanType];
                    return (
                      <TableRow key={mapping._id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono">
                            {mapping.deviceName}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">{mapping.event?.name || "--"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {mapping.raceCategoryName} ({mapping.raceCategoryDistanceKm}km)
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cfg?.className}>
                            {cfg?.icon}
                            {cfg?.label}
                            {mapping.scanType === "checkpoint" && mapping.checkpointName && (
                              <span className="ml-1 opacity-70">({mapping.checkpointName})</span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={mapping.isActive}
                            onCheckedChange={(checked) =>
                              toggleActiveMutation.mutate({ id: mapping._id, isActive: checked })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="rounded-lg">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(mapping)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <ConfirmDialog
                                  onConfirm={() => deleteMutation.mutate(mapping._id)}
                                  trigger={
                                    <button className="flex items-center w-full">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </button>
                                  }
                                />
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Mapping Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) { resetForm(); setEditMapping(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Device Mapping</DialogTitle>
          </DialogHeader>
          {renderMappingForm()}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={!isFormValid || updateMutation.isPending}
              className="rounded-xl"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Scan Feed */}
      <Card className="rounded-xl border border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              Live Scan Feed
              {isScanning && (
                <span className="relative flex h-2.5 w-2.5 ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScanFeed([])}
              className="gap-2 rounded-xl text-muted-foreground"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-xl border border-border">
            <div className="p-1">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold w-[60px]">Status</TableHead>
                    <TableHead className="font-semibold">Tag</TableHead>
                    <TableHead className="font-semibold">Device</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Participant</TableHead>
                    <TableHead className="font-semibold">Message</TableHead>
                    <TableHead className="font-semibold">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanFeed.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16">
                        <ScanLine className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">
                          Waiting for RFID scans...
                        </p>
                        <p className="text-muted-foreground/50 text-xs mt-1">
                          Scans will appear here in real-time when RFID tags are read
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    scanFeed.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className={`transition-colors ${
                          entry.type === "success"
                            ? "hover:bg-emerald-500/5"
                            : entry.type === "skipped"
                              ? "hover:bg-amber-500/5"
                              : "hover:bg-red-500/5"
                        }`}
                      >
                        <TableCell>
                          {entry.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : entry.type === "skipped" ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono">
                            {entry.tag}
                          </code>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {entry.device}
                        </TableCell>
                        <TableCell>
                          {entry.scanType ? (
                            <Badge
                              variant="outline"
                              className={`${scanTypeConfig[entry.scanType]?.className || ""} text-[10px] uppercase tracking-wider`}
                            >
                              {scanTypeConfig[entry.scanType]?.icon}
                              {scanTypeConfig[entry.scanType]?.label || entry.scanType}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">--</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.participantName ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{entry.participantName}</span>
                              {entry.bibNumber && (
                                <span className="text-xs text-muted-foreground">
                                  Bib #{entry.bibNumber}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">--</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs ${
                              entry.type === "success"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : entry.type === "skipped"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {entry.message}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          <Clock className="w-3 h-3 inline mr-1 opacity-50" />
                          {format(new Date(entry.timestamp), "HH:mm:ss")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div ref={feedEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
