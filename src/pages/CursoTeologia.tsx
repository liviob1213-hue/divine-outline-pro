import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Trophy, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomNav from "@/components/BottomNav";
import AnimatedBackground from "@/components/AnimatedBackground";
import StudyMode from "@/components/curso/StudyMode";
import { MODULE_LIST } from "@/lib/theology-course-data";

// ── Grouped modules into shelf categories ────────────────────────────

interface ShelfCategory {
  title: string;
  color: string;
  bookColor: string;
  textColor: string;
  moduleIds: number[];
}

const SHELF_CATEGORIES: ShelfCategory[] = [
  {
    title: "Fundamentos Teológicos",
    color: "from-violet-700 to-purple-900",
    bookColor: "bg-violet-700",
    textColor: "text-violet-100",
    moduleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: "Panorama do Antigo Testamento",
    color: "from-emerald-700 to-emerald-900",
    bookColor: "bg-emerald-700",
    textColor: "text-emerald-100",
    moduleIds: [14, 15, 16, 17, 18, 19],
  },
  {
    title: "Panorama do Novo Testamento",
    color: "from-sky-600 to-blue-800",
    bookColor: "bg-sky-600",
    textColor: "text-sky-100",
    moduleIds: [20, 21, 22, 23, 24, 25, 26, 27],
  },
  {
    title: "Vida e Ministério",
    color: "from-amber-600 to-orange-800",
    bookColor: "bg-amber-600",
    textColor: "text-amber-100",
    moduleIds: [28, 29, 30, 31],
  },
];

// ── Persisted progress ───────────────────────────────────────────────

function getProgress(): Record<number, number> {
  try {
    return JSON.parse(localStorage.getItem("curso-progress") || "{}");
  } catch {
    return {};
  }
}
function saveProgress(p: Record<number, number>) {
  localStorage.setItem("curso-progress", JSON.stringify(p));
}

// ── Book Spine Component ─────────────────────────────────────────────

