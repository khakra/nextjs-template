import { CheckIcon } from "@heroicons/react/20/solid";
import { SubscribeButton } from "@/components/subscribe-button";
import { PLANS } from "@/lib/plans";

const tiers = PLANS.map((plan) => ({
  ...plan,
  id: `tier-${plan.name}`,
}));

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Pricing() {
  return (
    <div className="py-24 sm:py-32" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mt-2 text-balance font-semibold text-5xl tracking-tight sm:text-6xl">
            Pricing that grows with you
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center font-medium text-lg text-muted-foreground sm:text-xl/8">
          Choose an affordable plan that&rsquo;s packed with the best features
          for engaging your audience, creating customer loyalty, and driving
          sales.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier, tierIdx) => (
            <div
              className={classNames(
                tier.mostPopular ? "lg:z-10 lg:rounded-b-none" : "lg:mt-8",
                tierIdx === 0 ? "-mr-px lg:rounded-r-none" : "",
                tierIdx === tiers.length - 1 ? "-ml-px lg:rounded-l-none" : "",
                "inset-ring inset-ring-muted-foreground flex flex-col justify-between rounded-xl p-8 xl:p-10"
              )}
              key={tier.id}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="font-semibold text-lg/8" id={tier.id}>
                    {tier.displayName}
                  </h3>
                  {tier.mostPopular ? (
                    <p className="rounded-full bg-primary px-2.5 py-1 font-semibold text-primary-foreground text-xs/5">
                      Most popular
                    </p>
                  ) : null}
                </div>
                <p className="mt-4 text-muted-foreground text-sm/6">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="font-semibold text-4xl tracking-tight">
                    {tier.priceMonthly}
                  </span>
                  <span className="font-semibold text-muted-foreground text-sm/6">
                    /month
                  </span>
                </p>
                <ul className="mt-8 space-y-3 text-muted-foreground text-sm/6">
                  {tier.features.map((feature) => (
                    <li className="flex gap-x-3" key={feature}>
                      <CheckIcon
                        aria-hidden="true"
                        className="h-6 w-5 flex-none"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <SubscribeButton
                className={classNames(
                  tier.mostPopular
                    ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/75"
                    : "inset-ring text-secondary-foreground",
                  "block w-full rounded-md px-3 py-2 text-center font-semibold text-sm/6 focus-visible:outline-2 disabled:opacity-70"
                )}
                plan={tier.name}
                planLabelledBy={tier.id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
