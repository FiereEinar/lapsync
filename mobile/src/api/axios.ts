import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

let baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

if (!process.env.EXPO_PUBLIC_API_URL) {
  if (Constants.expoConfig?.hostUri) {
    const hostIP = Constants.expoConfig.hostUri.split(':')[0];
    baseURL = `http://${hostIP}:3000/api/v1`;
  } else if (Platform.OS === 'android') {
    baseURL = 'http://10.0.2.2:3000/api/v1';
  }
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
