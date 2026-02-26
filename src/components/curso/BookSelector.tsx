import { motion } from "framer-motion";
import { Loader2, BookOpen } from "lucide-react";

interface Props {
  category: string;
  description: string;
  books: string[];
  loading: boolean;
  loadingBook: string | null;
  onSelectBook: (bookName: string) => void;
}

// Emoji map for common bible books
const BOOK_EMOJI: Record<string, string> = {
  "Gênesis": "🌍", "Êxodo": "🔥", "Levítico": "⚖️", "Números": "🔢", "Deuteronômio": "📜",
  "Josué": "⚔️", "Juízes": "🏛️", "Rute": "🌾", "1 Samuel": "👑", "2 Samuel": "🗡️",
  "1 Reis": "👑", "2 Reis": "📖", "1 Crônicas": "📋", "2 Crônicas": "🏰", "Esdras": "🔨",
  "Neemias": "🧱", "Ester": "👸", "Jó": "🤔", "Salmos": "🎵", "Provérbios": "💡",
  "Eclesiastes": "⏳", "Cânticos": "❤️", "Isaías": "🕊️", "Jeremias": "😢", "Lamentações": "💧",
  "Ezequiel": "👁️", "Daniel": "🦁", "Oséias": "💔", "Joel": "🌪️", "Amós": "⚖️",
  "Obadias": "⛰️", "Jonas": "🐋", "Miquéias": "🌟", "Naum": "🌊", "Habacuque": "🙏",
  "Sofonias": "🔔", "Ageu": "🏗️", "Zacarias": "🐴", "Malaquias": "✉️",
  "Mateus": "📖", "Marcos": "🦁", "Lucas": "🩺", "João": "🦅", "Atos": "🌍",
  "Romanos": "⚖️", "1 Coríntios": "💌", "2 Coríntios": "💌", "Gálatas": "🗽",
  "Efésios": "⛪", "Filipenses": "😊", "Colossenses": "👑", "1 Tessalonicenses": "⏰",
  "2 Tessalonicenses": "⏰", "1 Timóteo": "📝", "2 Timóteo": "🔥", "Tito": "🏝️",
  "Filemom": "🤝", "Hebreus": "✝️", "Tiago": "🪞", "1 Pedro": "🪨", "2 Pedro": "🪨",
  "1 João": "❤️", "2 João": "❤️", "3 João": "❤️", "Judas": "⚔️", "Apocalipse": "🌅",
};

export default function BookSelector({ category, description, books, loading, loadingBook, onSelectBook }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Analisando módulo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-display font-bold text-foreground">{category}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      >
        {books.map((bookName) => {
          const isLoading = loadingBook === bookName;
          const emoji = BOOK_EMOJI[bookName] || "📖";
          return (
            <motion.button
              key={bookName}
              onClick={() => !loadingBook && onSelectBook(bookName)}
              disabled={!!loadingBook}
              variants={{
                hidden: { opacity: 0, y: 12, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative bg-card/70 backdrop-blur border border-border/50 rounded-2xl p-4 text-left transition-all hover:shadow-card-hover overflow-hidden disabled:opacity-60"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-primary to-primary/60" />
              <div className="relative z-10 flex flex-col items-center text-center gap-2">
                <span className="text-3xl">{emoji}</span>
                <h3 className="text-sm font-semibold text-foreground leading-tight">{bookName}</h3>
                {isLoading && (
                  <div className="flex items-center gap-1 text-primary">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-[10px]">Gerando...</span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
