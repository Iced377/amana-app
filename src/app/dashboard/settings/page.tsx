import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { UserCircle, Lock, Bell, Globe, Trash2, Download } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle"; // Import ModeToggle

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">Manage your account, security, and application preferences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Settings */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCircle className="h-6 w-6 text-primary" /> Profile Settings</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue="Demo User" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="demo@example.com" disabled />
            </div>
            <Button>Save Profile</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-6 w-6 text-primary" /> Security</CardTitle>
            <CardDescription>Manage your password and account security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">Change Password</Button>
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div>
                <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
                <p className="text-sm text-muted-foreground">Enhance your account security.</p>
              </div>
              <Switch id="twoFactorAuth" defaultChecked={false} aria-label="Toggle Two-Factor Authentication" />
            </div>
             <Button variant="outline" className="w-full">View Login History</Button>
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

        {/* Appearance Settings */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-6 w-6 text-primary" /> Appearance & Language</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="themeToggle">Theme</Label>
                <ModeToggle /> 
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              {/* This would be a Select component in a real app */}
              <Input id="language" defaultValue="English (US)" disabled /> 
              <p className="text-xs text-muted-foreground">Arabic language support coming soon.</p>
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="islamicMode" className="flex flex-col space-y-1">
                <span>Islamic Mode</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Tailor features according to Islamic principles (future).
                </span>
              </Label>
              <Switch id="islamicMode" disabled />
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
            <Button variant="destructive" className="w-full">
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
