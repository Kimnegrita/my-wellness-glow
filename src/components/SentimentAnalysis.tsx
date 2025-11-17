import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SentimentAnalysisProps {
  emotionalPatterns?: string[];
  aiInsights?: string;
}

const SentimentAnalysis = ({ 
  emotionalPatterns, 
  aiInsights 
}: SentimentAnalysisProps) => {
  const { t } = useTranslation();

  if (!emotionalPatterns?.length && !aiInsights) {
    return null;
  }

  return (
    <Card className="mt-4 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Análisis Emocional
        </CardTitle>
        <CardDescription>Comprensión de tus emociones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emotional Patterns */}
        {emotionalPatterns && emotionalPatterns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Patrones Emocionales</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {emotionalPatterns.map((pattern, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {aiInsights && (
          <div className="p-4 bg-gradient-card rounded-lg border border-primary/20">
            <p className="text-sm text-foreground leading-relaxed">
              {aiInsights}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis;