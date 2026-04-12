import EventModel from '../models/event.model';
import UserModel from '../models/user.model';
import RegistrationModel from '../models/registration.model';
import TelemetryModel from '../models/telemetry.model';
import bcrypt from 'bcryptjs';

// Realistic Trail Coordinates around Malaybalay City, Bukidnon (starting from Kaamulan Grounds towards Mt. Capistrano area visually simulated)
const basePoints = [
	{ lat: 8.1578, lon: 125.127 },
	{ lat: 8.1585, lon: 125.1268 },
	{ lat: 8.16, lon: 125.126 },
	{ lat: 8.162, lon: 125.125 },
	{ lat: 8.164, lon: 125.1235 },
	{ lat: 8.166, lon: 125.122 },
	{ lat: 8.1685, lon: 125.121 },
	{ lat: 8.171, lon: 125.12 },
	{ lat: 8.1735, lon: 125.118 },
	{ lat: 8.176, lon: 125.1165 },
	{ lat: 8.178, lon: 125.115 },
	{ lat: 8.181, lon: 125.113 },
	{ lat: 8.184, lon: 125.111 },
];

const trailPoints: { lat: number; lon: number }[] = [];
for (let i = 0; i < basePoints.length - 1; i++) {
	const p1 = basePoints[i];
	const p2 = basePoints[i + 1];

	if (p1 && p2) {
		const steps = 10; // Add 10 interpolated points between each base point
		for (let j = 0; j < steps; j++) {
			trailPoints.push({
				lat: p1.lat + (p2.lat - p1.lat) * (j / steps),
				lon: p1.lon + (p2.lon - p1.lon) * (j / steps),
			});
		}
	}
}
const lastPoint = basePoints[basePoints.length - 1];
if (lastPoint !== undefined) {
	trailPoints.push(lastPoint);
}

// const trailPoints = [
//   { lat: 8.1578, lon: 125.127 }, // Kaamulan Grounds
//   { lat: 8.1582, lon: 125.1269 },
//   { lat: 8.1589, lon: 125.1267 },
//   { lat: 8.1597, lon: 125.1264 },
//   { lat: 8.1605, lon: 125.126 },
//   { lat: 8.1614, lon: 125.1256 },
//   { lat: 8.1622, lon: 125.1251 },
//   { lat: 8.1631, lon: 125.1245 },
//   { lat: 8.164, lon: 125.1238 },
//   { lat: 8.165, lon: 125.1231 },
//   { lat: 8.1661, lon: 125.1224 },
//   { lat: 8.1672, lon: 125.1218 },
//   { lat: 8.1684, lon: 125.1213 },
//   { lat: 8.1696, lon: 125.1208 },
//   { lat: 8.1708, lon: 125.1203 },
//   { lat: 8.172, lon: 125.1197 },
//   { lat: 8.1732, lon: 125.119 },
//   { lat: 8.1744, lon: 125.1182 },
//   { lat: 8.1756, lon: 125.1174 },
//   { lat: 8.1767, lon: 125.1166 },
//   { lat: 8.1778, lon: 125.1158 },
//   { lat: 8.1789, lon: 125.115 },
//   { lat: 8.18, lon: 125.1142 },
//   { lat: 8.1812, lon: 125.1134 },
//   { lat: 8.1824, lon: 125.1125 },
//   { lat: 8.1836, lon: 125.1116 },
//   { lat: 8.1848, lon: 125.1107 },
// ];

