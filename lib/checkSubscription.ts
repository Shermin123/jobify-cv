import { supabase } from "@/lib/supabase";

export async function checkSubscription(userEmail: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_email", userEmail.toLowerCase().trim())
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
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, plan")
    .eq("user_email", userEmail.toLowerCase().trim())
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