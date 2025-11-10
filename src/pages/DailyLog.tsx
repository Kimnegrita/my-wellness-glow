import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const symptoms = [
  { name: "Dolor de cabeza", icon: "sick" },
  { name: "Hinchazón", icon: "airwave" },
  { name: "Calambres", icon: "local_fire_department" },
  { name: "Fatiga", icon: "battery_alert" },
  { name: "Sensibilidad", icon: "favorite" },
];

const moods = [
  { emoji: "😊", label: "Feliz" },
  { emoji: "😌", label: "Calmada" },
  { emoji: "😟", label: "Ansiosa" },
  { emoji: "😠", label: "Irritable" },
  { emoji: "😢", label: "Triste" },
];

const flowLevels = [
  { name: "Manchado", icon: "water_drop" },
  { name: "Ligero", icon: "invert_colors" },
  { name: "Medio", icon: "invert_colors" },
  { name: "Abundante", icon: "invert_colors" },
];

const DailyLog = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState(["Dolor de cabeza"]);
  const [selectedMood, setSelectedMood] = useState("Ansiosa");
  const [intensity, setIntensity] = useState(32);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleSymptom = (name: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-28">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-primary via-primary-light to-primary-container dark:from-primary-darker dark:via-primary dark:to-primary-container-dark opacity-20 dark:opacity-30 blur-3xl"></div>

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-4 pb-2 justify-between">
        <div className="flex size-12 shrink-0 items-center">
          <img
            className="rounded-full size-10"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjtpgMP2CKPE_B3w125EgH6iAiKQsk0uac7brJgm4QUXs1xxjXwFiR1NO1LIbK6pYxQKbk6NcF6pxheJMOfOZ-rPoDvjRaquT1fBDKznB9CEBA5IkEeaFDHKdCnOCfNc6r3XpSD7G-JqqjUyeQeHYytCxc4yBInGNcm_PCKlqYF5cP245w4zYn1yKb6G1hfFDvJaEg1SX_cpFsK9vQ4FPJRynD5QV_I_nHq_HZR9s63oTcNxKGbvl5zH2VSY5brhXNyh8Q1eMbtU4"
            alt="User profile"
          />
        </div>
        <h1 className="text-on-surface dark:text-on-surface-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1">
          ¿Cómo te sientes hoy, Ana?
        </h1>
        <div className="flex items-center justify-end gap-2">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-transparent text-on-surface dark:text-on-surface-dark gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0" title="Calendario" aria-label="Abrir calendario">
            <span className="material-symbols-outlined text-2xl">calendar_today</span>
          </button>
          <button onClick={() => navigate('/assistant')} type="button" className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-transparent text-primary dark:text-primary-light gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-primary/10 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" title="Asistente de IA" aria-label="Abrir asistente de IA">
            <span className="material-symbols-outlined text-2xl">psychology</span>
          </button>
        </div>
      </header>

      {/* Date Selector */}
      <div className="flex px-4 py-3 z-[1]">
        <div className="flex h-10 flex-1 items-center justify-center rounded-xl bg-primary-container/60 dark:bg-primary-container-dark/60 backdrop-blur-sm p-1">
          {["Ayer", "Hoy", "Mañana"].map((day) => (
            <label
              key={day}
              className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-on-surface-variant dark:text-on-surface-variant-dark has-[:checked]:bg-surface dark:has-[:checked]:bg-surface-dark has-[:checked]:shadow-[0_0_4px_rgba(0,0,0,0.1)] has-[:checked]:text-on-surface dark:has-[:checked]:text-on-surface-dark text-sm font-medium leading-normal transition-colors"
            >
              <span className="truncate">{day}</span>
              <input
                className="invisible w-0"
                name="date-selector"
                type="radio"
                value={day}
                defaultChecked={day === "Hoy"}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Accesos rápidos IA */}
      <div className="px-4 -mt-2 z-[1]">
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => navigate('/assistant')} type="button" className="flex flex-col items-center justify-center rounded-xl p-2 bg-surface/80 dark:bg-surface-dark/80 border border-white/50 dark:border-white/10 hover:bg-primary/10 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary">psychology</span>
            <span className="text-[10px] text-on-surface-variant dark:text-on-surface-variant-dark">Luna</span>
          </button>
          <button onClick={() => navigate('/predictions')} type="button" className="flex flex-col items-center justify-center rounded-xl p-2 bg-surface/80 dark:bg-surface-dark/80 border border-white/50 dark:border-white/10 hover:bg-primary/10 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary">event</span>
            <span className="text-[10px] text-on-surface-variant dark:text-on-surface-variant-dark">Predicción</span>
          </button>
          <button onClick={() => navigate('/health-center')} type="button" className="flex flex-col items-center justify-center rounded-xl p-2 bg-surface/80 dark:bg-surface-dark/80 border border-white/50 dark:border-white/10 hover:bg-primary/10 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary">monitor_heart</span>
            <span className="text-[10px] text-on-surface-variant dark:text-on-surface-variant-dark">Salud</span>
          </button>
          <button onClick={() => navigate('/insights')} type="button" className="flex flex-col items-center justify-center rounded-xl p-2 bg-surface/80 dark:bg-surface-dark/80 border border-white/50 dark:border-white/10 hover:bg-primary/10 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-primary">insights</span>
            <span className="text-[10px] text-on-surface-variant dark:text-on-surface-variant-dark">Insights</span>
          </button>
        </div>
      </div>

      <main className="flex flex-col gap-6 px-4 z-[1]">
        {/* Physical Symptoms */}
        <section className="flex flex-col gap-4 rounded-xl bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-sm p-4 shadow-sm border border-white/50 dark:border-white/10">
          <h2 className="text-on-surface dark:text-on-surface-dark text-lg font-bold leading-tight tracking-[-0.015em]">
            Síntomas Físicos
          </h2>
          <div className="flex gap-2 flex-wrap">
            {symptoms.map((symptom) => (
              <label
                key={symptom.name}
                onClick={() => toggleSymptom(symptom.name)}
                className={`flex cursor-pointer h-9 shrink-0 items-center justify-center gap-x-2 rounded-xl pl-3 pr-4 transition-all ${
                  selectedSymptoms.includes(symptom.name)
                    ? "bg-primary text-white chip-selected"
                    : "bg-background-light dark:bg-background-dark ring-1 ring-outline dark:ring-outline-dark hover:bg-primary-container dark:hover:bg-primary-container-dark"
                }`}
                role="button"
                tabIndex={0}
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    selectedSymptoms.includes(symptom.name)
                      ? "text-white"
                      : "text-on-surface-variant dark:text-on-surface-variant-dark"
                  }`}
                >
                  {symptom.icon}
                </span>
                <p
                  className={`text-sm font-medium leading-normal ${
                    selectedSymptoms.includes(symptom.name)
                      ? "text-white"
                      : "text-on-surface dark:text-on-surface-dark"
                  }`}
                >
                  {symptom.name}
                </p>
                <input className="sr-only" type="checkbox" />
              </label>
            ))}
          </div>

          {/* Intensity Slider */}
          <div className="pt-2">
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-on-surface dark:text-on-surface-dark text-base font-medium leading-normal">
                  Intensidad
                </p>
                <p className="text-on-surface-variant dark:text-on-surface-variant-dark text-sm font-normal leading-normal">
                  Leve
                </p>
              </div>
              <div className="flex h-4 w-full items-center gap-4">
                <div className="flex h-1.5 flex-1 rounded-full bg-outline dark:bg-outline-dark">
                  <div className="h-full rounded-full bg-primary relative" style={{ width: `${intensity}%` }}>
                    <div className="absolute -right-2 -top-1.5 size-5 rounded-full bg-primary ring-4 ring-background-light dark:ring-background-dark"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mood Selector */}
        <section className="flex flex-col gap-4 rounded-xl bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-sm p-4 shadow-sm border border-white/50 dark:border-white/10">
          <h2 className="text-on-surface dark:text-on-surface-dark text-lg font-bold leading-tight tracking-[-0.015em]">
            Mi Estado de Ánimo
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.label}
                type="button"
                onClick={() => setSelectedMood(mood.label)}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl p-2 transition-all ${
                  selectedMood === mood.label
                    ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30"
                    : "bg-background-light dark:bg-background-dark ring-1 ring-outline dark:ring-outline-dark hover:bg-primary-container dark:hover:bg-primary-container-dark scale-100 hover:scale-105 active:scale-95"
                }`}
              >
                <span className="text-4xl">{mood.emoji}</span>
                <p
                  className={`text-xs font-medium ${
                    selectedMood === mood.label
                      ? "text-white"
                      : "text-on-surface dark:text-on-surface-dark"
                  }`}
                >
                  {mood.label}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Cycle Tracker */}
        <section className="flex flex-col gap-4 rounded-xl bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-sm p-4 shadow-sm border border-white/50 dark:border-white/10">
          <h2 className="text-on-surface dark:text-on-surface-dark text-lg font-bold leading-tight tracking-[-0.015em]">
            Ciclo
          </h2>
          <div className="flex gap-2 flex-wrap">
            {flowLevels.map((flow) => (
              <label
                key={flow.name}
                onClick={() => setSelectedFlow(flow.name)}
                className={`flex cursor-pointer h-9 shrink-0 items-center justify-center gap-x-2 rounded-xl pl-3 pr-4 transition-all ${
                  selectedFlow === flow.name
                    ? "bg-primary text-white ring-primary chip-selected"
                    : "bg-background-light dark:bg-background-dark ring-1 ring-outline dark:ring-outline-dark hover:bg-primary-container dark:hover:bg-primary-container-dark"
                }`}
                role="button"
                tabIndex={0}
              >
                <span className={`material-symbols-outlined text-xl ${selectedFlow === flow.name ? 'text-white' : 'text-on-surface-variant dark:text-on-surface-variant-dark'}`}>
                  {flow.icon}
                </span>
                <p className={`text-sm font-medium leading-normal ${selectedFlow === flow.name ? 'text-white' : 'text-on-surface dark:text-on-surface-dark'}`}>
                  {flow.name}
                </p>
                <input className="sr-only" type="checkbox" />
              </label>
            ))}
          </div>
        </section>

        {/* Notes Section */}
        <section className="flex flex-col gap-4 rounded-xl bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-sm p-4 shadow-sm border border-white/50 dark:border-white/10">
          <h2 className="text-on-surface dark:text-on-surface-dark text-lg font-bold leading-tight tracking-[-0.015em]">
            ¿Algo más que quieras añadir?
          </h2>
          <textarea
            className="w-full min-h-[100px] rounded-lg border-none bg-background-light dark:bg-background-dark p-3 text-sm font-normal text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-variant dark:placeholder:text-on-surface-variant-dark focus:ring-2 focus:ring-primary/50 transition"
            placeholder="Escribe sobre tu día, antojos, o cualquier otro detalle relevante..."
          />
        </section>
      </main>

      {/* Footer Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-light to-transparent dark:from-background-dark dark:to-transparent z-10">
        <button
          type="button"
          onClick={() => toast.success('Registro guardado correctamente')}
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-primary text-white gap-2 px-5 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors shadow-lg shadow-primary/40"
        >
          Guardar Registro
        </button>
      </footer>
    </div>
  );
};

export default DailyLog;
