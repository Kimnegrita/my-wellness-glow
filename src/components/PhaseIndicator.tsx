import { Badge } from '@/components/ui/badge';
import { CyclePhase } from '@/lib/cycleCalculations';
import { Sparkles, Droplet, Flame, Moon, HelpCircle, Info, Apple, Dumbbell, Heart } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import phaseMenstrualImg from '@/assets/phase-menstrual.png';
import phaseFollicularImg from '@/assets/phase-follicular.png';
import phaseOvulationImg from '@/assets/phase-ovulation.png';
import phaseLutealImg from '@/assets/phase-luteal.png';

interface PhaseTip {
  category: 'nutrition' | 'exercise' | 'selfcare';
  key: string;
}

interface PhaseIndicatorProps {
  phase: CyclePhase;
  className?: string;
}

const phaseTips: Record<CyclePhase, PhaseTip[]> = {
  menstruation: [
    { category: 'nutrition', key: 'tips.menstruation.nutrition_iron' },
    { category: 'nutrition', key: 'tips.menstruation.nutrition_hydration' },
    { category: 'exercise', key: 'tips.menstruation.exercise_yoga' },
    { category: 'exercise', key: 'tips.menstruation.exercise_walks' },
    { category: 'selfcare', key: 'tips.menstruation.selfcare_rest' },
    { category: 'selfcare', key: 'tips.menstruation.selfcare_introspection' },
  ],
  follicular: [
    { category: 'nutrition', key: 'tips.follicular.nutrition_protein' },
    { category: 'nutrition', key: 'tips.follicular.nutrition_metabolism' },
    { category: 'exercise', key: 'tips.follicular.exercise_intense' },
    { category: 'exercise', key: 'tips.follicular.exercise_strength' },
    { category: 'selfcare', key: 'tips.follicular.selfcare_projects' },
    { category: 'selfcare', key: 'tips.follicular.selfcare_energy' },
  ],
  ovulation: [
    { category: 'nutrition', key: 'tips.ovulation.nutrition_antioxidants' },
    { category: 'nutrition', key: 'tips.ovulation.nutrition_fresh' },
    { category: 'exercise', key: 'tips.ovulation.exercise_social' },
    { category: 'exercise', key: 'tips.ovulation.exercise_stamina' },
    { category: 'selfcare', key: 'tips.ovulation.selfcare_conversations' },
    { category: 'selfcare', key: 'tips.ovulation.selfcare_confidence' },
  ],
  luteal: [
    { category: 'nutrition', key: 'tips.luteal.nutrition_carbs' },
    { category: 'nutrition', key: 'tips.luteal.nutrition_magnesium' },
    { category: 'exercise', key: 'tips.luteal.exercise_moderate' },
    { category: 'exercise', key: 'tips.luteal.exercise_listen' },
    { category: 'selfcare', key: 'tips.luteal.selfcare_priority' },
    { category: 'selfcare', key: 'tips.luteal.selfcare_caffeine' },
  ],
  irregular: [
    { category: 'nutrition', key: 'tips.irregular.nutrition_omega' },
    { category: 'nutrition', key: 'tips.irregular.nutrition_balanced' },
    { category: 'exercise', key: 'tips.irregular.exercise_routine' },
    { category: 'exercise', key: 'tips.irregular.exercise_consistency' },
    { category: 'selfcare', key: 'tips.irregular.selfcare_sleep' },
    { category: 'selfcare', key: 'tips.irregular.selfcare_stress' },
  ],
};

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

const categoryConfig = {
  nutrition: { icon: Apple, key: 'tips.categories.nutrition', color: 'text-green-600' },
  exercise: { icon: Dumbbell, key: 'tips.categories.exercise', color: 'text-blue-600' },
  selfcare: { icon: Heart, key: 'tips.categories.selfcare', color: 'text-pink-600' },
};

export function PhaseIndicator({ phase, className }: PhaseIndicatorProps) {
  const { t } = useTranslation();
  const config = phaseConfig[phase];
  const Icon = config.icon;
  const tips = phaseTips[phase];

  const tipsByCategory = {
    nutrition: tips.filter(tip => tip.category === 'nutrition'),
    exercise: tips.filter(tip => tip.category === 'exercise'),
    selfcare: tips.filter(tip => tip.category === 'selfcare'),
  };

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
      <DialogContent className="max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
          
          <DialogDescription className="text-base leading-relaxed text-left animate-fade-in space-y-6">
            <p className="text-foreground/90 font-medium">
              {phase === 'irregular' ? config.desc : t(config.desc)}
            </p>

            {/* Tip Cards by Category */}
            <div className="space-y-4 pt-4">
              <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                {t('tips.personalizedRecommendations')}
              </h4>
              
              {Object.entries(tipsByCategory).map(([category, categoryTips]) => {
                const catConfig = categoryConfig[category as keyof typeof categoryConfig];
                const CategoryIcon = catConfig.icon;
                
                return (
                  <Card key={category} className="border-l-4 border-l-primary/50 animate-fade-in hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CategoryIcon className={`h-5 w-5 ${catConfig.color}`} />
                        <h5 className="font-semibold text-foreground">{t(catConfig.key)}</h5>
                      </div>
                      <ul className="space-y-2">
                        {categoryTips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{t(tip.key)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}