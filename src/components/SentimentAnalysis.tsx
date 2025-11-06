import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown, TrendingUp, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SentimentAnalysisProps {
  sentimentScore?: number;
  sentimentLabel?: string;
  emotionalPatterns?: string[];
  aiInsights?: string;
}

const SentimentAnalysis = ({ 
  sentimentScore, 
  sentimentLabel, 
  emotionalPatterns, 
  aiInsights 
}: SentimentAnalysisProps) => {
  const { t } = useTranslation();

  if (!sentimentLabel) {
    return null;
  }

  const getSentimentIcon = () => {
    switch (sentimentLabel) {
      case 'positive':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return <Meh className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSentimentColor = () => {
    switch (sentimentLabel) {
      case 'positive':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'negative':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    }
  };

  const getSentimentLabel = () => {
    switch (sentimentLabel) {
      case 'positive':
        return t('sentiment.positive');
      case 'negative':
        return t('sentiment.negative');
      default:
        return t('sentiment.neutral');
    }
  };

  return (
    <Card className="mt-4 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          {t('sentiment.analysis')}
        </CardTitle>
        <CardDescription>{t('sentiment.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment Score */}
        <div className="flex items-center gap-3">
          {getSentimentIcon()}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{getSentimentLabel()}</span>
              {sentimentScore !== undefined && (
                <span className="text-sm text-muted-foreground">
                  {(sentimentScore * 100).toFixed(0)}%
                </span>
              )}
            </div>
            {sentimentScore !== undefined && (
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    sentimentLabel === 'positive' 
                      ? 'bg-green-500' 
                      : sentimentLabel === 'negative' 
                      ? 'bg-red-500' 
                      : 'bg-yellow-500'
                  }`}
                  style={{ 
                    width: `${Math.abs(sentimentScore) * 100}%` 
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Emotional Patterns */}
        {emotionalPatterns && emotionalPatterns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{t('sentiment.patterns')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {emotionalPatterns.map((pattern, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className={getSentimentColor()}
                >
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {aiInsights && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm text-foreground/80 italic">
              {aiInsights}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis;