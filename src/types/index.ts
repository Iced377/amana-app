import type { LucideIcon } from 'lucide-react';

export type FileType = 'document' | 'image' | 'video' | 'other';

export interface VaultFile {
  id: string;
  name: string;
  type: FileType;
  size: number; // in bytes
  uploadDate: string; // ISO string
  dataUri?: string; // For sending to AI, temporary
  aiTags: string[];
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
