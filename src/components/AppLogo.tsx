import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
}

export function AppLogo({ className, iconSize = 8, textSize = "text-xl", showText = true }: AppLogoProps) {
  return (
    <Link href="/dashboard" className={cn("flex items-center gap-2", className)}>
      <ShieldCheck className={`h-${iconSize} w-${iconSize} text-primary`} />
      {showText && <span className={`${textSize} font-bold`}>Guardian Angel</span>}
    </Link>
  );
}
