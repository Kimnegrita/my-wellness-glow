import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SymptomChip } from '@/components/SymptomChip';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { getCurrentPhase, getCurrentCycleDay } from '@/lib/cycleCalculations';

const SYMPTOMS = [
  // Menstrual Phase
  'Cólicos', 'Dolor de Espalda Baja', 'Fatiga Extrema', 'Hinchazón Abdominal',
  'Dolor de Cabeza', 'Diarrea', 'Náuseas', 'Sensibilidad en Senos',
  'Calambres', 'Antojos', 'Acné', 'Insomnio',
  
  // Follicular Phase
  'Energía Alta', 'Buen Humor', 'Piel Radiante', 'Libido Alta',
  'Motivación', 'Concentración Buena', 'Fuerza Muscular', 'Cabello Brillante',
  
  // Ovulation Phase
  'Flujo Cervical', 'Libido Muy Alta', 'Energía Pico', 'Confianza',
  'Dolor Ovulatorio', 'Temperatura Basal Alta', 'Sociabilidad', 'Creatividad',
  
  // Luteal Phase
  'Hinchazón', 'Ansiedad', 'Irritabilidad', 'Fatiga', 'Antojos Dulces',
  'Retención de Líquidos', 'Dolor Articular', 'Cambios de Humor',
  'Niebla Mental', 'Estreñimiento',
  
  // General symptoms
  'Energía Baja', 'Estrés', 'Sofocos', 'Sueño Malo', 'Irritable',
  'Sudores Nocturnos', 'Mareos', 'Palpitaciones', 'Tensión Muscular',
  'Dolor de Espalda', 'Sangrado Irregular', 'Flujo Abundante',
];

const MOODS = [
  { emoji: '😊', label: 'Feliz', value: 'Feliz' },
  { emoji: '😌', label: 'Tranquila', value: 'Tranquila' },
  { emoji: '😍', label: 'Enamorada', value: 'Enamorada' },
  { emoji: '😁', label: 'Radiante', value: 'Radiante' },
  { emoji: '🥰', label: 'Amorosa', value: 'Amorosa' },
  { emoji: '😎', label: 'Confiada', value: 'Confiada' },
  { emoji: '🤗', label: 'Cariñosa', value: 'Cariñosa' },
  { emoji: '😇', label: 'Pacífica', value: 'Pacífica' },
  { emoji: '😓', label: 'Estresada', value: 'Estresada' },
  { emoji: '😢', label: 'Triste', value: 'Triste' },
  { emoji: '😭', label: 'Llorosa', value: 'Llorosa' },
  { emoji: '😤', label: 'Irritable', value: 'Irritable' },
  { emoji: '😠', label: 'Enojada', value: 'Enojada' },
  { emoji: '😰', label: 'Ansiosa', value: 'Ansiosa' },
  { emoji: '😔', label: 'Melancólica', value: 'Melancólica' },
  { emoji: '😖', label: 'Frustrada', value: 'Frustrada' },
  { emoji: '😫', label: 'Agotada', value: 'Agotada' },
  { emoji: '😴', label: 'Cansada', value: 'Cansada' },
  { emoji: '🥱', label: 'Somnolienta', value: 'Somnolienta' },
  { emoji: '😐', label: 'Neutral', value: 'Neutral' },
  { emoji: '😕', label: 'Confundida', value: 'Confundida' },
  { emoji: '😒', label: 'Aburrida', value: 'Aburrida' },
  { emoji: '🤒', label: 'Enferma', value: 'Enferma' },
  { emoji: '😵', label: 'Abrumada', value: 'Abrumada' },
  { emoji: '💪', label: 'Fuerte', value: 'Fuerte' },
  { emoji: '✨', label: 'Motivada', value: 'Motivada' },
  { emoji: '🔥', label: 'Energética', value: 'Energética' },
  { emoji: '🌸', label: 'Sensible', value: 'Sensible' },
];

