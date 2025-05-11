import type { LucideIcon } from 'lucide-react';

export type FileType = 'document' | 'image' | 'video' | 'other';

export interface VaultFile {
  id: string;
  name: string;
  type: FileType;
  size: number; // in bytes
  uploadDate: string; // ISO string
  dataUri?: string; // For sending to AI, temporary, unencrypted
  encryptedDataUri?: string; // For storage, encrypted
  aiTags: string[];
  shariahCompliance?: {
    isCompliant: boolean;
    reason?: string;
    checkedAt: string;
  };
  beneficiary?: string; // Name of beneficiary
  icon: LucideIcon;
  fileObject?: File; // The actual file object, temporary
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
  // In a real app, encryptionKey would be handled more securely,
  // e.g., derived from password or managed by a KMS.
  // Storing directly in profile/localStorage is for demo purposes.
  encryptionKey?: string; 
}

export interface ActiveSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  lastAccessed: string; // ISO string
  location?: string; // e.g., "City, Country"
}
