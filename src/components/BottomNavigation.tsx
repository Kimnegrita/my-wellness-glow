interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
  filled?: boolean;
}

const navItems: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", active: true, filled: true },
  { icon: "calendar_month", label: "Calendario", active: false },
  { icon: "spa", label: "Consejos", active: false },
  { icon: "person", label: "Perfil", active: false },
];

export const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-surface-light dark:bg-surface-dark border-t border-black/5 dark:border-white/5 flex justify-around items-center z-10">
      {navItems.map((item, index) => (
        <a
          key={index}
          className={`flex flex-col items-center justify-center gap-1 w-1/4 ${
            item.active
              ? "text-primary"
              : "text-text-secondary-light dark:text-text-secondary-dark"
          }`}
          href="#"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings: item.filled ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            {item.icon}
          </span>
          <span className={`text-xs ${item.active ? "font-bold" : "font-medium"}`}>
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  );
};
