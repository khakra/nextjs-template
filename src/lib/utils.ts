import { clsx, type ClassValue } from "clsx";
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

export function getCreditsFromPriceId(priceId: string) {
  switch (priceId) {
    case "price_1R123":
    case "price_1R456":
      return 20;
    case "price_1R789":
    case "price_1R012":
      return 50;
    case "price_1R345":
    case "price_1R678":
      return 100;
    default:
      return 5;
  }
}
