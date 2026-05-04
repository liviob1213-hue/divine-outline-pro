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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    if (!appId || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch today's verse from existing daily-verse function
    const verseResp = await fetch(`${supabaseUrl}/functions/v1/daily-verse`, {
      headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
    });
    const verse = await verseResp.json();

    const text: string = verse?.text || "A graça do Senhor seja com você hoje.";
    const reference: string = verse?.reference || "";
    const content = reference ? `"${text}" — ${reference}` : text;

    const osResp = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["Subscribed Users"],
        headings: { en: "📖 Versículo do Dia", pt: "📖 Versículo do Dia" },
        contents: { en: content, pt: content },
        url: "/",
      }),
    });

    const osBody = await osResp.json();
    console.log("OneSignal response:", osResp.status, JSON.stringify(osBody));

    return new Response(
      JSON.stringify({ success: osResp.ok, verse: reference, onesignal: osBody }),
      { status: osResp.ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-onesignal-verse error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});