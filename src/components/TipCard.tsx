import { Card } from '@/components/ui/card';
import { DailyTip } from '@/data/dailyTips';

interface TipCardProps {
  tip: DailyTip;
}

export function TipCard({ tip }: TipCardProps) {
  return (
    <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/5 border-primary/30 animate-glow-pulse shadow-elegant">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
      <div className="relative space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl border border-primary/20">
            <span className="text-4xl">{tip.icon}</span>
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              Tu Consejo de Hoy
            </h3>
            <p className="text-base text-foreground/90 leading-relaxed">
              {tip.text}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}