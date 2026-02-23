import { useState } from "react";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BIBLE_BOOKS, BIBLE_VERSIONS } from "@/lib/sermon-data";
import BottomNav from "@/components/BottomNav";

export default function Biblia() {
  const [version, setVersion] = useState(BIBLE_VERSIONS[0]);
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const filteredBooks = BIBLE_BOOKS.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  const atBooks = BIBLE_BOOKS.slice(0, 39);
  const ntBooks = BIBLE_BOOKS.slice(39);

  const filterList = (list: string[]) =>
    list.filter((b) => b.toLowerCase().includes(search.toLowerCase()));

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
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-card text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
            >
              {BIBLE_VERSIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </motion.div>

        {/* Antigo Testamento */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h2 className="text-xs font-body font-bold uppercase tracking-widest text-muted-foreground mb-3">
            📜 Antigo Testamento
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {filterList(atBooks).map((book) => (
              <button
                key={book}
                onClick={() => setSelectedBook(book)}
                className={`text-left px-3 py-2.5 rounded-xl text-sm font-body transition-all border ${
                  selectedBook === book
                    ? "bg-secondary/10 border-secondary text-secondary font-semibold"
                    : "bg-card border-border hover:border-secondary/50 text-foreground"
                }`}
              >
                {book}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Novo Testamento */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <h2 className="text-xs font-body font-bold uppercase tracking-widest text-muted-foreground mb-3">
            ✝️ Novo Testamento
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {filterList(ntBooks).map((book) => (
              <button
                key={book}
                onClick={() => setSelectedBook(book)}
                className={`text-left px-3 py-2.5 rounded-xl text-sm font-body transition-all border ${
                  selectedBook === book
                    ? "bg-secondary/10 border-secondary text-secondary font-semibold"
                    : "bg-card border-border hover:border-secondary/50 text-foreground"
                }`}
              >
                {book}
              </button>
            ))}
          </div>
        </motion.section>

        {selectedBook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-card p-6 mb-6 border border-border"
          >
            <h3 className="font-display text-lg font-bold mb-2">{selectedBook}</h3>
            <p className="text-sm text-muted-foreground font-body mb-4">
              Versão: {version}
            </p>
            <p className="text-sm text-muted-foreground font-body italic">
              A leitura completa será carregada aqui com IA. Selecione um capítulo para começar.
            </p>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
