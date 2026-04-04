import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { QUERY_KEYS } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Heart, Zap, Save, RotateCcw } from "lucide-react";

interface SettingsData {
  heartRateMax: number;
  heartRateMin: number;
  emgCrampThreshold: number;
}

export default function AlertThresholds() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SettingsData>({
    heartRateMax: 180,
    heartRateMin: 40,
    emgCrampThreshold: 150,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SETTINGS],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/settings");
      return data.data as SettingsData;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        heartRateMax: settings.heartRateMax,
        heartRateMin: settings.heartRateMin,
        emgCrampThreshold: settings.emgCrampThreshold,
      });
      setHasChanges(false);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsData) => {
      const res = await axiosInstance.patch("/settings", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS] });
      setHasChanges(false);
    },
  });

  const handleChange = (field: keyof SettingsData, value: string) => {
    const numVal = Number(value);
    if (!isNaN(numVal)) {
      setFormData((prev) => ({ ...prev, [field]: numVal }));
      setHasChanges(true);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        heartRateMax: settings.heartRateMax,
        heartRateMin: settings.heartRateMin,
        emgCrampThreshold: settings.emgCrampThreshold,
      });
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-center py-8">Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          Alert Threshold Configuration
        </CardTitle>
        <CardDescription>
          Configure the physiological thresholds that trigger emergency alerts
          during live events. Alerts are generated when sensor readings exceed
          these limits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Heart Rate Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Heart className="w-4 h-4 text-red-500" />
            Heart Rate Thresholds
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hr-max">Maximum Heart Rate (bpm)</Label>
              <Input
                id="hr-max"
                type="number"
                value={formData.heartRateMax}
                onChange={(e) => handleChange("heartRateMax", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Alert triggers when HR exceeds this limit (tachycardia zone)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hr-min">Minimum Heart Rate (bpm)</Label>
              <Input
                id="hr-min"
                type="number"
                value={formData.heartRateMin}
                onChange={(e) => handleChange("heartRateMin", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Alert triggers when HR drops below this limit (bradycardia zone)
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* EMG Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Zap className="w-4 h-4 text-yellow-500" />
            EMG / Muscle Cramp Detection
          </div>

          <div className="space-y-2">
            <Label htmlFor="emg-threshold">EMG Cramp Threshold</Label>
            <Input
              id="emg-threshold"
              type="number"
              value={formData.emgCrampThreshold}
              onChange={(e) => handleChange("emgCrampThreshold", e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Alert triggers when EMG reading exceeds this value, indicating
              possible severe muscle cramping. Adjust based on your sensor's scale.
            </p>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => updateMutation.mutate(formData)}
            disabled={!hasChanges || updateMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Saving..." : "Save Thresholds"}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          {updateMutation.isSuccess && !hasChanges && (
            <span className="text-sm text-green-600 font-medium">
              ✓ Thresholds saved successfully
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
