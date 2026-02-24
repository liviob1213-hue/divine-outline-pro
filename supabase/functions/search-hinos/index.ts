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
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if searching by hymn number
    const numMatch = query.match(/^(\d+)$/);
    if (numMatch) {
      const { data } = await supabase
        .from("hinos")
        .select("id, titulo, coro, letra_completa")
        .eq("id", parseInt(numMatch[1]))
        .maybeSingle();

      if (data) {
        return new Response(JSON.stringify({ source: "db", results: [data] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Full-text search in Portuguese
    const searchTerms = query
      .toLowerCase()
      .replace(/[^\w\sáàâãéèêíïóôõúüç]/g, "")
      .split(/\s+/)
      .filter((t: string) => t.length > 2)
      .join(" & ");

    let results: any[] = [];

    if (searchTerms) {
      const { data } = await supabase
        .from("hinos")
        .select("id, titulo, coro, letra_completa")
        .textSearch("search_vector", searchTerms, { type: "plain", config: "portuguese" })
        .limit(10);

      results = data || [];
    }

    // Also try ILIKE search if full-text didn't find enough
    if (results.length < 3) {
      const { data } = await supabase
        .from("hinos")
        .select("id, titulo, coro, letra_completa")
        .or(`titulo.ilike.%${query}%,coro.ilike.%${query}%,letra_completa.ilike.%${query}%`)
        .limit(10);

      if (data) {
        const existingIds = new Set(results.map((r: any) => r.id));
        for (const d of data) {
          if (!existingIds.has(d.id)) results.push(d);
        }
      }
    }

    if (results.length > 0) {
      return new Response(JSON.stringify({ source: "db", results: results.slice(0, 10) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: use OpenAI
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ source: "none", results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um especialista na Harpa Cristã (hinário com 640 hinos). Responda em português.`,
          },
          {
            role: "user",
            content: `Busca: "${query}". Sugira hinos da Harpa Cristã que se encaixem. Para cada hino mostre: número, título, primeira estrofe e por que se encaixa.`,
          },
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      return new Response(JSON.stringify({ error: "AI fallback failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream through the AI response
    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
