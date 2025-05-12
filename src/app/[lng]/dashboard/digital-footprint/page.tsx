
"use client";

import type React from 'react';
import { useState, useEffect, use } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox'; // Added Checkbox
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTranslation } from '@/locales/client';
import type { LocaleTypes } from '@/locales/settings';
import type { DiscoveredAccount, DigitalAccountAction, DigitalAccountCategory, VaultFile, Beneficiary, DigitalAccountDiscoveryMethod } from '@/types';
import { Fingerprint, Mail, Search, CheckSquare, Edit3, Trash2, LinkIcon, PlusCircle, Info, FileText as VaultFileIcon, DollarSign } from 'lucide-react';

// Mock data - replace with actual data fetching
const MOCK_VAULT_FILES: VaultFile[] = [
  { id: 'file1', name: 'Passwords.docx', type: 'document', size: 12345, uploadDate: new Date().toISOString(), dataUri: '', aiTags: [], visibility: 'private', icon: VaultFileIcon },
  { id: 'file2', name: 'SocialMediaLogins.pdf', type: 'document', size: 67890, uploadDate: new Date().toISOString(), dataUri: '', aiTags: [], visibility: 'private', icon: VaultFileIcon },
];
const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: 'ben1', name: 'Alice Wonderland', email: 'alice@example.com' },
  { id: 'ben2', name: 'Bob The Builder', email: 'bob@example.com' },
];


const initialAccountFormState: Omit<DiscoveredAccount, 'id' | 'userId' | 'dateAdded' | 'discoveryMethod'> = {
  serviceName: '',
  category: 'Other',
  username: '',
  notes: '',
  actionOnDeath: 'noAction',
  assignedContactId: undefined,
  linkedFileId: undefined,
  estimatedUSDValue: undefined,
};

const commonServicesList: { name: string, category: DigitalAccountCategory }[] = [
  { name: "Facebook", category: "Social Media" }, { name: "Instagram", category: "Social Media" },
  { name: "Twitter / X", category: "Social Media" }, { name: "LinkedIn", category: "Work" },
  { name: "Gmail", category: "Email" }, { name: "Outlook / Hotmail", category: "Email" },
  { name: "Netflix", category: "Entertainment" }, { name: "Spotify", category: "Entertainment" },
  { name: "Amazon", category: "Shopping" }, { name: "eBay", category: "Shopping" },
  { name: "PayPal", category: "Financial" }, { name: "Your Bank (e.g., Bank of America)", category: "Financial"},
  { name: "Dropbox", category: "Cloud Storage" }, { name: "Google Drive", category: "Cloud Storage" },
  { name: "Microsoft OneDrive", category: "Cloud Storage" }, { name: "Apple iCloud", category: "Cloud Storage" },
  { name: "Steam", category: "Gaming" }, { name: "Epic Games", category: "Gaming" },
];

const accountCategories: DigitalAccountCategory[] = [
  'Financial', 'Social Media', 'Email', 'Work', 'Utilities', 'Shopping', 'Entertainment', 'Cloud Storage', 'Gaming', 'Other'
];


