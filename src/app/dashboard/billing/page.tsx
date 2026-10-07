import type { Metadata } from "next";
import {
  CancelSubscriptionButton,
  ChangePlanButton,
  ManageBillingButton,
  ResumeSubscriptionButton,
} from "@/components/billing-actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Subscription } from "@/generated/prisma/client";
import { type CreditBalance, getCredits } from "@/lib/credits";
import { FREE_PLAN_CREDITS, PLANS, type Plan } from "@/lib/plans";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Billing",
  robots: { index: false },
};

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function BillingPage() {
  const session = await requireSession();
  const userId = session.user.id;

  // Read from the database rather than Stripe: webhooks keep these rows in
  // sync, and this page shouldn't make a Stripe API call on every view.
  const [balance, subscription] = await Promise.all([
    getCredits(userId),
    prisma.subscription.findFirst({
      where: { referenceId: userId, status: { in: ["active", "trialing"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const billingEnabled = Boolean(process.env.STRIPE_SECRET_KEY);
  const currentPlan = subscription
    ? PLANS.find(
        (p) => p.name.toLowerCase() === subscription.plan.toLowerCase()
      )
    : undefined;

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h2 className="font-semibold text-xl">Billing</h2>
        <p className="text-muted-foreground text-sm">
          Your plan, credits and payment details.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PlanCard
          billingEnabled={billingEnabled}
          plan={currentPlan}
          subscription={subscription}
        />
        <CreditsCard balance={balance} subscribed={Boolean(subscription)} />
      </div>

      {billingEnabled && (
        <PlanPicker currentPlan={currentPlan} subscription={subscription} />
      )}
    </div>
  );
}

function PlanCard({
  billingEnabled,
  plan,
  subscription,
}: {
  billingEnabled: boolean;
  plan: Plan | undefined;
  subscription: Subscription | null;
}) {
  // Newer Stripe cancellations set cancelAt instead of cancelAtPeriodEnd.
  const cancelling = Boolean(
    subscription?.cancelAtPeriodEnd || subscription?.cancelAt
  );
  const endsAt = subscription?.cancelAt ?? subscription?.periodEnd;

  let description = `${FREE_PLAN_CREDITS} free credits, no subscription.`;
  if (subscription && endsAt) {
    description = `${cancelling ? "Ends" : "Renews"} on ${dateFormat.format(endsAt)}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {plan?.displayName ?? "Free"}
          {subscription?.status === "trialing" && (
            <Badge variant="secondary">Trial</Badge>
          )}
          {cancelling && <Badge variant="destructive">Cancels soon</Badge>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {plan && (
          <p className="font-semibold text-3xl">
            {plan.priceMonthly}
            <span className="font-normal text-base text-muted-foreground">
              {" "}
              / month
            </span>
          </p>
        )}
        {!billingEnabled && (
          <p className="text-muted-foreground text-sm">
            Billing is not configured. Set the Stripe variables in your
            environment to enable subscriptions.
          </p>
        )}
      </CardContent>
      {billingEnabled && subscription && (
        <CardFooter className="flex flex-wrap gap-2">
          <ManageBillingButton />
          {cancelling ? (
            <ResumeSubscriptionButton />
          ) : (
            <CancelSubscriptionButton />
          )}
        </CardFooter>
      )}
    </Card>
  );
}

function CreditsCard({
  balance,
  subscribed,
}: {
  balance: CreditBalance | null;
  subscribed: boolean;
}) {
  const { credits, usage, remaining } = balance ?? {
    credits: 0,
    usage: 0,
    remaining: 0,
  };
  const usedPercent = credits > 0 ? Math.min(100, (usage / credits) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credits</CardTitle>
        <CardDescription>
          {subscribed
            ? "Your allowance resets at each renewal."
            : "Subscribe to get a monthly allowance."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="font-semibold text-3xl tabular-nums">
          {remaining}
          <span className="font-normal text-base text-muted-foreground">
            {" "}
            of {credits} left
          </span>
        </p>
        <div
          aria-label="Credits used"
          aria-valuemax={credits}
          aria-valuemin={0}
          aria-valuenow={usage}
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${usedPercent}%` }}
          />
        </div>
        <p className="text-muted-foreground text-sm">
          {usage} used this period
        </p>
      </CardContent>
    </Card>
  );
}

function PlanPicker({
  currentPlan,
  subscription,
}: {
  currentPlan: Plan | undefined;
  subscription: Subscription | null;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="font-semibold text-lg">
        {subscription ? "Change plan" : "Choose a plan"}
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.name === currentPlan?.name;
          return (
            <Card key={plan.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.displayName}
                  {isCurrent && <Badge>Current</Badge>}
                </CardTitle>
                <CardDescription>
                  {plan.priceMonthly} / month · {plan.credits} credits
                </CardDescription>
              </CardHeader>
              {!isCurrent && (
                <CardFooter className="mt-auto">
                  <ChangePlanButton
                    label={subscription ? "Switch" : "Subscribe"}
                    plan={plan.name}
                    subscriptionId={
                      subscription?.stripeSubscriptionId ?? undefined
                    }
                  />
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
