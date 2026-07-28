const axios = require('axios');
const http = require('http');

// ---- Configuration (override via env vars, e.g. TARGET_RATE=8000 node backend-stress-test-v2.js) ----
const API_URL =
  process.env.API_URL || 'http://localhost:3000/api/v1/device/telemetry';
const TARGET_RATE = parseInt(process.env.TARGET_RATE || '5000', 10); // requests/sec you're TRYING to send
const RUN_DURATION_SEC = parseInt(process.env.RUN_DURATION_SEC || '10', 10);
const DRAIN_TIMEOUT_SEC = 15; // max time to wait for in-flight requests to finish after we stop sending
const DEVICE_ID = process.env.DEVICE_ID || '1';
const BATCHES_PER_SEC = 20; // spread requests across the second instead of one big burst

// Key fix #1: no artificial cap on concurrent sockets.
// We want the SERVER to be the bottleneck, not our own HTTP agent.
const agent = new http.Agent({ keepAlive: true, maxSockets: Infinity });

let sent = 0;
let successCount = 0;
let errorCount = 0;
let inFlight = 0;
const latencies = [];
const errorsByCode = {};

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.floor((p / 100) * sorted.length),
  );
  return sorted[idx];
}

async function sendTelemetry() {
  inFlight++;
  const reqStart = Date.now();
  try {
    await axios.post(
      API_URL,
      {
        deviceId: DEVICE_ID,
        gps: {
          lat: 14.5995 + Math.random() * 0.01,
          lon: 120.9842 + Math.random() * 0.01,
        },
        heartRate: Math.floor(Math.random() * (180 - 100) + 100),
        emg: Math.random() * 5,
      },
      { httpAgent: agent, timeout: 15000 },
    );
    successCount++;
    latencies.push(Date.now() - reqStart);
  } catch (err) {
    errorCount++;
    const code = err.response ? err.response.status : err.code || 'UNKNOWN';
    errorsByCode[code] = (errorsByCode[code] || 0) + 1;
  } finally {
    inFlight--;
  }
}

console.log(
  `Open-loop load test: targeting ${TARGET_RATE} req/sec for ${RUN_DURATION_SEC}s -> ${API_URL}`,
);
console.log(
  `(requests are spread across each second in ${BATCHES_PER_SEC} batches, not fired all at once)\n`,
);

// Key fix #2: send in small evenly-spaced batches instead of TARGET_RATE requests
// all at the same millisecond every second. This is closer to a true open arrival
// process and avoids self-inflicted thundering-herd spikes.
const perBatch = Math.max(1, Math.round(TARGET_RATE / BATCHES_PER_SEC));
const batchIntervalMs = 1000 / BATCHES_PER_SEC;

const start = Date.now();
let stopSending = false;

const ticker = setInterval(() => {
  if (stopSending) return;
  for (let i = 0; i < perBatch; i++) {
    sendTelemetry();
    sent++;
  }
}, batchIntervalMs);

setTimeout(() => {
  stopSending = true;
  clearInterval(ticker);

  // Key fix #3: don't exit immediately. Wait for in-flight requests to actually
  // finish (up to DRAIN_TIMEOUT_SEC) so we're not silently discarding results.
  const drainStart = Date.now();
  const drainCheck = setInterval(() => {
    const drainElapsed = (Date.now() - drainStart) / 1000;
    if (inFlight === 0 || drainElapsed >= DRAIN_TIMEOUT_SEC) {
      clearInterval(drainCheck);
      report(drainElapsed);
    }
  }, 100);
}, RUN_DURATION_SEC * 1000);

function report(drainElapsed) {
  const totalDuration = (Date.now() - start) / 1000;

  console.log('--- Load Test Results ---');
  console.log(`Target Throughput:      ${TARGET_RATE} req/sec`);
  console.log(`Requests Sent:          ${sent}`);
  console.log(`Successful Requests:    ${successCount}`);
  console.log(`Failed Requests:        ${errorCount}`);
  console.log(
    `Still In-Flight (lost): ${inFlight}  ${inFlight > 0 ? '<-- these never got a chance to finish, real ceiling is at/below current rate' : ''}`,
  );
  console.log(
    `Total Wall Time:        ${totalDuration.toFixed(2)}s (includes ${drainElapsed.toFixed(2)}s drain)`,
  );
  console.log(
    `Achieved Throughput:    ${(successCount / totalDuration).toFixed(2)} req/sec`,
  );
  console.log('');
  console.log('--- Latency (successful requests only) ---');
  console.log(
    `p50: ${percentile(latencies, 50)}ms  p95: ${percentile(latencies, 95)}ms  p99: ${percentile(latencies, 99)}ms  max: ${Math.max(0, ...latencies)}ms`,
  );

  if (errorCount > 0) {
    console.log('\n--- Errors by type ---');
    for (const [code, count] of Object.entries(errorsByCode)) {
      console.log(`  ${code}: ${count}`);
    }
  }

  console.log('\nHow to read this:');
  console.log(
    '- If Achieved Throughput keeps climbing as you raise TARGET_RATE, you have NOT found the ceiling yet.',
  );
  console.log(
    '- If p95/p99 latency balloons while throughput flatlines, THAT is your real ceiling.',
  );
  console.log(
    '- Errors (esp. 500s, ECONNRESET, ETIMEDOUT) mean the server itself is rejecting/dropping load.',
  );

  process.exit(0);
}
