import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get book name->id mapping
    const { data: livros } = await supabase.from("livros_biblia").select("id, nome");
    if (!livros) throw new Error("Could not load livros_biblia");
    const bookMap: Record<string, number> = {};
    for (const l of livros) bookMap[l.nome] = l.id;

    const { verses } = await req.json() as { verses: { livro: string; capitulo: number; versiculo: number; texto: string; versao: string }[] };
    
    if (!verses || !Array.isArray(verses) || verses.length === 0) {
      return new Response(JSON.stringify({ error: "No verses provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Map to DB format
    const rows = verses.map(v => ({
      livro_id: bookMap[v.livro],
      capitulo: v.capitulo,
      versiculo: v.versiculo,
      texto: v.texto,
      versao: v.versao,
    })).filter(r => r.livro_id != null);

    // Insert in batches of 1000
    let inserted = 0;
    const batchSize = 1000;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from("biblias").upsert(batch, { onConflict: "versao,livro_id,capitulo,versiculo", ignoreDuplicates: true });
      if (error) {
        // Try insert ignoring duplicates
        const { error: insertErr } = await supabase.from("biblias").insert(batch);
        if (insertErr && !insertErr.message.includes("duplicate")) {
          console.error("Batch insert error:", insertErr.message);
        }
      }
      inserted += batch.length;
    }

    return new Response(JSON.stringify({ success: true, inserted, skipped: verses.length - rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
