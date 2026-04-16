import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const sockets: Record<string, Socket> = {};

let serverURL = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

if (!process.env.EXPO_PUBLIC_API_URL) {
  if (Constants.expoConfig?.hostUri) {
    const hostIP = Constants.expoConfig.hostUri.split(':')[0];
    serverURL = `http://${hostIP}:3000`;
  } else if (Platform.OS === 'android') {
    serverURL = 'http://10.0.2.2:3000';
  }
}

export const getSocket = (namespace: string): Socket => {
	if (!sockets[namespace]) {
		sockets[namespace] = io(`${serverURL}/${namespace}`, {
			withCredentials: true,
		});

		sockets[namespace].on('connect', () => {
			console.log(`Connected to namespace: ${namespace} at ${serverURL}/${namespace}`);
		});

		sockets[namespace].on('disconnect', () => {
			console.log(`Disconnected from namespace: ${namespace}`);
		});
	}

	return sockets[namespace];
};

export const disconnectSocket = (namespace: string) => {
	if (sockets[namespace]) {
		sockets[namespace].disconnect();
		delete sockets[namespace];
	}
};
