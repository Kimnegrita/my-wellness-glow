import { Header } from "@/components/Header";
import { CycleProgressCard } from "@/components/CycleProgressCard";
import { RecentSymptoms } from "@/components/RecentSymptoms";
import { TipsGrid } from "@/components/TipsGrid";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCycleInfo } from "@/lib/cycleCalculations";
import { getDailyTip } from "@/data/dailyTips";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";

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
        <RecentSymptoms weekLogs={weekLogs} />
        <TipsGrid dailyTip={dailyTip} />
      </main>

      <FloatingActionButton onClick={() => navigate('/checkin')} />
      <BottomNavigation />
    </div>
  );
};

export default Index;