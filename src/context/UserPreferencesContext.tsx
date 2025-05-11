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
  generateEncryptionKey: () => string; // Changed name and signature
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
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading profile (e.g., from Firebase Auth/Firestore or localStorage for demo)
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setProfileState(JSON.parse(storedProfile));
    } else {
      // For demo, initialize with default if no user is "logged in"
      // In a real app, this would be driven by auth state
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
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [updateProfileField]);

  // Generates a new encryption key string. Does not store it or update profile.
  const generateEncryptionKey = (): string => {
    // Basic key generation for demo. In a real app, use a strong KDF or more robust generation.
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    const key = Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join(''); // Ensure two hex characters per segment
    return key;
  };

  // Retrieves the encryption key from the current user profile.
  const getEncryptionKey = (): string | null => {
    return profile?.encryptionKey || null;
  };


  useEffect(() => {
    if (profile?.language) {
      document.documentElement.lang = profile.language;
      document.documentElement.dir = profile.language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [profile?.language]);


  if (isLoading) {
    // You might want a loading spinner or null render here
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
      generateEncryptionKey, // Updated function name
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

