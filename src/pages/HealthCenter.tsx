import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Heart, AlertTriangle, TrendingUp, FileText, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";

interface HealthAnomaly {
  severity: string;
  description: string;
  requires_medical_attention?: boolean;
  [key: string]: unknown;
}

interface HealthData {
  anomalies?: HealthAnomaly[];
  status?: string;
  [key: string]: unknown;
}

export default function HealthCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: healthData, isLoading, refetch } = useQuery<HealthData>({
    queryKey: ['health-anomalies', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase.functions.invoke('detect-health-anomalies', {
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
    toast.success('Análisis de salud actualizado');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 dark:text-green-400';
      case 'monitor': return 'text-yellow-600 dark:text-yellow-400';
      case 'consult_doctor': return 'text-orange-600 dark:text-orange-400';
      case 'urgent': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'monitor': return <TrendingUp className="h-6 w-6 text-yellow-600" />;
      case 'consult_doctor': return <AlertTriangle className="h-6 w-6 text-orange-600" />;
      case 'urgent': return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default: return <Heart className="h-6 w-6" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
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

  const hasAnomalies = healthData?.anomalies && healthData.anomalies.length > 0;
  const criticalAnomalies = healthData?.anomalies?.filter((a: HealthAnomaly) =>
    a.severity === 'critical' || a.severity === 'high'
  ) || [];

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
          <h1 className="text-xl font-bold flex-1 text-center">Centro de Salud</h1>
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
        {/* Health Status Overview */}
        <Card className={`border-2 ${
          healthData?.health_status === 'healthy' ? 'border-green-200 dark:border-green-900' :
          healthData?.health_status === 'monitor' ? 'border-yellow-200 dark:border-yellow-900' :
          healthData?.health_status === 'consult_doctor' ? 'border-orange-200 dark:border-orange-900' :
          'border-red-200 dark:border-red-900'
        } shadow-elegant`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-3">
                {getStatusIcon(healthData?.health_status || 'healthy')}
                Estado de Salud
              </CardTitle>
              <Badge variant={
                healthData?.health_status === 'healthy' ? 'default' :
                healthData?.health_status === 'monitor' ? 'secondary' :
                'destructive'
              }>
                {healthData?.health_status === 'healthy' && 'Saludable'}
                {healthData?.health_status === 'monitor' && 'Monitorear'}
                {healthData?.health_status === 'consult_doctor' && 'Consultar Médico'}
                {healthData?.health_status === 'urgent' && 'Urgente'}
                {healthData?.health_status === 'insufficient_data' && 'Datos Insuficientes'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {healthData?.overall_assessment || 'Análisis en progreso...'}
            </p>

            {/* Data Summary */}
            {healthData?.data_summary && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{healthData.data_summary.days_analyzed}</p>
                  <p className="text-xs text-muted-foreground">días analizados</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{healthData.data_summary.cycles_analyzed}</p>
                  <p className="text-xs text-muted-foreground">ciclos</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{Math.round(healthData.data_summary.emotional_health_score || 0)}</p>
                  <p className="text-xs text-muted-foreground">salud emocional</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        {criticalAnomalies.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atención Requerida</AlertTitle>
            <AlertDescription>
              Se detectaron {criticalAnomalies.length} {criticalAnomalies.length === 1 ? 'anomalía' : 'anomalías'} que requieren atención médica.
            </AlertDescription>
          </Alert>
        )}

        {/* Anomalies List */}
        {hasAnomalies ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Anomalías Detectadas</h2>
            {healthData.anomalies.map((anomaly: HealthAnomaly, index: number) => (
              <Card key={index} className={
                anomaly.requires_medical_attention 
                  ? 'border-orange-200 dark:border-orange-900' 
                  : ''
              }>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {anomaly.requires_medical_attention && (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        {anomaly.description}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {anomaly.type === 'cycle_irregularity' && '🔄 Irregularidad del Ciclo'}
                        {anomaly.type === 'severe_symptoms' && '⚠️ Síntomas Severos'}
                        {anomaly.type === 'emotional_distress' && '😔 Malestar Emocional'}
                        {anomaly.type === 'bleeding_abnormal' && '🩸 Sangrado Anormal'}
                      </CardDescription>
                    </div>
                    <Badge variant={getSeverityVariant(anomaly.severity)}>
                      {anomaly.severity === 'critical' && 'Crítico'}
                      {anomaly.severity === 'high' && 'Alto'}
                      {anomaly.severity === 'medium' && 'Medio'}
                      {anomaly.severity === 'low' && 'Bajo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Recomendación:</p>
                    <p className="text-sm">{anomaly.recommendation}</p>
                  </div>
                  
                  {anomaly.requires_medical_attention && (
                    <Alert>
                      <Heart className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Se recomienda consultar con un profesional de salud sobre este síntoma.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">¡Todo bien!</h3>
              <p className="text-muted-foreground">
                No se detectaron anomalías en tus patrones de salud
              </p>
            </CardContent>
          </Card>
        )}

        {/* Positive Patterns */}
        {healthData?.positive_patterns && healthData.positive_patterns.length > 0 && (
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                Patrones Positivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {healthData.positive_patterns.map((pattern: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                    <span>{pattern}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action Items */}
        {healthData?.action_items && healthData.action_items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Acciones Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {healthData.action_items.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <span className="text-sm flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Most Common Symptoms */}
        {healthData?.data_summary?.most_common_symptoms && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Síntomas Más Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {healthData.data_summary.most_common_symptoms.map((symptom: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground p-4">
          <p>💡 Este análisis se basa en tus registros de los últimos 3 meses</p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
