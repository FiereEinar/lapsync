import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { CreditCard, Search, CheckCircle } from "lucide-react-native";
import api from "@/src/api/axios";

export function PendingPayments({ event }: { event: any }) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
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

  const processMarkPaid = async (registration: any) => {
    setProcessingId(registration._id);
    try {
      const res = await api.post("/payment/mark-paid", {
        registrationId: registration._id,
      });
      
      if (res.data?.success) {
        const successMsg = `${registration.user.name}'s payment has been marked as paid.`;
        if (Platform.OS === 'web') {
          window.alert(successMsg);
        } else {
          Alert.alert("Success", successMsg);
        }
        fetchRegistrations();
      } else {
        throw new Error(res.data?.message || "Failed to update payment");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Could not process payment update via API.";
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkPaid = async (registration: any) => {
    const title = "Confirm Payment";
    const message = `Are you sure you want to mark ${registration.user.name}'s registration as paid? This will confirm their registration, generate a bib number, and assign a device.`;

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        processMarkPaid(registration);
      }
      return;
    }

    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Payment",
          style: "default",
          onPress: () => processMarkPaid(registration),
        },
      ],
    );
  };

  const pendingRegistrations = registrations.filter(
    (r) =>
      r.status === "pending" &&
      (r.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <View className='flex-1 mt-2 min-h-[500px]'>
      <View className='bg-card border border-border/60 rounded-2xl overflow-hidden mb-4'>
        <View className='p-4 border-b border-border/50 bg-muted/10 pb-6'>
          <View className='flex-row items-center gap-3 mb-4'>
            <View className='w-10 h-10 rounded-xl bg-primary/10 items-center justify-center'>
              <CreditCard size={20} color='hsl(173, 50%, 50%)' />
            </View>
            <View className='flex-1'>
              <Text className='font-bold text-foreground text-lg tracking-wide'>
                Pending Payments
              </Text>
              <Text className='text-muted-foreground text-[11px] mt-0.5 leading-relaxed'>
                Registrations awaiting payment confirmation. Mark as paid
                natively bypassing limits.
              </Text>
            </View>
          </View>

          <View className='relative'>
            <View className='absolute left-3 top-1/2 -mt-2 z-10 w-4 h-4 justify-center items-center'>
              <Search size={16} color='hsl(0, 0%, 50%)' />
            </View>
            <TextInput
              placeholder='Search emails or identifiers...'
              value={searchQuery}
              onChangeText={setSearchQuery}
              className='bg-background border border-border/60 rounded-xl pl-10 pr-4 h-12 text-foreground font-medium'
            />
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
                  style={{ width: 900 }}
                >
                  <Text className='w-[180px] font-bold text-xs text-muted-foreground uppercase'>
                    Name
                  </Text>
                  <Text className='w-[200px] font-bold text-xs text-muted-foreground uppercase'>
                    Email
                  </Text>
                  <Text className='w-[120px] font-bold text-xs text-muted-foreground uppercase'>
                    Category
                  </Text>
                  <Text className='w-[100px] font-bold text-xs text-muted-foreground uppercase'>
                    Amount
                  </Text>
                  <Text className='w-[140px] font-bold text-xs text-muted-foreground uppercase'>
                    Status
                  </Text>
                  <Text className='w-[140px] font-bold text-xs text-muted-foreground uppercase text-right pr-4'>
                    Actions
                  </Text>
                </View>

                {pendingRegistrations.length === 0 ? (
                  <View className='py-12 items-center justify-center overflow-hidden w-full min-w-[900px]'>
                    <CheckCircle size={32} color='hsl(160, 84%, 39%)' />
                    <Text className='text-muted-foreground text-center mt-3 font-medium'>
                      All pending payments have been completed automatically!
                    </Text>
                  </View>
                ) : (
                  pendingRegistrations.map((reg) => {
                    const rc = event.raceCategories?.find(
                      (cat: any) =>
                        cat._id === reg.raceCategory?._id ||
                        cat._id === reg.raceCategory,
                    );
                    return (
                      <View
                        key={reg._id}
                        className='flex-row items-center border-b border-border/30 px-4 py-4 hover:bg-muted/10 w-[900px]'
                      >
                        <Text
                          className='w-[180px] font-bold text-foreground text-sm'
                          numberOfLines={1}
                        >
                          {reg.user.name}
                        </Text>
                        <Text
                          className='w-[200px] font-medium text-muted-foreground text-xs'
                          numberOfLines={1}
                        >
                          {reg.user.email}
                        </Text>
                        <View className='w-[120px]'>
                          <View className='bg-muted px-2 py-1 rounded-md self-start border border-border/40'>
                            <Text className='font-bold text-[10px] text-muted-foreground uppercase'>
                              {reg.raceCategory?.name ?? rc?.name ?? "--"}
                            </Text>
                          </View>
                        </View>
                        <Text className='w-[100px] font-mono tracking-widest text-[13px] font-bold text-foreground'>
                          ₱
                          {(
                            rc?.price ??
                            reg.raceCategory?.price ??
                            0
                          ).toLocaleString()}
                        </Text>

                        <View className='w-[140px]'>
                          <View className='flex-row items-center px-2 py-1.5 rounded-md border bg-amber-500/10 border-amber-500/30 self-start'>
                            <Text className='font-bold text-[10px] uppercase text-amber-600 tracking-wider'>
                              Payment Pending
                            </Text>
                          </View>
                        </View>

                        <View className='w-[140px] items-end px-4'>
                          <TouchableOpacity
                            onPress={() => handleMarkPaid(reg)}
                            disabled={processingId === reg._id}
                            className={`flex-row items-center px-3 py-2 rounded-lg border shadow-sm ${
                              processingId === reg._id 
                                ? 'bg-muted border-border' 
                                : 'bg-emerald-500/10 border-emerald-500/30'
                            }`}
                          >
                            {processingId === reg._id ? (
                              <ActivityIndicator size='small' color='hsl(0, 0%, 50%)' />
                            ) : (
                              <CheckCircle size={14} color='hsl(160, 84%, 39%)' />
                            )}
                            <Text className={`ml-1.5 font-bold text-xs uppercase tracking-widest ${
                              processingId === reg._id 
                                ? 'text-muted-foreground' 
                                : 'text-emerald-700 dark:text-emerald-400'
                            }`}>
                              {processingId === reg._id ? 'Processing' : 'Mark as Paid'}
                            </Text>
                          </TouchableOpacity>
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
