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
import phaseMenstrualImg from '@/assets/phase-menstrual.png';
import phaseFollicularImg from '@/assets/phase-follicular.png';
import phaseOvulationImg from '@/assets/phase-ovulation.png';
import phaseLutealImg from '@/assets/phase-luteal.png';

interface PhaseIndicatorProps {
  phase: CyclePhase;
  className?: string;
}

const phaseConfig = {
  menstruation: {
    label: 'phases.menstrual',
    desc: 'phases.menstrualDesc',
    icon: Droplet,
    image: phaseMenstrualImg,
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
  follicular: {
    label: 'phases.follicular',
    desc: 'phases.follicularDesc',
    icon: Sparkles,
    image: phaseFollicularImg,
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
  },
  ovulation: {
    label: 'phases.ovulation',
    desc: 'phases.ovulationDesc',
    icon: Flame,
    image: phaseOvulationImg,
    className: 'bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20',
  },
  luteal: {
    label: 'phases.luteal',
    desc: 'phases.lutealDesc',
    icon: Moon,
    image: phaseLutealImg,
    className: 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20',
  },
  irregular: {
    label: 'Irregular',
    desc: 'Tu ciclo es irregular. Esto es normal durante la perimenopausia.',
    icon: HelpCircle,
    image: null,
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
          className={`${config.className} ${className} cursor-pointer transition-all duration-300 border transform hover:scale-105 hover:shadow-lg active:scale-95`}
        >
          <Icon className="h-3 w-3 mr-1 transition-transform duration-300 group-hover:rotate-12" />
          {phase === 'irregular' ? config.label : t(config.label)}
          <Info className="h-3 w-3 ml-1 opacity-50 animate-pulse" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl mb-4">
            <div className="p-2 rounded-full bg-primary/10 animate-scale-in">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            {phase === 'irregular' ? config.label : t(config.label)}
          </DialogTitle>
          
          {/* Visual Illustration */}
          {config.image && (
            <div className="w-full flex justify-center my-6 animate-fade-in">
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/20">
                <img 
                  src={config.image} 
                  alt={phase === 'irregular' ? config.label : t(config.label)}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          <DialogDescription className="text-base leading-relaxed text-left animate-fade-in space-y-4">
            <p className="text-foreground/90 font-medium">
              {phase === 'irregular' ? config.desc : t(config.desc)}
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}