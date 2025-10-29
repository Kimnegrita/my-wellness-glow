import { Link, useLocation } from "react-router-dom";

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: "home", label: "Inicio", path: "/" },
  { icon: "calendar_month", label: "Calendario", path: "/calendar" },
  { icon: "spa", label: "Bienestar", path: "/wellness" },
  { icon: "bar_chart", label: "Registro", path: "/daily-log" },
  { icon: "person", label: "Perfil", path: "/profile" },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm border-t border-gray-200 dark:border-white/10 p-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl gap-1 ${
              isActive
                ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <span
              className={`material-symbols-outlined ${isActive ? "material-symbols-filled" : ""}`}
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span className={`text-xs ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
