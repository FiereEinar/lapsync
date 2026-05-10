import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import ClientEventCard from "../../src/components/cards/ClientEventCard";
import { Input } from "../../src/components/ui/Input";
import { StatCard } from "../../src/components/StatCard";
import { Search, Calendar, CalendarCheck, Users } from "lucide-react-native";
import api from "../../src/api/axios";
import { RegisterEventModal } from "../../src/components/modals/RegisterEventModal";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function ClientEvents() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [activeEventToRegister, setActiveEventToRegister] = useState<any>(null);

  const fetchAll = async () => {
    try {
      const [eventsRes, regRes] = await Promise.all([
        api.get("/event"),
        api.get("/registration", { params: { user: user?._id } }),
      ]);
      setEvents(eventsRes.data.data || []);
      setRegistrations(regRes.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAll();
    }
  }, [user?._id]);

  const handlePayment = async (registrationId: string) => {
    try {
      const { data } = await api.post("/payment/create", { registrationId });
      if (data.checkoutUrl) {
        // Open the in-app browser and wait for user to close it
        const result = await WebBrowser.openBrowserAsync(data.checkoutUrl);
        
        // When browser is closed, auto-verify the payment
        try {
          const verifyRes = await api.post("/payment/verify", { registrationId });
          const verifyData = verifyRes.data;
          
          if (verifyData.success) {
            if (verifyData.message === "Payment successful" || verifyData.message === "Payment already confirmed" || verifyData.message === "Payment already processed") {
              Alert.alert("Success", "Your payment has been successfully confirmed!");
            } else if (verifyData.message === "Payment pending") {
              Alert.alert("Pending", "Your payment is still processing. It may take a moment to reflect.");
            }
          }
          // Refresh events and registrations
          fetchAll();
        } catch (verifyErr) {
          console.error("Payment verification failed", verifyErr);
          Alert.alert("Notice", "We could not automatically verify your payment at this moment. If you completed it, please wait a few minutes.");
        }
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Payment Error",
        err.response?.data?.message || "Could not initialize checkout.",
      );
    }
  };

  const filteredEvents = useMemo(() => {
    const activeEvents = events.filter((e: any) => e.status !== "finished");
    if (!searchTerm) return activeEvents;
    return activeEvents.filter(
      (ev: any) =>
        ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.location?.city || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [events, searchTerm]);

  const registeredCount = registrations.filter(
    (r: any) => r.event?.status !== "finished",
  ).length;
  const upcomingCount = events.filter(
    (e: any) => e.status === "upcoming",
  ).length;
  const totalSlots = events
    .filter((e: any) => e.status !== "finished")
    .reduce((sum: number, ev: any) => {
      return (
        sum +
        (ev.raceCategories
          ? ev.raceCategories.reduce(
              (s: number, cat: any) =>
                s + (cat.slots - (cat.registeredCount || 0)),
              0,
            )
          : 0)
      );
    }, 0);

  if (loading) {
    return (
      <View className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' color='hsl(173, 50%, 50%)' />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-background pb-6'>
      <ScrollView>
        {/* Hero Section */}
        <View className='mb-2 relative'>
          <View className='bg-primary/10 pt-16 pb-8 px-6 border border-primary/20 overflow-hidden'>
            <Text className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>
              Events
            </Text>
            <Text className='text-2xl font-extrabold text-foreground mb-1'>
              Available Events
            </Text>
            <Text className='text-muted-foreground text-sm'>
              Register for upcoming running events
            </Text>
          </View>
        </View>

        <View className='px-4 pb-20'>
          {/* Search */}
          <View className='relative mb-4 mt-2'>
            <View className='absolute left-4 top-4 z-10'>
              <Search size={20} color='hsl(173, 50%, 50%)' />
            </View>
            <Input
              placeholder='Search events by name or city...'
              value={searchTerm}
              onChangeText={setSearchTerm}
              className='pl-12 h-14 bg-card border border-border/50 rounded-2xl text-base text-foreground focus:border-primary/50 focus:bg-background transition-colors'
              placeholderTextColor='hsl(0, 0%, 50%)'
            />
          </View>

          {/* List */}
          <View className='flex flex-col'>
            {filteredEvents.length === 0 ? (
              <View className='py-12 items-center'>
                <Calendar
                  size={40}
                  color='hsl(0, 0%, 70%)'
                  className='mb-3 opacity-50'
                />
                <Text className='text-muted-foreground text-center'>
                  No events found matching your search.
                </Text>
              </View>
            ) : (
              filteredEvents.map((event: any) => (
                <ClientEventCard
                  key={event._id}
                  event={event}
                  userRegistrations={registrations}
                  onRegister={() => {
                    setActiveEventToRegister(event);
                    setRegisterModalVisible(true);
                  }}
                  onPay={handlePayment}
                  onPress={() =>
                    router.push(`/(client)/client-event/${event._id}` as any)
                  }
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Registration Modal */}
      {registerModalVisible && activeEventToRegister && (
        <RegisterEventModal
          event={activeEventToRegister}
          visible={registerModalVisible}
          onClose={() => setRegisterModalVisible(false)}
          onSuccess={() => {
            setRegisterModalVisible(false);
            fetchAll();
          }}
        />
      )}
    </View>
  );
}
