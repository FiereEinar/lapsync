import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Calendar, Loader2, Heart, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { useUserStore } from '@/stores/user';
import { format } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/api/axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const emergencyContactRelationships = [
  'Parent',
  'Guardian',
  'Sibling',
  'Friend',
  'Spouse',
  'Other',
] as const;

/** Philippine phone: starts with +63 or 0 followed by 9–10 digits */
const phPhoneRegex = /^(\+63|0)[0-9]{9,10}$/;

/** Name: letters, spaces, hyphens, apostrophes only */
const nameRegex = /^[a-zA-Z\s'\-.]+$/;

const editProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .max(80, 'Full name must be at most 80 characters')
    .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .refine(
      (val) => val === '' || phPhoneRegex.test(val),
      'Enter a valid Philippine phone number (e.g. +639171234567 or 09171234567)',
    )
    .optional(),
  emergencyContact: z.object({
    name: z
      .string()
      .max(100, 'Contact name must be at most 100 characters')
      .optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }),
  medicalInfo: z.object({
    conditions: z.string().max(500, 'Must be at most 500 characters').optional(),
    allergies: z.string().max(500, 'Must be at most 500 characters').optional(),
    medications: z.string().max(500, 'Must be at most 500 characters').optional(),
  }),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

export default function EditProfile() {
  const { user, setUser } = useUserStore((state) => state);
  const { toast } = useToast();
  const [showEmergency, setShowEmergency] = useState(false);
  const [showMedical, setShowMedical] = useState(false);

  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ? String(user.phone) : '',
      emergencyContact: {
        name: user?.emergencyContact?.name ?? '',
        phone: user?.emergencyContact?.phone ?? '',
        relationship: user?.emergencyContact?.relationship ?? '',
      },
      medicalInfo: {
        conditions: user?.medicalInfo?.conditions ?? '',
        allergies: user?.medicalInfo?.allergies ?? '',
        medications: user?.medicalInfo?.medications ?? '',
      },
    },
  });

  const onSubmit = async (values: EditProfileValues) => {
    if (!user) return;
    try {
      const { data } = await axiosInstance.patch('/user', values);
      setUser(data.data);
      toast({
        title: 'Profile updated',
        description: 'Your profile was updated successfully.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: err?.message ?? 'Could not update profile.',
      });
    }
  };

  // Collapsed summaries
  const emergencyName = form.watch('emergencyContact.name');
  const emergencyRel = form.watch('emergencyContact.relationship');
  const medConditions = form.watch('medicalInfo.conditions');
  const medAllergies = form.watch('medicalInfo.allergies');
  const medMeds = form.watch('medicalInfo.medications');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Personal Information */}
        <Card className='rounded-xl border border-border shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className='w-4 h-4 text-primary' />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor='name'>Full Name</FormLabel>
                  <FormControl>
                    <Input id='name' className='rounded-xl' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor='email'>Email Address</FormLabel>
                  <FormControl>
                    <Input id='email' type='email' className='rounded-xl' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor='phone'>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      id='phone'
                      type='tel'
                      className='rounded-xl'
                      placeholder='+639171234567 or 09171234567'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Calendar className='w-4 h-4' />
              <span>
                Member since{' '}
                {user ? format(new Date(user.createdAt), 'MMM d, yyyy') : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Section */}
        <Card className='rounded-xl border border-border shadow-sm overflow-hidden'>
          <div
            className='flex items-center justify-between p-6 cursor-pointer hover:bg-muted/30 transition-colors'
            onClick={() => setShowEmergency(!showEmergency)}
          >
            <div className='flex items-center gap-3'>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Phone className='w-4 h-4 text-blue-500' />
              </div>
              <div>
                <h3 className='font-semibold'>Emergency Contact</h3>
                {!showEmergency && (
                  <p className='text-sm text-muted-foreground'>
                    {emergencyName
                      ? `${emergencyName} ${emergencyRel ? `• ${emergencyRel}` : ''}`
                      : 'No emergency contact saved'}
                  </p>
                )}
              </div>
            </div>
            <Button type='button' variant='ghost' size='sm' className='rounded-full w-8 h-8 p-0'>
              {showEmergency ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
            </Button>
          </div>

          {showEmergency && (
            <CardContent className='pt-0 space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='emergencyContact.name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor='em-name'>Contact Name</FormLabel>
                      <FormControl>
                        <Input
                          id='em-name'
                          className='rounded-xl'
                          placeholder='Full Name'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='emergencyContact.phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor='em-phone'>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          id='em-phone'
                          type='tel'
                          className='rounded-xl'
                          placeholder='+63...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='emergencyContact.relationship'
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel htmlFor='em-rel'>Relationship</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className='rounded-xl'>
                            <SelectValue placeholder='Select relationship' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emergencyContactRelationships.map((rel) => (
                            <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Medical Info Section */}
        <Card className='rounded-xl border border-border shadow-sm overflow-hidden'>
          <div
            className='flex items-center justify-between p-6 cursor-pointer hover:bg-muted/30 transition-colors'
            onClick={() => setShowMedical(!showMedical)}
          >
            <div className='flex items-center gap-3'>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Heart className='w-4 h-4 text-red-500' />
              </div>
              <div>
                <h3 className='font-semibold'>Medical Information</h3>
                {!showMedical && (
                  <p className='text-sm text-muted-foreground'>
                    {medConditions || medAllergies || medMeds
                      ? [medConditions, medAllergies, medMeds].filter(Boolean).join(' • ')
                      : 'No medical information saved'}
                  </p>
                )}
              </div>
            </div>
            <Button type='button' variant='ghost' size='sm' className='rounded-full w-8 h-8 p-0'>
              {showMedical ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
            </Button>
          </div>

          {showMedical && (
            <CardContent className='pt-0 space-y-4'>
              <FormField
                control={form.control}
                name='medicalInfo.conditions'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='med-cond'>Conditions</FormLabel>
                    <FormControl>
                      <Input
                        id='med-cond'
                        className='rounded-xl'
                        placeholder='e.g. Asthma, High Blood Pressure (leave blank if none)'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='medicalInfo.allergies'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='med-allergies'>Allergies</FormLabel>
                    <FormControl>
                      <Input
                        id='med-allergies'
                        className='rounded-xl'
                        placeholder='e.g. Penicillin, Peanuts (leave blank if none)'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='medicalInfo.medications'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='med-meds'>Current Medications</FormLabel>
                    <FormControl>
                      <Input
                        id='med-meds'
                        className='rounded-xl'
                        placeholder='e.g. Inhaler (leave blank if none)'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}
        </Card>

        <div className='flex justify-end'>
          <Button
            type='submit'
            className='w-full md:w-max gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20'
            disabled={form.formState.isSubmitting}
            size='lg'
          >
            {form.formState.isSubmitting && <Loader2 className='w-4 h-4 animate-spin' />}
            {form.formState.isSubmitting ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
