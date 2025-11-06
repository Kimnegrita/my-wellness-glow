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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { logId, journalEntry, symptoms } = await req.json();

    if (!journalEntry || journalEntry.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          sentiment_score: 0,
          sentiment_label: 'neutral',
          emotional_patterns: [],
          ai_insights: 'No journal entry to analyze'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log('Analyzing sentiment for user:', user.id, 'log:', logId);

    // Call Lovable AI for sentiment analysis
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
            content: `You are an empathetic AI assistant specialized in analyzing menstrual cycle journal entries. Analyze the emotional tone and provide supportive insights. Return ONLY a valid JSON object with this exact structure:
{
  "sentiment_score": <number between -1 and 1>,
  "sentiment_label": "<positive|neutral|negative>",
  "emotional_patterns": ["<pattern1>", "<pattern2>"],
  "ai_insights": "<brief supportive message in Spanish>"
}`
          },
          {
            role: 'user',
            content: `Analiza esta entrada de diario menstrual:
            
Entrada: "${journalEntry}"
Síntomas reportados: ${symptoms?.join(', ') || 'ninguno'}

Proporciona un análisis emocional y patrones detectados en español.`
          }
        ],
        temperature: 0.7,
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
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response from AI');
    }

    // Parse the AI response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      // Fallback analysis
      analysis = {
        sentiment_score: 0,
        sentiment_label: 'neutral',
        emotional_patterns: ['Unable to analyze'],
        ai_insights: 'Gracias por compartir tu experiencia. Sigue registrando tus sentimientos.'
      };
    }

    // Update the log with sentiment analysis
    if (logId) {
      const { error: updateError } = await supabase
        .from('daily_logs')
        .update({
          sentiment_score: analysis.sentiment_score,
          sentiment_label: analysis.sentiment_label,
          emotional_patterns: analysis.emotional_patterns,
          ai_insights: analysis.ai_insights,
        })
        .eq('id', logId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating log:', updateError);
        throw updateError;
      }
    }

    console.log('Sentiment analysis completed successfully');

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-sentiment function:', error);
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