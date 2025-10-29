import { Badge } from '@/components/ui/badge';
import { CyclePhase } from '@/lib/cycleCalculations';
import { Sparkles, Droplet, Flame, Moon, HelpCircle } from 'lucide-react';

interface PhaseIndicatorProps {
  phase: CyclePhase;
  className?: string;
}

const phaseConfig = {
  menstruation: {
    label: 'Menstruación',
    icon: Droplet,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  follicular: {
    label: 'Folicular',
    icon: Sparkles,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  ovulation: {
    label: 'Ovulación',
    icon: Flame,
    className: 'bg-accent/10 text-accent-foreground border-accent/20',
  },
  luteal: {
    label: 'Lútea',
    icon: Moon,
    className: 'bg-secondary/10 text-secondary border-secondary/20',
  },
  irregular: {
    label: 'Irregular',
    icon: HelpCircle,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const config = phaseConfig[phase];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}