import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Sparkles, ChevronDown, Send, Loader2, MessageCircle, Users, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  BIBLE_BOOKS,
  STUDY_TYPES,
  BIBLE_VERSIONS,
  ANALYSIS_OPTIONS,
  CATEGORY_ICONS,
} from "@/lib/sermon-data";
import BottomNav from "@/components/BottomNav";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/theology-chat`;

async function streamAI(
  messages: { role: string; content: string }[],
  onDelta: (chunk: string) => void
) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });
  if (!resp.ok || !resp.body) throw new Error("Erro");
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") break;
      try {
        const parsed = JSON.parse(json);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) { content += delta; onDelta(delta); }
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  return content;
}

export default function CriarEsboco() {
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [studyType, setStudyType] = useState(STUDY_TYPES[0]);
  const [bibleVersion, setBibleVersion] = useState(BIBLE_VERSIONS[0]);
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [verses, setVerses] = useState("");
  const [extraRefs, setExtraRefs] = useState<string[]>([""]);
  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<string>>(new Set());
  const [extraInstructions, setExtraInstructions] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // AI states
  const [generatedOutline, setGeneratedOutline] = useState("");
  const [generating, setGenerating] = useState(false);
  const [debateQuestions, setDebateQuestions] = useState("");
  const [generatingDebate, setGeneratingDebate] = useState(false);

  // Chat refinement
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages]);

  const toggleAnalysis = (id: string) => {
    setSelectedAnalyses((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  };
  const selectAll = () => setSelectedAnalyses(new Set(ANALYSIS_OPTIONS.map((a) => a.id)));
  const addExtraRef = () => setExtraRefs((p) => [...p, ""]);
  const removeExtraRef = (i: number) => setExtraRefs((p) => p.filter((_, idx) => idx !== i));

  const grouped = ANALYSIS_OPTIONS.reduce<Record<string, typeof ANALYSIS_OPTIONS>>(
    (acc, opt) => { (acc[opt.category] ??= []).push(opt); return acc; }, {}
  );

  const handleSubmit = async () => {
    if (!book || !chapter) return;
    setGenerating(true);
    setGeneratedOutline("");
    setDebateQuestions("");
    setChatMessages([]);

    const analyses = ANALYSIS_OPTIONS.filter((a) => selectedAnalyses.has(a.id)).map((a) => a.label).join(", ");
    const refs = extraRefs.filter(Boolean).join("; ");
    const prompt = `Crie um esboço de pregação completo e detalhado, seguindo EXATAMENTE a estrutura e o estilo abaixo.

**DADOS DA PREGAÇÃO:**
- Título: ${title || "Definir pelo contexto"}
- Tema: ${theme || "Definir pelo contexto"}
- Tipo de estudo: ${studyType}
- Versão bíblica: ${bibleVersion}
- Texto base: ${book} ${chapter}${verses ? `:${verses}` : ""}
${refs ? `- Referências adicionais: ${refs}` : ""}
${analyses ? `- Incluir análises: ${analyses}` : ""}
${extraInstructions ? `- Instruções extras: ${extraInstructions}` : ""}

**ESTRUTURA OBRIGATÓRIA DO ESBOÇO:**

## 📖 TEXTO BÍBLICO: [Referência completa]
## 🎯 TEMA: [Tema da pregação]

## 📖 INTRODUÇÃO
- Comece definindo os termos-chave do tema (ex: "O que é temer a Deus?", "O que é confiança?", "O que significa Messias?", "Quantos tipos de amor existem?"). Use definições claras, acessíveis e com base bíblica.
- Se o tema tiver categorias ou tipos, liste-os na introdução (ex: "Tipos de temor na Bíblia", "Tipos de amor", "Aspectos da fé"). Cada tipo deve vir acompanhado de uma breve explicação e versículo por extenso.
- Apresente o contexto do livro bíblico: quem escreveu, para quem, divisão do livro, época.
- Dê um panorama geral da passagem e dos principais pontos que serão abordados.
- Traga versículos bíblicos já na introdução que sustentem o contexto apresentado, sempre escritos POR EXTENSO.

