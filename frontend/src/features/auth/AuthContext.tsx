import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponseData } from './types.js';
import { apiLogin, apiRegister, apiRefreshToken, apiLogout, apiGoogleAuth } from './api.js';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    displayName: string;
    fitnessGoal?: string;
    preferredUnits?: string;
    locale?: string;
  }) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Silent refresh on mount to restore existing session via httpOnly cookie
  useEffect(() => {
    let mounted = true;
    async function restoreSession() {
      try {
        const data: AuthResponseData = await apiRefreshToken();
        if (mounted) {
          setUser(data.user);
          setAccessToken(data.accessToken);
        }
      } catch {
        // No active session or cookie expired
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (data: { email: string; password: string }) => {
    const res = await apiLogin(data);
    setUser(res.user);
    setAccessToken(res.accessToken);
    closeAuthModal();
  };

  const register = async (data: {
    email: string;
    password: string;
    displayName: string;
    fitnessGoal?: string;
    preferredUnits?: string;
    locale?: string;
  }) => {
    const res = await apiRegister(data);
    setUser(res.user);
    setAccessToken(res.accessToken);
    closeAuthModal();
  };

  const loginWithGoogle = async (idToken: string) => {
    const res = await apiGoogleAuth(idToken);
    setUser(res.user);
    setAccessToken(res.accessToken);
    closeAuthModal();
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
