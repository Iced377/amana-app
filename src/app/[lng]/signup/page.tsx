
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState } from 'react';
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import type { UserProfile } from "@/types";
import type { LocaleTypes } from "@/locales/settings";
import { useToast } from "@/hooks/use-toast";
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, type UserCredential } from "firebase/auth";
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


export default function SignupPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { updateProfileField } = useUserPreferences();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const currentLocale = (pathname.split('/')[1] || 'en') as LocaleTypes;

  const handleSuccessfulSignup = (firebaseUser: any) => {
    const initialDisplayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User';
    const newUserProfile: UserProfile = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: initialDisplayName,
      mode: 'conventional', // Default to conventional, user can change in settings
      language: currentLocale,
      subscriptionTier: 'free',
      is2FAEnabled: false,
      onboardingCompleted: true, // Set onboarding to true
      sadaqahEnabled: false,
      sadaqahPercentage: undefined,
    };

    updateProfileField(newUserProfile);

    toast({ title: "Account Created!", description: "Welcome to Amana. Redirecting to dashboard...", variant: "default" });
    router.push(`/${currentLocale}/dashboard`); // Redirect to dashboard
  };


  const handleGoogleSignUp = async () => {
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const simplifiedFirebaseUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      };
      handleSuccessfulSignup(simplifiedFirebaseUser);
    } catch (error: any) {
      console.error("Google Sign-Up error:", error);
      toast({ title: "Google Sign-Up Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
     if (password.length < 6) {
       toast({ title: "Password Too Short", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    console.log("Signup submitted for:", emailAddress);
    // Mock Firebase Auth user creation
    const mockFirebaseUser = {
      uid: `user_${Date.now()}`,
      email: emailAddress,
      displayName: emailAddress.split('@')[0],
    };
    handleSuccessfulSignup(mockFirebaseUser);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/30 p-4">
      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto flex items-center gap-2">
        <LanguageToggle />
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
           <div className="inline-block mb-4">
            <AppLogo iconSize={16} />
          </div>
          <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
          <CardDescription>Join Amana to secure your digital legacy.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (min. 6 characters)</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full" size="lg">
              <UserPlus className="mr-2 h-5 w-5" /> Sign Up
            </Button>
          </form>
          <div className="my-4 flex items-center before:flex-1 before:border-t before:border-border after:flex-1 after:border-t after:border-border">
            <p className="mx-4 text-center text-sm text-muted-foreground">OR</p>
          </div>
          <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleSignUp}>
            <GoogleIcon /> Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            Already have an account?{" "}
            <Link href={`/${currentLocale}/login`} className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
      <p className="mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Amana. All rights reserved.
      </p>
    </div>
  );
}
