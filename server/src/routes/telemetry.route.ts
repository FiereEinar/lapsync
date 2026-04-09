import express from "express";
import { getEventTelemetry, exportEventTelemetryCsv } from "../controllers/telemetry.controller";
import { getRegistrationAnalytics } from "../controllers/analytics.controller";

const router = express.Router();

router.get("/event/:eventID", getEventTelemetry);
router.get("/export/:eventID", exportEventTelemetryCsv);
router.get("/analytics/registration/:registrationId", getRegistrationAnalytics);

export default router;
