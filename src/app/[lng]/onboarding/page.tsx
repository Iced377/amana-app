
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTranslation } from '@/locales/client';
import type { LocaleTypes, Madhhab, UserPreferenceMode, Language, UserProfile, VaultDetails } from '@/locales/settings';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, CheckSquare, Landmark, Languages, Shield, Home } from 'lucide-react';
import Image from 'next/image';


// Quranic verses
const QURAN_VERSE_AMANAH = "إِنَّ ٱللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا۟ ٱلْأَمَٰنَٰتِ إِلَىٰٓ أَهْلِهَا"; // An-Nisa 4:58
const QURAN_VERSE_AMANAH_CITATION = "سورة النساء: ٥٨";

type OnboardingStep = 'mode' | 'language' | 'profile' | 'vault' | 'madhhab' | 'completed';

const totalSteps = 5; // Adjust if Madhhab step is conditional

const NONE_SELECTED_COUNTRY_VALUE = "_NONE_"; // Special value for "None Selected"

export default function OnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, updateProfileField, isLoading: profileLoading, addUserVault } = useUserPreferences();
  const { t, i18n } = useTranslation(profile?.language || (pathname.split('/')[1] as LocaleTypes) || 'en', "translation");
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('mode');
  
  // Local form state for profile step
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(profile?.country);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.photoURL || null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  // Local form state for vault step
  const [vaultName, setVaultName] = useState('');
  const [vaultDescription, setVaultDescription] = useState('');

  const currentLocale = profile?.language || (pathname.split('/')[1] as LocaleTypes) || 'en';

  useEffect(() => {
    if (!profileLoading && profile?.onboardingCompleted) {
      router.replace(`/${currentLocale}/dashboard`);
    }
  }, [profile, profileLoading, router, currentLocale]);

  useEffect(() => {
    // Sync local form state if profile loads/changes
    if (profile) {
      setDisplayName(profile.displayName || '');
      setSelectedCountry(profile.country || undefined);
      setPhotoPreview(profile.photoURL || null);
    }
  }, [profile]);


  const handleNextStep = () => {
    switch (currentStep) {
      case 'mode':
        setCurrentStep('language');
        break;
      case 'language':
        setCurrentStep('profile');
        break;
      case 'profile':
        // Save profile info
        updateProfileField({ 
            displayName: displayName || undefined, // ensure undefined if empty
            country: selectedCountry,
            photoURL: photoPreview || undefined // Save the preview URL or actual uploaded URL
        });
        setCurrentStep('vault');
        break;
      case 'vault':
        // Vault creation/skip logic handled within its own step's buttons
        // This case might not be directly hit by a generic "Next" button for vault
        if (profile?.mode === 'islamic') {
          setCurrentStep('madhhab');
        } else {
          handleFinishOnboarding();
        }
        break;
      case 'madhhab':
        handleFinishOnboarding();
        break;
      default:
        break;
    }
  };

  const handlePreviousStep = () => {
     switch (currentStep) {
      case 'madhhab':
        setCurrentStep('vault');
        break;
      case 'vault':
        setCurrentStep('profile');
        break;
      case 'profile':
        setCurrentStep('language');
        break;
      case 'language':
        setCurrentStep('mode');
        break;
      default:
        break;
    }
  };

  const handleFinishOnboarding = () => {
    updateProfileField({ onboardingCompleted: true });
    toast({ title: t("onboardingCompleteTitle"), description: t("onboardingCompleteDesc") });
    router.push(`/${currentLocale}/dashboard`);
  };

  const handleModeSelection = (mode: UserPreferenceMode) => {
    updateProfileField({ mode });
  };

  const handleLanguageSelection = (language: Language) => {
    updateProfileField({ language });
    i18n.changeLanguage(language); // Change i18next language
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
        // updateProfileField({ photoURL: dataUrl }); // Save data URL; in real app, upload then save URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateVault = () => {
    if (!vaultName) {
        toast({ title: t("vaultNameRequiredTitle"), description: t("vaultNameRequiredDesc"), variant: "destructive"});
        return;
    }
    const newVault: VaultDetails = { name: vaultName, description: vaultDescription };
    addUserVault(newVault); 
    toast({ title: t("vaultCreatedTitle"), description: t("vaultCreatedDesc", { vaultName }) });
    
    if (profile?.mode === 'islamic') {
      setCurrentStep('madhhab');
    } else {
      handleFinishOnboarding();
    }
  };

  const handleSkipVault = () => {
     if (profile?.mode === 'islamic') {
      setCurrentStep('madhhab');
    } else {
      handleFinishOnboarding();
    }
  };

  const handleCountryChange = (value: string) => {
    if (value === NONE_SELECTED_COUNTRY_VALUE) {
      setSelectedCountry(undefined);
    } else {
      setSelectedCountry(value);
    }
  };


  if (profileLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (profile.onboardingCompleted) {
    router.replace(`/${currentLocale}/dashboard`);
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  const getStepNumber = () => {
    switch(currentStep) {
        case 'mode': return 1;
        case 'language': return 2;
        case 'profile': return 3;
        case 'vault': return 4;
        case 'madhhab': return 5;
        default: return 0;
    }
  };
  
  const currentStepNumber = getStepNumber();
  const effectiveTotalSteps = profile?.mode === 'islamic' ? 5 : 4;


  const renderStepContent = () => {
    switch (currentStep) {
      case 'mode':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={profile.mode}
              onValueChange={(value) => handleModeSelection(value as UserPreferenceMode)}
              className="flex flex-col space-y-2"
            >
              <Label htmlFor="mode-conventional" className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer">
                <RadioGroupItem value="conventional" id="mode-conventional" />
                <span>{t('conventionalMode')}</span>
              </Label>
              <Label htmlFor="mode-islamic" className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer">
                <RadioGroupItem value="islamic" id="mode-islamic" />
                <span>{t('islamicMode')}</span>
              </Label>
            </RadioGroup>
            {profile.mode === 'islamic' && (
              <QuranicVerse verse={QURAN_VERSE_AMANAH} citation={QURAN_VERSE_AMANAH_CITATION} className="mt-2 text-sm" />
            )}
            <p className="text-xs text-muted-foreground">{t('islamicModeDescription')}</p>
          </div>
        );
      case 'language':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={profile.language}
              onValueChange={(value) => handleLanguageSelection(value as Language)}
              className="flex flex-col space-y-2"
            >
              <Label htmlFor="lang-en" className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer">
                <RadioGroupItem value="en" id="lang-en" />
                <span>{t('english')}</span>
              </Label>
              <Label htmlFor="lang-ar" className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer">
                <RadioGroupItem value="ar" id="lang-ar" />
                <span>{t('arabic')}</span>
              </Label>
            </RadioGroup>
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
                  <Image src={photoPreview} alt="Profile preview" width={80} height={80} className="rounded-full object-cover" data-ai-hint="profile picture" />
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
    case 'vault':
        return (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t('vaultCreationPrompt')}</p>
                <div>
                    <Label htmlFor="vaultName">{t('vaultNameLabel')}</Label>
                    <Input id="vaultName" value={vaultName} onChange={(e) => setVaultName(e.target.value)} placeholder={t('vaultNamePlaceholder')} />
                </div>
                <div>
                    <Label htmlFor="vaultDescription">{t('vaultDescriptionOptionalLabel')}</Label>
                    <Textarea id="vaultDescription" value={vaultDescription} onChange={(e) => setVaultDescription(e.target.value)} placeholder={t('vaultDescriptionPlaceholder')} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handleSkipVault}>{t('skipForNowButton')}</Button>
                    <Button onClick={handleCreateVault} disabled={!vaultName}>{t('createVaultButton')}</Button>
                </div>
            </div>
        );
      case 'madhhab':
        if (profile.mode !== 'islamic') return null;
        return (
          <div className="space-y-4">
            <RadioGroup
              value={profile.islamicPreferences?.madhhab || ''}
              onValueChange={(value) => handleMadhhabSelection(value as Madhhab)}
              className="flex flex-col space-y-2"
            >
              {['hanafi', 'shafii', 'maliki', 'hanbali'].map((m) => (
                <Label key={m} htmlFor={`madhhab-${m}`} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer">
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
        case 'mode': return t('onboardingStepModeTitle');
        case 'language': return t('onboardingStepLanguageTitle');
        case 'profile': return t('onboardingStepProfileTitle');
        case 'vault': return t('onboardingStepVaultTitle');
        case 'madhhab': return t('onboardingStepMadhhabTitle');
        default: return '';
    }
  };

  const getStepDescription = () => {
    switch(currentStep) {
        case 'mode': return t('onboardingStepModeDesc');
        case 'language': return t('onboardingStepLanguageDesc');
        case 'profile': return t('onboardingStepProfileDesc');
        case 'vault': return t('onboardingStepVaultDesc');
        case 'madhhab': return t('onboardingStepMadhhabDesc');
        default: return '';
    }
  };
  
  const getStepIcon = () => {
    switch(currentStep) {
        case 'mode': return <Shield className="h-6 w-6 text-primary" />;
        case 'language': return <Languages className="h-6 w-6 text-primary" />;
        case 'profile': return <User className="h-6 w-6 text-primary" />;
        case 'vault': return <Home className="h-6 w-6 text-primary" />; // Or FolderLock
        case 'madhhab': return <Landmark className="h-6 w-6 text-primary" />;
        default: return <CheckSquare className="h-6 w-6 text-primary" />;
    }
  };


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
        {currentStep !== 'vault' && (
             <CardFooter className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handlePreviousStep} disabled={currentStep === 'mode'}>
                {t('previousButton')}
                </Button>
                <Button onClick={handleNextStep}>
                {currentStep === 'madhhab' || (currentStep === 'profile' && profile?.mode === 'conventional') ? t('finishButton') : t('nextButton')}
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
