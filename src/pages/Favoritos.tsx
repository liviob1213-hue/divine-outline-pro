import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";

const SAMPLE_FAVORITES = [
  { ref: "Salmos 23:1", text: "O Senhor é o meu pastor; nada me faltará." },
  { ref: "João 3:16", text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..." },
  { ref: "Filipenses 4:13", text: "Tudo posso naquele que me fortalece." },
];

export default function Favoritos() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-secondary" />
              Versículos Favoritos
            </h1>
            <p className="text-xs text-muted-foreground font-body">Seus trechos marcados e salvos</p>
          </div>
        </div>

        {SAMPLE_FAVORITES.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-body text-sm">Nenhum versículo favoritado ainda.</p>
            <p className="text-muted-foreground/70 font-body text-xs mt-1">
              Use a Bíblia Sagrada para marcar seus versículos preferidos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {SAMPLE_FAVORITES.map((fav, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-5 border border-border shadow-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-body font-bold text-secondary">{fav.ref}</span>
                  <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm font-body text-foreground/90 leading-relaxed italic">
                  "{fav.text}"
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
