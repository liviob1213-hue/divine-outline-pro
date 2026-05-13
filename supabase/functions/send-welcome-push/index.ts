import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const appId = Deno.env.get("ONESIGNAL_APP_ID");
    const apiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!appId || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subscriptionId } = await req.json().catch(() => ({}));
    if (!subscriptionId || typeof subscriptionId !== "string") {
      return new Response(
        JSON.stringify({ error: "subscriptionId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const osResp = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        include_subscription_ids: [subscriptionId],
        headings: { en: "Notificações Ativadas! 🙏", pt: "Notificações Ativadas! 🙏" },
        contents: {
          en: "Tudo certo! Você receberá seu versículo diário todos os dias às 8:00.",
          pt: "Tudo certo! Você receberá seu versículo diário todos os dias às 8:00.",
        },
        url: "/",
      }),
    });

    const osBody = await osResp.json();
    console.log("OneSignal welcome response:", osResp.status, JSON.stringify(osBody));

    return new Response(
      JSON.stringify({ success: osResp.ok, onesignal: osBody }),
      { status: osResp.ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-welcome-push error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});