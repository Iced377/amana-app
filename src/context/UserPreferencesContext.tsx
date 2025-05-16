
"use client";
import { useAuth } from '@/hooks/use-auth'; // Assuming a hook for auth state and user data
import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserPreferenceMode, Language, UserProfile, IslamicPreferences, VaultDetails } from '@/types'; // Added VaultDetails
import { locales, fallbackLng, type LocaleTypes } from '@/locales/settings';
import { useRouter, usePathname } from 'next/navigation'; // For language redirection

interface UserPreferencesContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  mode: UserPreferenceMode;
  setMode: (mode: UserPreferenceMode) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
  savePreferencesToFirebase: (preferences: Partial<UserProfile>) => Promise<void>;
  updateProfileField: (updates: Partial<UserProfile>) => void;
  // generateEncryptionKey?: () => string | null; // Encryption key management seems removed
  userVaults: VaultDetails[]; // Added userVaults
  addUserVault: (vault: VaultDetails) => void; // Added addUserVault
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const defaultProfile: UserProfile = {
  id: '',
  email: null,
  displayName: null,
  mode: 'conventional', // Default mode
  language: fallbackLng,
  subscriptionTier: 'free',
  is2FAEnabled: false,
  // encryptionKey: undefined, // Removed
  sadaqahEnabled: false, 
  sadaqahPercentage: undefined, 
  islamicPreferences: { madhhab: ''}, 
  onboardingCompleted: false, // Default for new users
  photoURL: undefined,
  country: undefined,
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode; initialPreferences?: Partial<UserProfile> }> = ({ children, initialPreferences }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(() => ({...defaultProfile, ...initialPreferences}));
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const { user: firebaseUser, loading: authLoading } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();
  const [userVaults, setUserVaults] = useState<VaultDetails[]>([]);

  const applyThemeAndFont = useCallback((themeMode: UserPreferenceMode) => {
    if (typeof window !== 'undefined') {
      document.documentElement.dataset.theme = themeMode;
      document.documentElement.classList.remove('font-islamic', 'font-conventional');
      document.documentElement.classList.add(themeMode === 'islamic' ? 'font-islamic' : 'font-conventional');
    }
  }, []);

  const readPreferencesFromFirebase = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log(`Simulating reading preferences for user: ${userId} from Firebase`);
    // In a real app, fetch from Firestore: db.collection('users').doc(userId).get()
    // For now, returning null to simulate a new user or let initial profile take precedence
    return null; 
  }, []);

  const savePreferencesToFirebase = useCallback(async (preferences: Partial<UserProfile>): Promise<void> => {
    if (!profile?.id || profile.id === 'guestUser') {
      console.warn("Attempted to save preferences for guest user or user with no ID.");
      return;
    }
    console.log("Simulating saving preferences to Firebase for user:", profile.id, preferences);
    // In a real app: await db.collection('users').doc(profile.id).set(preferences, { merge: true });
  }, [profile?.id]);

  useEffect(() => {
    const fetchAndSetProfile = async () => {
      setIsLoading(true);
      if (firebaseUser) {
        const fetchedProfile = await readPreferencesFromFirebase(firebaseUser.uid);
        const initialLang = (pathname.split('/')[1] as Language) || fallbackLng;

        const baseProfileData = {
          ...defaultProfile,
          ...initialPreferences,
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || fetchedProfile?.displayName || defaultProfile.displayName,
          language: fetchedProfile?.language || initialLang, // Prioritize fetched, then path, then default
        };
        
        const finalProfile = fetchedProfile 
          ? { ...baseProfileData, ...fetchedProfile } 
          : baseProfileData;

        setProfileState(finalProfile);
        applyThemeAndFont(finalProfile.mode);
        if (finalProfile.language !== initialLang) {
            const newPath = pathname.replace(`/${initialLang}`, `/${finalProfile.language}`);
            if (newPath !== pathname) router.replace(newPath);
        }

      } else {
        // Guest user
        const guestLang = (pathname.split('/')[1] as Language) || fallbackLng;
        const guestProfile: UserProfile = { 
            ...defaultProfile, 
            ...initialPreferences, 
            id: 'guestUser', 
            displayName: 'Guest User',
            language: guestLang
        };
        setProfileState(guestProfile);
        applyThemeAndFont(guestProfile.mode);
      }
      setIsLoading(false);
    };

    if (!authLoading) { // Only run if Firebase auth state is resolved
       fetchAndSetProfile();
    }
  }, [firebaseUser, authLoading, readPreferencesFromFirebase, applyThemeAndFont, initialPreferences, pathname, router]);


  const updateProfileField = useCallback(async (updates: Partial<UserProfile>) => {
     setProfileState(prevProfile => {
       const baseProfile = prevProfile || {...defaultProfile, ...initialPreferences};
       const updatedIslamicPreferences = updates.islamicPreferences
         ? { ...(baseProfile.islamicPreferences || {}), ...updates.islamicPreferences }
         : baseProfile.islamicPreferences;

       const oldMode = baseProfile.mode;
       const newMode = updates.mode || oldMode;
       const oldLanguage = baseProfile.language;
       const newLanguage = updates.language || oldLanguage;

       const updatedProfile: UserProfile = {
         ...baseProfile,
         ...updates,
         islamicPreferences: updatedIslamicPreferences,
         id: baseProfile.id || (updates.id || 'guestUser'),
         language: newLanguage,
       };

       if (newMode !== oldMode && newMode !== undefined) {
         applyThemeAndFont(newMode);
       }
       
       if (newLanguage !== oldLanguage && typeof window !== 'undefined') {
          document.documentElement.lang = newLanguage;
          document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
          const currentPathLocale = pathname.split('/')[1];
          if(currentPathLocale !== newLanguage) {
            const newPath = pathname.replace(`/${currentPathLocale}`, `/${newLanguage}`);
            router.replace(newPath);
          }
       }


       if (updatedProfile.id && updatedProfile.id !== 'guestUser') {
           savePreferencesToFirebase({userId: updatedProfile.id, ...updates}); 
       }
       return updatedProfile;
     });
  }, [applyThemeAndFont, savePreferencesToFirebase, initialPreferences, pathname, router]);

  const setProfile = useCallback((newProfile: UserProfile | null) => {
    if (newProfile) {
       updateProfileField(newProfile); 
    } else {
       const guestLang = (pathname.split('/')[1] as Language) || fallbackLng;
       const guestProfile: UserProfile = { 
         ...defaultProfile, 
         ...initialPreferences, 
         id: 'guestUser', 
         displayName: 'Guest User',
         language: guestLang
       };
       setProfileState(guestProfile);
       applyThemeAndFont(guestProfile.mode);
    }
  }, [updateProfileField, applyThemeAndFont, initialPreferences, pathname]);

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
  }, [profile?.language, profile?.mode, applyThemeAndFont]); 

  const addUserVault = useCallback((vault: VaultDetails) => {
    setUserVaults(prevVaults => [...prevVaults, vault]);
    // TODO: Persist to Firestore for the current user
    if (profile?.id && profile.id !== 'guestUser') {
        console.log(`Simulating saving vault "${vault.name}" for user ${profile.id} to Firestore.`);
        // Example: db.collection('users').doc(profile.id).collection('vaults').add(vault);
    }
  }, [profile?.id]);


  // Initial check for authLoading to prevent premature rendering of children
  if (authLoading) {
     return null; // Or a global loading spinner
  }

  return (
    <UserPreferencesContext.Provider value={{ 
      profile,
      setProfile, 
      mode: profile?.mode || initialPreferences?.mode || defaultProfile.mode, 
      setMode,
      language: profile?.language || initialPreferences?.language || defaultProfile.language, 
      setLanguage,
      isLoading: isLoading || authLoading, // Combine loading states
      savePreferencesToFirebase, 
      updateProfileField,
      userVaults,
      addUserVault
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
