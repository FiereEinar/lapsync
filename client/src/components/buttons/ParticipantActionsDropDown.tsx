import { MoreVertical } from 'lucide-react';
import RegistrationDetailsModal from '../modals/RegistrationDetailsModal';
import { Button } from '../ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useState } from 'react';
import { Registration } from '@/types/registration';
import AssignDeviceModal from '../modals/AssignDeviceModal';

type ParticipantActionsDropDownProps = {
	registration: Registration;
};

export default function ParticipantActionsDropDown({
	registration,
}: ParticipantActionsDropDownProps) {
	const [openModal, setOpenModal] = useState(false);
	const [openAssignModal, setOpenAssignModal] = useState(false);
	const [selectedRegForAssign, setSelectedRegForAssign] =
		useState<Registration | null>(null);

	return (
		<DropdownMenu>
			{selectedRegForAssign && (
				<AssignDeviceModal
					registration={selectedRegForAssign}
					open={openAssignModal}
					setOpen={(open) => {
						setOpenAssignModal(open);
						if (!open) setSelectedRegForAssign(null);
					}}
				/>
			)}
			<RegistrationDetailsModal
				registration={registration}
				open={openModal}
				setOpen={setOpenModal}
			/>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' size='sm'>
					<MoreVertical className='w-4 h-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem
					onClick={(e) => {
						e.preventDefault();
						setOpenModal(true);
					}}
				>
					View Details
				</DropdownMenuItem>
				<DropdownMenuItem>Edit Participant</DropdownMenuItem>
				<DropdownMenuItem
					onClick={(e) => {
						e.preventDefault();
						setSelectedRegForAssign(registration);
						setOpenAssignModal(true);
					}}
				>
					Assign Hardware
				</DropdownMenuItem>
				<DropdownMenuItem className='text-destructive'>Remove</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
