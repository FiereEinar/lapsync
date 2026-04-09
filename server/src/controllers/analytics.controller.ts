import { Request, Response } from "express";
import TelemetryModel from "../models/telemetry.model";
import RegistrationModel from "../models/registration.model";
import CustomResponse from "../utils/response";
import { asyncHandler } from "../utils/utils";
import appAssert from "../errors/app-assert";
import { BAD_REQUEST, NOT_FOUND } from "../constant/http";
import AlertModel from "../models/alert.model";

export const getRegistrationAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { registrationId } = req.params;
    appAssert(registrationId, BAD_REQUEST, "Registration ID is required");

    const registration = await RegistrationModel.findById(registrationId);
    appAssert(registration, NOT_FOUND, "Registration not found");

    const telemetryData = await TelemetryModel.find({
      registration: registrationId,
    }).sort({ createdAt: 1 }).lean();

    const alerts = await AlertModel.find({
      registration: registrationId,
    }).sort({ createdAt: 1 }).lean();

    if (telemetryData.length === 0) {
      res.json(
        new CustomResponse(
          true,
          {
            heartRate: { min: 0, max: 0, avg: 0, zones: { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 } },
            semg: { fatigueLevel: 'Unknown', peakFatigue: 0, avgFatigue: 0, trend: 'Unknown' },
            alerts: alerts.map(a => ({
              time: a.createdAt,
              type: a.type,
              severity: a.resolved ? 'Resolved' : 'Active',
              message: a.message
            }))
          },
          "No telemetry data found for this registration"
        )
      );
      return;
    }

    let minHR = Infinity;
    let maxHR = -Infinity;
    let sumHR = 0;
    
    let sumEmg = 0;
    let maxEmg = -Infinity;

    let validHrCount = 0;
    let validEmgCount = 0;

    const zCount = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };

    telemetryData.forEach(t => {
      if (t.heartRate) {
        if (t.heartRate < minHR) minHR = t.heartRate;
        if (t.heartRate > maxHR) maxHR = t.heartRate;
        sumHR += t.heartRate;
        validHrCount++;

        // Assuming max HR ~ 190. Z1: < 60%, Z2: 60-70%, Z3: 70-80%, Z4: 80-90%, Z5: > 90%
        // Simplified zones for demonstration
        if (t.heartRate < 114) zCount.z1++;
        else if (t.heartRate < 133) zCount.z2++;
        else if (t.heartRate < 152) zCount.z3++;
        else if (t.heartRate < 171) zCount.z4++;
        else zCount.z5++;
      }

      if (t.emg) {
        const emgVal = parseFloat(t.emg);
        if (!isNaN(emgVal)) {
          sumEmg += emgVal;
          if (emgVal > maxEmg) maxEmg = emgVal;
          validEmgCount++;
        }
      }
    });

    const avgHR = validHrCount > 0 ? Math.round(sumHR / validHrCount) : 0;
    
    const zones = {
      z1: validHrCount > 0 ? Math.round((zCount.z1 / validHrCount) * 100) : 0,
      z2: validHrCount > 0 ? Math.round((zCount.z2 / validHrCount) * 100) : 0,
      z3: validHrCount > 0 ? Math.round((zCount.z3 / validHrCount) * 100) : 0,
      z4: validHrCount > 0 ? Math.round((zCount.z4 / validHrCount) * 100) : 0,
      z5: validHrCount > 0 ? Math.round((zCount.z5 / validHrCount) * 100) : 0,
    };

    const avgFatigue = validEmgCount > 0 ? Math.round(sumEmg / validEmgCount) : 0;
    const peakFatigue = maxEmg > -Infinity ? Math.round(maxEmg) : 0;
    
    let fatigueLevel = 'Low';
    if (avgFatigue > 60) fatigueLevel = 'High';
    else if (avgFatigue > 40) fatigueLevel = 'Moderate';

    res.json(
      new CustomResponse(
        true,
        {
          heartRate: {
            min: minHR !== Infinity ? minHR : 0,
            max: maxHR !== -Infinity ? maxHR : 0,
            avg: avgHR,
            zones
          },
          semg: {
            fatigueLevel,
            peakFatigue,
            avgFatigue,
            trend: 'Stable'
          },
          alerts: alerts.map(a => ({
            time: new Date(a.createdAt).toLocaleTimeString(),
            type: a.type.replace(/_/g, ' '),
            severity: a.resolved ? 'Resolved' : 'Active',
            message: a.message
          }))
        },
        "Analytics fetched successfully"
      )
    );
  }
);
