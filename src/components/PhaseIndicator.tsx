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
  text: string;
}

interface PhaseIndicatorProps {
  phase: CyclePhase;
  className?: string;
}

const phaseTips: Record<CyclePhase, PhaseTip[]> = {
  menstruation: [
    { category: 'nutrition', text: 'Incluye alimentos ricos en hierro: espinacas, lentejas, carne roja' },
    { category: 'nutrition', text: 'Mantente hidratada con agua e infusiones de jengibre' },
    { category: 'exercise', text: 'Yoga restaurativo y ejercicio suave para aliviar cólicos' },
    { category: 'exercise', text: 'Caminatas ligeras si te sientes con energía' },
    { category: 'selfcare', text: 'Descansa y escucha las necesidades de tu cuerpo' },
    { category: 'selfcare', text: 'Permítete un espacio para la introspección' },
  ],
  follicular: [
    { category: 'nutrition', text: 'Aumenta proteínas de calidad en cada comida' },
    { category: 'nutrition', text: 'Tu metabolismo está acelerado, come nutritivo' },
    { category: 'exercise', text: 'Ejercicio intenso: tu cuerpo responderá muy bien' },
    { category: 'exercise', text: 'Prueba entrenamientos de fuerza y cardio' },
    { category: 'selfcare', text: 'Momento ideal para nuevos proyectos y planificación' },
    { category: 'selfcare', text: 'Aprovecha tu energía y creatividad aumentadas' },
  ],
  ovulation: [
    { category: 'nutrition', text: 'Antioxidantes: bayas, té verde, vegetales de hoja' },
    { category: 'nutrition', text: 'Alimentos frescos y coloridos para pico de energía' },
    { category: 'exercise', text: 'Actividades sociales: deportes de equipo, clases grupales' },
    { category: 'exercise', text: 'Tu resistencia está en su máximo' },
    { category: 'selfcare', text: 'Momento perfecto para conversaciones importantes' },
    { category: 'selfcare', text: 'Aprovecha tu confianza para presentaciones o entrevistas' },
  ],
  luteal: [
    { category: 'nutrition', text: 'Carbohidratos complejos para equilibrar el ánimo' },
    { category: 'nutrition', text: 'Magnesio: nueces, semillas, para hinchazón y calambres' },
    { category: 'exercise', text: 'Caminatas ligeras y ejercicio moderado' },
    { category: 'exercise', text: 'Reduce la intensidad, escucha a tu cuerpo' },
    { category: 'selfcare', text: 'Prioriza autocuidado: baños tibios, meditación' },
    { category: 'selfcare', text: 'Reduce cafeína si sientes ansiedad' },
  ],
  irregular: [
    { category: 'nutrition', text: 'Omega-3 para regular hormonas naturalmente' },
    { category: 'nutrition', text: 'Dieta equilibrada y consistente' },
    { category: 'exercise', text: 'Rutina de ejercicio regular para balance hormonal' },
    { category: 'exercise', text: 'Evita extremos, busca consistencia' },
    { category: 'selfcare', text: 'Rutina de sueño regular es fundamental' },
    { category: 'selfcare', text: 'Manejo del estrés: respiración profunda, mindfulness' },
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
  nutrition: { icon: Apple, label: 'Alimentación', color: 'text-green-600' },
  exercise: { icon: Dumbbell, label: 'Ejercicio', color: 'text-blue-600' },
  selfcare: { icon: Heart, label: 'Autocuidado', color: 'text-pink-600' },
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
                Recomendaciones personalizadas
              </h4>
              
              {Object.entries(tipsByCategory).map(([category, categoryTips]) => {
                const catConfig = categoryConfig[category as keyof typeof categoryConfig];
                const CategoryIcon = catConfig.icon;
                
                return (
                  <Card key={category} className="border-l-4 border-l-primary/50 animate-fade-in hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CategoryIcon className={`h-5 w-5 ${catConfig.color}`} />
                        <h5 className="font-semibold text-foreground">{catConfig.label}</h5>
                      </div>
                      <ul className="space-y-2">
                        {categoryTips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{tip.text}</span>
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