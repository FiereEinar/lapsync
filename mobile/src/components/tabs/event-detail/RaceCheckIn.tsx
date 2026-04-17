import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Radio,
  Search,
  CheckCircle2,
  Wifi,
  WifiOff,
  Tag,
} from "lucide-react-native";
import api from "@/src/api/axios";
import { getSocket } from "@/src/services/socket";

export function RaceCheckIn({ event }: { event: any }) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [epcInput, setEpcInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const fetchRegistrations = async () => {
    try {
      const { data } = await api.get(`/registration?eventID=${event._id}`);
      setRegistrations(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [event._id]);

  useEffect(() => {
    // Specifically listen to the rfid scanner socket matching Web behaviour
    const scannerSocket = getSocket("rfid-scanner");

    scannerSocket.on("connect", () => setIsConnected(true));
    scannerSocket.on("disconnect", () => setIsConnected(false));

    // Auto populate the Check-In input field via Live Node capturing!
    scannerSocket.on(
      "rfidRawScan",
      (data: { tag: string; time: string; device: string }) => {
        if (data.tag) {
          setEpcInput(data.tag);
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 800);
          Alert.alert(
            "Scanner Match!",
            `Tag: ${data.tag}\nDevice: ${data.device}`,
          );
        }
      },
    );

    return () => {
      scannerSocket.off("connect");
      scannerSocket.off("disconnect");
      scannerSocket.off("rfidRawScan");
    };
  }, []);

  const handleAssign = async (registrationId: string) => {
    if (!epcInput.trim())
      return Alert.alert("Required", "Scan a tag or fill in EPC manually!");
    try {
      await api.patch("/rfid-tag/assign", {
        epc: epcInput.trim(),
        registrationId,
      });
      Alert.alert("Success", `Tag ${epcInput.trim()} linked perfectly.`);
      setEpcInput("");
      fetchRegistrations();
    } catch (err: any) {
      Alert.alert(
        "Assignment Error",
        err.response?.data?.message || "Failed to push EPC binding natively.",
      );
    }
  };

  const confirmedRegistrations = registrations.filter(
    (r) => r.status === "confirmed",
  );
  const filtered = confirmedRegistrations.filter(
    (r) =>
      r.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bibNumber?.toString().includes(searchQuery),
  );

  const checkedCount = confirmedRegistrations.filter((r) => r.rfidTag).length;
  const remainsCount = confirmedRegistrations.length - checkedCount;

  return (
    <View className='flex-1 mt-2 min-h-[500px]'>
      <View className='bg-card border border-border/60 rounded-2xl overflow-hidden mb-4'>
        {/* Live Check-In Header Payload */}
        <View className='p-4 border-b border-border/50 bg-muted/10 pb-6'>
          <View className='flex-row items-center justify-between mb-4'>
            <View className='flex-row items-center gap-3'>
              <View className='w-10 h-10 rounded-xl bg-primary/10 items-center justify-center'>
                <Radio size={20} color='hsl(173, 50%, 50%)' />
              </View>
              <View>
                <Text className='font-bold text-foreground text-lg tracking-wide'>
                  Race Check-In
                </Text>
                <View className='flex-row items-center gap-2 mt-1 -ml-1'>
                  <View
                    className={`flex-row items-center px-1.5 py-0.5 rounded-full border ${isConnected ? "bg-primary/20 border-primary/30" : "bg-muted border-border"}`}
                  >
                    {isConnected ? (
                      <Wifi size={10} color='hsl(173, 50%, 50%)' />
                    ) : (
                      <WifiOff size={10} color='hsl(0, 0%, 50%)' />
                    )}
                    <Text
                      className={`font-bold text-[8px] uppercase ml-1 tracking-wider ${isConnected ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {isConnected ? "LIVE" : "OFFLINE"}
                    </Text>
                  </View>
                  <View className='flex-row items-center px-1.5 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/30'>
                    <Text className='font-bold text-[8px] uppercase text-emerald-600 tracking-wider'>
                      {checkedCount} Done
                    </Text>
                  </View>
                  <View className='flex-row items-center px-1.5 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/30'>
                    <Text className='font-bold text-[8px] uppercase text-amber-600 tracking-wider'>
                      {remainsCount} pending
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* EPC Code Assigner Bar Dynamic Flashing Node! */}
          <View
            className={`flex-row items-center bg-background rounded-xl border border-border/50 p-2 mb-4 transition-all duration-300 ${isFlashing ? "bg-primary/10 border-primary shadow-lg shadow-primary/20" : ""}`}
          >
            <View
              className={`w-8 h-8 rounded-lg items-center justify-center ${isFlashing ? "bg-primary/20" : "bg-muted"}`}
            >
              <Tag
                size={16}
                color={isFlashing ? "hsl(173, 50%, 50%)" : "hsl(0, 0%, 50%)"}
              />
            </View>
            <TextInput
              className='flex-1 px-3 py-1 font-mono text-sm font-bold text-foreground tracking-widest'
              placeholder='Awaiting hardware node scans or typing...'
              value={epcInput}
              onChangeText={setEpcInput}
            />
            {epcInput.trim().length > 0 && (
              <View className='bg-primary/20 px-2 py-1 rounded border border-primary/30'>
                <Text className='text-[10px] font-bold text-primary uppercase'>
                  Readied Mapping
                </Text>
              </View>
            )}
          </View>

          <View className='relative'>
            <View className='absolute left-3 top-1/2 -mt-2 z-10 w-4 h-4 justify-center items-center'>
              <Search size={16} color='hsl(0, 0%, 50%)' />
            </View>
            <TextInput
              placeholder='Search participants list locally...'
              value={searchQuery}
              onChangeText={setSearchQuery}
              className='bg-background border border-border/60 rounded-xl pl-10 pr-4 h-12 text-foreground font-medium'
            />
          </View>
        </View>

        {/* Runners Assignments Form Table Nodes */}
        <View className='flex-1 min-h-[300px]'>
          {isLoading ? (
            <View className='py-20 items-center justify-center'>
              <ActivityIndicator color='hsl(173, 50%, 50%)' />
            </View>
          ) : (
            <ScrollView horizontal style={{ flex: 1 }}>
              <View>
                <View
                  className='flex-row bg-muted/30 border-b border-border/50 px-4 py-3'
                  style={{ width: 850 }}
                >
                  <Text className='w-[80px] font-bold text-xs text-muted-foreground uppercase'>
                    Bib #
                  </Text>
                  <Text className='w-[180px] font-bold text-xs text-muted-foreground uppercase'>
                    Name
                  </Text>
                  <Text className='w-[160px] font-bold text-xs text-muted-foreground uppercase'>
                    Email
                  </Text>
                  <Text className='w-[120px] font-bold text-xs text-muted-foreground uppercase'>
                    Category
                  </Text>
                  <Text className='w-[140px] font-bold text-xs text-muted-foreground uppercase'>
                    RFID Tag
                  </Text>
                  <Text className='w-[140px] font-bold text-xs text-muted-foreground uppercase text-right pr-4'>
                    Actions
                  </Text>
                </View>

                {filtered.length === 0 ? (
                  <View className='py-12 items-center justify-center overflow-hidden w-full min-w-[850px]'>
                    <Tag size={32} color='hsl(0, 0%, 50%)' />
                    <Text className='text-muted-foreground text-center mt-3 font-medium'>
                      No checked-in mapping records locally.
                    </Text>
                  </View>
                ) : (
                  filtered.map((reg) => {
                    const hasTag = !!reg.rfidTag;
                    return (
                      <View
                        key={reg._id}
                        className='flex-row items-center border-b border-border/30 px-4 py-3 hover:bg-muted/10 w-[850px]'
                      >
                        <Text className='w-[80px] font-extrabold text-foreground text-sm'>
                          {reg.bibNumber ?? "--"}
                        </Text>
                        <Text
                          className='w-[180px] font-bold text-foreground text-sm'
                          numberOfLines={1}
                        >
                          {reg.user.name}
                        </Text>
                        <Text
                          className='w-[160px] font-medium text-muted-foreground text-xs'
                          numberOfLines={1}
                        >
                          {reg.user.email}
                        </Text>
                        <View className='w-[120px]'>
                          <View className='bg-muted px-2 py-1 rounded-md self-start border border-border/40'>
                            <Text
                              className='font-bold text-[10px] text-muted-foreground uppercase'
                              numberOfLines={1}
                            >
                              {reg.raceCategory?.name ?? "--"}
                            </Text>
                          </View>
                        </View>

                        <View className='w-[140px]'>
                          {hasTag ? (
                            <View className='flex-row items-center px-2 py-1 rounded-md border bg-emerald-500/10 border-emerald-500/30 self-start'>
                              <CheckCircle2
                                size={12}
                                color='hsl(160, 84%, 39%)'
                              />
                              <Text className='font-bold text-[10px] uppercase text-emerald-600 tracking-wider ml-1'>
                                Assigned
                              </Text>
                            </View>
                          ) : (
                            <View className='flex-row items-center px-2 py-1 rounded-md border bg-amber-500/10 border-amber-500/30 self-start'>
                              <Text className='font-bold text-[10px] uppercase text-amber-600 tracking-wider'>
                                Awaiting
                              </Text>
                            </View>
                          )}
                        </View>

                        <View className='w-[140px] items-end px-4'>
                          {hasTag ? (
                            <View className='bg-muted px-2 py-1 rounded border border-border/60'>
                              <Text className='text-[10px] font-mono tracking-widest text-muted-foreground'>
                                {(reg.rfidTag as any)?.epc || "BND"}
                              </Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              disabled={!epcInput.trim()}
                              onPress={() => handleAssign(reg._id)}
                              className={`flex-row items-center px-3 py-2 rounded-lg border shadow-sm ${epcInput.trim() ? "bg-primary/10 border-primary/40" : "bg-muted border-border/60 opacity-50"}`}
                            >
                              <Tag
                                size={12}
                                color={
                                  epcInput.trim()
                                    ? "hsl(173, 50%, 50%)"
                                    : "hsl(0, 0%, 50%)"
                                }
                              />
                              <Text
                                className={`ml-1.5 font-bold text-[10px] uppercase tracking-widest ${epcInput.trim() ? "text-primary" : "text-muted-foreground"}`}
                              >
                                Assign
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}
