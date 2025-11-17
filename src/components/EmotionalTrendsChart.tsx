import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { differenceInDays } from 'date-fns';

interface EmotionalTrendsChartProps {
  userId: string;
}

const EmotionalTrendsChart = ({ userId }: EmotionalTrendsChartProps) => {
  const { t } = useTranslation();

  const { data: trendsData, isLoading } = useQuery({
    queryKey: ['emotional-trends', userId],
    queryFn: async () => {
      // Get profile to calculate cycle phases
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_period_date, avg_cycle_length')
        .eq('id', userId)
        .maybeSingle();

      // Get last 90 days of logs
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select('log_date, sentiment_score, sentiment_label, emotional_patterns')
        .eq('user_id', userId)
        .gte('log_date', ninetyDaysAgo.toISOString().split('T')[0])
        .order('log_date', { ascending: true });

      if (error) throw error;

      // Calculate cycle phase for each log
      const logsWithPhase = logs.map(log => {
        let phase = 'Desconocida';
        let cycleDay = 0;

        if (profile?.last_period_date) {
          const lastPeriodDate = new Date(profile.last_period_date);
          const logDate = new Date(log.log_date);
          const cycleLength = profile.avg_cycle_length || 28;
          
          // Calculate days since last period
          const daysSinceLastPeriod = differenceInDays(logDate, lastPeriodDate);
          
          // Adjust for cycles
          cycleDay = ((daysSinceLastPeriod % cycleLength) + cycleLength) % cycleLength + 1;
          
          // Determine phase
          if (cycleDay >= 1 && cycleDay <= 5) {
            phase = 'Menstrual';
          } else if (cycleDay > 5 && cycleDay <= Math.floor(cycleLength / 2) - 2) {
            phase = 'Folicular';
          } else if (cycleDay > Math.floor(cycleLength / 2) - 2 && cycleDay <= Math.floor(cycleLength / 2) + 2) {
            phase = 'Ovulación';
          } else {
            phase = 'Lútea';
          }
        }

        return {
          ...log,
          phase,
          cycleDay,
          sentimentValue: log.sentiment_score ? Number(log.sentiment_score) : 0,
        };
      });

      // Group by phase for average sentiment
      const phaseStats = logsWithPhase.reduce((acc, log) => {
        if (!acc[log.phase]) {
          acc[log.phase] = { scores: [], count: 0, positive: 0, neutral: 0, negative: 0 };
        }
        if (log.sentimentValue !== null && log.sentimentValue !== undefined) {
          acc[log.phase].scores.push(log.sentimentValue);
          acc[log.phase].count++;
          
          if (log.sentiment_label === 'positive') acc[log.phase].positive++;
          else if (log.sentiment_label === 'neutral') acc[log.phase].neutral++;
          else if (log.sentiment_label === 'negative') acc[log.phase].negative++;
        }
        return acc;
      }, {} as Record<string, { scores: number[], count: number, positive: number, neutral: number, negative: number }>);

      const phaseAverages = Object.entries(phaseStats).map(([phase, stats]) => ({
        phase,
        average: stats.scores.length > 0 
          ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length 
          : 0,
        positive: stats.positive,
        neutral: stats.neutral,
        negative: stats.negative,
        total: stats.count,
      }));

      return {
        timeline: logsWithPhase,
        phaseAverages,
      };
    },
  });

  if (isLoading || !trendsData || trendsData.timeline.length === 0) {
    return null;
  }

  const phaseOrder = ['Menstrual', 'Folicular', 'Ovulación', 'Lútea'];
  const sortedPhaseAverages = trendsData.phaseAverages
    .filter(p => phaseOrder.includes(p.phase))
    .sort((a, b) => phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase));

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Menstrual': return 'hsl(var(--destructive))';
      case 'Folicular': return 'hsl(var(--primary))';
      case 'Ovulación': return 'hsl(var(--secondary))';
      case 'Lútea': return 'hsl(var(--accent))';
      default: return 'hsl(var(--muted))';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sentiment Over Time */}
      <Card className="shadow-elegant border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('trends.sentimentOverTime')}
          </CardTitle>
          <CardDescription>{t('trends.last90days')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendsData.timeline}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="cycleDay" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                label={{ value: t('trends.cycleDay'), position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={[-1, 1]}
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                label={{ value: t('trends.sentiment'), angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => `${t('trends.day')} ${value}`}
                formatter={(value: number) => [value.toFixed(2), t('trends.score')]}
              />
              <Area 
                type="monotone" 
                dataKey="sentimentValue" 
                stroke="hsl(var(--primary))" 
                fill="url(#sentimentGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Sentiment by Phase */}
      <Card className="shadow-elegant border-secondary/20 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-secondary" />
            {t('trends.sentimentByPhase')}
          </CardTitle>
          <CardDescription>{t('trends.averagePerPhase')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedPhaseAverages}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="phase" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                domain={[-1, 1]}
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => value.toFixed(2)}
              />
              <Bar 
                dataKey="average" 
                radius={[8, 8, 0, 0]}
              >
                {sortedPhaseAverages.map((entry, index) => (
                  <Bar 
                    key={`bar-${index}`} 
                    dataKey="average"
                    fill={getPhaseColor(entry.phase)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sentiment Distribution by Phase */}
      <Card className="shadow-elegant border-accent/20 bg-card/95 backdrop-blur lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            {t('trends.distributionByPhase')}
          </CardTitle>
          <CardDescription>{t('trends.positiveNeutralNegative')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedPhaseAverages}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="phase" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar 
                dataKey="positive" 
                stackId="a" 
                fill="hsl(142, 76%, 36%)"
                name={t('sentiment.positive')}
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="neutral" 
                stackId="a" 
                fill="hsl(47, 96%, 53%)"
                name={t('sentiment.neutral')}
              />
              <Bar 
                dataKey="negative" 
                stackId="a" 
                fill="hsl(0, 84%, 60%)"
                name={t('sentiment.negative')}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmotionalTrendsChart;