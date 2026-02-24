import { BookOpen, Moon, Sun, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return !document.documentElement.classList.contains("light");
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsDark(false);
    }
  }, []);

  return (
    <header className="flex items-center justify-between py-4">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-gold" style={{ background: "var(--gradient-gold)" }}>
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-lg text-foreground">
          PregAI
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
