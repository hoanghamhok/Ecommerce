// src/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cần cài đặt các phụ thuộc
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";