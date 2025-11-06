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

const SYMPTOMS = [
  'Energía Baja',
  'Estrés',
  'Ansiedad',
  'Hinchazón',
  'Sofocos',
  'Sueño Malo',
  'Buen Humor',
  'Irritable',
  'Niebla Mental',
  'Dolor Articular',
  'Dolor de Cabeza',
  'Cólicos',
];

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

  const [periodStatus, setPeriodStatus] = useState<'started' | 'ended' | 'none'>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [journalEntry, setJournalEntry] = useState('');
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      
      // Add mood to symptoms if selected
      const allSymptoms = selectedMood 
        ? [...selectedSymptoms, `Ánimo: ${selectedMood}`]
        : selectedSymptoms;

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

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = () => {
    if (!selectedMood && selectedSymptoms.length === 0 && !journalEntry) {
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all
                      ${selectedMood === mood.value 
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
                Síntomas Físicos
              </h3>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map((symptom) => (
                  <SymptomChip
                    key={symptom}
                    symptom={symptom}
                    isSelected={selectedSymptoms.includes(symptom)}
                    onToggle={() => handleSymptomToggle(symptom)}
                  />
                ))}
              </div>
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
                    sentimentScore={sentimentAnalysis?.sentiment_score}
                    sentimentLabel={sentimentAnalysis?.sentiment_label}
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
              {saveMutation.isPending ? 'Guardando...' : isAnalyzing ? 'Analizando...' : 'Guardar Registro'}
              <Save className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}