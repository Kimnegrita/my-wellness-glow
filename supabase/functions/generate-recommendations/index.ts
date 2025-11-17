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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract token and user id from JWT (verify_jwt=true already validated token)
    const token = authHeader.replace('Bearer ', '');
    let userId = '';
    try {
      const base64 = token.split('.')[1];
      const json = new TextDecoder().decode(Uint8Array.from(atob(base64), c => c.charCodeAt(0)));
      const payload = JSON.parse(json);
      userId = payload.sub as string;
      if (!userId) throw new Error('Missing sub in token');
    } catch (e) {
      console.error('JWT parse error:', e);
      throw new Error('Unauthorized');
    }

    // Use service role for backend queries (safe here because JWT is verified)
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    console.log('Generating recommendations for user:', userId);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    // Get last 7 days of logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentLogs, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false })
      .limit(7);

    if (logsError) {
      console.error('Logs error:', logsError);
    }

    // Calculate cycle information
    let cycleDay = 'Desconocido';
    let currentPhase = 'Desconocida';
    
    if (profile?.last_period_date) {
      const lastPeriodDate = new Date(profile.last_period_date);
      const today = new Date();
      const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
      cycleDay = `${daysSinceLastPeriod + 1}`;
      
      const cycleLength = profile.avg_cycle_length || 28;
      
      if (daysSinceLastPeriod >= 0 && daysSinceLastPeriod <= 5) {
        currentPhase = 'Menstrual';
      } else if (daysSinceLastPeriod > 5 && daysSinceLastPeriod <= cycleLength / 2 - 3) {
        currentPhase = 'Folicular';
      } else if (daysSinceLastPeriod > cycleLength / 2 - 3 && daysSinceLastPeriod <= cycleLength / 2 + 3) {
        currentPhase = 'Ovulación';
      } else {
        currentPhase = 'Lútea';
      }
    }

    // Aggregate recent symptoms
    const recentSymptoms = recentLogs
      ?.flatMap(log => log.symptoms || [])
      .filter((symptom, index, self) => self.indexOf(symptom) === index) || [];

    // Get sentiment trends
    const sentimentData = recentLogs
      ?.filter(log => log.sentiment_label)
      .map(log => ({
        date: log.log_date,
        sentiment: log.sentiment_label,
        score: log.sentiment_score
      })) || [];

    // Build context for AI
    const context = `
Usuario en día ${cycleDay} del ciclo, fase ${currentPhase}.
Síntomas recientes (últimos 7 días): ${recentSymptoms.join(', ') || 'Ninguno'}
Tendencia emocional: ${sentimentData.length > 0 ? `${sentimentData[0].sentiment}` : 'Sin datos'}
Ciclo ${profile?.is_irregular ? 'irregular' : 'regular'} de aprox. ${profile?.avg_cycle_length || 28} días.
`;

    console.log('Context for AI:', context);

    // Call Lovable AI for personalized recommendations
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
            content: `Eres una experta en salud menstrual y bienestar femenino. Genera recomendaciones personalizadas basadas en la fase del ciclo y síntomas. Devuelve SOLO un JSON válido con esta estructura exacta:
{
  "exercise": ["<recomendación 1>", "<recomendación 2>"],
  "nutrition": ["<recomendación 1>", "<recomendación 2>"],
  "selfcare": ["<recomendación 1>", "<recomendación 2>"],
  "highlights": "<mensaje motivacional breve en español>"
}`
          },
          {
            role: 'user',
            content: `Genera recomendaciones personalizadas en español para:
${context}

Proporciona 2 recomendaciones específicas y accionables para cada categoría (ejercicio, nutrición, autocuidado) y un mensaje motivacional.`
          }
        ],
        temperature: 0.8,
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
      throw new Error('AI recommendations failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response from AI');
    }

    // Parse the AI response
    let recommendations;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      // Fallback recommendations
      recommendations = {
        exercise: [
          'Camina 20 minutos al aire libre para mejorar tu energía',
          'Practica yoga suave para reducir tensión'
        ],
        nutrition: [
          'Incluye alimentos ricos en hierro en tu dieta',
          'Mantente hidratada con agua e infusiones'
        ],
        selfcare: [
          'Dedica 10 minutos a la meditación o respiración profunda',
          'Asegúrate de dormir 7-8 horas por noche'
        ],
        highlights: 'Cuida de ti misma, escucha a tu cuerpo y date el descanso que necesitas.'
      };
    }

    // Add context information to the response
    const response = {
      ...recommendations,
      context: {
        cycleDay,
        currentPhase,
        recentSymptoms: recentSymptoms.slice(0, 5),
        sentimentTrend: sentimentData.length > 0 ? sentimentData[0].sentiment : null
      }
    };

    console.log('Recommendations generated successfully');

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
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