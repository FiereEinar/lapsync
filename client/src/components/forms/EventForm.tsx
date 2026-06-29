import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DialogClose } from "@radix-ui/react-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { createEventSchema } from "@/schemas/event.schema";
import { formatDatesForInput } from "@/lib/utils";
import { MapPin, Calendar, Clock, Users, Plus, Trash2, Loader2, CheckCircle2, Map } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const venueIcon = L.divIcon({
  className: "bg-transparent border-none overflow-visible",
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);position:absolute;left:12px;top:36px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#f59e0b" stroke="white" stroke-width="2">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3" fill="white" stroke="none"/>
      </svg>
    </div>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
});

/** Inner component — listens to map clicks to place the pin */
function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export type EventFormValues = z.infer<typeof createEventSchema>;

type EventFormProps = {
  defaultValues: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => Promise<void>;
  submitLabel: string;
};

export function EventForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: formatDatesForInput(defaultValues),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "raceCategories",
  });

  const [showMap, setShowMap] = useState(false);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(() => {
    const coords = defaultValues?.location?.coordinates;
    if (coords?.lat && coords?.lng) return { lat: coords.lat, lng: coords.lng };
    return null;
  });

  // Sync pin into form coordinates whenever pin changes
  useEffect(() => {
    if (pin) {
      form.setValue("location.coordinates.lat" as any, pin.lat);
      form.setValue("location.coordinates.lng" as any, pin.lng);
    }
  }, [pin, form]);

  const handlePinPick = (lat: number, lng: number) => {
    setPin({ lat, lng });
  };

  const mapCenter: [number, number] = pin
    ? [pin.lat, pin.lng]
    : [14.5995, 120.9842];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Section: Event Info */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
            <Calendar className='w-4 h-4' />
            Event Information
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder='City Marathon 2024' className='rounded-xl' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder='Brief event description (optional)' className='rounded-xl' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type='date' className='rounded-xl' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='startTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type='time' className='rounded-xl' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Location */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
            <MapPin className='w-4 h-4' />
            Location
          </div>
          <div className='grid grid-cols-3 gap-4'>
            <FormField
              control={form.control}
              name='location.venue'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Downtown' className='rounded-xl' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='location.city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Davao' className='rounded-xl' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='location.province'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Davao del Sur' className='rounded-xl' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Venue Map Picker */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-foreground'>Venue Pin</p>
              <div className='flex items-center gap-2'>
                {pin && (
                  <span className='flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full'>
                    <CheckCircle2 className='w-3.5 h-3.5' />
                    Pinned ({pin.lat.toFixed(4)}°, {pin.lng.toFixed(4)}°)
                  </span>
                )}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='gap-1.5 rounded-xl text-xs h-8'
                  onClick={() => setShowMap((v) => !v)}
                >
                  <Map className='w-3.5 h-3.5' />
                  {showMap ? "Hide Map" : pin ? "Move Pin" : "Pin Venue on Map"}
                </Button>
                {pin && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='text-xs h-8 text-muted-foreground hover:text-destructive rounded-xl'
                    onClick={() => {
                      setPin(null);
                      form.setValue("location.coordinates" as any, undefined);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {showMap && (
              <div className='rounded-xl overflow-hidden border border-border shadow-sm' style={{ height: 280 }}>
                <MapContainer
                  key={`${mapCenter[0]},${mapCenter[1]}`}
                  center={mapCenter}
                  zoom={pin ? 15 : 6}
                  style={{ height: "100%", width: "100%" }}
                  className='z-0'
                >
                  <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                  <MapClickHandler onPick={handlePinPick} />
                  {pin && (
                    <Marker position={[pin.lat, pin.lng]} icon={venueIcon} />
                  )}
                </MapContainer>
              </div>
            )}

            {!showMap && !pin && (
              <p className='text-xs text-muted-foreground'>
                Optionally pin the exact venue location on a map so runners can easily find it.
              </p>
            )}
          </div>

          <FormField
            control={form.control}
            name='hardwarePickupLocation'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hardware &amp; Bib Pickup</FormLabel>
                <FormControl>
                  <Input placeholder='Location where runners pickup bibs/hardware' className='rounded-xl' {...field} value={field.value || ""} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Section: Registration */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
            <Clock className='w-4 h-4' />
            Registration Period
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='registration.opensAt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opens At</FormLabel>
                  <FormControl>
                    <Input type='date' className='rounded-xl' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='registration.closesAt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closes At</FormLabel>
                  <FormControl>
                    <Input type='date' className='rounded-xl' {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Race Categories */}
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
              <Users className='w-4 h-4' />
              Race Categories
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='gap-1.5 rounded-xl text-xs'
              onClick={() =>
                append({
                  name: "",
                  distanceKm: 5,
                  cutoffTime: 60,
                  gunStartTime: "",
                  price: 500,
                  slots: 100,
                })
              }
            >
              <Plus className='w-3.5 h-3.5' />
              Add Category
            </Button>
          </div>

          <div className='space-y-3'>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className='rounded-xl bg-muted/30 border border-border p-4 space-y-3'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                    Category {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => remove(index)}
                      className='text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0 rounded-lg'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </Button>
                  )}
                </div>
                <div className='grid grid-cols-6 gap-3'>
                  <FormField
                    control={form.control}
                    name={`raceCategories.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>Name</FormLabel>
                        <FormControl>
                          <Input placeholder='5K Run' className='rounded-lg h-9 text-sm' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`raceCategories.${index}.distanceKm`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>Distance (km)</FormLabel>
                        <FormControl>
                          <Input type='number' className='rounded-lg h-9 text-sm' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`raceCategories.${index}.cutoffTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>Cutoff (min)</FormLabel>
                        <FormControl>
                          <Input type='number' placeholder='min' className='rounded-lg h-9 text-sm' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`raceCategories.${index}.gunStartTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>Gun Start</FormLabel>
                        <FormControl>
                          <Input type='time' className='rounded-lg h-9 text-sm' {...field} value={field.value || ""} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`raceCategories.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>Price</FormLabel>
                        <FormControl>
                          <Input type='number' className='rounded-lg h-9 text-sm' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`raceCategories.${index}.slots`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>Slots</FormLabel>
                        <FormControl>
                          <Input type='number' className='rounded-lg h-9 text-sm' {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className='gap-2 pt-2'>
          <DialogClose asChild>
            <Button variant='outline' className='rounded-xl'>Cancel</Button>
          </DialogClose>

          <Button
            disabled={form.formState.isSubmitting}
            type='submit'
            className='rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20'
          >
            {form.formState.isSubmitting && <Loader2 className='w-4 h-4 animate-spin' />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
