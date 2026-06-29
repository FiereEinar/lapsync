import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export type Role = 'admin' | 'user';

export interface IUser extends mongoose.Document {
	name: string;
	email: string;
	phone: number;
	password: string;
	role: Role;
	profilePicture?: string;
	resetPasswordToken?: string;
	resetPasswordExpires?: Date | undefined;
	googleID: string;
	archived: boolean;
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
	createdAt: Date;
	updatedAt: Date;
	omitPassword: () => Omit<IUser, 'password'>;
}

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, minlength: 1, required: true },
		email: { type: String, required: false },
		phone: { type: Number, required: false },
		password: { type: String, required: true },
		profilePicture: { type: String, required: false },
		resetPasswordToken: { type: String, required: false },
		role: { type: String, required: true, default: 'user' },
		resetPasswordExpires: { type: Date, required: false },
		googleID: { type: String },
		archived: { type: Boolean, required: true, default: false },
		emergencyContact: {
			name: { type: String },
			phone: { type: String },
			relationship: { type: String },
		},
		medicalInfo: {
			conditions: { type: String },
			allergies: { type: String },
			medications: { type: String },
		},
	},
	{
		timestamps: true,
	},
);

UserSchema.methods.omitPassword = function () {
	const user = this.toObject();
	delete user.password;
	return user;
};

// UserSchema.pre('save', async function (next) {
// 	this.name = this.name.toLowerCase();
// });

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
