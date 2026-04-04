import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { QUERY_KEYS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSocket } from "@/services/socket";
import _ from "lodash";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useParams } from "react-router-dom";

export default function EventAlerts() {
  const queryClient = useQueryClient();
  const { eventID } = useParams();

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
    socket.on("emergencyAlert", () => {
      // Invalidate the query to fetch the latest alert from the DB
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALERTS, eventID] });
    });

    return () => {
      socket.off("emergencyAlert");
    };
  }, [eventID, queryClient]);

  if (isLoading) return <div>Loading alerts...</div>;

  const unresolvedCount = alerts.filter((a: any) => !a.resolved).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-destructive/10 p-4 rounded-lg border border-destructive/20">
        <div>
          <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Active Emergencies
          </h3>
          <p className="text-sm text-destructive/80">
            {unresolvedCount > 0 
              ? `There are ${unresolvedCount} unresolved medical or system alerts that require your attention.` 
              : "No active alerts at this time."}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
            No alerts have been recorded for this event.
          </div>
        ) : (
          alerts.map((alert: any) => (
            <Card key={alert._id} className={alert.resolved ? "opacity-75 bg-muted/50" : "border-destructive/50 shadow-sm"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {alert.resolved ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-destructive animate-pulse" />}
                      {_.startCase(alert.registration?.user?.name || "Unknown Runner")}
                    </CardTitle>
                    <CardDescription>
                      {new Date(alert.createdAt).toLocaleTimeString()} - {new Date(alert.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={alert.resolved ? "secondary" : "destructive"}>
                    {alert.resolved ? "RESOLVED" : alert.type.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{alert.message}</p>
                    <div className="text-sm text-muted-foreground">
                      <strong>Emergency Contact:</strong>{" "}
                      {alert.registration?.emergencyContact?.name || "N/A"} (
                      {alert.registration?.emergencyContact?.phone || "N/A"})
                    </div>
                    {alert.location?.lat && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Last Known Location: {alert.location.lat.toFixed(6)}, {alert.location.lon.toFixed(6)}
                      </div>
                    )}
                  </div>
                  {!alert.resolved && (
                    <Button 
                      variant="outline" 
                      onClick={() => resolveMutation.mutate(alert._id)}
                      disabled={resolveMutation.isPending}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