export const seedTelemetry = async () => {
	try {
		console.log('--- Starting Telemetry Seeding ---');

		const existingTelemetry = await TelemetryModel.find();
		if (existingTelemetry.length > 0) {
			console.log('Telemetry already exists. Skipping seed.');
			return;
		}

		// Force clear for test
		// await TelemetryModel.deleteMany({});
		// await RegistrationModel.deleteMany({});
		// await UserModel.deleteMany({ email: { $regex: /^runner.*@test\.com$/ } });
		// await EventModel.deleteMany({ name: 'Bukidnon Trail Run' });

		// 1. Create Bukidnon Trail Event
		const eventPayload: any = {
			name: 'Bukidnon Trail Run',
			description:
				'A challenging scenic trail run starting at Kaamulan Grounds in Malaybalay City.',
			status: 'active',
			date: new Date('2026-08-10'),
			startTime: '05:00 AM',
			endTime: '05:00 PM',
			location: {
				venue: 'Kaamulan Grounds',
				city: 'Malaybalay City',
				province: 'Bukidnon',
				country: 'Philippines',
				coordinates: { lat: 8.1578, lng: 125.127 },
			},
			raceCategories: [
				{
					name: '21K Mountain Trail',
					distanceKm: 21,
					cutoffTime: 360,
					gunStartTime: new Date('2026-08-10T05:30:00'),
					price: 1800,
					slots: 200,
					registeredCount: 3, // We will register 3 mock users below
				},
			],
			registration: {
				isOpen: false,
				opensAt: new Date('2026-02-01'),
				closesAt: new Date('2026-07-15'),
			},
		};
		const event = await EventModel.create(eventPayload);

		// 2. Create sample users
		const passwordHash = await bcrypt.hash('password123', 10);
		const mockUsers = [
			{
				name: 'Nick Xylan Melloria',
				email: 'runner1@test.com',
				phone: 9111111111,
				password: passwordHash,
				role: 'user' as const,
				archived: false,
			},
			{
				name: 'Zoid Balba',
				email: 'runner2@test.com',
				phone: 9222222222,
				password: passwordHash,
				role: 'user' as const,
				archived: false,
			},
			{
				name: 'Fern Asinero',
				email: 'runner3@test.com',
				phone: 9333333333,
				password: passwordHash,
				role: 'user' as const,
				archived: false,
			},
			{
				name: 'Robert James Nahial',
				email: 'runner4@test.com',
				phone: 9444444444,
				password: passwordHash,
				role: 'user' as const,
				archived: false,
			},
		];

		const createdUsers = await UserModel.insertMany(mockUsers);

		// 3. Register users to the event
		const categoryId = (event as any).raceCategories[0]._id;

		const registrations = await Promise.all(
			createdUsers.map(async (user, index) => {
				return RegistrationModel.create({
					user: user._id,
					event: (event as any)._id,
					raceCategory: categoryId,
					bibNumber: 100 + index,
					shirtSize: 'M',
					emergencyContact: {
						name: 'Emergency Contact',
						phone: '09123456789',
						relationship: 'Friend',
					},
					medicalInfo: {
						conditions: 'None',
						allergies: 'None',
						medications: 'None',
					},
					status: 'confirmed',
				});
			}),
		);

		// 4. Generate Telemetry sequence
		const telemetryDocs = [];
		let baseTime = new Date('2026-08-10T05:35:00').getTime();

		for (const reg of registrations) {
			// Offset start time slightly per runner
			baseTime += Math.floor(Math.random() * 10000);

			// Each point represents roughly 5-10 minutes of running along the trail
			for (let i = 0; i < trailPoints.length; i++) {
				const point = trailPoints[i];
				if (!point) continue;

				// Add some jitter/noise to the path so runners aren't exactly overlapping
				const latJitter = (Math.random() - 0.5) * 0.00008;
				const lonJitter = (Math.random() - 0.5) * 0.00008;

				// Simulate heart rate rising and staying elevated (130 - 180 bpm)
				const heartRate = Math.floor(130 + Math.random() * 50);

				// Amplitude 20-50 when moving, occasionally higher bursts
				const emgAmplitude = (20 + Math.random() * 30 + (Math.random() > 0.9 ? 30 : 0)).toFixed(1);
				const emg = `[${emgAmplitude}, ${(parseFloat(emgAmplitude) - 2.5).toFixed(1)}]`;

				telemetryDocs.push({
					registration: reg._id,
					gps: {
						lat: point.lat + latJitter,
						lon: point.lon + lonJitter,
					},
					heartRate,
					emg,
					createdAt: new Date(baseTime + i * 3000), // Append ~3 secs per coordinate
				});
			}
		}

		await TelemetryModel.insertMany(telemetryDocs);

		console.log(
			`Successfully seeded Event, ${createdUsers.length} Users, ${registrations.length} Registrations, and ${telemetryDocs.length} Telemetries!`,
		);
		console.log('--- Telemetry Seeding Complete ---');
	} catch (error) {
		console.error('Error seeding telemetry:', error);
	}
};

export const regenerateTelemetry = async () => {
    try {
        console.log('--- Starting Telemetry Regeneration ---');

        // Restrict to Bukidnon Trail Run so we only regenerate for our main test data
        const event = await EventModel.findOne({ name: 'Bukidnon Trail Run' });
        if (!event) {
            console.log("Event not found. Cannot regenerate telemetry.");
            return;
        }

        const registrations = await RegistrationModel.find({ event: event._id });
        if (registrations.length === 0) {
            console.log("No registrations found for this event.");
            return;
        }

        // Only delete telemetry data belonging to this specific event
        await TelemetryModel.deleteMany({ registration: { $in: registrations.map(r => r._id) } });
        console.log("Cleared existing telemetry for seeded event.");

        const telemetryDocs = [];
        let baseTime = new Date('2026-08-10T05:35:00').getTime();

        for (const reg of registrations) {
            baseTime += Math.floor(Math.random() * 10000);

            for (let i = 0; i < trailPoints.length; i++) {
                const point = trailPoints[i];
                if (!point) continue;

                const latJitter = (Math.random() - 0.5) * 0.00008;
                const lonJitter = (Math.random() - 0.5) * 0.00008;
                const heartRate = Math.floor(130 + Math.random() * 50);

                // Amplitude 20-50 when moving, occasionally higher bursts
                const emgAmplitude = (20 + Math.random() * 30 + (Math.random() > 0.9 ? 30 : 0)).toFixed(1);
                const emg = `[${emgAmplitude}, ${(parseFloat(emgAmplitude) - 2.5).toFixed(1)}]`;

                telemetryDocs.push({
                    registration: reg._id,
                    gps: {
                        lat: point.lat + latJitter,
                        lon: point.lon + lonJitter,
                    },
                    heartRate,
                    emg,
                    createdAt: new Date(baseTime + i * 3000), 
                });
            }
        }

        await TelemetryModel.insertMany(telemetryDocs);
        console.log(`Successfully generated ${telemetryDocs.length} Telemetries for ${registrations.length} registrations!`);
        console.log('--- Telemetry Regeneration Complete ---');
    } catch (err) {
        console.error("Error regenerating telemetry:", err);
    }
};
