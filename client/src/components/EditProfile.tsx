import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const emergencyContactRelationships = [
  'Parent',
  'Guardian',
  'Sibling',
  'Friend',
  'Spouse',
  'Other',
] as const;

export default function EditProfile() {
  const { user, setUser } = useUserStore((state) => state);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ? String(user.phone) : '');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name ?? '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone ?? '');
  const [emergencyRel, setEmergencyRel] = useState(user?.emergencyContact?.relationship ?? '');

  // Medical Info
  const [medConditions, setMedConditions] = useState(user?.medicalInfo?.conditions ?? '');
  const [medAllergies, setMedAllergies] = useState(user?.medicalInfo?.allergies ?? '');
  const [medMeds, setMedMeds] = useState(user?.medicalInfo?.medications ?? '');

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [showEmergency, setShowEmergency] = useState(false);
  const [showMedical, setShowMedical] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.patch('/user', {
        name,
        email,
        phone,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRel,
        },
        medicalInfo: {
          conditions: medConditions,
          allergies: medAllergies,
          medications: medMeds,
        },
      });
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
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
          <div className='space-y-2'>
            <Label htmlFor='name'>Full Name</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='rounded-xl'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='rounded-xl'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number</Label>
            <Input
              id='phone'
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className='rounded-xl'
            />
          </div>
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
          <Button variant='ghost' size='sm' className='rounded-full w-8 h-8 p-0'>
            {showEmergency ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
          </Button>
        </div>

        {showEmergency && (
          <CardContent className='pt-0 space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='em-name'>Contact Name</Label>
                <Input
                  id='em-name'
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className='rounded-xl'
                  placeholder='Full Name'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='em-phone'>Phone Number</Label>
                <Input
                  id='em-phone'
                  type='tel'
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className='rounded-xl'
                  placeholder='+63...'
                />
              </div>
              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='em-rel'>Relationship</Label>
                <Select value={emergencyRel} onValueChange={setEmergencyRel}>
                  <SelectTrigger className='rounded-xl'>
                    <SelectValue placeholder='Select relationship' />
                  </SelectTrigger>
                  <SelectContent>
                    {emergencyContactRelationships.map((rel) => (
                      <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
          <Button variant='ghost' size='sm' className='rounded-full w-8 h-8 p-0'>
            {showMedical ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
          </Button>
        </div>

        {showMedical && (
          <CardContent className='pt-0 space-y-4'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='med-cond'>Conditions</Label>
                <Input
                  id='med-cond'
                  value={medConditions}
                  onChange={(e) => setMedConditions(e.target.value)}
                  className='rounded-xl'
                  placeholder='e.g. Asthma, High Blood Pressure (leave blank if none)'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='med-allergies'>Allergies</Label>
                <Input
                  id='med-allergies'
                  value={medAllergies}
                  onChange={(e) => setMedAllergies(e.target.value)}
                  className='rounded-xl'
                  placeholder='e.g. Penicillin, Peanuts (leave blank if none)'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='med-meds'>Current Medications</Label>
                <Input
                  id='med-meds'
                  value={medMeds}
                  onChange={(e) => setMedMeds(e.target.value)}
                  className='rounded-xl'
                  placeholder='e.g. Inhaler (leave blank if none)'
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className='flex justify-end'>
        <Button
          className='w-full md:w-max gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20'
          onClick={handleSubmit}
          disabled={loading}
          size='lg'
        >
          {loading && <Loader2 className='w-4 h-4 animate-spin' />}
          {loading ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
}