function BookSpine({
  mod,
  progress,
  index,
  bookColor,
  textColor,
  isSelected,
  onSelect,
}: {
  mod: (typeof MODULE_LIST)[0];
  progress: number;
  index: number;
  bookColor: string;
  textColor: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isComplete = progress >= 100;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={`w-10 sm:w-12 h-full ${bookColor} rounded-sm flex items-center justify-center relative cursor-pointer transition-shadow ${
        isSelected
          ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30 -translate-y-2"
          : "hover:shadow-md"
      }`}
      style={{ minWidth: "2.5rem" }}
    >
      {/* Top/bottom decorations */}
      <div className="absolute top-1 left-1 right-1 h-px bg-white/20 rounded" />
      <div className="absolute bottom-1 left-1 right-1 h-px bg-white/20 rounded" />

      {/* Progress indicator bar at bottom */}
      {progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 rounded-b-sm overflow-hidden">
          <div
            className={`h-full ${isComplete ? "bg-emerald-400" : "bg-yellow-400"} transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Complete badge */}
      {isComplete && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center z-10 shadow">
          <BookOpen className="w-2.5 h-2.5 text-white" />
        </div>
      )}

      {/* Rotated book name */}
      <span
        className={`${textColor} text-[8px] sm:text-[9px] font-bold tracking-tight whitespace-nowrap`}
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
        }}
      >
        {mod.title.toUpperCase()}
      </span>
    </motion.button>
  );
}

// ── Shelf Component ──────────────────────────────────────────────────

function Shelf({
  category,
  progress,
  selectedModuleId,
  onSelectModule,
  onStartStudy,
}: {
  category: ShelfCategory;
  progress: Record<number, number>;
  selectedModuleId: number | null;
  onSelectModule: (id: number | null) => void;
  onStartStudy: (id: number) => void;
}) {
  const modules = category.moduleIds.map((id) => MODULE_LIST.find((m) => m.id === id)!).filter(Boolean);
  const selectedMod = modules.find((m) => m.id === selectedModuleId) || null;
  const categoryProgress = Math.round(
    category.moduleIds.reduce((sum, id) => sum + (progress[id] || 0), 0) / category.moduleIds.length
  );

  return (
    <div className="mb-5">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${category.color}`} />
        <h3 className="text-xs sm:text-sm font-bold font-display text-foreground uppercase tracking-wider flex-1">
          {category.title}
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground">{categoryProgress}%</span>
      </div>

      {/* Bookshelf */}
      <div className="relative">
        <div className="bg-gradient-to-b from-amber-900/30 to-amber-950/50 rounded-xl border border-amber-800/30 p-2 sm:p-3">
          {/* Books row */}
          <div className="flex gap-1 overflow-x-auto pb-1 items-end scrollbar-thin" style={{ height: "110px" }}>
            {modules.map((mod, i) => (
              <BookSpine
                key={mod.id}
                mod={mod}
                progress={progress[mod.id] || 0}
                index={i}
                bookColor={category.bookColor}
                textColor={category.textColor}
                isSelected={selectedModuleId === mod.id}
                onSelect={() => onSelectModule(selectedModuleId === mod.id ? null : mod.id)}
              />
            ))}
          </div>
          {/* Shelf base */}
          <div className="h-2 bg-gradient-to-r from-amber-800/60 via-amber-700/80 to-amber-800/60 rounded-b-lg mt-1" />
        </div>
      </div>

      {/* Selected module detail card */}
      <AnimatePresence>
        {selectedMod && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`mt-2 p-4 rounded-xl bg-gradient-to-br ${category.color} text-white`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <selectedMod.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-base sm:text-lg leading-tight">{selectedMod.title}</h4>
                  <p className="text-[11px] opacity-80 font-body">{selectedMod.description}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all"
                    style={{ width: `${progress[selectedMod.id] || 0}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold">{progress[selectedMod.id] || 0}%</span>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onStartStudy(selectedMod.id)}
                  className="flex-1 py-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-sm font-display transition-colors"
                >
                  {(progress[selectedMod.id] || 0) > 0 ? "Continuar Estudo" : "Iniciar Estudo"}
                </motion.button>
                <button
                  onClick={() => onSelectModule(null)}
                  className="text-[10px] font-body underline opacity-70 hover:opacity-100 transition px-2"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function CursoTeologia() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [studyingModule, setStudyingModule] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>(getProgress);
  const [streak] = useState(() => {
    const saved = localStorage.getItem("curso-streak");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("curso-xp");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [expandedSection, setExpandedSection] = useState<string | null>("Fundamentos Teológicos");

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("curso-xp", String(xp));
  }, [xp]);

  const updateModuleProgress = (moduleId: number, value: number) => {
    setProgress((prev) => ({ ...prev, [moduleId]: Math.max(prev[moduleId] || 0, value) }));
  };

  const addXp = (amount: number) => setXp((prev) => prev + amount);

  // Study mode
  if (studyingModule !== null) {
    return (
      <StudyMode
        moduleId={studyingModule}
        streak={streak}
        xp={xp}
        onAddXp={addXp}
        onUpdateProgress={(v) => updateModuleProgress(studyingModule, v)}
        onBack={() => setStudyingModule(null)}
      />
    );
  }

  const totalProgress = MODULE_LIST.reduce((sum, m) => sum + (progress[m.id] || 0), 0);
  const overallPercent = Math.round(totalProgress / MODULE_LIST.length);
  const completedModules = MODULE_LIST.filter((m) => (progress[m.id] || 0) >= 100).length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <AnimatedBackground />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base sm:text-lg font-display font-bold">Curso de Teologia</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-body">
              31 módulos • {completedModules} concluídos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-card/60 backdrop-blur border border-border/50 rounded-full px-2.5 py-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[10px] font-bold text-foreground">{streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-card/60 backdrop-blur border border-border/50 rounded-full px-2.5 py-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-foreground">{xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="relative z-10 px-4 py-4 max-w-2xl mx-auto">
          {/* Stats banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-2 mb-5"
          >
            <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold font-display text-foreground">{overallPercent}%</p>
              <p className="text-[9px] text-muted-foreground font-body">Progresso</p>
            </div>
            <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold font-display text-foreground">{completedModules}</p>
              <p className="text-[9px] text-muted-foreground font-body">Concluídos</p>
            </div>
            <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold font-display text-primary">{xp}</p>
              <p className="text-[9px] text-muted-foreground font-body">XP Total</p>
            </div>
          </motion.div>

          {/* Overall progress bar */}
          <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-3 mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-foreground font-body">Progresso Geral</span>
              <span className="text-xs font-bold text-primary">{overallPercent}%</span>
            </div>
            <Progress value={overallPercent} className="h-2 bg-muted" />
          </div>

          {/* Shelves by category */}
          {SHELF_CATEGORIES.map((cat) => {
            const isExpanded = expandedSection === cat.title;
            return (
              <div key={cat.title} className="mb-2">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : cat.title)}
                  className="w-full flex items-center justify-between bg-card/40 backdrop-blur border border-border/30 rounded-xl px-4 py-3 mb-2 transition-colors hover:bg-card/60"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${cat.color}`} />
                    <span className="text-sm font-bold font-display text-foreground">{cat.title}</span>
                    <span className="text-[10px] text-muted-foreground font-body">
                      ({cat.moduleIds.length})
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <Shelf
                        category={cat}
                        progress={progress}
                        selectedModuleId={selectedModule}
                        onSelectModule={setSelectedModule}
                        onStartStudy={(id) => {
                          setSelectedModule(null);
                          setStudyingModule(id);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <BottomNav />
    </div>
  );
}
