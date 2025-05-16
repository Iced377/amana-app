
"use client";
import { useAuth } from '@/hooks/use-auth';
import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserPreferenceMode, Language, UserProfile, IslamicPreferences, VaultDetails } from '@/types';
import { locales, fallbackLng, type LocaleTypes } from '@/locales/settings';
import { useRouter, usePathname } from 'next/navigation';

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
  userVaults: VaultDetails[];
  addUserVault: (vault: VaultDetails) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const defaultProfile: UserProfile = {
  id: 'guestUser',
  email: null,
  displayName: null,
  mode: 'conventional',
  language: fallbackLng,
  subscriptionTier: 'free',
  is2FAEnabled: false,
  sadaqahEnabled: false,
  sadaqahPercentage: undefined,
  islamicPreferences: { madhhab: ''},
  onboardingCompleted: false,
  photoURL: undefined,
  country: undefined,
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode; initialPreferences?: Partial<UserProfile> }> = ({ children, initialPreferences }) => {
  const [profileState, setProfileState] = useState<UserProfile | null>(() => ({...defaultProfile, ...initialPreferences}));
  const [isLoading, setIsLoading] = useState(true); // Start as true
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
    // Replace with actual Firestore call
    return null;
  }, []);

  const savePreferencesToFirebase = useCallback(async (preferencesToSave: Partial<UserProfile>): Promise<void> => {
    const userIdToSave = preferencesToSave.id || profileState?.id;
    if (!userIdToSave || userIdToSave === 'guestUser') {
      console.warn("Attempted to save preferences for guest user or user with no ID.", preferencesToSave);
      return;
    }
    const { id, ...dataToSave } = preferencesToSave;
    console.log("Simulating saving preferences to Firebase for user:", userIdToSave, dataToSave);
    // In a real app: await db.collection('users').doc(userIdToSave).set(dataToSave, { merge: true });
  }, [profileState?.id]);

  const updateProfileField = useCallback((updates: Partial<UserProfile>) => {
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
         id: updates.id || baseProfile.id || 'guestUser',
         language: newLanguage,
       };

       if (newMode !== oldMode && newMode !== undefined) {
         applyThemeAndFont(newMode);
       }
       
       if (newLanguage !== oldLanguage && typeof window !== 'undefined') {
          document.documentElement.lang = newLanguage;
          document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
          const currentPathLocale = pathname.split('/')[1];
          if(currentPathLocale !== newLanguage && !isLoading) { // Check isLoading to prevent premature navigation
            const newPath = pathname.replace(`/${currentPathLocale}`, `/${newLanguage}`);
            if (newPath !== pathname) router.replace(newPath);
          }
       }

       if (updatedProfile.id && updatedProfile.id !== 'guestUser') {
           savePreferencesToFirebase(updatedProfile);
       }
       return updatedProfile;
     });
  }, [applyThemeAndFont, savePreferencesToFirebase, initialPreferences, pathname, router, isLoading]); // Added isLoading dependency

  const setProfile = useCallback((newProfile: UserProfile | null) => {
    if (newProfile && newProfile.id && newProfile.id !== 'guestUser') {
       updateProfileField(newProfile);
       // Crucially, if setProfile is called with a valid (even mock) user,
       // we consider the profile "loaded" for this app session.
       setIsLoading(false);
    } else {
       const guestLang = (pathname.split('/')[1] as Language) || fallbackLng;
       const guestProfileData: UserProfile = { 
         ...defaultProfile, 
         ...initialPreferences, 
         id: 'guestUser', 
         displayName: 'Guest User',
         language: guestLang,
         onboardingCompleted: false,
       };
       setProfileState(guestProfileData);
       applyThemeAndFont(guestProfileData.mode);
       setIsLoading(false); // Guest profile is also a "loaded" state for the app
    }
  }, [updateProfileField, applyThemeAndFont, initialPreferences, pathname]);

  useEffect(() => {
    const manageProfileBasedOnAuth = async () => {
      if (authLoading) {
        setIsLoading(true); // Keep true until auth is resolved
        return;
      }

      if (firebaseUser) {
        setIsLoading(true); // Start loading process for Firebase user
        const fetchedProfileFromDB = await readPreferencesFromFirebase(firebaseUser.uid);
        const pathLocale = (pathname.split('/')[1] as Language) || fallbackLng;

        const baseProfile: UserProfile = {
          ...defaultProfile,
          ...initialPreferences,
          ...(fetchedProfileFromDB || {}),
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || fetchedProfileFromDB?.displayName || defaultProfile.displayName,
          language: fetchedProfileFromDB?.language || pathLocale,
          mode: fetchedProfileFromDB?.mode || initialPreferences?.mode || defaultProfile.mode,
          onboardingCompleted: fetchedProfileFromDB?.onboardingCompleted || initialPreferences?.onboardingCompleted || defaultProfile.onboardingCompleted,
          subscriptionTier: fetchedProfileFromDB?.subscriptionTier || initialPreferences?.subscriptionTier || defaultProfile.subscriptionTier,
          is2FAEnabled: fetchedProfileFromDB?.is2FAEnabled || initialPreferences?.is2FAEnabled || defaultProfile.is2FAEnabled,
          sadaqahEnabled: fetchedProfileFromDB?.sadaqahEnabled || initialPreferences?.sadaqahEnabled || defaultProfile.sadaqahEnabled,
          sadaqahPercentage: fetchedProfileFromDB?.sadaqahPercentage || initialPreferences?.sadaqahPercentage,
          islamicPreferences: fetchedProfileFromDB?.islamicPreferences || initialPreferences?.islamicPreferences || defaultProfile.islamicPreferences,
          photoURL: fetchedProfileFromDB?.photoURL || initialPreferences?.photoURL || firebaseUser.photoURL,
          country: fetchedProfileFromDB?.country || initialPreferences?.country,
        };
        
        setProfileState(baseProfile);
        applyThemeAndFont(baseProfile.mode);
        savePreferencesToFirebase(baseProfile); // Save merged profile to ensure consistency

        const currentPathLang = (pathname.split('/')[1] as Language) || fallbackLng;
        if (baseProfile.language !== currentPathLang && typeof window !== 'undefined') {
            const newPath = pathname.replace(`/${currentPathLang}`, `/${baseProfile.language}`);
            if (newPath !== pathname) router.replace(newPath);
        }
        setIsLoading(false); // Finished processing Firebase user
      } else { // No Firebase user
        // If isLoading is already false, it means setProfile (e.g., from mock login)
        // has already established a profile state. Respect it.
        if (!isLoading && profileState && profileState.id !== 'guestUser') {
            applyThemeAndFont(profileState.mode);
             const currentPathLang = (pathname.split('/')[1] as Language) || fallbackLng;
            if (profileState.language !== currentPathLang && typeof window !== 'undefined') {
                 const newPath = pathname.replace(`/${currentPathLang}`, `/${profileState.language}`);
                if (newPath !== pathname) router.replace(newPath);
            }
        } else {
          // If isLoading is true, or if profileState is still guest/null,
          // then set the default guest profile.
          setIsLoading(true); // Indicate we are about to set a definitive guest state
          const guestLang = (pathname.split('/')[1] as Language) || fallbackLng;
          const guestProfile: UserProfile = {
            ...defaultProfile,
            ...initialPreferences,
            id: 'guestUser',
            displayName: 'Guest User',
            language: guestLang,
            onboardingCompleted: false,
          };
          setProfileState(guestProfile);
          applyThemeAndFont(guestProfile.mode);
          setIsLoading(false); // Finished setting guest profile
        }
      }
    };

    manageProfileBasedOnAuth();
  // Removed profileState and isLoading from dependencies to avoid potential loops from their own updates within this effect.
  // The effect should primarily react to authLoading and firebaseUser changes.
  // The internal logic now correctly checks the existing profileState and isLoading values before acting.
  }, [firebaseUser, authLoading, readPreferencesFromFirebase, applyThemeAndFont, initialPreferences, pathname, router, savePreferencesToFirebase]);


  useEffect(() => {
    if (profileState?.language && typeof window !== 'undefined') {
      document.documentElement.lang = profileState.language;
      document.documentElement.dir = profileState.language === 'ar' ? 'rtl' : 'ltr';
    }
    if(profileState?.mode && typeof window !== 'undefined'){
        applyThemeAndFont(profileState.mode);
    }
  }, [profileState?.language, profileState?.mode, applyThemeAndFont]); 

  const addUserVault = useCallback((vault: VaultDetails) => {
    setUserVaults(prevVaults => [...prevVaults, vault]);
    if (profileState?.id && profileState.id !== 'guestUser') {
        console.log(`Simulating saving vault "${vault.name}" for user ${profileState.id} to Firestore.`);
    }
  }, [profileState?.id]);

   // Fallback loading state to prevent rendering children before context is fully initialized
  if (isLoading && (!profileState || profileState.id === 'guestUser' && !firebaseUser)) {
     return null;
  }

  return (
    <UserPreferencesContext.Provider value={{ 
      profile: profileState,
      setProfile, 
      mode: profileState?.mode || initialPreferences?.mode || defaultProfile.mode, 
      setMode: (newMode) => updateProfileField({ mode: newMode }),
      language: profileState?.language || initialPreferences?.language || defaultProfile.language, 
      setLanguage: (newLang) => updateProfileField({ language: newLang }),
      isLoading: isLoading, // Expose the context's loading state
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
