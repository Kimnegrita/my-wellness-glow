import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Heart, Pill, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Resources = () => {
  const navigate = useNavigate();

  const perimenopauseArticles = [
    {
      title: "¿Qué es la Perimenopausia?",
      description: "Comprende la fase de transición antes de la menopausia y sus características principales.",
      content: "La perimenopausia es el período de transición que precede a la menopausia. Puede comenzar varios años antes de que cese la menstruación, típicamente entre los 40 y 44 años, aunque puede empezar antes. Durante esta fase, los niveles hormonales fluctúan de manera irregular, causando diversos síntomas.",
      icon: BookOpen,
    },
    {
      title: "Síntomas Comunes",
      description: "Identifica los signos más frecuentes de la perimenopausia.",
      content: "Los síntomas incluyen: ciclos menstruales irregulares, sofocos, sudores nocturnos, problemas de sueño, cambios de humor, sequedad vaginal, disminución de la libido, dificultad para concentrarse y cambios en el peso. La intensidad varía en cada mujer.",
      icon: Activity,
    },
    {
      title: "Duración y Etapas",
      description: "Conoce cuánto puede durar esta fase de transición.",
      content: "La perimenopausia puede durar desde unos meses hasta 10 años, con una duración promedio de 4 años. Termina oficialmente cuando una mujer no ha tenido menstruación durante 12 meses consecutivos, momento en el que se considera que ha llegado a la menopausia.",
      icon: Heart,
    },
  ];

  const menopauseArticles = [
    {
      title: "Entendiendo la Menopausia",
      description: "Todo lo que necesitas saber sobre esta etapa natural de la vida.",
      content: "La menopausia es el cese permanente de la menstruación. Se confirma después de 12 meses consecutivos sin período menstrual. La edad promedio es alrededor de los 51 años, aunque puede ocurrir antes o después. Es una fase natural y no una enfermedad.",
      icon: BookOpen,
    },
    {
      title: "Cambios Hormonales",
      description: "Cómo afectan las hormonas a tu cuerpo durante la menopausia.",
      content: "Durante la menopausia, los ovarios producen menos estrógeno y progesterona. Esta disminución hormonal afecta a múltiples sistemas del cuerpo, incluyendo el sistema cardiovascular, óseo, metabólico y nervioso. Entender estos cambios ayuda a manejar mejor los síntomas.",
      icon: Activity,
    },
    {
      title: "Salud Ósea",
      description: "La importancia del cuidado de los huesos en la menopausia.",
      content: "La disminución de estrógeno aumenta el riesgo de osteoporosis. Es crucial consumir suficiente calcio (1200mg/día) y vitamina D, realizar ejercicio de resistencia, evitar el tabaco y el exceso de alcohol, y consultar sobre densitometría ósea.",
      icon: Heart,
    },
  ];

  const symptomsArticles = [
    {
      title: "Sofocos y Sudores Nocturnos",
      description: "Manejo de los síntomas vasomotores más comunes.",
      content: "Los sofocos afectan al 75% de las mujeres. Estrategias de manejo: vestirse en capas, mantener el ambiente fresco, evitar desencadenantes (alcohol, cafeína, comidas picantes), técnicas de respiración profunda, y considerar terapias hormonales si son severos.",
      icon: Activity,
    },
    {
      title: "Cambios de Humor y Ansiedad",
      description: "Comprendiendo el impacto emocional de los cambios hormonales.",
      content: "Las fluctuaciones hormonales pueden causar irritabilidad, ansiedad y depresión. El ejercicio regular, técnicas de relajación, mantener conexiones sociales, dormir bien y buscar apoyo profesional cuando sea necesario son estrategias importantes.",
      icon: Heart,
    },
    {
      title: "Problemas de Sueño",
      description: "Estrategias para mejorar la calidad del sueño.",
      content: "Mantén un horario regular de sueño, crea un ambiente fresco y oscuro, evita pantallas antes de dormir, limita la cafeína por la tarde, practica técnicas de relajación y considera la melatonina bajo supervisión médica.",
      icon: BookOpen,
    },
  ];

  const treatmentsArticles = [
    {
      title: "Terapia Hormonal",
      description: "Opciones de tratamiento hormonal y sus consideraciones.",
      content: "La terapia hormonal puede aliviar síntomas severos. Incluye estrógeno solo o combinado con progesterona. Es más efectiva cuando se inicia cerca del inicio de la menopausia. Debe ser personalizada y supervisada médicamente, evaluando riesgos y beneficios individuales.",
      icon: Pill,
    },
    {
      title: "Tratamientos No Hormonales",
      description: "Alternativas efectivas sin hormonas.",
      content: "Opciones incluyen: antidepresivos (ISRS/IRSN) para sofocos, gabapentina, fitoestrógenos, lubricantes vaginales, terapia cognitivo-conductual, acupuntura, y suplementos como cohosh negro. Consulta siempre con un profesional antes de iniciar cualquier tratamiento.",
      icon: Pill,
    },
    {
      title: "Cambios en el Estilo de Vida",
      description: "Modificaciones diarias que marcan la diferencia.",
      content: "Dieta balanceada rica en calcio y vitamina D, ejercicio regular (150 min/semana), mantener peso saludable, no fumar, limitar alcohol, técnicas de manejo del estrés (yoga, meditación), y mantener vida social activa son fundamentales.",
      icon: Heart,
    },
  ];

  const renderArticles = (articles: typeof perimenopauseArticles) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => {
        const Icon = article.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">{article.title}</CardTitle>
              <CardDescription>{article.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {article.content}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Recursos Educativos
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Información completa y confiable sobre perimenopausia, menopausia, síntomas y tratamientos
            para ayudarte a navegar esta etapa con conocimiento y confianza.
          </p>
        </div>

        <Tabs defaultValue="perimenopausia" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="perimenopausia">Perimenopausia</TabsTrigger>
            <TabsTrigger value="menopausia">Menopausia</TabsTrigger>
            <TabsTrigger value="sintomas">Síntomas</TabsTrigger>
            <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
          </TabsList>

          <TabsContent value="perimenopausia" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Perimenopausia</h2>
              <p className="text-muted-foreground">
                La fase de transición hacia la menopausia y todo lo que necesitas saber.
              </p>
            </div>
            {renderArticles(perimenopauseArticles)}
          </TabsContent>

          <TabsContent value="menopausia" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Menopausia</h2>
              <p className="text-muted-foreground">
                Comprende esta etapa natural y cómo cuidar tu salud.
              </p>
            </div>
            {renderArticles(menopauseArticles)}
          </TabsContent>

          <TabsContent value="sintomas" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Síntomas Comunes</h2>
              <p className="text-muted-foreground">
                Identifica y maneja los síntomas más frecuentes de forma efectiva.
              </p>
            </div>
            {renderArticles(symptomsArticles)}
          </TabsContent>

          <TabsContent value="tratamientos" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Opciones de Tratamiento</h2>
              <p className="text-muted-foreground">
                Explora las diferentes alternativas disponibles para aliviar los síntomas.
              </p>
            </div>
            {renderArticles(treatmentsArticles)}
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Nota Importante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta información tiene fines educativos y no reemplaza la consulta médica profesional.
              Cada mujer es única y los síntomas, así como los tratamientos apropiados, varían.
              Siempre consulta con tu profesional de la salud para obtener asesoramiento personalizado.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resources;