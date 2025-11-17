import { CycleCalendar } from "@/components/CycleCalendar";
import { FAQSection } from "@/components/FAQSection";
import { PhaseIndicator } from "@/components/PhaseIndicator";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { FertilityTracker } from "@/components/FertilityTracker";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCycleInfo } from "@/lib/cycleCalculations";
import { getDailyTip } from "@/data/dailyTips";
import { Calendar, Heart, Flame, LogOut, Settings, BarChart3, BookOpen, Phone, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

      {/* Main Header with Action Buttons */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-primary/20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="FlowCare Logo" className="w-10 h-10 rounded-full shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ¡Hola, {profile?.name || 'Amiga'}!
                </h1>
                <p className="text-sm text-muted-foreground">Bienvenida a tu espacio de bienestar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => navigate('/assistant')}>
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/resources')}>
                <BookOpen className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/contacts')}>
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Cards - Enhanced with magical effects */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="group bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-xl rounded-3xl p-6 border-2 border-primary/30 shadow-primary hover:shadow-glow transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-primary animate-glow-pulse">
                  <Calendar className="h-7 w-7 text-primary-foreground drop-shadow-lg" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1 font-semibold">Día del Ciclo</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">{cycleInfo?.currentDay || '—'}</p>
                </div>
              </div>
              {cycleInfo ? (
                <div className="space-y-2 pt-3 border-t border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Fase Actual:</span>
                    <span className="text-xs text-primary font-bold uppercase tracking-wide px-2 py-1 bg-primary/10 rounded-full">
                      {cycleInfo.phase === 'menstruation' ? '🩸 Menstrual' : 
                       cycleInfo.phase === 'follicular' ? '🌱 Folicular' :
                       cycleInfo.phase === 'ovulation' ? '🥚 Ovulación' :
                       cycleInfo.phase === 'luteal' ? '🌸 Lútea' : '🔄 Irregular'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Duración del Ciclo:</span>
                    <span className="text-xs text-foreground font-semibold">{profile?.avg_cycle_length || 28} días</span>
                  </div>
                  {cycleInfo.currentDay && profile?.avg_cycle_length && (
                    <div className="mt-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progreso</span>
                        <span className="text-xs text-primary font-bold">
                          {Math.min(100, Math.round((cycleInfo.currentDay / profile.avg_cycle_length) * 100))}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (cycleInfo.currentDay / profile.avg_cycle_length) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-3 border-t border-primary/20">
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Configura tu fecha de último período en tu perfil para ver información del ciclo
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => navigate('/profile')}
                  >
                    <Settings className="h-3 w-3 mr-2" />
                    Configurar Perfil
                  </Button>
                </div>
              )}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Calendar & Fertility */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-card/95 via-card/90 to-secondary/5 backdrop-blur-xl rounded-3xl border-2 border-secondary/20 shadow-secondary hover:shadow-glow transition-all duration-500 overflow-hidden">
              <CycleCalendar />
            </div>
            
            {cycleInfo?.ovulationDate && (
              <div className="bg-gradient-to-br from-card/95 via-card/90 to-accent/5 backdrop-blur-xl rounded-3xl border-2 border-accent/20 shadow-accent hover:shadow-glow transition-all duration-500 overflow-hidden">
                <FertilityTracker
                  ovulationDate={cycleInfo.ovulationDate}
                  fertileWindowStart={cycleInfo.fertileWindowStart}
                  fertileWindowEnd={cycleInfo.fertileWindowEnd}
                  isFertileWindow={cycleInfo.isFertileWindow}
                />
              </div>
            )}
          </div>

          {/* Right Column - Phase & Tip */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-card/95 via-card/90 to-primary/5 backdrop-blur-xl rounded-3xl border-2 border-primary/20 shadow-primary hover:shadow-glow transition-all duration-500 overflow-hidden">
              <PhaseIndicator phase={cycleInfo?.phase || 'irregular'} />
            </div>

            <Card className="bg-gradient-to-br from-card/95 via-card/90 to-accent/5 backdrop-blur-xl border-2 border-accent/20 shadow-accent" style={{ boxShadow: 'var(--shadow-card)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  <span className="text-3xl">{dailyTip.icon}</span>
                  Consejo del Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{dailyTip.text}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate('/assistant')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Asistente de IA
              </CardTitle>
              <CardDescription>Obtén recomendaciones personalizadas basadas en tu fase actual</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20 hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate('/history')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Ver Historial Completo
              </CardTitle>
              <CardDescription>Analiza tus patrones y tendencias</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-br from-card/95 via-card/90 to-primary/5 backdrop-blur-xl rounded-3xl border-2 border-primary/20 shadow-primary overflow-hidden">
          <FAQSection />
        </div>
      </div>

      <FloatingActionButton onClick={() => navigate('/checkin')} />
    </div>
  );
};

export default Index;