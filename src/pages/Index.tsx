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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* WomanLog-style Stats Bar with gradient and glow */}
      <div className="bg-gradient-to-r from-secondary via-primary to-accent text-white py-4 px-4 shadow-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-shimmer opacity-30"></div>
        <div className="container mx-auto flex justify-around items-center text-center relative z-10">
          <div className="transform hover:scale-110 transition-transform">
            <div className="text-2xl font-bold drop-shadow-lg">{cycleInfo?.currentDay || 0}</div>
            <div className="text-xs opacity-90 font-medium">Día del Ciclo</div>
          </div>
          <div className="h-10 w-px bg-white/40 shadow-lg"></div>
          <div className="transform hover:scale-110 transition-transform">
            <div className="text-2xl font-bold drop-shadow-lg">{cycleInfo?.daysUntilNext || '—'}</div>
            <div className="text-xs opacity-90 font-medium">Días hasta periodo</div>
          </div>
          <div className="h-10 w-px bg-white/40 shadow-lg"></div>
          <div className="transform hover:scale-110 transition-transform">
            <div className="text-2xl font-bold drop-shadow-lg">{weekLogs?.length || 0}</div>
            <div className="text-xs opacity-90 font-medium">Registros esta semana</div>
          </div>
        </div>
      </div>

      {/* Header with enhanced styling */}
      <header className="bg-card/90 backdrop-blur-xl border-b border-primary/20 sticky top-0 z-40 shadow-primary">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-60"></div>
              <img src="/logo.png" alt="My Wellness Glow" className="h-10 w-10 relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient drop-shadow-md">
                My Wellness Glow
              </h1>
              <p className="text-xs text-primary font-semibold">
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

      {/* Dashboard Cards - Enhanced with magical effects */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="group bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-xl rounded-3xl p-6 border-2 border-primary/30 shadow-primary hover:shadow-glow transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-primary animate-glow-pulse">
                <Calendar className="h-7 w-7 text-primary-foreground drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1 font-semibold">Día del Ciclo</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm mb-1">{cycleInfo?.currentDay || '—'}</p>
                <p className="text-xs text-primary font-bold uppercase tracking-wide">{cycleInfo?.phase || 'Desconocida'}</p>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-card via-card to-secondary/5 backdrop-blur-xl rounded-3xl p-6 border-2 border-secondary/30 shadow-secondary hover:shadow-glow transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary via-accent to-primary flex items-center justify-center shadow-secondary animate-glow-pulse" style={{ animationDelay: '0.5s' }}>
                <Heart className="h-7 w-7 text-secondary-foreground drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1 font-semibold">Próximo Período</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent drop-shadow-sm mb-1">{cycleInfo?.daysUntilNext || '—'}</p>
                <p className="text-xs text-secondary font-bold uppercase tracking-wide">
                  {cycleInfo?.nextPeriodDate ? format(new Date(cycleInfo.nextPeriodDate), 'dd MMM') : 'No disponible'}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-card via-card to-accent/5 backdrop-blur-xl rounded-3xl p-6 border-2 border-accent/30 shadow-accent hover:shadow-glow transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent via-primary to-secondary flex items-center justify-center shadow-accent animate-glow-pulse" style={{ animationDelay: '1s' }}>
                <Flame className="h-7 w-7 text-accent-foreground drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1 font-semibold">Síntoma Frecuente</p>
                <p className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent drop-shadow-sm mb-1">{mostFrequent}</p>
                <p className="text-xs text-accent font-bold uppercase tracking-wide">Esta semana</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Indicator & Cycle Calendar - Magical styling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-card/95 via-card/90 to-primary/5 backdrop-blur-xl rounded-3xl border-2 border-primary/20 shadow-primary hover:shadow-glow transition-all duration-500 overflow-hidden">
            <PhaseIndicator phase={cycleInfo?.phase || 'irregular'} />
          </div>
          <div className="bg-gradient-to-br from-card/95 via-card/90 to-secondary/5 backdrop-blur-xl rounded-3xl border-2 border-secondary/20 shadow-secondary hover:shadow-glow transition-all duration-500 overflow-hidden">
            <CycleCalendar />
          </div>
        </div>

        {/* Fertility Tracker - Magical Card */}
        {cycleInfo?.ovulationDate && (
          <div className="bg-gradient-to-br from-card/95 via-card/90 to-accent/5 backdrop-blur-xl rounded-3xl border-2 border-accent/20 shadow-accent hover:shadow-glow transition-all duration-500 overflow-hidden mb-6">
            <FertilityTracker
              ovulationDate={cycleInfo.ovulationDate}
              fertileWindowStart={cycleInfo.fertileWindowStart}
              fertileWindowEnd={cycleInfo.fertileWindowEnd}
              isFertileWindow={cycleInfo.isFertileWindow}
            />
          </div>
        )}

        {/* Daily Tip - Magical Card with shimmer */}
        <div className="shimmer bg-gradient-to-br from-card/95 via-primary/5 to-secondary/5 backdrop-blur-xl rounded-3xl border-2 border-primary/20 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden mb-6">
          <TipCard tip={dailyTip} />
        </div>

        {/* Personalized Recommendations - Magical Card */}
        <div className="bg-gradient-to-br from-card/95 via-secondary/5 to-accent/5 backdrop-blur-xl rounded-3xl border-2 border-secondary/20 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden mb-6">
          <PersonalizedRecommendations />
        </div>

        {/* Wellness Tips - Magical Card */}
        <div className="bg-gradient-to-br from-card/95 via-accent/5 to-primary/5 backdrop-blur-xl rounded-3xl border-2 border-accent/20 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden mb-6">
          <WellnessTips />
        </div>

        {/* Data Export - Magical Card */}
        <div className="bg-gradient-to-br from-card/95 via-primary/5 to-secondary/5 backdrop-blur-xl rounded-3xl border-2 border-primary/20 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden mb-6">
          <DataExport />
        </div>

        {/* FAQ Section - Magical Card */}
        <div className="bg-gradient-to-br from-card/95 via-secondary/5 to-accent/5 backdrop-blur-xl rounded-3xl border-2 border-secondary/20 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden mb-6">
          <FAQSection />
        </div>
      </div>

      <FloatingActionButton onClick={() => navigate('/checkin')} />
    </div>
  );
};

export default Index;