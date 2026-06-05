import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing");
}

const stripe = new Stripe(stripeSecretKey);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    const email =
      checkoutSession.customer_email ||
      checkoutSession.metadata?.user_email ||
      "";

    const plan = checkoutSession.metadata?.plan || "basic";

    if (email) {
      await supabase.from("subscriptions").upsert(
        {
          user_email: email,
          plan,
          status: "active",
          demo: false,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_email",
        }
      );
    }
  }

  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.updated"
  ) {
    const subscription = event.data.object as Stripe.Subscription;

    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);

    if (!customer.deleted && customer.email) {
      const status = subscription.cancel_at_period_end
        ? "cancelling"
        : subscription.status === "active" || subscription.status === "trialing"
        ? "active"
        : "cancelled";

      await supabase
        .from("subscriptions")
        .update({
          status,
          demo: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_email", customer.email);
    }
  }

  return NextResponse.json({ received: true });
}