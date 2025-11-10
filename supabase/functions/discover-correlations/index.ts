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

    console.log('Discovering correlations for user:', user.id);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get comprehensive data from last 2 months
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', twoMonthsAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: true });

    if (!logs || logs.length < 14) {
      return new Response(
        JSON.stringify({ 
          correlations: [],
          message: 'Necesitas al menos 14 días de registros para descubrir correlaciones.',
          insights: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Calculate cycle phases for each day
    const logsWithPhase = logs.map(log => {
      let phase = 'unknown';
      if (profile?.last_period_date) {
        const logDate = new Date(log.log_date);
        const lastPeriod = new Date(profile.last_period_date);
        const daysSince = Math.floor((logDate.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
        const cycleDay = (daysSince % (profile.avg_cycle_length || 28)) + 1;
        
        if (cycleDay >= 1 && cycleDay <= 5) phase = 'menstruation';
        else if (cycleDay >= 6 && cycleDay <= 13) phase = 'follicular';
        else if (cycleDay >= 14 && cycleDay <= 16) phase = 'ovulation';
        else phase = 'luteal';
      }
      return { ...log, phase };
    });

    // Analyze symptom patterns by phase
    const symptomsByPhase: { [key: string]: { [key: string]: number } } = {
      menstruation: {},
      follicular: {},
      ovulation: {},
      luteal: {}
    };

    logsWithPhase.forEach(log => {
      if (log.phase !== 'unknown') {
        (log.symptoms || []).forEach((symptom: string) => {
          symptomsByPhase[log.phase][symptom] = (symptomsByPhase[log.phase][symptom] || 0) + 1;
        });
      }
    });

    // Analyze sentiment by phase
    const sentimentByPhase: { [key: string]: number[] } = {
      menstruation: [],
      follicular: [],
      ovulation: [],
      luteal: []
    };

    logsWithPhase.forEach(log => {
      if (log.phase !== 'unknown' && log.sentiment_score !== null) {
        sentimentByPhase[log.phase].push(log.sentiment_score);
      }
    });

    // Calculate averages
    const avgSentimentByPhase: { [key: string]: number } = {};
    Object.keys(sentimentByPhase).forEach(phase => {
      const scores = sentimentByPhase[phase];
      avgSentimentByPhase[phase] = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
    });

    // Identify symptom-sentiment correlations
    const symptomSentimentCorrelations: { [key: string]: number[] } = {};
    logsWithPhase.forEach(log => {
      if (log.sentiment_score !== null) {
        (log.symptoms || []).forEach((symptom: string) => {
          if (!symptomSentimentCorrelations[symptom]) {
            symptomSentimentCorrelations[symptom] = [];
          }
          symptomSentimentCorrelations[symptom].push(log.sentiment_score);
        });
      }
    });

    // Calculate average sentiment per symptom
    const symptomImpact: { [key: string]: number } = {};
    Object.entries(symptomSentimentCorrelations).forEach(([symptom, scores]) => {
      if (scores.length >= 3) { // Only consider symptoms with enough data
        symptomImpact[symptom] = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    });

    // Build analysis context
    const context = `
Análisis de correlaciones (últimos 2 meses):

DATOS DISPONIBLES:
- Total de registros: ${logs.length} días
- Registros con estado de ánimo: ${logsWithPhase.filter(l => l.sentiment_score !== null).length} días

SENTIMIENTO PROMEDIO POR FASE:
- Menstruación: ${avgSentimentByPhase.menstruation?.toFixed(2) || 'N/A'}
- Folicular: ${avgSentimentByPhase.follicular?.toFixed(2) || 'N/A'}
- Ovulación: ${avgSentimentByPhase.ovulation?.toFixed(2) || 'N/A'}
- Lútea: ${avgSentimentByPhase.luteal?.toFixed(2) || 'N/A'}

SÍNTOMAS MÁS FRECUENTES POR FASE:
Menstruación: ${Object.entries(symptomsByPhase.menstruation)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([s, c]) => `${s} (${c})`)
  .join(', ') || 'N/A'}

Folicular: ${Object.entries(symptomsByPhase.follicular)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([s, c]) => `${s} (${c})`)
  .join(', ') || 'N/A'}

Ovulación: ${Object.entries(symptomsByPhase.ovulation)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([s, c]) => `${s} (${c})`)
  .join(', ') || 'N/A'}

Lútea: ${Object.entries(symptomsByPhase.luteal)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([s, c]) => `${s} (${c})`)
  .join(', ') || 'N/A'}

IMPACTO DE SÍNTOMAS EN ESTADO DE ÁNIMO:
${Object.entries(symptomImpact)
  .sort((a, b) => a[1] - b[1])
  .slice(0, 5)
  .map(([s, score]) => `${s}: ${score.toFixed(2)}`)
  .join('\n')}
`;

    console.log('Correlation analysis context:', context);

    // Call AI for insights discovery
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
            content: `Eres una experta en análisis de datos de salud menstrual. Identifica correlaciones significativas y proporciona insights accionables. Devuelve SOLO un JSON válido:
{
  "correlations": [
    {
      "type": "<phase_symptom|symptom_mood|phase_mood>",
      "description": "<descripción del patrón en español>",
      "strength": "<strong|moderate|weak>",
      "actionable_insight": "<consejo práctico basado en este patrón>",
      "example": "<ejemplo específico con datos>"
    }
  ],
  "insights": [
    {
      "category": "<cycle|symptoms|mood|lifestyle>",
      "title": "<título breve>",
      "description": "<insight detallado en español>",
      "recommendation": "<recomendación específica>"
    }
  ],
  "key_discoveries": ["<descubrimiento 1>", "<descubrimiento 2>"],
  "personalized_tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`
          },
          {
            role: 'user',
            content: `Analiza estos datos y descubre correlaciones útiles:
${context}

IMPORTANTE:
- Identifica patrones claros y accionables
- Proporciona insights personalizados
- Sugiere cambios de estilo de vida específicos
- Enfócate en correlaciones que la usuaria puede usar para mejorar su bienestar`
          }
        ],
        temperature: 0.6,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI correlation analysis failed');
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
      
      // Fallback basic correlations
      const basicCorrelations = [];
      
      // Identify phase with worst mood
      const worstPhase = Object.entries(avgSentimentByPhase)
        .sort((a, b) => a[1] - b[1])[0];
      
      if (worstPhase && worstPhase[1] < -0.2) {
        basicCorrelations.push({
          type: 'phase_mood',
          description: `Tu estado de ánimo tiende a ser más bajo durante la fase ${worstPhase[0]}`,
          strength: 'moderate',
          actionable_insight: 'Planifica actividades de autocuidado durante esta fase',
          example: `Estado de ánimo promedio en ${worstPhase[0]}: ${worstPhase[1].toFixed(2)}`
        });
      }
      
      analysis = {
        correlations: basicCorrelations,
        insights: [
          {
            category: 'cycle',
            title: 'Patrones de tu ciclo',
            description: 'Estamos recopilando más datos para ofrecerte insights personalizados.',
            recommendation: 'Continúa registrando diariamente para descubrir tus patrones únicos.'
          }
        ],
        key_discoveries: ['Registro consistente detectado'],
        personalized_tips: [
          'Continúa registrando tus síntomas y emociones',
          'Presta atención a los patrones que emerjan',
          'Consulta esta sección regularmente para nuevos insights'
        ]
      };
    }

    // Add statistical data
    const response = {
      ...analysis,
      data_quality: {
        days_analyzed: logs.length,
        completeness: (logs.filter(l => l.symptoms && l.symptoms.length > 0).length / logs.length * 100).toFixed(0) + '%',
        sentiment_coverage: (logsWithPhase.filter(l => l.sentiment_score !== null).length / logs.length * 100).toFixed(0) + '%'
      },
      phase_statistics: {
        menstruation: {
          avg_sentiment: avgSentimentByPhase.menstruation?.toFixed(2) || 'N/A',
          common_symptoms: Object.entries(symptomsByPhase.menstruation)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([s]) => s)
        },
        luteal: {
          avg_sentiment: avgSentimentByPhase.luteal?.toFixed(2) || 'N/A',
          common_symptoms: Object.entries(symptomsByPhase.luteal)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([s]) => s)
        }
      }
    };

    console.log('Correlation discovery completed');

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in discover-correlations function:', error);
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
