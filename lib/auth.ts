import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export type UserRole = 'homeowner' | 'contractor';

export type User = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  activeRole: UserRole;
  token: string;
};

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (userData: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (userData) => {
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
        
        // Clear persisted state
        localStorage.removeItem('auth-storage');
        
        // Reset store state
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false 
        });
      },
      switchRole: (role) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            activeRole: role
          } : null
        }));
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useAuth = () => {
  const { user, isAuthenticated, token, login, logout, switchRole } = useAuthStore();
  
  const checkAuth = () => {
    const token = Cookies.get('auth-token');
    return isAuthenticated && user !== null && token !== null;
  };

  return { user, isAuthenticated, token, login, logout, switchRole, checkAuth };
};