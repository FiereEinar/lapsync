import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, MoreVertical, Copy, Radio, Tag, TagIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddRfidTagDialog from "@/components/forms/AddRfidTagDialog";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { QUERY_KEYS } from "@/constants";
import { RfidTag } from "@/types/rfid-tag";
import _ from "lodash";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/main";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { StatCard } from "@/components/StatCard";

export default function RfidTags() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tags, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.RFID_TAGS],
    queryFn: async (): Promise<RfidTag[]> =>
      (await axiosInstance.get("/rfid-tag")).data.data,
  });

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    if (!searchQuery) return tags;
    return tags.filter(
      (tag) =>
        tag.epc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.label?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tags, searchQuery]);

  const assignedCount = tags?.filter((t) => t.status === "assigned").length || 0;
  const availableCount = tags?.filter((t) => t.status === "available").length || 0;

  const handleCopyEpc = async (epc: string) => {
    try {
      await navigator.clipboard.writeText(epc);
      toast({ title: "Copied", description: "EPC copied to clipboard" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to copy EPC" });
    }
  };

  const handleUnassign = async (tagID: string) => {
    try {
      await axiosInstance.patch(`/rfid-tag/unassign/${tagID}`);
      toast({ title: "Unassigned", description: "RFID tag unassigned successfully" });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RFID_TAGS] });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message ?? "Failed to unassign RFID tag" });
    }
  };

  const handleRemoveTag = async (tagID: string) => {
    try {
      await axiosInstance.delete(`/rfid-tag/${tagID}`);
      toast({ title: "Deleted", description: "RFID tag deleted successfully" });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RFID_TAGS] });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message ?? "Failed to delete RFID tag" });
    }
  };

  const statusBadge = (status: RfidTag["status"]) => {
    switch (status) {
      case "available":
        return <Badge className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0'>Available</Badge>;
      case "assigned":
        return <Badge className='bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0'>Assigned</Badge>;
      case "retired":
        return <Badge className='bg-muted text-muted-foreground border-0'>Retired</Badge>;
    }
  };

  return (
    <div className='space-y-6 animate-appear'>
      {/* Hero Section */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='relative flex items-center justify-between'>
          <div>
            <p className='text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2'>Hardware</p>
            <h1 className='text-2xl md:text-3xl font-extrabold text-foreground'>RFID Tags</h1>
            <p className='text-muted-foreground mt-1.5 text-sm'>Manage UHF RFID tags for race timing</p>
          </div>
          <AddRfidTagDialog />
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard title='Total Tags' value={tags?.length || 0} subtitle='All registered tags' icon={Radio} accentColor='teal' />
        <StatCard title='Assigned' value={assignedCount} subtitle='Currently in use' icon={Tag} accentColor='green' />
        <StatCard title='Available' value={availableCount} subtitle='Ready to assign' icon={TagIcon} accentColor='purple' />
      </div>

      {/* Table */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Search by EPC or label...'
                className='pl-9'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant='outline' className='gap-2 rounded-xl'>
              <Filter className='w-4 h-4' />
              Filters
            </Button>
          </div>

          <div className='rounded-xl border border-border overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30'>
                  <TableHead className='font-semibold'>EPC</TableHead>
                  <TableHead className='font-semibold'>Label</TableHead>
                  <TableHead className='font-semibold'>Status</TableHead>
                  <TableHead className='font-semibold'>Assigned To</TableHead>
                  <TableHead className='font-semibold'>Event</TableHead>
                  <TableHead className='text-right font-semibold'>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-12'>
                      <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3' />
                      <p className='text-muted-foreground text-sm'>Loading tags...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredTags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-12'>
                      <Radio className='w-10 h-10 text-muted-foreground/50 mx-auto mb-3' />
                      <p className='text-muted-foreground text-sm'>No RFID tags found. Add a tag to get started.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTags.map((tag) => (
                    <TableRow key={tag._id} className='hover:bg-muted/30 transition-colors'>
                      <TableCell className='font-mono text-sm'>
                        <div className='flex items-center gap-1.5'>
                          <code className='text-xs bg-muted/50 px-1.5 py-0.5 rounded'>{_.truncate(tag.epc, { length: 24 })}</code>
                          <Copy
                            onClick={() => handleCopyEpc(tag.epc)}
                            className='w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors'
                          />
                        </div>
                      </TableCell>
                      <TableCell className='font-medium'>
                        {tag.label || <span className='text-muted-foreground'>--</span>}
                      </TableCell>
                      <TableCell>{statusBadge(tag.status)}</TableCell>
                      <TableCell className='text-muted-foreground'>
                        {tag.registration?.user?.name ? _.startCase(tag.registration.user.name) : "--"}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {tag.registration?.event?.name
                          ? _.startCase(tag.registration.event.name)
                          : tag.event?.name
                            ? _.startCase(tag.event.name)
                            : "--"}
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm' className='rounded-lg'>
                              <MoreVertical className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            {tag.status === "assigned" && (
                              <DropdownMenuItem>
                                <button onClick={() => handleUnassign(tag._id)}>Unassign Tag</button>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className='text-destructive'>
                              <ConfirmDialog onConfirm={() => handleRemoveTag(tag._id)} trigger={<button>Remove Tag</button>} />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
