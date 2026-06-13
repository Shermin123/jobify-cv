import { supabase } from "@/lib/supabase";

export async function checkSubscription(userEmail: string) {
  const email = userEmail.toLowerCase().trim();

  // 1. Manual access check
  const { data: manualAccess } = await supabase
    .from("manual_access")
    .select("access")
    .eq("email", email)
    .eq("access", true)
    .maybeSingle();

  if (manualAccess?.access) {
    return true;
  }

  // 2. Stripe subscription check
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, plan, started_at")
    .eq("user_email", email)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return (
    data.status === "active" ||
    data.status === "trialing" ||
    data.status === "cancelling"
  );
}

export async function checkProSubscription(userEmail: string) {
  const email = userEmail.toLowerCase().trim();

  // 1. Manual access check
  const { data: manualAccess } = await supabase
    .from("manual_access")
    .select("access")
    .eq("email", email)
    .eq("access", true)
    .maybeSingle();

  if (manualAccess?.access) {
    return true;
  }

  // 2. Stripe pro subscription check
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, plan, started_at")
    .eq("user_email", email)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  const active =
    data.status === "active" ||
    data.status === "trialing" ||
    data.status === "cancelling";

  return active && data.plan === "pro";
}