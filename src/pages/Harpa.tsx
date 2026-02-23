import { useState } from "react";
import { ArrowLeft, Search, Music, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";

const SAMPLE_HYMNS = Array.from({ length: 50 }, (_, i) => ({
  number: i + 1,
  title: `Hino ${i + 1}`,
}));

export default function Harpa() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = SAMPLE_HYMNS.filter(
    (h) =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.number.toString().includes(search)
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Music className="w-5 h-5 text-destructive" />
              Harpa Cristã
            </h1>
            <p className="text-xs text-muted-foreground font-body">640 hinos para adoração</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número ou título..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </motion.div>

        <div className="space-y-2">
          {filtered.map((hymn) => (
            <motion.button
              key={hymn.number}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelected(hymn.number)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                selected === hymn.number
                  ? "bg-destructive/10 border-destructive/30"
                  : "bg-card border-border hover:border-destructive/30"
              }`}
            >
              <span className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive font-bold text-sm font-body">
                {hymn.number}
              </span>
              <span className="flex-1 font-body text-sm text-foreground">{hymn.title}</span>
              <Play className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          ))}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-x-0 bottom-16 mx-4 bg-card rounded-2xl shadow-card-hover p-6 border border-border z-40 max-w-2xl sm:mx-auto"
          >
            <h3 className="font-display text-lg font-bold mb-2">Hino {selected}</h3>
            <p className="text-sm text-muted-foreground font-body italic">
              A letra e cifra serão carregadas com IA. Busca inteligente habilitada.
            </p>
            <button
              onClick={() => setSelected(null)}
              className="mt-3 text-xs text-secondary font-body font-semibold hover:underline"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
