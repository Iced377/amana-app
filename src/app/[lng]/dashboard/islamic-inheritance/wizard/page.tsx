
"use client";

import type React from 'react';
import { useState, useEffect, use } from 'react';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTranslation } from '@/locales/client';
import type { LocaleTypes, Madhhab, VaultFile, RegisteredAsset } from '@/locales/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { classifyIslamicEstateAssets } from '@/ai/flows/classify-islamic-estate-assets';
import type { AssetForClassification, ClassifiedAsset } from '@/ai/flows/classify-islamic-estate-assets';
import { Landmark, Wand2, Info, AlertTriangle, Loader2, Edit3, CheckSquare, RefreshCw, FileText, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';


// Minimal valid Base64 encoded PDF (displays "Hello, World!")
const MINIMAL_PDF_DATA_URI = 'data:application/pdf;base64,JVBERi0xLjQKJSAxIDAgb2JqPDw+PmVuZG9iajogMiAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAxIDAgUj4+ZW5kb2JqIDMgMCBvYmo8PC9UeXBlL1BhZ2VzL0NvdW50IDEgMCBSL0tpZHNbNCAwIFIgXS9SZXNvdXJjZXMoPD4pL01lZGlhQm94WzAgMCA2MTIgNzkyXT4+ZW5kb2JqIDQgMCBvYmo8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL0NvbnRlbnRzIDUgMCBSPj5lbmRvYmogNSAwIG9iajw8L0xlbmd0aCAxNT4+c3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3MDAgVGQKKFJvbGxpbmcgRGljZSEpJ1RKT0VtQ0JEZW5kc3RyZWFtCmVuZG9iajx4cmVmDQowIDYNCjAwMDAwMDAwMDAgNjU1MzUgZiANCjAwMDAwMDAwMTkgMDAwMDAgbiANCjAwMDAwMDAwNzYgMDAwMDAgbiANCjAwMDAwMDAxNzAgMDAwMDAgbiANCjAwMDAwMDAyODAgMDAwMDAgbiANCjAwMDAwMDAzNjkgMDAwMDAgbiANClRyYWlsZXIKPDwvUm9vdCAyIDAgUi9TaXplIDY+PgpzdGFydHhyZWYKNDExCiUlRU9GCg==';

// Minimal valid Base64 encoded JPEG (1x1 black pixel)
const MINIMAL_JPEG_DATA_URI = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAASUkqAAgAAAABABIBAwABAAAABgASAAAAAAD/7QAsUGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAABAHAANkJUOEggMSw3LjM5NjgzMDczODQ2MSBGMjEwNTk0OEI2OEVFNjQ2QkYwNDY5RkQ4MzJBRDI5AP/bAEMACAYGBwYFCAcHBwkJCAoMFA0MCwsMGRITDxQdGh8eHRocHCAkLicgIiwjHBwoNyksMDE0NDQfJzk9ODI8LjM0Mv/bAEMBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/AABEIAAEAAQMBEQACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tbe4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APwD/wA//9k=';


// MOCK DATA - In a real app, this would be fetched based on the user
const MOCK_VAULT_FILES: VaultFile[] = [
    { id: 'vf1', name: 'House Deed.pdf', type: 'document', size: 102400, uploadDate: '2023-01-15T10:00:00Z', dataUri: MINIMAL_PDF_DATA_URI, aiTags: ['legal', 'property'], icon: FileText, visibility: 'private', estimatedUSDValue: 250000 },
    { id: 'vf2', name: 'Family Gold Coins.jpg', type: 'image', size: 204800, uploadDate: '2023-03-20T14:30:00Z', dataUri: MINIMAL_JPEG_DATA_URI, aiTags: ['personal', 'valuables'], icon: FileText /* Placeholder, should be ImageIcon */, visibility: 'private', estimatedUSDValue: 5000 }
];
const MOCK_REGISTERED_ASSETS: RegisteredAsset[] = [
    { id: 'ra1', userId: 'user123', categoryKey: 'financial', assetDescription: 'Savings Account - Bank ABC', registrationDate: '2023-02-10T09:00:00Z', visibility: 'private', estimatedUSDValue: 15000 },
    { id: 'ra2', userId: 'user123', categoryKey: 'property_vehicles', assetDescription: 'Apartment in City Center', fileName: 'ApartmentDeed.pdf', fileDataUri: MINIMAL_PDF_DATA_URI, registrationDate: '2023-04-05T11:00:00Z', visibility: 'private', estimatedUSDValue: 180000 }
];


type WizardStep = 'madhhab' | 'scan' | 'review' | 'summary';

const initialEditFormData: Omit<ClassifiedAsset, 'assetId'> = {
    assetName: '',
    classification: 'NeedsReview',
    extractedValue: undefined,
    currency: undefined,
    reason: '',
    details: undefined,
};


export default function IslamicInheritanceWizardPage({ params }: { params: { lng: LocaleTypes }}) {
  const resolvedParams = use(params);
  const lng = resolvedParams.lng;
  const { t } = useTranslation(lng, "translation");
  const { profile, updateProfileField, isLoading: profileLoading } = useUserPreferences();
  const { toast } = useToast();

  const [step, setStep] = useState<WizardStep>('madhhab');
  const [selectedMadhhab, setSelectedMadhhab] = useState<Madhhab>(profile?.islamicPreferences?.madhhab || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [classifiedAssets, setClassifiedAssets] = useState<ClassifiedAsset[]>([]);
  const [userReviewedAssets, setUserReviewedAssets] = useState<ClassifiedAsset[]>([]);

  const [debtsAmount, setDebtsAmount] = useState<number | undefined>(undefined);
  const [wasiyyahAmount, setWasiyyahAmount] = useState<number | undefined>(undefined);
  const [netEstateForFaraid, setNetEstateForFaraid] = useState<number | undefined>(undefined);

  // State for Edit Asset Dialog
  const [isEditAssetModalOpen, setIsEditAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<ClassifiedAsset | null>(null);
  const [currentEditFormAsset, setCurrentEditFormAsset] = useState<Omit<ClassifiedAsset, 'assetId'>>(initialEditFormData);


  useEffect(() => {
    if (profile?.islamicPreferences?.madhhab) {
      setSelectedMadhhab(profile.islamicPreferences.madhhab);
      if(step === 'madhhab' && profile.islamicPreferences.madhhab) setStep('scan'); // If madhhab already set, skip first step
    }
  }, [profile, step]);

  useEffect(() => {
    if (assetToEdit) {
        setCurrentEditFormAsset({
            assetName: assetToEdit.assetName,
            classification: assetToEdit.classification,
            extractedValue: assetToEdit.extractedValue,
            currency: assetToEdit.currency,
            reason: assetToEdit.reason,
            details: assetToEdit.details,
        });
    } else {
        setCurrentEditFormAsset(initialEditFormData);
    }
  }, [assetToEdit]);

  const handleMadhhabConfirm = () => {
    if (!selectedMadhhab) {
      toast({ title: t('errorText'), description: t('madhhabSelectionRequiredError'), variant: "destructive" });
      return;
    }
    updateProfileField({ islamicPreferences: { ...(profile?.islamicPreferences || {}), madhhab: selectedMadhhab } });
    setStep('scan');
  };

  const startAssetScan = async () => {
    if (!selectedMadhhab || !profile?.id) {
      toast({ title: t('errorText'), description: t('madhhabOrProfileMissingError'), variant: "destructive" });
      return;
    }
    setIsScanning(true);
    setScanProgress(0);
    setClassifiedAssets([]);
    setUserReviewedAssets([]);

    const assetsToClassify: AssetForClassification[] = [];
    MOCK_VAULT_FILES.forEach(vf => {
      assetsToClassify.push({
        id: vf.id,
        name: vf.name,
        type: vf.type,
        fileDataUri: vf.fileDataUri && vf.fileDataUri.includes(';base64,') ? vf.fileDataUri : undefined,
        size: vf.size,
        estimatedUSDValue: vf.estimatedUSDValue,
      });
    });
    MOCK_REGISTERED_ASSETS.forEach(ra => {
      assetsToClassify.push({
        id: ra.id,
        name: ra.assetDescription, 
        type: ra.categoryKey,
        fileDataUri: ra.fileDataUri && ra.fileDataUri.includes(';base64,') ? ra.fileDataUri : undefined,
        manualDescription: ra.assetDescription,
        size: ra.fileSize,
        estimatedUSDValue: ra.estimatedUSDValue,
      });
    });
    
    if (assetsToClassify.length === 0) {
        toast({title: t('noAssetsFoundTitle'), description: t('noAssetsToScanDesc'), variant: 'default'});
        setIsScanning(false);
        setStep('review'); 
        return;
    }

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setScanProgress(Math.min(progress, 90));
      if (progress >= 90) clearInterval(progressInterval);
    }, 300);

    try {
      const result = await classifyIslamicEstateAssets({
        assets: assetsToClassify.slice(0, 5), 
        madhhab: selectedMadhhab
      });
      clearInterval(progressInterval);
      setScanProgress(100);
      setClassifiedAssets(result.classifiedAssets);
      setUserReviewedAssets(JSON.parse(JSON.stringify(result.classifiedAssets)));
      setStep('review');
      toast({ title: t('scanCompleteTitle'), description: t('assetsClassifiedDesc') });
    } catch (error: any) {
      clearInterval(progressInterval);
      setScanProgress(0); 
      console.error("Error during asset scan:", error);
      toast({ title: t('errorText'), description: error.message || t('assetClassificationFailedError'), variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleClassificationReviewChange = (assetId: string, classification: 'Inheritable' | 'Excluded' | 'NeedsReview') => {
    setUserReviewedAssets(prev =>
      prev.map(asset =>
        asset.assetId === assetId ? { ...asset, classification } : asset
      )
    );
  };

  const openEditAssetModal = (asset: ClassifiedAsset) => {
    setAssetToEdit(asset);
    setIsEditAssetModalOpen(true);
  };

  const handleSaveAssetChanges = () => {
    if (!assetToEdit) return;
    const updatedAsset: ClassifiedAsset = {
      ...assetToEdit, // Keeps original assetId and any other non-edited fields
      ...currentEditFormAsset,
    };
    setUserReviewedAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.assetId === updatedAsset.assetId ? updatedAsset : asset
      )
    );
    setIsEditAssetModalOpen(false);
    setAssetToEdit(null);
    toast({ title: t('assetUpdatedSuccessTitle'), description: `${updatedAsset.assetName} ${t('assetUpdatedSuccessDesc')}` });
  };
  
  const calculateNetEstate = () => {
    let totalInheritableValue = 0;
    userReviewedAssets.forEach(asset => {
      if (asset.classification === 'Inheritable' && asset.extractedValue) {
        totalInheritableValue += asset.extractedValue;
      }
    });
    
    const debts = debtsAmount || 0;
    const wasiyyah = wasiyyahAmount || 0;
    
    let netEstate = totalInheritableValue - debts;
    const maxWasiyyah = netEstate > 0 ? netEstate / 3 : 0;
    const appliedWasiyyah = Math.min(wasiyyah, maxWasiyyah);
    
    netEstate -= appliedWasiyyah;
    setNetEstateForFaraid(Math.max(0, netEstate));
    setStep('summary');
    console.log("Saving to Firestore (mock):", { userId: profile?.id, madhhab: selectedMadhhab, classifiedAssets: userReviewedAssets, netEstateForFaraid: Math.max(0,netEstate) });
    toast({title: t('estateSummaryCalculatedTitle'), description: t('estateSummaryCalculatedDesc')});
  };

  if (profileLoading) return <p>{t('loadingUserPreferences')}</p>;
   if (profile?.mode !== 'islamic') {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('accessDeniedTitle')}</AlertTitle>
            <AlertDescription>{t('islamicModeRequiredForWizard')}</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl flex items-center gap-2">
          <Wand2 className="h-7 w-7 text-primary" /> {t('islamicEstateWizardTitle')}
        </h1>
      </div>

       <Card className="shadow-md">
            <CardHeader>
                <CardTitle>{t('wizardStepTitle', { current: String(step === 'madhhab' ? 1 : step === 'scan' ? 2 : step === 'review' ? 3 : 4), total: "4" })} - {
                    step === 'madhhab' ? t('selectMadhhabTitle') :
                    step === 'scan' ? t('scanAssetsTitle') :
                    step === 'review' ? t('reviewClassifiedAssetsTitle') :
                    t('estateSummaryTitle')
                }</CardTitle>
                <CardDescription>
                    {
                        step === 'madhhab' ? t('madhhabSelectionDescWizard') :
                        step === 'scan' ? t('scanAssetsDesc') :
                        step === 'review' ? t('reviewClassifiedAssetsDesc') :
                        t('estateSummaryDesc')
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 'madhhab' && (
                    <div className="space-y-4">
                        <Select value={selectedMadhhab} onValueChange={(val) => setSelectedMadhhab(val as Madhhab)}>
                            <SelectTrigger className="w-full md:w-1/2">
                                <SelectValue placeholder={t('selectMadhhabPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hanafi">{t('madhhabHanafi')}</SelectItem>
                                <SelectItem value="maliki">{t('madhhabMaliki')}</SelectItem>
                                <SelectItem value="shafii">{t('madhhabShafii')}</SelectItem>
                                <SelectItem value="hanbali">{t('madhhabHanbali')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">{t('madhhabChoiceNoteWizard')}</p>
                        <Button onClick={handleMadhhabConfirm} disabled={!selectedMadhhab}>{t('confirmAndProceedButton')}</Button>
                    </div>
                )}

                {step === 'scan' && (
                    <div className="text-center space-y-4">
                        <p>{t('scanningInfoText', { madhhab: t(`madhhab${selectedMadhhab.charAt(0).toUpperCase() + selectedMadhhab.slice(1)}` as any) || selectedMadhhab })}</p>
                        {isScanning ? (
                            <>
                                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                                <Progress value={scanProgress} className="w-full" />
                                <p>{t('scanProgressText', { progress: scanProgress})}</p>
                            </>
                        ) : (
                            <Button onClick={startAssetScan} size="lg">
                                <RefreshCw className="mr-2 rtl:ml-2 h-5 w-5" /> {t('startScanButton')}
                            </Button>
                        )}
                         <Alert variant="default" className="text-left">
                            <Info className="h-4 w-4" />
                            <AlertTitle>{t('aiProcessNoteTitle')}</AlertTitle>
                            <AlertDescription>{t('aiProcessNoteDesc')}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {step === 'review' && (
                    <div className="space-y-4">
                        {userReviewedAssets.length === 0 ? (
                            <p>{t('noAssetsToReview')}</p>
                        ) : (
                            <ScrollArea className="max-h-[60vh]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('assetNameLabel')}</TableHead>
                                            <TableHead>{t('aiClassificationLabel')}</TableHead>
                                            <TableHead>{t('userClassificationLabel')}</TableHead>
                                            <TableHead>{t('extractedValueLabel')}</TableHead>
                                            <TableHead>{t('currencyLabel')}</TableHead>
                                            <TableHead>{t('reasonNotesLabel')}</TableHead>
                                            <TableHead>{t('actionsLabel')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {userReviewedAssets.map(asset => (
                                            <TableRow key={asset.assetId}>
                                                <TableCell>{asset.assetName}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        asset.classification === 'Inheritable' ? 'default' :
                                                        asset.classification === 'Excluded' ? 'secondary' : 'destructive'
                                                    }>{t(`assetClassification${asset.classification}` as any)}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Select 
                                                        value={asset.classification} 
                                                        onValueChange={(val) => handleClassificationReviewChange(asset.assetId, val as 'Inheritable' | 'Excluded' | 'NeedsReview')}
                                                    >
                                                        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Inheritable">{t('assetClassificationInheritable')}</SelectItem>
                                                            <SelectItem value="Excluded">{t('assetClassificationExcluded')}</SelectItem>
                                                            <SelectItem value="NeedsReview">{t('assetClassificationNeedsReview')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    {asset.extractedValue !== undefined ? asset.extractedValue.toLocaleString() : t('notApplicableShort')}
                                                </TableCell>
                                                <TableCell>{asset.currency || t('notApplicableShort')}</TableCell>
                                                <TableCell className="text-xs max-w-xs truncate" title={`${asset.reason} ${asset.details ? `(${asset.details})` : ''}`}>
                                                    {asset.reason} {asset.details && `(${asset.details})`}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => openEditAssetModal(asset)}>
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        )}
                         <div className="grid md:grid-cols-2 gap-4 pt-4">
                            <div>
                                <Label htmlFor="debtsAmountWizard">{t('debtsAmountLabel')}</Label>
                                <Input type="number" id="debtsAmountWizard" placeholder="0.00" value={debtsAmount || ''} onChange={(e) => setDebtsAmount(parseFloat(e.target.value) || undefined)} />
                            </div>
                            <div>
                                <Label htmlFor="wasiyyahAmountWizard">{t('wasiyyahAmountLabel')}</Label>
                                <Input type="number" id="wasiyyahAmountWizard" placeholder="0.00" value={wasiyyahAmount || ''} onChange={(e) => setWasiyyahAmount(parseFloat(e.target.value) || undefined)} />
                                <p className="text-xs text-muted-foreground mt-1">{t('wasiyyahNote')}</p>
                            </div>
                        </div>
                        <Button onClick={calculateNetEstate}>{t('confirmReviewAndProceedButton')}</Button>
                    </div>
                )}
                 {step === 'summary' && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>{t('finalEstateSummaryTitle')}</CardTitle></CardHeader>
                            <CardContent>
                                <p>{t('totalValueInheritableAssetsLabel')}: ${userReviewedAssets.filter(a=>a.classification === 'Inheritable').reduce((sum, a) => sum + (a.extractedValue || 0), 0).toFixed(2)}</p>
                                <p>{t('debtsAmountLabel')}: ${debtsAmount?.toFixed(2) || '0.00'}</p>
                                <p>{t('wasiyyahAmountLabel')}: ${wasiyyahAmount?.toFixed(2) || '0.00'}</p>
                                <p className="font-semibold mt-2">{t('netEstateForFaraidLabel')}: ${netEstateForFaraid?.toFixed(2) || '0.00'}</p>
                            </CardContent>
                        </Card>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep('review')}>{t('backToReviewButton')}</Button>
                            {/* TODO: Link to Faraid calculator, potentially pre-filling amount */}
                            <Button onClick={() => toast({title: t('goToFaraidCalculatorButton'), description: t('featureComingSoonTitle')}) }>{t('proceedToFaraidCalculatorButton')}</Button>
                        </div>
                        <Button variant="link" onClick={() => toast({title: "Download Summary", description: t('featureComingSoonTitle')})}>{t('downloadSummaryButton')}</Button>
                    </div>
                )}

            </CardContent>
            <CardFooter>
                <Alert variant="default" className="bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-700 dark:text-amber-400">
                    <Info className="h-4 w-4 !text-amber-600 dark:!text-amber-300" />
                    <AlertTitle className="!text-amber-700 dark:!text-amber-300">{t('wizardDisclaimerTitle')}</AlertTitle>
                    <AlertDescription>{t('wizardDisclaimerContent')}</AlertDescription>
                </Alert>
            </CardFooter>
       </Card>

       {/* Edit Asset Dialog */}
       <Dialog open={isEditAssetModalOpen} onOpenChange={(isOpen) => {
           if (!isOpen) {
               setAssetToEdit(null);
               setCurrentEditFormAsset(initialEditFormData);
           }
           setIsEditAssetModalOpen(isOpen);
       }}>
           <DialogContent className="sm:max-w-lg">
               <DialogHeader>
                   <DialogTitle>{t('editAssetTitle')}: {assetToEdit?.assetName}</DialogTitle>
                   <DialogDescription>{t('editAssetDescModal')}</DialogDescription>
               </DialogHeader>
               <ScrollArea className="max-h-[60vh] pr-4 -mr-4">
                <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="editAssetName">{t('assetNameLabel')}</Label>
                        <Input 
                            id="editAssetName" 
                            value={currentEditFormAsset.assetName} 
                            onChange={(e) => setCurrentEditFormAsset(prev => ({...prev, assetName: e.target.value}))} 
                            placeholder={t('assetNamePlaceholderModal')}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="editAssetClassification">{t('userClassificationLabel')}</Label>
                        <Select 
                            value={currentEditFormAsset.classification} 
                            onValueChange={(val) => setCurrentEditFormAsset(prev => ({...prev, classification: val as 'Inheritable' | 'Excluded' | 'NeedsReview'}))}
                        >
                            <SelectTrigger id="editAssetClassification"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Inheritable">{t('assetClassificationInheritable')}</SelectItem>
                                <SelectItem value="Excluded">{t('assetClassificationExcluded')}</SelectItem>
                                <SelectItem value="NeedsReview">{t('assetClassificationNeedsReview')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="editAssetValue">{t('extractedValueLabel')}</Label>
                            <Input 
                                id="editAssetValue" 
                                type="number"
                                value={currentEditFormAsset.extractedValue ?? ''} 
                                onChange={(e) => setCurrentEditFormAsset(prev => ({...prev, extractedValue: parseFloat(e.target.value) || undefined}))} 
                                placeholder={t('valuePlaceholder')}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="editAssetCurrency">{t('currencyLabel')}</Label>
                            <Input 
                                id="editAssetCurrency" 
                                value={currentEditFormAsset.currency ?? ''} 
                                onChange={(e) => setCurrentEditFormAsset(prev => ({...prev, currency: e.target.value || undefined}))} 
                                placeholder={t('currencyPlaceholderModal')}
                            />
                        </div>
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="editAssetReason">{t('reasonForClassificationLabelModal')}</Label>
                        <Textarea
                            id="editAssetReason" 
                            value={currentEditFormAsset.reason} 
                            onChange={(e) => setCurrentEditFormAsset(prev => ({...prev, reason: e.target.value}))} 
                            placeholder={t('reasonPlaceholderModal')}
                            rows={3}
                        />
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="editAssetDetails">{t('additionalDetailsLabelModal')}</Label>
                        <Textarea
                            id="editAssetDetails" 
                            value={currentEditFormAsset.details ?? ''} 
                            onChange={(e) => setCurrentEditFormAsset(prev => ({...prev, details: e.target.value || undefined}))} 
                            placeholder={t('detailsPlaceholderModal')}
                            rows={3}
                        />
                    </div>
                </div>
               </ScrollArea>
               <DialogFooter>
                   <Button variant="outline" onClick={() => setIsEditAssetModalOpen(false)}>{t('cancelButton')}</Button>
                   <Button onClick={handleSaveAssetChanges}>{t('saveChangesButton')}</Button>
               </DialogFooter>
           </DialogContent>
       </Dialog>

    </div>
  );
}

