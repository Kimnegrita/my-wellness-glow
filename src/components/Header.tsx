import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center bg-card p-4 pb-2 justify-between sticky top-0 z-10 shadow-soft border-b border-border backdrop-blur-sm">
      <div className="flex size-12 shrink-0 items-center">
        <div className="rounded-full size-10 bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-soft">
          {profile?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
      <h1 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1">
        Hola, {profile?.name || "Usuario"}
      </h1>
      <div className="flex items-center justify-end gap-2">
        <ThemeToggle />
        <button
          onClick={() => navigate('/assistant')}
          type="button"
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-transparent text-primary hover:bg-primary/10 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          title="AI Assistant"
          aria-label="Abrir asistente de IA"
        >
          <span className="material-symbols-outlined">psychology</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          type="button"
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-transparent text-foreground hover:bg-muted active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          title="Notificaciones"
          aria-label="Ver notificaciones"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );
};
