import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SymptomChip } from '@/components/SymptomChip';
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

export default function DailyCheckin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [periodStatus, setPeriodStatus] = useState<'started' | 'ended' | 'none'>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [journalEntry, setJournalEntry] = useState('');

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');

      const today = format(new Date(), 'yyyy-MM-dd');

      const { error } = await supabase
        .from('daily_logs')
        .upsert({
          user_id: user.id,
          log_date: today,
          period_started: periodStatus === 'started',
          period_ended: periodStatus === 'ended',
          symptoms: selectedSymptoms,
          journal_entry: journalEntry || null,
        }, {
          onConflict: 'user_id,log_date'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_logs'] });
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

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient">Registro Diario</CardTitle>
            <CardDescription>
              Toma un momento para conectar con tu cuerpo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Period Status */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Estado del Período</h3>
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant={periodStatus === 'started' ? 'default' : 'outline'}
                  onClick={() => setPeriodStatus(periodStatus === 'started' ? 'none' : 'started')}
                  className={periodStatus === 'started' ? 'bg-gradient-primary' : ''}
                >
                  Comenzó hoy
                </Button>
                <Button
                  variant={periodStatus === 'ended' ? 'default' : 'outline'}
                  onClick={() => setPeriodStatus(periodStatus === 'ended' ? 'none' : 'ended')}
                  className={periodStatus === 'ended' ? 'bg-gradient-primary' : ''}
                >
                  Terminó hoy
                </Button>
                <Button
                  variant={periodStatus === 'none' ? 'default' : 'outline'}
                  onClick={() => setPeriodStatus('none')}
                >
                  Sin cambios
                </Button>
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">¿Cómo te sientes hoy?</h3>
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
              <h3 className="font-semibold text-foreground">Reflexión Personal</h3>
              <Textarea
                placeholder="Intención o Gratitud de hoy..."
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="w-full bg-gradient-primary hover:opacity-90"
              size="lg"
            >
              {saveMutation.isPending ? 'Guardando...' : 'Guardar Registro'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}