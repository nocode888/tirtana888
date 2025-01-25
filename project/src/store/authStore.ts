import create from 'zustand';
import { MetaAuthState } from '../types/meta';

export const useAuthStore = create<MetaAuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  login: (token: string) => set({ accessToken: token, isAuthenticated: true }),
  logout: () => set({ accessToken: null, isAuthenticated: false }),
}));