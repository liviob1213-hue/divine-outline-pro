import { motion } from "framer-motion";
import { BookOpen, BrainCircuit, Sparkles } from "lucide-react";

interface Props {
  moduleTitle: string;
  onSelectFlashcards: () => void;
  onSelectDeepStudy: () => void;
}

export default function ModeSelector({ moduleTitle, onSelectFlashcards, onSelectDeepStudy }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-2">{moduleTitle}</h2>
        <p className="text-sm text-muted-foreground">Como você quer estudar este módulo?</p>
      </motion.div>

      <div className="w-full max-w-sm space-y-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelectFlashcards}
          className="w-full group relative bg-card/70 backdrop-blur border border-border/50 rounded-2xl p-5 text-left transition-all hover:shadow-card-hover overflow-hidden"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-emerald-400 to-emerald-600" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shrink-0">
              <BrainCircuit className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">Flashcards e Quiz</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Estude com cards interativos e teste seu conhecimento com perguntas de múltipla escolha. Ganhe XP!
              </p>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelectDeepStudy}
          className="w-full group relative bg-card/70 backdrop-blur border border-border/50 rounded-2xl p-5 text-left transition-all hover:shadow-card-hover overflow-hidden"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-primary to-primary/60" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shrink-0">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">Estudo Aprofundado</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Leia um estudo teológico completo e detalhado gerado por IA com múltiplas seções, referências bíblicas e aplicações práticas.
              </p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
