import { BookOpen, Moon, Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-9 h-9 bg-gradient-gold rounded-lg flex items-center justify-center shadow-gold">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <span className="font-display font-bold text-lg text-foreground">
          PregAI
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Moon className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
