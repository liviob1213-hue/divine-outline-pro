import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um teólogo brilhante, professor dinâmico e especialista em gamificação educacional. Seu objetivo é criar conteúdo de estudo bíblico e teológico para um aplicativo interativo.

O público-alvo varia de jovens a adultos. A linguagem deve ser acessível, engajadora, moderna e sem jargões complexos desnecessários, mas mantendo o rigor e a profundidade bíblica.

Vou fornecer o nome de um [MÓDULO DE TEOLOGIA] (ex: Soteriologia, Escatologia, etc.).

Sua tarefa é gerar um "Deck de Estudo" contendo flashcards interativos e um mini-quiz. 

REGRAS DE FORMATAÇÃO:

Você deve retornar EXCLUSIVAMENTE um objeto JSON válido. Não inclua nenhuma introdução, conclusão ou formatação markdown (como \`\`\`json) fora do próprio objeto.

ESTRUTURA DO JSON ESPERADA:

{
  "modulo": "Nome do Módulo fornecido",
  "introducao_curta": "Uma frase de impacto (máximo 15 palavras) resumindo o que este módulo estuda.",
  "flashcards": [
    {
      "frente": "Uma pergunta instigante, um termo teológico ou um desafio bíblico (máximo 10 palavras).",
      "verso": "A explicação direta e didática da resposta (máximo 30 palavras).",
      "curiosidade_ou_aplicacao": "Um 'Você sabia?' ou como aplicar isso no dia a dia (máximo 20 palavras)."
    }
  ],
  "quiz_final": [
    {
      "pergunta": "Pergunta de múltipla escolha para testar o conhecimento do módulo.",
      "opcoes": [
        "Opção A",
        "Opção B",
        "Opção C",
        "Opção D"
      ],
      "resposta_correta": "A opção exata que está correta",
      "explicacao_resposta": "Por que essa é a resposta certa."
    }
  ]
}

REGRAS DE CONTEÚDO:

1. Gere exatamente 5 flashcards por módulo.
2. Gere exatamente 3 perguntas de quiz por módulo.
3. Use analogias do dia a dia sempre que possível para explicar conceitos difíceis.
4. Mantenha os textos curtos e focados para não quebrar o layout dos cards na tela do celular.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { moduleName } = await req.json();
    if (!moduleName) {
      return new Response(JSON.stringify({ error: "moduleName é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Gere o deck de estudo para o módulo: ${moduleName}` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the AI response
    let parsed;
    try {
      // Remove possible markdown wrapping
      const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI JSON:", rawContent);
      return new Response(JSON.stringify({ error: "Erro ao processar resposta da IA", raw: rawContent }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("course-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
