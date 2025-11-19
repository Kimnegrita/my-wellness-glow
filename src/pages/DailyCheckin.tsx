import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SymptomChip } from '@/components/SymptomChip';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import SentimentAnalysis from '@/components/SentimentAnalysis';
import { getCurrentPhase, getCurrentCycleDay } from '@/lib/cycleCalculations';
import { useTranslation } from 'react-i18next';

const SYMPTOMS = [
  // Síntomas Menstruales
  'Cólicos',
  'Dolor de Espalda Baja',
  'Sangrado Abundante',
  'Sangrado Leve',
  'Coágulos',
  'Náuseas',
  
  // Síntomas Generales/Energía
  'Energía Alta',
  'Energía Baja',
  'Fatiga',
  'Cansancio Extremo',
  'Motivación Alta',
  'Letargo',
  
  // Síntomas Físicos Generales
  'Hinchazón',
  'Retención de Líquidos',
  'Sensibilidad en Senos',
  'Dolor en Senos',
  'Dolor de Cabeza',
  'Migraña',
  'Dolor Articular',
  'Dolor Muscular',
  'Dolor Pélvico',
  'Calambres Abdominales',
  
  // Temperatura y Síntomas Corporales
  'Sofocos',
  'Sudores Nocturnos',
  'Escalofríos',
  'Temperatura Elevada',
  
  // Digestivos
  'Náuseas',
  'Diarrea',
  'Estreñimiento',
  'Gases',
  'Sensibilidad Digestiva',
  'Antojos de Comida',
  'Apetito Aumentado',
  'Pérdida de Apetito',
  
  // Cognitivos y Mentales
  'Niebla Mental',
  'Claridad Mental',
  'Concentración Difícil',
  'Memoria Afectada',
  'Creatividad Alta',
  
  // Estados de Ánimo/Emocionales (físicamente manifestados)
  'Estrés',
  'Ansiedad',
  'Irritabilidad',
  'Sensibilidad Emocional',
  'Cambios de Humor',
  
  // Sueño
  'Sueño Malo',
  'Insomnio',
  'Sueño Profundo',
  'Somnolencia',
  'Pesadillas',
  
  // Piel y Cabello
  'Acné',
  'Piel Seca',
  'Piel Grasa',
  'Piel Radiante',
  'Cabello Graso',
  'Cabello Seco',
  
  // Síntomas Sexuales
  'Libido Alta',
  'Libido Baja',
  'Sequedad Vaginal',
  'Flujo Vaginal Aumentado',
  'Sensibilidad Aumentada',
  
  // Otros
  'Mareos',
  'Vértigo',
  'Palpitaciones',
  'Visión Borrosa',
  'Sensibilidad a la Luz',
  'Sensibilidad al Ruido',
];

// Síntomas sugeridos por fase del ciclo
const SYMPTOMS_BY_PHASE = {
  menstruation: [
    'Cólicos',
    'Dolor de Espalda Baja',
    'Sangrado Abundante',
    'Sangrado Leve',
    'Fatiga',
    'Dolor de Cabeza',
    'Náuseas',
    'Hinchazón',
    'Cambios de Humor',
    'Antojos de Comida',
  ],
  follicular: [
    'Energía Alta',
    'Motivación Alta',
    'Claridad Mental',
    'Creatividad Alta',
    'Piel Radiante',
    'Libido Alta',
    'Sueño Profundo',
    'Apetito Aumentado',
  ],
  ovulation: [
    'Energía Alta',
    'Libido Alta',
    'Flujo Vaginal Aumentado',
    'Sensibilidad Aumentada',
    'Creatividad Alta',
    'Piel Radiante',
    'Temperatura Elevada',
    'Dolor Pélvico',
    'Sensibilidad en Senos',
  ],
  luteal: [
    'Hinchazón',
    'Retención de Líquidos',
    'Sensibilidad en Senos',
    'Acné',
    'Irritabilidad',
    'Ansiedad',
    'Cambios de Humor',
    'Antojos de Comida',
    'Fatiga',
    'Sueño Malo',
    'Insomnio',
    'Dolor de Cabeza',
    'Estreñimiento',
  ],
  irregular: [],
};

