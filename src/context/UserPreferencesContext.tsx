
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserPreferenceMode, Language, UserProfile, IslamicPreferences } from '@/types';

interface UserPreferencesContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  mode: UserPreferenceMode;
  setMode: (mode: UserPreferenceMode) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
  updateProfileField: (updates: Partial<UserProfile>) => void;
  // generateEncryptionKey: () => string; // Removed as per previous request
  // getEncryptionKey: () => string | null; // Removed as per previous request
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const defaultProfile: UserProfile = {
  id: '',
  email: null,
  displayName: null,
  mode: 'conventional', // Default mode
  language: 'en',
  subscriptionTier: 'free',
  is2FAEnabled: false,
  // encryptionKey: undefined, // Removed
  sadaqahEnabled: false,
  sadaqahPercentage: undefined, 
  islamicPreferences: { madhhab: ''}, 
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyThemeAndFont = useCallback((themeMode: UserPreferenceMode) => {
    if (typeof window !== 'undefined') {
      document.documentElement.dataset.theme = themeMode;
      document.documentElement.classList.remove('font-islamic', 'font-conventional');
      document.documentElement.classList.add(themeMode === 'islamic' ? 'font-islamic' : 'font-conventional');
    }
  }, []);

  useEffect(() => {
    const storedProfileString = localStorage.getItem('userProfile');
    let effectiveMode = defaultProfile.mode;
    if (storedProfileString) {
      try {
        const storedProfile = JSON.parse(storedProfileString) as UserProfile;
        const mergedProfile = {
          ...defaultProfile,
          ...storedProfile,
          id: storedProfile.id || 'guestUser',
          islamicPreferences: {
            ...defaultProfile.islamicPreferences,
            ...(storedProfile.islamicPreferences || {}),
          },
        };
        setProfileState(mergedProfile);
        effectiveMode = mergedProfile.mode;
      } catch (e) {
        console.error("Failed to parse userProfile from localStorage", e);
        setProfileState({...defaultProfile, id: 'guestUser', displayName: 'Guest User'});
      }
    } else {
      setProfileState({...defaultProfile, id: 'guestUser', displayName: 'Guest User'});
    }
    applyThemeAndFont(effectiveMode);
    setIsLoading(false);
  }, [applyThemeAndFont]);

  const setProfile = useCallback((newProfile: UserProfile | null) => {
    let effectiveMode = defaultProfile.mode;
    if (newProfile) {
      effectiveMode = newProfile.mode;
      setProfileState(newProfile);
      localStorage.setItem('userProfile', JSON.stringify(newProfile));
    } else {
      localStorage.removeItem('userProfile');
      setProfileState({...defaultProfile, id: 'guestUser', displayName: 'Guest User'});
    }
    applyThemeAndFont(effectiveMode);
  }, [applyThemeAndFont]);
  
  const updateProfileField = useCallback((updates: Partial<UserProfile>) => {
    setProfileState(prevProfile => {
      const baseProfile = prevProfile || defaultProfile;
      const updatedIslamicPreferences = updates.islamicPreferences 
        ? { ...(baseProfile.islamicPreferences || {}), ...updates.islamicPreferences } 
        : baseProfile.islamicPreferences;

      const oldMode = baseProfile.mode;
      const newMode = updates.mode || oldMode;

      const updatedProfile = { 
        ...baseProfile, 
        ...updates, 
        islamicPreferences: updatedIslamicPreferences,
        id: baseProfile.id || (updates.id || 'guestUser') 
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      if (newMode !== oldMode || (updates.mode && updates.mode !== baseProfile.mode)) {
        applyThemeAndFont(newMode);
      }
      return updatedProfile;
    });
  }, [applyThemeAndFont]);

  const setMode = useCallback((newMode: UserPreferenceMode) => {
    updateProfileField({ mode: newMode });
    // applyThemeAndFont is called within updateProfileField if mode changes
  }, [updateProfileField]);

  const setLanguage = useCallback((newLanguage: Language) => {
    updateProfileField({ language: newLanguage });
    if (typeof window !== 'undefined') {
      document.documentElement.lang = newLanguage;
      document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, [updateProfileField]);

  // Removed encryption key functions as per previous updates

  useEffect(() => {
    if (profile?.language && typeof window !== 'undefined') {
      document.documentElement.lang = profile.language;
      document.documentElement.dir = profile.language === 'ar' ? 'rtl' : 'ltr';
    }
    // Apply theme on initial load based on profile, if not already handled by the main useEffect
    if (profile && !isLoading) { // ensure profile is loaded
        applyThemeAndFont(profile.mode);
    }

  }, [profile, isLoading, applyThemeAndFont]);


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
      // generateEncryptionKey, // Removed
      // getEncryptionKey, // Removed
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
