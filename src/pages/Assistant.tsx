import { AIAssistant } from '@/components/AIAssistant';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Assistant() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gradient">
                {t('assistant.pageTitle') || 'Assistente de IA'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('assistant.pageDescription') || 'Converse com Luna, sua assistente pessoal de saúde menstrual. Tire dúvidas, peça conselhos personalizados baseados na sua fase do ciclo, e aprenda mais sobre seu corpo.'}
          </p>
        </div>

        <AIAssistant />

        {/* Sugestões de perguntas */}
        <div className="mt-8 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {t('assistant.suggestionsTitle') || 'Experimente perguntar:'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              t('assistant.suggestion1') || '¿Qué ejercicios son mejores en mi fase actual?',
              t('assistant.suggestion2') || '¿Por qué tengo más energía durante la ovulación?',
              t('assistant.suggestion3') || '¿Cómo puedo aliviar las cólicas naturalmente?',
              t('assistant.suggestion4') || '¿Qué alimentos son buenos para la fase lútea?',
            ].map((suggestion, i) => (
              <div 
                key={i}
                className="px-4 py-3 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent/50 transition-colors cursor-default"
              >
                💡 {suggestion}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
