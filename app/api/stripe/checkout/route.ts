import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing");
}

const stripe = new Stripe(stripeSecretKey);

function normalizeCountry(country: string) {
  if (country === "LOW") return "LOW";
  if (country === "UK") return "UK";
  return "DEFAULT";
}

function getPriceId(plan: string, country: string) {
  const selectedPlan = plan === "pro" ? "pro" : "basic";
  const selectedCountry = normalizeCountry(country);

  if (selectedPlan === "pro" && selectedCountry === "LOW") {
    return process.env.STRIPE_PRO_PRICE_ID_LOW;
  }

  if (selectedPlan === "basic" && selectedCountry === "LOW") {
    return process.env.STRIPE_BASIC_PRICE_ID_LOW;
  }

  if (selectedPlan === "pro" && selectedCountry === "UK") {
    return process.env.STRIPE_PRO_PRICE_ID_UK;
  }

  if (selectedPlan === "basic" && selectedCountry === "UK") {
    return process.env.STRIPE_BASIC_PRICE_ID_UK;
  }

  if (selectedPlan === "pro") {
    return process.env.STRIPE_PRO_PRICE_ID_DEFAULT;
  }

  return process.env.STRIPE_BASIC_PRICE_ID_DEFAULT;
}

export async function POST(req: Request) {
  try {
    const { plan, email, country } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const isTrial = plan === "trial";
    const selectedPlan = plan === "pro" ? "pro" : "basic";
    const selectedCountry = normalizeCountry(country || "UK");

    const priceId = getPriceId(selectedPlan, selectedCountry);

    if (!priceId) {
      return NextResponse.json(
        {
          error: `Stripe price ID is missing for ${selectedPlan} / ${selectedCountry}`,
        },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan: isTrial ? "trial" : selectedPlan,
        access_plan: selectedPlan,
        country: selectedCountry,
        user_email: email,
      },
      subscription_data: {
        trial_period_days: isTrial ? 7 : undefined,
        metadata: {
          plan: isTrial ? "trial" : selectedPlan,
          access_plan: selectedPlan,
          country: selectedCountry,
          user_email: email,
        },
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Stripe checkout failed" },
      { status: 500 }
    );
  }
}