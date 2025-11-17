import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import { addDays, parseISO, startOfMonth, endOfMonth, format } from "date-fns";
import { getCycleInfo } from "@/lib/cycleCalculations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { es } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Droplet, Edit2 } from "lucide-react";

export const CycleCalendar = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Fetch ALL logs para cálculos precisos
  const { data: allLogs } = useQuery({
    queryKey: ['all_logs_calendar', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('daily_logs')
        .select('log_date, period_started, period_ended')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const togglePeriodMutation = useMutation({
    mutationFn: async ({ date, isPeriod }: { date: Date; isPeriod: boolean }) => {
      if (!user) throw new Error("No user");

      const periodDuration = profile?.avg_period_duration || 5;
      const dateStr = format(date, 'yyyy-MM-dd');
      
      if (isPeriod) {
        // Marcar múltiples días como periodo
        const periodDates = [];
        for (let i = 0; i < periodDuration; i++) {
          const currentDate = addDays(date, i);
          const currentDateStr = format(currentDate, 'yyyy-MM-dd');
          const existingLog = logs?.find(log => log.log_date === currentDateStr);
          
          if (existingLog) {
            periodDates.push(
              supabase
                .from('daily_logs')
                .update({
                  period_started: i === 0, // Solo el primer día es inicio
                  period_ended: i === periodDuration - 1, // Solo el último día es fin
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingLog.id)
            );
          } else {
            periodDates.push(
              supabase
                .from('daily_logs')
                .insert({
                  user_id: user.id,
                  log_date: currentDateStr,
                  period_started: i === 0,
                  period_ended: i === periodDuration - 1,
                })
            );
          }
        }
        
        const results = await Promise.all(periodDates);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) throw errors[0].error;
      } else {
        // Desmarcar solo el día seleccionado
        const existingLog = logs?.find(log => log.log_date === dateStr);
        
        if (existingLog) {
          const { error } = await supabase
            .from('daily_logs')
            .update({
              period_started: false,
              period_ended: false,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingLog.id);

          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_logs'] });
      toast.success("Periodo actualizado");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating period:", error);
      toast.error("Error al actualizar el periodo");
    },
  });

  const handleDateClick = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleTogglePeriod = (isPeriod: boolean) => {
    if (!selectedDate) return;
    togglePeriodMutation.mutate({ date: selectedDate, isPeriod });
  };

  const handleEditClick = () => {
    if (!selectedDate) {
      toast("Selecciona un día del calendario para editar");
      return;
    }
    setIsDialogOpen(true);
  };

  const periodDates = logs?.filter(log => log.period_started || log.period_ended).map(log => parseISO(log.log_date)) || [];
  const loggedDates = logs?.map(log => parseISO(log.log_date)) || [];
  
  // Calcular fechas predichas
  const cycleInfo = profile?.last_period_date 
    ? getCycleInfo(
        new Date(profile.last_period_date),
        profile.avg_cycle_length,
        profile.is_irregular,
        allLogs || [],
        profile.avg_period_duration
      )
    : null;

  // Fechas del próximo periodo esperado
  const predictedPeriodDates: Date[] = [];
  if (cycleInfo?.nextPeriodDate && profile?.avg_period_duration) {
    for (let i = 0; i < profile.avg_period_duration; i++) {
      predictedPeriodDates.push(addDays(cycleInfo.nextPeriodDate, i));
    }
  }

  // Fechas de ventana fértil
  const fertileDates: Date[] = [];
  if (cycleInfo?.fertileWindowStart && cycleInfo?.fertileWindowEnd) {
    let currentDate = new Date(cycleInfo.fertileWindowStart);
    const endDate = new Date(cycleInfo.fertileWindowEnd);
    
    while (currentDate <= endDate) {
      fertileDates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
  }
  
  const isSelectedDatePeriod = selectedDate 
    ? periodDates.some(date => format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    : false;

  return (
    <>
      <Card className="p-6 animate-fade-in-up bg-gradient-to-br from-card to-primary/5 border-primary/20 backdrop-blur" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Calendario de Ciclo</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            aria-label="Editar día del calendario"
          >
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Haz clic en cualquier día para marcar/desmarcar menstruación
        </p>
        <div className="flex flex-col items-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateClick}
            locale={es}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border-border w-full"
            modifiers={{
              period: periodDates,
              logged: loggedDates,
              predictedPeriod: predictedPeriodDates,
              fertile: fertileDates,
            }}
            modifiersStyles={{
              period: {
                backgroundColor: 'hsl(var(--destructive) / 0.3)',
                borderRadius: '50%',
                color: 'hsl(var(--destructive))',
                fontWeight: 'bold',
                border: '2px solid hsl(var(--destructive))',
              },
              predictedPeriod: {
                backgroundColor: 'hsl(var(--destructive) / 0.1)',
                borderRadius: '50%',
                border: '2px dashed hsl(var(--destructive) / 0.5)',
                color: 'hsl(var(--destructive) / 0.7)',
              },
              fertile: {
                backgroundColor: 'hsl(var(--primary) / 0.15)',
                borderRadius: '50%',
                border: '2px solid hsl(var(--primary) / 0.4)',
                color: 'hsl(var(--primary))',
              },
              logged: {
                position: 'relative',
              },
            }}
          />
          
          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-destructive/30 border-2 border-destructive"></div>
              <span className="text-muted-foreground text-xs">Periodo registrado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-destructive/10 border-2 border-dashed border-destructive/50"></div>
              <span className="text-muted-foreground text-xs">Periodo esperado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/15 border-2 border-primary/40"></div>
              <span className="text-muted-foreground text-xs">Ventana fértil</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary"></div>
              <span className="text-muted-foreground text-xs">Con registro</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Periodo</DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              ¿Este día tuviste tu menstruación?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleTogglePeriod(true)}
                variant={isSelectedDatePeriod ? "default" : "outline"}
                className="flex-1 gap-2"
                disabled={togglePeriodMutation.isPending}
              >
                <Droplet className="h-4 w-4" />
                Sí, marcar como periodo
              </Button>
              <Button
                onClick={() => handleTogglePeriod(false)}
                variant={!isSelectedDatePeriod ? "default" : "outline"}
                className="flex-1"
                disabled={togglePeriodMutation.isPending}
              >
                No, quitar periodo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};