## 📝 DESENVOLVIMENTO
Crie de **3 a 5 tópicos principais numerados** (1, 2, 3...). Para CADA tópico:
- Dê um título claro e objetivo ao tópico (exemplos de bons títulos: "Homens que temeram a Deus", "Os benefícios de temer a Deus", "Como posso temer a Deus?", "Deus nos convida a depositar a fé nEle", "Que dizem os homens acerca de Jesus?").
- Dentro de cada tópico, crie **no mínimo 4 a 6 subtópicos** detalhados e numerados.
- **REGRA CRUCIAL**: Em CADA subtópico, inclua pelo menos 1 versículo bíblico ESCRITO POR EXTENSO (não apenas a referência). Exemplo: *Romanos 10:17 "De sorte que a fé é pelo ouvir, e o ouvir pela palavra de Deus."*
- Os versículos devem ter LIGAÇÃO DIRETA com o subtópico e com o tema central da pregação.
- Quando o tópico for sobre personagens bíblicos, traga o nome, uma breve descrição do seu exemplo e o versículo-chave por extenso (ex: "Abraão — foi chamado amigo de Deus... Gênesis 22:12").
- Quando o tópico for sobre benefícios ou promessas, traga uma lista rica de versículos, cada um com sua referência e texto completo.
- Quando o tópico for sobre "Como fazer" (ex: "Como posso temer a Deus?"), traga subtópicos práticos (oração, santidade, vida no altar, obediência) com versículos de apoio.
- Traga aplicações práticas dentro dos subtópicos quando pertinente.
- Use linguagem pastoral, didática e acessível.
- Quando possível, faça conexões entre Antigo e Novo Testamento.
- Inclua listas quando apropriado (como "Quem é Jesus?" com múltiplos versículos, ou "Benefícios de temer a Deus" com sequência de Salmos).
- Você tem liberdade de criar tópicos e subtópicos adicionais e desenvolver cada um deles com profundidade e referências bíblicas.

## ✅ CONCLUSÃO
- Faça uma exortação pessoal e direta ao ouvinte.
- Traga de 2 a 3 versículos finais impactantes ESCRITOS POR EXTENSO que resumam toda a mensagem.
- Convide à reflexão e à decisão prática.

