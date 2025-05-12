
"use client";

import type React from 'react';
import { useState, useEffect, use } from 'react';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useTranslation } from '@/locales/client';
import type { LocaleTypes, Madhhab, InheritanceInput, InheritanceCalculationOutput, HeirShare, MaritalStatus, Gender } from '@/locales/settings'; // Assuming types are also in settings or a common types file
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import { calculateInheritanceShares } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Landmark, Calculator, Info, Users, BarChart3, FileDown, Save, AlertTriangle } from 'lucide-react';
import { QuranicVerse } from '@/components/QuranicVerse'; // Added import

const QURAN_VERSE_FARAID_CHILDREN = "يُوصِيكُمُ ٱللَّهُ فِىٓ أَوْلَٰدِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ ٱلْأُنثَيَيْنِ"; // An-Nisa 4:11 (part of it)
const QURAN_VERSE_FARAID_CHILDREN_CITATION = "سورة النساء: ١١";


const initialFormData: Omit<InheritanceInput, 'userId' | 'madhhab'> = {
  maritalStatus: 'never_married',
  hasSpouse: false,
  spouseGender: undefined,
  sons: 0,
  daughters: 0,
  fatherAlive: false,
  motherAlive: false,
  paternalGrandfatherAlive: false,
  paternalGrandmotherAlive: false,
  maternalGrandfatherAlive: false,
  maternalGrandmotherAlive: false,
  fullBrothers: 0,
  fullSisters: 0,
  paternalHalfBrothers: 0,
  paternalHalfSisters: 0,
  maternalHalfBrothers: 0,
  maternalHalfSisters: 0,
  wasiyyahAmount: undefined,
  debtsAmount: undefined,
};

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#FFC658'];


