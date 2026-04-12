import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFieldArray, useForm } from "react-hook-form";
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
import { MapPin, Calendar, Clock, Users, Plus, Trash2, Loader2 } from "lucide-react";

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

          <FormField
            control={form.control}
            name='hardwarePickupLocation'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hardware & Bib Pickup</FormLabel>
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
