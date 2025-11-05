import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "¿Qué es My Wellness Glow y para quién está diseñada?",
    answer: "My Wellness Glow es una aplicación de seguimiento de salud diseñada específicamente para mujeres en perimenopausia y menopausia. Te ayuda a monitorear síntomas, estados de ánimo, y patrones de ciclo, proporcionando insights personalizados para navegar esta etapa de tu vida con confianza y bienestar."
  },
  {
    question: "¿Qué es la perimenopausia y cuándo comienza?",
    answer: "La perimenopausia es la transición hacia la menopausia que generalmente comienza entre los 40 y 50 años, aunque puede empezar antes. Durante esta etapa, los niveles hormonales fluctúan, causando cambios en el ciclo menstrual y diversos síntomas. Puede durar desde unos meses hasta varios años antes de la menopausia completa."
  },
  {
    question: "¿Cuáles son los síntomas más comunes de la menopausia?",
    answer: "Los síntomas más frecuentes incluyen sofocos, sudores nocturnos, cambios de humor, problemas de sueño, sequedad vaginal, niebla mental, fatiga, cambios en la libido, palpitaciones cardíacas y aumento de peso. Cada mujer experimenta la menopausia de manera única, y la intensidad de los síntomas varía considerablemente."
  },
  {
    question: "¿Cómo uso la app para seguir mis síntomas?",
    answer: "Utiliza el registro diario (Check-in) para anotar tu estado de ánimo, síntomas físicos y emocionales, y cualquier observación personal. La app analiza estos datos para identificar patrones, predecir cambios en tu ciclo y ofrecerte consejos personalizados. Cuanto más consistente seas con los registros, más precisos serán los insights."
  },
  {
    question: "¿Es segura mi información personal y de salud?",
    answer: "Sí, absolutamente. Toda tu información está protegida con encriptación de nivel bancario y se almacena de forma segura. Solo tú tienes acceso a tus datos personales. No compartimos, vendemos ni utilizamos tu información para ningún propósito más allá de proporcionarte la mejor experiencia en la app."
  },
  {
    question: "¿Puedo exportar mis datos para compartir con mi médico?",
    answer: "Sí, puedes acceder a tu historial completo en la sección de Historial, donde encontrarás todos tus registros organizados por fecha. Esta información puede ser muy útil para compartir con tu médico y obtener un diagnóstico o tratamiento más personalizado."
  },
  {
    question: "¿Qué cambios en el estilo de vida pueden ayudar durante la menopausia?",
    answer: "Una dieta equilibrada rica en calcio y vitamina D, ejercicio regular (especialmente entrenamiento de fuerza), técnicas de manejo del estrés como yoga o meditación, mantener un peso saludable, limitar la cafeína y el alcohol, y asegurar un sueño de calidad pueden ayudar significativamente a manejar los síntomas de la menopausia."
  },
  {
    question: "¿Cuándo debería consultar a un médico sobre mis síntomas?",
    answer: "Consulta a tu médico si los síntomas interfieren significativamente con tu calidad de vida, si experimentas sangrado irregular inusual, tienes síntomas depresivos graves, o si estás considerando terapia hormonal u otros tratamientos. La app complementa, pero no reemplaza, el consejo médico profesional."
  }
];

export const FAQSection = () => {
  return (
    <Card className="p-6 lg:p-8" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-primary/20">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Preguntas Frecuentes</h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left hover:text-primary transition-colors">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
};
