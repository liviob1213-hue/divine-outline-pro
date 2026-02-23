import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bible.jpg";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl mb-8">
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Bíblia aberta com luz dourada"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
      </div>

      <div className="relative z-10 px-6 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gold-light font-body text-xs uppercase tracking-[0.2em] mb-2">
            Bem-vindo de volta
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground leading-tight mb-2">
            Pregação <span className="text-gradient-gold">Poderosa</span>
          </h1>
          <p className="text-primary-foreground/70 font-body text-sm max-w-md mb-6">
            Crie esboços completos de pregação com IA, análises teológicas profundas e referências cruzadas.
          </p>

          <Link
            to="/criar-esboco"
            className="inline-flex items-center gap-2 bg-gradient-gold text-primary font-body font-semibold text-sm px-6 py-3 rounded-xl shadow-gold hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            Criar Esboço com IA
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
