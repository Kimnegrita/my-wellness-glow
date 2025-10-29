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
import { ArrowLeft, Save, User, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function Profile() {
  const navigate = useNavigate();
  const { updateProfile, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState(profile?.name || '');
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | undefined>(
    profile?.last_period_date ? new Date(profile.last_period_date) : undefined
  );
  const [cycleLength, setCycleLength] = useState<number>(profile?.avg_cycle_length || 28);
  const [isIrregular, setIsIrregular] = useState(profile?.is_irregular || false);

  const handleSave = async () => {
    setLoading(true);

    try {
      await updateProfile({
        name,
        last_period_date: lastPeriodDate 
          ? format(lastPeriodDate, 'yyyy-MM-dd')
          : null,
        avg_cycle_length: isIrregular ? null : cycleLength,
        is_irregular: isIrregular,
      });

      toast.success('¡Perfil actualizado correctamente! ✨');
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
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
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              <span className="text-gradient">Mi Perfil</span>
            </CardTitle>
            <CardDescription className="text-base">
              Actualiza tu información personal y configuración del ciclo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Nombre
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="border-2"
                />
              </div>
            </div>

            {/* Cycle Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Información del Ciclo
              </h3>
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Fecha de última menstruación
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {lastPeriodDate ? (
                        format(lastPeriodDate, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={lastPeriodDate}
                      onSelect={setLastPeriodDate}
                      disabled={(date) => date > new Date()}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycle-length" className="text-base font-semibold">
                  Duración promedio del ciclo (días)
                </Label>
                <Input
                  id="cycle-length"
                  type="number"
                  min={21}
                  max={35}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  disabled={isIrregular}
                  className="text-center text-lg font-semibold border-2"
                />
                <p className="text-xs text-muted-foreground">
                  La mayoría de los ciclos duran entre 21 y 35 días
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="irregular"
                  checked={isIrregular}
                  onCheckedChange={(checked) => setIsIrregular(checked as boolean)}
                />
                <label
                  htmlFor="irregular"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Mi ciclo es irregular
                </label>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading || !name}
              className="w-full bg-gradient-primary hover:opacity-90 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
              <Save className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
