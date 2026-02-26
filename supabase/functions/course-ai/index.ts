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

const DEEP_STUDY_PROMPT = `Você é um teólogo e acadêmico especializado em estudos bíblicos profundos. Sua função é gerar material de estudo detalhado e denso para um aplicativo de teologia.

O usuário irá enviar o nome de um TÓPICO ou MÓDULO.

Você deve retornar EXCLUSIVAMENTE um objeto JSON válido, seguindo UMA das duas estruturas abaixo, dependendo da situação:

CENÁRIO 1: TÓPICOS ABRANGENTES (Seleção de Livros)

Se o tópico for uma categoria que agrupa vários livros (ex: "Livros Históricos", "Livros Poéticos", "Pentateuco", "Epístolas Paulinas", "Evangelhos Sinóticos"), você NÃO deve gerar o estudo ainda. Você deve retornar a lista de livros que compõem essa categoria para o usuário escolher.

Estrutura JSON (Cenário 1):

{
  "tipo": "selecao_livros",
  "titulo_categoria": "Livros Históricos",
  "descricao_curta": "Escolha um dos livros abaixo para gerar um estudo profundo.",
  "livros": ["Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester"]
}

CENÁRIO 2: TÓPICO ESPECÍFICO OU LIVRO ESPECÍFICO (Estudo Profundo)

Se o tópico for um assunto específico (ex: "Apocalipse", "Soteriologia", "Hermenêutica", ou um livro específico escolhido no Cenário 1 como "Gênesis"), você deve gerar um ESTUDO COMPLETO, EXTENSO, DENSO e ARTICULADO.

Estrutura JSON (Cenário 2):

{
  "tipo": "estudo_profundo",
  "estudo": {
    "titulo": "Estudo Completo: O Livro de Apocalipse",
    "introducao": "Dois ou três parágrafos densos e teológicos introduzindo o tema, autoria, data, contexto histórico e relevância para a igreja.",
    "secoes": [
      {
        "subtitulo": "Contexto Histórico e Autoria",
        "conteudo": "3 a 4 parágrafos detalhados sobre o contexto histórico, político e social da época. Quem escreveu, quando, onde e para quem. Inclua detalhes acadêmicos."
      },
      {
        "subtitulo": "Tema Central e Propósito",
        "conteudo": "3 a 4 parágrafos explicando o tema principal do livro/tópico, seu propósito teológico e sua mensagem central."
      },
      {
        "subtitulo": "Estrutura Literária e Gênero",
        "conteudo": "2 a 3 parágrafos analisando a estrutura do texto, o gênero literário, recursos estilísticos e características marcantes."
      },
      {
        "subtitulo": "Principais Doutrinas e Ensinamentos",
        "conteudo": "3 a 4 parágrafos sobre as doutrinas fundamentais presentes, com referências bíblicas específicas."
      },
      {
        "subtitulo": "Interpretações Teológicas",
        "conteudo": "2 a 3 parágrafos apresentando diferentes correntes interpretativas (se aplicável) com seus principais defensores."
      },
      {
        "subtitulo": "Versículos-chave e Passagens Importantes",
        "conteudo": "2 a 3 parágrafos destacando os versículos mais importantes com explicação contextual de cada um."
      },
      {
        "subtitulo": "Relevância Contemporânea",
        "conteudo": "2 a 3 parágrafos sobre como este tema/livro se aplica ao cristianismo atual e à vida da igreja."
      }
    ],
    "aplicacao_pratica": "Dois parágrafos detalhados sobre como aplicar este conhecimento teológico na vida prática cristã hoje, incluindo reflexões para estudo pessoal e em grupo."
  }
}

REGRAS IMPORTANTES:
1. Cada seção deve ter conteúdo EXTENSO com múltiplos parágrafos separados por quebras de linha.
2. Use referências bíblicas específicas (ex: João 3:16, Romanos 8:28).
3. Inclua dados históricos e acadêmicos quando relevante.
4. O estudo deve ter no MÍNIMO 6 seções.
5. O conteúdo total deve ser equivalente a pelo menos 2000 palavras.

REGRA ABSOLUTA: Retorne APENAS o JSON. Nenhuma palavra a mais.`;


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
    throw new Error(`Erro no serviço de IA (${response.status}): ${t}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || "";
  
  // Robust JSON extraction
  let cleaned = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const jsonStart = cleaned.search(/[\{\[]/);
  const jsonEnd = cleaned.lastIndexOf(jsonStart !== -1 && cleaned[jsonStart] === '[' ? ']' : '}');
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("Nenhum JSON encontrado na resposta da IA");
  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fix common issues: trailing commas, control chars
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, "");
    return JSON.parse(cleaned);
  }
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

    if (mode === "deep_study") {
      if (bookName) {
        // A specific book was selected — force deep study generation
        parsed = await callAI(
          DEEP_STUDY_PROMPT,
          `O usuário já escolheu o livro "${bookName}". Gere OBRIGATORIAMENTE um estudo profundo (tipo "estudo_profundo") sobre este livro. NÃO retorne uma lista de livros.`
        );
      } else {
        // Let the AI decide: book list or direct study
        parsed = await callAI(DEEP_STUDY_PROMPT, moduleName);
      }
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