const SYMPTOMS_BY_PHASE = {
  menstruation: [
    'Cólicos', 'Dolor de Espalda Baja', 'Fatiga Extrema', 'Hinchazón Abdominal',
    'Dolor de Cabeza', 'Diarrea', 'Náuseas', 'Sensibilidad en Senos',
    'Calambres', 'Antojos', 'Acné', 'Insomnio'
  ],
  follicular: [
    'Energía Alta', 'Buen Humor', 'Piel Radiante', 'Libido Alta',
    'Motivación', 'Concentración Buena', 'Fuerza Muscular', 'Cabello Brillante'
  ],
  ovulation: [
    'Flujo Cervical', 'Libido Muy Alta', 'Energía Pico', 'Confianza',
    'Sensibilidad en Senos', 'Dolor Ovulatorio', 'Temperatura Basal Alta',
    'Sociabilidad', 'Creatividad'
  ],
  luteal: [
    'Hinchazón', 'Ansiedad', 'Irritabilidad', 'Fatiga', 'Sensibilidad en Senos',
    'Antojos Dulces', 'Retención de Líquidos', 'Dolor de Cabeza',
    'Insomnio', 'Acné', 'Dolor Articular', 'Cambios de Humor',
    'Niebla Mental', 'Estreñimiento'
  ],
  irregular: []
};

const SYMPTOM_EXPLANATIONS: Record<string, Record<string, string>> = {
  'Cólicos': {
    menstruation: 'Las contracciones uterinas para expulsar el revestimiento causan cólicos durante la menstruación.'
  },
  'Fatiga Extrema': {
    menstruation: 'Los niveles bajos de estrógeno y progesterona durante el período causan fatiga intensa.',
    luteal: 'El cuerpo trabaja extra preparándose para un posible embarazo, lo que agota energía.'
  },
  'Energía Alta': {
    follicular: 'El estrógeno en aumento aumenta los niveles de energía y vitalidad.'
  },
  'Hinchazón': {
    menstruation: 'Los cambios hormonales causan retención de líquidos durante el período.',
    luteal: 'La progesterona alta causa retención de agua en la fase lútea.'
  },
  'Hinchazón Abdominal': {
    menstruation: 'Los cambios hormonales causan retención de líquidos en el área abdominal.',
  },
  'Libido Alta': {
    follicular: 'El estrógeno creciente aumenta el deseo sexual.',
    ovulation: 'En la ovulación, el cuerpo está biológicamente preparado para la concepción.'
  },
  'Libido Muy Alta': {
    ovulation: 'Pico de fertilidad: el cuerpo aumenta el deseo sexual para maximizar chances de concepción.'
  },
  'Ansiedad': {
    luteal: 'La caída de serotonina por cambios hormonales puede provocar ansiedad.'
  },
  'Irritabilidad': {
    luteal: 'Fluctuaciones de estrógeno y progesterona afectan los neurotransmisores del estado de ánimo.'
  },
  'Sensibilidad en Senos': {
    menstruation: 'Cambios hormonales causan sensibilidad mamaria.',
    ovulation: 'El pico de estrógeno puede causar sensibilidad temporal.',
    luteal: 'La progesterona causa retención de líquidos en el tejido mamario.'
  },
  'Dolor de Cabeza': {
    menstruation: 'La caída brusca de estrógeno puede desencadenar migrañas.',
    luteal: 'Fluctuaciones hormonales pueden causar dolores de cabeza.'
  },
  'Acné': {
    menstruation: 'Cambios hormonales estimulan las glándulas sebáceas.',
    luteal: 'La progesterona aumenta la producción de sebo en la piel.'
  },
  'Niebla Mental': {
    luteal: 'Los cambios en estrógeno afectan la concentración y la memoria.'
  },
  'Flujo Cervical': {
    ovulation: 'El moco cervical fértil facilita el movimiento de espermatozoides.'
  },
  'Piel Radiante': {
    follicular: 'El estrógeno aumenta la producción de colágeno y la hidratación de la piel.'
  },
  'Insomnio': {
    menstruation: 'Las molestias físicas y cambios hormonales dificultan el sueño.',
    luteal: 'La progesterona alta puede afectar los patrones de sueño.'
  },
  'Antojos': {
    menstruation: 'Cambios en serotonina provocan antojos de carbohidratos y azúcar.',
  },
  'Antojos Dulces': {
    luteal: 'La caída de serotonina causa antojos de alimentos reconfortantes.'
  },
  'Retención de Líquidos': {
    luteal: 'La progesterona hace que el cuerpo retenga más agua y sal.'
  },
  'Dolor Articular': {
    luteal: 'La retención de líquidos puede causar inflamación en las articulaciones.'
  },
  'Buen Humor': {
    follicular: 'El aumento de estrógeno mejora los niveles de serotonina y el estado de ánimo.'
  },
  'Concentración Buena': {
    follicular: 'Los niveles de estrógeno mejoran la función cognitiva y la claridad mental.'
  },
  'Dolor Ovulatorio': {
    ovulation: 'La liberación del óvulo puede causar una molestia leve a un lado del abdomen.'
  },
  'Energía Pico': {
    ovulation: 'Los niveles hormonales óptimos proporcionan máxima energía.'
  },
  'Cambios de Humor': {
    luteal: 'Las fluctuaciones hormonales afectan los neurotransmisores que regulan el estado de ánimo.'
  },
  'Estreñimiento': {
    luteal: 'La progesterona relaja los músculos intestinales, ralentizando la digestión.'
  },
  'Diarrea': {
    menstruation: 'Las prostaglandinas que causan contracciones uterinas también afectan el intestino.'
  },
  'Náuseas': {
    menstruation: 'Las prostaglandinas pueden afectar el sistema digestivo causando náuseas.'
  },
  'Dolor de Espalda Baja': {
    menstruation: 'Las contracciones uterinas pueden irradiar dolor a la espalda baja.'
  },
  'Calambres': {
    menstruation: 'Las contracciones del útero para expulsar el revestimiento causan calambres.'
  },
};

