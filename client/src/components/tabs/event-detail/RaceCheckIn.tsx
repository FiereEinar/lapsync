import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, CheckCircle2, Radio, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Event } from "@/types/event";
import { Registration } from "@/types/registration";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import axiosInstance from "@/api/axios";

type RaceCheckInProps = {
  event: Event;
};

export default function RaceCheckIn({ event }: RaceCheckInProps) {
  const [epcInput, setEpcInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ── Fetch registrations for this event ──
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

  // ── Assign RFID tag mutation ──
  const assignMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const { data } = await axiosInstance.patch("/rfid-tag/assign", {
        epc: epcInput.trim(),
        registrationId,
      });
      return data;
    },
    onSuccess: (_data, _registrationId) => {
      toast({
        title: "Tag Assigned",
        description: `RFID tag "${epcInput.trim()}" has been assigned successfully.`,
      });
      // Invalidate both queries so UI refreshes
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.REGISTRATIONS, event._id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.RFID_TAGS],
      });
      setEpcInput("");
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description:
          error?.message || "Failed to assign RFID tag. Please try again.",
        variant: "destructive",
      });
    },
  });

  // ── Derived lists ──
  const confirmedRegistrations = registrations.filter(
    (r) => r.status === "confirmed",
  );

  const filteredRegistrations = confirmedRegistrations.filter(
    (r) =>
      r.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bibNumber?.toString().includes(searchQuery),
  );

  const checkedInCount = confirmedRegistrations.filter((r) => r.rfidTag).length;
  const notCheckedInCount = confirmedRegistrations.length - checkedInCount;

  const isEpcValid = epcInput.trim().length > 0;

  return (
    <Card className='rounded-xl border border-border shadow-sm'>
      <CardHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <CardTitle className='flex items-center gap-2 text-xl'>
                <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                  <Radio className='w-5 h-5 text-primary' />
                </div>
                Race-Day Check-in
              </CardTitle>
              <p className='text-sm text-muted-foreground mt-2 pl-12'>
                Scan or enter an RFID tag EPC, then assign it to a confirmed
                participant.
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Badge
                variant='outline'
                className='bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 uppercase tracking-wider text-[10px]'
              >
                <CheckCircle2 className='w-3 h-3 mr-1' />
                {checkedInCount} checked in
              </Badge>
              <Badge
                variant='outline'
                className='bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0 uppercase tracking-wider text-[10px]'
              >
                {notCheckedInCount} remaining
              </Badge>
            </div>
          </div>

          {/* EPC Input Section */}
          <div className='flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-muted/30 ml-0 md:ml-12'>
            <Tag className='w-5 h-5 text-muted-foreground shrink-0' />
            <Input
              placeholder='Enter or scan RFID tag EPC...'
              className='max-w-sm font-mono rounded-lg border-border/50'
              value={epcInput}
              onChange={(e) => setEpcInput(e.target.value)}
              autoFocus
            />
            {isEpcValid && (
              <Badge variant='secondary' className='shrink-0 rounded-md font-mono'>
                Ready to assign
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search */}
        <div className='mb-4'>
          <div className='relative ml-0 md:ml-12'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Search participants...'
              className='pl-9 w-[250px] rounded-xl'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Participants Table */}
        <div className='rounded-xl border border-border overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Bib #</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">RFID Status</TableHead>
                <TableHead className='text-right font-semibold'>Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {filteredRegistrations.map((registration) => {
              const hasTag = !!registration.rfidTag;

              return (
                <TableRow key={registration._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className='font-medium'>
                    {registration.bibNumber ?? "--"}
                  </TableCell>
                  <TableCell>{registration.user.name}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {registration.user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary'>
                      {registration.raceCategory?.name ?? "--"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {hasTag ? (
                      <Badge className='bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 uppercase tracking-wider text-[10px]'>
                        <CheckCircle2 className='w-3 h-3 mr-1' />
                        Checked In
                      </Badge>
                    ) : (
                      <Badge
                        variant='outline'
                        className='bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0 uppercase tracking-wider text-[10px]'
                      >
                        Awaiting Tag
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    {hasTag ? (
                      <span className='text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md border border-border/50'>
                        {(registration.rfidTag as any)?.epc ?? ""}
                      </span>
                    ) : (
                      <Button
                        size='sm'
                        disabled={!isEpcValid || assignMutation.isPending}
                        onClick={() => assignMutation.mutate(registration._id)}
                        className='gap-2 rounded-xl'
                      >
                        {assignMutation.isPending &&
                        assignMutation.variables === registration._id ? (
                          <>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <Tag className='w-4 h-4' />
                            Assign Tag
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredRegistrations.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-center py-8 text-muted-foreground'
                >
                  {confirmedRegistrations.length === 0
                    ? "No confirmed participants found for this event."
                    : "No participants match your search."}
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
