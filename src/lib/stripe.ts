import Stripe from "stripe";
import { getCreditsFromPlan, getCreditsFromPriceId } from "./utils";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getProducts = async () => {
  const [products, prices] = await Promise.all([
    stripe.products.list({ active: true }),
    stripe.prices.list({ active: true }),
  ]);

  const productPrices: Record<string, Stripe.Price[]> = {};

  prices.data.forEach((price) => {
    if (typeof price.product === "string") {
      if (!productPrices[price.product]) {
        productPrices[price.product] = [];
      }
      productPrices[price.product].push(price);
    }
  });

  const formattedProducts = products.data.map((product) => {
    const prices = productPrices[product.id] || [];
    const firstPrice = prices[0];

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      credits: Number(product.metadata.credits || 0),
      price: firstPrice?.unit_amount ? firstPrice.unit_amount / 100 : 0,
      priceId: firstPrice?.id || "",
    };
  });

  return formattedProducts.reverse();
};

export const createCreditCheckoutSession = async ({
  priceId,
  userId,
  successUrl,
  cancelUrl,
  stripeCustomerId,
}: {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  stripeCustomerId: string;
}): Promise<Stripe.Checkout.Session> => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    billing_address_collection: "auto",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      referenceId: userId,
      userId: userId,
      type: "credit_purchase",
      credits: getCreditsFromPriceId(priceId),
    },
    allow_promotion_codes: true,
    client_reference_id: userId,
    customer: stripeCustomerId,
  });

  return session;
};
