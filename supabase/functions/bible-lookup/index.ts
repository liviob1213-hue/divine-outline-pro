import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map version display names to DB siglas
const VERSION_MAP: Record<string, string> = {
  "Almeida Revisada e Atualizada (ARA)": "ARA",
  "Almeida Revisada e Corrigida (ARC)": "ARC",
  "Almeida Revisada Corrigida (ACF)": "ACF",
  "Nova Almeida Atualizada (NAA)": "NAA",
  "Nova Tradução na Linguagem de Hoje (NTLH)": "NTLH",
  "Nova Versão Internacional (NVI)": "NVI",
  "Nova Versão Transformadora (NVT)": "NVT",
  "King James Atualizada (KJA)": "KJA",
  "Almeida Século XXI (AS21)": "AS21",
  "Almeida Atualizada (JFAA)": "JFAA",
  "King James Fiel (KJF)": "KJF",
  "Nova Bíblia Viva (NBV)": "NBV",
  "Tradução Brasileira (TB)": "TB",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book, chapter, version, search_text } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // If searching for text across the Bible
    if (search_text) {
      const sigla = VERSION_MAP[version] || version;
      const { data } = await supabase
        .from("biblias")
        .select("versao, livro_id, capitulo, versiculo, texto")
        .eq("versao", sigla)
        .textSearch("texto", search_text, { type: "plain", config: "portuguese" })
        .limit(20);

      if (data && data.length > 0) {
        // Get book names
        const bookIds = [...new Set(data.map((d: any) => d.livro_id))];
        const { data: books } = await supabase
          .from("livros_biblia")
          .select("id, nome")
          .in("id", bookIds);

        const bookMap = Object.fromEntries((books || []).map((b: any) => [b.id, b.nome]));

        return new Response(JSON.stringify({
          source: "db",
          results: data.map((d: any) => ({
            ...d,
            livro_nome: bookMap[d.livro_id] || `Livro ${d.livro_id}`,
          })),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ source: "none", results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load a specific chapter
    if (book && chapter) {
      // Get book ID
      const { data: bookData } = await supabase
        .from("livros_biblia")
        .select("id")
        .eq("nome", book)
        .maybeSingle();

      if (!bookData) {
        return new Response(JSON.stringify({ source: "none", results: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const sigla = VERSION_MAP[version] || version;
      const { data: verses } = await supabase
        .from("biblias")
        .select("versiculo, texto")
        .eq("versao", sigla)
        .eq("livro_id", bookData.id)
        .eq("capitulo", chapter)
        .order("versiculo", { ascending: true });

      if (verses && verses.length > 0) {
        return new Response(JSON.stringify({ source: "db", verses }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ source: "none", verses: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("bible-lookup error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
