import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'homeowner' | 'contractor';
  token: string;
};

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (userData: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (userData) => {
        // Set auth cookie for middleware
        Cookies.set('auth-token', userData.token, { 
          expires: 7,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        });
        
        set({ 
          user: userData, 
          token: userData.token,
          isAuthenticated: true 
        });
      },
      logout: () => {
        // Remove auth cookie
        Cookies.remove('auth-token');
        
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useAuth = () => {
  const { user, isAuthenticated, token, login, logout } = useAuthStore();
  
  const checkAuth = () => {
    return isAuthenticated && user !== null && token !== null;
  };

  return { user, isAuthenticated, token, login, logout, checkAuth };
};