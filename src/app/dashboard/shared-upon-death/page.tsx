"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, AlertTriangle, Info, Users, Mail } from 'lucide-react';
import Image from 'next/image';

export default function SharedUponDeathPage() {
  const [trustedContactEmail, setTrustedContactEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [inactivityDays, setInactivityDays] = useState(180); // Default 180 days
  const { toast } = useToast();

  const handleSaveTrustedContact = () => {
    if (!trustedContactEmail || !confirmEmail) {
      toast({ title: "Missing Information", description: "Please enter and confirm the email.", variant: "destructive" });
      return;
    }
    if (trustedContactEmail !== confirmEmail) {
      toast({ title: "Emails Do Not Match", description: "The entered emails do not match.", variant: "destructive" });
      return;
    }
    // Validate email format (basic)
    if (!/^\S+@\S+\.\S+$/.test(trustedContactEmail)) {
       toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    // Mock save
    console.log("Trusted contact email saved:", trustedContactEmail);
    toast({ title: "Trusted Contact Saved", description: `Email ${trustedContactEmail} has been set as your trusted contact.` });
  };
  
  const handleSaveInactivitySettings = () => {
    if (inactivityDays < 30 || inactivityDays > 365) {
       toast({ title: "Invalid Duration", description: "Inactivity period must be between 30 and 365 days.", variant: "destructive" });
      return;
    }
     // Mock save
    console.log("Inactivity detection days saved:", inactivityDays);
    toast({ title: "Inactivity Settings Saved", description: `Inactivity detection set to ${inactivityDays} days.` });
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Shared Upon Death</h1>
        <p className="text-muted-foreground">Configure how your digital legacy is accessed and distributed.</p>
      </div>

      <Alert variant="destructive" className="shadow-md">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Important Considerations</AlertTitle>
        <AlertDescription>
          Setting up the death trigger mechanism is a critical step. Ensure you understand the implications and choose your trusted contacts and methods carefully. Consult with legal professionals if needed.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck className="h-6 w-6 text-primary"/> Manual Trigger by Trusted Contact</CardTitle>
            <CardDescription>
              Designate one or more trusted individuals who can initiate the process of sharing your vault items with beneficiaries after your passing. They will need to provide verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trustedContactEmail">Trusted Contact's Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="trustedContactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={trustedContactEmail}
                  onChange={(e) => setTrustedContactEmail(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmEmail">Confirm Email</Label>
               <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmEmail"
                  type="email"
                  placeholder="Re-enter email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center p-3 bg-accent/50 rounded-lg">
                <Info className="h-5 w-5 text-accent-foreground mr-2 shrink-0" />
                <p className="text-sm text-accent-foreground">
                Your trusted contact will receive instructions on how to proceed. Consider adding a secondary contact as a backup.
                </p>
            </div>
            <Button onClick={handleSaveTrustedContact} className="w-full sm:w-auto">Save Trusted Contact</Button>
            <p className="text-xs text-muted-foreground pt-2">
              You can add up to 2 trusted contacts. This feature ensures that someone you trust can manage the distribution process.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary"/> Smart Inactivity Detection (Future Feature)</CardTitle>
            <CardDescription>
              Optionally, set up a system where if your account is inactive for a specified period, the process can be initiated automatically or notify your trusted contacts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="inactivityDays">Trigger after inactivity (days)</Label>
              <Input
                id="inactivityDays"
                type="number"
                min="30"
                max="365"
                value={inactivityDays}
                onChange={(e) => setInactivityDays(parseInt(e.target.value, 10))}
              />
               <p className="text-xs text-muted-foreground">Enter a duration between 30 and 365 days.</p>
            </div>
             <div className="flex items-center p-3 bg-accent/50 rounded-lg">
                <Info className="h-5 w-5 text-accent-foreground mr-2 shrink-0" />
                <p className="text-sm text-accent-foreground">
                 This feature is currently under development. You will be notified when it becomes available. Regular check-ins will be required to prevent accidental triggers.
                </p>
            </div>
            <Button onClick={handleSaveInactivitySettings} className="w-full sm:w-auto" disabled>Save Inactivity Settings (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle>Understanding the Process</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
            <Image 
                src="https://picsum.photos/400/250?legacy" 
                alt="Illustration of process flow"
                width={300}
                height={188}
                className="rounded-lg object-cover shadow-sm"
                data-ai-hint="flowchart diagram"
            />
            <div className="space-y-3">
                <p className="text-muted-foreground">
                When a trigger event occurs (manual or inactivity-based), Guardian Angel will verify the situation. Once confirmed, access to designated files will be granted to the assigned beneficiaries according to your instructions.
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>You define what files go to which beneficiary.</li>
                    <li>Trusted contacts initiate or are notified.</li>
                    <li>Secure verification protocols are followed.</li>
                    <li>Beneficiaries receive access to their designated assets.</li>
                </ul>
                 <Button variant="link" className="p-0 h-auto">Learn more about the verification process</Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
