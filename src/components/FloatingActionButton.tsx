interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <div className="fixed bottom-24 right-4 z-20">
      <button 
        onClick={onClick}
        type="button"
        className="flex items-center justify-center gap-2 h-16 w-16 rounded-full bg-gradient-primary text-white shadow-glow hover:shadow-elegant hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-glow-pulse"
        aria-label="Añadir entrada"
      >
        <span className="material-symbols-outlined text-4xl">add</span>
      </button>
    </div>
  );
};
