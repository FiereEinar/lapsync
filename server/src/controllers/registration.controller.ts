import { BAD_REQUEST, CREATED, NOT_FOUND } from "../constant/http";
import appAssert from "../errors/app-assert";
import EventModel from "../models/event.model";
import RegistrationModel, {
  PopulatedRegistration,
} from "../models/registration.model";
import { registrationSchema } from "../schemas/registration.schema";
import CustomResponse from "../utils/response";
import { asyncHandler } from "../utils/utils";

/**
 * @route POST /api/v1/event/:eventID/register
 */
export const registerHandler = asyncHandler(async (req, res) => {
  const { eventID } = req.params;
  appAssert(typeof eventID === "string", BAD_REQUEST, "Invalid event ID");

  const { raceCategoryId, shirtSize, emergencyContact, medicalInfo } =
    registrationSchema.parse(req.body);

  const event = await EventModel.findById(eventID);
  appAssert(event, NOT_FOUND, "Event not found");

  const category = event.raceCategories.find(
    (cat) => cat._id.toString() === raceCategoryId,
  );
  appAssert(category, NOT_FOUND, "Race category not found");

  appAssert(
    category.registeredCount < category.slots,
    BAD_REQUEST,
    "Category full",
  );

  // check if the user has already registered for this event
  const existingRegistration = await RegistrationModel.findOne({
    user: req.user._id,
    event: eventID,
  });
  appAssert(
    !existingRegistration,
    BAD_REQUEST,
    "You have already registered for this event",
  );

  const registration = await RegistrationModel.create({
    user: req.user._id,
    event: eventID,
    raceCategory: category,
    shirtSize,
    emergencyContact,
    medicalInfo: Object.fromEntries(
      Object.entries(medicalInfo).filter(([_, v]) => v !== undefined),
    ),
  });

  // category.registeredCount++;
  // await event.save();

  res
    .status(CREATED)
    .json(new CustomResponse(true, registration, "Registration successful"));
});

/**
 * @route GET /api/v1/registration
 * query: userID: string | eventID: string
 */
export const getRegistrationsHander = asyncHandler(async (req, res) => {
  const { userID, eventID } = req.query;

  let filters: any = {};

  if (userID) {
    filters.user = userID;
  }

  if (eventID) {
    filters.event = eventID;
  }

  const registrationsDoc = await RegistrationModel.find(filters)
    .populate("user")
    .populate("event")
    .populate("payment")
    .populate("device")
    .populate("rfidTag")
    .lean<PopulatedRegistration[]>();

  const registrations: PopulatedRegistration[] = registrationsDoc.map((reg) => {
    return {
      ...reg,
      event: reg.event as any,
      raceCategory: (reg.event as any).raceCategories.find(
        (rc: any) => rc._id.toString() === reg.raceCategory.toString(),
      ),
    };
  });

  res.json(
    new CustomResponse(
      true,
      registrations,
      "Registrations fetched successfully",
    ),
  );
});
