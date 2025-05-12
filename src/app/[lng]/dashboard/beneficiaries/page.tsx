
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import type { Beneficiary } from '@/types';
import { UserPlus, Users, Trash2, Edit3, Search, Phone } from 'lucide-react';
import { countryCodes } from '@/lib/countryCodes'; // Import the extensive list

interface CurrentBeneficiaryState extends Omit<Beneficiary, 'id'> {
  // Omit id as it's generated, ensure other fields are present
}

const initialBeneficiaryState: CurrentBeneficiaryState = {
  name: '',
  email: '',
  countryCode: '',
  phoneNumber: '',
  notes: ''
};


export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [currentBeneficiary, setCurrentBeneficiary] = useState<CurrentBeneficiaryState>(initialBeneficiaryState);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentBeneficiary(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryCodeChange = (value: string) => {
    setCurrentBeneficiary(prev => ({...prev, countryCode: value}));
  };

  const handleSubmit = () => {
    if (!currentBeneficiary.name || !currentBeneficiary.email) {
      toast({ title: "Missing Information", description: "Please fill in name and email.", variant: "destructive" });
      return;
    }
    // Optional: Add validation for phone number format if country code is present

    if (editingBeneficiary) {
      setBeneficiaries(beneficiaries.map(b => b.id === editingBeneficiary.id ? { ...editingBeneficiary, ...currentBeneficiary } : b));
      toast({ title: "Beneficiary Updated", description: `${currentBeneficiary.name} has been updated.` });
    } else {
      setBeneficiaries([...beneficiaries, { id: crypto.randomUUID(), ...currentBeneficiary }]);
      toast({ title: "Beneficiary Added", description: `${currentBeneficiary.name} has been added.` });
    }
    resetFormAndCloseDialog();
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setCurrentBeneficiary({ 
      name: beneficiary.name, 
      email: beneficiary.email, 
      countryCode: beneficiary.countryCode || '', 
      phoneNumber: beneficiary.phoneNumber || '', 
      notes: beneficiary.notes || '' 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBeneficiaries(beneficiaries.filter(b => b.id !== id));
    toast({ title: "Beneficiary Deleted", description: "The beneficiary has been removed." });
  };

  const openNewBeneficiaryDialog = () => {
    setEditingBeneficiary(null);
    setCurrentBeneficiary(initialBeneficiaryState);
    setIsDialogOpen(true);
  };
  
  const resetFormAndCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBeneficiary(null);
    setCurrentBeneficiary(initialBeneficiaryState);
  }

  const filteredBeneficiaries = beneficiaries.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.phoneNumber && b.phoneNumber.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Beneficiaries</h1>
        <Button onClick={openNewBeneficiaryDialog}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Beneficiary
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div>
              <CardTitle>Manage Your Beneficiaries</CardTitle>
              <CardDescription>Add, edit, or remove beneficiaries who will receive your assets.</CardDescription>
            </div>
            <div className="relative w-full md:w-auto md:min-w-[250px]">
              <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search beneficiaries..." 
                className="pl-8 rtl:pr-8 rtl:pl-3 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBeneficiaries.length === 0 ? (
            <div className="text-center py-10">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No beneficiaries found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                 {searchTerm ? "Try a different search term." : "Add your first beneficiary to get started."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBeneficiaries.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.email}</TableCell>
                    <TableCell>{b.countryCode || ''} {b.phoneNumber || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{b.notes || 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(b)}>
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) resetFormAndCloseDialog()}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingBeneficiary ? 'Edit' : 'Add New'} Beneficiary</DialogTitle>
            <DialogDescription>
              {editingBeneficiary ? 'Update the details for this beneficiary.' : 'Enter the details for the new beneficiary.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={currentBeneficiary.name} onChange={handleInputChange} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" value={currentBeneficiary.email} onChange={handleInputChange} placeholder="john.doe@example.com" />
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-1.5">
                    <Label htmlFor="countryCode">Country</Label>
                    <Select value={currentBeneficiary.countryCode} onValueChange={handleCountryCodeChange}>
                        <SelectTrigger id="countryCode">
                            <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                            {countryCodes.map(country => (
                                <SelectItem key={country.code + '-' + country.name} value={country.code}>
                                   <span className="mr-1 rtl:ml-1">{country.flag}</span> {country.name} ({country.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                     <div className="relative">
                        <Phone className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="phoneNumber" name="phoneNumber" type="tel" value={currentBeneficiary.phoneNumber} onChange={handleInputChange} placeholder="Phone number" className="pl-8 rtl:pr-8 rtl:pl-3" />
                     </div>
                </div>
            </div>
             <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea 
                id="notes" 
                name="notes" 
                value={currentBeneficiary.notes || ''} 
                onChange={handleInputChange} 
                placeholder="Relationship, specific instructions, etc." 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetFormAndCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingBeneficiary ? 'Save Changes' : 'Add Beneficiary'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
