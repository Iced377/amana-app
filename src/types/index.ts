import type { LucideIcon } from 'lucide-react';

export type FileType = 'document' | 'image' | 'video' | 'other';
export type FileVisibility = 'private' | 'releaseOnDeath' | 'sharedImmediately';

export interface VaultFile {
  id: string;
  name: string;
  type: FileType;
  size: number; // in bytes
  uploadDate: string; // ISO string
  dataUri: string; 
  aiTags: string[];
  shariahCompliance?: {
    isCompliant: boolean;
    reason?: string;
    confidenceScore: number;
    categoriesConcerned?: string[];
    checkedAt: string;
  };
  visibility: FileVisibility;
  specificSharedBeneficiaryIds?: string[]; 
  icon: LucideIcon;
  fileObject?: File; 
  isPotentialDuplicate?: boolean; // Flag if this file is considered a potential duplicate
  duplicateInfo?: {            // Information about the duplicate check
    note: string;               // e.g., "Potential duplicate of 'file.txt' (ID: xyz). Confidence: 0.85"
    checkedAt: string;          // ISO string timestamp of when the check was performed
    duplicateOfFileId?: string; // ID of the file it's a duplicate of, if applicable
  };
}

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  notes?: string;
}

export type UserPreferenceMode = 'islamic' | 'conventional';
export type Language = 'en' | 'ar';
export type SubscriptionTier = 'free' | 'standard_monthly' | 'standard_quarterly' | 'premium_yearly' | 'premium_bi_yearly' | 'lifetime_access';

export type Madhhab = 'hanafi' | 'maliki' | 'shafii' | 'hanbali' | '';

export interface IslamicPreferences {
  madhhab?: Madhhab;
}

export interface UserProfile {
  id: string; 
  email: string | null;
  displayName: string | null;
  countryCode?: string;
  phoneNumber?: string;
  mode: UserPreferenceMode;
  language: Language;
  subscriptionTier: SubscriptionTier;
  subscriptionEndDate?: string; 
  is2FAEnabled: boolean;
  encryptionKey?: string; 
  sadaqahEnabled?: boolean; 
  sadaqahPercentage?: 1 | 5 | 10; 
  islamicPreferences?: IslamicPreferences;
}

export interface ActiveSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  lastAccessed: string; 
  location?: string; 
}

export const assetCategoryKeys = [
  'financial', 
  'property_vehicles', 
  'insurance', 
  'legal', 
  'digital', 
  'personal_items'
] as const;

export type AssetCategoryKey = typeof assetCategoryKeys[number];

export interface RegisteredAsset {
  id: string; 
  userId: string; 
  categoryKey: AssetCategoryKey; 
  assetDescription: string;
  fileName?: string; 
  fileType?: string; 
  fileSize?: number; // in bytes
  fileDataUri?: string; 
  beneficiaryIds?: string[];
  visibility: FileVisibility;
  registrationDate: string; // ISO string of when the asset was registered
}

// Digital Footprint Discovery Types
export type DigitalAccountAction = 'shareLogin' | 'notifyContact' | 'deleteAccount' | 'noAction';
export type DigitalAccountCategory = 'Financial' | 'Social Media' | 'Email' | 'Work' | 'Utilities' | 'Shopping' | 'Entertainment' | 'Cloud Storage' | 'Gaming' | 'Other';
export type DigitalAccountDiscoveryMethod = 'manual' | 'checklist' | 'inboxScan' | 'passwordManager';

export interface DiscoveredAccount {
  id: string;
  userId: string;
  serviceName: string;
  category: DigitalAccountCategory;
  username?: string; 
  notes?: string; 
  actionOnDeath: DigitalAccountAction;
  assignedContactId?: string; 
  linkedFileId?: string; 
  discoveryMethod: DigitalAccountDiscoveryMethod;
  dateAdded: string; // ISO string
}

// Insurance Policy Types
export const insuranceTypes = ['Life', 'Health', 'Vehicle', 'Home', 'Travel', 'Other'] as const;
export type InsuranceType = typeof insuranceTypes[number];

export const currencies = ['USD', 'EUR', 'AED', 'SAR', 'GBP', 'JPY', 'CAD', 'AUD', 'Other'] as const;
export type Currency = typeof currencies[number];


export interface InsurancePolicy {
  id: string;
  userId: string;
  insuranceType: InsuranceType;
  companyName: string;
  policyNumber: string;
  insuredAmount: number | null;
  currency: Currency | string; // Allow 'Other' as string
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  policyBeneficiariesText?: string; // Text list of beneficiaries for the policy itself
  additionalCoverage?: string;
  
  // File-related fields (optional attachment)
  fileDataUri?: string; // Base64 data URI of the uploaded policy document
  fileName?: string;
  fileType?: string; // Mime type
  fileSize?: number; // in bytes
  
  visibility: FileVisibility; // Re-use FileVisibility type
  specificSharedBeneficiaryIds?: string[]; // For 'sharedImmediately' or 'releaseOnDeath' if specific to this policy

  registrationDate: string; // ISO string
}

// Islamic Inheritance Calculator Types
export type MaritalStatus = 'married' | 'widowed' | 'divorced' | 'never_married';
export type Gender = 'male' | 'female';
export type SiblingType = 'full' | 'paternal_half' | 'maternal_half';

export interface InheritanceInput {
  userId: string;
  madhhab: Madhhab;
  maritalStatus: MaritalStatus;
  // Spouse
  hasSpouse: boolean;
  spouseGender?: Gender; // 'male' for husband, 'female' for wife
  // Children
  sons: number; // Count of sons
  daughters: number; // Count of daughters
  // Parents
  fatherAlive: boolean;
  motherAlive: boolean;
  // Grandparents
  paternalGrandfatherAlive: boolean;
  paternalGrandmotherAlive: boolean;
  maternalGrandfatherAlive: boolean;
  maternalGrandmotherAlive: boolean;
  // Siblings
  fullBrothers: number;
  fullSisters: number;
  paternalHalfBrothers: number;
  paternalHalfSisters: number;
  maternalHalfBrothers: number;
  maternalHalfSisters: number;
  // Obligations
  wasiyyahAmount?: number; // Bequest amount
  wasiyyahPercentage?: number; // Bequest percentage (e.g., 0.33 for 1/3)
  debtsAmount?: number;
  // For simplicity, we are not including more complex relations like uncles, aunts, nephews, nieces, grandchildren through daughters etc.
  // These would be needed for a comprehensive calculator.
}

export interface HeirShare {
  heirKey: string; // e.g., 'spouse', 'son', 'daughter_group', 'father', 'mother'
  heirName: string; // Localized name, e.g., "Wife", "Sons (2)"
  sharePercentage: number; // e.g., 12.5 for 1/8
  shareFraction?: string; // e.g., "1/8"
  reasonKey?: string; // Optional: key for localization of why they get this share or are blocked
  isBlocked?: boolean;
  count?: number; // if it's a group like sons/daughters
}

export interface InheritanceCalculationOutput {
  netEstateAfterObligations: number;
  wasiyyahAppliedAmount?: number;
  heirs: HeirShare[];
  calculationNotes?: string; // General notes, e.g. "Residue distributed via Radd"
  unassignedResidue?: number; // Percentage if any
  errors?: string[]; // Errors in calculation or input
}