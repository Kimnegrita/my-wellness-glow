import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export const CycleCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Calendario de Ciclo</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Selecciona las fechas de tu ciclo menstrual
      </p>
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-border"
        />
      </div>
    </Card>
  );
};
