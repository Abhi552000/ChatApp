import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Configure Axios globally for Mobile App
axios.defaults.baseURL = 'http://Abhisheks-MacBook-Air.local:5002';
axios.defaults.withCredentials = true;

interface AuthUser {
  message?: string;
  user: {
    _id: string;
    fullname: string;
    email: string;
    avatar?: string;
    about?: string;
    isVerified: boolean;
  };
}

interface AuthContextType {
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse user data from AsyncStorage on boot
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('ChatApp');
        if (storedUser) {
          setAuthUserState(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user state from storage:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStorageData();
  }, []);

  // Update AsyncStorage whenever authUser changes
  const setAuthUser = async (user: AuthUser | null) => {
    setAuthUserState(user);
    try {
      if (user) {
        await AsyncStorage.setItem('ChatApp', JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem('ChatApp');
      }
    } catch (error) {
      console.error('Failed to save user state to storage:', error);
    }
  };

  // Logout method
  const logout = async () => {
    try {
      await axios.post('/api/user/logout');
    } catch (error) {
      console.warn('API logout request failed:', error);
    } finally {
      await setAuthUser(null);
    }
  };

  // Set up response interceptor for 401 handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        if (error.response && error.response.status === 401) {
          await setAuthUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
