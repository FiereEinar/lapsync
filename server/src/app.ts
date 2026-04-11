import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectToMongoDB from "./database/mongodb";
import { notFoundHandler } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error";
import { healthcheck } from "./middlewares/healthcheck";
import { corsOptions } from "./utils/cors";
import { auth } from "./middlewares/auth";
connectToMongoDB();

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", healthcheck);

import authRoutes from "./routes/auth.route";
import publicRoutes from "./routes/public.route";
import eventsRoutes from "./routes/event.routes";
import userRoutes from "./routes/user.route";
import registrationRoutes from "./routes/registration.route";
import paymentRoutes from "./routes/payment.route";
import deviceRoutes from "./routes/device.route";
import telemetryRoutes from "./routes/telemetry.route";
import rfidTagRoutes from "./routes/rfid-tag.route";
import rfidDeviceMappingRoutes from "./routes/rfid-device-mapping.route";
import raceResultRoutes from "./routes/race-result.route";
import raceCheckpointRoutes from "./routes/race-checkpoint.route";
import alertRoutes from "./routes/alert.route";
import settingsRoutes from "./routes/settings.route";

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/device", deviceRoutes);

// Public Routes (No authentication required)
app.use("/api/v1/public", publicRoutes);

// Protected Routes
app.use(auth);
app.use("/api/v1/event", eventsRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/registration", registrationRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/telemetry", telemetryRoutes);
app.use("/api/v1/rfid-tag", rfidTagRoutes);
app.use("/api/v1/rfid-device-mapping", rfidDeviceMappingRoutes);
app.use("/api/v1/race-result", raceResultRoutes);
app.use("/api/v1/race-checkpoint", raceCheckpointRoutes);
app.use("/api/v1/alert", alertRoutes);
app.use("/api/v1/settings", settingsRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
