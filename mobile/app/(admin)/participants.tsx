import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Input } from "../../src/components/ui/Input";
import { Card, CardContent } from "../../src/components/ui/Card";
import { StatusBadge } from "../../src/components/StatusBadge";
import { Search, Users, Mail, Phone, Calendar, Tag, MoreVertical } from "lucide-react-native";
import api from "../../src/api/axios";
import { useRouter } from "expo-router";
import { AssignDeviceModal } from "../../src/components/modals/AssignDeviceModal";

export default function AdminParticipants() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [activeRegistration, setActiveRegistration] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/registration");
        setRegistrations(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Participants Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return registrations;
    const term = searchTerm.toLowerCase();
    return registrations.filter(
      (reg: any) =>
        reg.user?.name?.toLowerCase().includes(term) ||
        reg.user?.email?.toLowerCase().includes(term) ||
        reg.event?.name?.toLowerCase().includes(term) ||
        (reg.bibNumber && reg.bibNumber.toLowerCase().includes(term)),
    );
  }, [registrations, searchTerm]);

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
              Participants
            </Text>
            <Text className='text-2xl font-extrabold text-foreground mb-1'>
              Manage Participants
            </Text>
            <Text className='text-muted-foreground text-sm'>
              All registered participants across events
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
              placeholder='Search by name, email, or event...'
              value={searchTerm}
              onChangeText={setSearchTerm}
              className='pl-10 h-14'
            />
          </View>

          {/* Count badge */}
          <View className='flex-row items-center mb-4'>
            <View className='bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20'>
              <Text className='text-primary text-xs font-bold'>
                {filteredParticipants.length} participant
                {filteredParticipants.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* Participant Cards */}
          {filteredParticipants.length === 0 ? (
            <View className='py-16 items-center border border-dashed border-border rounded-2xl bg-muted/10'>
              <Users size={40} color='hsl(0, 0%, 40%)' />
              <Text className='text-foreground font-semibold mt-3'>
                No participants found
              </Text>
              <Text className='text-muted-foreground text-sm mt-1'>
                {searchTerm
                  ? "Try a different search term"
                  : "No registrations yet"}
              </Text>
            </View>
          ) : (
            <View className='gap-3'>
              {filteredParticipants.map((reg: any) => {
                const userName = reg.user?.name || "Unknown";
                const userEmail = reg.user?.email || "--";
                const userPhone = reg.user?.phone || "--";
                const eventName = reg.event?.name || "Unknown Event";
                const categoryName = reg.raceCategory?.name || "--";
                const bibNumber = reg.bibNumber || "--";
                const shirtSize = reg.shirtSize || "--";
                const initials = userName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <TouchableOpacity
                    key={reg._id}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (reg.event?._id) {
                        router.push(`/(admin)/event/${reg.event._id}` as any);
                      }
                    }}
                  >
                    <Card className='overflow-hidden'>
                      <CardContent className='p-4 pt-4'>
                        {/* Top row: Avatar + Name + Status */}
                        <View className='flex-row items-center mb-3'>
                          <View className='w-11 h-11 rounded-full bg-primary/15 items-center justify-center mr-3'>
                            <Text className='text-primary font-extrabold text-sm'>
                              {initials}
                            </Text>
                          </View>
                          <View className='flex-1 mr-2'>
                            <Text
                              className='text-foreground font-bold text-base'
                              numberOfLines={1}
                            >
                              {userName}
                            </Text>
                            <View className='flex-row items-center gap-1 mt-0.5'>
                              <Mail size={11} color='hsl(0, 0%, 50%)' />
                              <Text
                                className='text-muted-foreground text-xs'
                                numberOfLines={1}
                              >
                                {userEmail}
                              </Text>
                            </View>
                          </View>
                          <StatusBadge status={reg.status} />
                          <TouchableOpacity
                            onPress={() => {
                              setActiveRegistration(reg);
                              setActiveDropdownId(reg._id);
                            }}
                            className='p-2 -mr-2 ml-1'
                          >
                            <MoreVertical size={18} color='hsl(0, 0%, 70%)' />
                          </TouchableOpacity>
                        </View>

                        {/* Detail chips row */}
                        <View className='flex-row flex-wrap gap-2'>
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
                              style={{ maxWidth: 120 }}
                            >
                              {eventName}
                            </Text>
                          </View>

                          {/* Category */}
                          <View className='flex-row items-center bg-muted/30 border border-border/50 rounded-lg px-2.5 py-1.5'>
                            <Tag
                              size={12}
                              color='hsl(250, 60%, 60%)'
                              style={{ marginRight: 5 }}
                            />
                            <Text className='text-foreground text-[11px] font-medium'>
                              {categoryName}
                            </Text>
                          </View>

                          {/* Bib */}
                          <View className='flex-row items-center bg-muted/30 border border-border/50 rounded-lg px-2.5 py-1.5'>
                            <Text className='text-primary text-[11px] font-bold font-mono'>
                              #{bibNumber}
                            </Text>
                          </View>

                          {/* Shirt */}
                          {shirtSize !== "--" && (
                            <View className='flex-row items-center bg-muted/30 border border-border/50 rounded-lg px-2.5 py-1.5'>
                              <Text className='text-muted-foreground text-[11px] font-bold'>
                                {shirtSize}
                              </Text>
                            </View>
                          )}

                          {/* Phone */}
                          {userPhone !== "--" && (
                            <View className='flex-row items-center bg-muted/30 border border-border/50 rounded-lg px-2.5 py-1.5'>
                              <Phone
                                size={12}
                                color='hsl(0, 0%, 50%)'
                                style={{ marginRight: 5 }}
                              />
                              <Text className='text-foreground text-[11px] font-medium'>
                                {userPhone}
                              </Text>
                            </View>
                          )}
                        </View>
                      </CardContent>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Shared Dropdown Modal */}
      <Modal visible={!!activeDropdownId} transparent={true} animationType='fade'>
        <TouchableWithoutFeedback onPress={() => setActiveDropdownId(null)}>
          <View className='flex-1 justify-end bg-black/40'>
            <TouchableWithoutFeedback>
              <View className='bg-popover m-4 rounded-xl border border-border p-2 bottom-6 shadow-lg'>
                <View className='p-4 border-b border-border'>
                  <Text className='text-popover-foreground font-semibold text-lg'>
                    Actions for {activeRegistration?.user?.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setActiveDropdownId(null);
                    if (activeRegistration?.event?._id) {
                      router.push(
                        `/(admin)/event/${activeRegistration.event._id}` as any,
                      );
                    }
                  }}
                  className='px-4 py-4 border-b border-border'
                >
                  <Text className='text-popover-foreground text-base'>
                    View Details
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setActiveDropdownId(null);
                    setDeviceModalVisible(true);
                  }}
                  className='px-4 py-4'
                >
                  <Text className='text-popover-foreground text-base'>
                    Assign / Unassign Hardware
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Assign Device Modal */}
      {deviceModalVisible && (
        <AssignDeviceModal
          registration={activeRegistration}
          visible={deviceModalVisible}
          onClose={() => setDeviceModalVisible(false)}
          onSuccess={() => {
            setDeviceModalVisible(false);
            // Re-fetch or update local state
            const fetchData = async () => {
              try {
                const { data } = await api.get("/registration");
                setRegistrations(Array.isArray(data.data) ? data.data : []);
              } catch (error) {
                console.error("Participants Fetch Error:", error);
              }
            };
            fetchData();
          }}
        />
      )}
    </View>
  );
}
