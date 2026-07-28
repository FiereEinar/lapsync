import z from 'zod';
import { validatePassword } from '../utils/utils';

// REGEX for strong password
const strongPasswordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>/?]).+$/;

const strongPasswordMessage =
	'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';

/** Philippine phone: starts with +63 or 0 followed by 9–10 digits */
const phPhoneRegex = /^(\+63|0)[0-9]{9,10}$/;

/** Name: letters, spaces, hyphens, apostrophes only */
const nameRegex = /^[a-zA-Z\s'\-\.]+$/;

export const createUserSchema = z
	.object({
		name: z
			.string()
			.min(2, 'Full name must be at least 2 characters')
			.max(80, 'Full name must be at most 80 characters')
			.regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
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
	name: z
		.string()
		.min(1, 'Full name is required')
		.max(80, 'Full name must be at most 80 characters')
		.regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
	email: z.string().email('Invalid email'),
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
	}).optional(),
	medicalInfo: z.object({
		conditions: z.string().max(500, 'Must be at most 500 characters').optional(),
		allergies: z.string().max(500, 'Must be at most 500 characters').optional(),
		medications: z.string().max(500, 'Must be at most 500 characters').optional(),
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