const MOODS = [
  // Estados positivos y de plenitud
  { emoji: '😊', label: 'Feliz', value: 'Feliz' },
  { emoji: '🥰', label: 'Amorosa', value: 'Amorosa' },
  { emoji: '😌', label: 'Tranquila', value: 'Tranquila' },
  { emoji: '🤗', label: 'Plena', value: 'Plena' },
  { emoji: '😄', label: 'Gozosa', value: 'Gozosa' },
  { emoji: '✨', label: 'Radiante', value: 'Radiante' },
  { emoji: '🌟', label: 'Empoderada', value: 'Empoderada' },
  { emoji: '😇', label: 'En Paz', value: 'En Paz' },
  
  // Estados neutros o energéticos
  { emoji: '😐', label: 'Neutral', value: 'Neutral' },
  { emoji: '🤔', label: 'Pensativa', value: 'Pensativa' },
  { emoji: '😴', label: 'Cansada', value: 'Cansada' },
  { emoji: '🥱', label: 'Somnolienta', value: 'Somnolienta' },
  
  // Estados de estrés y tensión
  { emoji: '😓', label: 'Estresada', value: 'Estresada' },
  { emoji: '😰', label: 'Ansiosa', value: 'Ansiosa' },
  { emoji: '😤', label: 'Irritable', value: 'Irritable' },
  { emoji: '😠', label: 'Frustrada', value: 'Frustrada' },
  { emoji: '😖', label: 'Abrumada', value: 'Abrumada' },
  
  // Estados de tristeza y soledad
  { emoji: '😢', label: 'Triste', value: 'Triste' },
  { emoji: '😔', label: 'Melancólica', value: 'Melancólica' },
  { emoji: '😞', label: 'Desanimada', value: 'Desanimada' },
  { emoji: '🥺', label: 'Vulnerable', value: 'Vulnerable' },
  { emoji: '😪', label: 'Solitaria', value: 'Solitaria' },
  { emoji: '😭', label: 'Muy Triste', value: 'Muy Triste' },
];

export default function DailyCheckin() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [periodStatus, setPeriodStatus] = useState<'started' | 'ended' | 'none'>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calcular fase actual del ciclo
  const currentCycleDay = profile?.last_period_date && profile?.avg_cycle_length
    ? getCurrentCycleDay(new Date(profile.last_period_date), profile.avg_cycle_length)
    : null;
  
  const currentPhase = getCurrentPhase(currentCycleDay, profile?.is_irregular);

  // Obtener síntomas sugeridos según la fase
  const suggestedSymptoms = currentPhase 
    ? SYMPTOMS_BY_PHASE[currentPhase as keyof typeof SYMPTOMS_BY_PHASE] || []
    : [];

  // Separar síntomas en sugeridos y otros
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
      const { data: savedLog, error } = await supabase
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
        })
        .select()
        .single();

      if (error) throw error;

      // Analyze sentiment if there's a journal entry
      if (journalEntry && journalEntry.trim().length > 0 && savedLog) {
        setIsAnalyzing(true);
        try {
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-sentiment', {
            body: { 
              logId: savedLog.id,
              journalEntry: journalEntry,
              symptoms: allSymptoms
            }
          });

          if (analysisError) {
            console.error('Sentiment analysis error:', analysisError);
          } else {
            setSentimentAnalysis(analysisData);
          }
        } catch (err) {
          console.error('Failed to analyze sentiment:', err);
        } finally {
          setIsAnalyzing(false);
        }
      }

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

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = () => {
    if (selectedMoods.length === 0 && selectedSymptoms.length === 0 && !journalEntry) {
      toast.error(t('checkin.validation.minSelection'));
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
          {t('common.backToHome')}
        </Button>

        <Card className="shadow-elegant border-primary/20 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold">
              <span className="text-gradient">{t('checkin.title')}</span>
            </CardTitle>
            <CardDescription className="text-base">
              {t('checkin.description')}
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
                {t('checkin.moodTitle')}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodToggle(mood.value)}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all
                      ${selectedMoods.includes(mood.value)
                        ? 'border-primary bg-primary/10 scale-105 shadow-lg' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    <span className="text-3xl mb-1">{mood.emoji}</span>
                    <span className="text-xs font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Symptoms */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">🌡️</span>
                {t('checkin.symptoms')}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                Selecciona todos los síntomas que estés experimentando hoy
              </p>

              {/* Síntomas sugeridos según fase */}
              {suggestedSymptoms.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Comunes en fase {currentPhase === 'menstruation' ? 'menstrual' : 
                                      currentPhase === 'follicular' ? 'folicular' : 
                                      currentPhase === 'ovulation' ? 'de ovulación' : 'lútea'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    {suggestedSymptoms.map((symptom) => (
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

              {/* Todos los demás síntomas */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t('checkin.otherSymptoms')}</p>
                <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2 bg-muted/20 rounded-lg">
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
            </div>

            {/* Journal */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">✨</span>
                {t('checkin.journalEntry')}
              </h3>
              <Textarea
                placeholder={t('checkin.journalPlaceholder')}
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                rows={4}
                className="resize-none border-2 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground">
                {t('checkin.description')}
              </p>
            </div>

            {/* Sentiment Analysis Results */}
            {(isAnalyzing || sentimentAnalysis) && (
              <div className="animate-fade-in">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                    <span className="text-sm text-muted-foreground">Analizando tus emociones...</span>
                  </div>
                ) : (
                  <SentimentAnalysis 
                    emotionalPatterns={sentimentAnalysis?.emotional_patterns}
                    aiInsights={sentimentAnalysis?.ai_insights}
                  />
                )}
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || isAnalyzing}
              className="w-full bg-gradient-primary hover:opacity-90 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {saveMutation.isPending ? t('common.loading') : isAnalyzing ? t('common.loading') : t('common.save')}
              <Save className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}