import { BookOpen, FileText, Heart, NotebookPen, Sparkles, Music, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const tools = [
  {
    title: "Criador de Esboços",
    description: "Esboços com IA e +35 análises teológicas",
    icon: Sparkles,
    gradient: "from-primary to-gold-dark",
    link: "/criar-esboco",
    badge: "Principal",
    span: "col-span-2",
  },
  {
    title: "Bíblia Sagrada",
    description: "13 versões para leitura e estudo",
    icon: BookOpen,
    gradient: "from-secondary to-destructive",
    link: "/biblia",
  },
  {
    title: "Harpa Cristã",
    description: "640 hinos com busca por IA",
    icon: Music,
    gradient: "from-primary to-secondary",
    link: "/harpa",
  },
  {
    title: "Chat Teológico",
    description: "Agente IA especialista em teologia",
    icon: MessageCircle,
    gradient: "from-secondary to-primary",
    link: "/chat",
    badge: "IA",
    span: "col-span-2",
  },
  {
    title: "Versículos Favoritos",
    description: "Marque e salve seus trechos",
    icon: Heart,
    gradient: "from-destructive to-secondary",
    link: "/favoritos",
    badge: "Novidade",
  },
  {
    title: "Minhas Anotações",
    description: "Estudos pessoais organizados",
    icon: NotebookPen,
    gradient: "from-primary to-gold-dark",
    link: "/anotacoes",
    badge: "Novidade",
  },
  {
    title: "Banco de Temas",
    description: "Temas prontos para suas pregações",
    icon: FileText,
    gradient: "from-secondary to-destructive",
    link: "/temas",
    badge: "Exclusivo",
    span: "col-span-2",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

export default function ToolsGrid() {
  return (
    <section className="py-6 pb-24">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-6 bg-gradient-gold rounded-full" />
        <h2 className="text-sm font-semibold font-body tracking-widest uppercase text-muted-foreground">
          Ferramentas
        </h2>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tools.map((tool) => (
          <motion.div key={tool.title} variants={itemVariants} className={tool.span || ""}>
            <Link
              to={tool.link}
              className={`relative block rounded-2xl p-5 min-h-[120px] bg-gradient-to-br ${tool.gradient} text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-card-hover group overflow-hidden`}
            >
              {/* Subtle glass overlay */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              {tool.badge && (
                <span className="absolute top-3 right-3 text-[9px] font-bold font-body uppercase tracking-wider bg-background/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                  {tool.badge}
                </span>
              )}
              <tool.icon className="w-7 h-7 mb-2.5 opacity-90" />
              <h3 className="font-display font-bold text-sm leading-tight mb-0.5">
                {tool.title}
              </h3>
              <p className="text-[11px] opacity-75 font-body leading-snug">
                {tool.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
