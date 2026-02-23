import { useState } from "react";
import { ArrowLeft, Search, ChevronDown, ChevronLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BIBLE_BOOKS, BIBLE_VERSIONS } from "@/lib/sermon-data";
import { BIBLE_CHAPTER_COUNT } from "@/lib/bible-chapters";
import BottomNav from "@/components/BottomNav";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/theology-chat`;

export default function Biblia() {
  const [version, setVersion] = useState(BIBLE_VERSIONS[0]);
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapterContent, setChapterContent] = useState("");
  const [loadingChapter, setLoadingChapter] = useState(false);

  const atBooks = BIBLE_BOOKS.slice(0, 39);
  const ntBooks = BIBLE_BOOKS.slice(39);

  const filterList = (list: string[]) =>
    list.filter((b) => b.toLowerCase().includes(search.toLowerCase()));

  const loadChapter = async (book: string, chapter: number) => {
    setSelectedChapter(chapter);
    setChapterContent("");
    setLoadingChapter(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Mostre o texto completo de ${book} capítulo ${chapter} na versão ${version}. Apenas o texto bíblico com os números dos versículos, sem comentários.`,
            },
          ],
        }),
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
    } catch {
      setChapterContent("Erro ao carregar o capítulo. Tente novamente.");
    } finally {
      setLoadingChapter(false);
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
        </div>

        {/* Version selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <label className="text-xs font-body font-medium text-muted-foreground mb-1.5 block">
            Versão da Bíblia
          </label>
          <div className="relative">
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-card text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
            >
              {BIBLE_VERSIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedChapter !== null && selectedBook ? (
            /* Chapter reading view */
            <motion.div key="chapter-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button
                onClick={() => { setSelectedChapter(null); setChapterContent(""); }}
                className="flex items-center gap-1 text-sm text-primary font-body font-semibold mb-4 hover:underline"
              >
                <ChevronLeft className="w-4 h-4" />
                {selectedBook} — Capítulos
              </button>
              <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
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
                <div className="text-sm font-body text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {chapterContent}
                </div>
              </div>
            </motion.div>
          ) : selectedBook ? (
            /* Chapter selection grid */
            <motion.div key="chapters" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button
                onClick={() => setSelectedBook(null)}
                className="flex items-center gap-1 text-sm text-primary font-body font-semibold mb-4 hover:underline"
              >
                <ChevronLeft className="w-4 h-4" />
                Livros
              </button>
              <h2 className="font-display text-lg font-bold text-foreground mb-3">{selectedBook}</h2>
              <p className="text-xs text-muted-foreground font-body mb-4">{chapterCount} capítulos</p>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 mb-6">
                {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => loadChapter(selectedBook, ch)}
                    className="aspect-square rounded-xl bg-card border border-border text-sm font-body font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center justify-center"
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Book selection */
            <motion.div key="books" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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

              {/* AT */}
              <section>
                <h2 className="text-xs font-body font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  📜 Antigo Testamento
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {filterList(atBooks).map((book) => (
                    <button
                      key={book}
                      onClick={() => setSelectedBook(book)}
                      className="text-left px-3 py-2.5 rounded-xl text-sm font-body transition-all border bg-card border-border hover:border-primary text-foreground"
                    >
                      {book}
                    </button>
                  ))}
                </div>
              </section>

              {/* NT */}
              <section>
                <h2 className="text-xs font-body font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  ✝️ Novo Testamento
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {filterList(ntBooks).map((book) => (
                    <button
                      key={book}
                      onClick={() => setSelectedBook(book)}
                      className="text-left px-3 py-2.5 rounded-xl text-sm font-body transition-all border bg-card border-border hover:border-primary text-foreground"
                    >
                      {book}
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
