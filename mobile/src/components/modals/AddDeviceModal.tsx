import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { X, Plus } from "lucide-react-native";
import { Input } from "../ui/Input";
import api from "../../api/axios";

export function AddDeviceModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || name.length < 3) {
      Alert.alert("Invalid Input", "Device name must be at least 3 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/device", { name, isActive });
      Alert.alert("Success", "Device created successfully!");
      setName("");
      setIsActive(true);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create device"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType='slide'>
      <View className='flex-1 justify-end bg-black/40'>
        <View className='bg-background rounded-t-3xl overflow-hidden border-t border-border'>
          <View className='p-6 border-b border-border flex-row items-center justify-between'>
            <View>
              <Text className='font-extrabold text-foreground text-xl mb-1'>
                Add New Device
              </Text>
              <Text className='text-muted-foreground text-sm'>
                Register a new hardware tracking node.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className='p-2 bg-muted rounded-full'
            >
              <X size={20} color='hsl(0, 0%, 50%)' />
            </TouchableOpacity>
          </View>

          <View className='p-6 space-y-6'>
            <View>
              <Text className='text-foreground font-semibold mb-2 ml-1'>
                Device Name
              </Text>
              <Input
                placeholder='e.g., Running Node #001'
                value={name}
                onChangeText={setName}
                className='bg-muted/30 border-border/60 h-14 px-4 rounded-xl text-foreground font-medium'
              />
            </View>

            <View className='flex-row items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-xl mt-4'>
              <View>
                <Text className='text-foreground font-bold text-base mb-0.5'>
                  Active Status
                </Text>
                <Text className='text-muted-foreground text-xs'>
                  Inactive devices cannot connect.
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#767577", true: "hsl(173, 50%, 50%)" }}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl flex-row items-center justify-center mt-6 ${isSubmitting ? "bg-primary/50" : "bg-primary"}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color='white' size='small' />
              ) : (
                <>
                  <Plus size={20} color='white' style={{ marginRight: 8 }} />
                  <Text className='font-bold text-white text-base'>
                    Create Device
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
