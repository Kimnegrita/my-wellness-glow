interface TipCategory {
  title: string;
  icon: string;
}

const categories: TipCategory[] = [
  { title: "Nutrición", icon: "restaurant" },
  { title: "Ejercicio", icon: "fitness_center" },
  { title: "Mindfulness", icon: "self_improvement" },
  { title: "Artículos", icon: "insights" },
];

export const TipsGrid = () => {
  return (
    <section>
      <h2 className="text-text-primary-light dark:text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-2">
        Consejos para ti
      </h2>
      <div className="px-4 grid grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <div
            key={index}
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
  );
};