export default function DigitalFootprintPage({ params }: { params: { lng: LocaleTypes }}) {
  const resolvedParams = use(params);
  const lng = resolvedParams.lng;
  
  const { t } = useTranslation(lng, 'translation');
  const { profile } = useUserPreferences();
  const { toast } = useToast();

  const [discoveredAccounts, setDiscoveredAccounts] = useState<DiscoveredAccount[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DiscoveredAccount | null>(null);
  const [formData, setFormData] = useState(initialAccountFormState);

  const [availableVaultFiles, setAvailableVaultFiles] = useState<VaultFile[]>(MOCK_VAULT_FILES);
  const [availableBeneficiaries, setAvailableBeneficiaries] = useState<Beneficiary[]>(MOCK_BENEFICIARIES);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChecklistServices, setSelectedChecklistServices] = useState<string[]>([]);


  useEffect(() => {
    if (editingAccount) {
      setFormData({
        serviceName: editingAccount.serviceName,
        category: editingAccount.category,
        username: editingAccount.username || '',
        notes: editingAccount.notes || '',
        actionOnDeath: editingAccount.actionOnDeath,
        assignedContactId: editingAccount.assignedContactId,
        linkedFileId: editingAccount.linkedFileId,
        estimatedUSDValue: editingAccount.estimatedUSDValue,
      });
      setIsFormOpen(true);
    } else {
      setFormData(initialAccountFormState);
    }
  }, [editingAccount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
  };

  const handleSelectChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleChecklistServiceToggle = (serviceName: string) => {
    setSelectedChecklistServices(prev =>
      prev.includes(serviceName)
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleAddSelectedFromChecklist = () => {
    if (!profile?.id) return;
    const newAccounts = selectedChecklistServices
      .filter(sn => !discoveredAccounts.some(da => da.serviceName.toLowerCase() === sn.toLowerCase())) // Avoid duplicates
      .map(serviceName => {
        const commonService = commonServicesList.find(cs => cs.name === serviceName);
        return {
          id: crypto.randomUUID(),
          userId: profile.id,
          serviceName: serviceName,
          category: commonService?.category || 'Other',
          actionOnDeath: 'noAction' as DigitalAccountAction,
          discoveryMethod: 'checklist' as DigitalAccountDiscoveryMethod,
          dateAdded: new Date().toISOString(),
        } as DiscoveredAccount;
    });
    setDiscoveredAccounts(prev => [...prev, ...newAccounts]);
    setSelectedChecklistServices([]); // Clear selection
    toast({ title: `${newAccounts.length} accounts added from checklist.`});
  };


  const handleSubmit = () => {
    if (!formData.serviceName || !profile?.id) {
      toast({ title: t('errorText'), description: t('serviceNameRequiredError'), variant: "destructive" });
      return;
    }

    const newOrUpdatedAccount: DiscoveredAccount = {
      ...(editingAccount || { id: crypto.randomUUID(), userId: profile.id, dateAdded: new Date().toISOString(), discoveryMethod: 'manual' as DigitalAccountDiscoveryMethod }),
      ...formData,
    };

    if (editingAccount) {
      setDiscoveredAccounts(discoveredAccounts.map(acc => acc.id === editingAccount.id ? newOrUpdatedAccount : acc));
      toast({ title: t('accountUpdatedSuccessTitle'), description: `${newOrUpdatedAccount.serviceName} ${t('accountUpdatedSuccessDesc')}` });
    } else {
      setDiscoveredAccounts(prev => [newOrUpdatedAccount, ...prev]);
      toast({ title: t('accountAddedSuccessTitle'), description: `${newOrUpdatedAccount.serviceName} ${t('accountAddedSuccessDesc')}` });
    }
    setIsFormOpen(false);
    setEditingAccount(null);
  };

  const handleDelete = (accountId: string) => {
    setDiscoveredAccounts(discoveredAccounts.filter(acc => acc.id !== accountId));
    toast({ title: t('deleteAccount'), description: t('accountRemovedSuccessDesc')});
  };
  
  const handleScanInbox = (service: 'Gmail' | 'Outlook') => {
    // Placeholder for OAuth and scanning logic
    toast({ title: `${t('scanInboxButton' + service)} - ${t('featureComingSoonTitle')}`, description: t('oauthDisclaimer')});
  }

  const filteredCommonServices = commonServicesList.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getCategoryTranslation = (categoryKey: DigitalAccountCategory): string => {
      const translationKey = `accountCategory${categoryKey.replace(/\s+/g, '')}`;
      const translated = t(translationKey);
      // Fallback to categoryKey if translation is missing (e.g. key itself is returned)
      return translated === translationKey || translated === "" ? categoryKey : translated;
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold md:text-3xl flex items-center gap-2">
          <Fingerprint className="h-7 w-7 text-primary" /> {t('digitalFootprintTitle')}
        </h1>
      </div>
      <p className="text-muted-foreground">{t('digitalFootprintDesc')}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t('discoveryMethodsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => handleScanInbox('Gmail')} disabled className="w-full justify-start text-left p-4 h-auto">
            <Mail className="mr-2 rtl:ml-2 h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold block">{t('scanInboxButtonGmail')}</span>
            </div>
          </Button>
          <Button variant="outline" onClick={() => handleScanInbox('Outlook')} disabled className="w-full justify-start text-left p-4 h-auto">
             <Mail className="mr-2 rtl:ml-2 h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold block">{t('scanInboxButtonOutlook')}</span>
            </div>
          </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">{t('oauthDisclaimer')} ({t('featureComingSoonTitle')})</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('checklistTitle')}</CardTitle>
          <CardDescription>{t('checklistDesc')}</CardDescription>
           <div className="relative mt-2">
            <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                type="search" 
                placeholder={t('serviceSearchPlaceholder')}
                className="pl-8 rtl:pr-8 rtl:pl-3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredCommonServices.map(service => (
                    <div key={service.name} className="flex items-center space-x-2 rtl:space-x-reverse p-2 border rounded-md hover:bg-accent/50">
                        <Checkbox 
                            id={`checklist-${service.name.replace(/\s+/g, '-')}`} 
                            checked={selectedChecklistServices.includes(service.name)}
                            onCheckedChange={() => handleChecklistServiceToggle(service.name)}
                        />
                        <Label htmlFor={`checklist-${service.name.replace(/\s+/g, '-')}`} className="font-normal flex-1 cursor-pointer">
                            {service.name} <Badge variant="outline" className="ml-1 rtl:mr-1 text-xs">{getCategoryTranslation(service.category)}</Badge>
                        </Label>
                    </div>
                ))}
                 {filteredCommonServices.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center">{t('noServicesMatchSearch')}</p>}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
            <Button onClick={handleAddSelectedFromChecklist} disabled={selectedChecklistServices.length === 0}>
                <PlusCircle className="mr-2 rtl:ml-2 h-4 w-4"/> {t('addSelectedToFootprintList')} ({selectedChecklistServices.length})
            </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{editingAccount ? t('editAccount') : t('manuallyAddAccountTitle')}</CardTitle>
          <CardDescription>{editingAccount ? t('updateAccountDetails') : t('manuallyAddAccountDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="serviceName">{t('serviceNameLabel')}</Label>
              <Input id="serviceName" name="serviceName" value={formData.serviceName} onChange={handleInputChange} placeholder={t('serviceNamePlaceholder')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">{t('serviceCategoryLabel')}</Label>
              <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value as DigitalAccountCategory)}>
                <SelectTrigger id="category"><SelectValue placeholder={t('selectCategoryPlaceholder')} /></SelectTrigger>
                <SelectContent>
                  {accountCategories.map(cat => <SelectItem key={cat} value={cat}>{getCategoryTranslation(cat)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">{t('usernameOptionalLabel')}</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder={t('usernamePlaceholder')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estimatedUSDValueAccount">Estimated USD Value (Optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="estimatedUSDValueAccount" 
                  name="estimatedUSDValue" 
                  type="number" 
                  placeholder="e.g., 100" 
                  value={formData.estimatedUSDValue === undefined ? '' : formData.estimatedUSDValue}
                  onChange={handleAmountChange}
                  className="pl-8 rtl:pr-8 rtl:pl-3"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">{t('notesForBeneficiaryLabel')}</Label>
            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder={t('notesPlaceholder')} />
          </div>
           <div className="space-y-1.5">
            <Label htmlFor="actionOnDeath">{t('actionOnDeathLabel')}</Label>
            <Select name="actionOnDeath" value={formData.actionOnDeath} onValueChange={(value) => handleSelectChange('actionOnDeath', value as DigitalAccountAction)}>
                <SelectTrigger id="actionOnDeath"><SelectValue placeholder={t('selectActionPlaceholder')} /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="noAction">{t('noSpecificAction')}</SelectItem>
                    <SelectItem value="shareLogin">{t('shareLoginDetails')}</SelectItem>
                    <SelectItem value="notifyContact">{t('notifyContactAboutAccount')}</SelectItem>
                    <SelectItem value="deleteAccount">{t('requestAccountDeletion')}</SelectItem>
                </SelectContent>
            </Select>
          </div>

          {(formData.actionOnDeath === 'shareLogin' || formData.actionOnDeath === 'notifyContact') && (
            <div className="space-y-1.5">
                <Label htmlFor="assignedContactId">{t('assignBeneficiaryOptionalLabel')}</Label>
                <Select name="assignedContactId" value={formData.assignedContactId || ''} onValueChange={(value) => handleSelectChange('assignedContactId', value)}>
                    <SelectTrigger id="assignedContactId"><SelectValue placeholder={t('selectBeneficiaryPlaceholder')} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">{t('noneSelected')}</SelectItem>
                        {availableBeneficiaries.map(ben => <SelectItem key={ben.id} value={ben.id}>{ben.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          )}
          
          {formData.actionOnDeath === 'shareLogin' && (
            <div className="space-y-1.5">
                <Label htmlFor="linkedFileId">{t('linkToVaultFileOptionalLabel')}</Label>
                 <Select name="linkedFileId" value={formData.linkedFileId || ''} onValueChange={(value) => handleSelectChange('linkedFileId', value)}>
                    <SelectTrigger id="linkedFileId"><SelectValue placeholder={t('linkToVaultFilePlaceholder')} /></SelectTrigger>
                    <SelectContent>
                         <SelectItem value="">{t('noneSelected')}</SelectItem>
                        {availableVaultFiles.map(file => <SelectItem key={file.id} value={file.id}>{file.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t('ensureFileContainsLogin')}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            {editingAccount && <Button variant="outline" onClick={() => {setIsFormOpen(false); setEditingAccount(null);}}>{t('cancelButton')}</Button>}
            <Button onClick={handleSubmit}>
              <PlusCircle className="mr-2 rtl:ml-2 h-4 w-4" /> {editingAccount ? t('updateAccountButton') : t('addAccountButton')}
            </Button>
        </CardFooter>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>{t('yourDigitalAccountsTitle')}</CardTitle>
          <CardDescription>{discoveredAccounts.length > 0 ? t('manageYourDigitalAccountsDesc') : t('noDigitalAccountsFound')}</CardDescription>
        </CardHeader>
        <CardContent>
          {discoveredAccounts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Fingerprint className="mx-auto h-12 w-12 mb-2" />
              <p>{t('noDigitalAccountsFound')}</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {discoveredAccounts.map(acc => (
                  <Card key={acc.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{acc.serviceName}</h3>
                        <Badge variant="secondary" className="text-xs">{getCategoryTranslation(acc.category)}</Badge>
                        {acc.username && <p className="text-sm text-muted-foreground">Username: {acc.username}</p>}
                        {acc.estimatedUSDValue !== undefined && <p className="text-sm text-muted-foreground">Est. Value: ${acc.estimatedUSDValue.toLocaleString()}</p>}
                        {acc.notes && <p className="text-sm text-muted-foreground mt-1">Notes: {acc.notes}</p>}
                        <p className="text-sm text-muted-foreground mt-1">Action: {t(acc.actionOnDeath === "noAction" ? "noSpecificAction" : acc.actionOnDeath === "shareLogin" ? "shareLoginDetails" : acc.actionOnDeath === "notifyContact" ? "notifyContactAboutAccount" : "requestAccountDeletion" )}</p>
                        {acc.linkedFileId && <p className="text-sm text-muted-foreground flex items-center gap-1"><LinkIcon className="h-3 w-3"/> Linked File: {availableVaultFiles.find(f=>f.id === acc.linkedFileId)?.name || t('fileNotFound')}</p>}
                         {acc.assignedContactId && <p className="text-sm text-muted-foreground">Contact: {availableBeneficiaries.find(b=>b.id === acc.assignedContactId)?.name || t('contactNotFound')}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditingAccount(acc)}>
                          <Edit3 className="h-4 w-4" /> <span className="sr-only">{t('editAccount')}</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" /> <span className="sr-only">{t('deleteAccount')}</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('confirmDeleteAccountTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('confirmDeleteAccountDesc')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(acc.id)}>{t('deleteAccount')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

       <Alert className="mt-6 border-sky-500 bg-sky-50 dark:bg-sky-900/30">
        <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />
        <AlertTitle className="text-sky-700 dark:text-sky-300">{t('importantPrivacyNoteTitle')}</AlertTitle>
        <AlertDescription className="text-sky-600 dark:text-sky-400">
          {t('amanDoesNotStorePasswords')} {t('storePasswordsInVault')}
        </AlertDescription>
      </Alert>
    </div>
  );
}
