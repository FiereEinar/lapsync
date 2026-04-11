import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { QUERY_KEYS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSocket } from "@/services/socket";
import _ from "lodash";
import {
  AlertTriangle,
  CheckCircle2,
  Heart,
  Zap,
  MapPin,
  Phone,
  User,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// ── Warning type config ──
const warningTypeConfig: Record<
  string,
  {
    icon: React.ReactNode;
    iconLg: React.ReactNode;
    label: string;
    emoji: string;
    color: string;
    bgGlow: string;
    bgIcon: string;
    borderColor: string;
  }
> = {
  HEART_RATE_CRITICAL: {
    icon: <Heart className='w-4 h-4' />,
    iconLg: <Heart className='w-5 h-5' />,
    label: "Heart Rate",
    emoji: "❤️",
    color: "text-rose-500",
    bgGlow: "bg-rose-500/8",
    bgIcon: "bg-rose-500/15",
    borderColor: "border-rose-500/25",
  },
  EMG_CRAMP_CRITICAL: {
    icon: <Zap className='w-4 h-4' />,
    iconLg: <Zap className='w-5 h-5' />,
    label: "Muscle Tension",
    emoji: "⚡",
    color: "text-amber-500",
    bgGlow: "bg-amber-500/8",
    bgIcon: "bg-amber-500/15",
    borderColor: "border-amber-500/25",
  },
};

const getWarningConfig = (type: string) =>
  warningTypeConfig[type] || {
    icon: <AlertTriangle className='w-4 h-4' />,
    iconLg: <AlertTriangle className='w-5 h-5' />,
    label: type.replace(/_/g, " "),
    emoji: "⚠️",
    color: "text-amber-500",
    bgGlow: "bg-amber-500/8",
    bgIcon: "bg-amber-500/15",
    borderColor: "border-amber-500/25",
  };

const formatTime = (date: string) => {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString();
};

export default function EventAlerts() {
  const queryClient = useQueryClient();
  const { eventID } = useParams();
  const { toast } = useToast();
  const previousAlertIdsRef = useRef<Set<string>>(new Set());

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ALERTS, eventID],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/alert/event/${eventID}`);
      return data.data || [];
    },
    enabled: !!eventID,
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertID: string) => {
      await axiosInstance.patch(`/alert/${alertID}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALERTS, eventID] });
    },
  });

  useEffect(() => {
    const socket = getSocket("race");
    socket.on("emergencyAlert", (data: any) => {
      const runnerName =
        data?.registration?.user?.name ||
        data?.userName ||
        data?.user?.name ||
        "A runner";
      const message = data?.message || "Abnormal reading detected";
      const config = getWarningConfig(data?.type || "");

      toast({
        title: `${config.emoji} ${config.label}: ${_.startCase(runnerName)}`,
        description: message,
        variant: "default",
        className: "border-amber-500/50 bg-amber-500/10",
      });

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALERTS, eventID] });
    });

    return () => {
      socket.off("emergencyAlert");
    };
  }, [eventID, queryClient, toast]);

  // Toast for new warnings that appear via polling/refetch
  useEffect(() => {
    if (alerts.length === 0) return;

    const currentIds = new Set(alerts.map((a: any) => a._id));
    const prevIds = previousAlertIdsRef.current;

    if (prevIds.size > 0) {
      alerts.forEach((alert: any) => {
        if (!prevIds.has(alert._id) && !alert.resolved) {
          const runnerName = alert.registration?.user?.name || "A runner";
          const config = getWarningConfig(alert.type || "");
          toast({
            title: `${config.emoji} ${config.label}: ${_.startCase(runnerName)}`,
            description: alert.message || "Abnormal reading detected",
            variant: "default",
            className: "border-amber-500/50 bg-amber-500/10",
          });
        }
      });
    }

    previousAlertIdsRef.current = currentIds as Set<string>;
  }, [alerts, toast]);

  const unresolvedCount = alerts.filter((a: any) => !a.resolved).length;
  const resolvedCount = alerts.filter((a: any) => a.resolved).length;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin' />
          <p className='text-sm text-muted-foreground'>Loading warnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      {/* ── Header Stats Bar ── */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/15 p-5'>
        <div className='absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center'>
              <AlertTriangle className='w-5 h-5 text-amber-500' />
            </div>
            <div>
              <h3 className='font-semibold text-foreground'>Warning Monitor</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {unresolvedCount > 0
                  ? `${unresolvedCount} active warning${unresolvedCount !== 1 ? "s" : ""} requiring attention`
                  : "All clear — no active warnings"}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {unresolvedCount > 0 && (
              <Badge className='bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 gap-1.5 py-1.5 px-3'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75' />
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-amber-500' />
                </span>
                {unresolvedCount} Active
              </Badge>
            )}
            {resolvedCount > 0 && (
              <Badge className='bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 gap-1.5 py-1.5 px-3'>
                <ShieldCheck className='w-3.5 h-3.5' />
                {resolvedCount} Resolved
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── Warning List ── */}
      {alerts.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 border border-border/50 rounded-2xl bg-muted/10'>
          <div className='w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4'>
            <ShieldCheck className='w-7 h-7 text-muted-foreground/40' />
          </div>
          <p className='text-muted-foreground font-medium'>
            No warnings recorded
          </p>
          <p className='text-xs text-muted-foreground/60 mt-1'>
            Warnings will appear here when abnormal readings are detected
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {alerts.map((alert: any) => {
            const config = getWarningConfig(alert.type);
            const isResolved = alert.resolved;

            return (
              <div
                key={alert._id}
                className={`group relative rounded-2xl border transition-all duration-300 ${
                  isResolved
                    ? "border-border/40 bg-muted/20 opacity-70 hover:opacity-90"
                    : `${config.borderColor} ${config.bgGlow} hover:shadow-md`
                }`}
              >
                {/* Unresolved glow line */}
                {!isResolved && (
                  <div
                    className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full ${
                      alert.type === "HEART_RATE_CRITICAL"
                        ? "bg-rose-500"
                        : "bg-amber-500"
                    }`}
                  />
                )}

                <div className='p-4 pl-5'>
                  {/* Top row: icon + name + badge + time */}
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-3 min-w-0'>
                      {/* Type Icon */}
                      <div
                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                          isResolved ? "bg-emerald-500/15" : config.bgIcon
                        }`}
                      >
                        {isResolved ? (
                          <CheckCircle2 className='w-4.5 h-4.5 text-emerald-500' />
                        ) : (
                          <span className={`${config.color} animate-pulse`}>
                            {config.iconLg}
                          </span>
                        )}
                      </div>

                      {/* Name + type label */}
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold text-foreground truncate'>
                            {_.startCase(
                              alert.registration?.user?.name ||
                                "Unknown Runner",
                            )}
                          </span>
                          <Badge
                            variant='outline'
                            className={`shrink-0 text-[10px] uppercase tracking-wider gap-1 py-0 h-5 ${
                              isResolved
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : `${config.bgIcon} ${config.color} ${config.borderColor}`
                            }`}
                          >
                            {isResolved ? (
                              "Resolved"
                            ) : (
                              <>
                                {config.icon}
                                {config.label}
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-3 mt-0.5 text-xs text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <Clock className='w-3 h-3' />
                            {formatDate(alert.createdAt)}
                          </span>
                          <span className='opacity-60'>
                            {formatTime(alert.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Resolve button */}
                    {!isResolved && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => resolveMutation.mutate(alert._id)}
                        disabled={resolveMutation.isPending}
                        className='shrink-0 rounded-xl gap-1.5 text-xs h-8 border-border/50 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-colors'
                      >
                        <CheckCircle2 className='w-3.5 h-3.5' />
                        Resolve
                      </Button>
                    )}
                  </div>

                  {/* Warning message */}
                  <div className='mt-3 ml-12'>
                    <p className='text-sm text-foreground/90 leading-relaxed'>
                      {alert.message}
                    </p>

                    {/* Meta row: contact + location */}
                    <div className='flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5'>
                      {alert.registration?.emergencyContact?.name && (
                        <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                          <User className='w-3 h-3 opacity-60' />
                          {alert.registration.emergencyContact.name}
                        </span>
                      )}
                      {alert.registration?.emergencyContact?.phone && (
                        <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                          <Phone className='w-3 h-3 opacity-60' />
                          {alert.registration.emergencyContact.phone}
                        </span>
                      )}
                      {alert.location?.lat && (
                        <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                          <MapPin className='w-3 h-3 opacity-60' />
                          {alert.location.lat.toFixed(5)},{" "}
                          {alert.location.lon.toFixed(5)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
