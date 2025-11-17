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
  const [loading, setLoading] = useState(false);

  // Simplified - just ask for name if needed
  const [name, setName] = useState(profile?.name || '');

  const handleComplete = async () => {
    if (!name.trim()) {
      toast.error('Por favor, ingresa tu nombre');
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        name: name.trim(),
      });

      toast.success('¡Bienvenida! Tu información del ciclo se actualizará automáticamente cuando hagas tu primer registro ✨');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar');
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
            ¡Bienvenida!
          </CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Comienza tu viaje de bienestar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                ¿Cómo te llamas?
              </h3>
              <p className="text-sm text-muted-foreground">
                Personaliza tu experiencia
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tu nombre</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="text-center text-lg"
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Seguimiento automático del ciclo
              </p>
              <p className="text-xs text-muted-foreground">
                No te preocupes por configurar tu ciclo ahora. Cuando hagas tu primer registro diario 
                y marques el inicio de tu período, el sistema automáticamente guardará la fecha y 
                calculará la duración de tu ciclo basándose en tus registros futuros.
              </p>
            </div>

            <Button
              onClick={handleComplete}
              disabled={loading || !name.trim()}
              className="w-full bg-gradient-primary hover:opacity-90 h-12"
            >
              {loading ? 'Guardando...' : 'Comenzar mi viaje'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}