"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserPreferenceMode, Language, UserProfile } from '@/types';

interface UserPreferencesContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  mode: UserPreferenceMode;
  setMode: (mode: UserPreferenceMode) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
  updateProfileField: (updates: Partial<UserProfile>) => void;
  generateEncryptionKey: () => string;
  getEncryptionKey: () => string | null;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const defaultProfile: UserProfile = {
  id: '',
  email: null,
  displayName: null,
  mode: 'conventional',
  language: 'en',
  subscriptionTier: 'free',
  is2FAEnabled: false,
  encryptionKey: undefined, // Explicitly undefined
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProfileString = localStorage.getItem('userProfile');
    if (storedProfileString) {
      try {
        const storedProfile = JSON.parse(storedProfileString) as UserProfile;
        setProfileState(storedProfile);
      } catch (e) {
        console.error("Failed to parse userProfile from localStorage", e);
        // Fallback to a guest profile if parsing fails
        setProfileState({...defaultProfile, id: 'guestUser', displayName: 'Guest User'});
      }
    } else {
      setProfileState({...defaultProfile, id: 'guestUser', displayName: 'Guest User'});
    }
    setIsLoading(false);
  }, []);

  const setProfile = useCallback((newProfile: UserProfile | null) => {
    setProfileState(newProfile);
    if (newProfile) {
      localStorage.setItem('userProfile', JSON.stringify(newProfile));
    } else {
      localStorage.removeItem('userProfile');
      // When logging out or clearing profile, ensure we revert to a clean guest state
      setProfileState({...defaultProfile, id: 'guestUser', displayName: 'Guest User'});
    }
  }, []);
  
  const updateProfileField = useCallback((updates: Partial<UserProfile>) => {
    setProfileState(prevProfile => {
      if (!prevProfile) return null;
      const updatedProfile = { ...prevProfile, ...updates };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      return updatedProfile;
    });
  }, []);

  const setMode = useCallback((newMode: UserPreferenceMode) => {
    updateProfileField({ mode: newMode });
  }, [updateProfileField]);

  const setLanguage = useCallback((newLanguage: Language) => {
    updateProfileField({ language: newLanguage });
    if (typeof window !== 'undefined') {
      document.documentElement.lang = newLanguage;
      document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, [updateProfileField]);

  const generateEncryptionKey = (): string => {
    const array = new Uint32Array(8);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for environments where window.crypto is not available (e.g., some SSR scenarios if not careful)
      // This is NOT cryptographically secure for production, for demo/SSR safety only.
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * Math.pow(2,32));
      }
      console.warn("Using insecure fallback for crypto.getRandomValues. This should not happen in a browser environment.");
    }
    const key = Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');
    return key;
  };

  const getEncryptionKey = (): string | null => {
    return profile?.encryptionKey || null;
  };


  useEffect(() => {
    if (profile?.language && typeof window !== 'undefined') {
      document.documentElement.lang = profile.language;
      document.documentElement.dir = profile.language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [profile?.language]);


  if (isLoading) {
    return null; 
  }

  return (
    <UserPreferencesContext.Provider value={{ 
      profile, 
      setProfile,
      mode: profile?.mode || 'conventional', 
      setMode, 
      language: profile?.language || 'en', 
      setLanguage,
      isLoading,
      updateProfileField,
      generateEncryptionKey,
      getEncryptionKey,
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
