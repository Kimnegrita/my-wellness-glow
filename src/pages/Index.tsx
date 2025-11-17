import { Header } from "@/components/Header";
import { CycleProgressCard } from "@/components/CycleProgressCard";
import { RecentSymptoms } from "@/components/RecentSymptoms";
import { TipsGrid } from "@/components/TipsGrid";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCycleInfo } from "@/lib/cycleCalculations";
import { getDailyTip } from "@/data/dailyTips";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Calendar, Heart, Lightbulb, ArrowRight } from "lucide-react";

const Index = () => {
  const { profile, user } = useAuth();
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

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-gradient-to-br from-background via-primary/5 to-accent/10 font-display" style={{ paddingBottom: "96px" }}>
      <Header />

      <main className="flex-grow flex flex-col gap-6">
        <CycleProgressCard cycleInfo={cycleInfo} />
        
        {/* AI Features Quick Access */}
        <div className="px-4">
          <h2 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Insights con IA</span>
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <Card 
              className="cursor-pointer hover:shadow-glow transition-all duration-300 border-primary/30 hover:border-primary/60 bg-gradient-card backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/predictions')}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-purple flex items-center justify-center shadow-glow animate-glow-pulse">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Predicción de Ciclo</h3>
                  <p className="text-xs text-muted-foreground">IA predice tu próximo período</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-glow transition-all duration-300 border-rose-light/30 hover:border-rose-light/60 bg-gradient-card backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/health-center')}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-rose-purple flex items-center justify-center shadow-glow animate-glow-pulse">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Centro de Salud</h3>
                  <p className="text-xs text-muted-foreground">Detecta anomalías y patrones</p>
                </div>
                <ArrowRight className="h-5 w-5 text-rose-light transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-glow transition-all duration-300 border-purple-light/30 hover:border-purple-light/60 bg-gradient-card backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/insights')}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-glow flex items-center justify-center shadow-glow animate-glow-pulse">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Insights Personalizados</h3>
                  <p className="text-xs text-muted-foreground">Correlaciones en tus datos</p>
                </div>
                <ArrowRight className="h-5 w-5 text-purple-light transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </div>
        </div>

        <RecentSymptoms weekLogs={weekLogs} />
        <TipsGrid dailyTip={dailyTip} />
      </main>

      <FloatingActionButton onClick={() => navigate('/checkin')} />
      <BottomNavigation />
    </div>
  );
};

export default Index;