import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Activity, Apple, Heart, RefreshCw, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Recommendations {
  exercise: string[];
  nutrition: string[];
  selfcare: string[];
  highlights: string;
  context?: {
    cycleDay: string;
    currentPhase: string;
    recentSymptoms: string[];
    sentimentTrend: string | null;
  };
}

const PersonalizedRecommendations = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getFallbackRecommendations = (): Recommendations => {
    return {
      exercise: [
        'Camina 20-30 minutos al aire libre para mejorar tu energía',
        'Practica yoga suave o estiramientos para reducir tensión'
      ],
      nutrition: [
        'Incluye alimentos ricos en hierro en tu dieta diaria',
        'Mantente hidratada con agua e infusiones naturales'
      ],
      selfcare: [
        'Dedica 10 minutos a la meditación o respiración profunda',
        'Asegúrate de dormir 7-8 horas por noche'
      ],
      highlights: 'Cuida de ti misma, escucha a tu cuerpo y date el descanso que necesitas.'
    };
  };

  const fetchRecommendations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: {}
      });

      if (error) {
        console.error('Error fetching recommendations:', error);
        toast.error(t('recommendations.error'));
        // Use fallback recommendations instead of failing completely
        setRecommendations(getFallbackRecommendations());
        return;
      }

      setRecommendations(data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      toast.error(t('recommendations.error'));
      // Use fallback recommendations instead of failing completely
      setRecommendations(getFallbackRecommendations());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  if (!recommendations && !isLoading) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exercise':
        return <Activity className="h-5 w-5 text-primary" />;
      case 'nutrition':
        return <Apple className="h-5 w-5 text-secondary" />;
      case 'selfcare':
        return <Heart className="h-5 w-5 text-accent" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'exercise':
        return 'border-primary/30 bg-primary/5';
      case 'nutrition':
        return 'border-secondary/30 bg-secondary/5';
      case 'selfcare':
        return 'border-accent/30 bg-accent/5';
      default:
        return 'border-border';
    }
  };

  return (
    <Card className="shadow-elegant border-primary/20 bg-card/95 backdrop-blur animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <CardTitle className="text-2xl">{t('recommendations.title')}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRecommendations}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('recommendations.refresh')}
          </Button>
        </div>
        <CardDescription>{t('recommendations.description')}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">{t('recommendations.loading')}</span>
          </div>
        ) : recommendations ? (
          <>
            {/* Context Info */}
            {recommendations.context && (
              <div className="flex flex-wrap gap-2 pb-2 border-b">
                <Badge variant="outline" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {recommendations.context.currentPhase}
                </Badge>
                {recommendations.context.sentimentTrend && (
                  <Badge variant="secondary">
                    {t(`sentiment.${recommendations.context.sentimentTrend}`)}
                  </Badge>
                )}
              </div>
            )}

            {/* Highlights */}
            {recommendations.highlights && (
              <div className="p-4 bg-gradient-primary/10 rounded-xl border border-primary/20">
                <p className="text-sm font-medium text-foreground italic">
                  💫 {recommendations.highlights}
                </p>
              </div>
            )}

            {/* Exercise Recommendations */}
            <div className={`p-4 rounded-xl border-2 ${getCategoryColor('exercise')}`}>
              <div className="flex items-center gap-2 mb-3">
                {getCategoryIcon('exercise')}
                <h3 className="font-semibold text-lg">{t('recommendations.exercise')}</h3>
              </div>
              <ul className="space-y-2">
                {recommendations.exercise.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutrition Recommendations */}
            <div className={`p-4 rounded-xl border-2 ${getCategoryColor('nutrition')}`}>
              <div className="flex items-center gap-2 mb-3">
                {getCategoryIcon('nutrition')}
                <h3 className="font-semibold text-lg">{t('recommendations.nutrition')}</h3>
              </div>
              <ul className="space-y-2">
                {recommendations.nutrition.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-secondary mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Self-Care Recommendations */}
            <div className={`p-4 rounded-xl border-2 ${getCategoryColor('selfcare')}`}>
              <div className="flex items-center gap-2 mb-3">
                {getCategoryIcon('selfcare')}
                <h3 className="font-semibold text-lg">{t('recommendations.selfcare')}</h3>
              </div>
              <ul className="space-y-2">
                {recommendations.selfcare.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-accent mt-1">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Symptoms Context */}
            {recommendations.context?.recentSymptoms && recommendations.context.recentSymptoms.length > 0 && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <p className="mb-1">{t('recommendations.basedOn')}:</p>
                <div className="flex flex-wrap gap-1">
                  {recommendations.context.recentSymptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default PersonalizedRecommendations;