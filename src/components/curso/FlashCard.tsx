import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type { StudyCard } from "@/lib/theology-course-data";

interface Props {
  card: StudyCard;
}

export default function FlashCard({ card }: Props) {
  const [flipped, setFlipped] = useState(false);

  const typeLabel = card.type === "verse" ? "📖 Versículo" : card.type === "question" ? "❓ Pergunta" : "💡 Conceito";

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
      style={{ perspective: 1000 }}
    >
      <motion.div
        onClick={() => setFlipped(!flipped)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
        className="relative cursor-pointer"
        style={{ transformStyle: "preserve-3d", minHeight: 280 }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-card/80 backdrop-blur border border-border/50 rounded-3xl p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{typeLabel}</span>
          <p className="text-lg font-display font-semibold text-foreground leading-relaxed whitespace-pre-line">
            {card.front}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <RotateCcw className="w-3 h-3" /> Toque para virar
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-card/90 backdrop-blur border border-primary/20 rounded-3xl p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Resposta</span>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {card.back}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <RotateCcw className="w-3 h-3" /> Toque para voltar
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
