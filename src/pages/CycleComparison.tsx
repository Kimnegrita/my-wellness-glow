import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Calendar, Activity, Smile, Meh, Frown, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useTranslation } from 'react-i18next';

interface CycleData {
  cycleNumber: number;
  startDate: string;
  endDate: string;
  length: number;
  symptoms: Record<string, number>;
  averageSentiment: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  phaseSymptoms: Record<string, string[]>;
}

export default function CycleComparison() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useTranslation();

  const { data: cyclesData, isLoading } = useQuery({
    queryKey: ['cycle-comparison', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all period start dates
      const { data: periodStarts, error: periodError } = await supabase
        .from('daily_logs')
        .select('log_date')
        .eq('user_id', user.id)
        .eq('period_started', true)
        .order('log_date', { ascending: false })
        .limit(6);

      if (periodError) throw periodError;
      if (!periodStarts || periodStarts.length < 2) return [];

      // Process each cycle
      const cycles: CycleData[] = [];
      
      for (let i = 0; i < periodStarts.length - 1; i++) {
        const startDate = periodStarts[i].log_date;
        const endDate = periodStarts[i + 1].log_date;
        const cycleLength = differenceInDays(new Date(startDate), new Date(endDate));

        // Get logs for this cycle
        const { data: cycleLogs, error: logsError } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('log_date', endDate)
          .lte('log_date', startDate)
          .order('log_date', { ascending: true });

        if (logsError) continue;

        // Aggregate symptoms
        const symptomCounts: Record<string, number> = {};
        cycleLogs.forEach(log => {
          (log.symptoms || []).forEach((symptom: string) => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
          });
        });

        // Calculate sentiment stats
        const sentiments = cycleLogs
          .filter(log => log.sentiment_score !== null)
          .map(log => Number(log.sentiment_score));
        
        const avgSentiment = sentiments.length > 0
          ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
          : 0;

        const sentimentDist = {
          positive: cycleLogs.filter(l => l.sentiment_label === 'positive').length,
          neutral: cycleLogs.filter(l => l.sentiment_label === 'neutral').length,
          negative: cycleLogs.filter(l => l.sentiment_label === 'negative').length,
        };

        // Group symptoms by phase
        const phaseSymptoms: Record<string, string[]> = {
          'Menstrual': [],
          'Folicular': [],
          'Ovulación': [],
          'Lútea': []
        };

        const cycleLen = profile?.avg_cycle_length || 28;
        cycleLogs.forEach((log, idx) => {
          const cycleDay = idx + 1;
          let phase = 'Menstrual';
          
          if (cycleDay > 5 && cycleDay <= Math.floor(cycleLen / 2) - 2) {
            phase = 'Folicular';
          } else if (cycleDay > Math.floor(cycleLen / 2) - 2 && cycleDay <= Math.floor(cycleLen / 2) + 2) {
            phase = 'Ovulación';
          } else if (cycleDay > Math.floor(cycleLen / 2) + 2) {
            phase = 'Lútea';
          }

          (log.symptoms || []).forEach((symptom: string) => {
            if (!phaseSymptoms[phase].includes(symptom)) {
              phaseSymptoms[phase].push(symptom);
            }
          });
        });

        cycles.push({
          cycleNumber: periodStarts.length - i,
          startDate,
          endDate,
          length: Math.abs(cycleLength),
          symptoms: symptomCounts,
          averageSentiment: avgSentiment,
          sentimentDistribution: sentimentDist,
          phaseSymptoms,
        });
      }

      return cycles;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cyclesData || cyclesData.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
        <div className="max-w-7xl mx-auto space-y-6 py-8">
          <Button variant="ghost" onClick={() => navigate('/history')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Card className="text-center p-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">{t('comparison.notEnoughData')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('comparison.needTwoCycles')}
            </p>
            <Button onClick={() => navigate('/checkin')}>
              {t('comparison.startTracking')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const cycleLengthData = cyclesData.map(cycle => ({
    cycle: `Ciclo ${cycle.cycleNumber}`,
    days: cycle.length,
  }));

  const sentimentComparisonData = cyclesData.map(cycle => ({
    cycle: `Ciclo ${cycle.cycleNumber}`,
    sentiment: cycle.averageSentiment,
    positive: cycle.sentimentDistribution.positive,
    neutral: cycle.sentimentDistribution.neutral,
    negative: cycle.sentimentDistribution.negative,
  }));

  // Top 5 most common symptoms across all cycles
  const allSymptoms: Record<string, number> = {};
  cyclesData.forEach(cycle => {
    Object.entries(cycle.symptoms).forEach(([symptom, count]) => {
      allSymptoms[symptom] = (allSymptoms[symptom] || 0) + count;
    });
  });

  const topSymptoms = Object.entries(allSymptoms)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom]) => symptom);

  const symptomComparisonData = cyclesData.map(cycle => {
    const data: any = { cycle: `Ciclo ${cycle.cycleNumber}` };
    topSymptoms.forEach(symptom => {
      data[symptom] = cycle.symptoms[symptom] || 0;
    });
    return data;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="max-w-7xl mx-auto space-y-6 py-8">
        <Button variant="ghost" onClick={() => navigate('/history')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Header */}
        <div className="space-y-2 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-gradient">{t('comparison.title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('comparison.subtitle')}
          </p>
        </div>

        {/* Cycle Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-elegant border-primary/20">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                {t('comparison.cyclesAnalyzed')}
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-gradient">
                {cyclesData.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="shadow-elegant border-secondary/20">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                {t('comparison.averageLength')}
              </CardDescription>
              <CardTitle className="text-4xl font-bold bg-gradient-to-br from-secondary to-accent bg-clip-text text-transparent">
                {Math.round(cyclesData.reduce((sum, c) => sum + c.length, 0) / cyclesData.length)}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{t('comparison.days')}</p>
            </CardHeader>
          </Card>

          <Card className="shadow-elegant border-accent/20">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                {t('comparison.uniqueSymptoms')}
              </CardDescription>
              <CardTitle className="text-4xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent">
                {Object.keys(allSymptoms).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cycle Length Comparison */}
          <Card className="shadow-elegant border-primary/20">
            <CardHeader>
              <CardTitle>{t('comparison.cycleLengthComparison')}</CardTitle>
              <CardDescription>{t('comparison.lengthVariation')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cycleLengthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="cycle" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="days" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name={t('comparison.days')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sentiment Trend */}
          <Card className="shadow-elegant border-secondary/20">
            <CardHeader>
              <CardTitle>{t('comparison.sentimentTrend')}</CardTitle>
              <CardDescription>{t('comparison.emotionalProgress')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sentimentComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="cycle" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                  <YAxis domain={[-1, 1]} stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name={t('comparison.averageSentiment')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sentiment Distribution */}
          <Card className="shadow-elegant border-accent/20">
            <CardHeader>
              <CardTitle>{t('comparison.sentimentDistribution')}</CardTitle>
              <CardDescription>{t('comparison.emotionalBalance')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sentimentComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="cycle" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="positive" stackId="a" fill="hsl(142, 76%, 36%)" name={t('sentiment.positive')} />
                  <Bar dataKey="neutral" stackId="a" fill="hsl(47, 96%, 53%)" name={t('sentiment.neutral')} />
                  <Bar dataKey="negative" stackId="a" fill="hsl(0, 84%, 60%)" name={t('sentiment.negative')} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Symptom Comparison */}
          <Card className="shadow-elegant border-primary/20">
            <CardHeader>
              <CardTitle>{t('comparison.topSymptoms')}</CardTitle>
              <CardDescription>{t('comparison.symptomFrequency')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={symptomComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="cycle" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  {topSymptoms.map((symptom, index) => (
                    <Bar 
                      key={symptom} 
                      dataKey={symptom} 
                      fill={`hsl(${(index * 360) / topSymptoms.length}, 70%, 50%)`}
                      radius={index === topSymptoms.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cycle Details */}
        <Card className="shadow-elegant border-primary/20">
          <CardHeader>
            <CardTitle>{t('comparison.cycleDetails')}</CardTitle>
            <CardDescription>{t('comparison.individualOverview')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cyclesData.map((cycle, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">Ciclo {cycle.cycleNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(cycle.endDate), "d 'de' MMMM", { locale: es })} - {format(parseISO(cycle.startDate), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {cycle.length} días
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">{t('comparison.mostCommonSymptoms')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(cycle.symptoms)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([symptom, count]) => (
                            <Badge key={symptom} variant="secondary" className="text-xs">
                              {symptom} ({count})
                            </Badge>
                          ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">{t('comparison.emotionalState')}:</p>
                      <div className="flex items-center gap-2">
                        {cycle.averageSentiment > 0.3 ? (
                          <Smile className="h-5 w-5 text-green-500" />
                        ) : cycle.averageSentiment < -0.3 ? (
                          <Frown className="h-5 w-5 text-red-500" />
                        ) : (
                          <Meh className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className="text-sm">
                          {cycle.averageSentiment > 0.3
                            ? t('sentiment.positive')
                            : cycle.averageSentiment < -0.3
                            ? t('sentiment.negative')
                            : t('sentiment.neutral')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({cycle.averageSentiment.toFixed(2)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}