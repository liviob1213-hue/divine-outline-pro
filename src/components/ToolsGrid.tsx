import { BookOpen, FileText, Heart, NotebookPen, Sparkles, Music, MessageCircle, FolderOpen, BookMarked, Languages, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const tools = [
  {
    title: "Bíblia Sagrada",
    description: "Leia e estude em 13 versões diferentes",
    icon: BookOpen,
    bg: "bg-gradient-to-br from-[hsl(262,70%,50%)] to-[hsl(262,75%,35%)]",
    iconColor: "text-yellow-300",
    link: "/biblia",
  },
  {
    title: "Harpa Cristã",
    description: "640 hinos para adoração",
    icon: Music,
    bg: "bg-gradient-to-br from-[hsl(0,72%,51%)] to-[hsl(350,65%,40%)]",
    iconColor: "text-white",
    link: "/harpa",
  },
  {
    title: "Versículos Favoritos",
    description: "Seus trechos marcados",
    icon: Heart,
    bg: "bg-gradient-to-br from-[hsl(25,95%,53%)] to-[hsl(35,95%,45%)]",
    iconColor: "text-red-200",
    link: "/favoritos",
    badge: "Novidade",
  },
  {
    title: "Minhas Anotações",
    description: "Seus estudos pessoais",
    icon: NotebookPen,
    bg: "bg-gradient-to-br from-[hsl(160,60%,38%)] to-[hsl(170,55%,28%)]",
    iconColor: "text-emerald-200",
    link: "/anotacoes",
    badge: "Novidade",
  },
  {
    title: "Dicionário Bíblico",
    description: "Significados e contexto das palavras",
    icon: Languages,
    bg: "bg-gradient-to-br from-[hsl(330,80%,55%)] to-[hsl(280,60%,45%)]",
    iconColor: "text-pink-200",
    link: "/dicionario",
    badge: "Novo",
  },
  {
    title: "Enciclopédia Judaica",
    description: "Tradições, cultura e história",
    icon: BookMarked,
    bg: "bg-gradient-to-br from-[hsl(35,95%,50%)] to-[hsl(25,90%,40%)]",
    iconColor: "text-amber-200",
    link: "/enciclopedia",
    badge: "Novo",
  },
  {
    title: "Criador de Esboços",
    description: "Esboços com IA e +35 análises teológicas",
    icon: Sparkles,
    bg: "bg-gradient-to-br from-[hsl(262,70%,50%)] to-[hsl(330,80%,55%)]",
    iconColor: "text-yellow-300",
    link: "/criar-esboco",
    badge: "Principal",
    span: "col-span-2",
  },
  {
    title: "Chat Teológico",
    description: "Agente IA especialista em teologia",
    icon: MessageCircle,
    bg: "bg-gradient-to-br from-[hsl(200,70%,45%)] to-[hsl(220,65%,35%)]",
    iconColor: "text-cyan-200",
    link: "/chat",
    badge: "IA",
    span: "col-span-2",
  },
  {
    title: "Banco de Temas",
    description: "Temas prontos para suas pregações",
    icon: FileText,
    bg: "bg-gradient-to-br from-[hsl(45,90%,50%)] to-[hsl(35,85%,42%)]",
    iconColor: "text-yellow-100",
    link: "/temas",
    badge: "Exclusivo",
  },
  {
    title: "Materiais do Pastor",
    description: "Anotações, imagens e vídeos salvos",
    icon: FolderOpen,
    bg: "bg-gradient-to-br from-[hsl(280,60%,45%)] to-[hsl(300,50%,35%)]",
    iconColor: "text-purple-200",
    link: "/materiais",
    badge: "Novo",
  },
  {
    title: "Curso de Teologia",
    description: "31 módulos interativos com flashcards e quiz",
    icon: GraduationCap,
    bg: "bg-gradient-to-br from-[hsl(262,70%,50%)] to-[hsl(200,70%,45%)]",
    iconColor: "text-cyan-200",
    link: "/curso",
    badge: "Novo",
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
        <div className="w-1 h-6 rounded-full" style={{ background: "var(--gradient-gold)" }} />
        <h2 className="text-sm font-semibold font-body tracking-widest uppercase text-muted-foreground">
          Ferramentas Principais
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
              className={`relative block rounded-2xl p-5 min-h-[120px] ${tool.bg} text-white transition-all hover:scale-[1.02] hover:shadow-card-hover group overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              {tool.badge && (
                <span className="absolute top-3 right-3 text-[9px] font-bold font-body uppercase tracking-wider bg-black/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-white/90">
                  {tool.badge}
                </span>
              )}
              <tool.icon className={`w-7 h-7 mb-2.5 ${tool.iconColor}`} />
              <h3 className="font-display font-bold text-sm leading-tight mb-0.5">
                {tool.title}
              </h3>
              <p className="text-[11px] opacity-80 font-body leading-snug">
                {tool.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
