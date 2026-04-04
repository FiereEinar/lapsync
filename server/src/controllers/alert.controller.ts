import { Request, Response } from "express";
import AlertModel from "../models/alert.model";
import CustomResponse from "../utils/response";
import { asyncHandler } from "../utils/utils";
import appAssert from "../errors/app-assert";
import { BAD_REQUEST } from "../constant/http";

export const getEventAlerts = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventID } = req.params;
    appAssert(eventID, BAD_REQUEST, "Event ID is required");

    const alerts = await AlertModel.find({ event: eventID })
      .populate({
        path: "registration",
        populate: {
          path: "user",
          select: "name email profilePicture",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      new CustomResponse(
        true,
        alerts,
        "Event alerts fetched successfully",
      ),
    );
  },
);

export const resolveAlert = asyncHandler(
  async (req: Request, res: Response) => {
    const { alertID } = req.params;
    appAssert(alertID, BAD_REQUEST, "Alert ID is required");

    const alert = await AlertModel.findByIdAndUpdate(alertID, { resolved: true }, { new: true });
    
    res.json(
      new CustomResponse(
        true,
        alert,
        "Alert resolved successfully",
      ),
    );
  },
);
