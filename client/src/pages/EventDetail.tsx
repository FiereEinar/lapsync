import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Users,
  Trophy,
  Activity,
  CreditCard,
  Radio,
} from "lucide-react";
import Leaderboard from "@/components/tabs/event-detail/Leaderboard";
import RunnerStatus from "@/components/tabs/event-detail/RunnerStatus";
import MapTrack from "@/components/tabs/event-detail/MapTrack";
import Participants from "@/components/tabs/event-detail/Participants";
import PendingPayments from "@/components/tabs/event-detail/PendingPayments";
import RaceCheckIn from "@/components/tabs/event-detail/RaceCheckIn";
import EventFullDetails from "@/components/EventFullDetails";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { Event } from "@/types/event";
import { Registration } from "@/types/registration";
import { QUERY_KEYS } from "@/constants";
import RaceCategoryTable from "@/components/RaceCategoryTable";
import PersonalReport from "@/components/tabs/event-detail/PersonalReport";
import { useUserStore } from "@/stores/user";

export default function EventDetail() {
  const { eventID } = useParams();
  const { user } = useUserStore();

  const { data: eventDetail } = useQuery({
    queryKey: [QUERY_KEYS.EVENT, eventID],
    queryFn: async (): Promise<Event> => {
      const { data } = await axiosInstance.get(`/event/${eventID}`);
      return data.data;
    },
  });

  const { data: registrations = [] } = useQuery({
    queryKey: [QUERY_KEYS.REGISTRATIONS, eventID],
    queryFn: async (): Promise<Registration[]> => {
      const params = new URLSearchParams();
      if (eventID) {
        params.append("eventID", eventID);
      }
      const { data } = await axiosInstance.get(
        `/registration?${params.toString()}`,
      );
      return Array.isArray(data.data) ? data.data : [];
    },
    enabled: !!eventID,
  });

  const pendingCount = registrations.filter(
    (r) => r.status === "pending",
  ).length;

  const notCheckedInCount = registrations.filter(
    (r) => r.status === "confirmed" && !r.rfidTag,
  ).length;

  return (
    <div className='space-y-6 animate-appear'>
      {eventDetail && <EventFullDetails event={eventDetail} />}
      {eventDetail && (
        <RaceCategoryTable
          categories={eventDetail.raceCategories}
          event={eventDetail}
        />
      )}

      <Tabs defaultValue='participants' className='w-full'>
        <TabsList className='grid w-full grid-cols-3 md:grid-cols-6 rounded-xl h-auto p-1 mb-6'>
          <TabsTrigger value='participants' className='rounded-lg py-2'>
            <Users className='w-4 h-4 mr-2' />
            Participants
          </TabsTrigger>
          <TabsTrigger value='map' className='rounded-lg py-2'>
            <MapPin className='w-4 h-4 mr-2' />
            Map Track
          </TabsTrigger>
          <TabsTrigger value='leaderboard' className='rounded-lg py-2'>
            <Trophy className='w-4 h-4 mr-2' />
            Leaderboard
          </TabsTrigger>
          {user.role === 'admin' ? (
            <>
              <TabsTrigger value='pending' className='rounded-lg py-2'>
                <CreditCard className='w-4 h-4 mr-2' />
                Pending
                {pendingCount > 0 && (
                  <Badge
                    variant='destructive'
                    className='ml-2 flex items-center justify-center size-5 shrink-0 rounded-full p-0 text-[10px] font-bold'
                  >
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value='checkin' className='rounded-lg py-2'>
                <Radio className='w-4 h-4 mr-2' />
                Check-in
                {notCheckedInCount > 0 && (
                  <Badge
                    variant='destructive'
                    className='ml-2 flex items-center justify-center size-4 shrink-0 rounded-full p-0 text-[10px] font-bold'
                  >
                    {notCheckedInCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value='status' className='rounded-lg py-2'>
                <Activity className='w-4 h-4 mr-2' />
                Runner Status
              </TabsTrigger>
            </>
          ) : (
            <TabsTrigger value='reports' className='rounded-lg py-2'>
              <Activity className='w-4 h-4 mr-2' />
              My Report
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value='participants' className='space-y-4'>
          {eventDetail && <Participants event={eventDetail} />}
        </TabsContent>

        <TabsContent value='map' className='space-y-4'>
          <MapTrack />
        </TabsContent>

        <TabsContent value='leaderboard' className='space-y-4'>
          {eventDetail && <Leaderboard event={eventDetail} />}
        </TabsContent>

        {user.role === 'admin' ? (
          <>
            <TabsContent value='pending' className='space-y-4'>
              {eventDetail && <PendingPayments event={eventDetail} />}
            </TabsContent>
            <TabsContent value='checkin' className='space-y-4'>
              {eventDetail && <RaceCheckIn event={eventDetail} />}
            </TabsContent>
            <TabsContent value='status' className='space-y-4'>
              <RunnerStatus event={eventDetail} registrations={registrations} />
            </TabsContent>
          </>
        ) : (
          <TabsContent value='reports' className='space-y-4'>
            {eventDetail && <PersonalReport event={eventDetail} />}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
