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
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client with the user's token
    const supabaseClient = createClient(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('Predicting next cycle for user:', user.id);

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    // Get all period start dates from the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: periodLogs, error: logsError } = await supabaseClient
      .from('daily_logs')
      .select('log_date, symptoms')
      .eq('user_id', user.id)
      .eq('period_started', true)
      .gte('log_date', twelveMonthsAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (logsError) {
      console.error('Error fetching period logs:', logsError);
    }

    // Calculate cycle lengths
    const cycleLengths: number[] = [];
    if (periodLogs && periodLogs.length > 1) {
      for (let i = 0; i < periodLogs.length - 1; i++) {
        const date1 = new Date(periodLogs[i].log_date);
        const date2 = new Date(periodLogs[i + 1].log_date);
        const diffDays = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only include realistic cycle lengths
        if (diffDays >= 21 && diffDays <= 40) {
          cycleLengths.push(diffDays);
        }
      }
    }

    // Get recent symptoms that might affect cycle
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentLogs, error: recentError } = await supabaseClient
      .from('daily_logs')
      .select('symptoms, sentiment_score, log_date')
      .eq('user_id', user.id)
      .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (recentError) {
      console.error('Error fetching recent logs:', recentError);
    }

    // Aggregate stress indicators
    const stressSymptoms = recentLogs
      ?.flatMap(log => log.symptoms || [])
      .filter(s => ['Estrés', 'Ansiedad', 'Insomnio', 'Irritabilidad'].includes(s)) || [];

    const avgSentiment = recentLogs && recentLogs.length > 0
      ? recentLogs
          .filter(log => log.sentiment_score !== null)
          .reduce((acc, log) => acc + (log.sentiment_score || 0), 0) / recentLogs.filter(log => log.sentiment_score !== null).length
      : 0;

    // Build context for AI prediction
    const context = `
Datos del usuario:
- Último período: ${profile.last_period_date || 'No registrado'}
- Duración promedio del ciclo: ${profile.avg_cycle_length || 28} días
- Ciclo irregular: ${profile.is_irregular ? 'Sí' : 'No'}
- Últimos ${cycleLengths.length} ciclos registrados: ${cycleLengths.join(', ')} días
- Variabilidad (desviación estándar): ${cycleLengths.length > 1 ? calculateStdDev(cycleLengths).toFixed(1) : 'N/A'} días
- Síntomas de estrés (últimos 30 días): ${stressSymptoms.length} ocurrencias
- Sentimiento emocional promedio: ${avgSentiment.toFixed(2)} (rango -1 a 1)
`;

    console.log('Prediction context:', context);

    // Call Lovable AI for intelligent prediction
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
            content: `Eres una experta en análisis de ciclos menstruales. Analiza los datos históricos y factores actuales para predecir el próximo período. Devuelve SOLO un JSON válido con esta estructura:
{
  "predicted_date": "YYYY-MM-DD",
  "confidence_level": "<high|medium|low>",
  "confidence_percentage": <número entre 0-100>,
  "prediction_window": {
    "earliest": "YYYY-MM-DD",
    "latest": "YYYY-MM-DD"
  },
  "factors_considered": ["<factor1>", "<factor2>"],
  "recommendation": "<breve mensaje en español con consejos>",
  "irregularity_indicators": ["<indicador1>", "<indicador2>"]
}`
          },
          {
            role: 'user',
            content: `Predice la fecha del próximo período basándote en:
${context}

Considera:
1. Patrones históricos de ciclos
2. Variabilidad reciente
3. Factores de estrés
4. Estado emocional
5. Si el ciclo es irregular

Proporciona una predicción precisa con rango de confianza.`
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent predictions
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service requires payment. Please contact support.');
      }
      throw new Error('AI prediction failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response from AI');
    }

    // Parse the AI response
    let prediction;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      
      // Fallback to simple calculation
      const avgLength = cycleLengths.length > 0 
        ? cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length 
        : profile.avg_cycle_length || 28;
      
      const lastPeriod = new Date(profile.last_period_date || new Date());
      const predictedDate = new Date(lastPeriod);
      predictedDate.setDate(predictedDate.getDate() + Math.round(avgLength));
      
      const earliestDate = new Date(predictedDate);
      earliestDate.setDate(earliestDate.getDate() - 3);
      
      const latestDate = new Date(predictedDate);
      latestDate.setDate(latestDate.getDate() + 3);
      
      prediction = {
        predicted_date: predictedDate.toISOString().split('T')[0],
        confidence_level: cycleLengths.length < 3 ? 'low' : 'medium',
        confidence_percentage: cycleLengths.length < 3 ? 60 : 75,
        prediction_window: {
          earliest: earliestDate.toISOString().split('T')[0],
          latest: latestDate.toISOString().split('T')[0]
        },
        factors_considered: ['Promedio de ciclos históricos'],
        recommendation: 'Registra más ciclos para mejorar la precisión de las predicciones.',
        irregularity_indicators: []
      };
    }

    // Add statistical insights
    const response = {
      ...prediction,
      statistics: {
        total_cycles_analyzed: cycleLengths.length,
        average_cycle_length: cycleLengths.length > 0 
          ? (cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length).toFixed(1)
          : profile.avg_cycle_length || 28,
        cycle_variability: cycleLengths.length > 1 
          ? calculateStdDev(cycleLengths).toFixed(1)
          : 'N/A',
        shortest_cycle: cycleLengths.length > 0 ? Math.min(...cycleLengths) : 'N/A',
        longest_cycle: cycleLengths.length > 0 ? Math.max(...cycleLengths) : 'N/A',
        stress_level: stressSymptoms.length > 5 ? 'high' : stressSymptoms.length > 2 ? 'medium' : 'low'
      }
    };

    console.log('Cycle prediction completed successfully');

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in predict-next-cycle function:', error);
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

// Helper function to calculate standard deviation
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}
