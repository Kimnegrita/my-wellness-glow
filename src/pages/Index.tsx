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
    <div className="min-h-screen flex flex-col bg-gradient-subtle pb-20">
      <Header />
      
      <main className="flex-1">
        <CycleProgressCard cycleInfo={cycleInfo} />
        
        <section className="px-4 py-6">
          <h2 className="text-xl font-bold mb-4 text-foreground">Acceso Rápido a IA</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/predictions')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card border border-border hover:shadow-elegant hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              <div className="text-primary">
                <Calendar className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium text-center">Predicción de Ciclo</span>
            </button>
            
            <button
              onClick={() => navigate('/health-center')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card border border-border hover:shadow-elegant hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              <div className="text-primary">
                <Heart className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium text-center">Centro de Salud</span>
            </button>
            
            <button
              onClick={() => navigate('/insights')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card border border-border hover:shadow-elegant hover:scale-[1.03] active:scale-95 transition-all duration-300"
            >
              <div className="text-primary">
                <Lightbulb className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium text-center">Insights</span>
            </button>
          </div>
        </section>

        <RecentSymptoms weekLogs={weekLogs} />
        <TipsGrid dailyTip={dailyTip} />
      </main>

      <FloatingActionButton onClick={() => navigate('/checkin')} />
      <BottomNavigation />
    </div>
  );
};

export default Index;