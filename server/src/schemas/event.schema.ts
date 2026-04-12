import z from 'zod';

export const raceCategorySchema = z.object({
	name: z.string().min(1, 'Category name is required'),
	distanceKm: z.coerce.number().positive(),
	cutoffTime: z.coerce.number().positive(),
	gunStartTime: z.string().optional(),
	price: z.coerce.number().min(0),
	slots: z.coerce.number().int().positive(),
});

export const createEventSchema = z.object({
	name: z.string().min(3),
	description: z.string().optional(),
	date: z.string(),
	startTime: z.string().optional(),
	endTime: z.string().optional(),
	hardwarePickupLocation: z.string().optional(),

	location: z.object({
		venue: z.string().min(1),
		city: z.string().min(1),
		province: z.string().min(1),
	}),

	registration: z.object({
		opensAt: z.string(),
		closesAt: z.string(),
	}),

	raceCategories: z
		.array(raceCategorySchema)
		.min(1, 'At least one category required'),
});

export const updateEventStatusSchema = z.object({
	status: z.enum(['upcoming', 'active', 'finished', 'archived', 'stopped']),
});
