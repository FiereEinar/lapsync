import { Request, Response } from "express";
import TelemetryModel from "../models/telemetry.model";
import RegistrationModel from "../models/registration.model";
import CustomResponse from "../utils/response";
import { asyncHandler } from "../utils/utils";
import appAssert from "../errors/app-assert";
import { BAD_REQUEST } from "../constant/http";

export const getEventTelemetry = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventID } = req.params;
    appAssert(eventID, BAD_REQUEST, "Event ID is required");

    // 1. Find all registrations for this event
    const registrations = await RegistrationModel.find({
      event: eventID,
    }).select("_id");

    if (registrations.length === 0) {
      res.json(
        new CustomResponse(true, [], "No registrations found for this event"),
      );
      return;
    }

    const registrationIds = registrations.map((reg) => reg._id);

    // 2. Fetch all telemetry datapoints matching these registrations
    const telemetryData = await TelemetryModel.find({
      registration: { $in: registrationIds },
    })
      .populate({
        path: "registration",
        populate: {
          path: "user",
          select: "name email profilePicture",
        },
      })
      .populate({
        path: "registration",
        populate: {
          path: "raceCategory",
          select: "name",
        },
      })
      .sort({ createdAt: 1 }) // Sort ascending by time
      .lean();

    res.json(
      new CustomResponse(
        true,
        telemetryData,
        "Event telemetry fetched successfully",
      ),
    );
  },
);

export const exportEventTelemetryCsv = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventID } = req.params;
    appAssert(eventID, BAD_REQUEST, "Event ID is required");

    const registrations = await RegistrationModel.find({
      event: eventID,
    }).select("_id");

    if (registrations.length === 0) {
      res.status(400).json(new CustomResponse(false, null, "No registrations found."));
      return;
    }

    const registrationIds = registrations.map((reg) => reg._id);

    const telemetryData = await TelemetryModel.find({
      registration: { $in: registrationIds },
    })
      .populate({
        path: "registration",
        populate: [
          { path: "user", select: "name email" },
          { path: "raceCategory", select: "name" }
        ],
      })
      .sort({ createdAt: 1 })
      .lean();

    const headers = [
      "Timestamp",
      "Runner Name",
      "Email",
      "Race Category",
      "Latitude",
      "Longitude",
      "Heart Rate (bpm)",
      "EMG",
    ];

    const rows = telemetryData.map((t: any) => {
      return [
        new Date(t.createdAt).toISOString(),
        `"${t.registration?.user?.name || 'Unknown'}"`,
        `"${t.registration?.user?.email || 'Unknown'}"`,
        `"${t.registration?.raceCategory?.name || 'Unknown'}"`,
        t.gps?.lat || '',
        t.gps?.lon || '',
        t.heartRate || '',
        `"${t.emg || ''}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=lapSync-telemetry-${eventID}.csv`);
    res.status(200).send(csvContent);
  }
);
