import dotenv from 'dotenv';
import app from './app';
import { NODE_ENV, PORT } from './constant/env';
import { corsOptions } from './utils/cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import RfidDeviceMappingModel from './models/rfid-device-mapping.model';
import { processScan } from './services/rfidScanService';
dotenv.config();

const server = createServer(app);

export const io = new Server(server, {
	cors: corsOptions,
});

/* -------------------------
   USER DASHBOARD NAMESPACE
-------------------------- */
const raceNamespace = io.of('/race');

raceNamespace.on('connection', (socket) => {
	socket.on('joinRace', ({ registrationId }) => {
		socket.join(registrationId);
	});

	socket.on('disconnect', () => {
		console.log('Race client disconnected');
	});
});

/* -------------------------
   RFID SCANNER NAMESPACE
   (Admin live feed)
-------------------------- */
const rfidScannerNamespace = io.of('/rfid-scanner');
let isScanning = true; // Global scanner state

rfidScannerNamespace.on('connection', (socket) => {
	console.log(`[RFID Scanner] Admin client connected: ${socket.id}`);

	// Send current scanner state on connect
	socket.emit('scannerState', { isScanning });

	socket.on('startScanner', () => {
		isScanning = true;
		rfidScannerNamespace.emit('scannerState', { isScanning });
		console.log('[RFID Scanner] Scanner started by admin');
	});

	socket.on('stopScanner', () => {
		isScanning = false;
		rfidScannerNamespace.emit('scannerState', { isScanning });
		console.log('[RFID Scanner] Scanner stopped by admin');
	});

	socket.on('disconnect', () => {
		console.log(`[RFID Scanner] Admin client disconnected: ${socket.id}`);
	});
});

/* -------------------------
   RFID HARDWARE WEBSOCKET
   /ws/device/rfid
-------------------------- */
const wss = new WebSocketServer({ noServer: true });

// Track connected hardware devices
const connectedDevices = new Set<string>();

wss.on('connection', (ws: WebSocket) => {
	let deviceId = 'unknown';
	console.log('[RFID WS] Hardware device connected');

	rfidScannerNamespace.emit('rfidDeviceConnected', {
		connectedCount: wss.clients.size,
	});

	ws.on('message', async (raw: Buffer | string) => {
		try {
			const message = JSON.parse(raw.toString());
			const { tag, time, device } = message;

			if (!tag || !device) {
				console.warn('[RFID WS] Invalid message format:', message);
				return;
			}

			deviceId = device;
			connectedDevices.add(device);

			const scanTime = time ? new Date(time) : new Date();

			// Forward raw scan to admin clients
			rfidScannerNamespace.emit('rfidRawScan', {
				tag,
				time: scanTime.toISOString(),
				device,
				timestamp: Date.now(),
			});

			// If scanner is paused, skip processing
			if (!isScanning) {
				rfidScannerNamespace.emit('rfidScanSkipped', {
					tag,
					device,
					reason: 'Scanner is paused',
					timestamp: Date.now(),
				});
				return;
			}

			// Look up all active device mappings for this device
			const mappings = await RfidDeviceMappingModel.find({
				deviceName: device,
				isActive: true,
			});

			if (mappings.length === 0) {
				rfidScannerNamespace.emit('rfidScanSkipped', {
					tag,
					device,
					reason: `No active mapping configured for device "${device}"`,
					timestamp: Date.now(),
				});
				return;
			}

			// Process the scan against each active mapping
			for (const mapping of mappings) {
				const result = await processScan(tag, scanTime, mapping);

				rfidScannerNamespace.emit('rfidScanProcessed', {
					tag,
					device,
					result,
					timestamp: Date.now(),
				});
			}
		} catch (err: any) {
			console.error('[RFID WS] Error processing message:', err);
			rfidScannerNamespace.emit('rfidScanError', {
				error: err.message || 'Unknown error',
				timestamp: Date.now(),
			});
		}
	});

	ws.on('close', () => {
		console.log(`[RFID WS] Hardware device disconnected: ${deviceId}`);
		connectedDevices.delete(deviceId);
		rfidScannerNamespace.emit('rfidDeviceDisconnected', {
			device: deviceId,
			connectedCount: wss.clients.size - 1, // -1 because the closing one is still counted
		});
	});

	ws.on('error', (err) => {
		console.error('[RFID WS] WebSocket error:', err);
	});
});

// Handle HTTP upgrade for /ws/device/rfid path
server.on('upgrade', (request, socket, head) => {
	const { url } = request;

	if (url === '/ws/device/rfid') {
		wss.handleUpgrade(request, socket, head, (ws) => {
			wss.emit('connection', ws, request);
		});
	}
	// Let socket.io handle its own upgrades (it does this automatically)
});

if (NODE_ENV === 'development') {
	server.listen(Number(PORT), '0.0.0.0', () => {
		console.log(`Server is running on http://localhost:${PORT}`);
	});
}
