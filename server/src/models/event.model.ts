import { Schema, model, Types } from 'mongoose';

export type EventStatus =
	| 'upcoming'
	| 'active'
	| 'finished'
	| 'archived'
	| 'stopped';

export type RaceCategory = {
	_id: string;
	name: string;
	distanceKm: number;
	cutoffTime: number; // minutes
	gunStartTime: string;
	price: number;
	slots: number;
	registeredCount: number;
};

export type Event = {
	_id: string;
	name: string;
	description: string;
	status: EventStatus;
	date: Date;
	startTime: string;
	endTime: string;
	hardwarePickupLocation?: string;
	location: {
		venue: string;
		city: string;
		province: string;
		country: string;
		coordinates: {
			lat: number;
			lng: number;
		};
	};
	raceCategories: RaceCategory[];
	registration: {
		isOpen: boolean;
		opensAt: Date;
		closesAt: Date;
	};
	createdAt: Date;
	updatedAt: Date;
};

const RaceCategorySchema = new Schema<RaceCategory>({
	name: { type: String, required: true },
	distanceKm: { type: Number, required: true },
	cutoffTime: { type: Number, required: true }, // minutes
	gunStartTime: { type: String },
	price: { type: Number, required: true },
	slots: { type: Number, required: true },
	registeredCount: { type: Number, default: 0 },
});

const EventSchema = new Schema<Event>(
	{
		name: { type: String, required: true },
		description: String,
		status: {
			type: String,
			enum: ['upcoming', 'active', 'finished'],
			default: 'upcoming',
		},

		date: { type: Date, required: true },
		startTime: String,
		endTime: String,
		hardwarePickupLocation: String,

		location: {
			venue: String,
			city: String,
			province: String,
			country: { type: String, default: 'Philippines' },
			coordinates: {
				lat: Number,
				lng: Number,
			},
		},

		raceCategories: [RaceCategorySchema],

		registration: {
			isOpen: { type: Boolean, default: false },
			opensAt: Date,
			closesAt: Date,
		},
	},
	{ timestamps: true },
);

const EventModel = model('Event', EventSchema);
export default EventModel;
