import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Input } from "../../src/components/ui/Input";
import { Card, CardContent } from "../../src/components/ui/Card";
import {
  Search,
  Computer,
  Wifi,
  WifiOff,
  User,
  Calendar,
  Key,
  Copy,
} from "lucide-react-native";
import api from "../../src/api/axios";

export default function AdminDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDevices = async () => {
    try {
      const { data } = await api.get("/device");
      setDevices(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Devices Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const filteredDevices = useMemo(() => {
    if (!searchTerm) return devices;
    const term = searchTerm.toLowerCase();
    return devices.filter(
      (d: any) =>
        d.name?.toLowerCase().includes(term) ||
        d.deviceToken?.toLowerCase().includes(term) ||
        d.registration?.user?.name?.toLowerCase().includes(term),
    );
  }, [devices, searchTerm]);

  const handleCopyToken = async (token: string) => {
    // await Clipboard.setStringAsync(token);
    Alert.alert("Copied", "Device token copied to clipboard", [{ text: "OK" }]);
  };

  if (loading) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' color='hsl(173, 50%, 50%)' />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-background'>
      <ScrollView>
        {/* Hero Section */}
        <View className='mb-2 mt-2 relative'>
          <View className='bg-primary/10 py-10 px-6 border border-primary/20 overflow-hidden'>
            <Text className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>
              Hardware
            </Text>
            <Text className='text-2xl font-extrabold text-foreground mb-1'>
              Manage Devices
            </Text>
            <Text className='text-muted-foreground text-sm'>
              Manage hardware devices and tracking nodes
            </Text>
          </View>
        </View>

        <View className='px-4 pb-24'>
          {/* Search */}
          <View className='relative mb-4 mt-2'>
            <View className='absolute left-3 top-3.5 z-10'>
              <Search size={18} color='hsl(0, 0%, 70%)' />
            </View>
            <Input
              placeholder='Search by device, token, or runner name...'
              value={searchTerm}
              onChangeText={setSearchTerm}
              className='pl-10 h-14'
            />
          </View>

          {/* Count badge */}
          <View className='flex-row items-center mb-4'>
            <View className='bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20'>
              <Text className='text-primary text-xs font-bold'>
                {filteredDevices.length} device
                {filteredDevices.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* Device Cards */}
          {filteredDevices.length === 0 ? (
            <View className='py-16 items-center border border-dashed border-border rounded-2xl bg-muted/10'>
              <Computer size={40} color='hsl(0, 0%, 40%)' />
              <Text className='text-foreground font-semibold mt-3'>
                No devices found
              </Text>
              <Text className='text-muted-foreground text-sm mt-1'>
                {searchTerm
                  ? "Try a different search term"
                  : "No devices added yet"}
              </Text>
            </View>
          ) : (
            <View className='gap-3'>
              {filteredDevices.map((device: any) => {
                const isAssigned = device.registration !== null;
                const userName = device.registration?.user?.name;
                const eventName = device.registration?.event?.name;
                const truncatedToken =
                  device.deviceToken?.length > 20
                    ? device.deviceToken.substring(0, 20) + "..."
                    : device.deviceToken;

                return (
                  <Card key={device._id} className='overflow-hidden'>
                    <CardContent className='p-4 pt-4'>
                      {/* Top row: Icon + Name + Status */}
                      <View className='flex-row items-center justify-between mb-3'>
                        <View className='flex-row items-center flex-1 mr-2'>
                          <View
                            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                              isAssigned
                                ? "bg-blue-500/15"
                                : "bg-emerald-500/15"
                            }`}
                          >
                            {isAssigned ? (
                              <Wifi size={18} color='hsl(217, 91%, 60%)' />
                            ) : (
                              <WifiOff size={18} color='hsl(160, 84%, 39%)' />
                            )}
                          </View>
                          <View className='flex-1'>
                            <Text
                              className='text-foreground font-bold text-base'
                              numberOfLines={1}
                            >
                              {device.name}
                            </Text>
                            <TouchableOpacity
                              onPress={() =>
                                handleCopyToken(device.deviceToken)
                              }
                              className='flex-row items-center mt-0.5'
                            >
                              <Key size={10} color='hsl(0, 0%, 50%)' />
                              <Text
                                className='text-muted-foreground text-xs ml-1 font-mono'
                                numberOfLines={1}
                              >
                                {truncatedToken}
                              </Text>
                              <Copy
                                size={10}
                                color='hsl(0, 0%, 50%)'
                                style={{ marginLeft: 6 }}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View
                          className={`px-2.5 py-1 rounded-md ${
                            isAssigned ? "bg-blue-500/15" : "bg-emerald-500/15"
                          }`}
                        >
                          <Text
                            className={`text-[10px] uppercase font-extrabold tracking-wider ${
                              isAssigned
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isAssigned ? "Assigned" : "Available"}
                          </Text>
                        </View>
                      </View>

                      {/* Detail chips row (only if assigned) */}
                      {isAssigned && (
                        <View className='flex-row flex-wrap gap-2 mt-1 border-t border-border/50 pt-3'>
                          {/* User */}
                          <View className='flex-row items-center bg-muted/30 border border-border/50 rounded-lg px-2.5 py-1.5'>
                            <User
                              size={12}
                              color='hsl(217, 91%, 60%)'
                              style={{ marginRight: 5 }}
                            />
                            <Text
                              className='text-foreground text-[11px] font-medium'
                              numberOfLines={1}
                              style={{ maxWidth: 140 }}
                            >
                              {userName || "--"}
                            </Text>
                          </View>

                          {/* Event */}
                          <View className='flex-row items-center bg-muted/30 border border-border/50 rounded-lg px-2.5 py-1.5'>
                            <Calendar
                              size={12}
                              color='hsl(173, 50%, 50%)'
                              style={{ marginRight: 5 }}
                            />
                            <Text
                              className='text-foreground text-[11px] font-medium'
                              numberOfLines={1}
                              style={{ maxWidth: 140 }}
                            >
                              {eventName || "--"}
                            </Text>
                          </View>
                        </View>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
