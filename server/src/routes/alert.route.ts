import express from "express";
import { getEventAlerts, resolveAlert } from "../controllers/alert.controller";

const router = express.Router();

router.get("/event/:eventID", getEventAlerts);
router.patch("/:alertID/resolve", resolveAlert);

export default router;
