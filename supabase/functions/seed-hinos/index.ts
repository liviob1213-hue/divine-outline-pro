import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hinos, url } = await req.json();
    
    let hinosData = hinos;
    
    // If URL provided, fetch from there
    if (url && !hinosData) {
      const fetchResp = await fetch(url);
      if (!fetchResp.ok) {
        return new Response(JSON.stringify({ error: "Failed to fetch from URL" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      hinosData = await fetchResp.json();
    }
    
    if (!Array.isArray(hinosData) || hinosData.length === 0) {
      return new Response(JSON.stringify({ error: "No hinos data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Batch insert in chunks of 50
    const chunkSize = 50;
    let inserted = 0;

    for (let i = 0; i < hinosData.length; i += chunkSize) {
      const chunk = hinosData.slice(i, i + chunkSize).map((h: any) => ({
        id: h.id,
        titulo: h.titulo,
        coro: h.coro || null,
        letra_completa: h.letra_completa,
      }));

      const { error } = await supabase.from("hinos").upsert(chunk, { onConflict: "id" });
      if (error) {
        console.error("Insert error:", error);
        return new Response(JSON.stringify({ error: error.message, inserted }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      inserted += chunk.length;
    }

    return new Response(JSON.stringify({ success: true, inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
