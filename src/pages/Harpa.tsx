import { useState } from "react";
import { ArrowLeft, Search, Music, Send, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import BottomNav from "@/components/BottomNav";

const SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-hinos`;

interface Hino {
  id: number;
  titulo: string;
  coro: string | null;
  letra_completa: string;
}

export default function Harpa() {
  const [query, setQuery] = useState("");
  const [dbResults, setDbResults] = useState<Hino[]>([]);
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedHino, setExpandedHino] = useState<number | null>(null);

  const searchHymns = async () => {
    const text = query.trim();
    if (!text || loading) return;
    setDbResults([]);
    setAiResult("");
    setLoading(true);

    try {
      const resp = await fetch(SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ query: text }),
      });

      if (!resp.ok) throw new Error("Erro");

      const contentType = resp.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await resp.json();
        if (data.source === "db" && data.results?.length > 0) {
          setDbResults(data.results);
        } else {
          setAiResult("Nenhum hino encontrado no banco de dados.");
        }
      } else if (contentType.includes("text/event-stream") && resp.body) {
        // AI streaming fallback
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
                setAiResult(content);
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      }
    } catch {
      setAiResult("Erro ao buscar hinos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Harpa Cristã
            </h1>
            <p className="text-xs text-muted-foreground font-body">640 hinos — busca no banco de dados com fallback IA</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") searchHymns(); }}
                placeholder="Ex: hinos sobre o Espírito Santo, número do hino..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={searchHymns}
              disabled={!query.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-gold text-primary-foreground shadow-gold disabled:opacity-50 hover:scale-105 transition-transform"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>

        {/* Suggestions */}
        {!dbResults.length && !aiResult && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-xs text-muted-foreground font-body mb-3">Sugestões de busca:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Chuvas de Graça",
                "Espírito Santo",
                "Louvor de adoração",
                "Volta de Cristo",
                "Santa Ceia",
                "Consagração",
                "1",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); }}
                  className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-body text-foreground hover:border-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* DB Results */}
        {dbResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-xs text-muted-foreground font-body">
              🎵 {dbResults.length} hino(s) encontrado(s) no banco de dados
            </p>
            {dbResults.map((hino) => (
              <motion.div
                key={hino.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedHino(expandedHino === hino.id ? null : hino.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary font-display min-w-[2.5rem]">
                      {hino.id}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-foreground text-sm">{hino.titulo}</h3>
                      {hino.coro && (
                        <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">
                          {hino.coro}
                        </p>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {expandedHino === hino.id ? "▲" : "▼"}
                    </span>
                  </div>
                </button>
                {expandedHino === hino.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    className="px-4 pb-4"
                  >
                    <div className="border-t border-border pt-3">
                      <pre className="text-xs font-body text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {hino.letra_completa}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* AI Fallback Results */}
        {(aiResult || (loading && !dbResults.length)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-5 border border-border shadow-card"
          >
            {loading && !aiResult && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-body">Buscando hinos...</span>
              </div>
            )}
            {aiResult && (
              <>
                <p className="text-[10px] text-muted-foreground font-body mb-2">🤖 Resposta da IA (hino não encontrado no banco)</p>
                <div className="prose prose-sm prose-invert max-w-none text-foreground [&_strong]:text-primary [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground">
                  <ReactMarkdown>{aiResult}</ReactMarkdown>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
