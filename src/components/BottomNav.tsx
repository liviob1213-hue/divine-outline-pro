import { BookOpen, Sparkles, Music, MessageCircle, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: BookOpen, label: "Bíblia", path: "/biblia" },
  { icon: Sparkles, label: "Esboço", path: "/criar-esboco" },
  { icon: Music, label: "Harpa", path: "/harpa" },
  { icon: MessageCircle, label: "Chat IA", path: "/chat" },
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
                  ? "text-secondary"
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
