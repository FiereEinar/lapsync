import { Schema, model, Document, Types } from 'mongoose';

export interface IRaceCheckpoint extends Document {
  event: Types.ObjectId;
  name: string;
  type: 'start' | 'finish' | 'checkpoint' | 'waypoint';
  location: {
    lat: number;
    lng: number;
  };
  order: number;
}

const raceCheckpointSchema = new Schema<IRaceCheckpoint>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['start', 'finish', 'checkpoint', 'waypoint'], default: 'checkpoint' },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Ensure a checkpoint has a unique name per event (optional, but good practice)
// raceCheckpointSchema.index({ event: 1, name: 1 }, { unique: true });

export const RaceCheckpointModel = model<IRaceCheckpoint>('RaceCheckpoint', raceCheckpointSchema);
