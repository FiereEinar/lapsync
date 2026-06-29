import { NOT_FOUND } from '../constant/http';
import appAssert from '../errors/app-assert';
import EventModel from '../models/event.model';
import {
	createEventSchema,
	updateEventStatusSchema,
} from '../schemas/event.schema';
import CustomResponse from '../utils/response';
import { asyncHandler } from '../utils/utils';

/**
 * @route POST /api/v1/event
 */
export const createEventHandler = asyncHandler(async (req, res) => {
	const body = createEventSchema.parse(req.body);

	const filteredBody = Object.fromEntries(
		Object.entries(body).filter(([, value]) => value !== undefined),
	);

	const event = await EventModel.create(filteredBody);

	res.json(new CustomResponse(true, event, 'Event created successfully'));
});

/**
 * @route GET /api/v1/event
 */
export const getEventsHandler = asyncHandler(async (req, res) => {
	const events = await EventModel.find().sort({ createdAt: -1 });

	res.json(new CustomResponse(true, events, 'Events fetched successfully'));
});

/**
 * @route GET /api/v1/event/:eventID
 */

export const getSingleEventHandler = asyncHandler(async (req, res) => {
	const { eventID } = req.params;

	const event = await EventModel.findById(eventID);
	appAssert(event, NOT_FOUND, 'Event not found');

	res.json(new CustomResponse(true, event, 'Event fetched successfully'));
});

/**
 * @route PATCH /api/v1/event/:eventID
 */
export const editEventHandler = asyncHandler(async (req, res) => {
	const { eventID } = req.params;
	const body = createEventSchema.parse(req.body);

	const event = await EventModel.findById(eventID);
	appAssert(event, NOT_FOUND, 'Event not found');

	if (body.raceCategories) {
		body.raceCategories = body.raceCategories.map((cat) => {
			let existingCat;
			if (cat._id) {
				existingCat = event.raceCategories.find(c => c._id.toString() === cat._id);
			}
			return {
				...cat,
				registeredCount: existingCat ? existingCat.registeredCount : 0,
			};
		});
	}

	const filteredBody = Object.fromEntries(
		Object.entries(body).filter(([, value]) => value !== undefined),
	);

	const updatedEvent = await EventModel.findByIdAndUpdate(
		eventID,
		filteredBody,
		{
			new: true,
		},
	);

	res.json(
		new CustomResponse(true, updatedEvent, 'Event updated successfully'),
	);
});

/**
 * @route DELETE /api/v1/event/:eventID
 */
export const deleteEventHandler = asyncHandler(async (req, res) => {
	const { eventID } = req.params;

	const event = await EventModel.findById(eventID);
	appAssert(event, NOT_FOUND, 'Event not found');

	await EventModel.findByIdAndDelete(eventID);

	res.json(new CustomResponse(true, null, 'Event deleted successfully'));
});

/**
 * @route PATCH /api/v1/event/:eventID/status
 */
export const editStatusEventHandler = asyncHandler(async (req, res) => {
	const { eventID } = req.params;
	const body = updateEventStatusSchema.parse(req.body);

	const event = await EventModel.findById(eventID);
	appAssert(event, NOT_FOUND, 'Event not found');

	const updatedEvent = await EventModel.findByIdAndUpdate(
		eventID,
		{
			status: body.status,
		},
		{
			new: true,
		},
	);

	res.json(
		new CustomResponse(true, updatedEvent, 'Event status updated successfully'),
	);
});
