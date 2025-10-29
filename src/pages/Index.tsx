import { DashboardCard } from "@/components/DashboardCard";
import { CycleCalendar } from "@/components/CycleCalendar";
import { WellnessTips } from "@/components/WellnessTips";
import { TipCard } from "@/components/TipCard";
import { PhaseIndicator } from "@/components/PhaseIndicator";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCycleInfo } from "@/lib/cycleCalculations";
import { getDailyTip } from "@/data/dailyTips";
import { Calendar, Heart, Flame, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";

const Index = () => {
  const { profile, signOut, user } = useAuth();
  const navigate = useNavigate();

  // Fetch logs for this week
  const { data: weekLogs } = useQuery({
    queryKey: ['weekly_logs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const start = startOfWeek(new Date());
      const end = endOfWeek(new Date());
      
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', format(start, 'yyyy-MM-dd'))
        .lte('log_date', format(end, 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Calculate cycle info
  const cycleInfo = profile?.last_period_date
    ? getCycleInfo(
        new Date(profile.last_period_date),
        profile.avg_cycle_length,
        profile.is_irregular
      )
    : null;

  const dailyTip = cycleInfo ? getDailyTip(cycleInfo.phase) : getDailyTip('irregular');

  // Calculate most frequent symptom
  const allSymptoms = weekLogs?.flatMap(log => log.symptoms || []) || [];
  const symptomCounts = allSymptoms.reduce((acc, symptom) => {
    acc[symptom] = (acc[symptom] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostFrequent = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Ninguno';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="My Wellness Glow" className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold text-gradient">
                My Wellness Glow
              </h1>
              <p className="text-sm text-muted-foreground">
                ¡Hola, {profile?.name}! ✨
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8 pb-24">
        {/* Main Tip Card */}
        <div className="animate-fade-in-up">
          <TipCard tip={dailyTip} />
        </div>

        {/* Cycle Status */}
        {cycleInfo && (
          <div className="bg-card rounded-lg p-6 shadow-elegant animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Estado del Ciclo</h2>
              <PhaseIndicator phase={cycleInfo.phase} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Día del ciclo</p>
                <p className="text-3xl font-bold text-primary">{cycleInfo.currentDay}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próxima menstruación</p>
                <p className="text-3xl font-bold text-secondary">
                  {cycleInfo.daysUntilNext > 0 ? `${cycleInfo.daysUntilNext} días` : 'Hoy'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            icon={<Calendar className="h-6 w-6" />}
            title="Registros esta semana"
            value={weekLogs?.length.toString() || '0'}
            description="Días con registro"
          />
          <DashboardCard
            icon={<Heart className="h-6 w-6" />}
            title="Síntoma más frecuente"
            value={mostFrequent}
            description="Esta semana"
          />
          <DashboardCard
            icon={<Flame className="h-6 w-6" />}
            title="Tu racha"
            value={weekLogs?.length.toString() || '0'}
            description="Días consecutivos"
          />
        </div>

        {/* Calendar and Tips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CycleCalendar />
          <WellnessTips />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => navigate('/checkin')} />
    </div>
  );
};

export default Index;