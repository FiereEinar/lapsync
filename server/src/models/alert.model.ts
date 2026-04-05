import mongoose, { Document, Schema } from "mongoose";

export interface IAlert extends Document {
  event: mongoose.Schema.Types.ObjectId | string;
  registration: mongoose.Schema.Types.ObjectId | string;
  type: string;
  value: number;
  message: string;
  location: {
    lat: number;
    lon: number;
  };
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    registration: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    type: { type: String, required: true },
    value: { type: Number, required: true },
    message: { type: String, required: true },
    location: {
      lat: { type: Number },
      lon: { type: Number },
    },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<IAlert>("Alert", AlertSchema);
