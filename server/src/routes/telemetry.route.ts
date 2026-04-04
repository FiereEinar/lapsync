import express from "express";
import { getEventTelemetry, exportEventTelemetryCsv } from "../controllers/telemetry.controller";

const router = express.Router();

router.get("/event/:eventID", getEventTelemetry);
router.get("/export/:eventID", exportEventTelemetryCsv);

export default router;
