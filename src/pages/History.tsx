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
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  ¿Cómo te sientes en cada fase?
                </CardTitle>
                <CardDescription className="text-base">Tu estado emocional según la etapa de tu ciclo menstrual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                  <p className="text-sm text-foreground leading-relaxed">
                    Este gráfico muestra <span className="font-bold text-primary">cómo varía tu estado de ánimo</span> durante las 
                    <span className="font-bold"> 4 fases de tu ciclo menstrual</span>. Cada punto representa tu promedio emocional 
                    en esa fase específica.
                  </p>
                </div>
                
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={phaseEmotions} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis 
                      type="number"
                      domain={[-1, 1]}
                      stroke="hsl(var(--foreground))"
                      tick={{ fontSize: 14, fontWeight: 500 }}
                      label={{ 
                        value: 'Nivel de Ánimo', 
                        position: 'bottom', 
                        style: { fontSize: 14, fontWeight: 600, fill: 'hsl(var(--foreground))' } 
                      }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="fase" 
                      stroke="hsl(var(--foreground))"
                      tick={{ fontSize: 15, fontWeight: 600 }}
                      width={120}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '2px solid hsl(var(--primary))',
                        borderRadius: '12px',
                        padding: '16px'
                      }}
                      formatter={(value: number) => {
                        if (value > 0.5) return ['😊 Muy Positivo', 'Estado de Ánimo'];
                        if (value > 0) return ['🙂 Positivo', 'Estado de Ánimo'];
                        if (value === 0) return ['😐 Neutral', 'Estado de Ánimo'];
                        if (value > -0.5) return ['😕 Algo Negativo', 'Estado de Ánimo'];
                        return ['😔 Negativo', 'Estado de Ánimo'];
                      }}
                      labelFormatter={(label) => `Fase ${label}`}
                      labelStyle={{ fontWeight: 'bold', fontSize: 16, marginBottom: '8px' }}
                    />
                    <Bar 
                      dataKey="sentimiento" 
                      fill="hsl(var(--primary))"
                      radius={[0, 8, 8, 0]}
                    >
                      {phaseEmotions.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.sentimiento > 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded bg-primary"></div>
                      <span className="text-sm font-bold text-primary">ÁNIMO POSITIVO</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Valores por encima de 0 = Te sientes bien</p>
                  </div>
                  <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded bg-destructive"></div>
                      <span className="text-sm font-bold text-destructive">ÁNIMO BAJO</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Valores por debajo de 0 = Te sientes mal</p>
                  </div>
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
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                ¿Cuándo registraste más?
              </CardTitle>
              <CardDescription className="text-base">Tus registros mes a mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <p className="text-sm text-foreground leading-relaxed">
                  Este gráfico muestra <span className="font-bold text-primary">cuántos días registraste información</span> en cada mes. 
                  <span className="font-bold"> Más registros = mejor seguimiento de tu salud</span>.
                </p>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--foreground))"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                    label={{ 
                      value: 'Mes', 
                      position: 'bottom', 
                      style: { fontSize: 14, fontWeight: 600, fill: 'hsl(var(--foreground))' } 
                    }}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                    label={{ 
                      value: 'Número de Registros', 
                      angle: -90, 
                      position: 'insideLeft', 
                      style: { fontSize: 14, fontWeight: 600, textAnchor: 'middle', fill: 'hsl(var(--foreground))' } 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '3px solid hsl(var(--primary))',
                      borderRadius: '12px',
                      padding: '16px'
                    }}
                    formatter={(value: number) => [`${value} días registrados`, 'Total']}
                    labelFormatter={(label) => `Mes de ${label}`}
                    labelStyle={{ fontWeight: 'bold', fontSize: 16, marginBottom: '8px' }}
                  />
                  <Bar 
                    dataKey="registros" 
                    fill="url(#colorGradient)" 
                    radius={[12, 12, 0, 0]}
                    label={{ 
                      position: 'top', 
                      style: { fontSize: 14, fontWeight: 'bold', fill: 'hsl(var(--foreground))' } 
                    }}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent mb-1">
                    {Math.max(...monthlyData.map(m => m.registros), 0)} días
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tu mejor mes de registro
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Síntomas */}
          {/* Top Síntomas */}
          <Card className="shadow-elegant border-secondary/20 bg-card/95 backdrop-blur animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Activity className="h-6 w-6 text-secondary" />
                Tus Síntomas Más Comunes
              </CardTitle>
              <CardDescription className="text-base">Los 5 síntomas que más experimentas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl border border-secondary/20">
                <p className="text-sm text-foreground leading-relaxed">
                  Estos son <span className="font-bold text-secondary">los síntomas que más has registrado</span>. 
                  El número muestra <span className="font-bold">cuántas veces lo experimentaste</span>.
                </p>
              </div>

              {topSymptoms.length > 0 ? (
                <div className="space-y-4">
                  {topSymptoms.map((symptom, idx) => (
                    <div key={idx} className="group hover:scale-102 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                          <span className="font-bold text-lg text-foreground">{symptom.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">{symptom.value}</span>
                          <span className="text-sm text-muted-foreground">veces</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(symptom.value / topSymptoms[0].value) * 100}%`,
                            background: `linear-gradient(90deg, ${COLORS[idx % COLORS.length]}, ${COLORS[(idx + 1) % COLORS.length]})`
                          }}
                        ></div>
                      </div>
                      <div className="mt-1 text-right">
                        <span className="text-xs text-muted-foreground">
                          {((symptom.value / topSymptoms[0].value) * 100).toFixed(0)}% del síntoma más frecuente
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="mt-8 grid grid-cols-1 gap-3">
                    {topSymptoms.map((symptom, idx) => (
                      <div 
                        key={`legend-${idx}`} 
                        className="flex items-center justify-between p-3 rounded-lg border-2"
                        style={{ 
                          borderColor: COLORS[idx % COLORS.length],
                          backgroundColor: `${COLORS[idx % COLORS.length]}15`
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-5 h-5 rounded" 
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          ></div>
                          <span className="font-semibold text-foreground text-base">{symptom.name}</span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="text-base px-3 py-1"
                        >
                          {symptom.value} registros
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay síntomas registrados aún</p>
                </div>
              )}
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
