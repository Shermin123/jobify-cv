import { supabase } from "@/lib/supabase";

export async function checkSubscription(userEmail: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_email", userEmail)
    .single();

  if (error || !data) {
    return false;
  }

  return (
    data.status === "active" ||
    data.status === "trialing" ||
    data.status === "cancelling"
  );
}