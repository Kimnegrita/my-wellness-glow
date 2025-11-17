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
        {/* Average Sentiment */}
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">{t('insights.averageMood')}</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                style={{ width: `${Math.abs(avgSentiment) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top Emotional Patterns */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">{t('insights.commonPatterns')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {topPatterns.length > 0 ? (
              topPatterns.map((pattern, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {pattern}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t('insights.noPatterns')}</p>
            )}
          </div>
        </div>

        {/* Entry Stats */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{t('insights.totalEntries')}</p>
            <p className="text-2xl font-bold text-foreground">{totalLogs}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionalInsights;