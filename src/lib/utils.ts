import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function detectOperator(number: string): string | null {
  if (number.length < 3) return null;
  const prefix = number.substring(0, 3);
  
  switch (prefix) {
    case '017':
    case '013':
      return 'Grameenphone';
    case '018':
      return 'Robi';
    case '016':
      return 'Airtel';
    case '019':
    case '014':
      return 'Banglalink';
    case '015':
      return 'Teletalk';
    default:
      return null;
  }
}
