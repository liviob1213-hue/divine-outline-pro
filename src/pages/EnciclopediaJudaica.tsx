import { useState } from "react";
import { ArrowLeft, Search, Loader2, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import BottomNav from "@/components/BottomNav";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/theology-chat`;

export default function EnciclopediaJudaica() {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const searchTopic = async () => {
    if (!search.trim()) return;
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
              content: `Atue como uma enciclopédia judaica completa e acadêmica. Sobre o tema "${search}", forneça:
1. Definição e origem
2. Contexto histórico no judaísmo
3. Referências na Torah e Talmud
4. Tradições e costumes relacionados
5. Significado espiritual e religioso
6. Conexão com o cristianismo (quando aplicável)
7. Termos em hebraico relacionados (com transliteração)

Seja detalhado, acadêmico e respeitoso com a tradição judaica.`,
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
      setResult("Erro ao buscar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const topics = [
    { title: "Festas Judaicas", items: ["Pessach", "Yom Kippur", "Sucot", "Hanukkah", "Purim", "Shavuot"] },
    { title: "Conceitos", items: ["Shabbat", "Kashrut", "Mikveh", "Bar Mitzvah", "Teshuvá", "Tzedaká"] },
    { title: "Textos Sagrados", items: ["Torah", "Talmud", "Mishná", "Midrash", "Zohar", "Halakhá"] },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Enciclopédia Judaica</h1>
            <p className="text-[11px] text-muted-foreground font-body">Tradições, cultura, história e teologia</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchTopic()}
                placeholder="Pesquisar na enciclopédia..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={searchTopic}
              disabled={loading || !search.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-body font-semibold text-white disabled:opacity-50 transition-all"
              style={{ background: "var(--gradient-card-amber)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookMarked className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>

        {!result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            {topics.map((group) => (
              <div key={group.title} className="mb-5">
                <p className="text-xs font-body font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  {group.title}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => { setSearch(item); }}
                      className="px-3 py-1.5 rounded-full text-xs font-body border border-border bg-card text-foreground hover:border-primary transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {(result || loading) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border shadow-card">
            {loading && !result && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-body">Pesquisando...</span>
              </div>
            )}
            <div className="prose prose-invert prose-sm max-w-none font-body">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
