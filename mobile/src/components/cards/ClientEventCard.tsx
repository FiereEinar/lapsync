import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StatusBadge } from "../StatusBadge";
import { Calendar, MapPin, Users, Activity } from "lucide-react-native";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

export default function ClientEventCard({
  event,
  userRegistrations,
  onRegister,
  onPay,
  onPress,
}: {
  event: any;
  userRegistrations: any[];
  onRegister: () => void;
  onPay: (registrationId: string) => void;
  onPress?: () => void;
}) {
  const distances =
    event.raceCategories && event.raceCategories.length > 0
      ? event.raceCategories.map((c: any) => c.distanceKm)
      : [0];
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);

  const totalSlots = event.raceCategories
    ? event.raceCategories.reduce((sum: number, cat: any) => sum + cat.slots, 0)
    : 0;
  const totalRegistered = event.raceCategories
    ? event.raceCategories.reduce(
        (sum: number, cat: any) => sum + cat.registeredCount,
        0,
      )
    : 0;

  const distanceLabel =
    minDistance === maxDistance
      ? `${minDistance} km`
      : `${minDistance}–${maxDistance} km`;
  const rawDate = event.startDate || event.date;
  const dateStrFull = new Date(rawDate).toLocaleDateString();
  const rawDateObj = new Date(rawDate);
  const shortDate = rawDateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const location =
    typeof event.location === "object"
      ? `${event.location?.city || ""}, ${event.location?.province || ""}`
      : event.location;

  const registration = userRegistrations?.find(
    (reg: any) => reg.event?._id === event._id,
  );

  console.log(registration);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ marginBottom: 16 }}
    >
      <Card className='overflow-hidden'>
        <CardContent className='pt-4 pb-4 px-4 flex-row'>
          {/* Big Date block */}
          <View className='bg-primary/10 rounded-xl p-2 mr-4 min-w-[56px] items-center justify-center self-start mt-1'>
            <Text className='text-primary text-xl font-extrabold pb-0.5'>
              {shortDate.split(" ")[1]}
            </Text>
            <Text className='text-primary text-[10px] uppercase font-bold tracking-wider'>
              {shortDate.split(" ")[0]}
            </Text>
          </View>

          <View className='flex-1'>
            <Text
              className='text-lg font-bold text-foreground mb-1'
              numberOfLines={1}
            >
              {event.name}
            </Text>
            <View className='flex-row items-center gap-2 mb-2 flex-wrap'>
              <StatusBadge status={event.status} />
              <View className='flex-row items-center bg-muted/20 px-2 py-0.5 rounded-full border border-border/50'>
                <Activity
                  size={10}
                  color='hsl(173, 50%, 50%)'
                  style={{ marginRight: 4 }}
                />
                <Text className='text-foreground text-[10px] font-medium'>
                  {distanceLabel}
                </Text>
              </View>
            </View>

            <View className='flex-row items-center gap-3 flex-wrap mt-1'>
              <View className='flex-row items-center w-full mb-1'>
                <MapPin
                  size={12}
                  color='hsl(0, 0%, 50%)'
                  style={{ marginRight: 4 }}
                />
                <Text
                  className='text-muted-foreground text-[10px] font-medium uppercase tracking-wider'
                  numberOfLines={1}
                >
                  {location}
                </Text>
              </View>
              <View className='flex-row items-center'>
                <Users
                  size={12}
                  color='hsl(0, 0%, 50%)'
                  style={{ marginRight: 4 }}
                />
                <Text className='text-muted-foreground text-[10px] font-medium uppercase tracking-wider'>
                  {Math.max(0, totalSlots - totalRegistered)} spots remaining
                </Text>
              </View>
            </View>

            {((event.status === "upcoming" && !registration) ||
              registration) && (
              <View className='flex-row items-center mt-4 gap-2 border-t border-border/50 pt-4'>
                {event.status === "upcoming" && !registration && (
                  <Button size='sm' onPress={onRegister} className='flex-1'>
                    <Text className='text-xs text-primary-foreground font-bold'>
                      Register
                    </Text>
                  </Button>
                )}
                {registration && (
                  <View className='flex-row flex-1 gap-2'>
                    <Button
                      size='sm'
                      variant='secondary'
                      disabled
                      className='flex-1'
                    >
                      <Text className='text-xs text-muted-foreground font-bold'>
                        Registered
                      </Text>
                    </Button>

                    {registration.status === "pending" && (
                      <Button
                        size='sm'
                        onPress={() => onPay(registration._id)}
                        className='flex-1'
                      >
                        <Text className='text-xs text-primary-foreground font-bold'>
                          Pay now
                        </Text>
                      </Button>
                    )}

                    {registration.status === "confirmed" && (
                      <Button
                        size='sm'
                        disabled
                        className='flex-1 bg-teal-500/20'
                      >
                        <Text className='text-xs text-teal-700 dark:text-teal-400 font-bold'>
                          Paid
                        </Text>
                      </Button>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}
