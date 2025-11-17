import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Heart, Pill, Activity, ExternalLink, Video, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";

const Resources = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const perimenopauseArticles = [
    {
      title: t('resources.perimenopauseArticles.what.title'),
      description: t('resources.perimenopauseArticles.what.desc'),
      content: t('resources.perimenopauseArticles.what.content'),
      icon: BookOpen,
    },
    {
      title: t('resources.perimenopauseArticles.symptoms.title'),
      description: t('resources.perimenopauseArticles.symptoms.desc'),
      content: t('resources.perimenopauseArticles.symptoms.content'),
      icon: Activity,
    },
    {
      title: t('resources.perimenopauseArticles.duration.title'),
      description: t('resources.perimenopauseArticles.duration.desc'),
      content: t('resources.perimenopauseArticles.duration.content'),
      icon: Heart,
    },
  ];

  const allMenopauseArticles = [
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
    {
      title: "Salud Cardiovascular",
      description: "Protegiendo tu corazón durante la menopausia.",
      content: "El riesgo cardiovascular aumenta después de la menopausia. Mantén una dieta saludable baja en grasas saturadas, realiza ejercicio regular, controla la presión arterial y el colesterol, y mantén un peso saludable.",
      icon: Heart,
    },
  ];

  const allSymptomsArticles = [
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
    {
      title: "Cambios en la Piel y Cabello",
      description: "Cuidando tu piel durante los cambios hormonales.",
      content: "La disminución de estrógeno puede causar sequedad en la piel y adelgazamiento del cabello. Usa humectantes, protector solar, mantente hidratada, y considera suplementos de biotina y omega-3 bajo supervisión médica.",
      icon: Activity,
    },
  ];

  const allTreatmentsArticles = [
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
    {
      title: "Medicina Alternativa",
      description: "Terapias complementarias para síntomas menopáusicos.",
      content: "Acupuntura, yoga, meditación mindfulness, aromaterapia y suplementos herbales pueden ayudar. Siempre informa a tu médico sobre cualquier suplemento que tomes para evitar interacciones.",
      icon: Heart,
    },
  ];

  // Randomize articles on mount
  const [menopauseArticles, setMenopauseArticles] = useState<typeof allMenopauseArticles>([]);
  const [symptomsArticles, setSymptomsArticles] = useState<typeof allSymptomsArticles>([]);
  const [treatmentsArticles, setTreatmentsArticles] = useState<typeof allTreatmentsArticles>([]);

  useEffect(() => {
    const shuffleArray = <T,>(array: T[]) => [...array].sort(() => Math.random() - 0.5);
    
    setMenopauseArticles(shuffleArray(allMenopauseArticles).slice(0, 3));
    setSymptomsArticles(shuffleArray(allSymptomsArticles).slice(0, 3));
    setTreatmentsArticles(shuffleArray(allTreatmentsArticles).slice(0, 3));
  }, []);

  const externalResources = [
    {
      title: "Organizaciones y Sitios Web Oficiales",
      resources: [
        {
          name: "North American Menopause Society (NAMS)",
          url: "https://www.menopause.org",
          description: "Recursos completos sobre menopausia basados en evidencia científica",
          type: "web"
        },
        {
          name: "International Menopause Society",
          url: "https://www.imsociety.org",
          description: "Información global y guías clínicas sobre menopausia",
          type: "web"
        },
        {
          name: "Asociación Española para el Estudio de la Menopausia (AEEM)",
          url: "https://www.aeem.es",
          description: "Recursos en español sobre menopausia y climaterio",
          type: "web"
        },
        {
          name: "Office on Women's Health",
          url: "https://www.womenshealth.gov/menopause",
          description: "Información del gobierno de EE.UU. sobre menopausia",
          type: "web"
        }
      ]
    },
    {
      title: "Videos Educativos",
      resources: [
        {
          name: "Menopausia: Todo lo que necesitas saber - TED Talk",
          url: "https://www.youtube.com/results?search_query=menopause+ted+talk",
          description: "Charlas TED sobre menopausia y salud de la mujer",
          type: "video"
        },
        {
          name: "Johns Hopkins Medicine - Menopause Explained",
          url: "https://www.youtube.com/c/JohnsHopkinsMedicine",
          description: "Videos educativos de expertos médicos sobre menopausia",
          type: "video"
        }
      ]
    },
    {
      title: "Aplicaciones y Herramientas",
      resources: [
        {
          name: "Menopause Symptom Tracker",
          url: "https://www.menopause.org/for-women/menopause-symptom-tracker",
          description: "Herramienta gratuita de NAMS para seguir síntomas",
          type: "app"
        },
        {
          name: "Headspace - Meditación y Mindfulness",
          url: "https://www.headspace.com",
          description: "App de meditación con programas específicos para manejo del estrés",
          type: "app"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="max-w-7xl mx-auto space-y-6 py-8">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>

        <Card className="shadow-elegant border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              {t('resources.title')}
            </CardTitle>
            <CardDescription>{t('resources.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="perimenopause" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="perimenopause">{t('resources.tabs.perimenopause')}</TabsTrigger>
                <TabsTrigger value="menopause">{t('resources.tabs.menopause')}</TabsTrigger>
                <TabsTrigger value="symptoms">{t('resources.tabs.symptoms')}</TabsTrigger>
                <TabsTrigger value="treatments">{t('resources.tabs.treatments')}</TabsTrigger>
              </TabsList>

              <TabsContent value="perimenopause" className="mt-6 space-y-4 animate-fade-in">
                <Accordion type="single" collapsible className="w-full">
                  {perimenopauseArticles.map((article, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="hover:text-primary">
                        <div className="flex items-center gap-3">
                          <article.icon className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-semibold">{article.title}</div>
                            <div className="text-sm text-muted-foreground">{article.description}</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-8 pr-4 py-4 text-foreground leading-relaxed">
                          {article.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="menopause" className="mt-6 space-y-4 animate-fade-in">
                <Accordion type="single" collapsible className="w-full">
                  {menopauseArticles.map((article, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="hover:text-primary">
                        <div className="flex items-center gap-3">
                          <article.icon className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-semibold">{article.title}</div>
                            <div className="text-sm text-muted-foreground">{article.description}</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-8 pr-4 py-4 text-foreground leading-relaxed">
                          {article.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="symptoms" className="mt-6 space-y-4 animate-fade-in">
                <Accordion type="single" collapsible className="w-full">
                  {symptomsArticles.map((article, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="hover:text-primary">
                        <div className="flex items-center gap-3">
                          <article.icon className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-semibold">{article.title}</div>
                            <div className="text-sm text-muted-foreground">{article.description}</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-8 pr-4 py-4 text-foreground leading-relaxed">
                          {article.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="treatments" className="mt-6 space-y-4 animate-fade-in">
                <Accordion type="single" collapsible className="w-full">
                  {treatmentsArticles.map((article, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="hover:text-primary">
                        <div className="flex items-center gap-3">
                          <article.icon className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-semibold">{article.title}</div>
                            <div className="text-sm text-muted-foreground">{article.description}</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-8 pr-4 py-4 text-foreground leading-relaxed">
                          {article.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* External Resources */}
        <Card className="shadow-elegant border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-6 w-6 text-accent" />
              {t('resources.externalResources.title')}
            </CardTitle>
            <CardDescription>{t('resources.externalResources.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {externalResources.map((category, catIndex) => (
              <div key={catIndex} className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {category.title === "Videos Educativos" && <Video className="h-5 w-5 text-accent" />}
                  {category.title === "Aplicaciones y Herramientas" && <FileText className="h-5 w-5 text-accent" />}
                  {category.title === "Organizaciones y Sitios Web Oficiales" && <BookOpen className="h-5 w-5 text-accent" />}
                  {category.title}
                </h3>
                <div className="grid gap-3">
                  {category.resources.map((resource, resIndex) => (
                    <a
                      key={resIndex}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {resource.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resources;
