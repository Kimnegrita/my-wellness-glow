import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import EmotionalInsights from '@/components/EmotionalInsights';
import SentimentAnalysis from '@/components/SentimentAnalysis';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
          <h1 className="text-4xl font-bold text-gradient">Historial y Estadísticas</h1>
          <p className="text-muted-foreground text-lg">
            Visualiza tus patrones de bienestar de los últimos 3 meses
          </p>
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    {log.sentiment_label && (
                      <div className="mt-3">
                        <SentimentAnalysis
                          sentimentScore={typeof log.sentiment_score === 'number' ? log.sentiment_score : undefined}
                          sentimentLabel={typeof log.sentiment_label === 'string' ? log.sentiment_label : undefined}
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
