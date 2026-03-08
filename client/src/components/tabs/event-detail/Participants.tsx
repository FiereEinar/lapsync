import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";
import { Registration } from "@/types/registration";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import axiosInstance from "@/api/axios";
import _ from "lodash";
import ParticipantActionsDropDown from "@/components/buttons/ParticipantActionsDropDown";

type ParticipantsProps = {
  event: Event;
};

export default function Participants({ event }: ParticipantsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: registrations = [] } = useQuery({
    queryKey: [QUERY_KEYS.REGISTRATIONS, event._id],
    queryFn: async (): Promise<Registration[]> => {
      const params = new URLSearchParams();
      if (event._id) {
        params.append("eventID", event._id);
      }
      const { data } = await axiosInstance.get(
        `/registration?${params.toString()}`,
      );
      return Array.isArray(data.data) ? data.data : [];
    },
  });

  const filteredParticipants = registrations.filter(
    (p) =>
      p.status === "confirmed" &&
      (p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bibNumber.includes(searchQuery) ||
        p.user.phone.toString().includes(searchQuery)),
  );

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <CardTitle className='flex items-center gap-2'>
            <Users className='w-5 h-5 ' />
            Manage Registrations
          </CardTitle>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Search participants...'
                className='pl-9 w-[250px]'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* <RegisterEventDialog event={event} /> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bib #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Device Name</TableHead>
              <TableHead>Device ID</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants &&
              filteredParticipants.map((participant) => (
                <TableRow key={participant._id}>
                  <TableCell className='font-medium'>
                    {participant.bibNumber}
                  </TableCell>
                  <TableCell>{participant.user.name}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {participant.user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary'>
                      {participant.raceCategory.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>
                      {participant.device?.name ?? "--"}
                    </Badge>
                  </TableCell>
                  <TableCell className='font-mono text-sm'>
                    {_.truncate(participant.device?._id, { length: 20 }) ??
                      "--"}
                  </TableCell>
                  <TableCell className='font-mono text-sm'>
                    {participant.user.phone ?? "--"}
                  </TableCell>
                  <TableCell>
                    <Badge className='bg-teal-500/20 text-teal-700 dark:text-teal-300'>
                      {participant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <ParticipantActionsDropDown registration={participant} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {filteredParticipants.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='text-center py-8 text-muted-foreground'
                >
                  No participants found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
