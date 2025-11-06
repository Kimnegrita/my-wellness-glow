import { useNavigate } from "react-router-dom";

interface DailyLog {
  log_date: string;
  symptoms: string[] | null;
  period_started: boolean | null;
  period_ended: boolean | null;
  journal_entry: string | null;
}

interface Symptom {
  name: string;
  icon: string;
  count: number;
  percentage: number;
}

interface RecentSymptomsProps {
  weekLogs?: DailyLog[];
}

const symptomIcons: Record<string, string> = {
  "Dolor de cabeza": "sentiment_very_dissatisfied",
  "Fatiga": "battery_alert",
  "Hinchazón": "gastroenterology",
  "Cambios de humor": "mood",
  "Ansiedad": "psychology",
  "Insomnio": "bedtime",
  "Sofocos": "whatshot",
  "Dolor articular": "healing",
  "Irritabilidad": "sentiment_dissatisfied",
  "Niebla mental": "cloud",
};

export const RecentSymptoms = ({ weekLogs }: RecentSymptomsProps) => {
  const navigate = useNavigate();

  // Calculate symptom frequency
  const symptomCounts: Record<string, number> = {};
  weekLogs?.forEach(log => {
    log.symptoms?.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const totalDays = weekLogs?.length || 0;
  const symptoms: Symptom[] = Object.entries(symptomCounts)
    .map(([name, count]) => ({
      name,
      icon: symptomIcons[name] || "healing",
      count,
      percentage: totalDays > 0 ? (count / totalDays) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const getOpacity = (percentage: number): string => {
    if (percentage >= 70) return "bg-primary";
    if (percentage >= 40) return "bg-primary/60";
    return "bg-primary/30";
  };

  if (symptoms.length === 0) {
    return (
      <section>
        <h2 className="text-text-primary-light dark:text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-2">
          Tus Síntomas Recientes
        </h2>
        <div className="px-4">
          <div className="flex flex-col gap-4 p-4 rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm">
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm text-center py-4">
              No hay síntomas registrados esta semana.
              <br />
              Empieza a registrar tus síntomas diarios.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
            <button
              onClick={() => navigate('/history')}
              className="text-sm font-bold text-primary dark:text-primary-light"
            >
              Ver todos
            </button>
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
                      className={`h-1.5 rounded-full ${getOpacity(symptom.percentage)}`}
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