export default function FaraidCalculatorPage({ params }: { params: { lng: LocaleTypes }}) {
  const resolvedParams = use(params);
  const lng = resolvedParams.lng;
  const { t } = useTranslation(lng, "translation");
  const { profile, updateProfileField, isLoading: profileLoading } = useUserPreferences();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Omit<InheritanceInput, 'userId' | 'madhhab'>>(initialFormData);
  const [selectedMadhhab, setSelectedMadhhab] = useState<Madhhab>(profile?.islamicPreferences?.madhhab || '');
  const [calculationResult, setCalculationResult] = useState<InheritanceCalculationOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (profile?.islamicPreferences?.madhhab) {
      setSelectedMadhhab(profile.islamicPreferences.madhhab);
    }
  }, [profile]);

  const handleMadhhabChange = (value: string) => {
    const newMadhhab = value as Madhhab;
    setSelectedMadhhab(newMadhhab);
    updateProfileField({ islamicPreferences: { ...(profile?.islamicPreferences || {}), madhhab: newMadhhab } });
    setCalculationResult(null); // Reset results when madhhab changes
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value)
    }));
  };
  
  const handleSelectChange = (name: keyof typeof formData, value: string) => {
     setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleCalculate = async () => {
    if (!profile?.id) {
      toast({ title: t('errorText'), description: t('userNotLoggedInError'), variant: "destructive" });
      return;
    }
    if (!selectedMadhhab) {
      toast({ title: t('errorText'), description: t('madhhabSelectionRequiredError'), variant: "destructive" });
      return;
    }

    setIsCalculating(true);
    setCalculationResult(null);
    try {
      const input: InheritanceInput = {
        ...formData,
        userId: profile.id,
        madhhab: selectedMadhhab,
        sons: Number(formData.sons) || 0, // Ensure numbers are numbers
        daughters: Number(formData.daughters) || 0,
        fullBrothers: Number(formData.fullBrothers) || 0,
        fullSisters: Number(formData.fullSisters) || 0,
        paternalHalfBrothers: Number(formData.paternalHalfBrothers) || 0,
        paternalHalfSisters: Number(formData.paternalHalfSisters) || 0,
        maternalHalfBrothers: Number(formData.maternalHalfBrothers) || 0,
        maternalHalfSisters: Number(formData.maternalHalfSisters) || 0,
        wasiyyahAmount: formData.wasiyyahAmount ? Number(formData.wasiyyahAmount) : undefined,
        debtsAmount: formData.debtsAmount ? Number(formData.debtsAmount) : undefined,
      };
      const result = await calculateInheritanceShares(input);
      setCalculationResult(result);
      if (result.errors && result.errors.length > 0) {
        toast({ title: t('calculationErrorTitle'), description: result.errors.join(', '), variant: "destructive" });
      } else {
        toast({ title: t('calculationSuccessTitle'), description: t('calculationSuccessDesc') });
      }
    } catch (error: any) {
      toast({ title: t('errorText'), description: error.message || t('calculationFailedError'), variant: "destructive" });
    } finally {
      setIsCalculating(false);
    }
  };
  
  const chartData = calculationResult?.heirs
  .filter(h => !h.isBlocked && h.sharePercentage > 0)
  .map(h => ({ name: t(h.heirKey) || h.heirName, value: h.sharePercentage })) || [];


  if (profileLoading) return <p>{t('loadingUserPreferences')}</p>;
  if (profile?.mode !== 'islamic') {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('accessDeniedTitle')}</AlertTitle>
            <AlertDescription>{t('islamicModeRequiredForCalculator')}</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl flex items-center gap-2">
          <Calculator className="h-7 w-7 text-primary" /> {t('faraidCalculatorTitle')}
        </h1>
      </div>
      <QuranicVerse verse={QURAN_VERSE_FARAID_CHILDREN} citation={QURAN_VERSE_FARAID_CHILDREN_CITATION} />
       <Card className="shadow-md">
        <CardHeader>
            <CardTitle>{t('selectMadhhabTitle')}</CardTitle>
            <CardDescription>{t('madhhabSelectionDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
             <Select value={selectedMadhhab} onValueChange={handleMadhhabChange}>
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
            <p className="text-xs text-muted-foreground mt-2">{t('madhhabChoiceNote')}</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{t('heirInformationTitle')}</CardTitle>
          <CardDescription>{t('heirInformationDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Marital Status and Spouse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="maritalStatus">{t('maritalStatusLabel')}</Label>
              <Select name="maritalStatus" value={formData.maritalStatus} onValueChange={(val) => handleSelectChange('maritalStatus', val as MaritalStatus)}>
                <SelectTrigger id="maritalStatus"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="married">{t('maritalStatusMarried')}</SelectItem>
                  <SelectItem value="widowed">{t('maritalStatusWidowed')}</SelectItem>
                  <SelectItem value="divorced">{t('maritalStatusDivorced')}</SelectItem>
                  <SelectItem value="never_married">{t('maritalStatusNeverMarried')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox id="hasSpouse" name="hasSpouse" checked={formData.hasSpouse} onCheckedChange={(checked) => setFormData(prev => ({...prev, hasSpouse: !!checked, spouseGender: !!checked ? prev.spouseGender : undefined}))} />
                    <Label htmlFor="hasSpouse">{t('hasSpouseLabel')}</Label>
                </div>
            </div>
          </div>
            {formData.hasSpouse && (
                 <div>
                    <Label htmlFor="spouseGender">{t('spouseGenderLabel')}</Label>
                    <Select name="spouseGender" value={formData.spouseGender || ''} onValueChange={(val) => handleSelectChange('spouseGender', val as Gender)}>
                        <SelectTrigger id="spouseGender"><SelectValue placeholder={t('selectGenderPlaceholder')} /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="male">{t('genderMale')}</SelectItem>
                        <SelectItem value="female">{t('genderFemale')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

          {/* Children */}
          <Label className="font-medium block pt-2">{t('childrenLabel')}</Label>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="sons">{t('sonsLabel')}</Label><Input type="number" id="sons" name="sons" min="0" value={formData.sons} onChange={handleInputChange} /></div>
            <div><Label htmlFor="daughters">{t('daughtersLabel')}</Label><Input type="number" id="daughters" name="daughters" min="0" value={formData.daughters} onChange={handleInputChange} /></div>
          </div>

          {/* Parents & Grandparents */}
          <Label className="font-medium block pt-2">{t('parentsGrandparentsLabel')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
            {[ 'fatherAlive', 'motherAlive', 'paternalGrandfatherAlive', 'paternalGrandmotherAlive', 'maternalGrandfatherAlive', 'maternalGrandmotherAlive'].map(key => (
                 <div key={key} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox id={key} name={key} checked={!!formData[key as keyof typeof formData]} onCheckedChange={(checked) => setFormData(prev => ({...prev, [key]: !!checked}))} />
                    <Label htmlFor={key}>{t(`${key}Label`)}</Label>
                </div>
            ))}
          </div>

          {/* Siblings */}
          <Label className="font-medium block pt-2">{t('siblingsLabel')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><Label htmlFor="fullBrothers">{t('fullBrothersLabel')}</Label><Input type="number" id="fullBrothers" name="fullBrothers" min="0" value={formData.fullBrothers} onChange={handleInputChange} /></div>
            <div><Label htmlFor="fullSisters">{t('fullSistersLabel')}</Label><Input type="number" id="fullSisters" name="fullSisters" min="0" value={formData.fullSisters} onChange={handleInputChange} /></div>
            <div><Label htmlFor="paternalHalfBrothers">{t('paternalHalfBrothersLabel')}</Label><Input type="number" id="paternalHalfBrothers" name="paternalHalfBrothers" min="0" value={formData.paternalHalfBrothers} onChange={handleInputChange} /></div>
            <div><Label htmlFor="paternalHalfSisters">{t('paternalHalfSistersLabel')}</Label><Input type="number" id="paternalHalfSisters" name="paternalHalfSisters" min="0" value={formData.paternalHalfSisters} onChange={handleInputChange} /></div>
            <div><Label htmlFor="maternalHalfBrothers">{t('maternalHalfBrothersLabel')}</Label><Input type="number" id="maternalHalfBrothers" name="maternalHalfBrothers" min="0" value={formData.maternalHalfBrothers} onChange={handleInputChange} /></div>
            <div><Label htmlFor="maternalHalfSisters">{t('maternalHalfSistersLabel')}</Label><Input type="number" id="maternalHalfSisters" name="maternalHalfSisters" min="0" value={formData.maternalHalfSisters} onChange={handleInputChange} /></div>
          </div>

           {/* Obligations */}
          <Label className="font-medium block pt-2">{t('obligationsLabel')}</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="wasiyyahAmount">{t('wasiyyahAmountLabel')}</Label><Input type="number" id="wasiyyahAmount" name="wasiyyahAmount" min="0" placeholder="0.00" value={formData.wasiyyahAmount || ''} onChange={handleInputChange} /></div>
            <div><Label htmlFor="debtsAmount">{t('debtsAmountLabel')}</Label><Input type="number" id="debtsAmount" name="debtsAmount" min="0" placeholder="0.00" value={formData.debtsAmount || ''} onChange={handleInputChange} /></div>
          </div>
           <p className="text-xs text-muted-foreground">{t('obligationsNote')}</p>

        </CardContent>
        <CardFooter className="flex-col items-stretch space-y-3">
            <Button onClick={handleCalculate} disabled={isCalculating || !selectedMadhhab} className="w-full">
                {isCalculating ? t('calculatingButton') : <><Calculator className="mr-2 h-4 w-4" /> {t('calculateSharesButton')}</>}
            </Button>
            <Alert variant="default" className="bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-700 dark:text-amber-400">
              <Info className="h-4 w-4 !text-amber-600 dark:!text-amber-300" />
              <AlertTitle className="!text-amber-700 dark:!text-amber-300">{t('calculatorDisclaimerTitle')}</AlertTitle>
              <AlertDescription>{t('calculatorDisclaimerContent')}</AlertDescription>
            </Alert>
        </CardFooter>
      </Card>

      {calculationResult && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>{t('inheritanceCalculationResultsTitle')}</CardTitle>
            {calculationResult.calculationNotes && <CardDescription>{t(calculationResult.calculationNotes)}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-1">{t('summaryOfDistributionTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('netEstateAfterObligationsLabel')}: {calculationResult.netEstateAfterObligations.toFixed(2)}</p>
              {calculationResult.wasiyyahAppliedAmount !== undefined && <p className="text-sm text-muted-foreground">{t('wasiyyahAppliedAmountLabel')}: {calculationResult.wasiyyahAppliedAmount.toFixed(2)}</p>}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-medium mb-2">{t('heirSharesTitle')}</h4>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>{t('heirNameLabel')}</TableHead>
                            <TableHead>{t('sharePercentageLabel')}</TableHead>
                            <TableHead>{t('shareFractionLabel')}</TableHead>
                            <TableHead>{t('notesLabel')}</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {calculationResult.heirs.map((heir, index) => (
                            <TableRow key={index} className={heir.isBlocked ? "text-muted-foreground line-through" : ""}>
                            <TableCell>{t(heir.heirKey) || heir.heirName}</TableCell>
                            <TableCell>{heir.isBlocked ? t('blockedStatus') : `${heir.sharePercentage.toFixed(2)}%`}</TableCell>
                            <TableCell>{heir.isBlocked ? '-' : (heir.shareFraction || '-')}</TableCell>
                            <TableCell>{heir.reasonKey ? t(heir.reasonKey) : '-'}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    {calculationResult.unassignedResidue !== undefined && calculationResult.unassignedResidue > 0 && (
                        <p className="text-sm text-primary mt-2">{t('unassignedResidueNote', { percentage: calculationResult.unassignedResidue.toFixed(2) })}</p>
                    )}
                </div>
                <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2"><BarChart3 className="h-5 w-5"/> {t('visualDistributionTitle')}</h4>
                     {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                            </Pie>
                            <RechartsTooltip formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}/>
                            <RechartsLegend />
                        </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('noHeirsForChart')}</p>
                    )}
                </div>
            </div>
          </CardContent>
           <CardFooter className="gap-2">
                <Button variant="outline" disabled><FileDown className="mr-2 h-4 w-4"/> {t('exportToPDFButton')} ({t('comingSoon')})</Button>
                <Button variant="outline" disabled><Save className="mr-2 h-4 w-4"/> {t('saveToVaultButton')} ({t('comingSoon')})</Button>
            </CardFooter>
        </Card>
      )}

    </div>
  );
}
