import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Trophy, BookOpen, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import BottomNav from "@/components/BottomNav";
import AnimatedBackground from "@/components/AnimatedBackground";
import StudyMode from "@/components/curso/StudyMode";
import { MODULE_LIST } from "@/lib/theology-course-data";

// Persisted progress
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

export default function CursoTeologia() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>(getProgress);
  const [streak] = useState(() => {
    const saved = localStorage.getItem("curso-streak");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("curso-xp");
    return saved ? parseInt(saved, 10) : 0;
  });

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

  if (selectedModule !== null) {
    return (
      <StudyMode
        moduleId={selectedModule}
        streak={streak}
        xp={xp}
        onAddXp={addXp}
        onUpdateProgress={(v) => updateModuleProgress(selectedModule, v)}
        onBack={() => setSelectedModule(null)}
      />
    );
  }

  const totalProgress = MODULE_LIST.reduce((sum, m) => sum + (progress[m.id] || 0), 0);
  const overallPercent = Math.round(totalProgress / MODULE_LIST.length);

  return (
    <div className="min-h-screen bg-background animated-bg relative pb-20">
      <AnimatedBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 rounded-xl bg-card/60 backdrop-blur border border-border/50">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">Curso de Teologia</h1>
            <p className="text-xs text-muted-foreground">31 módulos interativos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-card/60 backdrop-blur border border-border/50 rounded-full px-3 py-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-foreground">{streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-card/60 backdrop-blur border border-border/50 rounded-full px-3 py-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">{xp} XP</span>
            </div>
          </div>
        </div>

        {/* Overall progress */}
        <div className="bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Progresso Geral</span>
            <span className="text-sm font-bold text-primary">{overallPercent}%</span>
          </div>
          <Progress value={overallPercent} className="h-2.5 bg-muted" />
        </div>

        {/* Module Grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
        >
          {MODULE_LIST.map((mod) => {
            const Icon = mod.icon;
            const p = progress[mod.id] || 0;
            const isComplete = p >= 100;
            return (
              <motion.button
                key={mod.id}
                onClick={() => setSelectedModule(mod.id)}
                variants={{
                  hidden: { opacity: 0, y: 16, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative bg-card/70 backdrop-blur border border-border/50 rounded-2xl p-4 text-left transition-shadow hover:shadow-card-hover overflow-hidden"
              >
                {/* Gradient accent */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${mod.color}`} />
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight mb-1 line-clamp-2">
                    {mod.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-3">{mod.description}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={p} className="h-1.5 flex-1 bg-muted" />
                    <span className="text-[10px] font-bold text-muted-foreground">{p}%</span>
                  </div>
                  {isComplete && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <ChevronRight className="absolute bottom-4 right-3 w-4 h-4 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
              </motion.button>
            );
          })}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}
