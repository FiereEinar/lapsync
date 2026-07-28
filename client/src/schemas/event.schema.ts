import z from 'zod';

/** Returns today's date as a YYYY-MM-DD string (local timezone) */
const todayStr = () => {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Validates that a YYYY-MM-DD string is a real calendar date */
const isValidDateStr = (s: string) => !isNaN(Date.parse(s));

/** Compare two YYYY-MM-DD strings lexicographically (works since format is fixed) */
const dateGte = (a: string, b: string) => a >= b;
const dateGt = (a: string, b: string) => a > b;

export const raceCategorySchema = z.object({
	_id: z.string().optional(),
	name: z
		.string()
		.min(1, 'Category name is required')
		.max(50, 'Category name must be at most 50 characters'),
	distanceKm: z.coerce
		.number({ invalid_type_error: 'Distance must be a number' })
		.positive('Distance must be positive')
		.max(500, 'Distance must be at most 500 km'),
	cutoffTime: z.coerce
		.number({ invalid_type_error: 'Cutoff time must be a number' })
		.positive('Cutoff time must be positive')
		.max(10080, 'Cutoff time must be at most 10,080 minutes (1 week)'),
	gunStartTime: z.string().optional(),
	price: z.coerce
		.number({ invalid_type_error: 'Price must be a number' })
		.min(0, 'Price cannot be negative')
		.max(1_000_000, 'Price must be at most 1,000,000'),
	slots: z.coerce
		.number({ invalid_type_error: 'Slots must be a number' })
		.int('Slots must be a whole number')
		.positive('Slots must be at least 1')
		.max(100_000, 'Slots must be at most 100,000'),
});

export const createEventSchema = z
	.object({
		name: z
			.string()
			.min(3, 'Event name must be at least 3 characters')
			.max(100, 'Event name must be at most 100 characters'),
		description: z
			.string()
			.max(500, 'Description must be at most 500 characters')
			.optional(),
		date: z
			.string()
			.min(1, 'Event date is required')
			.refine(isValidDateStr, 'Please enter a valid date')
			.refine(
				(s) => dateGte(s, todayStr()),
				'Event date cannot be in the past',
			),
		startTime: z.string().optional(),
		endTime: z.string().optional(),
		hardwarePickupLocation: z
			.string()
			.max(200, 'Pickup location must be at most 200 characters')
			.optional(),

		location: z.object({
			venue: z
				.string()
				.min(1, 'Venue is required')
				.max(100, 'Venue must be at most 100 characters'),
			city: z
				.string()
				.min(1, 'City is required')
				.max(100, 'City must be at most 100 characters'),
			province: z
				.string()
				.min(1, 'Province is required')
				.max(100, 'Province must be at most 100 characters'),
			coordinates: z
				.object({
					lat: z.coerce.number().optional(),
					lng: z.coerce.number().optional(),
				})
				.optional(),
		}),

		registration: z.object({
			opensAt: z
				.string()
				.min(1, 'Registration open date is required')
				.refine(isValidDateStr, 'Please enter a valid date for registration opening')
				.refine(
					(s) => dateGte(s, todayStr()),
					'Registration open date cannot be in the past',
				),
			closesAt: z
				.string()
				.min(1, 'Registration close date is required')
				.refine(isValidDateStr, 'Please enter a valid date for registration closing'),
		}),

		raceCategories: z
			.array(raceCategorySchema)
			.min(1, 'At least one category required'),
	})
	.superRefine((data, ctx) => {
		const { opensAt, closesAt } = data.registration;
		const eventDate = data.date;

		// closesAt must be after opensAt
		if (
			isValidDateStr(opensAt) &&
			isValidDateStr(closesAt) &&
			!dateGt(closesAt, opensAt)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Registration close date must be after the open date',
				path: ['registration', 'closesAt'],
			});
		}

		// closesAt must be before or on event date
		if (
			isValidDateStr(closesAt) &&
			isValidDateStr(eventDate) &&
			dateGt(closesAt, eventDate)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Registration must close on or before the event date',
				path: ['registration', 'closesAt'],
			});
		}

		// opensAt must be before event date
		if (
			isValidDateStr(opensAt) &&
			isValidDateStr(eventDate) &&
			!dateGt(eventDate, opensAt)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Registration open date must be before the event date',
				path: ['registration', 'opensAt'],
			});
		}
	});
