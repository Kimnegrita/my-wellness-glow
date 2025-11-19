import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const faqsByLanguage = {
  es: [
    {
      question: "¿Qué es My Wellness Glow y para quién está diseñada?",
      answer:
        "My Wellness Glow es una aplicación de seguimiento de salud diseñada específicamente para mujeres en perimenopausia y menopausia. Te ayuda a monitorear síntomas, estados de ánimo y patrones de ciclo, proporcionando insights personalizados para navegar esta etapa de tu vida con confianza y bienestar.",
    },
    {
      question: "¿Qué es la perimenopausia y cuándo comienza?",
      answer:
        "La perimenopausia es la transición hacia la menopausia que generalmente comienza entre los 40 y 50 años, aunque puede empezar antes. Durante esta etapa, los niveles hormonales fluctúan, causando cambios en el ciclo menstrual y diversos síntomas. Puede durar desde unos meses hasta varios años antes de la menopausia completa.",
    },
    {
      question: "¿Cuáles son los síntomas más comunes de la menopausia?",
      answer:
        "Los síntomas más frecuentes incluyen sofocos, sudores nocturnos, cambios de humor, problemas de sueño, sequedad vaginal, niebla mental, fatiga, cambios en la libido, palpitaciones cardíacas y aumento de peso. Cada mujer experimenta la menopausia de manera única, y la intensidad de los síntomas varía considerablemente.",
    },
    {
      question: "¿Cómo uso la app para seguir mis síntomas?",
      answer:
        "Utiliza el registro diario (Check-in) para anotar tu estado de ánimo, síntomas físicos y emocionales, y cualquier observación personal. La app analiza estos datos para identificar patrones, predecir cambios en tu ciclo y ofrecerte consejos personalizados.",
    },
  ],
  pt: [
    {
      question: "O que é a My Wellness Glow e para quem é?",
      answer:
        "A My Wellness Glow é uma aplicação de bem‑estar pensada para mulheres em perimenopausa e menopausa. Ajuda a registar sintomas, estados de espírito e padrões do ciclo, oferecendo insights personalizados para viver esta fase com mais confiança e bem‑estar.",
    },
    {
      question: "O que é a perimenopausa e quando começa?",
      answer:
        "A perimenopausa é a fase de transição que antecede a menopausa. Costuma começar entre os 40 e os 50 anos, mas pode surgir mais cedo. Nesta etapa, as hormonas variam bastante, o que provoca alterações no ciclo menstrual e vários sintomas físicos e emocionais.",
    },
    {
      question: "Quais são os sintomas mais comuns da menopausa?",
      answer:
        "Os sintomas mais frequentes incluem afrontamentos, suores noturnos, alterações de humor, dificuldades de sono, secura vaginal, cansaço, alterações da libido, palpitações e aumento de peso. Cada mulher vive a menopausa de forma única e a intensidade dos sintomas varia bastante.",
    },
    {
      question: "Como utilizo a app para acompanhar os meus sintomas?",
      answer:
        "Use o registo diário (Check‑in) para anotar o seu estado de espírito, sintomas físicos e emocionais e qualquer observação importante. A aplicação analisa estes dados para identificar padrões, antecipar mudanças no ciclo e sugerir estratégias personalizadas de autocuidado.",
    },
  ],
  en: [
    {
      question: "What is My Wellness Glow and who is it for?",
      answer:
        "My Wellness Glow is a health‑tracking app designed for women in perimenopause and menopause. It helps you track symptoms, moods and cycle patterns, giving you personalized insights to navigate this stage of life with more confidence and wellbeing.",
    },
    {
      question: "What is perimenopause and when does it start?",
      answer:
        "Perimenopause is the transition toward menopause, usually starting in your 40s or 50s, though it can begin earlier. Hormone levels fluctuate, which leads to changes in your menstrual cycle and a variety of symptoms. It can last from a few months to several years.",
    },
    {
      question: "What are the most common menopause symptoms?",
      answer:
        "The most common symptoms include hot flashes, night sweats, mood changes, sleep problems, vaginal dryness, brain fog, fatigue, changes in libido, heart palpitations and weight gain. Every woman experiences menopause differently and symptom intensity can vary a lot.",
    },
    {
      question: "How do I use the app to track my symptoms?",
      answer:
        "Use the daily check‑in to record your mood, physical and emotional symptoms, and any personal notes. The app analyzes these entries to find patterns, anticipate cycle changes and offer personalized self‑care suggestions.",
    },
  ],
} as const;

export const FAQSection = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || "es") as "es" | "pt" | "en";
  const faqs = faqsByLanguage[currentLang] ?? faqsByLanguage.es;

  const titleByLanguage: Record<string, string> = {
    es: "Preguntas Frecuentes",
    pt: "Perguntas Frequentes",
    en: "Frequently Asked Questions",
  };

  return (
    <Card className="p-6 lg:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-primary/20">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {titleByLanguage[currentLang] ?? titleByLanguage.es}
        </h2>
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
