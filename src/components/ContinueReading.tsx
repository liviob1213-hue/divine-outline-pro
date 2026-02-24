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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full" style={{ background: "var(--gradient-gold)" }} />
        <h2 className="text-xs font-semibold font-body tracking-widest uppercase text-muted-foreground">
          Continuar Leitura
        </h2>
      </div>
      <Link
        to={reading ? `/biblia?book=${encodeURIComponent(reading.book)}&chapter=${reading.chapter}` : "/biblia"}
        className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border shadow-card hover:shadow-card-hover transition-all group"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--gradient-card-purple)" }}>
          <BookOpen className="w-5 h-5 text-purple-200" />
        </div>
        <div className="flex-1 min-w-0">
          {reading ? (
            <>
              <p className="text-sm font-display font-bold text-foreground truncate">
                {reading.book} {reading.chapter}
              </p>
              <p className="text-[10px] text-muted-foreground font-body">{reading.version}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-display font-bold text-foreground">Comece sua leitura</p>
              <p className="text-[10px] text-muted-foreground font-body">Escolha um livro para continuar</p>
            </>
          )}
          <p className="text-[11px] font-body font-semibold mt-1" style={{ color: "hsl(262 70% 60%)" }}>
            Retomar leitura →
          </p>
        </div>
        <BookOpen className="w-8 h-8 opacity-20 text-foreground" />
      </Link>
    </motion.div>
  );
}
