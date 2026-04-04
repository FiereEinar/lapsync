import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  heartRateMax: number;
  heartRateMin: number;
  emgCrampThreshold: number;
}

const SettingsSchema = new Schema<ISettings>(
  {
    heartRateMax: { type: Number, default: 180 },
    heartRateMin: { type: Number, default: 40 },
    emgCrampThreshold: { type: Number, default: 150 },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', SettingsSchema);
