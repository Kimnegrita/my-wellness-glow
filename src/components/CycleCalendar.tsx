import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

export const CycleCalendar = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch daily logs for current month
  const { data: logs } = useQuery({
    queryKey: ['daily_logs', user?.id, currentMonth],
    queryFn: async () => {
      if (!user) return [];
      
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', format(start, 'yyyy-MM-dd'))
        .lte('log_date', format(end, 'yyyy-MM-dd'))
        .order('log_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const periodDates = logs?.filter(log => log.period_started || log.period_ended).map(log => parseISO(log.log_date)) || [];
  const loggedDates = logs?.map(log => parseISO(log.log_date)) || [];

  return (
    <Card className="p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Calendario de Ciclo</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Historial de tu ciclo y registros diarios
      </p>
      <div className="flex flex-col items-center">
        <Calendar
          mode="single"
          locale={es}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md border-border"
          modifiers={{
            period: periodDates,
            logged: loggedDates,
          }}
          modifiersStyles={{
            period: {
              backgroundColor: 'hsl(var(--destructive) / 0.2)',
              borderRadius: '50%',
              color: 'hsl(var(--destructive))',
              fontWeight: 'bold',
            },
            logged: {
              position: 'relative',
            },
          }}
        />
        
        {/* Legend */}
        <div className="mt-6 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-destructive/20 border-2 border-destructive"></div>
            <span className="text-muted-foreground">Menstruación</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary"></div>
            <span className="text-muted-foreground">Con registro</span>
          </div>
        </div>
      </div>
    </Card>
  );
};