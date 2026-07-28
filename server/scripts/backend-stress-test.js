const axios = require('axios');
const http = require('http');

// Configuration
const API_URL = 'http://localhost:3000/api/v1/device/telemetry';
const CONCURRENT_RUNNERS = 20000; // Adjust this to simulate more runners
const RUN_DURATION_SEC = 10;
const DEVICE_ID = '1'; // Make sure this device exists or the controller will reject it. If it rejects, we still test HTTP throughput.

const agent = new http.Agent({ keepAlive: true, maxSockets: 1000 });

let successCount = 0;
let errorCount = 0;
const start = Date.now();

const sendTelemetry = async (runnerId) => {
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
      { httpAgent: agent },
    );
    successCount++;
  } catch (err) {
    errorCount++;
  }
};

console.log(
  `Starting Backend Load Test: ${CONCURRENT_RUNNERS} concurrent requests/sec for ${RUN_DURATION_SEC} seconds...`,
);

const interval = setInterval(() => {
  for (let i = 0; i < CONCURRENT_RUNNERS; i++) {
    sendTelemetry(`runner_${i}`);
  }
}, 1000); // 1 burst of requests per second

setTimeout(() => {
  clearInterval(interval);
  const duration = (Date.now() - start) / 1000;
  console.log('\n--- Load Test Results ---');
  console.log(`Target Throughput: ${CONCURRENT_RUNNERS} req/sec`);
  console.log(`Actual Duration: ${duration.toFixed(2)} sec`);
  console.log(`Successful Requests: ${successCount}`);
  console.log(`Failed Requests: ${errorCount}`);
  console.log(
    `Approx. Throughput Achieved: ${(successCount / duration).toFixed(2)} req/sec`,
  );

  if (errorCount > 0) {
    console.log(
      'Note: High failures might indicate the server is dropping requests (Overload) or the deviceId is invalid.',
    );
  }

  process.exit(0);
}, RUN_DURATION_SEC * 1000);
