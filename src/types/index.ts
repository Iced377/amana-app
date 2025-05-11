
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
export type SubscriptionTier = 'free' | 'monthly' | 'quarterly' | 'yearly' | 'biyearly' | 'lifetime';

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
  // filePath?: string; // Path in Firebase Storage - assuming dataUri is used for now like VaultFile
  fileDataUri?: string; // If a file is directly uploaded with the asset
  beneficiaryIds?: string[];
  visibility: FileVisibility;
  registrationDate: string; // ISO string of when the asset was registered
}
