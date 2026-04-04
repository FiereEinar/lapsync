import { BAD_REQUEST, OK, UNAUTHORIZED } from "../constant/http";
import appAssert from "../errors/app-assert";
import DeviceModel, { PopulatedDevice } from "../models/device.model";
import TelemetryModel from "../models/telemetry.model";
import { io } from "../server";
import { GPSPoint, haversineDistance, isValidGPS, parseStrictGPSString } from "../utils/gps";
import CustomResponse from "../utils/response";
import { asyncHandler, generateCypto } from "../utils/utils";

const lastKnownGPS = new Map<string, GPSPoint>();

/**
 * @route POST /api/v1/device/telemetry
 */
export const deviceTelemetryController = asyncHandler(async (req, res) => {
  const { deviceToken, gps, heartRate, emg, deviceId } = req.body;

  // Validate the device ID
  const device = await DeviceModel.findOne({ deviceToken: deviceId }).populate({
    path: 'registration',
    populate: [
      { path: 'user' },
      { path: 'event' }
    ]
  });

  if (!device || !device.isActive || !device.registration) {
    res.status(OK).json({ success: true });
    return;
  }

  const registration = device.registration as any;
  const registrationId = registration._id.toString();

  // GPS Parsing & Validation only if gps exists
  if (gps) {
    const parsed = parseStrictGPSString(`${gps.lat},${gps.lon}`);

    if (!parsed) {
      console.log("🚫 Corrupted GPS packet rejected:", gps);
      res.status(OK).json({ success: true });
      return;
    }

    if (!isValidGPS(parsed)) {
      console.log("🚫 Out-of-range GPS rejected:", parsed);
      res.status(OK).json({ success: true });
      return;
    }

    // 🧠 Distance jump check
    const last = lastKnownGPS.get(deviceId);
    if (last) {
      const distance = haversineDistance(last, parsed);
      const MAX_ALLOWED_JUMP_METERS = 100;

      if (distance > MAX_ALLOWED_JUMP_METERS) {
        console.log(`🚫 GPS jump rejected (${distance.toFixed(2)}m):`, {
          from: last,
          to: parsed,
        });
        res.status(OK).json({ success: true });
        return;
      }
    }

    // ✅ store valid GPS
    lastKnownGPS.set(deviceId, parsed);
  }

  // Targeted Emit to runner's specific room
  if (gps) {
    io.of("/race").to(registrationId).emit("gpsUpdate", gps);
  }

  if (heartRate) {
    io.of("/race").to(registrationId).emit("heartRateUpdate", { heartRate });
  }

  if (emg) {
    io.of("/race").to(registrationId).emit("emgUpdate", { emg });
  }

  // Admin global broadcast
  io.of("/race").emit("adminLiveUpdate", {
    registrationId,
    user: registration.user,
    emergencyContact: registration.emergencyContact,
    gps: gps || null,
    heartRate: heartRate || null,
    emg: emg || null
  });

  // Record telemetry to the database for replay if the event is currently active
  if (registration.event && registration.event.status === 'active') {
    await TelemetryModel.create({
      registration: registrationId,
      ...(gps && { gps }),
      ...(heartRate && { heartRate }),
      ...(emg && { emg }),
    });
  }

  res.status(OK).json({ success: true });
});

/**
 * @route GET /api/v1/device
 */
export const getDevices = asyncHandler(async (req, res) => {
  const devices = await DeviceModel.find().populate({
    path: "registration",
    populate: [
      {
        path: "user",
      },
      {
        path: "event",
      },
    ],
  });

  res.json(new CustomResponse(true, devices, "Devices fetched successfully"));
});

export const createDevice = asyncHandler(async (req, res) => {
  const { name, isActive } = req.body;

  const allDevices = await DeviceModel.find({});
  let highestId = 0;
  for (const d of allDevices) {
    const numericId = parseInt(d.deviceToken, 10);
    if (!isNaN(numericId) && numericId > highestId) {
      highestId = numericId;
    }
  }
  const nextDeviceToken = (highestId + 1).toString();

  const existing = await DeviceModel.findOne({ deviceToken: nextDeviceToken });
  if (existing) {
    res
      .status(BAD_REQUEST)
      .json(new CustomResponse(false, null, "Device token generation collision"));
    return;
  }

  const device = await DeviceModel.create({
    name,
    deviceToken: nextDeviceToken,
    isActive,
  });

  res.json({
    success: true,
    device,
  });
});

/**
 * @route DELETE /api/v1/device
 */
export const removeDevice = asyncHandler(async (req, res) => {
  const { deviceID } = req.params;

  const device = await DeviceModel.findByIdAndDelete(deviceID);
  appAssert(device, BAD_REQUEST, "Device not found");

  res.json(new CustomResponse(true, null, "Device deleted successfully"));
});

export const assignDevice = asyncHandler(async (req, res) => {
  const { deviceID } = req.params;
  const { registrationId } = req.body;

  appAssert(registrationId, BAD_REQUEST, "Registration ID is required");

  // Verify the device exists and is available
  const device = await DeviceModel.findById(deviceID);
  appAssert(device, BAD_REQUEST, "Device not found");
  appAssert(
    device.registration === null,
    BAD_REQUEST,
    "Device is already assigned",
  );

  // Update device and assign registration
  const updatedDevice = await DeviceModel.findByIdAndUpdate(
    deviceID,
    { registration: registrationId },
    { new: true },
  );

  res.json(
    new CustomResponse(true, updatedDevice, "Device assigned successfully"),
  );
});

export const unassignDevice = asyncHandler(async (req, res) => {
  const { deviceID } = req.params;

  const device = await DeviceModel.findByIdAndUpdate(
    deviceID,
    { registration: null },
    { new: true },
  );
  appAssert(device, BAD_REQUEST, "Device not found");

  res.json(new CustomResponse(true, null, "Device unassigned successfully"));
});

export const updateDevice = asyncHandler(async (req, res) => {
  const { deviceID } = req.params;
  const { name, deviceToken, isActive, registration } = req.body;

  const existing = await DeviceModel.findById(deviceID);
  appAssert(existing, BAD_REQUEST, "Device not found");

  if (deviceToken && deviceToken !== existing.deviceToken) {
    const tokenExists = await DeviceModel.findOne({ deviceToken });
    appAssert(!tokenExists, BAD_REQUEST, "Device token already in use");
  }

  const updatedDevice = await DeviceModel.findByIdAndUpdate(
    deviceID,
    {
      name: name !== undefined ? name : existing.name,
      deviceToken: deviceToken !== undefined ? deviceToken : existing.deviceToken,
      isActive: isActive !== undefined ? isActive : existing.isActive,
      registration: registration !== undefined ? (registration || null) : existing.registration,
    },
    { new: true },
  );

  res.json(new CustomResponse(true, updatedDevice, "Device updated successfully"));
});
