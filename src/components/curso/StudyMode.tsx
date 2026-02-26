import { useState, useMemo } from "react";
import { ArrowLeft, Flame, Trophy, Sparkles, RotateCcw, ChevronRight, X, Check, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FlashCard from "./FlashCard";
import QuizView from "./QuizView";
import {
  MODULE_LIST,
  BIBLIOLOGIA_CARDS,
  BIBLIOLOGIA_QUIZ,
  type StudyCard,
  type QuizQuestion,
} from "@/lib/theology-course-data";

interface Props {
  moduleId: number;
  streak: number;
  xp: number;
  onAddXp: (n: number) => void;
  onUpdateProgress: (v: number) => void;
  onBack: () => void;
}

// placeholder cards for modules without data yet
function placeholderCards(title: string): StudyCard[] {
  return [
    { id: "ph-1", front: `Bem-vindo ao módulo: ${title}`, back: "Este módulo será alimentado com conteúdo em breve. Use o botão 'Gerar com IA' para criar cards de estudo!", type: "concept" },
    { id: "ph-2", front: `O que estuda ${title}?`, back: "Toque em 'Gerar com IA' para receber uma explicação completa deste conceito teológico.", type: "question" },
  ];
}

export default function StudyMode({ moduleId, streak, xp, onAddXp, onUpdateProgress, onBack }: Props) {
  const mod = MODULE_LIST.find((m) => m.id === moduleId)!;
  const cards: StudyCard[] = moduleId === 1 ? BIBLIOLOGIA_CARDS : placeholderCards(mod.title);
  const quiz: QuizQuestion[] = moduleId === 1 ? BIBLIOLOGIA_QUIZ : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [finished, setFinished] = useState(false);

  const card = cards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (quiz.length > 0) {
      setShowQuiz(true);
    } else {
      setFinished(true);
      onUpdateProgress(100);
    }
  };

  const handleDidntKnow = () => handleNext();

  const handleLearned = () => {
    setKnownCards((prev) => new Set(prev).add(card.id));
    onAddXp(10);
    handleNext();
  };

  const handleQuizComplete = (score: number) => {
    onAddXp(score * 25);
    onUpdateProgress(100);
    setFinished(true);
  };

  // Finished state
  if (finished) {
    return (
      <div className="min-h-screen bg-background animated-bg relative flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card/80 backdrop-blur border border-border/50 rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Módulo Concluído!</h2>
          <p className="text-muted-foreground mb-1">{mod.title}</p>
          <p className="text-sm text-muted-foreground mb-6">Você acertou {knownCards.size}/{cards.length} cards</p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-foreground">{xp} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="font-bold text-foreground">{streak} dias</span>
            </div>
          </div>
          <Button onClick={onBack} className="w-full rounded-xl bg-primary hover:bg-primary/90">
            Voltar aos módulos
          </Button>
        </motion.div>
      </div>
    );
  }

  // Quiz state
  if (showQuiz) {
    return <QuizView questions={quiz} moduleName={mod.title} onComplete={handleQuizComplete} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-background animated-bg relative flex flex-col">
      {/* Top bar */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-card/60 backdrop-blur border border-border/50">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-display font-bold text-foreground truncate">{mod.title}</h2>
            <p className="text-[10px] text-muted-foreground">Card {currentIndex + 1} de {cards.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-card/60 backdrop-blur border border-border/50 rounded-full px-2.5 py-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[10px] font-bold text-foreground">{streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-card/60 backdrop-blur border border-border/50 rounded-full px-2.5 py-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-foreground">{xp}</span>
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2 bg-muted" />
      </div>

      {/* Card area */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 py-6">
        <AnimatePresence mode="wait">
          <FlashCard key={card.id} card={card} />
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="relative z-10 px-4 pb-6 space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDidntKnow}
            className="flex-1 h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-1" /> Não sabia
          </Button>
          <Button
            onClick={handleLearned}
            className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="w-4 h-4 mr-1" /> Aprendi!
          </Button>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleNext}
            className="flex-1 h-10 rounded-xl"
          >
            Próximo card <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-primary/30 text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-4 h-4 mr-1" /> Gerar com IA
          </Button>
        </div>
      </div>
    </div>
  );
}
