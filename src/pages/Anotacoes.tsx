import { useState } from "react";
import { ArrowLeft, NotebookPen, Plus, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";

interface Note {
  title: string;
  date: string;
  preview: string;
  content: string;
}

const INITIAL_NOTES: Note[] = [
  { title: "Estudo sobre Gálatas 5", date: "22 Fev 2026", preview: "Fruto do Espírito — análise dos 9 aspectos...", content: "Fruto do Espírito — análise dos 9 aspectos..." },
  { title: "Sermão do Monte — Mateus 5", date: "20 Fev 2026", preview: "As bem-aventuranças e sua aplicação...", content: "As bem-aventuranças e sua aplicação..." },
];

export default function Anotacoes() {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  const addNote = () => {
    if (!newTitle.trim()) return;
    const note: Note = {
      title: newTitle.trim(),
      date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
      preview: newContent.trim().slice(0, 80) + (newContent.length > 80 ? "..." : ""),
      content: newContent.trim(),
    };
    setNotes((prev) => [note, ...prev]);
    setNewTitle("");
    setNewContent("");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-primary" />
                Minhas Anotações
              </h1>
              <p className="text-xs text-muted-foreground font-body">Estudos pessoais organizados</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="p-2.5 rounded-xl bg-gradient-gold shadow-gold text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* New note form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-card rounded-2xl p-5 border border-primary/30 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-foreground">Nova Anotação</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Título da anotação..."
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Conteúdo da anotação..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <button
                  onClick={addNote}
                  disabled={!newTitle.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-gold text-primary-foreground text-sm font-body font-bold shadow-gold disabled:opacity-50 hover:scale-[1.02] transition-transform"
                >
                  Salvar Anotação
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar anotações..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </motion.div>

        <div className="space-y-3">
          {filteredNotes.map((note, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-5 border border-border shadow-card cursor-pointer hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-display font-bold text-sm text-foreground">{note.title}</h3>
                <span className="text-[10px] text-muted-foreground font-body">{note.date}</span>
              </div>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{note.preview}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
