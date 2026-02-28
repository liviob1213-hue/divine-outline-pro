import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-bible-video.mp4";
const logoPregai = "/icons/icon-512x512.png";

// Note: brand name is Palavraai
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
          webkit-playsinline=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(262,70%,50%,0.85)] via-[hsl(262,75%,40%,0.75)] to-[hsl(280,60%,35%,0.6)]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(90deg, transparent 0%, hsl(45 100% 55% / 0.3) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 6s ease-in-out infinite"
          }}
        />
      </div>

      <div className="relative z-10 px-6 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-yellow-300 px-3 py-1 rounded-full text-xs font-body font-semibold mb-3">
            <Sparkles className="w-3 h-3" />
            Potencializado por IA
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
            Sua Bíblia<br />
            <span className="text-gradient-gold">Digital</span>
          </h1>
          <p className="text-white/70 font-body text-sm max-w-md mb-6 leading-relaxed">
            Estude, medite e cresça espiritualmente com recursos exclusivos — Bíblia, dicionário bíblico e enciclopédia judaica.
          </p>

          <Link
            to="/criar-esboco"
            className="inline-flex items-center gap-2 font-body font-bold text-sm px-6 py-3.5 rounded-xl shadow-gold hover:scale-105 transition-transform text-white"
            style={{ background: "var(--gradient-gold)" }}
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
