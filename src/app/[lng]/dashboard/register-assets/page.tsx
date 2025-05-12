"use client";

import type React from 'react';
import { useState, useEffect, use, useRef } from 'react'; // Added use, useRef
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from "@/components/ui/badge"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTranslation } from '@/locales/client';
import type { LocaleTypes } from '@/locales/settings';
import type { RegisteredAsset, AssetCategoryKey, Beneficiary, FileVisibility } from '@/types';
import { assetCategoryKeys } from '@/types';
import { handleRegisterAsset, updateRegisteredAsset } from './actions'; // Added updateRegisteredAsset

import { DollarSign, Home, ShieldAlert as InsuranceIcon, FileText as LegalIcon, Globe, Gem, FolderPlus, Info, UploadCloud, Users as BeneficiariesIcon, Eye, Edit3, Trash2 } from 'lucide-react'; // Added Edit3, Trash2
import Image from 'next/image';


// MOCK Beneficiaries - In a real app, this would come from context or be fetched from MyFilesPage
const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: 'ben1', name: 'Alice Wonderland', email: 'alice@example.com' },
  { id: 'ben2', name: 'Bob The Builder', email: 'bob@example.com' },
  { id: 'ben3', name: 'Charlie Brown', email: 'charlie@example.com' },
];

const categoryDetails: Record<AssetCategoryKey, { titleKey: string; descriptionKey: string; examplesKey: string; importanceKey: string; icon: React.ElementType }> = {
  financial: { titleKey: "assetCatFinancialTitle", descriptionKey: "assetCatFinancialDesc", examplesKey: "assetCatFinancialEx", importanceKey: "assetCatFinancialImp", icon: DollarSign },
  property_vehicles: { titleKey: "assetCatPropertyTitle", descriptionKey: "assetCatPropertyDesc", examplesKey: "assetCatPropertyEx", importanceKey: "assetCatPropertyImp", icon: Home },
  insurance: { titleKey: "assetCatInsuranceTitle", descriptionKey: "assetCatInsuranceDesc", examplesKey: "assetCatInsuranceEx", importanceKey: "assetCatInsuranceImp", icon: InsuranceIcon },
  legal: { titleKey: "assetCatLegalTitle", descriptionKey: "assetCatLegalDesc", examplesKey: "assetCatLegalEx", importanceKey: "assetCatLegalImp", icon: LegalIcon },
  digital: { titleKey: "assetCatDigitalTitle", descriptionKey: "assetCatDigitalDesc", examplesKey: "assetCatDigitalEx", importanceKey: "assetCatDigitalImp", icon: Globe },
  personal_items: { titleKey: "assetCatPersonalTitle", descriptionKey: "assetCatPersonalDesc", examplesKey: "assetCatPersonalEx", importanceKey: "assetCatPersonalImp", icon: Gem },
};

const initialAssetFormState = {
  assetDescription: '',
  fileName: '',
  fileType: '',
  fileSize: 0,
  fileDataUri: undefined as string | undefined,
  beneficiaryIds: [] as string[],
  visibility: 'private' as FileVisibility,
  estimatedUSDValue: undefined as number | undefined,
};


