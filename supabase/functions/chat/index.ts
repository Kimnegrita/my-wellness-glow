import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // Read Authorization header (JWT is already validated by verify_jwt)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract userId from JWT payload
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

    // Create admin client for backend reads (safe because JWT is verified by platform)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Chat request from user:', userId);

    // Buscar perfil da usuária para contexto
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Buscar logs recentes (últimos 7 dias) para contexto
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentLogs, error: logsError } = await supabaseClient
      .from('daily_logs')
      .select('symptoms, journal_entry, log_date, period_started')
      .eq('user_id', userId)
      .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false })
      .limit(7);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
    }

    // Calcular informações do ciclo
    let cycleContext = 'Informação do ciclo não disponível';
    if (profile?.last_period_date && profile?.avg_cycle_length) {
      const lastPeriod = new Date(profile.last_period_date);
      const today = new Date();
      const daysSince = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
      const cycleDay = (daysSince % profile.avg_cycle_length) + 1;
      
      let phase = 'irregular';
      if (!profile.is_irregular) {
        if (cycleDay >= 1 && cycleDay <= 5) phase = 'menstruação';
        else if (cycleDay >= 6 && cycleDay <= 13) phase = 'folicular';
        else if (cycleDay >= 14 && cycleDay <= 16) phase = 'ovulação';
        else if (cycleDay >= 17) phase = 'lútea';
      }
      
      cycleContext = `Dia ${cycleDay} do ciclo, fase ${phase}`;
    }

    // Agregar sintomas recentes
    const recentSymptoms = recentLogs?.flatMap(log => log.symptoms || []) || [];
    const uniqueSymptoms = [...new Set(recentSymptoms)];
    const symptomsContext = uniqueSymptoms.length > 0 
      ? `Sintomas recentes (7 dias): ${uniqueSymptoms.join(', ')}` 
      : 'Nenhum sintoma registrado recentemente';

    // Definir idioma
    const language = profile?.language || 'es';
    const languageMap: { [key: string]: string } = {
      'es': 'espanhol',
      'en': 'inglês',
      'pt': 'português europeu (de Portugal)'
    };

    // System prompt especializado
    const systemPrompt = `Você é Luna, a assistente de saúde menstrual da My Wellness Glow. 🌙✨

CONTEXTO DA USUÁRIA:
- ${cycleContext}
- ${symptomsContext}
- Nome: ${profile?.name || 'Usuária'}
- Idioma preferido: ${languageMap[language]}

DIRETRIZES ESSENCIAIS:
1. **Tom**: Seja calorosa, empática e encorajadora. Use emojis ocasionalmente 💜
2. **Linguagem**: Simples e acessível, evite jargões médicos. Explique termos técnicos quando necessário
3. **Personalização**: Sempre considere a fase do ciclo e sintomas ao responder
4. **Responsabilidade**: Para sintomas graves/incomuns, SEMPRE recomende consultar profissional de saúde
5. **Privacidade**: Nunca peça informações sensíveis adicionais não relacionadas ao ciclo
6. **Idioma**: SEMPRE responda em ${languageMap[language]}

ESPECIALIDADES:
✨ Explicar as 4 fases do ciclo menstrual (menstruação, folicular, ovulação, lútea)
💊 Sugerir manejo natural de sintomas (cólicas, TPM, fadiga, mudanças de humor)
🥗 Recomendar nutrição adequada para cada fase do ciclo
🏃‍♀️ Sugerir exercícios apropriados baseados na fase
💆‍♀️ Oferecer dicas de autocuidado e bem-estar emocional
📚 Educação sobre saúde reprodutiva e ciclo menstrual

IMPORTANTE: Seja breve e direta nas respostas (máximo 3-4 parágrafos), a menos que a usuária peça explicação detalhada.`;

    console.log('System prompt context:', { cycleContext, symptomsContext, language });

    // Chamar Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Muitas requisições. Por favor, aguarde alguns instantes.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Limite de uso atingido. Entre em contato com suporte.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Erro ao processar sua mensagem');
    }

    // Retornar stream diretamente
    console.log('Streaming response to client');
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
