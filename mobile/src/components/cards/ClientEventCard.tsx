import React from 'react';
import { View, Text } from 'react-native';
import { StatusBadge } from '../StatusBadge';
import { Calendar, MapPin, Users } from 'lucide-react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export default function ClientEventCard({ event, userRegistrations, onRegister }: { event: any, userRegistrations: any[], onRegister: () => void }) {
  const distances = event.raceCategories && event.raceCategories.length > 0 ? event.raceCategories.map((c: any) => c.distanceKm) : [0];
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);

  const totalSlots = event.raceCategories ? event.raceCategories.reduce((sum: number, cat: any) => sum + cat.slots, 0) : 0;
  const totalRegistered = event.raceCategories ? event.raceCategories.reduce((sum: number, cat: any) => sum + cat.registeredCount, 0) : 0;

  const distanceLabel = minDistance === maxDistance ? `${minDistance} km` : `${minDistance}–${maxDistance} km`;
  const date = new Date(event.startDate || event.date).toLocaleDateString();
  const location = typeof event.location === 'object' ? `${event.location?.city || ''}, ${event.location?.province || ''}` : event.location;

  const isRegistered = userRegistrations?.some((reg: any) => reg.event?._id === event._id);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3 border-b-0 flex-col items-start gap-2">
        <View className="flex-row justify-between w-full">
           <Text className="text-2xl font-bold text-foreground mb-1 flex-1 pr-2" numberOfLines={1}>{event.name}</Text>
           <StatusBadge status={event.status} />
        </View>
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>Organized by {event.description}</Text>
      </CardHeader>
      <CardContent>
        <View className="flex-row items-center gap-4 flex-wrap mb-4">
           <View className="flex-row items-center bg-muted/20 px-2.5 py-1.5 rounded-md border border-border/50">
             <Calendar size={14} color="hsl(173, 50%, 50%)" style={{ marginRight: 6 }} />
             <Text className="text-foreground text-xs">{date}</Text>
           </View>
           <View className="flex-row items-center bg-muted/20 px-2.5 py-1.5 rounded-md border border-border/50">
             <MapPin size={14} color="hsl(173, 50%, 50%)" style={{ marginRight: 6 }} />
             <Text className="text-foreground text-xs">{location}</Text>
           </View>
           <View className="flex-row items-center bg-muted/20 px-2.5 py-1.5 rounded-md border border-border/50">
             <Text className="text-primary font-bold text-xs">{distanceLabel}</Text>
           </View>
        </View>

        <View className="flex-row items-center justify-between pt-5 border-t border-border">
          <View className="flex-row items-center flex-1">
            <Users size={14} color="hsl(0, 0%, 70%)" style={{ marginRight: 6 }} />
            <Text className="text-muted-foreground text-xs font-medium">{Math.max(0, totalSlots - totalRegistered)} spots remaining</Text>
          </View>
          <View className="flex-row gap-2">
            <Button variant="outline" size="sm">
              <Text className="text-xs">View Details</Text>
            </Button>
            {event.status === 'upcoming' && !isRegistered && (
                <Button size="sm" onPress={onRegister}>
                  <Text className="text-xs">Register</Text>
                </Button>
            )}
            {isRegistered && (
               <Button size="sm" variant="secondary" disabled>
                 <Text className="text-xs">Registered</Text>
               </Button>
            )}
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
