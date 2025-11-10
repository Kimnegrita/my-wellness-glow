interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <div className="fixed bottom-24 right-4 z-20">
      <button 
        onClick={onClick}
        type="button"
        className="flex items-center justify-center gap-2 h-16 w-16 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Añadir entrada"
      >
        <span className="material-symbols-outlined text-4xl">add</span>
      </button>
    </div>
  );
};
