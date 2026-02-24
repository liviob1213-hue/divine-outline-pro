import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Search, ChevronLeft, Loader2, Languages, WifiOff, BookOpen, ScrollText } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BIBLE_BOOKS, BIBLE_VERSIONS } from "@/lib/sermon-data";
import { BIBLE_CHAPTER_COUNT } from "@/lib/bible-chapters";
import { saveReadingState } from "@/components/ContinueReading";
import { cacheBibleChapter, getCachedBibleChapter, isOnline, onNetworkChange } from "@/lib/offline-cache";
import BottomNav from "@/components/BottomNav";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/theology-chat`;
const BIBLE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bible-lookup`;

const VERSIONS_WITH_HEBREW = [
  ...BIBLE_VERSIONS,
  "Bíblia Hebraica (Tanakh)",
];

// Extract abbreviation from version name e.g. "Almeida Corrigida e Fiel (ACF)" -> "ACF"
const getAbbrev = (v: string) => {
  const match = v.match(/\(([^)]+)\)/);
  return match ? match[1] : v.slice(0, 3).toUpperCase();
};

// Assign a subtle gradient accent per version
const VERSION_COLORS: Record<string, string> = {
  ACF: "from-violet-500/10 to-purple-500/10 border-violet-500/20",
  ARA: "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
  ARC: "from-sky-500/10 to-cyan-500/10 border-sky-500/20",
  AS21: "from-teal-500/10 to-emerald-500/10 border-teal-500/20",
  JFAA: "from-emerald-500/10 to-green-500/10 border-emerald-500/20",
  KJA: "from-amber-500/10 to-yellow-500/10 border-amber-500/20",
  KJF: "from-orange-500/10 to-amber-500/10 border-orange-500/20",
  NAA: "from-rose-500/10 to-pink-500/10 border-rose-500/20",
  NBV: "from-pink-500/10 to-fuchsia-500/10 border-pink-500/20",
  NTLH: "from-fuchsia-500/10 to-purple-500/10 border-fuchsia-500/20",
  NVI: "from-indigo-500/10 to-violet-500/10 border-indigo-500/20",
  NVT: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20",
  TB: "from-slate-500/10 to-gray-500/10 border-slate-500/20",
  TAN: "from-amber-600/10 to-yellow-600/10 border-amber-600/20",
};

const getVersionColor = (v: string) => {
  const abbrev = getAbbrev(v);
  return VERSION_COLORS[abbrev] || VERSION_COLORS["ACF"];
};

const ACCENT_DOTS: Record<string, string> = {
  ACF: "bg-violet-400", ARA: "bg-blue-400", ARC: "bg-sky-400", AS21: "bg-teal-400",
  JFAA: "bg-emerald-400", KJA: "bg-amber-400", KJF: "bg-orange-400", NAA: "bg-rose-400",
  NBV: "bg-pink-400", NTLH: "bg-fuchsia-400", NVI: "bg-indigo-400", NVT: "bg-cyan-400",
  TB: "bg-slate-400", TAN: "bg-amber-500",
};

