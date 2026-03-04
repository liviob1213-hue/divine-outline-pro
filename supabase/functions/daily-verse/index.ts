import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const THEMES = [
  "salvação",
  "fé",
  "relacionamento",
  "amizade",
  "sabedoria",
  "confiança",
  "promessa",
  "fidelidade",
  "amor",
  "vitória",
  "esperança",
  "batalha espiritual",
  "casamento",
  "alegria",
];

// Fallback verses in case AI fails
const FALLBACK_VERSES = [
  { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reference: "João 3:16", book: "João", chapter: 3, verse: 16, theme: "salvação" },
  { text: "Ora, a fé é o firme fundamento das coisas que se esperam e a prova das coisas que se não veem.", reference: "Hebreus 11:1", book: "Hebreus", chapter: 11, verse: 1, theme: "fé" },
  { text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.", reference: "1 Coríntios 13:4", book: "1 Coríntios", chapter: 13, verse: 4, theme: "amor" },
  { text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", reference: "Provérbios 3:5", book: "Provérbios", chapter: 3, verse: 5, theme: "confiança" },
  { text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1", book: "Salmos", chapter: 23, verse: 1, theme: "fidelidade" },
  { text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13", book: "Filipenses", chapter: 4, verse: 13, theme: "vitória" },
  { text: "Mas os que esperam no Senhor renovarão as suas forças, subirão com asas como águias, correrão e não se cansarão, caminharão e não se fatigarão.", reference: "Isaías 40:31", book: "Isaías", chapter: 40, verse: 31, theme: "esperança" },
  { text: "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos.", reference: "Filipenses 4:4", book: "Filipenses", chapter: 4, verse: 4, theme: "alegria" },
  { text: "Em todo o tempo ama o amigo; e na angústia nasce o irmão.", reference: "Provérbios 17:17", book: "Provérbios", chapter: 17, verse: 17, theme: "amizade" },
  { text: "Revesti-vos de toda a armadura de Deus, para que possais estar firmes contra as astutas ciladas do diabo.", reference: "Efésios 6:11", book: "Efésios", chapter: 6, verse: 11, theme: "batalha espiritual" },
  { text: "Vós, maridos, amai vossa mulher, como também Cristo amou a igreja e a si mesmo se entregou por ela.", reference: "Efésios 5:25", book: "Efésios", chapter: 5, verse: 25, theme: "casamento" },
  { text: "O princípio da sabedoria é o temor do Senhor; bom entendimento têm todos os que lhe obedecem.", reference: "Salmos 111:10", book: "Salmos", chapter: 111, verse: 10, theme: "sabedoria" },
  { text: "Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.", reference: "Jeremias 29:11", book: "Jeremias", chapter: 29, verse: 11, theme: "promessa" },
  { text: "Nenhuma arma forjada contra ti prosperará; e toda língua que se levantar contra ti em juízo, tu a condenarás.", reference: "Isaías 54:17", book: "Isaías", chapter: 54, verse: 17, theme: "vitória" },
];

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
    const now = new Date();
    const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const dateStr = brt.toISOString().split("T")[0];
    const seed = dateToSeed(dateStr);

    // Pick today's theme based on date
    const themeIndex = seed % THEMES.length;
    const todayTheme = THEMES[themeIndex];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `Você é um especialista em Bíblia Sagrada. Sua ÚNICA tarefa é retornar um versículo bíblico REAL sobre um tema específico.

REGRAS OBRIGATÓRIAS:
1. O versículo DEVE existir na Bíblia Sagrada - NUNCA invente versículos
2. O versículo DEVE estar diretamente relacionado ao tema pedido
3. Use a tradução Almeida Revista e Atualizada (ARA)
4. NÃO retorne versículos históricos, genealógicos ou narrativos sem mensagem espiritual
5. O versículo deve conter uma mensagem edificante, de encorajamento ou ensinamento
6. A referência (livro, capítulo, versículo) DEVE ser precisa e correta

Responda APENAS com este JSON, sem markdown, sem explicações:
{"text":"texto exato do versículo na ARA","reference":"Livro capítulo:versículo","book":"Livro","chapter":número,"verse":número}`
              },
              {
                role: "user",
                content: `Tema de hoje: "${todayTheme}"
Data: ${dateStr} (use como seed para variar)

Me dê um versículo bíblico PROFUNDO e INSPIRADOR sobre "${todayTheme}".
O versículo deve falar DIRETAMENTE sobre ${todayTheme} - não pode ser um versículo aleatório.
Exemplos de livros bons para buscar: Salmos, Provérbios, Isaías, Romanos, Efésios, Filipenses, João, Mateus, Hebreus, 1 Coríntios, Gálatas, Colossenses, 1 Pedro, Tiago.
Retorne APENAS o JSON.`
              }
            ],
            temperature: 0.7,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;

          if (content) {
            const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const parsed = JSON.parse(cleaned);

            // Validate the verse has required fields and minimum text length
            if (parsed.text && parsed.reference && parsed.book && parsed.text.length > 20) {
              console.log("AI returned verse:", parsed.reference, "for theme:", todayTheme);
              return new Response(JSON.stringify({
                date: dateStr,
                text: parsed.text,
                reference: parsed.reference,
                book: parsed.book,
                chapter: parsed.chapter || 1,
                verse: parsed.verse || 1,
                theme: todayTheme,
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            } else {
              console.error("AI returned invalid verse structure:", content);
            }
          }
        } else {
          console.error("AI gateway error:", aiResponse.status, await aiResponse.text());
        }
      } catch (aiErr) {
        console.error("AI verse selection failed, using fallback:", aiErr);
      }
    }

    // Fallback: use curated themed verses
    const themedFallbacks = FALLBACK_VERSES.filter(v => v.theme === todayTheme);
    const pool = themedFallbacks.length > 0 ? themedFallbacks : FALLBACK_VERSES;
    const fallback = pool[seed % pool.length];

    return new Response(JSON.stringify({
      date: dateStr,
      text: fallback.text,
      reference: fallback.reference,
      book: fallback.book,
      chapter: fallback.chapter,
      verse: fallback.verse,
      theme: todayTheme,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-verse error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
