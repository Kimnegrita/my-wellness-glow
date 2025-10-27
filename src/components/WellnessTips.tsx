import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Apple, Dumbbell, Heart } from "lucide-react";

const nutritionTips = [
  "Incrementa el consumo de calcio para fortalecer tus huesos",
  "Incluye alimentos ricos en omega-3 como el salmón y las nueces",
  "Reduce el consumo de cafeína si experimentas sofocos",
  "Mantente hidratada bebiendo al menos 8 vasos de agua al día"
];

const exerciseTips = [
  "Practica yoga o pilates para mejorar flexibilidad y reducir estrés",
  "Realiza ejercicio cardiovascular moderado 30 minutos al día",
  "Incluye entrenamiento de fuerza 2-3 veces por semana",
  "Camina al aire libre para mejorar tu estado de ánimo"
];

const selfCareTips = [
  "Dedica 10 minutos diarios a la meditación o respiración profunda",
  "Mantén una rutina de sueño regular, durmiendo 7-8 horas",
  "Practica técnicas de relajación como baños tibios",
  "Conecta con amigas y mantén relaciones sociales saludables"
];

export const WellnessTips = () => {
  return (
    <Card className="p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h2 className="text-2xl font-bold mb-6 text-foreground">Consejos de Bienestar</h2>
      
      <Tabs defaultValue="nutrition" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Apple className="h-4 w-4" />
            Nutrición
          </TabsTrigger>
          <TabsTrigger value="exercise" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Ejercicio
          </TabsTrigger>
          <TabsTrigger value="selfcare" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Autocuidado
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="nutrition" className="mt-6 space-y-3">
          {nutritionTips.map((tip, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="exercise" className="mt-6 space-y-3">
          {exerciseTips.map((tip, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="selfcare" className="mt-6 space-y-3">
          {selfCareTips.map((tip, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
