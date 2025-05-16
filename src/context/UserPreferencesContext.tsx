
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
  id: 'guestUser', // Default to guestUser ID
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
  const [isLoading, setIsLoading] = useState(true);
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
    // Replace with actual Firestore call:
    // const docRef = db.collection('users').doc(userId);
    // const docSnap = await docRef.get();
    // if (docSnap.exists) return docSnap.data() as UserProfile;
    return null;
  }, []);

  const savePreferencesToFirebase = useCallback(async (preferencesToSave: Partial<UserProfile>): Promise<void> => {
    // Use preferencesToSave.id if available, otherwise fallback to profileState.id
    const userIdToSave = preferencesToSave.id || profileState?.id;
    if (!userIdToSave || userIdToSave === 'guestUser') {
      console.warn("Attempted to save preferences for guest user or user with no ID.", preferencesToSave);
      return;
    }
    // Remove userId from the object actually being saved to Firestore fields
    const { id, ...dataToSave } = preferencesToSave;
    console.log("Simulating saving preferences to Firebase for user:", userIdToSave, dataToSave);
    // In a real app: await db.collection('users').doc(userIdToSave).set(dataToSave, { merge: true });
  }, [profileState?.id]);


  useEffect(() => {
    const manageProfileBasedOnAuth = async () => {
      if (authLoading) {
        setIsLoading(true);
        return; 
      }
      setIsLoading(true);

      if (firebaseUser) {
        const fetchedProfileFromDB = await readPreferencesFromFirebase(firebaseUser.uid);
        const pathLocale = (pathname.split('/')[1] as Language) || fallbackLng;

        const baseProfile: UserProfile = {
          ...defaultProfile, // Start with system defaults
          ...initialPreferences, // Apply any initial props
          ...(fetchedProfileFromDB || {}), // Apply fetched DB profile
          id: firebaseUser.uid, // Firebase UID is authoritative
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || fetchedProfileFromDB?.displayName || defaultProfile.displayName,
          language: fetchedProfileFromDB?.language || pathLocale, // DB > path > fallback
           // Ensure all fields are merged correctly
          mode: fetchedProfileFromDB?.mode || initialPreferences?.mode || defaultProfile.mode,
          onboardingCompleted: fetchedProfileFromDB?.onboardingCompleted || initialPreferences?.onboardingCompleted || defaultProfile.onboardingCompleted,
          subscriptionTier: fetchedProfileFromDB?.subscriptionTier || initialPreferences?.subscriptionTier || defaultProfile.subscriptionTier,
          is2FAEnabled: fetchedProfileFromDB?.is2FAEnabled || initialPreferences?.is2FAEnabled || defaultProfile.is2FAEnabled,
          sadaqahEnabled: fetchedProfileFromDB?.sadaqahEnabled || initialPreferences?.sadaqahEnabled || defaultProfile.sadaqahEnabled,
          sadaqahPercentage: fetchedProfileFromDB?.sadaqahPercentage || initialPreferences?.sadaqahPercentage,
          islamicPreferences: fetchedProfileFromDB?.islamicPreferences || initialPreferences?.islamicPreferences || defaultProfile.islamicPreferences,
          photoURL: fetchedProfileFromDB?.photoURL || initialPreferences?.photoURL,
          country: fetchedProfileFromDB?.country || initialPreferences?.country,
        };
        
        setProfileState(baseProfile);
        applyThemeAndFont(baseProfile.mode);

        const currentPathLang = (pathname.split('/')[1] as Language) || fallbackLng;
        if (baseProfile.language !== currentPathLang && typeof window !== 'undefined') {
            const newPath = pathname.replace(`/${currentPathLang}`, `/${baseProfile.language}`);
            if (newPath !== pathname) router.replace(newPath);
        }
      } else {
        // No Firebase user.
        // If profileState (the current state in the context from a previous setProfile call) 
        // is already a valid, non-guest user, respect it. This covers mock login.
        if (profileState && profileState.id && profileState.id !== 'guestUser') {
          applyThemeAndFont(profileState.mode);
          const currentPathLang = (pathname.split('/')[1] as Language) || fallbackLng;
          if (profileState.language !== currentPathLang && typeof window !== 'undefined') {
            const newPath = pathname.replace(`/${currentPathLang}`, `/${profileState.language}`);
            if (newPath !== pathname) router.replace(newPath);
          }
        } else {
          // No Firebase user AND no valid non-guest profile currently in state. Set to default guest.
          const guestLang = (pathname.split('/')[1] as Language) || fallbackLng;
          const guestProfile: UserProfile = {
            ...defaultProfile,
            ...initialPreferences,
            id: 'guestUser',
            displayName: 'Guest User',
            language: guestLang,
          };
          setProfileState(guestProfile);
          applyThemeAndFont(guestProfile.mode);
        }
      }
      setIsLoading(false);
    };

    manageProfileBasedOnAuth();
  }, [
      firebaseUser,
      authLoading,
      // Dependencies below are mostly stable or their changes are handled within the effect
      // readPreferencesFromFirebase, applyThemeAndFont, initialPreferences, pathname, router
      // Not including profileState directly to avoid loops from its own updates,
      // the logic now reads the closure value of profileState appropriately.
    ]);


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
         id: baseProfile.id || (updates.id || 'guestUser'), // Ensure ID isn't lost or defaulted to guest if already set
         language: newLanguage,
       };
       
       // If profile was previously null or guest, and now we have a real ID, make sure it's not guestUser.
       if (baseProfile.id === 'guestUser' && updatedProfile.id && updatedProfile.id !== 'guestUser') {
           // This indicates a user just logged in or profile got fully initialized
       }


       if (newMode !== oldMode && newMode !== undefined) {
         applyThemeAndFont(newMode);
       }
       
       if (newLanguage !== oldLanguage && typeof window !== 'undefined') {
          document.documentElement.lang = newLanguage;
          document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
          const currentPathLocale = pathname.split('/')[1];
          if(currentPathLocale !== newLanguage) {
            const newPath = pathname.replace(`/${currentPathLocale}`, `/${newLanguage}`);
            if (newPath !== pathname) router.replace(newPath);
          }
       }

       if (updatedProfile.id && updatedProfile.id !== 'guestUser') {
           savePreferencesToFirebase(updatedProfile); // Pass the whole updatedProfile to save
       }
       return updatedProfile;
     });
  }, [applyThemeAndFont, savePreferencesToFirebase, initialPreferences, pathname, router]);

  const setProfile = useCallback((newProfile: UserProfile | null) => {
    if (newProfile && newProfile.id && newProfile.id !== 'guestUser') {
       updateProfileField(newProfile); 
    } else {
       // Setting to null or a guest profile
       const guestLang = (pathname.split('/')[1] as Language) || fallbackLng;
       const guestProfileData: UserProfile = { 
         ...defaultProfile, 
         ...initialPreferences, 
         id: 'guestUser', 
         displayName: 'Guest User',
         language: guestLang,
         onboardingCompleted: false, // Explicitly false for guest
       };
       setProfileState(guestProfileData);
       applyThemeAndFont(guestProfileData.mode);
    }
  }, [updateProfileField, applyThemeAndFont, initialPreferences, pathname]);

   const setMode = useCallback((newMode: UserPreferenceMode) => {
     updateProfileField({ mode: newMode });
   }, [updateProfileField]);

  const setLanguage = useCallback((newLanguage: Language) => {
     updateProfileField({ language: newLanguage });
   }, [updateProfileField]);

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

  if (authLoading && !firebaseUser && (!profileState || profileState.id === 'guestUser')) {
    // If auth is still loading, AND there's no firebaseUser yet,
    // AND the current profile state is still guest or null, show nothing/loader.
    // This prevents rendering children before initial auth state is determined.
     return null; 
  }


  return (
    <UserPreferencesContext.Provider value={{ 
      profile: profileState,
      setProfile, 
      mode: profileState?.mode || initialPreferences?.mode || defaultProfile.mode, 
      setMode,
      language: profileState?.language || initialPreferences?.language || defaultProfile.language, 
      setLanguage,
      isLoading: isLoading || authLoading, 
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

