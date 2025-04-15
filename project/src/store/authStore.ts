import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  password: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setCredentials: (username: string, password: string) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      username: null,
      password: null,
      login: (username: string, password: string) => {
        const storedUsername = get().username;
        const storedPassword = get().password;
        
        if (!storedUsername || !storedPassword) {
          set({ username, password, isAuthenticated: true });
          return true;
        }
        
        if (username === storedUsername && password === storedPassword) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false });
      },
      setCredentials: (username: string, password: string) => {
        set({ username, password });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore;