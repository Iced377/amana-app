
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState } from 'react';
import { ModeToggle } from "@/components/mode-toggle";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import type { UserProfile } from "@/types";
import type { LocaleTypes } from "@/locales/settings";
import { auth, googleProvider } from '@/lib/firebase'; // Import Firebase auth and provider
import { signInWithPopup, type UserCredential } from "firebase/auth"; // Import signInWithPopup
import { useToast } from "@/hooks/use-toast";

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

  const currentLocale = (pathname.split('/')[1] || 'en') as LocaleTypes;

  const handleGoogleSignIn = async () => {
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      let userProfile: UserProfile;
      // Check if a profile already exists for this user or if it's a guest profile
      if (!currentGlobalProfile || currentGlobalProfile.id === 'guestUser' || currentGlobalProfile.id !== firebaseUser.uid) {
        userProfile = {
          id: firebaseUser.uid, // Use Firebase UID
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          mode: currentGlobalProfile?.mode || 'conventional', // Retain mode if existing profile was just guest
          language: currentLocale,
          subscriptionTier: currentGlobalProfile?.subscriptionTier || 'free',
          is2FAEnabled: currentGlobalProfile?.is2FAEnabled || false, // Retain 2FA status or default
          encryptionKey: currentGlobalProfile?.encryptionKey, // Attempt to retain existing key
        };
         // Ensure encryption key exists if it's a truly new profile context for this user
        if (!userProfile.encryptionKey) {
          const key = generateEncryptionKey();
          if (!key) {
            console.error("Failed to generate encryption key on Google login.");
            toast({ title: "Login Error", description: "Could not initialize security settings.", variant: "destructive" });
            return;
          }
          userProfile.encryptionKey = key;
        }
      } else {
        // User is logging in again, use existing profile but update with Firebase details if necessary
        userProfile = {
          ...currentGlobalProfile,
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          language: currentLocale, // Update language if it changed
        };
      }
      
      console.log("Google Sign-In Profile being set in LoginPage:", JSON.stringify(userProfile, null, 2));
      setProfile(userProfile);
      router.push(`/${currentLocale}/dashboard`);
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      toast({ title: "Google Sign-In Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Login submitted for:", email);

    const mockUserId = `user_${email.split('@')[0] || Date.now()}`; 
    
    let userProfile: UserProfile; 

    if (!currentGlobalProfile || currentGlobalProfile.id === 'guestUser') { 
        userProfile = {
            id: mockUserId,
            email: email,
            displayName: email.split('@')[0], 
            mode: 'conventional', 
            language: currentLocale, 
            subscriptionTier: 'free',
            is2FAEnabled: false,
            encryptionKey: undefined,
        };
    } else {
        userProfile = { 
          ...currentGlobalProfile, 
          email: email, 
          id: currentGlobalProfile.id || mockUserId, 
          language: currentLocale, 
        };
    }
    
    if (!userProfile.encryptionKey) {
        try {
            const key = generateEncryptionKey();
            if (!key) {
              console.error("Failed to generate encryption key on login.");
            } else {
              console.log("Encryption key generated/ensured on login.");
              userProfile.encryptionKey = key;
            }
        } catch (error) {
            console.error("Error with encryption key on login:", error);
        }
    }
    
    console.log("Profile being set in LoginPage:", JSON.stringify(userProfile, null, 2));
    setProfile(userProfile); 
    router.push(`/${currentLocale}/dashboard`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/30 p-4">
      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Link href={`/${currentLocale}/`} className="inline-block mb-4">
             <ShieldCheck className="h-16 w-16 text-primary mx-auto" />
          </Link>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Log in to your Guardian Angel account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="my-4 flex items-center before:flex-1 before:border-t before:border-border after:flex-1 after:border-t after:border-border">
            <p className="mx-4 text-center text-sm text-muted-foreground">OR</p>
          </div>
          <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleSignIn}>
            <GoogleIcon /> Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            Don't have an account?{" "}
            <Link href={`/${currentLocale}/signup`} className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
       <p className="mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Guardian Angel. All rights reserved.
      </p>
    </div>
  );
}
