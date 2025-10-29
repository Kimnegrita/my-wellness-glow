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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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
  { emoji: '😊', label: 'Feliz', value: 'Feliz' },
  { emoji: '😌', label: 'Tranquila', value: 'Tranquila' },
  { emoji: '😓', label: 'Estresada', value: 'Estresada' },
  { emoji: '😢', label: 'Triste', value: 'Triste' },
  { emoji: '😤', label: 'Irritable', value: 'Irritable' },
  { emoji: '😴', label: 'Cansada', value: 'Cansada' },
];

export default function DailyCheckin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [periodStatus, setPeriodStatus] = useState<'started' | 'ended' | 'none'>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [journalEntry, setJournalEntry] = useState('');

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');

      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Add mood to symptoms if selected
      const allSymptoms = selectedMood 
        ? [...selectedSymptoms, `Ánimo: ${selectedMood}`]
        : selectedSymptoms;

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_logs'] });
      queryClient.invalidateQueries({ queryKey: ['weekly_logs'] });
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
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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