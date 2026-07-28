import z from 'zod';
import { ShirtSizes } from '../models/registration.model';

/** Philippine phone: starts with +63 or 0 followed by 9–10 digits */
const phPhoneRegex = /^(\+63|0)[0-9]{9,10}$/;

export const registrationSchema = z.object({
	raceCategoryId: z.string().min(1, 'Please select a race category'),
	// Zod v4 enum: use message string directly (errorMap removed in v4)
	shirtSize: z.enum(ShirtSizes, { error: 'Please select a valid shirt size' }),
	emergencyContact: z.object({
		name: z
			.string()
			.min(2, 'Contact name must be at least 2 characters')
			.max(100, 'Contact name must be at most 100 characters')
			.regex(
				/^[a-zA-Z\s'\-\.]+$/,
				'Name can only contain letters, spaces, hyphens, and apostrophes',
			),
		phone: z
			.string()
			.min(1, 'Phone number is required')
			.regex(
				phPhoneRegex,
				'Enter a valid Philippine phone number (e.g. +639171234567 or 09171234567)',
			),
		relationship: z.string().min(2, 'Relationship is required'),
	}),
	medicalInfo: z.object({
		conditions: z.string().max(500, 'Must be at most 500 characters').optional(),
		allergies: z.string().max(500, 'Must be at most 500 characters').optional(),
		medications: z.string().max(500, 'Must be at most 500 characters').optional(),
	}),
});
