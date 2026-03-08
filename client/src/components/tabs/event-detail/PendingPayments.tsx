import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle, Loader2, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Event } from "@/types/event";
import { Registration } from "@/types/registration";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import axiosInstance from "@/api/axios";

type PendingPaymentsProps = {
  event: Event;
};

export default function PendingPayments({ event }: PendingPaymentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const markPaidMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const { data } = await axiosInstance.post("/payment/mark-paid", {
        registrationId,
      });
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Payment Confirmed",
        description: `${selectedRegistration?.user.name}'s payment has been marked as paid.`,
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.REGISTRATIONS, event._id],
      });
      setIsConfirmDialogOpen(false);
      setSelectedRegistration(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark payment as paid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pendingRegistrations = registrations.filter(
    (r) =>
      r.status === "pending" &&
      (r.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const openConfirmDialog = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsConfirmDialogOpen(true);
  };

  const handleMarkAsPaid = () => {
    if (!selectedRegistration) return;
    markPaidMutation.mutate(selectedRegistration._id);
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='w-5 h-5 ' />
              Pending Payments
            </CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              Registrations awaiting payment confirmation. Mark as paid for cash
              or manual payments.
            </p>
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Search pending...'
              className='pl-9 w-[250px]'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>T-Shirt</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingRegistrations.map((registration) => {
              const raceCategory = event.raceCategories.find(
                (rc) =>
                  rc._id === registration.raceCategory._id ||
                  rc._id === (registration.raceCategory as any),
              );

              return (
                <TableRow key={registration._id}>
                  <TableCell className='font-medium'>
                    {registration.user.name}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {registration.user.email}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {registration.user.phone ?? "--"}
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary'>
                      {registration.raceCategory?.name ?? "--"}
                    </Badge>
                  </TableCell>
                  <TableCell>{registration.shirtSize}</TableCell>
                  <TableCell className='font-medium'>
                    ₱
                    {raceCategory?.price?.toLocaleString() ??
                      registration.raceCategory?.price?.toLocaleString() ??
                      "--"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className='bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    >
                      {registration.payment?.status === "pending"
                        ? "Payment Pending"
                        : "Unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      size='sm'
                      onClick={() => openConfirmDialog(registration)}
                      className='gap-2'
                    >
                      <CheckCircle className='w-4 h-4' />
                      Mark as Paid
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {pendingRegistrations.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-center py-8 text-muted-foreground'
                >
                  No pending payments. All registered participants have
                  completed payment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Confirm Mark as Paid Dialog */}
        <Dialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                {selectedRegistration && (
                  <>
                    Are you sure you want to mark{" "}
                    <strong>{selectedRegistration.user.name}</strong>'s
                    registration as paid? This will confirm their registration,
                    generate a bib number, and assign a device.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className='gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={markPaidMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkAsPaid}
                disabled={markPaidMutation.isPending}
              >
                {markPaidMutation.isPending ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className='w-4 h-4 mr-2' />
                    Confirm Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
