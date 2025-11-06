import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center bg-surface-light dark:bg-surface-dark p-4 pb-2 justify-between sticky top-0 z-10 shadow-sm shadow-black/[0.02] dark:shadow-black/20">
      <div className="flex size-12 shrink-0 items-center">
        <div className="rounded-full size-10 bg-gradient-to-br from-primary to-primary-darker flex items-center justify-center text-white font-bold text-lg">
          {profile?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
      <h1 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1">
        Hola, {profile?.name || "Usuario"}
      </h1>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => navigate('/assistant')}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-transparent text-primary dark:text-primary-light hover:bg-primary/10 transition-colors"
          title="AI Assistant"
        >
          <span className="material-symbols-outlined">psychology</span>
        </button>
        <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-transparent text-text-primary-light dark:text-text-primary-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );
};
