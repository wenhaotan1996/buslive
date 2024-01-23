import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const BASE_PATH = 'munilive';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
