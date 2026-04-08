import { Router } from "express";
import { getEventsHandler, getSingleEventHandler } from "../controllers/event.controller";
import { asyncHandler } from "../utils/utils";
import RaceResultModel, { RaceResult } from "../models/race-result.model";
import EventModel from "../models/event.model";
import appAssert from "../errors/app-assert";
import { BAD_REQUEST } from "../constant/http";
import CustomResponse from "../utils/response";
import { Registration } from "../models/registration.model";

const router = Router();

// Pass-through for public event fetching
router.get("/event", getEventsHandler);
router.get("/event/:eventID", getSingleEventHandler);

import { getCheckpointsByEvent } from "../controllers/race-checkpoint.controller";
router.get("/race-checkpoint/event/:eventId", getCheckpointsByEvent);

// Custom public race result fetcher to prevent leaking sensitive contact info over unauthenticated channels
router.get(
  "/race-result",
  asyncHandler(async (req, res) => {
    const { eventID, raceCategory } = req.query;
    appAssert(eventID, BAD_REQUEST, "eventID query parameter is required");

    const filters: any = { event: eventID };
    if (raceCategory) {
      filters.raceCategory = raceCategory;
    }

    const results = await RaceResultModel.find(filters)
      .populate({
        path: "registration",
        populate: [
          // Select only name and drop email, phone to ensure privacy!
          { path: "user", select: "name" },
          { path: "event", select: "name" },
        ],
      })
      .sort({ elapsedMs: 1, status: 1, createdAt: 1 })
      .lean();

    const event = await EventModel.findById(eventID);
    appAssert(event, BAD_REQUEST, "Event not found");

    if (results.length > 0) {
      results.forEach((result) => {
        const registration = result.registration as Registration;
        const catObj = event.raceCategories.find(
          (cat) => cat._id.toString() === result.raceCategory.toString(),
        );
        // Only append standard config
        if (catObj) {
           registration.raceCategory = catObj;
        }
      });
    }

    const statusOrder: Record<string, number> = {
      finished: 0,
      running: 1,
      not_started: 2,
      dns: 3,
      dnf: 4,
    };

    results.sort((a: RaceResult, b: RaceResult) => {
      const statusA = statusOrder[a.status] ?? 5;
      const statusB = statusOrder[b.status] ?? 5;
      if (statusA !== statusB) return statusA - statusB;
      if (a.status === "finished" && b.status === "finished") {
        return (a.elapsedMs ?? Infinity) - (b.elapsedMs ?? Infinity);
      }
      return 0;
    });

    res.json(new CustomResponse(true, results, "Public race results fetched successfully"));
  })
);

export default router;
