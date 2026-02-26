import { motion } from "framer-motion";
import { BookOpen, Quote, Lightbulb, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Section {
  subtitle: string;
  content: string;
}

interface KeyVerse {
  reference: string;
  text: string;
}

export interface DeepStudy {
  type: "deep_study";
  title: string;
  introduction: string;
  sections: Section[];
  key_verse?: KeyVerse;
  practical_application?: string;
}

interface Props {
  study: DeepStudy;
  onBack: () => void;
}

export default function DeepStudyView({ study, onBack }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-card/60 backdrop-blur border border-border/50">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-display font-bold text-foreground truncate">Estudo Profundo</h2>
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 pb-6"
        >
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-display font-bold text-foreground leading-tight">{study.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{study.introduction}</p>
          </div>

          {/* Sections */}
          {study.sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-4"
            >
              <h2 className="text-base font-display font-semibold text-foreground mb-2">{section.subtitle}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
            </motion.div>
          ))}

          {/* Key Verse */}
          {study.key_verse && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Quote className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Versículo-chave</span>
              </div>
              <p className="text-sm text-foreground italic leading-relaxed mb-2">"{study.key_verse.text}"</p>
              <p className="text-xs text-primary font-semibold">{study.key_verse.reference}</p>
            </motion.div>
          )}

          {/* Practical Application */}
          {study.practical_application && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Aplicação Prática</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{study.practical_application}</p>
            </motion.div>
          )}

          {/* Back button */}
          <Button onClick={onBack} variant="outline" className="w-full rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
        </motion.div>
      </ScrollArea>
    </div>
  );
}
