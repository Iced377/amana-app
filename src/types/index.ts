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
