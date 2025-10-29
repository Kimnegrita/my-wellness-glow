interface Symptom {
  name: string;
  icon: string;
  percentage: number;
  opacity: string;
}

const symptoms: Symptom[] = [
  {
    name: "Dolor de cabeza",
    icon: "sentiment_very_dissatisfied",
    percentage: 25,
    opacity: "bg-primary/30",
  },
  {
    name: "Fatiga",
    icon: "battery_alert",
    percentage: 70,
    opacity: "bg-primary/60",
  },
  {
    name: "Hinchazón",
    icon: "gastroenterology",
    percentage: 90,
    opacity: "bg-primary",
  },
];

export const RecentSymptoms = () => {
  return (
    <section>
      <h2 className="text-text-primary-light dark:text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-2">
        Tus Síntomas Recientes
      </h2>
      <div className="px-4">
        <div className="flex flex-col gap-4 p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium leading-normal">
              Últimos 7 días
            </p>
            <a className="text-sm font-bold text-primary dark:text-primary-light" href="#">
              Ver todos
            </a>
          </div>
          <div className="grid w-full gap-y-4 pt-1">
            {symptoms.map((symptom, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary dark:text-primary-light text-3xl">
                  {symptom.icon}
                </span>
                <div className="w-full">
                  <p className="text-text-primary-light dark:text-text-primary-dark text-base font-bold leading-normal tracking-[0.015em]">
                    {symptom.name}
                  </p>
                  <div className="h-1.5 flex-1 rounded-full bg-progress-bg-light dark:bg-progress-bg-dark mt-1">
                    <div
                      className={`h-1.5 rounded-full ${symptom.opacity}`}
                      style={{ width: `${symptom.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
