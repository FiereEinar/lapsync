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
    <Card className='rounded-xl border border-border shadow-sm'>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
              <Users className='w-5 h-5 text-primary' />
            </div>
            Manage Registrations
          </CardTitle>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Search participants...'
                className='pl-9 w-[250px] rounded-xl'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-xl border border-border overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/30'>
                <TableHead className='font-semibold'>Bib #</TableHead>
                <TableHead className='font-semibold'>Name</TableHead>
                <TableHead className='font-semibold'>Email</TableHead>
                <TableHead className='font-semibold'>Category</TableHead>
                <TableHead className='font-semibold'>Device Name</TableHead>
                <TableHead className='font-semibold'>Device ID</TableHead>
                <TableHead className='font-semibold'>Phone</TableHead>
                <TableHead className='font-semibold'>Status</TableHead>
                <TableHead className='text-right font-semibold'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants &&
                filteredParticipants.map((participant) => (
                  <TableRow key={participant._id} className='hover:bg-muted/30 transition-colors'>
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
        </div>
      </CardContent>
    </Card>
  );
}
