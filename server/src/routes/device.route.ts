import express from "express";
import {
  getDevices,
  createDevice,
  deviceTelemetryController,
  unassignDevice,
  removeDevice,
  assignDevice,
  updateDevice,
} from "../controllers/device.controller";

const router = express.Router();

router.get("/", getDevices);
router.post("/", createDevice);
router.post("/telemetry", deviceTelemetryController);
router.patch("/assign/:deviceID", assignDevice);
router.patch("/unassign/:deviceID", unassignDevice);
router.put("/:deviceID", updateDevice);
router.delete("/:deviceID", removeDevice);

export default router;
