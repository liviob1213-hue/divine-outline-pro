import { useState } from "react";
import { ArrowLeft, Search, Music, Send, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import BottomNav from "@/components/BottomNav";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/theology-chat`;

export default function Harpa() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const searchHymns = async () => {
    const text = query.trim();
    if (!text || loading) return;
    setResult("");
    setLoading(true);

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
              content: `Você é um especialista na Harpa Cristã (hinário com 640 hinos). O usuário está buscando: "${text}". 
Sugira hinos da Harpa Cristã que se encaixem nessa busca. Para cada hino, mostre:
- Número do hino
- Título
- Primeira estrofe ou trecho relevante
- Por que se encaixa na busca

Se não encontrar hinos exatos, sugira os mais próximos. Responda em português.`,
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
              setResult(content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch {
      setResult("Erro ao buscar hinos. Tente novamente.");
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
            <p className="text-xs text-muted-foreground font-body">640 hinos — busca inteligente com IA</p>
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
                placeholder="Ex: hinos sobre o Espírito Santo, louvor de adoração..."
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
        {!result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-xs text-muted-foreground font-body mb-3">Sugestões de busca:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Hinos sobre salvação",
                "Louvor de adoração",
                "Hinos para culto de oração",
                "Hinos sobre a volta de Cristo",
                "Hinos para Santa Ceia",
                "Hinos de consagração",
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

        {/* Results */}
        {(result || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-5 border border-border shadow-card"
          >
            {loading && !result && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-body">Buscando hinos com IA...</span>
              </div>
            )}
            <div className="prose prose-sm prose-invert max-w-none text-foreground [&_strong]:text-primary [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
