import { Card } from '@/components/ui/card';
import { DailyTip } from '@/data/dailyTips';

interface TipCardProps {
  tip: DailyTip;
}

export function TipCard({ tip }: TipCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 animate-glow-pulse">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{tip.icon}</span>
          <h3 className="text-lg font-semibold text-foreground">
            Tu Consejo de Hoy
          </h3>
        </div>
        <p className="text-foreground/90 leading-relaxed">
          {tip.text}
        </p>
      </div>
    </Card>
  );
}