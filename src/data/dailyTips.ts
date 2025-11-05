import { CyclePhase } from '@/lib/cycleCalculations';

export interface DailyTip {
  text: string;
  icon: string;
}

export const dailyTips: Record<CyclePhase, DailyTip[]> = {
  menstruation: [
    {
      text: "Tu cuerpo está renovándose. Descansa y escucha sus necesidades.",
      icon: "🌙"
    },
    {
      text: "El hierro es importante ahora. Incluye espinacas, lentejas o carne roja.",
      icon: "🥬"
    },
    {
      text: "Ejercicio suave como yoga restaurativo puede aliviar cólicos.",
      icon: "🧘‍♀️"
    },
    {
      text: "Mantente hidratada y considera infusiones de jengibre para el malestar.",
      icon: "🫖"
    },
    {
      text: "Es normal sentirte más introspectiva. Honra ese espacio interior.",
      icon: "💜"
    }
  ],
  follicular: [
    {
      text: "Tu energía está aumentando. Es un buen momento para nuevos proyectos.",
      icon: "✨"
    },
    {
      text: "Aprovecha para hacer ejercicio más intenso, tu cuerpo responderá bien.",
      icon: "💪"
    },
    {
      text: "Tu creatividad está en su punto alto. Explora nuevas ideas.",
      icon: "🎨"
    },
    {
      text: "Tu metabolismo está acelerándose. Incluye proteínas de calidad en cada comida.",
      icon: "🥗"
    },
    {
      text: "Es un buen momento para tomar decisiones importantes y planificar.",
      icon: "📝"
    }
  ],
  ovulation: [
    {
      text: "Estás en tu pico de energía y sociabilidad. Conéctate con otros.",
      icon: "🌟"
    },
    {
      text: "Tu comunicación es más clara. Buen momento para conversaciones importantes.",
      icon: "💬"
    },
    {
      text: "Incluye antioxidantes: bayas, té verde, vegetales de hoja verde.",
      icon: "🫐"
    },
    {
      text: "Tu confianza está en su máximo. Aprovecha para presentaciones o entrevistas.",
      icon: "🎯"
    },
    {
      text: "Escucha a tu cuerpo. Algunos días puedes sentir más sensibilidad.",
      icon: "🌸"
    }
  ],
  luteal: [
    {
      text: "Tu energía puede disminuir. Intenta una caminata ligera hoy.",
      icon: "🚶‍♀️"
    },
    {
      text: "Los carbohidratos complejos pueden ayudar con el estado de ánimo.",
      icon: "🍠"
    },
    {
      text: "Prioriza el autocuidado. Un baño tibio o meditación pueden ayudar.",
      icon: "🛀"
    },
    {
      text: "Reduce la cafeína si sientes ansiedad o insomnio.",
      icon: "☕"
    },
    {
      text: "Es normal sentir cambios de humor. Sé compasiva contigo misma.",
      icon: "💝"
    },
    {
      text: "Magnesio puede ayudar con hinchazón y calambres. Prueba nueces o semillas.",
      icon: "🌰"
    }
  ],
  irregular: [
    {
      text: "Tu cuerpo es único. Escucha sus señales y sé amable contigo misma.",
      icon: "🌺"
    },
    {
      text: "Mantén una rutina de sueño regular para apoyar el equilibrio hormonal.",
      icon: "😴"
    },
    {
      text: "El manejo del estrés es clave. Prueba respiración profunda o mindfulness.",
      icon: "🧘"
    },
    {
      text: "Los ciclos irregulares son comunes en la perimenopausia. No estás sola.",
      icon: "🤝"
    },
    {
      text: "Considera consultar con un especialista si tienes dudas sobre tus síntomas.",
      icon: "👩‍⚕️"
    },
    {
      text: "Alimentos ricos en omega-3 pueden ayudar a regular hormonas naturalmente.",
      icon: "🐟"
    }
  ]
};

export function getDailyTip(phase: CyclePhase): DailyTip {
  const tips = dailyTips[phase];
  const randomIndex = Math.floor(Math.random() * tips.length);
  return tips[randomIndex];
}