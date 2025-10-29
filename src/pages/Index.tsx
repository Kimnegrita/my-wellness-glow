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
import { Calendar, Heart, Flame, LogOut, Settings, BarChart3 } from "lucide-react";
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8 pb-24">
        {/* Main Tip Card */}
        <div className="animate-fade-in-up">
          <TipCard tip={dailyTip} />
        </div>

        {/* Cycle Status */}
        {cycleInfo && (
          <div className="bg-gradient-to-br from-card to-primary/5 rounded-2xl p-8 shadow-elegant border border-primary/20 animate-fade-in-up backdrop-blur">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Estado del Ciclo</h2>
              <PhaseIndicator phase={cycleInfo.phase} className="text-base px-4 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card/80 backdrop-blur rounded-xl p-5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Día del ciclo</p>
                <p className="text-5xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                  {cycleInfo.currentDay}
                </p>
              </div>
              <div className="bg-card/80 backdrop-blur rounded-xl p-5 border border-secondary/10">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Próxima menstruación</p>
                <p className="text-4xl font-bold bg-gradient-to-br from-secondary to-accent bg-clip-text text-transparent">
                  {cycleInfo.daysUntilNext > 0 ? `${cycleInfo.daysUntilNext}d` : 'Hoy'}
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