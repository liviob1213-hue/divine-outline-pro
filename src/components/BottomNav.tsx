import { BookOpen, Sparkles, Music, MessageCircle, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Início", path: "/", activeColor: "text-purple-400" },
  { icon: BookOpen, label: "Bíblia", path: "/biblia", activeColor: "text-purple-400" },
  { icon: Sparkles, label: "Esboço", path: "/criar-esboco", activeColor: "text-yellow-400" },
  { icon: Music, label: "Harpa", path: "/harpa", activeColor: "text-red-400" },
  { icon: MessageCircle, label: "Chat IA", path: "/chat", activeColor: "text-cyan-400" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? item.activeColor
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-body font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
