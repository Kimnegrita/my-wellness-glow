import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BottomNavigation } from '@/components/BottomNavigation';

const COLORS = [
  'hsl(280 80% 65%)', // Púrpura principal
  'hsl(270 75% 70%)', // Púrpura claro
  'hsl(260 70% 72%)', // Lavanda
  'hsl(320 75% 68%)', // Rosa púrpura
  'hsl(290 72% 68%)', // Violeta
  'hsl(310 70% 70%)', // Rosa lavanda
];

export default function DailyLog() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch logs for last 3 months
  const { data: logs, isLoading } = useQuery({
    queryKey: ['stats_logs', user?.id],
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
    .slice(0, 6)
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

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-28">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-primary via-primary-light to-primary-container dark:from-primary-darker dark:via-primary dark:to-primary-container-dark opacity-20 dark:opacity-30 blur-3xl"></div>

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-4 pb-2 justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => navigate('/')}
            type="button"
            className="flex items-center justify-center rounded-xl h-10 w-10 bg-transparent text-on-surface dark:text-on-surface-dark hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Volver"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-on-surface dark:text-on-surface-dark text-lg font-bold leading-tight tracking-[-0.015em]">
            Estadísticas y Progreso
          </h1>
        </div>
        <button onClick={() => navigate('/assistant')} type="button" className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-transparent text-primary dark:text-primary-light hover:bg-primary/10 active:scale-95 transition-all">
          <span className="material-symbols-outlined">psychology</span>
        </button>
      </header>

      <main className="flex flex-col gap-4 px-4 py-6 z-[1]">
        {/* Summary Cards con gradientes púrpura */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-2 rounded-xl bg-gradient-purple backdrop-blur-sm p-4 shadow-glow border border-white/30 animate-fade-in-up">
            <span className="material-symbols-outlined text-white text-3xl drop-shadow-lg animate-glow-pulse">calendar_month</span>
            <p className="text-2xl font-bold text-white drop-shadow-md">{totalLogs}</p>
            <p className="text-xs text-white/90">Registros</p>
          </div>
          
          <div className="flex flex-col gap-2 rounded-xl bg-gradient-rose-purple backdrop-blur-sm p-4 shadow-glow border border-white/30 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="material-symbols-outlined text-white text-3xl drop-shadow-lg animate-glow-pulse">water_drop</span>
            <p className="text-2xl font-bold text-white drop-shadow-md">{periodDays}</p>
            <p className="text-xs text-white/90">Días período</p>
          </div>
          
          <div className="flex flex-col gap-2 rounded-xl bg-gradient-glow backdrop-blur-sm p-4 shadow-glow border border-white/30 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="material-symbols-outlined text-white text-3xl drop-shadow-lg animate-glow-pulse">monitor_heart</span>
            <p className="text-2xl font-bold text-white drop-shadow-md">{Object.keys(symptomCounts).length}</p>
            <p className="text-xs text-white/90">Síntomas</p>
          </div>
        </div>

        {/* Registros por Mes */}
        <section className="flex flex-col gap-4 rounded-xl bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-sm p-4 shadow-elegant border border-rose-light/50 dark:border-rose-dark/30 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-medium">bar_chart</span>
            <h2 className="text-on-surface dark:text-on-surface-dark text-lg font-bold leading-tight tracking-[-0.015em]">
              Registros por Mes
            </h2>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(320 30% 92%)" />
                <XAxis 
                  dataKey="month" 
                  style={{ fontSize: '12px' }}
                  stroke="hsl(280 15% 20%)"
                />
                <YAxis 
                  style={{ fontSize: '12px' }}
                  stroke="hsl(280 15% 20%)"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(320 30% 92%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.12)',
                  }}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(280 80% 65%)" />
                    <stop offset="100%" stopColor="hsl(270 75% 70%)" />
                  </linearGradient>
                </defs>
                <Bar 
                  dataKey="registros" 
                  fill="url(#barGradient)" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-on-surface-variant dark:text-on-surface-variant-dark">
              <p className="text-sm">No hay datos para mostrar</p>
            </div>
          )}
        </section>

        {/* Top Síntomas */}
        <section className="flex flex-col gap-4 rounded-xl bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-sm p-4 shadow-elegant border border-lilac-light/50 dark:border-lilac-dark/30 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lilac-medium">pie_chart</span>
            <h2 className="text-on-surface dark:text-on-surface-dark text-lg font-bold leading-tight tracking-[-0.015em]">
              Síntomas Más Frecuentes
            </h2>
          </div>
          {topSymptoms.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={topSymptoms}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(':')[0].substring(0, 15)} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topSymptoms.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(320 30% 92%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.12)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-on-surface-variant dark:text-on-surface-variant-dark">
              <p className="text-sm">No hay síntomas registrados</p>
            </div>
          )}
        </section>

        {/* Registros Recientes */}
        <section className="flex flex-col gap-4 rounded-xl bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-sm p-4 shadow-elegant border border-gold-light/50 dark:border-gold-dark/30 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-medium">history</span>
            <h2 className="text-on-surface dark:text-on-surface-dark text-lg font-bold leading-tight tracking-[-0.015em]">
              Registros Recientes
            </h2>
          </div>
          <div className="space-y-3">
            {logs?.slice(-5).reverse().map((log) => (
              <div 
                key={log.id}
                className="p-3 rounded-xl bg-gradient-to-br from-rose-light/30 to-lilac-light/30 dark:from-rose-dark/20 dark:to-lilac-dark/20 border border-rose-light/50 dark:border-rose-dark/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-on-surface dark:text-on-surface-dark">
                    {format(parseISO(log.log_date), "d 'de' MMMM", { locale: es })}
                  </span>
                  {(log.period_started || log.period_ended) && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gradient-rose-purple text-white shadow-glow">
                      {log.period_started ? '🩸 Inicio' : '✓ Fin'}
                    </span>
                  )}
                </div>
                
                {log.symptoms && log.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {log.symptoms.slice(0, 3).map((symptom, idx) => (
                      <span 
                        key={idx} 
                        className="text-xs px-2 py-1 rounded-full bg-gradient-purple text-white shadow-sm"
                      >
                        {symptom}
                      </span>
                    ))}
                    {log.symptoms.length > 3 && (
                      <span className="text-xs px-2 py-1 text-on-surface-variant dark:text-on-surface-variant-dark">
                        +{log.symptoms.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                {log.journal_entry && (
                  <p className="text-xs text-on-surface-variant dark:text-on-surface-variant-dark italic">
                    "{log.journal_entry.substring(0, 80)}{log.journal_entry.length > 80 ? '...' : ''}"
                  </p>
                )}
              </div>
            ))}
            
            {(!logs || logs.length === 0) && !isLoading && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                  <span className="material-symbols-outlined text-4xl text-white">sentiment_satisfied</span>
                </div>
                <p className="text-on-surface-variant dark:text-on-surface-variant-dark mb-4 font-medium">
                  Aún no tienes registros
                </p>
                <button 
                  onClick={() => navigate('/checkin')}
                  className="px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:shadow-glow transition-all active:scale-95"
                >
                  Crear Primer Registro
                </button>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
