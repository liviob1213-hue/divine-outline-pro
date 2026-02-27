import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple deterministic hash from date string to get a consistent verse per day
function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get today's date in BRT (UTC-3)
    const now = new Date();
    const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const dateStr = brt.toISOString().split("T")[0]; // e.g. "2026-02-27"

    const seed = dateToSeed(dateStr);

    // Count total verses in ARA version (most complete)
    const { count } = await supabase
      .from("biblias")
      .select("id", { count: "exact", head: true })
      .eq("versao", "ARA");

    if (!count || count === 0) {
      return new Response(JSON.stringify({ error: "No verses found" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const offset = seed % count;

    // Get the verse at that offset
    const { data: verses } = await supabase
      .from("biblias")
      .select("id, livro_id, capitulo, versiculo, texto")
      .eq("versao", "ARA")
      .order("id", { ascending: true })
      .range(offset, offset);

    if (!verses || verses.length === 0) {
      return new Response(JSON.stringify({ error: "Verse not found" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verse = verses[0];

    // Get book name
    const { data: book } = await supabase
      .from("livros_biblia")
      .select("nome")
      .eq("id", verse.livro_id)
      .maybeSingle();

    const result = {
      date: dateStr,
      text: verse.texto,
      reference: `${book?.nome || "?"} ${verse.capitulo}:${verse.versiculo}`,
      book: book?.nome || "",
      chapter: verse.capitulo,
      verse: verse.versiculo,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-verse error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
