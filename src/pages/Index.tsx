import { DashboardCard } from "@/components/DashboardCard";
import { CycleCalendar } from "@/components/CycleCalendar";
import { WellnessTips } from "@/components/WellnessTips";
import { TipCard } from "@/components/TipCard";
import { FAQSection } from "@/components/FAQSection";
import { PhaseIndicator } from "@/components/PhaseIndicator";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import { FertilityTracker } from "@/components/FertilityTracker";
import { DataExport } from "@/components/DataExport";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCycleInfo } from "@/lib/cycleCalculations";
import { getDailyTip } from "@/data/dailyTips";
import { Calendar, Heart, Flame, LogOut, Settings, BarChart3, BookOpen, Phone, MessageSquare, GitCompare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";

const Index = () => {
  const { profile, signOut, user } = useAuth();
  const navigate = useNavigate();

  // Fetch ALL logs to calculate accurate cycle info
  const { data: allLogs } = useQuery({
    queryKey: ['all_logs', user?.id],
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

  // Calculate cycle info usando datos reales del calendario
  const cycleInfo = profile?.last_period_date
    ? getCycleInfo(
        new Date(profile.last_period_date),
        profile.avg_cycle_length,
        profile.is_irregular,
        allLogs || [],
        profile.avg_period_duration
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative">
      {/* WomanLog-style Stats Bar */}
      <div className="bg-gradient-to-r from-secondary via-primary to-accent text-white py-3 px-4">
        <div className="container mx-auto flex justify-around items-center text-center">
          <div>
            <div className="text-xl font-bold">{cycleInfo?.currentDay || 0}</div>
            <div className="text-xs opacity-90">Día del Ciclo</div>
          </div>
          <div className="h-8 w-px bg-white/30"></div>
          <div>
            <div className="text-xl font-bold">{cycleInfo?.daysUntilNext || '—'}</div>
            <div className="text-xs opacity-90">Días hasta periodo</div>
          </div>
          <div className="h-8 w-px bg-white/30"></div>
          <div>
            <div className="text-xl font-bold">{weekLogs?.length || 0}</div>
            <div className="text-xs opacity-90">Registros esta semana</div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="My Wellness Glow" className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold text-gradient">
                My Wellness Glow
              </h1>
              <p className="text-xs text-muted-foreground">
                ¡Hola, {profile?.name}! ✨
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DataExport />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/assistant')}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/resources')}>
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/cycle-comparison')}>
              <GitCompare className="h-4 w-4" />
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

      {/* Dashboard Cards - WomanLog Style */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card/95 backdrop-blur rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Día del Ciclo</p>
                <p className="text-3xl font-bold text-foreground mb-1">{cycleInfo?.currentDay || '—'}</p>
                <p className="text-xs text-primary font-medium">{cycleInfo?.phase || 'Desconocida'}</p>
              </div>
            </div>
          </div>

          <div className="bg-card/95 backdrop-blur rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-md">
                <Heart className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Próximo Período</p>
                <p className="text-3xl font-bold text-foreground mb-1">{cycleInfo?.daysUntilNext || '—'}</p>
                <p className="text-xs text-secondary font-medium">
                  {cycleInfo?.nextPeriodDate ? format(new Date(cycleInfo.nextPeriodDate), 'dd MMM') : 'No disponible'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/95 backdrop-blur rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-md">
                <Flame className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Síntoma Frecuente</p>
                <p className="text-lg font-bold text-foreground mb-1">{mostFrequent}</p>
                <p className="text-xs text-accent font-medium">Esta semana</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Indicator & Cycle Calendar - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-card/95 backdrop-blur rounded-2xl border border-border/50 shadow-lg overflow-hidden">
            <PhaseIndicator phase={cycleInfo?.phase || 'irregular'} />
          </div>
          <div className="bg-card/95 backdrop-blur rounded-2xl border border-border/50 shadow-lg overflow-hidden">
            <CycleCalendar />
          </div>
        </div>

        {/* Fertility Tracker - Enhanced Card */}
        {cycleInfo?.ovulationDate && (
          <div className="bg-card/95 backdrop-blur rounded-2xl border border-border/50 shadow-lg overflow-hidden mb-6">
            <FertilityTracker
              ovulationDate={cycleInfo.ovulationDate}
              fertileWindowStart={cycleInfo.fertileWindowStart}
              fertileWindowEnd={cycleInfo.fertileWindowEnd}
              isFertileWindow={cycleInfo.isFertileWindow}
            />
          </div>
        )}

        {/* Daily Tip - Enhanced Card */}
        <div className="bg-card/95 backdrop-blur rounded-2xl border border-border/50 shadow-lg overflow-hidden mb-6">
          <TipCard tip={dailyTip} />
        </div>

        {/* Personalized Recommendations - Enhanced Card */}
        <div className="bg-card/95 backdrop-blur rounded-2xl border border-border/50 shadow-lg overflow-hidden mb-6">
          <PersonalizedRecommendations />
        </div>

        {/* Wellness Tips - Enhanced Card */}
        <div className="bg-card/95 backdrop-blur rounded-2xl border border-border/50 shadow-lg overflow-hidden mb-6">
          <WellnessTips />
        </div>

        {/* Data Export - Enhanced Card */}
        <div className="bg-card/95 backdrop-blur rounded-2xl border border-border/50 shadow-lg overflow-hidden mb-6">
          <DataExport />
        </div>

        {/* FAQ Section - Enhanced Card */}
        <div className="bg-card/95 backdrop-blur rounded-2xl border border-border/50 shadow-lg overflow-hidden mb-6">
          <FAQSection />
        </div>
      </div>

      <FloatingActionButton onClick={() => navigate('/checkin')} />
    </div>
  );
};

export default Index;