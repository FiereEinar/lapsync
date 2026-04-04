import { Request, Response } from "express";
import SettingsModel from "../models/settings.model";
import CustomResponse from "../utils/response";
import { asyncHandler } from "../utils/utils";

export const getSettings = asyncHandler(
  async (req: Request, res: Response) => {
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = await SettingsModel.create({});
    }

    res.json(
      new CustomResponse(
        true,
        settings,
        "System settings fetched successfully",
      ),
    );
  },
);

export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = new SettingsModel({});
    }

    const { heartRateMax, heartRateMin, emgCrampThreshold } = req.body;

    if (heartRateMax !== undefined) settings.heartRateMax = heartRateMax;
    if (heartRateMin !== undefined) settings.heartRateMin = heartRateMin;
    if (emgCrampThreshold !== undefined) settings.emgCrampThreshold = emgCrampThreshold;

    await settings.save();

    res.json(
      new CustomResponse(
        true,
        settings,
        "System settings updated successfully",
      ),
    );
  },
);
