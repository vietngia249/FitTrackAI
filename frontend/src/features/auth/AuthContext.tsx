import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponseData } from './types.js';
import { apiLogin, apiRegister, apiRefreshToken, apiLogout, apiGoogleAuth, apiUpdateProfile } from './api.js';

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
  updateProfile: (data: {
    displayName?: string;
    dateOfBirth?: string | null;
    biologicalSex?: 'male' | 'female' | 'other' | null;
    height?: number | null;
    currentWeight?: number | null;
    targetWeight?: number | null;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
    fitnessGoal?: 'muscle_gain' | 'fat_loss' | 'maintenance' | 'strength' | null;
    preferredUnits?: 'metric' | 'imperial';
    locale?: 'en' | 'vi';
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('fittrack_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('fittrack_access_token');
  });
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
          localStorage.setItem('fittrack_access_token', data.accessToken);
          localStorage.setItem('fittrack_user', JSON.stringify(data.user));
        }
      } catch {
        // Refresh cookie expired or unavailable; clear stale access token
        if (mounted) {
          setAccessToken(null);
          localStorage.removeItem('fittrack_access_token');
        }
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

  const setAuthSession = (u: User, token: string) => {
    setUser(u);
    setAccessToken(token);
    localStorage.setItem('fittrack_access_token', token);
    localStorage.setItem('fittrack_user', JSON.stringify(u));
  };

  const login = async (data: { email: string; password: string }) => {
    const res = await apiLogin(data);
    setAuthSession(res.user, res.accessToken);
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
    setAuthSession(res.user, res.accessToken);
    closeAuthModal();
  };

  const loginWithGoogle = async (idToken: string) => {
    const res = await apiGoogleAuth(idToken);
    setAuthSession(res.user, res.accessToken);
    closeAuthModal();
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('fittrack_access_token');
      localStorage.removeItem('fittrack_user');
    }
  };

  const updateProfile = async (data: any) => {
    let token = accessToken || localStorage.getItem('fittrack_access_token');

    // Helper to merge local user state so user input is never lost
    const updateLocalUser = () => {
      const mergedUser: User = {
        ...(user || {
          id: 'local-user',
          email: '',
          displayName: data.displayName || 'Athlete',
          createdAt: new Date().toISOString(),
        }),
        displayName: data.displayName || user?.displayName || 'Athlete',
        profile: {
          ...(user?.profile || {}),
          ...data,
        },
      };
      setUser(mergedUser);
      localStorage.setItem('fittrack_user', JSON.stringify(mergedUser));
      return mergedUser;
    };

    if (token) {
      try {
        const updatedUser = await apiUpdateProfile(token, data);
        setUser(updatedUser);
        localStorage.setItem('fittrack_user', JSON.stringify(updatedUser));
        return;
      } catch (err: any) {
        // If 401 Unauthorized or token invalid/expired, attempt silent token refresh once
        if (
          err.statusCode === 401 ||
          err.status === 401 ||
          err.message?.includes('token') ||
          err.message?.includes('Unauthorized')
        ) {
          try {
            const refreshRes = await apiRefreshToken();
            token = refreshRes.accessToken;
            setAccessToken(token);
            localStorage.setItem('fittrack_access_token', token);

            // Retry update with refreshed token
            const updatedUser = await apiUpdateProfile(token, data);
            setUser(updatedUser);
            localStorage.setItem('fittrack_user', JSON.stringify(updatedUser));
            return;
          } catch {
            // Both access token and refresh token expired / invalid
            updateLocalUser();
            setAccessToken(null);
            localStorage.removeItem('fittrack_access_token');
            openLoginModal();
            throw new Error(
              'Phiên đăng nhập đã hết hạn. Dữ liệu đã được lưu tạm trên máy. Vui lòng đăng nhập lại để đồng bộ.'
            );
          }
        }
        throw err;
      }
    } else {
      // User is editing profile without an active access token
      updateLocalUser();
      openLoginModal();
      throw new Error(
        'Bạn chưa đăng nhập. Dữ liệu đã được lưu tạm trên máy. Vui lòng đăng nhập để lưu vào tài khoản.'
      );
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
        updateProfile,
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
