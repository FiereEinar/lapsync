import { BAD_REQUEST, CREATED, NOT_FOUND } from "../constant/http";
import appAssert from "../errors/app-assert";
import RfidTagModel from "../models/rfid-tag.model";
import RegistrationModel from "../models/registration.model";
import CustomResponse from "../utils/response";
import { asyncHandler } from "../utils/utils";

/**
 * @route GET /api/v1/rfid-tag
 */
export const getRfidTags = asyncHandler(async (req, res) => {
  const tags = await RfidTagModel.find()
    .populate({
      path: "registration",
      populate: [
        { path: "user", select: "name email" },
        { path: "event", select: "name" },
      ],
    })
    .populate("event", "name")
    .sort({ createdAt: -1 })
    .lean();

  res.json(new CustomResponse(true, tags, "RFID tags fetched successfully"));
});

/**
 * @route POST /api/v1/rfid-tag
 */
export const createRfidTag = asyncHandler(async (req, res) => {
  const { epc, label } = req.body;
  appAssert(epc, BAD_REQUEST, "EPC is required");

  const existing = await RfidTagModel.findOne({ epc });
  if (existing) {
    res
      .status(BAD_REQUEST)
      .json(
        new CustomResponse(
          false,
          null,
          "An RFID tag with this EPC already exists",
        ),
      );
    return;
  }

  const tag = await RfidTagModel.create({ epc, label });

  res
    .status(CREATED)
    .json(new CustomResponse(true, tag, "RFID tag created successfully"));
});

/**
 * @route DELETE /api/v1/rfid-tag/:tagID
 */
export const removeRfidTag = asyncHandler(async (req, res) => {
  const { tagID } = req.params;

  const tag = await RfidTagModel.findByIdAndDelete(tagID);
  appAssert(tag, BAD_REQUEST, "RFID tag not found");

  res.json(new CustomResponse(true, null, "RFID tag deleted successfully"));
});

/**
 * @route PATCH /api/v1/rfid-tag/unassign/:tagID
 */
export const unassignRfidTag = asyncHandler(async (req, res) => {
  const { tagID } = req.params;

  // Get the tag to find its registration
  const tag = await RfidTagModel.findById(tagID);
  appAssert(tag, BAD_REQUEST, "RFID tag not found");

  // Clear rfidTag from the registration if it was assigned
  if (tag.registration) {
    await RegistrationModel.updateOne(
      { _id: tag.registration },
      { $unset: { rfidTag: 1 } },
    );
  }

  // Reset the tag
  tag.registration = null;
  tag.event = null;
  tag.status = "available";
  await tag.save();

  res.json(new CustomResponse(true, null, "RFID tag unassigned successfully"));
});

/**
 * @route PATCH /api/v1/rfid-tag/assign
 * Assign an RFID tag to a confirmed registration (race-day check-in)
 */
export const assignRfidTag = asyncHandler(async (req, res) => {
  const { epc, registrationId } = req.body;
  appAssert(epc, BAD_REQUEST, "EPC is required");
  appAssert(registrationId, BAD_REQUEST, "Registration ID is required");

  // Look up the tag — auto-create if it doesn't exist yet
  let tag = await RfidTagModel.findOne({ epc });

  if (tag) {
    appAssert(
      tag.status === "available",
      BAD_REQUEST,
      "This RFID tag is already assigned to another participant",
    );
  } else {
    // Auto-register the tag on the fly
    tag = await RfidTagModel.create({ epc, status: "available" });
  }

  // Look up the registration
  const registration = await RegistrationModel.findById(registrationId);
  appAssert(registration, NOT_FOUND, "Registration not found");
  appAssert(
    registration.status === "confirmed",
    BAD_REQUEST,
    "Only confirmed registrations can be checked in",
  );
  appAssert(
    !registration.rfidTag,
    BAD_REQUEST,
    "This participant already has an RFID tag assigned",
  );

  // Assign the tag to the registration
  tag.status = "assigned";
  tag.registration = registration._id;
  tag.event = registration.event;
  await tag.save();

  // Link tag on the registration
  registration.rfidTag = tag._id as any;
  await registration.save();

  // Return populated registration
  const populated = await RegistrationModel.findById(registrationId)
    .populate("user")
    .populate("event")
    .populate("rfidTag")
    .populate("payment")
    .populate("device")
    .lean();

  res.json(
    new CustomResponse(true, populated, "RFID tag assigned successfully"),
  );
});
