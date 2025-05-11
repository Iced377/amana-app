
"use client";

import type React from 'react';
import { useState, useEffect, use, useRef } from 'react';
import Image from 'next/image';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTranslation } from '@/locales/client';
import type { LocaleTypes } from '@/locales/settings';
import type { InsurancePolicy, InsuranceType, Currency, FileVisibility, Beneficiary } from '@/types';
import { insuranceTypes, currencies } from '@/types';
import { addInsurancePolicy, updateInsurancePolicy, deleteInsurancePolicy } from './actions';
import { format, parseISO } from 'date-fns';
import { ShieldAlert, PlusCircle, Edit3, Trash2, CalendarIcon, Search, UploadCloud, Eye, Download, X, FileText as FileIcon, Users, ArchiveRestore, Lock, Settings2, GripVertical, List } from 'lucide-react';

// MOCK Beneficiaries - In a real app, this would come from context or be fetched
const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: 'ben1', name: 'Alice Wonderland', email: 'alice@example.com' },
  { id: 'ben2', name: 'Bob The Builder', email: 'bob@example.com' },
  { id: 'ben3', name: 'Charlie Brown', email: 'charlie@example.com' },
];

const initialPolicyFormState: Omit<InsurancePolicy, 'id' | 'userId' | 'registrationDate'> = {
  insuranceType: 'Other',
  companyName: '',
  policyNumber: '',
  insuredAmount: null,
  currency: 'USD',
  startDate: undefined,
  endDate: undefined,
  policyBeneficiariesText: '',
  additionalCoverage: '',
  fileDataUri: undefined,
  fileName: undefined,
  fileType: undefined,
  fileSize: undefined,
  visibility: 'private',
  specificSharedBeneficiaryIds: [],
};

const getVisibilityIconAndText = (policy: InsurancePolicy, beneficiaries?: Beneficiary[]) => {
  switch (policy.visibility) {
    case 'private':
      return { icon: Lock, textKey: "visibilityStatusPrivate", color: "text-red-500" };
    case 'releaseOnDeath':
      const rodCount = policy.specificSharedBeneficiaryIds?.length || 0;
      const rodNames = beneficiaries && policy.specificSharedBeneficiaryIds 
        ? policy.specificSharedBeneficiaryIds.map(id => beneficiaries.find(b => b.id === id)?.name || id).join(', ')
        : `${rodCount} beneficiaries`;
      return { icon: ArchiveRestore, textKey: "visibilityStatusOnDeath", details: rodNames, color: "text-yellow-600" };
    case 'sharedImmediately':
      const siCount = policy.specificSharedBeneficiaryIds?.length || 0;
      const siNames = beneficiaries && policy.specificSharedBeneficiaryIds 
        ? policy.specificSharedBeneficiaryIds.map(id => beneficiaries.find(b => b.id === id)?.name || id).join(', ')
        : `${siCount} beneficiaries`;
      return { icon: Users, textKey: "visibilityStatusShared", details: siNames, color: "text-green-500" };
    default:
      return { icon: FileIcon, textKey: "unknownVisibility", color: "text-gray-500" };
  }
};


