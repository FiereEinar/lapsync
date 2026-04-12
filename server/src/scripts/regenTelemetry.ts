import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { MONGO_URI } from '../constant/env';
import { regenerateTelemetry } from '../database/telemetrySeed';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");
    
    await regenerateTelemetry();
    
    console.log("Telemetry regeneration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error during regeneration:", err);
    process.exit(1);
  }
}

main();
