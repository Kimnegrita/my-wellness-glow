import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Heart, Activity, ExternalLink, Video, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from 'react-i18next';

const Resources = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const educationalContent = [
    {
      category: "Entendiendo tu Ciclo",
      icon: Heart,
      articles: [
        {
          title: "Fases del Ciclo Menstrual",
          description: "Comprende las cuatro fases principales y sus características",
          content: "El ciclo menstrual tiene cuatro fases: menstrual (días 1-5), folicular (días 1-13), ovulación (día 14), y lútea (días 15-28). Cada fase tiene características hormonales únicas que afectan tu energía, estado de ánimo y síntomas físicos.",
        },
        {
          title: "Hormonas y tu Cuerpo",
          description: "Cómo el estrógeno y la progesterona afectan tu bienestar",
          content: "El estrógeno aumenta durante la fase folicular, mejorando el estado de ánimo y la energía. La progesterona domina la fase lútea, pudiendo causar síntomas como hinchazón y cambios de humor. Comprender estas fluctuaciones te ayuda a anticipar y manejar los síntomas.",
        },
        {
          title: "Ciclos Irregulares",
          description: "Qué es normal y cuándo consultar a un médico",
          content: "Los ciclos pueden variar de 21 a 35 días. Es normal cierta irregularidad, especialmente en adolescentes y mujeres en perimenopausia. Consulta a un médico si: períodos muy abundantes, dolor severo, sangrado entre períodos, o cambios drásticos en el patrón.",
        }
      ]
    },
    {
      category: "Salud y Bienestar",
      icon: Activity,
      articles: [
        {
          title: "Nutrición para cada Fase",
          description: "Alimentación adaptada a tu ciclo hormonal",
          content: "Fase menstrual: alimentos ricos en hierro. Fase folicular: proteínas magras y vegetales verdes. Ovulación: antioxidantes y omega-3. Fase lútea: carbohidratos complejos y magnesio para reducir antojos y mejorar el estado de ánimo.",
        },
        {
          title: "Ejercicio según tu Ciclo",
          description: "Optimiza tu rutina de ejercicio",
          content: "Fase folicular y ovulación: ejercicio intenso (HIIT, pesas). Fase lútea: moderado (yoga, pilates, caminatas). Menstruación: suave (estiramientos, yoga restaurativo). Escucha a tu cuerpo y ajusta la intensidad.",
        },
        {
          title: "Manejo del Estrés",
          description: "Técnicas para equilibrar mente y cuerpo",
          content: "Meditación diaria de 10 minutos, respiración profunda, journaling, ejercicio regular, sueño de calidad (7-8 horas), conexiones sociales, y establecer límites saludables. El estrés crónico puede alterar tu ciclo.",
        }
      ]
    },
    {
      category: "Síntomas Comunes",
      icon: Lightbulb,
      articles: [
        {
          title: "Cólicos y Dolor Menstrual",
          description: "Estrategias efectivas para el alivio",
          content: "Calor local (bolsa de agua caliente), ejercicio suave, masaje abdominal, antiinflamatorios (ibuprofeno), hidratación, y evitar sal y cafeína. Si el dolor es severo o interfiere con tu vida diaria, consulta a un médico.",
        },
        {
          title: "Síndrome Premenstrual (SPM)",
          description: "Identificación y manejo de síntomas",
          content: "El SPM incluye cambios de humor, hinchazón, fatiga y antojos. Manejo: ejercicio regular, reducir cafeína y azúcar, aumentar ingesta de calcio y vitamina B6, dormir bien, y manejar el estrés. Los síntomas suelen mejorar al comenzar la menstruación.",
        },
        {
          title: "Cambios de Humor",
          description: "Comprendiendo las fluctuaciones emocionales",
          content: "Las hormonas afectan neurotransmisores como la serotonina. Es normal sentir cambios emocionales. Ayuda: rutina de sueño, ejercicio, dieta equilibrada, mindfulness, y apoyo social. Si los síntomas son severos, considera hablar con un profesional de salud mental.",
        }
      ]
    }
  ];

  const externalResources = [
    {
      title: "Mayo Clinic - Salud Menstrual",
      url: "https://www.mayoclinic.org/es/healthy-lifestyle/womens-health",
      description: "Guías médicas confiables sobre salud femenina",
      icon: ExternalLink,
    },
    {
      title: "OMS - Salud Sexual y Reproductiva",
      url: "https://www.who.int/es/health-topics/sexual-and-reproductive-health",
      description: "Recursos oficiales de la Organización Mundial de la Salud",
      icon: ExternalLink,
    },
    {
      title: "Planned Parenthood - Educación Sexual",
      url: "https://www.plannedparenthood.org/es",
      description: "Información sobre ciclo menstrual y salud reproductiva",
      icon: ExternalLink,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Centro de Recursos
            </h1>
            <p className="text-muted-foreground">
              Aprende sobre tu ciclo menstrual y salud integral
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>

        {/* Educational Content */}
        <div className="space-y-6 mb-8">
          {educationalContent.map((section, idx) => (
            <Card key={idx} className="overflow-hidden border-2 hover:shadow-lg transition-all">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardTitle className="flex items-center gap-3">
                  <section.icon className="h-6 w-6 text-primary" />
                  {section.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {section.articles.map((article, articleIdx) => (
                    <AccordionItem key={articleIdx} value={`item-${idx}-${articleIdx}`}>
                      <AccordionTrigger className="text-left hover:text-primary">
                        <div>
                          <div className="font-semibold">{article.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {article.description}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-foreground leading-relaxed pl-4 border-l-2 border-primary/30">
                          {article.content}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* External Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Recursos Externos Confiables
            </CardTitle>
            <CardDescription>
              Enlaces a organizaciones de salud reconocidas internacionalmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {externalResources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-3 p-4 rounded-lg border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <resource.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {resource.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-6 bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Nota importante:</strong> Esta información es educativa y no reemplaza el consejo médico profesional. 
              Siempre consulta con tu médico para diagnósticos y tratamientos personalizados.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resources;
