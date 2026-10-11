import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// hợp nhất class của tailwind css an toàn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
