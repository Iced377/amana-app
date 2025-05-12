// src/components/QuranicVerse.tsx
import type React from 'react';
import { cn } from '@/lib/utils';

interface QuranicVerseProps {
  verse: string;
  className?: string;
  citation?: string; // e.g., Surah An-Nisa 4:58
}

export const QuranicVerse: React.FC<QuranicVerseProps> = ({ verse, className, citation }) => {
  return (
    <div className={cn("text-center my-3 p-2 rounded-md bg-accent/10 dark:bg-accent/20 border border-primary/20", className)}>
      <p
        className="text-lg md:text-xl font-serif leading-relaxed text-foreground whitespace-pre-wrap"
        dir="rtl" 
        lang="ar"  
        style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }} 
      >
        {verse}
      </p>
      {citation && (
        <p className="text-xs text-muted-foreground mt-1" dir="ltr" lang="en">
          {citation}
        </p>
      )}
    </div>
  );
};
