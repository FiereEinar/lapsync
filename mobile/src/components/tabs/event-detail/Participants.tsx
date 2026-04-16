import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Search, Users, MoreVertical } from "lucide-react-native";
import api from "@/src/api/axios";
import { Input } from "../../ui/Input";

export function Participants({ event }: { event: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        if (!event?._id) return;
        const res = await api.get(`/registration?eventID=${event._id}`);
        setRegistrations(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Error fetching registrations: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [event]);

  const filteredParticipants = useMemo(() => {
    return registrations.filter(
      (p) =>
        p.status === "confirmed" &&
        ((p.user?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
          (p.user?.email || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (p.bibNumber || "").toString().includes(searchQuery) ||
          (p.user?.phone || "").toString().includes(searchQuery)),
    );
  }, [registrations, searchQuery]);

  return (
    <View className='mx-6 mb-12'>
      <View className='flex-row items-center gap-3 mb-4'>
        <View className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
          <Users size={20} color='hsl(173, 50%, 50%)' />
        </View>
        <Text className='text-xl font-bold text-foreground'>
          Manage Registrations
        </Text>
      </View>

      <View className='relative mb-5'>
        <View className='absolute left-3 top-3.5 z-10'>
          <Search size={18} color='hsl(0, 0%, 50%)' />
        </View>
        <Input
          placeholder='Search participants by name, email, biblical...'
          value={searchQuery}
          onChangeText={setSearchQuery}
          className='pl-10 h-12'
        />
      </View>

      <View className='bg-card border border-border/60 rounded-2xl overflow-hidden min-h-[300px]'>
        {loading ? (
          <View className='py-16 items-center justify-center flex-1'>
            <ActivityIndicator color='hsl(173, 50%, 50%)' />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Header */}
              <View className='flex-row bg-muted/20 border-b border-border/50 px-5 py-3.5'>
                <Text className='font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-16'>
                  Bib #
                </Text>
                <Text className='font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-40'>
                  Name
                </Text>
                <Text className='font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-48'>
                  Email
                </Text>
                <Text className='font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-28'>
                  Category
                </Text>
                <Text className='font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-32'>
                  Device Name
                </Text>
                <Text className='font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-36'>
                  Phone
                </Text>
                <Text className='font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-28'>
                  Status
                </Text>
                <Text className='font-bold text-muted-foreground text-[10px] uppercase tracking-wider w-16 text-right'>
                  Action
                </Text>
              </View>

              {filteredParticipants.length === 0 ? (
                <View className='py-12 items-center justify-center w-[900px]'>
                  <Text className='text-muted-foreground'>
                    No matching participants found.
                  </Text>
                </View>
              ) : (
                filteredParticipants.map((p, i) => (
                  <View
                    key={p._id || i}
                    className='flex-row items-center border-b border-border/20 px-5 py-4'
                  >
                    <Text className='font-bold text-foreground text-sm w-16'>
                      {p.bibNumber}
                    </Text>
                    <Text
                      className='text-foreground text-sm font-medium w-40'
                      numberOfLines={1}
                    >
                      {p.user?.name}
                    </Text>
                    <Text
                      className='text-muted-foreground text-sm w-48'
                      numberOfLines={1}
                    >
                      {p.user?.email}
                    </Text>
                    <View className='w-28 pr-4'>
                      <View className='bg-muted/80 px-2 py-1 items-center justify-center rounded border border-border'>
                        <Text
                          className='text-foreground text-[10px] font-bold'
                          numberOfLines={1}
                        >
                          {p.raceCategory?.name}
                        </Text>
                      </View>
                    </View>
                    <View className='w-32 pr-4'>
                      <View className='bg-background px-2 py-1 items-center justify-center rounded border border-border/80'>
                        <Text className='text-muted-foreground text-[10px] font-mono'>
                          {p.device?.name || "--"}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className='text-foreground text-sm font-mono w-36'
                      numberOfLines={1}
                    >
                      {p.user?.phone || "--"}
                    </Text>
                    <View className='w-28 pr-4'>
                      <View className='bg-teal-500/10 px-2 py-1 items-center justify-center rounded-full border border-teal-500/20'>
                        <Text className='text-teal-600 font-extrabold text-[10px] uppercase tracking-wider'>
                          {p.status}
                        </Text>
                      </View>
                    </View>
                    <View className='w-16 items-end pr-2'>
                      <MoreVertical size={16} color='hsl(0, 0%, 50%)' />
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
