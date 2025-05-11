
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from 'react';
import { ModeToggle } from "@/components/mode-toggle";
import { useUserPreferences } from "@/context/UserPreferencesContext";
import type { UserPreferenceMode, UserProfile } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const { setProfile, generateAndStoreEncryptionKey } = useUserPreferences();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState<UserPreferenceMode>('conventional');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      // In a real app, use toast for error messages
      alert("Passwords do not match!");
      return;
    }
    
    // Mock signup logic
    console.log("Signup submitted for:", email, "Mode:", selectedMode);
    
    // In a real app, this would come from Firebase Auth successful signup
    const mockUserId = `user_${Date.now()}`; 
    
    const newUserProfile: UserProfile = {
      id: mockUserId,
      email: email,
      displayName: fullName,
      mode: selectedMode,
      language: 'en', // Default language
      subscriptionTier: 'free',
      is2FAEnabled: false,
    };

    setProfile(newUserProfile);

    // Generate and store encryption key upon signup
    // This is a simplified approach for demo. Key management is crucial.
    try {
      const key = await generateAndStoreEncryptionKey();
      if (!key) {
        console.error("Failed to generate encryption key on signup.");
        // Handle error - perhaps prevent signup or notify user
      } else {
        console.log("Encryption key generated and associated with profile.");
      }
    } catch (error) {
       console.error("Error generating encryption key:", error);
    }

    // In a real app, you'd handle Firebase auth here
    router.push("/dashboard"); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/30 p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
           <Link href="/" className="inline-block mb-4">
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
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            
            <div className="space-y-3">
              <Label>Choose Your Experience Mode</Label>
              <RadioGroup 
                defaultValue="conventional" 
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
            <Link href="/login" className="text-primary hover:underline font-medium">
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