export default function InsurancePoliciesPage({ params }: { params: { lng: LocaleTypes }}) {
  const resolvedParams = use(params);
  const lng = resolvedParams.lng;
  const { t } = useTranslation(lng, 'translation');
  const { profile } = useUserPreferences();
  const { toast } = useToast();

  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [formData, setFormData] = useState(initialPolicyFormState);
  const [selectedPolicyFile, setSelectedPolicyFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableBeneficiaries = MOCK_BENEFICIARIES; // Use mocked beneficiaries

  useEffect(() => {
    // Fetch policies if needed, for now using local state
  }, [profile]);

  useEffect(() => {
    if (editingPolicy) {
      setFormData({
        insuranceType: editingPolicy.insuranceType,
        companyName: editingPolicy.companyName,
        policyNumber: editingPolicy.policyNumber,
        insuredAmount: editingPolicy.insuredAmount,
        currency: editingPolicy.currency,
        startDate: editingPolicy.startDate,
        endDate: editingPolicy.endDate,
        policyBeneficiariesText: editingPolicy.policyBeneficiariesText,
        additionalCoverage: editingPolicy.additionalCoverage,
        fileDataUri: editingPolicy.fileDataUri,
        fileName: editingPolicy.fileName,
        fileType: editingPolicy.fileType,
        fileSize: editingPolicy.fileSize,
        visibility: editingPolicy.visibility,
        specificSharedBeneficiaryIds: editingPolicy.specificSharedBeneficiaryIds || [],
      });
      if (editingPolicy.fileDataUri && editingPolicy.fileName && editingPolicy.fileType?.startsWith('image/')) {
        setFilePreview(editingPolicy.fileDataUri);
      } else {
        setFilePreview(null);
      }
      setSelectedPolicyFile(null); // Reset selected file when editing existing
    } else {
      setFormData(initialPolicyFormState);
      setSelectedPolicyFile(null);
      setFilePreview(null);
    }
  }, [editingPolicy]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, insuredAmount: value === '' ? null : parseFloat(value) }));
  };

  const handleSelectChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (name: 'startDate' | 'endDate', date?: Date) => {
    setFormData(prev => ({ ...prev, [name]: date ? date.toISOString() : undefined }));
  };

  const handlePolicyFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPolicyFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          fileDataUri: reader.result as string,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }));
        if (file.type.startsWith('image/')) {
          setFilePreview(reader.result as string);
        } else {
          setFilePreview(null);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedPolicyFile(null);
      setFilePreview(null);
      // If editing, don't clear existing fileDataUri unless a new file is picked
      if (!editingPolicy?.fileDataUri) {
         setFormData(prev => ({ ...prev, fileDataUri: undefined, fileName: undefined, fileType: undefined, fileSize: undefined }));
      }
    }
  };

  const handleBeneficiarySelection = (beneficiaryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specificSharedBeneficiaryIds: checked
        ? [...(prev.specificSharedBeneficiaryIds || []), beneficiaryId]
        : (prev.specificSharedBeneficiaryIds || []).filter(id => id !== beneficiaryId),
    }));
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingPolicy(null);
    setFormData(initialPolicyFormState);
    setSelectedPolicyFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async () => {
    if (!profile?.id) {
      toast({ title: t('errorText'), description: t('userProfileNotFound'), variant: "destructive" });
      return;
    }
    if (!formData.companyName || !formData.policyNumber) {
      toast({ title: t('errorText'), description: t('companyAndPolicyNumberRequired'), variant: "destructive" });
      return;
    }
    if ((formData.visibility === 'sharedImmediately' || formData.visibility === 'releaseOnDeath') && (!formData.specificSharedBeneficiaryIds || formData.specificSharedBeneficiaryIds.length === 0)) {
      toast({ title: t('errorText'), description: t('beneficiarySelectionRequiredForSharing'), variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const policyPayload = { ...formData };
      // If not 'sharedImmediately' or 'releaseOnDeath', clear specificSharedBeneficiaryIds
      if (policyPayload.visibility === 'private') {
        policyPayload.specificSharedBeneficiaryIds = [];
      }

      let result;
      if (editingPolicy) {
        result = await updateInsurancePolicy({ ...editingPolicy, ...policyPayload });
      } else {
        result = await addInsurancePolicy(policyPayload, profile.id);
      }

      if (result.success && result.policy) {
        if (editingPolicy) {
          setPolicies(prev => prev.map(p => p.id === result.policy!.id ? result.policy! : p));
          toast({ title: t('policyUpdatedSuccessTitle'), description: `${result.policy.policyNumber} ${t('policyUpdatedSuccessDesc')}` });
        } else {
          setPolicies(prev => [result.policy!, ...prev]);
          toast({ title: t('policyAddedSuccessTitle'), description: `${result.policy.policyNumber} ${t('policyAddedSuccessDesc')}` });
        }
        resetForm();
      } else {
        throw new Error(result.error || t('unknownError'));
      }
    } catch (error: any) {
      toast({ title: t('errorText'), description: error.message || t('policySubmissionFailedError'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (policyId: string) => {
    const policyToDelete = policies.find(p => p.id === policyId);
    if (!policyToDelete) return;

    // In a real app, filePath would come from policyToDelete.filePath if storing paths
    const result = await deleteInsurancePolicy(policyId, policyToDelete.fileName); 
    if (result.success) {
      setPolicies(prev => prev.filter(p => p.id !== policyId));
      toast({ title: t('policyDeletedSuccessTitle'), description: t('policyDeletedSuccessDesc') });
    } else {
      toast({ title: t('errorText'), description: result.error || t('policyDeletionFailedError'), variant: "destructive" });
    }
  };

  const filteredPolicies = policies.filter(policy => 
    policy.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t(`insuranceType${policy.insuranceType}`).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPolicyTypeTranslation = (typeKey: InsuranceType): string => {
      const translationKey = `insuranceType${typeKey}`;
      const translated = t(translationKey);
      return translated === translationKey || translated === "" ? typeKey : translated;
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold md:text-3xl flex items-center gap-2">
          <ShieldAlert className="h-7 w-7 text-primary" /> {t('insurancePoliciesTitle')}
        </h1>
        <Button onClick={() => { setEditingPolicy(null); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2 rtl:ml-2 h-4 w-4" /> {t('addPolicyButton')}
        </Button>
      </div>
      <Card className="shadow-md">
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <div>
                    <CardTitle>{t('manageInsurancePoliciesTitle')}</CardTitle>
                    <CardDescription>{t('manageInsurancePoliciesDesc')}</CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                        type="search" 
                        placeholder={t('searchPoliciesPlaceholder')} 
                        className="pl-8 rtl:pr-8 rtl:pl-3 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
                        <GripVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-10">
              <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">{t('noPoliciesFoundTitle')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? t('tryDifferentSearchTerm') : t('addFirstPolicyMessage')}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('insuranceTypeLabel')}</TableHead>
                  <TableHead>{t('companyNameLabel')}</TableHead>
                  <TableHead>{t('policyNumberLabel')}</TableHead>
                  <TableHead>{t('insuredAmountLabel')}</TableHead>
                  <TableHead>{t('endDateLabel')}</TableHead>
                  <TableHead>{t('visibility')}</TableHead>
                  <TableHead className="text-right">{t('actionsLabel')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.map(policy => {
                    const visInfo = getVisibilityIconAndText(policy, availableBeneficiaries);
                    const translatedVisText = t(visInfo.textKey) + (visInfo.details ? ` (${visInfo.details})` : '');
                    return (
                    <TableRow key={policy.id}>
                        <TableCell>{getPolicyTypeTranslation(policy.insuranceType)}</TableCell>
                        <TableCell className="font-medium">{policy.companyName}</TableCell>
                        <TableCell>{policy.policyNumber}</TableCell>
                        <TableCell>
                        {policy.insuredAmount?.toLocaleString(lng, { style: 'currency', currency: typeof policy.currency === 'string' && policy.currency !== 'Other' ? policy.currency : 'USD' }) ?? t('notApplicableShort')}
                        {typeof policy.currency === 'string' && policy.currency === 'Other' && policy.insuredAmount && <span className="text-xs"> (Other Currency)</span>}
                        </TableCell>
                        <TableCell>{policy.endDate ? format(parseISO(policy.endDate), 'P', {locale: lng === 'ar' ? require('date-fns/locale/ar-SA') : undefined}) : t('notApplicableShort')}</TableCell>
                        <TableCell>
                        <div className="flex items-center gap-1" title={translatedVisText}>
                            <visInfo.icon className={`h-4 w-4 ${visInfo.color}`} />
                            <span className="text-xs truncate max-w-[100px]">{translatedVisText}</span>
                        </div>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingPolicy(policy); setIsFormOpen(true); }}>
                            <Edit3 className="h-4 w-4" /> <span className="sr-only">{t('editPolicyButton')}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(policy.id)}>
                            <Trash2 className="h-4 w-4" /> <span className="sr-only">{t('deletePolicyButton')}</span>
                        </Button>
                        </TableCell>
                    </TableRow>
                    );
                })}
              </TableBody>
            </Table>
          ) : ( // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPolicies.map(policy => {
                    const visInfo = getVisibilityIconAndText(policy, availableBeneficiaries);
                    const translatedVisText = t(visInfo.textKey) + (visInfo.details ? ` (${visInfo.details})` : '');
                    return (
                    <Card key={policy.id} className="flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{policy.companyName}</CardTitle>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingPolicy(policy); setIsFormOpen(true); }}>
                                        <Edit3 className="h-4 w-4" /> <span className="sr-only">{t('editPolicyButton')}</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(policy.id)}>
                                        <Trash2 className="h-4 w-4" /> <span className="sr-only">{t('deletePolicyButton')}</span>
                                    </Button>
                                </div>
                            </div>
                            <CardDescription>{getPolicyTypeTranslation(policy.insuranceType)} - {policy.policyNumber}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1 flex-grow">
                            <p>{t('insuredAmountLabel')}: {policy.insuredAmount?.toLocaleString(lng, { style: 'currency', currency: typeof policy.currency === 'string' && policy.currency !== 'Other' ? policy.currency : 'USD' }) ?? t('notApplicableShort')}</p>
                            <p>{t('endDateLabel')}: {policy.endDate ? format(parseISO(policy.endDate), 'P', {locale: lng === 'ar' ? require('date-fns/locale/ar-SA') : undefined}) : t('notApplicableShort')}</p>
                             <div className="flex items-center gap-1" title={translatedVisText}>
                                <visInfo.icon className={`h-4 w-4 ${visInfo.color}`} />
                                <span className="text-xs">{translatedVisText}</span>
                            </div>
                            {policy.fileName && <p className="truncate text-xs text-muted-foreground">{t('documentLabel')}: {policy.fileName}</p>}
                        </CardContent>
                         <CardFooter>
                             {/* Optionally add a preview button if file exists */}
                         </CardFooter>
                    </Card>
                    );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if(!isOpen) resetForm(); else setIsFormOpen(true); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? t('editPolicyTitle') : t('addPolicyTitle')}</DialogTitle>
            <DialogDescription>{editingPolicy ? t('editPolicyDesc') : t('addPolicyDesc')}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-6 -mr-6"> {/* Added ScrollArea */}
            <div className="grid gap-4 py-4 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="insuranceType">{t('insuranceTypeLabel')}</Label>
                        <Select value={formData.insuranceType} onValueChange={(val) => handleSelectChange('insuranceType', val as InsuranceType)}>
                            <SelectTrigger id="insuranceType"><SelectValue placeholder={t('selectInsuranceTypePlaceholder')} /></SelectTrigger>
                            <SelectContent>
                            {insuranceTypes.map(type => <SelectItem key={type} value={type}>{getPolicyTypeTranslation(type)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="companyName">{t('companyNameLabel')}</Label>
                        <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder={t('companyNamePlaceholder')} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <Label htmlFor="policyNumber">{t('policyNumberLabel')}</Label>
                        <Input id="policyNumber" name="policyNumber" value={formData.policyNumber} onChange={handleInputChange} placeholder={t('policyNumberPlaceholder')} />
                    </div>
                    <div>
                        <Label htmlFor="insuredAmount">{t('insuredAmountLabel')}</Label>
                        <Input id="insuredAmount" name="insuredAmount" type="number" value={formData.insuredAmount ?? ''} onChange={handleAmountChange} placeholder="100000" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="currency">{t('currencyLabel')}</Label>
                        <Select value={formData.currency} onValueChange={(val) => handleSelectChange('currency', val as Currency)}>
                            <SelectTrigger id="currency"><SelectValue placeholder={t('selectCurrencyPlaceholder')} /></SelectTrigger>
                            <SelectContent>
                            {currencies.map(curr => <SelectItem key={curr} value={curr}>{curr}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {formData.currency === 'Other' && <Input name="currency" value={formData.currency} onChange={(e)=>handleSelectChange('currency', e.target.value)} placeholder={t('specifyCurrencyPlaceholder')} className="mt-2"/>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="startDate">{t('startDateLabel')}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.startDate ? format(parseISO(formData.startDate), "PPP", {locale: lng === 'ar' ? require('date-fns/locale/ar-SA') : undefined}) : <span>{t('pickDatePlaceholder')}</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.startDate ? parseISO(formData.startDate) : undefined} onSelect={(date) => handleDateChange('startDate', date)} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label htmlFor="endDate">{t('endDateLabel')}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.endDate ? format(parseISO(formData.endDate), "PPP", {locale: lng === 'ar' ? require('date-fns/locale/ar-SA') : undefined}) : <span>{t('pickDatePlaceholder')}</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.endDate ? parseISO(formData.endDate) : undefined} onSelect={(date) => handleDateChange('endDate', date)} /></PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div>
                    <Label htmlFor="policyBeneficiariesText">{t('policyBeneficiariesTextLabel')}</Label>
                    <Textarea id="policyBeneficiariesText" name="policyBeneficiariesText" value={formData.policyBeneficiariesText || ''} onChange={handleInputChange} placeholder={t('policyBeneficiariesTextPlaceholder')} />
                </div>
                <div>
                    <Label htmlFor="additionalCoverage">{t('additionalCoverageLabel')}</Label>
                    <Textarea id="additionalCoverage" name="additionalCoverage" value={formData.additionalCoverage || ''} onChange={handleInputChange} placeholder={t('additionalCoveragePlaceholder')} />
                </div>
                
                <div>
                    <Label htmlFor="policyFileUpload">{t('attachPolicyDocumentOptional')}</Label>
                    <Input id="policyFileUpload" type="file" onChange={handlePolicyFileChange} ref={fileInputRef} />
                    {filePreview && (
                        <div className="mt-2">
                        <Image src={filePreview} alt={t('selectedFilePreviewAlt')} width={100} height={100} className="rounded-md object-contain max-h-24" data-ai-hint="file preview" />
                        </div>
                    )}
                    {formData.fileName && !filePreview && (
                        <p className="text-xs text-muted-foreground mt-1">{t('currentFileLabel')}: {formData.fileName} ({formData.fileSize ? (formData.fileSize / 1024).toFixed(2) + ' KB' : ''})</p>
                    )}
                     {selectedPolicyFile && !filePreview && (
                        <p className="text-xs text-muted-foreground mt-1">{t('previewNotAvailableForType', {fileName: selectedPolicyFile.name})}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>{t('visibility')}</Label>
                    <RadioGroup value={formData.visibility} onValueChange={(val) => handleSelectChange('visibility', val as FileVisibility)}>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value="private" id="policy-vis-private" /><Label htmlFor="policy-vis-private" className="font-normal">{t('keepPrivate')}</Label>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value="releaseOnDeath" id="policy-vis-onDeath" /><Label htmlFor="policy-vis-onDeath" className="font-normal">{t('releaseUponDeathSpecific')}</Label>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value="sharedImmediately" id="policy-vis-specific" /><Label htmlFor="policy-vis-specific" className="font-normal">{t('shareWithSpecificBeneficiaries')}</Label>
                        </div>
                    </RadioGroup>
                </div>

                {(formData.visibility === 'sharedImmediately' || formData.visibility === 'releaseOnDeath') && (
                <div className="space-y-2 pl-2 rtl:pr-2 rtl:pl-0 border-l-2 rtl:border-r-2 rtl:border-l-0 ml-2 rtl:mr-2 rtl:ml-0">
                    <Label>{t('selectBeneficiariesToShareWith')}</Label>
                    {availableBeneficiaries.length > 0 ? (
                    <ScrollArea className="h-32">
                        {availableBeneficiaries.map(ben => (
                        <div key={ben.id} className="flex items-center space-x-2 rtl:space-x-reverse py-1">
                            <Checkbox
                            id={`ben-policy-${ben.id}`}
                            checked={(formData.specificSharedBeneficiaryIds || []).includes(ben.id)}
                            onCheckedChange={(checked) => handleBeneficiarySelection(ben.id, !!checked)}
                            />
                            <Label htmlFor={`ben-policy-${ben.id}`} className="font-normal">{ben.name}</Label>
                        </div>
                        ))}
                    </ScrollArea>
                    ) : <p className="text-sm text-muted-foreground">{t('noBeneficiariesYet')}</p>}
                </div>
                )}
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>{t('cancelButton')}</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? t('savingButton') : (editingPolicy ? t('saveChangesButton') : t('addPolicyButton'))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
