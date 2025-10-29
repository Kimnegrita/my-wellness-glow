import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | undefined>(undefined);
  const [dontRemember, setDontRemember] = useState(false);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [isIrregular, setIsIrregular] = useState(false);

  const handleComplete = async () => {
    setLoading(true);

    try {
      await updateProfile({
        last_period_date: dontRemember || !lastPeriodDate 
          ? null 
          : format(lastPeriodDate, 'yyyy-MM-dd'),
        avg_cycle_length: isIrregular ? null : cycleLength,
        is_irregular: isIrregular,
      });

      toast.success('¡Perfil completado! Bienvenida a tu viaje de bienestar ✨');
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Card className="w-full max-w-lg shadow-elegant">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="My Wellness Glow" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-gradient">
            ¡Bienvenida, {profile?.name}!
          </CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Paso {step} de 2
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  ¿Cuándo comenzó tu última menstruación?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Esto nos ayudará a personalizar tus consejos
                </p>
              </div>

              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={lastPeriodDate}
                  onSelect={setLastPeriodDate}
                  disabled={(date) => date > new Date()}
                  locale={es}
                  className="rounded-md border"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dont-remember"
                  checked={dontRemember}
                  onCheckedChange={(checked) => setDontRemember(checked as boolean)}
                />
                <label
                  htmlFor="dont-remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  No me acuerdo
                </label>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  Información de tu ciclo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ayúdanos a entender mejor tu cuerpo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycle-length">
                  Duración promedio de tu ciclo (días)
                </Label>
                <Input
                  id="cycle-length"
                  type="number"
                  min={21}
                  max={35}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  disabled={isIrregular}
                  className="text-center text-lg font-semibold"
                />
                <p className="text-xs text-muted-foreground text-center">
                  La mayoría de los ciclos duran entre 21 y 35 días
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="irregular"
                  checked={isIrregular}
                  onCheckedChange={(checked) => setIsIrregular(checked as boolean)}
                />
                <label
                  htmlFor="irregular"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mi ciclo es irregular
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  {loading ? 'Guardando...' : 'Comenzar mi viaje'}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}