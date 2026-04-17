import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Activity, Eye } from "lucide-react-native";
import api from "@/src/api/axios";

export function RunnerStatus({ event }: { event: any }) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const confirmedRunners = registrations.filter(
    (r) => r.status === "confirmed",
  );

  return (
    <View className='flex-1 mt-2 min-h-[500px]'>
      <View className='bg-card border border-border/60 rounded-2xl overflow-hidden mb-4'>
        <View className='p-4 border-b border-border/50 bg-muted/10 pb-4'>
          <View className='flex-row items-center gap-3'>
            <View className='w-10 h-10 rounded-xl bg-destructive/10 items-center justify-center'>
              <Activity size={20} color='hsl(348, 83%, 47%)' />
            </View>
            <View className='flex-1'>
              <Text className='font-bold text-foreground text-lg tracking-wide'>
                Runner Medical
              </Text>
              <Text className='text-muted-foreground text-[11px] mt-0.5 leading-relaxed'>
                Medical Details and Telemetry Logs natively parsed. Personal
                Telemetry Modal is disabled on Mobile.
              </Text>
            </View>
          </View>
        </View>

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
                  <Text className='w-[120px] font-bold text-xs text-muted-foreground uppercase'>
                    Category
                  </Text>
                  <Text className='w-[200px] font-bold text-xs text-muted-foreground uppercase'>
                    Name
                  </Text>
                  <Text className='w-[240px] font-bold text-xs text-muted-foreground uppercase'>
                    Emergency Contact
                  </Text>
                  <Text className='w-[120px] font-bold text-xs text-muted-foreground uppercase'>
                    RFID Status
                  </Text>
                  <Text className='w-[170px] font-bold text-xs text-muted-foreground uppercase text-right pr-4'>
                    Action
                  </Text>
                </View>

                {confirmedRunners.length === 0 ? (
                  <View className='py-12 items-center justify-center overflow-hidden w-full min-w-[850px]'>
                    <Activity size={32} color='hsl(0, 0%, 50%)' />
                    <Text className='text-muted-foreground text-center mt-3 font-medium'>
                      No confirmed runners mapping telemetry hooks locally.
                    </Text>
                  </View>
                ) : (
                  confirmedRunners.map((runner) => (
                    <View
                      key={runner._id}
                      className='flex-row items-center border-b border-border/30 px-4 py-4 hover:bg-muted/10 w-[850px]'
                    >
                      <View className='w-[120px]'>
                        <View className='bg-muted px-2 py-1 rounded-md self-start border border-border/40'>
                          <Text className='font-bold text-[10px] text-muted-foreground uppercase'>
                            {runner.raceCategory?.name ?? "N/A"}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className='w-[200px] font-bold text-foreground text-sm'
                        numberOfLines={1}
                      >
                        {runner.user?.name}
                      </Text>
                      <View className='w-[240px]'>
                        {runner.emergencyContact ? (
                          <View>
                            <Text className='font-semibold text-foreground text-sm'>
                              {runner.emergencyContact.name}
                            </Text>
                            <Text className='text-muted-foreground font-mono text-xs mt-0.5 tracking-wider'>
                              {runner.emergencyContact.phone}
                            </Text>
                          </View>
                        ) : (
                          <Text className='text-muted-foreground text-xs italic'>
                            Not provided
                          </Text>
                        )}
                      </View>
                      <View className='w-[120px]'>
                        {runner.rfidTag ? (
                          <View className='flex-row items-center px-2 py-1 rounded-md border bg-emerald-500/10 border-emerald-500/30 self-start'>
                            <Activity size={10} color='hsl(160, 84%, 39%)' />
                            <Text className='font-bold text-[10px] uppercase text-emerald-600 tracking-wider ml-1'>
                              Live
                            </Text>
                          </View>
                        ) : (
                          <View className='flex-row items-center px-2 py-1 rounded-md border bg-amber-500/10 border-amber-500/30 self-start'>
                            <Text className='font-bold text-[10px] uppercase text-amber-600 tracking-wider'>
                              Pending
                            </Text>
                          </View>
                        )}
                      </View>
                      <View className='w-[170px] items-end px-4'>
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert(
                              "Not Compatible",
                              "Specific Telemetry Mapping logic is not ported to native modal stacks safely yet. View via Web.",
                            )
                          }
                          className='flex-row items-center px-3 py-2 bg-background rounded-lg border border-border/80 shadow-sm'
                        >
                          <Eye size={14} color='hsl(0, 0%, 50%)' />
                          <Text className='ml-1.5 font-bold text-xs text-muted-foreground uppercase tracking-widest'>
                            View Report
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}
