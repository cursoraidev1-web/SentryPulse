import { api } from './api';

const TOKEN_KEY = 'sentrypulse_token';
const USER_KEY = 'sentrypulse_user';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export const auth = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  isAuthenticated: (): boolean => {
    return !!auth.getToken();
  },

  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response: any = await api.auth.login(email, password);
    
    auth.setToken(response.data.token);
    auth.setUser(response.data.user);
    
    return response.data;
  },

  register: async (data: { name: string; email: string; password: string }): Promise<{ user: User; token: string }> => {
    const response: any = await api.auth.register(data);
    
    auth.setToken(response.data.token);
    auth.setUser(response.data.user);
    
    return response.data;
  },

  logout: (): void => {
    auth.removeToken();
    window.location.href = '/login';
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = auth.getToken();
    if (!token) return null;

    try {
      const response: any = await api.auth.me(token);
      auth.setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      auth.removeToken();
      return null;
    }
  },
};
