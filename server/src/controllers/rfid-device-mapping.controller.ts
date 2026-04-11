import { BAD_REQUEST, CREATED, NOT_FOUND } from "../constant/http";
import appAssert from "../errors/app-assert";
import RfidDeviceMappingModel from "../models/rfid-device-mapping.model";
import EventModel from "../models/event.model";
import CustomResponse from "../utils/response";
import { asyncHandler } from "../utils/utils";

/**
 * @route GET /api/v1/rfid-device-mapping
 * List all RFID device mappings, populated with event details.
 */
export const getDeviceMappings = asyncHandler(async (_req, res) => {
  const mappings = await RfidDeviceMappingModel.find()
    .populate("event", "name raceCategories status")
    .sort({ createdAt: -1 })
    .lean();

  // Enrich each mapping with the race category name from the event's raceCategories array
  const enriched = mappings.map((m) => {
    const event = m.event as any;
    const category = event?.raceCategories?.find(
      (c: any) => c._id.toString() === m.raceCategory.toString(),
    );
    return {
      ...m,
      raceCategoryName: category?.name || "Unknown",
      raceCategoryDistanceKm: category?.distanceKm || 0,
    };
  });

  res.json(
    new CustomResponse(true, enriched, "Device mappings fetched successfully"),
  );
});

/**
 * @route POST /api/v1/rfid-device-mapping
 * Create a new device mapping.
 */
export const createDeviceMapping = asyncHandler(async (req, res) => {
  const { deviceName, eventId, raceCategory, scanType, checkpointName } =
    req.body;

  appAssert(deviceName, BAD_REQUEST, "Device name is required");
  appAssert(eventId, BAD_REQUEST, "Event is required");
  appAssert(raceCategory, BAD_REQUEST, "Race category is required");
  appAssert(scanType, BAD_REQUEST, "Scan type is required");

  // Validate the event exists
  const event = await EventModel.findById(eventId);
  appAssert(event, NOT_FOUND, "Event not found");

  // Validate the category exists in the event
  const category = event.raceCategories.find(
    (c) => c._id.toString() === raceCategory,
  );
  appAssert(category, NOT_FOUND, "Race category not found in this event");

  // If checkpoint, require checkpoint name
  if (scanType === "checkpoint") {
    appAssert(
      checkpointName,
      BAD_REQUEST,
      "Checkpoint name is required for checkpoint scan type",
    );
  }

  // Check for duplicate device name
  const existing = await RfidDeviceMappingModel.findOne({ deviceName });
  if (existing) {
    res
      .status(BAD_REQUEST)
      .json(
        new CustomResponse(
          false,
          null,
          `A mapping for device "${deviceName}" already exists`,
        ),
      );
    return;
  }

  const mapping = await RfidDeviceMappingModel.create({
    deviceName,
    event: eventId,
    raceCategory,
    scanType,
    checkpointName: scanType === "checkpoint" ? checkpointName : undefined,
  });

  res
    .status(CREATED)
    .json(
      new CustomResponse(true, mapping, "Device mapping created successfully"),
    );
});

/**
 * @route PATCH /api/v1/rfid-device-mapping/:id
 * Update a device mapping.
 */
export const updateDeviceMapping = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deviceName, eventId, raceCategory, scanType, checkpointName, isActive } =
    req.body;

  const mapping = await RfidDeviceMappingModel.findById(id);
  appAssert(mapping, NOT_FOUND, "Device mapping not found");

  if (deviceName !== undefined) mapping.deviceName = deviceName;
  if (eventId !== undefined) mapping.event = eventId;
  if (raceCategory !== undefined) mapping.raceCategory = raceCategory;
  if (scanType !== undefined) mapping.scanType = scanType;
  if (checkpointName !== undefined) mapping.checkpointName = checkpointName;
  if (isActive !== undefined) mapping.isActive = isActive;

  await mapping.save();

  res.json(
    new CustomResponse(true, mapping, "Device mapping updated successfully"),
  );
});

/**
 * @route DELETE /api/v1/rfid-device-mapping/:id
 * Delete a device mapping.
 */
export const deleteDeviceMapping = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mapping = await RfidDeviceMappingModel.findByIdAndDelete(id);
  appAssert(mapping, NOT_FOUND, "Device mapping not found");

  res.json(
    new CustomResponse(true, null, "Device mapping deleted successfully"),
  );
});
