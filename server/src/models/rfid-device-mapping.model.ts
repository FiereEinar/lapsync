import mongoose, { Types, PopulatedDoc } from "mongoose";
import { Event } from "./event.model";

export type RfidDeviceMapping = {
  _id: Types.ObjectId;
  deviceName: string;
  event: Types.ObjectId | PopulatedDoc<Event>;
  raceCategory: Types.ObjectId;
  scanType: "start" | "checkpoint" | "finish";
  checkpointName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const RfidDeviceMappingSchema = new mongoose.Schema<RfidDeviceMapping>(
  {
    deviceName: { type: String, required: true },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    raceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    scanType: {
      type: String,
      enum: ["start", "checkpoint", "finish"],
      required: true,
    },
    checkpointName: { type: String },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const RfidDeviceMappingModel = mongoose.model(
  "RfidDeviceMapping",
  RfidDeviceMappingSchema,
);
export default RfidDeviceMappingModel;
