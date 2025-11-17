import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Apple, Dumbbell, Heart } from "lucide-react";
import { useState, useEffect } from "react";

const nutritionTipsPool = [
  "Incrementa el consumo de calcio para fortalecer tus huesos",
  "Incluye alimentos ricos en omega-3 como el salmón y las nueces",
  "Reduce el consumo de cafeína si experimentas sofocos",
  "Mantente hidratada bebiendo al menos 8 vasos de agua al día",
  "Consume más hierro durante la menstruación con vegetales verdes y carnes magras",
  "Incluye alimentos ricos en vitamina B6 como plátanos y aguacates",
  "Añade semillas de lino a tu dieta para equilibrar hormonas",
  "Consume más alimentos ricos en magnesio como almendras y espinacas",
  "Evita los azúcares refinados para estabilizar tus niveles de energía",
  "Incluye probióticos como yogur y kéfir para la salud digestiva",
];

const exerciseTipsPool = [
  "Practica yoga o pilates para mejorar flexibilidad y reducir estrés",
  "Realiza ejercicio cardiovascular moderado 30 minutos al día",
  "Incluye entrenamiento de fuerza 2-3 veces por semana",
  "Camina al aire libre para mejorar tu estado de ánimo",
  "Prueba ejercicios de bajo impacto como natación durante la menstruación",
  "Realiza estiramientos diarios para reducir calambres y tensión muscular",
  "Practica ejercicios de respiración profunda durante 10 minutos al día",
  "Haz ejercicios de Kegel para fortalecer el suelo pélvico",
  "Incluye baile o zumba para combinar cardio con diversión",
  "Practica tai chi para mejorar equilibrio y reducir estrés",
];

const selfCareTipsPool = [
  "Dedica 10 minutos diarios a la meditación o respiración profunda",
  "Mantén una rutina de sueño regular, durmiendo 7-8 horas",
  "Practica técnicas de relajación como baños tibios",
  "Conecta con amigas y mantén relaciones sociales saludables",
  "Usa compresas calientes en el abdomen para aliviar cólicos",
  "Escribe un diario para procesar emociones y reducir el estrés",
  "Dedica tiempo a hobbies que disfrutes y te relajen",
  "Establece límites saludables y aprende a decir no cuando sea necesario",
  "Practica gratitud diaria anotando 3 cosas positivas cada día",
  "Date masajes con aceites esenciales para relajarte",
];

const getRandomTips = (pool: string[], count: number) => {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const WellnessTips = () => {
  const [nutritionTips, setNutritionTips] = useState<string[]>([]);
  const [exerciseTips, setExerciseTips] = useState<string[]>([]);
  const [selfCareTips, setSelfCareTips] = useState<string[]>([]);

  useEffect(() => {
    // Update tips on component mount (cada inicio de sesión)
    setNutritionTips(getRandomTips(nutritionTipsPool, 4));
    setExerciseTips(getRandomTips(exerciseTipsPool, 4));
    setSelfCareTips(getRandomTips(selfCareTipsPool, 4));
  }, []);

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
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="exercise" className="mt-6 space-y-3">
          {exerciseTips.map((tip, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="selfcare" className="mt-6 space-y-3">
          {selfCareTips.map((tip, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
