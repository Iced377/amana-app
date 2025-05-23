
"use client";

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTranslation } from '@/locales/client';
import type { LocaleTypes, Madhhab, UserPreferenceMode, Language, UserProfile } from '@/locales/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { QuranicVerse } from '@/components/QuranicVerse';
import { countryCodes } from '@/lib/countryCodes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, CheckSquare, Landmark, Languages, Shield, Briefcase } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';


const QURAN_VERSE_AMANAH = "إِنَّ ٱللَّهَ يَأْمُرُكُمْ أَن تُؤَدُُّوا۟ ٱلْأَمَٰنَٰتِ إِلَىٰٓ أَهْلِهَا";
const QURAN_VERSE_AMANAH_CITATION = "سورة النساء: ٥٨";

type OnboardingStep = 'language' | 'mode' | 'profile' | 'madhhab';

const NONE_SELECTED_COUNTRY_VALUE = "_NONE_";

export default function OnboardingPage({ params }: { params: { lng: LocaleTypes } }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, updateProfileField, isLoading: profileLoading } = useUserPreferences();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  
  const resolvedParams = use(params);
  const defaultInitialLocale = resolvedParams.lng || 'en';

  const [currentLocaleForUI, setCurrentLocaleForUI] = useState(profile?.language || defaultInitialLocale);
  const { t, i18n } = useTranslation(currentLocaleForUI, "translation");
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('language');

  const [displayName, setDisplayName] = useState(profile?.displayName || (firebaseUser?.displayName || ''));
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(profile?.country);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.photoURL || firebaseUser?.photoURL || null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // All useEffects MUST be declared before conditional returns.

  useEffect(() => {
    if (profile?.language && i18n.language !== profile.language) {
      i18n.changeLanguage(profile.language).then(() => setCurrentLocaleForUI(profile.language));
    } else if (!profile?.language && i18n.language !== defaultInitialLocale) {
        i18n.changeLanguage(defaultInitialLocale).then(() => setCurrentLocaleForUI(defaultInitialLocale));
    }
  }, [profile?.language, i18n, defaultInitialLocale]);

  useEffect(() => {
    if (profile) {
      if (!displayName && (profile.displayName || firebaseUser?.displayName)) {
        setDisplayName(profile.displayName || firebaseUser?.displayName || '');
      }
      if (!selectedCountry && profile.country) {
        setSelectedCountry(profile.country);
      }
      if (!photoPreview && (profile.photoURL || firebaseUser?.photoURL)) {
        setPhotoPreview(profile.photoURL || firebaseUser?.photoURL || null);
      }
      if(profile.language && currentLocaleForUI !== profile.language) {
        setCurrentLocaleForUI(profile.language);
      }
      // Initial step logic based on already set profile fields (if user returns to onboarding)
      if (currentStep === 'language' && profile.language) {
        // If language is set, but mode isn't, move to mode. This helps if user partially completed.
        if (!profile.mode) setCurrentStep('mode');
        else if (!profile.displayName) setCurrentStep('profile');
        else if (profile.mode === 'islamic' && !profile.islamicPreferences?.madhhab) setCurrentStep('madhhab');

      }
    }
  }, [profile, firebaseUser, currentLocaleForUI, displayName, selectedCountry, photoPreview, currentStep]);


  // Effect for redirecting if onboarding IS completed
  useEffect(() => {
    if (!profileLoading && profile && profile.onboardingCompleted) {
      router.replace(`/${currentLocaleForUI}/dashboard`);
    }
  }, [profileLoading, profile, router, currentLocaleForUI]);

  // Effect for redirecting if NOT authenticated for onboarding
  const isAuthenticatedForOnboarding = firebaseUser || (profile && profile.id && profile.id !== 'guestUser');
  useEffect(() => {
    if (!authLoading && !profileLoading && !isAuthenticatedForOnboarding) {
      router.replace(`/${currentLocaleForUI}/login`);
    }
  }, [authLoading, profileLoading, isAuthenticatedForOnboarding, router, currentLocaleForUI]);


  // Conditional returns for loading and authentication checks are NOW AFTER all hook declarations.
  if (authLoading || profileLoading || !profile) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /> Loading Onboarding...</div>;
  }

  if (!isAuthenticatedForOnboarding) {
      return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /> Redirecting to login...</div>;
  }

  // If profile is loaded and onboarding is completed, the useEffect above will handle redirection.
  // This return is a fallback if redirect hasn't happened yet.
  if (profile.onboardingCompleted) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /> Finalizing session...</div>;
  }

  const handleNextStep = () => {
    switch (currentStep) {
      case 'language':
        if (!profile?.language) {
            toast({ title: t("selectionRequiredTitle"), description: t("languageSelectionRequiredDesc"), variant: "destructive"});
            return;
        }
        setCurrentStep('mode');
        break;
      case 'mode':
         if (!profile?.mode) {
            toast({ title: t("selectionRequiredTitle"), description: t("modeSelectionRequiredDesc"), variant: "destructive"});
            return;
        }
        setCurrentStep('profile');
        break;
      case 'profile':
        updateProfileField({
            displayName: displayName || undefined,
            country: selectedCountry === NONE_SELECTED_COUNTRY_VALUE ? undefined : selectedCountry,
            photoURL: photoPreview || undefined
        });
        if (profile?.mode === 'islamic') {
          setCurrentStep('madhhab');
        } else {
          handleFinishOnboarding();
        }
        break;
      case 'madhhab':
         if (profile?.mode === 'islamic' && !profile?.islamicPreferences?.madhhab) {
            toast({ title: t("selectionRequiredTitle"), description: t("madhhabSelectionRequiredDesc"), variant: "destructive"});
            return;
        }
        handleFinishOnboarding();
        break;
      default:
        break;
    }
  };

  const handlePreviousStep = () => {
     switch (currentStep) {
      case 'madhhab':
        setCurrentStep('profile');
        break;
      case 'profile':
        setCurrentStep('mode');
        break;
      case 'mode':
        setCurrentStep('language');
        break;
      default:
        break;
    }
  };

  const handleFinishOnboarding = () => {
    if (!profile?.displayName) {
        toast({ title: t("profileInfoMissingTitle"), description: t("displayNameRequiredDesc"), variant: "destructive" });
        setCurrentStep('profile');
        return;
    }
    if (profile?.mode === 'islamic' && !profile?.islamicPreferences?.madhhab) {
        toast({ title: t("madhhabSelectionRequiredTitle"), description: t("madhhabSelectionRequiredDesc"), variant: "destructive"});
        setCurrentStep('madhhab');
        return;
    }

    updateProfileField({ onboardingCompleted: true });
    toast({ title: t("onboardingCompleteTitle"), description: t("onboardingCompleteDesc") });
    router.push(`/${currentLocaleForUI}/dashboard`);
  };

  const handleModeSelection = (mode: UserPreferenceMode) => {
    updateProfileField({ mode });
  };

  const handleLanguageSelection = (language: Language) => {
    updateProfileField({ language });
  };

  const handleMadhhabSelection = (madhhab: Madhhab) => {
    updateProfileField({ islamicPreferences: { ...(profile?.islamicPreferences || {}), madhhab } });
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPhotoPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCountryChange = (value: string) => {
      setSelectedCountry(value === NONE_SELECTED_COUNTRY_VALUE ? undefined : value);
  };
  
  const getStepNumber = () => {
    switch(currentStep) {
        case 'language': return 1;
        case 'mode': return 2;
        case 'profile': return 3;
        case 'madhhab': return profile?.mode === 'islamic' ? 4 : 3; // Madhhab is step 4 only if Islamic mode
        default: return 0;
    }
  };

  const effectiveTotalSteps = profile?.mode === 'islamic' ? 4 : 3;
  const currentStepNumber = getStepNumber();


  const renderStepContent = () => {
    switch (currentStep) {
      case 'language':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={profile?.language || currentLocaleForUI}
              onValueChange={(value) => handleLanguageSelection(value as Language)}
              className="flex flex-col space-y-2"
            >
              <Label htmlFor="lang-en" className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-md hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer">
                <RadioGroupItem value="en" id="lang-en" />
                <span>{t('english')}</span>
              </Label>
              <Label htmlFor="lang-ar" className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-md hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer">
                <RadioGroupItem value="ar" id="lang-ar" />
                <span>{t('arabic')}</span>
              </Label>
            </RadioGroup>
          </div>
        );
      case 'mode':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={profile?.mode}
              onValueChange={(value) => handleModeSelection(value as UserPreferenceMode)}
              className="flex flex-col space-y-2"
            >
              <Label htmlFor="mode-conventional" className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-md hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer">
                <RadioGroupItem value="conventional" id="mode-conventional" />
                <span>{t('conventionalMode')}</span>
              </Label>
              <Label htmlFor="mode-islamic" className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-md hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer">
                <RadioGroupItem value="islamic" id="mode-islamic" />
                <span>{t('islamicMode')}</span>
              </Label>
            </RadioGroup>
            {profile?.mode === 'islamic' && (
              <QuranicVerse verse={QURAN_VERSE_AMANAH} citation={QURAN_VERSE_AMANAH_CITATION} className="mt-2 text-sm" />
            )}
            <p className="text-xs text-muted-foreground">{t('islamicModeDescription')}</p>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">{t('fullNameLabel')}</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('fullNamePlaceholder')} />
            </div>
            <div>
              <Label htmlFor="photoUpload">{t('profilePhotoOptionalLabel')}</Label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <Image src={photoPreview} alt="Profile preview" width={80} height={80} className="rounded-full object-cover" data-ai-hint="profile picture"/>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <Input id="photoUpload" type="file" accept="image/*" onChange={handlePhotoChange} ref={photoInputRef} className="max-w-xs"/>
              </div>
            </div>
            <div>
              <Label htmlFor="country">{t('countryOptionalLabel')}</Label>
              <Select value={selectedCountry || NONE_SELECTED_COUNTRY_VALUE} onValueChange={handleCountryChange}>
                <SelectTrigger id="country"><SelectValue placeholder={t('selectCountryPlaceholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_SELECTED_COUNTRY_VALUE}>{t('noneSelected')}</SelectItem>
                  {countryCodes.map(country => (
                    <SelectItem key={`${country.code}-${country.name}`} value={country.name}>
                      <span className="mr-2 rtl:ml-2">{country.flag}</span> {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'madhhab':
        if (profile?.mode !== 'islamic') return null;
        return (
          <div className="space-y-4">
            <RadioGroup
              value={profile?.islamicPreferences?.madhhab || ''}
              onValueChange={(value) => handleMadhhabSelection(value as Madhhab)}
              className="flex flex-col space-y-2"
            >
              {['hanafi', 'shafii', 'maliki', 'hanbali'].map((m) => (
                <Label key={m} htmlFor={`madhhab-${m}`} className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-md hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer">
                  <RadioGroupItem value={m} id={`madhhab-${m}`} />
                  <span>{t(`madhhab${m.charAt(0).toUpperCase() + m.slice(1)}` as any)}</span>
                </Label>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">{t('madhhabChoiceNoteOnboarding')}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch(currentStep) {
        case 'language': return t('onboardingStepLanguageTitle');
        case 'mode': return t('onboardingStepModeTitle');
        case 'profile': return t('onboardingStepProfileTitle');
        case 'madhhab': return t('onboardingStepMadhhabTitle');
        default: return '';
    }
  };

  const getStepDescription = () => {
    switch(currentStep) {
        case 'language': return t('onboardingStepLanguageDesc');
        case 'mode': return t('onboardingStepModeDesc');
        case 'profile': return t('onboardingStepProfileDesc');
        case 'madhhab': return t('onboardingStepMadhhabDesc');
        default: return '';
    }
  };

  const getStepIcon = () => {
    switch(currentStep) {
        case 'language': return <Languages className="h-6 w-6 text-primary" />;
        case 'mode': return <Shield className="h-6 w-6 text-primary" />;
        case 'profile': return <User className="h-6 w-6 text-primary" />;
        case 'madhhab': return <Landmark className="h-6 w-6 text-primary" />;
        default: return <CheckSquare className="h-6 w-6 text-primary" />;
    }
  };

  const isLastStep =
    (currentStep === 'profile' && profile?.mode === 'conventional') ||
    (currentStep === 'madhhab' && profile?.mode === 'islamic');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            {getStepIcon()}
            <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
          </div>
          <CardDescription>{getStepDescription()}</CardDescription>
          <Progress value={(currentStepNumber / effectiveTotalSteps) * 100} className="mt-2" />
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handlePreviousStep} disabled={currentStep === 'language'}>
            {t('previousButton')}
            </Button>
            <Button onClick={isLastStep ? handleFinishOnboarding : handleNextStep}>
            {isLastStep ? t('finishButton') : t('nextButton')}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
