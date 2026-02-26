import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Book {
  name: string;
  description: string;
  emoji: string;
}

interface Props {
  category: string;
  books: Book[];
  loading: boolean;
  loadingBook: string | null;
  onSelectBook: (bookName: string) => void;
}

export default function BookSelector({ category, books, loading, loadingBook, onSelectBook }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando livros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-display font-bold text-foreground">{category}</h2>
        <p className="text-sm text-muted-foreground mt-1">Escolha um livro para estudar em profundidade</p>
      </div>
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      >
        {books.map((book) => {
          const isLoading = loadingBook === book.name;
          return (
            <motion.button
              key={book.name}
              onClick={() => !loadingBook && onSelectBook(book.name)}
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
              <div className="relative z-10">
                <span className="text-2xl mb-2 block">{book.emoji}</span>
                <h3 className="text-sm font-semibold text-foreground leading-tight mb-1">{book.name}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{book.description}</p>
                {isLoading && (
                  <div className="mt-2 flex items-center gap-1 text-primary">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-[10px]">Gerando estudo...</span>
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
