
"use client";

import type React from 'react';
import { useState, useEffect, use } from 'react'; // Added use
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTranslation } from '@/locales/client';
import type { LocaleTypes } from '@/locales/settings';
import type { RegisteredAsset, AssetCategoryKey, Beneficiary, FileVisibility } from '@/types';
import { assetCategoryKeys } from '@/types';
import { handleRegisterAsset } from './actions'; 

import { DollarSign, Home, ShieldAlert as InsuranceIcon, FileText as LegalIcon, Globe, Gem, FolderPlus, Info, UploadCloud, Users as BeneficiariesIcon } from 'lucide-react';
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
};


export default function RegisterAssetsPage({ params }: { params: { lng: LocaleTypes }}) {
  const resolvedParams = use(params);
  const lng = resolvedParams.lng;
  
  const { t } = useTranslation(lng, 'translation');
  const { profile } = useUserPreferences();
  const { toast } = useToast();

  const [registeredAssets, setRegisteredAssets] = useState<RegisteredAsset[]>([]);
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<AssetCategoryKey | null>(null);
  const [assetFormData, setAssetFormData] = useState(initialAssetFormState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const availableBeneficiaries = MOCK_BENEFICIARIES; // Use mocked beneficiaries

  const completedCategoriesCount = new Set(registeredAssets.map(asset => asset.categoryKey)).size;
  const totalCategories = assetCategoryKeys.length;

  const handleOpenAssetForm = (category: AssetCategoryKey) => {
    setCurrentCategory(category);
    setAssetFormData(initialAssetFormState);
    setSelectedFile(null);
    setFilePreview(null);
    setIsAssetFormOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAssetFormData(prev => ({ ...prev, fileName: file.name, fileType: file.type, fileSize: file.size }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
        setAssetFormData(prev => ({ ...prev, fileDataUri: reader.result as string}));
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setFilePreview(null);
      setAssetFormData(prev => ({ ...prev, fileName: '', fileType: '', fileSize:0, fileDataUri: undefined }));
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
     if (assetFormData.visibility === 'sharedImmediately' && (!assetFormData.beneficiaryIds || assetFormData.beneficiaryIds.length === 0)) {
      toast({ title: t('errorText'), description: t('beneficiarySelectionRequiredError'), variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const newAssetData = {
        userId: profile.id,
        categoryKey: currentCategory,
        assetDescription: assetFormData.assetDescription,
        fileName: selectedFile?.name,
        fileType: selectedFile?.type,
        fileSize: selectedFile?.size,
        fileDataUri: assetFormData.fileDataUri, // Pass data URI for server action to handle
        beneficiaryIds: assetFormData.visibility === 'sharedImmediately' ? assetFormData.beneficiaryIds : [],
        visibility: assetFormData.visibility,
      };
      
      // Server action will handle actual file upload to storage and saving metadata to Firestore
      const result = await handleRegisterAsset(newAssetData);

      if (result.success && result.asset) {
        setRegisteredAssets(prev => [...prev, result.asset!]);
        toast({ title: t('assetRegisteredSuccessTitle'), description: `${result.asset!.assetDescription} ${t('assetRegisteredSuccessDesc')}` });
        setIsAssetFormOpen(false);
      } else {
        throw new Error(result.error || t('unknownError'));
      }
    } catch (error: any) {
      toast({ title: t('errorText'), description: error.message || t('assetRegistrationFailedError'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {assetsInThisCategory.map(asset => (
                          <li key={asset.id} className="text-muted-foreground">
                            {asset.assetDescription} {asset.fileName && `(${asset.fileName})`}
                            {/* TODO: Add Edit/Delete buttons here */}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button onClick={() => handleOpenAssetForm(catKey)} className="mt-4">
                    <FolderPlus className="mr-2 h-4 w-4" /> {t('addAssetToCategory', { categoryName: t(details.titleKey) })}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Dialog open={isAssetFormOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setIsAssetFormOpen(false);
          setCurrentCategory(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('registerNewAssetTitle')} {currentCategory && `- ${t(categoryDetails[currentCategory].titleKey)}`}</DialogTitle>
            <DialogDescription>{t('registerNewAssetDesc')}</DialogDescription>
          </DialogHeader>
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
              <Label htmlFor="fileUpload">{t('attachFileOptionalLabel')}</Label>
              <Input id="fileUpload" type="file" onChange={handleFileChange} />
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
                  <Label htmlFor="asset-vis-onDeath" className="font-normal">{t('releaseUponDeath')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sharedImmediately" id="asset-vis-specific" />
                  <Label htmlFor="asset-vis-specific" className="font-normal">{t('shareWithSpecificBeneficiaries')}</Label>
                </div>
              </RadioGroup>
            </div>

            {assetFormData.visibility === 'sharedImmediately' && (
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssetFormOpen(false)} disabled={isSubmitting}>{t('cancelButton')}</Button>
            <Button onClick={handleSubmitAsset} disabled={isSubmitting}>
              {isSubmitting ? t('savingButton') : (selectedFile ? t('saveAssetAndUploadFileButton') : t('saveAssetButton'))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

