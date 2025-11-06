import { useNavigate } from "react-router-dom";

interface TipCategory {
  title: string;
  icon: string;
  route: string;
}

interface DailyTip {
  tip: string;
  icon: string;
  category: string;
}

interface TipsGridProps {
  dailyTip?: DailyTip;
}

const categories: TipCategory[] = [
  { title: "Nutrición", icon: "restaurant", route: "/wellness" },
  { title: "Ejercicio", icon: "fitness_center", route: "/wellness" },
  { title: "Mindfulness", icon: "self_improvement", route: "/wellness" },
  { title: "Recursos", icon: "insights", route: "/resources" },
];

export const TipsGrid = ({ dailyTip }: TipsGridProps) => {
  const navigate = useNavigate();

  return (
    <>
      {dailyTip && (
        <section className="px-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-6 border border-primary/20">
            <div className="absolute -top-10 -right-10 size-32 bg-primary/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 size-32 bg-secondary/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-3xl">
                  {dailyTip.icon}
                </span>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                  {dailyTip.category}
                </h3>
              </div>
              <p className="text-text-primary-light dark:text-text-primary-dark text-base leading-relaxed">
                {dailyTip.tip}
              </p>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-text-primary-light dark:text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-2">
          Consejos para ti
        </h2>
        <div className="px-4 grid grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => navigate(category.route)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-primary-light/20 dark:bg-primary/20 text-center shadow-sm cursor-pointer hover:bg-primary-light/30 dark:hover:bg-primary/30 transition-colors"
            >
              <div className="flex items-center justify-center size-12 rounded-full bg-primary text-white">
                <span className="material-symbols-outlined text-3xl">{category.icon}</span>
              </div>
              <h3 className="font-bold text-base text-primary-darker dark:text-white">
                {category.title}
              </h3>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
