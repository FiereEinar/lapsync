import z from 'zod';

export const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z
	.object({
		name: z
			.string()
			.min(2, 'Full name must be at least 2 characters')
			.max(80, 'Full name must be at most 80 characters')
			.regex(
				/^[a-zA-Z\s'\-\.]+$/,
				'Name can only contain letters, spaces, hyphens, and apostrophes',
			),
		email: z
			.string()
			.email('Please enter a valid email address')
			.transform((val) => val.toLowerCase().trim()),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
			.regex(/[0-9]/, 'Password must contain at least one number'),
		confirmPassword: z.string(),
		agreeToTerms: z.boolean().refine((val) => val === true, {
			message: 'You must agree to the terms and conditions',
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});
