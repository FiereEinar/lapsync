import React from "react";
import { View, Text } from "react-native";
import { StatusBadge } from "../StatusBadge";
import { Calendar, MapPin, Users, Activity } from "lucide-react-native";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

export default function ClientEventCard({
  event,
  userRegistrations,
  onRegister,
}: {
  event: any;
  userRegistrations: any[];
  onRegister: () => void;
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

  const isRegistered = userRegistrations?.some(
    (reg: any) => reg.event?._id === event._id,
  );

  return (
    <Card className='mb-4 overflow-hidden'>
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

          <View className='flex-row items-center mt-4 gap-2 border-t border-border/50 pt-4'>
            <Button
              variant='outline'
              size='sm'
              className='flex-1 border-primary/30'
            >
              <Text className='text-xs text-primary font-bold'>
                View Details
              </Text>
            </Button>
            {event.status === "upcoming" && !isRegistered && (
              <Button size='sm' onPress={onRegister} className='flex-1'>
                <Text className='text-xs text-primary-foreground font-bold'>
                  Register
                </Text>
              </Button>
            )}
            {isRegistered && (
              <Button size='sm' variant='secondary' disabled className='flex-1'>
                <Text className='text-xs text-muted-foreground font-bold'>
                  Registered
                </Text>
              </Button>
            )}
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
