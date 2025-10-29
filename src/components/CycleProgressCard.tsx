export const CycleProgressCard = () => {
  return (
    <section className="px-4 pt-5">
      <div className="relative flex flex-col items-center justify-center gap-4 rounded-xl bg-gradient-to-br from-primary to-primary-darker p-6 text-white overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute -top-10 -right-10 size-32 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 size-40 bg-white/10 rounded-full"></div>

        <p className="text-sm font-medium uppercase tracking-widest z-10">Tu Ciclo Hoy</p>
        <h2 className="text-4xl font-bold z-10">Día 14</h2>
        <p className="text-lg font-medium bg-white/20 px-4 py-1 rounded-full z-10">Fase Ovulatoria</p>

        <div className="w-full pt-4 z-10">
          <div className="flex justify-between text-xs font-medium text-white/80 mb-1">
            <span>Menstruación</span>
            <span>Ovulación</span>
            <span>Próx. periodo</span>
          </div>
          <div className="rounded-full bg-white/20 h-2 w-full relative">
            <div className="h-2 rounded-full bg-white" style={{ width: "50%" }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4 bg-white rounded-full border-2 border-primary-darker"></div>
          </div>
          <p className="text-center text-sm font-medium mt-3 text-white/90">
            Próxima menstruación en 14 días
          </p>
        </div>
      </div>
    </section>
  );
};
