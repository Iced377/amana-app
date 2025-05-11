import type { LucideIcon } from 'lucide-react';

export type FileType = 'document' | 'image' | 'video' | 'other';
export type FileVisibility = 'private' | 'releaseOnDeath' | 'sharedImmediately';

export interface VaultFile {
  id: string;
  name: string;
  type: FileType;
  size: number; // in bytes
  uploadDate: string; // ISO string
  // dataUri?: string; // Unencrypted data, primarily for upload and AI processing
  encryptedDataUri: string; // Encrypted data for storage
  aiTags: string[];
  shariahCompliance?: {
    isCompliant: boolean;
    reason?: string;
    confidenceScore: number;
    categoriesConcerned?: string[];
    checkedAt: string;
  };
  visibility: FileVisibility;
  // Used when visibility is 'sharedImmediately'
  // If 'releaseOnDeath', it's assumed to be shared with ALL beneficiaries from the Beneficiary Management page.
  specificSharedBeneficiaryIds?: string[]; 
  icon: LucideIcon;
  fileObject?: File; // The actual file object, temporary during upload
}

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  notes?: string;
}

export type UserPreferenceMode = 'islamic' | 'conventional';
export type Language = 'en' | 'ar';
export type SubscriptionTier = 'free' | 'monthly' | 'quarterly' | 'yearly' | 'biyearly' | 'lifetime';

export interface UserProfile {
  id: string; // Firebase UID
  email: string | null;
  displayName: string | null;
  mode: UserPreferenceMode;
  language: Language;
  subscriptionTier: SubscriptionTier;
  subscriptionEndDate?: string; // ISO string
  is2FAEnabled: boolean;
  encryptionKey?: string; 
  sadaqahEnabled?: boolean; 
  sadaqahPercentage?: 1 | 5 | 10; 
}

export interface ActiveSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  lastAccessed: string; // ISO string
  location?: string; // e.g., "City, Country"
}
