import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-bible-video.mp4";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl mb-8">
      <div className="absolute inset-0">
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/75 to-secondary/60" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(90deg, transparent 0%, hsl(35 90% 50% / 0.3) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 6s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative z-10 px-6 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 bg-secondary/20 backdrop-blur-sm text-secondary px-3 py-1 rounded-full text-xs font-body font-semibold mb-3">
            <Sparkles className="w-3 h-3" />
            Potencializado por IA
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground leading-tight mb-3">
            Sua pregação<br />
            <span className="text-gradient-gold">transformada</span>
          </h1>
          <p className="text-primary-foreground/70 font-body text-sm max-w-md mb-6 leading-relaxed">
            Esboços completos com análises teológicas, referências cruzadas e aplicações práticas — tudo com inteligência artificial.
          </p>

          <Link
            to="/criar-esboco"
            className="inline-flex items-center gap-2 bg-gradient-gold text-primary font-body font-bold text-sm px-6 py-3.5 rounded-xl shadow-gold hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            Criar Esboço com IA
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
