"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState } from 'react';
import { ModeToggle } from "@/components/mode-toggle";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import type { UserPreferenceMode, UserProfile } from "@/types";
import type { LocaleTypes } from "@/locales/settings";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { setProfile, generateEncryptionKey } = useUserPreferences();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<UserPreferenceMode>('conventional');
  const { toast } = useToast();

  const currentLocale = (pathname.split('/')[1] || 'en') as LocaleTypes;


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
    
    console.log("Signup submitted for:", email, "Mode:", selectedMode);
    
    const mockUserId = `user_${Date.now()}`; 
    
    const newUserProfile: UserProfile = {
      id: mockUserId,
      email: email,
      displayName: fullName,
      mode: selectedMode,
      language: currentLocale, 
      subscriptionTier: 'free',
      is2FAEnabled: false,
      encryptionKey: undefined,
    };

    try {
      const key = generateEncryptionKey(); 
      if (!key) {
        console.error("Failed to generate encryption key on signup.");
        toast({ title: "Signup Error", description: "Could not initialize security settings. Please try again.", variant: "destructive" });
        return;
      } else {
        console.log("Encryption key generated and will be associated with profile.");
        newUserProfile.encryptionKey = key;
      }
    } catch (error) {
       console.error("Error generating encryption key:", error);
       toast({ title: "Signup Error", description: "An unexpected error occurred with security setup. Please try again.", variant: "destructive" });
       return;
    }

    console.log("Profile being set in SignupPage:", JSON.stringify(newUserProfile, null, 2));
    setProfile(newUserProfile); 

    toast({ title: "Account Created!", description: "Welcome to Guardian Angel. Redirecting to your dashboard..." });
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
          <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
          <CardDescription>Join Guardian Angel to secure your digital legacy.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" type="text" placeholder="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (min. 6 characters)</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            
            <div className="space-y-3">
              <Label>Choose Your Experience Mode</Label>
              <RadioGroup 
                value={selectedMode}
                onValueChange={(value: UserPreferenceMode) => setSelectedMode(value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="conventional" id="mode-conventional" />
                  <Label htmlFor="mode-conventional" className="font-normal">Conventional Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="islamic" id="mode-islamic" />
                  <Label htmlFor="mode-islamic" className="font-normal">Islamic Mode (e.g., for Wasiyyah, Faraid)</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Islamic Mode tailors features according to Islamic principles. You can change this later in settings.
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              <UserPlus className="mr-2 h-5 w-5" /> Sign Up
            </Button>
          </form>
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
        &copy; {new Date().getFullYear()} Guardian Angel. All rights reserved.
      </p>
    </div>
  );
}
