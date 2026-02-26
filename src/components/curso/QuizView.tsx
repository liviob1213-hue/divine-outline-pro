import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, ChevronRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/lib/theology-course-data";

interface Props {
  questions: QuizQuestion[];
  moduleName: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export default function QuizView({ questions, moduleName, onComplete, onBack }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[currentQ];
  if (!q) return null;

  const isCorrect = selected === q.correctIndex;

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      onComplete(score + (isCorrect ? 0 : 0)); // score already updated
      // actually pass final score
      onComplete(score);
    }
  };

  return (
    <div className="min-h-screen bg-background animated-bg relative flex flex-col">
      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-card/60 backdrop-blur border border-border/50">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-display font-bold text-foreground">Quiz — {moduleName}</h2>
            <p className="text-[10px] text-muted-foreground">Pergunta {currentQ + 1} de {questions.length}</p>
          </div>
          <div className="flex items-center gap-1 bg-card/60 backdrop-blur border border-border/50 rounded-full px-2.5 py-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-bold text-foreground">{score}/{questions.length}</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 relative z-10 px-4 py-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            <p className="text-lg font-display font-semibold text-foreground mb-6 leading-relaxed">
              {q.question}
            </p>

            <div className="space-y-3 flex-1">
              {q.options.map((opt, i) => {
                let borderClass = "border-border/50";
                let bgClass = "bg-card/60";
                if (answered) {
                  if (i === q.correctIndex) {
                    borderClass = "border-emerald-500";
                    bgClass = "bg-emerald-500/10";
                  } else if (i === selected && !isCorrect) {
                    borderClass = "border-destructive";
                    bgClass = "bg-destructive/10";
                  }
                }
                return (
                  <motion.button
                    key={i}
                    whileTap={!answered ? { scale: 0.97 } : {}}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left p-4 rounded-2xl border backdrop-blur transition-all ${borderClass} ${bgClass} ${!answered ? "hover:border-primary/40 active:scale-[0.98]" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm text-foreground">{opt}</span>
                      {answered && i === q.correctIndex && <Check className="w-4 h-4 text-emerald-500 ml-auto" />}
                      {answered && i === selected && !isCorrect && i !== q.correctIndex && <X className="w-4 h-4 text-destructive ml-auto" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 rounded-2xl bg-card/80 border border-border/50"
                >
                  <p className="text-xs font-bold text-primary mb-1">{isCorrect ? "✅ Correto!" : "❌ Incorreto"}</p>
                  <p className="text-sm text-muted-foreground">{q.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next button */}
      {answered && (
        <div className="relative z-10 px-4 pb-6">
          <Button onClick={handleNext} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90">
            {currentQ < questions.length - 1 ? (
              <>Próxima pergunta <ChevronRight className="w-4 h-4 ml-1" /></>
            ) : (
              <>Finalizar quiz <Award className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
