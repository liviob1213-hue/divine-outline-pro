import { BookOpen, FileText, Heart, NotebookPen, Sparkles, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const tools = [
  {
    title: "Criador de Esboços",
    description: "Crie esboços de pregação com IA e mais de 27 análises teológicas",
    icon: Sparkles,
    color: "bg-gradient-gold",
    link: "/criar-esboco",
    badge: "Principal",
  },
  {
    title: "Bíblia Sagrada",
    description: "Leia e estude em 13 versões diferentes",
    icon: BookOpen,
    color: "from-navy to-navy-deep bg-gradient-to-br",
    link: "#",
  },
  {
    title: "Harpa Cristã",
    description: "640 hinos para adoração",
    icon: Music,
    color: "from-destructive to-destructive/80 bg-gradient-to-br",
    link: "#",
  },
  {
    title: "Versículos Favoritos",
    description: "Seus trechos marcados e salvos",
    icon: Heart,
    color: "from-secondary to-gold-dark bg-gradient-to-br",
    link: "#",
    badge: "Novidade",
  },
  {
    title: "Minhas Anotações",
    description: "Seus estudos pessoais organizados",
    icon: NotebookPen,
    color: "from-navy-light to-navy bg-gradient-to-br",
    link: "#",
    badge: "Novidade",
  },
  {
    title: "Banco de Temas",
    description: "Temas prontos para inspirar suas pregações",
    icon: FileText,
    color: "from-gold-dark to-secondary bg-gradient-to-br",
    link: "#",
    badge: "Exclusivo",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ToolsGrid() {
  return (
    <section className="py-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-gradient-gold rounded-full" />
        <h2 className="text-lg font-semibold font-body tracking-wide uppercase text-muted-foreground">
          Ferramentas Principais
        </h2>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tools.map((tool) => (
          <motion.div key={tool.title} variants={itemVariants}>
            <Link
              to={tool.link}
              className={`relative block rounded-xl p-5 min-h-[140px] ${tool.color} text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-card-hover`}
            >
              {tool.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold font-body uppercase tracking-wider bg-background/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                  {tool.badge}
                </span>
              )}
              <tool.icon className="w-8 h-8 mb-3 opacity-90" />
              <h3 className="font-display font-bold text-sm leading-tight mb-1">
                {tool.title}
              </h3>
              <p className="text-xs opacity-80 font-body leading-snug">
                {tool.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
