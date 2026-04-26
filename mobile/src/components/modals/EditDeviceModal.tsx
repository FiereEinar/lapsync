import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  ScrollView,
  TextInput,
} from "react-native";
import { X, Search } from "lucide-react-native";
import { Input } from "../ui/Input";
import api from "../../api/axios";

export function EditDeviceModal({
  device,
  visible,
  onClose,
  onSuccess,
}: {
  device: any;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [deviceToken, setDeviceToken] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [registration, setRegistration] = useState<any>(null); // assigned reg obj
  
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (visible && device) {
      setName(device.name || "");
      setDeviceToken(device.deviceToken || "");
      setIsActive(device.isActive ?? true);
      setRegistration(device.registration || null);
      fetchRegistrations();
    }
  }, [visible, device]);

  const fetchRegistrations = async () => {
    try {
      const { data } = await api.get("/registration");
      setRegistrations(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !deviceToken.trim()) {
      Alert.alert("Missing Fields", "Device Name and Token are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        deviceToken,
        isActive,
        registration: registration ? registration._id : "",
      };

      await api.put(`/device/${device._id}`, payload);
      Alert.alert("Success", "Device updated successfully!");
      onSuccess();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update device"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRegistrations = registrations.filter((r) =>
    r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.event?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent={true} animationType='slide'>
      <View className='flex-1 justify-end bg-black/40'>
        <View className='bg-background rounded-t-3xl overflow-hidden border-t border-border max-h-[90%]'>
          <View className='p-6 border-b border-border flex-row items-center justify-between'>
            <View>
              <Text className='font-extrabold text-foreground text-xl mb-1'>
                Edit Device
              </Text>
              <Text className='text-muted-foreground text-sm'>
                Update device details or token.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className='p-2 bg-muted rounded-full'>
              <X size={20} color='hsl(0, 0%, 50%)' />
            </TouchableOpacity>
          </View>

          <ScrollView className='p-6'>
            <View className='space-y-6'>
              <View>
                <Text className='text-foreground font-semibold mb-2 ml-1'>
                  Device Name
                </Text>
                <Input
                  placeholder='Running Node #001'
                  value={name}
                  onChangeText={setName}
                  className='bg-muted/30 border-border/60 h-14 px-4 rounded-xl text-foreground font-medium'
                />
              </View>

              <View className='mt-4'>
                <Text className='text-foreground font-semibold mb-2 ml-1'>
                  Device Token
                </Text>
                <Input
                  placeholder='Token'
                  value={deviceToken}
                  onChangeText={setDeviceToken}
                  className='bg-muted/30 border-border/60 h-14 px-4 rounded-xl text-foreground font-medium'
                />
              </View>

              <View className='mt-4'>
                <Text className='text-foreground font-semibold mb-2 ml-1'>
                  Assign to Participant
                </Text>
                <TouchableOpacity
                  onPress={() => setPickerVisible(true)}
                  className='bg-muted/30 border border-border/60 h-14 px-4 rounded-xl justify-center'
                >
                  <Text className={`font-medium ${registration ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {registration ? `${registration.user?.name} - ${registration.event?.name}` : 'Unassigned'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className='flex-row items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-xl mt-4 mb-8'>
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
            </View>
          </ScrollView>

          <View className='p-6 border-t border-border'>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl flex-row items-center justify-center ${isSubmitting ? "bg-primary/50" : "bg-primary"}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color='white' size='small' />
              ) : (
                <Text className='font-bold text-white text-base'>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Registration Picker Modal */}
      <Modal visible={pickerVisible} transparent={true} animationType='fade'>
        <View className='flex-1 justify-end bg-black/60'>
          <View className='bg-background h-[70%] rounded-t-3xl border-t border-border'>
            <View className='p-4 border-b border-border flex-row items-center justify-between bg-muted/10'>
              <Text className='font-bold text-foreground text-lg'>Select Participant</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)} className='p-2 bg-muted rounded-full'>
                <X size={20} color='hsl(0, 0%, 50%)' />
              </TouchableOpacity>
            </View>
            
            <View className='p-4 border-b border-border'>
              <View className='relative'>
                <View className='absolute left-3 top-3.5 z-10'>
                  <Search size={18} color='hsl(0, 0%, 50%)' />
                </View>
                <TextInput
                  placeholder='Search...'
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  className='bg-muted/30 border border-border/60 rounded-xl pl-10 pr-4 h-12 text-foreground font-medium'
                />
              </View>
            </View>

            <ScrollView className='p-4'>
              <TouchableOpacity
                onPress={() => {
                  setRegistration(null);
                  setPickerVisible(false);
                }}
                className={`p-4 border-b border-border/50 ${!registration ? 'bg-primary/10' : ''}`}
              >
                <Text className={`font-bold ${!registration ? 'text-primary' : 'text-foreground'}`}>Unassigned</Text>
              </TouchableOpacity>
              
              {filteredRegistrations.map((reg) => {
                const isSelected = registration?._id === reg._id;
                return (
                  <TouchableOpacity
                    key={reg._id}
                    onPress={() => {
                      setRegistration(reg);
                      setPickerVisible(false);
                    }}
                    className={`p-4 border-b border-border/50 ${isSelected ? 'bg-primary/10' : ''}`}
                  >
                    <Text className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {reg.user?.name}
                    </Text>
                    <Text className='text-xs text-muted-foreground mt-1'>
                      {reg.event?.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <View className='h-8' />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
