import { Badge } from '@/components/ui/badge';

interface SymptomChipProps {
  symptom: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function SymptomChip({ symptom, isSelected, onToggle }: SymptomChipProps) {
  return (
    <Badge
      variant={isSelected ? 'default' : 'outline'}
      className="cursor-pointer hover:scale-105 transition-transform px-4 py-2 text-sm"
      onClick={onToggle}
    >
      {symptom}
    </Badge>
  );
}