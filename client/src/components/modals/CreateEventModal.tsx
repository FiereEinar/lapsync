import { useToast } from '@/hooks/use-toast';
import { EventForm, EventFormValues } from '../forms/EventForm';
import axiosInstance from '@/api/axios';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Plus, Calendar } from 'lucide-react';
import { useState } from 'react';

export function CreateEventDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const defaultValues = {
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: {
      venue: '',
      city: '',
      province: '',
    },
    hardwarePickupLocation: '',
    registration: {
      opensAt: '',
      closesAt: '',
    },
    raceCategories: [
      { name: '', distanceKm: 5, cutoffTime: 60, price: 500, slots: 100, gunStartTime: '' },
    ],
  };

  const handleCreate = async (values: EventFormValues) => {
    try {
      await axiosInstance.post('/event', values);

      toast({
        title: 'Event created',
        description: 'Your event has been created successfully.',
      });

      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.EVENT],
      });
      setOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message ?? 'An error occurred while creating the event.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20'>
          <Plus className='w-4 h-4' />
          Create Event
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl'>
        <DialogHeader className='space-y-3 pb-2'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
              <Calendar className='w-5 h-5 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-xl'>Create New Event</DialogTitle>
              <DialogDescription>Setup your running event details, location, and race categories.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <EventForm
          defaultValues={defaultValues}
          onSubmit={handleCreate}
          submitLabel='Create Event'
        />
      </DialogContent>
    </Dialog>
  );
}
