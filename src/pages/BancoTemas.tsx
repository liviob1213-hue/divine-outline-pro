import { useState } from "react";
import { ArrowLeft, FileText, Search, Sparkles, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

interface PreachingType {
  icon: string;
  title: string;
  description: string;
  objective: string;
  whenToUse: string[];
  example?: string;
  note?: string;
}

const PREACHING_TYPES: PreachingType[] = [
  {
    icon: "📖",
    title: "Pregação Expositiva",
    description: "Explica um texto bíblico versículo por versículo, mantendo o sentido original.",
    objective: "Ensinar profundamente a Palavra.",
    whenToUse: ["Escola bíblica", "Cultos de ensino", "Discipulado"],
    example: "Romanos 8 explicado do início ao fim.",
  },
  {
    icon: "🎯",
    title: "Pregação Temática",
    description: "Parte de um tema central e usa vários textos bíblicos.",
    objective: "Tratar uma necessidade específica.",
    whenToUse: ["Conferências", "Cultos especiais", "Campanhas"],
    example: "Fé, Prosperidade bíblica, Santidade, Família.",
  },
  {
    icon: "📚",
    title: "Pregação Textual",
    description: "Baseada em 1 ou 2 versículos, extraindo divisões do próprio texto.",
    objective: "Clareza e aplicação direta.",
    whenToUse: ["Cultos regulares", "Mensagens curtas e objetivas"],
    example: "Provérbios 3:5–6 → confiança, direção e obediência.",
  },
  {
    icon: "🔥",
    title: "Pregação Evangelística",
    description: "Focada na salvação, arrependimento e cruz.",
    objective: "Ganhar almas.",
    whenToUse: ["Cultos abertos", "Cruzadas", "Eventos evangelísticos"],
    example: "A parábola do Filho Pródigo.",
  },
  {
    icon: "🧠",
    title: "Pregação Didática (Ensino)",
    description: "Ensino estruturado, com explicações históricas e práticas.",
    objective: "Formar maturidade espiritual.",
    whenToUse: ["Escola dominical", "Cursos bíblicos", "Formação ministerial"],
  },
  {
    icon: "🔥",
    title: "Pregação Profética",
    description: "Exortação, confronto e chamado ao arrependimento.",
    objective: "Alinhar a igreja com a vontade de Deus.",
    whenToUse: ["Momentos de avivamento", "Vigílias", "Chamados espirituais"],
    note: "Deve ser bíblica, não emocional apenas.",
  },
  {
    icon: "❤️",
    title: "Pregação Pastoral",
    description: "Mensagem de consolo, cuidado e encorajamento.",
    objective: "Curar e fortalecer.",
    whenToUse: ["Luto", "Crises", "Momentos difíceis da igreja"],
  },
  {
    icon: "🔄",
    title: "Pregação Narrativa",
    description: "Conta uma história bíblica aplicando à vida atual.",
    objective: "Conexão emocional e prática.",
    whenToUse: ["Cultos jovens", "Crianças", "Mensagens impactantes"],
    example: "Davi e Golias aplicados aos desafios atuais.",
  },
  {
    icon: "🧩",
    title: "Pregação Apologética",
    description: "Defende a fé cristã com base bíblica e racional.",
    objective: "Fortalecer convicções.",
    whenToUse: ["Jovens", "Universidades", "Tempos de questionamento da fé"],
  },
  {
    icon: "🛐",
    title: "Pregação Devocional",
    description: "Curta, profunda e aplicada à vida diária.",
    objective: "Edificação pessoal.",
    whenToUse: ["Reuniões rápidas", "Pequenos grupos", "Abertura de cultos"],
  },
];

export default function BancoTemas() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");

  const [expandedType, setExpandedType] = useState<number | null>(null);

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
        {/* Tipos de Pregação Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 mb-4"
        >
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-4">
            🎤 Tipos de Pregação
          </h2>
          <div className="space-y-3">
            {PREACHING_TYPES.map((type, i) => {
              const isOpen = expandedType === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedType(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{type.icon}</span>
                      <h3 className="font-display font-bold text-sm text-foreground">{type.title}</h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2.5 border-t border-border pt-3">
                          <p className="text-xs text-muted-foreground font-body">{type.description}</p>
                          <p className="text-xs font-body"><span className="font-semibold text-foreground">🎯 Objetivo:</span> <span className="text-muted-foreground">{type.objective}</span></p>
                          <div>
                            <p className="text-xs font-semibold text-foreground font-body mb-1">📌 Quando usar:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {type.whenToUse.map((use) => (
                                <span key={use} className="text-[10px] font-body bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{use}</span>
                              ))}
                            </div>
                          </div>
                          {type.example && (
                            <p className="text-xs font-body"><span className="font-semibold text-foreground">✍️ Exemplo:</span> <span className="text-muted-foreground">{type.example}</span></p>
                          )}
                          {type.note && (
                            <p className="text-[10px] font-body text-amber-600 dark:text-amber-400">⚠️ {type.note}</p>
                          )}
                          <Link
                            to="/criar-esboco"
                            className="inline-flex items-center gap-1 text-xs font-body font-bold text-secondary hover:underline mt-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Criar esboço com este tipo
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}
