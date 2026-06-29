import z from 'zod';
import { validatePassword } from '../utils/utils';

const MIN_PASSWORD_LEN = 8;

// REGEX for strong password
const strongPasswordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>/?]).+$/;

const strongPasswordMessage =
	'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';

export const createUserSchema = z
	.object({
		name: z.string().min(2, 'First name must be at least 2 characters'),
		email: z.string().email('Please enter a valid email address'),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
			.regex(/[0-9]/, 'Password must contain at least one number'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const updateUserSchema = z.object({
	name: z.string().min(1, 'Full name is required'),
	email: z.string().email('Invalid email'),
	phone: z.string().optional(),
	emergencyContact: z.object({
		name: z.string().optional(),
		phone: z.string().optional(),
		relationship: z.string().optional(),
	}).optional(),
	medicalInfo: z.object({
		conditions: z.string().optional(),
		allergies: z.string().optional(),
		medications: z.string().optional(),
	}).optional(),
});

export const loginSchema = z.object({
	email: z.email('Invalid email'),
	password: z.string(),
});

export const updateUserPasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters'),

		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.superRefine((val, ctx) => {
				const errors = validatePassword(val);
				if (errors.length > 0) {
					errors.forEach((err) =>
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: err,
						}),
					);
				}
			}),

		confirmPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});
