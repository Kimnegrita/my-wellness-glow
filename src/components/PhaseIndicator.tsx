import { Badge } from '@/components/ui/badge';
import { CyclePhase } from '@/lib/cycleCalculations';
import { Sparkles, Droplet, Flame, Moon, HelpCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface PhaseIndicatorProps {
  phase: CyclePhase;
  className?: string;
}

const phaseConfig = {
  menstruation: {
    label: 'phases.menstrual',
    desc: 'phases.menstrualDesc',
    icon: Droplet,
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
  follicular: {
    label: 'phases.follicular',
    desc: 'phases.follicularDesc',
    icon: Sparkles,
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
  },
  ovulation: {
    label: 'phases.ovulation',
    desc: 'phases.ovulationDesc',
    icon: Flame,
    className: 'bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20',
  },
  luteal: {
    label: 'phases.luteal',
    desc: 'phases.lutealDesc',
    icon: Moon,
    className: 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20',
  },
  irregular: {
    label: 'Irregular',
    desc: 'Tu ciclo es irregular. Esto es normal durante la perimenopausia.',
    icon: HelpCircle,
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
  },
};

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const { t } = useTranslation();
  const config = phaseConfig[phase];
  const Icon = config.icon;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className={`${config.className} ${className} cursor-pointer transition-all border`}
        >
          <Icon className="h-3 w-3 mr-1" />
          {phase === 'irregular' ? config.label : t(config.label)}
          <Info className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {phase === 'irregular' ? config.label : t(config.label)}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-2">
            {phase === 'irregular' ? config.desc : t(config.desc)}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}