export default function Biblia() {
  const [searchParams] = useSearchParams();
  const [version, setVersion] = useState(VERSIONS_WITH_HEBREW[0]);
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<string | null>(searchParams.get("book"));
  const [selectedChapter, setSelectedChapter] = useState<number | null>(
    searchParams.get("chapter") ? Number(searchParams.get("chapter")) : null
  );
  const [chapterContent, setChapterContent] = useState("");
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordContext, setWordContext] = useState("");
  const [loadingWord, setLoadingWord] = useState(false);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    return onNetworkChange(setOnline);
  }, []);

  useEffect(() => {
    const book = searchParams.get("book");
    const chapter = searchParams.get("chapter");
    if (book && chapter && !chapterContent && !loadingChapter) {
      loadChapter(book, Number(chapter));
    }
  }, []);

  const atBooks = BIBLE_BOOKS.slice(0, 39);
  const ntBooks = BIBLE_BOOKS.slice(39);

  const filterList = (list: string[]) =>
    list.filter((b) => b.toLowerCase().includes(search.toLowerCase()));

  const loadChapter = async (book: string, chapter: number) => {
    setSelectedChapter(chapter);
    setChapterContent("");
    setLoadingChapter(true);
    saveReadingState(book, chapter, version);

    try {
      const cached = await getCachedBibleChapter(version, book, chapter);
      if (cached) {
        setChapterContent(cached);
        setLoadingChapter(false);
        return;
      }
    } catch {}

    if (!online) {
      setChapterContent("Sem conexão. Este capítulo ainda não foi salvo offline. Conecte-se à internet para carregá-lo pela primeira vez.");
      setLoadingChapter(false);
      return;
    }

    const isHebrew = version === "Bíblia Hebraica (Tanakh)";

    if (!isHebrew) {
      try {
        const dbResp = await fetch(BIBLE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ book, chapter, version }),
        });

        if (dbResp.ok) {
          const dbData = await dbResp.json();
          if (dbData.source === "db" && dbData.verses?.length > 0) {
            const text = dbData.verses
              .map((v: { versiculo: number; texto: string }) => `${v.versiculo} ${v.texto}`)
              .join("\n");
            setChapterContent(text);
            cacheBibleChapter(version, book, chapter, text).catch(() => {});
            setLoadingChapter(false);
            return;
          }
        }
      } catch {}
    }

    const prompt = isHebrew
      ? `Mostre o texto de ${book} capítulo ${chapter} em hebraico com transliteração e tradução literal. Formato: cada versículo com o texto hebraico, transliteração e tradução. NÃO use formatação markdown, asteriscos, negrito ou itálico. Texto puro.`
      : `Mostre o texto completo de ${book} capítulo ${chapter} na versão ${version}. Apenas o texto bíblico com os números dos versículos, sem comentários. NÃO use formatação markdown, asteriscos, negrito ou itálico. Texto puro.`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
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
            if (delta) {
              content += delta;
              setChapterContent(content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
      if (content) {
        cacheBibleChapter(version, book, chapter, content).catch(() => {});
      }
    } catch {
      setChapterContent("Erro ao carregar o capítulo. Tente novamente.");
    } finally {
      setLoadingChapter(false);
    }
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 1 && text.length < 60) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        setSelectedWord(text);
        setPopupPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
        setWordContext("");
      }
    }
  }, []);

  const explainWord = async (mode: "translate" | "context") => {
    if (!selectedWord) return;
    setLoadingWord(true);
    setWordContext("");

    const prompt = mode === "translate"
      ? `Traduza a palavra/expressão "${selectedWord}" para hebraico. Forneça: 1) A palavra em hebraico 2) Transliteração 3) Significado literal 4) Uso bíblico. Seja breve e direto.`
      : `Explique a palavra/expressão bíblica "${selectedWord}" no contexto de ${selectedBook} ${selectedChapter}. Forneça: 1) Significado original 2) Contexto cultural/histórico 3) Aplicação teológica. Seja breve.`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
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
            if (delta) {
              content += delta;
              setWordContext(content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch {
      setWordContext("Erro ao buscar informações.");
    } finally {
      setLoadingWord(false);
    }
  };

  const chapterCount = selectedBook ? BIBLE_CHAPTER_COUNT[selectedBook] || 0 : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground">Bíblia Sagrada</h1>
          </div>
          {!online && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
              <WifiOff className="w-3 h-3" />
              <span className="text-[10px] font-body font-bold">Offline</span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedChapter !== null && selectedBook ? (
            /* ==================== CHAPTER VIEW ==================== */
            <motion.div key="chapter-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button
                onClick={() => { setSelectedChapter(null); setChapterContent(""); setSelectedWord(null); }}
                className="flex items-center gap-1 text-sm font-body font-semibold mb-4 text-primary hover:underline"
              >
                <ChevronLeft className="w-4 h-4" />
                {selectedBook} — Capítulos
              </button>

              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-card border border-border">
                <Languages className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <p className="text-[10px] text-muted-foreground font-body">
                  Selecione qualquer palavra para traduzir para hebraico ou obter contexto bíblico
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border shadow-[0_2px_20px_-4px_hsl(var(--primary)/0.08)]">
                <h3 className="font-display text-lg font-bold mb-1 text-foreground">
                  {selectedBook} {selectedChapter}
                </h3>
                <p className="text-[10px] text-muted-foreground font-body mb-4">{version}</p>
                {loadingChapter && !chapterContent && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-body">Carregando capítulo...</span>
                  </div>
                )}
                <div
                  className="text-sm font-body text-foreground/90 leading-relaxed whitespace-pre-wrap"
                  onMouseUp={handleTextSelection}
                  onTouchEnd={handleTextSelection}
                >
                  {chapterContent.replace(/\*\*/g, "").replace(/\*/g, "")}
                </div>
              </div>

              {/* Word popup */}
              <AnimatePresence>
                {selectedWord && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="fixed inset-x-4 bottom-24 z-50 max-w-lg mx-auto"
                  >
                    <div className="bg-card rounded-2xl p-4 border border-border shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-body text-muted-foreground">
                          Palavra: <span className="font-bold text-foreground">"{selectedWord}"</span>
                        </p>
                        <button onClick={() => { setSelectedWord(null); setWordContext(""); }} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                      </div>

                      {!wordContext && !loadingWord && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => explainWord("translate")}
                            className="flex-1 py-2 rounded-xl text-xs font-body font-semibold text-white"
                            style={{ background: "var(--gradient-card-pink)" }}
                          >
                            🔤 Traduzir p/ Hebraico
                          </button>
                          <button
                            onClick={() => explainWord("context")}
                            className="flex-1 py-2 rounded-xl text-xs font-body font-semibold text-white"
                            style={{ background: "var(--gradient-card-purple)" }}
                          >
                            📖 Contexto e Explicação
                          </button>
                        </div>
                      )}

                      {loadingWord && !wordContext && (
                        <div className="flex items-center gap-2 text-muted-foreground py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs font-body">Analisando...</span>
                        </div>
                      )}

                      {wordContext && (
                        <div className="text-xs font-body text-foreground/90 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {wordContext.replace(/\*\*/g, "").replace(/\*/g, "")}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          ) : selectedBook ? (
            /* ==================== CHAPTERS GRID ==================== */
            <motion.div key="chapters" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button
                onClick={() => setSelectedBook(null)}
                className="flex items-center gap-1 text-sm font-body font-semibold mb-4 text-primary hover:underline"
              >
                <ChevronLeft className="w-4 h-4" />
                Livros
              </button>
              <h2 className="font-display text-lg font-bold text-foreground mb-3">{selectedBook}</h2>
              <p className="text-xs text-muted-foreground font-body mb-4">{chapterCount} capítulos</p>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 mb-6">
                {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
                  <motion.button
                    key={ch}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => loadChapter(selectedBook, ch)}
                    className="aspect-square rounded-xl bg-card border border-border text-sm font-body font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center justify-center shadow-[0_1px_4px_0_hsl(var(--primary)/0.06)]"
                  >
                    {ch}
                  </motion.button>
                ))}
              </div>
            </motion.div>

          ) : (
            /* ==================== VERSION + BOOKS SELECTION ==================== */
            <motion.div key="books" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {/* Version Cards */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <label className="text-xs font-body font-bold uppercase tracking-widest text-muted-foreground mb-3 block">
                  📖 Escolha a Versão
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {VERSIONS_WITH_HEBREW.map((v) => {
                    const abbrev = getAbbrev(v);
                    const isSelected = version === v;
                    const colorClass = getVersionColor(v);
                    const dotColor = ACCENT_DOTS[abbrev] || "bg-violet-400";
                    return (
                      <motion.button
                        key={v}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setVersion(v)}
                        className={`relative rounded-xl p-3 text-left transition-all duration-200 border backdrop-blur-sm
                          ${isSelected
                            ? `bg-gradient-to-br ${colorClass} border-primary shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.25),0_0_0_1px_hsl(var(--primary)/0.15)] ring-1 ring-primary/30`
                            : `bg-card/60 border-border hover:border-muted-foreground/30 shadow-[0_1px_6px_-2px_hsl(0_0%_0%/0.15)]`
                          }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? dotColor : "bg-muted-foreground/30"}`} />
                          <span className={`text-xs font-body font-bold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                            {abbrev}
                          </span>
                        </div>
                        <p className="text-[9px] font-body text-muted-foreground leading-tight line-clamp-2">
                          {v.replace(/\s*\([^)]*\)/, "")}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Search */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar livro..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </motion.div>

              {/* AT Section */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 shadow-[0_2px_12px_-4px_hsl(35_95%_50%/0.15)]">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-[0_2px_8px_-2px_hsl(35_95%_50%/0.4)]">
                    <ScrollText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-display font-bold text-foreground">Antigo Testamento</h2>
                    <p className="text-[10px] font-body text-muted-foreground">39 livros • Gênesis a Malaquias</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {filterList(atBooks).map((book, i) => (
                    <motion.button
                      key={book}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.02 * i }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedBook(book)}
                      className="text-left px-3.5 py-3 rounded-xl text-sm font-body transition-all duration-200 border bg-card border-border hover:border-amber-500/40 hover:shadow-[0_2px_12px_-4px_hsl(35_95%_50%/0.15)] text-foreground group"
                    >
                      <span className="group-hover:text-amber-400 transition-colors">{book}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* NT Section */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 shadow-[0_2px_12px_-4px_hsl(262_70%_50%/0.15)]">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_2px_8px_-2px_hsl(262_70%_50%/0.4)]">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-display font-bold text-foreground">Novo Testamento</h2>
                    <p className="text-[10px] font-body text-muted-foreground">27 livros • Mateus a Apocalipse</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {filterList(ntBooks).map((book, i) => (
                    <motion.button
                      key={book}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.02 * i }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedBook(book)}
                      className="text-left px-3.5 py-3 rounded-xl text-sm font-body transition-all duration-200 border bg-card border-border hover:border-violet-500/40 hover:shadow-[0_2px_12px_-4px_hsl(262_70%_50%/0.15)] text-foreground group"
                    >
                      <span className="group-hover:text-violet-400 transition-colors">{book}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
