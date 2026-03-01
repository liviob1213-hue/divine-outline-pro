import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("[Kiwify Webhook] Received:", JSON.stringify(body));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Kiwify sends different event types
    const event = body.order_status || body.event || body.subscription_status;
    const email = body.Customer?.email || body.customer?.email || body.email;
    const productName = (body.Product?.name || body.product?.name || "").toLowerCase();
    const plan = productName.includes("vitalic") || productName.includes("lifetime")
      ? "lifetime"
      : productName.includes("anual") || productName.includes("annual")
        ? "annual"
        : "monthly";
    const transactionId = body.order_id || body.transaction_id || body.id;
    const subscriptionId = body.subscription_id || body.Subscription?.id || null;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "No email found in webhook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    let status = "active";

    // Map Kiwify events to status
    const eventLower = String(event).toLowerCase();
    if (
      eventLower === "refunded" ||
      eventLower === "chargedback" ||
      eventLower === "refund"
    ) {
      status = "refunded";
    } else if (
      eventLower === "cancelled" ||
      eventLower === "canceled" ||
      eventLower === "subscription_cancelled"
    ) {
      status = "cancelled";
    } else if (
      eventLower === "expired" ||
      eventLower === "overdue" ||
      eventLower === "past_due"
    ) {
      status = "inactive";
    } else if (
      eventLower === "paid" ||
      eventLower === "approved" ||
      eventLower === "completed" ||
      eventLower === "active"
    ) {
      status = "active";
    } else {
      status = "inactive";
    }

    // Calculate expiration
    let expiresAt: string | null = null;
    if (status === "active") {
      if (plan === "lifetime") {
        // Lifetime: set expiry far in the future
        expiresAt = new Date("2099-12-31T23:59:59Z").toISOString();
      } else {
        const now = new Date();
        if (plan === "annual") {
          now.setFullYear(now.getFullYear() + 1);
        } else {
          now.setMonth(now.getMonth() + 1);
        }
        expiresAt = now.toISOString();
      }
    }

    // Upsert subscription
    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          email: normalizedEmail,
          plan,
          status,
          kiwify_transaction_id: transactionId,
          kiwify_subscription_id: subscriptionId,
          started_at: status === "active" ? new Date().toISOString() : undefined,
          expires_at: expiresAt,
          cancelled_at: status === "cancelled" || status === "refunded" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error("[Kiwify Webhook] DB error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Kiwify Webhook] Subscription updated: ${normalizedEmail} -> ${status}`);

    return new Response(
      JSON.stringify({ success: true, email: normalizedEmail, status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Kiwify Webhook] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
