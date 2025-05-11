
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

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { setProfile, profile, generateAndStoreEncryptionKey } = useUserPreferences();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const currentLocale = (pathname.split('/')[1] || 'en') as LocaleTypes;


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock login logic
    console.log("Login submitted for:", email);

    const mockUserId = `user_${email.split('@')[0] || Date.now()}`; 
    
    let userProfile = profile; 

    if (!userProfile || userProfile.id === 'guestUser') { 
        userProfile = {
            id: mockUserId,
            email: email,
            displayName: email.split('@')[0], 
            mode: 'conventional', 
            language: currentLocale, 
            subscriptionTier: 'free',
            is2FAEnabled: false,
        };
        setProfile(userProfile); 

        if (!userProfile.encryptionKey) {
            try {
                const key = await generateAndStoreEncryptionKey(); 
                if (!key) console.error("Failed to generate encryption key on login.");
                else console.log("Encryption key generated/ensured on login.");
            } catch (error) {
                console.error("Error with encryption key on login:", error);
            }
        }

    } else {
        if (userProfile.language !== currentLocale) {
            setProfile({...userProfile, language: currentLocale});
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
