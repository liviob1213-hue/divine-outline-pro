import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fallback verses when DB is empty
const FALLBACK_VERSES = [
  { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reference: "João 3:16", book: "João", chapter: 3, verse: 16 },
  { text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1", book: "Salmos", chapter: 23, verse: 1 },
  { text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13", book: "Filipenses", chapter: 4, verse: 13 },
  { text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", reference: "Provérbios 3:5", book: "Provérbios", chapter: 3, verse: 5 },
  { text: "Eu sou o caminho, a verdade e a vida; ninguém vem ao Pai senão por mim.", reference: "João 14:6", book: "João", chapter: 14, verse: 6 },
  { text: "Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.", reference: "Jeremias 29:11", book: "Jeremias", chapter: 29, verse: 11 },
  { text: "Esforçai-vos, e animai-vos; não temais, nem vos espanteis diante deles, porque o Senhor, vosso Deus, é o que vai convosco; não vos deixará, nem vos desamparará.", reference: "Deuteronômio 31:6", book: "Deuteronômio", chapter: 31, verse: 6 },
  { text: "Mas os que esperam no Senhor renovarão as suas forças, subirão com asas como águias, correrão e não se cansarão, caminharão e não se fatigarão.", reference: "Isaías 40:31", book: "Isaías", chapter: 40, verse: 31 },
  { text: "Não to mandei eu? Esforça-te e tem bom ânimo; não pasmes, nem te espantes, porque o Senhor, teu Deus, é contigo, por onde quer que andares.", reference: "Josué 1:9", book: "Josué", chapter: 1, verse: 9 },
  { text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados por seu decreto.", reference: "Romanos 8:28", book: "Romanos", chapter: 8, verse: 28 },
  { text: "Não andeis ansiosos de coisa alguma; em tudo, porém, sejam conhecidas, diante de Deus, as vossas petições, pela oração e pela súplica, com ações de graças.", reference: "Filipenses 4:6", book: "Filipenses", chapter: 4, verse: 6 },
  { text: "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.", reference: "Salmos 119:105", book: "Salmos", chapter: 119, verse: 105 },
  { text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", reference: "Mateus 11:28", book: "Mateus", chapter: 11, verse: 28 },
  { text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?", reference: "Salmos 27:1", book: "Salmos", chapter: 27, verse: 1 },
  { text: "Buscai primeiro o Reino de Deus, e a sua justiça, e todas essas coisas vos serão acrescentadas.", reference: "Mateus 6:33", book: "Mateus", chapter: 6, verse: 33 },
  { text: "A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.", reference: "2 Coríntios 12:9", book: "2 Coríntios", chapter: 12, verse: 9 },
  { text: "Deleita-te também no Senhor, e ele te concederá o que deseja o teu coração.", reference: "Salmos 37:4", book: "Salmos", chapter: 37, verse: 4 },
  { text: "Se Deus é por nós, quem será contra nós?", reference: "Romanos 8:31", book: "Romanos", chapter: 8, verse: 31 },
  { text: "Clama a mim, e responder-te-ei e anunciar-te-ei coisas grandes e firmes, que não sabes.", reference: "Jeremias 33:3", book: "Jeremias", chapter: 33, verse: 3 },
  { text: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", reference: "Salmos 37:5", book: "Salmos", chapter: 37, verse: 5 },
  { text: "Bem-aventurados os que têm fome e sede de justiça, porque eles serão fartos.", reference: "Mateus 5:6", book: "Mateus", chapter: 5, verse: 6 },
  { text: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", reference: "Salmos 46:1", book: "Salmos", chapter: 46, verse: 1 },
  { text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.", reference: "1 Coríntios 13:4", book: "1 Coríntios", chapter: 13, verse: 4 },
  { text: "Ora, a fé é o firme fundamento das coisas que se esperam e a prova das coisas que se não veem.", reference: "Hebreus 11:1", book: "Hebreus", chapter: 11, verse: 1 },
  { text: "Porque para Deus nada é impossível.", reference: "Lucas 1:37", book: "Lucas", chapter: 1, verse: 37 },
  { text: "Estas coisas vos tenho dito para que em mim tenhais paz. No mundo tereis tribulações; mas tende bom ânimo, eu venci o mundo.", reference: "João 16:33", book: "João", chapter: 16, verse: 33 },
  { text: "Dai graças em tudo, porque esta é a vontade de Deus em Cristo Jesus para convosco.", reference: "1 Tessalonicenses 5:18", book: "1 Tessalonicenses", chapter: 5, verse: 18 },
  { text: "Ensina-me a fazer a tua vontade, pois tu és o meu Deus; guie-me o teu bom Espírito por terra plana.", reference: "Salmos 143:10", book: "Salmos", chapter: 143, verse: 10 },
  { text: "Eis que estou à porta e bato; se alguém ouvir a minha voz e abrir a porta, entrarei em sua casa e com ele cearei, e ele comigo.", reference: "Apocalipse 3:20", book: "Apocalipse", chapter: 3, verse: 20 },
  { text: "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos.", reference: "Filipenses 4:4", book: "Filipenses", chapter: 4, verse: 4 },
  { text: "Pois onde estiver o vosso tesouro, aí estará também o vosso coração.", reference: "Mateus 6:21", book: "Mateus", chapter: 6, verse: 21 },
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const dateStr = brt.toISOString().split("T")[0];
    const seed = dateToSeed(dateStr);

    // Try DB first
    const { count } = await supabase
      .from("biblias")
      .select("id", { count: "exact", head: true })
      .eq("versao", "ARA");

    if (count && count > 0) {
      const offset = seed % count;
      const { data: verses } = await supabase
        .from("biblias")
        .select("id, livro_id, capitulo, versiculo, texto")
        .eq("versao", "ARA")
        .order("id", { ascending: true })
        .range(offset, offset);

      if (verses && verses.length > 0) {
        const verse = verses[0];
        const { data: book } = await supabase
          .from("livros_biblia")
          .select("nome")
          .eq("id", verse.livro_id)
          .maybeSingle();

        return new Response(JSON.stringify({
          date: dateStr,
          text: verse.texto,
          reference: `${book?.nome || "?"} ${verse.capitulo}:${verse.versiculo}`,
          book: book?.nome || "",
          chapter: verse.capitulo,
          verse: verse.versiculo,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback to embedded verses
    const fallback = FALLBACK_VERSES[seed % FALLBACK_VERSES.length];
    return new Response(JSON.stringify({
      date: dateStr,
      text: fallback.text,
      reference: fallback.reference,
      book: fallback.book,
      chapter: fallback.chapter,
      verse: fallback.verse,
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