export default function DailyCheckin() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const queryClient = useQueryClient();

  const [periodStatus, setPeriodStatus] = useState<'started' | 'ended' | 'none'>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [journalEntry, setJournalEntry] = useState('');

  // Calculate current cycle phase
  const currentCycleDay = getCurrentCycleDay(
    profile?.last_period_date ? new Date(profile.last_period_date) : null,
    profile?.avg_cycle_length || null
  );
  const currentPhase = getCurrentPhase(currentCycleDay);

  // Split symptoms into suggested (for current phase) and others
  const suggestedSymptoms = SYMPTOMS_BY_PHASE[currentPhase] || [];
  const otherSymptoms = SYMPTOMS.filter(s => !suggestedSymptoms.includes(s));

  // Fetch previous period start dates to calculate cycle length
  const { data: previousPeriods } = useQuery({
    queryKey: ['previous_periods', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('daily_logs')
        .select('log_date')
        .eq('user_id', user.id)
        .eq('period_started', true)
        .order('log_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');

      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Add moods to symptoms if selected
      const moodSymptoms = selectedMoods.map(mood => `Ánimo: ${mood}`);
      const allSymptoms = [...selectedSymptoms, ...moodSymptoms];

      // Save daily log
      const { error } = await supabase
        .from('daily_logs')
        .upsert({
          user_id: user.id,
          log_date: today,
          period_started: periodStatus === 'started',
          period_ended: periodStatus === 'ended',
          symptoms: allSymptoms,
          journal_entry: journalEntry || null,
        }, {
          onConflict: 'user_id,log_date'
        });

      if (error) throw error;

      // If period started today, update profile automatically
      if (periodStatus === 'started') {
        // Calculate average cycle length if we have previous periods
        let calculatedCycleLength = profile?.avg_cycle_length;
        
        if (previousPeriods && previousPeriods.length > 0 && profile?.last_period_date) {
          const lastPeriodDate = new Date(profile.last_period_date);
          const todayDate = new Date(today);
          const currentCycleLength = differenceInDays(todayDate, lastPeriodDate);
          
          // Calculate average from last few cycles
          if (previousPeriods.length >= 2 && currentCycleLength > 15 && currentCycleLength < 45) {
            const cycleLengths: number[] = [];
            
            for (let i = 0; i < previousPeriods.length - 1; i++) {
              const diff = differenceInDays(
                new Date(previousPeriods[i].log_date),
                new Date(previousPeriods[i + 1].log_date)
              );
              if (diff > 15 && diff < 45) { // Valid cycle length range
                cycleLengths.push(diff);
              }
            }
            
            // Add current cycle
            cycleLengths.push(currentCycleLength);
            
            if (cycleLengths.length > 0) {
              calculatedCycleLength = Math.round(
                cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
              );
            }
          }
        }

        // Update profile with new period date and calculated cycle length
        await updateProfile({
          last_period_date: today,
          avg_cycle_length: calculatedCycleLength,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_logs'] });
      queryClient.invalidateQueries({ queryKey: ['weekly_logs'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['previous_periods'] });
      toast.success('¡Registro guardado exitosamente! ✨');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleMoodToggle = (moodValue: string) => {
    setSelectedMoods(prev =>
      prev.includes(moodValue)
        ? prev.filter(m => m !== moodValue)
        : [...prev, moodValue]
    );
  };

  const handleSave = () => {
    if (selectedMoods.length === 0 && selectedSymptoms.length === 0 && !journalEntry) {
      toast.error('Por favor, selecciona al menos un estado de ánimo, síntoma o escribe algo en el diario');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <Card className="shadow-elegant border-primary/20 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold">
              <span className="text-gradient">¿Cómo te sientes hoy?</span>
            </CardTitle>
            <CardDescription className="text-base">
              Día {format(new Date(), 'd')} • Toma un momento para conectar con tu cuerpo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Period Status */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">🩸</span>
                Ciclo Menstrual
              </h3>
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant={periodStatus === 'started' ? 'default' : 'outline'}
                  onClick={() => setPeriodStatus(periodStatus === 'started' ? 'none' : 'started')}
                  className={periodStatus === 'started' ? 'bg-gradient-primary shadow-lg' : 'border-2'}
                  size="lg"
                >
                  Comenzó hoy
                </Button>
                <Button
                  variant={periodStatus === 'ended' ? 'default' : 'outline'}
                  onClick={() => setPeriodStatus(periodStatus === 'ended' ? 'none' : 'ended')}
                  className={periodStatus === 'ended' ? 'bg-gradient-primary shadow-lg' : 'border-2'}
                  size="lg"
                >
                  Terminó hoy
                </Button>
                <Button
                  variant={periodStatus === 'none' ? 'default' : 'outline'}
                  onClick={() => setPeriodStatus('none')}
                  className={periodStatus === 'none' ? '' : 'border-2'}
                  size="lg"
                >
                  Sin cambios
                </Button>
              </div>
            </div>

            {/* Mood Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">💭</span>
                Mi Estado de Ánimo
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodToggle(mood.value)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                      ${selectedMoods.includes(mood.value)
                        ? 'border-primary bg-primary/10 scale-105 shadow-lg' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    <span className="text-2xl mb-1">{mood.emoji}</span>
                    <span className="text-[10px] font-medium text-center leading-tight">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Symptoms */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">🌡️</span>
                Síntomas Físicos
              </h3>
              
              {/* Suggested Symptoms */}
              {suggestedSymptoms.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Comunes en fase {currentPhase}:</p>
                    <Badge variant="secondary" className="text-xs">
                      {currentPhase === 'menstruation' && '🩸 Menstruación'}
                      {currentPhase === 'follicular' && '🌱 Folicular'}
                      {currentPhase === 'ovulation' && '🌸 Ovulación'}
                      {currentPhase === 'luteal' && '🌙 Lútea'}
                    </Badge>
                  </div>
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSymptoms.map((symptom) => {
                        const explanation = SYMPTOM_EXPLANATIONS[symptom]?.[currentPhase || 'irregular'];
                        
                        if (explanation) {
                          return (
                            <Tooltip key={symptom}>
                              <TooltipTrigger asChild>
                                <div className="relative">
                                  <SymptomChip
                                    symptom={symptom}
                                    isSelected={selectedSymptoms.includes(symptom)}
                                    onToggle={() => handleSymptomToggle(symptom)}
                                  />
                                  <Info className="absolute -top-1 -right-1 h-3 w-3 text-primary bg-background rounded-full" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">{explanation}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        }
                        
                        return (
                          <SymptomChip
                            key={symptom}
                            symptom={symptom}
                            isSelected={selectedSymptoms.includes(symptom)}
                            onToggle={() => handleSymptomToggle(symptom)}
                          />
                        );
                      })}
                    </div>
                  </TooltipProvider>
                </div>
              )}

              {/* Other Symptoms */}
              {otherSymptoms.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Otros síntomas:</p>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                    {otherSymptoms.map((symptom) => (
                      <SymptomChip
                        key={symptom}
                        symptom={symptom}
                        isSelected={selectedSymptoms.includes(symptom)}
                        onToggle={() => handleSymptomToggle(symptom)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Journal */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">✨</span>
                Intención o Gratitud
              </h3>
              <Textarea
                placeholder="Escribe sobre tu intención o gratitud de hoy..."
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                rows={4}
                className="resize-none border-2 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground">
                Este es tu espacio privado para reflexionar
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="w-full bg-gradient-primary hover:opacity-90 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {saveMutation.isPending ? 'Guardando...' : 'Guardar Registro'}
              <Save className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}