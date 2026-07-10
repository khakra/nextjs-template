import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCreditsFromPlan(plan: string) {
  switch (plan) {
    case "starter":
      return 20;
    case "pro":
      return 50;
    case "expert":
      return 100;
    default:
      return 5;
  }
}