export default function RegisterAssetsPage({ params }: { params: { lng: LocaleTypes }}) {
  const resolvedParams = use(params);
  const lng = resolvedParams.lng;
  
  const { t } = useTranslation(lng, 'translation');
  const { profile } = useUserPreferences();
  const { toast } = useToast();

  const [registeredAssets, setRegisteredAssets] = useState<RegisteredAsset[]>([]);
  const [isAddAssetFormOpen, setIsAddAssetFormOpen] = useState(false);
  const [isEditAssetFormOpen, setIsEditAssetFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<RegisteredAsset | null>(null);
  const [currentCategory, setCurrentCategory] = useState<AssetCategoryKey | null>(null);
  const [assetFormData, setAssetFormData] = useState(initialAssetFormState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const availableBeneficiaries = MOCK_BENEFICIARIES; // Use mocked beneficiaries

  const completedCategoriesCount = new Set(registeredAssets.map(asset => asset.categoryKey)).size;
  const totalCategories = assetCategoryKeys.length;

  const resetAddFormDialog = () => {
    setIsAddAssetFormOpen(false);
    setCurrentCategory(null);
    setAssetFormData(initialAssetFormState);
    setSelectedFile(null);
    setFilePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const resetEditFormDialog = () => {
    setIsEditAssetFormOpen(false);
    setEditingAsset(null);
    setAssetFormData(initialAssetFormState);
    setSelectedFile(null);
    setFilePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleOpenAddAssetForm = (category: AssetCategoryKey) => {
    setCurrentCategory(category);
    setAssetFormData(initialAssetFormState);
    setSelectedFile(null);
    setFilePreview(null);
    setIsAddAssetFormOpen(true);
  };

  const handleOpenEditAssetForm = (asset: RegisteredAsset) => {
    setEditingAsset(asset);
    setCurrentCategory(asset.categoryKey); // Keep track of category for context if needed
    setAssetFormData({
        assetDescription: asset.assetDescription,
        fileName: asset.fileName || '',
        fileType: asset.fileType || '',
        fileSize: asset.fileSize || 0,
        fileDataUri: asset.fileDataUri, // Keep existing file data URI
        beneficiaryIds: asset.beneficiaryIds || [],
        visibility: asset.visibility,
        estimatedUSDValue: asset.estimatedUSDValue
    });
    setSelectedFile(null); // Reset selected file input for edit
    setFilePreview(asset.fileDataUri && asset.fileType?.startsWith('image/') ? asset.fileDataUri : null);
    setIsEditAssetFormOpen(true);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAssetFormData(prev => ({ ...prev, fileName: file.name, fileType: file.type, fileSize: file.size }));
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFilePreview(file.type.startsWith('image/') ? result : null);
        setAssetFormData(prev => ({ ...prev, fileDataUri: result}));
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected (e.g., user clears the input) during edit, 
      // retain existing file info unless user explicitly removes it.
      // For now, simply clearing selectedFile and preview is enough.
      // Actual removal of file would be a separate action.
      setSelectedFile(null);
      setFilePreview(null);
      if (!editingAsset) { // Only clear fileDataUri if not editing an existing asset with a file
        setAssetFormData(prev => ({ ...prev, fileDataUri: undefined }));
      }
    }
  };
  
  const handleBeneficiarySelection = (beneficiaryId: string, checked: boolean) => {
    setAssetFormData(prev => ({
      ...prev,
      beneficiaryIds: checked
        ? [...(prev.beneficiaryIds || []), beneficiaryId]
        : (prev.beneficiaryIds || []).filter(id => id !== beneficiaryId),
    }));
  };


  const handleSubmitAsset = async () => {
    if (!currentCategory || !profile?.id) {
      toast({ title: t('errorText'), description: t('categoryOrProfileMissingError'), variant: "destructive" });
      return;
    }
    if (!assetFormData.assetDescription) {
      toast({ title: t('errorText'), description: t('assetDescriptionRequiredError'), variant: "destructive" });
      return;
    }
     if ((assetFormData.visibility === 'sharedImmediately' || assetFormData.visibility === 'releaseOnDeath') && (!assetFormData.beneficiaryIds || assetFormData.beneficiaryIds.length === 0)) {
      toast({ title: t('errorText'), description: t('beneficiarySelectionRequiredError'), variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const newAssetData = {
        userId: profile.id,
        categoryKey: currentCategory,
        assetDescription: assetFormData.assetDescription,
        fileName: selectedFile?.name || assetFormData.fileName, // Use new file name if selected, else existing
        fileType: selectedFile?.type || assetFormData.fileType,
        fileSize: selectedFile?.size || assetFormData.fileSize,
        fileDataUri: assetFormData.fileDataUri, // This will be new data URI if new file, or existing if no new file
        beneficiaryIds: (assetFormData.visibility === 'sharedImmediately' || assetFormData.visibility === 'releaseOnDeath') ? assetFormData.beneficiaryIds : [],
        visibility: assetFormData.visibility,
        estimatedUSDValue: assetFormData.estimatedUSDValue,
      };
      
      let result;
      if (editingAsset) {
        result = await updateRegisteredAsset({ ...editingAsset, ...newAssetData });
      } else {
        result = await handleRegisterAsset(newAssetData);
      }


      if (result.success && result.asset) {
        if (editingAsset) {
            setRegisteredAssets(prev => prev.map(a => a.id === result.asset!.id ? result.asset! : a));
            toast({ title: t('assetUpdatedSuccessTitle'), description: `${result.asset!.assetDescription} ${t('assetUpdatedSuccessDesc')}`});
        } else {
            setRegisteredAssets(prev => [...prev, result.asset!]);
            toast({ title: t('assetRegisteredSuccessTitle'), description: `${result.asset!.assetDescription} ${t('assetRegisteredSuccessDesc')}` });
        }
        resetAddFormDialog();
        resetEditFormDialog();
      } else {
        throw new Error(result.error || t('unknownError'));
      }
    } catch (error: any) {
      toast({ title: t('errorText'), description: error.message || t('assetRegistrationFailedError'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    // TODO: Implement server-side deletion
    setRegisteredAssets(prev => prev.filter(asset => asset.id !== assetId));
    toast({ title: t('assetDeletedTitle'), description: t('assetDeletedDesc') });
  };

  const AssetFormFields = () => (
    <div className="grid gap-4 py-4">
        <div className="space-y-1.5">
        <Label htmlFor="assetDescription">{t('assetDescriptionLabel')}</Label>
        <Textarea
            id="assetDescription"
            value={assetFormData.assetDescription}
            onChange={(e) => setAssetFormData(prev => ({ ...prev, assetDescription: e.target.value }))}
            placeholder={t('assetDescriptionPlaceholder')}
        />
        </div>

        <div className="space-y-1.5">
        <Label htmlFor="estimatedUSDValueAsset">Estimated USD Value (Optional)</Label>
        <div className="relative">
            <DollarSign className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
            id="estimatedUSDValueAsset" 
            type="number" 
            placeholder="e.g., 1000" 
            value={assetFormData.estimatedUSDValue === undefined ? '' : assetFormData.estimatedUSDValue} 
            onChange={(e) => setAssetFormData(prev => ({...prev, estimatedUSDValue: e.target.value ? parseFloat(e.target.value) : undefined}))}
            className="pl-8 rtl:pr-8 rtl:pl-3"
            />
        </div>
        </div>

        <div className="space-y-1.5">
        <Label htmlFor="fileUpload">{editingAsset && assetFormData.fileName ? t('replaceFileOptionalLabel') : t('attachFileOptionalLabel')}</Label>
        {editingAsset && assetFormData.fileName && !selectedFile && (
             <p className="text-sm text-muted-foreground">Current file: {assetFormData.fileName} ({(assetFormData.fileSize || 0 / 1024).toFixed(2)} KB)</p>
        )}
        <Input id="fileUpload" type="file" onChange={handleFileChange} ref={fileInputRef} />
        {filePreview && selectedFile?.type.startsWith('image/') && (
            <div className="mt-2">
            <Image src={filePreview} alt={t('selectedFilePreviewAlt')} width={100} height={100} className="rounded-md object-contain max-h-24" data-ai-hint="file preview" />
            </div>
        )}
        {selectedFile && !selectedFile.type.startsWith('image/') && (
            <p className="text-xs text-muted-foreground mt-1">{t('previewNotAvailableForType', {fileName: selectedFile.name})}</p>
        )}
        </div>

        <div className="space-y-2">
        <Label>{t('visibility')}</Label>
        <RadioGroup 
            value={assetFormData.visibility} 
            onValueChange={(val) => setAssetFormData(prev => ({...prev, visibility: val as FileVisibility}))}
        >
            <div className="flex items-center space-x-2">
            <RadioGroupItem value="private" id="asset-vis-private" />
            <Label htmlFor="asset-vis-private" className="font-normal">{t('keepPrivate')}</Label>
            </div>
            <div className="flex items-center space-x-2">
            <RadioGroupItem value="releaseOnDeath" id="asset-vis-onDeath" />
            <Label htmlFor="asset-vis-onDeath" className="font-normal">{t('releaseUponDeathSpecific')}</Label>
            </div>
            <div className="flex items-center space-x-2">
            <RadioGroupItem value="sharedImmediately" id="asset-vis-specific" />
            <Label htmlFor="asset-vis-specific" className="font-normal">{t('shareWithSpecificBeneficiaries')}</Label>
            </div>
        </RadioGroup>
        </div>

        {(assetFormData.visibility === 'sharedImmediately' || assetFormData.visibility === 'releaseOnDeath') && (
        <div className="space-y-2 pl-2 border-l-2 ml-2">
            <Label>{t('selectBeneficiariesToShareWith')}</Label>
            {availableBeneficiaries.length > 0 ? (
            <ScrollArea className="h-32">
                {availableBeneficiaries.map(ben => (
                <div key={ben.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                    id={`ben-asset-${ben.id}`}
                    checked={(assetFormData.beneficiaryIds || []).includes(ben.id)}
                    onCheckedChange={(checked) => handleBeneficiarySelection(ben.id, !!checked)}
                    />
                    <Label htmlFor={`ben-asset-${ben.id}`} className="font-normal">{ben.name}</Label>
                </div>
                ))}
            </ScrollArea>
            ) : (
            <p className="text-sm text-muted-foreground">{t('noBeneficiariesYet')}</p>
            )}
        </div>
        )}
    </div>
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold md:text-3xl flex items-center gap-2">
          <FolderPlus className="h-7 w-7 text-primary" /> {t('registerAssetsTitle')}
        </h1>
      </div>

      <Alert className="border-primary/50 bg-primary/5 dark:bg-primary/20">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary">{t('secureStorageNoticeTitle')}</AlertTitle>
        <AlertDescription>{t('secureStorageNoticeDesc')}</AlertDescription>
      </Alert>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{t('assetRegistrationProgress')}</CardTitle>
          <CardDescription>{t('assetCategoriesCompleted', { count: completedCategoriesCount, total: totalCategories })}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(completedCategoriesCount / totalCategories) * 100} className="w-full" />
        </CardContent>
      </Card>

      <Accordion type="multiple" className="w-full space-y-3">
        {assetCategoryKeys.map((catKey) => {
          const details = categoryDetails[catKey];
          const IconComponent = details.icon;
          const assetsInThisCategory = registeredAssets.filter(asset => asset.categoryKey === catKey);
          return (
            <AccordionItem value={catKey} key={catKey} className="border bg-card rounded-lg shadow-sm">
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-lg">{t(details.titleKey)}</span>
                  {assetsInThisCategory.length > 0 && (
                    <Badge variant="secondary">{assetsInThisCategory.length}</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground italic">{t(details.descriptionKey)}</p>
                  <div>
                    <h4 className="font-medium mb-1">{t('examplesTitle')}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{t(details.examplesKey)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t('importanceTitle')}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{t(details.importanceKey)}</p>
                  </div>

                  {assetsInThisCategory.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium">{t('registeredAssetsInCategory')}</h4>
                      <ul className="space-y-1">
                        {assetsInThisCategory.map(asset => (
                          <li key={asset.id} className="text-sm">
                            <Button 
                                variant="link" 
                                className="p-0 h-auto text-left text-muted-foreground hover:text-primary"
                                onClick={() => handleOpenEditAssetForm(asset)}
                            >
                                {asset.assetDescription} {asset.fileName && `(${asset.fileName})`}
                                {asset.estimatedUSDValue !== undefined && <span className="text-xs italic ml-1 rtl:mr-1">(Est. Value: ${asset.estimatedUSDValue.toLocaleString()})</span>}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button onClick={() => handleOpenAddAssetForm(catKey)} className="mt-4">
                    <FolderPlus className="mr-2 h-4 w-4" /> {t('addAssetToCategory', { categoryName: t(details.titleKey) })}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Add Asset Dialog */}
      <Dialog open={isAddAssetFormOpen} onOpenChange={(isOpen) => { if (!isOpen) resetAddFormDialog(); else setIsAddAssetFormOpen(true); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('registerNewAssetTitle')} {currentCategory && `- ${t(categoryDetails[currentCategory].titleKey)}`}</DialogTitle>
            <DialogDescription>{t('registerNewAssetDesc')}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-6 -mr-6">
            <AssetFormFields />
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={resetAddFormDialog} disabled={isSubmitting}>{t('cancelButton')}</Button>
            <Button onClick={handleSubmitAsset} disabled={isSubmitting}>
              {isSubmitting ? t('savingButton') : (selectedFile ? t('saveAssetAndUploadFileButton') : t('saveAssetButton'))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog open={isEditAssetFormOpen} onOpenChange={(isOpen) => { if (!isOpen) resetEditFormDialog(); else setIsEditAssetFormOpen(true); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('editAssetDialogTitle')} {editingAsset?.assetDescription}</DialogTitle>
            <DialogDescription>{t('editAssetDialogDesc')}</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="w-full flex-grow flex flex-col overflow-hidden">
            <TabsList className="mb-2">
              <TabsTrigger value="details">{t('detailsTabTitle')}</TabsTrigger>
              <TabsTrigger value="audit">{t('auditTrailTabTitle')}</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="flex-grow overflow-y-auto pr-2 -mr-2">
              <ScrollArea className="h-full"> {/* Make ScrollArea occupy the content space */}
                <AssetFormFields />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="audit" className="flex-grow overflow-y-auto pr-2 -mr-2">
                <ScrollArea className="h-full">
                    <div className="p-4">
                        <p className="text-sm text-muted-foreground">{t('auditTrailPlaceholder')}</p>
                        {/* Placeholder for Openchain integration content */}
                        <div className="mt-4 border rounded-md p-4 bg-secondary/50">
                            <h4 className="font-medium">Openchain Integration</h4>
                            <p className="text-xs text-muted-foreground">Audit trail data from Openchain would be displayed here, showing a history of changes and verifications for this asset.</p>
                        </div>
                    </div>
                </ScrollArea>
            </TabsContent>
          </Tabs>
          <DialogFooter className="pt-4 border-t mt-auto">
            <div className="flex justify-between w-full">
                <Button 
                    variant="destructive" 
                    onClick={() => editingAsset && handleDeleteAsset(editingAsset.id)} 
                    disabled={isSubmitting || !editingAsset}
                    className="mr-auto rtl:ml-auto rtl:mr-0"
                >
                    <Trash2 className="mr-2 h-4 w-4" /> {t('deleteAssetButton')}
                </Button>
                <div>
                    <Button variant="outline" onClick={resetEditFormDialog} disabled={isSubmitting} className="mr-2 rtl:ml-2">{t('cancelButton')}</Button>
                    <Button onClick={handleSubmitAsset} disabled={isSubmitting}>
                    {isSubmitting ? t('savingButton') : t('saveChangesButton')}
                    </Button>
                </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
