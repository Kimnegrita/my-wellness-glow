import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Detecting health anomalies for user:', user.id);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get logs from last 3 months for pattern analysis
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: recentLogs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', threeMonthsAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (!recentLogs || recentLogs.length < 7) {
      return new Response(
        JSON.stringify({ 
          anomalies: [],
          message: 'Necesitas al menos 7 días de registros para detectar anomalías.',
          health_status: 'insufficient_data'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Analyze period patterns
    const periodStarts = recentLogs.filter(log => log.period_started);
    const cycleLengths: number[] = [];
    
    for (let i = 0; i < periodStarts.length - 1; i++) {
      const date1 = new Date(periodStarts[i].log_date);
      const date2 = new Date(periodStarts[i + 1].log_date);
      const diffDays = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
      cycleLengths.push(diffDays);
    }

    // Analyze symptom patterns
    const allSymptoms = recentLogs.flatMap(log => log.symptoms || []);
    const symptomCounts: { [key: string]: number } = {};
    allSymptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });

    // Identify concerning symptoms
    const severeSymptoms = [
      'Sangrado Irregular', 'Flujo Abundante', 'Dolor Articular',
      'Sofocos', 'Sudores Nocturnos', 'Palpitaciones', 'Mareos'
    ];
    
    const concerningSymptoms = Object.entries(symptomCounts)
      .filter(([symptom, count]) => 
        severeSymptoms.includes(symptom) && count > 3
      )
      .map(([symptom, count]) => `${symptom} (${count} veces)`);

    // Analyze sentiment trends
    const sentimentScores = recentLogs
      .filter(log => log.sentiment_score !== null)
      .map(log => log.sentiment_score as number);

    const avgSentiment = sentimentScores.length > 0
      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
      : 0;

    const negativeSentimentDays = sentimentScores.filter(score => score < -0.3).length;

    // Build analysis context
    const context = `
Análisis de salud menstrual (últimos 3 meses):

CICLO MENSTRUAL:
- Número de ciclos registrados: ${cycleLengths.length}
- Duraciones de ciclos: ${cycleLengths.join(', ')} días
- Ciclo promedio actual: ${profile?.avg_cycle_length || 'No establecido'} días
- Ciclo irregular registrado: ${profile?.is_irregular ? 'Sí' : 'No'}

SÍNTOMAS PREOCUPANTES:
${concerningSymptoms.length > 0 ? concerningSymptoms.join('\n') : 'Ninguno'}

SÍNTOMAS MÁS FRECUENTES:
${Object.entries(symptomCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([s, c]) => `- ${s}: ${c} veces`)
  .join('\n')}

SALUD EMOCIONAL:
- Sentimiento promedio: ${avgSentiment.toFixed(2)} (rango -1 a 1)
- Días con sentimiento negativo: ${negativeSentimentDays} de ${sentimentScores.length}

REGISTROS TOTALES: ${recentLogs.length} días en últimos 3 meses
`;

    console.log('Health analysis context:', context);

    // Call AI for anomaly detection
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Eres una experta en salud menstrual. Analiza los datos para detectar anomalías que requieran atención médica. Devuelve SOLO un JSON válido:
{
  "anomalies": [
    {
      "type": "<cycle_irregularity|severe_symptoms|emotional_distress|bleeding_abnormal>",
      "severity": "<low|medium|high|critical>",
      "description": "<descripción en español>",
      "recommendation": "<recomendación específica>",
      "requires_medical_attention": <boolean>
    }
  ],
  "health_status": "<healthy|monitor|consult_doctor|urgent>",
  "overall_assessment": "<evaluación general en español>",
  "positive_patterns": ["<patrón positivo 1>", "<patrón positivo 2>"],
  "action_items": ["<acción 1>", "<acción 2>"]
}`
          },
          {
            role: 'user',
            content: `Analiza estos datos y detecta anomalías de salud:
${context}

IMPORTANTE:
- Identifica patrones que requieran atención médica
- Considera variabilidad normal vs. preocupante
- Sé conservadora: ante duda, recomienda consulta
- Menciona también patrones positivos para tranquilizar`
          }
        ],
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response from AI');
    }

    let analysis;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      
      // Fallback basic analysis
      const anomalies = [];
      
      // Check cycle irregularity
      if (cycleLengths.length > 1) {
        const stdDev = calculateStdDev(cycleLengths);
        if (stdDev > 7) {
          anomalies.push({
            type: 'cycle_irregularity',
            severity: 'medium',
            description: 'Variabilidad significativa en la duración de tus ciclos',
            recommendation: 'Consulta con un ginecólogo para evaluar posibles causas',
            requires_medical_attention: true
          });
        }
      }
      
      // Check concerning symptoms
      if (concerningSymptoms.length > 0) {
        anomalies.push({
          type: 'severe_symptoms',
          severity: 'high',
          description: `Síntomas preocupantes frecuentes: ${concerningSymptoms.join(', ')}`,
          recommendation: 'Es importante que consultes con un profesional de salud',
          requires_medical_attention: true
        });
      }
      
      // Check emotional health
      if (negativeSentimentDays > sentimentScores.length * 0.5) {
        anomalies.push({
          type: 'emotional_distress',
          severity: 'medium',
          description: 'Patrón persistente de bajo estado de ánimo',
          recommendation: 'Considera hablar con un profesional de salud mental',
          requires_medical_attention: true
        });
      }
      
      analysis = {
        anomalies,
        health_status: anomalies.some(a => a.severity === 'high' || a.severity === 'critical') 
          ? 'consult_doctor' 
          : anomalies.length > 0 ? 'monitor' : 'healthy',
        overall_assessment: anomalies.length > 0 
          ? 'Se detectaron algunos patrones que merecen atención. Por favor, revisa las recomendaciones.'
          : 'No se detectaron anomalías significativas. Continúa monitoreando tu salud.',
        positive_patterns: ['Registro consistente de síntomas'],
        action_items: anomalies.length > 0 
          ? ['Agendar cita médica', 'Continuar registrando síntomas']
          : ['Mantener registro regular']
      };
    }

    // Add data insights
    const response = {
      ...analysis,
      data_summary: {
        days_analyzed: recentLogs.length,
        cycles_analyzed: cycleLengths.length,
        most_common_symptoms: Object.entries(symptomCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([s]) => s),
        emotional_health_score: (avgSentiment + 1) / 2 * 100 // Convert to 0-100 scale
      }
    };

    console.log('Health anomaly detection completed');

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in detect-health-anomalies function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}
