import { Router } from "express";
import {
  getDeviceMappings,
  createDeviceMapping,
  updateDeviceMapping,
  deleteDeviceMapping,
} from "../controllers/rfid-device-mapping.controller";

const router = Router();

router.get("/", getDeviceMappings);
router.post("/", createDeviceMapping);
router.patch("/:id", updateDeviceMapping);
router.delete("/:id", deleteDeviceMapping);

export default router;
