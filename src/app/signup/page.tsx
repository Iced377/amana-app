"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Corrected import
import React from 'react';
import { ModeToggle } from "@/components/mode-toggle";

export default function SignupPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock signup logic
    console.log("Signup submitted");
    // In a real app, you'd handle Firebase auth here
    router.push("/dashboard"); // Redirect to dashboard after mock signup
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
              <Input id="fullName" type="text" placeholder="Your Name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" required />
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
