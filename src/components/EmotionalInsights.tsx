import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Calendar, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface EmotionalInsightsProps {
  userId: string;
}

const EmotionalInsights = ({ userId }: EmotionalInsightsProps) => {
  const { t } = useTranslation();

  const { data: emotionalData, isLoading } = useQuery({
    queryKey: ['emotional-insights', userId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('daily_logs')
        .select('sentiment_label, sentiment_score, emotional_patterns, log_date')
        .eq('user_id', userId)
        .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('log_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !emotionalData || emotionalData.length === 0) {
    return null;
  }

  // Calculate statistics
  const totalLogs = emotionalData.length;
  const sentimentCounts = emotionalData.reduce((acc, log) => {
    if (log.sentiment_label) {
      acc[log.sentiment_label] = (acc[log.sentiment_label] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const avgSentiment = emotionalData
    .filter(log => log.sentiment_score !== null)
    .reduce((sum, log) => sum + (log.sentiment_score || 0), 0) / totalLogs;

  // Extract all emotional patterns
  const allPatterns = emotionalData
    .flatMap(log => {
      const patterns = log.emotional_patterns;
      if (Array.isArray(patterns)) {
        return patterns.filter((p): p is string => typeof p === 'string' && p.length > 0);
      }
      return [];
    });
  
  const patternCounts = allPatterns.reduce((acc, pattern) => {
    acc[pattern] = (acc[pattern] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPatterns = Object.entries(patternCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([pattern]) => pattern);

  const dominantSentiment = Object.entries(sentimentCounts)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {t('insights.emotional')}
        </CardTitle>
        <CardDescription>{t('insights.last30days')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment Distribution */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-green-500/10">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {sentimentCounts.positive || 0}
            </div>
            <div className="text-xs text-muted-foreground">{t('sentiment.positive')}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-500/10">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {sentimentCounts.neutral || 0}
            </div>
            <div className="text-xs text-muted-foreground">{t('sentiment.neutral')}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {sentimentCounts.negative || 0}
            </div>
            <div className="text-xs text-muted-foreground">{t('sentiment.negative')}</div>
          </div>
        </div>

        {/* Average Sentiment */}
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
          <Heart className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <div className="text-sm font-medium">{t('insights.averageMood')}</div>
            <div className="w-full h-2 bg-secondary rounded-full mt-2">
              <div
                className={`h-full rounded-full transition-all ${
                  avgSentiment > 0.3 
                    ? 'bg-green-500' 
                    : avgSentiment < -0.3 
                    ? 'bg-red-500' 
                    : 'bg-yellow-500'
                }`}
                style={{ width: `${(avgSentiment + 1) * 50}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top Patterns */}
        {topPatterns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{t('insights.commonPatterns')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {topPatterns.map((pattern, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/10">
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Dominant Sentiment */}
        {dominantSentiment && (
          <div className="flex items-center gap-3 p-3 border border-primary/20 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-medium">{t('insights.dominantMood')}</div>
              <div className="text-sm text-muted-foreground">
                {t(`sentiment.${dominantSentiment[0]}`)} ({dominantSentiment[1]} {t('insights.days')})
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionalInsights;