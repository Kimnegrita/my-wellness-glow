import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";

export default function Predictions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: prediction, isLoading, refetch } = useQuery({
    queryKey: ['cycle-prediction', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase.functions.invoke('predict-next-cycle', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Predicción actualizada');
  };

  const getConfidenceBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Predicción de Ciclo</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="relative"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Main Prediction Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-elegant">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Próximo Período
              </CardTitle>
              <Badge variant={getConfidenceBadgeVariant(prediction?.confidence_level || 'medium')}>
                {prediction?.confidence_percentage}% confianza
              </Badge>
            </div>
            <CardDescription>
              Predicción basada en IA con {prediction?.statistics?.total_cycles_analyzed} ciclos analizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Prediction */}
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Fecha Estimada</p>
              <p className="text-4xl font-bold text-primary mb-2">
                {prediction?.predicted_date 
                  ? format(parseISO(prediction.predicted_date), 'd', { locale: es })
                  : '--'}
              </p>
              <p className="text-lg text-foreground">
                {prediction?.predicted_date 
                  ? format(parseISO(prediction.predicted_date), "MMMM yyyy", { locale: es })
                  : 'Calculando...'}
              </p>
              
              {/* Prediction Window */}
              {prediction?.prediction_window && (
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Ventana de Predicción</p>
                  <p className="text-sm font-medium">
                    {format(parseISO(prediction.prediction_window.earliest), 'd MMM', { locale: es })} - {' '}
                    {format(parseISO(prediction.prediction_window.latest), 'd MMM', { locale: es })}
                  </p>
                </div>
              )}
            </div>

            {/* Confidence Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nivel de Confianza</span>
                <span className={`font-semibold ${getConfidenceColor(prediction?.confidence_level || 'medium')}`}>
                  {prediction?.confidence_level === 'high' && '🎯 Alta'}
                  {prediction?.confidence_level === 'medium' && '📊 Media'}
                  {prediction?.confidence_level === 'low' && '⚠️ Baja'}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${prediction?.confidence_percentage || 0}%` }}
                />
              </div>
            </div>

            {/* Recommendation */}
            {prediction?.recommendation && (
              <div className="p-4 bg-accent/50 rounded-lg border border-border">
                <p className="text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{prediction.recommendation}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estadísticas del Ciclo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Duración Promedio</p>
                <p className="text-2xl font-bold">{prediction?.statistics?.average_cycle_length || '--'}</p>
                <p className="text-xs text-muted-foreground">días</p>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Variabilidad</p>
                <p className="text-2xl font-bold">{prediction?.statistics?.cycle_variability || '--'}</p>
                <p className="text-xs text-muted-foreground">días</p>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Ciclo Más Corto</p>
                <p className="text-2xl font-bold">{prediction?.statistics?.shortest_cycle || '--'}</p>
                <p className="text-xs text-muted-foreground">días</p>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Ciclo Más Largo</p>
                <p className="text-2xl font-bold">{prediction?.statistics?.longest_cycle || '--'}</p>
                <p className="text-xs text-muted-foreground">días</p>
              </div>
            </div>

            {/* Stress Level */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Nivel de Estrés</p>
                <Badge variant={
                  prediction?.statistics?.stress_level === 'high' ? 'destructive' :
                  prediction?.statistics?.stress_level === 'medium' ? 'secondary' : 'outline'
                }>
                  {prediction?.statistics?.stress_level === 'high' && 'Alto'}
                  {prediction?.statistics?.stress_level === 'medium' && 'Medio'}
                  {prediction?.statistics?.stress_level === 'low' && 'Bajo'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Basado en síntomas de estrés reportados en los últimos 30 días
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Factors Considered */}
        {prediction?.factors_considered && prediction.factors_considered.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Factores Considerados</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prediction.factors_considered.map((factor: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Irregularity Indicators */}
        {prediction?.irregularity_indicators && prediction.irregularity_indicators.length > 0 && (
          <Card className="border-orange-200 dark:border-orange-900">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-5 w-5" />
                Indicadores de Irregularidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prediction.irregularity_indicators.map((indicator: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="material-symbols-outlined text-orange-500 text-lg mt-0.5">warning</span>
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground p-4">
          <p>💡 Consejo: Registra tus períodos regularmente para mejorar la precisión de las predicciones</p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
