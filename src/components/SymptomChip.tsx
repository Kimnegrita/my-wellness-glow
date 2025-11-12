import { Badge } from '@/components/ui/badge';

interface SymptomChipProps {
  symptom: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function SymptomChip({ symptom, isSelected, onToggle }: SymptomChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md
        transition-all duration-200 cursor-pointer select-none
        ${isSelected 
          ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 scale-105' 
          : 'bg-background text-foreground border-2 border-input hover:bg-accent hover:text-accent-foreground hover:border-primary/50'
        }
        active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
      `}
    >
      {symptom}
    </button>
  );
}