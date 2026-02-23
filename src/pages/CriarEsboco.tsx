import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BIBLE_BOOKS,
  STUDY_TYPES,
  BIBLE_VERSIONS,
  ANALYSIS_OPTIONS,
  CATEGORY_ICONS,
} from "@/lib/sermon-data";
import Header from "@/components/Header";

export default function CriarEsboco() {
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [studyType, setStudyType] = useState(STUDY_TYPES[0]);
  const [bibleVersion, setBibleVersion] = useState(BIBLE_VERSIONS[0]);
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [verses, setVerses] = useState("");
  const [extraRefs, setExtraRefs] = useState<string[]>([""]);
  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<string>>(new Set());
  const [extraInstructions, setExtraInstructions] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleAnalysis = (id: string) => {
    setSelectedAnalyses((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedAnalyses(new Set(ANALYSIS_OPTIONS.map((a) => a.id)));
  };

  const addExtraRef = () => setExtraRefs((p) => [...p, ""]);
  const removeExtraRef = (i: number) =>
    setExtraRefs((p) => p.filter((_, idx) => idx !== i));

  const grouped = ANALYSIS_OPTIONS.reduce<Record<string, typeof ANALYSIS_OPTIONS>>(
    (acc, opt) => {
      (acc[opt.category] ??= []).push(opt);
      return acc;
    },
    {}
  );

  const handleSubmit = () => {
    // Will integrate with AI later
    alert("Integração com IA será ativada em breve! Ative o Lovable Cloud para continuar.");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4">
        <Header />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-secondary" />
              Criar Novo Esboço
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Defina a referência bíblica e as opções de análise
            </p>
          </div>
          <Link
            to="/"
            className="text-sm text-secondary font-body font-medium flex items-center gap-1 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        {/* Step 1 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-card p-6 mb-4"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold font-body">
              1
            </span>
            <h2 className="font-display text-lg font-semibold">Informações Básicas</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-body font-medium text-foreground flex items-center gap-1 mb-1.5">
                <span className="text-secondary">H</span> Título do Esboço *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: O Bom Pastor - Análise de João 10"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground flex items-center gap-1 mb-1.5">
                <span className="text-secondary">🏷</span> Tema do Esboço
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Cuidado Pastoral, Proteção Divina"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground flex items-center gap-1 mb-1.5">
                <span className="text-secondary">📋</span> Tipo de Estudo *
              </label>
              <div className="relative">
                <select
                  value={studyType}
                  onChange={(e) => setStudyType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                >
                  {STUDY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground flex items-center gap-1 mb-1.5">
                <span className="text-secondary">📖</span> Versão da Bíblia
              </label>
              <div className="relative">
                <select
                  value={bibleVersion}
                  onChange={(e) => setBibleVersion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                >
                  {BIBLE_VERSIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Step 2 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl shadow-card p-6 mb-4"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold font-body">
              2
            </span>
            <h2 className="font-display text-lg font-semibold">Referência Bíblica</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-body font-medium text-foreground flex items-center gap-1 mb-1.5">
                📕 Livro *
              </label>
              <div className="relative">
                <select
                  value={book}
                  onChange={(e) => setBook(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                >
                  <option value="">Selecione um livro</option>
                  {BIBLE_BOOKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground flex items-center gap-1 mb-1.5">
                📃 Capítulo *
              </label>
              <input
                type="number"
                min="1"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Ex: 23"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground flex items-center gap-1 mb-1.5">
                📋 Versículos
              </label>
              <input
                type="text"
                value={verses}
                onChange={(e) => setVerses(e.target.value)}
                placeholder="Ex: 1,2,3 ou 1-5"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1 font-body">
                Separe por vírgula ou use hífen para intervalo
              </p>
            </div>

            <div>
              <label className="text-sm font-body font-medium text-foreground flex items-center gap-1 mb-2">
                📌 Referências Adicionais
              </label>
              {extraRefs.map((ref, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={ref}
                    onChange={(e) => {
                      const n = [...extraRefs];
                      n[i] = e.target.value;
                      setExtraRefs(n);
                    }}
                    placeholder="Ex: João 3:16"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                  {extraRefs.length > 1 && (
                    <button
                      onClick={() => removeExtraRef(i)}
                      className="p-2 rounded-lg border border-input text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addExtraRef}
                className="inline-flex items-center gap-1 text-xs font-body font-semibold text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Adicionar referência
              </button>
            </div>
          </div>
        </motion.section>

        {/* Step 3 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl shadow-card p-6 mb-4"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold font-body">
                3
              </span>
              <h2 className="font-display text-lg font-semibold">Opções de Análise</h2>
            </div>
            <button
              onClick={selectAll}
              className="text-xs font-body font-semibold text-secondary hover:underline"
            >
              Selecionar todas ({ANALYSIS_OPTIONS.length})
            </button>
          </div>

          <p className="text-xs text-muted-foreground font-body mb-4">
            Selecione quais análises deseja incluir no esboço
          </p>

          <div className="space-y-3">
            {Object.entries(grouped).map(([category, options]) => {
              const isExpanded = expandedCategories.has(category);
              const selectedCount = options.filter((o) => selectedAnalyses.has(o.id)).length;
              
              return (
                <div key={category} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-body font-semibold text-foreground">
                      <span>{CATEGORY_ICONS[category]}</span>
                      {category}
                    </span>
                    <span className="flex items-center gap-2">
                      {selectedCount > 0 && (
                        <span className="text-[10px] font-body font-bold bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                          {selectedCount}
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-2 space-y-1">
                          {options.map((opt) => (
                            <label
                              key={opt.id}
                              className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAnalyses.has(opt.id)}
                                onChange={() => toggleAnalysis(opt.id)}
                                className="w-4 h-4 rounded border-border text-secondary accent-secondary focus:ring-ring"
                              />
                              <span className="text-sm font-body text-foreground">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Extra Instructions */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl shadow-card p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">✏️</span>
            <h2 className="font-display text-lg font-semibold">Instruções Extras para a IA</h2>
          </div>
          <textarea
            value={extraInstructions}
            onChange={(e) => setExtraInstructions(e.target.value)}
            placeholder="Ex: Foque em aplicações práticas para jovens, use linguagem simples e destaque 3 pontos principais."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
          />
          <p className="text-xs text-muted-foreground font-body mt-1.5">
            Personalize a geração do esboço com instruções específicas como: nível de detalhe, tom da linguagem, público-alvo, etc.
          </p>
        </motion.section>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-10">
          <Link
            to="/"
            className="flex-1 py-3 text-center rounded-xl border border-border text-sm font-body font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-gradient-gold text-primary text-sm font-body font-bold flex items-center justify-center gap-2 shadow-gold hover:scale-[1.02] transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            Criar Esboço
          </button>
        </div>
      </div>
    </div>
  );
}
