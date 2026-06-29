export type Role = 'admin' | 'user';

export type User = {
	_id: string;
	name: string;
	email: string;
	phone: number;
	role: Role;
	password: string;
	archived?: boolean;
	profilePicture?: string;
	resetPasswordToken?: string;
	resetPasswordExpires?: Date | undefined;
	googleID: string;
	createdAt: Date;
	updatedAt: Date;
	emergencyContact?: {
		name?: string;
		phone?: string;
		relationship?: string;
	};
	medicalInfo?: {
		conditions?: string;
		allergies?: string;
		medications?: string;
	};
};
