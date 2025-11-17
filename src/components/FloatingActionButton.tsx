import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      className="fixed bottom-6 right-6 rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all bg-gradient-primary hover:opacity-90 z-50"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}