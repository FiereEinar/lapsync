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

  // ── Activation guard ──
  // When activating, ensure no other active mapping for the same device + event
  // has a DIFFERENT scanType (e.g. can't be start AND finish at the same time).
  if (isActive === true) {
    const conflicting = await RfidDeviceMappingModel.findOne({
      _id: { $ne: mapping._id },
      deviceName: mapping.deviceName,
      event: mapping.event as any,
      isActive: true,
      scanType: { $ne: mapping.scanType },
    });

    if (conflicting) {
      const conflictType = conflicting.scanType.toUpperCase();
      res.status(BAD_REQUEST).json(
        new CustomResponse(
          false,
          null,
          `Cannot activate — device "${mapping.deviceName}" already has an active "${conflictType}" mapping for this event. Deactivate it first.`,
        ),
      );
      return;
    }
  }

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
