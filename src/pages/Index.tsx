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
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display" style={{ paddingBottom: "96px" }}>
      <Header />

      <main className="flex-grow flex flex-col gap-6">
        <CycleProgressCard cycleInfo={cycleInfo} />
        
        {/* AI Features Quick Access */}
        <div className="px-4">
          <h2 className="text-lg font-bold mb-3 text-foreground">🤖 Insights con IA</h2>
          <div className="grid grid-cols-1 gap-3">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-primary/20 hover:border-primary/40"
              onClick={() => navigate('/predictions')}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Predicción de Ciclo</h3>
                  <p className="text-xs text-muted-foreground">IA predice tu próximo período</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-orange-200/50 dark:border-orange-900/50 hover:border-orange-300 dark:hover:border-orange-800"
              onClick={() => navigate('/health-center')}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Centro de Salud</h3>
                  <p className="text-xs text-muted-foreground">Detecta anomalías y patrones</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-purple-200/50 dark:border-purple-900/50 hover:border-purple-300 dark:hover:border-purple-800"
              onClick={() => navigate('/insights')}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Insights Personalizados</h3>
                  <p className="text-xs text-muted-foreground">Correlaciones en tus datos</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
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