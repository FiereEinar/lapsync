import { create } from 'zustand';
import api from '../api/axios';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setUser: (user: any | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  checkAuth: async () => {
    try {
      const response = await api.post('/auth/token/verify');
      // On success, backend returns the user object directly
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },
  setUser: (user) => set({ user }),
  logout: async () => {
    try {
      set({ isLoading: true });
      await api.get('/auth/logout');
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error(error);
    }
  },
}));
