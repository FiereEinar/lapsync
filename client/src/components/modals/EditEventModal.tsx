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
import { Event } from '@/types/event';
import { Calendar } from 'lucide-react';

type EditEventDialogProps = {
	event: Event;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	trigger?: React.ReactNode;
};

export function EditEventDialog({
	event,
	open,
	onOpenChange,
	trigger,
}: EditEventDialogProps) {
	const { toast } = useToast();

	const handleUpdate = async (values: EventFormValues) => {
		try {
			await axiosInstance.patch(`/event/${event._id}`, values);

			toast({
				title: 'Event updated',
				description: 'Changes saved successfully.',
			});

			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.EVENT],
			});
			onOpenChange(false);
		} catch (error) {
			console.error('Error updating event:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description:
					error.message ?? 'An error occurred while updating the event.',
			});
		}
	};

	return (
		<>
			{event.status === 'upcoming' && (
				<Dialog open={open} onOpenChange={onOpenChange}>
					<DialogTrigger asChild>{trigger ? trigger : null}</DialogTrigger>

					<DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl'>
						<DialogHeader className='space-y-3 pb-2'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
									<Calendar className='w-5 h-5 text-primary' />
								</div>
								<div>
									<DialogTitle className='text-xl'>Edit Event</DialogTitle>
									<DialogDescription>
										Update the event details below.
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>

						<EventForm
							defaultValues={event}
							onSubmit={handleUpdate}
							submitLabel='Save Changes'
						/>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}

