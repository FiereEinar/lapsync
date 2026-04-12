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
	slug: string;
	name: string;
	description: string;
	status: EventStatus;
	date: string;
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
		opensAt: string;
		closesAt: string;
	};
	createdAt: string;
	updatedAt: string;
};
