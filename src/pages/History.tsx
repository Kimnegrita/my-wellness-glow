import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Area, AreaChart } from 'recharts';
import EmotionalInsights from '@/components/EmotionalInsights';
import SentimentAnalysis from '@/components/SentimentAnalysis';
import EmotionalTrendsChart from '@/components/EmotionalTrendsChart';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];
const PHASE_COLORS = {
  'Menstrual': 'hsl(var(--destructive))',
  'Folicular': 'hsl(var(--primary))',
  'Ovulación': 'hsl(var(--accent))',
  'Lútea': 'hsl(var(--secondary))',
};

export default function History() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Fetch logs for last 3 months
  const { data: logs } = useQuery({
    queryKey: ['history_logs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const start = subMonths(new Date(), 3);
      
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', format(start, 'yyyy-MM-dd'))
        .order('log_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Calculate statistics
  const totalLogs = logs?.length || 0;
  const periodDays = logs?.filter(log => log.period_started || log.period_ended).length || 0;
  
  // Symptom frequency
  const allSymptoms = logs?.flatMap(log => log.symptoms || []) || [];
  const symptomCounts = allSymptoms.reduce((acc, symptom) => {
    acc[symptom] = (acc[symptom] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Daily logs per month
  const logsPerMonth = logs?.reduce((acc, log) => {
    const month = format(parseISO(log.log_date), 'MMM', { locale: es });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  const monthlyData = Object.entries(logsPerMonth).map(([month, count]) => ({
    month,
    registros: count,
  }));

  // Period tracking
  const periodLogs = logs?.filter(log => log.period_started) || [];
  const periodData = periodLogs.map(log => ({
    fecha: format(parseISO(log.log_date), 'dd MMM', { locale: es }),
    dia: parseISO(log.log_date).getTime(),
  }));

  // NEW: Sentimientos por fase del ciclo
  const sentimentByPhase = () => {
    if (!logs || !profile?.avg_cycle_length) return [];
    
    const phaseData: Record<string, { total: number; count: number }> = {
      'Menstrual': { total: 0, count: 0 },
      'Folicular': { total: 0, count: 0 },
      'Ovulación': { total: 0, count: 0 },
      'Lútea': { total: 0, count: 0 },
    };

    // Find period starts to calculate phases
    const periodStarts = logs.filter(log => log.period_started).map(log => parseISO(log.log_date));
    
    logs.forEach(log => {
      if (log.sentiment_score === null) return;
      
      const logDate = parseISO(log.log_date);
      // Find which cycle this log belongs to
      const lastPeriodBefore = periodStarts
        .filter(start => start <= logDate)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      
      if (!lastPeriodBefore) return;
      
      const cycleDay = differenceInDays(logDate, lastPeriodBefore) + 1;
      const cycleLen = profile.avg_cycle_length;
      const periodDuration = profile.avg_period_duration || 5;
      
      let phase = 'Menstrual';
      if (cycleDay > periodDuration && cycleDay <= Math.floor(cycleLen / 2) - 2) {
        phase = 'Folicular';
      } else if (cycleDay > Math.floor(cycleLen / 2) - 2 && cycleDay <= Math.floor(cycleLen / 2) + 2) {
        phase = 'Ovulación';
      } else if (cycleDay > Math.floor(cycleLen / 2) + 2) {
        phase = 'Lútea';
      }
      
      phaseData[phase].total += Number(log.sentiment_score);
      phaseData[phase].count += 1;
    });

    return Object.entries(phaseData).map(([fase, data]) => ({
      fase,
      sentimiento: data.count > 0 ? (data.total / data.count) : 0,
      registros: data.count,
    }));
  };

  // NEW: Evolución temporal de sentimientos
  const sentimentOverTime = () => {
    if (!logs) return [];
    
    return logs
      .filter(log => log.sentiment_score !== null)
      .map(log => ({
        fecha: format(parseISO(log.log_date), 'dd MMM', { locale: es }),
        sentimiento: Number(log.sentiment_score),
        timestamp: parseISO(log.log_date).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const phaseEmotions = sentimentByPhase();
  const timelineEmotions = sentimentOverTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="max-w-7xl mx-auto space-y-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Header */}
        <div className="space-y-2 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient">Historial y Estadísticas</h1>
              <p className="text-muted-foreground text-lg">
                Visualiza tus patrones de bienestar de los últimos 3 meses
              </p>
            </div>
            <Button 
              onClick={() => navigate('/cycle-comparison')}
              className="bg-gradient-primary hover:opacity-90"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Comparar Ciclos
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          <Card className="shadow-elegant border-primary/20 bg-card/95 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Total de Registros
              </CardDescription>
              <CardTitle className="text-5xl font-bold text-gradient">
                {totalLogs}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Últimos 90 días
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-secondary/20 bg-card/95 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-secondary" />
                Días de Menstruación
              </CardDescription>
              <CardTitle className="text-5xl font-bold bg-gradient-to-br from-secondary to-accent bg-clip-text text-transparent">
                {periodDays}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Períodos registrados
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-accent/20 bg-card/95 backdrop-blur">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                Síntomas Únicos
              </CardDescription>
              <CardTitle className="text-5xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent">
                {Object.keys(symptomCounts).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Diferentes síntomas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Emotional Insights */}
        {user && <EmotionalInsights userId={user.id} />}

        {/* Emotional Trends Charts */}
        {user && <EmotionalTrendsChart userId={user.id} />}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NEW: Sentimientos por Fase del Ciclo */}
          {phaseEmotions.length > 0 && (
            <Card className="shadow-elegant border-primary/20 bg-card/95 backdrop-blur animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-2xl">Sentimientos por Fase del Ciclo</CardTitle>
                <CardDescription>Promedio de sentimiento en cada fase</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={phaseEmotions}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="fase" 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[-1, 1]}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Radar
                      name="Sentimiento"
                      dataKey="sentimiento"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [
                        value > 0 ? `Positivo (${value.toFixed(2)})` : value < 0 ? `Negativo (${value.toFixed(2)})` : 'Neutral',
                        'Sentimiento'
                      ]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-xs text-muted-foreground text-center">
                  Valores: -1 (muy negativo) a +1 (muy positivo)
                </div>
              </CardContent>
            </Card>
          )}

          {/* NEW: Evolución Temporal de Sentimientos */}
          {timelineEmotions.length > 0 && (
            <Card className="shadow-elegant border-secondary/20 bg-card/95 backdrop-blur animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-2xl">Evolución de Sentimientos</CardTitle>
                <CardDescription>Tendencia emocional a lo largo del tiempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timelineEmotions}>
                    <defs>
                      <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="fecha" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      domain={[-1, 1]}
                      ticks={[-1, -0.5, 0, 0.5, 1]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [
                        value > 0 ? `Positivo (${value.toFixed(2)})` : value < 0 ? `Negativo (${value.toFixed(2)})` : 'Neutral',
                        'Sentimiento'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="sentimiento"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSentiment)"
                    />
                    {/* Reference line at 0 */}
                    <Line 
                      type="monotone" 
                      dataKey={() => 0} 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-around text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Positivo (+1)
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    Neutral (0)
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Negativo (-1)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registros por Mes */}
          <Card className="shadow-elegant border-primary/20 bg-card/95 backdrop-blur animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-2xl">Registros por Mes</CardTitle>
              <CardDescription>Frecuencia de tus registros diarios</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
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
                  <Bar 
                    dataKey="registros" 
                    fill="url(#colorGradient)" 
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Síntomas */}
          <Card className="shadow-elegant border-secondary/20 bg-card/95 backdrop-blur animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-2xl">Síntomas Más Frecuentes</CardTitle>
              <CardDescription>Top 5 síntomas registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topSymptoms}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topSymptoms.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Logs */}
        <Card className="shadow-elegant border-accent/20 bg-card/95 backdrop-blur animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-2xl">Registros Recientes</CardTitle>
            <CardDescription>Tus últimos 10 registros diarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs?.slice(-10).reverse().map((log) => (
                <div 
                  key={log.id}
                  className="flex items-start justify-between p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">
                        {format(parseISO(log.log_date), "EEEE, d 'de' MMMM", { locale: es })}
                      </span>
                      {(log.period_started || log.period_ended) && (
                        <Badge variant="destructive" className="text-xs">
                          {log.period_started ? '🩸 Inicio' : '✓ Fin'}
                        </Badge>
                      )}
                    </div>
                    
                    {log.symptoms && log.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {log.symptoms.map((symptom, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {log.journal_entry && (
                      <p className="text-sm text-muted-foreground italic">
                        "{log.journal_entry.substring(0, 100)}{log.journal_entry.length > 100 ? '...' : ''}"
                      </p>
                    )}

                    {/* Sentiment Analysis for this log */}
                    {((Array.isArray(log.emotional_patterns) && log.emotional_patterns.length > 0) || log.ai_insights) && (
                      <div className="mt-3">
                        <SentimentAnalysis
                          emotionalPatterns={Array.isArray(log.emotional_patterns) ? log.emotional_patterns.filter((p): p is string => typeof p === 'string') : []}
                          aiInsights={typeof log.ai_insights === 'string' ? log.ai_insights : undefined}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {(!logs || logs.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Aún no tienes registros. ¡Comienza tu viaje de bienestar!
                  </p>
                  <Button 
                    onClick={() => navigate('/checkin')}
                    className="mt-4 bg-gradient-primary hover:opacity-90"
                  >
                    Crear Primer Registro
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
