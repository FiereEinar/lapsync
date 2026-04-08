import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Search, Loader2, Check } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { useQuery } from '@tanstack/react-query';
import { Event } from '@/types/event';
import { User } from '@/types/user';
import { QUERY_KEYS } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/main';

export default function AddParticipantDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedShirtSize, setSelectedShirtSize] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: [QUERY_KEYS.EVENT],
    queryFn: async (): Promise<Event[]> => {
      const { data } = await axiosInstance.get('/event');
      return data.data;
    },
  });

  const selectedEventObj = events.find((e) => e._id === selectedEvent);
  const categories = selectedEventObj?.raceCategories || [];

  // Debounced user search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await axiosInstance.get('/user/search', {
          params: { q: searchQuery },
        });
        setSearchResults(data.data || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async () => {
    if (!selectedUser || !selectedEvent || !selectedCategory || !selectedShirtSize) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/registration/admin-add', {
        userId: selectedUser._id,
        eventId: selectedEvent,
        raceCategoryId: selectedCategory,
        shirtSize: selectedShirtSize,
      });

      toast({
        title: 'Participant added',
        description: `${selectedUser.name} has been registered successfully.`,
      });

      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REGISTRATIONS] });
      resetForm();
      setOpen(false);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to add participant',
        description: err.message || 'Something went wrong.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedEvent('');
    setSelectedCategory('');
    setSelectedShirtSize('');
  };

  const shirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className='gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20'>
          <UserPlus className='w-4 h-4' />
          Add Participant
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>
            Search for an existing user and register them for an event.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5 pt-2'>
          {/* User Search */}
          <div className='space-y-2'>
            <Label>Search User</Label>
            {selectedUser ? (
              <div className='flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20'>
                <div>
                  <p className='font-semibold text-sm'>{selectedUser.name}</p>
                  <p className='text-xs text-muted-foreground'>{selectedUser.email}</p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-xs'
                  onClick={() => { setSelectedUser(null); setSearchQuery(''); }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className='space-y-2'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    placeholder='Search by name or email...'
                    className='pl-9'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searching && (
                    <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin' />
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className='border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto'>
                    {searchResults.map((user) => (
                      <button
                        key={user._id}
                        className='w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-b-0'
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                          <span className='text-xs font-bold text-primary'>
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className='min-w-0'>
                          <p className='text-sm font-medium truncate'>{user.name}</p>
                          <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                  <p className='text-xs text-muted-foreground text-center py-3'>
                    No users found matching "{searchQuery}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Event Select */}
          <div className='space-y-2'>
            <Label>Event</Label>
            <Select value={selectedEvent} onValueChange={(v) => { setSelectedEvent(v); setSelectedCategory(''); }}>
              <SelectTrigger>
                <SelectValue placeholder='Select an event' />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Race Category Select */}
          {selectedEvent && (
            <div className='space-y-2'>
              <Label>Race Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name} ({cat.distanceKm} km) — {cat.slots - cat.registeredCount} spots left
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Shirt Size */}
          <div className='space-y-2'>
            <Label>Shirt Size</Label>
            <Select value={selectedShirtSize} onValueChange={setSelectedShirtSize}>
              <SelectTrigger>
                <SelectValue placeholder='Select size' />
              </SelectTrigger>
              <SelectContent>
                {shirtSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            className='w-full rounded-xl h-11'
            onClick={handleSubmit}
            disabled={submitting || !selectedUser || !selectedEvent || !selectedCategory || !selectedShirtSize}
          >
            {submitting ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Adding...
              </>
            ) : (
              <>
                <Check className='w-4 h-4 mr-2' />
                Add Participant
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
