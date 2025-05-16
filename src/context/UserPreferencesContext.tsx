
"use client";
import { useAuth } from '@/hooks/use-auth'; // Assuming a hook for auth state and user data
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
  savePreferencesToFirebase: (preferences: Partial<UserProfile>) => Promise<void>;
  updateProfileField: (updates: Partial<UserProfile>) => void; // Added this line
  generateEncryptionKey?: () => string | null; // Made optional based on previous removal
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
  sadaqahEnabled: false, // Example additional preference
  sadaqahPercentage: undefined, // Example additional preference
  islamicPreferences: { madhhab: ''}, // Example nested preference
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode; initialPreferences?: Partial<UserProfile> }> = ({ children, initialPreferences }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(() => ({...defaultProfile, ...initialPreferences}));
  const [isLoading, setIsLoading] = useState(false); 
  const { user: firebaseUser, loading: authLoading } = useAuth(); 

  const applyThemeAndFont = useCallback((themeMode: UserPreferenceMode) => {
    if (typeof window !== 'undefined') {
      document.documentElement.dataset.theme = themeMode;
      document.documentElement.classList.remove('font-islamic', 'font-conventional');
      document.documentElement.classList.add(themeMode === 'islamic' ? 'font-islamic' : 'font-conventional');
    }
  }, []);

  // Function to simulate reading preferences from Firebase
  const readPreferencesFromFirebase = useCallback(async (userId: string): Promise<UserProfile | null> => {
    // TODO: Implement actual Firebase read logic (e.g., from 'users' collection)
    console.log(`Simulating reading preferences for user: ${userId} from Firebase`);
    // Placeholder: Return a mock profile or null
    return null;
  }, []);

  // Function to simulate saving preferences to Firebase
  const savePreferencesToFirebase = useCallback(async (preferences: Partial<UserProfile>): Promise<void> => {
    // TODO: Implement actual Firebase save logic
    console.log("Simulating saving preferences to Firebase:", preferences);
    // In a real app, you'd update the user's document in Firestore here
  }, []);

  useEffect(() => {
    const fetchAndSetProfile = async () => {
      setIsLoading(true);
      let fetchedProfile: UserProfile | null = null;

      if (firebaseUser) {
        // Attempt to read from Firebase if user is logged in
        fetchedProfile = await readPreferencesFromFirebase(firebaseUser.uid);
        if (fetchedProfile) {
          setProfileState({ ...defaultProfile, ...initialPreferences, ...fetchedProfile, id: firebaseUser.uid, email: firebaseUser.email || fetchedProfile.email, displayName: firebaseUser.displayName || fetchedProfile.displayName });
          applyThemeAndFont(fetchedProfile.mode || defaultProfile.mode);
        } else {
           // If no profile in Firebase, maybe it's a new user or fetch failed. Use default.
           setProfileState({ ...defaultProfile, ...initialPreferences, id: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName });
           applyThemeAndFont(initialPreferences?.mode || defaultProfile.mode);
        }
      } else {
        // Handle guest user or logged out state - perhaps clear profile or use default guest
        setProfileState({ ...defaultProfile, ...initialPreferences, id: 'guestUser', displayName: 'Guest User' });
        applyThemeAndFont(initialPreferences?.mode || defaultProfile.mode);
      }
      setIsLoading(false);
    };

    if (!authLoading) {
       fetchAndSetProfile();
    }
  }, [firebaseUser, authLoading, readPreferencesFromFirebase, applyThemeAndFont, initialPreferences]);

  const updateProfileField = useCallback(async (updates: Partial<UserProfile>) => {
     setProfileState(prevProfile => {
       const baseProfile = prevProfile || {...defaultProfile, ...initialPreferences};
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

       if (newMode !== oldMode && newMode !== undefined) {
         applyThemeAndFont(newMode);
       }

       if (updatedProfile.id && updatedProfile.id !== 'guestUser') {
           savePreferencesToFirebase({userId: updatedProfile.id, ...updates}); 
       }
       return updatedProfile;
     });
  }, [applyThemeAndFont, savePreferencesToFirebase, initialPreferences]);

  const setProfile = useCallback((newProfile: UserProfile | null) => {
    if (newProfile) {
       updateProfileField(newProfile); 
    } else {
       setProfileState({ ...defaultProfile, ...initialPreferences, id: 'guestUser', displayName: 'Guest User' });
       applyThemeAndFont(initialPreferences?.mode || defaultProfile.mode);
    }
  }, [updateProfileField, applyThemeAndFont, initialPreferences]);

   const setMode = useCallback((newMode: UserPreferenceMode) => {
     updateProfileField({ mode: newMode });
   }, [updateProfileField]);

  const setLanguage = useCallback((newLanguage: Language) => {
     updateProfileField({ language: newLanguage });
   }, [updateProfileField]);

  useEffect(() => {
    if (profile?.language && typeof window !== 'undefined') {
      document.documentElement.lang = profile.language;
      document.documentElement.dir = profile.language === 'ar' ? 'rtl' : 'ltr';
    }
    if(profile?.mode && typeof window !== 'undefined'){
        applyThemeAndFont(profile.mode);
    }
  }, [profile, applyThemeAndFont]); 

  if (authLoading || isLoading) {
     return null; 
  }

  return (
    <UserPreferencesContext.Provider value={{ 
      profile,
      setProfile, 
      mode: profile?.mode || initialPreferences?.mode || defaultProfile.mode, 
      setMode,
      language: profile?.language || initialPreferences?.language || defaultProfile.language, 
      setLanguage,
      isLoading,
      savePreferencesToFirebase, 
      updateProfileField,
      // generateEncryptionKey // Removed as per previous change
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
