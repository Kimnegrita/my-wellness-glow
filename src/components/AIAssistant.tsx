import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, User, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  conversationId?: string;
}

// Função de streaming token-by-token
async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
  accessToken,
}: {
  messages: Message[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  accessToken: string;
}) {
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
  
  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        onError('Muitas requisições. Aguarde alguns instantes.');
        return;
      }
      if (resp.status === 402) {
        onError('Limite de uso atingido.');
        return;
      }
      const errorData = await resp.json().catch(() => ({ error: 'Erro desconhecido' }));
      onError(errorData.error || 'Erro ao processar mensagem');
      return;
    }

    if (!resp.body) {
      throw new Error('No response body');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      // Processar linha por linha
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            onDelta(content);
          }
        } catch {
          // JSON incompleto, colocar de volta no buffer
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Processar restos do buffer
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw || raw.startsWith(':') || !raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignorar */ }
      }
    }

    onDone();
  } catch (error) {
    console.error('Stream error:', error);
    onError('Erro de conexão. Tente novamente.');
  }
}

export function AIAssistant({ conversationId }: AIAssistantProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('assistant.greeting') || '¡Hola! 👋 Soy Luna, tu asistente de salud menstrual. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Verificar sesión y obtener token
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          toast.error('Error de autenticación');
          setIsAuthenticating(false);
          return;
        }

        if (!session) {
          toast.error('Debes iniciar sesión para usar el asistente');
          setIsAuthenticating(false);
          return;
        }

        setAccessToken(session.access_token);
        setIsAuthenticating(false);
      } catch (error) {
        console.error('Error in getSession:', error);
        toast.error('Error de autenticación');
        setIsAuthenticating(false);
      }
    };

    getSession();
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !accessToken) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
        onError: (error) => {
          toast.error(error);
          setIsLoading(false);
        },
        accessToken,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Mostrar loading mientras se autentica
  if (isAuthenticating) {
    return (
      <Card className="flex flex-col h-[600px] max-w-4xl mx-auto shadow-xl items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Verificando autenticación...</p>
      </Card>
    );
  }

  // Mostrar mensaje si no está autenticado
  if (!accessToken) {
    return (
      <Card className="flex flex-col h-[600px] max-w-4xl mx-auto shadow-xl items-center justify-center">
        <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Autenticación Requerida</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Debes iniciar sesión para usar el asistente de IA.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px] max-w-4xl mx-auto shadow-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Luna - {t('assistant.title') || 'Assistente de IA'}</h3>
            <p className="text-sm text-muted-foreground">
              {t('assistant.subtitle') || 'Sua companheira de saúde menstrual'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-auto' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <p className="text-sm text-muted-foreground">Luna está pensando...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="px-6 py-4 border-t bg-muted/30">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('assistant.inputPlaceholder') || 'Escreva sua pergunta...'}
            className="resize-none min-h-[60px] max-h-[120px]"
            rows={2}
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            size="lg"
            className="h-[60px]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {t('assistant.disclaimer') || 'Esta IA oferece informação geral e não substitui consulta médica.'}
        </p>
      </div>
    </Card>
  );
}
