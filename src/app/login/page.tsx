
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

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { setProfile, profile, generateAndStoreEncryptionKey } = useUserPreferences();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const currentLocale = pathname.split('/')[1] || 'en';


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock login logic
    console.log("Login submitted for:", email);

    // In a real app, you'd fetch user profile from Firebase Auth/Firestore
    // For demo, if no profile exists, create a mock one or use the one from signup.
    // If a profile exists, we'd use that. For now, we create/update.
    const mockUserId = `user_${email.split('@')[0] || Date.now()}`; // Simplistic ID
    
    let userProfile = profile; // Use existing profile from context if available

    if (!userProfile || userProfile.id === 'guestUser') { // If it's a guest or no profile
        userProfile = {
            id: mockUserId,
            email: email,
            displayName: email.split('@')[0], // Simple display name
            mode: 'conventional', // Default mode
            language: currentLocale as 'en' | 'ar', // Use current locale or default
            subscriptionTier: 'free',
            is2FAEnabled: false,
        };
        setProfile(userProfile); // Set the new/mock profile in context

        // Attempt to generate encryption key if not present (e.g. first login after clearing storage)
        if (!userProfile.encryptionKey) {
            try {
                const key = await generateAndStoreEncryptionKey(); // This will update the profile in context
                if (!key) console.error("Failed to generate encryption key on login.");
                else console.log("Encryption key generated/ensured on login.");
            } catch (error) {
                console.error("Error with encryption key on login:", error);
            }
        }

    } else {
        // If profile exists, ensure its language matches current route, and key exists
        if (userProfile.language !== currentLocale) {
            setProfile({...userProfile, language: currentLocale as 'en' | 'ar'});
        }
        if (!userProfile.encryptionKey) {
             try {
                const key = await generateAndStoreEncryptionKey();
                if (!key) console.error("Failed to generate encryption key on login for existing user.");
                else console.log("Encryption key generated/ensured on login for existing user.");
            } catch (error) {
                console.error("Error with encryption key on login for existing user:", error);
            }
        }
    }
    
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
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" size="lg">
              <LogIn className="mr-2 rtl:ml-2 h-5 w-5" /> Log In
            </Button>
          </form>
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
