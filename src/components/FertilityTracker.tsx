import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, TrendingUp } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

interface FertilityTrackerProps {
  ovulationDate?: Date;
  fertileWindowStart?: Date;
  fertileWindowEnd?: Date;
  isFertileWindow?: boolean;
}

export const FertilityTracker = ({
  ovulationDate,
  fertileWindowStart,
  fertileWindowEnd,
  isFertileWindow,
}: FertilityTrackerProps) => {
  if (!ovulationDate) return null;

  const today = new Date();
  const daysUntilOvulation = differenceInDays(ovulationDate, today);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Fertilidad y Ovulación</CardTitle>
          </div>
          {isFertileWindow && (
            <Badge variant="default" className="bg-primary">
              Ventana Fértil
            </Badge>
          )}
        </div>
        <CardDescription>
          Predicción basada en tu ciclo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ovulation Date */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Ovulación Estimada</p>
            </div>
            <p className="text-2xl font-bold">
              {format(ovulationDate, "d MMM", { locale: es })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {daysUntilOvulation > 0
                ? `En ${daysUntilOvulation} días`
                : daysUntilOvulation === 0
                ? "¡Hoy!"
                : `Hace ${Math.abs(daysUntilOvulation)} días`}
            </p>
          </div>

          {/* Fertile Window Start */}
          {fertileWindowStart && (
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium">Inicio Ventana Fértil</p>
              </div>
              <p className="text-2xl font-bold">
                {format(fertileWindowStart, "d MMM", { locale: es })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                5 días antes de ovulación
              </p>
            </div>
          )}

          {/* Fertile Window End */}
          {fertileWindowEnd && (
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium">Fin Ventana Fértil</p>
              </div>
              <p className="text-2xl font-bold">
                {format(fertileWindowEnd, "d MMM", { locale: es })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                1 día después de ovulación
              </p>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-foreground">
            <strong>💡 Nota:</strong> La ventana fértil es el período de mayor probabilidad de concepción, 
            que incluye los 5 días previos a la ovulación y el día de la ovulación. 
            Estos cálculos son estimaciones basadas en tu ciclo promedio.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
