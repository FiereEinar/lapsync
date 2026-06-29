import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
} from '../ui/form';
import axiosInstance from '@/api/axios';
import { registrationSchema, ShirtSizes } from '@/schemas/registration.schema';
import { Event } from '@/types/event';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';
import { useUserStore } from '@/stores/user';
import { useEffect, useState, useMemo } from 'react';
import { Phone, Heart, ChevronDown, ChevronUp, MapPin, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import RoutingMachine from "@/components/RoutingMachine";
import { useQuery } from '@tanstack/react-query';

const emergencyContactRelationships = [
	'Parent',
	'Guardian',
	'Sibling',
	'Friend',
	'Spouse',
	'Other',
] as const;

type Checkpoint = {
  _id: string;
  name: string;
  type: "start" | "finish" | "checkpoint" | "waypoint";
  location: { lat: number; lng: number };
  order: number;
};

type RegisterEventDialogProps = {
	event: Event;
};

export function RegisterEventDialog({ event }: RegisterEventDialogProps) {
	const { toast } = useToast();
	const { user } = useUserStore();
	const [open, setOpen] = useState(false);
	
	const [showEmergency, setShowEmergency] = useState(false);
	const [showMedical, setShowMedical] = useState(false);
	
	// Map state
	const [totalRouteDistance, setTotalRouteDistance] = useState<number>(0);

	const form = useForm<z.infer<typeof registrationSchema>>({
		resolver: zodResolver(registrationSchema),
		defaultValues: {
			raceCategoryId: '',
			shirtSize: 'M',
			emergencyContact: {
				name: '',
				phone: '',
				relationship: 'Parent',
			},
			medicalInfo: {
				conditions: '',
				allergies: '',
				medications: '',
			},
		},
	});

	const watchCategoryId = form.watch('raceCategoryId');
	const watchEmergencyName = form.watch('emergencyContact.name');
	const watchEmergencyRel = form.watch('emergencyContact.relationship');
	const watchConditions = form.watch('medicalInfo.conditions');
	const watchAllergies = form.watch('medicalInfo.allergies');
	const watchMeds = form.watch('medicalInfo.medications');

	// Auto-fill from user profile
	useEffect(() => {
		if (open && user) {
			if (user.emergencyContact) {
				form.setValue('emergencyContact.name', user.emergencyContact.name || '');
				form.setValue('emergencyContact.phone', user.emergencyContact.phone || '');
				form.setValue('emergencyContact.relationship', user.emergencyContact.relationship || 'Parent');
			}
			if (user.medicalInfo) {
				form.setValue('medicalInfo.conditions', user.medicalInfo.conditions || '');
				form.setValue('medicalInfo.allergies', user.medicalInfo.allergies || '');
				form.setValue('medicalInfo.medications', user.medicalInfo.medications || '');
			}
		}
	}, [open, user, form]);

	// Fetch checkpoints for route preview when a category is selected
	const { data: checkpoints = [], isLoading: loadingCheckpoints } = useQuery({
		queryKey: ["checkpoints", event._id, watchCategoryId],
		queryFn: async (): Promise<Checkpoint[]> => {
		  const { data } = await axiosInstance.get(
			`/race-checkpoint/event/${event._id}?raceCategory=${watchCategoryId}`,
		  );
		  return data.data;
		},
		enabled: open && !!watchCategoryId,
	});

	const sortedCheckpoints = useMemo(() => {
		return [...checkpoints].sort((a, b) => {
		  const getScore = (type: string) => {
			if (type === "start") return 0;
			if (type === "finish") return 2;
			return 1;
		  };
		  const scoreA = getScore(a.type);
		  const scoreB = getScore(b.type);
		  if (scoreA !== scoreB) return scoreA - scoreB;
		  return (a.order || 0) - (b.order || 0);
		});
	}, [checkpoints]);
	
	const waypoints = useMemo(() => {
		return sortedCheckpoints.map(
		  (cp) => [cp.location.lat, cp.location.lng] as [number, number],
		);
	}, [sortedCheckpoints]);
	
	const mapCenter: [number, number] =
		sortedCheckpoints.length > 0
		  ? [sortedCheckpoints[0].location.lat, sortedCheckpoints[0].location.lng]
		  : event.location?.coordinates?.lat && event.location?.coordinates?.lng 
		  ? [event.location.coordinates.lat, event.location.coordinates.lng]
		  : [14.5995, 120.9842];

	// Get capacity data
	const selectedCategoryObj = event.raceCategories.find(c => c._id === watchCategoryId);
	const slotsLeft = selectedCategoryObj ? selectedCategoryObj.slots - selectedCategoryObj.registeredCount : null;
	const isFull = slotsLeft !== null && slotsLeft <= 0;

	const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
		if (isFull) {
			toast({
				variant: 'destructive',
				title: 'Category is full',
				description: 'This category has no remaining slots.',
			});
			return;
		}

		try {
			await axiosInstance.post(`/event/${event._id}/register`, values);

			toast({
				title: 'Registration successful',
				description: 'Proceed to payment to confirm your slot.',
			});

			form.reset();
			setOpen(false);
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENT] });
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.REGISTRATIONS],
			});
		} catch (error) {
			console.error('Error registering event:', error);
			toast({
				variant: 'destructive',
				title: 'Failed to register',
				description:
					error.message ?? 'An error occurred while registering for the event.',
			});
		}
	};

	const getPinIcon = (type: string) => {
		const color = type === "start" ? "#10b981" : type === "finish" ? "#ef4444" : type === "waypoint" ? "#94a3b8" : "#3b82f6";
		const html = `
		  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); width: 20px; height: 30px; position: absolute; left: 10px; top: 30px;">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
			  <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
			</svg>
		  </div>
		`;
		return L.divIcon({ className: "bg-transparent border-none overflow-visible", html, iconSize: [20, 30], iconAnchor: [10, 30] });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size='lg' className="w-full sm:w-auto rounded-xl">Register Now</Button>
			</DialogTrigger>

			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0'>
				<div className="p-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
					<DialogHeader>
						<DialogTitle className="text-2xl">Join {event.name}</DialogTitle>
						<DialogDescription>
							Complete your registration details below. Your profile info has been pre-filled.
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className="p-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
							{/* Race Category with Route Preview */}
							<div className="space-y-4">
								<h3 className="font-semibold flex items-center gap-2">
									<span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">1</span>
									Select Race Category
								</h3>
								<FormField
									control={form.control}
									name='raceCategoryId'
									render={({ field }) => (
										<FormItem>
											<Select value={field.value} onValueChange={field.onChange}>
												<FormControl>
													<SelectTrigger className="h-12 rounded-xl text-base">
														<SelectValue placeholder='Select category...' />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{event.raceCategories.map((cat) => (
														<SelectItem key={cat._id} value={cat._id}>
															{cat.name} ({cat.distanceKm}K) — PHP {cat.price}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								{watchCategoryId && (
									<div className="rounded-xl border border-border overflow-hidden bg-muted/20">
										<div className="p-3 border-b border-border bg-muted/40 flex items-center justify-between">
											<div className="flex items-center gap-2 text-sm font-medium">
												<MapPin className="w-4 h-4 text-primary" />
												Route Preview
											</div>
											<div className="flex items-center gap-3">
												{loadingCheckpoints ? (
													<Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
												) : (
													<>
														{totalRouteDistance > 0 && waypoints.length >= 2 && (
															<span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
																{(totalRouteDistance / 1000).toFixed(2)} km route
															</span>
														)}
														<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isFull ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600'}`}>
															{slotsLeft !== null ? `${slotsLeft} spots left` : ''}
														</span>
													</>
												)}
											</div>
										</div>
										<div className="h-[240px] relative z-0">
											{checkpoints.length === 0 && !loadingCheckpoints ? (
												<div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
													<MapPin className="w-8 h-8 opacity-20 mb-2" />
													<p className="text-sm">No route map available for this category</p>
												</div>
											) : (
												<MapContainer
													key={`${mapCenter[0]},${mapCenter[1]},${watchCategoryId}`}
													center={mapCenter}
													zoom={14}
													className="w-full h-full z-0"
													zoomControl={false}
												>
													<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
													{sortedCheckpoints.filter((cp) => cp.type !== "waypoint").map((cp) => (
														<Marker
															key={cp._id}
															position={[cp.location.lat, cp.location.lng]}
															icon={getPinIcon(cp.type)}
														>
															<Popup>
																<div className='font-bold text-xs'>{cp.name}</div>
															</Popup>
														</Marker>
													))}
													{waypoints.length >= 2 && (
														<RoutingMachine
															waypoints={waypoints}
															onRouteFound={setTotalRouteDistance}
														/>
													)}
												</MapContainer>
											)}
										</div>
									</div>
								)}
							</div>

							{/* Shirt Size */}
							<div className="space-y-4">
								<h3 className="font-semibold flex items-center gap-2">
									<span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">2</span>
									Runner Details
								</h3>
								<FormField
									control={form.control}
									name='shirtSize'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Shirt Size</FormLabel>
											<div className="flex flex-wrap gap-2 pt-1">
												{ShirtSizes.map((size) => (
													<div
														key={size}
														className={`
															cursor-pointer border rounded-lg px-4 py-2 text-sm font-medium transition-colors
															${field.value === size 
																? 'border-primary bg-primary/10 text-primary shadow-sm' 
																: 'border-border bg-card text-muted-foreground hover:bg-muted/50'}
														`}
														onClick={() => field.onChange(size)}
													>
														{size}
													</div>
												))}
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Emergency Contact */}
							<div className="space-y-4">
								<h3 className="font-semibold flex items-center gap-2">
									<span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">3</span>
									Emergency Contact
								</h3>
								<div className='rounded-xl border border-border shadow-sm overflow-hidden'>
									<div
										className='flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors'
										onClick={() => setShowEmergency(!showEmergency)}
									>
										<div className='flex items-center gap-3'>
											<div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
												<Phone className='w-4 h-4 text-blue-500' />
											</div>
											<div>
												{!showEmergency && (
													<p className='text-sm text-foreground font-medium'>
														{watchEmergencyName
															? `${watchEmergencyName} ${watchEmergencyRel ? `(${watchEmergencyRel})` : ''}`
															: 'Click to add emergency contact'}
													</p>
												)}
												{showEmergency && <p className='text-sm font-medium'>Edit Details</p>}
											</div>
										</div>
										<Button type="button" variant='ghost' size='sm' className='rounded-full w-8 h-8 p-0'>
											{showEmergency ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
										</Button>
									</div>

									{showEmergency && (
										<div className='p-4 pt-0 space-y-4 bg-muted/10'>
											<FormField
												control={form.control}
												name='emergencyContact.name'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Name</FormLabel>
														<FormControl><Input className="rounded-xl bg-background" placeholder='Full name' {...field} /></FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<div className="grid grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name='emergencyContact.phone'
													render={({ field }) => (
														<FormItem>
															<FormLabel>Phone</FormLabel>
															<FormControl><Input className="rounded-xl bg-background" placeholder='+63...' {...field} /></FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name='emergencyContact.relationship'
													render={({ field }) => (
														<FormItem>
															<FormLabel>Relationship</FormLabel>
															<Select value={field.value} onValueChange={field.onChange}>
																<FormControl>
																	<SelectTrigger className="rounded-xl bg-background"><SelectValue /></SelectTrigger>
																</FormControl>
																<SelectContent>
																	{emergencyContactRelationships.map((relation) => (
																		<SelectItem key={relation} value={relation}>{relation}</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Medical Info */}
							<div className="space-y-4">
								<h3 className="font-semibold flex items-center gap-2">
									<span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">4</span>
									Medical Information
								</h3>
								<div className='rounded-xl border border-border shadow-sm overflow-hidden'>
									<div
										className='flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors'
										onClick={() => setShowMedical(!showMedical)}
									>
										<div className='flex items-center gap-3'>
											<div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
												<Heart className='w-4 h-4 text-red-500' />
											</div>
											<div>
												{!showMedical && (
													<p className='text-sm text-foreground font-medium'>
														{watchConditions || watchAllergies || watchMeds
															? [watchConditions, watchAllergies, watchMeds].filter(Boolean).join(' • ')
															: 'None provided (Click to add)'}
													</p>
												)}
												{showEmergency && <p className='text-sm font-medium'>Edit Details</p>}
											</div>
										</div>
										<Button type="button" variant='ghost' size='sm' className='rounded-full w-8 h-8 p-0'>
											{showMedical ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
										</Button>
									</div>

									{showMedical && (
										<div className='p-4 pt-0 space-y-4 bg-muted/10'>
											<FormField
												control={form.control}
												name='medicalInfo.conditions'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Conditions</FormLabel>
														<FormControl><Input className="rounded-xl bg-background" placeholder='Asthma, heart condition...' {...field} /></FormControl>
													</FormItem>
												)}
											/>
											<div className="grid grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name='medicalInfo.allergies'
													render={({ field }) => (
														<FormItem>
															<FormLabel>Allergies</FormLabel>
															<FormControl><Input className="rounded-xl bg-background" placeholder='Food, medication...' {...field} /></FormControl>
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name='medicalInfo.medications'
													render={({ field }) => (
														<FormItem>
															<FormLabel>Medications</FormLabel>
															<FormControl><Input className="rounded-xl bg-background" placeholder='Maintenance meds...' {...field} /></FormControl>
														</FormItem>
													)}
												/>
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="pt-4 border-t border-border">
								<Button 
									type='submit' 
									size='lg' 
									className='w-full rounded-xl text-base h-14'
									disabled={isFull || form.formState.isSubmitting}
								>
									{form.formState.isSubmitting ? (
										<Loader2 className="w-5 h-5 mr-2 animate-spin" />
									) : isFull ? (
										'Category Full'
									) : (
										'Submit Registration'
									)}
								</Button>
								<p className="text-xs text-center text-muted-foreground mt-3">
									By registering, you agree to the event's terms and conditions.
								</p>
							</div>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
