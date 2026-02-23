import { useState } from "react";
import { ArrowLeft, FileText, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";

const THEMES = [
  { title: "O Amor de Deus", refs: "João 3:16, Romanos 5:8, 1 João 4:8", category: "Doutrina" },
  { title: "Fé e Obras", refs: "Tiago 2:17, Hebreus 11:1, Gálatas 5:6", category: "Vida Cristã" },
  { title: "A Segunda Vinda de Cristo", refs: "Mateus 24:30, 1 Tessalonicenses 4:16", category: "Escatologia" },
  { title: "O Fruto do Espírito", refs: "Gálatas 5:22-23", category: "Espírito Santo" },
  { title: "A Oração Eficaz", refs: "Tiago 5:16, Mateus 6:5-13", category: "Vida Cristã" },
  { title: "Liderança Pastoral", refs: "1 Pedro 5:1-4, Atos 20:28", category: "Ministério" },
  { title: "Batalha Espiritual", refs: "Efésios 6:10-18", category: "Vida Cristã" },
  { title: "Graça e Misericórdia", refs: "Efésios 2:8-9, Lamentações 3:22-23", category: "Doutrina" },
];

export default function BancoTemas() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");

  const categories = ["Todos", ...new Set(THEMES.map((t) => t.category))];
  const filtered = THEMES.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "Todos" || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-dark" />
              Banco de Temas
            </h1>
            <p className="text-xs text-muted-foreground font-body">Temas prontos para suas pregações</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tema..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </motion.div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-colors ${
                categoryFilter === cat
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((theme, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-bold text-sm text-foreground">{theme.title}</h3>
                <span className="text-[9px] font-body font-bold uppercase tracking-wider bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                  {theme.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-body mb-3">📖 {theme.refs}</p>
              <Link
                to="/criar-esboco"
                className="inline-flex items-center gap-1 text-xs font-body font-bold text-secondary hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                Criar esboço com este tema
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
