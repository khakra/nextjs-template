// Single source of truth for subscription plans.
//
// `name` is the plan identifier passed to Stripe via BetterAuth — it must match
// the plan names registered in src/lib/auth.ts, which is why both read from here.
// Price IDs stay server-side in auth.ts; everything in this file is safe to ship
// to the client.

export interface Plan {
  name: string;
  displayName: string;
  priceMonthly: string;
  description: string;
  features: string[];
  credits: number;
  mostPopular?: boolean;
}

/** Credits a user gets before subscribing, and falls back to when a plan ends. */
export const FREE_PLAN_CREDITS = 4;

export const PLANS: Plan[] = [
  {
    name: "starter",
    displayName: "Starter",
    priceMonthly: "$19",
    description: "The essentials to provide your best work for clients.",
    features: [
      "20 credits per month",
      "Up to 1,000 subscribers",
      "Basic analytics",
      "48-hour support response time",
    ],
    credits: 20,
  },
  {
    name: "pro",
    displayName: "Pro",
    priceMonthly: "$49",
    description: "A plan that scales with your rapidly growing business.",
    features: [
      "50 credits per month",
      "Up to 10,000 subscribers",
      "Advanced analytics",
      "24-hour support response time",
      "Marketing automations",
    ],
    credits: 50,
    mostPopular: true,
  },
  {
    name: "expert",
    displayName: "Expert",
    priceMonthly: "$99",
    description: "Dedicated support and infrastructure for your company.",
    features: [
      "100 credits per month",
      "Unlimited subscribers",
      "Advanced analytics",
      "1-hour, dedicated support response time",
      "Marketing automations",
    ],
    credits: 100,
  },
];

export function getPlanCredits(planName: string | undefined | null) {
  return PLANS.find((plan) => plan.name === planName)?.credits;
}
