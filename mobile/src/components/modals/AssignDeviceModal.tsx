import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { X, CheckCircle2 } from "lucide-react-native";
import api from "../../api/axios";

export function AssignDeviceModal({
  registration,
  visible,
  onClose,
  onSuccess,
}: {
  registration: any;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<string>(
    registration?.device?._id || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchDevices();
      setSelectedDevice(registration?.device?._id || "");
    }
  }, [visible, registration]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/device");
      setDevices(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to fetch devices", error);
      Alert.alert("Error", "Could not load available devices.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDevice) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/device/assign/${selectedDevice}`, {
        registrationId: registration._id,
      });
      Alert.alert("Success", "Device assigned successfully!");
      onSuccess();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to assign device"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType='fade'>
      <View className='flex-1 justify-center bg-black/40 p-4'>
        <View className='bg-background rounded-2xl overflow-hidden max-h-[80%] border border-border'>
          <View className='p-4 border-b border-border flex-row items-center justify-between bg-muted/10'>
            <Text className='font-bold text-foreground text-lg'>
              Assign Hardware
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className='p-1 bg-muted rounded-full'
            >
              <X size={20} color='hsl(0, 0%, 50%)' />
            </TouchableOpacity>
          </View>

          <ScrollView className='p-4'>
            <Text className='text-muted-foreground text-sm mb-4 leading-relaxed'>
              Select an available tracking device to assign to{" "}
              <Text className='font-bold text-foreground'>
                {registration?.user?.name}
              </Text>
              .
            </Text>

            {loading ? (
              <View className='py-10 items-center justify-center'>
                <ActivityIndicator color='hsl(173, 50%, 50%)' />
              </View>
            ) : devices.length === 0 ? (
              <View className='py-8 items-center bg-muted/20 rounded-xl border border-border/50'>
                <Text className='text-muted-foreground text-sm font-medium'>
                  No devices available.
                </Text>
              </View>
            ) : (
              <View className='gap-3 pb-6'>
                {devices.map((device) => {
                  const isSelected = selectedDevice === device._id;
                  return (
                    <TouchableOpacity
                      key={device._id}
                      onPress={() => setSelectedDevice(device._id)}
                      className={`flex-row items-center justify-between p-4 rounded-xl border ${isSelected ? "bg-primary/10 border-primary" : "bg-card border-border"}`}
                    >
                      <View>
                        <Text
                          className={`font-bold text-base ${isSelected ? "text-primary" : "text-foreground"}`}
                        >
                          {device.name}
                        </Text>
                        {device.batteryLevel !== undefined && (
                          <Text className='text-xs text-muted-foreground mt-1'>
                            Battery: {device.batteryLevel}%
                          </Text>
                        )}
                      </View>
                      {isSelected && (
                        <CheckCircle2 size={20} color='hsl(173, 50%, 50%)' />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View className='p-4 border-t border-border flex-row gap-3 bg-muted/5'>
            <TouchableOpacity
              onPress={onClose}
              className='flex-1 py-3 rounded-xl border border-border items-center justify-center'
            >
              <Text className='font-bold text-muted-foreground'>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAssign}
              disabled={!selectedDevice || isSubmitting}
              className={`flex-1 py-3 rounded-xl items-center justify-center ${!selectedDevice || isSubmitting ? "bg-primary/50" : "bg-primary"}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color='white' size='small' />
              ) : (
                <Text className='font-bold text-white'>Assign</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
