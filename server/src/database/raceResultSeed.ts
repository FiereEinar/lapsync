import RfidTagModel from "../models/rfid-tag.model";
import RaceResultModel from "../models/race-result.model";
import RegistrationModel from "../models/registration.model";
import EventModel from "../models/event.model";

/**
 * Seeds RFID tags, assigns them to the runners created by telemetrySeed,
 * and creates RaceResult documents so the leaderboard has data to show.
 *
 * Must run AFTER seedTelemetry (depends on the "Bukidnon Trail Run" event
 * and its confirmed registrations).
 */
export const seedRaceResults = async () => {
  try {
    console.log("--- Starting Race Result Seeding ---");

    const existingResults = await RaceResultModel.countDocuments();
    if (existingResults > 0) {
      console.log("Race results already exist. Skipping seed.");
      return;
    }

    // 1. Find the seeded event
    const event = await EventModel.findOne({ name: "Bukidnon Trail Run" });
    if (!event) {
      console.log("Seeded event not found. Skipping race result seed.");
      return;
    }

    const categoryId = event.raceCategories[0]?._id;
    if (!categoryId) {
      console.log("No race category found. Skipping.");
      return;
    }

    // 2. Get confirmed registrations for this event
    const registrations = await RegistrationModel.find({
      event: event._id,
      status: "confirmed",
    }).populate("user");

    if (registrations.length === 0) {
      console.log("No confirmed registrations found. Skipping.");
      return;
    }

    // 3. Create RFID tags and assign them to each registration
    const tagEPCs = [
      "E20034120100000000000001",
      "E20034120100000000000002",
      "E20034120100000000000003",
      "E20034120100000000000004",
      "E20034120100000000000005",
      "E20034120100000000000006",
      "E20034120100000000000007",
      "E20034120100000000000008",
    ];

    const raceStartTime = new Date("2026-08-10T05:30:00").getTime();

    for (let i = 0; i < registrations.length; i++) {
      const reg = registrations[i];
      if (!reg) continue;

      const epc =
        tagEPCs[i] ?? `E200341201000000000000${String(i + 1).padStart(2, "0")}`;

      // Create and assign the RFID tag
      const tag = await RfidTagModel.create({
        epc,
        label: `Runner Tag #${i + 1}`,
        status: "assigned",
        registration: reg._id,
        event: event._id,
      });

      // Link tag to the registration
      reg.rfidTag = tag._id as any;
      await reg.save();

      // 4. Create a RaceResult with realistic timing
      //    Stagger start by a few seconds (wave start simulation)
      const startOffset = i * 3000 + Math.floor(Math.random() * 2000); // 0-5s stagger
      const startTime = new Date(raceStartTime + startOffset);

      // Simulate different finish scenarios:
      //   - Most runners finish with varying times
      //   - One runner is still running (no finish)
      //   - One runner is DNF
      const isLastRunner = i === registrations.length - 1;
      const isSecondToLast = i === registrations.length - 2;

      let finishTime: Date | undefined;
      let elapsedMs: number | undefined;
      let status: "not_started" | "running" | "finished" | "dnf" | "dns";

      if (isLastRunner) {
        // This runner is still running — no finish time
        status = "running";
      } else if (isSecondToLast) {
        // DNF — started but didn't finish
        status = "dnf";
      } else {
        // Finished with a realistic time (1h20m - 2h30m for a 21K trail)
        const baseFinishMs = 80 * 60 * 1000; // 1h20m base
        const varianceMs = Math.floor(Math.random() * 70 * 60 * 1000); // up to +1h10m
        elapsedMs = baseFinishMs + varianceMs;
        finishTime = new Date(startTime.getTime() + elapsedMs);
        status = "finished";
      }

      // Generate 1-3 checkpoint reads for most runners
      // const checkpoints: { name: string; time: Date }[] = [];
      // const checkpointNames = [
      //   "checkpoint-5k",
      //   "checkpoint-10k",
      //   "checkpoint-15k",
      // ];
      // const numCheckpoints =
      //   status === "not_started"
      //     ? 0
      //     : Math.min(checkpointNames.length, status === "running" ? 2 : 3);

      // for (let c = 0; c < numCheckpoints; c++) {
      //   const cpName = checkpointNames[c];
      //   if (!cpName) continue;
      //   // Checkpoint times distributed evenly through the race
      //   const cpFraction = (c + 1) / 4; // 25%, 50%, 75% of total time
      //   const totalTime = elapsedMs ?? 100 * 60 * 1000; // assume ~1h40m if still running
      //   checkpoints.push({
      //     name: cpName,
      //     time: new Date(startTime.getTime() + totalTime * cpFraction),
      //   });
      // }

      await RaceResultModel.create({
        registration: reg._id,
        event: event._id,
        raceCategory: categoryId,
        rfidTag: tag._id,
        startTime,
        finishTime,
        // checkpoints,
        elapsedMs,
        status,
      } as any);
    }

    // 5. Compute ranks for finished runners
    const finishedResults = await RaceResultModel.find({
      event: event._id,
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

    console.log(
      `Successfully seeded ${registrations.length} RFID tags and Race Results!`,
    );
    console.log("--- Race Result Seeding Complete ---");
  } catch (error) {
    console.error("Error seeding race results:", error);
  }
};
