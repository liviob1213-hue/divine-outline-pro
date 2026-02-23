import { useEffect, useState } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type ReadingState = {
  book: string;
  chapter: number;
  version: string;
  timestamp: number;
};

const STORAGE_KEY = "pregai-last-reading";

export function saveReadingState(book: string, chapter: number, version: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ book, chapter, version, timestamp: Date.now() }));
}

export function getReadingState(): ReadingState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function ContinueReading() {
  const [reading, setReading] = useState<ReadingState | null>(null);

  useEffect(() => {
    setReading(getReadingState());
  }, []);

  if (!reading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Link
        to={`/biblia?book=${encodeURIComponent(reading.book)}&chapter=${reading.chapter}`}
        className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border shadow-card hover:shadow-card-hover transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-destructive flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-body font-semibold text-muted-foreground mb-0.5">
            Continuar leitura
          </p>
          <p className="text-sm font-display font-bold text-foreground truncate">
            {reading.book} {reading.chapter}
          </p>
          <p className="text-[10px] text-muted-foreground font-body">{reading.version}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
    </motion.div>
  );
}
