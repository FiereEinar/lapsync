import RfidTagModel from "../models/rfid-tag.model";
import RaceResultModel from "../models/race-result.model";
import RegistrationModel from "../models/registration.model";
import { RfidDeviceMapping } from "../models/rfid-device-mapping.model";
import { io } from "../server";

export type ScanProcessResult = {
  success: boolean;
  participantName?: string;
  bibNumber?: number | undefined;
  scanType: string;
  message: string;
  raceResult?: any;
};

/**
 * Process an RFID scan from one of the readers.
 * Shared logic between the WebSocket handler and any future ingestion method.
 */
export async function processScan(
  epc: string,
  scanTime: Date,
  mapping: RfidDeviceMapping,
): Promise<ScanProcessResult> {
  // 1. Look up the RFID tag
  const tag = await RfidTagModel.findOne({ epc });
  if (!tag) {
    return {
      success: false,
      scanType: mapping.scanType,
      message: `RFID tag "${epc}" not found in the system.`,
    };
  }

  if (tag.status !== "assigned" || !tag.registration) {
    return {
      success: false,
      scanType: mapping.scanType,
      message: `RFID tag "${epc}" is not assigned to any participant.`,
    };
  }

  // 2. Get the registration
  const registration = await RegistrationModel.findById(tag.registration)
    .populate("user", "name email")
    .lean();
  if (!registration) {
    return {
      success: false,
      scanType: mapping.scanType,
      message: `Registration not found for tag "${epc}".`,
    };
  }

  // 3. Find or create a RaceResult
  let raceResult = await RaceResultModel.findOne({
    registration: registration._id,
    event: mapping.event,
  } as any);

  if (!raceResult) {
    raceResult = await RaceResultModel.create({
      registration: registration._id,
      event: mapping.event,
      raceCategory: mapping.raceCategory,
      rfidTag: tag._id,
      status: "not_started",
    } as any);
  }

  // 4. Process based on scan type
  if (mapping.scanType === "start") {
    raceResult.startTime = scanTime;
    raceResult.status = "running";
  } else if (mapping.scanType === "finish") {
    raceResult.finishTime = scanTime;
    raceResult.status = "finished";

    // Compute elapsed time
    if (raceResult.startTime) {
      raceResult.elapsedMs =
        scanTime.getTime() - raceResult.startTime.getTime();
    }
  } else {
    // Checkpoint read
    const checkpointName =
      mapping.checkpointName || `checkpoint-${mapping.deviceName}`;
    raceResult.checkpoints.push({
      name: checkpointName,
      time: scanTime,
    });
  }

  await raceResult.save();

  // 5. Compute ranks for finished runners in the same event + category
  if (mapping.scanType === "finish") {
    const finishedResults = await RaceResultModel.find({
      event: mapping.event,
      raceCategory: mapping.raceCategory,
      status: "finished",
      elapsedMs: { $exists: true, $ne: null },
    } as any).sort({ elapsedMs: 1 });

    for (let i = 0; i < finishedResults.length; i++) {
      const result = finishedResults[i];
      if (result) {
        result.rank = i + 1;
        await result.save();
      }
    }

    // Re-read the current result to get updated rank
    raceResult = (await RaceResultModel.findById(raceResult._id))!;
  }

  // 6. Populate for response & Socket.IO
  const populated = await RaceResultModel.findById(raceResult._id)
    .populate({
      path: "registration",
      populate: [
        { path: "user", select: "name email" },
        { path: "event", select: "name" },
      ],
    })
    .populate("rfidTag", "epc label")
    .lean();

  // 7. Emit via Socket.IO for live leaderboard updates
  const raceNamespace = io.of("/race");
  raceNamespace.emit("raceUpdate", {
    eventId: mapping.event ? ((mapping.event as any)._id?.toString() || mapping.event.toString()) : "",
    raceResult: populated,
  });

  const user = registration.user as any;

  return {
    success: true,
    participantName: user?.name || "Unknown",
    bibNumber: registration.bibNumber ?? undefined,
    scanType: mapping.scanType,
    message: `${mapping.scanType.toUpperCase()} recorded for ${user?.name || "Unknown"} (Bib #${registration.bibNumber ?? "--"})`,
    raceResult: populated,
  };
}
