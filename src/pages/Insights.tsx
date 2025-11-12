import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, TrendingUp, Heart, Sparkles, RefreshCw, Target } from "lucide-react";
import { toast } from "sonner";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";

export default function Insights() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['correlations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase.functions.invoke('discover-correlations', {
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
    toast.success('Insights actualizados');
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-600 dark:text-green-400';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400';
      case 'weak': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStrengthBadge = (strength: string) => {
    switch (strength) {
      case 'strong': return 'default';
      case 'moderate': return 'secondary';
      case 'weak': return 'outline';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cycle': return '🔄';
      case 'symptoms': return '💊';
      case 'mood': return '😊';
      case 'lifestyle': return '🏃‍♀️';
      default: return '✨';
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

  const hasCorrelations = insights?.correlations && insights.correlations.length > 0;
  const hasInsights = insights?.insights && insights.insights.length > 0;

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
          <h1 className="text-xl font-bold flex-1 text-center">Insights Personalizados</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Data Quality Overview */}
        {insights?.data_quality && (
          <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Calidad de Datos
              </CardTitle>
              <CardDescription>
                Basado en {insights.data_quality.days_analyzed} días de registros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Completitud</p>
                  <p className="text-3xl font-bold text-primary">{insights.data_quality.completeness}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cobertura Emocional</p>
                  <p className="text-3xl font-bold text-primary">{insights.data_quality.sentiment_coverage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="correlations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="correlations">Correlaciones</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="tips">Consejos</TabsTrigger>
          </TabsList>

          {/* Correlations Tab */}
          <TabsContent value="correlations" className="space-y-4 mt-6">
            {hasCorrelations ? (
              insights.correlations.map((correlation: any, index: number) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStrengthBadge(correlation.strength)}>
                            {correlation.strength === 'strong' && '💪 Fuerte'}
                            {correlation.strength === 'moderate' && '📊 Moderada'}
                            {correlation.strength === 'weak' && '📉 Débil'}
                          </Badge>
                          <Badge variant="outline">
                            {correlation.type === 'phase_symptom' && '🔄 Fase-Síntoma'}
                            {correlation.type === 'symptom_mood' && '💊 Síntoma-Ánimo'}
                            {correlation.type === 'phase_mood' && '🔄 Fase-Ánimo'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{correlation.description}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Actionable Insight */}
                    <div className="p-3 bg-accent/50 rounded-lg flex items-start gap-2">
                      <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium mb-1">Acción Recomendada:</p>
                        <p className="text-sm">{correlation.actionable_insight}</p>
                      </div>
                    </div>

                    {/* Example */}
                    {correlation.example && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Ejemplo de tus datos:</p>
                        <p className="text-sm font-mono">{correlation.example}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">Recopilando Datos</h3>
                  <p className="text-muted-foreground">
                    Necesitamos más registros para descubrir correlaciones en tus patrones
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4 mt-6">
            {hasInsights ? (
              insights.insights.map((insight: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 text-3xl">
                        {getCategoryIcon(insight.category)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {insight.category === 'cycle' && 'Patrones del Ciclo'}
                          {insight.category === 'symptoms' && 'Análisis de Síntomas'}
                          {insight.category === 'mood' && 'Estado de Ánimo'}
                          {insight.category === 'lifestyle' && 'Estilo de Vida'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{insight.description}</p>
                    
                    {insight.recommendation && (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{insight.recommendation}</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">Generando Insights</h3>
                  <p className="text-muted-foreground">
                    Continúa registrando para recibir insights personalizados
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-4 mt-6">
            {/* Key Discoveries */}
            {insights?.key_discoveries && insights.key_discoveries.length > 0 && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Descubrimientos Clave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {insights.key_discoveries.map((discovery: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs">✨</span>
                        </div>
                        <span className="text-sm flex-1">{discovery}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Personalized Tips */}
            {insights?.personalized_tips && insights.personalized_tips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Consejos Personalizados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {insights.personalized_tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                          {index + 1}
                        </div>
                        <span className="text-sm flex-1">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Phase Statistics */}
            {insights?.phase_statistics && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas por Fase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Menstruation Phase */}
                  {insights.phase_statistics.menstruation && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          🩸 Menstruación
                        </h4>
                        <Badge variant="outline">
                          Sentimiento: {insights.phase_statistics.menstruation.avg_sentiment}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {insights.phase_statistics.menstruation.common_symptoms?.map((symptom: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Luteal Phase */}
                  {insights.phase_statistics.luteal && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          🌙 Lútea
                        </h4>
                        <Badge variant="outline">
                          Sentimiento: {insights.phase_statistics.luteal.avg_sentiment}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {insights.phase_statistics.luteal.common_symptoms?.map((symptom: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground p-4">
          <p>💡 Los insights se actualizan automáticamente con cada nuevo registro</p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