**REGRAS DE ESTILO (SIGA RIGOROSAMENTE):**
1. Cada tópico deve ter NO MÍNIMO 4 subtópicos, e cada subtópico DEVE conter pelo menos 1 versículo bíblico escrito por extenso.
2. Nunca coloque apenas a referência bíblica — sempre escreva o texto do versículo completo entre aspas.
3. Use negrito para termos-chave e nomes de conceitos teológicos.
4. A estrutura deve ser organizada e visualmente clara com numeração e subtítulos.
5. O esboço deve ser EXTENSO e DETALHADO, com riqueza de referências bíblicas cruzadas de diferentes livros.
6. Traga versículos de diferentes livros da Bíblia (Salmos, Provérbios, Evangelhos, Epístolas, etc.) para enriquecer cada ponto.
7. A linguagem deve ser pastoral — como se estivesse ensinando a uma congregação real.
8. Varie os tipos de tópicos: personagens bíblicos, benefícios/promessas, definições teológicas, aplicação prática, listas de versículos temáticos.`;

    try {
      await streamAI(
        [{ role: "user", content: prompt }],
        (chunk) => setGeneratedOutline((prev) => prev + chunk)
      );
    } catch {
      setGeneratedOutline("Erro ao gerar o esboço. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const generateDebateQuestions = async () => {
    if (!generatedOutline) return;
    setGeneratingDebate(true);
    setDebateQuestions("");

    try {
      await streamAI(
        [{
          role: "user",
          content: `Com base neste esboço de pregação, crie 5 perguntas de debate para líderes de pequenos grupos usarem durante a semana. As perguntas devem ser reflexivas, práticas e gerar discussão em grupo.\n\nEsboço:\n${generatedOutline}`,
        }],
        (chunk) => setDebateQuestions((prev) => prev + chunk)
      );
    } catch {
      setDebateQuestions("Erro ao gerar perguntas.");
    } finally {
      setGeneratingDebate(false);
    }
  };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    const userMsg = { role: "user" as const, content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    let assistantContent = "";
    const context = [
      { role: "system", content: `Você é um assistente de esboços de pregação. O esboço atual é:\n\n${generatedOutline}\n\nO usuário quer refinar este esboço. Responda em português.` },
      ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: text },
    ];

    try {
      await streamAI(context, (chunk) => {
        assistantContent += chunk;
        setChatMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      });
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Erro ao processar. Tente novamente." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                Criar Esboço
              </h1>
              <p className="text-xs text-muted-foreground font-body">Defina a referência e gere com IA</p>
            </div>
          </div>
        </div>

        <div className={`${generatedOutline ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}`}>
          {/* Left: Form or Generated Outline */}
          <div>
            {!generatedOutline ? (
              <>
                {/* Step 1 */}
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl shadow-card p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold font-body">1</span>
                    <h2 className="font-display text-base font-semibold">Informações Básicas</h2>
                  </div>
                  <div className="space-y-3">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do Esboço" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring" />
                    <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Tema (opcional)" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <select value={studyType} onChange={(e) => setStudyType(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                          {STUDY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                      <div className="relative">
                        <select value={bibleVersion} onChange={(e) => setBibleVersion(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                          {BIBLE_VERSIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Step 2 */}
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-card p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold font-body">2</span>
                    <h2 className="font-display text-base font-semibold">Referência Bíblica</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <select value={book} onChange={(e) => setBook(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                        <option value="">Selecione um livro</option>
                        {BIBLE_BOOKS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" min="1" value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="Capítulo *" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring" />
                      <input type="text" value={verses} onChange={(e) => setVerses(e.target.value)} placeholder="Versículos (1-5)" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    {extraRefs.map((ref, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="text" value={ref} onChange={(e) => { const n = [...extraRefs]; n[i] = e.target.value; setExtraRefs(n); }} placeholder="Referência extra" className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring" />
                        {extraRefs.length > 1 && <button onClick={() => removeExtraRef(i)} className="p-2 rounded-lg border border-input text-muted-foreground hover:text-destructive"><Minus className="w-4 h-4" /></button>}
                      </div>
                    ))}
                    <button onClick={addExtraRef} className="inline-flex items-center gap-1 text-xs font-body font-semibold text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg hover:bg-secondary/20"><Plus className="w-3 h-3" /> Adicionar referência</button>
                  </div>
                </motion.section>

                {/* Step 3 */}
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl shadow-card p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold font-body">3</span>
                      <h2 className="font-display text-base font-semibold">Análises</h2>
                    </div>
                    <button onClick={selectAll} className="text-xs font-body font-semibold text-secondary hover:underline">Todas ({ANALYSIS_OPTIONS.length})</button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(grouped).map(([category, options]) => {
                      const isExpanded = expandedCategories.has(category);
                      const selectedCount = options.filter((o) => selectedAnalyses.has(o.id)).length;
                      return (
                        <div key={category} className="border border-border rounded-lg overflow-hidden">
                          <button onClick={() => toggleCategory(category)} className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/50 hover:bg-muted transition-colors">
                            <span className="flex items-center gap-2 text-xs font-body font-semibold text-foreground">
                              <span>{CATEGORY_ICONS[category]}</span>{category}
                            </span>
                            <span className="flex items-center gap-1.5">
                              {selectedCount > 0 && <span className="text-[9px] font-body font-bold bg-secondary text-secondary-foreground rounded-full px-1.5 py-0.5">{selectedCount}</span>}
                              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </span>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="px-3 py-1.5 space-y-0.5">
                                  {options.map((opt) => (
                                    <label key={opt.id} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-muted/50 cursor-pointer text-xs font-body text-foreground">
                                      <input type="checkbox" checked={selectedAnalyses.has(opt.id)} onChange={() => toggleAnalysis(opt.id)} className="w-3.5 h-3.5 rounded border-border accent-secondary" />
                                      {opt.label}
                                    </label>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>

                {/* Extra instructions */}
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl shadow-card p-5 mb-4">
                  <h2 className="font-display text-base font-semibold mb-3">✏️ Instruções Extras</h2>
                  <textarea value={extraInstructions} onChange={(e) => setExtraInstructions(e.target.value)} placeholder="Ex: Foque em aplicações para jovens..." rows={3} className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </motion.section>

                {/* Submit */}
                <div className="flex items-center gap-3 mb-6">
                  <Link to="/" className="flex-1 py-3 text-center rounded-xl border border-border text-sm font-body font-medium text-muted-foreground hover:bg-muted">Cancelar</Link>
                  <button onClick={handleSubmit} disabled={!book || !chapter || generating} className="flex-1 py-3 rounded-xl bg-gradient-gold text-primary text-sm font-body font-bold flex items-center justify-center gap-2 shadow-gold hover:scale-[1.02] transition-transform disabled:opacity-50">
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generating ? "Gerando..." : "Criar Esboço"}
                  </button>
                </div>
              </>
            ) : (
              /* Generated Outline */
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => { setGeneratedOutline(""); setDebateQuestions(""); setChatMessages([]); }} className="text-xs text-secondary font-body font-semibold hover:underline flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Novo esboço
                  </button>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border shadow-card mb-4">
                  <div id="outline-content" className="prose prose-sm max-w-none text-foreground [&_strong]:text-primary [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-foreground/90">
                    <ReactMarkdown>{generatedOutline}</ReactMarkdown>
                  </div>
                </div>

                {/* Export PDF + Debate buttons */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (!printWindow) return;
                      const content = document.getElementById('outline-content')?.innerHTML || '';
                      printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Esboço - Palavraai</title><style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Inter', sans-serif; color: #1a1a2e; padding: 40px; line-height: 1.7; }
                        h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #1a1a2e; }
                        h2 { font-size: 18px; font-weight: 700; margin-top: 28px; margin-bottom: 12px; color: #2d2d5e; border-bottom: 2px solid #6c5ce7; padding-bottom: 6px; }
                        h3 { font-size: 15px; font-weight: 600; margin-top: 20px; margin-bottom: 8px; color: #3d3d7e; }
                        p { margin-bottom: 10px; font-size: 13px; }
                        strong { color: #6c5ce7; }
                        ul, ol { margin-left: 20px; margin-bottom: 12px; }
                        li { margin-bottom: 6px; font-size: 13px; }
                        blockquote { border-left: 3px solid #6c5ce7; padding-left: 14px; margin: 14px 0; color: #555; font-style: italic; }
                        hr { border: none; border-top: 1px solid #e0e0e0; margin: 20px 0; }
                        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #6c5ce7; }
                        .header img { width: 60px; margin-bottom: 8px; }
                        .header p { font-size: 11px; color: #888; }
                        .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #aaa; }
                        @media print { body { padding: 20px; } @page { margin: 15mm; } }
                      </style></head><body>
                        <div class="header">
                          <h1>📖 Esboço de Pregação</h1>
                          <p>Gerado por Palavraai • ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        ${content}
                        <div class="footer">Palavraai — Ferramenta de estudo bíblico e pregação</div>
                      </body></html>`);
                      printWindow.document.close();
                      setTimeout(() => { printWindow.print(); }, 500);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-gold text-primary text-sm font-body font-bold flex items-center justify-center gap-2 shadow-gold hover:scale-[1.02] transition-transform"
                  >
                    <FileDown className="w-4 h-4" />
                    Exportar PDF
                  </button>
                  <button
                    onClick={generateDebateQuestions}
                    disabled={generatingDebate}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-navy to-navy-deep text-primary-foreground text-sm font-body font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    {generatingDebate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    {generatingDebate ? "Gerando..." : "Gerar 5 Perguntas"}
                  </button>
                </div>

                {debateQuestions && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border shadow-card mb-4">
                    <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-secondary" /> Perguntas para Pequenos Grupos
                    </h3>
                    <div className="prose prose-sm max-w-none text-foreground [&_strong]:text-primary [&_li]:text-foreground/90">
                      <ReactMarkdown>{debateQuestions}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right: Chat Refinement (only when outline exists) */}
          {generatedOutline && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-[calc(100vh-120px)] sticky top-20">
              <div className="bg-card rounded-2xl border border-border shadow-card flex flex-col flex-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-secondary" /> Refinar Esboço
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-body">Peça ajustes ou mudanças no esboço</p>
                </div>

                <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground font-body">Exemplos:</p>
                      <div className="flex flex-col gap-1.5 mt-2">
                        {["Resuma o ponto 2", "Dê outro versículo para o ponto 3", "Torne mais prático"].map((s) => (
                          <button key={s} onClick={() => setChatInput(s)} className="text-[11px] font-body text-foreground bg-muted/50 rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs font-body ${
                        msg.role === "user" ? "bg-secondary text-secondary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-xs max-w-none text-foreground [&_strong]:text-foreground">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && chatMessages[chatMessages.length - 1]?.role !== "assistant" && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-xl rounded-bl-sm px-3 py-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-3 py-2.5 border-t border-border">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                      placeholder="Peça ajustes no esboço..."
                      rows={1}
                      className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-xs font-body focus:outline-none focus:ring-2 focus:ring-ring resize-none max-h-20"
                    />
                    <button onClick={sendChatMessage} disabled={!chatInput.trim() || chatLoading} className="p-2 rounded-lg bg-gradient-gold text-primary shadow-gold disabled:opacity-50 hover:scale-105 transition-transform">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
