import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Heart, Pill, Activity, ExternalLink, Video, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from 'react-i18next';

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

  const externalResources = [
    {
      title: "Organizaciones y Sitios Web Oficiales",
      resources: [
        {
          name: "Planned Parenthood - Ciclo Menstrual",
          url: "https://www.plannedparenthood.org/es/temas-de-salud/salud-y-bienestar/ciclo-menstrual",
          description: "Información completa sobre el ciclo menstrual y salud reproductiva",
          type: "web"
        },
        {
          name: "Clue - Educación sobre el Ciclo",
          url: "https://helloclue.com/es/articulos",
          description: "Artículos basados en ciencia sobre menstruación, fertilidad y salud hormonal",
          type: "web"
        },
        {
          name: "Organización Mundial de la Salud - Salud Sexual",
          url: "https://www.who.int/es/health-topics/sexual-health",
          description: "Recursos oficiales de la OMS sobre salud sexual y reproductiva",
          type: "web"
        },
        {
          name: "Office on Women's Health - Menstruación",
          url: "https://www.womenshealth.gov/menstrual-cycle",
          description: "Guía completa del gobierno de EE.UU. sobre el ciclo menstrual",
          type: "web"
        },
        {
          name: "NHS - Períodos y Fertilidad",
          url: "https://www.nhs.uk/conditions/periods/",
          description: "Información del sistema de salud británico sobre menstruación",
          type: "web"
        }
      ]
    },
    {
      title: "Videos Educativos",
      resources: [
        {
          name: "TED-Ed - El Ciclo Menstrual Explicado",
          url: "https://www.youtube.com/results?search_query=menstrual+cycle+explained+ted+ed",
          description: "Videos educativos animados sobre cómo funciona el ciclo menstrual",
          type: "video"
        },
        {
          name: "Crash Course - Sistema Reproductivo",
          url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtOAKed_MxxWBNaPno5h3Zs8",
          description: "Serie educativa sobre anatomía y fisiología reproductiva",
          type: "video"
        },
        {
          name: "Khan Academy - Hormonas y Ciclo Menstrual",
          url: "https://www.khanacademy.org/science/health-and-medicine/reproductive-system-diseases",
          description: "Lecciones en video sobre el sistema reproductivo y hormonas",
          type: "video"
        },
        {
          name: "Clue - Canal de YouTube",
          url: "https://www.youtube.com/@clueapp",
          description: "Videos sobre menstruación, fertilidad y salud hormonal",
          type: "video"
        }
      ]
    },
    {
      title: "Guías y Documentos",
      resources: [
        {
          name: "ACOG - Guías sobre Menstruación",
          url: "https://www.acog.org/womens-health/faqs/menstruation",
          description: "Guías del Colegio Americano de Obstetras y Ginecólogos",
          type: "document"
        },
        {
          name: "Mayo Clinic - Ciclo Menstrual",
          url: "https://www.mayoclinic.org/es/healthy-lifestyle/womens-health/in-depth/menstrual-cycle/art-20047186",
          description: "Información médica detallada sobre el ciclo menstrual",
          type: "document"
        },
        {
          name: "WebMD - Salud Menstrual",
          url: "https://www.webmd.com/women/guide/normal-menstruation",
          description: "Guía completa sobre menstruación normal y anormalidades",
          type: "document"
        },
        {
          name: "Harvard Health - Problemas Menstruales",
          url: "https://www.health.harvard.edu/topics/womens-health",
          description: "Recursos de la Escuela de Medicina de Harvard",
          type: "document"
        }
      ]
    },
    {
      title: "Apps y Herramientas",
      resources: [
        {
          name: "Clue",
          url: "https://helloclue.com/",
          description: "App de seguimiento del ciclo basada en ciencia",
          type: "web"
        },
        {
          name: "Flo Health",
          url: "https://flo.health/",
          description: "Calendario menstrual y seguimiento de ovulación",
          type: "web"
        },
        {
          name: "Period Tracker by GP Apps",
          url: "https://www.period-tracker.com/",
          description: "Aplicación simple para rastrear tu período",
          type: "web"
        },
        {
          name: "MyFLO",
          url: "https://www.floliving.com/app/",
          description: "App para optimizar salud hormonal según fase del ciclo",
          type: "web"
        }
      ]
    },
    {
      title: "Comunidades y Apoyo",
      resources: [
        {
          name: "Reddit - r/Periods",
          url: "https://www.reddit.com/r/Periods/",
          description: "Comunidad para discutir sobre menstruación y salud menstrual",
          type: "web"
        },
        {
          name: "Reddit - r/WomensHealth",
          url: "https://www.reddit.com/r/WomensHealth/",
          description: "Foro para discutir temas de salud femenina",
          type: "web"
        },
        {
          name: "HealthUnlocked - Period Problems",
          url: "https://healthunlocked.com/period-problems",
          description: "Comunidad de apoyo para problemas menstruales",
          type: "web"
        },
        {
          name: "Grupos de Facebook - Salud Menstrual",
          url: "https://www.facebook.com/search/groups/?q=menstrual%20health",
          description: "Grupos de apoyo en Facebook sobre salud menstrual",
          type: "web"
        }
      ]
    },
    {
      title: "Recursos en Español",
      resources: [
        {
          name: "Doctoralia - Ciclo Menstrual",
          url: "https://www.doctoralia.es/preguntas-respuestas/ciclo-menstrual",
          description: "Preguntas y respuestas sobre el ciclo menstrual en español",
          type: "web"
        },
        {
          name: "Cuidate Plus - Menstruación",
          url: "https://cuidateplus.marca.com/sexualidad/diccionario/menstruacion.html",
          description: "Información médica en español sobre menstruación",
          type: "web"
        },
        {
          name: "Sanitas - Salud de la Mujer",
          url: "https://www.sanitas.es/sanitas/seguros/es/particulares/biblioteca-de-salud/mujer/index.html",
          description: "Biblioteca de salud femenina de Sanitas",
          type: "web"
        },
        {
          name: "Medline Plus - Menstruación",
          url: "https://medlineplus.gov/spanish/menstruation.html",
          description: "Recursos del NIH en español sobre menstruación",
          type: "web"
        }
      ]
    }
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'document':
        return FileText;
      default:
        return ExternalLink;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.backToHome')}
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('resources.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {t('resources.description')}
          </p>
        </div>

        <Tabs defaultValue="recursos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="recursos">{t('resources.onlineResources')}</TabsTrigger>
            <TabsTrigger value="perimenopausia">{t('resources.perimenopause')}</TabsTrigger>
            <TabsTrigger value="menopausia">{t('resources.menopause')}</TabsTrigger>
            <TabsTrigger value="sintomas">{t('resources.symptoms')}</TabsTrigger>
            <TabsTrigger value="tratamientos">{t('resources.treatments')}</TabsTrigger>
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

          <TabsContent value="recursos" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">{t('resources.onlineResources')}</h2>
              <p className="text-muted-foreground">
                {t('resources.onlineResourcesDesc')}
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {externalResources.map((category, catIndex) => (
                <AccordionItem key={catIndex} value={`item-${catIndex}`} className="border rounded-lg px-6 bg-card">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    {category.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {category.resources.map((resource, resIndex) => {
                        const Icon = getResourceIcon(resource.type);
                        return (
                          <Card key={resIndex} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 mt-1">
                                  <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <h4 className="font-semibold text-base">{resource.name}</h4>
                                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                                  >
                                    {t('resources.visitResource')}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {t('resources.importantNote')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('resources.disclaimer')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resources;