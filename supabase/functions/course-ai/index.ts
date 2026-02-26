import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FLASHCARD_PROMPT = `Você é um teólogo brilhante, professor dinâmico e especialista em gamificação educacional. Seu objetivo é criar conteúdo de estudo bíblico e teológico para um aplicativo interativo.

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

const BOOK_LIST_PROMPT = `Você é um teólogo especialista. Dado o nome de um módulo/categoria de estudo bíblico, retorne uma lista de livros bíblicos que pertencem a essa categoria.

Retorne EXCLUSIVAMENTE um JSON válido sem markdown. Estrutura:

{
  "type": "book_list",
  "category": "Nome da categoria",
  "books": [
    { "name": "Nome do livro", "description": "Breve descrição em até 12 palavras", "emoji": "📖" }
  ]
}

Retorne entre 3 e 20 livros conforme a categoria.`;

const DEEP_STUDY_PROMPT = `Você é um teólogo brilhante e professor didático. Gere um estudo aprofundado sobre um livro ou tema bíblico específico.

Retorne EXCLUSIVAMENTE um JSON válido sem markdown. Estrutura:

{
  "type": "deep_study",
  "title": "Título do estudo",
  "introduction": "Um parágrafo introdutório envolvente de 2-3 frases.",
  "sections": [
    {
      "subtitle": "Subtítulo da seção",
      "content": "Conteúdo detalhado da seção com 3-5 frases. Use linguagem acessível e rica."
    }
  ],
  "key_verse": {
    "reference": "Referência bíblica (ex: João 3:16)",
    "text": "Texto do versículo"
  },
  "practical_application": "Uma aplicação prática para o dia a dia em 2-3 frases."
}

REGRAS:
1. Gere exatamente 4-6 seções.
2. Use linguagem acessível mas com profundidade teológica.
3. Inclua contexto histórico, significado teológico e aplicação prática.
4. O versículo-chave deve ser o mais representativo do tema.`;

async function callAI(systemPrompt: string, userMessage: string) {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const t = await response.text();
    console.error("OpenAI error:", response.status, t);
    if (response.status === 429) throw new Error("Limite de requisições excedido. Tente novamente em alguns segundos.");
    if (response.status === 402) throw new Error("Créditos da API esgotados.");
    throw new Error(`Erro no serviço de IA (${response.status}): ${t}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || "";
  const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { moduleName, mode, bookName } = body;

    if (!moduleName && !bookName) {
      return new Response(JSON.stringify({ error: "moduleName ou bookName é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;

    if (mode === "book_list") {
      parsed = await callAI(BOOK_LIST_PROMPT, `Liste os livros bíblicos da categoria: ${moduleName}`);
    } else if (mode === "deep_study") {
      const topic = bookName || moduleName;
      parsed = await callAI(DEEP_STUDY_PROMPT, `Gere um estudo aprofundado sobre: ${topic}`);
    } else {
      // Default: flashcards mode
      parsed = await callAI(FLASHCARD_PROMPT, `Gere o deck de estudo para o módulo: ${moduleName}`);
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
