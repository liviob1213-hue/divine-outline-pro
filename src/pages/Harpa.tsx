import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Search, Music, Send, Loader2, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import {
  searchCachedHinos,
  cacheHinos,
  isOnline,
  onNetworkChange,
} from "@/lib/offline-cache";

const SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-hinos`;

interface Hino {
  id: number;
  titulo: string;
  coro: string | null;
  letra_completa: string;
}

export default function Harpa() {
  const [query, setQuery] = useState("");
  const [allHinos, setAllHinos] = useState<Hino[]>([]);
  const [dbResults, setDbResults] = useState<Hino[]>([]);
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [expandedHino, setExpandedHino] = useState<number | null>(null);
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    return onNetworkChange(setOnline);
  }, []);

  // Fetch all hymns on mount
  useEffect(() => {
    async function fetchAll() {
      setLoadingAll(true);
      try {
        const allData: Hino[] = [];
        let offset = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("hinos")
            .select("id, titulo, coro, letra_completa")
            .order("id", { ascending: true })
            .range(offset, offset + batchSize - 1);

          if (error) throw error;
          if (data && data.length > 0) {
            allData.push(...data);
            offset += batchSize;
            hasMore = data.length === batchSize;
          } else {
            hasMore = false;
          }
        }

        setAllHinos(allData);
        // Cache for offline use
        cacheHinos(allData).catch(() => {});
      } catch {
        // Fallback to offline cache
        try {
          const cached = await searchCachedHinos("");
          if (cached.length > 0) setAllHinos(cached);
        } catch {}
      } finally {
        setLoadingAll(false);
      }
    }
    fetchAll();
  }, []);

  // Filter hymns locally when typing (without hitting search)
  const filteredHinos = useMemo(() => {
    if (!query.trim()) return allHinos;
    const q = query.trim().toLowerCase();
    const numMatch = q.match(/^(\d+)$/);
    return allHinos.filter((hino) => {
      if (numMatch) return hino.id === parseInt(numMatch[1]);
      const fields = `${hino.titulo} ${hino.coro || ""} ${hino.letra_completa}`.toLowerCase();
      return fields.includes(q);
    });
  }, [query, allHinos]);

  const searchHymns = async () => {
    const text = query.trim();
    if (!text || loading) return;
    setDbResults([]);
    setAiResult("");
    setLoading(true);

    if (!online) {
      try {
        const cached = await searchCachedHinos(text);
        if (cached.length > 0) {
          setDbResults(cached);
        } else {
          setAiResult("Sem conexão. Nenhum hino encontrado no cache offline.");
        }
      } catch {
        setAiResult("Erro ao buscar no cache offline.");
      } finally {
        setLoading(false);
      }
      return;
    }

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
          cacheHinos(data.results).catch(() => {});
        } else {
          setAiResult("Nenhum hino encontrado no banco de dados.");
        }
      } else if (contentType.includes("text/event-stream") && resp.body) {
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
      try {
        const cached = await searchCachedHinos(text);
        if (cached.length > 0) {
          setDbResults(cached);
        } else {
          setAiResult("Erro ao buscar hinos. Tente novamente.");
        }
      } catch {
        setAiResult("Erro ao buscar hinos. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine what to show: search results > AI result > filtered list
  const showSearchResults = dbResults.length > 0;
  const showAiResult = aiResult || (loading && !dbResults.length);
  const showAllList = !showSearchResults && !showAiResult && !loading;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Harpa Cristã
            </h1>
            <p className="text-xs text-muted-foreground font-body">
              {allHinos.length > 0 ? `${allHinos.length} hinos` : "640 hinos"} — busca no banco de dados com fallback IA
            </p>
          </div>
          {!online && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
              <WifiOff className="w-3 h-3" />
              <span className="text-[10px] font-body font-bold">Offline</span>
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  // Clear AI/search results when typing to show filtered list
                  if (dbResults.length > 0 || aiResult) {
                    setDbResults([]);
                    setAiResult("");
                  }
                }}
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

        {/* DB Search Results */}
        {showSearchResults && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-xs text-muted-foreground font-body">
              🎵 {dbResults.length} hino(s) encontrado(s) {online ? "no banco de dados" : "no cache offline"}
            </p>
            {dbResults.map((hino) => (
              <HinoCard key={hino.id} hino={hino} expanded={expandedHino === hino.id} onToggle={() => setExpandedHino(expandedHino === hino.id ? null : hino.id)} />
            ))}
          </motion.div>
        )}

        {/* AI Fallback Results */}
        {showAiResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border shadow-card">
            {loading && !aiResult && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-body">Buscando hinos...</span>
              </div>
            )}
            {aiResult && (
              <>
                <p className="text-[10px] text-muted-foreground font-body mb-2">
                  {online ? "🤖 Resposta da IA (hino não encontrado no banco)" : "📱 Modo offline"}
                </p>
                <div className="prose prose-sm prose-invert max-w-none text-foreground [&_strong]:text-primary">
                  <ReactMarkdown>{aiResult}</ReactMarkdown>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* All hymns list */}
        {showAllList && (
          <div className="space-y-3">
            {loadingAll ? (
              <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-body">Carregando hinos...</span>
              </div>
            ) : filteredHinos.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground font-body py-10">
                Nenhum hino encontrado para "{query}"
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground font-body">
                  🎵 {filteredHinos.length} hino(s) {query.trim() ? "filtrado(s)" : "disponíveis"}
                </p>
                {filteredHinos.map((hino) => (
                  <HinoCard key={hino.id} hino={hino} expanded={expandedHino === hino.id} onToggle={() => setExpandedHino(expandedHino === hino.id ? null : hino.id)} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function HinoCard({ hino, expanded, onToggle }: { hino: Hino; expanded: boolean; onToggle: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-primary font-display min-w-[2.5rem]">{hino.id}</span>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground text-sm">{hino.titulo}</h3>
            {hino.coro && <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">{hino.coro}</p>}
          </div>
          <span className="text-muted-foreground text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>
      {expanded && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="px-4 pb-4">
          <div className="border-t border-border pt-3">
            <pre className="text-xs font-body text-foreground/90 whitespace-pre-wrap leading-relaxed">{hino.letra_completa}</pre>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
