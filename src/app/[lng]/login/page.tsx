
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, LogIn, Phone, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect } from 'react';
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle"; // Import LanguageToggle
import { useUserPreferences } from "@/context/UserPreferencesContext";
import type { UserProfile } from "@/types";
import type { LocaleTypes } from "@/locales/settings";
import { auth, googleProvider } from '@/lib/firebase';
import { 
  signInWithPopup, 
  type UserCredential, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  type ConfirmationResult
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { AppLogo } from "@/components/AppLogo";


// Inline SVG for Google Icon
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="mr-2 rtl:ml-2 h-5 w-5">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile: currentGlobalProfile, setProfile, generateEncryptionKey } = useUserPreferences();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);

  const currentLocale = (pathname.split('/')[1] || 'en') as LocaleTypes;

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifierInstance) { 
      window.recaptchaVerifierInstance = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          toast({ title: "reCAPTCHA Expired", description: "Please try sending OTP again.", variant: "destructive" });
        }
      });
    }
  }, [toast]);


  const handleSuccessfulLogin = (firebaseUser: any, method: "Google" | "Email" | "Phone") => {
    let userProfile: UserProfile;

    if (!currentGlobalProfile || currentGlobalProfile.id === 'guestUser' || currentGlobalProfile.id !== firebaseUser.uid) {
      userProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email || null, 
        displayName: firebaseUser.displayName || (firebaseUser.phoneNumber ? `User ${firebaseUser.phoneNumber.slice(-4)}` : 'New User'),
        mode: currentGlobalProfile?.mode || 'conventional',
        language: currentLocale,
        subscriptionTier: currentGlobalProfile?.subscriptionTier || 'free',
        is2FAEnabled: currentGlobalProfile?.is2FAEnabled || false,
        encryptionKey: undefined,
        sadaqahEnabled: currentGlobalProfile?.sadaqahEnabled || false,
      };
      // Encryption key is no longer generated/needed on login/signup based on previous changes
      // const key = generateEncryptionKey(); 
      // if (!key) {
      //   console.error(`Failed to generate encryption key on ${method} login.`);
      //   toast({ title: "Login Error", description: "Could not initialize security settings.", variant: "destructive" });
      //   return;
      // }
      // userProfile.encryptionKey = key;
    } else {
      userProfile = {
        ...currentGlobalProfile,
        id: firebaseUser.uid,
        email: firebaseUser.email || currentGlobalProfile.email, 
        displayName: firebaseUser.displayName || currentGlobalProfile.displayName, 
        language: currentLocale,
      };
      // if (!userProfile.encryptionKey) {
      //   const key = generateEncryptionKey();
      //   if (!key) {
      //       console.error(`Failed to generate encryption key for existing profile on ${method} login.`);
      //       toast({ title: "Security Warning", description: "Could not re-verify security settings.", variant: "destructive" });
      //   } else {
      //       userProfile.encryptionKey = key;
      //   }
      // }
    }
    
    setProfile(userProfile);
    router.push(`/${currentLocale}/dashboard`);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      handleSuccessfulLogin(result.user, "Google");
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      toast({ title: "Google Sign-In Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const handleEmailPasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Email/Password Login submitted for:", email);
    const mockFirebaseUser = {
      uid: `user_${email.split('@')[0] || Date.now()}`,
      email: email,
      displayName: email.split('@')[0],
    };
    handleSuccessfulLogin(mockFirebaseUser, "Email");
  };
  
  const handleSendOtp = async () => {
    if (!phoneNumber) {
      toast({ title: "Phone Number Required", description: "Please enter your phone number.", variant: "destructive" });
      return;
    }
    if (!window.recaptchaVerifierInstance) { 
      toast({ title: "reCAPTCHA Error", description: "reCAPTCHA not initialized. Please refresh.", variant: "destructive" });
      return;
    }
    setLoadingOtp(true);
    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifierInstance); 
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast({ title: "OTP Sent", description: `An OTP has been sent to ${formattedPhoneNumber}.` });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({ title: "Failed to Send OTP", description: error.message || "Please check the phone number or try again.", variant: "destructive" });
      if (window.grecaptcha && window.recaptchaVerifierInstance?.verifierId !== undefined) { 
         try {
            // @ts-ignore
            const widgetId = window.recaptchaVerifierInstance.widgetId; 
            if (typeof widgetId === 'number') {
                window.grecaptcha.reset(widgetId);
            } else {
                const recaptchaContainer = document.getElementById('recaptcha-container');
                if (recaptchaContainer) recaptchaContainer.innerHTML = ''; 
                 window.recaptchaVerifierInstance = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {},
                    'expired-callback': () => {}
                 });
                 if(window.recaptchaVerifierInstance.render) window.recaptchaVerifierInstance.render(); 
            }
         } catch(e) {
            console.warn("Could not reset reCAPTCHA explicitly", e);
         }
      }
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({ title: "OTP Required", description: "Please enter the OTP.", variant: "destructive" });
      return;
    }
    if (!confirmationResult) {
      toast({ title: "Verification Error", description: "OTP not sent or session expired. Please try sending OTP again.", variant: "destructive" });
      return;
    }
    setLoadingVerifyOtp(true);
    try {
      const result = await confirmationResult.confirm(otp);
      toast({ title: "Phone Verification Successful!", description: "Logging you in..." });
      handleSuccessfulLogin(result.user, "Phone");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({ title: "OTP Verification Failed", description: error.message || "Invalid OTP or an error occurred.", variant: "destructive" });
    } finally {
      setLoadingVerifyOtp(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/30 p-4">
      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto flex items-center gap-2">
        <LanguageToggle /> {/* Added LanguageToggle */}
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mb-4">
            <AppLogo iconSize={16} />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Log in to your Amana account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email/Password</TabsTrigger>
              <TabsTrigger value="phone">Phone OTP</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href={`/${currentLocale}/forgot-password`} className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <LogIn className="mr-2 rtl:ml-2 h-5 w-5" /> Log In
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="phone">
              <div className="space-y-6 mt-4">
                {!otpSent ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone-number">Phone Number</Label>
                      <Input 
                        id="phone-number" 
                        type="tel" 
                        placeholder="+12345678900" 
                        value={phoneNumber} 
                        onChange={e => setPhoneNumber(e.target.value)} 
                        required 
                      />
                       <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for USA).</p>
                    </div>
                    <Button onClick={handleSendOtp} className="w-full" size="lg" disabled={loadingOtp}>
                      {loadingOtp ? 'Sending OTP...' : <><Phone className="mr-2 rtl:ml-2 h-5 w-5" /> Send OTP</>}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                     <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input 
                        id="otp" 
                        type="text" 
                        placeholder="Enter 6-digit OTP" 
                        value={otp} 
                        onChange={e => setOtp(e.target.value)} 
                        maxLength={6}
                        required 
                      />
                    </div>
                    <Button onClick={handleVerifyOtp} className="w-full" size="lg" disabled={loadingVerifyOtp}>
                      {loadingVerifyOtp ? 'Verifying...' : <><MessageSquare className="mr-2 rtl:ml-2 h-5 w-5" /> Verify OTP & Login</>}
                    </Button>
                    <Button variant="link" onClick={() => {setOtpSent(false); setConfirmationResult(null); setOtp('');}} className="w-full">
                        Use a different phone number?
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div id="recaptcha-container"></div>

          <div className="my-6 flex items-center before:flex-1 before:border-t before:border-border after:flex-1 after:border-t after:border-border">
            <p className="mx-4 text-center text-sm text-muted-foreground">OR</p>
          </div>
          <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleSignIn}>
            <GoogleIcon /> Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm flex-col gap-2">
          <p>
            Don't have an account?{" "}
            <Link href={`/${currentLocale}/signup`} className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
          <Link href={`/${currentLocale}/info-help`} className="text-xs text-muted-foreground hover:underline">
            Need help or information?
          </Link>
        </CardFooter>
      </Card>
       <p className="mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Amana. All rights reserved.
      </p>
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifierInstance?: RecaptchaVerifier; 
    grecaptcha?: any;
  }
}
