
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle, Lock, Bell, Globe, Trash2, Download, ShieldAlert, LogOut, ListChecks, CreditCard, MoonStar } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useUserPreferences } from '@/context/UserPreferencesContext';
import type { Language, UserPreferenceMode, ActiveSession } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const initialActiveSessions: ActiveSession[] = [
  { id: '1', ipAddress: '192.168.1.101', userAgent: 'Chrome on Windows', lastAccessed: new Date().toISOString(), location: 'New York, USA' },
  { id: '2', ipAddress: '10.0.0.5', userAgent: 'Safari on macOS', lastAccessed: new Date(Date.now() - 3600000 * 2).toISOString(), location: 'London, UK' },
];


export default function SettingsPage() {
  const { profile, updateProfileField, language, setLanguage, mode, setMode, isLoading: isProfileLoading } = useUserPreferences();
  const { toast } = useToast();
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(initialActiveSessions);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handle2FAToggle = (checked: boolean) => {
    updateProfileField({ is2FAEnabled: checked });
    toast({ title: `Two-Factor Authentication ${checked ? 'Enabled' : 'Disabled'}`, description: `2FA has been ${checked ? 'activated' : 'deactivated'}.`});
    // In a real app, this would trigger Firebase 2FA setup flow
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Password Mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
       toast({ title: "Password Too Short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    // Mock password change
    console.log("Password change attempt for:", profile?.email);
    toast({ title: "Password Change Requested", description: "If your email is valid, you'll receive a link to reset your password (simulated)." });
    setNewPassword('');
    setConfirmNewPassword('');
    // In a real app, this would call Firebase Auth's updatePassword or sendPasswordResetEmail
  };
  
  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    toast({ title: "Session Revoked", description: "The selected session has been signed out."});
  }

  if (isProfileLoading || !profile) {
    return <div>Loading settings...</div>; // Or a skeleton loader
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">Manage your account, security, application preferences, and subscription.</p>
      </div>

      {/* Profile & Account Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCircle className="h-6 w-6 text-primary" /> Profile & Account</CardTitle>
          <CardDescription>Update your personal information and account preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue={profile.displayName || ''} placeholder="Your full name" 
                onBlur={(e) => updateProfileField({ displayName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={profile.email || ''} disabled />
            </div>
          </div>
           <Separator />
           <div className="grid md:grid-cols-2 gap-6 items-end">
             <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                <SelectTrigger id="language" className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="themeToggle" className="mb-0">Theme</Label>
                <ModeToggle /> 
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="islamicMode" className="flex flex-col space-y-1">
              <span>Islamic Mode (Wasiyyah/Faraid)</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Tailor features according to Islamic principles.
              </span>
            </Label>
            <Switch 
              id="islamicMode" 
              checked={mode === 'islamic'} 
              onCheckedChange={(checked) => setMode(checked ? 'islamic' : 'conventional')}
            />
          </div>
          <Button onClick={() => toast({ title: "Profile Updated", description: "Your profile settings have been saved."})}>Save Profile Changes</Button>
        </CardContent>
      </Card>

      {/* Security Center */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-primary" /> Security Center</CardTitle>
          <CardDescription>Manage your password, two-factor authentication, active sessions, and trusted contacts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Change Password</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <Input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <Input type="password" placeholder="Confirm New Password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
            </div>
            <Button onClick={handleChangePassword} variant="outline" className="mt-2">Update Password</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div>
              <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
              <p className="text-sm text-muted-foreground">Enhance account security with email or app-based 2FA (via Firebase).</p>
            </div>
            <Switch id="twoFactorAuth" checked={profile.is2FAEnabled} onCheckedChange={handle2FAToggle} />
          </div>
           <Separator />
           <div>
             <h4 className="font-medium mb-2">Trusted Contacts</h4>
             <p className="text-sm text-muted-foreground mb-3">Manage individuals who can initiate the death trigger process. This is configured on the "Shared Upon Death" page.</p>
             <Button variant="outline" asChild>
                <Link href="/dashboard/shared-upon-death">Manage Trusted Contacts</Link>
             </Button>
           </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Active Sessions</h4>
            <p className="text-sm text-muted-foreground mb-3">Review devices currently logged into your account. Revoke any suspicious sessions.</p>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {activeSessions.map(session => (
                    <li key={session.id} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{session.userAgent} ({session.ipAddress})</p>
                        <p className="text-xs text-muted-foreground">Location: {session.location || 'Unknown'} - Last seen: {new Date(session.lastAccessed).toLocaleDateString()}</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm"><LogOut className="mr-1 h-4 w-4"/> Revoke</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will sign out the session on {session.userAgent}. They will need to log in again.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRevokeSession(session.id)}>Revoke Session</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {activeSessions.length === 0 && <p className="text-sm text-muted-foreground">No other active sessions found.</p>}
          </div>
        </CardContent>
      </Card>
      
      {/* Subscription Management */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-6 w-6 text-primary" /> Subscription & Billing</CardTitle>
          <CardDescription>Manage your Guardian Angel subscription plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <p className="text-sm">Current Plan: <span className="font-semibold capitalize">{profile.subscriptionTier}</span></p>
                {profile.subscriptionEndDate && <p className="text-sm">Renews/Expires on: {new Date(profile.subscriptionEndDate).toLocaleDateString()}</p>}
            </div>
            <div className="flex gap-2">
                 <Button asChild variant="default">
                    <Link href="/pricing">Upgrade Plan</Link>
                 </Button>
                 <Button variant="outline">Manage Billing (External)</Button>
            </div>
            <p className="text-xs text-muted-foreground">
                Billing is managed securely through Stripe (example). You will be redirected to manage payment methods or cancel your subscription.
            </p>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-6 w-6 text-primary" /> Notifications</CardTitle>
          <CardDescription>Choose how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receive updates about your account and new features.
              </span>
            </Label>
            <Switch id="emailNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="securityAlerts" className="flex flex-col space-y-1">
              <span>Security Alerts</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Get notified about important security events.
              </span>
            </Label>
            <Switch id="securityAlerts" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data Management Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-6 w-6 text-primary" /> Data Management</CardTitle>
          <CardDescription>Manage your account data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" /> Export My Data (GDPR)
          </Button>
          <p className="text-sm text-muted-foreground">
            Request an export of all your personal data stored in Guardian Angel.
          </p>
        </CardContent>
      </Card>

      {/* Delete Account */}
       <Card className="shadow-md border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="h-6 w-6" /> Delete Account</CardTitle>
          <CardDescription className="text-destructive/90">Permanently delete your account and all associated data.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-destructive/90 mb-4">
            This action is irreversible. All your uploaded files, beneficiary information, and account details will be permanently removed.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">Delete My Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers. Your encrypted files will become inaccessible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => toast({title: "Account Deletion Requested", description:"Simulating account deletion process.", variant: "destructive"})}>
                  Yes, Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
